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

class ResidentPendingApproval extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            gridData: [],
            gridHeader: [
                { sTitle: 'Id', titleValue: 'propertyMemberId', "orderable": false },
                { sTitle: 'Appartment', titleValue: 'apprartment', },
                { sTitle: 'Image', titleValue: 'Image', ImagePath: 'profileimageUrl', Index: '0' },
                { sTitle: 'Name', titleValue: 'name', },
                { sTitle: 'Phone', titleValue: 'contactNumber', },
                { sTitle: 'Type', titleValue: 'resident', },
                { sTitle: 'Created On', titleValue: 'createdOn', },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Approve&Reject", Index: '0', "orderable": false },
            ],
            residentType: 0,
            residentTypeOptions: []
        };

        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    componentDidMount() {
        this.getResidents();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.getResidents();
        }
    }

    onPagechange = (page) => {
    }

    findItem(id) {
        return this.state.gridData.find((item) => {
            if (item.propertyMemberId == id) {
                return item;
            }
        });
    }

    async ongridedit(Id) {
        this.setState({ PageMode: 'Edit' }, () => {
            // CreateValidator();
            this.getResidentType();
            var rowData = this.findItem(Id);
            this.setState({ residentType: rowData.residentTypeId })
        });
    }

    ongridApprove = (Id) => {

    }
    ongridReject = (Id) => {

    }

    getResidents() {
        var type = 'RL';
        var model = this.getModel(type);
        this.manageResidents(model, type);
    }
    getResidentType() {
        var type = 'RT';
        var model = this.getModel(type);
        this.manageResidents(model, type);
    }

    manageResidents = (model, type) => {
        this.ApiProviderr.manageResidents(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        console.log(rData);
                        switch (type) {
                            case 'E':
                                if (rData === 1) {
                                    appCommon.showtextalert("Notice Saved Successfully!", "", "success");
                                }
                                else {
                                    appCommon.showtextalert("Notice Subject Already Existed !", "", "error");
                                }
                                break;
                            case 'A':
                                if (rData === 1) {
                                    appCommon.showtextalert("Notice Deleted Successfully!", "", "success");
                                }
                                else {
                                    appCommon.showtextalert("Someting went wrong !", "", "error");
                                }

                                break;
                            case 'RL':
                                this.setState({ gridData: rData });
                                break;
                            case 'RT':
                                let residentTypeData = [{ Id: 0, Name: "Select Resident Type" }];
                                rData.forEach(element => {
                                    residentTypeData.push({ Id: element.id, Name: element.text });
                                });
                                this.setState({ residentTypeOptions: residentTypeData });
                                break;
                            default:
                        }
                    });
                }
            });
    }

    getModel = (type) => {
        var model = [];
        switch (type) {
            case 'RL':
                model.push({
                    "PropertyId": parseInt(this.props.PropertyId),
                    "StatementType": type,
                });
                break;
            default:
        };
        return model;
    }

    updatetextmodel = (ctrl, val) => {
        if (ctrl == 'Residenttype') {
            this.setState({ residentType: val });
        }
        else if (ctrl == 'Editor') {
            this.setState({ editorvalue: val });
        }
        else if (ctrl == 'Subject') {
            this.setState({ subjectvalue: val });
        }
    }

    onSelected(name, value) {
        switch (name) {
            case "SelectedResidentType":
                this.setState({ residentType: value });
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
                        <div className="col-12">
                            <DataGrid
                                Id="grdResidentsPendingApproval"
                                IsPagination={false}
                                ColumnCollection={this.state.gridHeader}
                                Onpageindexchanged={this.onPagechange.bind(this)}
                                onEditMethod={this.ongridedit.bind(this)}
                                onGridViewMethod={this.ongridApprove.bind(this)}
                                onGridDeleteMethod={this.ongridReject.bind(this)}
                                DefaultPagination={true}
                                IsSarching="true"
                                GridData={this.state.gridData}
                            />
                        </div>
                    </div>
                }

                {this.state.PageMode == 'Edit' &&
                    <div>
                        <div>
                            <div className="modal-content">
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-sm-3">
                                            <div className="form-group">
                                                <label htmlFor="residentType">Resident Type</label>
                                                <SelectBox
                                                    ID="dllResidentType"
                                                    Value={this.state.residentType}
                                                    onSelected={this.onSelected.bind(this, "SelectedResidentType")}
                                                    Options={this.state.residentTypeOptions}
                                                    ClassName="form-control" />
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label htmlFor="">Block</label>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <Button
                                        Id="btnSave"
                                        Text="Save"
                                        Action={() => console.log()}
                                        ClassName="btn btn-primary" />
                                    <Button
                                        Id="btnCancel"
                                        Text="Cancel"
                                        Action={() => console.log()}
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
export default connect(mapStoreToprops, mapDispatchToProps)(ResidentPendingApproval);