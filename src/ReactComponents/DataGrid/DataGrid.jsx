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
        // 
        $(`#${this.props.Id}`).DataTable({
            data: null,
            searching: false,
            "paging": false,
            "info": false,
            "order": [],
            "oLanguage": {
                "sEmptyTable": " "
            },
            columns: this.props.ColumnCollection,
            // "columns": [{
            //     sTitle: "Id"
            // }]
        });
        this.ApiProviderr = new ApiProvider();
    }

    GetSelectionIds() {
        return returnSelectValues;
    }

    ResetSelectionIds() {
        returnSelectValues = [];
    }
    // Grid Event Method

    onGridEdit(fId) {
        this.props.onEditMethod(fId);
    }
    onGridManage(fId) {
        this.props.onGridApprove(fId);
    }

    onGridDelete(fId) {
        // alert('Delete' + id);

        this.props.onGridDeleteMethod(fId);
    }

    onGridBlock(fId) {
        this.props.onGridBlockMethod(fId);
    }


    onGridView(fId) {
        //this.props.onEditMethod(fId);
        this.props.onGridViewMethod(fId);
    }

    onGridDownload(fId) {
        this.props.onGridDownloadMethod(fId);
    }
    //End

    componentDidUpdate() {
        // 
        let _this = this;
        var dr = this.props.ColumnCollection;
        let object = this;
        $('.tbl-loading').removeClass('hide');
        let GridarrayMain = [];
        let Gridarray = [];
        if (this.props.GridData != null) {
            this.props.GridData.map((val, idx) => {
                this.props.ColumnCollection.map((cval, cidx) => {
                    Gridarray.splice(cidx, 0, (val[cval.titleValue]));
                });
                const StatusColorColumn = gridBL.GetStatusColorColumn(this.props.ColumnCollection);
                let statusColorColIndex = null;
                let statusValue = null;
                if (StatusColorColumn != null) {
                    statusColorColIndex = StatusColorColumn[0].Index;
                    statusValue = StatusColorColumn[0].Value;
                }


                const StatusColumn = gridBL.GetStatusColumn(this.props.ColumnCollection);
                let statusColIndex = null;
                if (StatusColumn != null) {
                    statusColIndex = StatusColumn[0].Index;
                }


                const SelectButton = gridBL.GetSelectOption(this.props.ColumnCollection);
                let selectIndex = null;
                let statusindex = null;
                if (SelectButton != null) {
                    selectIndex = SelectButton[0].Index;
                    statusindex = SelectButton[0].StatusColumnIndex;
                }
                const actionButtons = gridBL.GetActionButton(this.props.ColumnCollection);
                let actionButtonIndex = null;
                if (actionButtons != null) {
                    actionButtonIndex = actionButtons[0].Index;
                }

                //****Start******//ravindra 08-feb-2021
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

                const ToggleSwitch = gridBL.GetToggleSwitch(this.props.ColumnCollection);
                if (ToggleSwitch != null) {
                    ToggleSwitch.forEach(element => {
                        Gridarray[element.Index] = "<input style='width: " + element.Width + "%;border: 0px;background-color: transparent;box-shadow: none;' type='password' value=" + val[element.ToggleSwitch] + " id='" + (element.ToggleSwitch) + "Protection" + Gridarray[0] + "' readonly><span class='showHideButton' value='" + (element.ToggleSwitch) + "'><i class='fa fa-eye' aria-hidden='true'></i></span>";
                    });
                }

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
                //RG Changes because added status col in facilty member (get index)
                const IsBlockedFacilty = gridBL.GetIsBlockedColumnFaciltyMember(this.props.ColumnCollection);
                //****END******/

                let btnhtml = "";
                if (actionButtons !== undefined) {
                    actionButtons.map((action, idx) => {
                        switch (action.Buttons[0]) {
                            case 'Edit&Delete':
                                //btnhtml += `<a title="Edit" class="fa fa-edit" href="#"></a>`;
                                btnhtml += '<button class="btn btn-sm btn-info" title="Edit" ><i class="fa fa-pen-alt"></i></button>';
                                btnhtml += '<button class="btn btn-sm btn-danger" title="Delete"><i class="fa fa-trash"></i></button>';
                                break;
                            // Added by: Rakhmaji Ghule 147/0/2021 -> show Edit, Veiw and Delete button in Action Col 
                            case 'Edit&View&Delete':
                                btnhtml += '<button class="btn btn-sm btn-info" title="Edit" ><i class="fa fa-pen-alt"></i></button>';
                                btnhtml += '<button class="btn btn-sm btn-warning" title="View" ><i class="fa fa-eye"></i></button>';
                                btnhtml += '<button class="btn btn-sm btn-danger" title="Delete"><i class="fa fa-trash"></i></button>';
                                break;
                            // Added by: Rakhmaji Ghule 26/03/2021 -> show Edit, Approve and Reject button in Action Col 
                            case 'Edit&Approve&Reject':
                                btnhtml += '<button class="btn btn-sm btn-info" title="Edit" ><i class="fa fa-pen-alt"></i></button>';
                                btnhtml += '<button class="btn btn-sm btn-warning" title="Approve" ><i class="fa fa-check"></i></button>';
                                btnhtml += '<button class="btn btn-sm btn-dark" title="Reject"><i class="fa fa-ban"></i></button>';
                                break;
                            // Added by: Rakhmaji Ghule 26/03/2021 -> show view and Delete button in Action Col
                            case 'View&Delete':
                                btnhtml += '<button class="btn btn-sm btn-warning" title="View" ><i class="fa fa-eye"></i></button>';
                                btnhtml += '<button class="btn btn-sm btn-danger" title="Delete"><i class="fa fa-trash"></i></button>';
                                break;
                            case 'Edit&Delete&Block':
                                //btnhtml += `<a title="Edit" class="fa fa-edit" href="#"></a>`;
                                //RG Changes because added status col in facilty member (show block and unblock function)
                                // if (Gridarray[IsBlockedFacilty] !== 'Old') {
                                    btnhtml += '<button class="btn btn-sm btn-info" title="Edit" ><i class="fa fa-pen-alt"></i></button>';
                                    btnhtml += '<button class="btn btn-sm btn-danger" title="Delete"><i class="fa fa-trash"></i></button>';
                                    if (Gridarray[IsBlockedFacilty] === 'Blocked') {
                                        btnhtml += '<button class="btn btn-sm btn-secondary BlockAndUnblock" title="Unblock"><i class="fa fa-circle"></i></button>';
                                    } else {
                                        btnhtml += '<button class="btn btn-sm btn-dark BlockAndUnblock" title="Block"><i class="fa fa-ban"></i></button>';
                                    }
                                // }

                                break;
                            case 'Edit':
                                //btnhtml += `<a title="Edit" class="fa fa-edit" href="#"></a>`;
                                btnhtml += '<button class="btn btn-sm btn-info" title="Edit" data-toggle="modal" data-target="#ticketCrudModal" ><i class="fa fa-pen-alt"></i></button>';
                                break;
                                case 'Edit&Approve':
                                    //btnhtml += `<a title="Edit" class="fa fa-edit" href="#"></a>`;
                                    btnhtml += '<button class="btn btn-sm btn-info" title="Edit/Approve" data-toggle="modal" data-target="#ticketCrudModal" ><i class="fa fa-pen-alt"></i></button>';
                                    break;
                            case 'Delete':
                                btnhtml += '<button class="btn btn-sm btn-danger" title="Delete"><i class="fa fa-trash"></i></button>';
                                break;
                            case 'View':
                                btnhtml += '<button class="btn btn-sm btn-warning" title="View" data-toggle="modal" data-target="#ticketViewModal"><i class="fa fa-eye"></i></button>';
                                break;
                            case 'Download':
                                btnhtml += '<button class="btn btn-sm btn-success" title="Download"><i class="fa fa-download"></i></button>';
                                break;
                            case 'DownloadNDelete':
                                btnhtml += '<button class="btn btn-sm btn-success" title="Download"><i class="fa fa-download"></i></button>';
                                btnhtml += '<button class="btn btn-sm btn-danger" title="Delete"><i class="fa fa-trash"></i></button>';
                                break;
                            case 'Edit&View':
                                btnhtml += '<button class="btn btn-sm btn-info" title="Edit" data-toggle="modal" data-target="#ticketCrudModal" ><i class="fa fa-pen-alt"></i></button>';
                                btnhtml += '<button class="btn btn-sm btn-warning" title="View" data-toggle="modal" data-target="#ticketViewModal"><i class="fa fa-eye"></i></button>';
                                break;
                            case 'ALL':
                                btnhtml += '<button class="btn btn-sm btn-warning" title="View" ><i class="fa fa-eye"></i></button>';
                                btnhtml += '<button class="btn btn-sm btn-info" title="Edit" ><i class="fa fa-pen-alt"></i></button>';
                                btnhtml += '<button class="btn btn-sm btn-danger" title="Delete"><i class="fa fa-trash"></i></button>';
                                break;
                            case 'Manage':
                                btnhtml += '<button class="btn btn-sm btn-info" title="Manage" data-toggle="modal" data-target="#ticketCrudModal" ><i class="fa fa-tasks"></i></button>';
                                break;
                                case 'Edit&Manage':
                                btnhtml += '<button class="btn btn-sm btn-info" title="Edit" data-toggle="modal" data-target="#ticketCrudModal" ><i class="fa fa-pen-alt"></i></button>';
                                    btnhtml += '<button class="btn btn-sm btn-info" title="Manage" data-toggle="modal" data-target="#ticketCrudModal" style="margin-left:10px"><i class="fa fa-tasks"></i></button>';
                                    break;
                            default:
                                break;
                        }
                    });
                }
                //Creating Action button in the grid
                if (actionButtonIndex != null)
                    Gridarray[actionButtonIndex] = btnhtml;
                //Creating select option in the grid
                if (selectIndex != null && statusindex == null) {
                    Gridarray[selectIndex] = `<input type="checkbox" value="14">`;
                }
                if (selectIndex !== null && statusindex !== null) {
                    if (Gridarray[statusindex] === "Expired" || Gridarray[statusindex] === "Deactivated")
                        Gridarray[selectIndex] = `<input type="checkbox" disabled >`;
                    else {
                        Gridarray[selectIndex] = `<input type="checkbox" value="14">`;
                    }
                }
                //Status column class mapping
                if (statusColIndex != null) {
                    Gridarray[statusColIndex] = `<span class=${Gridarray[statusColIndex].toLowerCase()}>${Gridarray[statusColIndex]}</span>`;
                }
                if (statusColorColIndex !== null) {
                    Gridarray[statusColorColIndex] = `<span>${val[statusValue]}</span>`;
                    // added by sanjay  jan 04 22
                    if(StatusColorColumn[0].Value==='color'){
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

                GridarrayMain.splice(idx, 0, Gridarray);
                Gridarray = [];
            });
        }

        // * removing existing object of table
        objcommonjs.ClearTableGrid(this.props.Id);
        //
        let table = $(`#${this.props.Id}`).DataTable({
            
            data: GridarrayMain,
            //searching: this.props.IsSarching,
            "paging": this.props.DefaultPagination,
            "info": this.props.DefaultPagination,
            "order": [],
            "lengthChange": false,
            "searching": this.props.IsSarching,
            "ordering": true,
            //"info": true,
            "autoWidth": false,
            // "responsive": true,
            "columns": this.props.ColumnCollection
            // "columns": [{
            //     sTitle: "Id"
            // }]

        });
         
        //Enable hide column property
        dr.map((item, index) => {
            if (item.visible !== undefined && item.visible) {
                table.column(index).visible(false);
            }
        });



        if (this.props.GridData != null) {

            $(`#${this.props.Id} tbody`).unbind("click");
            // EDIT ACTION
            //$(`#${this.props.Id} tbody`).on('click', '.fa-edit', function () {
            $(`#${this.props.Id} tbody`).on('click', '.btn-info', function (iid) {
                let idIndex = gridBL.GetReferenceIdIndex(object.props.ColumnCollection, "Action");
                //let index = $(this).parent().parent()[0].rowIndex;
                let index = $(this).parent().parent()[0].rowIndex
               // default pagintion
               var currentrow = gridBL.GetCurrentRow(table,index);
                // var currentpage  = table.page()
                // var  page=0;
                // if(currentpage>0){
                // page=currentpage*10;

                // }
                // var tbldata = table.data();
                // var currentrow = tbldata[page+index-1]
                // end default pagination
                object.onGridEdit(currentrow[idIndex]);
                //var data = table.row(index - 1).data();
                //debugger
                //object.onGridEdit(data[idIndex]);
            });
            // DOWNLOAD ACTION
            //$(`#${this.props.Id} tbody`).on('click', '.fa-eye', function () {
            $(`#${this.props.Id} tbody`).on('click', '.btn-success', function () {
                let idIndex = gridBL.GetReferenceIdIndexForUrl(object.props.ColumnCollection, "Action");
                //let index = $(this).parent().parent()[0].rowIndex;
                let index = $(this).parent().parent()[0].rowIndex
                var data = table.row(index - 1).data();

                object.onGridDownload(data[idIndex]);
            });
            // VIEW ACTION
            //$(`#${this.props.Id} tbody`).on('click', '.fa-eye', function () {
            $(`#${this.props.Id} tbody`).on('click', '.btn-warning', function () {

                let idIndex = gridBL.GetReferenceIdIndex(object.props.ColumnCollection, "Action");
                //let index = $(this).parent().parent()[0].rowIndex;
                let index = $(this).parent().parent()[0].rowIndex
                var data = table.row(index - 1).data();
                object.onGridView(data[idIndex]);
            });
            //DELETE ACTION
            $(`#${this.props.Id} tbody`).on('click', '.btn-danger', function () {

                let idIndex = gridBL.GetReferenceIdIndex(object.props.ColumnCollection, "Action");
                //let index = $(this).parent().parent()[0].rowIndex;
                let index = $(this).parent().parent()[0].rowIndex
                var currentrow = gridBL.GetCurrentRow(table,index);
                // var currentpage  = table.page()
                // var  page=0;
                // if(currentpage>0){
                // page=currentpage*10;

                // }
                // var tbldata = table.data();
                // var currentrow = tbldata[page+index-1]
                // end default pagination
                object.onGridDelete(currentrow[idIndex]);
                // var data = table.row(index - 1).data();
                // debugger
                // object.onGridDelete(data[idIndex]);
            });

            //Block ACTION
            $(`#${this.props.Id} tbody`).on('click', '.BlockAndUnblock', function () {

                let idIndex = gridBL.GetReferenceIdIndex(object.props.ColumnCollection, "Action");
                //let index = $(this).parent().parent()[0].rowIndex;
                let index = $(this).parent().parent()[0].rowIndex
                var data = table.row(index - 1).data();
                object.onGridBlock(data[idIndex]);
            });

            $(`#${this.props.Id} tbody`).on('click', 'input[type=checkbox]', function () {
                let idIndex = gridBL.GetReferenceIdIndex(object.props.ColumnCollection, "Select");
                //let index = $(this).parent().parent()[0].rowIndex;
                let index = $(this).parent().parent().parent()[0].rowIndex
                var data = table.row(index - 1).data();
                let returnVale = data[idIndex];

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

                // let idIndex = gridBL.GetReferenceIdIndex(object.props.ColumnCollection);
                // let index = $(this).parent().parent()[0].rowIndex;
                // var data = table.row(index - 1).data();
                // object.onGridEdit(data[idIndex]);
                //alert(`You clicked on ' ${data[0]} + '\'s row and Account Code : ${data[1]}`);
            });

            $(`#${this.props.Id} tbody`).on('click', '.showHideButton', function () {
                let index = $(this).parent().parent()[0].rowIndex;
                var data = table.row(index - 1).data();
                let val = $(this).attr("value");
                var x = document.getElementById(val + "Protection" + data[0]);

                // RG 2021/07/29 check x is null or not
                if (x) {
                    if (x.type === "password") {
                        _this.viewInformation(val + " Showing", data[0], x);
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
        // Set swal return value every time an onkeyup event is fired in this textarea
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
                                    $(_this).children('i').addClass("fa-eye-slash");
                                    swal.close();
                                }
                            });
                        }
                    });
            }
            if (value === true || value === '') {
                swal("", "You need to write something!", "info");
                //swal.close();
            }
        });
    }

    // CreateGridButtons(data, type, row, meta) {
    //     var parameters = meta.settings.oInit.columnDefs[meta.col].parameters;
    //     var target_url = parameters.url;
    //     //return '<a onclick="'+this.myEditor+'" href="'+target_url+data+'">'+data+'</a>';
    //     //return '<a  href="#">'+data+'</a>';
    //     return `<button  class="edit"  >Edit</button>`;
    // };


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


/*
Data Grid Properties
   ActionButton :select,edit,delete,update
  scrollY":        "200px",
  "scrollCollapse": true,
  "paging":false  //This uses the paging option to disable paging for the table.
  searching: false, // showsearch
    ordering:  false // order of columns
     select: true // Enable row select
     Id:
     Columns:
     Data:
    Column.visible // to hide and show the columns
     "info":     false // show info about the pagination



     Events
     ------------------------
     table.on( 'draw', function () {
    alert( 'Table redrawn' );
    -- search event
    table.on( 'search.dt', function () {
    $('#filterInfo').html( 'Currently applied global search: '+table.search() );
    ----------------
    order event
    ------------------------------
    $('#example').on( 'order.dt', function () {
    // This will show: "Ordering on column 1 (asc)", for example
    var order = table.order();
    $('#orderInfo').html( 'Ordering on column '+order[0][0]+' ('+order[0][1]+')' );
} );
} );



/// https://datatables.net/reference/api/

*/
