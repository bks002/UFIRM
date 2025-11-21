"use client";

import React, { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { RadioButton } from "primereact/radiobutton";
import { Dropdown } from "primereact/dropdown";
import { FilterMatchMode } from "primereact/api";
import { useSelector } from "react-redux";

import {
  getItemAssigned,
  createItemAssigned,
  updateItemAssigned,
  deleteItemAssigned,
  getItemSpecificationName,
} from "../../Services/ItemassignService";
import { getAllItems } from "../../Services/InventoryService";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

export default function ItemAssignedPage() {
  const [grouped, setGrouped] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [specifications, setSpecifications] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemOptions, setItemOptions] = useState([]);

  const [formData, setFormData] = useState({
    itemId: null,
    item_Name: "",
    gender: "",
    quantity: 1,
    isRequisition: false,
    isHandover: false,
  });

  const toast = useRef(null);
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  useEffect(() => {
    fetchGrouped();
    fetchItemOptions();
  }, []);

  // ✅ Fetch Assigned Items
  const fetchGrouped = async () => {
    try {
      const res = await getItemAssigned(propertyId);
      setGrouped(res || []);
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load grouped data",
      });
    }
  };

  // ✅ Fetch dropdown items
  const fetchItemOptions = async () => {
    try {
      const res = await getAllItems(propertyId);
      const formatted = res.map((i) => ({
        label: i.Name,
        value: { id: i.Id, name: i.Name },
      }));
      setItemOptions(formatted);
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load item list",
      });
    }
  };

  // ✅ When user selects item from dropdown
  const handleItemSelect = async (value) => {
    setFormData({
      ...formData,
      itemId: value.id,
      item_Name: value.name,
    });

    if (value.name.trim() !== "") {
      try {
        const res = await getItemSpecificationName(value.name);
        setSpecifications(
          res.map((s) => ({
            Id: s.Id,
            Specification: s.Specification,
            Specification_Value: "",
          }))
        );
      } catch {
        setSpecifications([]);
      }
    } else {
      setSpecifications([]);
    }
  };

  const handleSpecValueChange = (index, value) => {
    setSpecifications((prev) =>
      prev.map((spec, i) =>
        i === index ? { ...spec, Specification_Value: value } : spec
      )
    );
  };

  // ✅ Save logic includes ItemId
  const handleSave = async () => {
    try {
      const payload = [
        {
          Id: selectedItem ? selectedItem.Id : 0,
          ItemId: formData.itemId,
          Item_Name: formData.item_Name,
          Gender: formData.gender,
          Quantity: formData.quantity,
          PropertyId: Number(propertyId),
          IsRequisition: formData.isRequisition,
          IsHandover: formData.isHandover,
          Is_Active: true,
          Details: specifications.map((s) => ({
            Id: s.Id || 0,
            Specification_Name: s.Specification,
            Specification_Value: s.Specification_Value || "",
            Is_Active: true,
          })),
        },
      ];

      const payloadu = {
        Id: selectedItem ? selectedItem.Id : 0,
        ItemId: formData.itemId,
        Item_Name: formData.item_Name,
        Gender: formData.gender,
        Quantity: formData.quantity,
        PropertyId: Number(propertyId),
        IsRequisition: formData.isRequisition,
        IsHandover: formData.isHandover,
        Is_Active: true,
        Details: specifications.map((s) => ({
          Id: s.Id || 0,
          Specification_Name: s.Specification,
          Specification_Value: s.Specification_Value || "",
          Is_Active: true,
        })),
      };

      if (selectedItem) {
        await updateItemAssigned(selectedItem.Id, payloadu);
        toast.current.show({ severity: "success", summary: "Record Updated" });
      } else {
        await createItemAssigned(payload);
        toast.current.show({ severity: "success", summary: "Record Added" });
      }

      setDialogVisible(false);
      fetchGrouped();
    } catch (err) {
      console.error(err);
      toast.current.show({
        severity: "error",
        summary: "Save Failed",
        detail: err.message,
      });
    }
  };

  // ✅ Edit Dialog
  const openEditDialog = (rowData) => {
    setSelectedItem(rowData);
    setFormData({
      itemId: rowData.ItemId || null,
      item_Name: rowData.Item_Name || "",
      gender: rowData.Gender || "",
      quantity: rowData.Quantity || 1,
      isRequisition: rowData.IsRequisition || false,
      isHandover: rowData.IsHandover || false,
    });
    setSpecifications(
      (rowData.Details || []).map((d) => ({
        Id: d.Id,
        Specification: d.Specification_Name,
        Specification_Value: d.Specification_Value,
      }))
    );
    setDialogVisible(true);
  };

  const openAddDialog = () => {
    setSelectedItem(null);
    setFormData({
      itemId: null,
      item_Name: "",
      gender: "",
      quantity: 1,
      isRequisition: false,
      isHandover: false,
    });
    setSpecifications([]);
    setDialogVisible(true);
  };

  const openDeleteDialog = (rowData) => {
    setSelectedItem(rowData);
    setDeleteDialogVisible(true);
  };

  const handleDelete = async () => {
    try {
      await deleteItemAssigned(selectedItem.Id);
      toast.current.show({ severity: "success", summary: "Record Deleted" });
      setDeleteDialogVisible(false);
      fetchGrouped();
    } catch {
      toast.current.show({ severity: "error", summary: "Delete Failed" });
    }
  };

  const header = (
    <div className="d-flex justify-content-between align-items-center p-2">
      <h3 className="m-0">Item Assigned</h3>
      <div className="d-flex gap-2 align-items-center">
        <span className="p-input-icon-left">
          <InputText
            value={globalFilterValue}
            onChange={(e) => setGlobalFilterValue(e.target.value)}
            placeholder="Search by item name..."
          />
        </span>
        <Button
          label="Add Item"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={openAddDialog}
        />
         <Button
          label="Export"
          icon="pi pi-refresh"
          className="p-button-info"
          onClick={openAddDialog}
        />
      </div>
    </div>
  );

  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <Toast ref={toast} />
            <div className="pr-6 pl-6">
              <DataTable
                value={grouped}
                header={header}
                paginator
                rows={10}
                filters={filters}
                globalFilterFields={["Item_Name", "Gender"]}
                emptyMessage="No grouped data found."
                dataKey="Item_Name"
              >
                <Column field="Item_Name" header="Item Name" sortable />
                <Column field="Gender" header="Gender" />
                <Column field="Quantity" header="Quantity" sortable />
                <Column
                  header="Actions"
                  body={(rowData) => (
                    <>
                      <Button
                        icon="pi pi-pencil"
                        className="p-button-rounded p-button-warning p-button-sm mr-2"
                        onClick={() => openEditDialog(rowData)}
                      />
                      <Button
                        icon="pi pi-trash"
                        className="p-button-rounded p-button-danger p-button-sm"
                        onClick={() => openDeleteDialog(rowData)}
                      />
                    </>
                  )}
                />
              </DataTable>
            </div>
          </div>
        </div>
      </section>

      {/* Add/Edit Dialog */}
      <Dialog
        header={selectedItem ? "Edit Item Assignment" : "Add New Item Assignment"}
        visible={dialogVisible}
        style={{ width: "60vw" }}
        onHide={() => setDialogVisible(false)}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setDialogVisible(false)}
              className="p-button-text"
            />
            <Button label="Save" icon="pi pi-check" onClick={handleSave} />
          </div>
        }
      >
        <div className="p-fluid">
          {/* ✅ Dropdown for item */}
          <div className="field">
            <label>Item</label>
            <Dropdown
              value={
                formData.itemId
                  ? { id: formData.itemId, name: formData.item_Name }
                  : null
              }
              options={itemOptions}
              onChange={(e) => handleItemSelect(e.value)}
              placeholder="Select an item"
              showClear
              filter
              className="w-full"
            />
          </div>

          <div className="field">
            <label>Gender</label>
            <select
              className="p-inputtext p-component"
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="field">
            <label>Quantity</label>
            <InputText
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: Number(e.target.value) })
              }
            />
          </div>

          <div className="field">
            <label className="block mb-2">Type</label>
            <div className="flex align-items-center gap-5">
              <div className="flex align-items-center">
                <RadioButton
                  inputId="requisition"
                  name="type"
                  value="Requisition"
                  checked={formData.isRequisition}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      isRequisition: true,
                      isHandover: false,
                    })
                  }
                />
                <label htmlFor="requisition" className="ml-2">
                  Requisition
                </label>
              </div>

              <div className="flex align-items-center">
                <RadioButton
                  inputId="handover"
                  name="type"
                  value="Handover"
                  checked={formData.isHandover}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      isHandover: true,
                      isRequisition: false,
                    })
                  }
                />
                <label htmlFor="handover" className="ml-2">
                  Handover
                </label>
              </div>
            </div>
          </div>

          {specifications.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2">Specifications</h4>
              <DataTable value={specifications} responsiveLayout="scroll">
                <Column field="Specification" header="Specification" />
                <Column
                  header="Value"
                  body={(rowData, { rowIndex }) => (
                    <InputText
                      value={rowData.Specification_Value || ""}
                      onChange={(e) =>
                        handleSpecValueChange(rowIndex, e.target.value)
                      }
                    />
                  )}
                />
              </DataTable>
            </div>
          )}
        </div>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        header="Confirm Delete"
        visible={deleteDialogVisible}
        style={{ width: "25vw" }}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setDeleteDialogVisible(false)}
              className="p-button-text"
            />
            <Button
              label="Delete"
              icon="pi pi-check"
              onClick={handleDelete}
              className="p-button-danger"
            />
          </div>
        }
        onHide={() => setDeleteDialogVisible(false)}
      >
        <p>Are you sure you want to delete this record?</p>
      </Dialog>
    </div>
  );
}
