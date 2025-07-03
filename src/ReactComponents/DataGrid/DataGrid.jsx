// Created By Sanjay Vishwakarma
// Date: Apr 26 2019
import React from 'react';
import GridPagination from './GridPagination.jsx'
import * as objcommonjs from '../../Common/AppCommon.js'
import DataGridBL from '../DataGrid/DataGridBL.js';
import './DataGrid.css';
import swal from 'sweetalert';
import ApiProvider from '../DataGrid/DataProvider.js';
const $ = window.$;

//let objcommonjs = new Commonjs();
let object = new DataGridBL();
let gridBL = new DataGridBL();

let returnSelectValues = [];
export default class DataGrid extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    componentDidMount() {
        // Initialize DataTable when the component mounts
        $(`#${this.props.Id}`).DataTable({
            data: null, // Data will be set in componentDidUpdate
            searching: false,
            "paging": false,
            "info": false,
            "order": [],
            "oLanguage": {
                "sEmptyTable": " "
            },
            columns: this.props.ColumnCollection,
        });
        this.ApiProviderr = new ApiProvider();
    }

    GetSelectionIds() {
        return returnSelectValues;
    }

    ResetSelectionIds() {
        returnSelectValues = [];
    }
    // Grid Event Method wrappers - these simply pass the Id to the parent component
    onGridEdit(fId) {
        this.props.onEditMethod(fId);
    }
    onGridManage(fId) {
        this.props.onGridApprove(fId);
    }
    onGridDelete(fId) {
        this.props.onGridDeleteMethod(fId);
    }
    onGridBlock(fId) {
        this.props.onGridBlockMethod(fId);
    }
    onGridView(fId) {
        this.props.onGridViewMethod(fId);
    }
    onGridDownload(fId) {
        this.props.onGridDownloadMethod(fId);
    }

    componentDidUpdate() {
        let _this = this; // Capture 'this' for use inside jQuery event handlers
        var dr = this.props.ColumnCollection; // Column definitions
        let object = this; // Reference to the DataGrid component instance for event handlers

        $('.tbl-loading').removeClass('hide'); // Show loading indicator

        let GridarrayMain = []; // Array to hold transformed data for DataTables
        let Gridarray = [];     // Temporary array for each row

        // --- Start: Capture current page before destroying the table ---
        let currentPage = 0;
        const existingTable = $(`#${this.props.Id}`).DataTable();

        // Check if the table exists and pagination is enabled before getting the page
        if (existingTable.page && this.props.DefaultPagination) {
            currentPage = existingTable.page();
        }
        // --- End: Capture current page ---

        if (this.props.GridData != null) {
            this.props.GridData.map((val, idx) => {
                // Populate Gridarray with data values based on ColumnCollection
                this.props.ColumnCollection.map((cval, cidx) => {
                    Gridarray.splice(cidx, 0, (val[cval.titleValue]));
                });

                // --- Start: Custom column rendering logic ---

                // Status Color Column
                const StatusColorColumn = gridBL.GetStatusColorColumn(this.props.ColumnCollection);
                let statusColorColIndex = null;
                let statusValue = null;
                if (StatusColorColumn != null) {
                    statusColorColIndex = StatusColorColumn[0].Index;
                    statusValue = StatusColorColumn[0].Value;
                }
                if (statusColorColIndex !== null) {
                    // Existing logic for status color/text rendering
                    Gridarray[statusColorColIndex] = `<span>${val[statusValue]}</span>`;
                    if (StatusColorColumn[0].Value === 'color') {
                        Gridarray[statusColorColIndex] = `<span style="background-color:${val[statusValue]}">${val[statusValue]}</span>`;
                    }
                    if (val[statusValue] === "Vacant") {
                        Gridarray[statusColorColIndex] = `<span class='setStatusbox btn-success'>${val[statusValue]}</span>`;
                    }
                    if (val[statusValue] === "Tenant Residing") {
                        Gridarray[statusColorColIndex] = `<span class='setStatusbox btn-warning'>${val[statusValue]}</span>`;
                    }
                    if (val[statusValue] === "Owner Residing") {
                        Gridarray[statusColorColIndex] = `<span class='setStatusbox btn-danger'>${val[statusValue]}</span>`;
                    }
                }

                // Generic Status Column (for class mapping)
                const StatusColumn = gridBL.GetStatusColumn(this.props.ColumnCollection);
                let statusColIndex = null;
                if (StatusColumn != null) {
                    statusColIndex = StatusColumn[0].Index;
                }
                if (statusColIndex != null) {
                    Gridarray[statusColIndex] = `<span class=${Gridarray[statusColIndex].toLowerCase()}>${Gridarray[statusColIndex]}</span>`;
                }

                // Select Checkbox
                const SelectButton = gridBL.GetSelectOption(this.props.ColumnCollection);
                let selectIndex = null;
                let statusindex = null;
                if (SelectButton != null) {
                    selectIndex = SelectButton[0].Index;
                    statusindex = SelectButton[0].StatusColumnIndex;
                }
                if (selectIndex != null && statusindex == null) {
                    Gridarray[selectIndex] = `<input type="checkbox" value="${val.Id}">`; // Use actual ID
                }
                if (selectIndex !== null && statusindex !== null) {
                    if (Gridarray[statusindex] === "Expired" || Gridarray[statusindex] === "Deactivated")
                        Gridarray[selectIndex] = `<input type="checkbox" disabled >`;
                    else {
                        Gridarray[selectIndex] = `<input type="checkbox" value="${val.Id}">`; // Use actual ID
                    }
                }

                // Image Column
                const SelectImage = gridBL.GetImageIndexForUrl(this.props.ColumnCollection);
                let iselectIndex = null;
                let imagePath = null;
                if (SelectImage != null) {
                    iselectIndex = SelectImage[0].Index;
                    imagePath = SelectImage[0].ImagePath
                }
                if (iselectIndex != null) {
                    Gridarray[iselectIndex] = "<img src=" + val[imagePath] + " class='rounded-circle' alt=" + val.name + " width='35' height='35'/>";
                }

                // Toggle Switch (e.g., for password visibility)
                const ToggleSwitch = gridBL.GetToggleSwitch(this.props.ColumnCollection);
                if (ToggleSwitch != null) {
                    ToggleSwitch.forEach(element => {
                        Gridarray[element.Index] = `<input style='width: ${element.Width}%;border: 0px;background-color: transparent;box-shadow: none;' type='password' value="${val[element.ToggleSwitch]}" id="${(element.ToggleSwitch)}Protection${val.Id}" readonly><span class='showHideButton' value="${(element.ToggleSwitch)}"><i class='fa fa-eye' aria-hidden='true'></i></span>`;
                    });
                }

                // IsBlocked Column (status for facility members)
                const IsBlocked = gridBL.GetIsBlockedColumn(this.props.ColumnCollection);
                let bselectIndex = null;
                let isBlocked = null;
                let isApproved = null;
                if (IsBlocked != null) {
                    bselectIndex = IsBlocked[0].Index;
                    isBlocked = IsBlocked[0].IsBlocked;
                    isApproved = IsBlocked[0].IsApproved;
                }
                if (bselectIndex != null) {
                    if (val[isBlocked] === false) {
                        if (val[isApproved] === true) {
                            Gridarray[bselectIndex] = "Active";
                        } else {
                            Gridarray[bselectIndex] = "Pending";
                        }
                    } else {
                        Gridarray[bselectIndex] = "Block";
                    }
                }
                const IsBlockedFacilty = gridBL.GetIsBlockedColumnFaciltyMember(this.props.ColumnCollection); // RG Changes

                // Action Buttons
                const actionButtons = gridBL.GetActionButton(this.props.ColumnCollection);
                let actionButtonIndex = null;
                if (actionButtons != null) {
                    actionButtonIndex = actionButtons[0].Index;
                }
                let btnhtml = "";
                if (actionButtons && actionButtons !== undefined) {
                    actionButtons.map((action, idx) => {
                        // All buttons will now have data-id attribute for robust ID retrieval
                        // The value in data-id should be the actual unique ID of the row
                        const rowId = val.Id; // Assuming 'Id' is the unique identifier in your data object 'val'

                        switch (action.Buttons[0]) {
                            case 'Edit&Delete':
                                btnhtml += `<button class="btn btn-sm btn-info" title="Edit" data-id="${rowId}"><i class="fa fa-pen-alt"></i></button>`;
                                btnhtml += `<button class="btn btn-sm btn-danger" title="Delete" data-id="${rowId}"><i class="fa fa-trash"></i></button>`;
                                break;
                            case 'Edit&View&Delete':
                                btnhtml += `<button class="btn btn-sm btn-info" title="Edit" data-id="${rowId}"><i class="fa fa-pen-alt"></i></button>`;
                                btnhtml += `<button class="btn btn-sm btn-warning" title="View" data-id="${rowId}"><i class="fa fa-eye"></i></button>`;
                                btnhtml += `<button class="btn btn-sm btn-danger" title="Delete" data-id="${rowId}"><i class="fa fa-trash"></i></button>`;
                                break;
                            case 'Edit&Approve&Reject':
                                btnhtml += `<button class="btn btn-sm btn-info" title="Edit" data-id="${rowId}"><i class="fa fa-pen-alt"></i></button>`;
                                btnhtml += `<button class="btn btn-sm btn-warning" title="Approve" data-id="${rowId}"><i class="fa fa-check"></i></button>`;
                                btnhtml += `<button class="btn btn-sm btn-dark" title="Reject" data-id="${rowId}"><i class="fa fa-ban"></i></button>`;
                                break;
                            case 'View&Delete':
                                btnhtml += `<button class="btn btn-sm btn-warning" title="View" data-id="${rowId}"><i class="fa fa-eye"></i></button>`;
                                btnhtml += `<button class="btn btn-sm btn-danger" title="Delete" data-id="${rowId}"><i class="fa fa-trash"></i></button>`;
                                break;
                            case 'Edit&Delete&Block':
                                btnhtml += `<button class="btn btn-sm btn-info" title="Edit" data-id="${rowId}"><i class="fa fa-pen-alt"></i></button>`;
                                btnhtml += `<button class="btn btn-sm btn-danger" title="Delete" data-id="${rowId}"><i class="fa fa-trash"></i></button>`;
                                if (Gridarray[IsBlockedFacilty] === 'Blocked') {
                                    btnhtml += `<button class="btn btn-sm btn-secondary BlockAndUnblock" title="Unblock" data-id="${rowId}"><i class="fa fa-circle"></i></button>`;
                                } else {
                                    btnhtml += `<button class="btn btn-sm btn-dark BlockAndUnblock" title="Block" data-id="${rowId}"><i class="fa fa-ban"></i></button>`;
                                }
                                break;
                            case 'Edit':
                                btnhtml += `<button class="btn btn-sm btn-info" title="Edit" data-toggle="modal" data-target="#ticketCrudModal" data-id="${rowId}"><i class="fa fa-pen-alt"></i></button>`;
                                break;
                            case 'Edit&Approve':
                                btnhtml += `<button class="btn btn-sm btn-info" title="Edit/Approve" data-toggle="modal" data-target="#ticketCrudModal" data-id="${rowId}"><i class="fa fa-pen-alt"></i></button>`;
                                break;
                            case 'Delete':
                                btnhtml += `<button class="btn btn-sm btn-danger" title="Delete" data-id="${rowId}"><i class="fa fa-trash"></i></button>`;
                                break;
                            case 'View':
                                btnhtml += `<button class="btn btn-sm btn-warning" title="View" data-toggle="modal" data-target="#ticketViewModal" data-id="${rowId}"><i class="fa fa-eye"></i></button>`;
                                break;
                            case 'Download':
                                btnhtml += `<button class="btn btn-sm btn-success" title="Download" data-id="${rowId}"><i class="fa fa-download"></i></button>`;
                                break;
                            case 'DownloadNDelete':
                                btnhtml += `<button class="btn btn-sm btn-success" title="Download" data-id="${rowId}"><i class="fa fa-download"></i></button>`;
                                btnhtml += `<button class="btn btn-sm btn-danger" title="Delete" data-id="${rowId}"><i class="fa fa-trash"></i></button>`;
                                break;
                            case 'Edit&View':
                                btnhtml += `<button class="btn btn-sm btn-info" title="Edit" data-toggle="modal" data-target="#ticketCrudModal" data-id="${rowId}"><i class="fa fa-pen-alt"></i></button>`;
                                btnhtml += `<button class="btn btn-sm btn-warning" title="View" data-toggle="modal" data-target="#ticketViewModal" data-id="${rowId}"><i class="fa fa-eye"></i></button>`;
                                break;
                            case 'ALL':
                                btnhtml += `<button class="btn btn-sm btn-warning" title="View" data-id="${rowId}"><i class="fa fa-eye"></i></button>`;
                                btnhtml += `<button class="btn btn-sm btn-info" title="Edit" data-id="${rowId}"><i class="fa fa-pen-alt"></i></button>`;
                                btnhtml += `<button class="btn btn-sm btn-danger" title="Delete" data-id="${rowId}"><i class="fa fa-trash"></i></button>`;
                                break;
                            case 'Manage':
                                btnhtml += `<button class="btn btn-sm btn-info" title="Manage" data-toggle="modal" data-target="#ticketCrudModal" data-id="${rowId}"><i class="fa fa-tasks"></i></button>`;
                                break;
                            case 'Edit&Manage':
                                btnhtml += `<button class="btn btn-sm btn-info" title="Edit" data-toggle="modal" data-target="#ticketCrudModal" data-id="${rowId}"><i class="fa fa-pen-alt"></i></button>`;
                                btnhtml += `<button class="btn btn-sm btn-info" title="Manage" data-toggle="modal" data-target="#ticketCrudModal" style="margin-left:10px" data-id="${rowId}"><i class="fa fa-tasks"></i></button>`;
                                break;
                            default:
                                break;
                        }
                    });
                }
                // Assign the generated HTML buttons to the correct column index
                if (actionButtonIndex != null)
                    Gridarray[actionButtonIndex] = btnhtml;

                // --- End: Custom column rendering logic ---

                GridarrayMain.splice(idx, 0, Gridarray); // Add the processed row to main data array
                Gridarray = []; // Reset temporary array for next row
            });
        }

        // Clear existing table and re-initialize DataTables with new data
        objcommonjs.ClearTableGrid(this.props.Id);
        let table = $(`#${this.props.Id}`).DataTable({
            data: GridarrayMain,
            "paging": this.props.DefaultPagination,
            "info": this.props.DefaultPagination,
            "order": [],
            "lengthChange": false,
            "searching": this.props.IsSarching,
            "ordering": true,
            "autoWidth": false,
            "columns": this.props.ColumnCollection
        });

        // --- Start: Restore current page after re-initialization ---
        if (this.props.DefaultPagination) {
            table.page(currentPage).draw('page'); // Set page and redraw
        }
        // --- End: Restore current page ---

        // Hide columns based on column definition
        dr.map((item, index) => {
            if (item.visible !== undefined && item.visible) {
                table.column(index).visible(false);
            }
        });

        if (this.props.GridData != null) {
            // Unbind previous click handlers to prevent multiple bindings
            $(`#${this.props.Id} tbody`).unbind("click");

            // EDIT ACTION: Get ID from data-id attribute on the button
            $(`#${this.props.Id} tbody`).on('click', '.btn-info', function () {
                const fId = $(this).data('id'); // Get ID directly from data attribute
                object.onGridEdit(fId);
            });

            // DOWNLOAD ACTION: Get ID from data-id attribute on the button
            $(`#${this.props.Id} tbody`).on('click', '.btn-success', function () {
                const fId = $(this).data('id'); // Get ID directly from data attribute
                object.onGridDownload(fId);
            });

            // VIEW ACTION: Get ID from data-id attribute on the button
            $(`#${this.props.Id} tbody`).on('click', '.btn-warning', function () {
                const fId = $(this).data('id'); // Get ID directly from data attribute
                object.onGridView(fId);
            });

            // DELETE ACTION: Get ID from data-id attribute on the button
            $(`#${this.props.Id} tbody`).on('click', '.btn-danger', function () {
                const fId = $(this).data('id'); 
                object.onGridDelete(fId);
            });

            $(`#${this.props.Id} tbody`).on('click', '.BlockAndUnblock', function () {
                const fId = $(this).data('id'); 
                object.onGridBlock(fId);
            });

            $(`#${this.props.Id} tbody`).on('click', 'input[type=checkbox]', function () {
                let returnVale = $(this).val();

                if (this.checked) {
                    if (returnSelectValues.length > 0) {
                        returnSelectValues.push({ Value: returnVale });
                    }
                    else {
                        returnSelectValues = [{ Value: returnVale }];
                    }
                }
                else {
                    let deleteIndex = undefined;
                    let searchjson = returnSelectValues.find((item, idx) => {
                        deleteIndex = idx;
                        return item.Value === returnVale
                    });
                    if (deleteIndex !== undefined) {
                        returnSelectValues.splice(deleteIndex, 1);
                    }
                }
            });

            $(`#${this.props.Id} tbody`).on('click', '.showHideButton', function () {
                const rowData = table.row($(this).closest('tr')).data();
                const rowId = rowData[gridBL.GetReferenceIdIndex(object.props.ColumnCollection, "Action")]; 

                let val = $(this).attr("value");
                var x = document.getElementById(val + "Protection" + rowId); 

                if (x) {
                    if (x.type === "password") {
                        _this.viewInformation(val + " Showing", rowId, x);
                    } else {
                        x.type = "password";
                        $(this).children('i').removeClass("fa-eye-slash");
                    }
                }
            });
        }
        $('.tbl-loading').addClass('hide'); 
    }

    viewInformation = (action, Id, x) => {
        var textarea = document.createElement('textarea');
        textarea.rows = 6;
        textarea.className = 'swal-content__textarea';
        textarea.onkeyup = function () {
            swal.setActionValue({
                confirm: this.value
            });
        };
        let _this = this;
        swal({
            title: "View Personal Information",
            text: 'Please provide the reason for accessing personal information of the resident. This action shall be audited.',
            content: textarea,
            buttons: {
                confirm: {
                    text: 'Submit',
                    closeModal: false
                },
                cancel: {
                    text: 'Cancel',
                    visible: true
                }
            }
        }).then(function (value) {
            if (value && value !== true && value !== '') {
                var model = [{
                    "Id": Id,
                    "FormName": window.location.pathname.split("/").pop(),
                    "Action": action,
                    "JustificationComment": value
                }];
                _this.ApiProviderr.manageDataGrid(model).then(
                    resp => {
                        if (resp.ok && resp.status === 200) {
                            return resp.json().then(rData => {
                                if (rData) {
                                    x.type = "text";
                                    swal.close();
                                }
                            });
                        }
                    });
            }
            if (value === true || value === '') {
                swal("", "You need to write something!", "info");
            }
        });
    }

    render() {
        return (
            <div>
                <div className="table-responsive">
                    <table id={this.props.Id}
                        className="table table-bordered table-striped table-hover table-sm custTable dataTable no-footer dtr-inline"
                        role="grid" >
                    </table>
                </div>
                {this.props.IsPagination &&
                    <GridPagination
                        Onpagechanged={this.props.Onpageindexchanged.bind(this)}
                        totalRows={this.props.totalrows}
                        totalPages={this.props.totalpages}
                        pageSize={this.props.pageSize}
                    />
                }
            </div>
        );
    }
}
DataGrid.defaultProps = {
    IsSarching: false,
    IsPagination: false,
    DefaultPagination: false,
}
