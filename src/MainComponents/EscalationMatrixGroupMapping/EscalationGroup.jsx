import React, { Component } from 'react';

import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from './DataProvider';
import { ToastContainer, toast } from 'react-toastify';
import * as appCommon from '../../Common/AppCommon.js';
import swal from 'sweetalert';
import { CreateValidator, ValidateControls } from './Validation';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import UrlProvider from "../../Common/ApiUrlProvider.js";
import { Typeahead } from 'react-bootstrap-typeahead';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';
import MultiSelectInline from '../../ReactComponents/MultiSelectInline/MultiSelectInline.jsx';
import { connect } from 'react-redux';
import departmentAction from '../../redux/department/action';
import { promiseWrapper } from '../../utility/common';
import { bindActionCreators } from 'redux';

const $ = window.$;
class EscalationGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            //grid
            gridHeader: [
                { sTitle: 'Id', titleValue: 'escalationMatrixGroupId', "orderable": false, },//"visible": true 
                { sTitle: 'Group Name', titleValue: 'groupName', },
                { sTitle: 'Description', titleValue: 'description', },
                { sTitle: 'Users', titleValue: 'userName', },
                { sTitle: 'Userids', titleValue: 'userids', bVisible: false },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],
            gridData: [],
            grdTotalRows: 0,
            grdTotalPages: 0,

            //typeahead
            FilterGroupName: [{ "Value": "Group Name", "Name": "Group Name" }],
            escalationMatrixGroupData: [], searchValue: null, filterName: "groupName",
            EscalationMatrixGroupId: 0, GroupName: '', Description: '', UserIds: '',
            setSelectedOptionsPropertyUsers: [],
            userList: [], PageNumber: 1


        };
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }
    loadEscalationMatrixGroupMapped = () => {
        this.loadEmergencyTypeAhead(this.props.PropertyId, "NULL");
        this.getEscalationMatrixGroupMapped(this.props.PropertyId, "NULL");
        this.getUsersData(this.props.PropertyId)

    }

    componentDidMount() {
        this.loadEscalationMatrixGroupMapped();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.loadEscalationMatrixGroupMapped();
        }
    }

    loadEmergencyTypeAhead = (id, searchtext) => {
        //
        var type = 'T';
        var model = this.getModel(type, id, searchtext);
        this.manageEscalationMatrixGroupMapped(model, type);
    }
    onSelected(name, value) {
        switch (name) {
            case "FilterGroupName":
                this.setState({ FilterGroupName: value });
                break;
            default:
        }
    }

    ClearTyeahead = (type, event) => {
        if (type == 'C') {
            var option = this.theEmergency.props.options;
            if (!option.includes(event.target.value)) {
            }
        }
    }

    onUserSearch = (SearchText) => {
        if (SearchText.length > 0) {
            this.setState({ searchValue: SearchText[0].groupName }, () => {
                this.loadEmergencyTypeAhead(this.props.PropertyId, SearchText[0].groupName);
                this.getEscalationMatrixGroupMapped(this.props.PropertyId, SearchText[0].groupName);
            });
        }
        else {
            this.setState({ searchValue: null }, () => {
                this.loadEmergencyTypeAhead(this.props.PropertyId, "Null");
                this.getEscalationMatrixGroupMapped(this.props.PropertyId, "NULL");
            });
        }
    }
    onEmergencyList = (arg) => {
        let searchVal;
        if (arg == '' || arg == null) {
            this.setState({ searchValue: null }, () => {
                this.getEscalationMatrixGroupMapped(this.props.PropertyId, "NULL");
                this.loadEmergencyTypeAhead(this.props.PropertyId, "Null");
            });
        }
        else {
            this.setState({ searchValue: arg.trim() }, () => {
                this.getEscalationMatrixGroupMapped(this.props.PropertyId, arg.trim());
                this.loadEmergencyTypeAhead(this.props.PropertyId, arg.trim());
            });
        }

    }

    getEscalationMatrixGroupMapped(id, value) {
        var type = 'R';
        var model = this.getModel(type, id, value);
        this.manageEscalationMatrixGroupMapped(model, type);
    }

    manageEscalationMatrixGroupMapped = (model, type) => {
        this.ApiProviderr.manageEscalationMatrixGroupMapped(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'C':
                                if (rData == 1) {
                                    appCommon.showtextalert("Escaltion Group Saved Successfully!", "", "success");
                                    this.handleCancel();
                                }
                                else if (rData == 0)
                                    appCommon.showtextalert("Escaltion Group Already Existed !", "", "error");

                                break;
                            case 'U':
                                if (rData == 1) {
                                    appCommon.showtextalert("Escaltion Group Updated Successfully!", "", "success");
                                    this.handleCancel();
                                }
                                else if (rData == 0)
                                    appCommon.showtextalert("Escaltion Group Already Existed !", "", "error");

                                break;
                            case 'D':
                                if (rData == 1)
                                    appCommon.showtextalert("Escaltion Group Deleted Successfully!", "", "success");
                                else
                                    appCommon.showtextalert("Something Went wrong Try Again !", "", "error");

                                this.handleCancel();
                                break;
                            case 'R':
                                this.setState({ grdTotalPages: rData.totalPages });
                                this.setState({ grdTotalRows: rData.totalRows });
                                this.setState({ gridData: rData.escalationMatrixGroupMember });
                                break;
                            case 'T':
                                this.setState({ escalationMatrixGroupData: rData.escalationMatrixGroupMember });
                                break;
                            default:
                        }
                    });
                }
            });
    }


    getModel = (type, id, value) => {
        var model = [];
        switch (type) {
            case 'R':
                model.push({
                    "SearchValue": value == null ? "NULL" : value,
                    "PropertyId": parseInt(id),
                    "PageSize": 10,
                    "PageNumber": this.state.PageNumber
                });
                break;
            case 'C':
                model.push({
                    "StatementType": type,
                    "GroupName": this.state.GroupName,
                    "Description": this.state.Description,
                    "UserIds": this.state.UserIds,
                    "PropertyId": parseInt(this.props.PropertyId),
                    "EscalationMatrixGroupId": null,
                });
                break;
            case 'U':
                model.push({
                    "StatementType": type,
                    "GroupName": this.state.GroupName,
                    "Description": this.state.Description,
                    "UserIds": this.state.UserIds,
                    "PropertyId": parseInt(this.props.PropertyId),
                    "EscalationMatrixGroupId": this.state.EscalationMatrixGroupId
                });
                break;
            case 'D':
                model.push({
                    "EscalationMatrixGroupId": this.state.EscalationMatrixGroupId
                });
                break;
            case 'T':
                model.push({
                    "SearchValue": value == null ? "NULL" : value,
                    "PropertyId": parseInt(id),
                    "PageSize": 10,
                    "PageNumber": this.state.PageNumber
                });
                break;
            default:
        };
        return model;
    }

    findItem(id) {
        return this.state.gridData.find((item) => {
            if (item.escalationMatrixGroupId == id) {
                return item;
            }
        });
    }

    async addNew() {
        this.setState({ PageMode: 'Add' }, () => {
            CreateValidator();
        });
    }

    onPagechange = (page) => {
        //

        this.setState({ PageNumber: page }, () => {
            this.loadEscalationMatrixGroupMapped();
            // console.log(this.state.PageNumber);
        });
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
                        this.setState({ EscalationMatrixGroupId: Id }, () => {
                            var model = this.getModel('D');
                            this.manageEscalationMatrixGroupMapped(model, 'D');
                        })
                        break;
                    case "cancel":
                        break;
                    default:
                        break;
                }
            })
        );
    }

    async ongridedit(Id) {
        this.setState({ PageMode: 'Edit' }, () => {
            CreateValidator();
        });
        var rowData = this.findItem(Id);
        this.setState({
            GroupName: rowData.groupName, Description: rowData.description,
            EscalationMatrixGroupId: rowData.escalationMatrixGroupId
        })

        let existedUsers = rowData.userids.split(',').map((x) => parseInt(x));
        let existedUsersList = this.state.userList;

        var result = existedUsersList.filter(function (e) {
            return existedUsers.includes(e.Id)
        });

        this.setState({ setSelectedOptionsPropertyUsers: result });
    }

    handleSave = () => {
        if (ValidateControls()) {
            if (this.state.setSelectedOptionsPropertyUsers.length > 0) {
                let type = '';
                if (this.state.PageMode == "Add") {
                    type = 'C';
                }
                if (this.state.PageMode == "Edit") {
                    type = 'U';
                }

                let data = this.state.setSelectedOptionsPropertyUsers.
                    map((item) => { return item.Id })

                this.setState({ UserIds: data.join(',') }, () => {
                    var model = this.getModel(type);
                    this.manageEscalationMatrixGroupMapped(model, type);
                })
            }
            else {
                appCommon.showtextalert("Please Select Users !", "", "error");
            }

        }
    }

    handleCancel = () => {
        this.setState({ PageMode: 'Home', GroupName: '', Description: '', UserIds: '', EscalationMatrixGroupId: 0 });
        this.loadEscalationMatrixGroupMapped();
        this.setState({ setSelectedOptionsPropertyUsers: [] })
    };

    updateData = (name, value) => {
        switch (name) {
            case "GroupName":
                this.setState({ GroupName: value });
                break;
            case "Description":
                this.setState({ Description: value });
                break;
            default:
        }
    }

    getUsersData(PropertyID) {
        // 
        this.ApiProviderr.getUsers(PropertyID).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let propertyUserData = [];
                        rData.forEach(element => {
                            propertyUserData.push({ Id: element.userId, Name: element.username, value: element.username, label: element.username, color: '#0052CC' });
                        });
                        this.setState({ userList: propertyUserData });
                    });
                }
            });
    }
    onDropDownMultiSelectChangePropertyUsers(value, event) {
        this.setState({ setSelectedOptionsPropertyUsers: value });
    }


    render() {
        return (
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
                                                    <SelectBox
                                                        ID="ddlFilterGroupName"
                                                        Value={this.state.FilterGroupName}
                                                        onSelected={this.onSelected.bind(this, "FilterGroupName")}
                                                        Options={this.state.FilterGroupName}
                                                        ClassName="form-control form-control-sm" />
                                                </div>
                                            </div>
                                        </li>
                                        <li className="nav-item">
                                            <div className="input-group input-group-sm">
                                                <div className="input-group-prepend">
                                                </div>
                                                <Typeahead
                                                    id="typeGridFilter"
                                                    ref={(typeahead) =>
                                                        this.theEmergency = typeahead}
                                                    labelKey={this.state.filterName}
                                                    onChange={this.onUserSearch}
                                                    onInputChange={this.onEmergencyList}
                                                    options={this.state.escalationMatrixGroupData}
                                                    placeholder='Group Name'
                                                    ClassName="form-control form-control-sm"
                                                    onBlur={this.ClearTyeahead.bind(this, 'C')}
                                                />
                                            </div>
                                        </li>
                                        <li className="nav-item">
                                            <div className="input-group input-group-sm">
                                                <div className="input-group-prepend">
                                                    <Button id="btnNewComplain"
                                                        Action={this.addNew.bind(this)}
                                                        ClassName="btn btn-success btn-sm"
                                                        Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                                        Text=" Add" />
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div className="card-body pt-2">
                                    <DataGrid
                                        Id="grdEscalationMatrixGroupMapping"
                                        IsPagination={true}
                                        ColumnCollection={this.state.gridHeader}
                                        totalpages={this.state.grdTotalPages}
                                        totalrows={this.state.grdTotalRows}
                                        Onpageindexchanged={this.onPagechange.bind(this)}
                                        onEditMethod={this.ongridedit.bind(this)}
                                        onGridDeleteMethod={this.onGridDelete.bind(this)}
                                        DefaultPagination={false}
                                        GridData={this.state.gridData} />
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
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="lblName">Group Name</label>
                                                <InputBox Id="txtGroupName"
                                                    Value={this.state.GroupName}
                                                    onChange={this.updateData.bind(this, "GroupName")}
                                                    PlaceHolder="Max 32 Characters Are Allowed"
                                                    className="form-control form-control-sm"
                                                />
                                            </div>
                                        </div>
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="lblContact">Description</label>
                                                <InputBox Id="txtDescription"
                                                    Value={this.state.Description}
                                                    onChange={this.updateData.bind(this, "Description")}
                                                    PlaceHolder="Enter Description"
                                                    className="form-control form-control-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label for="lbddlPropertyUsers">User</label>
                                                <MultiSelectInline
                                                    ID="ddlPropertyUsers"
                                                    isMulti={true}
                                                    value={this.state.setSelectedOptionsPropertyUsers}
                                                    onChange={this.onDropDownMultiSelectChangePropertyUsers.bind(this)}
                                                    options={this.state.userList}
                                                />
                                                {/* {this.state.PageMode == "Edit" &&
                                                    <MultiSelectInline
                                                        ID="ddlPropertyUsers"
                                                        isMulti={true}
                                                        value={this.state.setSelectedOptionsPropertyUsers}
                                                        onChange={this.onDropDownMultiSelectChangePropertyUsers.bind(this)}
                                                        options={this.state.userList}
                                                    />
                                                }
                                                {this.state.PageMode == "Add" &&
                                                    <MultiSelectInline
                                                        ID="ddlPropertyUsers"
                                                        isMulti={true}
                                                        value={this.state.setSelectedOptionsPropertyUsers}
                                                        onChange={this.onDropDownMultiSelectChangePropertyUsers.bind(this)}
                                                        options={this.state.userList}
                                                    />
                                                } */}
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
export default connect(mapStoreToprops, mapDispatchToProps)(EscalationGroup);
