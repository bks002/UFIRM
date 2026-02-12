
import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { getCategories, fetchFilteredItems, getVendors, fetchFilteredRate } from "../../Services/InventoryService";
import { useSelector } from "react-redux";
import POQuantityComponent from './POQuantityComponent';
const PurchaseOrderPage = () => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [Items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [allVendors, setAllVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
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
        Quantity:0,
        TotalAmount: 0,
        BillingAddress: "N/A",
        ShippingAddress: "N/A",
    };
    const [filteredGridData, setFilteredGridData] = useState([emptyallGridData]);
    const [selectedGridData, setSelectedGridData] = useState([]);
    const [displayDialog, setDisplayDialog] = useState(false);
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

    const Ratetemplate = (rowData) => {
        return rowData.Price ? <span>{`₹${rowData.Price} /${rowData.MeasurementUnit}`}</span> : null;
    };


    const openDialog = () => {
        if (selectedGridData.length > 0) {
            setDisplayDialog(true);
        }
    };

    const onHideDialog = () => {
        setDisplayDialog(false);
        setSelectedGridData([]);
    };

    const selectedSubtotal = selectedGridData.reduce((sum, row) => {
        const amount = (row?.Price || 0) * (row?.Quantity || 0);
        return sum + amount;
    }, 0);

    return (
        <div>
            <Toast ref={toast} />
            <style>{`
                .po-create-shell {
                    max-height: 72vh;
                    overflow-y: auto;
                    padding-right: 4px;
                }
                .po-create-note {
                    color: #6e7f8e;
                    font-size: 12px;
                    margin-bottom: 12px;
                }
                .po-create-section-title {
                    color: #233a4d;
                    font-size: 28px;
                    font-weight: 700;
                    margin: 0 0 14px 0;
                }
                .po-create-block-title {
                    color: #22384c;
                    font-size: 28px;
                    font-weight: 700;
                    margin: 18px 0 10px 0;
                }
                .po-create-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(180px, 1fr));
                    gap: 12px;
                }
                .po-create-field label {
                    font-size: 11px;
                    font-weight: 700;
                    color: #718393;
                    text-transform: uppercase;
                    margin-bottom: 5px;
                    display: block;
                }
                .po-create-field .form-control {
                    height: 36px;
                    border: 1px solid #d5e3ed;
                    border-radius: 7px;
                    font-size: 12px;
                }
                .po-create-table-wrap {
                    border: 1px solid #d7e4ee;
                    border-radius: 8px;
                    overflow: hidden;
                    margin-top: 10px;
                }
                .po-create-summary {
                    border-top: 1px solid #d7e4ee;
                    padding-top: 10px;
                    margin-top: 10px;
                    display: grid;
                    grid-template-columns: 1fr auto;
                    row-gap: 6px;
                    column-gap: 14px;
                    font-size: 13px;
                }
                .po-create-summary strong {
                    color: #22384c;
                }
                .po-create-footer {
                    margin-top: 14px;
                    display: flex;
                    justify-content: flex-end;
                }
                .po-create-btn {
                    border-radius: 7px !important;
                    padding: 8px 14px !important;
                    font-size: 12px !important;
                    font-weight: 600 !important;
                    border: 1px solid #2f9cff !important;
                    background: #2f9cff !important;
                }
                .po-create-dialog .p-dialog-header {
                    border-bottom: 1px solid #d7e4ee;
                    background: #f9fbfd;
                }
                .po-create-dialog .p-dialog-title {
                    color: #233a4d;
                    font-weight: 700;
                }
                @media (max-width: 900px) {
                    .po-create-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
            <section className="content po-create-shell">
                <div>
                    <h3 className="po-create-section-title">Purchase Order</h3>
                    <div className="po-create-note">
                        Select vendor and item rates, then continue to quantity and final confirmation.
                    </div>

                    <div className="po-create-grid">
                        <div className="po-create-field">
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
                        <div className="po-create-field">
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
                        <div className="po-create-field">
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

                    <h4 className="po-create-block-title">Order Items</h4>
                    <div className="po-create-table-wrap">
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
                            <Column field='VendorId' header="Vendor Id" />
                            <Column field='ItemName' header="Item" />
                            <Column field='Description' header="Item Description" />
                            <Column field='BrandName' header="Brand" />
                            <Column body={Ratetemplate} header="Price" />
                            <Column selectionMode="multiple" header={<div className='px-2'>Select</div>} />
                        </DataTable>
                    </div>

                    <div className="po-create-summary">
                        <span>Subtotal</span>
                        <span>₹{selectedSubtotal.toLocaleString("en-IN")}</span>
                        <strong>Total</strong>
                        <strong>₹{selectedSubtotal.toLocaleString("en-IN")}</strong>
                    </div>

                    <h4 className="po-create-block-title" style={{ fontSize: '32px', marginTop: '18px' }}>
                        Shipping Information
                    </h4>

                    <div className="po-create-footer">
                        <Button
                            label="Create Purchase Order"
                            icon="pi pi-plus"
                            className="po-create-btn"
                            onClick={openDialog}
                            disabled={selectedGridData.length === 0}
                        />
                    </div>
                </div>
            </section>

            <Dialog
                visible={displayDialog}
                onHide={onHideDialog}
                modal
                style={{ width: '90vw', height: '90vh' }}
                className="po-create-dialog"
                header="New Purchase Order"
            >
                <POQuantityComponent selectedGridData={selectedGridData} filteredGridData={filteredGridData}/>
            </Dialog>

        </div>
    );
};
export default PurchaseOrderPage;