import React, { Component } from 'react';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from './DataProvider';
import {  ValidateControls } from './Validation';
import { ToastContainer } from 'react-toastify';
import * as appCommon from '../../Common/AppCommon.js';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';
import MultiSelectInline from '../../ReactComponents/MultiSelectInline/MultiSelectInline.jsx';
import { connect } from 'react-redux';
import departmentAction from '../../redux/department/action';
import { bindActionCreators } from 'redux';
import FileUpload from '../NoticeBoard/FileUpload';
import { ShowImageModal } from './ImageModal'
import { ShowPdfModal } from './ShowPdf'
import PDFIcon from './AttachmentIcons/pdficon.png';

const $ = window.$;

class CreateTicket extends Component {
    constructor(props) {
        super(props);
        this.state = {
            complainLocation: null, complainLocationList: [],
            propertyDetailsId: 0, propertyName: null, propertyNameList: [],
            complainCategory: null,
            assignee: null, assigneeList: [],
            tickettype: '',
            priorityId: 0,
            complainById: 0, complainByList: [],
            complainVisibilityId: 0, complainVisibilityList: [],
            Title: '', Description: '',
            selectedFileName: [],
            istower: false,
            showImagefilename: '',
            showImagefile: '',
            showImagefiletype: '',
            extension: '',
            propertyManger: null
        }
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    componentDidMount() {
        let Data = [];

        Data = [{ Id: 0, Name: "Select Reporter" }];

        this.setState({ complainByList: Data });

        Data = [
            { Id: '', Name: "Select Visibility" },
            { Id: "Community", Name: 'Community' },
            { Id: "Personal", Name: 'Personal' },
        ];
        this.setState({ complainVisibilityList: Data });
        this.setState({ complainVisibilityId: "Personal" });

        this.setState({ complainLocationList: this.props.complainLocationList })

        this.setState({ tickettype: this.props.tickettype })
        this.getPropertyManager(parseInt(this.props.PropertyId));
    }

    loadCategoryWiseAssignee = (StatementType, Category, PropertyId) => {
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
                        this.setState({ assigneeList: CategoryWiseTeamMemberData }, () => {
                            if (this.state.assigneeList.length === 1) {
                                this.setState({ assignee: this.state.assigneeList[0] })
                            }
                            else {
                                this.setState({ assignee: null })
                            }
                        });
                    });
                }
            }
        )
    }

    loadComplainLocationData = () => {
        this.ApiProviderr.GetDropdownData("CL", this.props.PropertyId, 0, 0).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let Data = [];
                        rData.forEach(element => {
                            let val = {
                                Id: element.id,
                                Name: element.complainLocationType,
                                value: element.id, label: element.text, color: '#0052CC'
                            };
                            Data.push(val);
                        });
                        this.setState({ complainLocationList: Data });
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
                            if (this.state.complainByList.length === 2) {
                                this.setState({ complainById: this.state.complainByList[1].Id })
                            }
                            else {
                                this.setState({ complainById: 0 })
                            }
                        });
                    });
                }
            }
        )
    }

    componentDidUpdate(prevProps) {
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.loadComplainLocationData();
            this.getPropertyManager(parseInt(this.props.PropertyId));
        }
    }

    onSelected(name, value) {
        switch (name) {
            case "Priority":
                this.setState({ priorityId: value });
                break;
            case "ComplainBy":
                this.setState({ complainById: value });
                break;
            case "ComplaoinVisibiltiy":
                this.setState({ complainVisibilityId: value });
                break;
            default:
        }
    }

    updateData = (name, value) => {
        switch (name) {
            case "Title":
                this.setState({ Title: value });
                break;
            default:
        }
    }

    OnComplainLocationChange(value, event) {
        if (value !== null) {
            if (value.Name === "Tower") {
                this.setState({ istower: true, propertyNameList: [], propertyDetailsId: 0, complainById: 0 },
                    () => this.loadPropertyDetailsComplainLocationWise(value.Id))
            }
            else {
                this.setState({ istower: false, propertyNameList: [], propertyDetailsId: value.Id },
                    () => this.loadComplainbyAccordingPropertyDT(value.Id))
            }
            this.setState({ complainLocation: value });
        }
        else {
            this.setState({ istower: false, complainLocation: null, propertyNameList: [], propertyDetailsId: 0, complainById: 0 })
        }
    }
    OnPropertyNameChange(value, event) {
        if (value !== null) {
            this.setState({ propertyName: value, propertyDetailsId: value.Id },
                () => this.loadComplainbyAccordingPropertyDT(value.Id));
        }
        else {
            this.setState({ propertyNameList: [], propertyDetailsId: 0, complainById: 0 });
        }
    }
    OnComplainCategoryChange(value, event) {
        if (value != null) {
            this.setState({ complainCategory: value });
            this.loadCategoryWiseAssignee("TAM", value.Id, this.props.PropertyId);
        }
        else {
            this.setState({ complainCategory: 0 });
            this.loadCategoryWiseAssignee("TAM", 0, this.props.PropertyId);
        }
    }
    OnComplainAssigneeChange(value, event) {
        this.setState({ assignee: value });
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

    onCancel = () => {
        this.props.handleCancel();
        this.setState({
            complainLocation: null, complainLocationList: [],
            propertyDetailsId: 0, propertyName: null, propertyNameList: [],
            complainCategory: null,
            assignee: null, assigneeList: [],
            priorityId: 0,
            complainById: 0, complainByList: [],
            complainVisibilityId: 0, complainVisibilityList: [],
            Title: '', Description: '',
            selectedFileName: [],
            istower: false,
            showImagefilename: '',
            showImagefile: '',
            showImagefiletype: '',
            extension: '',
        })
    }

    manageTickets = (model, type) => {
        this.ApiProviderr.manageTickets(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'C':
                                if (rData >= 1) {
                                    appCommon.showtextalert("Ticket Generated Successfully!", "", "success");
                                    this.onCancel();
                                }
                                else
                                    appCommon.showtextalert("Ticket Generation Failed !", "", "error");
                                break;
                            default:
                        }
                    });
                }
            });
    }

    getModel = (type) => {
        var model = [];
        switch (type) {
            case 'C':
                model.push({
                    "PropertyId": this.props.PropertyId ? parseInt(this.props.PropertyId) : 0,
                    "TicketType": this.state.tickettype,
                    "PropertyDetails": this.state.propertyDetailsId ? parseInt(this.state.propertyDetailsId) : 0,
                    "Category": this.state.complainCategory ? parseInt(this.state.complainCategory.Id) : 0,
                    "Assignee": this.state.assignee ? parseInt(this.state.assignee.Id) : 0,
                    "Priority": parseInt(this.state.priorityId),
                    "ComplainBy": this.state.complainById ? parseInt(this.state.complainById) : 0,
                    "ComplainVisibility": this.state.complainVisibilityId,
                    "Titile": this.state.Title,
                    "Description": this.state.Description,
                    "Attachments": this.state.selectedFileName,
                    "Channel": 'Website',
                });
                break;
            default:
        };
        return model;
    }

    getPropertyManager = (PropertyId) => {
        this.ApiProviderr.GetPropertyManager(PropertyId).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        this.setState({ propertyManger: rData })
                    });
                }
            })
    }

    handleSave = () => {
        if (ValidateControls()) {
            if (this.state.propertyManger != null) {
                if (this.state.propertyManger.length > 0) {
                    const { complainLocation, complainCategory, assignee, propertyDetailsId } = this.state;
                    if (this.state.tickettype === "Property") {
                        if (complainLocation !== null && complainCategory !== null && assignee !== null && propertyDetailsId != 0) {
                            let type = 'C';
                            var model = this.getModel(type);
                            // console.log(model);
                            this.manageTickets(model, type);
                        }
                        else {
                            appCommon.showtextalert("Please Resolve validation error before submit", "", "error");
                        }
                    }
                    else if (this.state.tickettype === "Personal") {
                        if (complainCategory !== null) {
                            let type = 'C';
                            var model = this.getModel(type);
                            // console.log(model);
                            this.manageTickets(model, type);
                        }
                        else {
                            appCommon.showtextalert("Please Resolve validation error before submit", "", "error");
                        }
                    }
                }
                else {
                    appCommon.showtextalert("Please assigned property manager", "", "error");
                }
            }
            else {
                appCommon.showtextalert("Please assigned property manager", "", "error");
            }
        }
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

    render() {
        return (
            <div className="col-md-12">
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
                <div className="modal-content">
                    <div className="modal-body">
                        <div className="row">
                            {
                                this.state.tickettype === "Property" ?
                                    <div className="col-sm-4">
                                        <div className="form-group">
                                            <label htmlFor="ddlEscalationMatrixPriority">Location</label>
                                            <MultiSelectInline
                                                ID="ddlComplainLocation"
                                                onclose={true}
                                                isMulti={false}
                                                value={this.state.complainLocation}
                                                onChange={this.OnComplainLocationChange.bind(this)}
                                                options={this.state.complainLocationList}
                                            />
                                        </div>
                                    </div>
                                    : null
                            }
                            {
                                this.state.istower && this.state.tickettype === "Property" ?
                                    <div className="col-sm-4">
                                        <div className="form-group">
                                            <label htmlFor="ddlEscalationMatrixPriority"> Property Name</label>
                                            <MultiSelectInline
                                                ID="ddlPropertyName"
                                                onclose={true}
                                                isMulti={false}
                                                value={this.state.propertyName}
                                                onChange={this.OnPropertyNameChange.bind(this)}
                                                options={this.state.propertyNameList}
                                            />
                                        </div>
                                    </div>
                                    : null
                            }

                            <div className="col-sm-4">
                                <div className="form-group">
                                    <label htmlFor="ddlEscalationMatrixPriority">Category</label>
                                    <MultiSelectInline
                                        ID="ddlComplainCategory"
                                        onclose={true}
                                        isMulti={false}
                                        value={this.state.complainCategory}
                                        onChange={this.OnComplainCategoryChange.bind(this)}
                                        options={this.props.CategoryDataCreateAndEditTicket}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-4">
                                <div className="form-group">
                                    <label htmlFor="ddlEscalationMatrixCategory">Priority</label>
                                    <SelectBox
                                        ID="ddlPriority"
                                        Value={this.state.priorityId}
                                        onSelected={this.onSelected.bind(this, "Priority")}
                                        Options={this.props.priorityList}
                                        ClassName="form-control "
                                    />
                                </div>
                            </div>
                            {
                                this.state.tickettype === "Property" ?
                                    <div className="col-sm-4">
                                        <div className="form-group">
                                            <label htmlFor="ddlEscalationMatrixPriority">Staff</label>
                                            <MultiSelectInline
                                                ID="ddlAssignee"
                                                onclose={true}
                                                isMulti={false}
                                                value={this.state.assignee}
                                                onChange={this.OnComplainAssigneeChange.bind(this)}
                                                options={this.state.assigneeList}
                                            />
                                        </div>
                                    </div>
                                    : null
                            }

                            {
                                this.state.tickettype === "Property" ?
                                    <div className="col-sm-4">
                                        <div className="form-group">
                                            <label htmlFor="ddlEscalationMatrixCategory">Reporter</label>
                                            <SelectBox
                                                ID="ddlComplainBy"
                                                Value={this.state.complainById}
                                                onSelected={this.onSelected.bind(this, "ComplainBy")}
                                                Options={this.state.complainByList}
                                                ClassName="form-control "
                                            />
                                        </div>
                                    </div>
                                    : null
                            }

                            <div className="col-sm-4">
                                <div className="form-group">
                                    <label htmlFor="ddlEscalationMatrixCategory">Visibility</label>
                                    <SelectBox
                                        ID="ddlComplainVisibility"
                                        Value={this.state.complainVisibilityId}
                                        onSelected={this.onSelected.bind(this, "ComplaoinVisibiltiy")}
                                        Options={this.state.complainVisibilityList}
                                        ClassName="form-control "
                                    />
                                </div>
                            </div>
                            <div className="col-sm-12">
                                <div className="form-group">
                                    <label htmlFor="lblName">Title </label>
                                    <InputBox Id="txttitle"
                                        Value={this.state.Title}
                                        onChange={this.updateData.bind(this, "Title")}
                                        PlaceHolder="Max 32 Characters Are Allowed"
                                        className="form-control form-control-sm"
                                    />
                                </div>
                            </div>
                            <div className="col-sm-12">
                                <div className="form-group">
                                    <label htmlFor="lblContact">Description</label>
                                    <br></br>
                                    <textarea
                                        onChange={(e) => this.setState({ Description: e.target.value },
                                            // () =>
                                            //     console.log(this.state.Description.replace(/\n/g, " "))
                                        )}
                                        value={this.state.Description}
                                        placeholder="Enter Description"
                                        className="form-control form-control-sm"
                                        rows="3"
                                    />
                                </div>
                            </div>
                            <div className="col-sm-12">
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
                            </div>
                            <div className="col-sm-12">
                                <label htmlFor="ddlEscalationMatrixCategory">Attachments</label>
                                <FileUpload
                                    id="ticketFiles"
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
                            Id="btnCancel"
                            Text="Cancel"
                            Action={this.onCancel.bind(this)}
                            ClassName="btn btn-secondary" />
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

export default connect(mapStoreToprops, mapDispatchToProps)(CreateTicket);
