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
  const [viewMode, setViewMode] = useState("panel");
  const [selectedRowKey, setSelectedRowKey] = useState(null);
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

  useEffect(() => {
    if (!rows.length) {
      setSelectedRowKey(null);
      return;
    }
    if (!rows.some((r, i) => `${r.id ?? r.item_id ?? "row"}-${i}` === selectedRowKey)) {
      setSelectedRowKey(`${rows[0].id ?? rows[0].item_id ?? "row"}-0`);
    }
  }, [rows, selectedRowKey]);


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
        .stock-items-toggle {
          display: inline-flex;
          border: 1px solid #d4e3ed;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
        }
        .stock-items-toggle button {
          border: none;
          background: transparent;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 600;
          color: #4A7FA8;
          cursor: pointer;
        }
        .stock-items-toggle button.active {
          background: #e8f1f8;
          color: #1E4A6B;
        }
        .stock-items-mode-group {
          border: 1px solid #d4e3ed;
          border-radius: 8px;
          padding: 6px 10px;
          margin-left: 14px;
          display: inline-flex;
          align-items: center;
          gap: 14px;
          background: #fff;
        }
        .stock-items-action-btn {
          border: 1px solid #d4e3ed;
          border-radius: 8px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .stock-items-action-btn.primary { background: #2684ff; border-color: #2684ff; color: #fff; }
        .stock-items-action-btn.success { background: #2E7D4A; border-color: #2E7D4A; color: #fff; }
        .stock-items-action-btn.danger { background: #A83232; border-color: #A83232; color: #fff; }
        .stock-items-action-btn:hover { filter: brightness(0.95); }
        .stock-items-panel {
          display: grid;
          grid-template-columns: 360px minmax(0, 1fr);
          gap: 12px;
        }
        .stock-items-list {
          border: 1px solid #e5eef5;
          border-radius: 8px;
          background: #fff;
          max-height: 560px;
          overflow-y: auto;
          padding: 8px;
        }
        .stock-items-list-row {
          width: 100%;
          text-align: left;
          border: 1px solid #e4edf4;
          border-radius: 8px;
          background: #fff;
          margin-bottom: 8px;
          padding: 10px;
          cursor: pointer;
        }
        .stock-items-list-row.active {
          background: #eef5fb;
          border-color: #4A7FA8;
          box-shadow: inset 2px 0 0 #4A7FA8;
        }
        .stock-items-detail {
          border: 1px solid #e5eef5;
          border-radius: 8px;
          background: #fff;
          padding: 14px;
        }
        .stock-items-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(120px, 1fr));
          gap: 12px;
          margin-top: 10px;
        }
        .stock-items-detail-grid .label {
          font-size: 11px;
          font-weight: 700;
          color: #7a8ea0;
          text-transform: uppercase;
          margin-bottom: 3px;
        }
        .stock-items-detail-grid .value {
          font-size: 13px;
          color: #1E4A6B;
          font-weight: 600;
        }
        .stock-items-specs {
          margin-top: 12px;
          border-top: 1px solid #e8eff5;
          padding-top: 10px;
        }
        @media (max-width: 1024px) {
          .stock-items-panel {
            grid-template-columns: 1fr;
          }
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

          <div className="card-body d-flex flex-wrap align-items-center justify-content-between">
            <div className="d-flex align-items-center mb-2 mb-md-0">
              <h5 className="mb-0 mr-3" style={{ color: "#1E4A6B", fontWeight: 700 }}>Stock Items</h5>
              <div className="stock-items-toggle">
                <button
                  type="button"
                  className={viewMode === "panel" ? "active" : ""}
                  onClick={() => setViewMode("panel")}
                >
                  Panel View
                </button>
                <button
                  type="button"
                  className={viewMode === "table" ? "active" : ""}
                  onClick={() => setViewMode("table")}
                >
                  Table View
                </button>
              </div>
              {/* Plain radio buttons (back to original style) */}
              <div className="stock-items-mode-group">
                <label className="mb-0">
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

                <label className="mb-0">
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
            </div>

              {/* Action buttons grouped */}
            <div className="d-flex mb-2 mb-md-0" style={{ gap: "8px" }}>
              <button className="stock-items-action-btn primary" onClick={fetchData}>
                View Report
              </button>
              <button className="stock-items-action-btn success" onClick={exportExcel}>
                Export Excel
              </button>
              <button className="stock-items-action-btn danger" onClick={exportPDF}>
                Export PDF
              </button>
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

        {/* Panel View */}
        {!loading && rows.length > 0 && viewMode === "panel" && (
          <div className="stock-items-panel stock-table-animate">
            <div className="stock-items-list">
              {rows.map((row, index) => {
                const rowKey = `${row.id ?? row.item_id ?? "row"}-${index}`;
                return (
                  <button
                    key={rowKey}
                    type="button"
                    className={`stock-items-list-row ${selectedRowKey === rowKey ? "active" : ""}`}
                    onClick={() => setSelectedRowKey(rowKey)}
                  >
                    <div style={{ fontWeight: 700, color: "#1E4A6B", fontSize: 13 }}>{row.item_name || "-"}</div>
                    <div style={{ fontSize: 11, color: "#7a8ea0", marginTop: 3 }}>{row.gender || "-"}</div>
                    <div style={{ fontSize: 11, color: "#4A7FA8", marginTop: 6, fontWeight: 700 }}>
                      Qty: {row.quantity ?? 0}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="stock-items-detail">
              {(() => {
                const selectedIndex = rows.findIndex((r, i) => `${r.id ?? r.item_id ?? "row"}-${i}` === selectedRowKey);
                const activeRow = selectedIndex >= 0 ? rows[selectedIndex] : rows[0];
                if (!activeRow) return null;
                return (
                  <>
                    <h4 style={{ margin: 0, color: "#1E4A6B", fontWeight: 700 }}>{activeRow.item_name || "-"}</h4>
                    <div className="stock-items-detail-grid">
                      <div>
                        <div className="label">Gender</div>
                        <div className="value">{activeRow.gender || "-"}</div>
                      </div>
                      <div>
                        <div className="label">Quantity</div>
                        <div className="value">{activeRow.quantity ?? 0}</div>
                      </div>
                      <div>
                        <div className="label">Created Date</div>
                        <div className="value">{formatDate(activeRow.created_on)}</div>
                      </div>
                      <div>
                        <div className="label">Created Time</div>
                        <div className="value">{formatTime12(activeRow.created_on)}</div>
                      </div>
                      {mode === "both" && (
                        <>
                          <div>
                            <div className="label">Requisition</div>
                            <div className="value">{activeRow.isRequisition ? "Yes" : "No"}</div>
                          </div>
                          <div>
                            <div className="label">Handover</div>
                            <div className="value">{activeRow.isHandover ? "Yes" : "No"}</div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="stock-items-specs">
                      <div className="label">Specifications</div>
                      {(!Array.isArray(activeRow.specifications) || activeRow.specifications.length === 0) && (
                        <div className="text-muted">No Specifications</div>
                      )}
                      {Array.isArray(activeRow.specifications) && activeRow.specifications.map((s, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#1E4A6B", marginBottom: 4 }}>
                          <span>{s.specification_name}: {s.specification_value}</span>
                          {String(s.specification_name).toLowerCase().includes("color") &&
                            renderColorBlock(s.specification_value)}
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Data Table */}
        {!loading && rows.length > 0 && viewMode === "table" && (
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