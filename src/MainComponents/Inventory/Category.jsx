import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import swal from 'sweetalert';
import { ToastContainer } from 'react-toastify';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import { CreateValidator, ValidateControls } from '../Calendar/Validation';
import * as appCommon from '../../Common/AppCommon.js';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory, PendingApprovalCategory } from "../../Services/InventoryService";
import { useSelector, useDispatch } from 'react-redux';
import ExportToCSV from '../../ReactComponents/ExportToCSV/ExportToCSV.js';

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

const CategoryIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
);

const EditIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);

const DeleteIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#A83232" strokeWidth="2" width="18" height="18">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        <line x1="10" y1="11" x2="10" y2="17"/>
        <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
);

const EmptyIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 9h6M9 15h6"/>
    </svg>
);

const DownloadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);

const ImportIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
);

const UploadCloudIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
        <path d="M16 16l-4-4-4 4"/>
        <path d="M12 12v9"/>
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
        <polyline points="16 16 12 12 8 16"/>
    </svg>
);

const QuestionCircleIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#336B93" strokeWidth="2" width="16" height="16">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
);

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

const ClockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
    </svg>
);

const ChevronRightIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <polyline points="9 18 15 12 9 6"/>
    </svg>
);

// API service for category history
const getCategoryHistoryFromAPI = async (propertyId, categoryId) => {
    try {
        const response = await fetch(
            `https://api.urest.in:8096/api/inventory/categories/history?propertyId=${propertyId}&categoryId=${categoryId}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching category history:', error);
        return [];
    }
};

// Helper to format the "After" field for CREATE actions
const parseCreateData = (afterString) => {
    if (!afterString) return {};
    const parts = afterString.split(', ');
    const result = {};
    parts.forEach(part => {
        const [key, value] = part.split('=');
        if (key && value) {
            result[key] = value;
        }
    });
    return result;
};

// Helper to calculate days remaining
const getDaysRemaining = (daysRemaining) => {
    return Math.max(0, daysRemaining);
};

// Format timestamp
const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) + ', ' +
           date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const Category = (props) => {
    const [pageMode, setPageMode] = useState("Home");
    const [viewMode, setViewMode] = useState("panel");
    const [gridData, setGridData] = useState([]);
    const [GridApproval, setGridApproval] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name_asc");
    const [activeTab, setActiveTab] = useState("details");
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importError, setImportError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [categoryHistory, setCategoryHistory] = useState([]);
    const fileInputRef = useRef(null);

    const gridHeader = [
        { sTitle: 'Id', titleValue: 'Id', "orderable": true },
        { sTitle: 'Name', titleValue: 'Name' },
        { sTitle: 'Description', titleValue: 'Description' },
        { sTitle: 'Action', titleValue: 'Action', Action: "Edit&View&Delete", Index: '0', "orderable": false },
    ];
    const propertyId = useSelector((state) => state.Commonreducer.puidn);
    const [loading, setLoading] = useState(false);
    const emptycategorydata = { Id: 0, Name: '', Description: '', propertyId: propertyId, IsApproved: false };
    const [categoryData, setCategoryData] = useState(emptycategorydata);
    const [originalCategoryData, setOriginalCategoryData] = useState(null);
    const dispatch = useDispatch();

    // Load history when category is selected
    useEffect(() => {
        const loadHistory = async () => {
            if (selectedCategory && propertyId) {
                const history = await getCategoryHistoryFromAPI(propertyId, selectedCategory.Id);
                setCategoryHistory(history);
            } else {
                setCategoryHistory([]);
            }
        };
        loadHistory();
    }, [selectedCategory, propertyId]);

    const getPendingCategoryList = useCallback(async (propertyId) => {
        try {
            setLoading(true);
            const data = await PendingApprovalCategory(propertyId);
            setGridApproval(data);
            setLoading(false);
        } catch (error) {
            console.error('error fetching pending approval');
            setLoading(false);
        }
    }, []);

    const getCategoriesList = useCallback(async (propertyId) => {
        try {
            setLoading(true);
            const data = await getCategories(propertyId);
            setGridData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching Categories:', error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (propertyId) {
            setGridData([]);
            setGridApproval([]);
            getPendingCategoryList(propertyId);
            getCategoriesList(propertyId);
        } else {
            setGridData([]);
            appCommon.showtextalert("Error", "Please Select a Property.", "error");
        }
    }, [getCategoriesList, getPendingCategoryList, propertyId]);

    const handleCreateCategory = async (newCategory) => {
        try {
            await createCategory(newCategory);
            appCommon.showtextalert("Category Saved Successfully!", "", "success");
            handleCancel();
            await getPendingCategoryList(propertyId);
            await getCategoriesList(propertyId);
        } catch (error) {
            appCommon.showtextalert("Error Creating Category", error.message, "error");
        }
    };

    const handleUpdateCategory = async (id, updatedCategory) => {
        try {
            await updateCategory(id, updatedCategory);
            appCommon.showtextalert("Category Updated Successfully!", "", "success");
            handleCancel();
            await getPendingCategoryList(propertyId);
            await getCategoriesList(propertyId);
        } catch (error) {
            appCommon.showtextalert("Error Updating Category", error.message, "error");
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await deleteCategory(id);
            appCommon.showtextalert("Category Deleted Successfully!", "", "success");
            await getPendingCategoryList(propertyId);
            await getCategoriesList(propertyId);
        } catch (error) {
            appCommon.showtextalert("Error Deleting Category", error.message, "error");
        }
    };

    const onPagechange = () => {};

    const onGridApprove = async (categoryApprovedId) => {
        try {
            const approvedCategory = GridApproval.find(item => item.Id === categoryApprovedId);
            if (approvedCategory) {
                const updatedCategory = { ...approvedCategory, IsApproved: true };
                await updateCategory(updatedCategory.Id, updatedCategory);
                appCommon.showtextalert("Category Approved Successfully!", "", "success");
                setGridApproval(prevData => prevData.filter(item => item.Id !== categoryApprovedId));
                await getCategoriesList(propertyId);
            }
        } catch (error) {
            appCommon.showtextalert("Error Approving Category", error.message, "error");
            console.error("Error approving category:", error);
        }
    };

    const onGridDelete = (categoryData) => {
        let myhtml = document.createElement("div");
        myhtml.innerHTML = DELETE_CONFIRMATION_MSG + "</hr>";
        swal({
            buttons: {
                ok: "Yes",
                cancel: "No",
            },
            content: myhtml,
            icon: "warning",
            closeOnClickOutside: false,
            dangerMode: true
        }).then((value) => {
            switch (value) {
                case "ok":
                    handleDeleteCategory(categoryData);
                    break;
                case "cancel":
                default:
                    break;
            }
        });
    };

    const onGridView = async (categoryData) => {
        setPageMode('View');
        CreateValidator();
        try {
            const categoryDetails = await getCategoryById(categoryData);
            setCategoryData(categoryDetails);
        } catch (error) {
            console.error("Error fetching category details", error);
            appCommon.showtextalert("Error", "Failed to fetch category details.", "error");
        }
    };

    const onGridEdit = async (categoryData) => {
        setPageMode('Edit');
        CreateValidator();
        try {
            const categoryDetails = await getCategoryById(categoryData);
            setCategoryData(categoryDetails);
            setOriginalCategoryData({ ...categoryDetails });
        } catch (error) {
            console.error("Error fetching category details", error);
            appCommon.showtextalert("Error", "Failed to fetch category details.", "error");
        }
    };

    const Addnew = () => {
        setPageMode('Add');
        CreateValidator();
        setCategoryData(emptycategorydata);
        setOriginalCategoryData(null);
    };

    const handleSave = () => {
        if (ValidateControls()) {
            if (pageMode === "Add") {
                handleCreateCategory(categoryData);
            } else if (pageMode === "Edit") {
                handleUpdateCategory(categoryData.Id, categoryData);
            }
        }
    };

    const handleCancel = () => {
        setPageMode('Home');
        setCategoryData(emptycategorydata);
        setOriginalCategoryData(null);
        getCategoriesList(propertyId);
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setCategoryData(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    // Filter and sort data for panel view
    const filteredAndSortedData = useMemo(() => {
        let data = [...gridData];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            data = data.filter(item =>
                item.Name?.toLowerCase().includes(term) ||
                item.Description?.toLowerCase().includes(term)
            );
        }

        switch (sortBy) {
            case "name_asc":
                data.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));
                break;
            case "name_desc":
                data.sort((a, b) => (b.Name || '').localeCompare(a.Name || ''));
                break;
            case "id_asc":
                data.sort((a, b) => a.Id - b.Id);
                break;
            case "id_desc":
                data.sort((a, b) => b.Id - a.Id);
                break;
            default:
                break;
        }

        return data;
    }, [gridData, searchTerm, sortBy]);

    useEffect(() => {
        if (filteredAndSortedData.length > 0 && viewMode === "panel") {
            if (!selectedCategory || !filteredAndSortedData.find(item => item.Id === selectedCategory.Id)) {
                setSelectedCategory(filteredAndSortedData[0]);
            }
        } else if (filteredAndSortedData.length === 0) {
            setSelectedCategory(null);
        }
    }, [filteredAndSortedData, viewMode]);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setActiveTab('details');
    };

    const handlePanelEdit = () => {
        if (selectedCategory) {
            onGridEdit(selectedCategory.Id);
        }
    };

    const handlePanelDelete = () => {
        if (selectedCategory) {
            onGridDelete(selectedCategory.Id);
        }
    };

    // Import Excel handlers
    const validateExcelFile = (file) => {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
            return 'Invalid file type. Please upload an Excel file (.xlsx, .xls) or CSV file.';
        }
        return null;
    };

    const handleFileSelect = (file) => {
        setImportError("");
        const error = validateExcelFile(file);
        if (error) {
            setImportError(error);
            setImportFile(null);
            return;
        }
        setImportFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

   const handleImportUpload = async () => {
  if (!importFile) return;

  const ApiUrl = "https://api.urest.in:8096/api/inventory/UploadCategory";

  try {
    const formData = new FormData();
    formData.append("file", importFile);
    formData.append("propertyId", propertyId);

    console.log("Uploading file to:", ApiUrl);

    const response = await fetch(ApiUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("API response:", data);

    appCommon.showtextalert(
      "Import initiated",
      "File uploaded successfully.",
      "success"
    );

    setShowImportModal(false);
    setImportFile(null);
    setImportError("");
  } catch (error) {
    console.error(error);
    setImportError("Upload failed. Please check the file format and try again.");
    setImportFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }
};


    const handleDownloadTemplate = () => {
        // Template download - server doesn't have template yet
        appCommon.showtextalert("Template Unavailable", "The FIRMITY Category Template will be available soon.", "info");
    };

    // Render Pending Approval Section with new styling
    const renderPendingApproval = () => {
        if (GridApproval.length === 0 || pageMode !== "Home") return null;

        return (
            <div className="category-pending-approval">
                <div className="category-pending-header">
                    <span className="category-pending-title">Pending For Approval</span>
                    <span className="category-pending-count">{GridApproval.length}</span>
                </div>
                <div className="category-pending-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {GridApproval.map((item) => (
                                <tr key={item.Id}>
                                    <td>{item.Id}</td>
                                    <td>{item.Name}</td>
                                    <td>{item.Description}</td>
                                    <td>
                                        <div className="category-pending-actions">
                                            <button
                                                className="category-action-btn edit"
                                                onClick={() => onGridEdit(item.Id)}
                                                title="Edit"
                                            >
                                                <EditIcon />
                                            </button>
                                            <button
                                                className="category-action-btn view"
                                                onClick={() => onGridView(item.Id)}
                                                title="View"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                    <circle cx="12" cy="12" r="3"/>
                                                </svg>
                                            </button>
                                            <button
                                                className="category-action-btn delete"
                                                onClick={() => onGridDelete(item.Id)}
                                                title="Delete"
                                            >
                                                <DeleteIcon />
                                            </button>
                                            <button
                                                className="category-action-btn approve"
                                                onClick={() => onGridApprove(item.Id)}
                                                title="Approve"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                                    <polyline points="20 6 9 17 4 12"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Import Modal
    const renderImportModal = () => {
        if (!showImportModal) return null;

        return (
            <div className="category-modal-overlay">
                <div className="category-import-modal">
                    <div className="category-import-header">
                        <h3>Import from Excel</h3>
                        <button
                            className="category-modal-close"
                            onClick={() => {
                                setShowImportModal(false);
                                setImportFile(null);
                                setImportError("");
                            }}
                        >
                            <CloseIcon />
                        </button>
                    </div>
                    <div className="category-import-body">
                        <div
                            className={`category-import-dropzone ${isDragging ? 'dragging' : ''} ${importFile ? 'has-file' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileInputChange}
                                style={{ display: 'none' }}
                            />
                            {importFile ? (
                                <div className="category-import-file-info">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2" width="32" height="32">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                        <polyline points="9 15 12 18 15 15"/>
                                        <line x1="12" y1="12" x2="12" y2="18"/>
                                    </svg>
                                    <span className="file-name">{importFile.name}</span>
                                    <button
                                        className="remove-file"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setImportFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <UploadCloudIcon />
                                    <p className="dropzone-text">Drag and drop your file here</p>
                                    <p className="dropzone-subtext">or click to browse</p>
                                    <span className="dropzone-formats">Supported: .xlsx, .xls, .csv</span>
                                </>
                            )}
                        </div>

                        {importError && (
                            <div className="category-import-error">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="15" y1="9" x2="9" y2="15"/>
                                    <line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                                {importError}
                            </div>
                        )}

                        <div className="category-import-template">
                            <QuestionCircleIcon />
                            <span>We suggest using our template</span>
                            <button onClick={handleDownloadTemplate} className="template-link">
                                Download FIRMITY Category Template
                            </button>
                        </div>
                    </div>
                    <div className="category-import-footer">
                        <button
                            className="category-import-cancel"
                            onClick={() => {
                                setShowImportModal(false);
                                setImportFile(null);
                                setImportError("");
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="category-import-submit"
                            onClick={handleImportUpload}
                            disabled={!importFile}
                        >
                            Upload
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Panel View Component
    const renderPanelView = () => (
        <div className="category-panel-container">
            {/* Left Panel - List */}
            <div className="category-panel-list">
                <div className="category-panel-list-header">
                    <div className="category-panel-sort">
                        <span>Sort By:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="name_asc">Name: Ascending Order</option>
                            <option value="name_desc">Name: Descending Order</option>
                            <option value="id_asc">ID: Ascending</option>
                            <option value="id_desc">ID: Descending</option>
                        </select>
                    </div>
                </div>
                <div className="category-panel-items">
                    {filteredAndSortedData.length === 0 ? (
                        <div className="category-panel-empty">
                            <EmptyIcon />
                            <h4>No categories found</h4>
                            <p>Try adjusting your search or add a new category</p>
                        </div>
                    ) : (
                        filteredAndSortedData.map((item) => (
                            <div
                                key={item.Id}
                                className={`category-panel-item ${selectedCategory?.Id === item.Id ? 'active' : ''}`}
                                onClick={() => handleCategorySelect(item)}
                            >
                                <div className="category-panel-item-icon">
                                    <CategoryIcon />
                                </div>
                                <div className="category-panel-item-content">
                                    <h4 className="category-panel-item-name">{item.Name}</h4>
                                    <p className="category-panel-item-desc">
                                        {item.Description || 'No description'}
                                    </p>
                                </div>
                                <span className="category-panel-item-count">ID: {item.Id}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel - Detail */}
            <div className="category-panel-detail">
                {selectedCategory ? (
                    <>
                        <div className="category-panel-detail-header">
                            <div className="category-panel-detail-title">
                                <h3>{selectedCategory.Name}</h3>
                            </div>
                            <div className="category-panel-detail-actions">
                                <button
                                    className="category-detail-btn"
                                    onClick={handlePanelEdit}
                                >
                                    <EditIcon />
                                    Edit
                                </button>
                                <button
                                    className="category-detail-delete-btn"
                                    onClick={handlePanelDelete}
                                    title="Delete"
                                >
                                    <DeleteIcon />
                                </button>
                            </div>
                        </div>

                        <p className="category-panel-detail-subtitle">
                            Category ID: {selectedCategory.Id}
                        </p>

                        <div className="category-detail-tabs">
                            <button
                                className={`category-detail-tab ${activeTab === 'details' ? 'active' : ''}`}
                                onClick={() => setActiveTab('details')}
                            >
                                Details
                            </button>
                            <button
                                className={`category-detail-tab ${activeTab === 'history' ? 'active' : ''}`}
                                onClick={() => setActiveTab('history')}
                            >
                                History
                            </button>
                        </div>

                        {activeTab === 'details' && (
                            <>
                                <div className="category-detail-info">
                                    <div className="category-detail-info-item">
                                        <span className="category-detail-info-label">Category ID</span>
                                        <span className="category-detail-info-value">{selectedCategory.Id}</span>
                                    </div>
                                    <div className="category-detail-info-item">
                                        <span className="category-detail-info-label">Name</span>
                                        <span className="category-detail-info-value">{selectedCategory.Name}</span>
                                    </div>
                                    <div className="category-detail-info-item">
                                        <span className="category-detail-info-label">Status</span>
                                        <span className="category-detail-info-value">
                                            {selectedCategory.IsApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>
                                </div>

                                <div className="category-detail-description">
                                    <h4>Description</h4>
                                    <p>{selectedCategory.Description || 'No description available'}</p>
                                </div>
                            </>
                        )}

                        {activeTab === 'history' && (
                            <div className="category-history-container">
                                {categoryHistory.length === 0 ? (
                                    <div className="category-panel-empty">
                                        <EmptyIcon />
                                        <h4>No history available</h4>
                                        <p>Changes to this category will appear here</p>
                                    </div>
                                ) : (
                                    <div className="category-history-list">
                                        {categoryHistory.map((entry) => {
                                            // Parse data for CREATE actions
                                            const isCreate = entry.ActionType === 'CREATE';
                                            const createData = isCreate ? parseCreateData(entry.After) : null;
                                            
                                            return (
                                                <div key={entry.Id} className="category-history-item">
                                                    <div className="category-history-icon">
                                                        {isCreate ? (
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" width="20" height="20">
                                                                <line x1="12" y1="5" x2="12" y2="19"/>
                                                                <line x1="5" y1="12" x2="19" y2="12"/>
                                                            </svg>
                                                        ) : (
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" width="20" height="20">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="category-history-content">
                                                        <div className="category-history-header">
                                                            <span className="category-history-user">
                                                                User {entry.ChangedBy || 'System'}
                                                            </span>
                                                            <span className="category-history-time">
                                                                {formatTimestamp(entry.ChangedOn)}
                                                            </span>
                                                        </div>
                                                        
                                                        {isCreate ? (
                                                            <>
                                                                <p className="category-history-action">
                                                                    Created this category
                                                                </p>
                                                                {createData && (
                                                                    <div className="category-history-changes">
                                                                        <span className="new-value">
                                                                            Name: {createData.Name || 'N/A'}
                                                                            {createData.Description && `, Description: ${createData.Description}`}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p className="category-history-action">
                                                                    {entry.FieldName === 'IsApproved' && entry.After === 'True' 
                                                                        ? 'Category Approved' 
                                                                        : `Changed ${entry.FieldName ? `the ${entry.FieldName.toLowerCase()}` : 'a field'}`
                                                                    }
                                                                </p>
                                                                {entry.Before !== null && entry.After !== null && (
                                                                    <div className="category-history-changes">
                                                                        <span className="old-value">"{entry.Before}"</span>
                                                                        <span className="arrow">→</span>
                                                                        <span className="new-value">"{entry.After}"</span>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                        
                                                        <div className="category-history-timer">
                                                            <div className="timer-info">
                                                                <span 
                                                                className="timer-date">
                                                                    {new Date(entry.ChangedOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                            <ClockIcon />
                                                                <span className="timer-countdown">{getDaysRemaining(entry.DaysRemaining)} days until auto-delete</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="category-panel-empty">
                        <EmptyIcon />
                        <h4>Select a category</h4>
                        <p>Choose a category from the list to view details</p>
                    </div>
                )}
            </div>
        </div>
    );

    // Export handler for Download Report button
    const handleDownloadReport = () => {
        // Using the existing ExportToCSV functionality
        if (gridData.length === 0) {
            appCommon.showtextalert("No Data", "There is no data to export.", "info");
            return;
        }
        // Trigger the hidden ExportToCSV component
        const exportBtn = document.querySelector('.category-hidden-export button');
        if (exportBtn) {
            exportBtn.click();
        }
    };

    return (
        <>
            {/* Hidden ExportToCSV for Download Report */}
            <div className="category-hidden-export" style={{ display: 'none' }}>
                <ExportToCSV data={gridData} className="btn btn-success btn-sm" />
            </div>

            {/* Breadcrumb Navigation */}
            <div className="category-breadcrumb">
                <span className="breadcrumb-link">Inventory Management</span>
                <ChevronRightIcon />
                <span className="breadcrumb-current">Category</span>
            </div>

            {/* Pending Approval Section */}
            {renderPendingApproval()}

            {pageMode === 'Home' && (
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
                                <div className="category-search-box">
                                    <span className="search-icon">
                                        <SearchIcon />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search Categories"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button
                                    className="category-filter-btn"
                                    onClick={() => setShowImportModal(true)}
                                >
                                    <ImportIcon />
                                    Import from Excel
                                </button>
                                <button
                                    className="category-download-btn"
                                    onClick={handleDownloadReport}
                                >
                                    <DownloadIcon />
                                    Download Report
                                </button>
                                <button className="category-add-btn" onClick={Addnew}>
                                    <PlusIcon />
                                    New Category
                                </button>
                            </div>
                        </div>

                        {/* Panel View */}
                        <div style={{ display: viewMode === 'panel' ? 'block' : 'none' }}>
                            {renderPanelView()}
                        </div>

                        {/* Table View (Original) - Always rendered, visibility controlled by CSS */}
                        <div style={{ display: viewMode === 'table' ? 'block' : 'none' }}>
                            <div className="card category-table-card">
                                <div className="card-body pt-2">
                                    <DataGrid
                                        Id="CategoryGrid"
                                        IsPagination={false}
                                        ColumnCollection={gridHeader}
                                        Onpageindexchanged={onPagechange}
                                        onEditMethod={onGridEdit}
                                        onGridDeleteMethod={onGridDelete}
                                        onGridViewMethod={onGridView}
                                        IsSarching={false}
                                        GridData={filteredAndSortedData}
                                        pageSize="2000" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {renderImportModal()}

            {/* Add/Edit Modal */}
            {(pageMode === 'Add' || pageMode === 'Edit') && (
                <div className="modal d-flex align-items-center justify-content-center show" tabIndex="-1" role="dialog">
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalToggleLabel">
                                    {pageMode === 'Add' ? "Add Category" : "Edit Category"}
                                </h5>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-12">
                                        <label htmlFor="Name">Category Name</label>
                                        <input
                                            id="Name"
                                            required
                                            placeholder="Enter Category Name"
                                            type="text"
                                            className="form-control"
                                            value={categoryData.Name}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-12 mt-3">
                                        <label htmlFor="Description">Description</label>
                                        <input
                                            id="Description"
                                            required
                                            placeholder="Enter Description"
                                            type="text"
                                            className="form-control"
                                            value={categoryData.Description}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer justify-content-start">
                                <Button Id="btnSave" Text="Save" Action={handleSave}
                                    ClassName="btn btn-primary" />
                                <Button Id="btnCancel" Text="Cancel" Action={handleCancel}
                                    ClassName="btn btn-secondary" />
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
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {pageMode === 'View' && (
                <div className="modal d-flex align-items-center justify-content-center show" tabIndex="-1" role="dialog">
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">View Category</h5>
                            </div>
                            <div className="modal-body p-2">
                                <form>
                                    <div className="row">
                                        <div className="form-group col-sm-6">
                                            <label htmlFor="viewName">Name:</label>
                                            <input type="text" className="form-control" id="viewName" value={categoryData.Name} readOnly />
                                        </div>
                                        <div className="form-group col-sm-6">
                                            <label htmlFor="viewDescription">Description:</label>
                                            <input type="text" className="form-control" id="viewDescription" value={categoryData.Description} readOnly />
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer justify-content-start">
                                <Button Id="btnClose" Text="Close" Action={handleCancel}
                                    ClassName="btn btn-secondary" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Category;
