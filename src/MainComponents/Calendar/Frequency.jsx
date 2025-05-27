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

class Frequency extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: "Home",
            fName: "",
            fValue:0,
            fUnit:"0",
            GridData: [],
            gridHeader: [
                { sTitle: 'Id', titleValue: 'Id', "orderable": true },
                { sTitle: 'Name', titleValue: 'Name' },
                { sTitle: 'Frequency Value', titleValue: 'Fvalue', "orderable": false },
                { sTitle: 'Frequency Unit', titleValue: 'Funit', "orderable": false },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],
            fId: 0,
            loading:false
        }
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    componentDidMount() {
        this.getFrequency();
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
    render() {
        return (
            <>
                {this.state.PageMode === 'Home'&&
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
                                                                Text="Add Frequency" />
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
                                        {this.state.PageMode === 'Add' ? "Add Frequency" : "Edit Frequency"}
                                    </h5>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-12">
                                            <label>Frequency Name</label>
                                            <input
                                                id="fName"
                                                required
                                                placeholder="Enter Frequency Name"
                                                type="text"
                                                className="form-control"
                                                value={this.state.fName}
                                                onChange={(e) => this.setState({fName: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-12 mt-3">
                                            <label>Frequency Value</label>
                                            <input
                                                id="fValue"
                                                required
                                                placeholder="Enter Frequency Value"
                                                type="number"
                                                className="form-control"
                                                value={this.state.fValue}
                                                onChange={(e) => this.setState({fValue: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="row mt-3">
                                        <div className="col-12">
                                            <label>Frequency Unit</label>
                                            <select
                                                id="funit"
                                                required
                                                className="form-control"
                                                value={this.state.fUnit}
                                                onChange={(e) => this.setState({fUnit: e.target.value})}
                                            >
                                                <option value="0">Select frequency unit</option>
                                                <option value="Minutes">Minutes</option>
                                                <option value="Hours">Hours</option>
                                                <option value="Days">Days</option>
                                                <option value="Weeks">Weeks</option>
                                                <option value="Months">Months</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer justify-content-start">
                                    <Button Id="btnSave" Text="Save" Action={this.handleSave}
                                            ClassName="btn btn-primary"/>
                                    <Button Id="btnCancel" Text="Cancel" Action={this.handleCancel}
                                            ClassName="btn btn-secondary"/>
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

export default Frequency;