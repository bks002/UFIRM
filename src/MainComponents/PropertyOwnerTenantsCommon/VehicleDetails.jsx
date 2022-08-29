import React, { Component } from 'react';
import swal from 'sweetalert';
import Select from 'react-select';

import * as appCommon from '../../Common/AppCommon';
import ApiProvider from './DataProvider.js';
import Button from '../../ReactComponents/Button/Button.jsx';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';

import { CreateVehicleValidator, VehicleValidateControls } from './Validation';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common.js';


class VehicleDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedVehicleType: '', ownerVehicleTypedllOptions: [
                { Id: '', Name: "Select Vehicle type" },
                { Id: '2 wheeler', Name: "2 wheeler" },
                { Id: '4 wheeler', Name: "4 wheeler" }
            ],

            gridVehicleHeader: [
                { sTitle: 'Id', titleValue: 'id', "orderable": false, },
                { sTitle: 'ParkingId', titleValue: 'parkingId', "orderable": false, bVisible: false },
                { sTitle: 'Parking Details', titleValue: 'parkingDT', "orderable": false, },
                { sTitle: 'Type', titleValue: 'vehicletype', "orderable": false, },
                { sTitle: 'Name', titleValue: 'name', "orderable": false, },
                { sTitle: 'Number', titleValue: 'vehiclenumber', "orderable": false, },
                { sTitle: 'Action', titleValue: 'Action', Action: "Delete", Index: '0', "orderable": false }
            ],

            vehicleName: '',
            vehicleNumber: '',
            selectedOption: null,
        }
        this.ApiProviderr = new ApiProvider();
    }
    // Add More vehicle details
    onAddVehicle = () => {
        if (parseInt(this.props.ownerResidingId) === 1) {
            CreateVehicleValidator();
            if (VehicleValidateControls()) {
                let data = this.props.vehicleDetails;
                let existedPk = data.some(x => x.parkingId === parseInt(this.state.selectedOption.value))
                let existedName = data.some(x => x.vehiclenumber.toLowerCase() === this.state.vehicleNumber.toLowerCase());
                if (!existedPk) {
                    if (!existedName) {
                        let newData = {
                            id: data.length + 1,
                            vehicletype: this.state.selectedVehicleType,
                            name: this.state.vehicleName,
                            vehiclenumber: this.state.vehicleNumber,
                            parkingId: this.state.selectedOption ? parseInt(this.state.selectedOption.value) : 0,
                            parkingDT: this.state.selectedOption ? this.state.selectedOption.label : '',
                            rowType: 'Add'
                        }
                        this.setState({ selectedVehicleType: '', vehicleName: '', vehicleNumber: '', selectedOption: null },
                            () => this.props.getVehicleDetails(newData));
                    }
                    else {
                        appCommon.showtextalert(`Vehicle Number- ${this.state.vehicleNumber} Already Added`, "", "error");
                    }
                }
                else {
                    appCommon.showtextalert(`Parking - ${this.state.selectedOption.label} Already Added`, "", "error");
                }
            }
        }
        else {
            appCommon.showtextalert(`Residing Status Is No`, "", "error");
        }
    }

    // componentDidMount() {
    //     console.log(this.props.ownerResidingId, "Residing status componentDidMount");
    // }
    // componentDidUpdate(prevProps) {
    //     if (prevProps.ownerResidingId !== this.props.ownerResidingId) {
    //         console.log(this.props.ownerResidingId, "Residing status componentDidUpdate");
    //     }
    // }

    onRemoveVehicle(gridId) {
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
                        this.props.removeVehicleDetails(gridId);
                        appCommon.showtextalert("Vehicle Deleted Successfully", "", "success");
                        break;
                    case "cancel":
                        //do nothing 
                        break;
                    default:
                        break;
                }
            })
        );
    }
    // Dropdown value set
    onSelected(name, value) {
        switch (name) {
            case "VehicleType":
                this.setState({ selectedVehicleType: value })
                break;
            default:
        }
    }
    handleChange = selectedOption => {
        this.setState({ selectedOption });
    };
    render() {
        return (
            <div className="card card-primary " >
                <div className="card-header">
                    <h3 className="card-title">Vehicle Details</h3>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-sm-3">
                            <div className="form-group">
                                <label htmlFor="ddlVehicleType"> Parking Details</label>
                                <Select
                                    value={this.state.selectedOption}
                                    onChange={this.handleChange}
                                    options={this.props.parkingDll}
                                    placeholder="Select Parking Details"
                                />
                            </div>
                        </div>
                        <div className="col-sm-3">
                            <div className="form-group">
                                <label htmlFor="ddlVehicleType"> Vehicle Type</label>
                                <SelectBox
                                    Value={this.state.selectedVehicleType}
                                    ID="ddlVehicleType"
                                    ClassName="form-control "
                                    onSelected={this.onSelected.bind(this, "VehicleType")}
                                    Options={this.state.ownerVehicleTypedllOptions}
                                />
                            </div>
                        </div>
                        <div className="col-sm-3">
                            <div className="form-group">
                                <label htmlFor="txtVehicleName">Name</label>
                                <input
                                    type="text"
                                    id="txtVehicleName"
                                    placeholder="Vehicle Name"
                                    className="form-control"
                                    value={this.state.vehicleName}
                                    onChange={(e) => this.setState({ vehicleName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-sm-2">
                            <div className="form-group">
                                <label htmlFor="txtVehicleNumber">Vehicle Number</label>
                                <input
                                    type="text"
                                    id="txtVehicleNumber"
                                    placeholder="Vehicle Number"
                                    className="form-control"
                                    value={this.state.vehicleNumber}
                                    onChange={(e) => this.setState({ vehicleNumber: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-sm-1">
                            <div className="form-group">
                                <br></br>
                                <Button
                                    Id="btnAddMoreVehicle"
                                    Text="Add"
                                    Action={this.onAddVehicle.bind(this)}
                                    ClassName="btn btn-info mt-2" />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <DataGrid
                                Id="grdDoc"
                                IsPagination={false}
                                ColumnCollection={this.state.gridVehicleHeader}
                                onGridDeleteMethod={this.onRemoveVehicle.bind(this)}
                                GridData={this.props.vehicleDetails.filter(item => item.rowType !== 'Delete')}
                            />
                        </div>
                    </div>
                </div>

                {
                    parseInt(this.props.ownerResidingId) === 0 ? <div class="overlay"> </div> : null
                }
            </div>

        );
    }
}

VehicleDetails.defaultProps = {
    ownerResidingId: 1,
}

export default VehicleDetails;