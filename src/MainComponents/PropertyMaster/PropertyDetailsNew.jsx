import React from 'react'
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import TextAria from '../../ReactComponents/TextAreaBox/TextAreaBox.jsx';
import { ToastContainer, toast } from 'react-toastify';
import Button from '../../ReactComponents/Button/Button.jsx';
import DropDownList from '../../ReactComponents/SelectBox/DropdownList';
import MultiSelect from '../../ReactComponents/MultiSelect/MultiSelect.jsx';
class PropertyDetailsNew extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            PropertyData : [{Name:'Royal Nest Housing', Value:1}, {Name:'EON society', Value:1}],
            TowerData : [{Name:'Tower-N1', Value:1}, {Name:'Tower-N2', Value:2}],
            FloorData : [{Name:'1', Value:1}, {Name:'2', Value:2}],
            ParkingData : [
                { label: 'B/N001', value: 1},
                { label: 'B/N002', value: 2},
                { label: 'B/N003', value: 2},
                { label: 'B/N004', value: 2},
                { label: 'B/N005', value: 2},
              ],
              setSelectedOptions: [],

         };
    }
    componentDidMount(){
        
        


    }
    updateDepartment = () => {

    }

    handleSave = () => {
        // var departmentid = 0;
        // if (this.props.PageMode == "Edit")
        //     departmentid = this.props.Data.departmentId
        // var saveValues = {
        //     "departmentId": departmentid,
        //     "departmentName": $('#txtDepartmentName').val(),
        //     "description": $('#txtDescription').val(),
        //     "userId": 0
        // }
        // // appCommon.openprogressmodel('Discount Profile Created Successfully', 5000);
        // if (departmentBL.ValidateControls() == "") {
        //     
        //     //appCommon.openprogressmodel('Saving department', 5000);
        //     promiseWrapper(this.props.actions.saveDepartment, { data: saveValues }).then((jdata) => {
        //         //this.setState({loader : false});
        //         if (jdata <= 0) {
        //             appCommon.ShownotifyError("Department is already created");
        //         }
        //         else {
        //             if (this.props.PageMode != "Edit")
        //                 appCommon.showtextalert("Department Created Successfully", "", "success");
        //             else
        //                 appCommon.showtextalert("Department Updated Successfully", "", "success");
        //             this.props.Action('Home');
        //         }
        //     });

        // }
        // else {
        //     // appCommon.showtextalert("Please select an item to deactivate", '', 'info');
        //     appCommon.ShownotifyError(VALIDATION_ERROR);
        // }

        //

    }
    handleCancel = () => {
        // departmentBL.ValidateControls();
        this.props.Action('Home');
        //
        // appCommon.ShownotifyError('Solve all error');
    };
    onDropDownMultiSelectChange(value, event) {
     //   this.setState({ setSelectedOptions: value });
    }
    render() {
        return (
            <div>
                
            <div >
                <div className="modal-content">
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-sm-6">
                               
                                <div className="form-group">

                                    <label for="txtDepartmentName">Property Name</label>
                                    <DropDownList 
                                        Id="ddlProperty"
                                        Options={this.state.PropertyData} />
                                   
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label for="txtDescription">Towers Name</label>
                                     
                                    <DropDownList 
                                        Id="ddlProperty"
                                        Options={this.state.TowerData} />

                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-6">
                               
                                <div className="form-group">

                                    <label for="txtFlatName">Floor</label>
                                    <DropDownList 
                                        Id="ddlProperty"
                                        Options={this.state.FloorData} />
                                   
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                <label for="txtFlatName">Flat Number</label>
                                    <InputBox Id="txtFlatName"
                                                onChange={this.updateDepartment.bind(this)}
                                                PlaceHolder="Flat Name"
                                                className="form-control form-control-sm"
                                            />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-6">
                               
                            <div className="form-group">
                                <label for="txtExtenstionNumber">Extenstion Number</label>
                                    <InputBox Id="txtExtenstionNumber"
                                                onChange={this.updateDepartment.bind(this)}
                                                PlaceHolder="Extension"
                                                className="form-control form-control-sm"
                                            />
                                </div>
                            </div>
                            <div className="col-sm-6">
                            <label for="lbRole">Parking</label>
                                     <MultiSelect
                                            options={this.state.ParkingData}
                                            onChange={this.onDropDownMultiSelectChange.bind(this)}
                                            value={this.state.setSelectedOptions}
                                        />
                                    
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
        );
    }
}

export default PropertyDetailsNew;