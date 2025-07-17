"use client"

import React, { useState, useEffect, useRef } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { Toast } from "primereact/toast"
import { Dialog } from "primereact/dialog"
import { useSelector } from "react-redux"
import { fetchAllLeaveRequests, updateAllLeaveRequests } from "../../Services/LeaveService"
import { FilterMatchMode } from "primereact/api"
import "primereact/resources/themes/lara-light-blue/theme.css"
import "primereact/resources/primereact.min.css"

const LeavesMaster = () => {
    const [gridData, setGridData] = useState([])
    const [loading, setLoading] = useState(false)
    const [globalFilterValue, setGlobalFilterValue] = useState("")
    const [viewDialogVisible, setViewDialogVisible] = useState(false)
    const [selectedLeave, setSelectedLeave] = useState(null)
    const propertyId = useSelector((state) => state.Commonreducer.puidn)
    const toast = useRef(null)
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    })

    useEffect(() => {
        if (propertyId) {
            loadLeaves()
        }
    }, [propertyId])

    const loadLeaves = async () => {
        setLoading(true)
        try {
            const data = await fetchAllLeaveRequests(propertyId)
            setGridData(data)
        } catch (error) {
            toast.current.show({ severity: "error", summary: "Error", detail: "Failed to fetch leaves", life: 3000 })
        } finally {
            setLoading(false)
        }
    }

    const approveLeave = (data) => {

        const payload = { ...data, IsApproved: true, IsRejected: false, };
        updateAllLeaveRequests(payload);
        loadLeaves();
        toast.current.show({ severity: "success", summary: "Approved", detail: `Leave ID ${data.LeaveId} Approved`, life: 3000 })
    }

    const deleteLeave = (data) => {
        const payload = { ...data, IsRejected: true, IsApproved: false, };
        updateAllLeaveRequests(payload);
        loadLeaves();
        toast.current.show({ severity: "error", summary: "Rejected", detail: `Leave ID ${data.LeaveId} Rejected`, life: 3000 })
    }

    const onGlobalFilterChange = (e) => {
        const value = e.target.value
        setGlobalFilterValue(value)
        setFilters({ ...filters, global: { value, matchMode: FilterMatchMode.CONTAINS } })
    }

    const header = (
        <div className="card-header d-flex justify-content-between align-items-center p-2">
            <span className="p-input-icon-right">
                <i className="pi pi-search" />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search..." className="form-control" />
            </span>
        </div>
    )

    const actionBodyTemplate = (rowData) => (
        <>
            {/* <Button icon="pi pi-eye" className="p-button-rounded p-button-info mr-2" onClick={() => viewLeave(rowData)} tooltip="View" /> */}
            <Button icon={<i class='fa fa-check'></i>} className="btn btn-sm btn-success rounded mr-2" onClick={() => approveLeave(rowData)} />
            <Button icon={<i class='fa fa-times'></i>} className="btn btn-sm btn-danger rounded" onClick={() => deleteLeave(rowData)} />
        </>
    )

    return (
        <div className="content-wrapper">
            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <Toast ref={toast} />
                        <div className="pr-6 pl-6">
                            <DataTable
                                value={gridData}
                                loading={loading}
                                header={header}
                                paginator
                                rows={10}
                                filters={filters}
                                filterDisplay="row"
                                globalFilterFields={["employeeName", "mobileNo", "reason", "leaveType"]}
                                emptyMessage="No leave requests found."
                                dataKey="leaveId"
                                breakpoint="960px"
                            >
                                <Column field="EmployeeName" header="Employee Name" />
                                <Column field="FromDate" header="From Date" body={(rowData) => {
                                    const dateOnly = rowData.FromDate ? rowData.FromDate.split('T')[0] : '';
                                    return dateOnly;
                                }} />
                                <Column field="ToDate" header="To Date" body={(rowData) => {
                                    const dateOnly = rowData.FromDate ? rowData.FromDate.split('T')[0] : '';
                                    return dateOnly;
                                }} />
                                <Column field="Reason" header="Reason" />
                                <Column field="LeaveType" header="Leave Type" />
                                <Column field="IsApproved" header="Is Approved" body={(rowData) => rowData.IsApproved ? 'Yes' : 'No'} />
                                <Column field="IsRejected" header="Is Rejected" body={(rowData) => rowData.IsRejected ? 'Yes' : 'No'} />
                                <Column header="Action" body={actionBodyTemplate} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default LeavesMaster
