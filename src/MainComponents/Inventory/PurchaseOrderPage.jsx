import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { getCategories, fetchFilteredItems, getVendors, fetchFilteredRate } from "../../Services/InventoryService";
import { useSelector } from "react-redux";
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';

const PurchaseOrderPage = () => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [Items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [allVendors, setAllVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const emptyallGridData = {
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
        Billing: "N/A",
        Shipping: "N/A"
    };
    const [filteredGridData, setFilteredGridData] = useState([emptyallGridData]);
    const [selectedGridData, setSelectedGridData] = useState([]);
    const [displayDialog, setDisplayDialog] = useState(false);
    const [displayafterPlaceOrder, setDisplayafterPlaceOrder] = useState(false);
    const [shippingAddress, setShippingAddress] = useState("");
    const [billingAddress, setBillingAddress] = useState("");

    const propertyId = useSelector((state) => state.Commonreducer.puidn);

    const toast = useRef(null);

    useEffect(() => {
        if (propertyId) {
            setFilteredGridData([]);
            getAllCategories(propertyId);
            getAllVendors(propertyId);
        } else {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Please Select a Property.',
                life: 3000
            });
            setFilteredGridData([]);
        }
    }, [propertyId]);

    useEffect(() => {
        const fetchData = async () => {
            const category = selectedCategory ? selectedCategory : null;
            const item = selectedItem ? selectedItem : null;
            const vendor = selectedVendor ? selectedVendor : null;
            if (propertyId) {
                getItems(propertyId, category);
                const data = await fetchFilteredRate(propertyId, category, item, vendor);
                setFilteredGridData(data);
            }
        };
        fetchData();
    }, [propertyId, selectedCategory, selectedItem, selectedVendor]);

    const getAllCategories = async (propertyId) => {
        setLoading(true);
        try {
            const data = await getCategories(propertyId);
            setCategories(data);
        } catch (error) {
            console.error('Error fetching Categories:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to fetch categories.',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const getAllVendors = async (propertyId) => {
        setLoading(true);
        try {
            const data = await getVendors(propertyId);
            setAllVendors(data);
        } catch (error) {
            console.error('Error fetching Vendors:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to fetch vendors.',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const getItems = async (propertyId, selectedCategory) => {
        setLoading(true);
        try {
            const data = await fetchFilteredItems(propertyId, selectedCategory);
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching Items:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to fetch items.',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleItemSelect = (e) => {
        const itemId = e.target.value;
        setSelectedItem(itemId);
    };

    const handleVendorSelect = (e) => {
        const vendorId = e.target.value;
        setSelectedVendor(vendorId);
    };

    const VendorBodyTemplate = (rowData) => {
        return <span>{rowData.VendorName}</span>;
    };

    const Brandbodytemplate = (rowData) => {
        return <span>{rowData.BrandName}</span>;
    };

    const Ratetemplate = (rowData) => {
        return rowData.Price ? <span>{`₹${rowData.Price} /${rowData.MeasurementUnit}`}</span> : null;
    };

    const ItemDescriptiontemplate = (rowData) => {
        return <span>{rowData.Description}</span>
    }

    const HSNtemplate = (rowData) => {
        return <span>{rowData.HSNCode}</span>
    }

    // const onQuantityChange = (e, rowData) => {
    //     const updatedSelectedGridData = selectedGridData.map(item => {
    //         if (item.ItemId === rowData.ItemId && item.VendorName === rowData.VendorName) {
    //             const price = item.Price;
    //             const newQuantity = e.value;
    //             return {
    //                 ...item,
    //                 Quantity: newQuantity,
    //                 TotalAmount: newQuantity * price
    //             };
    //         }
    //         return item;
    //     });
    //     setSelectedGridData(updatedSelectedGridData);
    // };

    const Quantitytemplate = (rowData) => {
        return (
            <InputNumber
                value={rowData.Quantity}
                showButtons
                onValueChange={(e) => { rowData.Quantity = e.value; rowData.TotalAmount = e.value * rowData.Price; setSelectedGridData([...selectedGridData]) }}
                min={0}
            />
        );
    };

    const Totalamounttemplate = (rowData) => {
        return <span>{`₹${rowData.TotalAmount}`}</span>;
    };

    const openDialog = () => {
        if (selectedGridData.length > 0) {
            setDisplayDialog(true);
        }
    };

    const openPlaceOrder = () => {
        const dataWithAddresses = selectedGridData.map(item => ({
            ...item,
            Shipping: shippingAddress,
            Billing: billingAddress
        }));
        setSelectedGridData(dataWithAddresses);
        setDisplayafterPlaceOrder(true);
    };

    const onHideDialog = () => {
        setDisplayDialog(false);
        setDisplayafterPlaceOrder(false);
        setSelectedGridData([]);
        setShippingAddress("");
        setBillingAddress("");
    };

    const renderPlaceordercontent = () => {
        const groupedByVendor = selectedGridData.reduce((acc, item) => {
            if (!acc[item.VendorName]) {
                acc[item.VendorName] = [];
            }
            acc[item.VendorName].push(item);
            return acc;
        }, {});

        return (
            <div className='flex flex-wrap row'>
                {Object.keys(groupedByVendor).map((vendorName, index) => (
                    <div key={index} className='col-6 mb-4'>
                        <div className='card flex flex-column'>
                            <div className='card-header d-flex align-items-center justify-content-between'>
                                <h5>{vendorName}</h5>
                            </div>
                            <div className='card-body p-3'>
                                <p><strong>Shipping Address:</strong> {groupedByVendor[vendorName][0].Shipping}</p>
                                <p><strong>Billing Address:</strong> {groupedByVendor[vendorName][0].Billing}</p>
                                {groupedByVendor[vendorName].map((item, itemIndex) => (
                                    <div key={itemIndex} className='mb-2'>
                                        <p><strong>Item:</strong> {item.ItemName}</p>
                                        <p><strong>Brand:</strong> {item.BrandName}</p>
                                        <p><strong>HSN Code:</strong> {item.HSNCode}</p>
                                        <p><strong>Price:</strong> {item.Price ? `₹${item.Price} /${item.MeasurementUnit}` : 'N/A'}</p>
                                        <p><strong>Quantity:</strong> {item.Quantity}</p>
                                        <p><strong>Total Amount:</strong> {item.TotalAmount ? `₹${item.TotalAmount}` : 'N/A'}</p>
                                        {itemIndex < groupedByVendor[vendorName].length - 1 && <hr />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };


    const renderDialogContent = () => {
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
                    value={selectedGridData}
                    paginator
                    rows={15}
                    loading={loading}
                >
                    <Column field='ItemName' header="Item" />
                    <Column body={ItemDescriptiontemplate} header='Description' />
                    <Column body={VendorBodyTemplate} header="Vendor" />
                    <Column body={Brandbodytemplate} header="Brand" />
                    <Column body={Ratetemplate} header="Price" />
                    <Column body={HSNtemplate} header="HSN Code" />
                    <Column header="Quantity" body={Quantitytemplate} />
                    <Column body={Totalamounttemplate} header="Total Amount" />
                </DataTable>
                <div className="p-d-flex p-jc-end p-mt-3">
                    <Button label="Place Order" icon="pi pi-check" className="p-button-success" onClick={openPlaceOrder} />
                </div>
                <Dialog
                    visible={displayafterPlaceOrder}
                    onHide={onHideDialog}
                    modal
                    style={{ width: '90vw', height: '90vh' }}
                    header="Purchase Order Details"
                >
                    {renderPlaceordercontent()}
                </Dialog>
            </div>
        );
    };

    return (
        <div className="content-wrapper">
            <Toast ref={toast} />
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0 text-dark">Purchase Order</h1>
                        </div>
                    </div>
                </div>
            </div>
            <section className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-4">
                            <label>Category</label>
                            <select
                                className="form-control"
                                value={selectedCategory || ''}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.Id} value={cat.Id}>
                                        {cat.Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-4">
                            <label>Items</label>
                            <select
                                className="form-control"
                                value={selectedItem || ''}
                                onChange={handleItemSelect}
                            >
                                <option value="">Select Item</option>
                                {Items.map((item) => (
                                    <option key={item.Id} value={item.Id}>
                                        {item.Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-4">
                            <label>Vendor</label>
                            <select
                                className="form-control"
                                value={selectedVendor || ''}
                                onChange={handleVendorSelect}
                            >
                                <option value="">Select Vendor</option>
                                {allVendors.map((ven) => (
                                    <option key={ven.Id} value={ven.Id}>
                                        {ven.Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="row mt-3">
                        <DataTable
                            value={filteredGridData}
                            paginator
                            rows={15}
                            loading={loading}
                            selectionMode="checkbox"
                            selection={selectedGridData}
                            onSelectionChange={(e) => setSelectedGridData(e.value)}
                            emptyMessage="No records found matching your criteria."
                        >
                            <Column field='ItemName' header="Item" />
                            <Column body={VendorBodyTemplate} header="Vendor" />
                            <Column body={Brandbodytemplate} header="Brand" />
                            <Column body={Ratetemplate} header="Price" />
                            <Column selectionMode="multiple" header="Select" />
                        </DataTable>
                    </div>
                    <div className="row mt-3">
                        <div className="col-12 text-right">
                            <Button
                                label="Create Purchase Order"
                                icon="pi pi-plus"
                                onClick={openDialog}
                                disabled={selectedGridData.length === 0}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <Dialog
                visible={displayDialog}
                onHide={onHideDialog}
                modal
                style={{ width: '90vw', height: '90vh' }}
                header="Purchase Order"
            >
                {renderDialogContent()}
            </Dialog>
        </div>
    );
};

export default PurchaseOrderPage;