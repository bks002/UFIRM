"use client"

import React, { useState, useEffect, useRef } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { Toast } from "primereact/toast"
import { Dialog } from "primereact/dialog"
import { Dropdown } from "primereact/dropdown"
import { Calendar } from "primereact/calendar"
import { useSelector } from "react-redux"
import { fetchAllLeaveRequests, updateAllLeaveRequests } from "../../Services/LeaveService"
import {EmployeeLeaveService} from "../../Services/EmployeeLeaveService"
import {FacilityLatlongService} from "../../Services/FacilityLatlongService"
import { FilterMatchMode } from "primereact/api"
import "primereact/resources/themes/lara-light-blue/theme.css"
import "primereact/resources/primereact.min.css"

const Leaves = () => {
    const [gridData, setGridData] = useState([])
    const [loading, setLoading] = useState(false)
    const [globalFilterValue, setGlobalFilterValue] = useState("")
    const [createDialogVisible, setCreateDialogVisible] = useState(false)
    const propertyId = useSelector((state) => state.Commonreducer.puidn)
    const toast = useRef(null)
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    })

    // form states
    const [employeeName, setEmployeeName] = useState("")
    const [fromDate, setFromDate] = useState(null)
    const [toDate, setToDate] = useState(null)
    const [reason, setReason] = useState("")
    const [leaveType, setLeaveType] = useState(null)

    // dropdown data
    const [employees, setEmployees] = useState([])
    const [LeaveType, setLeaveTypes] = useState([])

    useEffect(() => {
        if (propertyId) {
            loadLeaves()
            loadDropdowns()
            loadEmployees()
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

    const loadEmployees = async () => {
       try {
         const empData = await FacilityLatlongService.getFacilityMembers(propertyId);
         setEmployees(
      empData.map((e) => ({
        label: e.Name,
        value: e.FacilityMemberId   // only Id, no object
      }))
    );
    
       } catch (error) {
         console.error(error);
       }
     };
    

    const loadDropdowns = async () => {
        try {
            // load employees
            const empRes = await FacilityLatlongService.getFacilityMembers(propertyId)
            if (empRes && empRes.data) {
                setEmployees(empRes.data.map(e => ({ label: e.fullName, value: e.fullName })))
            }

            // load leave types
           const leaveRes = await EmployeeLeaveService.getLeaveTypes(propertyId)

    if (leaveRes && Array.isArray(leaveRes)) {
      setLeaveTypes(
        leaveRes.map((lt) => ({
          label: lt.LeaveType + " - " + lt.LeaveDescription, // e.g. "CL - Casual Leave"
          value: lt.Id
        }))
      )
    }
        } catch (error) {
            console.error("Dropdown load error:", error)
        }
    }

    const approveLeave = (data) => {
        const payload = { ...data, IsApproved: true, IsRejected: false }
        updateAllLeaveRequests(payload)
        loadLeaves()
        toast.current.show({ severity: "success", summary: "Approved", detail: `Leave ID ${data.LeaveId} Approved`, life: 3000 })
    }

    const deleteLeave = (data) => {
        const payload = { ...data, IsRejected: true, IsApproved: false }
        updateAllLeaveRequests(payload)
        loadLeaves()
        toast.current.show({ severity: "error", summary: "Rejected", detail: `Leave ID ${data.LeaveId} Rejected`, life: 3000 })
    }

    const onGlobalFilterChange = (e) => {
        const value = e.target.value
        setGlobalFilterValue(value)
        setFilters({ ...filters, global: { value, matchMode: FilterMatchMode.CONTAINS } })
    }

    const header = (
        <div className="d-flex justify-content-between align-items-center p-2">
            <h5 className="m-0">Leaves</h5>
            <div className="d-flex gap-2 align-items-center">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilterValue}
                        onChange={onGlobalFilterChange}
                        placeholder="Search..."
                    />
                </span>
                <Button label="Create Leave" icon="pi pi-plus" className="p-button-success" onClick={() => setCreateDialogVisible(true)} />
            </div>
        </div>
    )

    const actionBodyTemplate = (rowData) => (
        <>
            <Button icon={<i className='fa fa-check'></i>} className="btn btn-sm btn-success rounded mr-2" onClick={() => approveLeave(rowData)} />
            <Button icon={<i className='fa fa-times'></i>} className="btn btn-sm btn-danger rounded" onClick={() => deleteLeave(rowData)} />
        </>
    )

    // save new leave
    const saveLeave = async () => {
        if (!employeeName || !fromDate || !toDate || !reason || !leaveType) {
            toast.current.show({ severity: "warn", summary: "Validation", detail: "All fields are required", life: 3000 })
            return
        }

        const payload = {
            EmployeeName: employeeName,
            FromDate: fromDate,
            ToDate: toDate,
            Reason: reason,
            LeaveType: leaveType,
            PropertyId: propertyId,
            IsApproved: false,
            IsRejected: false
        }

        try {
            await updateAllLeaveRequests(payload)
            toast.current.show({ severity: "success", summary: "Success", detail: "Leave Created Successfully", life: 3000 })
            setCreateDialogVisible(false)
            // reset form
            setEmployeeName("")
            setFromDate(null)
            setToDate(null)
            setReason("")
            setLeaveType("")
            loadLeaves()
        } catch (error) {
            toast.current.show({ severity: "error", summary: "Error", detail: "Failed to create leave", life: 3000 })
        }
    }

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
                                globalFilterFields={["EmployeeName", "Reason", "LeaveType"]}
                                emptyMessage="No leave requests found."
                                dataKey="LeaveId"
                                breakpoint="960px"
                            >
                                <Column field="EmployeeName" header="Employee Name" />
                                <Column field="FromDate" header="From Date" body={(rowData) => rowData.FromDate ? rowData.FromDate.split("T")[0] : ""} />
                                <Column field="ToDate" header="To Date" body={(rowData) => rowData.ToDate ? rowData.ToDate.split("T")[0] : ""} />
                                <Column field="Reason" header="Reason" />
                                <Column field="LeaveType" header="Leave Type" />
                                <Column field="IsApproved" header="Is Approved" body={(rowData) => rowData.IsApproved ? "Yes" : "No"} />
                                <Column field="IsRejected" header="Is Rejected" body={(rowData) => rowData.IsRejected ? "Yes" : "No"} />
                                <Column header="Action" body={actionBodyTemplate} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </section>

            {/* Create Leave Dialog */}
            <Dialog visible={createDialogVisible} header="Create Leave" modal style={{ width: "500px" }} onHide={() => setCreateDialogVisible(false)}>
                <div className="p-fluid">
                    <div className="field mb-3">
                        <label>Employee Name</label>
                        <Dropdown
                            value={employeeName}
                            options={employees}
                            onChange={(e) => setEmployeeName(e.value)}
                            placeholder="Select Employee"
                        />
                    </div>
                    <div className="field mb-3">
                        <label>From Date</label>
                        <Calendar value={fromDate} onChange={(e) => setFromDate(e.value)} showIcon dateFormat="yy-mm-dd" />
                    </div>
                    <div className="field mb-3">
                        <label>To Date</label>
                        <Calendar value={toDate} onChange={(e) => setToDate(e.value)} showIcon dateFormat="yy-mm-dd" />
                    </div>
                    <div className="field mb-3">
                        <label>Reason</label>
                        <InputText value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter Reason" />
                    </div>
                    <div className="field mb-3">
                        <label>Leave Type</label>
                        <Dropdown
  value={leaveType}          // selected value
  options={LeaveType}        // array of options
  onChange={(e) => setLeaveType(e.value)}
  placeholder="Select Leave Type"
/>
                    </div>
                </div>
                <div className="flex justify-content-end mt-3">
                    <Button label="Cancel" className="p-button-text mr-2" onClick={() => setCreateDialogVisible(false)} />
                    <Button label="Save" icon="pi pi-check" onClick={saveLeave} />
                </div>
            </Dialog>
        </div>
    )
}

export default Leaves
