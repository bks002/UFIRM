import React, { Fragment } from "react";
import {BrowserRouter as Router,Switch,Route,Link,Redirect,} from "react-router-dom";
import TicketingDashboard from "../MainComponents/Ticket/TicketingDashboard";
import Department from "../pages/Department";
import Home from "../MainComponents/Home/Home";
import User from "../pages/User";
import PropertyMember from "../pages/PropertyMember";
import UserProfile from "../pages/UserProfilePage";
import ChangePassword from "../MainComponents/ChangePassword/ChangePassword";
import DropDownList from "../ReactComponents/SelectBox/DropdownList";
import ComplainManagement from "../pages/ComplainManagement";
import PropertyMaster from "../pages/PropertyMaster";
import PropertyDetailsPage from "../pages/PropertyDetailsPage";
import ParkingZonePage from "../pages/ParkingZonePage";
import TicketCategoriesPage from "../pages/TicketCategoriesPage";
import PropertyTower from "../pages/PropertyTowerPage";
import PropertyAssignmentPage from "../pages/PropertyAssignmentPage";
import ParkingDetailsPage from "../pages/ParkingDetailsPage";
import FacilityMemberPage from "../pages/FacilityMemberPage";
import ParkingAssignmentPage from "../pages/ParkingAssignmentsPage";
import EmergencyContactPage from "../pages/EmergencyContactPage";
import LayoutDataProvider from "./LayoutDataProvider.js";
import * as appCommon from "../Common/AppCommon.js";
import Notification from "../MainComponents/Notification Center/Notification.jsx";
//redux
import departmentActions from "../redux/department/action";
import { connect } from "react-redux";
import { promiseWrapper } from "../utility/common";
import { bindActionCreators } from "redux";
import AmenitiesAssignmentPage from "../pages/AmenitiesAssignmentPage";
import AmenitiesBookingPage from "../pages/AmenitiesBookingPage";
import AmenitiesMasterPage from "../pages/AmenitiesMasterPage";
import ManageResidentOwnersPage from "../pages/ManageResidentOwnersPage";
import ManageFlatPage from "../pages/ManageFlatPage";
import DocumentTypeMasterPage from "../pages/DocumentTypeMasterPage";
import AssetsMasterPage from "../pages/AssetsMasterPage";
import CheckInCheckOut from "../pages/checkIn-checkOutPage.jsx";
import RentalAssets from "../pages/RentalAssets.jsx";
import CategoryPage from "../MainComponents/Inventory/CategoryPage.jsx";
import VendorPage from "../MainComponents/Inventory/VendorPage.jsx";
import EscalationGroupPage from "../pages/EscalationGroupPage";
import EscalationMatrixPage from "../pages/EscalationMatrixPage";
import NoticeBoardPage from "../pages/NoticeBoardPage";
import PropertyEmployees from "../pages/PropertyEmployees";
import PendingApprovalPage from "../pages/PendingApprovalPage";
import KanbanBoardPage from "../pages/KanbanBoardPage";
import EventCalendarPage from "../pages/EventCalendarPage";
import TaskEventCalendarPage from "../pages/TaskEventCalendarPage.jsx";
import PropertyOwnerPage from "../pages/PropertyOwnerPage.jsx";
import PropertyTenatsPage from "../pages/PropertyTenatsPage.jsx";
import RwaMemberPage from "../pages/RwaMemberPage";
import CalendarCategoryPage from "../pages/CalendarCategoryPage";
import CalendarSubCategoryPage from "../pages/CalendarSubCategoryPage";
import EventApproval from "../pages/EventApproval.jsx";
import PlannerTaskPage from "../pages/PlannerTaskPage.jsx";
import PlannerTaskAuditPage from "../pages/PlannerTaskAuditPage.jsx";
import KYCPage from "../pages/KYCPage.jsx";
import AttendanceRecordsPage from "../pages/AttendanceRecordsPage.jsx";
import EmployeePage from "../pages/EmployeePage.jsx";
import GuardMasterPage from "../pages/GuardMasterPage";
import ResidentEventPage from "../pages/ResidentEventPage.jsx";
import PlannerTaskStatus from "../pages/PlannerTaskStatus.jsx";
import GuardListPage from "../pages/GuardListPage.jsx";
import AssetTrackingPage from "../pages/AssetTrackingPage.jsx";
import PlannerTaskAnalysisPage from "../pages/PlannerTaskAnalysisPage.jsx";
import UploaderPage from "../pages/UploaderPage";
import CreateNewUser from "../MainComponents/NewUser/CreateNewUser";
import AddNewUser from "../MainComponents/NewUser/AddNewUser";
import ServiceRecords from "../pages/ManageAssets";
import PPMSpreadsheet from "../pages/PPMSpreadsheet";
import FrequencyMasterPage from "../pages/FrequencyMasterPage";
import ItemMasterPage from "../MainComponents/Inventory/itemPage";

var currentpropertyid;
class MainNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      UserName: "Test User",
      UserProfileImg:
        "https://ufirm.in/assets/cdn/public/profileimg/default.jpg",
      PropertyData: [],
      userRoles: null,
    };
    this.comdbprovider = new LayoutDataProvider();
  }
  loaduserRole() {
    this.comdbprovider.getUserRoles().then((resp) => {
      if (resp && resp.ok && resp.status === 200) {
        resp.json().then((rData) => {
          this.onUpdateUserRole(rData);
          this.setState({ userRoles: rData });
        });
      }
    });
  }

  loadProperty() {
    this.comdbprovider.getUserAssignedproperty().then((resp) => {
      if (resp && resp.ok && resp.status === 200) {
        return resp.json().then((rData) => {
          rData = appCommon.changejsoncolumnname(rData, "id", "Value");
          rData = appCommon.changejsoncolumnname(rData, "text", "Name");
          this.setState({ PropertyData: rData }, () => {
            if (rData.length === 1) {
              this.onPropertyChanged(rData[0].Value);
            }
          });
        });
      }
    });
  }

  componentDidMount() {
    var token ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJUYW55YSIsImxhc3RuYW1lIjoiTWlzaHJhIiwiaW5mb190IjoiM2lFZXgrUWMwMXFGTElJdTdQRFVMbms0dFllNXdkNHc0ZU5saW44bHQwaTNRRHNZdkF5THBTMHBIRWkxTTFDenN5eVRLL3h5U0dUUW5NT0VtYmRkZWc3ZVVYeFUwTFZsRE00dVAwRElGb0UyTEIwMjAyeGw0WkhlS1JuT2VtK3VsZDhFZ2JMTC9GSjU4MFBMVFgveDI0Ly9GWWt3dzlwbWszK21MVXZicGNUaGh1THJLQWxpbU9qSjlQMklOUVVRSE9zTU9rOWZKcnZaQ0VnUExPblNqWjVtZ1MzNklZUGVzcTQrMDNPZzVhY2oyem1QN0R4clloTmVYNGtNMVJHZ3VWdWtPTmZUejQ4aENNOFpJcWRVMUE9PSIsIm5iZiI6MTY4NDczNjYzOSwiZXhwIjoxNzE2MzU5MDM5LCJpYXQiOjE2ODQ3MzY2Mzl9.JJwXBDngk7dfbs1kMqxbotgHj7uN0AN32m2Qe57RtAA";
    //var token = window.sessionStorage.getItem("userinfo_key")

    if (token === null) {
        const timerId = setTimeout(() => {
            this.componentDidMount()
        }, 1000);
    }
    else {
    this.loaduserRole();
    this.loadProperty();

    if (document.getElementById("app").getAttribute("profileimg") != null) {
      this.setState({
        UserProfileImg: document
          .getElementById("app")
          .getAttribute("profileimg"),
      });
    }

    if (document.getElementById("app").getAttribute("username") != null) {
      this.setState({
        UserName: document.getElementById("app").getAttribute("username"),
      });
    }
    }
  }
  onPropertyChanged = (value) => {
    promiseWrapper(this.props.actions.updateproperty, {
      CompanyId: value,
    }).then((data) => {
      this.setState({ customerData: data.departmentModel, });
    });
    currentpropertyid = value;
  };
  onUpdateUserRole = (value) => {
    promiseWrapper(this.props.actions.updateuserrole, { UserRole: value }).then(
      (data) => {
        this.setState({ customerData: data.departmentModel, });
      }
    );
    currentpropertyid = value;
  };
  render() {
    return (
      <Router>
        <div className="wrapper">
          <nav className="main-header sticky-top navbar navbar-expand navbar-dark navbar-primary">
            <div className="navbar-nav">
                    <div className="nav-item">
                      <a
                        className="nav-link"
                        data-widget="pushmenu"
                        href="#"
                        role="button"
                      >
                        <i className="fas fa-bars"></i>
                      </a>
                    </div>
                   {this.state.PropertyData.length === 1 && (
                      <div className="nav-item d-none d-sm-inline-block">
                        <a href="#" className="nav-link">
                          {this.state.PropertyData[0].Name}
                        </a>
                      </div>
                    )}
            </div>
            <form className="form-inline ml-3">
              {this.state.PropertyData.length > 1 && (
                <div className="input-group input-group-sm">
                  <DropDownList
                    Id="ddlProperty"
                    onSelected={this.onPropertyChanged.bind(this)}
                    Options={this.state.PropertyData}
                  />
                </div>
              )}
            </form>
            <div className="navbar-nav  ml-auto ">
                <Notification/>
              <div className="nav-item dropdown">
                <a
                  href="#"
                  data-toggle="dropdown"
                  className="dropdown-toggle nav-link dropdown-user-link"
                >
                  <span className="avatar avatar-online">
                    <img
                      src={this.state.UserProfileImg}
                      className="rounded-circle"
                      alt="Avatar"
                      width="35"
                      height="35"
                    ></img>
                  </span>
                  <span id="lblusername" className="user-name">
                    {this.state.UserName}
                  </span>
                </a>
                <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                  <Link to="/UserProfile" className="dropdown-item">
                    <p>My Profile</p>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <Link
                    to="/ChangePassword"
                    className="dropdown-item"
                  >
                    <p>Change Password </p>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <a href="/Account/Logout" className="dropdown-item">
                    Logout
                  </a>
                </div>
              </div>
            </div>
          </nav>

          <aside className="main-sidebar elevation-4 sidebar-light-primary">
            <Link to="/" className="brand-link">
              <img
                src="https://ufirm.in/assets/cdn/public/img/Ufirm-fabicon.png"
                alt="UFIRM Logo"
                className="brand-image"
              ></img>
              <span className="brand-text">
                <img
                  src="https://ufirm.in/assets/cdn/public/img/LogoShort.png"
                  alt="UFIRM Logo"
                ></img>
              </span>
            </Link>
            
            <div className="sidebar ">
              <nav className="mt-2">
                <ul
                    className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu"
                    data-accordion="false">
                  <li className="nav-item has-treeview">
                    <a href="/" className="nav-link">
                      <i className="nav-icon fas fa-tachometer-alt"></i>
                      <p>
                        Dashboard
                      </p>
                    </a>
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
                              <Link
                                  to="/CalendarCategory"
                                  className="nav-link"
                              >
                                <i className=" fas fa-caret-right nav-icon"></i>
                                <p>Category </p>
                              </Link>
                            </li>
                            <li className="nav-item">
                              <Link
                                  to="/CalendarSubCategory"
                                  className="nav-link"
                              >
                                <i className=" fas fa-caret-right nav-icon"></i>
                                <p>Sub Category </p>
                              </Link>
                            </li>
                            <li className="nav-item">
                              <Link
                                  to="/FrequencyMaster"
                                  className="nav-link"
                              >
                                <i className=" fas fa-caret-right nav-icon"></i>
                                <p>Frequency Master </p>
                              </Link>
                            </li>
                            {/* <li className="nav-item">
                              <Link
                                to="/EventApproval"
                                className="nav-link"
                              >
                                <i className=" fas fa-caret-right nav-icon"></i>
                                <p>Event Approval</p>
                              </Link>
                            </li> */}
                          </Fragment>
                          // : null
                        }

                        {/*<li className="nav-item">*/}
                        {/*  <Link*/}
                        {/*    to="/EventCalendar"*/}
                        {/*    className="nav-link"*/}
                        {/*  >*/}
                        {/*    <i className=" fas fa-caret-right nav-icon"></i>*/}
                        {/*    <p>Events</p>*/}
                        {/*  </Link>*/}
                        {/*</li>*/}
                        <li className="nav-item">
                          <Link
                              to="/PlannerTask"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Tasks</p>
                          </Link>
                        </li>
                        {/* <li className="nav-item">
                                                        <Link to="/PlannerTaskAudit" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Tasks Audit</p>
                                                        </Link>
                                                    </li> */}
                        {/* <li className="nav-item">
                          <Link
                            to="/TaskAnalysis"
                            className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Tasks Analysis</p>
                          </Link>
                        </li> */}
                        <li className="nav-item">
                          <Link
                              to="/TaskEventsCalender"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Task Calendar</p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link
                              to="/PPMSpreadsheet"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>PPM Calendar</p>
                          </Link>
                        </li>
                        {/* <li className="nav-item">
                          <Link
                            to="/ResidentEvents"
                            className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Resident Events</p>
                          </Link>
                        </li> */}
                        {/*<li className="nav-item">*/}
                        {/*  <Link*/}
                        {/*    to="/TaskStatus"*/}
                        {/*    className="nav-link"*/}
                        {/*  >*/}
                        {/*    <i className=" fas fa-caret-right nav-icon"></i>*/}
                        {/*    <p>Task Status</p>*/}
                        {/*  </Link>*/}
                        {/*</li>*/}
                        <li className="nav-item">
                          <Link
                              to="/GuardList"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Spot Visits</p>
                          </Link>
                        </li>
                        {/* <li className="nav-item">
                                                        <Link to="/AttendanceSummary" className="nav-link">
                                                            <i className=" fas fa-caret-right nav-icon"></i>
                                                            <p>Attendance Summary</p>
                                                        </Link>
                                                    </li> */}
                      </ul>
                    </li>
                    // : null
                  }

                  <li className="nav-item has-treeview">
                    <a href="#" className="nav-link">
                      <i className="nav-icon fas fa-wrench"></i>
                      <p>
                        Asset Management
                        <i className="right fas fa-angle-left"></i>
                      </p>
                    </a>
                    <ul className="nav nav-treeview">
                      <li className="nav-item">
                        <Link
                            to="/AssetsMaster"
                            className="nav-link"
                        >
                          <i className=" fas fa-caret-right nav-icon"></i>
                          <p>Assets Master</p>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                            to="/CheckIn&CheckOut"
                            className="nav-link"
                        >
                          <i className=" fas fa-caret-right nav-icon"></i>
                          <p>Check IN & OUT</p>
                        </Link>
                      </li>

                      <li className="nav-item">
                        <Link to="/RentalAssets" className="nav-link">
                          <i className=" fas fa-caret-right nav-icon"></i>
                          <p>Rental Assets</p>
                        </Link>
                      </li>

                      <li className="nav-item">
                        <Link to="/ServiceRecords" className="nav-link">
                          <i className=" fas fa-caret-right nav-icon"></i>
                          <p>Service Records</p>
                        </Link>
                      </li>

                      <li className="nav-item">
                        <Link
                            to="/AssetTracking"
                            className="nav-link"
                        >
                          <i className=" fas fa-caret-right nav-icon"></i>
                          <p>Asset Log</p>
                        </Link>
                      </li>
                    </ul>
                  </li>

                  <li className="nav-item has-treeview">
                    <a href="#" className="nav-link">
                      <i className="nav-icon fas fa-boxes"></i>
                      <p>
                        Inventory Management
                        <i className="right fas fa-angle-left"></i>
                      </p>
                    </a>
                    <ul className="nav nav-treeview">
                    <li className="nav-item">
                        <Link
                            to="/Category"
                            className="nav-link"
                        >
                          <i className=" fas fa-caret-right nav-icon"></i>
                          <p>Category</p>
                        </Link>
                      </li>

                      <li className="nav-item">
                        <Link
                            to="/Item"
                            className="nav-link"
                        >
                          <i className=" fas fa-caret-right nav-icon"></i>
                          <p>Items</p>
                        </Link>
                      </li>

                      <li className="nav-item">
                        <Link to="/Vendors" className="nav-link">
                          <i className=" fas fa-caret-right nav-icon"></i>
                          <p>Vendors</p>
                        </Link>
                      </li>
                    </ul>
                  </li>

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
                          <Link
                              to="/ManageResidentOwners"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Manage Resident/Owners</p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link
                              to="/RwaMember"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Rwa Member</p>
                          </Link>
                        </li>

                        <li className="nav-item">
                          <Link to="/Notice" className="nav-link">
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Notice Bord</p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link
                              to="/EmergencyContact"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Emergency Contact </p>
                          </Link>
                        </li>
                        {/* <li className="nav-item">
                                                <Link to="/PendingApproval" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Pending Approval</p>
                                                </Link>
                                            </li> */}
                        <li className="nav-item">
                          <Link
                              to="/Employeeassignment"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Employee Assignment</p>
                          </Link>
                        </li>
                        <li className="nav-item ">
                          <Link
                              to="/PropertyMember"
                              className="nav-link"
                          >
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
                          Facility Management
                          <i className="right fas fa-angle-left"></i>
                        </p>
                      </a>
                      <ul className="nav nav-treeview">
                        <li className="nav-item">
                          <Link
                              to="/FacilityMember"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Facility Member </p>
                          </Link>
                        </li>

                        {this.state.userRoles && this.state.userRoles.includes("Admin") ?
                            <li className="nav-item">
                              <Link
                                  to="/CreateNewUser"
                                  className="nav-link"
                              >
                                <i className=" fas fa-caret-right nav-icon"></i>
                                <p>Create New User</p>
                              </Link>
                            </li> : null}
                        {/* <li className="nav-item">
                                        <Link to="/FacilityMember" className="nav-link">
                                            <i className=" fas fa-caret-right nav-icon"></i>
                                            <p>In Out Register</p>
                                        </Link>
                                    </li> */}
                        {/* <li className="nav-item">
                                        <Link to="/FacilityMember" className="nav-link">
                                            <i className=" fas fa-caret-right nav-icon"></i>
                                            <p >Attendance</p>
                                        </Link>
                                    </li> */}
                        {/* <li className="nav-item">
                                        <Link to="/FacilityMember" className="nav-link">
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
                          Parking Management
                          <i className="right fas fa-angle-left"></i>
                        </p>
                      </a>
                      <ul className="nav nav-treeview">
                        <li className="nav-item">
                          <Link
                              to="/ParkingZone"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Parking Zone </p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link
                              to="/ParkingDetails"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Parking Details </p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link
                              to="/ParkingAssignment"
                              className="nav-link"
                          >
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
                                                <Link to="/ManageResidentOwners" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Manage Resident/Owners</p>
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link to="/ManageFlat" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Manage Flats</p>
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link to="/PropertyMember" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Change Ownership</p>
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link to="/PropertyMember" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Manage Flat/Property</p>
                                                </Link>
                                            </li>

                                            <li className="nav-item">
                                                <Link to="/PropertyMember" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Property Member</p>
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link to="/PropertyOwner" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Property Owner</p>
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link to="/Tenant" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Property Tenant</p>
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link to="/PropertyAssignment" className="nav-link">
                                                    <i className=" fas fa-caret-right nav-icon"></i>
                                                    <p>Property Assignment </p>
                                                </Link>
                                            </li>
                                            <li className="nav-item ">
                                                <Link to="/PropertyMember" className="nav-link">
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
                          Master Settings
                          <i className="right fas fa-angle-left"></i>
                        </p>
                      </a>
                      <ul className="nav nav-treeview">
                        <li className="nav-item">
                          <Link
                              to="/DocumentType"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Document Type</p>
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
                          User Management
                          <i className="right fas fa-angle-left"></i>
                        </p>
                      </a>
                      <ul className="nav nav-treeview">
                        {this.state.userRoles && this.state.userRoles.includes("Admin") ?
                            <li className="nav-item">
                              <Link to="/AddNewUser" className="nav-link">
                                <i className=" fas fa-caret-right nav-icon"></i>
                                <p>Add New User </p>
                              </Link>
                            </li> : null}
                        <li className="nav-item">
                          <Link to="/user" className="nav-link">
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>User </p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link
                              to="/department"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Department </p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link to="/KYC" className="nav-link">
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>KYC</p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link
                              to="/AttendanceRecords"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Attendance Records</p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link to="/Employee" className="nav-link">
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Employee Master</p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link to="/Guard" className="nav-link">
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Guard Master</p>
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
                      <ul
                          className="nav nav-treeview"
                          style={{display: "none"}}
                      >
                        <li className="nav-item">
                          <Link
                              to="/PropertyMaster"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Property Master </p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link
                              to="/PropertyTower"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Property Towers </p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link
                              to="/PropertyDetails"
                              className="nav-link"
                          >
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
                          Complaint Management
                          <i className="fas fa-angle-left right"></i>
                          {/* <span className="badge badge-info right">6</span> */}
                        </p>
                      </a>

                      <ul
                          className="nav nav-treeview"
                          style={{display: "none"}}
                      >
                        {/*<li className="nav-item">*/}
                        {/*  <Link to="/Complain" className="nav-link">*/}
                        {/*    <i className=" fas fa-caret-right nav-icon"></i>*/}
                        {/*    <p>Open Tickets </p>*/}
                        {/*  </Link>*/}
                        {/*</li>*/}

                        <li className="nav-item">
                          <Link
                              to="/TicketComplains"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Complaints</p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link
                              to="/TicketCategories"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Category</p>
                          </Link>
                        </li>
                        {/*<li className="nav-item">*/}
                        {/*  <Link*/}
                        {/*      to="/EscalationGroup"*/}
                        {/*      className="nav-link"*/}
                        {/*  >*/}
                        {/*    <i className=" fas fa-caret-right nav-icon"></i>*/}
                        {/*    <p>Escalation Matrix</p>*/}
                        {/*  </Link>*/}
                        {/*</li>*/}
                        {/*<li className="nav-item">*/}
                        {/*  <Link*/}
                        {/*      to="/EscalationMatrix"*/}
                        {/*      className="nav-link"*/}
                        {/*  >*/}
                        {/*    <i className=" fas fa-caret-right nav-icon"></i>*/}
                        {/*    <p>Complain Matrix</p>*/}
                        {/*  </Link>*/}
                        {/*</li>*/}
                        {/*<li className="nav-item">*/}
                        {/*  <Link to="/ticket" className="nav-link">*/}
                        {/*    <i className=" fas fa-caret-right nav-icon"></i>*/}
                        {/*    <p>Ticket</p>*/}
                        {/*  </Link>*/}
                        {/*</li>*/}
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
                          Amenities Settings
                          <i className="right fas fa-angle-left"></i>
                        </p>
                      </a>
                      <ul className="nav nav-treeview">
                        <li className="nav-item">
                          <Link
                              to="/AmenitiesMaster"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Amenities Master </p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link
                              to="/AmenitiesAssignment"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Amenities Assignment</p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link
                              to="/AmenitiesBooking"
                              className="nav-link"
                          >
                            <i className=" fas fa-caret-right nav-icon"></i>
                            <p>Amenities Booking</p>
                          </Link>
                        </li>
                      </ul>
                    </li>
                    // : null
                  }

                  {
                    this.state.userRoles && this.state.userRoles.includes("Admin") ?
                        <li className="nav-item has-treeview">
                          <Link
                              to="/UploaderPage"
                              className="nav-link"
                          >
                            <i className="nav-icon fas fa-cloud-upload-alt "></i>
                            <p>Uploader </p>
                          </Link>
                        </li>
                        : null
                  }
                </ul>
              </nav>
            </div>
          </aside>
          <Switch>
            {/* <Route
                exact
                path="/"
                render={() => <Redirect to=" "/>}
            /> */}
            <Route exact path="/" component={Home}/>
            {/* <Route exact path="/">
              <Home />
            </Route> */}
            <Route exact path="/ticket">
              <TicketingDashboard/>
            </Route>
            <Route path="/department">
              <Department/>
            </Route>
            <Route path="/ChangePassword">
              <ChangePassword/>
            </Route>
            <Route path="/team"></Route>
            <Route path="/EmergencyContact">
              <EmergencyContactPage/>
            </Route>
            <Route path="/user">
              <User/>
            </Route>
            <Route path="/UserProfile">
              <UserProfile/>
            </Route>
            <Route path="/FacilityMember">
              <FacilityMemberPage/>
            </Route>
            <Route path="/CreateNewUser">
              <CreateNewUser/>
            </Route>
            <Route path="/AddNewUser">
              <AddNewUser/>
            </Route>
            <Route path="/PropertyMember">
              <PropertyMember/>
            </Route>
            <Route path="/PropertyOwner">
              <PropertyOwnerPage/>
            </Route>
            <Route path="/Tenant">
              <PropertyTenatsPage/>
            </Route>
            {/* <Route path="/Home">
                            <PropertyDashboard />
                        </Route> */}

            <Route path="/Complain">
              <ComplainManagement/>
            </Route>
            <Route path="/PropertyMaster">
              <PropertyMaster/>
            </Route>
            <Route path="/PropertyDetails">
              <PropertyDetailsPage/>
            </Route>
            <Route path="/ParkingDetails">
              <ParkingDetailsPage/>
            </Route>
            <Route path="/ParkingZone">
              <ParkingZonePage />
            </Route>
            <Route path="/TicketCategories">
              <TicketCategoriesPage />
            </Route>
            <Route path="/PropertyTower">
              <PropertyTower />
            </Route>
            <Route path="/PropertyAssignment">
              <PropertyAssignmentPage />
            </Route>
            <Route path="/ParkingAssignment">
              <ParkingAssignmentPage />
            </Route>
            <Route path="/AmenitiesMaster">
              <AmenitiesMasterPage />
            </Route>
            <Route path="/AmenitiesAssignment">
              <AmenitiesAssignmentPage />
            </Route>
            <Route path="/AmenitiesBooking">
              <AmenitiesBookingPage />
            </Route>
            <Route path="/KYC">
              <KYCPage />
            </Route>
            <Route path="/Employee">
              <EmployeePage />
            </Route>
            <Route path="/Guard">
              <GuardMasterPage />
            </Route>
            <Route path="/AttendanceRecords">
              <AttendanceRecordsPage />
            </Route>
            <Route path="/ManageResidentOwners">
              <ManageResidentOwnersPage />
            </Route>
            <Route path="/RwaMember">
              <RwaMemberPage />
            </Route>
            <Route path="/ManageFlat">
              <ManageFlatPage />
            </Route>
            <Route path="/DocumentType">
              <DocumentTypeMasterPage />
            </Route>
            <Route path="/AssetsMaster">
              <AssetsMasterPage />
            </Route>
            <Route path="/Category">
              <CategoryPage />
               </Route>
            <Route path="/Item">
              <ItemMasterPage />
            </Route>
            <Route path="/CheckIn&CheckOut">
              <CheckInCheckOut/>
            </Route>
            <Route path="/Vendors">
              <VendorPage/>
            </Route>
            <Route path="/RentalAssets">
              <RentalAssets/>
            </Route>
            <Route path="/ServiceRecords">
              <ServiceRecords/>
            </Route>
            <Route path="/EscalationGroup">
              <EscalationGroupPage />
            </Route>
            <Route path="/EscalationMatrix">
              <EscalationMatrixPage />
            </Route>
            <Route path="/Notice">
              <NoticeBoardPage />
            </Route>
            <Route path="/Employeeassignment">
              <PropertyEmployees />
            </Route>
            <Route path="/PendingApproval">
              <PendingApprovalPage />
            </Route>
            <Route path="/TicketComplains">
              <KanbanBoardPage />
            </Route>
            <Route path="/EventCalendar">
              <EventCalendarPage />
            </Route>
            <Route path="/CalendarCategory">
              <CalendarCategoryPage />
            </Route>
            <Route path="/FrequencyMaster">
              <FrequencyMasterPage />
            </Route>
            <Route path="/CalendarSubCategory">
              <CalendarSubCategoryPage />
            </Route>
            <Route path="/EventApproval">
              <EventApproval />
            </Route>
            <Route path="/PlannerTask">
              <PlannerTaskPage />
            </Route>
            <Route path="/TaskAnalysis">
              <PlannerTaskAnalysisPage />
            </Route>
            <Route path="/PlannerTaskAudit">
              <PlannerTaskAuditPage />
            </Route>
            <Route path="/TaskEventsCalender">
              <TaskEventCalendarPage />
            </Route>
            <Route path="/PPMSpreadsheet">
              <PPMSpreadsheet />
            </Route>
            <Route path="/ResidentEvents">
              <ResidentEventPage />
            </Route>
            <Route path="/TaskStatus">
              <PlannerTaskStatus />
            </Route>
            <Route path="/AssetTracking">
              <AssetTrackingPage />
            </Route>
            <Route path="/GuardList">
              <GuardListPage />
            </Route>
            <Route path="/UploaderPage">
              <UploaderPage/>
            </Route>
            {/* <Route path="/AttendanceSummary">
                            <AttendanceSummaryPage />
                        </Route> */}
          </Switch>
          <footer className="main-footer">
            <div className="float-right d-none d-sm-block">
              <b>Version</b> 3.0.4-pre
            </div>
            <strong>
              Copyright &copy; 2020-2021{" "}
              <a href="http://www.ufirm.in">Ufirm.in</a>.
            </strong>{" "}
            All rights reserved.
          </footer>
          <aside className="control-sidebar control-sidebar-dark"></aside>
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
  };
}

function mapDispatchToProps(dispatch) {
  const actions = bindActionCreators(departmentActions, dispatch);
  return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(MainNav);
