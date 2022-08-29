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

class PropertyEmployee extends Component {
    constructor(props) {
        super(props);
        this.state = {
            GridData: [],
            gridHeader: [
                { sTitle: 'Id', titleValue: 'userPropertyAssignmentId', "orderable": false },
                { sTitle: 'Image', titleValue: 'Image', ImagePath: 'profileImageUrl', Index: '0', "orderable": false },
                { sTitle: 'Name', titleValue: 'name', },
                { sTitle: 'Email Address', titleValue: 'emailaddress', },
                { sTitle: 'Mobile Number', titleValue: 'contactNumber', },
                { sTitle: 'Branch', titleValue: 'branchname', },
                { sTitle: 'Role', titleValue: 'userRoles', },
                { sTitle: 'Department', titleValue: 'departmentname', },
                { sTitle: 'Start Date', titleValue: 'startDate', },
                { sTitle: 'Action', titleValue: 'Action', Action: "Delete", Index: '0', "orderable": false },
            ],

            PageMode: 'Home',
            userPropertyAssignmentId: null,
            isActive: 1,
            usersList: [], setSelectedOptionsPropertyUsers: [], UserIds: ''

        };
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    componentDidMount() {
        this.loadHomagePageData();
        this.loadUsersData();
    }
    componentDidUpdate(prevProps) {
        // 
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.loadHomagePageData();
            this.loadUsersData();
        }
    }

    getModel = (type) => {
        var model = [];
        switch (type) {
            case 'R':
                model.push({
                    "PropertyId": parseInt(this.props.PropertyId),
                    "StatementType": type,
                    "Status": parseInt(this.state.isActive)
                });
                break;
            case 'C':
                model.push({
                    "PropertyId": parseInt(this.props.PropertyId),
                    "StatementType": type,
                    "Users": this.state.UserIds,
                });
                break;
            case 'UL':
                model.push({
                    "PropertyId": parseInt(this.props.PropertyId),
                    "StatementType": type,
                });
                break;

            case 'D':
                model.push({
                    "userPropertyAssignmentId": this.state.userPropertyAssignmentId,
                    "StatementType": type,
                });
                break;

            default:
        };
        return model;
    }


    loadHomagePageData() {
        var type = 'R';
        var model = this.getModel(type);
        this.managePropertyEmployees(model, type);
    }
    loadUsersData() {
        var type = 'UL';
        var model = this.getModel(type);
        this.managePropertyEmployees(model, type);
    }

    managePropertyEmployees = (model, type) => {
        this.ApiProviderr.managePropertyEmployees(model, type).then(
            resp => {
                if (resp != undefined) {

                    if (resp.ok && resp.status == 200) {
                        return resp.json().then(rData => {
                            switch (type) {
                                case 'C':
                                    if (rData === 1) {
                                        appCommon.showtextalert("User Assigned Successfully!", "", "success");
                                    }
                                    else {
                                        appCommon.showtextalert("Someting went wrong !", "", "error");
                                    }
                                    this.handleCancel();
                                    break;
                                case 'D':
                                    if (rData === 1) {
                                        appCommon.showtextalert("Assigned User Deleted Successfully!", "", "success");
                                    }
                                    else {
                                        appCommon.showtextalert("Someting went wrong !", "", "error");
                                    }
                                    this.handleCancel();
                                    break;
                                case 'R':
                                    this.setState({ GridData: rData });
                                    break;
                                case 'UL':
                                    let propertyUserData = [];
                                    rData.forEach(element => {
                                        propertyUserData.push({ Id: element.id, Name: element.text, value: element.text, label: element.text, color: '#0052CC' });
                                    });
                                    this.setState({ usersList: propertyUserData });
                                    break;
                                default:
                            }
                        });
                    }
                }
            });
    }

    handleSave = () => {

        if (this.state.setSelectedOptionsPropertyUsers.length > 0) {
            let type = 'C';
            let data = this.state.setSelectedOptionsPropertyUsers.
                map((item) => { return item.Id })

            this.setState({ UserIds: data.join(',') }, () => {
                var model = this.getModel(type);
                console.log(model);
                this.managePropertyEmployees(model, type);
            })
        }
        else {
            appCommon.showtextalert("Please Select Users !", "", "error");
        }
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
                        this.setState({ userPropertyAssignmentId: Id }, () => {
                            var model = this.getModel('D');
                            this.managePropertyEmployees(model, 'D');
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
    checkActiveInactiveData = (val) => {
        let gridHeader = [
            { sTitle: 'Id', titleValue: 'userPropertyAssignmentId', "orderable": false },
            { sTitle: 'Image', titleValue: 'Image', ImagePath: 'profileImageUrl', Index: '0', "orderable": false },
            { sTitle: 'Name', titleValue: 'name', },
            { sTitle: 'Email Address', titleValue: 'emailaddress', },
            { sTitle: 'Mobile Number', titleValue: 'contactNumber', },
            { sTitle: 'Branch', titleValue: 'branchname', },
            { sTitle: 'Role', titleValue: 'userRoles', },
            { sTitle: 'Department', titleValue: 'departmentname', },
            { sTitle: 'Start Date', titleValue: 'startDate', },
            // { sTitle: 'End Date', titleValue: 'endDate', },
            { sTitle: 'Action', titleValue: 'Action', Action: "Delete", Index: '0', "orderable": false },
        ]
        this.setState({ isActive: val }, () => {

            if (this.state.isActive === 0) {
                gridHeader = [];
                gridHeader.push({ sTitle: 'Id', titleValue: 'userPropertyAssignmentId', "orderable": false });
                gridHeader.push({ sTitle: 'Image', titleValue: 'Image', ImagePath: 'profileImageUrl', Index: '0', "orderable": false });
                gridHeader.push({ sTitle: 'Name', titleValue: 'name', });
                gridHeader.push({ sTitle: 'Email Address', titleValue: 'emailaddress', });
                gridHeader.push({ sTitle: 'Mobile Number', titleValue: 'contactNumber', });
                gridHeader.push({ sTitle: 'Branch', titleValue: 'branchname', });
                gridHeader.push({ sTitle: 'Role', titleValue: 'userRoles', });
                gridHeader.push({ sTitle: 'Department', titleValue: 'departmentname', });
                gridHeader.push({ sTitle: 'Start Date', titleValue: 'startDate', });
                gridHeader.push({ sTitle: 'End Date', titleValue: 'endDate', });
                this.setState({
                    gridHeader: gridHeader, userPropertyAssignmentId: null, setSelectedOptionsPropertyUsers: [], UserIds: ''
                }, () => this.loadHomagePageData())
            }
            else {
                this.setState({
                    gridHeader: gridHeader, userPropertyAssignmentId: null, setSelectedOptionsPropertyUsers: [], UserIds: ''
                }, () => this.loadHomagePageData())
            }
        })
    }
    handleCancel = () => {
        this.setState({ userPropertyAssignmentId: null, setSelectedOptionsPropertyUsers: [], UserIds: '' }, () => {
            this.loadHomagePageData();
            this.loadUsersData();
        });
    };
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
                                    <ul className="nav tableFilterContainer">
                                        <li className="nav-item">
                                            <div className="btn-group">
                                                <Button id="btnActive"
                                                    Action={this.checkActiveInactiveData.bind(this, 1)}
                                                    ClassName={this.state.isActive === 1 ? 'btn btn-success' : 'btn btn-default'}
                                                    Text="Active" />

                                                <Button id="btnInactive"
                                                    Action={this.checkActiveInactiveData.bind(this, 0)}
                                                    ClassName={this.state.isActive === 0 ? 'btn btn-success' : 'btn btn-default'}
                                                    Text="Old" />
                                            </div>
                                        </li>
                                    </ul>

                                    {
                                        this.state.isActive === 1 ?
                                            <ul className="nav ml-auto tableFilterContainer">
                                                <li className="nav-item">
                                                    <label>Users</label>
                                                </li>
                                                <li className="nav-item" style={{ width: "400px" }}>
                                                    <MultiSelectInline
                                                        ID="ddlPropertyUsers"
                                                        isMulti={true}
                                                        value={this.state.setSelectedOptionsPropertyUsers}
                                                        onChange={this.onDropDownMultiSelectChangePropertyUsers.bind(this)}
                                                        options={this.state.usersList}
                                                    />
                                                </li>
                                                <li className="nav-item">
                                                    <Button
                                                        Id="btnSave"
                                                        Text="Save"
                                                        Action={this.handleSave.bind(this)}
                                                        ClassName="btn btn-primary" />
                                                </li>
                                            </ul>
                                            : null
                                    }
                                </div>
                                <div className="card-body pt-2">
                                    <DataGrid
                                        Id="grdPropertyemployees"
                                        IsPagination={false}
                                        ColumnCollection={this.state.gridHeader}
                                        DefaultPagination={true}
                                        IsSarching="true"
                                        GridData={this.state.GridData}
                                        onGridDeleteMethod={this.onGridDelete.bind(this)}
                                        pageSize="10" />
                                </div>
                            </div>
                        </div>
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
export default connect(mapStoreToprops, mapDispatchToProps)(PropertyEmployee);