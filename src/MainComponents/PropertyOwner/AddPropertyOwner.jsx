import React, { Component, Fragment } from 'react';
import swal from 'sweetalert';
import { ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';


import * as appCommon from '../../Common/AppCommon';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import UrlProvider from "../../Common/ApiUrlProvider.js";
import ApiProvider from './DataProvider.js';
import { CreateValidator, ValidateControls, CreateSecondaryValidator, SecondaryValidateControls } from './Validation';
import { VALIDATION_ERROR, DELETE_CONFIRMATION_MSG } from '../../Contants/Common.js';

import departmentActions from '../../redux/department/action';
import { promiseWrapper } from '../../utility/common';

import Button from '../../ReactComponents/Button/Button.jsx';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';


import InputDate from '../NoticeBoard/InputDate';
import FileUpload from '../NoticeBoard/FileUpload';
import { ShowImageModal } from '../KanbanBoard/ImageModal';

import VehicleDetails from '../PropertyOwnerTenantsCommon/VehicleDetails';
import FamilyMemberDetails from '../PropertyOwnerTenantsCommon/FamilyMemberDetails';
import DocumentsDetails from '../PropertyOwnerTenantsCommon/DocumentsDetails';

const $ = window.$;

class AddPropertyOwner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ownershipTypeId: 0, ownershipTypedllOptions: [{ Id: 0, Name: "Select Ownership Type" }],
            ownerResidingId: 0, ownerResidingdllOptions: [
                { Id: '', Name: "Select Owner Residing" },
                { Id: 1, Name: "Yes" },
                { Id: 0, Name: "No" }
            ],

            genderdllOptions: [
                { Id: '', Name: "Select Gender" },
                { Id: 'Male', Name: "Male" },
                { Id: 'Female', Name: "Female" },
                { Id: 'Other', Name: "Other" }
            ],

            ownerRegistationDate: '',

            isShowSecondaryOwner: false,
            PrimaryOwnerId: 0,
            PrimaryOwnerName: '',
            PrimaryOwnerMobileNumber: '',
            PrimaryOwnerEmail: '',
            selectedPrimaryOwnerGender: '',
            selectedPrimaryOwnerFileName: null,
            editModePrimaryOwnerImgName: '',
            editModePrimaryOwnerImgFile: '',

            SecondaryOwnerId: 0,
            SecondaryOwnerName: '',
            SecondaryOwnerMobileNumber: '',
            SecondaryOwnerEmail: '',
            selectedSecondaryOwnerGender: '',
            selectedSecondaryOwnerFileName: null,
            editModeSecondaryOwnerImgName: '',
            editModeSecondaryOwnerImgFile: '',


            vehicleDetails: [],

            ownerFamilyRelationshipdllOptions: [],
            familyMemberDtDetails: [],

            documentTypedllOptions: [],
            documentDtDetails: [],

            namedocumentTypedllOptions: [{ Id: '', Name: "Select Name" }],

            finalOwnerPersonalDetail: [],
            finalOwnerVehicleDetails: [],
            finalOwnerFamilyMemberDetail: [],
            finalOwnerDocumentDetail: [],

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

    async loadOwnershipType() {
        await this.comdbprovider.getOwnershipType(0).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let ownershipTypeData = [{ Id: 0, Name: "Select Ownership Type" }];
                        rData.forEach(element => {
                            ownershipTypeData.push({ Id: element.ownershipTypeId, Name: element.ownership });
                        });
                        this.setState({ ownershipTypedllOptions: ownershipTypeData });
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

    async componentDidMount() {
        // load ownership type data
        await this.loadOwnershipType();
        this.loadRelationships(0);
        this.loadDocumentType(0);
        this.loadParkingAssignment();

        if (this.props.mode === 'Edit') {
            this.loadEditViewDetails();
        }
    }

    loadEditViewDetails() {
        this.ApiProviderr.getEditViewDetails(this.props.flatId).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        if (rData.viewOwnerPersonalDetails) {
                            if (rData.viewOwnerPersonalDetails[0]) {
                                this.setState({
                                    PrimaryOwnerId: rData.viewOwnerPersonalDetails[0].id,
                                    PrimaryOwnerName: rData.viewOwnerPersonalDetails[0].name,
                                    PrimaryOwnerMobileNumber: rData.viewOwnerPersonalDetails[0].mobilenumber,
                                    PrimaryOwnerEmail: rData.viewOwnerPersonalDetails[0].email,
                                    selectedPrimaryOwnerGender: rData.viewOwnerPersonalDetails[0].gender,
                                    editModePrimaryOwnerImgName: rData.viewOwnerPersonalDetails[0].oldImgName,
                                    editModePrimaryOwnerImgFile: rData.viewOwnerPersonalDetails[0].profileurl,

                                    ownershipTypeId: parseInt(rData.viewOwnerPersonalDetails[0].ownershiptypeid),
                                    ownerRegistationDate: rData.viewOwnerPersonalDetails[0].registrationdate,
                                    ownerResidingId: parseInt(rData.viewOwnerPersonalDetails[0].isresiding),
                                }, () => {
                                    this.loadDocumentNamedll();
                                })
                            }
                            if (rData.viewOwnerPersonalDetails[1]) {
                                this.setState({
                                    isShowSecondaryOwner: true,
                                    SecondaryOwnerId: rData.viewOwnerPersonalDetails[1].id,
                                    SecondaryOwnerName: rData.viewOwnerPersonalDetails[1].name,
                                    SecondaryOwnerMobileNumber: rData.viewOwnerPersonalDetails[1].mobilenumber,
                                    SecondaryOwnerEmail: rData.viewOwnerPersonalDetails[1].email,
                                    selectedSecondaryOwnerGender: rData.viewOwnerPersonalDetails[1].gender,
                                    editModeSecondaryOwnerImgName: rData.viewOwnerPersonalDetails[1].oldImgName,
                                    editModeSecondaryOwnerImgFile: rData.viewOwnerPersonalDetails[1].profileurl,
                                }, () => this.loadDocumentNamedll())
                            }
                            if (rData.viewOwnerVehicleDetails) {
                                let fData = [];
                                rData.viewOwnerVehicleDetails.forEach(element => {
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
                            if (rData.viewOwnerDocumentDetails) {
                                let fdata = [];
                                rData.viewOwnerDocumentDetails.forEach(element => {
                                    let newData = {
                                        id: element.id,
                                        type: element.documentType,
                                        name: element.name,
                                        filename: element.oldDocName,
                                        editDocUrl: element.url,
                                        filedata: null,
                                        typeid: parseInt(element.typeid),
                                        documentnumber: element.documentnumber,
                                        rowType: 'View'
                                    }
                                    fdata.push(newData);
                                });
                                this.setState({ documentDtDetails: fdata })
                            }
                            if (rData.viewOwnerFamilyMemberDetails) {
                                let fData = [];
                                rData.viewOwnerFamilyMemberDetails.forEach(element => {
                                    let newData = {
                                        id: element.id,
                                        name: element.name,
                                        gender: element.gender,
                                        mobilenumber: element.mobilenumber,
                                        email: element.email,
                                        relation: element.relationship,
                                        relationshipid: parseInt(element.relationshipid),
                                        rowType: 'View'
                                    }
                                    fData.push(newData);
                                });
                                this.setState({ familyMemberDtDetails: fData })
                            }
                        }
                    });
                }
            });
    }

    loadDocumentNamedll() {
        let names = [{ Id: '', Name: "Select Name" }];
        if (this.state.PrimaryOwnerName !== "") {
            names.push({ Id: this.state.PrimaryOwnerName, Name: this.state.PrimaryOwnerName });
        }

        if (this.state.SecondaryOwnerName !== "") {
            names.push({ Id: this.state.SecondaryOwnerName, Name: this.state.SecondaryOwnerName });
        }
        if (this.props.mode === 'Edit') {
            if (this.state.familyMemberDtDetails.length > 0) {
                this.state.familyMemberDtDetails.forEach(element => {
                    names.push({ Id: element.name, Name: element.name });
                });
            }
        }
        else if (this.props.mode === 'Add') {
            if (this.state.familyMemberDtDetails.length > 0) {
                this.state.familyMemberDtDetails.forEach(element => {
                    names.push({ Id: element.name, Name: element.name });
                });
            }
        }
        let pp = names.filter((ele, ind) => ind === names.findIndex(elem => elem.Name === ele.Name))
        // console.log(pp);
        this.setState({ namedocumentTypedllOptions: names })
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

    componentDidUpdate(prevProps) {
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.loadParkingAssignment();
        }
    }

    // Dropdown value set
    onSelected(name, value) {
        switch (name) {
            case "Ownershiptype":
                this.setState({ ownershipTypeId: value }
                    , () => parseInt(value) === 2 ? this.setState({ isShowSecondaryOwner: true })
                        : this.setState({ isShowSecondaryOwner: false }, () => this.setState({
                            selectedSecondaryOwnerFileName: null,
                            SecondaryOwnerName: '',
                            SecondaryOwnerMobileNumber: '',
                            SecondaryOwnerEmail: '',
                        }))
                )
                break;
            case "OwnerResidingStatus":
                this.setState({ ownerResidingId: value })
                break;
            case "PrimaryOwnerGender":
                this.setState({ selectedPrimaryOwnerGender: value })
                break;
            case "SecondaryOwnerGender":
                this.setState({ selectedSecondaryOwnerGender: value })
                break;
            default:
        }
    }
    // textbox value set some condition not used
    updatetextmodel = (ctrl, val) => {
        if (ctrl == 'RegistrationDate') {
            this.setState({ ownerRegistationDate: val });
        }
        else if (ctrl == 'PrimaryOwnerName') {
            this.setState({ PrimaryOwnerName: val }, () => {
                let names = [{ Id: '', Name: "Select Name" }];
                if (this.state.PrimaryOwnerName !== "") {
                    names.push({ Id: this.state.PrimaryOwnerName, Name: this.state.PrimaryOwnerName });
                }

                if (this.state.SecondaryOwnerName !== "") {
                    names.push({ Id: this.state.SecondaryOwnerName, Name: this.state.SecondaryOwnerName });
                }

                if (this.state.familyMemberDtDetails.length > 1) {
                    this.state.familyMemberDtDetails.forEach(element => {
                        names.push({ Id: element.name, Name: element.name });
                    });
                }
                this.setState({ namedocumentTypedllOptions: names })
            });
        }
        else if (ctrl == 'PrimaryOwenrMobileNumber') {
            this.setState({ PrimaryOwnerMobileNumber: val });
        }
        else if (ctrl == 'PrimaryOwnerEmail') {
            this.setState({ PrimaryOwnerEmail: val });
        }
        else if (ctrl == 'SecondaryOwenrMobileNumber') {
            this.setState({ SecondaryOwnerMobileNumber: val });
        }
        else if (ctrl == 'SecondaryOwnerEmail') {
            this.setState({ SecondaryOwnerEmail: val });
        }
        else if (ctrl == 'SecondaryOwnerName') {
            this.setState({ SecondaryOwnerName: val }, () => {
                let names = [{ Id: '', Name: "Select Name" }];

                if (this.state.PrimaryOwnerName !== "") {
                    names.push({ Id: this.state.PrimaryOwnerName, Name: this.state.PrimaryOwnerName });
                }

                if (this.state.SecondaryOwnerName !== "") {
                    names.push({ Id: this.state.SecondaryOwnerName, Name: this.state.SecondaryOwnerName });
                }

                if (this.state.familyMemberDtDetails.length > 1) {
                    this.state.familyMemberDtDetails.forEach(element => {
                        names.push({ Id: element.name, Name: element.name });
                    });
                }
                this.setState({ namedocumentTypedllOptions: names })
            });
        }
    }
    // Files upload and remove
    // Primary owner image On file Change
    onPrimaryOwnerImgFileChange(data) {
        if (data !== null) {
            let _validFileExtensions = ["jpg", "jpeg", "png"];
            let isvalidFiletype = _validFileExtensions.some(x => x === data.extension);
            if (isvalidFiletype) {
                this.setState({ selectedPrimaryOwnerFileName: data });
            }
            else {
                let temp_validFileExtensions = _validFileExtensions.join(',');
                appCommon.showtextalert(`${data.filename} Invalid file type, Please Select only ${temp_validFileExtensions} `, "", "error");
            }
        }
    };

    RemovePrimaryOwnerImgFile = (x) => {
        this.setState({ selectedPrimaryOwnerFileName: null })
    }
    // Primary owner image On file Change
    onSecondaryOwnerImgFileChange(data) {
        if (data !== null) {
            let _validFileExtensions = ["jpg", "jpeg", "png"];
            let isvalidFiletype = _validFileExtensions.some(x => x === data.extension);
            if (isvalidFiletype) {
                this.setState({ selectedSecondaryOwnerFileName: data });
            }
            else {
                let temp_validFileExtensions = _validFileExtensions.join(',');
                appCommon.showtextalert(`${data.filename} Invalid file type, Please Select only ${temp_validFileExtensions} `, "", "error");
            }
        }
    };

    RemoveSecondaryOwnerImgFile = (x) => {
        this.setState({ selectedSecondaryOwnerFileName: null })
    }

    // show image 
    showImage = (filename, src, type, extension) => {
        this.setState({ showImagefilename: filename, showImagefile: src, showImagefiletype: type, extension: extension },
            () => {
                $('#modal-lg-img').modal('show')
            })
    }

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
        CreateValidator();
        if (ValidateControls()) {
            let OwnerDetails = [];
            if (this.props.mode === 'Add') {
                let PrimaryOwner = {
                    "id": 0,
                    "name": this.state.PrimaryOwnerName,
                    "gender": this.state.selectedPrimaryOwnerGender,
                    "mobilenumber": this.state.PrimaryOwnerMobileNumber,
                    "email": this.state.PrimaryOwnerEmail,
                    "profileurl": this.state.selectedPrimaryOwnerFileName,
                    "isprimary": "true",
                    "rowType": 'Add'
                }
                OwnerDetails.push(PrimaryOwner);
                if (this.state.isShowSecondaryOwner) {
                    let secondayOwner =
                    {
                        "id": 0,
                        "name": this.state.SecondaryOwnerName,
                        "gender": this.state.selectedSecondaryOwnerGender,
                        "mobilenumber": this.state.SecondaryOwnerMobileNumber,
                        "email": this.state.SecondaryOwnerEmail,
                        "profileurl": this.state.selectedSecondaryOwnerFileName,
                        "isprimary": "false",
                        "rowType": 'Add'
                    }
                    OwnerDetails.push(secondayOwner);
                }
            }
            if (this.props.mode === 'Edit') {
                let PrimaryOwner = {
                    "id": this.state.PrimaryOwnerId,
                    "name": this.state.PrimaryOwnerName,
                    "gender": this.state.selectedPrimaryOwnerGender,
                    "mobilenumber": this.state.PrimaryOwnerMobileNumber,
                    "email": this.state.PrimaryOwnerEmail,
                    "profileurl": this.state.selectedPrimaryOwnerFileName,
                    "isprimary": "true",
                    "oldImgName": this.state.editModePrimaryOwnerImgName,

                }
                OwnerDetails.push(PrimaryOwner);
                if (this.state.isShowSecondaryOwner) {
                    let secondayOwner =
                    {
                        "id": this.state.SecondaryOwnerId,
                        "name": this.state.SecondaryOwnerName,
                        "gender": this.state.selectedSecondaryOwnerGender,
                        "mobilenumber": this.state.SecondaryOwnerMobileNumber,
                        "email": this.state.SecondaryOwnerEmail,
                        "profileurl": this.state.selectedSecondaryOwnerFileName,
                        "isprimary": "false",
                        "oldImgName": this.state.editModeSecondaryOwnerImgName,
                    }
                    OwnerDetails.push(secondayOwner);
                }
            }
            if (this.state.isShowSecondaryOwner) {
                CreateSecondaryValidator();
                if (SecondaryValidateControls()) {
                    if (this.state.PrimaryOwnerName.toLocaleLowerCase() !== this.state.SecondaryOwnerName.toLocaleLowerCase()) {
                        if (this.state.documentDtDetails.length > 0) {
                            this.setState({
                                finalOwnerPersonalDetail: OwnerDetails
                            }, () => {
                                var type = 'OC';
                                var model = this.getModel(type);
                                console.log(model[0]);
                                this.managePropertyMember(model, type);
                            })
                        }
                        else {
                            appCommon.showtextalert(`At least one document should be add `, "", "error");
                        }
                    }
                    else
                        appCommon.showtextalert(`Primary and Secondary owner name should be different `, "", "error");
                }
            }
            else {
                if (this.state.documentDtDetails.length > 0) {
                    this.setState({
                        finalOwnerPersonalDetail: OwnerDetails
                    }, () => {
                        var type = 'OC';
                        var model = this.getModel(type);
                        console.log(model[0]);
                        this.managePropertyMember(model, type);
                    })
                }
                else {
                    appCommon.showtextalert(`At least one document should be add `, "", "error");
                }
            }
        }
    }

    managePropertyMember = (model, type, Id) => {
        this.ApiProviderr.managePropertyMember(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'OC':
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

    getModel = (type) => {
        var model = [];
        switch (type) {
            case 'OC':
                model.push({
                    "cmdType": this.props.mode,
                    "flatId": parseInt(this.props.flatId),
                    "ownershipId": parseInt(this.state.ownershipTypeId),
                    "registrationDate": this.state.ownerRegistationDate,
                    "ownerResiding": parseInt(this.state.ownerResidingId),
                    "addOwnerPersonalDetails": this.state.finalOwnerPersonalDetail,
                    "addOwnerVehicleDetails": this.state.vehicleDetails,
                    "addOwnerFamilyMemberDetails": this.state.familyMemberDtDetails,
                    "addOwnerDocumentDetails": this.state.documentDtDetails,
                });
                break;
            default:
        };
        return model;
    }

    // PrimaryOwnerName value set
    onChangePrimaryOwnerName = (e) => {
        this.setState({ PrimaryOwnerName: e.target.value }, () => {
            this.loadDocumentNamedll();
        });

    }
    // SecondaryOwnerName value set
    onChangeSecondaryOwnerName = (e) => {
        this.setState({ SecondaryOwnerName: e.target.value }, () => {
            this.loadDocumentNamedll();
        });
    }

    render() {
        return (
            <div>
                <ShowImageModal
                    Id="modal-lg-img"
                    titile={this.state.showImagefilename}
                    showImagefiletype={this.state.showImagefiletype}
                    showImagefile={this.state.showImagefile}
                    extension={this.state.extension}
                />
                <div className="card card-default">
                    <div className="card-header">
                        <h3 className="card-title" style={{ fontWeight: "bold" }}>Flat/Shop Number : {this.props.flatNumber}</h3>
                    </div>
                </div>

                <div className="card card-primary">
                    <div className="card-header">
                        <h3 className="card-title">Owner Information</h3>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-sm-4">
                                <div className="form-group">
                                    <label htmlFor="dllOwnershiptype">Ownership Type</label>
                                    <SelectBox
                                        Value={this.state.ownershipTypeId}
                                        ID="dllOwnershiptype"
                                        onSelected={this.onSelected.bind(this, "Ownershiptype")}
                                        Options={this.state.ownershipTypedllOptions}
                                        ClassName="form-control "
                                        disabled={this.props.mode === 'Edit' ? true : false}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-4">
                                <div className="form-group">
                                    <label htmlFor="txtRegistrationDate">Registration Date</label>
                                    <InputDate
                                        Id='txtRegistrationDate'
                                        DateFormate="dd/mm/yyyy"
                                        value={this.state.ownerRegistationDate}
                                        handleOnchage={this.updatetextmodel.bind(this, "RegistrationDate")}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-4">
                                <div className="form-group">
                                    <label htmlFor="dllOwnerResidingStatus">Residing Status</label>
                                    <SelectBox
                                        Value={this.state.ownerResidingId}
                                        ID="dllOwnerResidingStatus"
                                        onSelected={this.onSelected.bind(this, "OwnerResidingStatus")}
                                        Options={this.state.ownerResidingdllOptions}
                                        ClassName="form-control "
                                        disabled={this.props.occupancyStatus === 'Tenant Residing' ? true : false}
                                    />
                                </div>
                            </div>
                        </div>
                        <hr></hr>
                        <h5>Owner-1(Primary)</h5>
                        <div className="row">
                            <div className="col-sm-3">
                                <div className="form-group">
                                    <label htmlFor="txtPrimaryOwenrName">Name</label>
                                    <input
                                        type="text"
                                        id="txtPrimaryOwenrName"
                                        placeholder="Primary Owner Name"
                                        className="form-control"
                                        value={this.state.PrimaryOwnerName}
                                        onChange={this.onChangePrimaryOwnerName.bind(this)}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <div className="form-group">
                                    <label htmlFor="ddlPrimaryOwnerGender">Gender </label>
                                    <SelectBox
                                        Value={this.state.selectedPrimaryOwnerGender}
                                        ID="ddlPrimaryOwnerGender"
                                        ClassName="form-control "
                                        onSelected={this.onSelected.bind(this, "PrimaryOwnerGender")}
                                        Options={this.state.genderdllOptions}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <div className="form-group">
                                    <label htmlFor="txtPrimaryOwenrMobileNumber">Mobile Number</label>
                                    <input
                                        type="text"
                                        id="txtPrimaryOwenrMobileNumber"
                                        placeholder="Primary Owner Mobile Number"
                                        className="form-control"
                                        value={this.state.PrimaryOwnerMobileNumber}
                                        onChange={(e) => this.setState({ PrimaryOwnerMobileNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <div className="form-group">
                                    <label htmlFor="txtPrimaryOwenrEmail">Email</label>
                                    {/* <InputBox
                                        Type="email"
                                        Id="txtPrimaryOwenrEmail"
                                        PlaceHolder="Primary Owner Email"
                                        className="form-control"
                                        value={this.state.SecondaryOwnerEmail}
                                        onChange={this.updatetextmodel.bind(this, "PrimaryOwnerEmail")}
                                    /> */}
                                    <input
                                        type="text"
                                        id="txtPrimaryOwenrEmail"
                                        placeholder="Primary Owner Email"
                                        className="form-control"
                                        value={this.state.PrimaryOwnerEmail}
                                        onChange={(e) => this.setState({ PrimaryOwnerEmail: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <div className="form-group">
                                    <label htmlFor="filePrimaryOwenrImage">Profile Picture</label>
                                    <FileUpload
                                        id="filePrimaryOwenrImage"
                                        onChange={this.onPrimaryOwnerImgFileChange.bind(this)}
                                        className="custom-file-input d-none"
                                    />
                                </div>
                            </div>
                            <div className="col-sm-2">
                                <div className="form-group">
                                    {
                                        this.state.selectedPrimaryOwnerFileName ? (
                                            <div className="artist-collection-photo">
                                                <div>
                                                    <button
                                                        className="close"
                                                        type="button"
                                                        onClick={this.RemovePrimaryOwnerImgFile.bind(this, this.state.selectedPrimaryOwnerFileName.filename)}>
                                                        ×</button>
                                                </div>
                                                <img style={{ height: "80px" }}
                                                    alt={this.state.selectedPrimaryOwnerFileName.filename}
                                                    className="img-thumbnail"
                                                    src={`${this.state.selectedPrimaryOwnerFileName.fileType},${this.state.selectedPrimaryOwnerFileName.filepath}`}
                                                    title={this.state.selectedPrimaryOwnerFileName.filename}
                                                    onClick={this.showImage.bind(this, this.state.selectedPrimaryOwnerFileName.filename, this.state.selectedPrimaryOwnerFileName.filepath, this.state.selectedPrimaryOwnerFileName.fileType, this.state.selectedPrimaryOwnerFileName.extension)}
                                                />
                                            </div>
                                        ) :
                                            this.props.mode === 'Edit' ?
                                                <div className="artist-collection-photo">
                                                    <img style={{ height: "80px" }}
                                                        alt={this.state.editModePrimaryOwnerImgName}
                                                        className="img-thumbnail"
                                                        src={`${this.state.editModePrimaryOwnerImgFile}`}
                                                        title={this.state.editModePrimaryOwnerImgName}
                                                        onClick={this.showImage.bind(this, this.state.editModePrimaryOwnerImgName, this.state.editModePrimaryOwnerImgFile, null, '')}
                                                    />
                                                </div> : null
                                    }
                                </div>
                            </div>
                        </div>
                        {
                            this.state.isShowSecondaryOwner ?
                                (
                                    <Fragment>
                                        <hr></hr>
                                        <h5>Owner-2(Secondary)</h5>
                                        <div className="row">
                                            <div className="col-sm-3">
                                                <div className="form-group">
                                                    <label htmlFor="txtSecondaryOwenrName">Name</label>
                                                    <input
                                                        type="text"
                                                        id="txtSecondaryOwenrName"
                                                        placeholder="Secondary Owner Name"
                                                        className="form-control"
                                                        value={this.state.SecondaryOwnerName}
                                                        onChange={this.onChangeSecondaryOwnerName.bind(this)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-3">
                                                <div className="form-group">
                                                    <label htmlFor="ddlSecondaryOwnerGender">Gender </label>
                                                    <SelectBox
                                                        Value={this.state.selectedSecondaryOwnerGender}
                                                        ID="ddlSecondaryOwnerGender"
                                                        ClassName="form-control "
                                                        onSelected={this.onSelected.bind(this, "SecondaryOwnerGender")}
                                                        Options={this.state.genderdllOptions}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-3">
                                                <div className="form-group">
                                                    <label htmlFor="txtSecondaryOwenrMobileNumber">Mobile Number</label>
                                                    <input
                                                        type="text"
                                                        id="txtSecondaryOwenrMobileNumber"
                                                        placeholder="Secondary Owner Mobile Number"
                                                        className="form-control"
                                                        value={this.state.SecondaryOwnerMobileNumber}
                                                        onChange={(e) => this.setState({ SecondaryOwnerMobileNumber: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-3">
                                                <div className="form-group">
                                                    <label htmlFor="txtSecondaryOwenrEmail">Email</label>
                                                    {/* <InputBox
                                                        Type="email"
                                                        Id="txtSecondaryOwenrEmail"
                                                        PlaceHolder="Secondary Owner Email"
                                                        className="form-control"
                                                        value={this.state.SecondaryOwnerEmail}
                                                        onChange={this.updatetextmodel.bind(this, "SecondaryOwnerEmail")}
                                                    /> */}
                                                    <input
                                                        type="text"
                                                        id="txtSecondaryOwenrEmail"
                                                        placeholder="Secondary Owner Email"
                                                        className="form-control"
                                                        value={this.state.SecondaryOwnerEmail}
                                                        onChange={(e) => this.setState({ SecondaryOwnerEmail: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-3">
                                                <div className="form-group">
                                                    <label htmlFor="fileSecondaryOwenrImage">Profile Picture</label>
                                                    <FileUpload
                                                        id="fileSecondaryOwenrImage"
                                                        onChange={this.onSecondaryOwnerImgFileChange.bind(this)}
                                                        className="custom-file-input d-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-2">
                                                <div className="form-group">
                                                    {
                                                        this.state.selectedSecondaryOwnerFileName ? (
                                                            <div className="artist-collection-photo">
                                                                <div>
                                                                    <button
                                                                        className="close"
                                                                        type="button"
                                                                        onClick={this.RemoveSecondaryOwnerImgFile.bind(this, this.state.selectedSecondaryOwnerFileName.filename)}>
                                                                        ×</button>
                                                                </div>
                                                                <img style={{ height: "80px" }}
                                                                    alt={this.state.selectedSecondaryOwnerFileName.filename}
                                                                    className="img-thumbnail"
                                                                    src={`${this.state.selectedSecondaryOwnerFileName.fileType},${this.state.selectedSecondaryOwnerFileName.filepath}`}
                                                                    title={this.state.selectedSecondaryOwnerFileName.filename}
                                                                    onClick={this.showImage.bind(this, this.state.selectedSecondaryOwnerFileName.filename, this.state.selectedSecondaryOwnerFileName.filepath, this.state.selectedSecondaryOwnerFileName.fileType, this.state.selectedSecondaryOwnerFileName.extension)}
                                                                />
                                                            </div>
                                                        ) :
                                                            this.props.mode === 'Edit' ?
                                                                <div className="artist-collection-photo">
                                                                    <img style={{ height: "80px" }}
                                                                        alt={this.state.editModeSecondaryOwnerImgName}
                                                                        className="img-thumbnail"
                                                                        src={`${this.state.editModeSecondaryOwnerImgFile}`}
                                                                        title={this.state.editModeSecondaryOwnerImgName}
                                                                        onClick={this.showImage.bind(this, this.state.editModeSecondaryOwnerImgName, this.state.editModeSecondaryOwnerImgFile, null, '')}
                                                                    />
                                                                </div> : null
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </Fragment>
                                ) : null
                        }

                    </div>
                </div>

                <VehicleDetails
                    ownerResidingId={this.state.ownerResidingId}
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
                                    Text="Save Owner"
                                    Action={this.onSave.bind(this)}
                                    ClassName="btn btn-primary mr-2" />
                                <Button
                                    Id="btnCancel"
                                    Text="Back to Owner List"
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
            </div >
        );
    }
}

AddPropertyOwner.defaultProps = {
    flatId: 1, //40
    flatNumber: 'Abc',
    mode: 'Add', // Edit
    occupancyStatus: ''
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
export default connect(mapStoreToprops, mapDispatchToProps)(AddPropertyOwner);
