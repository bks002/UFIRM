import React, { Component, Fragment } from 'react';
import Modal from 'react-awesome-modal';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { setHours, setMinutes } from 'date-fns';

import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';

import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Collapse } from 'react-collapse';
import Slider from 'react-rangeslider'
// To include the default styles
import 'react-rangeslider/lib/index.css'

import * as appCommon from '../../../Common/AppCommon.js';
import FileUpload from '../../NoticeBoard/FileUpload';
import moment from 'moment';
import ApiProvider from '../DataProvider';
import { UpdateEventValidator, ValidateUpdateEventControls } from '../Validation';
import swal from 'sweetalert';
import { DELETE_CONFIRMATION_MSG } from '../../../Contants/Common';
import { ToastContainer, toast } from 'react-toastify';
import ShowMoreText from "react-show-more-text";
import PDFIcon from '../../KanbanBoard/AttachmentIcons/pdficon.png';

import AttachmentViewers from '../AttachmentViewers'
import DeleteEvent from './DeleteEvent'

import "./Event.css"
import Comments from './Comments.js';
import Logs from './Logs.js';
import CompleteEvent from './CompleteEvent.js';

class DetailsEvent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: "",
            type: '',
            check: true,
            startDate: new Date(),
            endDate: new Date(),
            startTime: moment().add(moment().minute() > 30 && 1, 'hours').minutes(moment().minute() <= 30 ? 30 : 0).toDate(),
            endTime: moment().add(moment().minute() > 30 && 1, 'hours').minutes(moment().minute() <= 30 ? 30 : 0).add(30, 'm').toDate(),
            editorState: EditorState.createEmpty(),
            assignee: 0,
            repeat: 'Do not repeat',
            remindme: 0,
            categoryId: 0,

            selectedFileName: [],
            txtSubtask: '',
            subTask: [],
            isopensubTask: false,
            isopenDesc: false,
            isopenAttachment: false,
            isEditMode: true,
            description: '',
            availableSubTask: [],
            availableAttachment: [],
            taskComplete: 0,

            filename: '',
            fileData: '',
            isImageORPdf: '',
            extension: '',
            subTaskID: 0,
            subTaskIsCompleted: false,

            showAttachmentViewerModal: false,
            isTimePickerDisabled: true,
            RepeateEndBy: new Date(),
            logs: [],
            comments: [],
            IsDeleteModal: false,
            IsCompleteModal: false,
        }
        this.ApiProviderr = new ApiProvider();
    }

    onEditorStateChange = (editorState) => {
        const convertedData = convertToRaw(editorState.getCurrentContent());
        const markup = draftToHtml(convertedData);
        this.props.EventDetailsModelInstance.setDescription(editorState);
        this.setState({ editorState, description: markup });
    };

    // On file Change
    onFileChange(data) {
        let files = [...this.state.selectedFileName]
        if (data !== null) {
            let _validFileExtensions = ["jpg", "jpeg", "bmp", "gif", "png", "pdf"];
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

    addSubTask(data) {
        //debugger
        let tasks = [...this.state.subTask]
        if (data !== "") {
            tasks.push(data);
        }
        else {
            appCommon.showtextalert("Please enter data into subtask", "", "error");
        }
        this.setState({ subTask: tasks, txtSubtask: '' });
    };
    RemovesubTask = (x) => {
        let tasks = [...this.state.subTask]
        const newList = tasks.filter(item => item !== x);
        this.setState({ subTask: newList })
    }

    handleKeyDownSubTask = (e) => {
        if (e.key === 'Enter') {
            let tasks = [...this.state.subTask]
            if (e.target.value !== "") {
                tasks.push(e.target.value);
            }
            else {
                appCommon.showtextalert("Please enter data into subtask", "", "error");
            }
            this.setState({ subTask: tasks, txtSubtask: '' });
        }
    }

    onCancel = () => {
        this.setState({
            isopensubTask: false,
            isopenDesc: false,
            isopenAttachment: false,
            isEditMode: true,
            title: "",
            type: 'E',
            check: true,
            startDate: new Date(),
            endDate: new Date(),
            startTime: moment().add(moment().minute() > 30 && 1, 'hours').minutes(moment().minute() <= 30 ? 30 : 0).toDate(),
            endTime: moment().add(moment().minute() > 30 && 1, 'hours').minutes(moment().minute() <= 30 ? 30 : 0).add(30, 'm').toDate(),
            editorState: EditorState.createEmpty(),
            selectedFileName: [],
            txtSubtask: '',
            subTask: [],
            description: '',
            assignee: 0,
            categoryId: 0,
            repeat: 'Do not repeat',
            remindme: 0,
            availableSubTask: [],
            availableAttachment: [],
            taskComplete: 0,
            filename: '',
            fileData: '',
            isImageORPdf: '',
            extension: '',
            subTaskID: 0,
            subTaskIsCompleted: false,
            showAttachmentViewerModal: false,
            isTimePickerDisabled: true,
            RepeateEndBy: new Date()
        }, () => this.props.closeModal())
    };

    onSave = () => {
        const isValidate = ValidateUpdateEventControls();
        if (isValidate) {

            if (this.state.repeat !== "Do not repeat") {
                if (this.state.RepeateEndBy) {
                    var type = 'U'
                    var model = this.getModel(type);
                    console.log(model[0]);
                    this.manageEvents(model, "U");
                }
                else {
                    appCommon.showtextalert(`Please select Repeate End By Date`, "", "error");
                }
            }
            else {
                var type = 'U'
                var model = this.getModel(type);
                console.log(model[0]);
                this.manageEvents(model, "U");
            }
        }
    }

    getModel = (type, comment, attachments, IsCurrent) => {
        var model = [];
        switch (type) {
            case 'U':
                model.push({
                    "cmdType": type,
                    "propertyId": parseInt(this.props.propertyId),
                    "title": this.state.title,
                    "type": this.state.type,
                    "category": parseInt(this.state.categoryId),
                    "isAllday": this.state.check,
                    "startDate": moment(this.state.startDate).format("DD/MM/YYYY"),
                    "startTime": moment(this.state.startTime).format("HH:mm:ss"),
                    "endDate": moment(this.state.endDate).format("DD/MM/YYYY"),
                    "endTime": moment(this.state.endTime).format("HH:mm:ss"),
                    "assignee": parseInt(this.state.assignee),
                    "repeat": this.state.repeat,
                    "subTask": this.state.subTask,
                    "description": this.state.description,
                    "eventsAttachments": this.state.selectedFileName,
                    "remindme": parseInt(this.state.remindme),
                    "id": parseInt(this.props.EventDetailsModelInstance.eventId),
                    "repeateEndBy": this.state.repeat === 'Do not repeat' ? '' : moment(this.state.RepeateEndBy).format("DD/MM/YYYY")
                });
                break;
            case 'D':
                model.push({
                    "type": type,
                    "eventApprovalId": 0,
                    "propertyId": parseInt(this.props.propertyId),
                    "eventId": parseInt(this.props.EventDetailsModelInstance.eventId),
                    "subEventId": parseInt(this.props.EventDetailsModelInstance.subEventId),
                    "status": IsCurrent,
                    "comments": comment,
                });
                break;
            case 'EATT':
                model.push({
                    "cmdType": type,
                    "id": parseInt(this.props.EventDetailsModelInstance.eventId),
                });
                break;
            case 'EST':
                model.push({
                    "cmdType": type,
                    "SubEventId": parseInt(this.props.EventDetailsModelInstance.subEventId),
                });
                break;
            case 'UST':
                model.push({
                    "cmdType": type,
                    "id": parseInt(this.state.subTaskID),
                    "isCompleted": this.state.subTaskIsCompleted
                });
                break;
            case 'DST':
                model.push({
                    "cmdType": type,
                    "id": parseInt(this.state.subTaskID),
                });
                break;
            case 'ELog':
                model.push({
                    "cmdType": type,
                    "EventId": parseInt(this.props.EventDetailsModelInstance.eventId),
                    "SubEventId": parseInt(this.props.EventDetailsModelInstance.subEventId),
                });
                break;
            case 'EComments':
                model.push({
                    "cmdType": type,
                    "SubEventId": parseInt(this.props.EventDetailsModelInstance.subEventId),
                    "EventId": parseInt(this.props.EventDetailsModelInstance.eventId),
                });
                break;
            case 'CComment':
                model.push({
                    "cmdType": type,
                    "SubEventId": parseInt(this.props.EventDetailsModelInstance.subEventId),
                    "eventId": parseInt(this.props.EventDetailsModelInstance.eventId),
                    "comment": comment,
                    "eventsAttachments": attachments,
                });
                break;
            case 'CEVT':
                model.push({
                    "cmdType": type,
                    "subEventId": parseInt(this.props.EventDetailsModelInstance.subEventId),
                    "eventId": parseInt(this.props.EventDetailsModelInstance.eventId),
                    "comment": comment,
                    "propertyId": parseInt(this.props.propertyId),
                });
                break;
            default:
        };
        return model;
    }

    manageEvents = (model, type) => {
        this.ApiProviderr.manageEvents(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'U': // not used anywhere
                                if (rData === 1) {
                                    appCommon.showtextalert("Event/Task Update Successfully!", "", "success");
                                    this.props.getEvents();
                                    this.onCancel();
                                }
                                else if (rData === 2) {
                                    appCommon.showtextalert(`${model[0].title} Event/Task Already Existed Successfully!`, "", "error");
                                }
                                break;
                            case 'D':
                                if (rData === 1) {
                                    appCommon.showtextalert("Delete Request Event/Task Successfully Added!", "", "success");
                                    this.closeDeleteReqModal();
                                    this.onCancel();
                                    this.props.getEvents();
                                }
                                break;
                            case 'EATT':
                                this.setState({ availableAttachment: rData });
                                break;

                            case 'EST':
                                let subTasks = rData;
                                const findCompleted = subTasks.filter(item => item.isCompleted === true).length;
                                const total = rData.length;
                                const actVal = (findCompleted * 100) / total;
                                this.setState({ availableSubTask: rData, taskComplete: actVal });
                                break;
                            case 'UST':
                                if (rData === 1) {
                                    this.getSubTask();
                                }
                                break;
                            case 'DST':
                                if (rData === 1) {
                                    appCommon.showtextalert("Sub Task Deleted Successfully!", "", "success");
                                    this.getSubTask();
                                }
                                break;

                            case 'ELog':
                                this.setState({ logs: rData })
                                break;
                            case 'EComments':
                                this.setState({ comments: rData })
                                break;
                            case 'CComment':
                                if (rData === 1) {
                                    appCommon.showtextalert("Comment Added Successfully!", "", "success");
                                    this.getComment();
                                }
                                break;

                            case 'CEVT':
                                if (rData > 0) {
                                    appCommon.showtextalert("Event/Task Complete Successfully!", "", "success");
                                    this.closeCompleteModal();
                                    this.onCancel();
                                    this.props.getEvents();
                                }
                                break;
                            default:
                        }
                    });
                }
            });
    }

    onEdit = () => {
        this.setState({
            isEditMode: false,
        }, () => {
            UpdateEventValidator();
            if (this.state.check && this.state.isEditMode) {
                this.setState({ isTimePickerDisabled: true })
            } else if (this.state.check && !this.state.isEditMode) {
                this.setState({ isTimePickerDisabled: true })
            }
            else if (!this.state.check && this.state.isEditMode) {
                this.setState({ isTimePickerDisabled: true })
            }
            else if (!this.state.check && !this.state.isEditMode) {
                this.setState({ isTimePickerDisabled: false })
            }
        })
    };

    onDelete = () => {
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
                        this.setState({ IsDeleteModal: true })
                        break;
                    case "cancel":
                        this.setState({ IsDeleteModal: false })
                        break;
                    default:
                        break;
                }
            })
        );
    }

    componentDidMount() {
        this.setState({
            title: this.props.EventDetailsModelInstance.title,
            type: this.props.EventDetailsModelInstance.type,
            check: this.props.EventDetailsModelInstance.isAllday,
            startDate: this.props.EventDetailsModelInstance.startDate,
            startTime: this.props.EventDetailsModelInstance.startTime,
            endDate: this.props.EventDetailsModelInstance.endDate,
            endTime: this.props.EventDetailsModelInstance.endTime,
            editorState: this.props.EventDetailsModelInstance.editorState,
            assignee: this.props.EventDetailsModelInstance.assigneeId,
            repeat: this.props.EventDetailsModelInstance.repeat,
            remindme: this.props.EventDetailsModelInstance.notificationBefore,
            categoryId: this.props.EventDetailsModelInstance.categoryId,
            description: this.props.detailspageHtmlFormatDesc,
            RepeateEndBy: this.props.EventDetailsModelInstance.repeateEndBy,
        },
            () => {
                var type = 'EATT'
                var model = this.getModel(type);
                this.manageEvents(model, type);
                this.getSubTask();

                if (this.state.check && this.state.isEditMode) {
                    this.setState({ isTimePickerDisabled: true })
                } else if (this.state.check && !this.state.isEditMode) {
                    this.setState({ isTimePickerDisabled: true })
                }
                else if (!this.state.check && this.state.isEditMode) {
                    this.setState({ isTimePickerDisabled: true })
                }
                else if (!this.state.check && !this.state.isEditMode) {
                    this.setState({ isTimePickerDisabled: false })
                }

                this.getLogs();
                this.getComment();
            }

        )
    }

    onSubTaskComplete = (subTaskid, isCompleted) => {
        this.setState({ subTaskID: subTaskid, subTaskIsCompleted: !isCompleted }, () => {
            let type = 'UST'
            let model = this.getModel(type);
            this.manageEvents(model, type);
        })
    }

    getSubTask = () => {
        let type = 'EST'
        let model = this.getModel(type);
        this.manageEvents(model, type);
    }

    onSubTaskDelete = (subTaskid) => {
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
                        this.setState({ subTaskID: subTaskid }, () => {
                            var type = 'DST'
                            var model = this.getModel(type);
                            this.manageEvents(model, type);
                        })
                        break;
                    case "cancel":
                        break;
                    default:
                        break;
                }
            })
        );
    }

    showAttachment = (filename, src, type, extension) => {
        this.setState({ filename: filename, fileData: src, isImageORPdf: type, extension: extension },
            () => {
                this.setState({ showAttachmentViewerModal: true })
            })
    }

    closeAttachmentModal = () => {
        this.setState({ showAttachmentViewerModal: false })
    }

    onHandleAllDay = (e) => {
        this.setState({ check: e.target.checked }, () => {
            if (this.state.check && this.state.isEditMode) {
                this.setState({ isTimePickerDisabled: true })
            } else if (this.state.check && !this.state.isEditMode) {
                this.setState({ isTimePickerDisabled: true })
            }
            else if (!this.state.check && this.state.isEditMode) {
                this.setState({ isTimePickerDisabled: true })
            }
            else if (!this.state.check && !this.state.isEditMode) {
                this.setState({ isTimePickerDisabled: false })
            }
        })
    }

    onReqComplete = (comment) => {
        let type = "CEVT";
        var model = this.getModel(type, comment);
        this.manageEvents(model, type);
    }
    onComplete = () => {
        this.setState({ IsCompleteModal: true })
    }

    getLogs = () => {
        let type = 'ELog'
        let model = this.getModel(type);
        this.manageEvents(model, type);
    }

    getComment = () => {
        let type = 'EComments'
        let model = this.getModel(type);
        this.manageEvents(model, type);
    }

    getAddComment = (comment, attachments) => {
        let type = 'CComment'
        let model = this.getModel(type, comment, attachments);
        console.log(model[0]);
        this.manageEvents(model, type);
    }

    closeDeleteReqModal = () => {
        this.setState({ IsDeleteModal: false })
    }
    closeCompleteModal = () => {
        this.setState({ IsCompleteModal: false })
    }

    getDeleteReq = (comment, status) => {
        let type = 'D'
        let model = this.getModel(type, comment, "", status);
        console.log(model[0]);
        this.manageEvents(model, type);
    }

    render() {
        const formatPc = value => value + '%';
        return (
            <div>

                {this.state.IsDeleteModal &&
                    <DeleteEvent
                        closeDeleteReqModal={this.closeDeleteReqModal}
                        IsDeleteModal={this.state.IsDeleteModal}
                        getDeleteReq={this.getDeleteReq}
                    />
                }
                {this.state.IsCompleteModal &&
                    <CompleteEvent
                        closeCompleteModal={this.closeCompleteModal}
                        IsCompleteModal={this.state.IsCompleteModal}
                        onComplete={this.onReqComplete}
                    />
                }
                {this.state.showAttachmentViewerModal &&
                    <AttachmentViewers
                        showAttachmentViewerModal={this.state.showAttachmentViewerModal}
                        fileData={this.state.fileData}
                        fileName={this.state.filename}
                        isImageORPdf={this.state.isImageORPdf}
                        extension={this.state.extension}
                        closeModal={this.closeAttachmentModal}
                    />
                }

                <Modal
                    visible={this.props.showDetailsModal}
                    effect="fadeInRight"
                    onClickAway={this.onCancel}
                    width="1400"
                >
                    <div className="row">
                        <div className="col-12">
                            <div className="card card-primary" style={{ borderLeft: `8px solid ${this.props.EventDetailsModelInstance ? this.props.EventDetailsModelInstance.color : ""}` }}>
                                <div className="card-header">
                                    <h3 className="card-title">Event Id: {this.props.EventDetailsModelInstance.eventNumebr} | Status - {this.props.EventDetailsModelInstance.status} </h3>
                                    <div className="card-tools">
                                        <button
                                            className="btn btn-tool"
                                            onClick={this.onCancel}>
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body" style={{ height: "500px", overflowY: "scroll" }}>
                                    <div className='row'>
                                        <div className='col-6'>
                                            <div className='row'>
                                                <div className='col-12'>
                                                    <label>Title</label>
                                                    <input
                                                        id="updatetxtTitle"
                                                        placeholder="Enter Title"
                                                        type="text"
                                                        className="form-control"
                                                        value={this.state.title}
                                                        onChange={(e) => {
                                                            this.setState({ title: e.target.value })
                                                        }}
                                                        disabled={this.state.isEditMode}
                                                    />
                                                </div>
                                            </div>

                                            <div className='row mt-2'>
                                                <div className='col-6'>
                                                    <label>Type</label>
                                                    <select
                                                        id="updateddlEventType"
                                                        className="form-control"
                                                        value={this.state.type}
                                                        onChange={(e) => { this.setState({ type: e.target.value }) }}
                                                        disabled={this.state.isEditMode}>
                                                        <option value="E">Event</option>
                                                    </select>
                                                </div>
                                                <div className='col-6'>
                                                    <label>Category</label>
                                                    <select
                                                        id='updatedllEventCategory'
                                                        className="form-control"
                                                        value={this.state.categoryId}
                                                        onChange={(e) => { this.setState({ categoryId: e.target.value }) }}
                                                        disabled={this.state.isEditMode}>
                                                        <option value={0}>Select Category</option>
                                                        {
                                                            this.props.categoryList ? this.props.categoryList.map((e, key) => {
                                                                return <option key={key} value={e.catId}>{e.name}</option>;
                                                            })
                                                                : null
                                                        }
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="row mt-2">
                                                <div className="col-6">
                                                    <label>Start Date</label>
                                                    <DatePicker
                                                        className="form-control"
                                                        selected={this.state.startDate}
                                                        minDate={this.state.startDate}
                                                        onChange={(date) => this.setState({ startDate: date, endDate: date })}
                                                        dateFormat="dd/MM/yyyy"
                                                        peekNextMonth
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                        id='updatetxtStartDate'
                                                        disabled={this.state.isEditMode}
                                                    />
                                                </div>
                                                <div className="col-6">
                                                    <label>End Date</label>
                                                    <DatePicker
                                                        className="form-control"
                                                        selected={this.state.endDate}
                                                        onChange={(date) => this.setState({ endDate: date, RepeateEndBy: date })}
                                                        dateFormat="dd/MM/yyyy"
                                                        minDate={this.state.startDate}
                                                        peekNextMonth
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                        id='updatetxtEndDate'
                                                        disabled={this.state.isEditMode}
                                                    />
                                                </div>
                                                <div className='col-3 mt-2'>
                                                    <label>All Day</label>
                                                    <br></br>
                                                    <label className="switch">
                                                        <input type="checkbox"
                                                            onChange={this.onHandleAllDay.bind(this)}
                                                            checked={this.state.check}
                                                            disabled={this.state.isEditMode} />
                                                        <div className="slider round">
                                                            <span className="on">Yes</span>
                                                            <span className="off">No</span>
                                                        </div>
                                                    </label>
                                                </div>
                                                <div className="col-3 mt-2">
                                                    <label>Start Time</label>
                                                    <DatePicker
                                                        className="form-control"
                                                        selected={this.state.startTime}
                                                        onChange={(date) => this.setState({
                                                            startTime: date,
                                                            endTime: moment(date).add(30, 'm').toDate()
                                                        })}
                                                        showTimeSelect
                                                        showTimeSelectOnly
                                                        timeIntervals={15}
                                                        timeCaption="Time"
                                                        dateFormat="h:mm a"
                                                        disabled={this.state.isTimePickerDisabled}
                                                    />
                                                </div>
                                                <div className="col-3 mt-2">
                                                    <label>End Time</label>
                                                    <DatePicker
                                                        className="form-control"
                                                        selected={this.state.endTime}
                                                        onChange={(date) => this.setState({ endTime: date })}
                                                        showTimeSelect
                                                        showTimeSelectOnly
                                                        timeIntervals={15}
                                                        timeCaption="Time"
                                                        dateFormat="h:mm a"
                                                        disabled={this.state.isTimePickerDisabled}
                                                        minTime={moment(this.state.startTime).add(30, 'm').toDate()}
                                                        maxTime={setHours(setMinutes(this.state.startTime, 45), 23)}
                                                    />
                                                </div>
                                                <div className='col-3 mt-2'>
                                                    <label>Remind me</label>
                                                    <select
                                                        id='updateddleventremindme'
                                                        className="form-control"
                                                        value={this.state.remindme}
                                                        onChange={(e) => { this.setState({ remindme: e.target.value }) }}
                                                        disabled={this.state.isEditMode}>
                                                        <option value="0">Never</option>
                                                        <option value="5">5 minutes before</option>
                                                        <option value="15">15 minutes before</option>
                                                        <option value="30"> 30 minutes before</option>
                                                        <option value="60">1  hour before</option>
                                                        <option value="720">12 hours before</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className='row mt-2'>
                                                <div className='col-6'>
                                                    <label>AssignTo</label>
                                                    <select
                                                        id='updateddleventassignee'
                                                        className="form-control"
                                                        value={this.state.assignee}
                                                        onChange={(e) => { this.setState({ assignee: e.target.value }) }}
                                                        disabled={this.state.isEditMode}>
                                                        <option value={0}>Select Assignee</option>
                                                        {
                                                            this.props.assigneeList ? this.props.assigneeList.map((e, key) => {
                                                                return <option key={key} value={e.id}>{e.displayName}</option>;
                                                            })
                                                                : null
                                                        }
                                                    </select>
                                                </div>
                                                <div className='col-3'>
                                                    <label>Repeat</label>
                                                    <select
                                                        id='updateddleventrepeat'
                                                        className="form-control"
                                                        value={this.state.repeat}
                                                        onChange={(e) => { this.setState({ repeat: e.target.value, RepeateEndBy: this.state.endDate }) }}
                                                        disabled={this.state.isEditMode}>
                                                        <option>Do not repeat</option>
                                                        <option>Daily</option>
                                                        <option>Weekly</option>
                                                        <option>Monthly</option>
                                                        <option>Yearly</option>
                                                        {/* <option>Custom</option> */}
                                                    </select>
                                                </div>
                                                {
                                                    this.state.repeat !== 'Do not repeat' &&
                                                    <div className='col-3'>
                                                        <label>Repeate End Till Date</label>
                                                        <DatePicker
                                                            className="form-control"
                                                            selected={this.state.RepeateEndBy}
                                                            onChange={(date) => this.setState({ RepeateEndBy: date })}
                                                            dateFormat="dd/MM/yyyy"
                                                            minDate={this.state.endDate}
                                                            peekNextMonth
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode="select"
                                                            id='txtRepeateEndBy'
                                                            disabled={this.state.isEditMode}
                                                        />
                                                    </div>
                                                }
                                            </div>

                                            <div className='row mt-2'>
                                                <div className='col-6'>
                                                    <button
                                                        className="btn btn-primary mr-2 mt-2"
                                                        onClick={() => { this.setState({ isopensubTask: !this.state.isopensubTask, isopenDesc: false, isopenAttachment: false }) }}
                                                        disabled={this.state.isEditMode}
                                                    >
                                                        Sub Task
                                                    </button>
                                                    <button
                                                        className="btn btn-primary mr-2 mt-2"
                                                        onClick={() => { this.setState({ isopenDesc: !this.state.isopenDesc, isopensubTask: false, isopenAttachment: false }) }}
                                                        disabled={this.state.isEditMode}
                                                    >
                                                        Description
                                                    </button>
                                                    <button
                                                        className="btn btn-primary mr-2 mt-2"
                                                        onClick={() => { this.setState({ isopenAttachment: !this.state.isopenAttachment, isopensubTask: false, isopenDesc: false }) }}
                                                        disabled={this.state.isEditMode}
                                                    >
                                                        Attachment
                                                    </button>
                                                </div>
                                            </div>

                                            <Collapse isOpened={this.state.isopensubTask}>
                                                <div className='row'>
                                                    <div className='col-10'>
                                                        <label>Sub Task</label>
                                                        <input
                                                            id="updatetxtSubTask"
                                                            placeholder="Enter Sub Task"
                                                            type="text"
                                                            className="form-control"
                                                            value={this.state.txtSubtask}
                                                            onChange={(e) => { this.setState({ txtSubtask: e.target.value }) }}
                                                            onKeyDown={this.handleKeyDownSubTask}
                                                        />
                                                    </div>
                                                    <div className='col-2'>
                                                        <br></br>
                                                        <button className='btn btn-info mt-2' onClick={this.addSubTask.bind(this, this.state.txtSubtask)}>
                                                            <i className="fa fa-plus" aria-hidden="true"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <br></br>
                                                <ul className="todo-list ui-sortable" data-widget="todo-list">
                                                    {
                                                        this.state.subTask.map((item, key) => {
                                                            return (
                                                                <li key={key}>
                                                                    {/* <span className="text">{item}</span> */}
                                                                    <span>{item}</span>
                                                                    <div className="tools">
                                                                        {
                                                                            <i className="fas fa-trash" onClick={this.RemovesubTask.bind(this, item)}></i>
                                                                        }
                                                                    </div>
                                                                </li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </Collapse>
                                            <Collapse isOpened={this.state.isopenDesc}>
                                                <label>Description</label>
                                                <div style={{ border: "1px solid black", padding: '2px', minHeight: '240px' }}>
                                                    <Editor
                                                        editorState={this.state.editorState}
                                                        // toolbarClassName="toolbarClassName"
                                                        // wrapperClassName="wrapperClassName"
                                                        // editorClassName="editorClassName"
                                                        onEditorStateChange={this.onEditorStateChange}
                                                    />
                                                </div>
                                            </Collapse>
                                            <Collapse isOpened={this.state.isopenAttachment}>
                                                <label>Attachment</label>
                                                <div className="row">
                                                    <div className="col-sm-12 mb-2">
                                                        <FileUpload
                                                            id="noticeFiles"
                                                            onChange={this.onFileChange.bind(this)}
                                                            className="custom-file-input"
                                                        />
                                                    </div>
                                                    {
                                                        this.state.selectedFileName.map((x, i) => (
                                                            <div className="col-sm-12" key={i} >
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
                                                </div>
                                            </Collapse>

                                            <div className='row mt-2'>
                                                <div className='col-12'>
                                                    <ShowMoreText
                                                        /* Default options */
                                                        lines={2}
                                                        more="Show more"
                                                        less="Show less"
                                                        className="content-css"
                                                        anchorClass="my-anchor-css-class"
                                                        expanded={false}
                                                        // width={280}
                                                        truncatedEndingComponent={"... "}
                                                    >
                                                        <p>Description: </p>
                                                        <div dangerouslySetInnerHTML={{ __html: `${this.state.description}` }} >
                                                        </div>
                                                    </ShowMoreText>

                                                </div>
                                            </div>

                                            <div className='row mt-2'>
                                                <p>Attachments ({this.state.availableAttachment.length})</p>
                                                <div className='col-12'>
                                                    {
                                                        this.state.availableAttachment.length > 0 ?
                                                            this.state.availableAttachment.map((x, i) => (
                                                                x.extension.toLowerCase() === 'pdf' ?
                                                                    <div className="artist-collection-photo" key={i}>
                                                                        <img style={{ height: "60px" }} alt={x.filename} className="img-thumbnail"
                                                                            src={PDFIcon} title={x.filename}
                                                                            onClick={this.showAttachment.bind(this, x.filename, x.filepath, "pdf", x.extension)}
                                                                        />
                                                                    </div>
                                                                    :
                                                                    <div className="artist-collection-photo" key={i}>
                                                                        <img style={{ height: "60px" }} alt={x.filename} className="img-thumbnail"
                                                                            src={`${x.filepath}`} title={x.filename}
                                                                            onClick={this.showAttachment.bind(this, x.filename, x.filepath, "img", x.extension)}
                                                                        />
                                                                    </div>
                                                            )) : null
                                                    }
                                                </div>
                                            </div>

                                            {
                                                this.state.availableSubTask.length > 0 &&
                                                <div className='row'>
                                                    <div className='col-md-11'>
                                                        <Slider
                                                            min={0}
                                                            max={100}
                                                            value={this.state.taskComplete ? Math.round(this.state.taskComplete) : 0}
                                                            format={formatPc}
                                                            tooltip
                                                        />
                                                    </div>
                                                    <div className='col-md-1 mt-2'>
                                                        <div className='value'>{formatPc(this.state.taskComplete ? Math.round(this.state.taskComplete) : 0)}</div>
                                                    </div>
                                                </div>
                                            }

                                            <ul className="todo-list ui-sortable" data-widget="todo-list">
                                                {
                                                    this.state.availableSubTask.map((item, key) => {
                                                        return (
                                                            <li key={key} className={item.isCompleted ? 'done' : null}>
                                                                <div className="d-inline ml-2">
                                                                    <input type="checkbox" checked={item.isCompleted}
                                                                        onChange={(e) => {
                                                                            this.onSubTaskComplete(item.subTaskId, item.isCompleted)
                                                                        }} />
                                                                </div>
                                                                <span className="text">{item.title}</span>
                                                                <div className="tools">
                                                                    {
                                                                        !item.isCompleted ? <i className="fas fa-trash" onClick={() => this.onSubTaskDelete(item.subTaskId)}></i> : null
                                                                    }
                                                                </div>
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </div>
                                        <div className='col-6'>
                                            <div className="card card-primary card-outline card-outline-tabs">
                                                <div className="card-header p-0 border-bottom-0">
                                                    <ul className="nav nav-tabs" id="custom-tabs-four-tab" role="tablist">
                                                        <li className="nav-item">
                                                            <a
                                                                className="nav-link active"
                                                                id="custom-tabs-four-comment-tab"
                                                                data-toggle="pill" href="#custom-tabs-four-comment"
                                                                role="tab"
                                                                aria-controls="custom-tabs-four-comment"
                                                                aria-selected="true">Comment</a>
                                                        </li>
                                                        <li className="nav-item">
                                                            <a
                                                                className="nav-link"
                                                                id="custom-tabs-four-auditlog-tab"
                                                                data-toggle="pill" href="#custom-tabs-four-auditlog"
                                                                role="tab" aria-controls="custom-tabs-four-auditlog"
                                                                aria-selected="false">Audit Logs</a>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="card-body">
                                                    <div className="tab-content" id="custom-tabs-four-tabContent">
                                                        <div
                                                            className="tab-pane fade active show"
                                                            id="custom-tabs-four-comment"
                                                            role="tabpanel"
                                                            aria-labelledby="custom-tabs-four-comment-tab">
                                                            <Comments
                                                                getAddComment={this.getAddComment}
                                                                eventComment={this.state.comments} PDFIcon={PDFIcon}
                                                                closeModal={this.closeAttachmentModal}
                                                                isComplete={this.props.EventDetailsModelInstance.completedBy}
                                                                isDelete={this.props.EventDetailsModelInstance.isDeleteRequest}
                                                            />
                                                        </div>
                                                        <div
                                                            className="tab-pane fade"
                                                            id="custom-tabs-four-auditlog"
                                                            role="tabpanel"
                                                            aria-labelledby="custom-tabs-four-auditlog-tab">
                                                            <div className="timeline mt-1">
                                                                <Logs logs={this.state.logs} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <button
                                        className="btn btn-secondary float-right"
                                        onClick={this.onCancel}>
                                        Cancel
                                    </button>
                                    {
                                        this.props.EventDetailsModelInstance.completedBy === 0 &&
                                            this.props.EventDetailsModelInstance.isDeleteRequest === 0 ?
                                            <Fragment>
                                                <button
                                                    className="btn btn-danger float-right mr-2"
                                                    onClick={this.onDelete}>
                                                    Delete Request
                                                </button>
                                                <button
                                                    className="btn btn-success float-right mr-2"
                                                    onClick={this.onComplete}>
                                                    Complete Event
                                                </button>
                                            </Fragment> : null
                                    }
                                    {/* {
                                        this.state.isEditMode ?
                                            <button className="btn btn-primary float-right mr-2" onClick={this.onEdit}>
                                                Edit
                                            </button>
                                            :
                                            <button className="btn btn-primary float-right mr-2" onClick={this.onSave}>
                                                Save
                                            </button>
                                    } */}
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
                </Modal>
            </div>
        );
    }
}

export default DetailsEvent;