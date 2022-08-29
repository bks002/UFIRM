import React, { Component } from 'react';
import { SketchPicker } from 'react-color';
// import { GetColorName } from 'hex-color-to-color-name';

import swal from 'sweetalert';
import { ToastContainer, toast } from 'react-toastify';

import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from './DataProvider';
import { CreateValidator, ValidateControls } from './Validation.js';
import * as appCommon from '../../Common/AppCommon.js';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import UrlProvider from "../../Common/ApiUrlProvider.js";
import { connect } from 'react-redux';
import departmentAction from '../../redux/department/action';
import { promiseWrapper } from '../../utility/common';
import { bindActionCreators } from 'redux';

const $ = window.$;

class Category extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowColorPicker: false,
            PageMode: "Home",
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
            CatId: 0
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
                                    appCommon.showtextalert("Someting went wrong !", "", "error");
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
                CatId: rowData.catId,
                catName: rowData.name,
                catDesc: rowData.description,
                catColor: rowData.color,
            })
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
        this.setState({ PageMode: 'Add' }, () => {
            CreateValidator();
        });
    }

    handleSave = () => {
        if (ValidateControls()) {
            if (this.state.PageMode === "Add") {
                let exist = this.state.GridData.some((x) => x.name.toLowerCase() === this.state.catName.toLowerCase());
                if (!exist) {
                    var type = 'C'
                    var model = this.getModel(type);
                    this.manageCategory(model, type);
                }
                else {
                    appCommon.showtextalert(`Caterogy name ${this.state.catName} already existed`, "", "error");
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
            catName: "",
            catDesc: "",
            catColor: "#FFA500",
        }, () => this.getCategory());

    };
    render() {
        return (
            <div>
                <div>
                    {this.state.PageMode == 'Home' &&
                        <div className="row">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-header d-flex p-0">
                                        <ul className="nav ml-auto tableFilterContainer">
                                            <li className="nav-item">
                                                <div className="input-group input-group-sm">
                                                    <div className="input-group-prepend">
                                                        <Button id="btnaddCalendarCategory"
                                                            Action={this.Addnew.bind(this)}
                                                            ClassName="btn btn-success btn-sm"
                                                            Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                                            Text=" Create New" />
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="card-body pt-2">
                                        <DataGrid
                                            Id="grdCalendarCategory"
                                            IsPagination={false}
                                            ColumnCollection={this.state.gridHeader}
                                            Onpageindexchanged={this.onPagechange.bind(this)}
                                            onEditMethod={this.ongridedit.bind(this)}
                                            onGridDeleteMethod={this.onGridDelete.bind(this)}
                                            DefaultPagination={false}
                                            IsSarching="true"
                                            GridData={this.state.GridData}
                                            pageSize="2000" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                    {(this.state.PageMode == 'Add' || this.state.PageMode == 'Edit') &&
                        <div>
                            <div>
                                <div className="modal-content">
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-sm-4">
                                                <label>Category Name</label>
                                                <input
                                                    id="txtCatColor"
                                                    placeholder="Enter Category Name"
                                                    type="text"
                                                    className="form-control"
                                                    value={this.state.catName}
                                                    onChange={(e) => { this.setState({ catName: e.target.value }) }}
                                                />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-4">
                                                <label>Description</label>
                                                <textarea
                                                    placeholder="Enter Description"
                                                    className="form-control"
                                                    value={this.state.catDesc}
                                                    onChange={(e) => { this.setState({ catDesc: e.target.value }) }}
                                                >
                                                </textarea>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-2">
                                                <label>Category Color</label>
                                                <div className="input-group">
                                                    <input
                                                        title="Select Color"
                                                        style={{ background: this.state.catColor, cursor: "pointer" }}
                                                        type="text"
                                                        className="form-control"
                                                        readOnly
                                                    />
                                                    <div className="input-group-append">
                                                        <button
                                                            className="btn btn-info"
                                                            onClick={() => { this.setState({ isShowColorPicker: !this.state.isShowColorPicker }) }}
                                                            title="Open and Close Color Picker"
                                                        >
                                                            Choose Color
                                                        </button>
                                                    </div>
                                                </div>
                                                {this.state.isShowColorPicker &&
                                                    <SketchPicker
                                                        color={this.state.catColor}
                                                        onChangeComplete={this.handleChangeComplete}
                                                    />}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer" style={{ justifyContent: "flex-start" }}>
                                        <Button
                                            Id="btnSave"
                                            Text="Save"
                                            Action={this.handleSave}
                                            ClassName="btn btn-primary" />
                                        <Button
                                            Id="btnCancel"
                                            Text="Cancel"
                                            Action={this.handleCancel}
                                            ClassName="btn btn-secondary" />
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
                            <ToastContainer />
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default Category;