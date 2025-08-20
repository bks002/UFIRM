"use client"

import React, { useState, useEffect, useRef } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { Toast } from "primereact/toast"
import { Dialog } from "primereact/dialog"
import { FilterMatchMode } from "primereact/api"
import LeaveMasterService from "../../Services/LeaveMasterService" 
import { useSelector } from "react-redux";


import "primereact/resources/themes/lara-light-blue/theme.css"
import "primereact/resources/primereact.min.css"

const LeaveTypeMaster = () => {
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  const [gridData, setGridData] = useState([])
  const [globalFilterValue, setGlobalFilterValue] = useState("")
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  })
  const toast = useRef(null)

  // dialog states
  const [dialogVisible, setDialogVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({ id: null, LeaveType: "", LeaveCount: "", PropertyId:propertyId, IsActive:true})

  // 🔹 Fetch data on load
  useEffect((propertyId) => {
    fetchData()
  }, [propertyId])

  const fetchData = async () => {
    try {
      const res = await LeaveMasterService.getAllLeaveMasters()
      setGridData(res.data || [])
    } catch (err) {
      console.error("Error fetching data:", err)
      toast.current.show({ severity: "error", summary: "Error", detail: "Failed to load leave data" })
    }
  }

  // 🔹 Create or Update
  const handleSave = async () => {
    try {
      if (editMode) {
        await LeaveMasterService.updateLeaveMaster(formData.id, formData)
        toast.current.show({ severity: "success", summary: "Updated", detail: "Leave updated successfully" })
      } else {
        await LeaveMasterService.createLeaveMaster(formData)
        toast.current.show({ severity: "success", summary: "Created", detail: "Leave created successfully" })
      }
      setDialogVisible(false)
      fetchData()
    } catch (err) {
      console.error("Save Error:", err)
      toast.current.show({ severity: "error", summary: "Error", detail: "Operation failed" })
    }
  }

  // 🔹 Delete
  const handleDelete = async (rowData) => {
    try {
      await LeaveMasterService.deleteLeaveMaster(rowData.Id)
      toast.current.show({ severity: "error", summary: "Deleted", detail: "Leave deleted successfully" })
      fetchData()
    } catch (err) {
      console.error("Delete Error:", err)
      toast.current.show({ severity: "error", summary: "Error", detail: "Delete failed" })
    }
  }

  // 🔹 Search filter
  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    setGlobalFilterValue(value)
    setFilters({ ...filters, global: { value, matchMode: FilterMatchMode.CONTAINS } })
  }

  // 🔹 Open create dialog
  const openCreateDialog = () => {
    setFormData({ id: "", LeaveType: "", LeaveCount: "", PropertyId: propertyId  })
    setEditMode(false)
    setDialogVisible(true)
  }

  // 🔹 Open edit dialog
  const openEditDialog = (rowData) => {
    setFormData({
    id: rowData.Id,              
    LeaveType: rowData.LeaveType,
    LeaveCount: rowData.LeaveCount,
    PropertyId: rowData.PropertyId,
    IsActive:true
  })
    setEditMode(true)
    setDialogVisible(true)
  }

  // Header
  const header = (
    <div className="d-flex justify-content-between align-items-center p-2">
      <h5 className="m-0">Leave Master</h5>
      <div className="d-flex gap-2 align-items-center">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search..."
          />
        </span>
        <Button label="Create" icon="pi pi-plus" onClick={openCreateDialog} className="p-button-success" />
      </div>
    </div>
  )

  // Action column
  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button icon="fa fa-pencil" className="btn btn-sm btn-primary" onClick={() => openEditDialog(rowData)} />
      <Button icon="fa fa-trash" className="btn btn-sm btn-danger" onClick={() => handleDelete(rowData)} />
    </div>
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
                header={header}
                paginator
                rows={10}
                filters={filters}
                filterDisplay="row"
                globalFilterFields={["LeaveType", "LeaveCount"]}
                emptyMessage="No leave types found."
                dataKey="id"
                breakpoint="960px"
              >
                <Column field="LeaveType" header="Leave Type" />
                <Column field="LeaveCount" header="Leave Count" />
                <Column header="Action" body={actionBodyTemplate} />
              </DataTable>
            </div>
          </div>
        </div>
      </section>

      {/* Dialog */}
      <Dialog
        header={editMode ? "Edit Leave" : "Create Leave"}
        visible={dialogVisible}
        style={{ width: "400px" }}
        modal
        onHide={() => setDialogVisible(false)}
      >
        <div className="flex flex-col gap-4">
          <div className="modal-body">
            <div className="row">
              <div className="col-12">
                <label htmlFor="LeaveType">Leave Type</label>
                <input
                  id="LeaveType"
                  required
                  placeholder="Leave Type"
                  type="text"
                  className="form-control"
                  value={formData.LeaveType}
                  onChange={(e) => setFormData({ ...formData, LeaveType: e.target.value })}
                />
              </div>
              <div className="col-12 mt-3">
                <label htmlFor="LeaveCount">Leave Count</label>
                <input
                  id="LeaveCount"
                  required
                  placeholder="Enter Leave Count"
                  type="text"
                  className="form-control"
                  value={formData.LeaveCount}
                  onChange={(e) => setFormData({ ...formData, LeaveCount: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <Button label="Cancel" className="p-button-text" onClick={() => setDialogVisible(false)} />
            <Button label={editMode ? "Update" : "Create"} onClick={handleSave} />
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default LeaveTypeMaster
