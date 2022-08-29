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
class ParkingDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            GridData: [],
            ParkingZoneData: [],
            gridHeader: [
                { sTitle: 'Id', titleValue: 'parkingDetailId', "orderable": false },
                { sTitle: 'Parking Area', titleValue: 'parkingAreaName', },
                { sTitle: 'Parking', titleValue: 'parkingDetailName', },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],

            PageMode: 'Home',
            ParkingDetailsId: 0,
            ParkingDetailsName: '',
            ParkingAreaId: 0,

        };
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();


    }

    async loadParkingArea(id) {
        var rData = await this.comdbprovider.getParkingZoneAsync(id);
        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
        this.setState({ ParkingZoneData: rData });
    }

    getModel = (type) => {
        var mode = [{
            "PropertyId": parseInt(this.props.PropertyId),
            "parkingDetailId": this.state.ParkingDetailsId,
            "parkingDetailName": this.state.ParkingDetailsName,
            "parkingAreaId": this.state.ParkingAreaId,
            "cmdType": "" + type + ""

        }];
        return mode;
    }

    componentDidMount() {
        this.loadHomagePageData();
        this.loadParkingArea(parseInt(this.props.PropertyId));

    }
    componentDidUpdate(prevProps) {
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.loadHomagePageData();
            this.loadParkingArea(parseInt(this.props.PropertyId));
        }
    }
    loadHomagePageData() {
        var model = this.getModel('R');
        this.ApiProviderr.manageParkingZoneDetails(model).then(
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
                        this.setState({ ParkingDetailsId: Id }, () => {
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
        CreateValidator();
        //await this.loadProperty();
        var rowData = this.findItem(Id)
        this.setState({ ParkingDetailsId: Id });
        this.setState({ ParkingDetailsName: rowData.parkingDetailName });
        this.setState({ ParkingAreaId: rowData.parkingAreaId });
        $('#ddlParkingZone').val(rowData.parkingAreaId);
    }

    async Addnew() {
        this.setState({ PageMode: 'Add' }, () => {
            CreateValidator();

        });
    }

    findItem(id) {
        return this.state.GridData.find((item) => {
            if (item.parkingDetailId == id) {
                return item;
            }
        });
    }

    updatetextmodel = (ctrl, val) => {
        if (ctrl == 'parking') {
            this.setState({ ParkingDetailsName: val });
        }

    }
    handleSave = () => {
        if (ValidateControls()) {
            var type = 'C'
            if (this.state.PageMode == 'Edit')
                type = 'U'
            var model = this.getModel(type);
            let parkingDetailName = this.state.ParkingZoneData.find(x => x.Value === model[0].parkingAreaId).Name;
            if (this.state.GridData.length > 0) {
                if (!this.state.GridData.some(x => x.parkingDetailName.toLowerCase() === model[0].parkingDetailName.toLowerCase()
                    && parseInt(x.parkingAreaId) === parseInt(model[0].parkingAreaId))) {
                    this.mangaeSave(model, type);
                }
                else
                    appCommon.showtextalert(`Parking Zone- ${parkingDetailName} and Parking- ${model[0].parkingDetailName} is already exists`, "", "error");
            }
            else {
                this.mangaeSave(model, type);
            }
        }
    }
    mangaeSave = (model, type) => {
        this.ApiProviderr.manageParkingZoneDetails(model).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        if (type != 'D')
                            appCommon.showtextalert("Parking details Saved Successfully!", "", "success");
                        else
                            appCommon.showtextalert("Parking details Deleted Successfully!", "", "success");
                        this.handleCancel();
                    });
                }

            });
    }

    handleCancel = () => {
        this.setState({ ParkingDetailsId: 0, ParkingDetailsName: '', ParkingAreaId: 0, }, () => {
            this.setState({ PageMode: 'Home' });
            this.loadHomagePageData();
        });
    };


    onParkingZoneChanged = (value) => {
        this.setState({ ParkingAreaId: parseInt(value) });
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
                                        {parseInt(this.props.PropertyId) !== 0 &&
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
                                            </li>}
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
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label htmlFor="ddlParkingZone">Parking Zone</label>
                                                <DropDownList Id="ddlParkingZone"
                                                    onSelected={this.onParkingZoneChanged.bind(this)}
                                                    Options={this.state.ParkingZoneData} />
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label htmlFor="txtLandMark">Parking Name</label>
                                                <InputBox Id="txtParkingDetails"
                                                    Value={this.state.ParkingDetailsName}
                                                    onChange={this.updatetextmodel.bind(this, "parking")}
                                                    PlaceHolder="Parking Name"
                                                    Class="form-control"
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
// export default ParkingDetail;
function mapStoreToprops(state, props) {
    return {
        PropertyId: state.Commonreducer.puidn,
    }
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentAction, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(ParkingDetail);