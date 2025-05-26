import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { getCategories, fetchFilteredItems, getVendors, getRateCard } from "../../Services/InventoryService";
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
    const [availableVendors, setAvailableVendors] = useState([]);
    const [RateCard, setRateCard] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [allGridData, setAllGridData] = useState([]);
    const [filteredGridData, setFilteredGridData] = useState([]);
    const [selectedGridData, setSelectedGridData] = useState([]);
    const [displayDialog, setDisplayDialog] = useState(false);
    const [displayafterPlaceOrder, setDisplayafterPlaceOrder] = useState(false);
    const propertyId = useSelector((state) => state.Commonreducer.puidn);

    const toast = useRef(null);

    useEffect(() => {
        if (propertyId) {
            getAllCategories(propertyId);
            getAllVendors(propertyId);
            getAllRateCard(propertyId);
        } else {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Please Select a Property.',
                life: 3000
            });
        }
    }, [propertyId]);

    useEffect(() => {
        if (propertyId && selectedCategory) {
            getItems(propertyId, selectedCategory);
        } else {
            setItems([]);
            setAllGridData([]);
            setFilteredGridData([]);
            setSelectedItem(null);
            setSelectedVendor(null);
        }
    }, [propertyId, selectedCategory]);

    useEffect(() => {
        if (Items.length > 0) {
            const newGridData = Items.flatMap(item => {
                const itemRateCards = RateCard.filter(rate => rate.ItemName === item.Name);

                if (itemRateCards.length > 0) {
                    return itemRateCards.map(rateInfo => ({
                        ItemId: item.Id,
                        VendorId: rateInfo.VendorId,
                        ItemName: item.Name,
                        VendorName: rateInfo.VendorName,
                        BrandName: item.BrandName,
                        Price: rateInfo.Price,
                        MeasurementUnit: item.MeasurementUnit,
                        HSNCode: item.HSNCode,
                        Description: item.Description,
                        Quantity: 0,
                        TotalAmount: 0,
                        Billing: "N/A",
                        Shipping: "N/A"
                    }));
                } else {
                    return [{
                        ItemId: item.Id,
                        VendorId: 0,
                        ItemName: item.Name,
                        VendorName: "N/A",
                        BrandName: item.BrandName,
                        Price: 0,
                        MeasurementUnit: item.MeasurementUnit,
                        HSNCode: item.HSNCode,
                        Description: item.Description,
                        Quantity: 0,
                        TotalAmount: 0,
                        Billing: "N/A",
                        Shipping: "N/A"
                    }];
                }
            });
            setAllGridData(newGridData);
            setFilteredGridData(newGridData);
        } else {
            setAllGridData([]);
            setFilteredGridData([]);
        }
        setSelectedItem(null);
        setSelectedVendor(null);
    }, [Items, RateCard]);

    useEffect(() => {
        let currentData = [...allGridData];
        if (selectedItem) {
            currentData = currentData.filter(data => String(data.ItemId) === String(selectedItem));
        }
        if (selectedVendor && selectedVendor !== '') {
            const vendorObj = allVendors.find(vendor => String(vendor.Id) === String(selectedVendor));
            const selectedVendorName = vendorObj ? vendorObj.Name : null;
            if (selectedVendorName) {
                currentData = currentData.filter(data => {
                    const match = data.VendorName && data.VendorName.toLowerCase() === selectedVendorName.toLowerCase();
                    return match;
                });
            }
        }
        setFilteredGridData(currentData);
    }, [selectedItem, selectedVendor, allGridData, allVendors]);

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

    const getAllRateCard = async (propertyId) => {
        setLoading(true);
        try {
            const data = await getRateCard(propertyId);
            setRateCard(data);
        } catch (error) {
            console.error('Error fetching Rate Card:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to fetch rate card.',
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
            setAvailableVendors(data);
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

    const onQuantityChange = (e, rowData) => {
        const updatedSelectedGridData = selectedGridData.map(item => {
            if (item.ItemId === rowData.ItemId) {
                const quantity = e.value || 0;
                const price = item.Price || 0;
                return { ...item, Quantity: quantity, TotalAmount: quantity * price };
            }
            return item;
        });
        setSelectedGridData(updatedSelectedGridData);
    };

    const Quantitytemplate = (rowData) => {
        return (
            <InputNumber
                value={rowData.Quantity}
                onValueChange={(e) => onQuantityChange(e, rowData)}
                mode="decimal"
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

    const openplaceorder = () => {
        setDisplayafterPlaceOrder(true);
    };

    const onHideDialog = () => {
        setDisplayDialog(false);
    };

    const renderPlaceordercontent=()=>{
        return(<div>
            
        </div>);
    };

    const renderDialogContent = () => {
        return (
            <div>
                <div className="d-flex justify-content-center">
                    <div className="d-flex">
                        <span className="p-input-icon-left">
                            <label htmlFor='Shipping'>Shipping Address</label>
                            <InputText id='Shipping' value={selectedGridData.Shipping} />
                        </span>
                    </div>
                    <div className="d-flex">
                        <span className="p-input-icon-right">
                            <label htmlFor='Billing'>Billing Address</label>
                            <InputText id='Billing' value={selectedGridData.Billing} />
                        </span>
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
                    <Button label="Place Order" icon="pi pi-check" className="p-button-success" onClick={openplaceorder} />
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
                                {availableVendors.map((ven) => (
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