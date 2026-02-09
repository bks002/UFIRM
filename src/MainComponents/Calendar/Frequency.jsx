import React, { Component } from 'react';
import swal from 'sweetalert';
import { ToastContainer, toast } from 'react-toastify';

import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from './DataProvider';
import { CreateValidator, ValidateControls } from './Validation.js';
import * as appCommon from '../../Common/AppCommon.js';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import {getFrequencyList} from "../../Services/masterService";

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

const FrequencyIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
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

class Frequency extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: "Home",
            viewMode: "panel",
            fName: "",
            fValue: 0,
            fUnit: "0",
            GridData: [],
            gridHeader: [
                { sTitle: 'Id', titleValue: 'Id', "orderable": true },
                { sTitle: 'Name', titleValue: 'Name' },
                { sTitle: 'Frequency Value', titleValue: 'Fvalue', "orderable": false },
                { sTitle: 'Frequency Unit', titleValue: 'Funit', "orderable": false },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],
            fId: 0,
            loading: false,
            selectedFrequency: null,
            searchTerm: "",
            sortBy: "name_asc",
        }
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    componentDidMount() {
        this.getFrequency();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.PropertyId !== this.props.PropertyId) { }
        // Auto-select first frequency in panel view when data changes
        if (prevState.GridData !== this.state.GridData || prevState.viewMode !== this.state.viewMode) {
            const filtered = this.getFilteredAndSortedData();
            if (filtered.length > 0 && this.state.viewMode === "panel") {
                if (!this.state.selectedFrequency || !filtered.find(item => item.Id === this.state.selectedFrequency.Id)) {
                    this.setState({ selectedFrequency: filtered[0] });
                }
            } else if (filtered.length === 0) {
                this.setState({ selectedFrequency: null });
            }
        }
    }

    getFilteredAndSortedData = () => {
        let data = [...this.state.GridData];
        const { searchTerm, sortBy } = this.state;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            data = data.filter(item =>
                (item.Name && item.Name.toLowerCase().includes(term)) ||
                (item.Funit && item.Funit.toLowerCase().includes(term))
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
    }

    getModel = (type, catId) => {
        var model = [];
        switch (type) {
            case 'D':
                model.push({
                    "Id": catId,
                    "CmdType": type,
                });
                break;
            case 'C':
                model.push({
                    "Id": parseInt(this.state.fId),
                    "cmdType": type,
                    "name": this.state.fName,
                    "Fvalue": this.state.fValue,
                    "Funit": this.state.fUnit,
                });
                break;
            case 'U':
                model.push({
                    "Id": parseInt(this.state.fId),
                    "cmdType": type,
                    "name": this.state.fName,
                    "Fvalue": this.state.fValue,
                    "Funit": this.state.fUnit,
                });
                break;
            default:
        }
        return model;
    }

    manageFrequency = (model, type) => {
        this.ApiProviderr.manageFrequency(model, type).then(
            resp => {
                if (resp.ok && resp.status === 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'C':
                                if (rData === 1) {
                                    appCommon.showtextalert("Frequency Saved Successfully!", "", "success");
                                    this.handleCancel();
                                }
                                break;
                            case 'U':
                                if (rData > 0) {
                                    appCommon.showtextalert("Frequency Updated Successfully!", "", "success");
                                    this.handleCancel();
                                }
                                break;
                            case 'D':
                                if (rData === 1) {
                                    appCommon.showtextalert("Frequency Deleted Successfully!", "", "success");
                                }
                                else {
                                    appCommon.showtextalert("Something went wrong !", "", "error");
                                }
                                this.getFrequency();
                                break;
                            default:
                        }
                    });
                }
            });
    }

    getFrequency= async()=> {
        try {
            this.setState({ loading: true });
            const data = await getFrequencyList();
            this.setState({ GridData: data, loading: false });
        } catch (error) {
            console.error('Error fetching frequency:', error);
            this.setState({ loading: false });
        }
    }
    onPagechange = (page) => { }

    onGridDelete = (Id) => {
        //debugger
        let myhtml = document.createElement("div");
        myhtml.innerHTML = DELETE_CONFIRMATION_MSG + "</hr>"
        alert: (
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
                        this.setState({ fId: Id }, () => {
                            var type = 'D'
                            var model = this.getModel(type, Id);
                            this.manageFrequency(model, type);
                        });
                        break;
                    case "cancel":
                        break;
                    default:
                        break;
                }
            })
        );

    }

    ongridedit(Id) {
        this.setState({ PageMode: 'Edit' }, () => {
            CreateValidator();
        });
        var rowData = this.findItem(Id);
        if (rowData) {
            this.setState({
                fId: rowData.Id,
                fName: rowData.Name,
                fValue: rowData.Fvalue,
                fUnit: rowData.Funit,
            })
        }
    }

    findItem(id) {
        return this.state.GridData.find((item) => {
            if (item.Id === id) {
                return item;
            }
        });
    }

    Addnew = () => {
        this.setState({ PageMode: 'Add' }, () => {
            CreateValidator();
        });
    }

    handleSave = () => {
        if (ValidateControls()) {
            if (this.state.fUnit === "0") {
                appCommon.showtextalert("Please select a frequency unit", "", "error");
                return;
            }
            if (this.state.PageMode === "Add") {
                let exist = this.state.GridData.some((x) => x.Name.toLowerCase() === this.state.fName.toLowerCase());
                if (!exist) {
                    var type = 'C'
                    var model = this.getModel(type);
                    this.manageFrequency(model, type);
                }
                else {
                    appCommon.showtextalert(`Frequency name ${this.state.fName} already existed`, "", "error");
                }

            }

            if (this.state.PageMode === "Edit") {
                if (this.state.PageMode === "Edit") {
                    let type = "U";
                    let model = this.getModel(type);
                    this.manageFrequency(model, type);
                }
            }
        }
    }
    handleCancel = () => {
        this.setState({
            PageMode: 'Home',
            "fName": "",
            "fValue": 0,
            "fUnit": "0",
        }, () => this.getFrequency());

    };

    handleFrequencySelect = (frequency) => {
        this.setState({ selectedFrequency: frequency });
    }

    handlePanelEdit = () => {
        if (this.state.selectedFrequency) {
            this.ongridedit(this.state.selectedFrequency.Id);
        }
    }

    handlePanelDelete = () => {
        if (this.state.selectedFrequency) {
            this.onGridDelete(this.state.selectedFrequency.Id);
        }
    }

    renderPanelView() {
        const filteredData = this.getFilteredAndSortedData();
        const { selectedFrequency, sortBy } = this.state;

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
                                <h4>No frequencies found</h4>
                                <p>Try adjusting your search or add a new frequency</p>
                            </div>
                        ) : (
                            filteredData.map((item) => (
                                <div
                                    key={item.Id}
                                    className={`category-panel-item ${selectedFrequency?.Id === item.Id ? 'active' : ''}`}
                                    onClick={() => this.handleFrequencySelect(item)}
                                >
                                    <div className="category-panel-item-icon" style={{ borderColor: '#4A7FA8' }}>
                                        <FrequencyIcon />
                                    </div>
                                    <div className="category-panel-item-content">
                                        <h4 className="category-panel-item-name">{item.Name}</h4>
                                        <p className="category-panel-item-desc">
                                            {item.Fvalue} {item.Funit || 'No unit'}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="category-panel-item-count">ID: {item.Id}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel - Detail */}
                <div className="category-panel-detail">
                    {selectedFrequency ? (
                        <>
                            <div className="category-panel-detail-header">
                                <div className="category-panel-detail-title">
                                    <h3>{selectedFrequency.Name}</h3>
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
                                Frequency ID: {selectedFrequency.Id}
                            </p>

                            <div className="category-detail-tabs">
                                <button className="category-detail-tab active">
                                    Details
                                </button>
                            </div>

                            <div className="category-detail-info">
                                <div className="category-detail-info-item">
                                    <span className="category-detail-info-label">Frequency ID</span>
                                    <span className="category-detail-info-value">{selectedFrequency.Id}</span>
                                </div>
                                <div className="category-detail-info-item">
                                    <span className="category-detail-info-label">Name</span>
                                    <span className="category-detail-info-value">{selectedFrequency.Name}</span>
                                </div>
                                <div className="category-detail-info-item">
                                    <span className="category-detail-info-label">Frequency Value</span>
                                    <span className="category-detail-info-value">{selectedFrequency.Fvalue}</span>
                                </div>
                                <div className="category-detail-info-item">
                                    <span className="category-detail-info-label">Frequency Unit</span>
                                    <span className="category-detail-info-value">{selectedFrequency.Funit}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="category-panel-empty">
                            <EmptyIcon />
                            <h4>Select a frequency</h4>
                            <p>Choose a frequency from the list to view details</p>
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
                    <span className="breadcrumb-current">Frequency</span>
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
                                            placeholder="Search Frequencies"
                                            value={this.state.searchTerm}
                                            onChange={(e) => this.setState({ searchTerm: e.target.value })}
                                        />
                                    </div>
                                    <button className="category-add-btn" onClick={this.Addnew.bind(this)}>
                                        <PlusIcon />
                                        Add Frequency
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
                                            Id="grdCalendarFrequency"
                                            IsPagination={false}
                                            ColumnCollection={this.state.gridHeader}
                                            Onpageindexchanged={this.onPagechange.bind(this)}
                                            onEditMethod={this.ongridedit.bind(this)}
                                            onGridDeleteMethod={this.onGridDelete.bind(this)}
                                            DefaultPagination={false}
                                            IsSarching="false"
                                            GridData={this.state.GridData}
                                            pageSize="2000" />
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
                                    <h3>{this.state.PageMode === 'Add' ? "Add Frequency" : "Edit Frequency"}</h3>
                                    <p>{this.state.PageMode === 'Add' ? "Add a new frequency" : "Update the frequency details below"}</p>
                                </div>
                                <button className="category-edit-modal-close" onClick={this.handleCancel}>
                                    <CloseIcon />
                                </button>
                            </div>
                            <div className="category-edit-modal-body">
                                <div className="category-edit-form-group">
                                    <label>Frequency Name</label>
                                    <input
                                        id="fName"
                                        required
                                        placeholder="Enter Frequency Name"
                                        type="text"
                                        className="category-edit-input"
                                        value={this.state.fName}
                                        onChange={(e) => this.setState({fName: e.target.value})}
                                    />
                                </div>
                                <div className="category-edit-form-group">
                                    <label>Frequency Value</label>
                                    <input
                                        id="fValue"
                                        required
                                        placeholder="Enter Frequency Value"
                                        type="number"
                                        className="category-edit-input"
                                        value={this.state.fValue}
                                        onChange={(e) => this.setState({fValue: e.target.value})}
                                    />
                                </div>
                                <div className="category-edit-form-group">
                                    <label>Frequency Unit</label>
                                    <select
                                        id="funit"
                                        required
                                        className="category-edit-input"
                                        value={this.state.fUnit}
                                        onChange={(e) => this.setState({fUnit: e.target.value})}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <option value="0">Select frequency unit</option>
                                        <option value="Minutes">Minutes</option>
                                        <option value="Hours">Hours</option>
                                        <option value="Days">Days</option>
                                        <option value="Weeks">Weeks</option>
                                        <option value="Months">Months</option>
                                    </select>
                                </div>
                                {this.state.PageMode === 'Edit' && this.state.fId > 0 && (
                                    <div className="category-edit-info-badge">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="12" y1="16" x2="12" y2="12"/>
                                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                                        </svg>
                                        <span>Frequency ID: {this.state.fId}</span>
                                    </div>
                                )}
                            </div>
                            <div className="category-edit-modal-footer">
                                <Button Id="btnSave" Text="Save" Action={this.handleSave}
                                        ClassName="category-edit-btn-save"/>
                                <Button Id="btnCancel" Text="Cancel" Action={this.handleCancel}
                                        ClassName="category-edit-btn-cancel"/>
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

export default Frequency;
