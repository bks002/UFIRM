import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { getPurchaseOrder } from "../../Services/InventoryService";
import { useSelector } from "react-redux";
import PurchaseOrderPage from './PurchaseOrderPage';
import ExportToCSV from '../../ReactComponents/ExportToCSV/ExportToCSV';
import { InputText } from 'primereact/inputtext';
import PreviewPurchaseOrder from './PreviewPurchaseOrder';

const PurchaseOrderMaster = () => {
    const [loading, setLoading] = useState(false);
    const propertyId = useSelector((state) => state.Commonreducer.puidn);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [selectedRow, setSelectedRow] = useState([]);
    const emptyallGridData = {
        POId: "XXXXX",
        Dates: "N/A",
        VendorId: 0,
        VendorName: "N/A",
        PropertyId: propertyId,
        CreatedBy: 0,
        Items: [{
            ItemId: 0,
            ItemName: "N/A",
            Price: 0,
            Quantity: 0,
            Description: "N/A",
            BrandName: "N/A",
            MeasurementUnit: "N/A",
            HSNCode: 0,
            IsCompleted: null,
            IsRejected: null,
            RejectionRemarks: null,
        },],
        BillingAddress: "N/A",
        ShippingAddress: "N/A",
    };
    const [filteredGridData, setFilteredGridData] = useState([emptyallGridData]);
    const [displayDialog, setDisplayDialog] = useState(false);
    const [preview, setpreview] = useState(false);
    const [viewMode, setViewMode] = useState("panel");
    const [selectedPanelPoId, setSelectedPanelPoId] = useState(null);
    const [panelTab, setPanelTab] = useState("details");
    const toast = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            if (propertyId) {
                const data = await getPurchaseOrder(propertyId);
                setFilteredGridData(data);
            }
            else {
                setFilteredGridData([]);
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: `Please select a property`,
                    life: 3000,
                })
            }
        };
        fetchData();
    }, [propertyId]);

    useEffect(() => {
        if (!filteredGridData.length) {
            setSelectedPanelPoId(null);
            return;
        }
        if (!filteredGridData.some((po) => po.PurchaseOrderId === selectedPanelPoId)) {
            setSelectedPanelPoId(filteredGridData[0].PurchaseOrderId);
        }
    }, [filteredGridData, selectedPanelPoId]);

    const openDialog = () => {
        setDisplayDialog(true);
    };

    const onHideDialog = () => {
        setDisplayDialog(false);
        setpreview(false);
    };

    const onGlobalFilterChange = (e) => {
        setGlobalFilterValue(e.target.value);
    };

    const handleRemoveVendor = () => {
    };

    const printRow = (rowData) => {
        const content = `
        <html>
            <head>
                <title>Print Purchase Order</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                    th, td { border: 1px solid #000; padding: 8px; }
                    h4 { text-align: center; margin-top: 30px; }
                </style>
            </head>
            <body>
                <p>${rowData.PONumber}</p>
                <div style="display: flex; justify-content: space-between;">
                    <p>To,</p>
                    <p>Date: ${rowData.PODateTime}</p>
                </div>
                <p><b>${rowData.VendorName}</b></p>
                <p style="margin-top: 30px;"><b>Subject: Order</b></p>
                <p style="margin-top: 30px;">Dear Sir,</p>
                <p>With reference to your quotation, we are pleased to place an order as per the following:</p>

                <table>
                    <thead>
                        <tr>
                            <th>S/N</th>
                            <th>Material</th>
                            <th>Description</th>
                            <th>Unit</th>
                            <th>HSN Code</th>
                            <th>Quantity</th>
                            <th>Rate</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowData.Items.map((item, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${item.ItemName}</td>
                                <td>${item.Description || 'N/A'}</td>
                                <td>${item.MeasurementUnit || 'Unit'}</td>
                                <td>${item.HSNCode || 'N/A'}</td>
                                <td>${item.Quantity}</td>
                                <td>${item.Rate}</td>
                                <td>${item.LineTotal}</td>
                            </tr>`).join('')
            }
                    </tbody>
                </table>

                <p style="margin-top: 30px;"><b>Our Co's GSTin No is 09AAACO5127B1ZU</b></p>
                <p><b>Billing Address:</b> ${rowData.BillingAddress}</p>
                <p><b>Shipping Address:</b> ${rowData.ShippingAddress}</p>

                <h4><b>Terms & Conditions</b></h4>
                <table>
                    <tbody>
                        <tr><td>1) Applicable Taxes shall be extra and as applicable</td></tr>
                        <tr><td>2) Validity: 30 Days</td></tr>
                        <tr><td>3) Payment Terms: 30% advance with order, 50% on delivery & balance after installation and handing over</td></tr>
                        <tr><td>4) All civil and electrical work will be in the scope of client</td></tr>
                        <tr><td>5) Above wire & conduit qty is tentative, may vary and will be charged on actual</td></tr>
                    </tbody>
                </table>
                <p style="margin-top: 30px;">Thanking you</p>
                <p>For <b>OMKAR NESTS PRIVATE LIMITED</b></p>
            </body>
        </html>
    `;

        const printWindow = window.open("", "_blank");
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    };

    const actionBodyTemplate = (rowData) => {
        const Item = rowData.Items;
        const hasIncompleteItems = Array.isArray(Item) && Item.some(item => item.IsCompleted === false);
        if (hasIncompleteItems === true) {
            return (
            <>
                <Button
                    icon={<i className="fa fa-eye" aria-hidden="true"></i>}
                    className="p-button-rounded rounded p-button-info mr-2"
                    onClick={() => {
                        setSelectedRow(rowData);
                        setpreview(true);
                    }}
                />
                <Button
                    icon={<i className="fa fa-print" aria-hidden="true"></i>}
                    className="p-button-rounded rounded p-button-info"
                    style={{ backgroundColor: 'green', borderColor: 'green', color: 'white' }}
                    onClick={() => {
                        printRow(rowData);
                    }}
                />
                <span title="Some items are incomplete" style={{ color: 'red', fontSize: '27px', marginLeft: '10px' }}>
                    &#9888;
                </span>
            </>
            );
        }
        return (
            <React.Fragment>
                <Button
                    icon={<i className="fa fa-eye" aria-hidden="true"></i>}
                    className="p-button-rounded rounded p-button-info mr-2 po-icon-btn po-icon-view"
                    onClick={() => {
                        setSelectedRow(rowData);
                        setpreview(true);
                    }}
                />
                <Button
                    icon={<i className="fa fa-print" aria-hidden="true"></i>}
                    className="p-button-rounded rounded p-button-info po-icon-btn po-icon-print"
                    onClick={() => {
                        printRow(rowData);
                    }}
                />
            </React.Fragment>
        )
    }

    const activePurchaseOrder =
        filteredGridData.find((po) => po.PurchaseOrderId === selectedPanelPoId) || filteredGridData[0] || null;

    const panelActionButtons = (rowData) => {
        if (!rowData) return null;
        return (
            <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                <Button
                    icon={<i className="fa fa-eye" aria-hidden="true"></i>}
                    className="p-button-rounded p-button-info po-icon-btn po-icon-view"
                    onClick={() => {
                        setSelectedRow(rowData);
                        setpreview(true);
                    }}
                    tooltip="Preview"
                />
                <Button
                    icon={<i className="fa fa-print" aria-hidden="true"></i>}
                    className="p-button-rounded p-button-info po-icon-btn po-icon-print"
                    onClick={() => printRow(rowData)}
                    tooltip="Print"
                />
            </div>
        );
    };

    return (
        <div className="content-wrapper">
            <Toast ref={toast} />
            <style>{`
                .po-view-toggle {
                    display: inline-flex;
                    border: 1px solid #d4e3ed;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #fff;
                }
                .po-view-toggle button {
                    border: none;
                    background: transparent;
                    padding: 7px 12px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #4A7FA8;
                }
                .po-view-toggle button.active {
                    background: #e8f1f8;
                    color: #1E4A6B;
                }
                .po-master-shell {
                    border: 1px solid #d4e3ed;
                    border-radius: 10px;
                    background: #fff;
                    overflow: hidden;
                }
                .po-panel-layout {
                    display: grid;
                    grid-template-columns: 340px minmax(0, 1fr);
                    min-height: 560px;
                }
                .po-panel-list {
                    border-right: 1px solid #dce8f1;
                    max-height: 560px;
                    overflow-y: auto;
                    padding: 10px;
                }
                .po-panel-item {
                    width: 100%;
                    border: 1px solid #e5edf4;
                    border-radius: 8px;
                    background: #fff;
                    text-align: left;
                    padding: 10px;
                    margin-bottom: 8px;
                    cursor: pointer;
                }
                .po-panel-item.active {
                    border-color: #2f9cff;
                    box-shadow: inset 2px 0 0 #2f9cff;
                    background: #f5faff;
                }
                .po-panel-detail {
                    padding: 14px;
                    background: #fff;
                }
                .po-detail-title {
                    font-size: 24px;
                    line-height: 1.2;
                    margin: 0;
                    color: #22384c;
                    font-weight: 700;
                }
                .po-tabline {
                    display: flex;
                    gap: 24px;
                    border-bottom: 1px solid #dce8f1;
                    margin-top: 12px;
                }
                .po-tabline button {
                    border: none;
                    background: none;
                    font-size: 12px;
                    color: #6d7f8d;
                    padding: 10px 0;
                    font-weight: 600;
                    border-bottom: 2px solid transparent;
                }
                .po-tabline button.active {
                    color: #2684ff;
                    border-bottom-color: #2684ff;
                }
                .po-detail-grid {
                    margin-top: 16px;
                    display: grid;
                    grid-template-columns: repeat(2, minmax(160px, 1fr));
                    gap: 16px;
                }
                .po-label {
                    font-size: 11px;
                    text-transform: uppercase;
                    color: #7a8ea0;
                    font-weight: 700;
                    margin-bottom: 4px;
                }
                .po-value {
                    font-size: 13px;
                    color: #22384c;
                    font-weight: 600;
                    word-break: break-word;
                }
                .po-icon-btn {
                    width: 28px !important;
                    height: 28px !important;
                    padding: 0 !important;
                    border-radius: 7px !important;
                    border: 1px solid transparent !important;
                }
                .po-icon-view {
                    background: #e8f1f8 !important;
                    color: #1E4A6B !important;
                    border-color: #cfe0ee !important;
                }
                .po-icon-print {
                    background: #ebfff3 !important;
                    color: #1f9d57 !important;
                    border-color: #c5efd6 !important;
                }
                @media (max-width: 1024px) {
                    .po-panel-layout {
                        grid-template-columns: 1fr;
                    }
                    .po-panel-list {
                        border-right: none;
                        border-bottom: 1px solid #dce8f1;
                        max-height: 260px;
                    }
                }
            `}</style>
            <div className="content-header">
                <div>
                    <div className="row ">
                        <div className="col">
                            <h1 className="m-0 text-dark">Purchase Order</h1>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-header d-flex justify-content-between align-items-center p-2 flex-wrap" style={{ gap: '10px' }}>
                <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                    <div className="po-view-toggle">
                        <button
                            type="button"
                            className={viewMode === "panel" ? "active" : ""}
                            onClick={() => setViewMode("panel")}
                        >
                            Panel View
                        </button>
                        <button
                            type="button"
                            className={viewMode === "table" ? "active" : ""}
                            onClick={() => setViewMode("table")}
                        >
                            Table View
                        </button>
                    </div>
                    <span className="p-input-icon-right">
                        <i className="pi pi-search" />
                        <InputText
                            type="search"
                            value={globalFilterValue}
                            onChange={onGlobalFilterChange}
                            placeholder="Search..."
                            className="form-control"
                        />
                    </span>
                </div>

                <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                    <ExportToCSV className="btn btn-success btn-sm rounded ml-2 mr-2" data={filteredGridData}/>
                    <Button label="Create Purchase Order" icon="pi pi-plus" className="btn btn-success btn-sm rounded" onClick={openDialog} />
                </div>
            </div>
            {viewMode === "table" && (
            <div className="row mt-3">
                <DataTable
                    value={filteredGridData}
                    paginator
                    rows={15}
                    loading={loading}
                    stripedRows
                    emptyMessage="No records found matching your criteria."
                    dataKey="PurchaseOrderId"
                    globalFilter={globalFilterValue}
                >
                    <Column header="PO Id" field='PONumber' />
                    <Column header="Vendor" field='VendorName' />
                    <Column header="Shipping Address" field='ShippingAddress' />
                    <Column header="Billing Address" field='BillingAddress' />
                    <Column header="Action" body={actionBodyTemplate} />
                </DataTable>
            </div>
            )}

            {viewMode === "panel" && (
                <div className="po-master-shell mt-3">
                    <div className="po-panel-layout">
                        <div className="po-panel-list">
                            <div style={{ fontSize: '12px', color: '#667e92', marginBottom: '8px', fontWeight: 600 }}>
                                All Purchase Orders ({filteredGridData.length})
                            </div>
                            {filteredGridData.map((po) => {
                                const poId = po.PurchaseOrderId;
                                const total = Array.isArray(po.Items)
                                    ? po.Items.reduce((sum, item) => sum + (item.LineTotal || item.Price * item.Quantity || 0), 0)
                                    : 0;
                                return (
                                    <button
                                        key={poId || po.PONumber}
                                        type="button"
                                        className={`po-panel-item ${poId === selectedPanelPoId ? "active" : ""}`}
                                        onClick={() => setSelectedPanelPoId(poId)}
                                    >
                                        <div style={{ fontSize: '14px', color: '#22384c', fontWeight: 700 }}>
                                            {po.PONumber || "Purchase Order"}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6d7f8d', marginTop: '2px' }}>
                                            {po.VendorName || "-"}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#7a8ea0', marginTop: '2px' }}>
                                            {po.PODateTime || "-"}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#1E4A6B', marginTop: '4px', fontWeight: 700 }}>
                                            Total Cost: ₹{Number(total || 0).toLocaleString("en-IN")}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="po-panel-detail">
                            {!activePurchaseOrder ? (
                                <div className="text-muted">No purchase order found.</div>
                            ) : (
                                <>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <h2 className="po-detail-title">{activePurchaseOrder.PONumber || "Purchase Order"}</h2>
                                        {panelActionButtons(activePurchaseOrder)}
                                    </div>
                                    <div className="po-tabline">
                                        <button
                                            type="button"
                                            className={panelTab === "details" ? "active" : ""}
                                            onClick={() => setPanelTab("details")}
                                        >
                                            Details
                                        </button>
                                        <button
                                            type="button"
                                            className={panelTab === "history" ? "active" : ""}
                                            onClick={() => setPanelTab("history")}
                                        >
                                            Comments & History
                                        </button>
                                    </div>

                                    {panelTab === "details" && (
                                        <>
                                            <div className="po-detail-grid">
                                                <div>
                                                    <div className="po-label">Vendor</div>
                                                    <div className="po-value">{activePurchaseOrder.VendorName || "-"}</div>
                                                </div>
                                                <div>
                                                    <div className="po-label">Date</div>
                                                    <div className="po-value">{activePurchaseOrder.PODateTime || "-"}</div>
                                                </div>
                                                <div>
                                                    <div className="po-label">Shipping Address</div>
                                                    <div className="po-value">{activePurchaseOrder.ShippingAddress || "-"}</div>
                                                </div>
                                                <div>
                                                    <div className="po-label">Billing Address</div>
                                                    <div className="po-value">{activePurchaseOrder.BillingAddress || "-"}</div>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '16px' }}>
                                                <div className="po-label" style={{ marginBottom: '8px' }}>Order Cost Breakdown</div>
                                                <DataTable value={activePurchaseOrder.Items || []} stripedRows responsiveLayout="scroll" size="small">
                                                    <Column field="ItemName" header="Item Name" />
                                                    <Column field="Quantity" header="Ordered" />
                                                    <Column field="QuantityReceived" header="Received" />
                                                    <Column field="MeasurementUnit" header="Unit" />
                                                    <Column
                                                        field="Price"
                                                        header="Unit Cost"
                                                        body={(row) => `₹${row.Price || row.Rate || 0}`}
                                                    />
                                                    <Column
                                                        field="LineTotal"
                                                        header="Total Cost"
                                                        body={(row) => {
                                                            const total = row.LineTotal || row.Price * row.Quantity || 0;
                                                            return `₹${Number(total).toLocaleString("en-IN")}`;
                                                        }}
                                                    />
                                                </DataTable>
                                            </div>
                                        </>
                                    )}

                                    {panelTab === "history" && (
                                        <div style={{ marginTop: '16px' }}>
                                            <div className="po-label">Comments & History</div>
                                            <div className="po-value" style={{ color: '#6d7f8d', fontWeight: 500 }}>
                                                History API under progress.
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <Dialog
                visible={displayDialog}
                onHide={onHideDialog}
                modal
                style={{ width: '90vw', height: '90vh' }}
                header="New Purchase Order"
            >
                <PurchaseOrderPage />
            </Dialog>

            <Dialog
                visible={preview}
                onHide={onHideDialog}
                modal
                style={{ width: '90vw', height: '90vh' }}
                header={
                    <div>
                        <h5 className='mb-4'>Preview Purchase Order</h5>
                        {selectedRow && (
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5>Purchase Order ID: {selectedRow.PONumber}</h5>
                                <h5>Date: {selectedRow.PODateTime}</h5>
                            </div>
                        )}
                    </div>
                }>
                <PreviewPurchaseOrder groupedItems={selectedRow} onRemoveVendor={handleRemoveVendor} />
            </Dialog>
        </div >
    );
};

export default PurchaseOrderMaster;