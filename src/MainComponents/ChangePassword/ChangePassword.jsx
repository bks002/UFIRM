import React from 'react';
import ReactDOM from 'react-dom';
import Button from '../../ReactComponents/Button/Button.jsx';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import { connect } from 'react-redux';
import { promiseWrapper } from '../../utility/common';
import { bindActionCreators } from 'redux';
import departmentActions from '../../redux/department/action';
import UserBL from '../../ComponentBL/UserBL';
import { ToastContainer, toast } from 'react-toastify';
import * as appCommon from '../../Common/AppCommon';
import ApiProvider from '../ChangePassword/DataProvider.js';

import { VALIDATION_ERROR, OLDPASSWORDWRONG, PASSWORDNOTMATCH, CHANGEPASSWORD, COMTHING_WENTWRONG } from '../../Contants/Common.js';

import { withRouter } from "react-router-dom";


const userBL = new UserBL();
class ChangePassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            OldPassword: '',
            NewPassword: '',
            ConfirmPassword: ''
        };
        this.ApiProviderr = new ApiProvider();
    }

    componentDidMount() {
        userBL.CreateValidator();
    }
    // handleChangePasswordCancel = () => {
    //     //this.props.Action('Home');
    // };

    handleChangePasswordSave = () => {
        //debugger
        if (userBL.ValidateControls() == "") {
            //     if(1==1){
            if (this.state.NewPassword == this.state.ConfirmPassword) {
                let param = {
                    OldPassword: this.state.OldPassword,
                    NewPassword: this.state.NewPassword,
                    ConfirmPassword: this.state.ConfirmPassword,
                }
                //debugger
                this.ApiProviderr.changepassword(this.state.NewPassword, this.state.OldPassword).then(
                    resp => {
                        if (resp.ok && resp.status == 200) {
                            return resp.json().then(rData => {
                                if (rData == 3) {
                                    appCommon.ShownotifyError('Old password is invalid!!');
                                }
                                else {
                                    appCommon.showtextalert(CHANGEPASSWORD, "", "success");
                                    this.props.history.push('/')
                                }

                            });

                        }
                        else appCommon.ShownotifyError(COMTHING_WENTWRONG);
                        this.setState({ OldPassword: '' });
                        this.setState({ NewPassword: '' });
                        this.setState({ ConfirmPassword: '' });

                    });

                // promiseWrapper(this.props.actions.saveChangePassword, { data: param }).then((data) => {
                //     if (data <= 0) {
                //         appCommon.ShownotifyError(OLDPASSWORDWRONG);
                //     }
                //     else {
                //         switch (data) {
                //             case 1:
                //                 appCommon.showtextalert(CHANGEPASSWORD, "", "success");
                //                 break;
                //             case 2:
                //                 appCommon.ShownotifyError(PASSWORDNOTMATCH);
                //                 break;
                //             default:
                //         }
                //     }
                //     this.setState({ OldPassword: '' });
                //     this.setState({ NewPassword: '' });
                //     this.setState({ ConfirmPassword: '' });
                // });
            } else {
                appCommon.ShownotifyError(PASSWORDNOTMATCH);
            }
        } else {
            appCommon.ShownotifyError(VALIDATION_ERROR);
        }
    }

    changePassword = () => {
        if (this.state.NewPassword == this.state.ConfirmPassword) {

        }
    }

    handleChange(name, value) {
        //
        switch (name) {
            case "OldPassword":
                this.setState({ OldPassword: value });
                break;
            case "NewPassword":
                this.setState({ NewPassword: value });
                break;
            case "ConfirmPassword":
                this.setState({ ConfirmPassword: value });
                break;
            default:
        }
    }


    render() {
        return (
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0 text-dark">Change Password</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><a href="/">Home</a></li>
                                    <li className="breadcrumb-item active"><a href="/ChangePassword">Change Password</a> </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="container-fluid">
                            <div className="modal-content">
                                <div className="modal-body">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label for="lblOldPassword">Old Password</label>
                                                <InputBox
                                                    Class="form-control form-control-sm"
                                                    Id="txtOldPassword"
                                                    Type="Password"
                                                    PlaceHolder="Old Password"
                                                    Value={this.state.OldPassword}
                                                    onChange={this.handleChange.bind(this, "OldPassword")} />
                                            </div>
                                            <div class="form-group">
                                                <label for="lblNewPassword">New Password</label>
                                                <InputBox
                                                    Class="form-control form-control-sm"
                                                    Id="txtNewPassword"
                                                    Type="password"
                                                    PlaceHolder="New Password"
                                                    Value={this.state.NewPassword}
                                                    onChange={this.handleChange.bind(this, "NewPassword")} />
                                            </div>
                                            <div class="form-group">
                                                <label for="lblConfirmPassword">Confirm Password</label>
                                                <InputBox
                                                    Class="form-control form-control-sm"
                                                    Id="txtConfirmPassword"
                                                    Type="password"
                                                    PlaceHolder="Confirm Password"
                                                    Value={this.state.ConfirmPassword}
                                                    onChange={this.handleChange.bind(this, "ConfirmPassword")} />
                                            </div>
                                            <div class="modal-footer">
                                                <Button
                                                    Id="btnSave"
                                                    Text="Save"
                                                    Action={this.handleChangePasswordSave.bind(this)}
                                                    ClassName="btn btn-primary" />
                                                {/* <Button
                                                    Id="btnCancel"
                                                    Text="Cancel"
                                                    Action={this.handleChangePasswordCancel}
                                                    ClassName="btn btn-secondary" /> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
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

export default withRouter(connect(mapStoreToprops, mapDispatchToProps)(ChangePassword));