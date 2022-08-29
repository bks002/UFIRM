import React, { Component } from 'react';
import swal from 'sweetalert';
import { ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';


import * as appCommon from '../../Common/AppCommon';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import UrlProvider from "../../Common/ApiUrlProvider.js";
import ApiProvider from './DataProvider.js';

import departmentActions from '../../redux/department/action';


import Button from '../../ReactComponents/Button/Button.jsx';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';


import TenantBasicDetails from './TenantBasicDetails';
import VehicleDetails from '../PropertyOwnerTenantsCommon/VehicleDetails';
import FamilyMemberDetails from '../PropertyOwnerTenantsCommon/FamilyMemberDetails';
import DocumentsDetails from '../PropertyOwnerTenantsCommon/DocumentsDetails';
import RentAgreement from './RentAgreement';

const $ = window.$;

class PropertyTenant extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ownerFamilyRelationshipdllOptions: [],
            documentTypedllOptions: [],

            // hold tenant details
            tenantDetails: [],
            // hold vehicle details
            vehicleDetails: [],
            // hold family relationship details
            familyMemberDtDetails: [],
            // hold document details            
            documentDtDetails: [],
            // hold rent agreement details
            rentAgreementDetails: [],

            namedocumentTypedllOptions: [{ Id: '', Name: "Select Name" }],
            vehicleParkingdllOptions: [],
        }
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    loadDocumentType(id) {
        this.setState({ documentTypedllOptions: [{ Id: 0, Name: "Select Document Type" }] })
        this.comdbprovider.getDocumentType(id).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let documentTypeData = [{ Id: 0, Name: "Select Document Type" }];
                        rData.forEach(element => {
                            documentTypeData.push({ Id: element.documentTypeId, Name: element.documentTypeName });
                        });
                        this.setState({ documentTypedllOptions: documentTypeData });
                    });
                }
            });
    }

    loadRelationships(id) {
        this.setState({ ownerFamilyRelationshipdllOptions: [{ Id: 0, Name: "Select Relationship" }] })
        this.comdbprovider.getRelationshipType(id).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let relationshipData = [{ Id: 0, Name: "Select Relationship" }];
                        rData.forEach(element => {
                            relationshipData.push({ Id: element.relationshipTypeId, Name: element.relationship });
                        });
                        this.setState({ ownerFamilyRelationshipdllOptions: relationshipData });
                    });
                }
            });
    }

    componentDidMount() {
        this.loadDocumentType(0);
        this.loadRelationships(0);
        this.loadParkingAssignment();
        if (this.props.mode === 'Edit') {
            this.loadEditViewDetails();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.loadParkingAssignment();
        }
    }

    loadParkingAssignment() {
        this.ApiProviderr.getParkingAssignment(parseInt(this.props.PropertyId)).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let data = [];
                        rData.forEach(element => {
                            let val = { value: element.id, label: element.text };
                            data.push(val);
                        });
                        this.setState({ vehicleParkingdllOptions: data })
                    });
                }
            });
    }

    loadEditViewDetails() {
        this.ApiProviderr.getEditViewDetails(this.props.flatId).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        console.log("existing tenant data", rData);
                        if (rData) {
                            if (rData.viewTenantPersonalDetails) {
                                this.setState({ tenantDetails: rData.viewTenantPersonalDetails }, () => this.loadDocumentNamedll());
                            }
                            if (rData.viewTenantRentAgreementDetails) {
                                this.setState({ rentAgreementDetails: rData.viewTenantRentAgreementDetails });
                            }
                            if (rData.viewTenantFamilyMemberDetails) {
                                this.setState({ familyMemberDtDetails: rData.viewTenantFamilyMemberDetails }, () => this.loadDocumentNamedll());
                            }
                            if (rData.viewTenantVehicleDetails) {
                                // this.setState({ vehicleDetails: rData.viewTenantVehicleDetails });
                                let fData = [];
                                rData.viewTenantVehicleDetails.forEach(element => {
                                    let newData = {
                                        id: element.id,
                                        vehicletype: element.vehicletype,
                                        name: element.name,
                                        vehiclenumber: element.vehiclenumber,
                                        parkingId: parseInt(element.parkingId),
                                        parkingDT: element.parkingName,
                                        rowType: 'View'
                                    }
                                    fData.push(newData);
                                });
                                this.setState({ vehicleDetails: fData }, () => console.log(this.state.vehicleDetails))
                            }
                            if (rData.viewTenantDocumentDetails) {
                                this.setState({ documentDtDetails: rData.viewTenantDocumentDetails });
                            }
                        }
                    });
                }
            });
    }

    loadDocumentNamedll() {
        let names = [{ Id: '', Name: "Select Name" }];
        this.state.tenantDetails.forEach(element => {
            names.push({ Id: element.name, Name: element.name });
        });

        this.state.familyMemberDtDetails.forEach(element => {
            names.push({ Id: element.name, Name: element.name });
        });

        this.setState({ namedocumentTypedllOptions: names })
    }
    // get tenant data
    getTenantDetails = (data, originalRowType) => {
        let oldState = this.state.tenantDetails;
        if (data.rowType === 'Update') {
            oldState = oldState.filter(item => item.id !== data.id);
        }

        if (originalRowType === 'Add') {
            data.rowType = 'Add';
        }
        let primaryExist = false;
        if (data.isprimary === "true") {
            primaryExist = oldState.some(x => x.isprimary === "true")
        }

        if (!primaryExist) {
            oldState.push(data);
            this.setState({ tenantDetails: oldState },
                () => {
                    this.loadDocumentNamedll();
                });
        }
        else {
            appCommon.showtextalert("Only one tenant should be primary", "", "error");
        }
    };
    // remove tenant data
    removeTenantDetails = (gridId) => {
        let data = this.state.tenantDetails
        let deletedRow = data.filter(item => item.id === gridId);

        let newList = data;

        if (deletedRow[0].rowType === 'Add') {
            newList = data.filter(item => item.id !== gridId);
            this.setState({ tenantDetails: newList })
        }
        else if (deletedRow[0].rowType === 'Update' && deletedRow[0].isprimary === "false") {
            newList = data.filter(item => item.id !== gridId);
            deletedRow[0].rowType = 'Delete';
            newList.push(deletedRow[0]);
        }
        else if (deletedRow[0].rowType === 'View' && deletedRow[0].isprimary === "false") {
            newList = data.filter(item => item.id !== gridId);
            deletedRow[0].rowType = 'Delete';
            newList.push(deletedRow[0]);
        }
        else {
            appCommon.showtextalert("Primary tenant can not be delete", "", "error");
        }

        this.setState({ tenantDetails: newList },
            () => {
                this.loadDocumentNamedll();
            });
    };
    // get rent agreement data
    getRentAgreementDetails = (data) => {
        let oldState = this.state.rentAgreementDetails;
        oldState.push(data);
        this.setState({ rentAgreementDetails: oldState })
    };
    // remove rent agreement data
    removeRentAgreementDetails = (gridId) => {
        let data = this.state.rentAgreementDetails
        let deletedRow = data.filter(item => item.id == gridId);
        let newList = data.filter(item => item.id !== gridId);

        if (deletedRow[0].rowType === 'Add') {
            this.setState({ rentAgreementDetails: newList })
        }
        else {
            deletedRow[0].rowType = 'Delete';
            newList.push(deletedRow[0]);
        }

        this.setState({ rentAgreementDetails: newList })
    };

    // get vehicle data
    getVehicleDetails = (data) => {
        let oldState = this.state.vehicleDetails;
        oldState.push(data);
        this.setState({ vehicleDetails: oldState })
    };

    // remove vehicle data
    removeVehicleDetails = (gridId) => {
        let data = this.state.vehicleDetails;
        let deletedRow = data.filter(item => item.id == gridId);
        let newList = data.filter(item => item.id !== gridId);

        if (deletedRow[0].rowType === 'Add') {
            this.setState({ vehicleDetails: newList })
        }
        else {
            deletedRow[0].rowType = 'Delete';
            newList.push(deletedRow[0]);
        }

        this.setState({ vehicleDetails: newList })
    };

    // get family member data
    getFamilyMemberDetails = (data) => {
        let oldState = this.state.familyMemberDtDetails;
        oldState.push(data);
        this.setState({ familyMemberDtDetails: oldState }, () => this.loadDocumentNamedll())
    }

    // remove family member data
    removeFamilyMemberDetails = (gridId) => {
        let data = this.state.familyMemberDtDetails;
        let deletedRow = data.filter(item => item.id == gridId);
        let newList = data.filter(item => item.id !== gridId);

        if (deletedRow[0].rowType === 'Add') {
            this.setState({ familyMemberDtDetails: newList })
        }
        else {
            deletedRow[0].rowType = 'Delete';
            newList.push(deletedRow[0]);
        }

        this.setState({ familyMemberDtDetails: newList }, () => this.loadDocumentNamedll())
    }

    // get document data
    getDocumentDetails = (data) => {
        let oldState = this.state.documentDtDetails;
        oldState.push(data);
        this.setState({ documentDtDetails: oldState })
    };

    // remove document data
    removeDocumentDetails = (gridId) => {
        let data = this.state.documentDtDetails;
        let deletedRow = data.filter(item => item.id == gridId);
        let newList = data.filter(item => item.id !== gridId);

        if (deletedRow[0].rowType === 'Add') {
            this.setState({ documentDtDetails: newList })
        }
        else {
            deletedRow[0].rowType = 'Delete';
            newList.push(deletedRow[0]);
        }

        this.setState({ documentDtDetails: newList })
    };

    onCancel = () => {
        this.props.handleCancel()
    }

    onSave = () => {
        if (this.state.tenantDetails.length > 0 && this.state.rentAgreementDetails.length > 0) {
            let primaryExist = this.state.tenantDetails.some(x => x.isprimary === "true");
            if (primaryExist) {
                if (this.state.documentDtDetails.length > 0) {
                    var type = 'TC';
                    var model = this.getModel(type,);
                    console.log(model[0]);
                    this.managePropertyMember(model, type);
                }
                else {
                    appCommon.showtextalert(`At least one document should be add `, "", "error");
                }
            }
            else
                appCommon.showtextalert(`At least one tenant should be primary `, "", "error");

        }
        else {
            appCommon.showtextalert(`At least one tenant, rent agreement and document should be add `, "", "error");
        }
    }

    getModel = (type) => {
        var model = [];
        switch (type) {
            case 'TC':
                model.push({
                    "cmdType": this.props.mode,
                    "flatId": parseInt(this.props.flatId),
                    "addTenantDetails": this.state.tenantDetails,
                    "addTenantRentAgreementDetails": this.state.rentAgreementDetails,
                    "addTenantVehicleDetails": this.state.vehicleDetails,
                    "addTenantFamilyMemberDetails": this.state.familyMemberDtDetails,
                    "addTenantDocumentDetails": this.state.documentDtDetails,
                });
                break;
            default:
        };
        return model;
    }

    managePropertyMember = (model, type, Id) => {
        this.ApiProviderr.managePropertyMember(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'TC':
                                console.log(rData);
                                if (rData > 0) {
                                    appCommon.showtextalert("Propery Member Added Successfully!", "", "success");
                                    this.onCancel();
                                }
                                else {
                                    // appCommon.showtextalert("Propery Member Deleted Successfully !", "", "error");
                                }
                                break;
                            default:
                        }
                    });
                }
            });
    }

    render() {
        return (
            <div>
                <div className="card card-default">
                    <div className="card-header">
                        <h3 className="card-title" style={{ fontWeight: "bold" }}>Flat/Shop Number : {this.props.flatNumber}</h3>
                    </div>
                </div>

                <TenantBasicDetails
                    getTenantDetails={this.getTenantDetails.bind(this)}
                    mode={this.props.mode}
                    flatId={this.props.flatId}
                    tenantDetails={this.state.tenantDetails}
                    removeTenantDetails={this.removeTenantDetails.bind(this)}
                />

                <RentAgreement
                    getRentAgreementDetails={this.getRentAgreementDetails.bind(this)}
                    removeRentAgreementDetails={this.removeRentAgreementDetails.bind(this)}
                    mode={this.props.mode}
                    flatId={this.props.flatId}
                    rentAgreementDetails={this.state.rentAgreementDetails}
                />
                <VehicleDetails
                    parkingDll={this.state.vehicleParkingdllOptions}
                    getVehicleDetails={this.getVehicleDetails.bind(this)}
                    mode={this.props.mode}
                    flatId={this.props.flatId}
                    vehicleDetails={this.state.vehicleDetails}
                    removeVehicleDetails={this.removeVehicleDetails.bind(this)}
                />
                <FamilyMemberDetails
                    ownerFamilyRelationshipdllOptions={this.state.ownerFamilyRelationshipdllOptions}
                    getFamilyMemberDetails={this.getFamilyMemberDetails.bind(this)}
                    mode={this.props.mode}
                    flatId={this.props.flatId}
                    familyMemberDtDetails={this.state.familyMemberDtDetails}
                    removeFamilyMemberDetails={this.removeFamilyMemberDetails.bind(this)}
                />
                <DocumentsDetails
                    namedocumentTypedllOptions={this.state.namedocumentTypedllOptions}
                    documentTypedllOptions={this.state.documentTypedllOptions}
                    getDocumentDetails={this.getDocumentDetails.bind(this)}
                    mode={this.props.mode}
                    flatId={this.props.flatId}
                    documentDtDetails={this.state.documentDtDetails}
                    removeDocumentDetails={this.removeDocumentDetails.bind(this)}
                />

                <div className="card card-primary">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-sm-12 text-right">
                                <Button
                                    Id="btnSave"
                                    Text="Save Tenant"
                                    Action={this.onSave.bind(this)}
                                    ClassName="btn btn-primary mr-2" />
                                <Button
                                    Id="btnCancel"
                                    Text="Back to Tenant List"
                                    Action={this.onCancel.bind(this)}
                                    ClassName="btn btn-secondary" />
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
            </div>
        );
    }
}
PropertyTenant.defaultProps = {
    flatId: 1, //
    flatNumber: 'Abc',
    mode: 'Add', // Edit
}

function mapStoreToprops(state, props) {
    return {
        PropertyId: state.Commonreducer.puidn,
    }
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentActions, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(PropertyTenant);
