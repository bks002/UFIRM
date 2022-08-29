import React from 'react'
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from '../EmergencyContact/DataProvider.js';
import { ToastContainer, toast } from 'react-toastify';
import * as appCommon from '../../Common/AppCommon.js';
import swal from 'sweetalert';
import { CreateValidator, ValidateControls } from '../EmergencyContact/Validation.js';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import UrlProvider from "../../Common/ApiUrlProvider.js";
import { Typeahead } from 'react-bootstrap-typeahead';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';
import './EmergencyContact.css';

import { connect } from 'react-redux';
import departmentAction from '../../redux/department/action';
import { promiseWrapper } from '../../utility/common';
import { bindActionCreators } from 'redux';

const $ = window.$;

class EmergencyContact extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            PropertyId: 0, 
            EmergencyContactId: 0,
            
            //grid
            gridHeader: [
                { sTitle: 'Id', titleValue: 'emergencyContactId', "orderable": false, },//"visible": true 
                { sTitle: 'Name', titleValue: 'name', },
                { sTitle: 'Phone', titleValue: 'phone', },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],
            gridData: [],
            grdTotalRows: 0,
            grdTotalPages: 0,
            
            //typeahead
            FilterEmergencyName: [{ "Value": "Emergency Name", "Name": "Emergency Name" }],
            emergencyData: [], searchValue: null,filterName: "name"
        };
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }
    
    loadEmergencycontact=()=>{
        this.loadEmergencyTypeAhead(this.props.PropertyId, null);
        this.getEmergencyContact(this.props.PropertyId, "NULL");
    }

    componentDidMount() {
        this.loadEmergencycontact();
    }

    getEmergencyContact(id, value) {
        var type = 'R';
        var model = this.getModel(type, id, value);
        this.manageEmergencyContact(model, type);
    }

    manageEmergencyContact = (model, type) => {
        this.ApiProviderr.manageEmergencyContact(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'U':
                                appCommon.showtextalert("Emergency Contact Saved Successfully!", "", "success");
                                this.handleCancel();
                                break;
                            case 'D':
                                appCommon.showtextalert("Emergency Contact Deleted Successfully!", "", "success");
                                this.handleCancel();
                                break;
                            case 'R':
                                this.setState({ grdTotalPages: rData.totalPages });
                                this.setState({ grdTotalRows: rData.totalRows });
                                this.setState({ gridData: rData.emergencyContactModel });
                                break;
                            case 'T':
                                this.setState({ emergencyData: rData.emergencyContactModel });
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
        this.getModel('C');
        this.setState({ EmergencyContactId: 0 });
        let propertyId = 4;
        this.setState({ PropertyId: propertyId });

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
                        var model = [{ "emergencyContactId": parseInt(Id) }];
                        this.manageEmergencyContact(model, 'D');
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
        this.setState({ EmergencyContactId: rowData.emergencyContactId });
        this.setState({ Name: rowData.name });
        this.setState({ Contact: rowData.phone });
    }

    findItem(id) {
        return this.state.gridData.find((item) => {
            if (item.emergencyContactId == id) {
                return item;
            }
        });
    }

    getModel = (type, id, value) => {
        var model = [];
        switch (type) {
            case 'R':
                model.push({
                    "SearchValue": value == null ? "NULL" : value,
                    "PropertyId": parseInt(id),
                    "PageSize": 10,
                    "PageNumber": 1
                });
                break;
            case 'U':
                model.push({
                    "EmergencyContactId": this.state.EmergencyContactId,
                    "Name": this.state.Name,
                    "Phone": this.state.Contact,
                    "PropertyId": parseInt(this.props.PropertyId)
                });
                break;
            case 'C':
                this.setState({ Name: '', Contact: '', EmergencyContactId:0 });
                break;
            case 'T':
                model.push({
                    "SearchValue": value == null ? "NULL" : value,
                    "PropertyId": parseInt(id),
                    "PageSize": 10,
                    "PageNumber": 1
                });
                break;
            default:
        };
        return model;
    }

    handleSave = () => {
        let url = new UrlProvider().MainUrl;
        if (ValidateControls()) {
            var type = 'U';
            var model = this.getModel(type);
            this.manageEmergencyContact(model, type);
        }
    }

    handleCancel = () => {
        var type = 'C';
        this.getModel(type);
        this.getEmergencyContact(this.props.PropertyId);
        this.setState({ PageMode: 'Home' });
    };

    updateData = (name, value) => {
        switch (name) {
            case "Name":
                this.setState({ Name: value });
                break;
            case "Contact":
                this.setState({ Contact: value });
                break;
            default:
        }
    }

    ClearTyeahead = (type, event) => {
        if (type == 'C') {
            var option = this.theEmergency.props.options;
            if (!option.includes(event.target.value)) {
            }
        }
    }

    onSelected(name, value) {
        switch (name) {
            case "FilterEmergencyName":
                this.setState({ FilterEmergencyNameValue: value });
                break;
            default:
        }
    }

    loadEmergencyTypeAhead = (id, searchtext) => {
        //
        var type = 'T';
        var model = this.getModel(type, id, searchtext);
        this.manageEmergencyContact(model, type);
    }

    onUserSearch = (SearchText) => {
        //
        if (SearchText.length > 0) {
            this.setState({ searchValue: SearchText[0].name }, () => {
                this.loadEmergencyTypeAhead(this.props.PropertyId, SearchText[0].name);
                this.getEmergencyContact(this.props.PropertyId, SearchText[0].name);
            });
        }
        else {
            this.setState({ searchValue: null }, () => {
                this.loadEmergencyTypeAhead(this.props.PropertyId, "Null");
                this.getEmergencyContact(this.props.PropertyId, "NULL");
            });
        }
    }
    onEmergencyList = (arg) => {
        //
        let searchVal;
        if (arg == '' || arg == null) {
            this.setState({ searchValue: null }, () => {
                this.getEmergencyContact(this.props.PropertyId, "NULL");
                this.loadEmergencyTypeAhead(this.props.PropertyId, "Null");
            });
        }
        else {
            this.setState({ searchValue: arg.trim() }, () => {
                this.getEmergencyContact(this.props.PropertyId, arg.trim());
                this.loadEmergencyTypeAhead(this.props.PropertyId, arg.trim());
            });
        }

    }
    componentDidUpdate(prevProps) {
        
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.loadEmergencycontact();
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
                                                    <SelectBox
                                                        ID="ddlFilterEmergencyName"
                                                        Value={this.state.FilterEmergencyNameValue}
                                                        onSelected={this.onSelected.bind(this, "FilterEmergencyName")}
                                                        Options={this.state.FilterEmergencyName}
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
                                                    labelKey={this.state.filterName}
                                                    onChange={this.onUserSearch}
                                                    onInputChange={this.onEmergencyList}
                                                    options={this.state.emergencyData}
                                                    placeholder='Emergency Name'
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
                                                        Text=" Add Emergency Contact" />
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div className="card-body pt-2">
                                    <DataGrid
                                        Id="grdEmergencyContact"
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
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="lblName">Name</label>
                                                <InputBox Id="txtName"
                                                    Value={this.state.Name}
                                                    onChange={this.updateData.bind(this, "Name")}
                                                    PlaceHolder="Max 32 Characters Are Allowed"
                                                    className="form-control form-control-sm"
                                                />
                                            </div>
                                        </div>
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="lblContact">Contact</label>
                                                <InputBox Id="txtContact"
                                                    Value={this.state.Contact}
                                                    onChange={this.updateData.bind(this, "Contact")}
                                                    PlaceHolder="Enter a valid Contact Number"
                                                    className="form-control form-control-sm"
                                                />
                                            </div>
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
export default connect(mapStoreToprops, mapDispatchToProps)(EmergencyContact);