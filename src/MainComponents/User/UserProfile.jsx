import React from 'react';
import departmentActions from '../../redux/department/action';
import { connect } from 'react-redux';
import { promiseWrapper } from '../../utility/common';
import { bindActionCreators } from 'redux';
import Button from '../../ReactComponents/Button/Button.jsx';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import TextAreaBox from '../../ReactComponents/TextAreaBox/TextAreaBox.jsx';
import axios from 'axios';
import UserBL from '../../ComponentBL/UserBL';
import * as appCommon from '../../Common/AppCommon';
import { VALIDATION_ERROR } from '../../Contants/Common.js';
import UrlProvider from "../../Common/ApiUrlProvider.js";
import { ToastContainer, toast } from 'react-toastify';
import ApiProvider from './DataProvider.js';
import ImageUploader from 'react-images-upload';
//import  { Redirect } from 'react-router-dom'

const $ = window.$;
const userBL = new UserBL();
class UserProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            pictures: null,
            role: "",
            PageMode: "Edit",
            selectedFile: undefined,
        };
    }

    componentDidMount() {
        userBL.CreateValidator();
        this.getUser("0");
        this.ApiProviderr = new ApiProvider();
    }
    onDrop=(pictureFiles, pictureDataURLs)=> {
        this.setState({ pictures: pictureFiles });
    }
    onAddressChanged(){
        
    }

    getUser(userId) {
        promiseWrapper(this.props.actions.fetchUserById, { UserId: userId }).then((data) => {
            this.setState({ data: data });
            let role = "";
            data.userRoleList.map((person, index) => (
                role = " " + person.userRoleName + "," + role
            ));
            this.setState({ role: role.replace(/,\s*$/, "") });
        });
    }


    // handleCancel = () => {
    //     
    //     //<Redirect to='/Account/App'  />
    //     // this.props.myExample;
    //     // <Link to="/Account/App/ChangePassword" className="dropdown-item">
    //     //     <p>Change Password </p>
    //     // </Link>
    // };
    handleCancel=()=>{
        this.setState({ PageMode: "Edit" }); 
    }

    handleUserProfileSave = () => {
        
        userBL.CreateValidator();
        if (this.state.PageMode == "Edit") {
            this.setState({ PageMode: "Save" });
        } else {
            if (this.state.data.firstName != $('#txtFirstName').val() ||
                this.state.data.lastName != $('#txtLastName').val() ||
                this.state.data.address != $('#txtAddress').val() || this.state.pictures != null){
                
                let url = new UrlProvider().MainUrl;
                if (userBL.ValidateControls() == "") {
                    
                    const formData = new FormData();
                    formData.append('imageFile', this.state.pictures != null ? this.state.pictures[0] : null);
                    formData.append('userId', this.state.data.userId);
                    formData.append('firstName', $('#txtFirstName').val());
                    formData.append('lastName', $('#txtLastName').val());
                    formData.append('address', $('#txtAddress').val());
                    formData.append('files', this.state.selectedFile);
                    formData.append('document',JSON.stringify(this.state.data.userDocumentList));
                    this.ApiProviderr.saveUser(formData)
                        .then(res => {
                            if (res.data <= 0) {
                            }
                            else {
                                this.getUser(this.state.data.userId);
                                appCommon.showtextalert("User Updated Successfully", "", "success");
                                this.setState({ PageMode: "Edit" });
                            }
                        });
                        // axios.post(url + `Master/User/Save`, formData, {
                        //     headers: {
                        //         'Content-Type': 'multipart/form-data'
                        //     }
                        // }).then(res => {
                        //     if (res.data <= 0) {
                        //     }
                        //     else {
                        //         this.getUser(this.state.data.userId);
                        //         appCommon.showtextalert("User Updated Successfully", "", "success");
                        //         this.setState({ PageMode: "Edit" });
                        //     }
                        // });
                } else {
                    
                    appCommon.ShownotifyError(VALIDATION_ERROR);
                }
            } else {
                this.setState({ PageMode: "Edit" });
                this.setState({ pictures: null });
            }
        }
    }



    render() {
        return (
            <div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-3">

                                {/* <!-- Profile Image --> */}
                                <div className="card card-primary card-outline">
                                    <div className="card-body box-profile">
                                        <div className="text-center">
                                            {this.state.PageMode != "Edit" && 
                                        <ImageUploader
                                                        ClassName="ImageView"
                                                        singleImage={true}
                                                        //withIcon={true}
                                                        withIcon={false}
                                                        withPreview={true}
                                                        label=""
                                                        // label="Max file size: 5mb, accepted: jpg, png, svg"
                                                        buttonText="Upload Images"
                                                        onChange={this.onDrop}
                                                        imgExtension={[".jpg", ".png", ".svg"]}
                                                        maxFileSize={5242880}
                                                        fileSizeError=" file size is too big"
                                                    />
                                                }
                                            <img className="profile-user-img img-fluid img-circle" src={this.state.data.profileImageUrl!=null ? this.state.data.profileImageUrl : "https://ufirm.in/assets/cdn/public/profileimg/default.jpg"} alt="User profile picture"></img>
                                        </div>

                                        <h3 className="profile-username text-center">{this.state.data.firstName} {this.state.data.lastName}</h3>

                                        <p className="text-muted text-center">{this.state.role}</p>

                                        <ul className="list-group list-group-unbordered mb-3">
                                            <li className="list-group-item">
                                                <b>Employee Code</b> <a className="float-right">{this.state.data.empCode}</a>
                                            </li>
                                            <li className="list-group-item">
                                                <b>Branch</b> <a className="float-right">{this.state.data.branchName}</a>
                                            </li>
                                            <li className="list-group-item">
                                                <b>Last Login</b> <a className="float-right">{this.state.data.lastLoginDateTime}</a>
                                            </li>
                                        </ul>
                                    </div>
                                    {/* <!-- /.card-body --> */}
                                </div>
                                {/* <!-- /.card --> */}

                                {/* <!-- About Me Box --> */}

                                {/* <!-- /.card --> */}
                            </div>



                            {/* <!-- /.col --> */}
                            <div className="col-md-9">
                                <div className="card">

                                    {/* <!-- /.card-header --> */}
                                    <div className="card-body">

                                        <div className="modal-body">
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <div className="form-group">
                                                        <label for="lbFirstName">Fist Name</label>
                                                        {this.state.PageMode == "Edit" &&
                                                            <div className="dummyBox">
                                                                {this.state.data.firstName}
                                                            </div>
                                                        }
                                                        {this.state.PageMode == "Save" &&
                                                        <InputBox Id="txtFirstName"
                                                        PlaceHolder="First Name"
                                                        Value={this.state.data.firstName}
                                                        Class="form-control form-control-sm"
                                                    />
                                                            // <InputBox Id="txtFirstName"
                                                            //     Value={this.state.data.firstName}
                                                            //     PlaceHolder="First Name"
                                                            //     Class="form-control form-control-sm" />
                                                        }
                                                    </div>
                                                </div>
                                                <div className="col-sm-6">
                                                    <div className="form-group">
                                                        <label for="lbLastName">Last Name</label>
                                                        {this.state.PageMode == "Edit" &&
                                                            <div className="dummyBox">
                                                                {this.state.data.lastName}
                                                            </div>
                                                        }
                                                        {this.state.PageMode == "Save" &&
                                                            <InputBox Id="txtLastName"
                                                                Value={this.state.data.lastName}
                                                                PlaceHolder="Last Name"
                                                                Class="form-control form-control-sm" />
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <div className="form-group">
                                                        <label for="lbEmailAddress">Email Address</label>
                                                        <div className="dummyBox">
                                                            {this.state.data.emailAddress}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6">
                                                    <div className="form-group">
                                                        <label for="lbConatctNumber">Mobile Number</label>
                                                        <div className="dummyBox">
                                                            {this.state.data.contactNumber}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                            <div className="col-sm-6">
                                                    <div className="form-group">
                                                        <label for="lbDepartment">Department</label>
                                                        <div className="dummyBox">
                                                            {this.state.data.departmentName}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6">
                                                    <div className="form-group">
                                                        <label for="lbAddress">Address</label>
                                                        {this.state.PageMode == "Edit" &&
                                                            <div className="dummyAddressBox">
                                                                {this.state.data.address}
                                                            </div>
                                                        }
                                                        {this.state.PageMode == "Save" &&
                                                            <TextAreaBox Id="txtAddress"
                                                                onChange={this.onAddressChanged.bind(this)} 
                                                                Value={this.state.data.address}
                                                                PlaceHolder="Address"
                                                                ClassName="form-control form-control-sm" />
                                                        }
                                                    </div>
                                                </div>
                                                
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <Button
                                                Id="btnSaveEdit"
                                                Text={this.state.PageMode}
                                                Action={this.handleUserProfileSave.bind(this)}
                                                ClassName="btn btn-success" />
                                                  <Button
                                                Id="btnCancle"
                                                Text="Cancel"
                                                Action={this.handleCancel.bind(this)}
                                                ClassName="btn btn-primary" />
                                            {/* <Button
                                                Id="btnCancel"
                                                Text="Cancel"
                                                Action={this.handleCancel.bind(this)}
                                                ClassName="btn btn-secondary" /> */}
                                        </div>
                                    </div>
                                    {/* <!-- /.card-body --> */}
                                </div>
                                {/* <!-- /.nav-tabs-custom --> */}
                            </div>
                            {/* <!-- /.col --> */}
                        </div>
                        {/* <!-- /.row --> */}
                    </div>
                    {/* <!-- /.container-fluid --> */}
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
        );
    }
}
function mapStoreToprops(state, props) {
    return {}
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentActions, dispatch);
    return { actions };
}

export default connect(mapStoreToprops, mapDispatchToProps)(UserProfile);