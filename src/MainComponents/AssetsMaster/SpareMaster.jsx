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
import SpareService from "../../Services/SpareService";

const SparePage = () => {
    const toast = useRef(null);
    const propertyId = useSelector((state) => state.Commonreducer.puidn);

    const [spares, setSpares] = useState([]);
    const [assets, setAssets] = useState([]);

    const [dialogVisible, setDialogVisible] = useState(false);

    const [selectedRow, setSelectedRow] = useState(null);
    const [globalFilter, setGlobalFilter] = useState("");
    const [viewMode, setViewMode] = useState("panel");
    const [selectedSpareId, setSelectedSpareId] = useState(null);

    const [assetId, setAssetId] = useState("");

    // MULTIPLE SPARE ROWS
    const [spareRows, setSpareRows] = useState([
        getEmptySpareRow()
    ]);

    function getEmptySpareRow() {
        return {
            SpareType: "",
            Rating: "",
            BackupTime: "",
            Status: "",
            Quantity: 1,
            PurchaseDate: null,
            ExpiryDate: null,
            SerialNumber: "",
            VendorName: "",
            InvoiceNo: "",
            Warranty: "",
            Remarks: ""
        };
    }

    // Reset all
    const resetForm = () => {
        setAssetId("");
        setSpareRows([getEmptySpareRow()]);
    };

    // Load spares
    const loadSpares = async () => {
        try {
            const data = await SpareService.getByProperty(propertyId);
            setSpares(Array.isArray(data) ? data : []);
        } catch {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to load spares",
            });
        }
    };

    // Load assets
    const loadAssets = async () => {
        try {
            const res = await fetch(`https://api.urest.in:8096/GetAssets?propertyId=${propertyId}`);
            const data = await res.json();

            const combined = [
                ...(Array.isArray(data.PassedServiceDates) ? data.PassedServiceDates : []),
                ...(Array.isArray(data.UpcomingServiceDates) ? data.UpcomingServiceDates : [])
            ];

            setAssets(combined);
        } catch {
            setAssets([]);
        }
    };

    useEffect(() => {
        if (propertyId) {
            loadSpares();
            loadAssets();
        }
    }, [propertyId]);

    // Dropdown asset list
    const assetOptions = Array.isArray(assets)
        ? assets.map(a => ({
            label: a.Name || a.name,
            value: a.Id || a.id
        }))
        : [];

    // Add new spare row
    const addSpareRow = () => {
        setSpareRows([...spareRows, getEmptySpareRow()]);
    };

    // Remove spare row
    const removeSpareRow = (index) => {
        setSpareRows(spareRows.filter((_, i) => i !== index));
    };

    // Update a row field
    const updateRow = (index, field, value) => {
        const updated = [...spareRows];
        updated[index][field] = value;
        setSpareRows(updated);
    };

    // SAVE ALL SPARES FOR ONE ASSET
    const saveAllSpares = async () => {
        if (!assetId) {
            toast.current.show({
                severity: "warn",
                summary: "Validation",
                detail: "Please select an Asset",
            });
            return;
        }

        // Ensure mandatory fields are present
        for (const row of spareRows) {
            if (!row.SpareType || !row.SerialNumber) {
                toast.current.show({
                    severity: "warn",
                    summary: "Validation",
                    detail: "Spare Type & Serial Number required for all rows",
                });
                return;
            }
        }

        try {
            for (const row of spareRows) {
                const formData = new FormData();
                formData.append("PropertyID", propertyId);
                formData.append("AssetID", assetId);
                formData.append("SpareType", row.SpareType);
                formData.append("Rating", row.Rating);
                formData.append("BackupTime", row.BackupTime);
                formData.append("Status", row.Status);
                formData.append("Quantity", row.Quantity);
                formData.append("PurchaseDate", row.PurchaseDate?.toISOString() || "");
                formData.append("ExpiryDate", row.ExpiryDate?.toISOString() || "");
                formData.append("SerialNumber", row.SerialNumber);
                formData.append("VendorName", row.VendorName);
                formData.append("InvoiceNo", row.InvoiceNo);
                formData.append("Warranty", row.Warranty);
                formData.append("Remarks", row.Remarks);
                formData.append("Reusable", 0);

                await SpareService.create(formData);
            }

            toast.current.show({
                severity: "success",
                summary: "Saved",
                detail: "All spares saved successfully",
            });

            setDialogVisible(false);
            resetForm();
            loadSpares();

        } catch (err) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to save spares",
            });
        }
    };

    const deleteSpare = async (row) => {
        try {
            await SpareService.delete(row.SpareID);

            toast.current.show({
                severity: "success",
                summary: "Deleted",
                detail: "Spare deleted",
            });

            loadSpares();
        } catch {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to delete spare",
            });
        }
    };

    const header = (
        <div className="d-flex justify-content-between align-items-center p-2">
            <h5 className="m-0">Spare Master</h5>

            <div className="d-flex gap-2">
                <div className="spot-visit-view-toggle">
                    <button type="button" className={viewMode === "panel" ? "active" : ""} onClick={() => setViewMode("panel")}>
                        Panel View
                    </button>
                    <button type="button" className={viewMode === "table" ? "active" : ""} onClick={() => setViewMode("table")}>
                        Table View
                    </button>
                </div>
                <InputText
                    placeholder="Search..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                />

                {selectedRow && (
                    <Button
                        icon="pi pi-trash"
                        className="p-button-danger"
                        onClick={() => deleteSpare(selectedRow)}
                    />
                )}

                <Button
                    label="Add Spare"
                    icon="pi pi-plus"
                    onClick={() => {
                        resetForm();
                        setDialogVisible(true);
                    }}
                />
            </div>
        </div>
    );

    const filteredSpares = (spares || []).filter((s) => {
        if (!globalFilter) return true;
        const text = `${s.SpareType || ""} ${s.SerialNumber || ""} ${s.VendorName || ""}`.toLowerCase();
        return text.includes(globalFilter.toLowerCase());
    });

    const activeSpare = filteredSpares.find((s) => s.SpareID === selectedSpareId) || filteredSpares[0] || null;

    return (
        <div className="content-wrapper p-3">
            <Toast ref={toast} />
            <style>{`
                .spot-visit-view-toggle { display:inline-flex; border:1px solid #d4e3ed; border-radius:8px; overflow:hidden; background:#fff; }
                .spot-visit-view-toggle button { border:none; background:transparent; padding:7px 12px; font-size:12px; font-weight:600; color:#4A7FA8; }
                .spot-visit-view-toggle button.active { background:#e8f1f8; color:#1E4A6B; }
                .spare-panel-shell { display:grid; grid-template-columns:340px minmax(0,1fr); border:1px solid #d8e6f0; border-radius:10px; overflow:hidden; min-height:520px; }
                .spare-panel-list { border-right:1px solid #d8e6f0; max-height:520px; overflow-y:auto; padding:10px; background:#fff; }
                .spare-panel-item { width:100%; text-align:left; border:1px solid #e6eff6; border-radius:8px; background:#fff; padding:10px; margin-bottom:8px; cursor:pointer; }
                .spare-panel-item.active { border-color:#2f9cff; background:#f5faff; box-shadow: inset 2px 0 0 #2f9cff; }
                .spare-panel-detail { max-height:520px; overflow-y:auto; padding:16px; background:#fff; }
                .spare-label { font-size:11px; color:#7a8ea0; text-transform:uppercase; font-weight:700; margin-bottom:4px; }
                .spare-value { font-size:13px; color:#22384c; font-weight:600; word-break:break-word; }
                .spare-grid { margin-top:10px; display:grid; grid-template-columns:repeat(2, minmax(170px,1fr)); gap:14px; }
                .spare-dialog .p-dialog-header { background:#f8fbff; border-bottom:1px solid #d8e6f0; }
                .spare-dialog .p-dialog-title { color:#1E4A6B; font-weight:700; }
                @media (max-width:1024px){ .spare-panel-shell { grid-template-columns:1fr; } .spare-panel-list { border-right:none; border-bottom:1px solid #d8e6f0; max-height:240px; } }
            `}</style>

            {/* TABLE */}
            {viewMode === "table" && <DataTable
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
            </DataTable>}

            {viewMode === "panel" && (
                <div className="spare-panel-shell">
                    <div className="spare-panel-list">
                        <div style={{ fontSize: 12, color: "#6d7f8d", fontWeight: 600, marginBottom: 8 }}>
                            Spares ({filteredSpares.length})
                        </div>
                        {filteredSpares.map((s) => (
                            <button
                                key={s.SpareID}
                                type="button"
                                className={`spare-panel-item ${activeSpare && activeSpare.SpareID === s.SpareID ? "active" : ""}`}
                                onClick={() => setSelectedSpareId(s.SpareID)}
                            >
                                <div style={{ fontWeight: 700, color: "#22384c", fontSize: 13 }}>{s.SpareType || "-"}</div>
                                <div style={{ fontSize: 12, color: "#6d7f8d" }}>{s.SerialNumber || "-"}</div>
                            </button>
                        ))}
                    </div>
                    <div className="spare-panel-detail">
                        {!activeSpare && <div className="text-muted">No spare records found.</div>}
                        {activeSpare && (
                            <>
                                <h3 style={{ margin: 0, color: "#22384c", fontWeight: 700 }}>{activeSpare.SpareType || "-"}</h3>
                                <div className="spare-grid">
                                    <div><div className="spare-label">Spare ID</div><div className="spare-value">{activeSpare.SpareID || "-"}</div></div>
                                    <div><div className="spare-label">Asset ID</div><div className="spare-value">{activeSpare.AssetID || "-"}</div></div>
                                    <div><div className="spare-label">Serial Number</div><div className="spare-value">{activeSpare.SerialNumber || "-"}</div></div>
                                    <div><div className="spare-label">Vendor</div><div className="spare-value">{activeSpare.VendorName || "-"}</div></div>
                                    <div><div className="spare-label">Rating</div><div className="spare-value">{activeSpare.Rating || "-"}</div></div>
                                    <div><div className="spare-label">Quantity</div><div className="spare-value">{activeSpare.Quantity || "-"}</div></div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ADD MULTIPLE SPARES DIALOG */}
            <Dialog
                header="Add Multiple Spares"
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                style={{ width: "650px" }}
                className="spare-dialog"
                footer={
                    <div className="d-flex justify-content-end gap-2">
                        <Button label="Cancel" className="p-button-text" onClick={() => setDialogVisible(false)} />
                        <Button label="Save All" icon="pi pi-check" onClick={saveAllSpares} />
                    </div>
                }
            >
                <div className="p-fluid">

                    {/* ASSET DROPDOWN */}
                    <label>Asset *</label>
                    <Dropdown
                        value={assetId}
                        options={assetOptions}
                        onChange={(e) => setAssetId(e.value)}
                        placeholder="Select Asset"
                        className="mb-3"
                    />

                    {/* MULTIPLE SPARE ROWS */}
                    {spareRows.map((row, index) => (
                        <div key={index} className="border rounded p-3 mb-3 bg-light">

                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="m-0">Spare #{index + 1}</h6>
                                {spareRows.length > 1 && (
                                    <Button
                                        icon="pi pi-trash"
                                        className="p-button-danger p-button-sm"
                                        onClick={() => removeSpareRow(index)}
                                    />
                                )}
                            </div>

                            <label>Spare Type *</label>
                            <InputText value={row.SpareType} onChange={(e) => updateRow(index, "SpareType", e.target.value)} className="mb-2" />

                            <label>Serial Number *</label>
                            <InputText value={row.SerialNumber} onChange={(e) => updateRow(index, "SerialNumber", e.target.value)} className="mb-2" />

                            <label>Rating</label>
                            <InputText value={row.Rating} onChange={(e) => updateRow(index, "Rating", e.target.value)} className="mb-2" />

                            <label>Backup Time</label>
                            <InputText value={row.BackupTime} onChange={(e) => updateRow(index, "BackupTime", e.target.value)} className="mb-2" />

                            <label>Status</label>
                            <InputText value={row.Status} onChange={(e) => updateRow(index, "Status", e.target.value)} className="mb-2" />

                            <label>Quantity</label>
                            <InputText type="number" value={row.Quantity} onChange={(e) => updateRow(index, "Quantity", e.target.value)} className="mb-2" />

                            <label>Purchase Date</label>
                            <Calendar value={row.PurchaseDate} onChange={(e) => updateRow(index, "PurchaseDate", e.value)} className="mb-2" showIcon />

                            <label>Expiry Date</label>
                            <Calendar value={row.ExpiryDate} onChange={(e) => updateRow(index, "ExpiryDate", e.value)} className="mb-2" showIcon />

                            <label>Vendor</label>
                            <InputText value={row.VendorName} onChange={(e) => updateRow(index, "VendorName", e.target.value)} className="mb-2" />

                            <label>Invoice No</label>
                            <InputText value={row.InvoiceNo} onChange={(e) => updateRow(index, "InvoiceNo", e.target.value)} className="mb-2" />

                            <label>Warranty</label>
                            <InputText value={row.Warranty} onChange={(e) => updateRow(index, "Warranty", e.target.value)} className="mb-2" />

                            <label>Remarks</label>
                            <InputText value={row.Remarks} onChange={(e) => updateRow(index, "Remarks", e.target.value)} className="mb-2" />

                        </div>
                    ))}

                    <Button
                        label="Add Another Spare"
                        icon="pi pi-plus"
                        className="p-button-text p-button-success mt-1"
                        onClick={addSpareRow}
                    />
                </div>
            </Dialog>
        </div>
    );
};

export default SparePage;
