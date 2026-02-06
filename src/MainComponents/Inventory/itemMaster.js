import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import swal from 'sweetalert';
import { ToastContainer } from 'react-toastify';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import * as appCommon from '../../Common/AppCommon.js';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import { useSelector, useDispatch } from 'react-redux';
import { createItem, deleteItem, getAllItems, getCategories, getItemById, updateItem, PendingApprovalItem, getStock } from "../../Services/InventoryService";
import ExportToCSV from "../../ReactComponents/ExportToCSV/ExportToCSV";
import ApprovalModal, { ApprovalTriggerButton } from "./ApprovalPage";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

// Icons for Panel View
const TableViewIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
    </svg>
);

const PanelViewIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="18" rx="1"/>
        <rect x="12" y="3" width="9" height="18" rx="1"/>
    </svg>
);

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
    </svg>
);

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
);

const ItemIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
    </svg>
);

const DownloadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);

const ChevronRightIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <polyline points="9 18 15 12 9 6"/>
    </svg>
);

const EmptyIcon = () => (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="14" width="60" height="52" rx="8" fill="#e8eff5" stroke="#b8c9d6" strokeWidth="2"/>
        <path d="M30 38h20M30 46h14" stroke="#8fa3b8" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="56" cy="56" r="14" fill="#e8eff5" stroke="#b8c9d6" strokeWidth="2"/>
        <path d="M52 56h8M56 52v8" stroke="#4A7FA8" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

const EditIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);

const DeleteIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#A83232" strokeWidth="2" width="16" height="16">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        <line x1="10" y1="11" x2="10" y2="17"/>
        <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
);

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

const ItemMaster = (props) => {
  const [pageMode, setPageMode] = useState("Home");
    const [viewMode, setViewMode] = useState("panel");
  const [gridData, setGridData] = useState([]);
    const [GridApproval, setGridApproval] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("name-asc");
    const [activeTab, setActiveTab] = useState("details");
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [stockData, setStockData] = useState([]);
    const [categories, setCategories] = useState([]);

  const gridHeader = [
    { sTitle: 'Id', titleValue: 'Id', "orderable": true },
    { sTitle: 'Name', titleValue: 'Name' },
    { sTitle: 'Description', titleValue: 'Description' },
    { sTitle: 'Action', titleValue: 'Action', Action: "Edit&View&Delete", Index: '0', "orderable": false },
  ];

    const propertyId = useSelector((state) => state.Commonreducer.puidn);
    const userId = useSelector((state) => state.Commonreducer.userId);
  const [loading, setLoading] = useState(false);
  const emptyItem = {
    Id: 0,
    Name: "",
        Description: "",
        CategoryId: 0,
        MeasurementUnit: "",
        MinStockLevel: "",
        BrandName: "",
        HSNCode: "",
        IsApproved: false
  };
  const [item, setItem] = useState(emptyItem);
    const dispatch = useDispatch();

    // Approval columns
    const approvalColumns = [
        { key: 'Id', label: 'ID' },
        { key: 'Name', label: 'Name' },
        { key: 'Description', label: 'Description' },
    ];

    // Fetch items
    const getItems = useCallback(async (propertyId) => {
    try {
      setLoading(true);
      const data = await getAllItems(propertyId);
            setGridData(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
            console.error('Error fetching Items:', error);
      setLoading(false);
    }
    }, []);

    // Fetch pending approval
    const getItemsApproved = useCallback(async (propertyId) => {
    try {
      setLoading(true);
      const data = await PendingApprovalItem(propertyId);
            setGridApproval(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
            console.error('Error fetching pending items:', error);
      setLoading(false);
    }
    }, []);

    // Fetch categories
    const getAllCategories = useCallback(async (propertyId) => {
    try {
      const data = await getCategories(propertyId);
            setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching Categories:', error);
        }
    }, []);

    // Fetch stock data
    const fetchStockData = useCallback(async (propertyId) => {
        try {
            const data = await getStock(propertyId);
            setStockData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching Stock:', error);
        }
    }, []);

  useEffect(() => {
    if (propertyId) {
            setGridApproval([]);
      setGridData([]);
      getItemsApproved(propertyId);
      getItems(propertyId);
            getAllCategories(propertyId);
            fetchStockData(propertyId);
    } else {
            setGridApproval([]);
      setGridData([]);
      appCommon.showtextalert("Error", "Please Select a Property.", "error");
    }
    }, [propertyId, getItems, getItemsApproved, getAllCategories, fetchStockData]);

    // Filtered and sorted data
    const filteredAndSortedData = useMemo(() => {
        let filtered = gridData;

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.Description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.BrandName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        const sorted = [...filtered];
        switch (sortOption) {
            case 'name-asc':
                sorted.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));
                break;
            case 'name-desc':
                sorted.sort((a, b) => (b.Name || '').localeCompare(a.Name || ''));
                break;
            case 'id-asc':
                sorted.sort((a, b) => a.Id - b.Id);
                break;
            case 'id-desc':
                sorted.sort((a, b) => b.Id - a.Id);
                break;
            default:
                break;
        }
        return sorted;
    }, [gridData, searchTerm, sortOption]);

    // Get stock info for item
    const getItemStock = (itemId) => {
        const stock = stockData.find(s => s.ItemId === itemId);
        return stock || null;
    };

    // Get category name
    const getCategoryName = (categoryId) => {
        const cat = categories.find(c => c.Id === categoryId);
        return cat ? cat.Name : 'N/A';
    };

    // Handle item click in panel list
    const handleItemSelect = (itemData) => {
        if (pageMode === 'Add') return;
        setSelectedItem(itemData);
        setItem(itemData);
        setActiveTab('details');
        setPageMode("Home");
    };

    // Grid event handlers
    const onPagechange = () => {};

  const onGridApprove = async (itemApprovedId) => {
    try {
            const approvedItem = GridApproval.find(i => i.Id === itemApprovedId);
      if (approvedItem) {
        const updatedItem = { ...approvedItem, IsApproved: true };
        await updateItem(updatedItem.Id, updatedItem);
        appCommon.showtextalert("Item Approved Successfully!", "", "success");
                setGridApproval(prevData => prevData.filter(i => i.Id !== itemApprovedId));
        await getItems(propertyId);
      }
    } catch (error) {
      appCommon.showtextalert("Error Approving Item", error.message, "error");
    }
  };

  const handleDeleteItem = async (Id) => {
    try {
      setLoading(true);
            await deleteItem(Id);
      appCommon.showtextalert("Success", "Item deleted successfully", "success");
            if (selectedItem?.Id === Id) {
                setSelectedItem(null);
                setItem(emptyItem);
            }
      getItemsApproved(propertyId);
      getItems(propertyId);
    } catch (error) {
            console.error('Error deleting Item:', error);
    } finally {
      setLoading(false);
    }
    };

    const onGridDelete = (itemId) => {
    let myhtml = document.createElement("div");
    myhtml.innerHTML = DELETE_CONFIRMATION_MSG + "</hr>";
    swal({
            buttons: { ok: "Yes", cancel: "No" },
      content: myhtml,
      icon: "warning",
      closeOnClickOutside: false,
      dangerMode: true
    }).then((value) => {
            if (value === "ok") handleDeleteItem(itemId);
    });
  };

  const onGridView = async (catId) => {
    await getAllCategories(propertyId);
        const selectedItemData = await getItemById(catId);
        setItem(selectedItemData);
        setSelectedItem(selectedItemData);
    setPageMode("View");
  };

  const onGridEdit = async (Id) => {
    await getAllCategories(propertyId);
        const selectedItemData = await getItemById(Id);
        setItem(selectedItemData);
    setPageMode("Edit");
  };

  const handleUpdateItem = async () => {
    try {
      setLoading(true);
            await updateItem(item.Id, item);
      appCommon.showtextalert("Success", "Item updated successfully", "success");
      getItemsApproved(propertyId);
      getItems(propertyId);
    } catch (error) {
      console.error('Error updating Item:', error);
    } finally {
      setLoading(false);
      handleClose();
    }
    };

  const handleCreateItem = async () => {
    try {
      setLoading(true);
      const newItem = { ...item, PropertyId: propertyId };
            await createItem(newItem);
      appCommon.showtextalert("Success", "Item created successfully", "success");
      getItemsApproved(propertyId);
      getItems(propertyId);
    } catch (error) {
      console.error('Error creating Item:', error);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const addNewItem = async () => {
    await getAllCategories(propertyId);
        setItem(emptyItem);
    setPageMode("Add");
  };

  const handleClose = () => {
    setItem(emptyItem);
    setPageMode("Home");
    getItems(propertyId);
  };

    const handleDownloadReport = () => {
        const exportBtn = document.querySelector('.item-hidden-export .p-button');
        if (exportBtn) {
            exportBtn.click();
        } else {
            const legacyBtn = document.querySelector('.item-hidden-export button');
            if (legacyBtn) legacyBtn.click();
        }
    };

    // Bulk handlers (in progress)
    const handleBulkApprove = async (ids) => {
        appCommon.showtextalert("In Progress", "Bulk Approve API is not yet developed.", "info");
    };

    const handleBulkReject = async (ids) => {
        appCommon.showtextalert("In Progress", "Bulk Reject API is not yet developed.", "info");
    };

    // Stock chart for selected item
    const renderStockChart = () => {
        const stock = selectedItem ? getItemStock(selectedItem.Id) : null;
        const currentQty = stock?.CurrentQty || 0;
        const minStock = selectedItem?.MinStockLevel || stock?.MinStockLevel || 0;

        // Generate last 8 week labels
        const labels = [];
        const now = new Date();
        for (let i = 7; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - (i * 7));
            labels.push(d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }));
        }

        // Simulated data points (since we only have current stock)
        const data = {
            labels,
            datasets: [
                {
                    label: 'Stock Level',
                    data: labels.map((_, i) => i === labels.length - 1 ? currentQty : Math.max(0, currentQty - Math.floor(Math.random() * 3))),
                    borderColor: '#4A7FA8',
                    backgroundColor: 'rgba(74, 127, 168, 0.08)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: '#4A7FA8',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                },
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: false },
                tooltip: {
                    backgroundColor: '#1a2d3d',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#4A7FA8',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 10,
                },
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#8fa3b8', font: { size: 11 } },
                },
                y: {
                    beginAtZero: true,
                    grid: { color: '#e8eff5' },
                    ticks: { color: '#8fa3b8', font: { size: 11 }, stepSize: Math.max(1, Math.ceil(currentQty / 5)) },
                },
            },
  };

  return (
            <div className="item-stock-chart">
                <div className="item-stock-chart-header">
                    <h4>Stock Level History</h4>
                    <span className="item-stock-chart-period">
                        {labels[0]} - {labels[labels.length - 1]}
                    </span>
                </div>
                <div className="item-stock-chart-body">
                    <Line data={data} options={options} />
                </div>
            </div>
        );
    };

    // Render Create/Edit Dialog
    const renderItemDialog = () => {
        if (pageMode !== 'Add' && pageMode !== 'Edit') return null;

        return (
            <div className="approval-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
                <div className="item-form-modal">
                    <div className="item-form-modal-header">
                        <h3>{pageMode === 'Add' ? 'New Item' : 'Edit Item'}</h3>
                        <button className="approval-modal-close" onClick={handleClose} title="Close">
                            <CloseIcon />
                        </button>
                    </div>
                    <div className="item-form-modal-body">
                        <div className="item-form-section">
                            <label className="item-form-label">Category <span className="required">*</span></label>
                            <select
                                className="item-form-input"
                                value={item.CategoryId}
                                onChange={(e) => setItem({ ...item, CategoryId: parseInt(e.target.value) || 0 })}
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.Id} value={cat.Id}>{cat.Name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="item-form-section">
                            <label className="item-form-label">Item Name <span className="required">*</span></label>
                            <input
                                className="item-form-input"
                                type="text"
                                placeholder="Enter Item Name"
                                value={item.Name}
                                onChange={(e) => setItem({ ...item, Name: e.target.value })}
                            />
                        </div>
                        <div className="item-form-section">
                            <label className="item-form-label">Description</label>
                            <textarea
                                className="item-form-textarea"
                                placeholder="Enter Description"
                                value={item.Description}
                                onChange={(e) => setItem({ ...item, Description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="item-form-row">
                            <div className="item-form-section">
                                <label className="item-form-label">Measuring Unit</label>
                                <input
                                    className="item-form-input"
                                    type="text"
                                    placeholder="Enter Measuring Unit"
                                    value={item.MeasurementUnit}
                                    onChange={(e) => setItem({ ...item, MeasurementUnit: e.target.value })}
                                />
                            </div>
                            <div className="item-form-section">
                                <label className="item-form-label">Minimum Stock Level</label>
                                <input
                                    className="item-form-input"
                                    type="number"
                                    placeholder="Enter Minimum Stock Level"
                                    value={item.MinStockLevel}
                                    onChange={(e) => setItem({ ...item, MinStockLevel: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="item-form-row">
                            <div className="item-form-section">
                                <label className="item-form-label">Brand Name</label>
                                <input
                                    className="item-form-input"
                                    type="text"
                                    placeholder="Enter Brand Name"
                                    value={item.BrandName}
                                    onChange={(e) => setItem({ ...item, BrandName: e.target.value })}
                                />
                            </div>
                            <div className="item-form-section">
                                <label className="item-form-label">HSN Code</label>
                                <input
                                    className="item-form-input"
                                    type="text"
                                    placeholder="Enter HSN Code"
                                    value={item.HSNCode}
                                    onChange={(e) => setItem({ ...item, HSNCode: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="item-form-modal-footer">
                        <button className="item-form-cancel-btn" onClick={handleClose}>Cancel</button>
                        <button
                            className="item-form-save-btn"
                            onClick={pageMode === "Add" ? handleCreateItem : handleUpdateItem}
                        >
                            {pageMode === "Add" ? "Create Item" : "Update Item"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Render Panel View
    const renderPanelView = () => (
        <div className="item-panel-container">
            {/* Left Panel - List */}
            <div className="item-panel-list">
                <div className="item-panel-list-header">
                    <div className="item-panel-sort">
                        <span>Sort By:</span>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                        >
                            <option value="name-asc">Name: Ascending Order</option>
                            <option value="name-desc">Name: Descending Order</option>
                            <option value="id-asc">ID: Low to High</option>
                            <option value="id-desc">ID: High to Low</option>
                        </select>
                    </div>
                </div>
                <div className="item-panel-items">
                    {filteredAndSortedData.length === 0 ? (
                        <div className="item-panel-empty">
                            <EmptyIcon />
                            <h4>No items found</h4>
                            <p>Add a new item to get started</p>
                        </div>
                    ) : (
                        filteredAndSortedData.map(itemData => {
                            const stock = getItemStock(itemData.Id);
                            const currentQty = stock?.CurrentQty || 0;
                            const unit = itemData.MeasurementUnit || 'units';
                            return (
                                <div
                                    key={itemData.Id}
                                    className={`item-panel-item ${selectedItem?.Id === itemData.Id ? 'active' : ''}`}
                                    onClick={() => handleItemSelect(itemData)}
                                >
                                    <div className="item-panel-item-avatar">
                                        <ItemIcon />
                                    </div>
                                    <div className="item-panel-item-content">
                                        <h4 className="item-panel-item-name">{itemData.Name}</h4>
                                        <p className="item-panel-item-desc">
                                            {getCategoryName(itemData.CategoryId) !== 'N/A'
                                                ? `At ${getCategoryName(itemData.CategoryId)}`
                                                : itemData.Description || 'No description'}
                                        </p>
                                    </div>
                                    <span className="item-panel-item-stock">
                                        {currentQty} {unit}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right Panel - Details */}
            <div className="item-panel-detail">
                {selectedItem ? (
                    <div className="item-detail-content">
                        {/* Detail Header */}
                        <div className="item-detail-header">
                            <div className="item-detail-header-left">
                                <h2 className="item-detail-name">{selectedItem.Name}</h2>
                                <div className="item-detail-stock-badge">
                                    {(() => {
                                        const stock = getItemStock(selectedItem.Id);
                                        const currentQty = stock?.CurrentQty || 0;
                                        const unit = selectedItem.MeasurementUnit || 'units';
                                        return `${currentQty} ${unit} in stock`;
                                    })()}
                                </div>
                            </div>
                            <div className="item-detail-header-actions">
                                <button
                                    className="item-detail-action-btn edit"
                                    onClick={() => onGridEdit(selectedItem.Id)}
                                    title="Edit"
                                >
                                    <EditIcon />
                                    Edit
                                </button>
                                <button
                                    className="item-detail-action-btn delete"
                                    onClick={() => onGridDelete(selectedItem.Id)}
                                    title="Delete"
                                >
                                    <DeleteIcon />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="item-detail-tabs">
                            <button
                                className={`item-detail-tab ${activeTab === 'details' ? 'active' : ''}`}
                                onClick={() => setActiveTab('details')}
                            >
                                Details
                            </button>
                            <button
                                className={`item-detail-tab ${activeTab === 'history' ? 'active' : ''}`}
                                onClick={() => setActiveTab('history')}
                            >
                                History
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="item-detail-tab-content">
                            {activeTab === 'details' ? (
                                <div className="item-detail-info">
                                    {/* Stock Summary */}
                                    <div className="item-detail-stock-summary">
                                        <div className="item-detail-field-row">
                                            <div className="item-detail-field">
                                                <span className="item-detail-field-label">Minimum in Stock</span>
                                                <span className="item-detail-field-value">
                                                    {selectedItem.MinStockLevel || '0'} {selectedItem.MeasurementUnit || 'units'}
                                                </span>
                                            </div>
                                            <div className="item-detail-field">
                                                <span className="item-detail-field-label">Current Stock</span>
                                                <span className="item-detail-field-value">
                                                    {(() => {
                                                        const stock = getItemStock(selectedItem.Id);
                                                        return `${stock?.CurrentQty || 0} ${selectedItem.MeasurementUnit || 'units'}`;
                                                    })()}
                                                </span>
                                            </div>
                                            <div className="item-detail-field">
                                                <span className="item-detail-field-label">Brand</span>
                                                <span className="item-detail-field-value">{selectedItem.BrandName || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Available Quantity */}
                                    <div className="item-detail-section">
                                        <h4 className="item-detail-section-title">Item Details</h4>
                                        <div className="item-detail-field-row">
                                            <div className="item-detail-field">
                                                <span className="item-detail-field-label">Category</span>
                                                <span className="item-detail-field-value">{getCategoryName(selectedItem.CategoryId)}</span>
                                            </div>
                                            <div className="item-detail-field">
                                                <span className="item-detail-field-label">Measuring Unit</span>
                                                <span className="item-detail-field-value">{selectedItem.MeasurementUnit || 'N/A'}</span>
                                            </div>
                                            <div className="item-detail-field">
                                                <span className="item-detail-field-label">HSN Code</span>
                                                <span className="item-detail-field-value">{selectedItem.HSNCode || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="item-detail-section">
                                        <h4 className="item-detail-section-title">Description</h4>
                                        <p className="item-detail-description">{selectedItem.Description || 'No description available'}</p>
                                    </div>

                                    {/* Stock Chart */}
                                    {renderStockChart()}
                                </div>
                            ) : (
                                <div className="item-detail-history">
                                    <div className="item-history-placeholder">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="#b8c9d6" strokeWidth="1.5" width="64" height="64">
                                            <circle cx="12" cy="12" r="10"/>
                                            <polyline points="12 6 12 12 16 14"/>
                                        </svg>
                                        <h4>History API Under Progress</h4>
                                        <p>Item history tracking will be available soon. This feature is currently being developed.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="item-detail-empty">
                        <EmptyIcon />
                        <h3>Start adding Items to your organization</h3>
                        <p>Click "New Item" to add your first item</p>
                    </div>
          )}
        </div>
      </div>
    );

    return (
        <>
            {/* Hidden ExportToCSV for Download Report */}
            <div className="item-hidden-export" style={{ display: 'none' }}>
                <ExportToCSV data={gridData} className="btn btn-success btn-sm" />
            </div>

            {/* Breadcrumb Navigation */}
            <div className="category-breadcrumb">
                <span className="breadcrumb-link">Inventory Management</span>
                <ChevronRightIcon />
                <span className="breadcrumb-current">Items</span>
            </div>

            {/* Approval Modal Dialog */}
            <ApprovalModal
                show={showApprovalModal}
                onClose={() => setShowApprovalModal(false)}
                gridData={GridApproval}
                columns={approvalColumns}
                entityName="Item"
                onEdit={onGridEdit}
                onDelete={onGridDelete}
                onApprove={onGridApprove}
                onView={onGridView}
                onBulkApprove={handleBulkApprove}
                onBulkReject={handleBulkReject}
                bulkApproveInProgress={true}
                bulkRejectInProgress={true}
            />

            {/* Item Form Dialog */}
            {renderItemDialog()}

        <div className="row">
          <div className="col-12">
                    {/* View Header with Toggle */}
                    <div className="category-view-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div className="category-view-toggle">
                                <button
                                    className={`category-view-toggle-btn ${viewMode === 'panel' ? 'active' : ''}`}
                                    onClick={() => setViewMode('panel')}
                                    title="Panel View"
                                >
                                    <PanelViewIcon />
                                    Panel View
                                </button>
                                <button
                                    className={`category-view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                                    onClick={() => setViewMode('table')}
                                    title="Table View"
                                >
                                    <TableViewIcon />
                                    Table View
                                </button>
                            </div>
                        </div>
                        <div className="category-header-actions">
                            <ApprovalTriggerButton count={GridApproval.length} onClick={() => setShowApprovalModal(true)} />
                            <div className="category-search-box">
                                <span className="search-icon">
                                    <SearchIcon />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search Items"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                className="category-download-btn"
                                onClick={handleDownloadReport}
                            >
                                <DownloadIcon />
                                Download Report
                            </button>
                            <button className="category-add-btn" onClick={addNewItem}>
                                <PlusIcon />
                                New Item
                            </button>
                      </div>
                    </div>

                    {/* Panel View */}
                    <div style={{ display: viewMode === 'panel' ? 'block' : 'none' }}>
                        {renderPanelView()}
              </div>

                    {/* Table View */}
                    <div style={{ display: viewMode === 'table' ? 'block' : 'none' }}>
                        <div className="card category-table-card">
              <div className="card-body pt-2">
                <DataGrid
                  Id="ItemMaster"
                  IsPagination={false}
                  ColumnCollection={gridHeader}
                  Onpageindexchanged={onPagechange}
                  onEditMethod={onGridEdit}
                  onGridDeleteMethod={onGridDelete}
                  onGridViewMethod={onGridView}
                  DefaultPagination={false}
                  IsSarching="false"
                  GridData={gridData}
                                    pageSize="2000"
                    />
                  </div>
                </div>
                  </div>
                </div>
              </div>

              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
    </>
  );
};

export default ItemMaster;
