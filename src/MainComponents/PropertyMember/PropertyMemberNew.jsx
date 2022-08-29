import React from 'react';
import Button from '../../ReactComponents/Button/Button.jsx';
import DocumentUploader from '../../ReactComponents/FileUploader/DocumentUploader.jsx';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import PropertyMemberBL from '../../ComponentBL/PropertyMemberBL';
import DocumentBL from '../../ComponentBL/DocumentBL';
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
import ImageUploader from 'react-images-upload';
import ApiProvider from './DataProvider.js';
import axios from 'axios';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import './PropertyMember.css';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';

const $ = window.$;
const propertyMemberBL = new PropertyMemberBL();
const documentBL = new DocumentBL();

class PropertyMemberNew extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pictures: null,
            pagemode: 'new',
            Value: [],
            gridHeader: [
                { sTitle: 'Id', titleValue: 'propertyMemberDocumentId', "orderable": false, },
                { sTitle: 'Document Type', titleValue: 'documentTypeName', "orderable": false, },
                { sTitle: 'Document Name', titleValue: 'documentName', "orderable": false, },
                { sTitle: 'Document Url', titleValue: 'documentUrl', "orderable": false, },
                { sTitle: 'Action', titleValue: 'Action', Action: "DownloadNDelete", Index: '0', urlIndex: '3', "orderable": false }
            ],
            gridData: [],
            propertyOwner: [],
            propertyOwnerId: "0",

            documentType: [],
            documentTypeId: "0",
            documentNumber: "",
            //Document file
            selectedFile: undefined,
            selectedFileName: undefined,
            imageSrc: undefined,
            value: ''

        }
        this.onDrop = this.onDrop.bind(this);
        this.removeImage = this.removeImage.bind(this);
        this.ApiProviderr = new ApiProvider();
    }

    componentDidMount() {

        propertyMemberBL.CreateValidator();
        documentBL.CreateValidator();
        this.setState({ documentType: [...this.props.Value.DocumentType] });
        if (this.props.PageMode == "Edit") {

            if (this.props.Data.parentMemberId == null || this.props.Data.parentMemberId == 0) {
                this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.memberTypeId = "Owner"; return { Value } });
            } else {
                this.setMember(this.props.Data.propertyMemberId);
                this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.memberTypeId = "Member"; return { Value } });
                this.setState({ propertyOwnerId: this.props.Data.parentMemberId });
            }

            this.onSelected("RelationshipType", this.props.Data.relationshipTypeId.toString());
            this.onSelected("ResidentType", this.props.Data.residentTypeId.toString());


            let arrayCopy = [...this.props.Value.DocumentType];
            this.props.Data.propertyMemberDocumentList.map((item) => {
                this.removeByAttr(arrayCopy, 'Id', item.documentTypeId.toString());
            });
            this.setState({ documentType: arrayCopy });
            this.setState({ documentTypeId: "0" });
            //Document Grid
            this.setState({ gridData: this.props.Data.propertyMemberDocumentList });
        }
    }

    componentDidUpdate() {
    }

    handleOwnerCancel = () => {
        this.props.Action('Home');
    };

    handleOwnerSave = () => {

        var propertyMemberId = 0;
        let url = new UrlProvider().MainUrl;
        if (this.props.PageMode == "Edit")
            propertyMemberId = this.props.Data.propertyMemberId

        if (propertyMemberBL.ValidateControls() == "") {
            const formData = new FormData();
            formData.append('imageFile', this.state.pictures != null ? this.state.pictures[0] : null);
            formData.append('propertyMemberId', propertyMemberId);
            formData.append('firstName', $('#txtFirstName').val());
            formData.append('middleName', $('#txtMiddleName').val());
            formData.append('lastName', $('#txtLastName').val());
            formData.append('emailAddress', $('#txtEmailAddress').val());
            formData.append('contactNumber', $('#txtContactNumber').val());
            formData.append('alternateContactNumber', $('#txtAlternateNumber').val());
            formData.append('relationshipTypeId', this.state.Value.relationshipTypeId);
            formData.append('residentTypeId', this.state.Value.residentTypeId);
            formData.append('parentMemberId', this.state.Value.memberTypeId == "Member" ? this.state.propertyOwnerId : 0);

            this.state.gridData.map((item) => {
                formData.append('files', item.selectedFile);
            });
            formData.append('document', JSON.stringify(this.state.gridData));


            this.ApiProviderr.savePropertyMemeber(formData)
                .then(res => {
                    if (res.data <= 0) {
                        appCommon.ShownotifyError("Member Contact is already created");
                    }
                    else {
                        if (this.props.PageMode != "Edit")
                            appCommon.showtextalert("Member Created Successfully", "", "success");
                        else
                            appCommon.showtextalert("Member Updated Successfully", "", "success");
                        this.props.Action('Home');
                    }
                });

            // axios.post(url + `Property/PropertyOwner/Save`, formData, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data'
            //     }
            // }).then(res => {
            //     if (res.data <= 0) {
            //         appCommon.ShownotifyError("Member Contact is already created");
            //     }
            //     else {
            //         if (this.props.PageMode != "Edit")
            //             appCommon.showtextalert("Member Created Successfully", "", "success");
            //         else
            //             appCommon.showtextalert("Member Updated Successfully", "", "success");
            //         this.props.Action('Home');
            //     }
            // });
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

    setMember(ParentMemberId) {

        promiseWrapper(this.props.actions.fetchPropertyOwner, { ParentMemberId: ParentMemberId }).then((data) => {
            let propertyAreaData = [{ "Id": "0", "Name": "Select Owner" }];
            data.forEach(element => {
                propertyAreaData.push({ Id: element.id.toString(), Name: element.text });
            });
            this.setState({ propertyOwner: propertyAreaData });
            propertyMemberBL.CreateValidator();
        });
    }

    onSelected(name, value) {
        switch (name) {
            case "ResidentType":
                this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.residentTypeId = value; return { Value } });
                break;
            case "RelationshipType":
                this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.relationshipTypeId = value; return { Value } });
                break;
            case "DocumentType":
                this.setState({ documentTypeId: value });
                break;
            case "MemberType":

                if (value == "Member") {
                    this.props.PageMode == "Edit" ? this.setMember(this.props.Data.propertyMemberId) : this.setMember("0");
                } else {
                    this.setState({ propertyOwner: [{ "Id": "0", "Name": "Select Owner" }] });
                }
                this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.memberTypeId = value; return { Value } });
                break;
            case "SeletedOwner":
                this.setState({ propertyOwnerId: value });
                break;
            default:
        }
    }

    onDrop(pictureFiles, pictureDataURLs) {
        this.setState({ pictures: pictureFiles });
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

    handleDocSave = () => {

        if (documentBL.ValidateControls() == "") {
            let documentTypeName = this.state.documentType.find((item) => { return item.Id == this.state.documentTypeId }).Name;
            this.setState({ documentType: this.removeByAttr(this.state.documentType, 'Id', this.state.documentTypeId) });
            let gridData = this.state.gridData;
            gridData.push({
                propertyMemberDocumentId: 0,
                documentTypeId: this.state.documentTypeId,
                documentTypeName: documentTypeName,
                documentName: this.state.documentNumber,
                documentFileName: this.state.selectedFileName,
                documentUrl: this.state.imageSrc,
                selectedFile: this.state.selectedFile
            });
            this.setState({ gridData: gridData });
            //clear object
            this.setState({ documentNumber: " " });
            this.removeImage();
        }
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

                        this.setState({ gridData: this.removeByAttr(this.state.gridData, 'propertyMemberDocumentId', gridId) });

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


    render() {
        return (
            <div>
                <div className="modal-content">
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbMemberType">Member Type</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <SelectBox
                                            ID="ddlMemberType"
                                            Value={this.state.Value.memberTypeId}
                                            onSelected={this.onSelected.bind(this, "MemberType")}
                                            Options={this.props.Value.MemberType}
                                            ClassName="form-control form-control-sm" />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <SelectBox
                                            ID="ddlMemberType"
                                            Value={this.state.Value.memberTypeId}
                                            onSelected={this.onSelected.bind(this, "MemberType")}
                                            Options={this.props.Value.MemberType}
                                            ClassName="form-control form-control-sm" />
                                    }
                                </div>
                            </div>
                            {this.state.Value.memberTypeId == "Member" && <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbRelatedOwner">Select Owner</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <SelectBox
                                            ID="ddlSelectedOwner"
                                            Value={this.state.propertyOwnerId}
                                            onSelected={this.onSelected.bind(this, "SeletedOwner")}
                                            Options={this.state.propertyOwner}
                                            ClassName="form-control form-control-sm" />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <SelectBox
                                            ID="ddlSelectedOwner"
                                            Value={this.state.propertyOwnerId}
                                            onSelected={this.onSelected.bind(this, "SeletedOwner")}
                                            Options={this.state.propertyOwner}
                                            ClassName="form-control form-control-sm" />
                                    }
                                </div>
                            </div>}
                        </div>
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
                                    <label for="lbFirstName">First Name</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <InputBox Id="txtFirstName"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="First Name"
                                            Value={this.props.Data.firstName}
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <InputBox Id="txtFirstName"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="First Name"
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbMiddleName">Middle Name</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <InputBox Id="txtMiddleName"
                                            onChange={this.updateOwner.bind(this)}
                                            Value={this.props.Data.middleName}
                                            PlaceHolder="Middle Name"
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <InputBox Id="txtMiddleName"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="Middle Name"
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                </div>
                            </div>

                        </div>
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbLastName">Last Name</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <InputBox Id="txtLastName"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="Last Name"
                                            Value={this.props.Data.lastName}
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <InputBox Id="txtLastName"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="Last Name"
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbEmailAddress">Email Address</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <InputBox Id="txtEmailAddress"
                                            onChange={this.updateOwner.bind(this)}
                                            PlaceHolder="Email Address"
                                            Value={this.props.Data.emailAddress}
                                            Class="form-control form-control-sm"
                                        />

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
                                        // <InputBox Id="txtContactNumber"
                                        //     onChange={this.updateOwner.bind(this)}
                                        //     PlaceHolder="Contact Number"
                                        //     Value={this.props.Data.contactNumber}
                                        //     Class="form-control form-control-sm"
                                        // />
                                        <div className="dummyBox">
                                            {this.props.Data.contactNumber}
                                        </div>
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
                                            Value={this.props.Data.alternateContactNumber}
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

export default connect(mapStoreToprops, mapDispatchToProps)(PropertyMemberNew);