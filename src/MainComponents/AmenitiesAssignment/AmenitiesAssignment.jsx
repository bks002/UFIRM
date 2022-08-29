import React from 'react'
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from './DataProvider.js';
import { ToastContainer, toast } from 'react-toastify';
import * as appCommon from '../../Common/AppCommon.js';
import swal from 'sweetalert';
import { CreateValidator, ValidateControls } from './Validation.js';
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

class AmenitiesAssignment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            PropertyAmenitiesId: 0,
            PropertyId: '0', PropertyListData: [],
            AmenityId: '0', AmenityListData: [],
            pageSize: 10,
            pageNumber: 1,
            gridHeader: [
                { sTitle: 'Id', titleValue: 'propertyAmenitiesId', "orderable": false, "visible": true },
                { sTitle: 'Property Name', titleValue: 'propertyName', },
                { sTitle: 'Amenity Name', titleValue: 'amenitiesName', },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],
            GridData: [],
            
        };
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    componentDidMount(){
        this.getPropertyAmenities();
    }

    // componentDidMount() {
    //     documentBL.CreateValidator();
    //     this.setState({ PropertyId: this.props.PropertyId, pageNumber: 1 }, () => {
    //         this.getPropertyAmenities();
    //     });
    // }
    // componentDidUpdate(prevProps) {
    //     if (prevProps.PropertyId !== this.props.PropertyId) {
    //         this.setState({ PropertyId: this.props.PropertyId, pageNumber: 1 }, () => {
    //             this.getPropertyAmenities();
    //         });
    //     }
    // }

    getPropertyAmenities() {
        var type = 'R';
        var model = this.getModel(type);
        this.managePropertyAmenities(model, type);
    }

    managePropertyAmenities = (model, type) => {
        this.ApiProviderr.managePropertyAmenities(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'U':
                                appCommon.showtextalert("Amenity Assignment Saved Successfully!", "", "success");
                                this.handleCancel();
                                break;
                            case 'D':
                                appCommon.showtextalert("Amenity Assignment Deleted Successfully!", "", "success");
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
            this.setState({PropertyAmenitiesId: 0});
        });
        await this.loadProperty();
        await this.loadAmenity();
        
    }

    async loadProperty() {
        //
        await this.comdbprovider.getPropertyMaster(0).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
                        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
                        // this.setState({ PropertyListData: rData }, () => {
                        //     // if(this.state.PropertyId !=  0){
                        //     //     $('#ddlPropertyList').val(this.state.PropertyId);
                        //     // }
                        // });
                        this.setState({ PropertyListData: rData });
                    });
                }
            });
    }

    async loadAmenity() {
        //
        await this.comdbprovider.getAmenitiesMaster(0).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
                        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
                        this.setState({ AmenityListData: rData }, () => {

                        });
                    });
                }
            });
    }

    
    onPropertyChanged(value) {
        this.setState({ PropertyId: parseInt(value) });
    }

    onAmenityChanged(value) {
        this.setState({ AmenityId: parseInt(value) });
    }
    

    onPagechange = (page) => { 
        this.setState({ pageNumber: page }, () => {
            this.getPropertyAmenities();
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
                        var model = [{ "propertyAmenitiesId": parseInt(Id) }];
                        this.managePropertyAmenities(model, 'D');
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
        await this.loadAmenity();
        //Document Grid
        var rowData = this.findItem(Id);
        this.setState({PropertyAmenitiesId: rowData.propertyAmenitiesId});
        $('#ddlPropertyList').val(rowData.propertyId);
        $('#ddlAmenityList').val(rowData.aminitiesId);
    }



    findItem(id) {
        return this.state.GridData.find((item) => {
            if (item.propertyAmenitiesId == id) {
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
                    "PageSize": this.state.pageSize,
                    "PageNumber": this.state.pageNumber,
                    "Propertyid": 0 
                });
                break;
            case 'U':
                model.push({
                    "propertyId": parseInt($('#ddlPropertyList').val()),
                    "aminitiesId": parseInt($('#ddlAmenityList').val()),
                });
                break;
            case 'C':
                this.setState({ PropertyId: '0', PropertyListData: [{ "Id": "0", "Name": "Select Property" }] });
                this.setState({ AmenityId: '0', AmenityListData: [{ "Id": "0", "Name": "Select Amenity" }] });
                break;
            default:
        };
        return model;
    }

    handleSave = () => {
        let url = new UrlProvider().MainUrl;
        if (ValidateControls()) {
            const formData = new FormData();
            formData.append("propertyAmenitiesId", this.state.PropertyAmenitiesId);
            formData.append("propertyId", parseInt($('#ddlPropertyList').val()));
            formData.append("aminitiesId", parseInt($('#ddlAmenityList').val()));
            
            this.ApiProviderr.saveAmenity(formData)
                .then(res => {
                    if (res.data <= 0) {
                        appCommon.ShownotifyError("Amenity is already assigned");
                    }
                    else {
                        if (this.state.PageMode != "Edit") {
                            appCommon.showtextalert("Amenity Assign Created Successfully", "", "success");
                        }
                        else {
                            appCommon.showtextalert("Amenity Assign Updated Successfully", "", "success");
                        }
                        this.handleCancel();
                    }
                });    
        }
    }

    handleCancel = () => {
        var type = 'C';
        this.getModel(type);
        this.getPropertyAmenities();
        this.setState({ PageMode: 'Home' });
    };

    //End
    render() {
        // let _this = this;
        // let data = this.state.PropertyListData.find((item) => 
        // { 
        //     
        //     if(item.Value == _this.state.PropertyId)
        //     return item.Name
        // });
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
                                                        Text=" Amenity Assign" />
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div className="card-body pt-2">
                                    <DataGrid
                                        Id="grdAmentity"
                                        IsPagination={true}
                                        ColumnCollection={this.state.gridHeader}
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
                                                {/* {this.state.PropertyId == 0 && <DropDownList Id="ddlPropertyList"
                                                    onSelected={this.onPropertyChanged.bind(this)}
                                                    Options={this.state.PropertyListData} />
                                                }
                                                {this.state.PropertyId != 0 &&
                                                    <div>
                                                        {this.state.PropertyId}
                                                        {data}
                                                    </div>
                                                } */}
                                                <DropDownList Id="ddlPropertyList"
                                                    onSelected={this.onPropertyChanged.bind(this)}
                                                    Options={this.state.PropertyListData} />
                                            </div>
                                        </div>
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="ddlAmenityList">Amenity</label>
                                                <DropDownList Id="ddlAmenityList"
                                                    onSelected={this.onAmenityChanged.bind(this)}
                                                    Options={this.state.AmenityListData} />
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
    return {
        // PropertyId: state.Commonreducer.puidn,
    }
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentAction, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(AmenitiesAssignment);