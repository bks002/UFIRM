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
            PropertyTowersData: [],
            PropertyFloors: [],
            MeasureunitListData: [],
            PropertyDetailsTypeListData: [],
            GridData: [],
            gridHeader: [
                { sTitle: 'Id', titleValue: 'PropertyDetailsId', "orderable": false },
                // { sTitle: 'Property Name', titleValue: 'propertyName', },
                { sTitle: 'Tower Name', titleValue: 'TowerName', },
                { sTitle: 'Floor', titleValue: 'Floor', },
                { sTitle: 'Unit Name', titleValue: 'Flat', },
                // { sTitle: 'Flat Number', titleValue: 'FlatDetailNumber',  },
                { sTitle: 'Contact Number', titleValue: 'ContactNumber', },
                { sTitle: 'Status', titleValue: 'PropertyStatus', },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],
            PageMode: 'Home',
            PropertyTowerId: 0,
            PropertyId: 0,
            PropertyDetailsId: 0,
            Floor: 0,
            FlatName: '',
            ContactNumber: "",
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
    async loadPropertyTowers(id) {
        var rData = await this.comdbprovider.getPropertyTowersAsync(id);
        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
        this.setState({ PropertyTowersData: rData });
    }
    getModel = (type) => {
        var mode = [{
            "PropertyDetailsId": this.state.PropertyDetailsId,
            "PropertyId": parseInt(this.props.PropertyId),
            "PropertyTowerId": this.state.PropertyTowerId,
            "Floor": this.state.Floor,
            "Flat": this.state.FlatName,
            "ContactNumber": this.state.ContactNumber,
            "CmdType": "" + type + "",
            "PropertyDetailTypeId": this.state.PropertyDetailTypeId,
            "TotalArea": parseFloat(this.state.TotalArea),
            "BuiltupArea": parseFloat(this.state.BuitupArea),
            "CarpetArea": parseFloat(this.state.CarpetArea),
            "SuperBuilUpArea": parseFloat(this.state.SuperBuilupArea),
            "MeasurementUnitsId": this.state.MeasureunitId,
            "UniteConfiguration": this.state.Configuration,
            "UserId": this.state.userId,
        }]
        return mode;
    }

    componentDidMount() {
        this.loadHomagePageData();
        this.loadPropertyDetailType();
        this.loadMeasureunit();
        // Load property towers for the Redux PropertyId
        if (this.props.PropertyId) {
            this.loadPropertyTowers(this.props.PropertyId);
        }
    }
    componentDidUpdate(prevProps) {
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.loadHomagePageData();
            this.loadPropertyDetailType();
            this.loadMeasureunit();
            // Load property towers for the new Redux PropertyId
            if (this.props.PropertyId) {
                this.loadPropertyTowers(this.props.PropertyId);
            }
        }
    }
     async loadHomagePageData() {
        var model = this.getModel('R');
        this.ApiProviderr.managePropertyTowers(model).then(
            resp => {
                if (resp.ok && resp.status === 200) {
                    return resp.json().then(rData => {
                        console.log(rData)
                        this.setState({ GridData: rData }, () => {
                            console.log("GridData loaded:", this.state.GridData);
                        });
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
        this.setState({ PageMode: 'Edit' });
        await CreateValidator();

        console.log("ongridedit called with Id:", Id);
        var rowData = this.findItem(Id)
        console.log("rowData found:", rowData);

        if (!rowData) {
            alert("No row found for id: " + Id);
            return;
        }

        await this.loadPropertyTowers(this.props.PropertyId);
        this.onTowerChanges(rowData.PropertyTowerId);
        this.setState({
            PropertyTowerId: rowData.PropertyTowerId, PropertyDetailsId: rowData.PropertyDetailsId, PropertyId: this.props.PropertyId
            , Floor: rowData.Floor, FlatName: rowData.Flat,
            ContactNumber: rowData.ContactNumber, SuperBuilupArea: rowData.SuperBuilUpArea
            , TotalArea: rowData.TotalArea, BuitupArea: rowData.BuiltupArea, CarpetArea: rowData.CarpetArea, Configuration: rowData.UniteConfiguration
            , MeasureunitId: parseInt(rowData.MeasurementUnitsId), PropertyDetailTypeId: parseInt(rowData.PropertyDetailTypeId)
        }, () => {
            $('#ddlTowerList').val(rowData.PropertyTowerId);
            $('#ddlFloorsList').val(rowData.Floor);
            $('#ddlPropertyDetailType').val(rowData.PropertyDetailTypeId);
            $('#ddlMeasureunit').val(rowData.MeasurementUnitsId);
        });

    }
    async Addnew() {
        this.setState({ PageMode: 'Add' }, () => {
            CreateValidator();
        });
        // Load property towers for the Redux PropertyId instead of loading all properties
        if (this.props.PropertyId) {
            await this.loadPropertyTowers(this.props.PropertyId);
        }
    }

    findItem(id) {
        console.log("findItem called with id:", id);
        return this.state.GridData.find((item) => String(item.PropertyDetailsId) === String(id));
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
                {this.state.PageMode === 'Home' &&
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
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {this.state.PageMode == 'Add' ? 'Add New Property Detail' : 'Edit Property Detail'}
                                    </h5>
                                    <button type="button" className="close" onClick={this.handleCancel}>
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label htmlFor="ddlTowerList" className="font-weight-bold">Tower/Wing</label>
                                                <DropDownList Id="ddlTowerList"
                                                    onSelected={this.onTowerChanges.bind(this)}
                                                    Options={this.state.PropertyTowersData} />
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label htmlFor="ddlFloorsList" className="font-weight-bold">Floor</label>
                                                <DropDownList Id="ddlFloorsList"
                                                    onSelected={this.oncFloorChange.bind(this)}
                                                    Options={this.state.PropertyFloors} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label htmlFor="txtFlatName" className="font-weight-bold">Unit Name</label>
                                                <InputBox Id="txtFlatName"
                                                    Value={this.state.FlatName}
                                                    onChange={this.updatetextmodel.bind(this, "flat")}
                                                    PlaceHolder="Flat Name"
                                                    Class="form-control form-control-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label htmlFor="ddlPropertyDetailType" className="font-weight-bold">Flat/Shop Type</label>
                                                <DropDownList Id="ddlPropertyDetailType"
                                                    onSelected={this.onPropertyDetailChanged.bind(this)}
                                                    Options={this.state.PropertyDetailsTypeListData} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label htmlFor="ddlMeasureunit" className="font-weight-bold">Measure Unit</label>
                                                <DropDownList Id="ddlMeasureunit"
                                                    onSelected={this.onmeasurmentChanged.bind(this)}
                                                    Options={this.state.MeasureunitListData} />
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label htmlFor="txtPropertyConfiguration" className="font-weight-bold">Property Configuration</label>
                                                <InputBox Id="txtPropertyConfiguration"
                                                    Value={this.state.Configuration}
                                                    onChange={this.updatetextmodel.bind(this, "config")}
                                                    PlaceHolder="Property Configuration"
                                                    Class="form-control form-control-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label htmlFor="txtBuiltupArea" className="font-weight-bold">Builtup Area</label>
                                                <InputBox Id="txtBuiltupArea"
                                                    Value={this.state.BuitupArea}
                                                    onChange={this.updatetextmodel.bind(this, "built")}
                                                    PlaceHolder="Builtup Area"
                                                    Class="form-control form-control-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label htmlFor="txtCarpetArea" className="font-weight-bold">Carpet Area</label>
                                                <InputBox Id="txtCarpetArea"
                                                    Value={this.state.CarpetArea}
                                                    onChange={this.updatetextmodel.bind(this, "carpet")}
                                                    PlaceHolder="Carpet Area"
                                                    Class="form-control form-control-sm"
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