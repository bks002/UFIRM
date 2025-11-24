import React, { useState, useEffect, useRef } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";

// Excel & PDF libs
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const apiBase = "https://api.urest.in:8096/api/requisition";

export default function StockItems() {
  // Property ID from Redux (same pattern as Formula, plus fallbacks)
  const propertyId = useSelector((state) =>
    state?.Commonreducer?.puidn ||
    state?.department?.CompanyId ||
    state?.departmentModel?.CompanyId ||
    state?.Commonreducer?.CompanyId ||
    null
  );

  const [mode, setMode] = useState(null); // "requisition" | "handover" | "both"
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [sortedField, setSortedField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const toastRef = useRef(null);

  // Scroll page to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Clear rows when property changes to avoid stale data
  useEffect(() => {
    setRows([]);
  }, [propertyId]);
  useEffect(() => {
  setRows([]);
}, [mode]);


  // Helpers: created_on parsing/formatting
  const safeDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDate = (value) => {
    const d = safeDate(value);
    if (!d) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime12 = (value) => {
    const d = safeDate(value);
    if (!d) return "";
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  };

  // Toast shorthands
  const showToast = (opts) => {
    if (toastRef.current) {
      toastRef.current.show(opts);
    }
  };

  // NOTE: property check FIRST, then mode
  const validateBeforeFetch = () => {
    if (
      !propertyId ||
      propertyId === "" ||
      propertyId === null ||
      propertyId === "Select"
    ) {
      showToast({
        severity: "error",
        summary: "Property Missing",
        detail: "Property ID not loaded yet. Select a property first.",
      });
      return false;
    }

    if (!mode) {
      showToast({
        severity: "warn",
        summary: "Select Mode",
        detail: "Please choose Requisition / Handover / Both.",
      });
      return false;
    }

    return true;
  };

  const fetchSingle = async (url, flags) => {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || "API failed");
    }

    const data = await res.json();
    const arr = Array.isArray(data) ? data : [];
    return arr.map((row) => ({
      ...row,
      isRequisition: !!flags.isRequisition,
      isHandover: !!flags.isHandover,
    }));
  };

  const fetchData = async () => {
    if (!validateBeforeFetch()) return;

    setLoading(true);
    setRows([]);

    try {
      let result = [];

      if (mode === "requisition") {
        const url = `${apiBase}/${propertyId}?isRequisition=1`;
        result = await fetchSingle(url, {
          isRequisition: true,
          isHandover: false,
        });
      } else if (mode === "handover") {
        const url = `${apiBase}/${propertyId}?isHandover=1`;
        result = await fetchSingle(url, {
          isRequisition: false,
          isHandover: true,
        });
      } else if (mode === "both") {
        // Both: call both APIs and merge with flags
        const urlReq = `${apiBase}/${propertyId}?isRequisition=1`;
        const urlHand = `${apiBase}/${propertyId}?isHandover=1`;

        const [reqRows, handRows] = await Promise.all([
          fetchSingle(urlReq, { isRequisition: true, isHandover: false }),
          fetchSingle(urlHand, { isRequisition: false, isHandover: true }),
        ]);

        result = [...reqRows, ...handRows];
      }

      setRows(result);
      if (!result.length) {
        showToast({
          severity: "info",
          summary: "No Data",
          detail: "No stock items found for the selected mode.",
        });
      }
    } catch (err) {
      showToast({
        severity: "error",
        summary: "Error",
        detail: err.message || "Failed to fetch data.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sorting
  const sortData = (field) => {
    const asc = sortedField === field ? !sortAsc : true;
    setSortedField(field);
    setSortAsc(asc);

    const sorted = [...rows].sort((a, b) => {
      let va;
      let vb;

      if (field === "created_on") {
        const da = safeDate(a.created_on)?.getTime() || 0;
        const db = safeDate(b.created_on)?.getTime() || 0;
        va = da;
        vb = db;
      } else {
        va = (a[field] ?? "").toString().toLowerCase();
        vb = (b[field] ?? "").toString().toLowerCase();
      }

      if (va < vb) return asc ? -1 : 1;
      if (va > vb) return asc ? 1 : -1;
      return 0;
    });

    setRows(sorted);
  };

  const renderSortIcon = (field) => {
    if (sortedField !== field) {
      return <i className="fa fa-sort text-muted ml-1" />;
    }
    return sortAsc ? (
      <i className="fa fa-sort-up text-primary ml-1" />
    ) : (
      <i className="fa fa-sort-down text-primary ml-1" />
    );
  };


  const getFileSuffix = () => {
    if (mode === "requisition") return "Requisition";
    if (mode === "handover") return "Handover";
    return "Both";
  };

  // Excel export (real .xlsx via SheetJS)
  const exportExcel = () => {
    if (!rows.length) {
      showToast({
        severity: "warn",
        summary: "No Data",
        detail: "Nothing to export.",
      });
      return;
    }

    const suffix = getFileSuffix();

    const commonHeader = [
      "S. No",
      "Item Name",
      "Gender",
      "Quantity",
      "Specifications",
      "Created Date",
      "Created Time",
    ];

    // For BOTH: explicit Requisition/Handover columns with text
    // For single mode: one Status column
    const header =
      mode === "both"
        ? [...commonHeader, "Requisition", "Handover"]
        : [...commonHeader, "Status"];

    const data = rows.map((row, index) => {
      const specs =
        Array.isArray(row.specifications) && row.specifications.length
          ? row.specifications
              .map(
                (s) =>
                  `${s.specification_name ?? ""}: ${
                    s.specification_value ?? ""
                  }`
              )
              .join("; ")
          : "";

      const base = [
        index + 1,
        row.item_name ?? "",
        row.gender ?? "",
        row.quantity ?? "",
        specs,
        formatDate(row.created_on),
        formatTime12(row.created_on),
      ];

      if (mode === "both") {
        return [
          ...base,
          row.isRequisition ? "Requisition" : "-",
          row.isHandover ? "Handover" : "-",
        ];
      }

      const status =
        mode === "requisition"
          ? "Requisition"
          : mode === "handover"
          ? "Handover"
          : "";
      return [...base, status];
    });

    const worksheetData = [header, ...data];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Auto column width based on header/content
    const colWidths = header.map((h, colIdx) => {
      const maxLen = Math.max(
        h.length,
        ...data.map((row) => (row[colIdx] ? row[colIdx].toString().length : 0))
      );
      return { wch: Math.min(Math.max(maxLen + 4, 12), 40) }; // clamp width
    });
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StockItems");
    XLSX.writeFile(wb, `StockItems${suffix}.xlsx`);
  };

  // PDF export (landscape) via jsPDF + autoTable
  const exportPDF = () => {
    if (!rows.length) {
      showToast({
        severity: "warn",
        summary: "No Data",
        detail: "Nothing to export.",
      });
      return;
    }

    const suffix = getFileSuffix();

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    const title = "Stock Items Report";
    doc.setFontSize(14);
    doc.text(title, 40, 40);

    doc.setFontSize(10);
    const exportedOn = `Exported: ${new Date().toLocaleString()}`;
    doc.text(exportedOn, 40, 60);

    const commonHead = [
      "S. No",
      "Item Name",
      "Gender",
      "Quantity",
      "Specifications",
      "Created Date",
      "Created Time",
    ];

    const head =
      mode === "both"
        ? [[...commonHead, "Requisition", "Handover"]]
        : [[...commonHead, "Status"]];

    const body = rows.map((row, index) => {
      const specs =
        Array.isArray(row.specifications) && row.specifications.length
          ? row.specifications
              .map(
                (s) =>
                  `${s.specification_name ?? ""}: ${
                    s.specification_value ?? ""
                  }`
              )
              .join("; ")
          : "";

      const base = [
        index + 1,
        row.item_name ?? "",
        row.gender ?? "",
        row.quantity ?? "",
        specs,
        formatDate(row.created_on),
        formatTime12(row.created_on),
      ];

      if (mode === "both") {
        return [
          ...base,
          row.isRequisition ? "Requisition" : "-",
          row.isHandover ? "Handover" : "-",
        ];
      }

      const status =
        mode === "requisition"
          ? "Requisition"
          : mode === "handover"
          ? "Handover"
          : "";
      return [...base, status];
    });

    autoTable(doc, {
      head,
      body,
      startY: 80,
      styles: {
        fontSize: 8,
        cellPadding: 4,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 70, right: 20, bottom: 30, left: 20 },
      tableWidth: "auto",
      pageBreak: "auto",
    });

    doc.save(`StockItems${suffix}.pdf`);
  };

  const renderColorBlock = (val) => {
    if (!val) return null;
    const clean = String(val).replace(/['"]/g, "");
    const style = {
      display: "inline-block",
      width: "14px",
      height: "14px",
      background: clean,
      border: "1px solid #aaa",
      marginLeft: "6px",
      verticalAlign: "middle",
    };
    return <span style={style} />;
  };

  const renderCheck = (flag) =>
    flag ? (
      <span className="text-success">
        <i className="fa fa-check" aria-hidden="true" />
      </span>
    ) : (
      <span className="text-danger">
        <i className="fa fa-times" aria-hidden="true" />
      </span>
    );

  return (
    <>
      {/* Local styles for table load animation */}
      <style>{`
        .stock-table-animate {
          animation: fadeInStock 0.35s ease-in-out;
        }
        @keyframes fadeInStock {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="container-fluid py-3">
        <Toast ref={toastRef} />

        {/* Control Card */}
<div
  className="card shadow-sm mb-3"
  style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
>

          <div className="card-body d-flex flex-wrap align-items-center">

            <div className="d-flex flex-wrap align-items-center ml-auto">
              {/* Plain radio buttons (back to original style) */}
              <div className="m-4 d-flex gap: 15px">
                <label className="mr-3 mb-0">
                  <input
                    type="radio"
                    name="stockMode"
                    value="requisition"
                    className="mr-1"
                    checked={mode === "requisition"}
                    onChange={() => setMode("requisition")}
                    style={{ cursor: "pointer" }}
                  />
                  Requisition
                </label>

                <label className="mr-3 mb-0">
                  <input
                    type="radio"
                    name="stockMode"
                    value="handover"
                    className="mr-1"
                    checked={mode === "handover"}
                    onChange={() => setMode("handover")}
                      style={{ cursor: "pointer" }}
                  />
                  Handover
                </label>

                <label className="mb-0">
                  <input
                    type="radio"
                    name="stockMode"
                    value="both"
                    className="mr-1"
                    checked={mode === "both"}
                    onChange={() => setMode("both")}
                      style={{ cursor: "pointer" }}
                  />
                  Both
                </label>
              </div>

              {/* Action buttons grouped */}
<div className="d-flex" style={{ gap: "10px" }}>
  <button className="btn btn-sm btn-primary" onClick={fetchData}>
    View Report
  </button>
  <button className="btn btn-sm btn-success" onClick={exportExcel}>
    Export Excel
  </button>
  <button className="btn btn-sm btn-danger" onClick={exportPDF}>
    Export PDF
  </button>
</div>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center mt-5">
            <ProgressSpinner />
          </div>
        )}

        {/* Empty State */}
        {!loading && rows.length === 0 && (
          <div className="card shadow-sm">
            <div className="card-body text-center py-5">
              <i className="fa fa-box-open fa-3x text-muted mb-3" />
              <h5 className="mb-2">No data loaded yet</h5>
              <p className="text-muted mb-0">
                Choose <strong>Requisition</strong>, <strong>Handover</strong>, or{" "}
                <strong>Both</strong> above, then click{" "}
                <strong>View Report</strong> to load stock items.
              </p>
            </div>
          </div>
        )}

        {/* Data Table */}
        {!loading && rows.length > 0 && (
          <div className="card shadow-sm stock-table-animate">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-bordered table-striped table-hover mb-0">
                  <thead className="thead-light">
                    <tr>
                      <th style={{ width: "60px" }}>S. No</th>

                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() => sortData("item_name")}
                      >
                        Item Name
                        {renderSortIcon("item_name")}
                      </th>

                      <th
                        style={{ cursor: "pointer", width: "120px" }}
                        onClick={() => sortData("gender")}
                      >
                        Gender
                        {renderSortIcon("gender")}
                      </th>

                      <th
                        style={{ cursor: "pointer", width: "110px" }}
                        onClick={() => sortData("quantity")}
                      >
                        Quantity
                        {renderSortIcon("quantity")}
                      </th>

                      <th style={{ minWidth: "220px" }}>Specifications</th>

                      <th
                        style={{ cursor: "pointer", width: "130px" }}
                        onClick={() => sortData("created_on")}
                      >
                        Created Date
                        {renderSortIcon("created_on")}
                      </th>

                      <th style={{ width: "130px" }}>Created Time</th>

                      {/* Check columns ONLY when mode === "both" */}
                      {mode === "both" && (
                        <>
                          <th style={{ width: "110px" }}>Requisition</th>
                          <th style={{ width: "110px" }}>Handover</th>
                        </>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={`${row.id ?? row.item_id ?? "row"}-${index}`}>
                        <td>{index + 1}</td>

                        <td>{row.item_name}</td>
                        <td>{row.gender}</td>
                        <td>{row.quantity}</td>

                        <td>
                          {(!Array.isArray(row.specifications) ||
                            row.specifications.length === 0) && (
                            <span className="text-muted">No Specifications</span>
                          )}

                          {Array.isArray(row.specifications) &&
                            row.specifications.map((s, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <span>
                                  {s.specification_name}:{" "}
                                  {s.specification_value}
                                </span>
                                {String(s.specification_name)
                                  .toLowerCase()
                                  .includes("color") &&
                                  renderColorBlock(s.specification_value)}
                              </div>
                            ))}
                        </td>

                        <td>{formatDate(row.created_on)}</td>
                        <td>{formatTime12(row.created_on)}</td>

                        {/* Check icons only when both selected */}
                        {mode === "both" && (
                          <>
                            <td className="text-center">
                              {renderCheck(row.isRequisition)}
                            </td>
                            <td className="text-center">
                              {renderCheck(row.isHandover)}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}