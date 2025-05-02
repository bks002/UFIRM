import React, { Component } from 'react';
import swal from 'sweetalert';
import { ToastContainer, toast } from 'react-toastify';

import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from '../Calendar/DataProvider';
import { CreateValidator, ValidateControls } from '../Calendar/Validation';
import * as appCommon from '../../Common/AppCommon.js';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import { getCategories, getCategoryById} from "../../Services/InventoryService.js";

const $ = window.$;

class Category extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: "Home",
            CName: "",
            CDescription:"",
            //CUnit:"0",
            GridData: [],
            gridHeader: [
                { sTitle: 'Id', titleValue: 'Id', "orderable": true },
                { sTitle: 'Name', titleValue: 'Name' },
                { sTitle: 'Description', titleValue: 'CDescription', "orderable": false },
                //{ sTitle: 'Frequency Unit', titleValue: 'Funit', "orderable": false },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&View&Delete", Index: '0', "orderable": false },
            ],
            cId: 0,
            loading: false
        }
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    componentDidMount() {
        this.getCategory();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.PropertyId !== this.props.PropertyId) { }
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
                    "name": this.state.CName,
                    "CDescription": this.state.CDescription,
                    //"Funit": this.state.fUnit,
                });
                break;
            case 'U':
                model.push({
                    "Id": parseInt(this.state.fId),
                    "cmdType": type,
                    "name": this.state.CName,
                    "CDescription": this.state.CDescription,
                    //"Funit": this.state.fUnit,
                });
                break;
            case 'R':
                model.push({
                    "Id": parseInt(this.state.fId),
                    "cmdType": type,
                    "name": this.state.CName,
                    "CDescription": this.state.CDescription,
                    //"Funit": this.state.fUnit,
                });
                break;
            default:
        }
        return model;
    }

    manageCategory = (model, type) => {
        this.ApiProviderr.manageCategory(model, type).then(
            resp => {
                if (resp.ok && resp.status === 200) {
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
                            case 'R':
                                if (rData > 0) {
                                    appCommon.showtextalert("Category Updated Successfully!", "", "success");
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
                                this.getCategory();
                                break;
                            default:
                        }
                    });
                }
            });
    }

    getCategory = async () => {
        try {
            this.setState({ loading: true });
            const propertyId = 4;
            const data = await fetch(`https://api.urest.in:8096/api/inventory/categories?propertyId=${propertyId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' // Ensures correct response format
                }
            });
            console.log(data);
            this.setState({ GridData: data, loading: false });
        } catch (error) {
            console.error('Error fetching Categories:', error);
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
                      var type = 'D';
                      var model = this.getModel(type, Id);
                      this.manageCategory(model, type); // fixed here too
                    });
                    break;
                  case "cancel":
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
                CId: rowData.Id,
                CName: rowData.Name,
                CDescription: rowData.CDescription,
                //fUnit: rowData.Funit,
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
            {/*if (this.state.CUnit === "0") {
                appCommon.showtextalert("Please select a frequency unit", "", "error");
                return;
            }*/}
            if (this.state.PageMode === "Add") {
                let exist = this.state.GridData.some((x) => x.Name.toLowerCase() === this.state.CName.toLowerCase());
                if (!exist) {
                    var type = 'C'
                    var model = this.getModel(type);
                    this.manageCategory(model, type);
                }
                else {
                    appCommon.showtextalert(`Category name ${this.state.CName} already existed`, "", "error");
                }

            }

            if (this.state.PageMode === "Edit") {
                if (this.state.PageMode === "Edit") {
                    let type = "U";
                    let model = this.getModel(type);
                    this.manageCategory(model, type);
                }
            }
        }
    }
    handleCancel = () => {
        this.setState({
            PageMode: 'Home',
            "CName": "",
            "CDescription": "",
            //"fUnit": "0",
        }, () => this.getCategory());

    };
    render() {
        return (
            <>
                {this.state.PageMode === 'Home' &&
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header d-flex p-0">
                                    <ul className="nav ml-auto tableFilterContainer">
                                        <li className="nav-item">
                                            <div className="input-group input-group-sm">
                                                <div className="input-group-prepend">
                                                    <Button id="btnaddCalendarFrequency"
                                                        Action={this.Addnew.bind(this)}
                                                        ClassName="btn btn-success btn-sm"
                                                        Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                                        Text="Add Category" />
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
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
                }

                {(this.state.PageMode === 'Add' || this.state.PageMode === 'Edit') && (
                    <div className="modal d-flex align-items-center justify-content-center show" tabIndex="-1" role="dialog">
                        <div className="modal-dialog modal-lg" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalToggleLabel">
                                        {this.state.PageMode === 'Add' ? "Add Category" : "Edit Category"}
                                    </h5>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-12">
                                            <label>Category Name</label>
                                            <input
                                                id="CName"
                                                required
                                                placeholder="Enter Category Name"
                                                type="text"
                                                className="form-control"
                                                value={this.state.CName}
                                                onChange={(e) => this.setState({ CName: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-12 mt-3">
                                            <label>Description</label>
                                            <input
                                                id="CDescription"
                                                required
                                                placeholder="Enter Description"
                                                type="text"
                                                className="form-control"
                                                value={this.state.CDescription}
                                                onChange={(e) => this.setState({ CDescription: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    {/*<div className="row mt-3">
                                        <div className="col-12">
                                            <label>Frequency Unit</label>
                                            <select
                                                id="funit"
                                                required
                                                className="form-control"
                                                value={this.state.fUnit}
                                                onChange={(e) => this.setState({ fUnit: e.target.value })}
                                            >
                                                <option value="0">Select frequency unit</option>
                                                <option value="Minutes">Minutes</option>
                                                <option value="Hours">Hours</option>
                                                <option value="Days">Days</option>
                                                <option value="Weeks">Weeks</option>
                                                <option value="Months">Months</option>
                                            </select>
                                        </div>
                                    </div>*/}
                                </div>
                                <div className="modal-footer justify-content-start">
                                    <Button Id="btnSave" Text="Save" Action={this.handleSave}
                                        ClassName="btn btn-primary" />
                                    <Button Id="btnCancel" Text="Cancel" Action={this.handleCancel}
                                        ClassName="btn btn-secondary" />
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
                        </div>
                    </div>
                )}

            </>
        );
    }
}

export default Category;