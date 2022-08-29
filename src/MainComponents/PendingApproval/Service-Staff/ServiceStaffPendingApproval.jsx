import React, { Component } from 'react';
import DataGrid from '../../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../../ReactComponents/Button/Button';
import ApiProvider from './DataProvider';
import { ToastContainer, toast } from 'react-toastify';
import * as appCommon from '../../../Common/AppCommon.js';
import swal from 'sweetalert';
import { CreateValidator, ValidateControls } from './Validation';
import CommonDataProvider from '../../../Common/DataProvider/CommonDataProvider.js';
import InputBox from '../../../ReactComponents/InputBox/InputBox.jsx';
import { DELETE_CONFIRMATION_MSG } from '../../../Contants/Common';
import UrlProvider from "../../../Common/ApiUrlProvider.js";
import { Typeahead } from 'react-bootstrap-typeahead';
import SelectBox from '../../../ReactComponents/SelectBox/Selectbox.jsx';

import { connect } from 'react-redux';
import departmentAction from '../../../redux/department/action';
import { bindActionCreators } from 'redux';
const $ = window.$;

class ServiceStaffPendingApproval extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            grdTotalRows: 0,
            grdTotalPages: 0,
            PageNumber: 1,
            gridData: [],
            gridHeader: [
                { sTitle: 'Id', titleValue: 'id', "orderable": false },
                { sTitle: 'Image', titleValue: 'Image', ImagePath: 'profileImageUrl', Index: '0' },
                { sTitle: 'Name', titleValue: 'name', },
                { sTitle: 'Gender', titleValue: 'gender', },
                { sTitle: 'Phone', titleValue: 'phone', },
                { sTitle: 'Type', titleValue: 'type', },
                { sTitle: 'Created On', titleValue: 'createdOn', },
                { sTitle: 'Status', titleValue: 'status', },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Approve&Reject", Index: '0', "orderable": false },
            ],
            FilterSelectedServiceStaffStatus: 'All',
            ServiceStaffStatusStatusOptions: [
                { Id: 'All', Name: "All" },
                { Id: "Pending", Name: 'Pending' },
                { Id: "Block", Name: 'Block' },
            ],
            FilterSelectedServiceStaff: 'All',
            ServiceStaffStatusOptions: [
                { Id: 'All', Name: "All" },
                { Id: "Service", Name: 'Service' },
                { Id: "Staff", Name: 'Staff' },
            ]
        };

        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    componentDidMount() {
        let dummyData = [
            {
                id: 1, gender: 'male', profileImageUrl: 'https://ufirm.in/assets/cdn/public/profileimg/default.jpg',
                name: 'Rakhmaji Ghule', phone: '1234567890', type: 'staff', createdOn: '02/07/2021', status: 'Pending'
            }
        ]
        this.setState({ gridData: dummyData })
    }

    onPagechange = (page) => {
        this.setState({ PageNumber: page }, () => {
            // console.log(this.state.PageNumber);
        });
    }
    async ongridedit(Id) {
        this.setState({ PageMode: 'Edit' }, () => {
            // CreateValidator();
        });
    }
    ongridApprove = (Id) => {

    }
    ongridReject = (Id) => {

    }
    onSelected(name, value) {
        switch (name) {
            case "FilterSelectedServiceStaffStatus":
                this.setState({ FilterSelectedServiceStaffStatus: value });
                break;
            case "FilterSelectedServiceStaff":
                this.setState({ FilterSelectedServiceStaff: value });
                break;
            default:
        }
    }
    render() {
        return (
            <div>
                {this.state.PageMode == 'Home' &&
                    <div className="row">
                        <div className="col-3">
                            <SelectBox
                                ID="ddlFilterServiceStaff"
                                Value={this.state.FilterSelectedServiceStaff}
                                onSelected={this.onSelected.bind(this, "FilterSelectedServiceStaff")}
                                Options={this.state.ServiceStaffStatusOptions}
                                ClassName="form-control" />
                        </div>
                        <div className="col-3">
                            <SelectBox
                                ID="ddlFilterServiceStaffStatus"
                                Value={this.state.FilterSelectedServiceStaffStatus}
                                onSelected={this.onSelected.bind(this, "FilterSelectedServiceStaffStatus")}
                                Options={this.state.ServiceStaffStatusStatusOptions}
                                ClassName="form-control" />
                        </div>
                        <div className="col-12">
                            <DataGrid
                                Id="grdServicesAndStaffPendingApproval"
                                IsPagination={true}
                                ColumnCollection={this.state.gridHeader}
                                Onpageindexchanged={this.onPagechange.bind(this)}
                                onEditMethod={this.ongridedit.bind(this)}
                                onGridViewMethod={this.ongridApprove.bind(this)}
                                onGridDeleteMethod={this.ongridReject.bind(this)}
                                DefaultPagination={false}
                                IsSarching="true"
                                GridData={this.state.gridData}
                            />
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
export default connect(mapStoreToprops, mapDispatchToProps)(ServiceStaffPendingApproval);