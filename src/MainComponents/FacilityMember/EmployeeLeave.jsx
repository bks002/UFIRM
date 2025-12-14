"use client";

import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { FilterMatchMode } from "primereact/api";
import { useSelector } from "react-redux";

import "primereact/resources/themes/lara-light-blue/theme.css";

import { EmployeeLeaveService } from "../../Services/EmployeeLeaveService"
import { FacilityLatlongService } from "../../Services/FacilityLatlongService";

const EmployeeLeave = () => {
  const toast = useRef(null);
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  // Table & filters
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  // Dialog (Add/Edit)
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // Form fields
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [LeaveType, setLeaveTypes] = useState([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);

  const [leaveCount, setLeaveCount] = useState("");
  const [leaveBalance, setLeaveBalance] = useState("");
  const [financialYear, setFinancialYear] = useState("");

  useEffect(() => {
    if (!propertyId) return;

    const loadAll = async () => {
      setLoading(true);
      try {
        const [leaves, empData, leaveTypeData] = await Promise.all([
          EmployeeLeaveService.getLeaves(propertyId),
          FacilityLatlongService.getFacilityMembers(propertyId),
          EmployeeLeaveService.getLeaveTypes(propertyId)
        ]);

        // 🔹 Create lookup maps
        const empMap = {};
        empData.forEach(e => {
          empMap[e.FacilityMemberId] = e.Name;
        });

        const leaveTypeMap = {};
        leaveTypeData.forEach(l => {
          leaveTypeMap[l.Id] = l.LeaveType;
        });

        // 🔹 Enrich leave rows
        const finalData = leaves.map(item => ({
          id: item.Id,
          employeeId: item.EmployeeId,
          employeeName: empMap[item.EmployeeId] || "—",
          leaveTypeId: item.LeaveTypeId,
          leaveTypeName: leaveTypeMap[item.LeaveTypeId] || "—",
          balance: item.Balance,
          financialYear: item.FinancialYear,
        }));

        setLeaveData(finalData);

        // Dropdowns
        setEmployees(
          empData.map(e => ({ label: e.Name, value: e.FacilityMemberId }))
        );

        setLeaveTypes(
          leaveTypeData.map(l => ({ label: l.LeaveType, value: l.Id }))
        );
      } catch (err) {
        console.error(err);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load data"
        });
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [propertyId]);

  // ✅ GET Leaves for table
  const loadLeaves = async () => {
    setLoading(true);
    try {
      const data = await EmployeeLeaveService.getLeaves(propertyId);
      setLeaveData(
        data.map((item) => ({
          id: item.Id,
          employeeId: item.EmployeeId,
          leaveTypeId: item.LeaveTypeId,
          leaveCount: item.LeaveCount,
          balance: item.Balance,
          financialYear: item.FinancialYear,
        }))
      );
    } catch (error) {
      console.error(error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch employee leaves",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ GET Employees for dropdown
  // const loadEmployees = async () => {
  //   try {
  //     const empData = await FacilityLatlongService.getFacilityMembers(propertyId);
  //     setEmployees(
  //       empData.map((e) => ({
  //         label: e.Name,
  //         value: e.FacilityMemberId   // only Id, no object
  //       }))
  //     );

  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // ✅ GET Leave Types for dropdown
  // const loadLeaveTypes = async () => {
  //   try {
  //     const leaveTypeData = await EmployeeLeaveService.getLeaveTypes(propertyId);
  //     setLeaveTypes(
  //       leaveTypeData.map((lt) => ({
  //         label: lt.LeaveType,  // for displaying
  //         value: lt.Id          // actual value
  //       }))
  //     );
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const resetForm = () => {
    setSelectedEmployee(null);
    setSelectedLeaveType(null);
    setLeaveCount("");
    setLeaveBalance("");
    setFinancialYear("");
    setEditingIndex(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogVisible(true);
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters((prev) => ({
      ...prev,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    }));
  };

  const validate = () => {
    if (!selectedEmployee || !selectedLeaveType || !leaveCount || !leaveBalance || !financialYear) {
      toast.current.show({
        severity: "warn",
        summary: "Validation",
        detail: "Please fill all fields",
        life: 2500,
      });
      return false;
    }
    return true;
  };

  // ✅ POST API
  const saveLeave = async () => {
    if (!validate()) return;

    const record = {
      EmployeeId: Number(selectedEmployee),   // ensure number
      LeaveTypeId: Number(selectedLeaveType),
      Balance: Number(leaveBalance),
      FinancialYear: financialYear,  // try "2025-2026" instead of just "2025"
      PropertyId: Number(propertyId), // convert to number
      CreatedOn: 1,
      CreatedBy: 1,
      UpdatedOn: 1,
      UpdatedBy: 0,
      IsActive: true
    };



    try {
      await EmployeeLeaveService.addLeave(record);
      toast.current.show({
        severity: "success",
        summary: "Added",
        detail: "Employee leave added successfully",
        life: 2000,
      });
      loadLeaves();
      setDialogVisible(false);
      resetForm();
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to add leave",
      });
    }
  };

  // ✅ DELETE API
  const deleteLeave = async (rowData) => {
    if (!window.confirm("Are you sure you want to delete this leave?")) return;
    try {
      await EmployeeLeaveService.deleteLeave(rowData.id);
      toast.current.show({
        severity: "success",
        summary: "Deleted",
        detail: "Leave deleted",
      });
      loadLeaves();
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete leave",
      });
    }
  };

  const header = (
    <div className="d-flex justify-content-between align-items-center p-2">
      <h5 className="m-0">Employee Leave</h5>
      <div className="d-flex gap-2 align-items-center">
        <span className="p-input-icon-left">

          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search..."
          />
        </span>

        <Button
          label="Create"
          icon="pi pi-plus"
          onClick={openCreateDialog}
          className="p-button-success"
        />
      </div>
    </div>
  );

  // const employeeBodyTemplate = (rowData) => {
  //   const emp = employees.find((e) => e.value === rowData.employeeId);
  //   return emp ? emp.label : rowData.employeeId;
  // };

  // const leaveTypeBodyTemplate = (rowData) => {
  //   const lt = LeaveType.find((l) => l.value === rowData.leaveTypeId);
  //   return lt ? lt.label : rowData.leaveTypeId;
  // };


  const actionBodyTemplate = (rowData) => (
    <div className="d-flex gap-2">
      <Button
        icon={<i className="fa fa-times"></i>}
        className="btn btn-sm btn-danger rounded"
        onClick={() => deleteLeave(rowData)}
      />
    </div>
  );

  const indexTemplate = (_rowData, options) => options.rowIndex + 1;

  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="container-fluid">
          <Toast ref={toast} />
          <div className="card">
            <div className="p-3">
              <DataTable
                value={leaveData}
                loading={loading}
                header={header}
                paginator
                rows={10}
                filters={filters}
                filterDisplay="row"
                globalFilterFields={["employeeId", "leaveTypeId", "leaveCount", "balance", "financialYear"]}
                emptyMessage="No leaves found."
                dataKey="id"
                breakpoint="960px"
                responsiveLayout="scroll"
              >
                <Column header="#" body={indexTemplate} style={{ width: "5rem" }} />
                <Column field="employeeName" header="Employee Name" />
<Column field="leaveTypeName" header="Leave Type" />
                <Column field="balance" header="Leave Balance" />
                <Column field="financialYear" header="Financial Year" />
                <Column header="Action" body={actionBodyTemplate} style={{ width: "9rem" }} />
              </DataTable>
            </div>
          </div>
        </div>
      </section>

      {/* Add/Edit Dialog */}
      <Dialog
        header={editingIndex !== null ? "Edit Leave" : "Add Leave"}
        visible={dialogVisible}
        style={{ width: "450px" }}
        modal
        onHide={() => setDialogVisible(false)}
        footer={
          <div className="d-flex justify-content-end gap-2">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setDialogVisible(false)}
            />
            <Button
              label={editingIndex !== null ? "Update" : "Add"}
              icon="pi pi-check"
              onClick={saveLeave}
            />
          </div>
        }
      >
        <div className="p-fluid">
          <div className="field mb-3">
            <label>Employee</label>
            <Dropdown
              value={selectedEmployee}
              options={employees}
              onChange={(e) => setSelectedEmployee(e.value)}
              placeholder="Select Employee"
              className="w-full"
            />
          </div>

          <div className="field mb-3">
            <label>Leave Type</label>
            <Dropdown
              value={selectedLeaveType}
              options={LeaveType}
              onChange={(e) => setSelectedLeaveType(e.value)}
              placeholder="Select Leave Type"
              className="w-full"
            />
          </div>

          <div className="field mb-3">
            <label>Leave Balance</label>
            <InputText value={leaveBalance} onChange={(e) => setLeaveBalance(e.target.value)} />
          </div>

          <div className="field">
            <label>Financial Year</label>
            <InputText value={financialYear} onChange={(e) => setFinancialYear(e.target.value)} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default EmployeeLeave;
