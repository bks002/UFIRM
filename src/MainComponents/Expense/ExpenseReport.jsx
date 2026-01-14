import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { getAllExpenses } from "../../Services/ExpenseReportService";
import { useSelector } from "react-redux";

export default function ExpenseReport() {
  const propertyId = useSelector((state) => state.Commonreducer.puidn);
  const [reports, setReports] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const dt = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchExpenses = async (from, to, officeId) => {
    try {
      const data = await getAllExpenses({
        dateFrom: from,
        dateTo: to,
        officeId,
      });
      setReports(data);
    } catch (err) {
      console.error("Error while fetching expenses:", err);
    }
  };

  const applyFilter = () => {
    if (!fromDate || !toDate) {
      alert("Please select both From Date and To Date");
      return;
    }

    fetchExpenses(formatDate(fromDate), formatDate(toDate), propertyId);
  };

  const exportCSV = () => {
    if (!reports || reports.length === 0) {
      alert("No data available to export!");
      return;
    }

    // 🔹 Calculate Gross Total
    const grossTotal = reports.reduce(
      (sum, r) => sum + Number(r.TotalAmount || 0),
      0
    );

    const header = [
      "Expense Type",
      "Expense Sub Type",
      "Total Amount",
      "Date From",
      "Date To",
    ];

    const rows = reports.map((r) => [
      `"${r.ExpenseType}"`,
      `"${r.ExpenseSubType}"`,
      `="${r.TotalAmount}"`, // force number → no 4E+08
      `="${formatDate(r.DateFrom)}"`, // force text → no ####
      `="${formatDate(r.DateTo)}"`, // force text → no ####
    ]);

    // 🔹 Add Gross Total row
    rows.push([`"GROSS TOTAL"`, `""`, `="${grossTotal}"`, `""`, `""`]);

    const csvContent = [
      header.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\r\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const from = formatDate(fromDate);
    const to = formatDate(toDate);

    const fileName = `ExpenseReport_${from}_to_${to}.csv`;

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const filteredReports = reports.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.ExpenseType?.toLowerCase().includes(search) ||
      item.ExpenseSubType?.toLowerCase().includes(search)
    );
  });
  const formatDisplayDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("en-GB"); // dd/mm/yyyy
  };

  return (
    <div className="content-wrapper pt-3">
      <section className="content">
        {/* 🔹 Header + Filter + Export Button */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="m-0">Expense Report</h5>

          <div className="d-flex align-items-center gap-2">
            <span className="p-input-icon-left">
              <i
                className="pi pi-search"
                style={{
                  left: "0.75rem",
                  color: "#6c757d",
                }}
              />
              <input
                type="text"
                className="p-inputtext p-component p-inputtext-sm"
                placeholder="Search"
                style={{
                  width: "180px",
                  paddingLeft: "2.5rem",
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </span>

            <Calendar
              value={fromDate}
              onChange={(e) => setFromDate(e.value)}
              placeholder="From Date"
              dateFormat="yy-mm-dd"
              showIcon
              inputClassName="p-inputtext-sm"
              inputStyle={{ width: "140px", paddingRight: "2.5rem" }}
            />

            <Calendar
              value={toDate}
              onChange={(e) => setToDate(e.value)}
              placeholder="To Date"
              dateFormat="yy-mm-dd"
              showIcon
              inputClassName="p-inputtext-sm"
              inputStyle={{ width: "140px", paddingRight: "2.5rem" }}
            />

            <Button
              type="button"
              label="Filter"
              icon="pi pi-filter"
              className="p-button-sm p-button-info"
              onClick={applyFilter}
            />
            {/* 🔹 Export to CSV */}
            <Button
              type="button"
              icon="pi pi-download"
              label="Export to Excel"
              className="p-button-sm p-button-success"
              onClick={exportCSV}
            />
          </div>
        </div>

        {/* 🔹 DataTable */}
        <DataTable
          ref={dt}
          value={filteredReports}
          paginator
          rows={5}
          responsiveLayout="scroll"
          stripedRows
          sortMode="single"
        >
          <Column field="ExpenseType" header="Expense Type" sortable />

          <Column field="ExpenseSubType" header="Expense Sub Type" sortable />
          <Column field="TotalAmount" header="Total Amount" sortable />
          <Column
            field="DateFrom"
            header="Date From"
            sortable
            body={(row) => formatDisplayDate(row.DateFrom)}
          />

          <Column
            field="DateTo"
            header="Date To"
            sortable
            body={(row) => formatDisplayDate(row.DateTo)}
          />
        </DataTable>
      </section>
    </div>
  );
}
