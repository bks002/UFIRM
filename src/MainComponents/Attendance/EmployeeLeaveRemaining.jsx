"use client"

import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { InputText } from "primereact/inputtext"
import { Card } from "primereact/card"
import { Button } from "primereact/button"
import { Toast } from "primereact/toast"
import { FilterMatchMode } from "primereact/api"
import * as XLSX from "xlsx";
import "primereact/resources/themes/lara-light-blue/theme.css"
import "primereact/resources/primereact.min.css"
import "primeicons/primeicons.css"

const LeaveDashboard = () => {

    const [employees, setEmployees] = useState([])
    const [globalFilterValue, setGlobalFilterValue] = useState("")
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    })

    const toast = useRef(null)

    useEffect(() => {
        fetchLeaveData()
    }, [])

    const fetchLeaveData = async () => {
        try {

            const res = await axios.get(
                "https://api.urest.in:8096/api/attendance/leave-remaining",
                {
                    withCredentials: false,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const raw = res.data;

            const grouped = {};

            raw.forEach((item) => {

                if (!grouped[item.EmployeeId]) {
                    grouped[item.EmployeeId] = {
                        EmployeeId: item.EmployeeId,
                        Name: item.Name,
                        CL: 0,
                        SL: 0,
                        EL: 0
                    };
                }

                if (item.LeaveTypeName === "CL")
                    grouped[item.EmployeeId].CL = item.RemainingLeaves;

                if (item.LeaveTypeName === "SL")
                    grouped[item.EmployeeId].SL = item.RemainingLeaves;

                if (item.LeaveTypeName === "EL")
                    grouped[item.EmployeeId].EL = item.RemainingLeaves;
            });

            const employeeList = Object.values(grouped);

            setEmployees(employeeList);

        } catch (err) {

            console.error("Axios error:", err);

            toast.current.show({
                severity: "error",
                summary: "API Error",
                detail: "Failed to load leave data"
            });

        }
    };
    const downloadExcel = () => {
        if (!employees || employees.length === 0) {
            toast.current?.show({
                severity: "warn",
                summary: "No Data",
                detail: "No leave data to export",
            });
            return;
        }

        const wb = XLSX.utils.book_new();

        const exportData = employees.map((e) => ({
            "Employee Name": e.Name,
            "CL Remaining": e.CL,
            "SL Remaining": e.SL,
            "EL Remaining": e.EL,
        }));

        try {
            const ws = XLSX.utils.json_to_sheet(exportData);
            XLSX.utils.book_append_sheet(wb, ws, "Leave Dashboard");
        } catch (err) {
            exportCSV(exportData, "Leave_Dashboard");
        }

        if (wb.SheetNames.length > 0) {
            XLSX.writeFile(wb, "Employee_Leave_Report.xlsx");
        }
    };
    const onGlobalFilterChange = (e) => {
        const value = e.target.value
        setGlobalFilterValue(value)
        setFilters({
            ...filters,
            global: { value, matchMode: FilterMatchMode.CONTAINS }
        })
    }

    // Badge color logic
    const badgeTemplate = (value) => {

        let color = "#16a34a"

        if (value === 0) color = "#dc2626"
        else if (value <= 1) color = "#f59e0b"

        return (
            <span
                style={{
                    background: color,
                    color: "#fff",
                    padding: "5px 10px",
                    borderRadius: "8px",
                    fontWeight: "600"
                }}
            >
                {value}
            </span>
        )
    }

    const exportCSV = (data, filename) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
    };
    return (
        <div className="content-wrapper mt-4">
            <section className="content">
                <div className="container-fluid">

                    <Toast ref={toast} />

                    {/* Header */}
                   <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="m-0">Employee Leave Dashboard</h3>

            <div className="d-flex gap-2">

                <InputText
                    value={globalFilterValue}
                    onChange={onGlobalFilterChange}
                    placeholder="Search employee..."
                />

                <Button
                    label="Download Excel"
                    icon="pi pi-file-excel"
                    className="p-button-success"
                    onClick={downloadExcel}
                    disabled={employees.length === 0}
                />

            </div>
        </div>

                    {/* Table Card */}
                    <div className="card">
                        <div className="card-body">

                            <DataTable
                                value={employees}
                                paginator
                                rows={10}
                                filters={filters}
                                globalFilterFields={["Name"]}
                                stripedRows
                                showGridlines
                                responsiveLayout="scroll"
                            >


                                <Column field="Name" header="Employee Name" sortable />

                                <Column
                                    field="CL"
                                    header="CL Remaining"
                                    body={(row) => badgeTemplate(row.CL)}
                                    sortable
                                />

                                <Column
                                    field="SL"
                                    header="SL Remaining"
                                    body={(row) => badgeTemplate(row.SL)}
                                    sortable
                                />

                                <Column
                                    field="EL"
                                    header="EL Remaining"
                                    body={(row) => badgeTemplate(row.EL)}
                                    sortable
                                />

                            </DataTable>

                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}

export default LeaveDashboard