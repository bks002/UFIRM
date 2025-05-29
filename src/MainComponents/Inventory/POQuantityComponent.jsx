import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import PreviewPurchaseOrder from './PreviewPurchaseOrder';

const POQuantityComponent = ({
    selectedGridData = []
}) => {
    const [shippingAddress, setShippingAddress] = useState("");
    const [billingAddress, setBillingAddress] = useState("");
    const [displayafterPlaceOrder, setDisplayafterPlaceOrder] = useState(false);
    const onHideDialog = () => {
        setDisplayafterPlaceOrder(false);
        setShippingAddress("");
        setBillingAddress("");
    };
    const [items, setItems] = useState(selectedGridData);

    useEffect(() => {
        setItems(selectedGridData);
    }, [selectedGridData]);

    const Ratetemplate = (rowData) => {
        return rowData.Price ? <span>{`₹${rowData.Price} /${rowData.MeasurementUnit}`}</span> : null;
    };

    const openDialog =()=>{
        if(items.length>0){
            setDisplayafterPlaceOrder(true);
        }
    }

    const Quantitytemplate = (rowData) => (
        <InputNumber
            value={rowData.Quantity}
            onValueChange={(e) => {
                setItems(prevItems =>
                    prevItems.map(item =>
                        item.Id === rowData.Id
                            ? {
                                ...item,
                                Quantity: e.value,
                                TotalAmount:( item.Price * item.Quantity)
                            }
                            : item
                    )
                );
            }}
        />
    );

    const Totalamounttemplate = (rowData) => {
    const amount = Number(rowData.TotalAmount) || 0;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
};


    return (
        <div>
            <div className="d-flex justify-content-between mb-4">
                <div className="d-flex flex-column me-3 flex-grow-1">
                    <label htmlFor='Shipping'>Shipping Address</label>
                    <InputText
                        id='Shipping'
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                    />
                </div>
                <div className="d-flex flex-column ms-3 flex-grow-1">
                    <label htmlFor='Billing'>Billing Address</label>
                    <InputText
                        id='Billing'
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                    />
                </div>
            </div>
            <DataTable
                value={items}
                paginator
                rows={15}
            >
                <Column  field='ItemName' header="Item" />
                <Column field='Description' header='Description' />
                <Column field='VendorName' header="Vendor" />
                <Column field='BrandName' header="Brand" />
                <Column body={Ratetemplate} header="Price" />
                <Column field='HSNCode' header="HSN Code" />
                <Column header="Quantity" body={Quantitytemplate}  />
                <Column body={Totalamounttemplate} header="Total Amount" field='TotalAmount' />
            </DataTable>
            <div className="p-d-flex p-jc-end p-mt-3">
                <Button label="Place Order" icon="pi pi-check" className="p-button-success" onClick={openDialog} />
            </div>
            <Dialog
                visible={displayafterPlaceOrder}
                onHide={onHideDialog}
                modal
                style={{ width: '90vw', height: '90vh' }}
                header="Purchase Order Details"
            >
                <PreviewPurchaseOrder items={items} />
            </Dialog>
        </div>
    );
};

export default POQuantityComponent;