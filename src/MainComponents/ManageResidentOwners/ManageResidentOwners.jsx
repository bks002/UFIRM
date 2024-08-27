import React from 'react'
import * as appCommon from '../../Common/AppCommon.js';
import swal from 'sweetalert';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from '../ManageResidentOwners/DataProvider.js';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import DropDownList from '../../ReactComponents/SelectBox/DropdownList.jsx';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import DocumentBL from '../../ComponentBL/DocumentBL';
import DocumentUploader from '../../ReactComponents/FileUploader/DocumentUploader.jsx';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';
import UrlProvider from "../../Common/ApiUrlProvider.js";
import ImageUploader from 'react-images-upload';
import { connect } from 'react-redux';
import departmentAction from '../../redux/department/action';
// import { promiseWrapper } from '../../utility/common';
import { bindActionCreators } from 'redux';
import { ToastContainer } from 'react-toastify';
import { CreateValidator, ValidateControls, VehicleValidateControls } from '../ManageResidentOwners/Validation.js';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import './ManageResidentOwners.css';
const $ = window.$;
const documentBL = new DocumentBL();
class ManageResidentOwners extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pictures: null,
            PageMode: 'Home',
            PropertyMemberId: '0',
            PropertyId: '0', ProfileImageUrl: '',
            FirstName: '', MiddleName: '', LastName: '', FlatDetailNumber: '', Contact: '', Email: '', ResidentTypeName: '',
            RelationshipTypeId: '0', RelationshipType: [],
            PropertyMemberType: [], PropertyMemberTypeValue: "Current",
            Showimguploader: false,
            grdTotalRows: 0,
            grdTotalPages: 0,

            gridPropertyMemberHeader: [
                { sTitle: 'Id', titleValue: 'propertyMemberId', "orderable": false, bVisible: false },//"visible": true 
                { sTitle: 'Image', titleValue: 'Image', ImagePath: 'profileImageUrl', Index: '0' },
                { sTitle: 'Name', titleValue: 'firstLastName', },
                { sTitle: 'Flat No', titleValue: 'flatDetailNumber' },
                { sTitle: 'Contact Number', titleValue: 'ToggleSwitch', Value: 'contactNumber', Index: '0', Width: '70' },
                { sTitle: 'Email Address&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', titleValue: 'ToggleSwitch', Value: 'emailAddress', Index: '0', Width: '90' },
                { sTitle: 'Occupation Status', titleValue: 'residentTypeName', },
                { sTitle: 'Approved On', titleValue: 'approvedOn' },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&View", Index: '0', "orderable": false },
            ],
            gridPropertyMemberData: [],
            gridDocumentHeader: [
                { sTitle: 'Id', titleValue: 'propertyMemberDocumentId', "orderable": false, bVisible: false },
                { sTitle: 'Document Type', titleValue: 'documentTypeName', "orderable": false, },
                { sTitle: 'Document Number', titleValue: 'documentName', "orderable": false, },
                { sTitle: 'Document Url', titleValue: 'documentUrl', "orderable": false, bVisible: false },
                { sTitle: 'Action', titleValue: 'Action', Action: "DownloadNDelete", Index: '0', urlIndex: '3', "orderable": false }
            ],
            gridDocumentData: [],
            gridVehicleHeader: [
                { sTitle: 'Id', titleValue: 'vehicleDetailId', "orderable": false, bVisible: false },
                { sTitle: 'Vehicle Type', titleValue: 'vehicleType', "orderable": false, },
                { sTitle: 'Vehicle Number', titleValue: 'vehicleNumber', "orderable": false, },
                { sTitle: 'Sticket Number', titleValue: 'stickerNumber', "orderable": false, },
                { sTitle: 'Action', titleValue: 'Action', Action: "Delete", Index: '0', "orderable": false }
            ],
            gridVehicleData: [],
            

            //Vehicle
            VehicleType: [], vehicleType: [], vehicleTypeId: "0", VehicleNumber: "", StickerNumber: "",
            //Document file
            DocumentType: [], documentType: [], documentTypeId: "0", documentName: "",
            selectedFile: undefined, selectedFileName: undefined, imageSrc: undefined, value: '',
            ViewInformation: false
        };
        this.onDrop = this.onDrop.bind(this);
        this.removeImage = this.removeImage.bind(this);
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    componentDidMount() {
        documentBL.CreateValidator();
        let propertyId = this.props.PropertyId;
        this.setState({ PropertyId: propertyId });
        this.loadFacilityMemberType();
        switch (this.props.PageName) {
            case 'Owners':
                var type = 'O';
                var model = this.getModel(type, this.props.PropertyDetailsId);
                this.managePropertyMember(model, type);
                break;
            case 'Residents':
                var type = 'M';
                var model = this.getModel(type, this.props.PropertyDetailsId);
                this.managePropertyMember(model, type);
                break;
            case 'AllMember':
                this.getPropertyMember(this.state.PropertyMemberTypeValue);
                break;
                default: break;
        };
        this.getFacilityType();
        this.getVehicleType();
        this.getDocumentType();
        $('#grdFacilityMember').find("[aria-label=Action]").addClass("addWidth");
    }

    componentDidUpdate(nextProps) {
        //documentBL.CreateValidator();
        if (nextProps.PropertyId != this.props.PropertyId) {
            switch (this.props.PageName) {
                case 'Owners':
                    var type = 'O';
                    var model = this.getModel(type, this.props.PropertyDetailsId);
                    this.managePropertyMember(model, type);
                    break;
                case 'Residents':
                    var type = 'M';
                    var model = this.getModel(type, this.props.PropertyDetailsId);
                    this.managePropertyMember(model, type);
                    break;
                case 'AllMember':
                    this.getPropertyMember(this.state.PropertyMemberTypeValue);
                    break;
            };
        }
    }

    loadFacilityMemberType() {
        let value = [{ "Value": "All", "Name": "All" }, { "Value": "Current", "Name": "Current" }, { "Value": "Old", "Name": "Old" }];
        this.setState({ PropertyMemberType: value });
    }
    getVehicleType() {
        let value = [{ "Id": "0", "Name": "Select Vehicle" }, { "Id": "2 wheeler", "Name": "2 wheeler" }, { "Id": "4 wheeler", "Name": "4 wheeler" }];
        this.setState({ VehicleType: value });
    }
    getPropertyMember(value) {
        var type = 'R';
        var model = this.getModel(type, value);
        this.managePropertyMember(model, type);
    }

    getFacilityType() {
        this.comdbprovider.getRelationshipType(0).then(
            resp => {
                //
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        rData = appCommon.changejsoncolumnname(rData, "relationshipTypeId", "Value");
                        rData = appCommon.changejsoncolumnname(rData, "relationship", "Name");
                        this.setState({ RelationshipType: rData });
                    });
                }
            });
    }

    async getDocumentType() {
        try {
            const resp = await this.comdbprovider.getDocumentType(0);
            if (resp.ok && resp.status === 200) {
                const rData = await resp.json();
                let documentTypeData = [{ "Id": "0", "Name": "Select Document Type" }];
                rData.forEach(element => {
                    documentTypeData.push({ Id: element.Id.toString(), Name: element.Name });
                });
                this.setState({ DocumentType: documentTypeData });
            }
        } catch (error) {
            console.error("Error fetching document types:", error);
        }
    }
    

    // getDocumentType() {
    //     this.comdbprovider.getDocumentType(0).then(
    //         resp => {
    //             if (resp.ok && resp.status == 200) {
    //                 return resp.json().then(rData => {
    //                     rData = appCommon.changejsoncolumnname(rData, "documentTypeId", "Id");
    //                     rData = appCommon.changejsoncolumnname(rData, "documentTypeName", "Name");
    //                     let documentTypeData = [{ "Id": "0", "Name": "Select Document Type" }];
    //                     rData.forEach(element => {
    //                         documentTypeData.push({ Id: element.Id.toString(), Name: element.Name });
    //                     });
    //                     this.setState({ DocumentType: documentTypeData });
    //                 });
    //             }
    //         });
    // }

    loadPropertyFlat(id) {
        this.comdbprovider.getPropertyFlat(id).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
                        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
                        this.setState({ PropertyFlat: rData });
                    });
                }
            });
    }

    managePropertyMember = (model, type) => {
        this.ApiProviderr.managePropertyMember(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'U':
                                if (rData > 0) {
                                    appCommon.showtextalert("Property Membem/Owner Updated Successfully", "", "success");
                                    this.handleCancel();
                                }
                                break;
                            case 'I':
                                if (rData) {
                                    let Id = model[0].Id;
                                    if (model[0].Action == "View") {
                                        this.setState({ PageMode: 'View' }, () => {

                                        });
                                        var rowData = this.findItem(Id);
                                        this.setState({ PropertyMemberId: rowData.propertyMemberId })
                                        this.setState({ ProfileImageUrl: rowData.profileImageUrl });
                                        this.setState({ FirstName: rowData.firstName });
                                        this.setState({ MiddleName: rowData.middleName });
                                        this.setState({ LastName: rowData.lastName });
                                        this.setState({ FlatDetailNumber: rowData.flatDetailNumber });
                                        this.setState({ Contact: rowData.contactNumber });
                                        this.setState({ Email: rowData.emailAddress });
                                        this.setState({ ResidentTypeName: rowData.residentTypeName });
                                        this.setState({ gridDocumentData: rowData.propertyMemberDocumentList });
                                        this.setState({ gridVehicleData: rowData.vehicleList });

                                        //swal('Success', 'View information successfully submitted.', 'success');
                                        swal.close();
                                    }
                                    if (model[0].Action == "Edit") {
                                        this.setState({ PageMode: 'Edit' }, () => {
                                            CreateValidator();
                                            documentBL.CreateValidator();
                                        });
                                        //this.getFacilityType();
                                        var rowData = this.findItem(Id);
                                        this.setState({ PropertyMemberId: rowData.propertyMemberId })
                                        this.setState({ ProfileImageUrl: rowData.profileImageUrl });
                                        this.setState({ FirstName: rowData.firstName });
                                        this.setState({ MiddleName: rowData.middleName });
                                        this.setState({ LastName: rowData.lastName });
                                        this.setState({ FlatDetailNumber: rowData.flatDetailNumber });
                                        this.setState({ Contact: rowData.contactNumber });
                                        this.setState({ Email: rowData.emailAddress });
                                        this.setState({ RelationshipTypeId: rowData.relationshipTypeId });
                                        $('#ddlRelationshipType').val(rowData.relationshipTypeId);


                                        //Vehicle Grid
                                        this.getVehicleType();

                                        let arrayCopy1 = [...this.state.VehicleType];
                                        this.setState({ vehicleType: arrayCopy1 });
                                        this.setState({ vehicleTypeId: "0" });
                                        this.setState({ gridVehicleData: rowData.vehicleList });

                                        //Document Grid
                                        this.getDocumentType();

                                        let arrayCopy = [...this.state.DocumentType];
                                        rowData.propertyMemberDocumentList.map((item) => {
                                            this.removeByAttr(arrayCopy, 'Id', item.documentTypeId.toString());
                                        });
                                        this.setState({ documentType: arrayCopy });
                                        this.setState({ documentTypeId: "0" });

                                        this.setState({ gridDocumentData: rowData.propertyMemberDocumentList });

                                        //swal('Success', 'Edit information successfully submitted.', 'success');
                                        swal.close();
                                    }
                                }

                                break;
                            case 'R':
                                //
                                this.setState({ grdTotalPages: rData.totalPages });
                                this.setState({ grdTotalRows: rData.totalRows });
                                this.setState({ gridPropertyMemberData: rData.propertyMember });
                                break;
                            case 'O':
                                //
                                this.setState({ grdTotalPages: rData.totalPages });
                                this.setState({ grdTotalRows: rData.totalRows });
                                this.setState({ gridPropertyMemberData: rData.propertyMember });
                                break;
                            case 'M':
                                //
                                this.setState({ grdTotalPages: rData.totalPages });
                                this.setState({ grdTotalRows: rData.totalRows });
                                this.setState({ gridPropertyMemberData: rData.propertyMember });
                                break;
                            default:
                        }
                    });
                }
            });
    }

    onPagechange = (page) => {
        this.setState({ pageNumber: page }, () => {
            switch (this.props.PageName) {
                case 'Owners':
                    var type = 'O';
                    var model = this.getModel(type, this.props.PropertyDetailsId);
                    this.managePropertyMember(model, type);
                    break;
                case 'Residents':
                    var type = 'M';
                    var model = this.getModel(type, this.props.PropertyDetailsId);
                    this.managePropertyMember(model, type);
                    break;
                case 'AllMember':
                    this.getPropertyMember(this.state.PropertyMemberTypeValue);
                    break;
            };
        });
    }

    onDrop(pictureFiles, pictureDataURLs) {
        this.setState({ pictures: pictureFiles });
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
                        var model = [{ "facilityMemberId": parseInt(Id) }];
                        this.managePropertyMember(model, 'D');
                        break;
                    case "cancel":
                        break;
                    default:
                        break;
                }
            })
        );
    }


    viewInformation = (action, Id) => {
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
            title: "View Personal Information",
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
                _this.managePropertyMember(model, 'I');
            }

            if (value === true || value === '') {
                swal("", "You need to write something!", "info");
            }
        });
    }

    async ongridedit(Id) {
        this.viewInformation("Edit", Id);
    }

    findItem(id) {
        return this.state.gridPropertyMemberData.find((item) => {
            if (item.propertyMemberId == id) {
                return item;
            }
        });
    }

    getModel = (type, value) => {
        var model = [];
        switch (type) {
            case 'R':
                model.push({
                    "SearchValue": "NULL",
                    "PageSize": "10",
                    "PageNumber": "1",
                    "PropertyId": this.props.PropertyId,
                    "PropertyMemberType": value
                });
                break;
            case 'U':

                break;
            case 'C':
                this.setState({ PropertyId: '0', pictures: null, ProfileImageUrl: '' });
                this.setState({ FirstName: '', MiddleName: '', LastName: '', Contact: '', Email: '', ResidentTypeName: '' });
                this.setState({ PropertyMemberId: '0' });
                this.setState({ RelationshipTypeId: '0' });
                this.setState({ gridPropertyMemberData: [], gridDocumentData: [] });
                this.setState({ documentType: [], documentTypeId: "0", documentName: "" });
                this.removeImage();
                break;
            case 'I':
                model.push({
                    "FormName": "ManageResidentOwner",
                    "Action": "Edit",
                    "JustificationComment": value
                });
                break;
            case 'O':
                model.push({
                    PropertyDetailsId: value,
                    IsOwner: 1
                });
                break;
            case 'M':
                model.push({
                    PropertyDetailsId: value,
                    IsOwner: 0
                });
                break;
            default:
        };
        return model;
    }

    handleSave = () => {
        let url = new UrlProvider().MainUrl;
        if (ValidateControls()) {
            const formData = new FormData();
            formData.append('imageFile', this.state.pictures != null ? this.state.pictures[0] : null);
            formData.append('propertyMemberId', this.state.PropertyMemberId);
            formData.append('firstName', $('#txtFirstName').val());
            formData.append('middleName', $('#txtMiddleName').val());
            formData.append('lastName', $('#txtLastName').val());
            formData.append('relationshipTypeId', this.state.RelationshipTypeId);
            this.state.gridDocumentData.map((item) => { formData.append('files', item.selectedFile); });
            formData.append('document', JSON.stringify(this.state.gridDocumentData));
            formData.append('vehicle', JSON.stringify(this.state.gridVehicleData));
            //this.managePropertyMember(formData, 'U');
            this.ApiProviderr.savePropertyMember(formData)
                .then(res => {
                    if (res.data > 0) {
                        appCommon.showtextalert("Property Membem/Owner Updated Successfully", "", "success");
                        this.handleCancel();
                    }
                });
        }
    }

    handleCancel = () => {
        switch (this.props.PageName) {
            case 'Owners':
                var type = 'O';
                var model = this.getModel(type, this.props.PropertyDetailsId);
                this.managePropertyMember(model, type);
                this.setState({ PageMode: 'Home' });
                break;
            case 'Residents':
                var type = 'M';
                var model = this.getModel(type, this.props.PropertyDetailsId);
                this.managePropertyMember(model, type);
                this.setState({ PageMode: 'Home' });
                break;
            case 'AllMember':
                var type = 'C';
                this.getModel(type);
                this.getPropertyMember(this.state.PropertyMemberTypeValue);
                this.setState({ PageMode: 'Home' });
                break;
        };
    };

    onSelected(name, value) {
        switch (name) {
            case "DocumentType":
                this.setState({ documentTypeId: value });
                break;
            case "PropertyMemberType":
                this.setState({ PropertyMemberTypeValue: value });
                this.getPropertyMember(value);
                break;
            case "VehicleType":
                this.setState({ vehicleTypeId: value });
                break;
            default:
        }
    }

    removeImage() {
        this.setState({
            selectedFile: undefined,
            selectedFileName: undefined,
            imageSrc: undefined,
            value: ''
        });
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
            let gridDocumentData = this.state.gridDocumentData;
            gridDocumentData.push({
                propertyMemberDocumentId: this.state.documentTypeId,
                //documentTypeId: this.state.documentTypeId,
                documentTypeName: documentTypeName,
                documentName: this.state.documentName,
                documentFileName: this.state.selectedFileName,
                documentUrl: this.state.imageSrc,
                selectedFile: this.state.selectedFile
            });
            this.setState({ gridDocumentData: gridDocumentData });
            //clear object
            this.setState({ documentName: " " });
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
                        this.setState({ gridDocumentData: this.removeByAttr(this.state.gridDocumentData, 'propertyMemberDocumentId', gridId) });

                        //dropdown

                        let documentType = this.state.documentType;
                        this.state.documentType.map((item) => {
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

    ongridview(Id) {
        this.viewInformation("View", Id);
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

    updateData = (name, value) => {
        switch (name) {
            case "FirstName":
                this.setState({ FirstName: value });
                break;
            case "MiddleName":
                this.setState({ MiddleName: value });
                break;
            case "LastName":
                this.setState({ LastName: value });
                break;
            case "Name":
                this.setState({ Name: value });
                break;
            case "Contact":
                this.setState({ Contact: value });
                break;
            case "Email":
                this.setState({ Email: value });
                break;
            case "DocumentName":
                this.setState({ documentName: value });
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

    onDropdownChanges = (value, id) => {
        switch (value) {
            case "RelationshipType":
                this.setState({ RelationshipTypeId: id });
                break;
            default:
        }
    }

    onVehicleGridDelete(gridId) {
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
                        this.setState({ gridVehicleData: this.removeByAttr(this.state.gridVehicleData, 'vehicleDetailId', gridId) });
                        appCommon.showtextalert("Vehicle Deleted Successfully", "", "success");
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

    handleVehicleSave = () => {
        if (VehicleValidateControls()) {
            let gridVehicleData = this.state.gridVehicleData;
            gridVehicleData.push({
                vehicleDetailId: Math.floor(100000 + Math.random() * 900000),
                vehicleType: this.state.vehicleTypeId,
                vehicleNumber: this.state.VehicleNumber,
                stickerNumber: this.state.StickerNumber
            });
            this.setState({ gridVehicleData: gridVehicleData });
            this.resetVehicle();
        }
    }

    resetVehicle() {
        this.setState({ vehicleTypeId: "0", VehicleNumber: " ", StickerNumber: " " });
    }

    handleImagechange = () => {
        this.setState({ Showimguploader: true });
    }
    handleImageClose = () => {
        this.setState({ Showimguploader: false });
    }

    //End
    render() {
        return (
            <div>
                {this.state.PageMode == 'Home' && 
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                {this.props.PageName == 'AllMember' && <div className="card-header d-flex p-0">
                                    <ul className="nav tableFilterContainer">
                                        <li className="nav-item">
                                            <div className="input-group input-group-sm">
                                                <div className="input-group-prepend">
                                                    <SelectBox
                                                        ID="ddlFacilityMemberType"
                                                        Value={this.state.PropertyMemberTypeValue}
                                                        onSelected={this.onSelected.bind(this, "PropertyMemberType")}
                                                        Options={this.state.PropertyMemberType}
                                                        ClassName="form-control form-control-sm" />
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>}
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
                                        IsSarching="true"
                                        GridData={this.state.gridPropertyMemberData}
                                        pageSize="500" />
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {(this.state.PageMode == 'View' || this.state.PageMode == 'Edit') &&
                    <div>
                        <div>
                            <div className="modal-content">
                                <div className="modal-body">
                                    <div className="row">
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="lblFirstName">First Name</label>
                                                {this.state.PageMode == "View" &&
                                                    <div className="dummyBox">
                                                        {this.state.FirstName}
                                                    </div>
                                                }
                                                {this.state.PageMode == "Edit" &&
                                                    <InputBox Id="txtFirstName"
                                                        Value={this.state.FirstName}
                                                        onChange={this.updateData.bind(this, "FirstName")}
                                                        PlaceHolder="First Name"
                                                        className="form-control form-control-sm"
                                                    />
                                                }
                                            </div>
                                        </div>
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="lblMiddleName">Middle Name</label>
                                                {this.state.PageMode == "View" &&
                                                    <div className="dummyBox">
                                                        {this.state.MiddleName}
                                                    </div>
                                                }
                                                {this.state.PageMode == "Edit" &&
                                                    <InputBox Id="txtMiddleName"
                                                        Value={this.state.MiddleName}
                                                        onChange={this.updateData.bind(this, "MiddleName")}
                                                        PlaceHolder="Middle Name"
                                                        className="form-control form-control-sm"
                                                    />
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="lblLastName">Last Name</label>
                                                {this.state.PageMode == "View" &&
                                                    <div className="dummyBox">
                                                        {this.state.LastName}
                                                    </div>
                                                }
                                                {this.state.PageMode == "Edit" &&
                                                    <InputBox Id="txtLastName"
                                                        Value={this.state.LastName}
                                                        onChange={this.updateData.bind(this, "LastName")}
                                                        PlaceHolder="Last Name"
                                                        className="form-control form-control-sm"
                                                    />
                                                }
                                            </div>
                                        </div>
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="lblFlatNo">Flat No</label>
                                                <div className="dummyBox">
                                                    {this.state.FlatDetailNumber}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="lblContact">Contact</label>
                                                <div className="dummyBox">
                                                    {this.state.Contact}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="lblAddress">Email Address</label>
                                                <div className="dummyBox">
                                                    {this.state.Email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="lblRelationshipType">Resident Type</label>
                                                {this.state.PageMode == "View" &&
                                                    <div className="dummyBox">
                                                        {this.state.ResidentTypeName}
                                                    </div>
                                                }
                                                {this.state.PageMode == "Edit" &&
                                                    <DropDownList Id="ddlRelationshipType"
                                                        onSelected={this.onDropdownChanges.bind(this, "RelationshipType")}
                                                        Options={this.state.RelationshipType} />
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                {this.state.Showimguploader == true && this.state.PageMode == "Edit" &&
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

                                                {this.state.Showimguploader == false &&
                                                    <div style={{ marginRight: "15px" }}>
                                                        <img className="ImageView" src={this.state.ProfileImageUrl} style={{ height: "90px" }} />
                                                    </div>
                                                }

                                                {this.state.Showimguploader == false && this.state.PageMode == "Edit" &&
                                                    <Button
                                                        Id="bntShowimage"
                                                        Text="Upload Image"
                                                        Action={this.handleImagechange}
                                                        ClassName="btn btn-link" />
                                                }

                                                {this.state.Showimguploader == true && this.state.PageMode == "Edit" &&
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
                                            <div class="modal-header">
                                                <h4 class="modal-title">Document Details</h4>
                                            </div>
                                            <div className="modal-body">
                                                {this.state.PageMode == "Edit" &&
                                                    <div>
                                                        <div className="row">
                                                            <div className="col-sm-6">
                                                                <div className="form-group">
                                                                    <label for="lbDocumentType">Document Type</label>
                                                                    <SelectBox
                                                                        ID="ddlDocumentType"
                                                                        Value={this.state.documentTypeId}
                                                                        onSelected={this.onSelected.bind(this, "DocumentType")}
                                                                        Options={this.state.documentType}
                                                                        ClassName="form-control form-control-sm" />
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-6">
                                                                <div className="form-group">
                                                                    <label for="lbDocumentName">Document Name</label>
                                                                    <InputBox Id="txtDocumentName"
                                                                        onChange={this.updateData.bind(this, "DocumentName")}
                                                                        PlaceHolder="Document Name"
                                                                        Value={this.state.documentName}
                                                                        Class="form-control form-control-sm"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-sm-6">
                                                                <div className="form-group">
                                                                    <label for="lbDocumentUpload">Document Upload</label>
                                                                    <div className="pr-inner-block mar-bottom-zero-cover">
                                                                        <DocumentUploader
                                                                            Class={"form-control form-control-sm"}
                                                                            Id={"fileDocumentUploader"}
                                                                            type={"file"}
                                                                            value={this.state.value}
                                                                            onChange={this.onFileChange.bind(this)} />
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
                                                    </div>}
                                                <div className="row">
                                                    <div className="col-sm-12">
                                                        {this.state.PageMode == "View" &&
                                                            <DataGrid
                                                                Id="grdDocView"
                                                                IsPagination={false}
                                                                ColumnCollection={this.state.gridDocumentHeader}
                                                                onGridDeleteMethod={this.onDocumentGridDelete.bind(this)}
                                                                onGridDownloadMethod={this.onDocumentGridData.bind(this)}
                                                                GridData={this.state.gridDocumentData}
                                                            />
                                                        }
                                                        {this.state.PageMode == "Edit" &&
                                                            <DataGrid
                                                                Id="grdDocEdit"
                                                                IsPagination={false}
                                                                ColumnCollection={this.state.gridDocumentHeader}
                                                                onGridDeleteMethod={this.onDocumentGridDelete.bind(this)}
                                                                onGridDownloadMethod={this.onDocumentGridData.bind(this)}
                                                                GridData={this.state.gridDocumentData}
                                                            />
                                                        }

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="modal-content">
                                            <div class="modal-header">
                                                <h4 class="modal-title">Vehicle Details</h4>
                                            </div>
                                            <div className="modal-body">
                                                {this.state.PageMode == "Edit" &&
                                                    <div>
                                                        <div className="row">
                                                            <div className="col-sm-6">
                                                                <div className="form-group">
                                                                    <label for="lbDocumentUpload">Vehicle Type</label>
                                                                    <div className="pr-inner-block mar-bottom-zero-cover">
                                                                        <SelectBox
                                                                            ID="ddlVehicleType"
                                                                            Value={this.state.vehicleTypeId}
                                                                            onSelected={this.onSelected.bind(this, "VehicleType")}
                                                                            Options={this.state.vehicleType}
                                                                            ClassName="form-control form-control-sm" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-sm-6">
                                                                <div className="form-group">
                                                                    <label for="lbVehicleNumber">Vehicle Number</label>
                                                                    <InputBox Id="txtVehicleNumber"
                                                                        onChange={this.updateData.bind(this, "VehicleNumber")}
                                                                        PlaceHolder="Vehicle Number"
                                                                        Value={this.state.VehicleNumber}
                                                                        Class="form-control form-control-sm"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-6">
                                                                <div className="form-group">
                                                                    <label for="lbStickerNumber">Sticker Number</label>
                                                                    <InputBox Id="txtStickerNumber"
                                                                        onChange={this.updateData.bind(this, "StickerNumber")}
                                                                        PlaceHolder="Sticker Number"
                                                                        Value={this.state.StickerNumber}
                                                                        Class="form-control form-control-sm"
                                                                    />
                                                                </div>
                                                            </div>

                                                        </div>
                                                        <div className="row">
                                                            <div className="col-sm-6">
                                                                <Button
                                                                    Id="btnAddVehicle"
                                                                    Text="Save Vehicle"
                                                                    Action={this.handleVehicleSave.bind(this)}
                                                                    ClassName="btn btn-primary" />
                                                            </div>
                                                        </div>
                                                    </div>}
                                                <div className="row">
                                                    <div className="col-sm-12">
                                                        {this.state.PageMode == "View" &&
                                                            <DataGrid
                                                                Id="grdVehicleView"
                                                                IsPagination={false}
                                                                ColumnCollection={this.state.gridVehicleHeader}
                                                                GridData={this.state.gridVehicleData}
                                                                onGridDeleteMethod={this.onVehicleGridDelete.bind(this)}
                                                            />
                                                        }
                                                        {this.state.PageMode == "Edit" &&
                                                            <DataGrid
                                                                Id="grdVehicleEdit"
                                                                IsPagination={false}
                                                                ColumnCollection={this.state.gridVehicleHeader}
                                                                GridData={this.state.gridVehicleData}
                                                                onGridDeleteMethod={this.onVehicleGridDelete.bind(this)}
                                                            />
                                                        }

                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                <div className="modal-footer">
                                    {
                                        this.state.PageMode == "Edit" &&
                                        <Button
                                            Id="btnSave"
                                            Text="Update"
                                            Action={this.handleSave.bind(this)}
                                            ClassName="btn btn-primary" />
                                    }
                                    <Button
                                        Id="btnCancel"
                                        Text="Cancel"
                                        Action={this.handleCancel}
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
export default connect(mapStoreToprops, mapDispatchToProps)(ManageResidentOwners);