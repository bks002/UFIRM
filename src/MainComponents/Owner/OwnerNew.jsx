import React from 'react';
import Button from '../../ReactComponents/Button/Button.jsx';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import DropDownComponent from '../../ReactComponents/Dropdown/DropDownComponent.jsx';
import DocumentUploader from '../../ReactComponents/FileUploader/DocumentUploader.jsx';
import PicUploader from '../../ReactComponents/FileUploader/PicUploader.jsx';
// import departmentactions from '../../Redux/department/actions.js';
import HomeContainer from '../../AppContainers/home/homecontainer.jsx';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import TextAria from '../../ReactComponents/TextAreaBox/TextAreaBox.jsx';
import OwnerBL from '../../ComponentBL/OwnerBL';
import DocumentBL from '../../ComponentBL/DocumentBL';
import ParkingBL from '../../ComponentBL/ParkingBL';
// import ToastNotify from '../../ReactComponents/ToastNotify/ToastNotify.jsx';
import { ToastContainer, toast } from 'react-toastify';
import * as appCommon from '../../Common/AppCommon';
import { VALIDATION_ERROR } from '../../Contants/Common.js';
import swal from 'sweetalert';
import departmentActions from '../../redux/department/action';
import { connect } from 'react-redux';
import { promiseWrapper } from '../../utility/common';
import { bindActionCreators } from 'redux';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';
import UrlProvider from "../../Common/ApiUrlProvider.js";
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import ImageUploader from 'react-images-upload';
import axios from 'axios';
import MultiSelect from '../../ReactComponents/MultiSelect/MultiSelect.jsx';
import './Owner.css';

const $ = window.$;
const ownerBL = new OwnerBL();
const documentBL = new DocumentBL();
const parkingBL = new ParkingBL();

class OwnerNew extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pictures: null,

            // pageSize: 10,
            // pageNumber: 1,
            gridHeader: [
                { sTitle: 'Document Type Id', titleValue: 'documentTypeId', "orderable": false },
                { sTitle: 'property Member Dcoument Id', titleValue: 'propertyMemberDcoumentId', "orderable": false, },
                { sTitle: 'Property Member Id', titleValue: 'propertyMemberId', "orderable": false },
                { sTitle: 'Document Type Name', titleValue: 'documentTypeName', "orderable": false, },
                { sTitle: 'Document Name', titleValue: 'documentName', "orderable": false, },
                { sTitle: 'Document Url', titleValue: 'documentURL', "orderable": false, },
                { sTitle: 'Action', titleValue: 'Action', Action: "DownloadNDelete", Index: '0', urlIndex: '5', "orderable": false }
            ],
            gridParkingHeader: [
                { sTitle: 'Id', titleValue: 'parkingId', "orderable": false, "visible": true },
                { sTitle: 'Vehicle Type', titleValue: 'vehicleType', "orderable": false },
                { sTitle: 'Vehicle Number', titleValue: 'vehicleNumber', "orderable": false },
                { sTitle: 'Sticker Number', titleValue: 'stickerNumber', "orderable": false },
                { sTitle: 'Action', titleValue: 'Action', Action: "Delete", Index: '0', "orderable": false }
            ],
            gridParkingData: [],
            grdTotalRows: 0,
            grdTotalPages: 0,
            gridData: [],
            pagemode: 'new',
            Value: [],
            setSelectedOptions: [],
            societyId:"0",

            //ParkingArea
            parkingArea: [],
            parkingAreaId: "0",
            parkingName: [],
            parkingNameId: "0",
            VehicleNumber: "",
            StickerNumber: "",
            vehicleType: [],
            vehicleTypeId: "0",

            //Document field
            documentType: [],
            documentTypeId: "0",
            // documentTypeName: "",
            documentNumber: "",


            //Document file
            selectedFile: undefined,
            selectedFileName: undefined,
            imageSrc: undefined,
            value: ''

        }
        this.onDrop = this.onDrop.bind(this);
        this.removeImage = this.removeImage.bind(this);
    }
    componentDidMount() {
        this.setState({ documentType: [...this.props.Value.DocumentType] });
        this.setState({ vehicleType: [...this.props.Value.VehicleType] });
        this.setState({ parkingArea: [{ "Id": "0", "Name": "Select Parking Area" }] });
        this.setState({ parkingName: [{ "Id": "0", "Name": "Select Parking Name" }] });
        // this.setState({Value:this.props.Value});
        ownerBL.CreateValidator();
        documentBL.CreateValidator();
        parkingBL.CreateValidator();
        if (this.props.PageMode == "Edit") {

            //Role 
            let data = [];
            
            this.setState({ gridParkingData: this.props.Data.parkingList });
            
            let arrayCopy = [...this.props.Value.DocumentType];
            this.props.Data.propertyMemberDocumentList.map((item) => {
                this.removeByAttr(arrayCopy, 'Id', item.documentTypeId.toString());
            });
            this.setState({ documentType: arrayCopy });
            this.setState({ documentTypeId: "0" });

            //Document Grid
            this.setState({ gridData: this.props.Data.propertyMemberDocumentList });

            this.setState({ societyId: this.props.Data.propertyId });
            
            //Set DropDown
            this.onSelected("OwnerType", this.props.Data.ownerTypeId.toString());
            this.onSelected("RelationshipType", this.props.Data.relationshipTypeId.toString());
            this.onSelected("ResidentType", this.props.Data.residentTypeId.toString());

        }
    }

    componentDidUpdate() {
    }

    handleOwnerCancel = () => {
        this.props.Action('Home');
    };

    handleOwnerSave = () => {
        var propertyOwnerId = 0;
        let url = new UrlProvider().MainUrl;
        if (this.props.PageMode == "Edit")
        propertyOwnerId = this.props.Data.propertyOwnerId

        //if (ownerBL.ValidateControls() == "") {
            if (true) {
            const formData = new FormData();
            formData.append('imageFile', this.state.pictures != null ? this.state.pictures[0] : null);
            formData.append('propertyOwnerId', propertyOwnerId);
            formData.append('propertyId',this.state.societyId);
            //formData.append('propertyStatusId',this.props.Data.propertyStatusId);
            formData.append('propertyStatusId',"4");
            formData.append('name', $('#txtName').val());
            formData.append('emailAddress', $('#txtEmailAddress').val());
            formData.append('contactNumber', $('#txtContactNumber').val());
            formData.append('alternateNumber', $('#txtAlternateNumber').val());
            
            formData.append('relationshipTypeId', this.state.Value.relationshipTypeId);
            formData.append('ownerTypeId', this.state.Value.ownerTypeId);
            formData.append('residentTypeId', this.state.Value.residentTypeId);

            formData.append('buildingName', $('#txtBuildingName').val());
            formData.append('floor',$('#txtFloor').val())
            formData.append('flat', $('#txtFlat').val());
            formData.append('flatContactNumber',$('#txtFlatContactNumber').val())
            formData.append('propertyStatus', "Owner Residing");
            
            this.state.gridData.map((item) => {
                formData.append('files', item.selectedFile);
            });
            formData.append('document', JSON.stringify(this.state.gridData));
            formData.append('parking', JSON.stringify(this.state.gridParkingData));
            axios.post(url + `Property/PropertyOwner/Save`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(res => {
                if (res.data <= 0) {
                    appCommon.ShownotifyError("Owner is already created for this flat");
                }
                else {
                    if (this.props.PageMode != "Edit")
                        appCommon.showtextalert("Property Owner Created Successfully", "", "success");
                    else
                        appCommon.showtextalert("Property Owner Updated Successfully", "", "success");
                    this.props.Action('Home');
                }
            });
        }
        else {
            appCommon.ShownotifyError(VALIDATION_ERROR);
        }
    }

    removeByAttr(arr, attr, value) {
        var i = arr.length;
        while (i--) {
            if (arr[i]
                && arr[i].hasOwnProperty(attr)
                && (arguments.length > 2 && arr[i][attr] === value)) {
                arr.splice(i, 1);
            }
        }
        return arr;
    }

    handleDocSave = () => {
        if (documentBL.ValidateControls() == "") {
            let documentTypeName = this.state.documentType.find((item) => { return item.Id == this.state.documentTypeId }).Name;
            this.setState({ documentType: this.removeByAttr(this.state.documentType, 'Id', this.state.documentTypeId) });
            let gridData = this.state.gridData;
            gridData.push({
                propertyMemberDcoumentId:0,
                propertyMemberId:0,
                documentTypeId: this.state.documentTypeId,
                documentTypeName: documentTypeName,
                documentName: this.state.documentNumber,
                //documentName: this.state.selectedFileName,
                documentURL: this.state.imageSrc,
                selectedFile: this.state.selectedFile
            });
            this.setState({ gridData: gridData });
            //clear object
            this.setState({ documentNumber: " " });
            this.removeImage();
        }
    }

    handleParkingSave = () => {
        if (parkingBL.ValidateControls() == "") {
            let gridParkingData = this.state.gridParkingData;
            gridParkingData.push({
                parkingId: 0,
                // parkingNameId: this.state.parkingNameId,
                // propertyDetailsId: 1,
                vehicleType: this.state.vehicleTypeId,
                vehicleNumber: this.state.VehicleNumber,
                stickerNumber: this.state.StickerNumber
            });
            this.setState({ gridParkingData: gridParkingData });
            this.resetParking();
        }
    }

    // onDocumentTypeSelected(value) {
    //     
    // }

    updateOwner = (name, value) => {
        switch (name) {
            case "DocumentName":
                this.setState({ documentNumber: value });
                break;
            case "VehicleNumber":
                this.setState({ VehicleNumber: value });
                break;
            case "StickerNumber":
                this.setState({ StickerNumber: value });
                break;
            default:
        }
    }

    // updateDocumentNumber = (value) => {
    //     this.setState({ documentNumber: value });
    // }

    setParkingArea(PropertyId) {
        promiseWrapper(this.props.actions.fetchPropertyArea, { PropertyId: PropertyId }).then((data) => {
            let propertyAreaData = [{ "Id": "0", "Name": "Select Parking Area" }];
            data.forEach(element => {
                propertyAreaData.push({ Id: element.id.toString(), Name: element.text });
            });
            this.setState({ parkingArea: propertyAreaData });
        });
    }

    setParkingName(ParkingAreaId) {
        promiseWrapper(this.props.actions.fetchPropertyName, { ParkingAreaId: ParkingAreaId }).then((data) => {
            let propertyNameData = [{ "Id": "0", "Name": "Select Parking Name" }];
            data.forEach(element => {
                propertyNameData.push({ Id: element.id.toString(), Name: element.text });
            });
            this.setState({ parkingName: propertyNameData });
        });
    }

    resetParking() {
        this.setState({ vehicleTypeId: "0" });
        this.setState({ parkingArea: [{ "Id": "0", "Name": "Select Parking Area" }] });
        this.setState({ parkingName: [{ "Id": "0", "Name": "Select Parking Name" }] });
        this.setState({ VehicleNumber: " ", StickerNumber: " " });

    }

    onSelected(name, value) {
        switch (name) {
            case "ResidentType":
                this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.residentTypeId = value; return { Value } });
                break;
            case "OwnerType":
                this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.ownerTypeId = value; return { Value } });
                break;
            case "RelationshipType":
                this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.relationshipTypeId = value; return { Value } });
                break;
            case "DocumentType":
                this.setState({ documentTypeId: value });
                break;
            case "VehicleType":
                this.setState({ vehicleTypeId: value });
                break;
            case "Society":
                this.setState({ societyId: value });
                this.resetParking();
                this.setState({ gridParkingData: [] });
                this.setParkingArea(value);
                break;
            case "ParkingArea":
                this.setState({ parkingAreaId: value });
                this.setParkingName(value);
                break;
            case "ParkingName":
                this.setState({ parkingNameId: value });
                break;
            default:
        }
        //this.props.onNameChangeAdd(value);
    }

    // onPagechange = (page) => {
    //     this.setState({ pageNumber: page }, () => {
    //         this.loadUser();
    //     });
    // }

    onDrop(pictureFiles, pictureDataURLs) {
        this.setState({ pictures: pictureFiles });
    }

    onDropDownMultiSelectChange(value, event) {
        this.setState({ setSelectedOptions: value });
    }

    removeImage() {
        this.setState({
            selectedFile: undefined,
            selectedFileName: undefined,
            imageSrc: undefined,
            value: ''
        })
    }

    onFileChange(event) {
        // Update the state 
        if (event.target.files[0]) {
            this.setState({
                selectedFile: event.target.files[0],
                selectedFileName: event.target.files[0].name,
                imageSrc: window.URL.createObjectURL(event.target.files[0]),
                value: event.target.value,
            });
        }
    };

    compareBy(key) {
        return function (a, b) {
            if ("" + a[key] < ("" + b[key])) return -1;
            if ("" + a[key] > ("" + b[key])) return 1;
            return 0;
        };
    }

    onDocumentGridData(gridLink) {
        window.open(gridLink);
    }

    onDocumentGridDelete(gridId) {
        let myhtml = document.createElement("div");
        //myhtml.innerHTML = "Save your changes otherwise all change will be lost! </br></br> Are you sure want to close this page?" + "</hr>"
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
                        this.setState({ gridData: this.removeByAttr(this.state.gridData, 'documentTypeId', gridId) });

                        //dropdown

                        let documentType = this.state.documentType;
                        this.props.Value.DocumentType.map((item) => {
                            if (item.Id == gridId)
                                documentType.push(item);
                        });
                        let arrayCopy = [...this.state.documentType];
                        arrayCopy.sort(this.compareBy("Id"));
                        this.setState({ documentType: arrayCopy });
                        this.setState({ documentTypeId: "0" });
                        appCommon.showtextalert("Department Deleted Successfully", "", "success");
                        break;
                    case "cancel":
                        //do nothing 
                        break;
                    default:
                        break;
                }
            })
        );
    }

    onParkingGridDelete(gridId){
        let myhtml = document.createElement("div");
        //myhtml.innerHTML = "Save your changes otherwise all change will be lost! </br></br> Are you sure want to close this page?" + "</hr>"
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
                        this.setState({ gridParkingData: this.removeByAttr(this.state.gridParkingData, 'parkingId', gridId) });
                        // this.setState({ documentType: arrayCopy });
                        // this.setState({ documentTypeId: "0" });
                        appCommon.showtextalert("Parking Deleted Successfully", "", "success");
                        break;
                    case "cancel":
                        //do nothing 
                        break;
                    default:
                        break;
                }
            })
        );
    }

    render() {
        return (
            <div>
                <div className="modal-content">
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbProfilePic">Profile Picture</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <div style={{ marginRight: "15px" }}>
                                            <img className="ImageView" src={this.props.Data.profileImageUrl} style={{ height: "90px" }} />
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbPictureUpload">Picture Upload</label>
                                    <div style={{ display: "flex" }}>
                                        <div style={{ marginRight: "15px" }}>
                                            <ImageUploader
                                                singleImage={true}
                                                //withIcon={true}
                                                withIcon={false}
                                                withPreview={true}
                                                label=""
                                                // label="Max file size: 5mb, accepted: jpg, png, svg"
                                                buttonText="Upload Images"
                                                onChange={this.onDrop}
                                                imgExtension={[".jpg", ".png", ".svg"]}
                                                maxFileSize={5242880}
                                                fileSizeError=" file size is too big"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbName">Name</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <InputBox Id="txtName"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="Name"
                                            Value={this.props.Data.ownerName}
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <InputBox Id="txtName"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="Name"
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbEmailAddress">Email Address</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <div className="dummyBox">
                                            {this.props.Data.emailAddress}
                                        </div>
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <InputBox Id="txtEmailAddress"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="Email Address"
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                </div>
                            </div>

                        </div>
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbConatctNumber">Contact Number</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <InputBox Id="txtContactNumber"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="Contact Number"
                                            Value={this.props.Data.contactNumber}
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <InputBox Id="txtContactNumber"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="Contact Number"
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbAlternateNumber">Alternate Number</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <InputBox Id="txtAlternateNumber"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="Alternate Number"
                                            Value={this.props.Data.alternateNumber}
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <InputBox Id="txtAlternateNumber"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="Alternate Number"
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                </div>
                            </div>

                        </div>

                        <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbResidentType">Resident Type</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <SelectBox
                                            ID="ddlResidentType"
                                            Value={this.state.Value.residentTypeId}
                                            onSelected={this.onSelected.bind(this, "ResidentType")}
                                            Options={this.props.Value.ResidentType}
                                            ClassName="form-control form-control-sm" />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <SelectBox
                                            ID="ddlResidentType"
                                            Value={this.state.Value.residentTypeId}
                                            onSelected={this.onSelected.bind(this, "ResidentType")}
                                            Options={this.props.Value.ResidentType}
                                            ClassName="form-control form-control-sm" />
                                    }
                                </div>
                            </div>

                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbOwnerType">Owner Type</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <SelectBox
                                            ID="ddlOwnerType"
                                            Value={this.state.Value.ownerTypeId}
                                            onSelected={this.onSelected.bind(this, "OwnerType")}
                                            Options={this.props.Value.OwnerType}
                                            ClassName="form-control form-control-sm" />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <SelectBox
                                            ID="ddlOwnerType"
                                            Value={this.state.Value.ownerTypeId}
                                            onSelected={this.onSelected.bind(this, "OwnerType")}
                                            Options={this.props.Value.OwnerType}
                                            ClassName="form-control form-control-sm" />
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbRelationshipType">Relationship Type</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <SelectBox
                                            ID="ddlRelationshipType"
                                            Value={this.state.Value.relationshipTypeId}
                                            onSelected={this.onSelected.bind(this, "RelationshipType")}
                                            Options={this.props.Value.RelationshipType}
                                            ClassName="form-control form-control-sm" />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <SelectBox
                                            ID="ddlRelationshipType"
                                            Value={this.state.Value.relationshipTypeId}
                                            onSelected={this.onSelected.bind(this, "RelationshipType")}
                                            Options={this.props.Value.RelationshipType}
                                            ClassName="form-control form-control-sm" />
                                    }
                                </div>
                            </div>

                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbName">Society Name</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <SelectBox
                                            ID="ddlSociety"
                                            Value={this.state.societyId}
                                            onSelected={this.onSelected.bind(this, "Society")}
                                            Options={this.props.Value.Society}
                                            ClassName="form-control form-control-sm" />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <SelectBox
                                            ID="ddlSociety"
                                            Value={this.state.societyId}
                                            onSelected={this.onSelected.bind(this, "Society")}
                                            Options={this.props.Value.Society}
                                            ClassName="form-control form-control-sm" />
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbName">Building Name</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <InputBox Id="txtBuildingName"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="Building Name"
                                            Value={this.props.Data.buildingName}
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <InputBox Id="txtBuildingName"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="Building Name"
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                </div>
                            </div>

                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbName">Flat</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <InputBox Id="txtFlat"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="Flat"
                                            Value={this.props.Data.flat}
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <InputBox Id="txtFlat"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="Flat"
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbFloor">Floor</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <InputBox Id="txtFloor"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="Floor"
                                            Value={this.props.Data.floor}
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <InputBox Id="txtFloor"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="Floor"
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                </div>
                            </div>

                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbFlatContactNumber">Flat Contact Number</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <InputBox Id="txtFlatContactNumber"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="FlatContactNumber"
                                            Value={this.props.Data.flatContactNumber}
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <InputBox Id="txtFlatContactNumber"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="FlatContactNumber"
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="modal-content">
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label for="lbDocumentType">Document Type</label>
                                                {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                                    <SelectBox
                                                        ID="ddlDocumentType"
                                                        Value={this.state.documentTypeId}
                                                        onSelected={this.onSelected.bind(this, "DocumentType")}
                                                        Options={this.state.documentType}
                                                        ClassName="form-control form-control-sm" />
                                                }
                                                {this.props.PageMode == "Add" &&
                                                    <SelectBox
                                                        ID="ddlDocumentType"
                                                        Value={this.state.documentTypeId}
                                                        onSelected={this.onSelected.bind(this, "DocumentType")}
                                                        Options={this.state.documentType}
                                                        ClassName="form-control form-control-sm" />
                                                }
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label for="lbDocumentName">Document Name</label>
                                                {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                                    <InputBox Id="txtDocumentName"
                                                        onChange={this.updateOwner.bind(this, "DocumentName")}
                                                        PlaceHolder="Document Name"
                                                        Value={this.state.documentNumber}
                                                        Class="form-control form-control-sm"
                                                    />
                                                }
                                                {this.props.PageMode == "Add" &&
                                                    <InputBox Id="txtDocumentName"
                                                        onChange={this.updateOwner.bind(this, "DocumentName")}
                                                        PlaceHolder="Document Name"
                                                        Value={this.state.documentNumber}
                                                        Class="form-control form-control-sm"
                                                    />
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label for="lbDocumentUpload">Document Upload</label>
                                                <div className="pr-inner-block mar-bottom-zero-cover">
                                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                                        <DocumentUploader
                                                            Class={"form-control form-control-sm"}
                                                            Id={"fileDocumentUploader"}
                                                            type={"file"}
                                                            value={this.state.value}
                                                            onChange={this.onFileChange.bind(this)} />
                                                    }
                                                    {this.props.PageMode == "Add" &&
                                                        <DocumentUploader
                                                            Class={"form-control form-control-sm"}
                                                            Id={"fileDocumentUploader"}
                                                            type={"file"}
                                                            value={this.state.value}
                                                            onChange={this.onFileChange.bind(this)} />
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <Button
                                                Id="btnAddDoc"
                                                Text="Add Document"
                                                Action={this.handleDocSave.bind(this)}
                                                ClassName="btn btn-primary" />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <DataGrid
                                                Id="grdDoc"
                                                IsPagination={false}
                                                ColumnCollection={this.state.gridHeader}
                                                onGridDeleteMethod={this.onDocumentGridDelete.bind(this)}
                                                onGridDownloadMethod={this.onDocumentGridData.bind(this)}
                                                GridData={this.state.gridData}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="modal-content">
                                <div className="modal-body">
                                <div className="row">
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label for="lbParkingArea">Parking Area</label>
                                                {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                                    <SelectBox
                                                        ID="ddlParkingArea"
                                                        Value={this.state.parkingAreaId}
                                                        onSelected={this.onSelected.bind(this, "ParkingArea")}
                                                        Options={this.state.parkingArea}
                                                        ClassName="form-control form-control-sm" />
                                                }
                                                {this.props.PageMode == "Add" &&
                                                    <SelectBox
                                                        ID="ddlParkingArea"
                                                        Value={this.state.parkingAreaId}
                                                        onSelected={this.onSelected.bind(this, "ParkingArea")}
                                                        Options={this.state.parkingArea}
                                                        ClassName="form-control form-control-sm" />
                                                }
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label for="lbParkingName">Parking Name</label>
                                                {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                                    <SelectBox
                                                        ID="ddlParkingName"
                                                        Value={this.state.parkingNameId}
                                                        onSelected={this.onSelected.bind(this, "ParkingName")}
                                                        Options={this.state.parkingName}
                                                        ClassName="form-control form-control-sm" />
                                                }
                                                {this.props.PageMode == "Add" &&
                                                    <SelectBox
                                                        ID="ddlParkingName"
                                                        Value={this.state.parkingNameId}
                                                        onSelected={this.onSelected.bind(this, "ParkingName")}
                                                        Options={this.state.parkingName}
                                                        ClassName="form-control form-control-sm" />
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label for="lbDocumentUpload">Vehicle Type</label>
                                                <div className="pr-inner-block mar-bottom-zero-cover">
                                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                                        <SelectBox
                                                            ID="ddlVehicleType"
                                                            Value={this.state.vehicleTypeId}
                                                            onSelected={this.onSelected.bind(this, "VehicleType")}
                                                            Options={this.state.vehicleType}
                                                            ClassName="form-control form-control-sm" />
                                                    }
                                                    {this.props.PageMode == "Add" &&
                                                        <SelectBox
                                                            ID="ddlVehicleType"
                                                            Value={this.state.vehicleTypeId}
                                                            onSelected={this.onSelected.bind(this, "VehicleType")}
                                                            Options={this.state.vehicleType}
                                                            ClassName="form-control form-control-sm" />
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label for="lbVehicleNumber">Vehicle Number</label>
                                                {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                                    <InputBox Id="txtVehicleNumber"
                                                        onChange={this.updateOwner.bind(this, "VehicleNumber")}
                                                        PlaceHolder="Vehicle Number"
                                                        Value={this.state.VehicleNumber}
                                                        Class="form-control form-control-sm"
                                                    />
                                                }
                                                {this.props.PageMode == "Add" &&
                                                    <InputBox Id="txtVehicleNumber"
                                                        onChange={this.updateOwner.bind(this, "VehicleNumber")}
                                                        PlaceHolder="Vehicle Number"
                                                        Value={this.state.VehicleNumber}
                                                        Class="form-control form-control-sm"
                                                    />
                                                }
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label for="lbStickerNumber">Sticker Number</label>
                                                {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                                    <InputBox Id="txtStickerNumber"
                                                        onChange={this.updateOwner.bind(this, "StickerNumber")}
                                                        PlaceHolder="Sticker Number"
                                                        Value={this.state.StickerNumber}
                                                        Class="form-control form-control-sm"
                                                    />
                                                }
                                                {this.props.PageMode == "Add" &&
                                                    <InputBox Id="txtStickerNumber"
                                                        onChange={this.updateOwner.bind(this, "StickerNumber")}
                                                        PlaceHolder="Sticker Number"
                                                        Value={this.state.StickerNumber}
                                                        Class="form-control form-control-sm"
                                                    />
                                                }
                                            </div>
                                        </div>

                                    </div>
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <Button
                                                Id="btnAddParking"
                                                Text="Save Parking"
                                                Action={this.handleParkingSave.bind(this)}
                                                ClassName="btn btn-primary" />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <DataGrid
                                                Id="grdParkingView"
                                                IsPagination={false}
                                                ColumnCollection={this.state.gridParkingHeader}
                                                GridData={this.state.gridParkingData}
                                                onGridDeleteMethod={this.onParkingGridDelete.bind(this)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="modal-footer">
                            <Button
                                Id="btnSave"
                                Text="Save"
                                Action={this.handleOwnerSave.bind(this)}
                                ClassName="btn btn-primary" />
                            <Button
                                Id="btnCancel"
                                Text="Cancel"
                                Action={this.handleOwnerCancel}
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
        )

    }
}
function mapStoreToprops(state, props) {
    return {}
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentActions, dispatch);
    return { actions };
}

export default connect(mapStoreToprops, mapDispatchToProps)(OwnerNew);