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
import UserBL from '../../ComponentBL/UserBL';
import DocumentBL from '../../ComponentBL/DocumentBL';
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
import MultiSelectInline from '../../ReactComponents/MultiSelectInline/MultiSelectInline.jsx';
import './User.css';
import Link from '../../ReactComponents/LinkComponent/Link';
import ApiProvider from './DataProvider.js';

const $ = window.$;
const userBL = new UserBL();
const documentBL = new DocumentBL();
class UserNew extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pictures: null,

            pageSize: 10,
            pageNumber: 1,
            gridHeader: [
                { sTitle: 'Id', titleValue: 'documentTypeId', "orderable": false, "visible": true },
                { sTitle: 'Document Type', titleValue: 'documentTypeName', "orderable": true },
                { sTitle: 'Document Number', titleValue: 'documentNumber', "orderable": true },
                { sTitle: 'Document Name', titleValue: 'documentName', "orderable": true, "visible": true },
                { sTitle: 'Document Url', titleValue: 'documentURL', "orderable": true, "visible": true },
                { sTitle: 'Action', titleValue: 'Action', Action: "DownloadNDelete", Index: '0', urlIndex: '4', "orderable": false }
            ],
            grdTotalRows: 0,
            grdTotalPages: 0,
            gridData: [],
            pagemode: 'new',
            Value: [],
            setSelectedOptions: [],
            setSelectedOptionsProperty: [],

            //Document field
            documentType: [],
            documentTypeId: "0",
            // documentTypeName: "",
            documentNumber: "",


            //Document file
            selectedFile: undefined,
            selectedFileName: undefined,
            imageSrc: undefined,
            value: '',
            Showimguploader: false

        }
        this.onDrop = this.onDrop.bind(this);
        this.removeImage = this.removeImage.bind(this);
        this.ApiProviderr = new ApiProvider();
    }
    componentDidMount() {
        var d = this.props;
        this.setState({ documentType: [...this.props.Value.DocumentType] });
        this.setState({ Value: this.props.Value });
        userBL.CreateValidator();
        documentBL.CreateValidator();
        if (this.props.PageMode == "Edit") {

            //Role 
            let data = [];
            this.props.Data.userRoleList.map((i, index) => (
                data.push({ Id: i.userRoleId, Name: i.userRoleName, value: i.userRoleName, label: i.userRoleName, color: '#0052CC' })
            ));
            this.onDropDownMultiSelectChange(data);

            //Property 
            let dataProperty = [];
            this.props.Data.userPropertyList.map((i, index) => (
                dataProperty.push({ Id: i.userPropertyId, Name: i.userPropertyName, value: i.userPropertyName, label: i.userPropertyName, color: '#0052CC' })
            ));
            this.onDropDownMultiSelectChangeProperty(dataProperty);

            //Drop Document type
            //let documentId = [];
            //let documentType = [];


            let arrayCopy = [...this.props.Value.DocumentType];
            this.props.Data.userDocumentList.map((item) => {
                this.removeByAttr(arrayCopy, 'Id', item.documentTypeId.toString());
            });
            this.setState({ documentType: arrayCopy });

            this.setState({ documentTypeId: "0" });

            //Document Grid
            this.setState({ gridData: this.props.Data.userDocumentList });

            //Set DropDown
            this.onSelected("UserType", this.props.Data.userTypeId.toString());
            this.onSelected("City", this.props.Data.cityId.toString());
            this.onSelected("Branch", this.props.Data.branchId.toString());
            this.onSelected("Departments", this.props.Data.departmentId.toString());
            this.onSelected("Vendor", this.props.Data.vendorId.toString());
            this.onSelected("Company", this.props.Data.companyId.toString());
        }
    }

    componentDidUpdate() {
    }

    handleUserCancel = () => {
        this.props.Action('Home');
    };

    handleImagechange = () => {
        this.setState({ Showimguploader: true });
    }
    handleImageClose = () => {
        this.setState({ Showimguploader: false });
    }

    handleUserSave = () => {

        var userId = 0;
        let url = new UrlProvider().MainUrl;
        if (this.props.PageMode == "Edit")
            userId = this.props.Data.userId

        if (userBL.ValidateControls() == "") {
            const formData = new FormData();
            formData.append('imageFile', this.state.pictures != null ? this.state.pictures[0] : null);
            formData.append('userId', userId);
            formData.append('firstName', $('#txtFirstName').val());
            formData.append('lastName', $('#txtLastName').val());
            formData.append('emailAddress', $('#txtEmailAddress').val());
            formData.append('contactNumber', $('#txtContactNumber').val());
            formData.append('userTypeId', this.state.Value.userTypeId);
            formData.append('cityId', this.state.Value.cityId);
            formData.append('branchId', this.state.Value.branchId);
            formData.append('departmentId', this.state.Value.departmentsId);
            formData.append('VendorId', this.state.Value.vendorId);
            formData.append('companyId', this.state.Value.companyId);
            formData.append('roleId', this.state.setSelectedOptions.map((item) => { return item.Id }));
            formData.append('propertyId', this.state.setSelectedOptionsProperty.map((item) => { return item.Id }));

            this.state.gridData.map((item) => {
                formData.append('files', item.selectedFile);
            });
            formData.append('document', JSON.stringify(this.state.gridData));

            // promiseWrapper(this.props.actions.saveUser, { data: formData }).then((jdata) => {
            //     
            // });
            this.ApiProviderr.saveUser(formData)
                .then(res => {
                    if (res.data <= 0) {
                        appCommon.ShownotifyError("User Email is already created");
                    }
                    else {
                        if (this.props.PageMode != "Edit")
                            appCommon.showtextalert("User Created Successfully", "", "success");
                        else
                            appCommon.showtextalert("User Updated Successfully", "", "success");
                        this.props.Action('Home');
                    }
                });
            // axios.post(url + `Master/User/Save`, formData, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data'
            //     }
            // }).then(res => {
            //     if (res.data <= 0) {
            //         appCommon.ShownotifyError("User Email is already created");
            //     }
            //     else {
            //         if (this.props.PageMode != "Edit")
            //             appCommon.showtextalert("User Created Successfully", "", "success");
            //         else
            //             appCommon.showtextalert("User Updated Successfully", "", "success");
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

    handleDocSave = () => {

        if (documentBL.ValidateControls() == "") {
            let documentTypeName = this.state.documentType.find((item) => { return item.Id == this.state.documentTypeId }).Name;
            this.setState({ documentType: this.removeByAttr(this.state.documentType, 'Id', this.state.documentTypeId) });
            let gridData = this.state.gridData;
            gridData.push({
                documentTypeId: this.state.documentTypeId,
                documentTypeName: documentTypeName,
                documentNumber: this.state.documentNumber,
                documentName: this.state.selectedFileName,
                documentURL: this.state.imageSrc,
                selectedFile: this.state.selectedFile
            });
            this.setState({ gridData: gridData });
            //clear object
            this.setState({ documentNumber: " " });
            this.removeImage();
        }
    }

    onDocumentTypeSelected(value) {

    }

    updateuser = () => { }

    updateDocumentNumber = (value) => {
        this.setState({ documentNumber: value });
        //this.setState(prevState => { let document = Object.assign({}, prevState.document); document.documentNumber = value;  return { document } });
    }

    updateBranch(value) {
        this.props.CompanyValue(value);
    }

    onSelected(name, value) {
        switch (name) {
            case "UserType":
                this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.userTypeId = value; return { Value } });
                break;
            case "City":
                this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.cityId = value; return { Value } });
                break;
            case "Branch":
                this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.branchId = value; return { Value } });
                break;
            case "Departments":
                this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.departmentsId = value; return { Value } });
                break;
            case "Role":
                this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.roleId = value; return { Value } });
                break;
            case "Vendor":
                this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.vendorId = value; return { Value } });
                break;
            case "Company":

                this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.companyId = value; return { Value } });
                this.updateBranch(value);
                break;
            case "DocumentType":
                this.setState({ documentTypeId: value });
                break;
            default:
        }
        //this.props.onNameChangeAdd(value);
    }

    onPagechange = (page) => {
        this.setState({ pageNumber: page }, () => {
            this.loadUser();
        });
    }

    onDrop(pictureFiles, pictureDataURLs) {
        this.setState({ pictures: pictureFiles });
    }

    onDropDownMultiSelectChange(value, event) {
        this.setState({ setSelectedOptions: value });
    }
    onDropDownMultiSelectChangeProperty(value, event) {
        this.setState({ setSelectedOptionsProperty: value });
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
                        appCommon.showtextalert("Document Deleted Successfully", "", "success");
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
    onImageChange() {
        alert('test');
    }
    render() {
        return (
            <div>
                <div className="modal-content">
                    <div className="modal-body">
                        <div className="row">

                        </div>
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbFirstName">First Name</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <InputBox Id="txtFirstName"
                                            onChange={this.updateuser.bind(this)}
                                            PlaceHolder="First Name"
                                            Value={this.props.Data.firstName}
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <InputBox Id="txtFirstName"
                                            onChange={this.updateuser.bind(this)}
                                            PlaceHolder="First Name"
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbLastName">Last Name</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <InputBox Id="txtLastName"
                                            onChange={this.updateuser.bind(this)}
                                            PlaceHolder="Last Name"
                                            Value={this.props.Data.lastName}
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <InputBox Id="txtLastName"
                                            onChange={this.updateuser.bind(this)}
                                            PlaceHolder="Last Name"
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="row">
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
                                            onChange={this.updateuser.bind(this)}
                                            PlaceHolder="Email Address"
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbConatctNumber">Contact Number</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <InputBox Id="txtContactNumber"
                                            onChange={this.updateuser.bind(this)}
                                            PlaceHolder="Contact Number"
                                            Value={this.props.Data.contactNumber}
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <InputBox Id="txtContactNumber"
                                            onChange={this.updateuser.bind(this)}
                                            PlaceHolder="Contact Number"
                                            Class="form-control form-control-sm"
                                        />
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbCompany">Company</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <SelectBox
                                            ID="ddlCompany"
                                            Value={this.state.Value.companyId}
                                            onSelected={this.onSelected.bind(this, "Company")}
                                            Options={this.props.Value.Company}
                                            ClassName="form-control form-control-sm" />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <SelectBox
                                            ID="ddlCompany"
                                            Value={this.state.Value.companyId}
                                            onSelected={this.onSelected.bind(this, "Company")}
                                            Options={this.props.Value.Company}
                                            ClassName="form-control form-control-sm" />
                                    }
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbBranch">Branch</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <SelectBox
                                            ID="ddlBranch"
                                            Value={this.state.Value.branchId}
                                            onSelected={this.onSelected.bind(this, "Branch")}
                                            Options={this.props.Value.Branch}
                                            ClassName="form-control form-control-sm" />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <SelectBox
                                            ID="ddlBranch"
                                            Value={this.state.Value.branchId}
                                            onSelected={this.onSelected.bind(this, "Branch")}
                                            Options={this.props.Value.Branch}
                                            ClassName="form-control form-control-sm" />
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbDepartment">Department</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <SelectBox
                                            ID="ddlDepartments"
                                            Value={this.state.Value.departmentsId}
                                            onSelected={this.onSelected.bind(this, "Departments")}
                                            Options={this.props.Value.Departments}
                                            ClassName="form-control form-control-sm" />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <SelectBox
                                            ID="ddlDepartments"
                                            Value={this.state.Value.departmentsId}
                                            onSelected={this.onSelected.bind(this, "Departments")}
                                            Options={this.props.Value.Departments}
                                            ClassName="form-control form-control-sm" />
                                    }
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbCity">City</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <SelectBox
                                            ID="ddlCity"
                                            Value={this.state.Value.cityId}
                                            onSelected={this.onSelected.bind(this, "City")}
                                            Options={this.props.Value.City}
                                            ClassName="form-control form-control-sm" />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <SelectBox
                                            ID="ddlCity"
                                            Value={this.state.Value.cityId}
                                            onSelected={this.onSelected.bind(this, "City")}
                                            Options={this.props.Value.City}
                                            ClassName="form-control form-control-sm" />
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbRole">Role</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <MultiSelectInline
                                            ID="ddlRole"
                                            isMulti={true}
                                            value={this.state.setSelectedOptions}
                                            onChange={this.onDropDownMultiSelectChange.bind(this)}
                                            options={this.props.Value.Role}
                                        />
                                        // <MultiSelect
                                        //     options={this.props.Value.Role}
                                        //     onChange={this.onDropDownMultiSelectChange.bind(this)}
                                        //     value={this.state.setSelectedOptions}
                                        // />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <MultiSelectInline
                                            ID="ddlRole"
                                            isMulti={true}
                                            value={this.state.setSelectedOptions}
                                            onChange={this.onDropDownMultiSelectChange.bind(this)}
                                            options={this.props.Value.Role}
                                        />
                                        // <MultiSelect
                                        //     options={this.props.Value.Role}
                                        //     onChange={this.onDropDownMultiSelectChange.bind(this)}
                                        //     value={this.state.setSelectedOptions}
                                        // />
                                    }
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbProperty">Property</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <MultiSelectInline
                                            ID="ddlProperty"
                                            isMulti={true}
                                            value={this.state.setSelectedOptionsProperty}
                                            onChange={this.onDropDownMultiSelectChangeProperty.bind(this)}
                                            options={this.props.Value.Property}
                                        />
                                        // <MultiSelect
                                        //     options={this.props.Value.Property}
                                        //     onChange={this.onDropDownMultiSelectChangeProperty.bind(this)}
                                        //     value={this.state.setSelectedOptionsProperty}
                                        // />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <MultiSelectInline
                                            ID="ddlProperty"
                                            isMulti={true}
                                            value={this.state.setSelectedOptionsProperty}
                                            onChange={this.onDropDownMultiSelectChangeProperty.bind(this)}
                                            options={this.props.Value.Property}
                                        />
                                        // <MultiSelect
                                        //     options={this.props.Value.Property}
                                        //     onChange={this.onDropDownMultiSelectChangeProperty.bind(this)}
                                        //     value={this.state.setSelectedOptionsProperty}
                                        // />
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbUserType">User Type</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <SelectBox
                                            ID="ddlUserType"
                                            Value={this.state.Value.userTypeId}
                                            onSelected={this.onSelected.bind(this, "UserType")}
                                            Options={this.props.Value.UserType}
                                            ClassName="form-control form-control-sm" />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <SelectBox
                                            ID="ddlUserType"
                                            Value={this.state.Value.userTypeId}
                                            onSelected={this.onSelected.bind(this, "UserType")}
                                            Options={this.state.Value.UserType}
                                            ClassName="form-control form-control-sm" />
                                    }
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="lbVendor">Vendor</label>
                                    {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                        <SelectBox
                                            ID="ddlVendor"
                                            Value={this.state.Value.vendorId}
                                            onSelected={this.onSelected.bind(this, "Vendor")}
                                            Options={this.props.Value.Vendor}
                                            ClassName="form-control form-control-sm" />
                                    }
                                    {this.props.PageMode == "Add" &&
                                        <SelectBox
                                            ID="ddlVendor"
                                            Value={this.state.Value.vendorId}
                                            onSelected={this.onSelected.bind(this, "Vendor")}
                                            Options={this.props.Value.Vendor}
                                            ClassName="form-control form-control-sm" />
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    {(this.state.Showimguploader == true || this.props.PageMode == "Add") &&
                                        <div className="form-group">
                                            <label for="lbPictureUpload">Profile Image</label>

                                            <div style={{ display: "flex" }}>
                                                <div style={{ marginRight: "15px" }}>
                                                    <ImageUploader
                                                        ClassName="ImageView"
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
                                    }

                                    {this.props.PageMode == "Edit" && this.props.Data != undefined && this.state.Showimguploader == false &&
                                        <div style={{ marginRight: "15px" }}>
                                            <img className="ImageView" src={this.props.Data.profileImageUrl} style={{ height: "90px" }} />

                                        </div>

                                    }
                                    {this.state.Showimguploader == false && this.props.PageMode != "Add" &&
                                        <Button
                                            Id="bntShowimage"
                                            Text="Upload Image"
                                            Action={this.handleImagechange}
                                            ClassName="btn btn-link" />
                                    }
                                    {this.state.Showimguploader == true && this.props.PageMode != "Add" &&
                                        <Button
                                            Id="bnthideimage"
                                            Text="Cancel"
                                            Action={this.handleImageClose}
                                            ClassName="btn btn-link" />
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
                                                <label for="lbDocumentNumber">Document Number</label>
                                                {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                                    <InputBox Id="txtDocumentNumber"
                                                        onChange={this.updateDocumentNumber.bind(this)}
                                                        PlaceHolder="Document Number"
                                                        Value={this.state.documentNumber}
                                                        Class="form-control form-control-sm"
                                                    />
                                                }
                                                {this.props.PageMode == "Add" &&
                                                    <InputBox Id="txtDocumentNumber"
                                                        onChange={this.updateDocumentNumber.bind(this)}
                                                        PlaceHolder="Document Number"
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
                                                <label for="lbDocumentUpload">Select Upload</label>
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
                                                            onChange={this.onFileChange.bind(this)}
                                                        />
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <Button
                                                Id="btnAddDoc"
                                                Text="Upload Document"
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
                                                // onEditMethod={this.ongridedit.bind(this)}
                                                // onGridViewMethod={this.ongridview.bind(this)}
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
                                Action={this.handleUserSave.bind(this)}
                                ClassName="btn btn-primary" />
                            <Button
                                Id="btnCancel"
                                Text="Cancel"
                                Action={this.handleUserCancel}
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

export default connect(mapStoreToprops, mapDispatchToProps)(UserNew);