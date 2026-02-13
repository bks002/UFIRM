import React, { Component } from 'react';
import { SketchPicker } from 'react-color';
import swal from 'sweetalert';
import { ToastContainer } from 'react-toastify';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from './DataProvider';
import { CreateValidator, ValidateControls } from './Validation.js';
import * as appCommon from '../../Common/AppCommon.js';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';

const $ = window.$;

// Icons matching Inventory Category style
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

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

const ChevronRightIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <polyline points="9 18 15 12 9 6"/>
    </svg>
);

class Category extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowColorPicker: false,
            PageMode: "Home",
            viewMode: "panel",
            catColor: "#FFA500",
            catName: "",
            catDesc: "",
            GridData: [],
            gridHeader: [
                { sTitle: 'Id', titleValue: 'catId', "orderable": false },
                { sTitle: 'Name', titleValue: 'name' },
                { sTitle: 'Description', titleValue: 'description' },
                { sTitle: 'Color', titleValue: 'StatusColor', Value: 'color' },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],
            CatId: 0,
            selectedCategory: null,
            searchTerm: "",
            sortBy: "name_asc",
        }
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    componentDidMount() {
        this.getCategory();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.PropertyId !== this.props.PropertyId) { }
        // Auto-select first category in panel view when data changes
        if (prevState.GridData !== this.state.GridData || prevState.viewMode !== this.state.viewMode) {
            const filtered = this.getFilteredAndSortedData();
            if (filtered.length > 0 && this.state.viewMode === "panel") {
                if (!this.state.selectedCategory || !filtered.find(item => item.catId === this.state.selectedCategory.catId)) {
                    this.setState({ selectedCategory: filtered[0] });
                }
            } else if (filtered.length === 0) {
                this.setState({ selectedCategory: null });
            }
        }
    }

    getFilteredAndSortedData = () => {
        let data = [...this.state.GridData];
        const { searchTerm, sortBy } = this.state;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            data = data.filter(item =>
                (item.name && item.name.toLowerCase().includes(term)) ||
                (item.description && item.description.toLowerCase().includes(term))
            );
        }

        switch (sortBy) {
            case "name_asc":
                data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case "name_desc":
                data.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
                break;
            case "id_asc":
                data.sort((a, b) => a.catId - b.catId);
                break;
            case "id_desc":
                data.sort((a, b) => b.catId - a.catId);
                break;
            default:
                break;
        }
        return data;
    }

    getModel = (type, catId) => {
        var model = [];
        switch (type) {
            case 'R':
                model.push({
                    "CmdType": type,
                });
                break;
            case 'D':
                model.push({
                    "CatId": catId,
                    "CmdType": type,
                });
                break;
            case 'C':
                model.push({
                    "categoryId": parseInt(this.state.CatId),
                    "cmdType": type,
                    "name": this.state.catName,
                    "description": this.state.catDesc,
                    "color": this.state.catColor,
                });
                break;
            case 'U':
                model.push({
                    "categoryId": parseInt(this.state.CatId),
                    "cmdType": type,
                    "name": this.state.catName,
                    "description": this.state.catDesc,
                    "color": this.state.catColor,
                });
                break;
            default:
        };
        return model;
    }

    manageCategory = (model, type) => {
        this.ApiProviderr.manageCategory(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'C':
                                if (rData === 1) {
                                    appCommon.showtextalert("Category Saved Successfully!", "", "success");
                                    this.handleCancel();
                                }
                                break;
                            case 'U':
                                if (rData > 0) {
                                    appCommon.showtextalert("Category Updated Successfully!", "", "success");
                                    this.handleCancel();
                                }
                                break;
                            case 'D':
                                if (rData === 1) {
                                    appCommon.showtextalert("Category Deleted Successfully!", "", "success");
                                }
                                else {
                                    appCommon.showtextalert("Something went wrong!", "", "error");
                                }
                                this.getCategory();
                                break;
                            case 'R':
                                this.setState({ GridData: rData });
                                break;
                            default:
                        }
                    });
                }
            });
    }

    getCategory() {
        var type = 'R';
        var model = this.getModel(type);
        this.manageCategory(model, type);
    }

    onPagechange = (page) => { }

    onGridDelete = (Id) => {
        let myhtml = document.createElement("div");
        myhtml.innerHTML = DELETE_CONFIRMATION_MSG + "</hr>"
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
                    this.setState({ catId: Id }, () => {
                        var type = 'D'
                        var model = this.getModel(type, Id);
                        this.manageCategory(model, type);
                    });
                    break;
                case "cancel":
                    break;
                default:
                    break;
            }
        });
    }

    ongridedit(Id) {
        var rowData = this.findItem(Id);
        if (rowData) {
            this.setState({
                CatId: rowData.catId,
                catName: rowData.name,
                catDesc: rowData.description,
                catColor: rowData.color || "#FFA500",
                PageMode: 'Edit',
            }, () => {
                setTimeout(() => { CreateValidator(); }, 50);
            });
        }
    }

    findItem(id) {
        return this.state.GridData.find((item) => {
            if (item.catId == id) {
                return item;
            }
        });
    }

    handleChangeComplete = (color) => {
        this.setState({ catColor: color.hex });
    };

    Addnew = () => {
        this.setState({
            PageMode: 'Add',
            CatId: 0,
            catName: "",
            catDesc: "",
            catColor: "#FFA500",
            isShowColorPicker: false,
            viewMode: 'panel',
        }, () => {
            setTimeout(() => { CreateValidator(); }, 50);
        });
    }

    handleSave = () => {
        if (ValidateControls()) {
            if (this.state.PageMode === "Add") {
                let exist = this.state.GridData.some((x) => x.name && x.name.toLowerCase() === this.state.catName.toLowerCase());
                if (!exist) {
                    var type = 'C'
                    var model = this.getModel(type);
                    this.manageCategory(model, type);
                }
                else {
                    appCommon.showtextalert(`Category name ${this.state.catName} already exists`, "", "error");
                }
            }

            if (this.state.PageMode === "Edit") {
                let type = "U";
                let model = this.getModel(type);
                this.manageCategory(model, type);
            }
        }
    }

    handleCancel = () => {
        this.setState({
            PageMode: 'Home',
            catName: "",
            catDesc: "",
            catColor: "#FFA500",
            CatId: 0,
            isShowColorPicker: false,
        }, () => this.getCategory());
    };

    handleCategorySelect = (category) => {
        this.setState({ selectedCategory: category });
    };

    handlePanelEdit = () => {
        if (this.state.selectedCategory) {
            this.ongridedit(this.state.selectedCategory.catId);
        }
    };

    handlePanelDelete = () => {
        if (this.state.selectedCategory) {
            this.onGridDelete(this.state.selectedCategory.catId);
        }
    };

    renderPanelView() {
        const filteredData = this.getFilteredAndSortedData();
        const { selectedCategory, sortBy } = this.state;

        return (
            <div className="category-panel-container">
                {/* Left Panel - List */}
                <div className="category-panel-list">
                    <div className="category-panel-list-header">
                        <div className="category-panel-sort">
                            <span>Sort By:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => this.setState({ sortBy: e.target.value })}
                            >
                                <option value="name_asc">Name: Ascending Order</option>
                                <option value="name_desc">Name: Descending Order</option>
                                <option value="id_asc">ID: Ascending</option>
                                <option value="id_desc">ID: Descending</option>
                            </select>
                        </div>
                    </div>
                    <div className="category-panel-items">
                        {filteredData.length === 0 ? (
                            <div className="category-panel-empty">
                                <EmptyIcon />
                                <h4>No categories found</h4>
                                <p>Try adjusting your search or add a new category</p>
                            </div>
                        ) : (
                            filteredData.map((item) => (
                                <div
                                    key={item.catId}
                                    className={`category-panel-item ${selectedCategory?.catId === item.catId ? 'active' : ''}`}
                                    onClick={() => this.handleCategorySelect(item)}
                                >
                                    <div className="category-panel-item-icon" style={{ borderColor: item.color || '#4A7FA8' }}>
                                        <CategoryIcon />
                                    </div>
                                    <div className="category-panel-item-content">
                                        <h4 className="category-panel-item-name">{item.name}</h4>
                                        <p className="category-panel-item-desc">
                                            {item.description || 'No description'}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span
                                            style={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: '50%',
                                                background: item.color || '#FFA500',
                                                border: '2px solid #d4e3ed',
                                                flexShrink: 0,
                                            }}
                                            title={item.color}
                                        />
                                        <span className="category-panel-item-count">ID: {item.catId}</span>
                                    </div>
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
                                    <h3>{selectedCategory.name}</h3>
                                </div>
                                <div className="category-panel-detail-actions">
                                    <button
                                        className="category-detail-btn"
                                        onClick={this.handlePanelEdit}
                                    >
                                        <EditIcon />
                                        Edit
                                    </button>
                                    <button
                                        className="category-detail-delete-btn"
                                        onClick={this.handlePanelDelete}
                                        title="Delete"
                                    >
                                        <DeleteIcon />
                                    </button>
                                </div>
                            </div>

                            <p className="category-panel-detail-subtitle">
                                Category ID: {selectedCategory.catId}
                            </p>

                            <div className="category-detail-tabs">
                                <button className="category-detail-tab active">
                                    Details
                                </button>
                            </div>

                            <div className="category-detail-info">
                                <div className="category-detail-info-item">
                                    <span className="category-detail-info-label">Category ID</span>
                                    <span className="category-detail-info-value">{selectedCategory.catId}</span>
                                </div>
                                <div className="category-detail-info-item">
                                    <span className="category-detail-info-label">Name</span>
                                    <span className="category-detail-info-value">{selectedCategory.name}</span>
                                </div>
                                <div className="category-detail-info-item">
                                    <span className="category-detail-info-label">Color</span>
                                    <span className="category-detail-info-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span
                                            style={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: '6px',
                                                background: selectedCategory.color || '#FFA500',
                                                border: '2px solid #d4e3ed',
                                                display: 'inline-block',
                                            }}
                                        />
                                        {selectedCategory.color || '#FFA500'}
                                    </span>
                                </div>
                            </div>

                            <div className="category-detail-description">
                                <h4>Description</h4>
                                <p>{selectedCategory.description || 'No description available'}</p>
                            </div>
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
    }

    render() {
        const filteredData = this.getFilteredAndSortedData();

        return (
            <>
                {/* Breadcrumb Navigation */}
                <div className="category-breadcrumb">
                    <span className="breadcrumb-link">Planner</span>
                    <ChevronRightIcon />
                    <span className="breadcrumb-current">Category</span>
                </div>

                {this.state.PageMode === 'Home' && (
                    <div className="row">
                        <div className="col-12">
                            {/* View Header with Toggle */}
                            <div className="category-view-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div className="category-view-toggle">
                                        <button
                                            className={`category-view-toggle-btn ${this.state.viewMode === 'panel' ? 'active' : ''}`}
                                            onClick={() => this.setState({ viewMode: 'panel' })}
                                            title="Panel View"
                                        >
                                            <PanelViewIcon />
                                            Panel View
                                        </button>
                                        <button
                                            className={`category-view-toggle-btn ${this.state.viewMode === 'table' ? 'active' : ''}`}
                                            onClick={() => this.setState({ viewMode: 'table' })}
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
                                            value={this.state.searchTerm}
                                            onChange={(e) => this.setState({ searchTerm: e.target.value })}
                                        />
                                    </div>
                                    <button type="button" className="category-add-btn" onClick={() => this.Addnew()}>
                                        <PlusIcon />
                                        New Category
                                    </button>
                                </div>
                            </div>

                            {/* Panel View */}
                            <div style={{ display: this.state.viewMode === 'panel' ? 'block' : 'none' }}>
                                {this.renderPanelView()}
                            </div>

                            {/* Table View */}
                            <div style={{ display: this.state.viewMode === 'table' ? 'block' : 'none' }}>
                                <div className="card category-table-card">
                                    <div className="card-body pt-2">
                                        <DataGrid
                                            Id="grdCalendarCategory"
                                            IsPagination={false}
                                            ColumnCollection={this.state.gridHeader}
                                            Onpageindexchanged={this.onPagechange.bind(this)}
                                            onEditMethod={this.ongridedit.bind(this)}
                                            onGridDeleteMethod={this.onGridDelete.bind(this)}
                                            DefaultPagination={false}
                                            IsSarching={false}
                                            GridData={filteredData}
                                            pageSize="2000"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add/Edit Modal */}
                {(this.state.PageMode === 'Add' || this.state.PageMode === 'Edit') && (
                    <div className="category-modal-overlay">
                        <div className="category-edit-modal" style={{ maxWidth: '560px' }}>
                            <div className="category-edit-modal-header">
                                <div className="category-edit-modal-icon">
                                    {this.state.PageMode === 'Add' ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                            <line x1="12" y1="5" x2="12" y2="19"/>
                                            <line x1="5" y1="12" x2="19" y2="12"/>
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                    )}
                                </div>
                                <div className="category-edit-modal-title-section">
                                    <h3>{this.state.PageMode === 'Add' ? "Create New Category" : "Edit Category"}</h3>
                                    <p>{this.state.PageMode === 'Add' ? "Add a new planner category" : "Update the category details below"}</p>
                                </div>
                                <button className="category-edit-modal-close" onClick={this.handleCancel}>
                                    <CloseIcon />
                                </button>
                            </div>
                            <div className="category-edit-modal-body">
                                <div className="category-edit-form-group">
                                    <label htmlFor="txtCatColor">
                                        Category Name <span className="required">*</span>
                                    </label>
                                    <input
                                        id="txtCatColor"
                                        required
                                        placeholder="e.g., Maintenance, Cleaning, Inspection"
                                        type="text"
                                        className="category-edit-input"
                                        value={this.state.catName}
                                        onChange={(e) => this.setState({ catName: e.target.value })}
                                    />
                                </div>
                                <div className="category-edit-form-group">
                                    <label htmlFor="txtCatDesc">
                                        Description
                                    </label>
                                    <textarea
                                        id="txtCatDesc"
                                        placeholder="Provide a brief description of this category..."
                                        className="category-edit-textarea"
                                        value={this.state.catDesc}
                                        onChange={(e) => this.setState({ catDesc: e.target.value })}
                                        rows="3"
                                    />
                                </div>
                                <div className="category-edit-form-group">
                                    <label>Category Color</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <span
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '10px',
                                                background: this.state.catColor,
                                                border: '2px solid #d4e3ed',
                                                cursor: 'pointer',
                                                flexShrink: 0,
                                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                            }}
                                            onClick={() => this.setState({ isShowColorPicker: !this.state.isShowColorPicker })}
                                            title="Click to toggle color picker"
                                        />
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1E4A6B' }}>{this.state.catColor}</span>
                                        <button
                                            type="button"
                                            style={{
                                                marginLeft: 'auto',
                                                padding: '8px 16px',
                                                border: '2px solid #4A7FA8',
                                                background: this.state.isShowColorPicker ? '#336B93' : '#fff',
                                                color: this.state.isShowColorPicker ? '#fff' : '#336B93',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                transition: 'all 0.25s ease',
                                            }}
                                            onClick={() => this.setState({ isShowColorPicker: !this.state.isShowColorPicker })}
                                        >
                                            {this.state.isShowColorPicker ? 'Close Picker' : 'Choose Color'}
                                        </button>
                                    </div>
                                    {this.state.isShowColorPicker &&
                                        <SketchPicker
                                            color={this.state.catColor}
                                            onChangeComplete={this.handleChangeComplete}
                                        />}
                                </div>
                                {this.state.PageMode === 'Edit' && this.state.CatId > 0 && (
                                    <div className="category-edit-info-badge">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="12" y1="16" x2="12" y2="12"/>
                                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                                        </svg>
                                        <span>Category ID: {this.state.CatId}</span>
                                    </div>
                                )}
                            </div>
                            <div className="category-edit-modal-footer">
                                <button className="category-edit-btn-cancel" onClick={this.handleCancel}>
                                    Cancel
                                </button>
                                <button className="category-edit-btn-save" onClick={this.handleSave}>
                                    {this.state.PageMode === 'Add' ? (
                                        <>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                                <line x1="12" y1="5" x2="12" y2="19"/>
                                                <line x1="5" y1="12" x2="19" y2="12"/>
                                            </svg>
                                            Create Category
                                        </>
                                    ) : (
                                        <>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                            Save Changes
                                        </>
                                    )}
                                </button>
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
                    </div>
                )}
            </>
        );
    }
}

export default Category;
