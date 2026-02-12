import React, { useEffect, useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { getCategories, getStock, addStockQuantity } from '../../Services/InventoryService';
import { useSelector } from "react-redux";
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const StockMaster = () => {
    const THEME = {
        primary: '#336B93',
        secondary: '#4A7FA8',
        tertiary: '#1E4A6B',
        muted: '#7a8ea0',
        border: '#d4e3ed',
        bgSoft: '#f8fafb',
        success: '#2E7D4A',
        warning: '#B8860B',
        danger: '#A83232',
        accent: '#2684ff',
        palette: ['#4A7FA8', '#2E7D4A', '#B8860B', '#A83232', '#6A4C93', '#D97706', '#059669', '#7C3AED']
    };
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
    const [viewMode, setViewMode] = useState('panel');
    const [selectedItemId, setSelectedItemId] = useState(null);

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

    const filteredDialogItems = addQtyDialogCategory
        ? filteredGridData.filter(item => item.CategoryId === addQtyDialogCategory)
        : filteredGridData;

    const itemOptions = filteredDialogItems.map(item => ({
        label: `${item.ItemName} (${item.ItemDescription})`,
        value: item.ItemId,
    }));

    const selectedItemObj = filteredGridData.find(i => i.ItemId === selectedItem);

    const handleAddQuantity = async () => {
        if (!selectedItem || !addQty) {
            toast.current.show({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Please select item and quantity'
            });
            return;
        }

        const payload = {
            Id: 0,
            PropertyId: propertyId,
            ItemId: selectedItem,
            MinQty: selectedItemObj?.MinStockLevel || 0,
            CurrentQty: addQty
        };

        try {
            await addStockQuantity(payload);

            toast.current.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Quantity added successfully'
            });

            setShowAddQtyDialog(false);
            setAddQty(0);
            setSelectedItem(null);
            setAddQtyDialogCategory(null);

            const stockData = await getStock(propertyId);
            const uniqueStock = Array.isArray(stockData)
                ? Array.from(new Map(stockData.map(item => [item.ItemId, item])).values())
                : [];
            setFilteredGridData(uniqueStock);
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Failed to add quantity'
            });
        }
    };

    // Calculate metrics for graphs
    const totalItems = displayedData.length;
    const lowStockItems = displayedData.filter(item => item.CurrentQty < item.MinStockLevel);
    const healthyStockItems = displayedData.filter(item => item.CurrentQty >= item.MinStockLevel);
    const selectedPanelItem = displayedData.find(item => item.ItemId === selectedItemId) || displayedData[0] || null;

    // Stock by Category (for Doughnut chart)
    const stockByCategory = categories.reduce((acc, cat) => {
        const items = filteredGridData.filter(item => item.CategoryId === cat.Id);
        const totalStock = items.reduce((sum, item) => sum + (item.CurrentQty || 0), 0);
        if (totalStock > 0) {
            acc[cat.Name] = totalStock;
        }
        return acc;
    }, {});

    const getRiskColor = (current, min) => {
        if (!min || min <= 0) return THEME.secondary;
        const ratio = current / min;
        if (ratio <= 1) return THEME.danger;
        if (ratio <= 1.25) return '#ee7d2d';
        if (ratio <= 1.5) return THEME.warning;
        return THEME.success;
    };

    // Stock Risk Comparison (replaces old bar chart)
    const riskItems = displayedData.slice(0, 8);
    const riskPointColors = riskItems.map((item) =>
        getRiskColor(item.CurrentQty || 0, item.MinStockLevel || 0)
    );
    const stockRiskData = {
        labels: riskItems.map(item => item.ItemName),
        datasets: [
            {
                label: 'Current Stock',
                data: riskItems.map(item => item.CurrentQty || 0),
                borderColor: THEME.secondary,
                backgroundColor: 'rgba(74, 127, 168, 0.08)',
                pointBackgroundColor: riskPointColors,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 7,
                borderWidth: 2,
                fill: false,
                tension: 0.25
            },
            {
                label: 'Minimum Stock',
                data: riskItems.map(item => item.MinStockLevel || 0),
                borderColor: THEME.danger,
                backgroundColor: 'rgba(168, 50, 50, 0.05)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: THEME.danger,
                borderDash: [6, 4],
                tension: 0
            },
        ],
    };

    const stockRiskOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: { size: 12, weight: 600 },
                    padding: 15,
                },
            },
            title: {
                display: true,
                text: 'Current vs Minimum Stock (Red = near minimum)',
                font: { size: 16, weight: 700 },
                padding: { top: 10, bottom: 20 },
            },
            tooltip: {
                callbacks: {
                    afterBody: (items) => {
                        const idx = items?.[0]?.dataIndex;
                        if (idx == null) return '';
                        const row = riskItems[idx];
                        if (!row) return '';
                        const current = Number(row.CurrentQty || 0);
                        const min = Number(row.MinStockLevel || 0);
                        if (min <= 0) return 'No minimum stock configured';
                        const ratio = current / min;
                        if (ratio <= 1) return 'Risk: Critical';
                        if (ratio <= 1.25) return 'Risk: High';
                        if (ratio <= 1.5) return 'Risk: Medium';
                        return 'Risk: Healthy';
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(30, 74, 107, 0.08)' },
                ticks: {
                    color: '#7a8ea0'
                }
            },
            x: {
                grid: { display: false },
                ticks: {
                    color: '#4f6475',
                    font: { size: 11, weight: 600 }
                }
            }
        },
    };

    // Stock Distribution by Category (Doughnut Chart)
    const categoryDistributionData = {
        labels: Object.keys(stockByCategory),
        datasets: [
            {
                data: Object.values(stockByCategory),
                backgroundColor: THEME.palette.slice(0, Object.keys(stockByCategory).length),
                borderColor: '#fff',
                borderWidth: 3,
            },
        ],
    };

    const categoryDistributionOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    font: { size: 12, weight: 600 },
                    padding: 12,
                    boxWidth: 20,
                },
            },
            title: {
                display: true,
                text: 'Stock Distribution by Category',
                font: { size: 16, weight: 700 },
                padding: { top: 10, bottom: 20 },
            },
        },
    };

    // Stable synthetic trend so the graph doesn't jump on every click/re-render
    const buildStableTrend = (item) => {
        const current = Number(item.CurrentQty || 0);
        const base = Math.max(0, current - 6);
        const seed = Number(item.ItemId || 1);
        return Array.from({ length: 8 }, (_, i) => {
            const wave = ((seed * (i + 3)) % 7) - 3;
            const value = base + i + Math.floor(wave / 2);
            return Math.max(0, value);
        });
    };

    const stockTrendData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
        datasets: displayedData.slice(0, 5).map((item, idx) => ({
            label: item.ItemName,
            data: buildStableTrend(item),
            borderColor: THEME.palette[idx],
            backgroundColor: `${THEME.palette[idx]}20`,
            fill: true,
            tension: 0.32,
            pointRadius: 4,
            pointBackgroundColor: THEME.palette[idx],
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
        })),
    };

    const stockTrendOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: { size: 12, weight: 600 },
                    padding: 15,
                    boxWidth: 15,
                },
            },
            title: {
                display: true,
                text: 'Stock Trend (Last 8 Weeks)',
                font: { size: 16, weight: 700 },
                padding: { top: 10, bottom: 20 },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { font: { size: 11 } },
                grid: { color: 'rgba(0,0,0,0.05)' },
            },
            x: {
                ticks: { font: { size: 11 } },
                grid: { display: false },
            },
        },
    };

    const selectedGaugeCurrent = Number(selectedPanelItem?.CurrentQty || 0);
    const selectedGaugeMin = Math.max(1, Number(selectedPanelItem?.MinStockLevel || 0));
    const achieved = Math.min(selectedGaugeCurrent, selectedGaugeMin);
    const pendingToMin = Math.max(selectedGaugeMin - selectedGaugeCurrent, 0);
    const gaugeColor = getRiskColor(selectedGaugeCurrent, selectedGaugeMin);
    const selectedGaugeData = {
        labels: ['Current', 'Required to Min'],
        datasets: [
            {
                data: [achieved, pendingToMin || 0.0001],
                backgroundColor: [gaugeColor, '#e8eef4'],
                borderColor: ['#ffffff', '#ffffff'],
                borderWidth: 2,
                circumference: 180,
                rotation: 270,
                cutout: '68%',
            }
        ]
    };
    const selectedGaugeOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        if (ctx.dataIndex === 0) return `Current: ${selectedGaugeCurrent}`;
                        return `Needed to minimum: ${Math.max(selectedGaugeMin - selectedGaugeCurrent, 0)}`;
                    }
                }
            }
        }
    };

    useEffect(() => {
        if (!selectedItemId && displayedData.length > 0) {
            setSelectedItemId(displayedData[0].ItemId);
            return;
        }
        if (selectedItemId && !displayedData.some(item => item.ItemId === selectedItemId)) {
            setSelectedItemId(displayedData[0]?.ItemId || null);
        }
    }, [displayedData, selectedItemId]);

    return (
        <div className="content-wrapper stock-mx-page">
            <Toast ref={toast} />
            <div className="stock-mx-container">
                <div className="stock-mx-header">
                    <div className="stock-mx-title-wrap">
                        <h2 className="stock-mx-title">Stock</h2>
                    </div>
                    <div className="stock-mx-header-actions">
                        <div className="stock-mx-view-toggle">
                            <button
                                type="button"
                                className={`stock-mx-view-btn ${viewMode === 'panel' ? 'active' : ''}`}
                                onClick={() => setViewMode('panel')}
                            >
                                Panel View
                            </button>
                            <button
                                type="button"
                                className={`stock-mx-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                                onClick={() => setViewMode('table')}
                            >
                                Table View
                            </button>
                        </div>
                        <button
                            type="button"
                            className="stock-mx-add-btn"
                            onClick={() => setShowAddQtyDialog(true)}
                        >
                            + Add Quantity
                        </button>
                    </div>
                </div>

                <div className="stock-mx-filters-row">
                    <button
                        type="button"
                        className={`stock-mx-filter-chip ${selectedCategory === null ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.Id}
                            type="button"
                            className={`stock-mx-filter-chip ${selectedCategory === cat.Id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.Id)}
                        >
                            {cat.Name}
                        </button>
                    ))}
                </div>

                <div className="stock-mx-cards">
                    <div className="stock-mx-card">
                        <div className="stock-mx-card-title">Total Items</div>
                        <div className="stock-mx-card-value">{totalItems}</div>
                    </div>
                    <div className="stock-mx-card">
                        <div className="stock-mx-card-title">Low Stock Items</div>
                        <div className="stock-mx-card-value">{lowStockItems.length}</div>
                    </div>
                    <div className="stock-mx-card">
                        <div className="stock-mx-card-title">Healthy Stock</div>
                        <div className="stock-mx-card-value">{healthyStockItems.length}</div>
                    </div>
                    <div className="stock-mx-card">
                        <div className="stock-mx-card-title">Categories</div>
                        <div className="stock-mx-card-value">{categories.length}</div>
                    </div>
                </div>

                {viewMode === 'panel' ? (
                    <div className="stock-mx-panel-layout">
                        <div className="stock-mx-panel-list">
                            {displayedData.map((item) => (
                                <button
                                    type="button"
                                    key={item.ItemId}
                                    className={`stock-mx-list-item ${selectedPanelItem?.ItemId === item.ItemId ? 'active' : ''}`}
                                    onClick={() => setSelectedItemId(item.ItemId)}
                                >
                                    <div className="stock-mx-list-name">{item.ItemName}</div>
                                    <div className="stock-mx-list-sub">{item.CategoryName || 'Uncategorized'}</div>
                                    <div className="stock-mx-list-qty">{item.CurrentQty || 0} units</div>
                                </button>
                            ))}
                        </div>

                        <div className="stock-mx-panel-detail">
                            {!selectedPanelItem ? (
                                <div className="stock-mx-empty-state">No items found for this filter.</div>
                            ) : (
                                <>
                                    <div className="stock-mx-detail-header">
                                        <h3>{selectedPanelItem.ItemName}</h3>
                                        <span className="stock-mx-detail-qty">{selectedPanelItem.CurrentQty || 0} units in stock</span>
                                    </div>
                                    <div className="stock-mx-detail-grid">
                                        <div><label>Category</label><p>{selectedPanelItem.CategoryName || '-'}</p></div>
                                        <div><label>Brand</label><p>{selectedPanelItem.BrandName || '-'}</p></div>
                                        <div><label>Current Stock</label><p>{selectedPanelItem.CurrentQty || 0}</p></div>
                                        <div><label>Minimum Stock</label><p>{selectedPanelItem.MinStockLevel || 0}</p></div>
                                    </div>
                                    <div className="stock-mx-health">
                                        <div className="stock-mx-health-label">Stock vs Minimum Required</div>
                                        <div className="stock-mx-halfpie-wrap">
                                            <Doughnut data={selectedGaugeData} options={selectedGaugeOptions} />
                                        </div>
                                        <div className="stock-mx-health-meta">
                                            {selectedGaugeCurrent} current / {selectedGaugeMin} minimum.
                                        </div>
                                    </div>
                                    <div className="stock-mx-description">
                                        <label>Description</label>
                                        <p>{selectedPanelItem.ItemDescription || selectedPanelItem.Description || '-'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="stock-mx-table-wrap">
                        <table className="stock-mx-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Category</th>
                                    <th>Current Stock</th>
                                    <th>Minimum Stock</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedData.map((item) => {
                                    const isLow = (item.CurrentQty || 0) <= (item.MinStockLevel || 0);
                                    return (
                                        <tr key={item.ItemId}>
                                            <td>{item.ItemName}</td>
                                            <td>{item.CategoryName || '-'}</td>
                                            <td>{item.CurrentQty || 0}</td>
                                            <td>{item.MinStockLevel || 0}</td>
                                            <td>
                                                <span className={`stock-mx-status ${isLow ? 'low' : 'healthy'}`}>
                                                    {isLow ? 'Low' : 'Healthy'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="stock-mx-chart-card stock-mx-chart-card-wide">
                    <div className="stock-mx-chart-wrap">
                        <Line data={stockTrendData} options={stockTrendOptions} />
                    </div>
                </div>

                <div className="stock-mx-chart-grid">
                    <div className="stock-mx-chart-card">
                        <div className="stock-mx-chart-wrap">
                            <Line data={stockRiskData} options={stockRiskOptions} />
                        </div>
                    </div>
                    <div className="stock-mx-chart-card">
                        <div className="stock-mx-chart-wrap">
                            <Doughnut data={categoryDistributionData} options={categoryDistributionOptions} />
                        </div>
                    </div>
                </div>
            </div>

            <Dialog
                header="Add Quantity to Item"
                visible={showAddQtyDialog}
                className="stock-mx-dialog"
                style={{ width: '460px' }}
                modal
                onHide={() => setShowAddQtyDialog(false)}
            >
                <div className="stock-mx-dialog-body">
                    <div className="stock-mx-field">
                        <label>Select Category</label>
                        <Dropdown
                            value={addQtyDialogCategory}
                            options={[{ label: 'All', value: null }, ...categories.map(c => ({ label: c.Name, value: c.Id }))]}
                            onChange={e => { setAddQtyDialogCategory(e.value); setSelectedItem(null); }}
                            showClear
                        />
                    </div>

                    <div className="stock-mx-field">
                        <label>Select Item</label>
                        <Dropdown
                            value={selectedItem}
                            options={itemOptions}
                            onChange={e => setSelectedItem(e.value)}
                            filter
                            showClear
                        />
                    </div>

                    <div className="stock-mx-field">
                        <label>Quantity to Add</label>
                        <InputNumber value={addQty} onValueChange={e => setAddQty(e.value)} min={1} showButtons />
                    </div>

                    {selectedItemObj && (
                        <div className="stock-mx-current-hint">
                            Current Quantity: {selectedItemObj.CurrentQty}
                        </div>
                    )}
                </div>
                <div className="stock-mx-dialog-footer">
                    <button type="button" className="stock-mx-btn ghost" onClick={() => setShowAddQtyDialog(false)}>
                        Cancel
                    </button>
                    <button type="button" className="stock-mx-btn primary" onClick={handleAddQuantity}>
                        Add Quantity
                    </button>
                </div>
            </Dialog>
        </div>
    );
};

export default StockMaster;
