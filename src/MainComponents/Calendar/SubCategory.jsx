import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from './DataProvider';
import * as appCommon from '../../Common/AppCommon.js';

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

const SubCategoryIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
);

const EditIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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

class SubCategory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: "Home",
            viewMode: "panel",
            subCategoryData: [],
            categoryData: [],
            selectedCategoryId: '',
            subCategoryName: '',
            subCategoryId: '',
            selectedSubCategory: null,
            searchTerm: "",
            sortBy: "name_asc",
            gridHeader: [
                { sTitle: 'Id', titleValue: 'Value', "orderable": false },
                { sTitle: 'Sub Category Name', titleValue: 'Name' },
                { sTitle: 'Category Name', titleValue: 'CategoryName' },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit", Index: '0', "orderable": false },
            ],
        }
        this.ApiProviderr = new ApiProvider();
    }

    componentDidMount() {
        this.getCategory();
    }

    componentDidUpdate(prevProps, prevState) {
        // Auto-select first subcategory in panel view when data changes
        if (prevState.subCategoryData !== this.state.subCategoryData || prevState.viewMode !== this.state.viewMode) {
            const filtered = this.getFilteredAndSortedData();
            if (filtered.length > 0 && this.state.viewMode === "panel") {
                if (!this.state.selectedSubCategory || !filtered.find(item => item.Value === this.state.selectedSubCategory.Value)) {
                    this.setState({ selectedSubCategory: filtered[0] });
                }
            } else if (filtered.length === 0) {
                this.setState({ selectedSubCategory: null });
            }
        }
    }

    // ---------------------------------------------------
    // LOAD CATEGORY LIST
    // ---------------------------------------------------
    getCategory = () => {
        this.ApiProviderr.manageCategory([{ CmdType: "R" }], 'R').then(
            resp => {
                if (resp.ok) {
                    resp.json().then(data => {
                        const formatted = data.map(item => ({
                            Value: item.catId,
                            Name: item.name,
                        }));
                        this.setState({ categoryData: formatted }, () => {
                            this.getSubCategory();
                        });
                    });
                }
            }
        );
    }

    // ---------------------------------------------------
    // LOAD SUBCATEGORY LIST
    // ---------------------------------------------------
    getSubCategory = () => {
        this.ApiProviderr.manageSubCategory([{ CmdType: "R" }], 'R', 0).then(
            resp => {
                if (resp.ok) {
                    resp.json().then(data => {
                        const formatted = data.map(item => {
                            const cat = this.state.categoryData.find(c => c.Value === item.CategoryId);
                            return {
                                Value: item.SubCategoryId,
                                Name: item.SubCategoryName,
                                CategoryId: item.CategoryId,
                                CategoryName: cat ? cat.Name : "—"
                            };
                        });
                        this.setState({ subCategoryData: formatted });
                    });
                }
            }
        );
    }

    getFilteredAndSortedData = () => {
        let data = [...this.state.subCategoryData];
        const { searchTerm, sortBy } = this.state;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            data = data.filter(item =>
                (item.Name && item.Name.toLowerCase().includes(term)) ||
                (item.CategoryName && item.CategoryName.toLowerCase().includes(term))
            );
        }

        switch (sortBy) {
            case "name_asc":
                data.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));
                break;
            case "name_desc":
                data.sort((a, b) => (b.Name || '').localeCompare(a.Name || ''));
                break;
            case "cat_asc":
                data.sort((a, b) => (a.CategoryName || '').localeCompare(b.CategoryName || ''));
                break;
            case "cat_desc":
                data.sort((a, b) => (b.CategoryName || '').localeCompare(a.CategoryName || ''));
                break;
            default:
                break;
        }
        return data;
    }

    // ---------------------------------------------------
    // SAVE SUBCATEGORY
    // ---------------------------------------------------
    handleSave = () => {
        if (!this.state.selectedCategoryId) {
            appCommon.ShownotifyError("Please select a Category");
            return;
        }
        if (!this.state.subCategoryName || this.state.subCategoryName.trim() === '') {
            appCommon.ShownotifyError("Please enter a Sub Category Name");
            return;
        }

        let type = this.state.subCategoryId ? 'U' : 'C';

        const model = [{
            categoryId: parseInt(this.state.selectedCategoryId),
            subCategoryName: this.state.subCategoryName,
            subCategoryId: this.state.subCategoryId ? parseInt(this.state.subCategoryId) : null
        }];

        this.ApiProviderr.manageSubCategory(model, type).then(
            resp => {
                if (resp.ok) {
                    appCommon.showtextalert(
                        this.state.subCategoryId ? "Sub Category Updated Successfully!" : "Sub Category Saved Successfully!",
                        "", "success"
                    );
                    this.handleCancel();
                }
            }
        );
    }

    Addnew = () => {
        this.setState({
            PageMode: 'Add',
            selectedCategoryId: '',
            subCategoryName: '',
            subCategoryId: '',
        });
    }

    ongridedit(Id) {
        var rowData = this.state.subCategoryData.find(item => item.Value == Id);
        if (rowData) {
            this.setState({
                subCategoryId: rowData.Value,
                subCategoryName: rowData.Name,
                selectedCategoryId: rowData.CategoryId || '',
                PageMode: 'Edit',
            });
        }
    }

    handleCancel = () => {
        this.setState({
            PageMode: 'Home',
            selectedCategoryId: '',
            subCategoryName: '',
            subCategoryId: '',
        }, () => {
            this.getCategory();
        });
    }

    handleSubCategorySelect = (subCategory) => {
        this.setState({ selectedSubCategory: subCategory });
    }

    handlePanelEdit = () => {
        if (this.state.selectedSubCategory) {
            this.ongridedit(this.state.selectedSubCategory.Value);
        }
    }

    onPagechange = (page) => { }

    renderPanelView() {
        const filteredData = this.getFilteredAndSortedData();
        const { selectedSubCategory, sortBy } = this.state;

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
                                <option value="cat_asc">Category: Ascending</option>
                                <option value="cat_desc">Category: Descending</option>
                            </select>
                        </div>
                    </div>
                    <div className="category-panel-items">
                        {filteredData.length === 0 ? (
                            <div className="category-panel-empty">
                                <EmptyIcon />
                                <h4>No sub categories found</h4>
                                <p>Try adjusting your search or add a new sub category</p>
                            </div>
                        ) : (
                            filteredData.map((item) => (
                                <div
                                    key={item.Value}
                                    className={`category-panel-item ${selectedSubCategory?.Value === item.Value ? 'active' : ''}`}
                                    onClick={() => this.handleSubCategorySelect(item)}
                                >
                                    <div className="category-panel-item-icon" style={{ borderColor: '#4A7FA8' }}>
                                        <SubCategoryIcon />
                                    </div>
                                    <div className="category-panel-item-content">
                                        <h4 className="category-panel-item-name">{item.Name}</h4>
                                        <p className="category-panel-item-desc">
                                            {item.CategoryName || 'No category'}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="category-panel-item-count">ID: {item.Value}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel - Detail */}
                <div className="category-panel-detail">
                    {selectedSubCategory ? (
                        <>
                            <div className="category-panel-detail-header">
                                <div className="category-panel-detail-title">
                                    <h3>{selectedSubCategory.Name}</h3>
                                </div>
                                <div className="category-panel-detail-actions">
                                    <button
                                        className="category-detail-btn"
                                        onClick={this.handlePanelEdit}
                                    >
                                        <EditIcon />
                                        Edit
                                    </button>
                                </div>
                            </div>

                            <p className="category-panel-detail-subtitle">
                                Sub Category ID: {selectedSubCategory.Value}
                            </p>

                            <div className="category-detail-tabs">
                                <button className="category-detail-tab active">
                                    Details
                                </button>
                            </div>

                            <div className="category-detail-info">
                                <div className="category-detail-info-item">
                                    <span className="category-detail-info-label">Sub Category ID</span>
                                    <span className="category-detail-info-value">{selectedSubCategory.Value}</span>
                                </div>
                                <div className="category-detail-info-item">
                                    <span className="category-detail-info-label">Name</span>
                                    <span className="category-detail-info-value">{selectedSubCategory.Name}</span>
                                </div>
                                <div className="category-detail-info-item">
                                    <span className="category-detail-info-label">Category</span>
                                    <span className="category-detail-info-value">{selectedSubCategory.CategoryName}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="category-panel-empty">
                            <EmptyIcon />
                            <h4>Select a sub category</h4>
                            <p>Choose a sub category from the list to view details</p>
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
                    <span className="breadcrumb-current">Sub Category</span>
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
                                            placeholder="Search Sub Categories"
                                            value={this.state.searchTerm}
                                            onChange={(e) => this.setState({ searchTerm: e.target.value })}
                                        />
                                    </div>
                                    <button className="category-add-btn" onClick={this.Addnew}>
                                        <PlusIcon />
                                        New Sub Category
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
                                            Id="grdCalendarSubCategory"
                                            IsPagination={false}
                                            ColumnCollection={this.state.gridHeader}
                                            Onpageindexchanged={this.onPagechange.bind(this)}
                                            onEditMethod={this.ongridedit.bind(this)}
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
                                    <h3>{this.state.PageMode === 'Add' ? "Create New Sub Category" : "Edit Sub Category"}</h3>
                                    <p>{this.state.PageMode === 'Add' ? "Add a new planner sub category" : "Update the sub category details below"}</p>
                                </div>
                                <button className="category-edit-modal-close" onClick={this.handleCancel}>
                                    <CloseIcon />
                                </button>
                            </div>
                            <div className="category-edit-modal-body">
                                <div className="category-edit-form-group">
                                    <label>
                                        Category Name <span className="required">*</span>
                                    </label>
                                    <select
                                        className="category-edit-input"
                                        value={this.state.selectedCategoryId}
                                        onChange={(e) => this.setState({ selectedCategoryId: e.target.value })}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <option value="">Select Category</option>
                                        {this.state.categoryData.map(c => (
                                            <option key={c.Value} value={c.Value}>{c.Name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="category-edit-form-group">
                                    <label>
                                        Sub Category Name <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="category-edit-input"
                                        placeholder="e.g., Elevator Maintenance, Floor Cleaning"
                                        value={this.state.subCategoryName}
                                        onChange={(e) => this.setState({ subCategoryName: e.target.value })}
                                    />
                                </div>
                                {this.state.PageMode === 'Edit' && this.state.subCategoryId && (
                                    <div className="category-edit-info-badge">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="12" y1="16" x2="12" y2="12"/>
                                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                                        </svg>
                                        <span>Sub Category ID: {this.state.subCategoryId}</span>
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
                                            Create Sub Category
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

export default SubCategory;
