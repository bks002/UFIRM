import React,{useState} from 'react';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from 'primereact/button';

const PreviewPurchaseOrder = ({ items = [] }) => {
    const [vendorData, setVendorData] = useState(items);
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

    return (
        <div className='flex flex-wrap col'>
            {Object.keys(groupedByVendor).map((vendorName, index) => {
                const vendorItems = groupedByVendor[vendorName];
                const vendorTotal = vendorItems.reduce((sum, item) => sum + (item.TotalAmount || 0), 0);
                return (
                    <div key={index} className='row mb-4'>
                        <div className='card flex flex-column'>
                            <div className='d-flex align-items-center justify-content-between'>
                                <h5>{vendorName}</h5>
                                <Button
                                    icon="pi pi-times" severity="danger"
                                    onClick={() => removeVendor(vendorName)}
                                    tooltip="Remove Vendor"
                                    tooltipOptions={{ position: 'left' }}
                                />
                            </div>
                            <div className='card-body'>
                                <div className="d-flex justify-content-between mb-4">
                                    <div className="d-flex flex-column me-3 flex-grow-1">
                                        <p><strong>Shipping Address:</strong> {vendorItems[0].Shipping}</p>
                                    </div>
                                    <div className="d-flex flex-column ms-3 flex-grow-1">
                                        <p><strong>Billing Address:</strong> {vendorItems[0].Billing}</p>
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
                                <div className="flex mt-2">
                                    <div className="text-start mt-2">
                                        <strong>Total Order Amount: </strong>
                                        {new Intl.NumberFormat('en-IN', {
                                            style: 'currency',
                                            currency: 'INR',
                                        }).format(vendorTotal)}
                                    </div>
                                    <div className="d-flex justify-content-end">
                                        <Button label="Place Order" icon="pi pi-check" className="p-button-success" onClick={console.log(vendorData)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PreviewPurchaseOrder;