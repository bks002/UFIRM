import React, { useState, useEffect } from 'react';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from 'primereact/button';
import { useSelector } from 'react-redux';
import POQuantityComponent from './POQuantityComponent';

const PreviewPurchaseOrder = ({ items = [] }) => {
    const initialPOID = 'xxxx';
    const [POID, setPOID] = useState(initialPOID);
    const [Dates, setDates] = useState('');
    const [groupedData, setGroupedData] = useState(null);
    const propertyId = useSelector((state) => state.Commonreducer.puidn);
    const createdBy= useSelector((state)=> state.Commonreducer.userId);
    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0];
        setDates(formattedDate);
    }, []);
    const [vendorData, setVendorData] = useState(
        items.map(item => ({
            ...item,
            POID: initialPOID,
            Date: Dates
        }))
    );

    const groupedByVendor = vendorData.reduce((acc, item) => {
        if (!acc[item.VendorName]) {
            acc[item.VendorName] = [];
        }
        acc[item.VendorName].push(item);
        return acc;
    }, {});

    const removeVendor = (vendorNameToRemove) => {
        const updatedItems = vendorData.filter(item => item.VendorName !== vendorNameToRemove);
        setVendorData(updatedItems);
    };

    const savePlaceOrder = () => {
        const grouped = vendorData.reduce((acc, item) => {
            const existingVendor = acc.find(v => v.VendorId === item.VendorId);
            const itemDetails = {
                itemId: item.ItemId,
                quantity: item.Quantity,
                price: item.TotalAmount
            };
            if (existingVendor) {
                existingVendor.items.push(itemDetails);
            } else {
                acc.push({
                    VendorId: item.VendorId,
                    shippingAddress: item.ShippingAddress,
                    billingAddress: item.BillingAddress,
                    propertyId: propertyId,
                    createdBy: createdBy,
                    items: [itemDetails]
                });
            }

            return acc;
        }, []);
       setGroupedData(grouped);
    };

    return (
        <div className='flex flex-wrap col'>
            <div className="d-flex justify-content-between mb-4">
                <div className="d-flex flex-column me-3 flex-grow-1">
                    <h5><strong>PO ID:</strong> {POID}</h5>
                </div>
                <div className="d-flex flex-column ms-3 flex-grow-1">
                    <h5><strong>Date:</strong> {Dates}</h5>
                </div>
            </div>
            {Object.keys(groupedByVendor).map((vendorName, index) => {
                const vendorItems = groupedByVendor[vendorName];
                const vendorTotal = vendorItems.reduce((sum, item) => sum + (item.TotalAmount || 0), 0);
                return (
                    <div key={index} className='row mb-4'>
                        <div className='card flex flex-column'>
                            <div className='d-flex align-items-center justify-content-between'>
                                <h5><strong>Vendor Name: </strong>{vendorName}</h5>
                                <Button
                                    icon={<i className='fa fa-times'></i>}
                                    style={{backgroundColor: 'white', color:'black'}}
                                    onClick={() => removeVendor(vendorName)}
                                />
                            </div>
                            <div className='card-body'>
                                <div className="d-flex justify-content-between mb-4">
                                    <div className="d-flex flex-column me-3 flex-grow-1">
                                        <p><strong>Shipping Address:</strong> {vendorItems[0].ShippingAddress}</p>
                                    </div>
                                    <div className="d-flex flex-column ms-3 flex-grow-1">
                                        <p><strong>Billing Address:</strong> {vendorItems[0].BillingAddress}</p>
                                    </div>
                                </div>

                                <DataTable value={vendorItems} className='mb-3'>
                                    <Column field="ItemName" header="Item" />
                                    <Column field="Description" header="Description" />
                                    <Column field='MeasurementUnit' header="Unit" />
                                    <Column field="HSNCode" header="HSN Code" />
                                    <Column field="Quantity" header="Quantity" />
                                    <Column field="Price" header="Price" />
                                    <Column
                                        field="TotalAmount"
                                        header="Total Amount"
                                        body={(rowData) => rowData.TotalAmount ? `₹${rowData.TotalAmount}` : 'N/A'}
                                    />
                                </DataTable>
                                <div className="text-end mt-3">
                                    <strong>Total Order Amount: </strong>
                                    {new Intl.NumberFormat('en-IN', {
                                        style: 'currency',
                                        currency: 'INR',
                                    }).format(vendorTotal)}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
            {groupedData && <POQuantityComponent grouped={groupedData} />}
        </div>
    );
};

export default PreviewPurchaseOrder;