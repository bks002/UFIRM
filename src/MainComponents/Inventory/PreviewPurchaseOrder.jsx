import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

const PreviewPurchaseOrder = ({ groupedItems, onRemoveVendor }) => {
    if (!groupedItems || !groupedItems.Item) {
        return <div>No purchase order data available.</div>;
    }

    const {
        POId,
        VendorId,
        Dates,
        VendorName,
        Item,
        ShippingAddress,
        BillingAddress
    } = groupedItems;

    const totalAmount = Item.reduce((sum, item) => sum + (item.TotalAmount || item.Price * item.Quantity || 0), 0);

    return (
        <>
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 >Purchase Order ID: {POId}</h5>
            <h5 >Date: {Dates}</h5>
            </div>
            <div className="mb-5 border rounded p-3 shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="m-0">Vendor: {VendorName}</h5>
                    <Button
                        icon={<i className="fa fa-times"></i>}
                        style={{ backgroundColor: 'white', color: 'black' }}
                        onClick={() => onRemoveVendor(VendorName)}
                    />
                </div>

                <div className="mb-3">
                    <p><strong>Shipping Address:</strong> {ShippingAddress}</p>
                    <p><strong>Billing Address:</strong> {BillingAddress}</p>
                </div>

                <DataTable value={Item} responsiveLayout="scroll" stripedRows className="p-datatable-sm">
                    <Column field="ItemName" header="Item" />
                    <Column field="Description" header="Description" />
                    <Column field="Quantity" header="Quantity" />
                    <Column field="Price" header="Price" body={(rowData) => `₹${rowData.Price}`} />
                    <Column
                        field="TotalAmount"
                        header="Total"
                        body={(rowData) =>
                            new Intl.NumberFormat('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                            }).format(rowData.TotalAmount || rowData.Price * rowData.Quantity || 0)
                        }
                    />
                </DataTable>

                <div className="text-end mt-2">
                    <strong>Subtotal: </strong>
                    {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                    }).format(totalAmount)}
                </div>
            </div>
        </>
    );
};

export default PreviewPurchaseOrder;