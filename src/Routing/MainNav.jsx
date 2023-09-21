import React, { Fragment } from 'react';
import ReactRouter from './ReactRouter.jsx';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";
import TicketingDashboard from '../MainComponents/Ticket/TicketingDashboard';
import DepartmentHome from '../MainComponents/Department/DepartmentHome';
import Department from '../pages/Department';
import Home from '../MainComponents/Home/Home';
import User from '../pages/User';
import PropertyMember from '../pages/PropertyMember';
import UserProfile from '../pages/UserProfilePage';
import ChangePassword from '../MainComponents/ChangePassword/ChangePassword';
import PropertyDashboard from '../pages/Dashboards/PropertyDashboard';
import DropDownList from '../ReactComponents/SelectBox/DropdownList'
import ComplainManagement from '../pages/ComplainManagement';
import PropertyMaster from '../pages/PropertyMaster'
import PropertyDetailsPage from '../pages/PropertyDetailsPage'
import Parking from '../pages/Parking'
import ParkingZonePage from '../pages/ParkingZonePage'
import TicketCategoriesPage from '../pages/TicketCategoriesPage'
import PropertyTower from '../pages/PropertyTowerPage'
import PropertyAssignmentPage from '../pages/PropertyAssignmentPage';
import ParkingDetailsPage from '../pages/ParkingDetailsPage'; 
import FacilityMemberPage from '../pages/FacilityMemberPage';
import ParkingAssignmentPage from '../pages/ParkingAssignmentsPage';
import EmergencyContactPage from '../pages/EmergencyContactPage';
import LayoutDataProvider from './LayoutDataProvider.js'
import * as appCommon from '../Common/AppCommon.js';
//redux
import departmentActions from '../redux/department/action';
import { connect } from 'react-redux';
import { promiseWrapper } from '../utility/common';
import { bindActionCreators } from 'redux';
import AmenitiesAssignmentPage from '../pages/AmenitiesAssignmentPage';
import AmenitiesBookingPage from '../pages/AmenitiesBookingPage';
import AmenitiesMasterPage from '../pages/AmenitiesMasterPage';
import ManageResidentOwnersPage from '../pages/ManageResidentOwnersPage';
import ManageFlatPage from '../pages/ManageFlatPage';
import DocumentTypeMasterPage from '../pages/DocumentTypeMasterPage'
import AssetsMasterPage from '../pages/AssetsMasterPage'
import EscalationGroupPage from '../pages/EscalationGroupPage';
import EscalationMatrixPage from '../pages/EscalationMatrixPage'
import NoticeBoardPage from '../pages/NoticeBoardPage'
import PropertyEmployees from '../pages/PropertyEmployees'
import PendingApprovalPage from '../pages/PendingApprovalPage'
import KanbanBoardPage from '../pages/KanbanBoardPage'
import EventCalendarPage from '../pages/EventCalendarPage'
import TaskEventCalendarPage from '../pages/TaskEventCalendarPage.jsx';
import PropertyOwnerPage from '../pages/PropertyOwnerPage.jsx';
import PropertyTenatsPage from '../pages/PropertyTenatsPage.jsx';
import RwaMemberPage from '../pages/RwaMemberPage';
import CalendarCategoryPage from '../pages/CalendarCategoryPage';
import CalendarSubCategoryPage from '../pages/CalendarSubCategoryPage';
import EventApproval from '../pages/EventApproval.jsx';
import PlannerTaskPage from '../pages/PlannerTaskPage.jsx';
import LoginPage from '../MainComponents/LoginPage.jsx';
import PlannerTaskAuditPage from '../pages/PlannerTaskAuditPage.jsx';
import KYCPage from '../pages/KYCPage.jsx';
import AttendanceRecordsPage from '../pages/AttendanceRecordsPage.jsx';
import EmployeePage from '../pages/EmployeePage.jsx';
import GuardMasterPage from '../pages/GuardMasterPage';
import ResidentEventPage from '../pages/ResidentEventPage.jsx';
import PlannerTaskStatus from '../pages/PlannerTaskStatus.jsx';
import GuardListPage from '../pages/GuardListPage.jsx';
import AssetTrackingPage from '../pages/AssetTrackingPage.jsx';
import AttendanceSummaryPage from '../pages/AttendanceSummaryPage.jsx';



var currentpropertyid = 0;
class MainNav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            UserName: 'Test User',
            UserProfileImg: 'https://ufirm.in/assets/cdn/public/profileimg/default.jpg',
            PropertyData: [],
            userRoles: null
        }
        this.comdbprovider = new LayoutDataProvider();
    }

    loaduserRole() {
        // debugger
        this.comdbprovider.getUserRoles().then(
            (resp) => {
                if (resp && resp.ok && resp.status == 200) {
                    resp.json().then(rData => {
                        // console.log(rData);
                        this.onUpdateUserRole(rData);
                        this.setState({ userRoles: rData })
                    });
                }

            });
    }

    loadProperty() {

        this.comdbprovider.getUserAssignedproperty().then(
            resp => {
                if (resp && resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        rData = appCommon.changejsoncolumnname(rData, "id", "Value");
                        rData = appCommon.changejsoncolumnname(rData, "text", "Name");
                        this.setState({ PropertyData: rData }, () => {
                            if (rData.length == 1) {
                                this.onPropertyChanged(rData[0].Value);
                            }

                
                        });
                    });
                }

            });
    }

    componentDidMount() {
        // var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJUYW55YSIsImxhc3RuYW1lIjoiTWlzaHJhIiwiaW5mb190IjoiM2lFZXgrUWMwMXFGTElJdTdQRFVMbms0dFllNXdkNHc0ZU5saW44bHQwaTNRRHNZdkF5THBTMHBIRWkxTTFDenN5eVRLL3h5U0dUUW5NT0VtYmRkZWc3ZVVYeFUwTFZsRE00dVAwRElGb0UyTEIwMjAyeGw0WkhlS1JuT2VtK3VsZDhFZ2JMTC9GSjU4MFBMVFgveDI0Ly9GWWt3dzlwbWszK21MVXZicGNUaGh1THJLQWxpbU9qSjlQMklOUVVRSE9zTU9rOWZKcnZaQ0VnUExPblNqWjVtZ1MzNklZUGVzcTQrMDNPZzVhY2oyem1QN0R4clloTmVYNGtNMVJHZ3VWdWtPTmZUejQ4aENNOFpJcWRVMUE9PSIsIm5iZiI6MTY4NDczNjYzOSwiZXhwIjoxNzE2MzU5MDM5LCJpYXQiOjE2ODQ3MzY2Mzl9.JJwXBDngk7dfbs1kMqxbotgHj7uN0AN32m2Qe57RtAA";
        var token = window.sessionStorage.getItem("userinfo_key")
        if (window.sessionStorage.getItem("userinfo_key") == null) {
        if (token == null) {
            const timerId = setTimeout(() => {
                this.componentDidMount()
            }, 1000);
        }}
        else {
            this.loaduserRole();
            this.loadProperty();

            if (document.getElementById("app").getAttribute("profileimg") != null) {
                this.setState({ UserProfileImg: document.getElementById("app").getAttribute("profileimg") })
            }

            if (document.getElementById("app").getAttribute("username") != null) {
                this.setState({ UserName: document.getElementById("app").getAttribute("username") })
            }
        }

    }
    onPropertyChanged = (value) => {
        promiseWrapper(this.props.actions.updateproperty, { CompanyId: value }).then((data) => {
            // this.setState({ customerData: data.departmentModel, });
        });
        currentpropertyid = value
    }
    onUpdateUserRole = (value) => {
        promiseWrapper(this.props.actions.updateuserrole, { UserRole: value }).then((data) => {
            // this.setState({ customerData: data.departmentModel, });
        });
        //currentpropertyid = value;
    }
    render() {
        return (
            <Router>
                <div className="wrapper">
                    <nav className="main-header navbar navbar-expand navbar-dark navbar-primary">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <a className="nav-link" data-widget="pushmenu" href="#" role="button">
                                    <i className="fas fa-bars"></i>
                                </a>
                            </li>
                            {this.state.PropertyData.length == 1 &&
                                <li className="nav-item d-none d-sm-inline-block">
                                    <a href="#" className="nav-link">{this.state.PropertyData[0].Name}</a>
                                </li>
                            }
                        </ul>
                        <form className="form-inline ml-3">
                            {this.state.PropertyData.length > 1 &&
                                <div className="input-group input-group-sm">
                                    <DropDownList Id="ddlProperty"
                                        onSelected={this.onPropertyChanged.bind(this)}
                                        Options={this.state.PropertyData} />

                                </div>
                            }
                        </form>

                        <ul className="navbar-nav ml-auto">
                            <li className="nav-item dropdown">
                                <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                                    <a href="#" className="dropdown-item">
                                        <div className="media">
                                            <img src="../../dist/img/user1-128x128.jpg" alt="User Avatar" className="img-size-50 mr-3 img-circle"></img>
                                            <div className="media-body">
                                                <h3 className="dropdown-item-title">
                                                    Brad Diesel
                                                    <span className="float-right text-sm text-danger"><i className="fas fa-star"></i></span>
                                                </h3>
                                                <p className="text-sm">Call me whenever you can...</p>
                                                <p className="text-sm text-muted"><i className="far fa-clock mr-1"></i> 4 Hours Ago</p>
                                            </div>
                                        </div>
                                    </a>
                                    <div className="dropdown-divider"></div>
                                    <a href="#" className="dropdown-item">
                                        <div className="media">
                                            <img src="../../dist/img/user8-128x128.jpg" alt="User Avatar" className="img-size-50 img-circle mr-3"></img>
                                            <div className="media-body">
                                                <h3 className="dropdown-item-title">
                                                    John Pierce
                                                    <span className="float-right text-sm text-muted"><i className="fas fa-star"></i></span>
                                                </h3>
                                                <p className="text-sm">I got your message bro</p>
                                                <p className="text-sm text-muted"><i className="far fa-clock mr-1"></i> 4 Hours Ago</p>
                                            </div>
                                        </div>
                                    </a>
                                    <div className="dropdown-divider"></div>
                                    <a href="#" className="dropdown-item">
                                        <div className="media">
                                            <img src="../../dist/img/user3-128x128.jpg" alt="User Avatar" className="img-size-50 img-circle mr-3"></img>
                                            <div className="media-body">
                                                <h3 className="dropdown-item-title">
                                                    Nora Silvester
                                                    <span className="float-right text-sm text-warning"><i className="fas fa-star"></i></span>
                                                </h3>
                                                <p className="text-sm">The subject goes here</p>
                                                <p className="text-sm text-muted"><i className="far fa-clock mr-1"></i> 4 Hours Ago</p>
                                            </div>
                                        </div>00
                                    </a>
                                    <div className="dropdown-divider"></div>
                                    <a href="#" className="dropdown-item dropdown-footer">See All Messages</a>
                                </div>
                            </li>
                            <li className="nav-item dropdown">
                                <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                                    <span className="dropdown-item dropdown-header">15 Notifications</span>
                                    <div className="dropdown-divider"></div>
                                    <a href="#" className="dropdown-item">
                                        <i className="fas fa-envelope mr-2"></i> 4 new messages
                                        <span className="float-right text-muted text-sm">3 mins</span>
                                    </a>
                                    <div className="dropdown-divider"></div>
                                    <a href="#" className="dropdown-item">
                                        <i className="fas fa-users mr-2"></i> 8 friend requests
                                        <span className="float-right text-muted text-sm">12 hours</span>
                                    </a>
                                    <div className="dropdown-divider"></div>
                                    <a href="#" className="dropdown-item">
                                        <i className="fas fa-file mr-2"></i> 3 new reports
                                        <span className="float-right text-muted text-sm">2 days</span>
                                    </a>
                                    <div className="dropdown-divider"></div>
                                    <a href="#" className="dropdown-item dropdown-footer">See All Notifications</a>
                                </div>
                            </li>
                            <li className="nav-item">

                            </li>
                            {/* <li onLoad="setUserData();" className="nav-item dropdown"> */}
                            <li className="nav-item dropdown">
                                <a href="#" data-toggle="dropdown" className="dropdown-toggle nav-link dropdown-user-link">
                                    <span className="avatar avatar-online">
                                        <img src={this.state.UserProfileImg} className="rounded-circle" alt="Avatar" width="35" height="35"></img>
                                    </span>
                                    <span id="lblusername" className="user-name">{this.state.UserName}</span>
                                </a>
                                <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                                    <Link to="/Account/App/UserProfile" className="dropdown-item">
                                        <p>My Profile</p>
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                    <Link to="/Account/App/ChangePassword" className="dropdown-item">
                                        <p>Change Password </p>
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                    <a href="/Account/Logout" className="dropdown-item">
                                        Logout
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </nav>

                    <aside className="main-sidebar elevation-4 sidebar-light-primary">
                        <Link to="/" className="brand-link">
                            <img src="https://ufirm.in/assets/cdn/public/img/Ufirm-fabicon.png" alt="UFIRM Logo" className="brand-image"></img>
                            <span className="brand-text">
                                <img src="https://ufirm.in/assets/cdn/public/img/LogoShort.png" alt="UFIRM Logo" ></img>
                            </span>
                        </Link>
                        <div className="sidebar">
                            <nav className="mt-2">
                                <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">

                                    <li className="nav-item has-treeview">

                                        <a href="#" className="nav-link">
                                            <i className="nav-icon fas fa-tachometer-alt"></i>
                                            <p>
                                                Dashboard
                                                <i className="right fas fa-angle-left"></i>
                                            </p>
                                        </a>
                                        <ul className="nav nav-treeview">
                                            <li className="nav-item">
                                                <Link to="/" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Home</p>
                                                </Link>
                                            </li>
                                            {/* <li className="nav-item">
                                                <Link to="/Account/App/ticket" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p  >Ticket</p>
                                                </Link>
                                            </li> */}
                                        </ul>
                                    </li>
                                    {
                                        // this.state.userRoles && (this.state.userRoles.includes("Admin") || this.state.userRoles.includes("Property Manager") || this.state.userRoles.includes("Property Admin")) ?
                                            <li className="nav-item has-treeview">
                                                <a href="#" className="nav-link">
                                                    <i className="nav-icon fas fa-calendar"></i>
                                                    <p>
                                                        Planner<i className="right fas fa-angle-left"></i>
                                                    </p>
                                                </a>
                                                <ul className="nav nav-treeview">
                                                    {
                                                        // this.state.userRoles.includes("Admin") || this.state.userRoles.includes("Property Admin") ?
                                                            <Fragment>
                                                                <li className="nav-item">
                                                                    <Link to="/Account/App/CalendarCategory" className="nav-link">
                                                                        <i className=" fas fa-caret-right nav-icon"></i>
                                                                        <p>Category </p>
                                                                    </Link>
                                                                </li>
                                                                <li className="nav-item">
                                                                    <Link to="/Account/App/CalendarSubCategory" className="nav-link">
                                                                        <i className=" fas fa-caret-right nav-icon"></i>
                                                                        <p>Sub Category </p>
                                                                    </Link>
                                                                </li>
                                                                <li className="nav-item">
                                                                    <Link to="/Account/App/EventApproval" className="nav-link">
                                                                        <i className=" fas fa-caret-right nav-icon"></i>
                                                                        <p>Event Approval</p>
                                                                    </Link>
                                                                </li>
                                                            </Fragment>
                                                            // : null
                                                    }

                                                    <li className="nav-item">
                                                        <Link to="/Account/App/EventCalendar" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Events</p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/PlannerTask" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Tasks</p>
                                                        </Link>
                                                    </li>
                                                    {/* <li className="nav-item">
                                                        <Link to="/Account/App/PlannerTaskAudit" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Tasks Audit</p>
                                                        </Link>
                                                    </li> */}
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/TaskEventsCalender" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Tasks Events</p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/ResidentEvents" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Resident Events</p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/TaskStatus" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Task Status</p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/GuardList" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Spot Visit Details</p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/AssetTracking" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Asset Tracking</p>
                                                        </Link>
                                                    </li>
                                                    {/* <li className="nav-item">
                                                        <Link to="/Account/App/AttendanceSummary" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Attendance Summary</p>
                                                        </Link>
                                                    </li> */}
                                                </ul>
                                            </li>
                                            // : null
                                    }

                                    {
                                        // this.state.userRoles && (this.state.userRoles.includes("Admin") || this.state.userRoles.includes("Property Manager")) ?
                                            <li className="nav-item has-treeview">
                                                <a href="#" className="nav-link">
                                                    <i className="nav-icon fas fa-hotel"></i>
                                                    <p>
                                                        Property Management
                                                        <i className="right fas fa-angle-left"></i>
                                                    </p>
                                                </a>
                                                <ul className="nav nav-treeview">
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/ManageResidentOwners" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Manage Resident/Owners</p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/RwaMember" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Rwa Member</p>
                                                        </Link>
                                                    </li>

                                                    <li className="nav-item">
                                                        <Link to="/Account/App/Notice" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p  >Notice Bord</p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/EmergencyContact" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Emergency Contact </p>
                                                        </Link>
                                                    </li>
                                                    {/* <li className="nav-item">
                                                <Link to="/Account/App/PendingApproval" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Pending Approval</p>
                                                </Link>
                                            </li> */}
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/Employeeassignment" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Employee Assignment</p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item ">
                                                        <Link to="/Account/App/PropertyMember" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Rent Agreement</p>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </li> 
                                            // : null
                                    }

                                    {
                                        // this.state.userRoles && (this.state.userRoles.includes("Admin") || this.state.userRoles.includes("Property Manager")) ?

                                            <li className="nav-item has-treeview">
                                                <a href="#" className="nav-link">
                                                    <i className="nav-icon fas fa-address-book"></i>
                                                    <p>
                                                        Facility Management<i className="right fas fa-angle-left"></i>
                                                    </p>
                                                </a>
                                                <ul className="nav nav-treeview">

                                                    <li className="nav-item">
                                                        <Link to="/Account/App/FacilityMember" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Facility Member </p>
                                                        </Link>
                                                    </li>
                                                    {/* <li className="nav-item">
                                        <Link to="/Account/App/FacilityMember" className="nav-link">
                                            <i className=" fas fa-caret-right nav-icon"></i>
                                            <p>In Out Register</p>
                                        </Link>
                                    </li> */}
                                                    {/* <li className="nav-item">
                                        <Link to="/Account/App/FacilityMember" className="nav-link">
                                            <i className=" fas fa-caret-right nav-icon"></i>
                                            <p >Attendance</p>
                                        </Link>
                                    </li> */}
                                                    {/* <li className="nav-item">
                                        <Link to="/Account/App/FacilityMember" className="nav-link">
                                            <i className=" fas fa-caret-right nav-icon"></i>
                                            <p>Get Pass</p>
                                        </Link>
                                    </li> */}

                                                </ul>
                                            </li>
                                            // : null
                                    }

                                    {
                                        // this.state.userRoles && (this.state.userRoles.includes("Admin") || this.state.userRoles.includes("Property Manager")) ?
                                            <li className="nav-item has-treeview">
                                                <a href="#" className="nav-link">
                                                    <i className="nav-icon fas fa-car"></i>
                                                    <p>
                                                        Parking Management<i className="right fas fa-angle-left"></i>
                                                    </p>
                                                </a>
                                                <ul className="nav nav-treeview">

                                                    <li className="nav-item">
                                                        <Link to="/Account/App/ParkingZone" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Parking Zone </p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/ParkingDetails" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Parking Details </p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/ParkingAssignment" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Parking Assignment </p>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </li>
                                            // : null
                                    }


                                    {/* <li className="nav-item has-treeview">
                                        <a href="#" className="nav-link">
                                            <i className="nav-icon fas fa-user-tie"></i>
                                            <p>
                                                Property Members <i className="right fas fa-angle-left"></i>
                                            </p>
                                        </a>
                                        <ul className="nav nav-treeview">
                                            <li className="nav-item">
                                                <Link to="/Account/App/ManageResidentOwners" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Manage Resident/Owners</p>
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link to="/Account/App/ManageFlat" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Manage Flats</p>
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link to="/Account/App/PropertyMember" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Change Ownership</p>
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link to="/Account/App/PropertyMember" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Manage Flat/Property</p>
                                                </Link>
                                            </li>

                                            <li className="nav-item">
                                                <Link to="/Account/App/PropertyMember" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Property Member</p>
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link to="/Account/App/PropertyOwner" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Property Owner</p>
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link to="/Account/App/Tenant" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Property Tenant</p>
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link to="/Account/App/PropertyAssignment" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Property Assignment </p>
                                                </Link>
                                            </li>
                                            <li className="nav-item ">
                                                <Link to="/Account/App/PropertyMember" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Rent Agreement</p>
                                                </Link>
                                            </li>
                                        </ul>
                                    </li> */}
                                    {
                                        // this.state.userRoles && this.state.userRoles.includes("Admin") ?
                                            <li className="nav-item has-treeview">
                                                <a href="#" className="nav-link">
                                                    <i className="nav-icon fas fa-cog"></i>
                                                    <p>
                                                        Master Settings<i className="right fas fa-angle-left"></i>
                                                    </p>
                                                </a>
                                                <ul className="nav nav-treeview">
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/DocumentType" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Document Type</p>
                                                        </Link>
                                                    </li>
                                                </ul>
                                                <ul className="nav nav-treeview">
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/AssetsMaster" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Assets Master</p>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </li>
                                            // : null
                                    }

                                    {
                                        // this.state.userRoles && this.state.userRoles.includes("Admin") ?
                                            <li className="nav-item has-treeview">
                                                <a href="#" className="nav-link">
                                                    <i className="nav-icon fas fa-user-cog"></i>
                                                    <p>
                                                        User Management<i className="right fas fa-angle-left"></i>
                                                    </p>
                                                </a>
                                                <ul className="nav nav-treeview">

                                                    <li className="nav-item">
                                                        <Link to="/Account/App/user" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>User </p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/department" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Department </p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/KYC" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p >KYC</p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/AttendanceRecords" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p >Attendance Records</p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/Employee" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p >Employee Master</p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/Guard" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p >Guard Master</p>
                                                        </Link>
                                                    </li>


                                                </ul>
                                            </li>
                                            // : null
                                    }

                                    {
                                        // this.state.userRoles && (this.state.userRoles.includes("Admin") || this.state.userRoles.includes("Property Manager")) ?
                                            <li className="nav-item has-treeview">
                                                <a href="#" className="nav-link">
                                                    <i className="nav-icon fas fa-building"></i>
                                                    <p>
                                                        Property Setttings
                                                        <i className="fas fa-angle-left right"></i>

                                                    </p>
                                                </a>
                                                <ul className="nav nav-treeview" style={{ display: 'none' }}>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/PropertyMaster" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Property Master </p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/PropertyTower" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Property Towers </p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/PropertyDetails" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Property Details </p>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </li>
                                            // : null
                                    }
                                    {
                                        // this.state.userRoles && (this.state.userRoles.includes("Admin") || this.state.userRoles.includes("Property Manager")) ?
                                            <li className="nav-item has-treeview">
                                                <a href="#" className="nav-link">
                                                    <i className="nav-icon fas fa-ticket-alt"></i>
                                                    <p>
                                                        Ticket Management
                                                        <i className="fas fa-angle-left right"></i>
                                                        {/* <span className="badge badge-info right">6</span> */}
                                                    </p>
                                                </a>


                                                <ul className="nav nav-treeview" style={{ display: 'none' }}>
                                                    {/* <li className="nav-item">
                                                        <Link to="/Account/App/Complain" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p  >Open Tickets </p>
                                                        </Link>
                                                    </li> */}

                                                    <li className="nav-item">
                                                        <Link to="/Account/App/TicketComplains" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p >Complains Management</p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/TicketCategories" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Categories</p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/EscalationGroup" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p  >Escalation Group</p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/EscalationMatrix" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p  >Complain Matrix</p>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </li>
                                            // : null
                                    }

                                    {
                                        // this.state.userRoles && (this.state.userRoles.includes("Admin") || this.state.userRoles.includes("Property Manager")) ?
                                            <li className="nav-item has-treeview">
                                                <a href="#" className="nav-link">
                                                    <i className="nav-icon fas fa-dumbbell"></i>
                                                    <p>
                                                        Amenities Settings<i className="right fas fa-angle-left"></i>
                                                    </p>
                                                </a>
                                                <ul className="nav nav-treeview">
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/AmenitiesMaster" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Amenities Master </p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/AmenitiesAssignment" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p >Amenities Assignment</p>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-item">
                                                        <Link to="/Account/App/AmenitiesBooking" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p >Amenities Booking</p>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </li>
                                            // : null
                                    }
                                </ul>
                            </nav>
                        </div>
                    </aside>
                    <Switch>
                        <Route
                            exact
                            path="/"
                            render={() => <Redirect to="/Account/App" />}
                        />

                        <Route exact path="/Account/App" component={Home} />

                        <Route exact path="/Account/App/ticket">
                            <TicketingDashboard />
                        </Route>
                        <Route path="/Account/App/department">
                            <Department />
                        </Route>
                        <Route path="/Account/App/ChangePassword">
                            <ChangePassword />
                        </Route>
                        <Route path="/Account/App/team">
                        </Route>
                        <Route path="/Account/App/EmergencyContact">
                            <EmergencyContactPage />
                        </Route>
                        <Route path="/Account/App/user">
                            <User />
                        </Route>
                        <Route path="/Account/App/UserProfile">
                            <UserProfile />
                        </Route>
                        <Route path="/Account/App/FacilityMember">
                            <FacilityMemberPage />
                        </Route>
                        <Route path="/Account/App/PropertyMember">
                            <PropertyMember />
                        </Route>
                        <Route path="/Account/App/PropertyOwner">
                            <PropertyOwnerPage />
                        </Route>
                        <Route path="/Account/App/Tenant">
                            <PropertyTenatsPage />
                        </Route>
                        {/* <Route path="/Account/App/Home">
                            <PropertyDashboard />
                        </Route> */}

                        <Route path="/Account/App/Complain">
                            <ComplainManagement />
                        </Route>
                        <Route path="/Account/App/PropertyMaster">
                            <PropertyMaster />
                        </Route>
                        <Route path="/Account/App/PropertyDetails">
                            <PropertyDetailsPage />
                        </Route>
                        <Route path="/Account/App/ParkingDetails">
                            <ParkingDetailsPage />
                        </Route>
                        <Route path="/Account/App/ParkingZone">
                            <ParkingZonePage />
                        </Route>
                        <Route path="/Account/App/TicketCategories">
                            <TicketCategoriesPage />
                        </Route>
                        <Route path="/Account/App/PropertyTower">
                            <PropertyTower />
                        </Route>
                        <Route path="/Account/App/PropertyAssignment">
                            <PropertyAssignmentPage />
                        </Route>
                        <Route path="/Account/App/ParkingAssignment">
                            <ParkingAssignmentPage />
                        </Route>
                        <Route path="/Account/App/AmenitiesMaster">
                            <AmenitiesMasterPage />
                        </Route>
                        <Route path="/Account/App/AmenitiesAssignment">
                            <AmenitiesAssignmentPage />
                        </Route>
                        <Route path="/Account/App/AmenitiesBooking">
                            <AmenitiesBookingPage />
                        </Route>
                        <Route path="/Account/App/KYC">
                            <KYCPage />
                        </Route>
                        <Route path="/Account/App/Employee">
                            <EmployeePage />
                        </Route>
                        <Route path="/Account/App/Guard">
                            <GuardMasterPage />
                        </Route>
                        <Route path="/Account/App/AttendanceRecords">
                            <AttendanceRecordsPage />
                        </Route>
                        <Route path="/Account/App/ManageResidentOwners">
                            <ManageResidentOwnersPage />
                        </Route>
                        <Route path="/Account/App/RwaMember">
                            <RwaMemberPage />
                        </Route>
                        <Route path="/Account/App/ManageFlat">
                            <ManageFlatPage />
                        </Route>
                        <Route path="/Account/App/DocumentType">
                            <DocumentTypeMasterPage />
                        </Route>
                        <Route path="/Account/App/AssetsMaster">
                            <AssetsMasterPage />
                        </Route>
                        <Route path="/Account/App/EscalationGroup">
                            <EscalationGroupPage />
                        </Route>
                        <Route path="/Account/App/EscalationMatrix">
                            <EscalationMatrixPage />
                        </Route>
                        <Route path="/Account/App/Notice">
                            <NoticeBoardPage />
                        </Route>
                        <Route path="/Account/App/Employeeassignment">
                            <PropertyEmployees />
                        </Route>
                        <Route path="/Account/App/PendingApproval">
                            <PendingApprovalPage />
                        </Route>
                        <Route path="/Account/App/TicketComplains">
                            <KanbanBoardPage />
                        </Route>
                        <Route path="/Account/App/EventCalendar">
                            <EventCalendarPage />
                        </Route>
                        <Route path="/Account/App/CalendarCategory">
                            <CalendarCategoryPage />
                        </Route>
                        <Route path="/Account/App/CalendarSubCategory">
                            <CalendarSubCategoryPage />
                        </Route>
                        <Route path="/Account/App/EventApproval">
                            <EventApproval />
                        </Route>
                        <Route path="/Account/App/PlannerTask">
                            <PlannerTaskPage />
                        </Route>
                        <Route path="/Account/App/PlannerTaskAudit">
                            <PlannerTaskAuditPage/>
                        </Route>
                        <Route path="/Account/App/TaskEventsCalender">
                            <TaskEventCalendarPage />
                        </Route>
                        <Route path="/Account/App/ResidentEvents">
                            <ResidentEventPage />
                        </Route>
                        <Route path="/Account/App/TaskStatus">
                            <PlannerTaskStatus />
                        </Route>
                        <Route path="/Account/App/AssetTracking">
                            <AssetTrackingPage />
                        </Route>
                        <Route path="/Account/App/GuardList">
                            <GuardListPage />
                        </Route>
                        {/* <Route path="/Account/App/AttendanceSummary">
                            <AttendanceSummaryPage />
                        </Route> */}
                    </Switch>
                    <footer className="main-footer">
                        <div className="float-right d-none d-sm-block">
                            <b>Version</b> 3.0.3-pre
                        </div>
                        <strong>Copyright &copy; 2020-2021 <a href="http://www.ufirm.in">Ufirm.in</a>.</strong> All rights reserved.
                    </footer>
                    <aside className="control-sidebar control-sidebar-dark">
                    </aside>
                </div>
            </Router>
        );
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
export default connect(mapStoreToprops, mapDispatchToProps)(MainNav);