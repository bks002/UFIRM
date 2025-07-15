import React, { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { getCategories } from '../../Services/InventoryService';
import { useSelector } from "react-redux";
import { getStock } from '../../Services/InventoryService';

const StockMaster = () => {
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
        CategoryId: 0,
        PropertyId: propertyId,
    };
    const [filteredGridData, setFilteredGridData] = useState([emptyallGridData]);
    const propertyId = useSelector((state) => state.Commonreducer.puidn);
    const toast = useRef(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);


    useEffect(() => {
        if (!propertyId) {
            setFilteredGridData([]);
            setCategories([]);
            return;
        }

        // Fetch stock
        const fetchStock = async () => {
            try {
                const stockData = await getStock(propertyId);
                // Optional: Deduplicate by ItemId
                const uniqueStock = Array.isArray(stockData)
                    ? Array.from(new Map(stockData.map(item => [item.ItemId, item])).values())
                    : [];
                setFilteredGridData(uniqueStock);
            } catch (error) {
                setFilteredGridData([]);
            }
        };

        // Fetch categories
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

    // Filter items by selected category
    const displayedData = selectedCategory
      ? filteredGridData.filter(item => item.CategoryId === selectedCategory)
      : filteredGridData;

    if (!propertyId || propertyId === 0) {
        return null;
    }

    return (
        <div className="content-wrapper">
            <Toast ref={toast} />
            <div className="content-header">
                <div>
                    <div className="row ">
                        <div className="col">
                            <h1 className="m-0 pl-3 text-dark">Stock Page</h1>
                        </div>
                    </div>
                </div>
            </div>
            {/* Category Scroll Bar */}
            <div className="category-scrollbar mb-3 ml-3" style={{ display: 'flex', overflowX: 'auto', paddingBottom: 8, gap: 12, scrollBehavior: 'smooth' }}>
                <Button
                    label="All"
                    className={`p-button-rounded mr-2 category-btn ${selectedCategory === null ? 'category-btn-active' : ''}`}
                    onClick={() => setSelectedCategory(null)}
                    style={{ minWidth: 120, marginRight: 8, whiteSpace: 'nowrap', boxShadow: selectedCategory === null ? '0 2px 8px rgba(0,0,0,0.12)' : 'none', fontWeight: selectedCategory === null ? 'bold' : 'normal', transition: 'box-shadow 0.2s, font-weight 0.2s' }}
                />
                {categories && categories.map((cat) => (
                    <Button
                        key={cat.Id}
                        label={cat.Name}
                        className={`p-button-rounded mr-2 category-btn ${selectedCategory === cat.Id ? 'category-btn-active' : ''}`}
                        onClick={() => setSelectedCategory(cat.Id)}
                        style={{ minWidth: 120, marginRight: 8, whiteSpace: 'nowrap', boxShadow: selectedCategory === cat.Id ? '0 2px 8px rgba(0,0,0,0.18)' : 'none', fontWeight: selectedCategory === cat.Id ? 'bold' : 'normal', transition: 'box-shadow 0.2s, font-weight 0.2s' }}
                    />
                ))}
            </div>
            {/* Item List */}
            <div className="item-list" style={{ marginLeft: 32 }}>
                {displayedData && displayedData.length > 0 && displayedData.map((item) => {
                    const received = item.CurrentQty || 0;
                    const minStock = item.MinStockLevel || 1; 
                    const maxQty = 10 * minStock;
                    const barWidth = 300;
                    const receivedPercent = Math.min(received / maxQty, 1);
                    const receivedWidth = barWidth * receivedPercent;
                    const remainingWidth = barWidth - receivedWidth;
                    return (
                        <div key={item.ItemId} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 18 }}>
                            <div style={{ fontWeight: 'bold', fontSize: 17, minWidth: 120 }}>{item.ItemName}</div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: 32,
                                    width: barWidth,
                                    borderRadius: 8,
                                    overflow: 'visible', // <-- changed from 'hidden'
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                                    background: '#eee',
                                    position: 'relative'
                                }}
                            >
                                <div
                                    className="bar-received"
                                    style={{ width: receivedWidth, background: '#43a047', height: '100%', pointerEvents: 'auto' }}
                                    data-tooltip={`Received: ${received}`}
                                ></div>
                                <div
                                    className="bar-remaining"
                                    style={{ width: remainingWidth, background: '#bdbdbd', left: receivedWidth, height: '100%', pointerEvents: 'auto' }}
                                    data-tooltip={`Remaining: ${Math.max(maxQty - received, 0)}`}
                                ></div>
                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: receivedWidth > barWidth / 2 ? '#fff' : '#333', fontWeight: 500, fontSize: 14, zIndex: 3, whiteSpace: 'nowrap' }}>{item.ItemDescription}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StockMaster;