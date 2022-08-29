import React from 'react'
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from './DataProvider.js';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import { ToastContainer, toast } from 'react-toastify';
import * as appCommon from '../../Common/AppCommon.js';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import swal from 'sweetalert';
import { CreateValidator, ValidateControls } from './Validation.js';
import DropDownList from '../../ReactComponents/SelectBox/DropdownList'
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';

import { connect } from 'react-redux';
import departmentAction from '../../redux/department/action';
import { bindActionCreators } from 'redux';

const $ = window.$;
class PropertyTower extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PropertyListData: [],
            PropertyTowersData: [],
            PropertyFloors: [],
            MeasureunitListData: [],
            PropertyDetailsTypeListData: [],
            GridData: [],
            gridHeader: [
                { sTitle: 'Id', titleValue: 'propertyDetailsId', "orderable": false },
                { sTitle: 'Property Name', titleValue: 'propertyName', },
                { sTitle: 'Tower name', titleValue: 'towername', },
                { sTitle: 'Floor', titleValue: 'floor', },
                { sTitle: 'Flat Name', titleValue: 'flat', },
                // { sTitle: 'Flat Number', titleValue: 'FlatDetailNumber',  },
                { sTitle: 'Ext.', titleValue: 'contactNumber', },
                { sTitle: 'Status', titleValue: 'propertyStatus', },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],

            PageMode: 'Home',
            PropertyTowerId: 0,
            PropertyId: 0,
            PropertyDetailsId: 0,
            Floor: 0,
            FlatName: '',
            ContactNumber: 0,
            FlatTypeId: 0,
            MeasureunitId: 0,
            TotalArea: 0.0,
            BuitupArea: 0.0,
            CarpetArea: 0.0,
            SuperBuilupArea: 0.0,
            Configuration: '',


        };
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();


    }

    async loadPropertyDetailType() {
        var rData = await this.comdbprovider.getPropertyDetailType();
        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
        this.setState({ PropertyDetailsTypeListData: rData });
    }
    async loadMeasureunit() {
        var rData = await this.comdbprovider.getMeasureunite();
        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
        this.setState({ MeasureunitListData: rData });
    }

    async loadProperty() {
        await this.comdbprovider.getPropertyMaster(0).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {

                        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
                        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
                        this.setState({ PropertyListData: rData }, () => {

                        });
                    });
                }

            });
    }

    async loadPropertyTowers(id) {
        var rData = await this.comdbprovider.getPropertyTowersAsync(id);
        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
        this.setState({ PropertyTowersData: rData });
    }

    getModel = (type) => {
        var mode = [{
            "propertyDetailsId": this.state.PropertyDetailsId,
            "propertyId": parseInt(this.props.PropertyId),
            "propertyTowerId": this.state.PropertyTowerId,
            "floor": this.state.Floor,
            "flat": this.state.FlatName,
            "contactNumber": this.state.ContactNumber,
            "cmdType": "" + type + "",
            "propertyDetailTypeId": this.state.PropertyDetailTypeId,
            "totalArea": parseFloat(this.state.TotalArea),
            "builtupArea": parseFloat(this.state.BuitupArea),
            "carpetArea": parseFloat(this.state.CarpetArea),
            "superBuilUpArea": parseFloat(this.state.SuperBuilupArea),
            "measurementUnitsId": this.state.MeasureunitId,
            "uniteConfiguration": this.state.Configuration
        }]

        return mode;
    }


    componentDidMount() {
        this.loadHomagePageData();
        this.loadPropertyDetailType();
        this.loadMeasureunit();

    }
    componentDidUpdate(prevProps) {
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.loadHomagePageData();
            this.loadPropertyDetailType();
            this.loadMeasureunit();
        }
    }
    loadHomagePageData() {

        var model = this.getModel('R');
        this.ApiProviderr.managePropertyTowers(model).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        this.setState({ GridData: rData });
                    });

                }
            });
    }

    onPagechange = (page) => {

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
                        this.setState({ PropertyDetailsId: parseInt(Id) }, () => {
                            var type = 'D'
                            var model = this.getModel(type);
                            this.mangaeSave(model, type);
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

    async ongridedit(Id) {
        await this.loadProperty();
        this.setState({ PageMode: 'Edit' });
        await CreateValidator();

        var rowData = this.findItem(Id)
        // console.log(rowData);

        await this.loadPropertyTowers(rowData.propertyId);
        this.onTowerChanges(rowData.propertyTowerId);
        this.setState({
            PropertyTowerId: rowData.propertyTowerId, PropertyDetailsId: rowData.propertyDetailsId, PropertyId: rowData.propertyId
            , Floor: rowData.floor, FlatName: rowData.flat,
            ContactNumber: rowData.contactNumber, SuperBuilupArea: rowData.superBuilUpArea
            , TotalArea: rowData.totalArea, BuitupArea: rowData.builtupArea, CarpetArea: rowData.carpetArea, Configuration: rowData.uniteConfiguration
            , MeasureunitId: parseInt(rowData.measurementUnitsId), PropertyDetailTypeId: parseInt(rowData.propertyDetailTypeId)
        }, () => {
            $('#ddlPropertyList').val(rowData.propertyId);
            $('#ddlTowerList').val(rowData.propertyTowerId);
            $('#ddlFloorsList').val(rowData.floor);
            $('#ddlPropertyDetailType').val(rowData.propertyDetailTypeId);
            $('#ddlMeasureunit').val(rowData.measurementUnitsId);
        });

    }
    async Addnew() {
        this.setState({ PageMode: 'Add' }, () => {
            CreateValidator();
        });
        await this.loadProperty();
    }

    findItem(id) {

        return this.state.GridData.find((item) => {
            if (item.propertyDetailsId == id) {
                return item;
            }
        });
    }

    updatetextmodel = (ctrl, val) => {

        if (ctrl == 'ext') {
            val = val != '' ? val : 0;
            this.setState({ ContactNumber: parseInt(val) });
        }
        else if (ctrl == 'flat') {
            this.setState({ FlatName: val });
        }
        else if (ctrl == 'super') {
            this.setState({ SuperBuilupArea: val });
        }
        else if (ctrl == 'total') {
            this.setState({ TotalArea: val });
        }
        else if (ctrl == 'built') {
            this.setState({ BuitupArea: val });
        }
        else if (ctrl == 'carpet') {
            this.setState({ CarpetArea: val });
        }
        else if (ctrl == 'config') {
            this.setState({ Configuration: val });
        }

    }
    handleSave = () => {

        if (ValidateControls()) {
            var type = 'C'
            if (this.state.PageMode == 'Edit')
                type = 'U'
            var model = this.getModel(type);
            this.mangaeSave(model, type);
        }
    }
    mangaeSave = (model, type) => {

        this.ApiProviderr.managePropertyTowers(model).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {

                        if (type != 'D')
                            appCommon.showtextalert("Flat Saved Successfully!", "", "success");
                        else
                            appCommon.showtextalert("Flat Deleted Successfully!", "", "success");
                        this.handleCancel();
                    });
                }

            });
    }
    handleCancel = () => {
        this.setState({
            // PropertyTowerId: 0, PropertyDetailsId: 0, Floor: 0, FlatName: '', ContactNumber: 0, PropertyDetailTypeId: 0,
            // MeasureunitId: 0, TotalArea: 0.0, BuitupArea: 0.0, CarpetArea: 0.0, SuperBuilupArea: 0.0, Configuration: '',
            PropertyTowerId: 0, PropertyDetailsId: 0, Floor: 0, FlatName: '',
            ContactNumber: 0, SuperBuilupArea: 0,
            TotalArea: 0, BuitupArea: 0, CarpetArea: 0, Configuration: '',
            MeasureunitId: 0, PropertyDetailTypeId: 0
        }, () => {
            this.setState({ PageMode: 'Home' });
            this.loadHomagePageData();
        });
    };
    onPropertyChanged(value) {

        this.setState({ PropertyId: parseInt(value) }, () => {
            this.setState({ PropertyTowersData: [], PropertyFloors: [] }, () => {
                this.loadPropertyTowers(value);
            })


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
        for (let index = 0; index < searchvalue.totalFloors + 1; index++) {
            floors.push({
                Value: index,
                Name: index
            });
        }
        this.setState({ PropertyTowerId: parseInt(id) });
        this.setState({ PropertyFloors: floors });
    }
    async oncFloorChange(value) {
        this.setState({ Floor: parseInt(value) });
    }
    onPropertyDetailChanged(value) {
        this.setState({ PropertyDetailTypeId: parseInt(value) });
    }

    onmeasurmentChanged(value) {
        this.setState({ MeasureunitId: parseInt(value) });
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
                                        Id="grdPropertyDetail"
                                        IsPagination={false}
                                        ColumnCollection={this.state.gridHeader}
                                        Onpageindexchanged={this.onPagechange.bind(this)}
                                        onEditMethod={this.ongridedit.bind(this)}
                                        onGridDeleteMethod={this.onGridDelete.bind(this)}
                                        DefaultPagination={true}
                                        IsSarching="true"
                                        GridData={this.state.GridData}
                                        pageSize="20" />
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {(this.state.PageMode == 'Add' || this.state.PageMode == 'Edit') &&
                    <div>
                        <div >
                            <div class="modal-content">
                                <div class="modal-body">
                                    <div class="row">
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
                                    <div class="row">
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
                                                <label for="txtFlatName">Flat Name</label>
                                                <InputBox Id="txtFlatName"
                                                    Value={this.state.FlatName}
                                                    onChange={this.updatetextmodel.bind(this, "flat")}
                                                    PlaceHolder="Flat Name"
                                                    Class="form-control form-control-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        {/* <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="txtExtention">Extention</label>
                                                <InputBox Id="txtExtention"
                                                    Value={this.state.ContactNumber}
                                                    onChange={this.updatetextmodel.bind(this, "ext")}
                                                    PlaceHolder="Extension"
                                                    Class="form-control form-control-sm"
                                                />
                                            </div>
                                        </div> */}
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="ddlPropertyDetailType">Flat/Shop Type</label>
                                                <DropDownList Id="ddlPropertyDetailType"
                                                    onSelected={this.onPropertyDetailChanged.bind(this)}
                                                    Options={this.state.PropertyDetailsTypeListData} />
                                            </div>
                                        </div>
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="ddlMeasureunit">Measrue Unit</label>
                                                <DropDownList Id="ddlMeasureunit"
                                                    onSelected={this.onmeasurmentChanged.bind(this)}
                                                    Options={this.state.MeasureunitListData} />

                                            </div>
                                        </div>
                                    </div>
                                    {/* <div class="row"> */}
                                        {/* <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="txtSuperBuiltupArea">Super Builtup Area</label>
                                                <InputBox Id="txtSuperBuiltupArea"
                                                    Value={this.state.SuperBuilupArea}
                                                    onChange={this.updatetextmodel.bind(this, "super")}
                                                    PlaceHolder="Super Builtup Area"
                                                    Class="form-control form-control-sm"
                                                />
                                            </div>
                                        </div> */}
                                    {/* </div> */}

                                    <div class="row">
                                        {/* <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="txtTotalArea">Total Area</label>
                                                <InputBox Id="txtTotalArea"
                                                    Value={this.state.TotalArea}
                                                    onChange={this.updatetextmodel.bind(this, "total")}
                                                    PlaceHolder="Total Area"
                                                    Class="form-control form-control-sm"
                                                />

                                            </div>
                                        </div> */}
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="txtBuiltupArea">Builtup Area</label>
                                                <InputBox Id="txtBuiltupArea"
                                                    Value={this.state.BuitupArea}
                                                    onChange={this.updatetextmodel.bind(this, "built")}
                                                    PlaceHolder="Builtup Area"
                                                    Class="form-control form-control-sm"
                                                />
                                            </div>
                                        </div>
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="txtCarpetArea">Carpet Area</label>
                                                <InputBox Id="txtCarpetArea"
                                                    Value={this.state.CarpetArea}
                                                    onChange={this.updatetextmodel.bind(this, "carpet")}
                                                    PlaceHolder="Carpet Area"
                                                    Class="form-control form-control-sm"
                                                />

                                            </div>
                                        </div>
                                    </div>

                                    <div class="row">
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                <label for="txtPropertyConfiguration">Property Configuration</label>
                                                <InputBox Id="txtPropertyConfiguration"
                                                    Value={this.state.Configuration}
                                                    onChange={this.updatetextmodel.bind(this, "config")}
                                                    PlaceHolder="Property Configuration"
                                                    Class="form-control form-control-sm"
                                                />


                                            </div>
                                        </div>
                                    </div>

                                    <div class="row">
                                        <div class="col-sm-6">
                                            <div class="form-group">


                                            </div>
                                        </div>
                                        <div class="col-sm-6">
                                            <div class="form-group">
                                                {/* <label for="txtSuperBuiltupArea">Super Builtup Area</label>
                          <InputBox Id="txtSuperBuiltupArea"
                                  Value={this.state.ContactNumber}
                                      onChange={this.updatetextmodel.bind(this,"ext")}
                                      PlaceHolder="Extension"
                                      Class="form-control form-control-sm"
                                  />                                */}
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div class="modal-footer">
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
export default connect(mapStoreToprops, mapDispatchToProps)(PropertyTower);