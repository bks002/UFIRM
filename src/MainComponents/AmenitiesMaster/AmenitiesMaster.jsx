import React from 'react'
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from './DataProvider.js';
import { ToastContainer, toast } from 'react-toastify';
import * as appCommon from '../../Common/AppCommon.js';
import swal from 'sweetalert';
import { CreateValidator, ValidateControls } from './Validation.js';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import UrlProvider from "../../Common/ApiUrlProvider.js";


import { connect } from 'react-redux';
import departmentAction from '../../redux/department/action';
import { promiseWrapper } from '../../utility/common';
import { bindActionCreators } from 'redux';

const $ = window.$;

class AmenitiesMaster extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            PropertyId: 0, AmenityId: 0,
            gridHeader: [
                { sTitle: 'Id', titleValue: 'amenityId', "orderable": false, },//"visible": true 
                { sTitle: 'Name', titleValue: 'amenityName', },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],
            gridData: [],
            grdTotalRows: 0,
            grdTotalPages: 0,
            amenitiesData: [],
            searchValue: null,
            
        };
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    componentDidMount() {
        //this.loadAmenitiesTypeAhead(null);
        this.getAmenities("NULL");
    }

    getAmenities(value) {
        var type = 'R';
        var model = this.getModel(type, value);
        this.manageAmenities(model, type);
    }

    manageAmenities = (model, type) => {
        this.ApiProviderr.manageAmenities(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'U':
                                if (rData <= 0) {
                                    appCommon.ShownotifyError("Amenity Name is already exist");
                                }
                                else {
                                    appCommon.showtextalert("Amenity Saved Successfully!", "", "success");
                                    this.handleCancel();
                                }  
                                break;
                            case 'D':
                                appCommon.showtextalert("Amenity Deleted Successfully!", "", "success");
                                this.handleCancel();
                                break;
                            case 'R':
                                this.setState({ gridData: rData });
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
        this.setState({ AmenityId: 0 });
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
                        var model = [{ "amenityId": parseInt(Id) }];
                        this.manageAmenities(model, 'D');
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
        this.setState({ AmenityId: rowData.amenityId });
        this.setState({ AmenityName: rowData.amenityName });
    }

    findItem(id) {
        return this.state.gridData.find((item) => {
            if (item.amenityId == id) {
                return item;
            }
        });
    }

    getModel = (type, value) => {
        var model = [];
        switch (type) {
            case 'R':
                model.push({
                    "SearchValue": value == null ? "NULL" : value,
                });
                break;
            case 'U':
                model.push({
                    "AmenityId": this.state.AmenityId,
                    "AmenityName": this.state.AmenityName
                });
                break;
            case 'C':
                this.setState({ AmenityName: '', AmenityId:0 });
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
            this.manageAmenities(model, type);
        }
    }

    handleCancel = () => {
        var type = 'C';
        this.getModel(type);
        this.getAmenities();
        this.setState({ PageMode: 'Home' });
    };

    updateData = (name, value) => {
        switch (name) {
            case "AmenityName":
                this.setState({ AmenityName: value });
                break;
            default:
        }
    }

    ClearTyeahead = (type, event) => {
        if (type == 'C') {
            var option = this.theAmenity.props.options;
            if (!option.includes(event.target.value)) {
            }
        }
    }
    onPagechange = (page) => {  }

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
                                                        Text=" Add Amenity" />
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div className="card-body pt-2">
                                    <DataGrid
                                        Id="grdAmenity"
                                        //IsPagination={true}
                                        ColumnCollection={this.state.gridHeader}
                                        // totalpages={this.state.grdTotalPages}
                                        // totalrows={this.state.grdTotalRows}
                                        Onpageindexchanged={this.onPagechange.bind(this)}
                                        onEditMethod={this.ongridedit.bind(this)}
                                        onGridDeleteMethod={this.onGridDelete.bind(this)}
                                        DefaultPagination={true}
                                        IsSarching="true"
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
                                                <label for="lblName">Amenity Name</label>
                                                <InputBox Id="txtName"
                                                    Value={this.state.AmenityName}
                                                    onChange={this.updateData.bind(this, "AmenityName")}
                                                    PlaceHolder="Max 32 Characters Are Allowed"
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
    return {}
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentAction, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(AmenitiesMaster);