import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import React from 'react'
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

import { saveAs } from "file-saver";
import moment from 'moment'
const $ = window.$;
class ParkingAssignment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PropertyDetailsData: [],
            ParkingZoneData: [],
            ParkingData: [],
            GridData: [],
            gridHeader: [
                { sTitle: 'Id', titleValue: 'propertyParkingMappingId', "orderable": false },
                { sTitle: 'Property Name', titleValue: 'propertyName', bVisible: false },
                { sTitle: 'Flat/Shop', titleValue: 'flatDetailNumber', },
                { sTitle: 'Parking Name', titleValue: 'parkingDetail', },
                { sTitle: 'Vehicle', titleValue: 'vehicleDt', },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],

            PageMode: 'Home',
            PropertyParkingMappingId: 0,
            ParkingDetailsId: 0,
            propertyDetailsId: 0,
            VehicleDt: '',
        };
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
        this._PropertyTempData = [];

    }

    async loadParkingArea(id, setid) {
        var rData = await this.comdbprovider.getParkingZoneAsync(id);
        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
        this.setState({ ParkingZoneData: rData }, () => {
            if (setid != null)
                $('#ddlParkingZone').val(setid);
        });
    }

    async loadPropertyDetails(propertyId, setId) {
        var rData = await this.comdbprovider.getPropertyDetasilsAsync(propertyId);
        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
        this.setState({ PropertyDetailsData: rData }, () => {
            if (setId != null)
                $('#ddlPropertyName').val(setId);
        });
    }

    async loadParkingDetails(parkingZoneId, setid) {
        var rData = await this.comdbprovider.getParkingDetailsAsync(parkingZoneId);
        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
        this.setState({ ParkingData: rData });
        if (setid != null)
            $('#ddlParking').val(setid);
    }

    getModel = (type) => {
        var mode = [{
            "propertyID": parseInt(this.props.PropertyId),
            "propertyParkingMappingId": this.state.PropertyParkingMappingId,
            "parkingDetailsId": this.state.ParkingDetailsId,
            "propertyDetailsId": this.state.propertyDetailsId,
            "cmdType": "" + type + ""
        }]
        return mode;
    }

    componentDidMount() {
        this.loadHomagePageData();
        this.loadPropertyDetails(parseInt(this.props.PropertyId) === 0 ? -1 : parseInt(this.props.PropertyId), null);
        this.loadParkingArea(parseInt(this.props.PropertyId) === 0 ? -1 : parseInt(this.props.PropertyId), null);
    }
    componentDidUpdate(prevProps) {
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.loadHomagePageData();
            this.loadPropertyDetails(parseInt(this.props.PropertyId) === 0 ? -1 : parseInt(this.props.PropertyId), null);
            this.loadParkingArea(parseInt(this.props.PropertyId) === 0 ? -1 : parseInt(this.props.PropertyId), null);
        }
    }
    loadHomagePageData() {
        var model = this.getModel('R');
        this.ApiProviderr.mangeParkingAssignment(model).then(
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
                        this.setState({ PropertyParkingMappingId: Id }, () => {
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
    ongridedit = (Id) => {
        this.setState({ PageMode: 'Edit' }, () => {
            CreateValidator();
            var rowData = this.findItem(Id)
            this.setState({ PropertyParkingMappingId: rowData.propertyParkingMappingId });
            this.setState({ ParkingDetailsId: rowData.parkingDetailsId });
            this.setState({ propertyDetailsId: rowData.propertyDetailsId, VehicleDt: `${rowData.vehicleDt}` });
            console.log(rowData.vehicleDt);
            if (rowData.vehicleDt !== " - ") {
                this.setState({ VehicleDt: `${rowData.vehicleDt}` });
            }
            else {
                this.setState({ VehicleDt: '' });
            }

            this.loadParkingDetails(parseInt(rowData.parkingAreaId), rowData.parkingDetailsId);
            this.loadParkingArea(parseInt(rowData.propertyId), rowData.parkingAreaId)
            this.loadPropertyDetails(parseInt(rowData.propertyId), rowData.propertyDetailsId);
        });

    }

    Addnew = () => {
        this.setState({ PageMode: 'Add' }, () => {
            CreateValidator();
        });
    }

    findItem(id) {
        return this.state.GridData.find((item) => {
            if (item.propertyParkingMappingId == id) {
                return item;
            }
        });
    }
    updatetextmodel = (ctrl, val) => {
        if (ctrl == 'area') {
            this.setState({ ParkingAreaName: val });
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
        this.ApiProviderr.saveParkingAssignment(model).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        if (type === 'C') {
                            if (rData === 1) {
                                appCommon.showtextalert("Parking Assignement Save Successfully!", "", "success");
                                this.handleCancel();
                            }
                            else {
                                let propertyName = this.state.PropertyDetailsData.find(x => x.Value === model[0].propertyDetailsId).Name;
                                let parkingName = this.state.ParkingData.find(x => x.Value === model[0].parkingDetailsId).Name;
                                appCommon.showtextalert(`Parking- ${parkingName} is already assigned to flat/Shop- ${propertyName}`, "", "error");
                            }
                        }
                        if (type === 'U') {
                            if (rData === 1) {
                                appCommon.showtextalert("Parking Assignement Updated Successfully!", "", "success");
                                this.handleCancel();
                            }
                            else if (rData === -1) {
                                let propertyName = this.state.PropertyDetailsData.find(x => x.Value === model[0].propertyDetailsId).Name;
                                let parkingName = this.state.ParkingData.find(x => x.Value === model[0].parkingDetailsId).Name;
                                appCommon.showtextalert(`Parking- ${parkingName} is already assigned to flat/Shop- ${propertyName}`, "", "error");
                            }
                            else {
                                appCommon.showtextalert("Something went wrong please try again!", "", "error");
                            }
                        }
                        if (type === 'D') {
                            if (rData === 1) {
                                appCommon.showtextalert("Parking Assignement Deleted Successfully!", "", "success");
                            }
                            else {
                                appCommon.showtextalert("Something went wrong please try again!", "", "error");
                            }
                            this.handleCancel();
                        }

                    });
                }

            });
    }
    handleCancel = () => {
        this.setState({ PropertyParkingMappingId: 0, ParkingDetailsId: 0, propertyDetailsId: 0, VehicleDt: '' }, () => {
            this.setState({ PageMode: 'Home' });
            this.loadHomagePageData();
        });
    };

    onproperChanged = (value) => {
        this.setState({ propertyDetailsId: parseInt(value) });
    }

    onParkingChagned = (value) => {
        this.setState({ ParkingDetailsId: parseInt(value) });
    }
    onParkingZoneChanged = (value) => {
        this.loadParkingDetails(value, null);
    }


    manageExportExcel = () => {
        this.ApiProviderr.ExportToExcel(parseInt(this.props.PropertyId)).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.blob().then(rData => {
                        let fileName = moment(new Date()).format("YYYYMMDDHHmmss");
                        saveAs(rData, `ParkingAssignmentDetails_${fileName}.xlsx`)
                    });
                }
            });
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
                                        <li className="nav-item">
                                            <div className="input-group input-group-sm">
                                                <div className="input-group-prepend">
                                                    <Button id="btnExportExcel"
                                                        Action={this.manageExportExcel.bind(this)}
                                                        ClassName="btn btn-default btn-sm"
                                                        Icon={<i className="fa fa-file-excel" aria-hidden="true"></i>}
                                                        Text="Export"
                                                        Title='Download Report'
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div className="card-body pt-2">
                                    <DataGrid
                                        Id="grdTowers"
                                        IsPagination={false}
                                        ColumnCollection={this.state.gridHeader}
                                        Onpageindexchanged={this.onPagechange.bind(this)}
                                        onEditMethod={this.ongridedit.bind(this)}
                                        onGridDeleteMethod={this.onGridDelete.bind(this)}
                                        DefaultPagination={false}
                                        IsSarching="true"
                                        GridData={this.state.GridData}
                                        pageSize="2000" />
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {(this.state.PageMode == 'Add' || this.state.PageMode == 'Edit') &&
                    <div>
                        <div >
                            <div className="modal-content">
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label htmlFor="ddlPropertyName">Flat/Shop</label>
                                                <DropDownList Id="ddlPropertyName"
                                                    onSelected={this.onproperChanged.bind(this)}
                                                    Options={this.state.PropertyDetailsData} />
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label htmlFor="ddlParkingZone">Parking Zone</label>
                                                <DropDownList Id="ddlParkingZone"
                                                    onSelected={this.onParkingZoneChanged.bind(this)}
                                                    Options={this.state.ParkingZoneData} />
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label htmlFor="ddlParking">Parking</label>
                                                <DropDownList Id="ddlParking"
                                                    onSelected={this.onParkingChagned.bind(this)}
                                                    Options={this.state.ParkingData} />
                                            </div>
                                        </div>
                                    </div>

                                    <p><strong>Vehicle Details:</strong> {this.state.VehicleDt}</p>
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
// export default ParkingAssignment;

function mapStoreToprops(state, props) {
    return {
        PropertyId: state.Commonreducer.puidn,
    }
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentAction, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(ParkingAssignment);

