import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';

const POQuantityComponent = ({ selectedGridData = [] }) => {
    const [shippingAddress, setShippingAddress] = useState('');
    const [billingAddress, setBillingAddress] = useState('');
    const [items, setItems] = useState([]);

    useEffect(() => {
        const updatedItems = selectedGridData.map(item => ({
            ...item,
            TotalAmount: (item.Quantity || 0) * (item.Price || 0)
        }));
        setItems(updatedItems);
    }, [selectedGridData]);

    const updateItemQuantity = (id, quantity) => {
        setItems(prevItems => {
            const updated = [...prevItems];
            const index = updated.findIndex(item => item.Id === id);
            if (index > -1) {
                const item = updated[index];
                updated[index] = {
                    ...item,
                    Quantity: quantity,
                    TotalAmount: (quantity || 0) * (item.Price || 0),
                };
            }
            return updated;
        });
    };

    const RateTemplate = useCallback((rowData) => {
        return rowData.Price ? <span>{`₹${rowData.Price} /${rowData.MeasurementUnit}`}</span> : null;
    }, []);

    const QuantityTemplate = useCallback((rowData) => (
        <InputNumber
            value={rowData.Quantity}
            min={0}
            onValueChange={(e) => updateItemQuantity(rowData.Id, e.value)}
            buttonLayout="horizontal"
        />
    ), []);

    const TotalAmountTemplate = useCallback((rowData) => {
        const amount = Number(rowData.TotalAmount) || 0;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    }, []);

    const grandTotal = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.TotalAmount || 0), 0);
    }, [items]);

    return (
        <div>
            {/* Shipping & Billing address */}
            <div className="d-flex justify-content-between mb-4">
                <div className="d-flex flex-column me-3 flex-grow-1">
                    <label htmlFor="Shipping">Shipping Address</label>
                    <InputText
                        id="Shipping"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Enter shipping address"
                    />
                </div>
                <div className="d-flex flex-column ms-3 flex-grow-1">
                    <label htmlFor="Billing">Billing Address</label>
                    <InputText
                        id="Billing"
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        placeholder="Enter billing address"
                    />
                </div>
            </div>

            {/* Table */}
            <DataTable
                value={items}
                dataKey="Id"
                paginator
                rows={15}
                responsiveLayout="scroll"
                className="mb-3"
            >
                <Column field="ItemName" header="Item" />
                <Column field="Description" header="Description" />
                <Column field="VendorName" header="Vendor" />
                <Column field="BrandName" header="Brand" />
                <Column body={RateTemplate} header="Price" />
                <Column field="HSNCode" header="HSN Code" />
                <Column header="Quantity" body={QuantityTemplate} />
                <Column body={TotalAmountTemplate} header="Total Amount" />
            </DataTable>

            {/* Grand total */}
            <div className="text-end mt-3">
                <strong>Total Order Amount: </strong>
                {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                }).format(grandTotal)}
            </div>

            {/* Place Order Button */}
            <div className="d-flex justify-content-end mt-3">
                <Button label="Place Order" icon="pi pi-check" className="p-button-success" />
            </div>
        </div>
    );
};

export default POQuantityComponent;
