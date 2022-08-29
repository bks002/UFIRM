import React from 'react';
import Button from '../../ReactComponents/Button/Button.jsx';

// import departmentactions from '../../Redux/department/actions.js';
import HomeContainer from '../../AppContainers/home/homecontainer.jsx';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import TextAria from '../../ReactComponents/TextAreaBox/TextAreaBox.jsx';
import DepartmentBL from '../../ComponentBL/DepartmentBL';
// import ToastNotify from '../../ReactComponents/ToastNotify/ToastNotify.jsx';
import { ToastContainer, toast } from 'react-toastify';
import * as appCommon from '../../Common/AppCommon';
import { VALIDATION_ERROR } from '../../Contants/Common.js';
import swal from 'sweetalert';
import departmentActions from '../../redux/department/action';
import { connect } from 'react-redux';
import { promiseWrapper } from '../../utility/common';
import { bindActionCreators } from 'redux';

const $ = window.$;
const departmentBL = new DepartmentBL();



class DepartmentNew extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
        
    }
    

    componentDidMount() {
        //alert(this.props.PageMode);
        departmentBL.CreateValidator();
    }

    componentDidUpdate() {
        var d = this.props;
    }

    handleCancel = () => {
        // departmentBL.ValidateControls();
        this.props.Action('Home');
        //
        // appCommon.ShownotifyError('Solve all error');
    };
    handleSave = () => {
        var departmentid = 0;
        if (this.props.PageMode == "Edit")
            departmentid = this.props.Data.departmentId
        var saveValues = {
            "departmentId": departmentid,
            "departmentName": $('#txtDepartmentName').val(),
            "description": $('#txtDescription').val(),
            "userId": 0
        }
        // appCommon.openprogressmodel('Discount Profile Created Successfully', 5000);
        if (departmentBL.ValidateControls() == "") {
            //appCommon.openprogressmodel('Saving department', 5000);
            promiseWrapper(this.props.actions.saveDepartment, { data: saveValues }).then((jdata) => {
                //this.setState({loader : false});
                if (jdata <= 0) {
                    appCommon.ShownotifyError("Department is already created");
                }
                else {
                    if (this.props.PageMode != "Edit")
                        appCommon.showtextalert("Department Created Successfully", "", "success");
                    else
                        appCommon.showtextalert("Department Updated Successfully", "", "success");
                    this.props.Action('Home');
                }
            });

        }
        else {
            // appCommon.showtextalert("Please select an item to deactivate", '', 'info');
            appCommon.ShownotifyError(VALIDATION_ERROR);
        }

        //

    }
    updateDepartment = () => {

    }



    render() {

        return (

            <div>
                
                <div >
                    <div className="modal-content">
                        
                        {/* <div className="modal-header">
                        <h4 className="modal-title">New/Edit Ticket</h4>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    </div> */}
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-sm-6">
                                   
                                    <div className="form-group">

                                        <label for="txtDepartmentName">Department Name</label>
                                        {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                            <InputBox Id="txtDepartmentName"
                                                onChange={this.updateDepartment.bind(this)}
                                                PlaceHolder="Department Name"
                                                Value={this.props.Data.departmentName}
                                                className="form-control form-control-sm"
                                            />
                                        }
                                        {this.props.PageMode == "Add" &&
                                            <InputBox Id="txtDepartmentName"
                                                onChange={this.updateDepartment.bind(this)}
                                                PlaceHolder="Department Name"
                                                className="form-control form-control-sm"
                                            />
                                        }
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="txtDescription">Description</label>
                                        {this.props.PageMode == "Edit" && this.props.Data != undefined &&
                                            <TextAria Id="txtDescription"
                                                onChange={this.updateDepartment.bind(this)}
                                                Value={this.props.Data.description}
                                                ClassName="form-control form-control-sm"
                                                PlaceHolder="Description"

                                            />
                                        }
                                        {this.props.PageMode == "Add" &&
                                            <TextAria Id="txtDescription"
                                                onChange={this.updateDepartment.bind(this)}
                                                ClassName="form-control form-control-sm"
                                                PlaceHolder="Description"

                                            />
                                        }
                                        {/* <textarea name="Ticket Description" 
                                    id="ticketDescription" rows="2" 
                                    className="form-control form-control-sm"  
                                    placeholder="Enter decsription here..."></textarea> */}
                                    </div>
                                </div>
                            </div>
                            {/* <div className="row">
                            <div className="col-sm-12">
                                <div className="form-group">
                                    <label for="ticketDescription">Description</label>
                                    <textarea name="Ticket Description" id="ticketDescription" rows="2" className="form-control form-control-sm"  placeholder="Enter decsription here..."></textarea>
                                </div>
                            </div>                           
                        </div> */}
                        </div>
                        {/* <div className="modal-footer justify-content-between"> */}


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


                            {/* <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-primary">Save changes</button> */}
                        </div>
                    </div>
                    {/* <!-- /.modal-content --> */}
                </div>
                {/* <!-- /.modal-dialog --> */}
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
                {/* Same as */}
                <ToastContainer />
            </div>

        )

    }
}
function mapStoreToprops(state, props) {
    return {

        // userName: state.Catalog.usreName,
        // structureList: state.Catalog.structureData,
        // languageCode: state.Catalog.languageCode,
        // structureData: state.Catalog.currentStructure,
        // categoryList: state.Catalog.navigationData,
        // globalSearch: state.Catalog.globalSearch
    }

}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentActions, dispatch);
    return { actions };
}

export default connect(mapStoreToprops, mapDispatchToProps)(DepartmentNew);