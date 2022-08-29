import React, { Component } from 'react';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from './DataProvider';
import { ToastContainer, toast } from 'react-toastify';
import * as appCommon from '../../Common/AppCommon.js';
import swal from 'sweetalert';
import { CreateValidator, ValidateControls } from './Validation.js';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import UrlProvider from "../../Common/ApiUrlProvider.js";
import { Typeahead } from 'react-bootstrap-typeahead';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';

import { connect } from 'react-redux';
import departmentAction from '../../redux/department/action';
import { promiseWrapper } from '../../utility/common';
import { bindActionCreators } from 'redux';

import BootstapDuallistbox from '../../ReactComponents/BootstrapDuallist/BootstapDuallistbox'
import Editor from '../../ReactComponents/Editor/Editor'
import InputDate from './InputDate';
import FileUpload from './FileUpload.js';
const $ = window.$;

class NoticeBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            GridData: [],
            gridHeader: [
                { sTitle: 'Id', titleValue: 'notificationId', "orderable": false },
                { sTitle: 'Title', titleValue: 'subject', },
                { sTitle: 'Notice', titleValue: 'shortMessage', },
                { sTitle: 'Type', titleValue: 'notificationType', },
                { sTitle: 'Alert Type', titleValue: 'notificationAlertType', },
                { sTitle: 'Created On', titleValue: 'createdOn', },
                { sTitle: 'Expiry Date', titleValue: 'expirtyDate', },
                { sTitle: 'Recipient', titleValue: 'recipient', bVisible: false },
                { sTitle: 'Action', titleValue: 'Action', Action: "View&Delete", Index: '0', "orderable": false },
            ],
            PageMode: 'Home',
            NoticeBoardId: 0,
            isActiveInactiveClass: '1',
            DuallistData: [],
            isShowDuallistboxForBlocks: false,
            isShowDuallistboxForApartments: false,
            Duallistselectedlbl: '',
            Duallistselectedvalue: [],
            selectedFileName: [],
            RecipientsList: [],
            NotifyList: [{ Id: 0, Name: "Select Notify" }, { Id: 1, Name: "Complete society" },
            { Id: 2, Name: "Selected Blocks" }, { Id: 3, Name: "Select Apartments" }],
            TypeList: [],
            AlertTypeList: [],
            Notify: 0,
            RecipientsVal: null,
            TypeVal: null,
            AlertTypeVal: null,
            editorvalue: '',
            expirydate: '',
            subjectvalue: '',
            PropertyDetailsId: '',
            PropertyTowerId: '',
            PropertyRWAMemberId: '',
            createdOn: '',
            PropertyGridData: [],
            PropertygridHeader: [
                { sTitle: 'Id', titleValue: 'notificationDetailId', "orderable": false },
                { sTitle: 'Name', titleValue: 'name', },
            ],
            NoticeAttachmentGridData: [],
            NoticeAttachmentgridHeader: [
                { sTitle: 'Id', titleValue: 'notifactionAttachmentsId', "orderable": false },
                { sTitle: 'Name', titleValue: 'fileName', },
                { sTitle: 'Path', titleValue: 'filePath', bVisible: false },
                { sTitle: 'Action', titleValue: 'Action', Action: "Download", Index: '0', urlIndex: '2', "orderable": false },
            ],
            isShowDuallistboxForAvailableRwaRole: false
        };

        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    loadNoticeBoard = () => {
        this.getNoticeBoard(this.props.PropertyId);
        this.getNoticeBoardDropDwon(this.props.PropertyId);
    }

    loadNoticeBoardViewPage = () => {
        this.getNoticeBoardAssignedProperties(this.props.PropertyId);
        this.getNoticeBoardAttachments(this.props.PropertyId);
    }

    componentDidMount() {
        this.loadNoticeBoard();
    }

    componentDidUpdate(prevProps) {
        // 
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.loadNoticeBoard();
        }
    }

    getNoticeBoardDropDwon(PropertyID) {
        //         
        let id = parseInt(PropertyID);
        this.ApiProviderr.getDropDwonData('PG', id).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let Data = [{ Id: 0, Name: "Select Recipients" }];
                        rData.forEach(element => {
                            Data.push({ Id: element.id, Name: element.text });
                        });
                        this.setState({ RecipientsList: Data });
                    });
                }
            });

        this.ApiProviderr.getDropDwonData('NT', id).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let Data = [{ Id: 0, Name: "Select Type" }];
                        rData.forEach(element => {
                            Data.push({ Id: element.id, Name: element.text });
                        });
                        this.setState({ TypeList: Data });
                    });
                }
            });
        this.ApiProviderr.getDropDwonData('NAT', id).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let Data = [{ Id: 0, Name: "Select Alert Type" }];
                        rData.forEach(element => {
                            Data.push({ Id: element.id, Name: element.text });
                        });
                        this.setState({ AlertTypeList: Data });
                    });
                }
            });

    }

    getNoticeBoard(id) {
        var type = 'R';
        var model = this.getModel(id, type);

        this.manageNoticeBoard(model, type);
    }

    getNoticeBoardAssignedProperties(id) {
        var type = 'PD';
        var model = this.getModel(id, type);

        this.manageNoticeBoard(model, type);
    }
    getNoticeBoardAttachments(id) {
        var type = 'NATT';
        var model = this.getModel(id, type);

        this.manageNoticeBoard(model, type);
    }

    getModel = (id, type) => {
        var model = [];
        switch (type) {
            case 'R':
                model.push({
                    "PropertyId": parseInt(id),
                    "StatementType": type,
                    "IsActive": parseInt(this.state.isActiveInactiveClass)
                });
                break;
            case 'PD':
                model.push({
                    "PropertyId": parseInt(id),
                    "StatementType": type,
                    "NoticeBoardId": this.state.NoticeBoardId,
                });
                break;
            case 'NATT':
                model.push({
                    "PropertyId": parseInt(id),
                    "StatementType": type,
                    "NoticeBoardId": this.state.NoticeBoardId,
                });
                break;
            case 'C':
                model.push({
                    "StatementType": type,
                    "PropertyId": parseInt(id),
                    "subject": this.state.subjectvalue,
                    "message": this.state.editorvalue,
                    "notificationTypeId": parseInt(this.state.TypeVal),
                    "propertyGroupId": parseInt(this.state.RecipientsVal),
                    "notify": parseInt(this.state.Notify),
                    "alertTypeId": parseInt(this.state.AlertTypeVal),
                    "ExpirtyDate": this.state.expirydate,
                    "noticeBoardAttachment": this.state.selectedFileName,
                    "PropertyDetailsId": this.state.PropertyDetailsId,
                    "PropertyTowerId": this.state.PropertyTowerId,
                    "PropertyRWAMemberId": this.state.PropertyRWAMemberId,
                });
                break;
            case 'D':
                model.push({
                    "NoticeBoardId": this.state.NoticeBoardId,
                    "StatementType": type,
                });
                break;
            default:
        };
        return model;
    }


    manageNoticeBoard = (model, type) => {
        this.ApiProviderr.manageNoticeBoard(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'C':
                                console.log(rData);
                                if (rData > 0) {
                                    appCommon.showtextalert("Notice Saved Successfully!", "", "success");
                                }
                                else {
                                    appCommon.showtextalert("Notice Subject Already Existed !", "", "error");
                                }
                                this.handleCancel();
                                break;
                            case 'D':
                                if (rData === 1) {
                                    appCommon.showtextalert("Notice Deleted Successfully!", "", "success");
                                }
                                else {
                                    appCommon.showtextalert("Someting went wrong !", "", "error");
                                }
                                this.handleCancel();
                                break;
                            case 'R':
                                this.setState({ GridData: rData });
                                break;
                            case 'PD':
                                this.setState({ PropertyGridData: rData });
                                break;
                            case 'NATT':
                                this.setState({ NoticeAttachmentGridData: rData });
                                break;
                            default:
                        }
                    });
                }
            });
    }

    onPagechange = (page) => {

    }

    checkActiveInactiveData = (val) => {
        let gridHeader = [
            { sTitle: 'Id', titleValue: 'notificationId', "orderable": false },
            { sTitle: 'Title', titleValue: 'subject', },
            { sTitle: 'Notice', titleValue: 'shortMessage', },
            { sTitle: 'Type', titleValue: 'notificationType', },
            { sTitle: 'AlertType', titleValue: 'notificationAlertType', },
            { sTitle: 'Created On', titleValue: 'createdOn', },
            { sTitle: 'Expiry Date', titleValue: 'expirtyDate', },
            { sTitle: 'Recipient', titleValue: 'recipient', bVisible: false },
            { sTitle: 'Action', titleValue: 'Action', Action: "View&Delete", Index: '0', "orderable": false },
        ]
        this.setState({ isActiveInactiveClass: val }, () => {
            if (this.state.isActiveInactiveClass === '0') {
                gridHeader = [];
                gridHeader.push({ sTitle: 'Id', titleValue: 'notificationId', "orderable": false });
                gridHeader.push({ sTitle: 'Title', titleValue: 'subject', });
                gridHeader.push({ sTitle: 'Notice', titleValue: 'shortMessage', });
                gridHeader.push({ sTitle: 'Type', titleValue: 'notificationType', },);
                gridHeader.push({ sTitle: 'AlertType', titleValue: 'notificationAlertType', });
                gridHeader.push({ sTitle: 'Created On', titleValue: 'createdOn', });
                gridHeader.push({ sTitle: 'Expiry Date', titleValue: 'expirtyDate', });
                gridHeader.push({ sTitle: 'Recipient', titleValue: 'recipient', bVisible: false });
                gridHeader.push({ sTitle: 'Action', titleValue: 'Action', Action: "View", Index: '0', "orderable": false });
                this.setState({
                    gridHeader: gridHeader
                }, () => this.loadNoticeBoard())
            }
            else {
                this.setState({
                    gridHeader: gridHeader
                }, () => this.loadNoticeBoard())
            }
        })
    }

    Addnew = () => {
        this.setState({ PageMode: 'Add' }, () => {
            CreateValidator();
        });
    }
    findItem(id) {
        // 
        return this.state.GridData.find((item) => {
            if (item.notificationId == id) {
                return item;
            }
        });
    }

    ongridview = (Id) => {
        // 
        this.setState({ PageMode: 'View' }, () => {
            var rowData = this.findItem(Id)
            // console.log('For View ', rowData);
            this.setState({
                NoticeBoardId: rowData.notificationId,
                RecipientsVal: rowData.recipient, TypeVal: rowData.notificationType,
                AlertTypeVal: rowData.notificationAlertType, expirydate: rowData.expirtyDate,
                subjectvalue: rowData.subject, editorvalue: rowData.message, createdOn: rowData.createdOn
            }, () => this.loadNoticeBoardViewPage())
        });
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
                        this.setState({ NoticeBoardId: Id }, () => {
                            var type = 'D'
                            var model = this.getModel(this.props.PropertyId, type);
                            this.manageNoticeBoard(model, type);
                        });
                        break;
                    case "cancel":
                        break;
                    default:
                        break;
                }
            })
        );

    }

    updatetextmodel = (ctrl, val) => {
        if (ctrl == 'ExpiryDate') {
            this.setState({ expirydate: val });
        }
        else if (ctrl == 'Editor') {
            this.setState({ editorvalue: val });
        }
        else if (ctrl == 'Subject') {
            this.setState({ subjectvalue: val });
        }
    }

    handleSave = () => {
        if (ValidateControls()) {
            var type = 'C'
            var model = this.getModel(this.props.PropertyId, type);
            switch (parseInt(this.state.Notify)) {
                case 1:
                    this.manageNoticeBoard(model, type);
                    break;
                case 2:
                    if (this.state.PropertyTowerId === '') {
                        appCommon.showtextalert("Please Select Block", "", "error");
                    }
                    else {
                        this.manageNoticeBoard(model, type);
                    }
                    break;
                case 3:
                    if (this.state.PropertyDetailsId === '') {
                        appCommon.showtextalert("Please Select Appartment", "", "error");
                    }
                    else {
                        this.manageNoticeBoard(model, type);
                    }
                    break;
                case 4:
                    this.manageNoticeBoard(model, type);
                    break;
                case 5:
                    if (this.state.PropertyRWAMemberId === '') {
                        appCommon.showtextalert("Please Select Roles", "", "error");
                    }
                    else {
                        this.manageNoticeBoard(model, type);
                    }
                    break;
                default:
                    break;
            }
        }
    }
    handleCancel = () => {
        this.setState({ NoticeBoardId: 0 }, () => {
            this.setState({
                PageMode: 'Home', Notify: 0, RecipientsVal: null, TypeVal: null, AlertTypeVal: null,
                editorvalue: '', expirydate: '', subjectvalue: '', NoticeBoardId: 0, DuallistData: [], isShowDuallistboxForBlocks: false,
                isShowDuallistboxForApartments: false, isShowDuallistboxForAvailableRwaRole: false, Duallistselectedlbl: '', Duallistselectedvalue: [], selectedFileName: [],
                PropertyDetailsId: '', PropertyTowerId: '', createdOn: '', PropertyGridData: [], NoticeAttachmentGridData: [],
                PropertyRWAMemberId: '',
                NotifyList: [{ Id: 0, Name: "Select Notify" }, { Id: 1, Name: "Complete society" },
                { Id: 2, Name: "Selected Blocks" }, { Id: 3, Name: "Select Apartments" }],
            }, () => this.loadNoticeBoard());
        });
    };

    onSelected(name, value) {
        switch (name) {
            case "Notify":
                this.setState({ Notify: value }, () => {
                    if (value === '2') {
                        this.ApiProviderr.getDropDwonData('BL', this.props.PropertyId).then(
                            resp => {
                                if (resp.ok && resp.status == 200) {
                                    return resp.json().then(rData => {
                                        let Data = [];
                                        rData.forEach(element => {
                                            Data.push({ value: element.id, name: element.text });
                                        });
                                        this.setState({ DuallistData: Data, isShowDuallistboxForBlocks: true, isShowDuallistboxForApartments: false, isShowDuallistboxForAvailableRwaRole: false, Duallistselectedlbl: 'Blocks' })
                                    });
                                }
                            });
                        this.setState({ PropertyDetailsId: '' })
                    }
                    else if (value === '3') {
                        this.ApiProviderr.getDropDwonData('APT', this.props.PropertyId).then(
                            resp => {
                                if (resp.ok && resp.status == 200) {
                                    return resp.json().then(rData => {
                                        let Data = [];
                                        rData.forEach(element => {
                                            Data.push({ value: element.id, name: element.text });
                                        });
                                        this.setState({ DuallistData: Data, isShowDuallistboxForApartments: true, isShowDuallistboxForBlocks: false, isShowDuallistboxForAvailableRwaRole: false, Duallistselectedlbl: 'Apartments' })
                                    });
                                }
                            });
                        this.setState({ PropertyTowerId: '' })
                    }
                    else if (value === '5') {
                        this.ApiProviderr.getDropDwonData('RWARole', this.props.PropertyId).then(
                            resp => {
                                if (resp.ok && resp.status == 200) {
                                    return resp.json().then(rData => {
                                        let Data = [];
                                        rData.forEach(element => {
                                            Data.push({ value: element.id, name: element.text });
                                        });
                                        console.log(Data);
                                        this.setState({ DuallistData: Data, isShowDuallistboxForAvailableRwaRole: true, isShowDuallistboxForApartments: false, isShowDuallistboxForBlocks: false, Duallistselectedlbl: 'RWA Roles' })
                                    });
                                }
                            });
                        this.setState({ PropertyRWAMemberId: '' })
                    }
                    else {
                        this.setState({
                            DuallistData: [],
                            isShowDuallistboxForBlocks: false,
                            isShowDuallistboxForApartments: false,
                            isShowDuallistboxForAvailableRwaRole: false,
                            Duallistselectedlbl: '',
                            PropertyDetailsId: '',
                            PropertyTowerId: '',
                            PropertyRWAMemberId: ''
                        })
                    }
                });
                break;
            case "Recipients":
                this.setState({
                    RecipientsVal: value,
                    DuallistData: [],
                    isShowDuallistboxForBlocks: false,
                    isShowDuallistboxForApartments: false,
                    isShowDuallistboxForAvailableRwaRole: false,
                    Duallistselectedlbl: '',
                    PropertyDetailsId: '',
                    PropertyTowerId: '',
                }, () => {
                    let recipientData = [
                        { Id: 0, Name: "Select Notify" },
                        { Id: 1, Name: "Complete society" },
                        { Id: 2, Name: "Selected Blocks" },
                        { Id: 3, Name: "Select Apartments" }
                    ];
                    if (value === "4") {
                        recipientData = [
                            { Id: 0, Name: "Select Notify" },
                            { Id: 4, Name: "All Role" },
                            { Id: 5, Name: "Selected Role" }
                        ];
                        this.setState({ NotifyList: recipientData });
                    }
                    else {
                        this.setState({
                            NotifyList: recipientData
                        })
                    }
                })
                break;
            case "Types":
                this.setState({ TypeVal: value })
                break;
            case "AlertTypes":
                this.setState({ AlertTypeVal: value })
                break;
            default:
        }
    }

    handleDuallistboxSelected = (data) => {
        // 
        let selVal = data;
        if (this.state.Notify == 2) {
            let data = selVal.map((item) => { return item })
            this.setState({ PropertyTowerId: data.join(','), PropertyDetailsId: '', PropertyRWAMemberId: '' })
        }
        else if (this.state.Notify == 3) {
            let data = selVal.map((item) => { return item })
            this.setState({ PropertyDetailsId: data.join(','), PropertyTowerId: '', PropertyRWAMemberId: '' })
        }
        else if (this.state.Notify == 5) {
            let data = selVal.map((item) => { return item })
            this.setState({ PropertyRWAMemberId: data.join(','), PropertyTowerId: '', PropertyDetailsId: '' })
        }
    }

    // On file Change
    onFileChange(data) {
        let files = [...this.state.selectedFileName]
        if (data !== null) {
            let _validFileExtensions = ["jpg", "jpeg", "bmp", "gif", "png", "pdf", "docx", "xlsx"];
            // let extension = data.filename.substring(data.filename.lastIndexOf('.') + 1);
            let isvalidFiletype = _validFileExtensions.some(x => x === data.extension);
            if (isvalidFiletype) {
                let isAvailable = files.some(x => x.filename === data.filename);
                if (!isAvailable) {
                    files.push(data);
                }
                else {
                    appCommon.showtextalert(data.filename + " Already Existed !", "", "error");
                }
            }
            else {
                let temp_validFileExtensions = _validFileExtensions.join(',');
                appCommon.showtextalert(`${data.filename} Invalid file type, Please Select only ${temp_validFileExtensions} `, "", "error");
            }
        }
        this.setState({ selectedFileName: files });
    };
    RemoveFile = (x) => {
        let files = [...this.state.selectedFileName]
        const newList = files.filter(item => item.filename !== x);
        this.setState({ selectedFileName: newList })
    }

    onAttachmentGridData(gridLink) {
        window.open(gridLink);
    }
    render() {
        return (
            <div>
                {this.state.PageMode == 'Home' &&
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header d-flex p-0">
                                    <ul className="nav tableFilterContainer">
                                        <li className="nav-item">
                                            <div className="btn-group">
                                                <Button id="btnActive"
                                                    Action={this.checkActiveInactiveData.bind(this, '1')}
                                                    ClassName={this.state.isActiveInactiveClass === '1' ? 'btn btn-success' : 'btn btn-default'}
                                                    Text="Active" />

                                                <Button id="btnInactive"
                                                    Action={this.checkActiveInactiveData.bind(this, '0')}
                                                    ClassName={this.state.isActiveInactiveClass === '0' ? 'btn btn-success' : 'btn btn-default'}
                                                    Text="Inactive" />
                                            </div>
                                        </li>
                                    </ul>

                                    <ul className="nav ml-auto tableFilterContainer">
                                        <li className="nav-item">
                                            <div className="input-group input-group-sm">
                                                <div className="input-group-prepend">
                                                    <Button id="btnNewComplain"
                                                        Action={this.Addnew.bind(this)}
                                                        ClassName="btn btn-success btn-sm"
                                                        Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                                        Text=" Create New" />
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div className="card-body pt-2">
                                    <DataGrid
                                        Id="grdNoticeBoard"
                                        IsPagination={false}
                                        ColumnCollection={this.state.gridHeader}
                                        Onpageindexchanged={this.onPagechange.bind(this)}
                                        onGridViewMethod={this.ongridview.bind(this)}
                                        onGridDeleteMethod={this.onGridDelete.bind(this)}
                                        DefaultPagination={false}
                                        IsSarching="true"
                                        GridData={this.state.GridData}
                                        pageSize="2000" />
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {this.state.PageMode == 'View' &&
                    <div>
                        <div>
                            <div className="modal-content">
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label for="ticketType">Recipients</label>
                                                <div className="dummyBox">
                                                    {this.state.RecipientsVal}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label for="ticketTitle">Type</label>
                                                <div className="dummyBox">
                                                    {this.state.TypeVal}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label for="ticketTitle">Alert Type</label>
                                                <div className="dummyBox">
                                                    {this.state.AlertTypeVal}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label for="ticketTitle">Created On </label>
                                                <div className="dummyBox">
                                                    {this.state.createdOn}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label for="ticketTitle">Expiry Date</label>
                                                <div className="dummyBox">
                                                    {this.state.expirydate}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-12">
                                            <div className="form-group">
                                                <label for="ticketTitle">Subject</label>
                                                <div className="dummyBox">
                                                    {this.state.subjectvalue}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-12">
                                            <div className="form-group">
                                                <label for="ticketTitle">Notice</label>
                                                <div className="dummyBox">
                                                    {/* {this.state.editorvalue} */}
                                                    <div dangerouslySetInnerHTML={{ __html: this.state.editorvalue }} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-12">
                                            <h2>Properties</h2>
                                            <DataGrid
                                                Id="grdViewProperties"
                                                IsPagination={false}
                                                ColumnCollection={this.state.PropertygridHeader}
                                                GridData={this.state.PropertyGridData}
                                            />
                                        </div>
                                        <div className="col-sm-12">
                                            <h2>Attachments</h2>
                                            <DataGrid
                                                Id="grdViewNoticeAttachemtn"
                                                IsPagination={false}
                                                ColumnCollection={this.state.NoticeAttachmentgridHeader}
                                                GridData={this.state.NoticeAttachmentGridData}
                                                onGridDownloadMethod={this.onAttachmentGridData.bind(this)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <Button
                                        Id="btnView"
                                        Text="Cancel"
                                        Action={this.handleCancel}
                                        ClassName="btn btn-secondary" />
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {this.state.PageMode == 'Add' &&
                    <div>
                        <div>
                            <div className="modal-content">
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label for="ddlRecipients">Recipients</label>
                                                <SelectBox
                                                    ID="ddlRecipients"
                                                    ClassName="form-control "
                                                    onSelected={this.onSelected.bind(this, "Recipients")}
                                                    Options={this.state.RecipientsList}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label for="ddlNotify">Notify</label>
                                                <SelectBox
                                                    ID="ddlNotify"
                                                    onSelected={this.onSelected.bind(this, "Notify")}
                                                    Options={this.state.NotifyList}
                                                    ClassName="form-control "
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        this.state.isShowDuallistboxForBlocks ?
                                            (
                                                <div className="row mt-2">
                                                    {/* <div className="col-sm-12">
                                                        <button className="btn btn-success float-right"
                                                            onClick={this.handleDuallistboxSelected}>Done</button>
                                                    </div> */}
                                                    <div className="col-sm-12">
                                                        <BootstapDuallistbox
                                                            id='dllduallistbox'
                                                            Duallistselectedlbl={this.state.Duallistselectedlbl}
                                                            option={this.state.DuallistData}
                                                            onChange={this.handleDuallistboxSelected.bind(this)}
                                                        />
                                                    </div>
                                                </div>
                                            ) : null
                                    }
                                    {
                                        this.state.isShowDuallistboxForApartments ?
                                            (
                                                <div className="row  mt-2">
                                                    {/* <div className="col-sm-12">
                                                        <button className="btn btn-success float-right"
                                                            onClick={this.handleDuallistboxSelected}>Done</button>
                                                    </div> */}
                                                    <div className="col-sm-12">
                                                        <BootstapDuallistbox
                                                            id='dllduallistbox'
                                                            Duallistselectedlbl={this.state.Duallistselectedlbl}
                                                            option={this.state.DuallistData}
                                                            onChange={this.handleDuallistboxSelected.bind(this)}
                                                        />
                                                    </div>
                                                </div>
                                            ) : null
                                    }
                                    {
                                        this.state.isShowDuallistboxForAvailableRwaRole ?
                                            (
                                                <div className="row  mt-2">
                                                    {/* <div className="col-sm-12">
                                                        <button className="btn btn-success float-right"
                                                            onClick={this.handleDuallistboxSelected}>Done</button>
                                                    </div> */}
                                                    <div className="col-sm-12">
                                                        <BootstapDuallistbox
                                                            id='dllduallistbox'
                                                            Duallistselectedlbl={this.state.Duallistselectedlbl}
                                                            option={this.state.DuallistData}
                                                            onChange={this.handleDuallistboxSelected.bind(this)}
                                                        />
                                                    </div>
                                                </div>
                                            ) : null
                                    }

                                    <div className="row mt-2">
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label for="ddltype">Type</label>
                                                <SelectBox
                                                    ID="ddltype"
                                                    ClassName="form-control "
                                                    onSelected={this.onSelected.bind(this, "Types")}
                                                    Options={this.state.TypeList}

                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label for="ddlalerttype">Alert Type</label>
                                                <SelectBox
                                                    ID="ddlalerttype"
                                                    ClassName="form-control "
                                                    onSelected={this.onSelected.bind(this, "AlertTypes")}
                                                    Options={this.state.AlertTypeList}

                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label for="txtexpiryDate">Expiry Date</label>
                                                <InputDate
                                                    Id='txtexpiryDate'
                                                    DateFormate="dd/mm/yyyy"
                                                    handleOnchage={this.updatetextmodel.bind(this, "ExpiryDate")}
                                                    value={this.state.expirydate}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mt-2">
                                        <div className="col-sm-12">
                                            <div className="form-group">
                                                <label for="txtSubject">Subject</label>
                                                <InputBox
                                                    Id="txtSubject"
                                                    PlaceHolder="Subject"
                                                    className="form-control form-control-sm"
                                                    onChange={this.updatetextmodel.bind(this, "Subject")}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row mt-2">
                                        <div className="col-sm-12">
                                            <Editor
                                                Id='txteditor'
                                                value={this.state.editorvalue}
                                                onChange={this.updatetextmodel.bind(this, "Editor")}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        {
                                            this.state.selectedFileName.map((x, i) => (
                                                <div className="col-sm-12" key={i}>
                                                    <div className="alert alert-success" role="alert">
                                                        {x.filename}
                                                        <button type="button"
                                                            onClick={this.RemoveFile.bind(this, x.filename)}
                                                            className="close"
                                                        >
                                                            <span aria-hidden="true">&times;</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                        <div className="col-sm-12">
                                            <FileUpload
                                                id="noticeFiles"
                                                onChange={this.onFileChange.bind(this)}
                                                className="custom-file-input"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <Button
                                        Id="btnSave"
                                        Text="Save"
                                        Action={this.handleSave}
                                        ClassName="btn btn-primary" />
                                    <Button
                                        Id="btnView"
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
export default connect(mapStoreToprops, mapDispatchToProps)(NoticeBoard);