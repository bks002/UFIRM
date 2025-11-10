import React, { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { getCategories, getStock } from '../../Services/InventoryService';
import { useSelector } from "react-redux";
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';

const StockMaster = () => {
    const propertyId = useSelector((state) => state.Commonreducer.puidn);
    const emptyallGridData = {
        PropertyId: propertyId,
        ItemName: "N/A",
        Quantity: 0,
        Description: "N/A",
        CategoryName: "N/A",
        CurrentQty: 0,
        MinStockLevel: 0,
        StockId: 0,
        ItemId: 0,
        ItemDescription: "N/A",
        BrandName: "N/A",
        CategoryId: 0,
        PropertyId: propertyId,
    };
    const [filteredGridData, setFilteredGridData] = useState([emptyallGridData]);
    const toast = useRef(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showAddQtyDialog, setShowAddQtyDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [addQty, setAddQty] = useState(0);
    const [addQtyDialogCategory, setAddQtyDialogCategory] = useState(null);


    useEffect(() => {
        if (!propertyId) {
            setFilteredGridData([]);
            setCategories([]);
            return;
        }

        const fetchStock = async () => {
            try {
                const stockData = await getStock(propertyId);
                const uniqueStock = Array.isArray(stockData)
                    ? Array.from(new Map(stockData.map(item => [item.ItemId, item])).values())
                    : [];
                setFilteredGridData(uniqueStock);
            } catch (error) {
                setFilteredGridData([]);
            }
        };

        const fetchCategoriesAsync = async () => {
            try {
                const cats = await getCategories(propertyId);
                setCategories(cats || []);
            } catch (error) {
                setCategories([]);
            }
        };

        fetchStock();
        fetchCategoriesAsync();
    }, [propertyId]);

    const displayedData = selectedCategory
        ? filteredGridData.filter(item => item.CategoryId === selectedCategory)
        : filteredGridData;

    if (!propertyId || propertyId === 0) {
        return null;
    }

    // Prepare dropdown options for items, filtered by selected category in dialog
    const filteredDialogItems = addQtyDialogCategory
        ? filteredGridData.filter(item => item.CategoryId === addQtyDialogCategory)
        : filteredGridData;
    const itemOptions = filteredDialogItems.map(item => ({
        label: `${item.ItemName} (${item.ItemDescription})`,
        value: item.ItemId,
        item: item
    }));

    // Find the selected item object
    const selectedItemObj = filteredGridData.find(i => i.ItemId === selectedItem);

    // Dialog footer
    const dialogFooter = (
        <div>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setShowAddQtyDialog(false)} />
            <Button label="Add Quantity" icon="pi pi-check" onClick={() => setShowAddQtyDialog(false)} autoFocus />
        </div>
    );

    return (
        <div className="content-wrapper">
            <Toast ref={toast} />
            <div className="content-header">
                <div>
                    <div className="row ">
                        <div className="col d-flex align-items-center">
                            <h1 className="m-0 pl-3 text-dark" style={{ flex: 1 }}>Stock Page</h1>
                            <Button label="Add Quantity" icon="pi pi-plus" className="p-button-success" onClick={() => setShowAddQtyDialog(true)} style={{ marginLeft: 16 }} />
                        </div>
                    </div>
                </div>
            </div>
            <Dialog header="Add Quantity to Item" visible={showAddQtyDialog} style={{ width: '400px' }} modal onHide={() => setShowAddQtyDialog(false)} footer={dialogFooter}>
                <div className="p-fluid">
                    <div className="p-field" style={{ marginBottom: 16 }}>
                        <label htmlFor="categorySelect">Select Category</label>
                        <Dropdown
                            id="categorySelect"
                            value={addQtyDialogCategory}
                            options={[
                                { label: 'All', value: null },
                                ...categories.map(cat => ({ label: cat.Name, value: cat.Id }))
                            ]}
                            onChange={e => {
                                setAddQtyDialogCategory(e.value);
                                setSelectedItem(null); // Reset item selection when category changes
                            }}
                            placeholder="Select a category"
                            showClear
                        />
                    </div>
                    <div className="p-field" style={{ marginBottom: 16 }}>
                        <label htmlFor="itemSelect">Select Item</label>
                        <Dropdown id="itemSelect" value={selectedItem} options={itemOptions} onChange={e => setSelectedItem(e.value)} placeholder="Select an item" filter showClear optionLabel="label" />
                    </div>
                    <div className="p-field" style={{ marginBottom: 16 }}>
                        <label htmlFor="qtyInput">Quantity to Add</label>
                        <InputNumber id="qtyInput" value={addQty} onValueChange={e => setAddQty(e.value)} min={1} showButtons />
                    </div>
                    {selectedItemObj && (
                        <div style={{ fontSize: 13, color: '#888' }}>
                            Current Quantity: {selectedItemObj.CurrentQty}
                        </div>
                    )}
                </div>
            </Dialog>
            <div
                className="scroll-container"
                style={{
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    padding: '0 16px',
                    msOverflowStyle: 'none', 
                    scrollbarWidth: 'none'
                }}
            >
                <div
                    className="scroll-row"
                    style={{
                        display: 'inline-flex',
                        gap: 5,
                    }}
                >
                    <Button
                        label="All"
                        className={`p-button-rounded category-btn ${selectedCategory === null ? 'category-btn-active' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                        style={{
                            minWidth: 120,
                            whiteSpace: 'nowrap',
                            boxShadow: selectedCategory === null ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                            fontWeight: selectedCategory === null ? 'bold' : 'normal',
                            transition: 'box-shadow 0.2s, font-weight 0.2s',
                        }}
                    />
                    {categories.map((cat) => (
                        <Button
                            key={cat.Id}
                            label={cat.Name}
                            className={`p-button-rounded category-btn ${selectedCategory === cat.Id ? 'category-btn-active' : ''}`}
                            onClick={() => setSelectedCategory(cat.Id)}
                            style={{
                                minWidth: 120,
                                whiteSpace: 'nowrap',
                                boxShadow: selectedCategory === cat.Id ? '0 2px 8px rgba(0,0,0,0.18)' : 'none',
                                fontWeight: selectedCategory === cat.Id ? 'bold' : 'normal',
                                transition: 'box-shadow 0.2s, font-weight 0.2s',
                            }}
                        />
                    ))}
                </div>
            </div>
            <div className="item-list" style={{ marginLeft: 32, marginTop: 10 }}>
                {displayedData && displayedData.length > 0 && displayedData.map((item) => {
                    const received = item.CurrentQty || 0;
                    const minStock = item.MinStockLevel || 1;
                    const maxQty = 10 * minStock;
                    const barWidth = 900;
                    const receivedPercent = Math.min(received / maxQty, 1);
                    return (
                        <div key={item.ItemId} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{ fontWeight: 'bold', fontSize: 17, minWidth: 120, textAlign: 'right' }}>{item.ItemName} :</div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: 32,
                                    width: barWidth,
                                    borderRadius: 8,
                                    background: '#eee',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    style={{
                                        width: `${receivedPercent * 100}%`,
                                        background: received<minStock ? '#FF0000': '#43a047',
                                        height: '100%',
                                    }}
                                ></div>
                                {received < maxQty && (
                                    <div
                                        style={{
                                            width: `${(1 - receivedPercent) * 100}%`,
                                            background: '#bdbdbd',
                                            height: '100%',
                                        }}
                                    ></div>
                                )}
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingLeft: 8,
                                        paddingRight: 8,
                                        color: receivedPercent > 0.4 ? '#fff' : '#333',
                                        fontWeight: 500,
                                        fontSize: 14,
                                        zIndex: 2,
                                    }}
                                >
                                    <span>{item.ItemDescription} | {item.BrandName}</span>
                                    <span>Quantity: {received}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StockMaster;