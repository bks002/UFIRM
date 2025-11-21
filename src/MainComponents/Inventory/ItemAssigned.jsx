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
  const [searchTerm, setSearchTerm] = useState("");

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

  // ---------- date helpers ----------
  const safeDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDate = (value) => {
    const d = safeDate(value);
    if (!d) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime12 = (value) => {
    const d = safeDate(value);
    if (!d) return "";
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  };

  const renderColorBlock = (val) => {
    if (!val) return null;
    const clean = String(val).replace(/['"]/g, "");
    const style = {
      display: "inline-block",
      width: "14px",
      height: "14px",
      background: clean,
      border: "1px solid #aaa",
      marginLeft: "6px",
      verticalAlign: "middle",
    };
    return <span style={style} />;
  };

  const renderTypeBadge = (row) => {
    const isReq = !!row.IsRequisition;
    const isHand = !!row.IsHandover;

    if (isReq && !isHand) {
      return <span className="badge badge-success">Requisition</span>;
    }
    if (!isReq && isHand) {
      return <span className="badge badge-primary">Handover</span>;
    }
    if (isReq && isHand) {
      return <span className="badge badge-info">Both</span>;
    }
    return <span className="badge badge-secondary">-</span>;
  };

  // ---------- data fetch ----------
  useEffect(() => {
    fetchGrouped();
    fetchItemOptions();
  }, []);

  const fetchGrouped = async () => {
    try {
      const res = await getItemAssigned(propertyId);
      setGrouped(res || []);
    } catch (err) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load data",
        });
      }
    }
  };

  const fetchItemOptions = async () => {
    try {
      const res = await getAllItems(propertyId);
      const formatted = (res || []).map((i) => ({
        label: i.Name,
        value: { id: i.Id, name: i.Name },
      }));
      setItemOptions(formatted);
    } catch (err) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load item list",
        });
      }
    }
  };

  // ---------- form handlers ----------
  const handleItemSelect = async (value) => {
    setFormData((prev) => ({
      ...prev,
      itemId: value?.id ?? null,
      item_Name: value?.name ?? "",
    }));

    if (value && value.name && value.name.trim() !== "") {
      try {
        const res = await getItemSpecificationName(value.name);
        setSpecifications(
          (res || []).map((s) => ({
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

  const handleSave = async () => {
    try {
      const basePayload = {
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
        await updateItemAssigned(selectedItem.Id, basePayload);
        toast.current &&
          toast.current.show({
            severity: "success",
            summary: "Record Updated",
          });
      } else {
        const payload = [basePayload];
        await createItemAssigned(payload);
        toast.current &&
          toast.current.show({
            severity: "success",
            summary: "Record Added",
          });
      }

      setDialogVisible(false);
      fetchGrouped();
    } catch (err) {
      console.error(err);
      toast.current &&
        toast.current.show({
          severity: "error",
          summary: "Save Failed",
          detail: err.message,
        });
    }
  };

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
      toast.current &&
        toast.current.show({
          severity: "success",
          summary: "Record Deleted",
        });
      setDeleteDialogVisible(false);
      fetchGrouped();
    } catch {
      toast.current &&
        toast.current.show({
          severity: "error",
          summary: "Delete Failed",
        });
    }
  };

  // ---------- filtering ----------
  const filtered = grouped.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();

    const name = (row.Item_Name ?? "").toLowerCase();
    const gender = (row.Gender ?? "").toLowerCase();
    const qty = (row.Quantity ?? "").toString().toLowerCase();
    const typeText = row.IsRequisition
      ? "requisition"
      : row.IsHandover
      ? "handover"
      : "";

    const specsText = Array.isArray(row.Details)
      ? row.Details.map(
          (d) =>
            `${d.Specification_Name ?? ""}: ${
              d.Specification_Value ?? ""
            }`
        )
          .join(" ")
          .toLowerCase()
      : "";

    return (
      name.includes(term) ||
      gender.includes(term) ||
      qty.includes(term) ||
      typeText.includes(term) ||
      specsText.includes(term)
    );
  });
<style>
  {`
    table.table th, table.table td {
      padding: 6px 10px !important;
      white-space: nowrap;
    }
  `}
</style>

  return (
  <div
    className="container-fluid py-3"
    style={{ maxWidth: "95%", marginLeft: "auto", marginRight: "auto", paddingLeft: window.innerWidth > 992 ? "90px" : "0px",
    transition: "padding 0.2s ease" }}
  >
      <Toast ref={toast} />

      <div className="card shadow-sm mt-3">
        <div className="card-body d-flex flex-wrap align-items-center" style={{ paddingBottom: "10px" }}>

          <h5 className="mb-0">Item Assigned</h5>

          <div className="ml-auto d-flex align-items-center">
            <div
              className="input-group input-group-sm mr-3"
              style={{ maxWidth: 260 }}
            >
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="fa fa-search" />
                </span>
              </div>
              <InputText
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, type, specs..."
                className="form-control"
              />
            </div>

              <Button
                label="Add Item"
                icon="pi pi-plus"
                className="p-button-success"
                style={{ padding: "4px 10px", fontSize: "13px", width: "24", height: "24"}}
                onClick={openAddDialog}
              />

          </div>
        </div>

        <div className="card-body p-3">
          <div className="table-responsive">
<table
  className="table table-bordered table-striped table-hover mb-0 table-sm"
  style={{ fontSize: "14px" }}
>

              <thead className="thead-light">
                <tr>
                  <th style={{ width: "80px" }}>S. No</th>
                  <th>Item Name</th>
                  <th style={{ width: "120px" }}>Gender</th>
                  <th style={{ width: "100px" }}>Quantity</th>
                  <th style={{ minWidth: "220px" }}>Specifications</th>
                  <th style={{ width: "140px" }}>Type</th>
                  <th style={{ width: "130px" }}>Created Date</th>
                  <th style={{ width: "130px" }}>Created Time</th>
                  <th style={{ width: "130px" }}>Updated Date</th>
                  <th style={{ width: "130px" }}>Updated Time</th>
                  <th style={{ width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center text-muted">
                      No records found.
                    </td>
                  </tr>
                )}

                {filtered.map((row, index) => (
                  <tr key={row.Id ?? index}>
                    <td>{index + 1}</td>
                    <td>{row.Item_Name}</td>
                    <td>{row.Gender}</td>
                    <td>{row.Quantity}</td>
                    <td>
                      {(!Array.isArray(row.Details) ||
                        row.Details.length === 0) && (
                        <span className="text-muted">No Specifications</span>
                      )}

                      {Array.isArray(row.Details) &&
                        row.Details.map((d, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <span>
                              {d.Specification_Name}: {d.Specification_Value}
                            </span>
                            {String(d.Specification_Name)
                              .toLowerCase()
                              .includes("color") &&
                              renderColorBlock(d.Specification_Value)}
                          </div>
                        ))}
                    </td>
                    <td>{renderTypeBadge(row)}</td>
                    <td>{formatDate(row.Created_On)}</td>
                    <td>{formatTime12(row.Created_On)}</td>
                    <td>{formatDate(row.Updated_On)}</td>
                    <td>{formatTime12(row.Updated_On)}</td>
                    <td className="text-center">
                     <Button
                      icon="pi pi-pencil"
                      className="p-button-rounded p-button-warning p-button-sm mr-2"
                      style={{ width: "24px", height: "24px", padding: "0", fontSize: "0.65rem" }}
                      onClick={() => openEditDialog(row)}
                    />

                    <Button
                      icon="pi pi-trash"
                      className="p-button-rounded p-button-danger p-button-sm"
                      style={{ width: "24px", height: "24px", padding: "0", fontSize: "0.65rem" }}
                      onClick={() => openDeleteDialog(row)}
                    />


                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        header={
          selectedItem
            ? "Edit Item Assignment"
            : "Add New Item Assignment"
        }
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
          {/* Dropdown for item */}
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
                setFormData({
                  ...formData,
                  quantity: Number(e.target.value),
                })
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