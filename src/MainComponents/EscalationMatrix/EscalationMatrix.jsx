import React, { Component, Fragment } from 'react';

import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from './DataProvider';
import { ToastContainer, toast } from 'react-toastify';
import * as appCommon from '../../Common/AppCommon.js';
import swal from 'sweetalert';
import { CreateValidator, ValidateControls } from './Validation';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import UrlProvider from "../../Common/ApiUrlProvider.js";
import { Typeahead } from 'react-bootstrap-typeahead';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';
import MultiSelectInline from '../../ReactComponents/MultiSelectInline/MultiSelectInline.jsx';
import { connect } from 'react-redux';
import departmentAction from '../../redux/department/action';
import { promiseWrapper } from '../../utility/common';
import { bindActionCreators } from 'redux';

const $ = window.$;
class EscalationMatrix extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            //grid
            gridHeader: [
                { sTitle: 'Id', titleValue: 'escalationMatrixId', "orderable": false, },//"visible": true 
                { sTitle: 'CategroyId', titleValue: 'ticketTypeId', bVisible: false },
                { sTitle: 'Categroy', titleValue: 'category', },
                { sTitle: 'Priority', titleValue: 'priorityId', bVisible: false },
                { sTitle: 'PriorityId', titleValue: 'priority', },
                { sTitle: 'Group Name', titleValue: 'groupName', },
                { sTitle: 'Escalation Type', titleValue: 'escalationType', },
                { sTitle: 'Duration', titleValue: 'duration', },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],
            gridData: [],
            grdTotalRows: 0,
            grdTotalPages: 0,
            FilterCategoryName: [{ "Value": "Category Name", "Name": " Category Name" }],
            escalationMatrixData: [], searchValue: null, FilterName: "category",
            PageNumber: 1,
            EscalationMatrixId: 0,

            setCategory: 0,
            Categorylist: [],

            setPriority: 0,
            Prioritylist: [],

            Typelist: [
                { "Id": "0", "Name": "Select Type" },
                { "Id": "Minutes", "Name": "Minutes" },
                { "Id": "Hours", "Name": "Hours" },
                { "Id": "Days", "Name": "Days" }
            ],
            EscalationMatrixGroupList: [],

            EscalationMatrixAssignment: [{
                excalationMatrixAssignmentId: 0,
                escalationMatrixGroupId: 0,
                escalationTypeId: 1,
                escalationValue: null,
                escalationParamter: '',
            },
            {
                excalationMatrixAssignmentId: 0,
                escalationMatrixGroupId: 0,
                escalationTypeId: 2,
                escalationValue: null,
                escalationParamter: '',
            }],

        };
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }


    loadEscalationMatrix = () => {
        this.loadEmergencyTypeAhead("NULL", this.props.PropertyId);
        this.getEscalationMatrix("NULL", this.props.PropertyId);
        this.getCategoryList(this.props.PropertyId);
        this.getProrityList(this.props.PropertyId);
        this.getEscalationMatrixGroupList(this.props.PropertyId);
    }

    componentDidMount() {
        this.loadEscalationMatrix();
    }

    getEscalationMatrix(value, id) {
        var type = 'R';
        var model = this.getModel(type, value, id);
        console.log(model);
        this.manageEscalationMatrix(model, type);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.loadEscalationMatrix();
        }
    }
    loadEmergencyTypeAhead = (searchtext, id) => {
        var type = 'T';
        var model = this.getModel(type, searchtext, id);
        this.manageEscalationMatrix(model, type);
    }

    ClearTyeahead = (type, event) => {
        if (type == 'C') {
            var option = this.theEmergency.props.options;
            if (!option.includes(event.target.value)) {
            }
        }
    }

    onUserSearch = (SearchText) => {
        if (SearchText.length > 0) {
            this.setState({ searchValue: SearchText[0].category }, () => {
                this.loadEmergencyTypeAhead(SearchText[0].category, this.props.PropertyId);
                this.getEscalationMatrix(SearchText[0].category, this.props.PropertyId);
            });
        }
        else {
            this.setState({ searchValue: null }, () => {
                this.loadEmergencyTypeAhead("Null", this.props.PropertyId);
                this.getEscalationMatrix("NULL", this.props.PropertyId);
            });
        }
    }
    onEmergencyList = (arg) => {
        let searchVal;
        if (arg == '' || arg == null) {
            this.setState({ searchValue: null }, () => {
                this.getEscalationMatrix("NULL", this.props.PropertyId);
                this.loadEmergencyTypeAhead("Null", this.props.PropertyId);
            });
        }
        else {
            this.setState({ searchValue: arg.trim() }, () => {
                this.getEscalationMatrix(arg.trim(), this.props.PropertyId);
                this.loadEmergencyTypeAhead(arg.trim(), this.props.PropertyId);
            });
        }

    }

    manageEscalationMatrix = (model, type) => {
        this.ApiProviderr.manageEscalationMatrix(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'C':
                                if (rData == 1) {
                                    appCommon.showtextalert("Escaltion Matrix Saved Successfully!", "", "success");
                                    this.handleCancel();
                                }
                                else if (rData == 0)
                                    appCommon.showtextalert("Escaltion Matrix Already Existed !", "", "error");
                                break;
                            case 'U':
                                if (rData == 1) {
                                    appCommon.showtextalert("Escaltion Matrix Updated Successfully!", "", "success");
                                    this.handleCancel();
                                }
                                else if (rData == 0)
                                    appCommon.showtextalert("Escaltion Matrix Already Existed !", "", "error");
                                break;
                            case 'D':
                                if (rData == 1)
                                    appCommon.showtextalert("Escaltion Matrix Deleted Successfully!", "", "success");
                                else
                                    appCommon.showtextalert("Something Went wrong Try Again !", "", "error");

                                this.handleCancel();
                                break;
                            case 'R':
                                this.setState({ grdTotalPages: rData.totalPages });
                                this.setState({ grdTotalRows: rData.totalRows });
                                this.setState({ gridData: rData.escalationMatrix });
                                break;
                            case 'T':
                                this.setState({ escalationMatrixData: rData.escalationMatrix });
                                break;
                            case 'S':
                                this.setState({ EscalationMatrixAssignment: rData });
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
        });
    }

    getModel = (type, value, PropertyId) => {
        var model = [];
        switch (type) {
            case 'R':
                model.push({
                    "SearchValue": value == null ? "NULL" : value,
                    "PageSize": 10,
                    "PageNumber": this.state.PageNumber,
                    "StatementType": type,
                    "PropertyId": parseInt(PropertyId),
                });
                break;
            case 'C':
                model.push({
                    "statementType": type,
                    "ticketTypeId": parseInt(this.state.setCategory),
                    "priorityId": parseInt(this.state.setPriority),
                    "escalationMatrixAssignments": this.state.EscalationMatrixAssignment,
                    "escalationMatrixId": 0,
                    "PropertyId": parseInt(PropertyId),
                });
                break;
            case 'U':
                model.push({
                    "statementType": type,
                    "ticketTypeId": parseInt(this.state.setCategory),
                    "priorityId": parseInt(this.state.setPriority),
                    "escalationMatrixAssignments": this.state.EscalationMatrixAssignment,
                    "escalationMatrixId": this.state.EscalationMatrixId,
                    "PropertyId": parseInt(PropertyId),
                });
                break;
            case 'D':
                model.push({
                    "EscalationMatrixId": this.state.EscalationMatrixId
                });
                break;
            case 'T':
                model.push({
                    "SearchValue": value == null ? "NULL" : value,
                    "PageSize": 10,
                    "PageNumber": this.state.PageNumber,
                    "StatementType": type,
                    "PropertyId": parseInt(PropertyId),
                });
                break;
            case 'S':
                model.push({
                    "EscalationMatrixId": this.state.EscalationMatrixId,
                    "StatementType": type,
                });
                break;
            default:
        };
        return model;
    }

    findItem(id) {
        return this.state.gridData.find((item) => {
            if (item.escalationMatrixId == id) {
                return item;
            }
        });
    }
    onPagechange = (page) => {
        //  
        this.setState({ PageNumber: page }, () => {
            this.loadEscalationMatrix();
            console.log(this.state.PageNumber);
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
                        this.setState({ EscalationMatrixId: Id }, () => {
                            var model = this.getModel('D');
                            this.manageEscalationMatrix(model, 'D');
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

    async ongridedit(Id) {
        this.setState({ PageMode: 'Edit' }, () => {
            CreateValidator();
        });
        var rowData = this.findItem(Id);

        this.setState({
            setCategory: rowData.ticketTypeId, setPriority: rowData.priorityId,
            EscalationMatrixId: rowData.escalationMatrixId
        })
        let type = 'S';
        var model = this.getModel(type, "NULL", this.props.PropertyId);
        this.manageEscalationMatrix(model, type);
    }

    handleSave = () => {
        if (ValidateControls()) {
            let type = '';
            if (this.state.PageMode == "Add") {
                type = 'C';
            }
            if (this.state.PageMode == "Edit") {
                type = 'U';
            }

            var model = this.getModel(type, "NULL", this.props.PropertyId);
            this.manageEscalationMatrix(model, type);
        }
    }

    handleCancel = () => {
        this.setState({
            PageMode: 'Home', setCategory: null, setPriority: null, EscalationMatrixAssignment:
                [{
                    excalationMatrixAssignmentId: 0,
                    esclationMatrixGroupId: 0,
                    escalationTypeId: 1,
                    escalationValue: null,
                    escalationParamter: '',
                },
                {
                    excalationMatrixAssignmentId: 0,
                    esclationMatrixGroupId: 0,
                    escalationTypeId: 2,
                    escalationValue: null,
                    escalationParamter: '',
                }], EscalationMatrixId: 0
        }, () => this.loadEscalationMatrix());
    };

    onSelected(name, value) {
        switch (name) {
            case "FilterCategoryName":
                this.setState({ FilterCategoryName: value });
                break;
            case "Categroy":
                this.setState({ setCategory: value });
                break;
            case "Priority":
                this.setState({ setPriority: value });
                break;
            default:
        }
    }

    handleEscalationMatrixAssignment = (e, index) => {

        const { name, value } = e.target;
        const list = [...this.state.EscalationMatrixAssignment];

        if (name === "escalationParamter") {
            list[index][name] = value;
        }
        else {
            if (name === "escalationMatrixGroupId") {

                // check escalation matrix group is already assined or not
                let isEscalationAssignedGroupid = list.some(i => i.escalationMatrixGroupId === parseInt(e.target.value));

                if (!isEscalationAssignedGroupid) {
                    list[index][name] = parseInt(value);
                }
                else {
                    list[index][name] = 0;
                    if (parseInt(e.target.value) !== 0) {
                        appCommon.showtextalert("Escaltion Matrix Group Already Assigned !", "", "error");
                    }
                }
            }
            else
                list[index][name] = parseInt(value);
        }
        this.setState({ EscalationMatrixAssignment: list })
    }

    getCategoryList(id) {
        // 
        this.ApiProviderr.getDropdownData('C', parseInt(id)).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let Data = [{ Id: 0, Name: "Select Category" }];

                        rData.forEach(element => {
                            Data.push({ Id: element.id, Name: element.text });
                        });
                        this.setState({ Categorylist: Data });
                    });
                }
            });
    }
    getProrityList(id) {
        // 
        this.ApiProviderr.getDropdownData('P', parseInt(id)).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let Data = [{ Id: 0, Name: "Select Priority" }];
                        rData.forEach(element => {
                            Data.push({ Id: element.id, Name: element.text });
                        });
                        this.setState({ Prioritylist: Data });
                    });
                }
            });
    }
    getEscalationMatrixGroupList(id) {
        // 
        this.ApiProviderr.getDropdownData('EG', parseInt(id)).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        let Data = [{ Id: 0, Name: "Select Group" }];
                        rData.forEach(element => {
                            Data.push({ Id: element.id, Name: element.text });
                        });
                        this.setState({ EscalationMatrixGroupList: Data });
                    });
                }
            });
    }
    // handle click event of the Remove button
    handleEscalationMatrixAssignmentRemoveClick = index => {
        const list = [...this.state.EscalationMatrixAssignment];
        list.splice(index, 1);
        this.setState({ EscalationMatrixAssignment: list }, () => CreateValidator());
    };

    // handle click event of the Add button
    handleEscalationMatrixAssignmentAddClick = () => {
        
        const list = [...this.state.EscalationMatrixAssignment];
        let cnt = list.length;
        const NewItem = {
            excalationMatrixAssignmentId: 0,
            escalationMatrixGroupId: 0,
            escalationTypeId: cnt + 1,
            escalationValue: null,
            escalationParamter: '',
        }
        list.push(NewItem)
        this.setState({ EscalationMatrixAssignment: list }, () => CreateValidator());
    };


    render() {
        let escalationTypelbl = '';
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
                                                    <SelectBox
                                                        ID="ddlFilterGroupName"
                                                        Value={this.state.FilterCategoryName}
                                                        onSelected={this.onSelected.bind(this, "FilterCategoryName")}
                                                        Options={this.state.FilterCategoryName}
                                                        ClassName="form-control form-control-sm" />
                                                </div>
                                            </div>
                                        </li>
                                        <li className="nav-item">
                                            <div className="input-group input-group-sm">
                                                <div className="input-group-prepend">
                                                </div>
                                                <Typeahead
                                                    id="typeGridFilter"
                                                    ref={(typeahead) =>
                                                        this.theEmergency = typeahead}
                                                    labelKey={this.state.FilterName}
                                                    onChange={this.onUserSearch}
                                                    onInputChange={this.onEmergencyList}
                                                    options={this.state.escalationMatrixData}
                                                    placeholder='Category Name'
                                                    ClassName="form-control form-control-sm"
                                                    onBlur={this.ClearTyeahead.bind(this, 'C')}
                                                />
                                            </div>
                                        </li>
                                        <li className="nav-item">
                                            <div className="input-group input-group-sm">
                                                <div className="input-group-prepend">
                                                    <Button id="btnNewComplain"
                                                        Action={this.addNew.bind(this)}
                                                        ClassName="btn btn-success btn-sm"
                                                        Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                                        Text=" Add" />
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div className="card-body pt-2">
                                    <DataGrid
                                        Id="grdEscalationMatrix"
                                        IsPagination={true}
                                        ColumnCollection={this.state.gridHeader}
                                        totalpages={this.state.grdTotalPages}
                                        totalrows={this.state.grdTotalRows}
                                        Onpageindexchanged={this.onPagechange.bind(this)}
                                        onEditMethod={this.ongridedit.bind(this)}
                                        onGridDeleteMethod={this.onGridDelete.bind(this)}
                                        DefaultPagination={false}
                                        GridData={this.state.gridData} />
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
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label for="ddlEscalationMatrixCategory">Categroy</label>
                                                <SelectBox
                                                    ID="ddlEscalationMatrixCategory"
                                                    Value={this.state.setCategory}
                                                    onSelected={this.onSelected.bind(this, "Categroy")}
                                                    Options={this.state.Categorylist}
                                                    ClassName="form-control "
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label for="ddlEscalationMatrixPriority">Priority</label>
                                                <SelectBox
                                                    ID="ddlEscalationMatrixPriority"
                                                    Value={this.state.setPriority}
                                                    onSelected={this.onSelected.bind(this, "Priority")}
                                                    Options={this.state.Prioritylist}
                                                    ClassName="form-control"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        this.state.EscalationMatrixAssignment.map((x, i) => {
                                            let cnt = i + 1;
                                            switch (cnt) {
                                                case 1:
                                                    escalationTypelbl = cnt === 1 ? 'Default Assignment' : ''
                                                    break;
                                                case 2:
                                                    escalationTypelbl = cnt === 2 ? 'First Escalation' : ''
                                                    break;
                                                case 3:
                                                    escalationTypelbl = cnt === 3 ? 'Second Escalation' : ''
                                                    break;
                                                case 4:
                                                    escalationTypelbl = cnt === 4 ? 'Third Escalation' : ''
                                                    break;
                                                default:
                                                    break;
                                            }
                                            return (
                                                <Fragment>
                                                    <h4 className="text-dark">{escalationTypelbl}</h4>
                                                    <div className="row">
                                                        <div className="col-sm-3">
                                                            <div className="form-group">
                                                                <label for={"txtTime" + cnt}>Time</label>
                                                                <input
                                                                    name="escalationValue"
                                                                    id={"txtTime" + cnt}
                                                                    type="number"
                                                                    value={x.escalationValue}
                                                                    onChange={e => this.handleEscalationMatrixAssignment(e, i)}
                                                                    placeholderolder="Enter Time"
                                                                    className="form-control"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-3">
                                                            <div className="form-group">
                                                                <label for={"ddlType" + cnt}>Type</label>
                                                                <select
                                                                    name="escalationParamter"
                                                                    id={"ddlType" + cnt}
                                                                    value={x.escalationParamter}
                                                                    onChange={e => this.handleEscalationMatrixAssignment(e, i)}
                                                                    className="form-control"
                                                                >
                                                                    {this.state.Typelist.map(option => {
                                                                        return <option
                                                                            value={option.Id}
                                                                            key={option.Name}
                                                                            className="sel-opt"
                                                                        >{option.Name}</option>
                                                                    })}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-3">
                                                            <div className="form-group">
                                                                <label for={"escalationMatrixGroupId" + cnt}>Escalation Group</label>
                                                                <select
                                                                    name="escalationMatrixGroupId"
                                                                    id={"escalationMatrixGroupId" + cnt}
                                                                    value={x.escalationMatrixGroupId}
                                                                    onChange={e => this.handleEscalationMatrixAssignment(e, i)}
                                                                    className="form-control"
                                                                >
                                                                    {this.state.EscalationMatrixGroupList.map(option => {
                                                                        return <option
                                                                            value={option.Id}
                                                                            key={option.Name}
                                                                            className="sel-opt"
                                                                        >{option.Name}</option>
                                                                    })}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-3">
                                                            <br></br>
                                                            <div className="form-group">
                                                                {cnt != 1 && cnt != 2 ?
                                                                    <Button
                                                                        Id="btnRemove"
                                                                        Icon={<i className="fa fa-minus" aria-hidden="true"></i>}
                                                                        Text=""
                                                                        Title="Remove"
                                                                        Action={e => this.handleEscalationMatrixAssignmentRemoveClick(i)}
                                                                        ClassName="btn btn-danger" /> : ''
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Fragment>
                                            )
                                        })
                                    }

                                </div>
                                <div className="modal-footer">
                                    {this.state.EscalationMatrixAssignment.length < 4 ?
                                        <Button
                                            Id="btnAddMore"
                                            Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                            Text="Add More"
                                            Action={this.handleEscalationMatrixAssignmentAddClick}
                                            ClassName="btn btn-success" /> : ''

                                    }
                                    <Button
                                        Id="btnSave"
                                        Text="Save"
                                        Action={this.handleSave}
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
    return {
        PropertyId: state.Commonreducer.puidn,
    }
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentAction, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(EscalationMatrix);
