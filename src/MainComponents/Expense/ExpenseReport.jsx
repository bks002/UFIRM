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

  // ✅ Default load
  useEffect(() => {
    if (propertyId) {
      fetchExpenses("2025-01-01", "2025-12-31", propertyId);
    }
  }, [propertyId]);

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
  const from = fromDate ? formatDate(fromDate) : "2025-01-01";
  const to = toDate ? formatDate(toDate) : "2025-12-31";

  fetchExpenses(from, to, propertyId);
};


const exportCSV = () => {
  if (!reports || reports.length === 0) {
    alert("No data available to export!");
    return;
  }

  const header = ["Expense Type", "Expense Sub Type", "Total Amount"];
  const rows = reports.map((r) => [
    r.ExpenseType,
    r.ExpenseSubType,
    r.TotalAmount,
  ]);

  const xls = [
    header.join("\t"),
    ...rows.map((row) => row.join("\t")),
  ].join("\r\n");

  const blob = new Blob([xls], { type: "application/vnd.ms-excel" });

  // 🔹 Now using same formatDate
  const from = fromDate ? formatDate(fromDate) : "2025-01-01";
  const to = toDate ? formatDate(toDate) : "2025-12-31";

  const fileName = `ExpenseReport_${from}_to_${to}.xls`;

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




  return (
    <div className="content-wrapper">
      <section className="content">
        {/* 🔹 Header + Filter + Export Button */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="m-0">Expense Report</h5>

          <div className="d-flex align-items-center gap-2">
            <Calendar
              value={fromDate}
              onChange={(e) => setFromDate(e.value)}
              placeholder="From Date"
              dateFormat="yy-mm-dd"
              showIcon
            />
            <Calendar
              value={toDate}
              onChange={(e) => setToDate(e.value)}
              placeholder="To Date"
              dateFormat="yy-mm-dd"
              showIcon
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
          value={reports}
          paginator
          rows={5}
          responsiveLayout="scroll"
          stripedRows
        >
          <Column field="ExpenseType" header="Expense Type"  />
          <Column field="ExpenseSubType" header="Expense Sub Type" />
          <Column field="TotalAmount" header="Total Amount"  />
        </DataTable>
      </section>
    </div>
  );
}
