import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { } from "../../Services/InventoryService";
import { useSelector } from "react-redux";
import PurchaseOrderPage from './PurchaseOrderPage';
import ExportToCSV from '../../ReactComponents/ExportToCSV/ExportToCSV';
import { InputText } from 'primereact/inputtext';
import PreviewPurchaseOrder from './PreviewPurchaseOrder';

const PurchaseOrderMaster = () => {
    const [loading, setLoading] = useState(false);
    const printRef = useRef();
    const [selectedRow, setSelectedRow] = useState(null);
    const emptyallGridData = {
        POId: "xxxxx",
        Dates: "N/A",
        ItemId: 0,
        VendorId: 0,
        ItemName: "N/A",
        VendorName: "N/A",
        BrandName: "N/A",
        Price: 0,
        MeasurementUnit: "N/A",
        HSNCode: 0,
        Description: "N/A",
        Quantity: 0,
        TotalAmount: 0,
        BillingAddress: "N/A",
        ShippingAddress: "N/A",
    };
    const [filteredGridData, setFilteredGridData] = useState([{ POId: 1, VendorId: 3, VendorName: "Akshat", Item: [{ ItemId: 4, ItemName: 'Mop', Price: 30, Quantity: 10 }, { ItemId: 5, ItemName: 'Bread', Price: 40, Quantity: 20 }], ShippingAddress: "New York", BillingAddress: "India" },
    { POId: 2, VendorId: 3, VendorName: "Akshat", Item: [{ ItemId: 4, ItemName: 'Mop', Price: 30, Quantity: 10 }, { ItemId: 5, ItemName: 'Bread', Price: 40, Quantity: 20 }], ShippingAddress: "New York", BillingAddress: "India" },
    { POId: 3, VendorId: 4, VendorName: "Bhavesh", Item: [{ ItemId: 5, ItemName: 'Bread', Price: 40, Quantity: 20 }, { ItemId: 4, ItemName: 'Mop', Price: 30, Quantity: 10 }], ShippingAddress: "New York", BillingAddress: "India" },]);
    const [displayDialog, setDisplayDialog] = useState(false);
    const propertyId = useSelector((state) => state.Commonreducer.puidn);
    const [preview, setpreview] = useState(false);
    const toast = useRef(null);

    useEffect(() => {
        // if (propertyId) {
        //     //setFilteredGridData([]);
        if (!propertyId) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Please Select a Property.',
                life: 3000
            });
            //setFilteredGridData([]);
        }
    }, [propertyId]);

    useEffect(() => {
        const fetchData = async () => {
            if (propertyId) {
            }
        };
        fetchData();
    }, [propertyId]);

    const openDialog = () => {
        setDisplayDialog(true);
    };

    const onHideDialog = () => {
        setDisplayDialog(false);
        setpreview(false);
    };

    const handleRemoveVendor = (vendorName) => {
        setSelectedRow(item => item.VendorName !== vendorName);
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
                <p>${rowData.POId}</p>
                <div style="display: flex; justify-content: space-between;">
                    <p>To,</p>
                    <p>Date: ${new Date().toLocaleDateString()}</p>
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
                        ${rowData.Item.map((item, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${item.ItemName}</td>
                                <td>${item.Description || 'N/A'}</td>
                                <td>${item.MeasurementUnit || 'Unit'}</td>
                                <td>${item.HSNCode || 'N/A'}</td>
                                <td>${item.Quantity}</td>
                                <td>${item.Price}</td>
                                <td>${item.Price * item.Quantity}</td>
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
        return (
            <React.Fragment>
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
                        setSelectedRow(rowData);
                        setTimeout(() => {
                            printRow(rowData);
                        }, 100);
                    }}
                />
            </React.Fragment>
        )
    }

    return (
        <div className="content-wrapper">
            <Toast ref={toast} />
            <div className="content-header">
                <div>
                    <div className="row ">
                        <div className="col">
                            <h1 className="m-0 text-dark">Purchase Order</h1>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-header d-flex justify-content-between align-items-center p-2">
                <div className="input-group input-group-sm">
                    <span className="p-input-icon-right">
                        <i className="pi pi-search" />
                        <InputText
                            type="search"
                            // value={globalFilterValue}
                            // onChange={onGlobalFilterChange}
                            placeholder="Search..."
                            className="form-control"
                        />
                    </span>
                </div>

                <div className="d-flex">
                    <ExportToCSV className="btn btn-success btn-sm rounded ml-2 mr-2" />
                    <Button label="Create Purchase Order" icon="pi pi-plus" className="btn btn-success btn-sm rounded" onClick={openDialog} />
                </div>
            </div>
            <div className="row mt-3">
                <DataTable
                    value={filteredGridData}
                    paginator
                    rows={15}
                    loading={loading}
                    emptyMessage="No records found matching your criteria."
                    dataKey="POId"
                >
                    <Column header="PO Id" field='POId' />
                    <Column header="Vendor" field='VendorName' />
                    {/* <Column header="Total Amount" /> */}
                    <Column header="Shipping Address" field='ShippingAddress' />
                    <Column header="Billing Address" field='BillingAddress' />
                    <Column header="Action" body={actionBodyTemplate} />
                </DataTable>
            </div>
            <Dialog
                visible={displayDialog}
                onHide={onHideDialog}
                modal
                style={{ width: '90vw', height: '90vh' }}
                header="Create Purchase Order"
            >
                <PurchaseOrderPage />
            </Dialog>

            <Dialog
                visible={preview}
                onHide={onHideDialog}
                modal
                style={{ width: '90vw', height: '90vh' }}
                header="Preview Purchase Order"
            >
                {console.log("Selected Row: ", selectedRow)}
                <PreviewPurchaseOrder groupedItems={selectedRow} onRemoveVendor={handleRemoveVendor}/>
            </Dialog>
        </div >
    );
};

export default PurchaseOrderMaster;