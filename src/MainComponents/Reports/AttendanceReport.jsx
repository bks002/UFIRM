"use client";

import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";

import {
    fetchAttendanceReport
} from "../../Services/ReportService";
import { FacilityMemberService } from "../../Services/FacilityService";

const AttendanceReportPage = () => {
    const toast = useRef(null);
    const propertyId = useSelector((state) => state.Commonreducer.puidn);

    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);

    /* ================= FILTERS ================= */
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [status, setStatus] = useState(null);
    const [employeeName, setEmployeeName] = useState(null);

    const [employees, setEmployees] = useState([]);

    /* ================= STATUS OPTIONS ================= */
    const statusOptions = [
        { label: "All", value: null },
        { label: "Present", value: "Present" },
        { label: "Absent", value: "Absent" },
        { label: "Leave", value: "Leave" },
        { label: "Holiday", value: "Holiday" },
    ];

    /* ================= FORMAT DATE ================= */
    const formatDate = (date) => {
        if (!date) return null;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`; // yyyy-mm-dd (IST-safe)
    };

    /* ================= LOAD EMPLOYEES ================= */
    useEffect(() => {
        if (!propertyId) return;

        FacilityMemberService.getFacilityMembers(propertyId)
            .then((data) => {
                // 🔄 Map API response → PrimeReact Dropdown format
                const mapped = data.map((emp) => ({
                    label: emp.Name || emp.name,
                    value: emp.Name || emp.name,
                }));
                setEmployees(mapped);
            })
            .catch(() =>
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to load employees",
                })
            );
    }, [propertyId]);

    /* ================= LOAD REPORT ================= */
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

        const data = await fetchAttendanceReport({
            propertyId,
            fromDate: formatDate(fromDate),
            toDate: formatDate(toDate),
            status,
            employeeName,
        });

        // 🔹 SORT DETAILS DATE-WISE
        const sortedDetails = (data.Details || []).sort(
            (a, b) =>
                new Date(a.AttendanceDate) - new Date(b.AttendanceDate)
        );

        setReport({
            summary: data.Summary || [],
            details: sortedDetails,
            dateWiseSummary: data.DateWiseSummary || [],
        });
    } catch (err) {
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to load attendance report",
        });
    } finally {
        setLoading(false);
    }
};


    /* ================= EXPORT EXCEL ================= */
    const downloadExcel = () => {
        if (!report) return;

        const wb = XLSX.utils.book_new();

        Object.entries(report).forEach(([key, value]) => {
            if (!Array.isArray(value) || value.length === 0) return;

            const ws = XLSX.utils.json_to_sheet(value);
            XLSX.utils.book_append_sheet(wb, ws, key.substring(0, 31));
        });

        XLSX.writeFile(wb, "Attendance_Report.xlsx");
    };

    /* ================= TABLE RENDER ================= */
    const renderTable = (title, data) => {
        return (
            <Card title={title} className="mb-4">
                {Array.isArray(data) && data.length > 0 ? (
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
                ) : (
                    <div className="text-center text-muted p-4">
                        No records found
                    </div>
                )}
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
                        <h3 className="m-0">Attendance Report</h3>

                        <Button
                            label="Download Excel"
                            icon="pi pi-file-excel"
                            className="p-button-success"
                            onClick={downloadExcel}
                            disabled={!report}
                        />
                    </div>

                    {/* ================= FILTERS ================= */}
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
                                <label>Employee</label>
                                <Dropdown
                                    value={employeeName}
                                    options={employees}
                                    onChange={(e) => setEmployeeName(e.value)}
                                    placeholder="All Employees"
                                    filter
                                    showClear
                                    className="w-100"
                                />
                            </div>

                            <div className="col-md-3">
                                <label>Status</label>
                                <Dropdown
                                    value={status}
                                    options={statusOptions}
                                    onChange={(e) => setStatus(e.value)}
                                    placeholder="All"
                                    className="w-100"
                                />
                            </div>

                            <div className="col-md-3 mt-3">
                                <Button
                                    label="Apply"
                                    icon="pi pi-search"
                                    className="p-button-primary"
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
                        <div className="mt-4">
                             {renderTable("Date Wise Summary", report.dateWiseSummary)}
                            {renderTable("Employee Summary", report.summary)}
                            {renderTable("Date Wise Details", report.details)}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default AttendanceReportPage;
