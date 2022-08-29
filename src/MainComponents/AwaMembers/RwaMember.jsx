import React, { Component } from 'react';
import swal from 'sweetalert';
import { ToastContainer, toast } from 'react-toastify';

import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from './DataProvider';

import * as appCommon from '../../Common/AppCommon.js';
import { CreateValidator, ValidateControls } from './Validation.js';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import UrlProvider from "../../Common/ApiUrlProvider.js";
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';
import InputDate from '../NoticeBoard/InputDate';
import MultiSelectInline from '../../ReactComponents/MultiSelectInline/MultiSelectInline';
import { connect } from 'react-redux';
import departmentAction from '../../redux/department/action';
import { promiseWrapper } from '../../utility/common';
import { bindActionCreators } from 'redux';

const $ = window.$;

class RwaMember extends Component {
    constructor(props) {
        super(props);
        this.state = {
            GridData: [],
            gridHeader: [
                { sTitle: 'Id', titleValue: 'rwaMemberDetailsId', "orderable": false },
                { sTitle: 'FlatId', titleValue: 'flatId', bVisible: false },
                { sTitle: 'Flat', titleValue: 'flatDetailNumber', },
                { sTitle: 'PropertyMemberId', titleValue: 'propertyMemberId', bVisible: false },
                { sTitle: 'Name', titleValue: 'name', },
                { sTitle: 'Contact', titleValue: 'contactNumber', },
                { sTitle: 'Start Date', titleValue: 'startDate', },
                { sTitle: 'End Date', titleValue: 'endDate', },
                { sTitle: 'Roles', titleValue: 'mappedRoles' },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],
            isActiveInactiveClass: 1,
            AwaMemberId: 0,
            FlatList: [{ Id: 0, Name: "Select Flat" }],
            FlatMemberList: [{ Id: 0, Name: "Select Member" }],
            FlatId: "0",
            FlatMemberId: "0",
            startDate: '',
            endDate: '',
            RolesList: [], SetSelectedOptionsRoles: [], RoleIds: '', PageMode: 'Home'
        }

        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    checkActiveInactiveData = (val) => {
        let gridHeader = [
            { sTitle: 'Id', titleValue: 'rwaMemberDetailsId', "orderable": false },
            { sTitle: 'FlatId', titleValue: 'flatId', bVisible: false },
            { sTitle: 'Flat', titleValue: 'flatDetailNumber', },
            { sTitle: 'PropertyMemberId', titleValue: 'propertyMemberId', bVisible: false },
            { sTitle: 'Name', titleValue: 'name', },
            { sTitle: 'Contact', titleValue: 'contactNumber', },
            { sTitle: 'Start Date', titleValue: 'startDate', },
            { sTitle: 'End Date', titleValue: 'endDate', },
            { sTitle: 'Roles', titleValue: 'mappedRoles' },
            { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
        ]
        this.setState({ isActiveInactiveClass: val }, () => {
            if (this.state.isActiveInactiveClass === 0) {
                gridHeader = [];
                gridHeader.push({ sTitle: 'Id', titleValue: 'rwaMemberDetailsId', "orderable": false });
                gridHeader.push({ sTitle: 'FlatId', titleValue: 'flatId', bVisible: false },);
                gridHeader.push({ sTitle: 'Flat', titleValue: 'flatDetailNumber', });
                gridHeader.push({ sTitle: 'PropertyMemberId', titleValue: 'propertyMemberId', bVisible: false });
                gridHeader.push({ sTitle: 'Name', titleValue: 'name', });
                gridHeader.push({ sTitle: 'Contact', titleValue: 'contactNumber', });
                gridHeader.push({ sTitle: 'Start Date', titleValue: 'startDate', });
                gridHeader.push({ sTitle: 'End Date', titleValue: 'endDate', });
                gridHeader.push({ sTitle: 'Roles', titleValue: 'mappedRoles' });
                gridHeader.push({ sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false, bVisible: false });
                this.setState({
                    gridHeader: gridHeader
                }, () => this.getRwaMembers())
            }
            else {
                this.setState({
                    gridHeader: gridHeader
                }, () => this.getRwaMembers())
            }
        })
    }

    getModel = (type) => {
        var model = [];
        switch (type) {
            case 'R':
                model.push({
                    "PropertyId": parseInt(this.props.PropertyId),
                    "CmdType": type,
                    "IsActive": parseInt(this.state.isActiveInactiveClass)
                });
                break;
            case 'D':
                model.push({
                    "RwaMemberDetailsId": this.state.AwaMemberId,
                    "CmdType": type,
                });
                break;
            case 'C':
                model.push({
                    "propertyId": parseInt(this.props.PropertyId),
                    "cmdType": type,
                    "rwaMemberDetailsId": 0,
                    "propertyMemberId": parseInt(this.state.FlatMemberId),
                    "rolesId": this.state.RoleIds,
                    "startDate": this.state.startDate,
                    "endDate": this.state.endDate
                });
                break;
            case 'U':
                model.push({
                    "propertyId": parseInt(this.props.PropertyId),
                    "cmdType": type,
                    "rwaMemberDetailsId": parseInt(this.state.AwaMemberId),
                    "propertyMemberId": parseInt(this.state.FlatMemberId),
                    "rolesId": this.state.RoleIds,
                    "startDate": this.state.startDate,
                    "endDate": this.state.endDate
                });
                break;
            default:
        };
        return model;
    }

    manageRwaMembers = (model, type) => {
        this.ApiProviderr.manageRwaMembers(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'C':
                                if (rData === 1) {
                                    appCommon.showtextalert("Rwa Member Saved Successfully!", "", "success");
                                    this.handleCancel();
                                }
                                else if (rData === 2) {
                                    appCommon.showtextalert("Rwa Member Already Existed !", "", "error");
                                }
                                break;
                            case 'U':
                                if (rData > 0) {
                                    appCommon.showtextalert("Rwa Member Updated Successfully!", "", "success");
                                    this.handleCancel();
                                }
                                break;
                            case 'D':
                                if (rData === 1) {
                                    appCommon.showtextalert("Rwa Member Deleted Successfully!", "", "success");
                                }
                                else {
                                    appCommon.showtextalert("Someting went wrong !", "", "error");
                                }
                                this.getRwaMembers();
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
    getRwaMembers() {
        var type = 'R';
        var model = this.getModel(type);
        this.manageRwaMembers(model, type);
    }

    componentDidMount() {
        this.getRwaMembers();
        this.getRolesDropDwon();
        if (this.props.PropertyId) {
            this.getFlatsDropDwon(parseInt(this.props.PropertyId));
            this.setState({ FlatMemberList: [] })
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.getRwaMembers();
            this.getFlatsDropDwon(parseInt(this.props.PropertyId));
            this.setState({ FlatMemberList: [] })
        }
    }

    onPagechange = (page) => {

    }

    onGridDelete = (Id) => {
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
                        this.setState({ AwaMemberId: Id }, () => {
                            var type = 'D'
                            var model = this.getModel(type);
                            this.manageRwaMembers(model, type);
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

    Addnew = () => {
        this.setState({ PageMode: 'Add' }, () => {
            CreateValidator();
        });
    }
    ongridedit(Id) {
        this.setState({ PageMode: 'Edit' }, () => {
            CreateValidator();
        });
        var rowData = this.findItem(Id);
        if (rowData) {
            this.setState({
                AwaMemberId: rowData.rwaMemberDetailsId,
                FlatMemberId: rowData.propertyMemberId,
                startDate: rowData.startDate,
                endDate: rowData.endDate,
                FlatId: rowData.flatId
            }, () => {
                if (rowData.flatId !== 0) {
                    this.getFlatMemberDropDwon(parseInt(this.props.PropertyId), parseInt(rowData.flatId));
                }
                else {
                    this.setState({ FlatMemberList: [] })
                }
                let fData = [];
                let mappedRole = rowData.mappedRoles.split(',');
                mappedRole.forEach(element => {
                    let val = element.trim();
                    let data = this.state.RolesList.filter((item) => {
                        return item.Name === element.trim()
                    });
                    if (data !== null && data !== undefined) {
                        fData.push(data[0]);
                    }
                });
                this.setState({ SetSelectedOptionsRoles: fData });
            });
        }
    }

    findItem(id) {
        return this.state.GridData.find((item) => {
            if (item.rwaMemberDetailsId == id) {
                return item;
            }
        });
    }

    getRolesDropDwon() {
        this.ApiProviderr.getDropDwonData('RWARoles', 0, 0).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let Data = [];
                        rData.forEach(element => {
                            Data.push({ Id: element.id, Name: element.text, value: element.text, label: element.text, color: '#0052CC' });
                        });
                        this.setState({ RolesList: Data });
                    });
                }
            });

    }
    getFlatsDropDwon(PropertyID) {
        this.ApiProviderr.getDropDwonData('Flats', PropertyID, 0).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let Data = [{ Id: 0, Name: "Select Flat" }];
                        rData.forEach(element => {
                            Data.push({ Id: element.id, Name: element.text });
                        });
                        this.setState({ FlatList: Data });
                    });
                }
            });

    }
    getFlatMemberDropDwon(PropertyID, PropertyDetailsId) {
        let Data = [{ Id: 0, Name: "Select Member" }];
        this.ApiProviderr.getDropDwonData('PM', PropertyID, PropertyDetailsId).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        rData.forEach(element => {
                            Data.push({ Id: element.id, Name: element.text });
                        });
                        this.setState({ FlatMemberList: Data }, () => {
                            if (this.state.FlatMemberList.length == 2) {
                                this.setState({ FlatMemberId: this.state.FlatMemberList[1].Id.toString() })
                            }
                        });
                    });
                }
            });
    }

    handleSave = () => {
        if (ValidateControls()) {
            if (this.state.SetSelectedOptionsRoles.length > 0) {
                let data = this.state.SetSelectedOptionsRoles.map((item) => { return item.Id })
                this.setState({ RoleIds: data.join(',') }, () => {
                    var type = 'C'
                    var model = this.getModel(type);
                    if (this.state.PageMode === "Edit") {
                        type = "U";
                        model = this.getModel(type);
                    }
                    this.manageRwaMembers(model, type);
                })
            }
            else {
                appCommon.showtextalert("Please Select Roles !", "", "error");
            }
        }
    }
    handleCancel = () => {
        this.checkActiveInactiveData(1);
        this.setState({
            AwaMemberId: 0,
            FlatId: "0",
            FlatMemberId: "0",
            startDate: '',
            endDate: '',
            SetSelectedOptionsRoles: [],
            RoleIds: '',
            PageMode: 'Home'
        });
    };

    onSelected(name, value) {
        switch (name) {
            case "Flat":
                this.setState({ FlatId: value }, () => {
                    if (value !== '0') {
                        this.getFlatMemberDropDwon(parseInt(this.props.PropertyId), parseInt(value));
                    }
                    else {
                        this.setState({ FlatMemberList: [] })
                    }
                });
                break;
            case "FlatMember":
                this.setState({ FlatMemberId: value })
                break;
            default:
        }
    }

    updatetextmodel = (ctrl, val) => {
        if (ctrl == 'StartDate') {
            this.setState({ startDate: val });
        }
        else if (ctrl == 'EndDate') {
            this.setState({ endDate: val });
        }
    }
    onDropDownMultiSelectChangeRole(value, event) {
        this.setState({ SetSelectedOptionsRoles: value });
    }

    render() {
        return (
            <div>
                {this.state.PageMode == 'Home' &&
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header d-flex p-0">
                                    <ul className="nav tableFilterContainer">
                                        <li className="nav-item">
                                            <div className="btn-group">
                                                <Button id="btnActive"
                                                    Action={this.checkActiveInactiveData.bind(this, 1)}
                                                    ClassName={this.state.isActiveInactiveClass === 1 ? 'btn btn-success' : 'btn btn-default'}
                                                    Text="Active" />

                                                <Button id="btnInactive"
                                                    Action={this.checkActiveInactiveData.bind(this, 0)}
                                                    ClassName={this.state.isActiveInactiveClass === 0 ? 'btn btn-success' : 'btn btn-default'}
                                                    Text="Inactive" />
                                            </div>
                                        </li>
                                    </ul>
                                    {this.props.PropertyId ?
                                        <ul className="nav ml-auto tableFilterContainer">
                                            <li className="nav-item">
                                                <div className="input-group input-group-sm">
                                                    <div className="input-group-prepend">
                                                        <Button id="btnNewComplain"
                                                            Action={this.Addnew.bind(this)}
                                                            ClassName="btn btn-success btn-sm"
                                                            Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                                            Text=" Create New" />
                                                    </div>
                                                </div>
                                            </li>
                                        </ul> : null
                                    }
                                </div>
                                <div className="card-body pt-2">
                                    <DataGrid
                                        Id="grdRwaMembers"
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
                                            <div className="form-group">
                                                <label htmlFor="ddlFlat">Flat</label>
                                                <SelectBox
                                                    ID="ddlFlat"
                                                    ClassName="form-control "
                                                    onSelected={this.onSelected.bind(this, "Flat")}
                                                    Options={this.state.FlatList}
                                                    Value={this.state.FlatId}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label htmlFor="ddlFlatMember">Member</label>
                                                <SelectBox
                                                    ID="ddlFlatMember"
                                                    onSelected={this.onSelected.bind(this, "FlatMember")}
                                                    Options={this.state.FlatMemberList}
                                                    ClassName="form-control "
                                                    Value={this.state.FlatMemberId}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label htmlFor="txtStartDate">Start Date</label>
                                                <InputDate
                                                    Id='txtStartDate'
                                                    DateFormate="dd/mm/yyyy"
                                                    handleOnchage={this.updatetextmodel.bind(this, "StartDate")}
                                                    value={this.state.startDate}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label htmlFor="txtEndDate">End Date</label>
                                                <InputDate
                                                    Id='txtEndDate'
                                                    DateFormate="dd/mm/yyyy"
                                                    handleOnchage={this.updatetextmodel.bind(this, "EndDate")}
                                                    value={this.state.endDate}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label htmlFor="ddlRoles">Role</label>
                                                <MultiSelectInline
                                                    ID="ddlRoles"
                                                    isMulti={true}
                                                    value={this.state.SetSelectedOptionsRoles}
                                                    onChange={this.onDropDownMultiSelectChangeRole.bind(this)}
                                                    options={this.state.RolesList}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
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
        );
    }
}

function mapStoreToprops(state, props) {
    return {
        PropertyId: state.Commonreducer.puidn,
    }
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentAction, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(RwaMember);