import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const PreviewPurchaseOrder = ({ items = [] }) => {
    const groupedByVendor = items.reduce((acc, item) => {
        if (!acc[item.VendorName]) {
            acc[item.VendorName] = [];
        }
        acc[item.VendorName].push(item);
        return acc;
    }, {});

    return (
        <div className='flex flex-wrap row'>
            {Object.keys(groupedByVendor).map((vendorName, index) => (
                <div key={index} className='col mb-4'>
                    <div className='card flex flex-column'>
                        <div className='card-header d-flex align-items-center justify-content-between'>
                            <h5>{vendorName}</h5>
                        </div>
                        <div className='card-body'>
                            <div className="d-flex justify-content-between mb-4">
                                <div className="d-flex flex-column me-3 flex-grow-1">
                                    <p><strong>Shipping Address:</strong> {groupedByVendor[vendorName][0].Shipping}</p>
                                </div>
                                <div className="d-flex flex-column ms-3 flex-grow-1">
                                    <p><strong>Billing Address:</strong> {groupedByVendor[vendorName][0].Billing}</p>
                                </div>
                            </div>
                            <DataTable value={groupedByVendor[vendorName]} className='mb-3'>
                                <Column field="ItemName" header="Item" />
                                <Column field="Description" header="Description" />
                                <Column field='MeasurementUnit' header="Unit" />
                                <Column field="HSNCode" header="HSN Code" />
                                <Column field="Quantity" header="Quantity" />
                                <Column field="Price" header="Price" />
                                <Column field="TotalAmount" header="Total Amount" body={(rowData) => rowData.TotalAmount ? `₹${rowData.TotalAmount}` : 'N/A'} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PreviewPurchaseOrder;

