import React, { Component, Fragment } from 'react';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from './DataProvider';
import { CreateValidator, ValidateControls } from './Validation';
import { ToastContainer, toast } from 'react-toastify';
import * as appCommon from '../../Common/AppCommon.js';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';
import MultiSelectInline from '../../ReactComponents/MultiSelectInline/MultiSelectInline.jsx';
import FileUpload from '../NoticeBoard/FileUpload';
import { ShowImageModal } from './ImageModal'
import { ShowPdfModal } from './ShowPdf'
import PDFIcon from './AttachmentIcons/pdficon.png';

import { connect } from 'react-redux';
import departmentAction from '../../redux/department/action';
import { bindActionCreators } from 'redux';
import TicketReopen from './TicketReopen';
import TicketOnhold from './TicketOnhold';
import TicketComment from './TicketComment';


import ShowMoreText from "react-show-more-text";


const $ = window.$;

class TicketDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTicketID: null,
            initialComplainLocation: null,
            propertyDetailsId: 0, propertyName: null, propertyNameList: [],
            assigneeList: [], complainByList: [{ Id: 0, Name: "Select Reporter" }],
            complainVisibilityList: [
                { Id: '', Name: "Select Visibility" },
                { Id: "Community", Name: 'Community' },
                { Id: "Personal", Name: 'Personal' },
            ],
            comment: "",
            selectedFileName: [],
            istower: false,
            showImagefilename: '',
            showImagefile: '',
            showImagefiletype: '',
            extension: '',
            ticketstatusTypeList: [],
            isCommentBoxShow: false,
        }
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    componentDidMount() {
        // 1_OPEN, 2_IN PROGRESS, 3_RESOLVED, 4_CLOSED  
        let ticketStatusTypeData = [
            { Id: 1, Name: "OPEN" },
            { Id: 2, Name: "IN PROGRESS" },
            { Id: 3, Name: "RESOLVED" },
            { Id: 4, Name: "CLOSED" }
        ]
        this.setState({ ticketstatusTypeList: ticketStatusTypeData })
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.currentTicketID !== this.props.EditTicktDetails.CardId) {
            if (this.props.EditTicktDetails.CardOrigin === 'Property') {
                if (this.props.TicketDetailModelInstance != null && this.props.TicketDetailModelInstance.complainLocation) {
                    this.setState({
                        initialComplainLocation: this.props.TicketDetailModelInstance.complainLocation,
                        propertyDetailsId: this.props.TicketDetailModelInstance.complainLocation.Id
                    },
                        () => {
                            this.loadComplainbyAccordingPropertyDT(this.props.TicketDetailModelInstance.complainLocation.Id)
                        })
                }

                if (this.props.TicketDetailModelInstance != null && this.props.TicketDetailModelInstance.category) {
                    this.loadCategoryWiseAssignee("TAM", this.props.TicketDetailModelInstance.category.Id, parseInt(this.props.PropertyId))
                }
            }
            this.setState({
                currentTicketID: this.props.EditTicktDetails.CardId,
            }, () => {
                // console.log(this.props.TicketDetailModelInstance);
            })
        }
    }

    // Staff
    loadCategoryWiseAssignee = (StatementType, Category, PropertyId) => {
        // debugger
        this.ApiProviderr.GetTeamMember(StatementType, Category, PropertyId).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let CategoryWiseTeamMemberData = [];
                        rData.forEach(element => {
                            let val = {
                                Id: element.id,
                                Name: element.text,
                                value: element.id,
                                label: element.text, color: '#0052CC'
                            };
                            CategoryWiseTeamMemberData.push(val);
                        });
                        this.setState({ assigneeList: CategoryWiseTeamMemberData });
                    });
                }
            }
        )
    }

    // If Complain Location is tower then show property details according to tower
    loadPropertyDetailsComplainLocationWise = (towerid) => {
        this.ApiProviderr.GetDropdownData("PD", this.props.PropertyId, 0, towerid).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let Data = [];
                        rData.forEach(element => {
                            let val = {
                                Id: element.id,
                                Name: element.text,
                                value: element.id, label: element.text, color: '#0052CC'
                            };
                            Data.push(val);
                        });
                        this.setState({ propertyNameList: Data });
                    });
                }
            }
        )
    }
    // Load complain by name according to property details
    loadComplainbyAccordingPropertyDT = (propertyDTId) => {
        this.ApiProviderr.GetDropdownData("CB", this.props.PropertyId, propertyDTId, 0).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let Data = [{ Id: 0, Name: "Select Reporter" }];
                        rData.forEach(element => {
                            let val = {
                                Id: element.id,
                                Name: element.text,
                            };
                            Data.push(val);
                        });
                        this.setState({ complainByList: Data }, () => {
                            // console.log(this.state.complainByList);
                            // console.log("Reporter Data ", Data, "Proeprty id ", propertyDTId);
                        });
                    });
                }
            }
        )
    }

    onSelected(name, value) {
        // debugger
        switch (name) {
            case "Ticketstatustype":
                if (parseInt(value) !== 0) {
                    // 1_OPEN, 2_IN PROGRESS, 3_RESOLVED, 4_CLOSED
                    if (parseInt(value) === 1) {
                        this.props.TicketDetailModelInstance.setTicketstatusColor('OPEN');
                    }
                    else if (parseInt(value) === 2) {
                        this.props.TicketDetailModelInstance.setTicketstatusColor('INPROGRESS');
                    }
                    else if (parseInt(value) === 3) {
                        this.props.TicketDetailModelInstance.setTicketstatusColor('RESOLVED');
                    }
                    else if (parseInt(value) === 4) {
                        this.props.TicketDetailModelInstance.setTicketstatusColor('CLOSED');
                    }
                    let oldTicketStatus = parseInt(this.props.TicketDetailModelInstance.ticketstatus);
                    let OldName = this.state.ticketstatusTypeList.filter(x => x.Id === oldTicketStatus)
                    this.props.TicketDetailModelInstance.setTicketStatus(parseInt(value));
                    let type = 'UT';
                    var model = this.getModel(type, 'S');
                    this.manageTickets(model, type);
                    let Name = this.state.ticketstatusTypeList.filter(x => x.Id === parseInt(value))
                    let logsms = `Ticket status changed  ${OldName[0].Name} To ${Name[0].Name}`;
                    this.onAddTicketHistory(logsms);
                }
                break;
            case "Priority":
                if (parseInt(value) !== 0) {
                    let oldPririty = parseInt(this.props.TicketDetailModelInstance.priority);
                    this.props.TicketDetailModelInstance.setPriority(parseInt(value));
                    let type = 'UT';
                    var model = this.getModel(type, 'P');
                    this.manageTickets(model, type);

                    let Prioritydt = this.props.priorityList.filter(x => x.Id === parseInt(value))
                    let Priorityolddt = this.props.priorityList.filter(x => x.Id === oldPririty)
                    let logsms = `Changed Priority from ${Priorityolddt[0].Name} To ${Prioritydt[0].Name}`;
                    this.onAddTicketHistory(logsms);

                }
                break;
            case "ComplainBy": // proepry owener
                if (parseInt(value) !== 0) {
                    let OldComplainBy = this.state.complainByList.filter(x => x.Id === parseInt(this.props.TicketDetailModelInstance.complainById))
                    this.props.TicketDetailModelInstance.setComplainBy(value);
                    let type = 'UT';
                    var model = this.getModel(type, 'R');
                    this.manageTickets(model, type);

                    let ComplainBydt = this.state.complainByList.filter(x => x.Id === parseInt(value))

                    let logsms = `Changed Reporter from ${OldComplainBy[0].Name} To ${ComplainBydt[0].Name}`;
                    this.onAddTicketHistory(logsms);
                }
                break;
            case "ComplaoinVisibiltiy":
                if (value !== "") {
                    let oldVisisbilty = this.props.TicketDetailModelInstance.visisbilty;
                    this.props.TicketDetailModelInstance.setVisisbilty(value);
                    let type = 'UT';
                    var model = this.getModel(type, 'V');
                    this.manageTickets(model, type);
                    let logsms = `Changed Visibiltiy from ${oldVisisbilty} To ${value}`;
                    this.onAddTicketHistory(logsms);
                }
                break;
            default:
        }
    }

    OnComplainLocationChange(value, event) {
        if (value !== null) {
            this.props.TicketDetailModelInstance.setComplainLocation(value);
            if (value.Name === "Tower") {
                this.setState({ istower: true, propertyNameList: [], propertyDetailsId: 0 },
                    () => this.loadPropertyDetailsComplainLocationWise(value.Id))
            }
            else {
                this.setState({ istower: false, propertyNameList: [], propertyDetailsId: value.Id },
                    () => {
                        let type = 'UT';
                        var model = this.getModel(type, 'L');
                        this.manageTickets(model, type);
                        this.loadComplainbyAccordingPropertyDT(value.Id)
                        let logsms = `Changed PropertyName from ${this.state.initialComplainLocation.label} To ${value.label}`;
                        this.onAddTicketHistory(logsms);
                        this.setState({ initialComplainLocation: value })
                    })
            }
        }
        else {
            this.setState({ istower: false, propertyNameList: [], propertyDetailsId: 0 })
        }
    }

    OnPropertyNameChange(value, event) {
        if (value !== null) {
            this.setState({ propertyName: value, propertyDetailsId: value.Id },
                () => {
                    let type = 'UT';
                    var model = this.getModel(type, 'L');
                    this.manageTickets(model, type);
                    this.loadComplainbyAccordingPropertyDT(value.Id);
                    let logsms = `Changed PropertyName from ${this.state.initialComplainLocation.label} To ${value.Name}`;
                    this.onAddTicketHistory(logsms);
                    this.setState({ initialComplainLocation: value })
                });
        }
        else {
            this.setState({ propertyNameList: [], propertyDetailsId: 0 });
        }
    }
    OnComplainCategoryChange(value, event) {
        if (value != null) {
            let oldCategory = this.props.TicketDetailModelInstance.category;
            this.props.TicketDetailModelInstance.setCategory(value);
            let type = 'UT';
            var model = this.getModel(type, 'T');
            this.manageTickets(model, type);
            this.loadCategoryWiseAssignee("TAM", value.Id, parseInt(this.props.PropertyId));

            let logsms = `Changed Category from ${oldCategory.Name} To ${value.Name}`;
            this.onAddTicketHistory(logsms);
        }
        else {
            this.loadCategoryWiseAssignee("TAM", 0, parseInt(this.props.PropertyId));
        }
    }
    OnComplainAssigneeChange(value, event) {
        if (value !== null) {
            let oldStaff = this.props.TicketDetailModelInstance.assignee;
            this.props.TicketDetailModelInstance.setStaff(value);
            let type = 'UT';
            var model = this.getModel(type, 'ST');
            this.manageTickets(model, type);

            let logsms = `Changed Staff from ${oldStaff.Name} To ${value.Name}`;
            this.onAddTicketHistory(logsms);
        }
    }

    // end time check all state reset or not 
    onCancel = () => {
        this.setState({
            currentTicketID: null,
            propertyDetailsId: 0, propertyName: null, propertyNameList: [],
            assigneeList: [],
            complainByList: [{ Id: 0, Name: "Select Reporter" }],
            istower: false,
            showImagefilename: '',
            showImagefile: '',
            showImagefiletype: '',
            extension: '',
            selectedFileName: [],
            comment: "",
            isCommentBoxShow: false,
        }, () => {
            this.props.onClose();
        })
    }

    handleSaveComment = () => {
        if (this.state.currentTicketID !== null && this.state.comment !== '') {
            let type = 'TC';
            var model = this.getModel(type);
            // console.log(model);
            this.manageTickets(model, type);
        }
        else {
            appCommon.showtextalert("Please Resolve validation error before submit", "", "error");
        }
    }
    handleCancelComment = () => {
        this.setState({ isCommentBoxShow: false, selectedFileName: [], comment: '' })
    }

    manageTickets = (model, type) => {
        this.ApiProviderr.manageTickets(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'TC':
                                if (rData >= 1) {
                                    // appCommon.showtextalert("Comment Saved Successfully!", "", "success");
                                    this.handleCancelComment();
                                    // Refresh comment
                                    this.props.loadTicketComments(this.props.EditTicktDetails.CardId)
                                }
                                else
                                    appCommon.showtextalert("Comment Failed !", "", "error");
                                break;
                            case 'UT':
                                if (rData >= 1) {
                                    this.props.loadBoradData();
                                }
                                else
                                    appCommon.showtextalert("Faild to update ticket details !", "", "error");
                                break;
                            case 'CTL':
                                if (rData >= 1) {
                                    this.props.loadTicketComments(this.props.EditTicktDetails.CardId)
                                }
                                else
                                    appCommon.showtextalert("Faild to update ticket log details !", "", "error");
                                break;
                            default:
                        }
                    });
                }
            });
    }

    getModel = (type, updateCmdType, logSms) => {
        var model = [];
        switch (type) {
            case 'TC':
                model.push({
                    "TicketId": this.state.currentTicketID ? parseInt(this.state.currentTicketID) : 0,
                    "UserType": 'User',
                    "Comment": this.state.comment,
                    "CommentType": 'Comment',
                    "CommentAttachment": this.state.selectedFileName,
                });
                break;
            case 'CTL':
                model.push({
                    "TicketId": this.state.currentTicketID ? parseInt(this.state.currentTicketID) : 0,
                    "LoggedByType": 'User',
                    "Log": logSms,
                    "cmdtype": 'C',
                    "LoggedBy": ''
                });
                break;
            case 'UT':
                model.push({
                    "TicketId": this.state.currentTicketID ? parseInt(this.state.currentTicketID) : 0,
                    "TicketPriorityId": this.props.TicketDetailModelInstance ? parseInt(this.props.TicketDetailModelInstance.priority) : 0,
                    "TicketTypeId": this.props.TicketDetailModelInstance.category ? parseInt(this.props.TicketDetailModelInstance.category.Id) : 0, // category
                    "StatusTypeId": this.props.TicketDetailModelInstance ? parseInt(this.props.TicketDetailModelInstance.ticketstatus) : 0, // lane id
                    "Visibility": this.props.TicketDetailModelInstance ? this.props.TicketDetailModelInstance.visisbilty : '', // visibility
                    "PropertyDetaildId": this.state.propertyDetailsId ? parseInt(this.state.propertyDetailsId) : 0,// location
                    "ReportedBy": this.props.TicketDetailModelInstance ? parseInt(this.props.TicketDetailModelInstance.complainById) : 0, // Reporter complainBy                  
                    "AssignTo": this.props.TicketDetailModelInstance.assignee ? parseInt(this.props.TicketDetailModelInstance.assignee.Id) : 0, // Staff value
                    "cmdtype": updateCmdType,
                });
                break;
            default:
        };
        return model;
    }

    showImage = (filename, src, type, extension) => {
        this.setState({ showImagefilename: filename, showImagefile: src, showImagefiletype: type, extension: extension },
            () => {
                $('#modal-lg-img').modal('show')
            })
    }
    showPdf = (filename, src, type, extension) => {
        this.setState({ showImagefilename: filename, showImagefile: src, showImagefiletype: type, extension: extension },
            () => {
                $('#modal-lg-pdf').modal('show')
            })
    }

    // On file Change
    onFileChange(data) {
        let limit = 5000; // In mb
        let files = [...this.state.selectedFileName]
        if (data !== null) {
            let _validFileExtensions = ["jpg", "jpeg", "bmp", "gif", "png", "pdf"];
            // let extension = data.filename.substring(data.filename.lastIndexOf('.') + 1);
            let isvalidFiletype = _validFileExtensions.some(x => x === data.extension);
            if (isvalidFiletype) {
                if (data.sizeinKb <= limit) {
                    let isAvailable = files.some(x => x.filename === data.filename);
                    if (!isAvailable) {
                        files.push(data);
                    }
                    else {
                        appCommon.showtextalert(data.filename + " Already Existed !", "", "error");
                    }
                }
                else {
                    appCommon.showtextalert("File must be less than or equal to 5MB", "", "error");
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

    onshowReopenModal = () => {
        $('#modal-Ticket-Reopen').modal('show');
    }
    onshowOnholdModal = () => {
        $('#modal-Ticket-Onhold').modal('show');
    }

    // after successfull change ticket hold status
    onTicketHold = (val) => {
        this.props.TicketDetailModelInstance.setHold(val);

    }
    // after successfull change ticket reopen status
    onTicketReopen = (val) => {
        this.props.TicketDetailModelInstance.setReopen(val);
    }

    onAddTicketHistory = (logsms) => {
        let type = 'CTL';
        let model = this.getModel(type, '', logsms);
        this.manageTickets(model, type);
    }
    render() {
        return (
            <div className="modal fade" id="modal-lg-ticketDetail" data-keyboard="false" data-backdrop="static">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Ticket No: {this.props.EditTicktDetails.CardTicketNum}</h4>
                            <button type="button"
                                className="close"
                                // data-dismiss="modal"
                                aria-label="Close"
                                onClick={this.onCancel.bind(this)}
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body" style={{ height: "90vh", overflowY: "auto" }}>
                            <div className="">
                                <ShowImageModal
                                    Id="modal-lg-img"
                                    titile={this.state.showImagefilename}
                                    showImagefiletype={this.state.showImagefiletype}
                                    showImagefile={this.state.showImagefile}
                                    extension={this.state.extension}

                                />
                                <ShowPdfModal
                                    Id="modal-lg-pdf"
                                    titile={this.state.showImagefilename}
                                    showImagefiletype={this.state.showImagefiletype}
                                    showImagefile={this.state.showImagefile}
                                    extension={this.state.extension}
                                />

                                <TicketReopen
                                    Id="modal-Ticket-Reopen"
                                    titile="Ticket Reopen"
                                    TicketId={this.props.EditTicktDetails.CardId}
                                    loadBoradData={this.props.loadBoradData}
                                    onTicketReopen={this.onTicketReopen.bind(this)}
                                    onAddTicketHistory={this.onAddTicketHistory.bind(this)}
                                    onCloseTicketDetails={this.onCancel.bind(this)}

                                />
                                <TicketOnhold
                                    Id="modal-Ticket-Onhold"
                                    titile="Pause/Hole Ticket"
                                    TicketId={this.props.EditTicktDetails.CardId}
                                    loadBoradData={this.props.loadBoradData}
                                    onTicketHold={this.onTicketHold.bind(this)}
                                    onAddTicketHistory={this.onAddTicketHistory.bind(this)}
                                />

                                <div className="row">
                                    <div className="col-sm-4">
                                        <div class="media">
                                            <span class="media-left">
                                                <img
                                                    alt="NA"
                                                    src={this.props.EditTicktDetails.CardReoprterImg}
                                                    width="50px"
                                                    height="50px"
                                                    className="img-circle"
                                                />
                                            </span>
                                            <div class="media-body">
                                                <h3 class="media-heading">{this.props.EditTicktDetails.Cardusername}</h3>
                                                {this.state.initialComplainLocation ?
                                                    ` (${this.state.initialComplainLocation.label})`
                                                    :
                                                    ` (${this.props.EditTicktDetails.CardOrigin})`
                                                }
                                                <br></br>
                                                Created - {this.props.EditTicktDetails.CardcreatedDate}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-4">
                                        <div className="form-group">
                                            <label>Title :  {this.props.EditTicktDetails.CardTitle} </label>
                                        </div>

                                        <div className="form-group">
                                            <label>Description </label>
                                            <br></br>
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
                                                {this.props.EditTicktDetails.Carddescription}
                                            </ShowMoreText>
                                        </div>
                                    </div>
                                    <div className="col-sm-4">
                                        <div className="form-group">
                                            <label>Attachments ({this.props.EditTicktDetails.CardAttachment.length})</label>
                                            <br></br>
                                            {
                                                this.props.EditTicktDetails.CardAttachment.length > 0 ?
                                                    this.props.EditTicktDetails.CardAttachment.map((x, i) => (
                                                        x.extension.toLowerCase() === 'pdf' ?
                                                            <div className="artist-collection-photo">
                                                                <img style={{ height: "60px" }} alt={x.filename} className="img-thumbnail"
                                                                    src={PDFIcon} title={x.filename}
                                                                    onClick={this.showPdf.bind(this, x.filename, x.filepath, null, x.extension)}
                                                                />
                                                            </div>
                                                            :
                                                            <div className="artist-collection-photo">
                                                                <img style={{ height: "60px" }} alt={x.filename} className="img-thumbnail"
                                                                    src={`${x.filepath}`} title={x.filename}
                                                                    onClick={this.showImage.bind(this, x.filename, x.filepath, null, x.extension)} />
                                                            </div>
                                                    )) : null
                                            }
                                            {
                                                this.props.EditTicktDetails.CardAttachment.length > 0 ?
                                                    <div> <br></br> <br></br> <br></br> <br></br> </div> : null
                                            }

                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <div className="form-group">
                                            <label>Ticket Status</label>
                                            <SelectBox
                                                ID="dllticketstatustype"
                                                Value={this.props.TicketDetailModelInstance ? this.props.TicketDetailModelInstance.ticketstatus : 0}
                                                onSelected={this.onSelected.bind(this, "Ticketstatustype")}
                                                Options={this.state.ticketstatusTypeList}
                                                ClassName={`form-control ${this.props.TicketDetailModelInstance ? this.props.TicketDetailModelInstance.ticketstatusColor : ''}`}
                                                // disabled={this.props.EditTicktDetails.CardLaneId.split('_')[1] === 'CLOSED' ? true : false}
                                                disabled={this.props.TicketDetailModelInstance ?
                                                    this.props.TicketDetailModelInstance.ticketstatus === 4 ? true : false
                                                    : false}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-3">
                                        {
                                            this.props.EditTicktDetails.CardOrigin === "Property" ?
                                                <div className="form-group">
                                                    <label htmlFor="ddlEscalationMatrixPriority">Location</label>
                                                    <MultiSelectInline
                                                        ID="ddlComplainLocation"
                                                        onclose={true}
                                                        isMulti={false}
                                                        value={this.props.TicketDetailModelInstance ? this.props.TicketDetailModelInstance.complainLocation : null}
                                                        onChange={this.OnComplainLocationChange.bind(this)}
                                                        options={this.props.complainLocationList}
                                                        // disabled={this.props.EditTicktDetails.CardLaneId.split('_')[1] === 'CLOSED' ? true : false}
                                                        disabled={this.props.TicketDetailModelInstance ?
                                                            this.props.TicketDetailModelInstance.ticketstatus === 4 ? true : false
                                                            : false}
                                                    />
                                                </div>
                                                : null
                                        }
                                    </div>

                                    {
                                        this.state.istower && this.props.EditTicktDetails.CardOrigin === "Property" ?
                                            <div className="col-sm-3">
                                                <div className="form-group">
                                                    <label htmlFor="ddlEscalationMatrixPriority"> Property Name</label>
                                                    <MultiSelectInline
                                                        ID="ddlPropertyName"
                                                        onclose={true}
                                                        isMulti={false}
                                                        value={this.state.propertyName}
                                                        onChange={this.OnPropertyNameChange.bind(this)}
                                                        options={this.state.propertyNameList}
                                                        // disabled={this.props.EditTicktDetails.CardLaneId.split('_')[1] === 'CLOSED' ? true : false}
                                                        disabled={this.props.TicketDetailModelInstance ?
                                                            this.props.TicketDetailModelInstance.ticketstatus === 4 ? true : false
                                                            : false}
                                                    />
                                                </div>
                                            </div>
                                            : null
                                    }

                                    <div className="col-sm-3">
                                        <div className="form-group">
                                            <label htmlFor="ddlEscalationMatrixPriority">Category</label>
                                            <MultiSelectInline
                                                ID="ddlComplainCategory"
                                                onclose={true}
                                                isMulti={false}
                                                value={this.props.TicketDetailModelInstance ? this.props.TicketDetailModelInstance.category : null}
                                                onChange={this.OnComplainCategoryChange.bind(this)}
                                                options={this.props.CategoryDataCreateAndEditTicket}
                                                // disabled={this.props.EditTicktDetails.CardLaneId.split('_')[1] === 'CLOSED' ? true : false}
                                                disabled={this.props.TicketDetailModelInstance ?
                                                    this.props.TicketDetailModelInstance.ticketstatus === 4 ? true : false
                                                    : false}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-3">
                                        <div className="form-group">
                                            <label htmlFor="ddlEscalationMatrixCategory">Priority</label>
                                            <SelectBox
                                                ID="ddlPriority"
                                                Value={this.props.TicketDetailModelInstance ? this.props.TicketDetailModelInstance.priority : 0}
                                                onSelected={this.onSelected.bind(this, "Priority")}
                                                Options={this.props.priorityList}
                                                ClassName="form-control "
                                                // disabled={this.props.EditTicktDetails.CardLaneId.split('_')[1] === 'CLOSED' ? true : false}
                                                disabled={this.props.TicketDetailModelInstance ?
                                                    this.props.TicketDetailModelInstance.ticketstatus === 4 ? true : false
                                                    : false}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <br></br>
                                <div className="row">
                                    <div className="col-sm-3">
                                        {
                                            this.props.EditTicktDetails.CardOrigin === "Property" ?
                                                <div className="form-group">
                                                    <label htmlFor="ddlEscalationMatrixPriority">Staff</label>
                                                    <MultiSelectInline
                                                        ID="ddlAssignee"
                                                        onclose={true}
                                                        isMulti={false}
                                                        value={this.props.TicketDetailModelInstance ? this.props.TicketDetailModelInstance.assignee : null}
                                                        onChange={this.OnComplainAssigneeChange.bind(this)}
                                                        options={this.state.assigneeList}
                                                        // disabled={this.props.EditTicktDetails.CardLaneId.split('_')[1] === 'CLOSED' ? true : false}
                                                        disabled={this.props.TicketDetailModelInstance ?
                                                            this.props.TicketDetailModelInstance.ticketstatus === 4 ? true : false
                                                            : false}
                                                    />
                                                </div>
                                                : null
                                        }
                                    </div>
                                    <div className="col-sm-3">
                                        {
                                            this.props.EditTicktDetails.CardOrigin === "Property" ?
                                                <div className="form-group">
                                                    <label htmlFor="ddlEscalationMatrixCategory">Reporter</label>
                                                    <SelectBox
                                                        ID="ddlComplainBy"
                                                        Value={this.props.TicketDetailModelInstance ? this.props.TicketDetailModelInstance.complainById : 0}
                                                        onSelected={this.onSelected.bind(this, "ComplainBy")}
                                                        Options={this.state.complainByList}
                                                        ClassName="form-control "
                                                        // disabled={this.props.EditTicktDetails.CardLaneId.split('_')[1] === 'CLOSED' ? true : false}
                                                        disabled={this.props.TicketDetailModelInstance ?
                                                            this.props.TicketDetailModelInstance.ticketstatus === 4 ? true : false
                                                            : false}
                                                    />
                                                </div>
                                                : null
                                        }
                                    </div>
                                    <div className="col-sm-3">
                                        <div className="form-group">
                                            <label htmlFor="ddlEscalationMatrixCategory">Visibility</label>
                                            <SelectBox
                                                ID="ddlComplainVisibility"
                                                Value={this.props.TicketDetailModelInstance ? this.props.TicketDetailModelInstance.visisbilty : ''}
                                                onSelected={this.onSelected.bind(this, "ComplaoinVisibiltiy")}
                                                Options={this.state.complainVisibilityList}
                                                ClassName="form-control "
                                                disabled={this.props.TicketDetailModelInstance ?
                                                    this.props.TicketDetailModelInstance.ticketstatus === 4 ? true : false
                                                    : false}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-3">
                                        {
                                            this.props.TicketDetailModelInstance && this.props.TicketDetailModelInstance.ticketstatus !== 4
                                                ?
                                                <div className="form-group">
                                                    <label htmlFor="lblholdticket">
                                                        Hold Ticket: &nbsp;&nbsp;
                                                        {this.props.TicketDetailModelInstance ?
                                                            this.props.TicketDetailModelInstance.isHoldTicket === 1 ? 'Yes' : 'No' : null
                                                        }
                                                    </label>
                                                    <br></br>
                                                    <Button
                                                        Id="btnHold"
                                                        Text="Pause/Hold Ticket"
                                                        Action={this.onshowOnholdModal.bind(this)}
                                                        ClassName="btn btn-primary"
                                                    />
                                                </div>
                                                : null
                                        }
                                        {
                                            this.props.TicketDetailModelInstance && this.props.TicketDetailModelInstance.ticketstatus === 4
                                                // this.props.EditTicktDetails.CardLaneId.split('_')[1] === 'CLOSED' 
                                                ?
                                                <div className="form-group">
                                                    <label htmlFor="lblreopenticket">
                                                        Reopen Ticket: &nbsp;&nbsp;
                                                        {this.props.TicketDetailModelInstance ?
                                                            this.props.TicketDetailModelInstance.isReopenTicket === 1 ? 'Yes' : 'No' : null
                                                        }
                                                    </label>
                                                    <br></br>
                                                    <Button
                                                        Id="btnReopen"
                                                        Text="Reopen Ticket"
                                                        Action={this.onshowReopenModal.bind(this)}
                                                        ClassName="btn btn-danger"
                                                    />
                                                </div>
                                                : null
                                        }
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-sm-12">
                                        {
                                            this.props.TicketDetailModelInstance && this.props.TicketDetailModelInstance.ticketstatus === 4
                                                // this.props.EditTicktDetails.CardLaneId.split('_')[1] === 'CLOSED' 
                                                ? null :
                                                <div style={{
                                                    borderTop: "1px solid gainsboro", borderBottom: "1px solid gainsboro",
                                                    padding: "6px", cursor: "pointer"
                                                }}>
                                                    <i className="fa fa-reply" aria-hidden="true"
                                                        onClick={() => this.setState({ isCommentBoxShow: !this.state.isCommentBoxShow })}>
                                                        <b>&nbsp;&nbsp; Comment</b></i>
                                                </div>
                                        }
                                        {
                                            this.state.isCommentBoxShow &&
                                            <div className="mt-2">
                                                <div className="form-group">
                                                    <textarea
                                                        onChange={(e) => this.setState({ comment: e.target.value })}
                                                        value={this.state.comment}
                                                        placeholder="Enter your comment here..."
                                                        className="form-control form-control-sm"
                                                        rows="3"
                                                    />
                                                </div>
                                                {
                                                    this.state.selectedFileName.length > 0 ?
                                                        this.state.selectedFileName.map((x, i) => (
                                                            <div className="col-sm-12" key={i}>
                                                                {
                                                                    x.extension === 'pdf' ?
                                                                        <div className="artist-collection-photo">
                                                                            <div>
                                                                                <button
                                                                                    className="close"
                                                                                    type="button"
                                                                                    onClick={this.RemoveFile.bind(this, x.filename)}>
                                                                                    ×</button>
                                                                            </div>
                                                                            <img style={{ height: "80px" }} alt={x.filename} className="img-thumbnail"
                                                                                src={PDFIcon} title={x.filename}
                                                                                onClick={this.showPdf.bind(this, x.filename, x.filepath, x.fileType, x.extension)}
                                                                            />
                                                                        </div>
                                                                        :
                                                                        <div className="artist-collection-photo">
                                                                            <div>
                                                                                <button
                                                                                    className="close"
                                                                                    type="button"
                                                                                    onClick={this.RemoveFile.bind(this, x.filename)}>
                                                                                    ×</button>
                                                                            </div>
                                                                            <img style={{ height: "80px" }} alt={x.filename} className="img-thumbnail"
                                                                                src={`${x.fileType},${x.filepath}`} title={x.filename}
                                                                                onClick={this.showImage.bind(this, x.filename, x.filepath, x.fileType, x.extension)} />
                                                                        </div>
                                                                }
                                                            </div>
                                                        )) : null
                                                }
                                                <FileUpload
                                                    id="ticketCommentAttachments"
                                                    onChange={this.onFileChange.bind(this)}
                                                    className="custom-file-input"
                                                />

                                                <div className="mt-2 float-right">
                                                    <Button
                                                        Id="btnSaveComment"
                                                        Text="Submit"
                                                        Action={this.handleSaveComment.bind(this)}
                                                        ClassName="btn btn-primary mr-2"
                                                    />
                                                    <Button
                                                        Id="btnCancelComment"
                                                        Text="Cancel"
                                                        Action={this.handleCancelComment.bind(this)}
                                                        ClassName="btn  btn-danger "
                                                    />
                                                </div>
                                            </div>
                                        }
                                        <br></br>
                                        <TicketComment
                                            TicketComment={this.props.ticketComments}
                                            ticketCommentLoading={this.props.ticketCommentLoading}
                                        />
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
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default TicketDetails;

// function mapStoreToprops(state, props) {
//     return {

//         PropertyId: state.Commonreducer.puidn,
//         Entrolval: state.Commonreducer.entrolval,
//     }
// }

// function mapDispatchToProps(dispatch) {
//     const actions = bindActionCreators(departmentAction, dispatch);
//     return { actions };
// }
// export default connect(mapStoreToprops, mapDispatchToProps)(TicketDetails);