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
    const [selectedSpares, setSelectedSpares] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [viewMode, setViewMode] = useState("table");
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

    const deleteSelectedSpares = async () => {
        if (selectedSpares.length === 0) return;
        try {
            for (const spare of selectedSpares) {
                await SpareService.delete(spare.SpareID);
            }
            toast.current.show({
                severity: "success",
                summary: "Deleted",
                detail: `${selectedSpares.length} spare(s) deleted`,
            });
            setSelectedSpares([]);
            loadSpares();
        } catch {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to delete spares",
            });
        }
    };

    const header = null;

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
                .spare-breadcrumb { display:flex; align-items:center; gap:6px; font-size:14px; color:#4A7FA8; margin-bottom:12px; }
                .spare-breadcrumb .breadcrumb-link { cursor:pointer; }
                .spare-breadcrumb .breadcrumb-link:hover { color:#1E4A6B; text-decoration:underline; }
                .spare-breadcrumb .breadcrumb-current { color:#1E4A6B; font-weight:600; }
                .spare-page-title { font-size:24px; font-weight:700; color:#1E4A6B; margin:0 0 16px 0; }
                .spare-view-header { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:16px; }
                .spare-view-toggle { display:inline-flex; border:1px solid #d4e3ed; border-radius:10px; overflow:hidden; background:#e8eff5; padding:4px; gap:4px; }
                .spare-view-toggle button { border:none; background:transparent; padding:8px 16px; font-size:13px; font-weight:600; color:#4A7FA8; border-radius:7px; transition:all 0.25s ease; display:flex; align-items:center; gap:6px; }
                .spare-view-toggle button:hover { background:rgba(51,107,147,0.12); color:#1E4A6B; }
                .spare-view-toggle button.active { background:#336B93; color:#fff; box-shadow:0 2px 6px rgba(51,107,147,0.25); }
                .spare-search-box { position:relative; }
                .spare-search-box input { padding:10px 14px 10px 40px; border:1px solid #d4e3ed; border-radius:10px; font-size:14px; width:260px; background:#fff; transition:all 0.25s ease; }
                .spare-search-box input:focus { outline:none; border-color:#336B93; box-shadow:0 0 0 3px rgba(51,107,147,0.15); }
                .spare-search-box .search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#7a8ea0; }
                .spare-add-btn { display:flex; align-items:center; gap:8px; padding:10px 18px; border:none; border-radius:10px; background:#2E7D4A; color:#fff; font-weight:600; font-size:13px; cursor:pointer; transition:all 0.25s ease; box-shadow:0 2px 6px rgba(46,125,74,0.25); }
                .spare-add-btn:hover { background:#256b3e; box-shadow:0 4px 12px rgba(46,125,74,0.35); transform:translateY(-1px); }
                .spare-delete-selected-btn { display:flex; align-items:center; gap:8px; padding:10px 18px; border:none; border-radius:10px; background:#A83232; color:#fff; font-weight:600; font-size:13px; cursor:pointer; transition:all 0.25s ease; }
                .spare-delete-selected-btn:hover { background:#8b2828; }
                .spare-delete-selected-btn:disabled { background:#ccc; cursor:not-allowed; }
                .spare-panel-shell { display:grid; grid-template-columns:340px minmax(0,1fr); border:1px solid #d8e6f0; border-radius:12px; overflow:hidden; min-height:520px; box-shadow:0 2px 8px rgba(51,107,147,0.12); }
                .spare-panel-list { border-right:1px solid #d8e6f0; max-height:520px; overflow-y:auto; padding:12px; background:#fff; }
                .spare-panel-item { width:100%; text-align:left; border:1px solid #e6eff6; border-radius:10px; background:#fff; padding:12px; margin-bottom:10px; cursor:pointer; transition:all 0.2s ease; }
                .spare-panel-item:hover { border-color:#4A7FA8; background:#f8fbff; }
                .spare-panel-item.active { border-color:#336B93; background:#f0f7ff; box-shadow:inset 3px 0 0 #336B93; }
                .spare-panel-create { width:100%; border:2px dashed #336B93; border-radius:10px; padding:14px; margin-bottom:12px; background:#f3f9ff; color:#1E4A6B; font-weight:700; cursor:pointer; transition:all 0.2s ease; display:flex; align-items:center; justify-content:center; gap:8px; }
                .spare-panel-create:hover { background:#e8f1f8; border-color:#1E4A6B; }
                .spare-panel-detail { max-height:520px; overflow-y:auto; padding:20px; background:#fff; }
                .spare-label { font-size:11px; color:#7a8ea0; text-transform:uppercase; font-weight:700; margin-bottom:4px; letter-spacing:0.5px; }
                .spare-value { font-size:14px; color:#22384c; font-weight:600; word-break:break-word; }
                .spare-grid { margin-top:16px; display:grid; grid-template-columns:repeat(2, minmax(170px,1fr)); gap:16px; }
                .spare-detail-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 14px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s ease; border:none; }
                .spare-edit-btn { background:#336B93; color:#fff; }
                .spare-edit-btn:hover { background:#1E4A6B; }
                .spare-delete-btn { background:#fff; color:#A83232; border:1px solid #A83232; }
                .spare-delete-btn:hover { background:#fef2f2; }
                .spare-dialog .p-dialog-header { background:#f8fbff; border-bottom:1px solid #d8e6f0; }
                .spare-dialog .p-dialog-title { color:#1E4A6B; font-weight:700; }
                .spare-table-card { border-radius:12px; border:1px solid #d8e6f0; box-shadow:0 2px 8px rgba(51,107,147,0.12); overflow:hidden; }
                @media (max-width:1024px){ .spare-panel-shell { grid-template-columns:1fr; } .spare-panel-list { border-right:none; border-bottom:1px solid #d8e6f0; max-height:240px; } }
            `}</style>

            {/* Breadcrumb */}
            <div className="spare-breadcrumb">
                <span className="breadcrumb-link">Assets</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>
                <span className="breadcrumb-current">Spare Master</span>
            </div>

            {/* Page Title */}
            <h1 className="spare-page-title">Spare Master</h1>

            {/* View Header */}
            <div className="spare-view-header">
                <div className="spare-view-toggle">
                    <button type="button" className={viewMode === "panel" ? "active" : ""} onClick={() => setViewMode("panel")}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="12" y="3" width="9" height="18" rx="1"/></svg>
                        Panel View
                    </button>
                    <button type="button" className={viewMode === "table" ? "active" : ""} onClick={() => setViewMode("table")}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
                        Table View
                    </button>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="spare-search-box">
                        <span className="search-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search spares..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                        />
                    </div>
                    {selectedSpares.length > 0 && (
                        <button type="button" className="spare-delete-selected-btn" onClick={deleteSelectedSpares}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            Delete ({selectedSpares.length})
                        </button>
                    )}
                    <button type="button" className="spare-add-btn" onClick={() => { resetForm(); setDialogVisible(true); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add Spare
                    </button>
                </div>
            </div>

            {/* TABLE */}
            {viewMode === "table" && (
                <div className="spare-table-card">
                    <DataTable
                        value={filteredSpares}
                        paginator
                        rows={10}
                        selection={selectedSpares}
                        onSelectionChange={(e) => setSelectedSpares(e.value)}
                        globalFilter={globalFilter}
                        globalFilterFields={["SpareType", "SerialNumber", "VendorName"]}
                        dataKey="SpareID"
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: "3em" }} />
                        <Column field="SpareType" header="Spare Type" sortable />
                        <Column field="AssetID" header="Asset ID" sortable />
                        <Column field="SerialNumber" header="Serial Number" sortable />
                        <Column field="Rating" header="Rating" sortable />
                        <Column field="VendorName" header="Vendor" sortable />
                        <Column field="PurchaseDate" header="Purchase Date" body={(row) => row.PurchaseDate?.slice(0, 10)} sortable />
                        <Column field="ExpiryDate" header="Expiry Date" body={(row) => row.ExpiryDate?.slice(0, 10)} sortable />
                        <Column header="Actions" body={(row) => (
                            <button type="button" className="spare-delete-btn" onClick={() => deleteSpare(row)} style={{padding:'6px 12px'}}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        )} />
                    </DataTable>
                </div>
            )}

            {viewMode === "panel" && (
                <div className="spare-panel-shell">
                    <div className="spare-panel-list">
                        <button type="button" className="spare-panel-create" onClick={() => { resetForm(); setDialogVisible(true); }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Add New Spare
                        </button>
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
                                <div style={{ fontWeight: 700, color: "#22384c", fontSize: 14 }}>{s.SpareType || "-"}</div>
                                <div style={{ fontSize: 12, color: "#6d7f8d" }}>SN: {s.SerialNumber || "-"} • Asset: #{s.AssetID || "-"}</div>
                            </button>
                        ))}
                    </div>
                    <div className="spare-panel-detail">
                        {!activeSpare && <div className="text-muted">No spare records found. Select a spare from the list.</div>}
                        {activeSpare && (
                            <>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12}}>
                                    <h3 style={{ margin: 0, color: "#1E4A6B", fontWeight: 700, fontSize:20 }}>{activeSpare.SpareType || "-"}</h3>
                                    <button type="button" className="spare-detail-btn spare-delete-btn" onClick={() => deleteSpare(activeSpare)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                        Delete
                                    </button>
                                </div>
                                <p style={{color:'#7a8ea0', fontSize:13, marginBottom:16}}>Spare ID: #{activeSpare.SpareID}</p>
                                <div className="spare-grid">
                                    <div><div className="spare-label">Spare Type</div><div className="spare-value">{activeSpare.SpareType || "-"}</div></div>
                                    <div><div className="spare-label">Asset ID</div><div className="spare-value">{activeSpare.AssetID || "-"}</div></div>
                                    <div><div className="spare-label">Serial Number</div><div className="spare-value">{activeSpare.SerialNumber || "-"}</div></div>
                                    <div><div className="spare-label">Rating</div><div className="spare-value">{activeSpare.Rating || "-"}</div></div>
                                    <div><div className="spare-label">Vendor</div><div className="spare-value">{activeSpare.VendorName || "-"}</div></div>
                                    <div><div className="spare-label">Purchase Date</div><div className="spare-value">{activeSpare.PurchaseDate?.slice(0, 10) || "-"}</div></div>
                                    <div><div className="spare-label">Expiry Date</div><div className="spare-value">{activeSpare.ExpiryDate?.slice(0, 10) || "-"}</div></div>
                                    <div><div className="spare-label">Quantity</div><div className="spare-value">{activeSpare.Quantity || "-"}</div></div>
                                    <div><div className="spare-label">Status</div><div className="spare-value">{activeSpare.Status || "-"}</div></div>
                                    <div><div className="spare-label">Warranty</div><div className="spare-value">{activeSpare.Warranty || "-"}</div></div>
                                </div>
                                {activeSpare.Remarks && (
                                    <div style={{marginTop:20}}>
                                        <div className="spare-label">Remarks</div>
                                        <div className="spare-value">{activeSpare.Remarks}</div>
                                    </div>
                                )}
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
