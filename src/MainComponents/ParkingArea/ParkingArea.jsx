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
class ParkingArea extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            GridData: [],
            gridHeader: [
                { sTitle: 'Id', titleValue: 'parkingAreaId', "orderable": false },
                // { sTitle: 'Property Name', titleValue: 'propertyName', },
                { sTitle: 'Parking Area', titleValue: 'parkingAreaName', },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],

            PageMode: 'Home',
            ParkingAreaId: 0,
            ParkingAreaName: '',

        };
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();


    }



    getModel = (type) => {
        var mode = [{
            "parkingAreaId": this.state.ParkingAreaId,
            "propertyId": parseInt(this.props.PropertyId),
            "parkingAreaName": this.state.ParkingAreaName,
            "cmdType": "" + type + ""
        }]
        return mode;
    }

    componentDidMount() {
        this.loadHomagePageData();

    }
    componentDidUpdate(prevProps) {
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.loadHomagePageData();
        }
    }
    loadHomagePageData() {
        var model = this.getModel('R');
        this.ApiProviderr.manageParkingArea(model).then(
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
                        this.setState({ ParkingAreaId: Id }, () => {
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
            this.setState({ ParkingAreaId: Id });
            this.setState({ ParkingAreaName: rowData.parkingAreaName });
        });

    }

    Addnew = () => {
        this.setState({ PageMode: 'Add' }, () => {
            CreateValidator();
        });
    }

    findItem(id) {
        return this.state.GridData.find((item) => {
            if (item.parkingAreaId == id) {
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
            if (this.state.GridData.length > 0) {
                if (!this.state.GridData.some(x => x.parkingAreaName.toLowerCase() === model[0].parkingAreaName.toLowerCase())) {
                    this.mangaeSave(model, type);
                }
                else
                    appCommon.showtextalert(`Parking Zone- ${model[0].parkingAreaName} is already exists`, "", "error");
            }
            else {
                this.mangaeSave(model, type);
            }
        }
    }
    mangaeSave = (model, type) => {
        if (parseInt(this.props.PropertyId) !== 0) {
            this.ApiProviderr.manageParkingArea(model).then(
                resp => {
                    if (resp.ok && resp.status == 200) {
                        return resp.json().then(rData => {
                            if (type != 'D')
                                appCommon.showtextalert("Parking Zone Saved Successfully!", "", "success");
                            else
                                appCommon.showtextalert("Parking Zone Successfully Deleted!", "", "success");
                            this.handleCancel();
                        });
                    }
                });
        }
        else
            appCommon.showtextalert("Please Select Property!", "", "success");

    }
    handleCancel = () => {
        this.setState({ ParkingAreaId: 0, ParkingAreaName: '' }, () => {
            this.setState({ PageMode: 'Home' });
            this.loadHomagePageData();
        });
    };

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
                                                <label htmlFor="txtLandMark">Parking Area</label>
                                                <InputBox Id="txtParkingArea"
                                                    Value={this.state.ParkingAreaName}
                                                    onChange={this.updatetextmodel.bind(this, "area")}
                                                    PlaceHolder="Parking Area name"
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
// export default ParkingArea;

function mapStoreToprops(state, props) {
    return {
        PropertyId: state.Commonreducer.puidn,
    }
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentAction, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(ParkingArea);

