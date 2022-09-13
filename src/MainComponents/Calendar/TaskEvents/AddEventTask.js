import React, { Component } from 'react';
import Modal from 'react-awesome-modal';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { setHours, setMinutes } from 'date-fns';

import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
// import htmlToDraft from 'html-to-draftjs';

import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Collapse } from 'react-collapse';

import { CreateAddEventValidator, ValidateEventControls } from '../Validation';
import { ToastContainer, toast } from 'react-toastify';
import moment from 'moment';
import * as appCommon from '../../../Common/AppCommon.js';
import FileUpload from '../../NoticeBoard/FileUpload';
import ApiProvider from '../DataProvider';

import "./Event.css"

class AddEventTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
            isopensubTask: false,
            isopenDesc: false,
            isopenAttachment: false,
            description: "",
            assignee: 0,
            repeat: 'Do not repeat',
            remindme: 0,
            RepeateEndBy: new Date()
        }
        this.ApiProviderr = new ApiProvider();
    }

    componentDidMount() {
        CreateAddEventValidator();
        this.setState({ startDate: this.props.startDate, endDate: this.props.endDate })
    }

    onEditorStateChange = (editorState) => {
        const convertedData = convertToRaw(editorState.getCurrentContent());
        const markup = draftToHtml(convertedData);
        // console.log(markup);
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
            isopensubTask: false,
            isopenDesc: false,
            isopenAttachment: false,
            description: '',
            assignee: 0,
            categoryId: 0,
            repeat: 'Do not repeat',
            remindme: 0,
            RepeateEndBy: new Date()
        }, () => this.props.closeModal());
    }

    manageEvents = (model, type) => {
        this.ApiProviderr.manageEvents(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'C':
                                if (rData === 1) {
                                    appCommon.showtextalert("Event/Task Saved Successfully!", "", "success");
                                    this.props.getEvents();
                                    this.onCancel();
                                }
                                else if (rData === 2) {
                                    appCommon.showtextalert(`${model[0].title} Event/Task Already Existed Successfully!`, "", "error");
                                }
                                break;
                            default:
                        }
                    });
                }
            });
    }

    onSave = () => {
        const isValidate = ValidateEventControls();
        if (isValidate) {
            if (this.state.repeat !== "Do not repeat") {
                if (this.state.RepeateEndBy) {
                    var type = 'C'
                    var model = this.getModel(type);
                    console.log(model[0]);
                    this.manageEvents(model, "C");
                }
                else {
                    appCommon.showtextalert(`Please select Repeate End By Date`, "", "error");
                }
            }
            else {
                var type = 'C'
                var model = this.getModel(type);
                console.log(model[0]);
                this.manageEvents(model, "C");
            }
        }
    }

    getModel = (type) => {
        var model = [];
        switch (type) {
            case 'C':
                model.push({
                    "cmdType": type,
                    "id": 0,
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
                    "repeateEndBy": this.state.repeat === 'Do not repeat' ? '' : moment(this.state.RepeateEndBy).format("DD/MM/YYYY")
                });
                break;
            default:
        };
        return model;
    }
    onHandleAllDay = (e) => {
        this.setState({ check: e.target.checked })
    }

    render() {
        return (
            <div>
                <Modal
                    visible={this.props.showAddModal}
                    effect="fadeInRight"
                    onClickAway={this.onCancel}
                    width="800"
                >
                    <div className="row">
                        <div className="col-12">
                            <div className="card card-primary">
                                <div className="card-header">
                                    <h3 className="card-title">Add Event/Task</h3>
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
                                        <div className='col-12'>
                                            <label>Title</label>
                                            <input
                                                id="txtTitle"
                                                placeholder="Enter Title"
                                                type="text"
                                                className="form-control"
                                                value={this.state.title}
                                                onChange={(e) => { this.setState({ title: e.target.value }) }}
                                            />
                                        </div>
                                    </div>

                                    <div className='row mt-2'>
                                        <div className='col-6'>
                                            <label>Type</label>
                                            <select
                                                id="ddlEventType"
                                                className="form-control"
                                                value={this.state.type}
                                                onChange={(e) => { this.setState({ type: e.target.value }) }}>
                                                <option value="E">Event</option>
                                            </select>
                                        </div>
                                        <div className='col-6'>
                                            <label>Category</label>
                                            <select
                                                id='dllEventCategory'
                                                className="form-control"
                                                value={this.state.categoryId}
                                                onChange={(e) => { this.setState({ categoryId: e.target.value }) }}>
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
                                                id='txtStartDate'
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label>End Date</label>
                                            <DatePicker
                                                className="form-control"
                                                selected={this.state.endDate}
                                                onChange={(date) => {
                                                    this.setState({ endDate: date, RepeateEndBy: date })
                                                }}
                                                dateFormat="dd/MM/yyyy"
                                                minDate={this.state.startDate}
                                                peekNextMonth
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                id='txtEndDate'
                                            />
                                        </div>
                                        <div className='col-3 mt-2'>
                                            <label>All Day</label>
                                            <br></br>
                                            <label className="switch">
                                                <input type="checkbox"
                                                    onChange={this.onHandleAllDay.bind(this)}
                                                    checked={this.state.check} />
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
                                                timeIntervals={30}
                                                timeCaption="Time"
                                                dateFormat="h:mm a"
                                                disabled={this.state.check}
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
                                                timeIntervals={30}
                                                timeCaption="Time"
                                                dateFormat="h:mm a"
                                                disabled={this.state.check}
                                                minTime={moment(this.state.startTime).add(30, 'm').toDate()}
                                                maxTime={setHours(setMinutes(this.state.startTime, 45), 23)}
                                            />
                                        </div>
                                        <div className='col-3 mt-2'>
                                            <label>Remind me</label>
                                            <select
                                                id='ddleventremindme'
                                                className="form-control"
                                                value={this.state.remindme}
                                                onChange={(e) => { this.setState({ remindme: e.target.value }) }}>
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
                                                id='ddleventassignee'
                                                className="form-control"
                                                value={this.state.assignee}
                                                onChange={(e) => { this.setState({ assignee: e.target.value }) }}>
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
                                                id='ddleventrepeat'
                                                className="form-control"
                                                value={this.state.repeat}
                                                onChange={(e) => {
                                                    this.setState({ repeat: e.target.value, RepeateEndBy: this.state.endDate })
                                                }}>
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
                                                />
                                            </div>
                                        }
                                    </div>

                                    <div className='row mt-2'>
                                        <div className='col-6'>
                                            <button className="btn btn-primary mr-2 mt-2"
                                                onClick={() => { this.setState({ isopensubTask: !this.state.isopensubTask, isopenDesc: false, isopenAttachment: false }) }}>
                                                Sub Task
                                            </button>
                                            <button className="btn btn-primary mr-2 mt-2"
                                                onClick={() => { this.setState({ isopenDesc: !this.state.isopenDesc, isopensubTask: false, isopenAttachment: false }) }}>
                                                Description
                                            </button>
                                            <button className="btn btn-primary mr-2 mt-2"
                                                onClick={() => { this.setState({ isopenAttachment: !this.state.isopenAttachment, isopensubTask: false, isopenDesc: false }) }}>
                                                Attachment
                                            </button>

                                        </div>
                                    </div>

                                    <Collapse isOpened={this.state.isopensubTask}>
                                        <div className='row'>
                                            <div className='col-10'>
                                                <label>Sub Task</label>
                                                <input
                                                    id="txtSubTask"
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
                                                            <span >{item}</span>
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
                                                            {/* 
                                                        <button type="button"
                                                            onClick={() => this.props.showAttachmentmodal(`${x.fileType},${x.filepath}`, x.filename)}
                                                        >
                                                            <i className="fa fa-eye" aria-hidden="true"></i>
                                                        </button> */}
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
                                </div>
                                <div className="card-footer">
                                    <button
                                        className="btn btn-secondary float-right"
                                        onClick={this.onCancel}>
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary float-right mr-2"
                                        onClick={this.onSave}>
                                        Save
                                    </button>
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

AddEventTask.defaultProps = {
    startDate: new Date(),
    endDate: new Date()
}

export default AddEventTask;