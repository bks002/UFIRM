import React, { Component, Fragment } from 'react';
import swal from 'sweetalert';

import * as appCommon from '../../Common/AppCommon';
import Button from '../../ReactComponents/Button/Button.jsx';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import DocumentUploader from '../../ReactComponents/FileUploader/DocumentUploader';
import InputDate from '../NoticeBoard/InputDate';

import { CreateTenantValidator, TenantValidateControls, UpdateTenantValidator, UpdateTenantValidateControls } from './Validation';
import { VALIDATION_ERROR, DELETE_CONFIRMATION_MSG } from '../../Contants/Common.js';
import { ShowImageModal } from '../KanbanBoard/ImageModal';

const $ = window.$;

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(','));
    // reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

class TenantBasicDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {

            gridTenantHeader: [
                { sTitle: 'ID', titleValue: 'id', "orderable": false, },
                { sTitle: 'Name', titleValue: 'name', "orderable": false, },
                { sTitle: 'Gender', titleValue: 'gender', "orderable": false, },
                { sTitle: 'MobileNumber', titleValue: 'mobilenumber', "orderable": false, },
                { sTitle: 'Email', titleValue: 'email', "orderable": false, },
                { sTitle: 'File', titleValue: 'filename', "orderable": false, },
                { sTitle: 'IsPrimary', titleValue: 'isprimary', "orderable": false, },
                { sTitle: 'FileData', titleValue: 'filedata', "orderable": false, bVisible: false },
                { sTitle: 'EditDocUrl', titleValue: 'editDocUrl', "orderable": false, bVisible: false },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&View&Delete", Index: '0', "orderable": false }
            ],
            currentSelectedFile: null,

            genderdllOptions: [
                { Id: '', Name: "Select Gender" },
                { Id: 'Male', Name: "Male" },
                { Id: 'Female', Name: "Female" },
                { Id: 'Other', Name: "Other" }
            ],

            tenantType: [
                { Id: '', Name: "Select Tenant Type" },
                { Id: 'true', Name: "Yes" },
                { Id: 'false', Name: "No" },
            ],

            selectedTenantType: '', selectedGender: '', tenantName: '', documentVal: '', tenantMobileNumber: '', tenantEmail: '',

            isUpdateBtn: false, tenantId: 0, isPirmaryDisabled: false
        }
    }
    // Dropdown value set
    onSelected(name, value) {
        switch (name) {
            case "ddlTenantGender":
                this.setState({ selectedGender: value })
                break;
            case "ddlTenantType":
                this.setState({ selectedTenantType: value })
                break;
            default:
        }
    }
    // textbox value set
    updatetextmodel = (ctrl, val) => {
        if (ctrl == 'TenantName') {
            this.setState({ tenantName: val });
        }
        else if (ctrl == 'TenantMobileNumber') {
            this.setState({ tenantMobileNumber: val });
        }
        else if (ctrl == 'TenantEmail') {
            this.setState({ tenantEmail: val });
        }

    }

    onAddTenant = async () => {
        CreateTenantValidator();
        if (TenantValidateControls()) {
            let UpFile = this.state.currentSelectedFile;
            let res = null;
            if (UpFile) {
                let fileD = await toBase64(UpFile);
                var imgbytes = UpFile.size; // Size returned in bytes.        
                var imgkbytes = Math.round(parseInt(imgbytes) / 1024); // Size returned in KB.    
                let extension = UpFile.name.substring(UpFile.name.lastIndexOf('.') + 1);
                res = {
                    filename: UpFile.name,
                    filepath: fileD[1],
                    sizeinKb: imgkbytes,
                    fileType: fileD[0],
                    extension: extension.toLowerCase()
                }
            }
            let data = this.props.tenantDetails;
            let existedName = data.some(x => x.name.toLowerCase() === this.state.tenantName.toLowerCase());

            if (!existedName) {
                let newData = {
                    id: data.length + 1,
                    name: this.state.tenantName,
                    gender: this.state.selectedGender,
                    mobilenumber: this.state.tenantMobileNumber,
                    email: this.state.tenantEmail,
                    filename: res ? res.filename : '',
                    filedata: res,
                    rowType: 'Add',
                    editDocUrl: null,
                    isprimary: this.state.selectedTenantType
                }

                this.setState({ selectedGender: '', documentVal: '', tenantName: '', tenantMobileNumber: '', tenantEmail: '', selectedTenantType: '' }
                    , () => this.props.getTenantDetails(newData, 'Add'));
            }
            else {
                appCommon.showtextalert(`${this.state.tenantName} Already Added`, "", "error");
            }
        }
    }
    onRemoveTenant(gridId) {
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
                        this.props.removeTenantDetails(gridId)
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

    ongridedit(gridId) {
        let data = this.props.tenantDetails.find(x => x.id === gridId);
        this.setState({
            selectedTenantType: data.isprimary, selectedGender: data.gender,
            tenantName: data.name, tenantMobileNumber: data.mobilenumber,
            tenantEmail: data.email, isUpdateBtn: true, tenantId: gridId,
            isPirmaryDisabled: true
        })
    }

    onUpdateTenant = async () => {
        UpdateTenantValidator();
        if (UpdateTenantValidateControls()) {
            let res = null;
            let UpFile = this.state.currentSelectedFile;

            if (UpFile) {
                let fileD = await toBase64(UpFile);
                var imgbytes = UpFile.size; // Size returned in bytes.        
                var imgkbytes = Math.round(parseInt(imgbytes) / 1024); // Size returned in KB.    
                let extension = UpFile.name.substring(UpFile.name.lastIndexOf('.') + 1);
                res = {
                    filename: UpFile.name,
                    filepath: fileD[1],
                    sizeinKb: imgkbytes,
                    fileType: fileD[0],
                    extension: extension.toLowerCase()
                }
            }

            let data = this.props.tenantDetails.find(x => x.id === this.state.tenantId);
            let newData = {
                id: data.id,
                name: this.state.tenantName,
                gender: this.state.selectedGender,
                mobilenumber: this.state.tenantMobileNumber,
                email: this.state.tenantEmail,
                filename: res ? res.filename : data.filename,
                filedata: res,
                rowType: 'Update',
                editDocUrl: res ? null : data.editDocUrl,
                isprimary: data.isprimary
            }

            this.setState({
                selectedGender: '', documentVal: '', tenantName: '', tenantMobileNumber: '',
                tenantEmail: '', selectedTenantType: '', isPirmaryDisabled: false, isUpdateBtn: false
            }
                , () => this.props.getTenantDetails(newData, data.rowType));
        }
    }

    onViewDocument(gridId) {
        let data = this.props.tenantDetails.find(x => x.id === gridId);
        if (data !== null) {
            if (data.rowType === 'View') {
                this.setState({
                    showImagefilename: data.filename,
                    showImagefiletype: null,
                    showImagefile: data.editDocUrl,
                    extension: ''
                },
                    () => {
                        $('#modal-lg-tenantImgPreview').modal('show')
                    })
            }
            else {
                this.setState({
                    showImagefilename: data.filedata.filename,
                    showImagefiletype: data.filedata.fileType,
                    showImagefile: data.filedata.filepath,
                    extension: data.filedata.extension
                },
                    () => {
                        $('#modal-lg-tenantImgPreview').modal('show')
                    })
            }
        }
    }

    // Document change
    onFileChange(event) {
        let _validFileExtensions = ["jpg", "jpeg", "png"];
        if (event.target.files[0]) {
            let extension = event.target.files[0].name.substring(event.target.files[0].name.lastIndexOf('.') + 1);
            let isvalidFiletype = _validFileExtensions.some(x => x === extension.toLowerCase());
            if (isvalidFiletype) {
                this.setState({ documentVal: event.target.value, currentSelectedFile: event.target.files[0] })
            }
            else {
                this.setState({ documentVal: '', currentSelectedFile: null })
                let temp_validFileExtensions = _validFileExtensions.join(',');
                appCommon.showtextalert(`${event.target.files[0].name.filename} Invalid file type, Please Select only ${temp_validFileExtensions} `, "", "error");
            }
        }
    };

    render() {
        return (
            <Fragment>
                <ShowImageModal
                    Id="modal-lg-tenantImgPreview"
                    titile={this.state.showImagefilename}
                    showImagefiletype={this.state.showImagefiletype}
                    showImagefile={this.state.showImagefile}
                    extension={this.state.extension}
                />

                <div className="card card-primary">
                    <div className="card-header">
                        <h3 className="card-title">Tenant Details</h3>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-sm-3">
                                <div className="form-group">
                                    <label htmlFor="ddlTenantGender">Is Primary </label>
                                    <SelectBox
                                        Value={this.state.selectedTenantType}
                                        ID="ddlTenantType"
                                        ClassName="form-control "
                                        onSelected={this.onSelected.bind(this, "ddlTenantType")}
                                        Options={this.state.tenantType}
                                        disabled={this.state.isPirmaryDisabled}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <div className="form-group">
                                    <label htmlFor="txtTenantName">Name</label>
                                    {/* <InputBox
                                        Type="text"
                                        Id="txtTenantName"
                                        PlaceHolder="Enter Name"
                                        className="form-control"
                                        Value={this.state.tenantName}
                                        onChange={this.updatetextmodel.bind(this, "TenantName")}
                                    /> */}
                                    <input
                                        type="text"
                                        id="txtTenantName"
                                        placeholder="Enter Name"
                                        className="form-control"
                                        value={this.state.tenantName}
                                        onChange={(e) => this.setState({ tenantName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <div className="form-group">
                                    <label htmlFor="ddlTenantGender">Gender </label>
                                    <SelectBox
                                        Value={this.state.selectedGender}
                                        ID="ddlTenantGender"
                                        ClassName="form-control "
                                        onSelected={this.onSelected.bind(this, "ddlTenantGender")}
                                        Options={this.state.genderdllOptions}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <div className="form-group">
                                    <label htmlFor="txtTenantMobileNumber">Mobile Number</label>
                                    {/* <InputBox
                                        Type="number"
                                        Id="txtTenantMobileNumber"
                                        PlaceHolder="Enter Mobile Number"
                                        className="form-control"
                                        Value={this.state.tenantMobileNumber}
                                        onChange={this.updatetextmodel.bind(this, "TenantMobileNumber")}
                                    /> */}
                                    <input
                                        type="text"
                                        id="txtTenantMobileNumber"
                                        placeholder="Enter Mobile Number"
                                        className="form-control"
                                        value={this.state.tenantMobileNumber}
                                        onChange={(e) => this.setState({ tenantMobileNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <div className="form-group">
                                    <label htmlFor="txtTenantEmail">Email</label>
                                    {/* <InputBox
                                        Type="email"
                                        Id="txtTenantEmail"
                                        PlaceHolder="Enter Email Address"
                                        className="form-control"
                                        Value={this.state.tenantEmail}
                                        onChange={this.updatetextmodel.bind(this, "TenantEmail")}
                                    /> */}
                                    <input
                                        type="text"
                                        id="txtTenantEmail"
                                        placeholder="Enter Email Address"
                                        className="form-control"
                                        value={this.state.tenantEmail}
                                        onChange={(e) => this.setState({ tenantEmail: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <div className="form-group">
                                    <label htmlFor="fileDocumentId">Profile Picture</label>
                                    <DocumentUploader
                                        Class={"form-control"}
                                        Id={"tenantfileDocumentUploader"}
                                        type={"file"}
                                        value={this.state.documentVal}
                                        onChange={this.onFileChange.bind(this)}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-3">
                                {
                                    this.state.isUpdateBtn ?
                                        <div className="form-group">
                                            <br></br>
                                            <Button
                                                Id="btnUpdateTenant"
                                                Text="Update"
                                                Action={this.onUpdateTenant.bind(this)}
                                                ClassName="btn btn-info mt-2" />
                                        </div>
                                        :
                                        <div className="form-group">
                                            <br></br>
                                            <Button
                                                Id="btnAddMoreTenant"
                                                Text="Add"
                                                Action={this.onAddTenant.bind(this)}
                                                ClassName="btn btn-info mt-2" />
                                        </div>
                                }
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <DataGrid
                                    Id="grdPropertyTenantDetails"
                                    IsPagination={false}
                                    ColumnCollection={this.state.gridTenantHeader}
                                    onEditMethod={this.ongridedit.bind(this)}
                                    onGridViewMethod={this.onViewDocument.bind(this)}
                                    onGridDeleteMethod={this.onRemoveTenant.bind(this)}
                                    GridData={this.props.tenantDetails.filter(item => item.rowType !== 'Delete')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default TenantBasicDetails;