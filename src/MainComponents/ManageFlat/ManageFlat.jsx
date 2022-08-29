import React from 'react'
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import FlatDetails from './FlatDetails.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from '../ManageFlat/DataProvider.js';
import { ToastContainer, toast } from 'react-toastify';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import UrlProvider from "../../Common/ApiUrlProvider.js";
import ManageResidentOwners from '../ManageResidentOwners/ManageResidentOwners.jsx';
import './ManageFlat.css';

import { connect } from 'react-redux';
import departmentAction from '../../redux/department/action';
import { promiseWrapper } from '../../utility/common';
import { bindActionCreators } from 'redux';

const $ = window.$;
class ManageFlat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            PropertyId: 0,
            PropertyDetailsId: 0,
            IsOwner: 1,
            IsMember: 0,
            PropertyDetails: null,
            isActive: "A",
            pageSize: 10,
            pageNumber: 1,
            //grid
            gridHeader: [
                { sTitle: 'Id', titleValue: 'propertyDetailsId', "orderable": false, bVisible: false },//"visible": true 
                { sTitle: 'Flat No.', titleValue: 'flatDetailNumber', },
                { sTitle: 'Tower/Block', titleValue: 'propertyTowerName', },
                { sTitle: 'Occupancy status', titleValue: 'StatusColor', Value: 'statusType', }, //(Status Type)
                { sTitle: 'Ext.', titleValue: 'contactNumber', },
                { sTitle: 'Action', titleValue: 'Action', Action: "Manage", Index: '0', "orderable": false },
            ],
            gridData: [],
            grdTotalRows: 0,
            grdTotalPages: 0,
        };
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    componentDidMount() {
        //
        this.setState({ PropertyId: this.props.PropertyId, pageNumber: 1 }, () => {
            this.loadManageFlat(this.props.PropertyId);
        });
    }
    componentDidUpdate(prevProps) {
        //
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.setState({ PropertyId: this.props.PropertyId, pageNumber: 1 }, () => {
                this.loadManageFlat(this.props.PropertyId);
            });
        }
    }

    loadManageFlat = (id) => {
        this.getManageFlat(id, "NULL");
    }

    getManageFlat(id, value) {
        var type = 'R';
        var model = this.getModel(type, id, value);
        this.manageManageFlat(model, type);
    }

    manageManageFlat = (model, type) => {
        this.ApiProviderr.manageManageFlat(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'R':
                                this.setState({ grdTotalPages: rData.totalPages });
                                this.setState({ grdTotalRows: rData.totalRows });
                                this.setState({ gridData: rData.propertyDetail });
                                break;
                            default:
                        }
                    });
                }
            });
    }

    async ongridedit(Id) {
        var rowData = this.findItem(Id);
        this.setState({ PropertyDetailsId: rowData.propertyDetailsId })
        this.setState({ PropertyDetails: rowData, PageMode: 'Manage' });
    }

    findItem(id) {
        return this.state.gridData.find((item) => {
            if (item.propertyDetailsId == id) {
                return item;
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
                    "PageSize": this.state.pageSize,
                    "PageNumber": this.state.pageNumber
                });
                break;
            case 'C':
                this.setState({ Name: '', Contact: '', PropertyDetailsId: 0 });
                break;
            default:
        };
        return model;
    }

    handleSave = () => {
        let url = new UrlProvider().MainUrl;

    }

    onPagechange = (page) => {
        this.setState({ pageNumber: page }, () => {
            this.loadManageFlat(this.props.PropertyId);
        });
    }


    handleBack() {
        var type = 'C';
        this.getModel(type);
        this.getManageFlat(this.state.PropertyId);
        this.setState({ PageMode: 'Home' });
    }

    handleClick(val) {
        alert(val)
    }

    managepagemode(pagetype, data) {
        this.setState({ PageMode: pagetype, PageTitle: 'Manage Resident/Owners ' + pagetype, Data: data });
    }

    //End
    render() {
        return (
            <div>
                {this.state.PageMode == 'Home' &&
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body pt-2">
                                    <DataGrid
                                        Id="grdManageFlat"
                                        IsPagination={true}
                                        ColumnCollection={this.state.gridHeader}
                                        totalpages={this.state.grdTotalPages}
                                        totalrows={this.state.grdTotalRows}
                                        Onpageindexchanged={this.onPagechange.bind(this)}
                                        onEditMethod={this.ongridedit.bind(this)}
                                        DefaultPagination={false}
                                        IsSarching="true"
                                        GridData={this.state.gridData} />
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {(this.state.PageMode == 'Manage') &&
                    <div>
                        <div>
                            <div className="modal-content">
                                <div style={{ textAlign: "left" }}>
                                    <Button
                                        Id="btnBackToFlat"
                                        Text="Back to All Flat"
                                        Action={this.handleBack.bind(this)}
                                        ClassName="btn btn-link" />
                                </div>
                                <div className="modal-body">
                                    <div class="col-12 col-sm-12">
                                        <div class="card card-primary card-outline card-outline-tabs">
                                            <div class="card-header p-0 border-bottom-0">
                                                <ul class="nav nav-tabs" id="custom-tabs-three-tab" role="tablist">
                                                    <li class="nav-item">
                                                        <a class="nav-link active" id="custom-tabs-three-home-tab" data-toggle="pill" href="#custom-tabs-three-home" role="tab" aria-controls="custom-tabs-three-home" aria-selected="true">Flat Details</a>
                                                    </li>
                                                    <li class="nav-item">
                                                        <a class="nav-link" id="custom-tabs-three-profile-tab" data-toggle="pill" href="#custom-tabs-three-profile" role="tab" aria-controls="custom-tabs-three-profile" aria-selected="false">Owners</a>
                                                    </li>
                                                    <li class="nav-item">
                                                        <a class="nav-link" id="custom-tabs-three-messages-tab" data-toggle="pill" href="#custom-tabs-three-messages" role="tab" aria-controls="custom-tabs-three-messages" aria-selected="false">Residents</a>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div class="card-body">
                                                <div class="tab-content" id="custom-tabs-three-tabContent">
                                                    <div class="tab-pane fade show active" id="custom-tabs-three-home" role="tabpanel" aria-labelledby="custom-tabs-three-home-tab">
                                                        <FlatDetails PropertyDetails={this.state.PropertyDetails} />
                                                    </div>
                                                    <div class="tab-pane fade" id="custom-tabs-three-profile" role="tabpanel" aria-labelledby="custom-tabs-three-profile-tab">
                                                        <ManageResidentOwners Id={"grdPropertyMemberOwner"} PageName={"Owners"} PropertyDetailsId={this.state.PropertyDetailsId} PageMode={this.state.PageMode} Action={this.managepagemode.bind(this)} />
                                                    </div>
                                                    <div class="tab-pane fade" id="custom-tabs-three-messages" role="tabpanel" aria-labelledby="custom-tabs-three-messages-tab">
                                                        <ManageResidentOwners Id={"grdPropertyMemberMember"} PageName={"Residents"} PropertyDetailsId={this.state.PropertyDetailsId} PageMode={this.state.PageMode} Action={this.managepagemode.bind(this)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
export default connect(mapStoreToprops, mapDispatchToProps)(ManageFlat);