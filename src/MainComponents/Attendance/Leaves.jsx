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
import { fetchAllLeaveRequests, updateAllLeaveRequests, fetchLeaveSummary, submitLeaveRequest  } from "../../Services/LeaveService"
import {EmployeeLeaveService} from "../../Services/EmployeeLeaveService"
import {FacilityLatlongService} from "../../Services/FacilityLatlongService"
import { FilterMatchMode } from "primereact/api"
import "primereact/resources/themes/lara-light-blue/theme.css"
import "primereact/resources/primereact.min.css"

const Leaves = () => {
    const [gridData, setGridData] = useState([])

    const [employeeLeaveSummary, setEmployeeLeaveSummary] = useState([]);
    const [showTable, setShowTable] = useState(true); 

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
                    value: e.MobileNumber,
                    id: e.FacilityMemberId
                }))
            );
        } catch (error) {
            console.error(error);
        }
    };

    const loadDropdowns = async () => {
        try {
            const leaveRes = await EmployeeLeaveService.getLeaveTypes(propertyId)
            if (leaveRes && Array.isArray(leaveRes)) {
                setLeaveTypes(
                    leaveRes.map((lt) => ({
                        label: lt.LeaveType + " - " + lt.LeaveDescription,
                        value: lt.Id
                    }))
                )
            }
        } catch (error) {
            console.error("Dropdown load error:", error)
        }
    }



const approveLeave = async (data) => {
    const payload = { ...data, IsApproved: true, IsRejected: false, status: "Approved" };
    await updateAllLeaveRequests(payload);
    await loadLeaves();

    try {
        if (data.MobileNo) {
            const summary = await fetchLeaveSummary(data.MobileNo);
            // ✅ bas direct set karo, employeeName se compare ki zaroorat nahi
            setEmployeeLeaveSummary(summary || []);
        }
    } catch (error) {
        console.error("Failed to refresh leave summary:", error);
    }

    toast.current.show({
        severity: "success",
        summary: "Approved",
        detail: `Leave ID ${data.LeaveId} Approved`,
        life: 3000
    });
};

const deleteLeave = async (data) => {
    const payload = { ...data, IsRejected: true, IsApproved: false, status: "Rejected" };
    await updateAllLeaveRequests(payload);
    await loadLeaves();

    try {
        if (data.MobileNo) {
            const summary = await fetchLeaveSummary(data.MobileNo);
            setEmployeeLeaveSummary(summary || []);
        }
    } catch (error) {
        console.error("Failed to refresh leave summary:", error);
    }

    toast.current.show({
        severity: "error",
        summary: "Rejected",
        detail: `Leave ID ${data.LeaveId} Rejected`,
        life: 3000
    });
};


    const onGlobalFilterChange = (e) => {
        const value = e.target.value
        setGlobalFilterValue(value)
        setFilters({ ...filters, global: { value, matchMode: FilterMatchMode.CONTAINS } })
    }

    const calculateLeaveCount = (from, to) => {
        if (!from || !to) return 0;
        const start = new Date(from);
        const end = new Date(to);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return diff > 0 ? diff : 0;
    };

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
   // save new leave
const saveLeave = async () => {
    if (!employeeName || !fromDate || !toDate || !reason || !leaveType) {
        toast.current.show({ severity: "warn", summary: "Validation", detail: "All fields are required", life: 3000 })
        return
    }

    const selectedEmployee = employees.find(emp => emp.value === employeeName);
    const leaveCount = calculateLeaveCount(fromDate, toDate);

    // ✅ Remaining leave check
    const selectedLeaveTypeSummary = employeeLeaveSummary.find(s => s.LeaveTypeId === leaveType);
    if (selectedLeaveTypeSummary && leaveCount > selectedLeaveTypeSummary.RemainingLeaves) {
        toast.current.show({
            severity: "error",
            summary: "Limit Exceeded",
            detail: `You cannot apply more than ${selectedLeaveTypeSummary.RemainingLeaves} leaves.`,
            life: 4000
        });
        return;
    }

    // ✅ Overlap check
    const newFrom = new Date(fromDate);
    const newTo = new Date(toDate);
    const overlap = gridData.some(l =>
        l.MobileNo === selectedEmployee.value &&
        (l.IsApproved || (!l.IsApproved && !l.IsRejected)) &&
        (
            (newFrom >= new Date(l.FromDate) && newFrom <= new Date(l.ToDate)) ||
            (newTo >= new Date(l.FromDate) && newTo <= new Date(l.ToDate)) ||
            (newFrom <= new Date(l.FromDate) && newTo >= new Date(l.ToDate))
        )
    );

    if (overlap) {
        toast.current.show({ severity: "error", summary: "Overlap", detail: "Leave already applied for selected date range", life: 4000 })
        return;
    }

    const payload = {
        LeaveId: 0,
        EmployeeName: selectedEmployee ? selectedEmployee.label : "",
        MobileNo: selectedEmployee ? selectedEmployee.value : "",
        FromDate: fromDate,
        ToDate: toDate,
        Reason: reason,
        Status: "Pending",
        AppliedOn: new Date().toISOString(),
        LeaveType: leaveType,
        IsActive: true,
        IsApproved: false,
        IsRejected: false,
        ActionBy: 0,
        ActionOn: null,
        ActionRemarks: "",
        LeaveTypeId: leaveType,
        LeaveCount: leaveCount
    };

    try {
        await submitLeaveRequest(payload);
        toast.current.show({ severity: "success", summary: "Success", detail: "Leave Created Successfully", life: 3000 });

        // ✅ Reset form fields after save
        setEmployeeName("");
        setFromDate(null);
        setToDate(null);
        setReason("");
        setLeaveType(null);
        setEmployeeLeaveSummary([]);
setShowTable(false);
        setCreateDialogVisible(false); // dialog band karna ho to

        loadLeaves();
    } catch (error) {
        console.error("Leave creation failed:", error);
        toast.current.show({ severity: "error", summary: "Error", detail: "Failed to create leave", life: 3000 });
    }
};


    const onEmployeeChange = async (e) => {
        const selectedMobile = e.value;
        setEmployeeName(selectedMobile);

        if (selectedMobile) {
            try {
                const summary = await fetchLeaveSummary(selectedMobile);
                setEmployeeLeaveSummary(summary || []);
            } catch (error) {
                console.error("Failed to fetch leave summary:", error);
                setEmployeeLeaveSummary([]);
            }
        } else {
            setEmployeeLeaveSummary([]);
        }
    };
    return (
        <div className="content-wrapper">
            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <Toast ref={toast} />
                        <div className="pr-6 pl-6">
                            {showTable && (
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
                            )}
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
                            onChange={onEmployeeChange}
                            placeholder="Select Employee"
                        />
                    </div>

                    {employeeLeaveSummary.length > 0 && (
                        <div className="mb-3">
                            <h6>Leave Summary</h6>
                            <DataTable value={employeeLeaveSummary} responsiveLayout="scroll">
                                <Column field="LeaveType" header="Leave Type" />
                                <Column field="TakenLeaves" header="Taken Leaves" />
                                <Column field="RemainingLeaves" header="Remaining Leaves" />
                            </DataTable>
                        </div>
                    )}

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
                            value={leaveType}
                            options={LeaveType}
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

