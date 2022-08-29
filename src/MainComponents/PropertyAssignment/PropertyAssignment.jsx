import React from 'react'
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from '../PropertyAssignment/DataProvider.js';
import { ToastContainer, toast } from 'react-toastify';
import * as appCommon from '../../Common/AppCommon.js';
import swal from 'sweetalert';
import { CreateValidator, ValidateControls } from '../PropertyAssignment/Validation.js';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import MultiSelectInline from '../../ReactComponents/MultiSelectInline/MultiSelectInline.jsx';
import DropDownList from '../../ReactComponents/SelectBox/DropdownList.jsx';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import DocumentBL from '../../ComponentBL/DocumentBL';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import DocumentUploader from '../../ReactComponents/FileUploader/DocumentUploader.jsx';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';
import UrlProvider from "../../Common/ApiUrlProvider.js";
import axios from 'axios'

import { connect } from 'react-redux';
import departmentAction from '../../redux/department/action';
import { promiseWrapper } from '../../utility/common';
import { bindActionCreators } from 'redux';

const $ = window.$;
const documentBL = new DocumentBL();

class PropertyAssignment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            PropertyId: '0', PropertyListData: [],
            PropertyTowerId: '0', PropertyTowersData: [],
            OwnershipId: '0', OwnershipData: [],
            OwnerId: [], OwnerData: [],
            FloorId: '0', PropertyFloors: [],
            FlatId: '0', FlatData: [],
            
            gridHeader: [
                { sTitle: 'Id', titleValue: 'memberPropertyMappingId', "orderable": false, "visible": true },
                { sTitle: 'PropertyName', titleValue: 'propertyName', },
                { sTitle: 'Tower', titleValue: 'towerName', },
                { sTitle: 'Flat', titleValue: 'flat', },
                { sTitle: 'Owner Type', titleValue: 'ownerTypeName', },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],
            gridPropertyMemberDocumentHeader: [
                { sTitle: 'Id', titleValue: 'propertyMemberDocumentId', "orderable": false, },
                { sTitle: 'Document Type', titleValue: 'documentTypeName', "orderable": false, },
                { sTitle: 'Document Name', titleValue: 'documentName', "orderable": false, },
                { sTitle: 'Document Url', titleValue: 'documentUrl', "orderable": false, },
                { sTitle: 'Action', titleValue: 'Action', Action: "DownloadNDelete", Index: '0', urlIndex: '3', "orderable": false }
            ],
            GridData: [],
            gridPropertyMemberDocumentData: [],

            DocumentType:[], documentType: [], documentTypeId: "0", documentName: "",
            //Document file
            selectedFile: undefined, selectedFileName: undefined, imageSrc: undefined, value: '',
            
        };
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    componentDidMount() {
        
        documentBL.CreateValidator();
        this.getPropertyMaster();
        promiseWrapper(this.props.actions.fetchDocumentType, { DocumentTypeId: 0 }).then((data) => {
            let documentTypeData = [{"Id": "0","Name": "Select Document Type"}];
            data.forEach(element => {
                documentTypeData.push({Id: element.documentTypeId.toString(), Name: element.documentTypeName});
            });
            this.setState({ DocumentType: documentTypeData });
        });
    }

    getPropertyMaster() {
        var type = 'R';
        var model = this.getModel(type);
        this.managePropertyAssignment(model, type);
    }

    managePropertyAssignment = (model, type) => {
        this.ApiProviderr.managePropertyAssignment(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'U':
                                appCommon.showtextalert("Property Assignment Saved Successfully!", "", "success");
                                this.handleCancel();
                                break;
                            case 'D':
                                appCommon.showtextalert("Property Assignment Deleted Successfully!", "", "success");
                                this.handleCancel();
                                break;
                            case 'R':
                                this.setState({ GridData: rData });
                                break;
                            default:
                        }
                    });
                }
            });
    }

    async addNew() {
        this.setState({ PageMode: 'Add' }, () => {
            CreateValidator();
            documentBL.CreateValidator();
        });
        await this.loadProperty();
        await this.loadOwnershipType();
        await this.loadPropertyMember();
        let arrayCopy = [...this.state.DocumentType];
        this.setState({ documentType: arrayCopy });
        this.setState({ documentTypeId: "0" });
    }

    async loadProperty() {
        //
        await this.comdbprovider.getPropertyMaster(0).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
                        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
                        this.setState({ PropertyListData: rData }, () => {

                        });
                        //this.setState({ PropertyListData: rData });
                    });
                }
            });
        // let pData = [{ "Id": "0", "Name": "Select Property" }];
        // this.state.PropertyListData.map((item) => {
        //     pData.push(item);
        // });
        // this.setState({ PropertyListData: pData });
    }

    async loadOwnershipType() {
        //
        await this.comdbprovider.getOwnershipType(0).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        // rData = appCommon.changejsoncolumnname(rData, "ownershipTypeId", "Id");
                        // rData = appCommon.changejsoncolumnname(rData, "ownership", "Name");
                        rData = appCommon.changejsoncolumnname(rData, "ownershipTypeId", "Value");
                        rData = appCommon.changejsoncolumnname(rData, "ownership", "Name");
                        this.setState({ OwnershipData: rData });
                    });
                }
            });
    }

    loadPropertyTowers(id) {
        this.comdbprovider.getPropertyTowers(id).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        //
                        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
                        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
                        this.setState({ PropertyTowersData: rData }, () => {

                        });
                    });
                }

            });
    }

    async loadPropertyMember () {
        await this.comdbprovider.getPropertyMember(0).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        console.log(rData);
                        rData = appCommon.changejsoncolumnname(rData, "id", "Id");
                        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
                        // rData.map((item) => { item.value = item.Name, item.label = item.Name, item.color = '#0052CC'; return item });
                        // this.setState({ OwnerData: rData });
                    })
                }
            });
    }



    onPagechange = (page) => { }

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
                        var model = [{ "memberPropertyMappingId": parseInt(Id) }];
                        this.managePropertyAssignment(model, 'D');
                        break;
                    case "cancel":
                        break;
                    default:
                        break;
                }
            })
        );
    }

    async ongridedit(Id) {
        

        this.setState({ PageMode: 'Edit' });
        await CreateValidator();
        documentBL.CreateValidator();
        await this.loadProperty();
        var rowData = this.findItem(Id);
        let arrayCopy = [...this.state.DocumentType];
        rowData.propertyMemberDocumentList.map((item) => {
            this.removeByAttr(arrayCopy, 'Id', item.documentTypeId.toString());
        });
        this.setState({ documentType: arrayCopy });
        this.setState({ documentTypeId: "0" });
        //Document Grid
        this.setState({ gridPropertyMemberDocumentData: rowData.propertyMemberDocumentList });
        $('#ddlPropertyList').val(rowData.propertyId);
        await this.loadOwnershipType();
        $('#ddlOwnership').val(rowData.ownerTypeId);
        await this.loadPropertyMember();
        this.comdbprovider.getPropertyTowers(rowData.propertyTowerId).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        //
                        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
                        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
                        this.setState({ PropertyTowersData: rData }, () => {
                            $('#ddlTowerList').val(rowData.propertyTowerId);
                            this.onTowerChanges(rowData.propertyTowerId);
                            $('#ddlFloorsList').val(rowData.floor);
                            //this.oncFloorChange(rowData.floor);
                            let model = [{ "PropertyId": rowData.propertyId, "PropertyTowerId": rowData.propertyTowerId, "Floor": rowData.floor }];
                            this.ApiProviderr.getPropertyFlat(model).then(
                                resp => {
                                    if (resp.ok && resp.status == 200) {
                                        return resp.json().then(rData => {
                                            rData = appCommon.changejsoncolumnname(rData, "id", "Id");
                                            rData = appCommon.changejsoncolumnname(rData, "text", "Name");
                                            this.setState({ FlatData: rData }, () => {
                                                //$("option:selected", rowData.flat).text()
                                                this.onFlatChange(rowData.flat);
                                            });
                                        });
                                    }
                                });

                        });
                    });
                }
            });
        let data = [];
        rowData.ownerList.map((i, index) => (
            data.push({ Id: i.id, Name: i.name, value: i.name, label: i.name, color: '#0052CC' })
        ));
        this.onOwnerChanged(data);
    }



    findItem(id) {
        return this.state.GridData.find((item) => {
            if (item.memberPropertyMappingId == id) {
                return item;
            }
        });
    }

    getModel = (type) => {
        var model = [];
        switch (type) {
            case 'R':
                model.push({
                    "SearchValue": "NULL",
                    "PageSize": "10",
                    "PageNumber": "1"
                });
                break;
            case 'U':
                
                model.push({
                    "propertyId": parseInt($('#ddlPropertyList').val()),
                    "propertyTowerId": parseInt($('#ddlTowerList').val()),
                    "floorId": parseInt($('#ddlFloorsList').val()),
                    "flat": $( "#ddlFlatList option:selected" ).text().toString(),
                    "ownerTypeId" : parseInt($('#ddlOwnership').val()),
                    "ownerId": JSON.stringify(this.state.OwnerId),
                });
                break;
            case 'C':
                this.setState({ PropertyId: '0', PropertyListData: [{ "Id": "0", "Name": "Select Property" }] });
                this.setState({ PropertyTowerId: '0', PropertyTowersData: [{ "Id": "0", "Name": "Select Tower" }] });
                this.setState({ FloorId: '0', PropertyFloors: [{ "Id": "0", "Name": "Select Floor" }] });
                this.setState({ FlatId: '0', FlatData: [{ "Id": "0", "Name": "Select Flat" }] });
                this.setState({ OwnershipId: '0', OwnershipData: [{ "Id": "0", "Name": "Select Ownership" }] });
                this.setState({ OwnerId: '0', OwnerData: [] });
                this.setState({ GridData: [], gridPropertyMemberDocumentData: [] });
                this.setState({ documentType: [], documentTypeId: "0", documentName: "" });
                this.removeImage();
                break;
            default:
        };
        return model;
    }

    handleSave = () => {
        
        let url = new UrlProvider().MainUrl;
        if (ValidateControls()) {
            //var type = 'U';
            //var model = this.getModel(type);
            //this.managePropertyAssignment(model, type);
            const formData = new FormData();
            this.state.gridPropertyMemberDocumentData.map((item) => {
                formData.append('files', item.selectedFile);
            });
            formData.append('document', JSON.stringify(this.state.gridPropertyMemberDocumentData));
            formData.append("propertyId", parseInt($('#ddlPropertyList').val()));
            formData.append("propertyTowerId", parseInt($('#ddlTowerList').val()));
            formData.append("floorId", parseInt($('#ddlFloorsList').val()));
            formData.append("flat", $("#ddlFlatList option:selected").text().toString());
            formData.append("ownerTypeId", parseInt($('#ddlOwnership').val()));
            formData.append("ownerId", JSON.stringify(this.state.OwnerId));

            this.ApiProviderr.savePropertyAssignment(formData)
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
            // axios.post(url + `Property/PropertyAssignment/Save`, formData, {
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
    }

    handleCancel = () => {
        var type = 'C';
        this.getModel(type);
        this.getPropertyMaster();
        this.setState({ PageMode: 'Home' });
    };

    onSelected(name, value) {
        
        switch (name) {
            case "DocumentType":
                this.setState({ documentTypeId: value });
                break;
            default:
        }
    }

    onPropertyChanged(value) {
        //
        this.setState({ PropertyId: parseInt(value) }, () => {
            this.setState({ PropertyTowersData: [], PropertyFloors: [] }, () => {
                this.loadPropertyTowers(value);
            });
        });
    }

    onTowerChanges(id) {
        var searchvalue = [];
        this.state.PropertyTowersData.find((item) => {
            if (item.Value == id) {
                searchvalue = item;
            }
        });
        var floors = [];
        for (let index = 0; index < searchvalue.totalFloors; index++) {
            floors.push({
                Value: index + 1,
                Name: index + 1
            });
        }
        this.setState({ PropertyTowerId: parseInt(id) });
        this.setState({ PropertyFloors: floors });
    }


    async oncFloorChange(value) {
        console.log(this.state.PropertyId);
        console.log(this.state.PropertyTowerId);
        this.setState({ Floor: parseInt(value) });
        let model = [{ "PropertyId": this.state.PropertyId, "PropertyTowerId": this.state.PropertyTowerId, "Floor": parseInt(value) }];
        await this.ApiProviderr.getPropertyFlat(model).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
                        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
                        this.setState({ FlatData: rData }, () => {

                        });
                    });
                }
            });

    }

    async onFlatChange(value) {
        $('#ddlFlatList').val(value);
    }


    async onOwnershipTypeChanged(value) {
        this.setState({ OwnershipId: value });
    }

    async onOwnerChanged(value) {
        this.setState({ OwnerId: value });
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
            let gridPropertyMemberDocumentData = this.state.gridPropertyMemberDocumentData;
            gridPropertyMemberDocumentData.push({
                propertyMemberDocumentId: 0,
                documentTypeId: this.state.documentTypeId,
                documentTypeName: documentTypeName,
                documentName: this.state.documentName,
                documentFileName: this.state.selectedFileName,
                documentUrl: this.state.imageSrc,
                selectedFile: this.state.selectedFile
            });
            this.setState({ gridPropertyMemberDocumentData: gridPropertyMemberDocumentData });
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
                        
                        this.setState({ gridPropertyMemberDocumentData: this.removeByAttr(this.state.gridPropertyMemberDocumentData, 'propertyMemberDocumentId', gridId) });

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
                this.setState({ documentName: value });
                break;
            default:
        }
    }

    //End
    render() {
        return (
            <div>
                {this.state.PageMode == 'Home' &&
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header d-flex p-0">
                                    <ul className="nav ml-auto tableFilterContainer">
                                        <li className="nav-item">
                                            <div className="input-group input-group-sm">
                                                <div className="input-group-prepend">
                                                    <Button id="btnNewComplain"
                                                        Action={this.addNew.bind(this)}
                                                        ClassName="btn btn-success btn-sm"
                                                        Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                                        Text=" Property Assign" />
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div className="card-body pt-2">
                                    <DataGrid
                                        Id="grdPrakingZone"
                                        IsPagination={false}
                                        ColumnCollection={this.state.gridHeader}
                                        // totalpages={this.state.grdTotalPages}
                                        // totalrows={this.state.grdTotalRows}
                                        Onpageindexchanged={this.onPagechange.bind(this)}
                                        onEditMethod={this.ongridedit.bind(this)}
                                        onGridDeleteMethod={this.onGridDelete.bind(this)}
                                        DefaultPagination={false}
                                        IsSarching="true"
                                        GridData={this.state.GridData}
                                        pageSize="500" />
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {(this.state.PageMode == 'Add' || this.state.PageMode == 'Edit') &&
                    <div>
                        <div>
                            <div className="modal-content">
                                <div className="modal-body">
                                    <div className="row">
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="ddlPropertyList">Property</label>
                                                <DropDownList Id="ddlPropertyList"
                                                    onSelected={this.onPropertyChanged.bind(this)}
                                                    Options={this.state.PropertyListData} />
                                            </div>
                                        </div>
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="ddlTowerList">Tower/Wing</label>
                                                <DropDownList Id="ddlTowerList"
                                                    onSelected={this.onTowerChanges.bind(this)}
                                                    Options={this.state.PropertyTowersData} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="ddlFloorsList">Floor</label>
                                                <DropDownList Id="ddlFloorsList"
                                                    onSelected={this.oncFloorChange.bind(this)}
                                                    Options={this.state.PropertyFloors} />
                                            </div>
                                        </div>
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="ddlFlatList">Flat Name</label>
                                                <DropDownList Id="ddlFlatList"
                                                    onSelected={this.onFlatChange.bind(this)}
                                                    Options={this.state.FlatData} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label for="lbOwnership">Ownership Type</label>
                                                <DropDownList Id="ddlOwnership"
                                                    onSelected={this.onOwnershipTypeChanged.bind(this)}
                                                    Options={this.state.OwnershipData} />
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label for="lbOwner">Owner Name</label>
                                                <MultiSelectInline
                                                    ID="ddlOwner"
                                                    isMulti={true}
                                                    value={this.state.OwnerId}
                                                    onChange={this.onOwnerChanged.bind(this)}
                                                    options={this.state.OwnerData} />
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
                                                                onChange={this.updateOwner.bind(this, "DocumentName")}
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
                                                <div className="row">
                                                    <div className="col-sm-12">
                                                        <DataGrid
                                                            Id="grdDoc"
                                                            IsPagination={false}
                                                            ColumnCollection={this.state.gridPropertyMemberDocumentHeader}
                                                            onGridDeleteMethod={this.onDocumentGridDelete.bind(this)}
                                                            onGridDownloadMethod={this.onDocumentGridData.bind(this)}
                                                            GridData={this.state.gridPropertyMemberDocumentData}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <Button
                                        Id="btnSave"
                                        Text="Save"
                                        Action={this.handleSave.bind(this)}
                                        ClassName="btn btn-primary" />
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
    return {}
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentAction, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(PropertyAssignment);

//export default PropertyAssignment