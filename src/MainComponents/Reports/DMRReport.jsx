"use client";

import React, { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { Calendar } from "primereact/calendar";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import "jspdf-autotable";
import { fetchDmrReport } from "../../Services/ReportService";

const DmrReportPage = () => {
  const toast = useRef(null);
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  // ✅ USER SELECTED DATES
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  /* =======================
     FORMAT DATE FOR API
  ======================= */
 const formatDate = (date) => {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`; // yyyy-mm-dd (IST-safe)
};

const EXCEL_TEXT_LIMIT = 32767;

/* Check if table contains long text */
const hasLongText = (data) => {
  return data.some((row) =>
    Object.values(row).some(
      (val) => typeof val === "string" && val.length > EXCEL_TEXT_LIMIT
    )
  );
};

/* Export CSV */
const exportCSV = (data, filename) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

  /* =======================
     LOAD REPORT
  ======================= */
  const loadReport = async () => {
    if (!fromDate || !toDate) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Please select From Date and To Date",
      });
      return;
    }

    try {
      setLoading(true);
      const data = await fetchDmrReport(
        propertyId,
        formatDate(fromDate),
        formatDate(toDate)
      );
      setReport(data);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load DMR report",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     EXPORTS
  ======================= */
const downloadExcel = () => {
  if (!report) return;

  const wb = XLSX.utils.book_new();

  Object.entries(report).forEach(([key, value]) => {
    if (!Array.isArray(value) || value.length === 0) return;

    try {
      // 🔵 Try Excel first
      const ws = XLSX.utils.json_to_sheet(value);
      XLSX.utils.book_append_sheet(
        wb,
        ws,
        key.substring(0, 31)
      );
    } catch (err) {
      // 🟡 If Excel fails → CSV fallback
      exportCSV(value, `DMR_${key}`);
    }
  });

  // 📘 Download Excel only if it has valid sheets
  if (wb.SheetNames.length > 0) {
    XLSX.writeFile(wb, "DMR_Report.xlsx");
  }
};


  /* =======================
     TABLE RENDER
  ======================= */
  const renderTable = (title, data) => {
    if (!Array.isArray(data) || data.length === 0) return null;

    return (
      <Card title={title} className="mb-4">
        <DataTable
          value={data}
          paginator
          rows={10}
          stripedRows
          showGridlines
          responsiveLayout="scroll"
        >
          {Object.keys(data[0]).map((col) => (
            <Column key={col} field={col} header={col} />
          ))}
        </DataTable>
      </Card>
    );
  };

  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="container-fluid">
          <Toast ref={toast} />

          {/* ================= HEADER ================= */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="m-0">DMR Report</h3>

            <div className="d-flex gap-2">
              <Button
                label="Download Excel"
                icon="pi pi-file-excel"
                className="p-button-success"
                onClick={downloadExcel}
                disabled={!report}
              />
              
            </div>
          </div>

          {/* ================= DATE FILTER ================= */}
          <Card className="mb-4">
            <div className="row align-items-end">
              <div className="col-md-3">
                <label>From Date</label>
                <Calendar
                  value={fromDate}
                  onChange={(e) => setFromDate(e.value)}
                  dateFormat="yy-mm-dd"
                  showIcon
                  className="w-100"
                />
              </div>

              <div className="col-md-3">
                <label>To Date</label>
                <Calendar
                  value={toDate}
                  onChange={(e) => setToDate(e.value)}
                  dateFormat="yy-mm-dd"
                  showIcon
                  className="w-100"
                />
              </div>

              <div className="col-md-3">
                <Button
                  label="Apply"
                  icon="pi pi-search"
                  className="p-button-primary mt-3"
                  onClick={loadReport}
                />
              </div>
            </div>
          </Card>

          {/* ================= LOADING ================= */}
          {loading && (
            <div className="d-flex justify-content-center mt-5">
              <ProgressSpinner />
            </div>
          )}

          {/* ================= REPORT ================= */}
          {!loading && report && (
            <>
              {/* ================= KPI CARDS ================= */}
              {report.Kpis && (
                <div className="row mb-4">
                  {Object.entries(report.Kpis).map(([k, v]) => (
                    <div key={k} className="col-md-3 col-sm-6 mb-3">
                      <Card>
                        <small className="text-muted">{k}</small>
                        <h2 className="m-0">{v}</h2>
                      </Card>
                    </div>
                  ))}
                </div>
              )}

              {/* ================= TABLES ================= */}
              {renderTable("Assets", report.Assets)}
              {renderTable("Spares", report.Spares)}
              {renderTable("Services", report.Services)}
              {renderTable("Rentals", report.Rentals)}
              {renderTable("Tasks", report.Tasks)}
              {renderTable("Tickets", report.Tickets)}
              {renderTable("Asset Summary", report.AssetSummary)}
              {renderTable("Alerts", report.Alerts)}
              {renderTable("Monthly Trends", report.MonthlyTrends)}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default DmrReportPage;