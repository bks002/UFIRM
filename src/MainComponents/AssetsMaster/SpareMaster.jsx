"use client";

import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";
import SpareService from "../../Services/SpareService"; // create this file

const SparePage = () => {
  const toast = useRef(null);
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  const [spares, setSpares] = useState([]);
  const [assets, setAssets] = useState([]);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [selectedRow, setSelectedRow] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");

  // Form states
  const [spareId, setSpareId] = useState(null);
  const [assetId, setAssetId] = useState("");
  const [spareType, setSpareType] = useState("");
  const [rating, setRating] = useState("");
  const [backupTime, setBackupTime] = useState("");
  const [status, setStatus] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [purchaseDate, setPurchaseDate] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [serialNumber, setSerialNumber] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [warranty, setWarranty] = useState("");

  const resetForm = () => {
    setSpareId(null);
    setAssetId("");
    setSpareType("");
    setRating("");
    setBackupTime("");
    setStatus("");
    setQuantity(1);
    setPurchaseDate(null);
    setExpiryDate(null);
    setSerialNumber("");
    setVendorName("");
    setInvoiceNo("");
    setRemarks("");
    setWarranty("");
    setEditMode(false);
  };

  // Load spares
  const loadSpares = async () => {
    try {
      const data = await SpareService.getByProperty(propertyId);
      setSpares(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load spares",
      });
    }
  };

  // Load assets for dropdown
  const loadAssets = async () => {
  try {
    const res = await fetch(`https://api.urest.in:8096/GetAssets?propertyId=${propertyId}`);
    const data = await res.json();

    console.log("API RESPONSE:", data);

    // Normalize into a single array for dropdown/list
    const combined = [
      ...(Array.isArray(data.PassedServiceDates) ? data.PassedServiceDates : []),
      ...(Array.isArray(data.UpcomingServiceDates) ? data.UpcomingServiceDates : [])
    ];

    setAssets(combined);
  } catch (err) {
    console.error(err);
    setAssets([]);
  }
};


  useEffect(() => {
    if (propertyId) {
      loadSpares();
      loadAssets();
    }
  }, [propertyId]);

  const openNew = () => {
    resetForm();
    setDialogVisible(true);
  };

  const openEdit = (row) => {
    setEditMode(true);

    setSpareId(row.SpareID);
    setAssetId(row.AssetID);
    setSpareType(row.SpareType);
    setRating(row.Rating);
    setBackupTime(row.BackupTime);
    setStatus(row.Status);
    setQuantity(row.Quantity);
    setPurchaseDate(row.PurchaseDate ? new Date(row.PurchaseDate) : null);
    setExpiryDate(row.ExpiryDate ? new Date(row.ExpiryDate) : null);
    setSerialNumber(row.SerialNumber);
    setVendorName(row.VendorName);
    setInvoiceNo(row.InvoiceNo);
    setRemarks(row.Remarks);
    setWarranty(row.Warranty);

    setDialogVisible(true);
  };

  const saveSpare = async () => {
    if (!assetId || !spareType || !serialNumber) {
      toast.current.show({
        severity: "warn",
        summary: "Validation",
        detail: "Asset, Spare Type and Serial Number are required",
      });
      return;
    }

    const formData = new FormData();
    formData.append("PropertyID", propertyId);
    formData.append("AssetID", assetId);
    formData.append("SpareType", spareType);
    formData.append("Rating", rating);
    formData.append("BackupTime", backupTime);
    formData.append("Status", status);
    formData.append("Quantity", quantity);
    formData.append("PurchaseDate", purchaseDate?.toISOString() || "");
    formData.append("ExpiryDate", expiryDate?.toISOString() || "");
    formData.append("SerialNumber", serialNumber);
    formData.append("VendorName", vendorName);
    formData.append("InvoiceNo", invoiceNo);
    formData.append("Warranty", warranty);
    formData.append("Remarks", remarks);
    formData.append("Reusable", 0);

    try {
      if (editMode) {
        formData.append("SpareID", spareId);
        await SpareService.update(formData);
        toast.current.show({
          severity: "success",
          summary: "Updated",
          detail: "Spare updated successfully",
        });
      } else {
        await SpareService.create(formData);
        toast.current.show({
          severity: "success",
          summary: "Added",
          detail: "Spare added successfully",
        });
      }

      setDialogVisible(false);
      resetForm();
      loadSpares();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save spare",
      });
    }
  };

  const deleteSpare = async (row) => {
    if (!row) return;
    try {
      await SpareService.delete(row.SpareID);
      toast.current.show({
        severity: "success",
        summary: "Deleted",
        detail: "Spare deleted successfully",
      });
      loadSpares();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete spare",
      });
    }
  };
const assetOptions = Array.isArray(assets)
  ? assets.map(a => ({
      label: a.Name || a.name,
      value: a.Id || a.id
    }))
  : [];


  const header = (
    <div className="d-flex justify-content-between align-items-center p-2">
      <h5 className="m-0">Spare Master</h5>

      <div className="d-flex gap-2">
        <InputText
          placeholder="Search..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />

        {selectedRow && (
          <>
            <Button icon="pi pi-pencil" className="p-button-info" onClick={() => openEdit(selectedRow)} />
            <Button icon="pi pi-trash" className="p-button-danger" onClick={() => deleteSpare(selectedRow)} />
          </>
        )}

        <Button label="Add Spare" icon="pi pi-plus" onClick={openNew} />
      </div>
    </div>
  );

  const dialogFooter = (
    <div>
      <Button label="Cancel" className="p-button-text" onClick={() => setDialogVisible(false)} />
      <Button label={editMode ? "Update" : "Save"} icon="pi pi-check" onClick={saveSpare} />
    </div>
  );

  return (
    <div className="content-wrapper p-3">
      <Toast ref={toast} />

      <DataTable
        value={spares}
        paginator
        rows={10}
        header={header}
        selection={selectedRow}
        onSelectionChange={(e) => setSelectedRow(e.value)}
        globalFilter={globalFilter}
        globalFilterFields={["SpareType", "SerialNumber", "VendorName"]}
        dataKey="SpareID"
      >
        <Column selectionMode="single" headerStyle={{ width: "3em" }} />
        <Column field="SpareType" header="Spare Type" />
        <Column field="AssetID" header="Asset ID" />
        <Column field="SerialNumber" header="Serial Number" />
        <Column field="Rating" header="Rating" />
        <Column field="VendorName" header="Vendor" />
        <Column field="PurchaseDate" header="Purchase Date" body={(row) => row.PurchaseDate?.slice(0, 10)} />
        <Column field="ExpiryDate" header="Expiry Date" body={(row) => row.ExpiryDate?.slice(0, 10)} />
      </DataTable>

      <Dialog
        header={editMode ? "Edit Spare" : "Add Spare"}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        footer={dialogFooter}
        style={{ width: "600px" }}
      >
        <div className="p-fluid">
          <label>Asset *</label>
          <Dropdown
  value={assetId}
  options={assetOptions}
  onChange={(e) => setAssetId(e.value)}
  placeholder="Select Asset"
  className="mb-3"
/>

          <label>Spare Type *</label>
          <InputText value={spareType} onChange={(e) => setSpareType(e.target.value)} className="mb-3" />

          <label>Rating</label>
          <InputText value={rating} onChange={(e) => setRating(e.target.value)} className="mb-3" />

          <label>Backup Time</label>
          <InputText value={backupTime} onChange={(e) => setBackupTime(e.target.value)} className="mb-3" />

          <label>Status</label>
          <InputText value={status} onChange={(e) => setStatus(e.target.value)} className="mb-3" />

          <label>Quantity</label>
          <InputText
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mb-3"
          />

          <label>Purchase Date</label>
          <Calendar value={purchaseDate} onChange={(e) => setPurchaseDate(e.value)} className="mb-3" showIcon />

          <label>Expiry Date</label>
          <Calendar value={expiryDate} onChange={(e) => setExpiryDate(e.value)} className="mb-3" showIcon />

          <label>Serial Number *</label>
          <InputText value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="mb-3" />

          <label>Vendor</label>
          <InputText value={vendorName} onChange={(e) => setVendorName(e.target.value)} className="mb-3" />

          <label>Invoice No</label>
          <InputText value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} className="mb-3" />

          <label>Warranty</label>
          <InputText value={warranty} onChange={(e) => setWarranty(e.target.value)} className="mb-3" />

          <label>Remarks</label>
          <InputText value={remarks} onChange={(e) => setRemarks(e.target.value)} className="mb-3" />
        </div>
      </Dialog>
    </div>
  );
};

export default SparePage;
