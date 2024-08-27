import React from 'react';
import Button from '../../ReactComponents/Button/Button.jsx';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import { CreateValidator, ValidateControls } from '../ManageFlat/Validation.js';
import ApiProvider from '../ManageFlat/DataProvider.js';
import swal from 'sweetalert';
// import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import * as appCommon from '../../Common/AppCommon';
import departmentActions from '../../redux/department/action';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class FlatDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PropertyDetailsId:0,
            Bedrooms:"",
            ContactNumber:"",
            Occupancy:"",
            TotalArea:"",
            BuiltupArea:"",
            CarpetArea:"",
            SuperBuilUpArea:"",
            MeasurementUnitsId:"",
            UniteConfiguration:"",
            ElectricityMeterId:"",
            PipeGassConnectionId:""
        };
            this.ApiProviderr = new ApiProvider();
    }


    componentDidMount() {
        CreateValidator();
        console.log(this.props.PropertyDetails);
        let data = this.props.PropertyDetails;
        this.setState({ PropertyDetailsId: data.propertyDetailsId });
        this.setState({ Bedrooms: data.bedrooms });
        this.setState({ ContactNumber: data.contactNumber });
        //this.setState({ Occupancy: data.Occupancy });
        this.setState({ TotalArea: data.totalArea });
        this.setState({ BuiltupArea: data.builtupArea });
        this.setState({ CarpetArea: data.carpetArea });
        this.setState({ SuperBuilUpArea: data.superBuilUpArea });
        this.setState({ MeasurementUnitsId: data.measurementUnitsId });
        this.setState({ UniteConfiguration: data.uniteConfiguration });
        this.setState({ ElectricityMeterId: data.electricityMeterId });
        this.setState({ PipeGassConnectionId: data.pipeGassConnectionId });
    }

    componentDidUpdate(nextProps) {
        CreateValidator();
    }

    handleUpdate() {
            if (ValidateControls()) {
            {
                let model = [];
                model.push({
                    "PropertyDetailsId": parseInt(this.state.PropertyDetailsId),
                     "Bedrooms":this.state.Bedrooms,
                     "ContactNumber":this.state.ContactNumber,
                    "Occupancy":this.state.Occupancy,
                    "TotalArea":this.state.TotalArea,
                    "BuiltupArea":this.state.BuiltupArea,
                    "CarpetArea":this.state.CarpetArea,
                    "SuperBuilUpArea":this.state.SuperBuilUpArea,
                    "MeasurementUnitsId":this.state.MeasurementUnitsId,
                    "UniteConfiguration":this.state.UniteConfiguration,
                    "ElectricityMeterId":this.state.ElectricityMeterId,
                    "PipeGassConnectionId":this.state.PipeGassConnectionId
                });
                this.ApiProviderr.manageManageFlat(model, 'U').then(
                    resp => {
                        if (resp.ok && resp.status === 200) {
                            return resp.json().then(rData => {
                                appCommon.showtextalert("Flat Details Update Successfully!", "", "success");
                                //this.handleCancel();
                            });
                        }
                    });
            }
        }
    }

    updateData = (name, value) => {
        switch (name) {
            case "Bedrooms":
                this.setState({ Bedrooms: value });
                break;
            case "ContactNumber":
                this.setState({ ContactNumber: value });
                break;
            case "Occupancy":
                this.setState({ Occupancy: value });
                break;
            case "TotalArea":
                this.setState({ TotalArea: value });
                break;
            case "BuiltupArea":
                this.setState({ BuiltupArea: value });
                break;
            case "CarpetArea":
                this.setState({ CarpetArea: value });
                break;
            case "SuperBuilUpArea":
                this.setState({ SuperBuilUpArea: value });
                break;
            case "MeasurementUnitsId":
                this.setState({ MeasurementUnitsId: value });
                break;
            case "UniteConfiguration":
                this.setState({ UniteConfiguration: value });
                break;
            case "ElectricityMeterId":
                this.setState({ ElectricityMeterId: value });
                break;
            case "PipeGassConnectionId":
                this.setState({ PipeGassConnectionId: value });
                break;
            default:
        }
    }

    render() {
        return (
            <div>
                <div className="row">
                    <div class="col-sm-6">
                        <div class="form-group">
                            <label for="lblBedrooms">Bedrooms</label>
                            <InputBox Id="txtBedrooms"
                                Value={this.state.Bedrooms}
                                onChange={this.updateData.bind(this, "Bedrooms")}
                                PlaceHolder="Bedrooms"
                                className="form-control form-control-sm"
                            />
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="form-group">
                            <label for="lblContactNumber">Ext.</label>
                            <InputBox Id="txtContactNumber"
                                Value={this.state.ContactNumber}
                                onChange={this.updateData.bind(this, "ContactNumber")}
                                PlaceHolder="Enter a valid Ext Number"
                                className="form-control form-control-sm"
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div class="col-sm-6">
                        <div class="form-group">
                            <label for="lblOccupancy">Occupancy</label>
                            <InputBox Id="txtOccupancy"
                                Value={this.state.Occupancy}
                                onChange={this.updateData.bind(this, "Occupancy")}
                                PlaceHolder="Max 32 Characters Are Allowed"
                                className="form-control form-control-sm"
                            />
                        </div>
                    </div>
                    {/* <div class="col-sm-6">
                        <div class="form-group">
                            <label for="lblContact">Contact</label>
                            <InputBox Id="txtContact"
                                Value={this.state.Contact}
                                onChange={this.updateData.bind(this, "Contact")}
                                PlaceHolder="Enter a valid Contact Number"
                                className="form-control form-control-sm"
                            />
                        </div>
                    </div> */}
                </div>
                <div className="row">
                    <div class="col-sm-6">
                        <div class="form-group">
                            <label for="lblElectricityMeterId">Electricity Meter Id</label>
                            <InputBox Id="txtElectricityMeterId"
                                Value={this.state.ElectricityMeterId}
                                onChange={this.updateData.bind(this, "ElectricityMeterId")}
                                PlaceHolder="Electricity Meter Id"
                                className="form-control form-control-sm"
                            />
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="form-group">
                            <label for="lblPipeGassConnectionId">Pipe Gass Connection Id</label>
                            <InputBox Id="txtPipeGassConnectionId"
                                Value={this.state.PipeGassConnectionId}
                                onChange={this.updateData.bind(this, "PipeGassConnectionId")}
                                PlaceHolder="Pipe Gass Connection Id"
                                className="form-control form-control-sm"
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div class="col-sm-6">
                        <div class="form-group">
                            <label for="lblTotalArea">Total Area</label>
                            <InputBox Id="txtTotalArea"
                                Value={this.state.TotalArea}
                                onChange={this.updateData.bind(this, "TotalArea")}
                                PlaceHolder="Total Area"
                                className="form-control form-control-sm"
                            />
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="form-group">
                            <label for="lblBuiltupArea">Buildup Area</label>
                            <InputBox Id="txtBuiltupArea"
                                Value={this.state.BuiltupArea}
                                onChange={this.updateData.bind(this, "BuiltupArea")}
                                PlaceHolder="Buildup Area"
                                className="form-control form-control-sm"
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div class="col-sm-6">
                        <div class="form-group">
                            <label for="lblCarpetArea">Carpet Area</label>
                            <InputBox Id="txtCarpetArea"
                                Value={this.state.CarpetArea}
                                onChange={this.updateData.bind(this, "CarpetArea")}
                                PlaceHolder="Carpet Area"
                                className="form-control form-control-sm"
                            />
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="form-group">
                            <label for="lblSuperBuilUpArea">Super Built Up Area</label>
                            <InputBox Id="txtSuperBuilUpArea"
                                Value={this.state.SuperBuilUpArea}
                                onChange={this.updateData.bind(this, "SuperBuilUpArea")}
                                PlaceHolder="Super Built Up Area"
                                className="form-control form-control-sm"
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div class="col-sm-6">
                        <div class="form-group">
                            <label for="lblUniteConfiguration">Unite Configuration</label>
                            <InputBox Id="txtUniteConfiguration"
                                Value={this.state.UniteConfiguration}
                                onChange={this.updateData.bind(this, "UniteConfiguration")}
                                PlaceHolder="Unite Configuration"
                                className="form-control form-control-sm"
                            />
                        </div>
                    </div>
                    {/* <div class="col-sm-6">
                        <div class="form-group">
                            <label for="lblCustomer">Customer Id</label>
                            <InputBox Id="txtCustomer"
                                Value={this.state.Customer}
                                onChange={this.updateData.bind(this, "Customer")}
                                PlaceHolder="Customer id for meter"
                                className="form-control form-control-sm"
                            />
                        </div>
                    </div> */}
                </div>
                <div className="modal-footer" style={{ textAlign: "center" }}>
                    <Button
                        Id="btnUpdate"
                        Text="Update"
                        Action={this.handleUpdate.bind(this)}
                        ClassName="btn btn-primary" />
                </div>
            </div>
        )
    }
}

function mapStoreToprops(state, props) {
    return {}
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentActions, dispatch);
    return { actions };
}

export default connect(mapStoreToprops, mapDispatchToProps)(FlatDetails);