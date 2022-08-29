import React from 'react'

import swal from 'sweetalert';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import Button from '../../ReactComponents/Button/Button';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import ApiProvider from './DataProvider';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';

import departmentAction from '../../redux/department/action';

import './ManageResidentOwners.css';

import OwnerResidentsGrid from './OwnerResidentsGrid';

import FlatDetails from './FlatDetails.js';
import OwnerTenantView from '../PropertyOwnerTenantsCommon/OwnerTenantView.js';

class ManageResidentOwners extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            SearchValue: null,
            pageNumber: 1,
            grdTotalRows: 0,
            grdTotalPages: 0,
            isActiveInactiveClass: 1,
            gridPropertyMemberHeader: [
                { sTitle: 'Id', titleValue: 'flatId', "orderable": false, bVisible: false },//"visible": true 
                { sTitle: 'Image', titleValue: 'Image', ImagePath: 'profileimageUrl', Index: '0' },
                { sTitle: 'Flat/Shop No', titleValue: 'flatNumber' },
                { sTitle: 'Owner Name', titleValue: 'owner', },
                { sTitle: 'Resident Name', titleValue: 'name', },
                { sTitle: 'Occupancy Status', titleValue: 'StatusColor', Value: 'status', },
                { sTitle: 'Contact Number', titleValue: 'ToggleSwitch', Value: 'contactNumber', Index: '0', Width: '70' },
                { sTitle: 'Email Address&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', titleValue: 'ToggleSwitch', Value: 'emailAddress', Index: '0', Width: '80' },
                { sTitle: 'Created On', titleValue: 'createdOn' },
                { sTitle: 'Resident Type', titleValue: 'residentType', bVisible: false },
                { sTitle: 'Mobile Number', titleValue: 'extension' },
                { sTitle: 'Approved On', titleValue: 'approvedOn' },
                { sTitle: 'Ownership', titleValue: 'ownershiptype' },
                { sTitle: 'Is Primary', titleValue: 'isPrimary' },
                { sTitle: 'Deactivated On', titleValue: 'deactivatedOn', bVisible: false },
                { sTitle: 'Action', titleValue: 'Action', Action: "View", Index: '0', "orderable": false },
            ],
            gridPropertyMemberData: [],
            ViewInformation: false,

            OccupancyType: [], OccupancyTypeValue: 0,

            flatId: 0, flatNumber: '', viewOccupancytype: '', ownerResidentTypeId: 0, tenantResidentTypeId: 0,
            occupancyStatus: '', isOwnerRegistered: '', primaryMemeberId: 0,

            gridPropertyOwnerHeader: [
                { sTitle: 'Id', titleValue: 'flatId', "orderable": false, bVisible: false },//"visible": true 
                { sTitle: 'Image', titleValue: 'Image', ImagePath: 'profileimageUrl', Index: '0' },
                { sTitle: 'Flat/Shop No', titleValue: 'flatNumber', bVisible: false }, // show on top 
                { sTitle: 'Owner Name', titleValue: 'name', },
                { sTitle: 'Occupancy Status', titleValue: 'status', bVisible: false },
                { sTitle: 'Contact Number', titleValue: 'ToggleSwitch', Value: 'contactNumber', Index: '0', Width: '70' },
                { sTitle: 'Email Address&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', titleValue: 'ToggleSwitch', Value: 'emailAddress', Index: '0', Width: '80' },
                { sTitle: 'Created On', titleValue: 'createdOn' },
                { sTitle: 'Resident Type', titleValue: 'residentType', bVisible: false },
                { sTitle: 'Ext.', titleValue: 'extension', bVisible: false },
                { sTitle: 'Approved On', titleValue: 'approvedOn' },
                { sTitle: 'Ownership', titleValue: 'ownershiptype' },
                { sTitle: 'Is Primary', titleValue: 'isPrimary' },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit", Index: '0', "orderable": false },
            ],
            gridPropertyTenantHeader: [
                { sTitle: 'Id', titleValue: 'flatId', "orderable": false, bVisible: false },//"visible": true 
                { sTitle: 'Image', titleValue: 'Image', ImagePath: 'profileimageUrl', Index: '0' },
                { sTitle: 'Flat/Shop No', titleValue: 'flatNumber', bVisible: false }, // show on top 
                { sTitle: 'Name', titleValue: 'name', },
                { sTitle: 'Occupancy Status', titleValue: 'status', bVisible: false },
                { sTitle: 'Contact Number', titleValue: 'ToggleSwitch', Value: 'contactNumber', Index: '0', Width: '70' },
                { sTitle: 'Email Address&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', titleValue: 'ToggleSwitch', Value: 'emailAddress', Index: '0', Width: '80' },
                { sTitle: 'Created On', titleValue: 'createdOn' },
                { sTitle: 'Resident Type', titleValue: 'residentType', bVisible: false },
                { sTitle: 'Ext.', titleValue: 'extension', bVisible: false },
                { sTitle: 'Approved On', titleValue: 'approvedOn' },
                { sTitle: 'Ownership', titleValue: 'ownershiptype', bVisible: false },
                { sTitle: 'Is Primary', titleValue: 'isPrimary' },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit", Index: '0', "orderable": false },
            ],
        };
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    // owner and tenat view page grid  cross check when uncomment
    // CurrentOldOwnerAndTenant = (val, residentTypeId) => {
    //     if (parseInt(val) === 1 && parseInt(residentTypeId) === 1) {
    //         let dynamicGridHeader = [
    //             { sTitle: 'Id', titleValue: 'flatId', "orderable": false, bVisible: false },//"visible": true 
    //             { sTitle: 'Image', titleValue: 'Image', ImagePath: 'profileimageUrl', Index: '0' },
    //             { sTitle: 'Owner', titleValue: 'owner', },
    //             { sTitle: 'Flat No', titleValue: 'flatNumber' },
    //             { sTitle: 'Contact Number', titleValue: 'ToggleSwitch', Value: 'contactNumber', Index: '0', Width: '70' },
    //             { sTitle: 'Email Address&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', titleValue: 'ToggleSwitch', Value: 'emailAddress', Index: '0', Width: '80' },
    //             { sTitle: 'Occupancy Status', titleValue: 'status', },
    //             { sTitle: 'Resident Type', titleValue: 'residentType', },
    //             { sTitle: 'Approved On', titleValue: 'approvedOn' },
    //             { sTitle: 'Ext.', titleValue: 'extension' },
    //             { sTitle: 'Created On', titleValue: 'createdOn' },
    //             { sTitle: 'Action', titleValue: 'Action', Action: "Edit", Index: '0', "orderable": false },
    //             // { sTitle: 'Action', titleValue: 'Action', Action: "Edit&View&Delete", Index: '0', "orderable": false },            
    //             // { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
    //         ];
    //         this.setState({ gridPropertyOwnerHeader: dynamicGridHeader })
    //     }
    //     else if (parseInt(val) === 0 && parseInt(residentTypeId) === 1) {
    //         let dynamicGridHeader = [
    //             { sTitle: 'Id', titleValue: 'flatId', "orderable": false, bVisible: false },//"visible": true 
    //             { sTitle: 'Image', titleValue: 'Image', ImagePath: 'profileimageUrl', Index: '0' },
    //             { sTitle: 'Owner', titleValue: 'owner', },
    //             { sTitle: 'Flat No', titleValue: 'flatNumber' },
    //             { sTitle: 'Contact Number', titleValue: 'ToggleSwitch', Value: 'contactNumber', Index: '0', Width: '70' },
    //             { sTitle: 'Email Address&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', titleValue: 'ToggleSwitch', Value: 'emailAddress', Index: '0', Width: '80' },
    //             { sTitle: 'Occupancy Status', titleValue: 'status', },
    //             { sTitle: 'Resident Type', titleValue: 'residentType', },
    //             { sTitle: 'Approved On', titleValue: 'approvedOn' },
    //             { sTitle: 'Ext.', titleValue: 'extension' },
    //             { sTitle: 'Created On', titleValue: 'createdOn' },
    //             { sTitle: 'Action', titleValue: 'Action', Action: "Edit", Index: '0', "orderable": false, bVisible: false },
    //         ];
    //         this.setState({ gridPropertyOwnerHeader: dynamicGridHeader })
    //     }
    //     else if (parseInt(val) === 1 && parseInt(residentTypeId) === 2) {
    //         let dynamicGridHeader = [
    //             { sTitle: 'Id', titleValue: 'flatId', "orderable": false, bVisible: false },//"visible": true 
    //             { sTitle: 'Image', titleValue: 'Image', ImagePath: 'profileimageUrl', Index: '0' },
    //             { sTitle: 'Name', titleValue: 'name', },
    //             { sTitle: 'Flat No', titleValue: 'flatNumber' },
    //             { sTitle: 'Contact Number', titleValue: 'ToggleSwitch', Value: 'contactNumber', Index: '0', Width: '70' },
    //             { sTitle: 'Email Address&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', titleValue: 'ToggleSwitch', Value: 'emailAddress', Index: '0', Width: '80' },
    //             { sTitle: 'Occupancy Status', titleValue: 'status', },
    //             { sTitle: 'Resident Type', titleValue: 'residentType', },
    //             { sTitle: 'Approved On', titleValue: 'approvedOn' },
    //             { sTitle: 'Ext.', titleValue: 'extension' },
    //             { sTitle: 'Created On', titleValue: 'createdOn' },
    //             { sTitle: 'Action', titleValue: 'Action', Action: "Edit", Index: '0', "orderable": false },
    //         ];
    //         this.setState({ gridPropertyTenantHeader: dynamicGridHeader })
    //     }
    //     else if (parseInt(val) === 0 && parseInt(residentTypeId) === 2) {
    //         let dynamicGridHeader = [
    //             { sTitle: 'Id', titleValue: 'flatId', "orderable": false, bVisible: false },//"visible": true 
    //             { sTitle: 'Image', titleValue: 'Image', ImagePath: 'profileimageUrl', Index: '0' },
    //             { sTitle: 'Name', titleValue: 'name', },
    //             { sTitle: 'Flat No', titleValue: 'flatNumber' },
    //             { sTitle: 'Contact Number', titleValue: 'ToggleSwitch', Value: 'contactNumber', Index: '0', Width: '70' },
    //             { sTitle: 'Email Address&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', titleValue: 'ToggleSwitch', Value: 'emailAddress', Index: '0', Width: '80' },
    //             { sTitle: 'Occupancy Status', titleValue: 'status', },
    //             { sTitle: 'Resident Type', titleValue: 'residentType', },
    //             { sTitle: 'Approved On', titleValue: 'approvedOn' },
    //             { sTitle: 'Ext.', titleValue: 'extension' },
    //             { sTitle: 'Created On', titleValue: 'createdOn' },
    //             { sTitle: 'Action', titleValue: 'Action', Action: "Edit", Index: '0', "orderable": false, bVisible: false },
    //         ];
    //         this.setState({ gridPropertyTenantHeader: dynamicGridHeader })
    //     }
    // }

    checkActiveInactiveData = (val) => {
        this.setState({ isActiveInactiveClass: val, SearchValue: '', OccupancyTypeValue: 0 }, () => {
            let dynamicGridHeader = [
                { sTitle: 'Id', titleValue: 'flatId', "orderable": false, bVisible: false },//"visible": true 
                { sTitle: 'Image', titleValue: 'Image', ImagePath: 'profileimageUrl', Index: '0' },
                { sTitle: 'Flat/Shop No', titleValue: 'flatNumber' },
                { sTitle: 'Owner Name', titleValue: 'owner', },
                { sTitle: 'Resident Name', titleValue: 'name', },
                { sTitle: 'Occupancy Status', titleValue: 'StatusColor', Value: 'status', },
                { sTitle: 'Contact Number', titleValue: 'ToggleSwitch', Value: 'contactNumber', Index: '0', Width: '70' },
                { sTitle: 'Email Address&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', titleValue: 'ToggleSwitch', Value: 'emailAddress', Index: '0', Width: '80' },
                { sTitle: 'Created On', titleValue: 'createdOn' },
                { sTitle: 'Resident Type', titleValue: 'residentType', bVisible: false },
                { sTitle: 'Mobile Number', titleValue: 'extension' },
                { sTitle: 'Approved On', titleValue: 'approvedOn' },
                { sTitle: 'Ownership', titleValue: 'ownershiptype' },
                { sTitle: 'Is Primary', titleValue: 'isPrimary' },
                { sTitle: 'Deactivated On', titleValue: 'deactivatedOn', bVisible: false },
                { sTitle: 'Action', titleValue: 'Action', Action: "View", Index: '0', "orderable": false },
            ];
            if (parseInt(this.state.isActiveInactiveClass) === 0) {
                dynamicGridHeader = [];
                dynamicGridHeader = [
                    { sTitle: 'Id', titleValue: 'flatId', "orderable": false, bVisible: false },//"visible": true 
                    { sTitle: 'Image', titleValue: 'Image', ImagePath: 'profileimageUrl', Index: '0' },
                    { sTitle: 'Flat/Shop No', titleValue: 'flatNumber' },
                    { sTitle: 'Owner Name', titleValue: 'owner', bVisible: false },
                    { sTitle: 'Resident Name', titleValue: 'name', },
                    { sTitle: 'Occupancy Status', titleValue: 'StatusColor', Value: 'status', bVisible: false },
                    { sTitle: 'Contact Number', titleValue: 'ToggleSwitch', Value: 'contactNumber', Index: '0', Width: '70' },
                    { sTitle: 'Email Address&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', titleValue: 'ToggleSwitch', Value: 'emailAddress', Index: '0', Width: '80' },
                    { sTitle: 'Created On', titleValue: 'createdOn' },
                    { sTitle: 'Resident Type', titleValue: 'residentType', bVisible: false },
                    { sTitle: 'Mobile Number', titleValue: 'extension', bVisible: false },
                    { sTitle: 'Approved On', titleValue: 'approvedOn', bVisible: false },
                    { sTitle: 'Ownership', titleValue: 'ownershiptype', bVisible: false },
                    { sTitle: 'Is Primary', titleValue: 'isPrimary', bVisible: false },
                    { sTitle: 'Deactivated On', titleValue: 'deactivatedOn', bVisible: false },
                    { sTitle: 'Action', titleValue: 'Action', Action: "View", Index: '0', "orderable": false },

                ];
                this.setState({ gridPropertyMemberHeader: dynamicGridHeader }, () => this.getPropertyMember(""))
            }
            else {
                this.setState({ gridPropertyMemberHeader: dynamicGridHeader }, () => this.getPropertyMember(""))
            }
        })
    }

    componentDidMount() {
        this.loadMemberOccupancyType();
        this.getPropertyMember("");
    }

    componentDidUpdate(nextProps) {
        if (nextProps.PropertyId != this.props.PropertyId) {
            this.getPropertyMember("");
        }
    }

    loadMemberOccupancyType() {
        var type = 'RT';
        var model = this.getModel(type, "");
        this.managePropertyMember(model, type);
    }

    getPropertyMember(value) {
        var type = 'R';
        var model = this.getModel(type, value);
        // console.log(model[0]);
        this.managePropertyMember(model, type);
    }

    managePropertyMember = (model, type, Id) => {
        this.ApiProviderr.managePropertyMember(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'R':
                                // console.log(rData, "Main Grid data");
                                this.setState({ grdTotalPages: rData.totalPages });
                                this.setState({ grdTotalRows: rData.totalRows });
                                this.setState({ gridPropertyMemberData: rData.members });
                                break;
                            case 'I':
                                swal.close();
                                break;
                            case 'V':
                                swal.close();
                                let data = this.findItem(Id);
                                // console.log(data, "View data");
                                if (data) {
                                    this.setState({
                                        flatId: data.flatId,
                                        viewOccupancytype: data.residentType,
                                        residentTypeId: data.residentId,
                                        flatNumber: data.flatNumber,
                                        occupancyStatus: data.status,
                                        isOwnerRegistered: data.owner,
                                        primaryMemeberId: data.propertyMemberId,
                                    }, () => {
                                        // this.setState({ PageMode: 'View' })
                                        if (this.state.isActiveInactiveClass === 1) {
                                            this.setState({ PageMode: 'View' })
                                        }
                                        else {
                                            this.setState({ PageMode: 'ReadOnlyView' })
                                        }
                                    })
                                }
                                break;
                            case 'RT':
                                let arr = [{ Id: 0, Name: "Select Occupancy Type" }];
                                rData.forEach(element => {
                                    arr.push({ Id: element.id, Name: element.text });
                                    if (element.text === 'Owner') {
                                        this.setState({ ownerResidentTypeId: element.id })
                                    }
                                    else if (element.text === 'Tenant') {
                                        this.setState({ tenantResidentTypeId: element.id })
                                    }
                                });
                                this.setState({ OccupancyType: arr });
                                break;
                            default:
                        }
                    });
                }
            });
    }

    onPagechange = (page) => {
        this.setState({ pageNumber: page }, () => {
            this.getPropertyMember("");
        });
    }

    onGridDelete = (Id) => {

    }

    viewInformation = (action, Id, type) => {
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
            title: "Edit/View Property member information",
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
                //var model = this.getModel(type, value);
                var model = [{
                    "Id": Id,
                    "FormName": window.location.pathname.split("/").pop(),
                    "Action": action,
                    "JustificationComment": value
                }];
                if (type === "V") {
                    _this.managePropertyMember(model, type, Id);
                }
                else {
                    _this.managePropertyMember(model, 'I');
                }
            }

            if (value === true || value === '') {
                swal("", "Reason text can not be empty!", "info");
            }
        });
    }

    ongridedit(Id) {

    }

    ongridview(Id) {
        this.viewInformation("View", Id, 'V');
    }

    findItem(id) {
        return this.state.gridPropertyMemberData.find((item) => {
            if (item.flatId == id) {
                return item;
            }
        });
    }

    getModel = (type, value) => {
        var model = [];
        switch (type) {
            case 'R':
                model.push({
                    // "SearchValue": this.state.SearchValue,
                    "SearchValue": this.state.SearchValue ? this.state.SearchValue : "NULL",
                    "PageSize": 10,
                    "PageNumber": parseInt(this.state.pageNumber),
                    "PropertyId": parseInt(this.props.PropertyId),
                    "ResidentTypeId": parseInt(this.state.OccupancyTypeValue),
                    "FlatId": 0,
                    "IsActive": parseInt(this.state.isActiveInactiveClass),
                    "TabType": 'NULL',
                });
                break;
            case 'I':
                model.push({
                    "FormName": "ManageResidentOwner",
                    "Action": "Edit",
                    "JustificationComment": value
                });
                break;
            default:
        };
        return model;
    }

    handleCancel = () => {
        this.setState({ PageMode: 'Home', pageNumber: 1 }, () => this.getPropertyMember(""));
    };

    handleSearch = () => {
        if (this.state.SearchValue !== null && this.state.SearchValue !== "") {
            this.getPropertyMember("");
        }
        else {
            this.setState({ SearchValue: null }, () => this.getPropertyMember(""))
        }
    };

    onSelected(name, value) {
        switch (name) {
            case "OcupancyType":
                this.setState({ OccupancyTypeValue: value }, () => this.getPropertyMember(""));
                break;
            default:
        }
    }

    updateData = (name, value) => {
        switch (name) {
            case "SearchValue":
                this.setState({ SearchValue: value });
                break;
            default:
        }
    }

    //End
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
                                                <Button id="btnResident"
                                                    Action={this.checkActiveInactiveData.bind(this, 1)}
                                                    ClassName={this.state.isActiveInactiveClass === 1 ? 'btn btn-success' : 'btn btn-default'}
                                                    Text="Current" />

                                                <Button id="btnServicesStaff"
                                                    Action={this.checkActiveInactiveData.bind(this, 0)}
                                                    ClassName={this.state.isActiveInactiveClass === 0 ? 'btn btn-success' : 'btn btn-default'}
                                                    Text="Old" />
                                            </div>
                                        </li>
                                        <li className="nav-item">
                                            <SelectBox
                                                ID="dllOcupancyType"
                                                Value={this.state.OccupancyTypeValue}
                                                onSelected={this.onSelected.bind(this, "OcupancyType")}
                                                Options={this.state.OccupancyType}
                                                ClassName="form-control" />
                                        </li>
                                        <li className="nav-item">
                                            <div className="input-group">
                                                {/* <InputBox Id="txtSearchValue"
                                                    Value={this.state.SearchValue}
                                                    onChange={this.updateData.bind(this, "SearchValue")}
                                                    PlaceHolder="Search..."
                                                    className="form-control"
                                                /> */}
                                                <input
                                                    type="text"
                                                    id="txtSearchValue"
                                                    placeholder="Search..."
                                                    className="form-control"
                                                    value={this.state.SearchValue}
                                                    onChange={(e) => this.setState({ SearchValue: e.target.value })}
                                                />
                                                <div className="input-group-append">
                                                    <Button
                                                        Id="btnSearch"
                                                        Text="Search"
                                                        Action={this.handleSearch.bind(this)}
                                                        ClassName="btn btn-success" />
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div className="card-body pt-2">
                                    <DataGrid
                                        Id={this.props.Id}
                                        IsPagination={true}
                                        ColumnCollection={this.state.gridPropertyMemberHeader}
                                        totalpages={this.state.grdTotalPages}
                                        totalrows={this.state.grdTotalRows}
                                        Onpageindexchanged={this.onPagechange.bind(this)}
                                        onEditMethod={this.ongridedit.bind(this)}
                                        onGridViewMethod={this.ongridview.bind(this)}
                                        onGridDeleteMethod={() => { }}
                                        onGridDownloadMethod={() => { }}
                                        GridData={this.state.gridPropertyMemberData}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {this.state.PageMode == 'View' &&
                    <div className="modal-content">
                        <div className="modal-body">
                            <div className="col-12 col-sm-12">
                                <div className="card card-primary card-outline card-outline-tabs">
                                    <div className="card-header p-0 border-bottom-0">
                                        <ul className="nav nav-tabs" id="custom-tabs-three-tab" role="tablist">
                                            <li className="nav-item">
                                                <a className="nav-link active" id="custom-tabs-three-home-tab" data-toggle="pill" href="#custom-tabs-three-home" role="tab" aria-controls="custom-tabs-three-home" aria-selected="true">Flat Details</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" id="custom-tabs-three-profile-tab" data-toggle="pill" href="#custom-tabs-three-profile" role="tab" aria-controls="custom-tabs-three-profile" aria-selected="false">Owners</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" id="custom-tabs-three-messages-tab" data-toggle="pill" href="#custom-tabs-three-messages" role="tab" aria-controls="custom-tabs-three-messages" aria-selected="false">Tenants</a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="card-body">
                                        <div className="tab-content" id="custom-tabs-three-tabContent">
                                            <div className="tab-pane fade show active" id="custom-tabs-three-home" role="tabpanel" aria-labelledby="custom-tabs-three-home-tab">
                                                <FlatDetails flatId={this.state.flatId} />
                                            </div>
                                            <div className="tab-pane fade" id="custom-tabs-three-profile" role="tabpanel" aria-labelledby="custom-tabs-three-profile-tab">
                                                <OwnerResidentsGrid
                                                    grdID={`grdViewOwnerDetails${this.state.flatId}`}
                                                    flatId={this.state.flatId}
                                                    flatNumber={this.state.flatNumber}
                                                    occupancyStatus={this.state.occupancyStatus}
                                                    residentTypeId={parseInt(this.state.ownerResidentTypeId)}
                                                    gridHeader={this.state.gridPropertyOwnerHeader}
                                                    isOwnerRegistered={this.state.isOwnerRegistered}
                                                    //  CurrentOldOwnerAndTenant={this.CurrentOldOwnerAndTenant.bind(this)}
                                                    handleCancel={this.handleCancel.bind(this)}
                                                />
                                            </div>
                                            <div className="tab-pane fade" id="custom-tabs-three-messages" role="tabpanel" aria-labelledby="custom-tabs-three-messages-tab">
                                                <OwnerResidentsGrid
                                                    grdID={`grdViewTenantDetails${this.state.flatId}`}
                                                    flatId={this.state.flatId}
                                                    flatNumber={this.state.flatNumber}
                                                    occupancyStatus={this.state.occupancyStatus}
                                                    residentTypeId={parseInt(this.state.tenantResidentTypeId)}
                                                    gridHeader={this.state.gridPropertyTenantHeader}
                                                    isOwnerRegistered={this.state.isOwnerRegistered}
                                                    // CurrentOldOwnerAndTenant={this.CurrentOldOwnerAndTenant.bind(this)}
                                                    handleCancel={this.handleCancel.bind(this)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <Button
                                            Id="btnCancel"
                                            Text="Close"
                                            Action={this.handleCancel}
                                            ClassName="btn btn-danger" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {this.state.PageMode == 'ReadOnlyView' &&
                    <OwnerTenantView
                        flatId={this.state.flatId}
                        primaryMemeberId={this.state.primaryMemeberId}
                        flatNumber={this.state.flatNumber}
                        residentTypeId={this.state.residentTypeId}
                        residentType={this.state.viewOccupancytype}
                        handleCancel={this.handleCancel.bind(this)}
                    />
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
export default connect(mapStoreToprops, mapDispatchToProps)(ManageResidentOwners);