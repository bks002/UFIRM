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
            } catch {
                setFilteredGridData([]);
            }
        };

        const fetchCategoriesAsync = async () => {
            try {
                const cats = await getCategories(propertyId);
                setCategories(cats || []);
            } catch {
                setCategories([]);
            }
        };

        fetchStock();
        fetchCategoriesAsync();
    }, [propertyId]);

    const displayedData = selectedCategory
        ? filteredGridData.filter(item => item.CategoryId === selectedCategory)
        : filteredGridData;

    if (!propertyId || propertyId === 0) return null;

    // 🔹 CATEGORY SPLIT (ONLY LOGIC CHANGE)
    const MAX_VISIBLE = 5;
    const visibleCategories = categories.slice(0, MAX_VISIBLE);
    const moreCategories = categories.slice(MAX_VISIBLE);

    const filteredDialogItems = addQtyDialogCategory
        ? filteredGridData.filter(item => item.CategoryId === addQtyDialogCategory)
        : filteredGridData;

    const itemOptions = filteredDialogItems.map(item => ({
        label: `${item.ItemName} (${item.ItemDescription})`,
        value: item.ItemId,
    }));

    const selectedItemObj = filteredGridData.find(i => i.ItemId === selectedItem);

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
                <div className="row">
                    <div className="col d-flex align-items-center">
                        <h1 className="m-0 pl-3 text-dark" style={{ flex: 1 }}>Stock Page</h1>
                        <Button label="Add Quantity" icon="pi pi-plus" className="p-button-success"
                            onClick={() => setShowAddQtyDialog(true)} style={{ marginLeft: 16 }} />
                    </div>
                </div>
            </div>

            <Dialog header="Add Quantity to Item" visible={showAddQtyDialog} style={{ width: '400px' }} modal
                onHide={() => setShowAddQtyDialog(false)} footer={dialogFooter}>
                <div className="p-fluid">
                    <div className="p-field" style={{ marginBottom: 16 }}>
                        <label>Select Category</label>
                        <Dropdown
                            value={addQtyDialogCategory}
                            options={[{ label: 'All', value: null }, ...categories.map(c => ({ label: c.Name, value: c.Id }))]}
                            onChange={e => { setAddQtyDialogCategory(e.value); setSelectedItem(null); }}
                            showClear
                        />
                    </div>

                    <div className="p-field" style={{ marginBottom: 16 }}>
                        <label>Select Item</label>
                        <Dropdown value={selectedItem} options={itemOptions}
                            onChange={e => setSelectedItem(e.value)} filter showClear />
                    </div>

                    <div className="p-field" style={{ marginBottom: 16 }}>
                        <label>Quantity to Add</label>
                        <InputNumber value={addQty} onValueChange={e => setAddQty(e.value)} min={1} showButtons />
                    </div>

                    {selectedItemObj && (
                        <div style={{ fontSize: 13, color: '#888' }}>
                            Current Quantity: {selectedItemObj.CurrentQty}
                        </div>
                    )}
                </div>
            </Dialog>

            {/* 🔹 CATEGORY BAR (UI SAME, ONLY ⋮ ADDED) */}
            <div className="scroll-container" style={{ overflowX: 'auto', whiteSpace: 'nowrap', padding: '0 16px' }}>
                <div className="scroll-row" style={{ display: 'inline-flex', gap: 5 }}>

                    <Button
                        label="All"
                        className={`p-button-rounded category-btn ${selectedCategory === null ? 'category-btn-active' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                        style={{ minWidth: 120 }}
                    />

                    {visibleCategories.map(cat => (
                        <Button
                            key={cat.Id}
                            label={cat.Name}
                            className={`p-button-rounded category-btn ${selectedCategory === cat.Id ? 'category-btn-active' : ''}`}
                            onClick={() => setSelectedCategory(cat.Id)}
                            style={{ minWidth: 120 }}
                        />
                    ))}

                    {moreCategories.length > 0 && (
                        <Dropdown
                            value={selectedCategory}
                            options={moreCategories.map(cat => ({ label: cat.Name, value: cat.Id }))}
                            onChange={e => setSelectedCategory(e.value)}
                            placeholder="⋮"
                            style={{ width: 60 }}
                        />
                    )}
                </div>
            </div>

            {/* ITEM LIST — NO CHANGE */}
            <div className="item-list" style={{ marginLeft: 32, marginTop: 10 }}>
                {displayedData.map(item => {
                    const received = item.CurrentQty || 0;
                    const minStock = item.MinStockLevel || 1;
                    const maxQty = 10 * minStock;
                    const receivedPercent = Math.min(received / maxQty, 1);

                    return (
                        <div key={item.ItemId} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{ fontWeight: 'bold', fontSize: 17, minWidth: 120, textAlign: 'right' }}>
                                {item.ItemName} :
                            </div>

                            <div style={{ height: 32, width: 900, background: '#eee', borderRadius: 8, position: 'relative' }}>
                                <div style={{
                                    width: `${receivedPercent * 100}%`,
                                    background: received < minStock ? '#FF0000' : '#43a047',
                                    height: '100%'
                                }} />

                                <div style={{
                                    position: 'absolute', inset: 0, display: 'flex',
                                    justifyContent: 'space-between', alignItems: 'center',
                                    padding: '0 8px', fontSize: 14
                                }}>
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
