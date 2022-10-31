import React from "react";
import DataGrid from "../../ReactComponents/DataGrid/DataGrid.jsx";
import Button from "../../ReactComponents/Button/Button";
import ApiProvider from "./DataProvider.js";
import { ToastContainer, toast } from "react-toastify";
import * as appCommon from "../../Common/AppCommon.js";
import swal from "sweetalert";
import { CreateValidator, ValidateControls } from "./Validation.js";
import CommonDataProvider from "../../Common/DataProvider/CommonDataProvider.js";
import DocumentBL from "../../ComponentBL/DocumentBL";
import {
  DELETE_CONFIRMATION_MSG,
  APPROVE_CONFIRMATION_MSG,
} from "../../Contants/Common";
import DocumentUploader from "../../ReactComponents/FileUploader/DocumentUploader.jsx";
import { connect } from "react-redux";
import departmentAction from "../../redux/department/action";
import { bindActionCreators } from "redux";
import DataProvider from "../Calendar/DataProvider";

class Employee extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      PageMode: "Home",
      EmployeeData: [],
      Id: "",
      EmployeeName: "",
      FatherName: "",
      Designation: "",
      MobileNo: "",
      Approved: 0,
      IsDeleted: 0,

      gridHeader: [
        { sTitle: "Id", titleValue: "Id", orderable: false, visible: true },
        { sTitle: "Employee Name.", titleValue: "EmployeeName" },
        { sTitle: "Father Name", titleValue: "FatherName" },
        { sTitle: "Designation", titleValue: "Designation" },
        { sTitle: "Mobile", titleValue: "MobileNo" },
        { sTitle: "Status", titleValue: "Approved" },
        {
          sTitle: "Action",
          titleValue: "Action",
          Action: "Edit&Approve",
          Index: "0",
          orderable: false,
        },
      ],
      filtered: false,
    };
    this.ApiProviderr = new ApiProvider();
    this.comdbprovider = new CommonDataProvider();
    this.dataprovider = new DataProvider();
  }

  componentDidMount() {
    this.getEmployeeData();
  }

  getModel = (type) => {
    var model = [];
    switch (type) {
      case "R":
        model.push({
          CmdType: type,
        });
        break;
        case "C":
          model.push({
            Id: 0,
            EmployeeName: this.state.EmployeeName,
            FatherName : this.state.FatherName,
            Designation : this.state.Designation,
            MobileNo : this.state.MobileNo,
            IsDeleted : 0,
            Approved : 1
          });
          break;
      case "U":
        model.push({
          Id: parseInt(this.state.Id),
          EmployeeName: this.state.EmployeeName,
          FatherName : this.state.FatherName,
          Designation : this.state.Designation,
          MobileNo : this.state.MobileNo,
      });
        break;
      case "AP":
        model.push({
          Id: parseInt(this.state.Id),
        });
        break;
      default:
    }
    return model;
  };

  manageEmployee = (model, type) => {
    this.ApiProviderr.manageEmployee(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          switch (type) {
            case "C":
              if (rData === "1") {
                appCommon.showtextalert(
                  "Employee Details Created Successfully!",
                  "",
                  "success"
                );
                this.handleCancel();
              }
              break;
            case "U":
              if (rData === "1") {
                appCommon.showtextalert(
                  "Updated Successfully!",
                  "",
                  "success"
                );
                this.handleCancel();
              }
              break;
            case "AP":
              if (rData === "Approved Successfully !") {
                appCommon.showtextalert(
                  "KYC Details Approved Successfully!",
                  "",
                  "success"
                );
              }
              break;
            case "D":
              if (rData === 1) {
                appCommon.showtextalert(
                  "KYC Details Deleted Successfully!",
                  "",
                  "success"
                );
              } else {
                appCommon.showtextalert("Someting went wrong !", "", "error");
              }
              this.getKYCData();
              break;
            case "R":
              this.setState({ EmployeeData: rData });
              break;
            default:
          }
        });
      }
    });
  };

  getEmployeeData() {
    var type = "R";
    var model = this.getModel(type);
    this.manageEmployee(model, type);
  }

  ongridedit(Id) {
    this.setState({ PageMode: "Edit" }, () => {
      CreateValidator();
    });
    var rowData = this.findItem(Id);
    if (rowData) {
      this.setState({
        Id: rowData.Id,
        EmployeeId: rowData.EmployeeId,
        EmployeeName: rowData.EmployeeName,
        JobProfile: rowData.JobProfile,
        MobileNo: rowData.MobileNo,
        FatherName : rowData.FatherName,
        Designation : rowData.Designation,
        Gender: rowData.Gender,
        DocType: rowData.IdDoc,
        Image: rowData.Image,
        ImageExt: rowData.ImageExt,
        IdImage: rowData.IdImage,
        ApproveStatus: rowData.ApproveStatus,
      });
    }
  }

  findItem(id) {
    return this.state.EmployeeData.find((item) => {
      if (item.Id == id) {
        return item;
      }
    });
  }

  handleSave = async () => {
    if (ValidateControls()) {
      if (this.state.PageMode === "Add") {
        var type = "C";
        var model = this.getModel(type);
        this.manageEmployee(model, type);
      }

      if (this.state.PageMode === "Edit") {
        let type = "U";
        let model = this.getModel(type);
        this.manageEmployee(model, type);
      }
      this.setState({Id:0,EmployeeName:'',FatherName:'',Designation:'',MobileNo:'',IsDeleted:0,Approved:0 });
    }
  };

  handleCancel = () => {
    var type = "R";
    this.getModel(type);
    this.getEmployeeData();
    this.setState({ PageMode: "Home" });
  };

  handleApprove = () => {
    let type = "AP";
    let model = this.getModel(type);
    this.manageKYC(model, type);
  };

  Addnew = () => {
    this.setState({ PageMode: "Add" }, () => {
      CreateValidator();
    });
  };

  //End
  render() {
    return (
      <div>
        {this.state.PageMode == "Home" && (
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex p-0">
                  <ul className="nav ml-auto tableFilterContainer">
                    <li className="nav-item">
                      <div className="input-group input-group-sm">
                        <div className="input-group-prepend">
                          <Button
                            id="btnaddCalendarCategory"
                            Action={this.Addnew.bind(this)}
                            ClassName="btn btn-success btn-sm"
                            Icon={
                              <i className="fa fa-plus" aria-hidden="true"></i>
                            }
                            Text=" Create New"
                          />
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="card-body pt-2">
                  <DataGrid
                    Id="grdEmployee"
                    // IsPagination={true}
                    ColumnCollection={this.state.gridHeader}
                    onEditMethod={this.ongridedit.bind(this)}
                    DefaultPagination={false}
                    IsSarching="true"
                    GridData={this.state.EmployeeData}
                    pageSize="500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {(this.state.PageMode == "Add" || this.state.PageMode == "Edit") && (
          <div>
            <div>
              <div className="modal-content">
                <div className="modal-body">
                  <div className="row">
                    <div className="col-sm-4">
                      <label>Employee Name</label>
                      <input
                        id="txtCatColor"
                        placeholder="Enter Employee Name"
                        type="text"
                        className="form-control"
                        value={this.state.EmployeeName}
                        onChange={(e) => {
                          this.setState({ EmployeeName: e.target.value });
                        }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <label>Father Name</label>
                      <input
                        id="txtCatColor"
                        placeholder="Enter Father Name"
                        type="text"
                        className="form-control"
                        value={this.state.FatherName}
                        onChange={(e) => {
                          this.setState({ FatherName: e.target.value });
                        }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-2">
                      <label>Designation</label>
                      <input
                        id="txtCatColor"
                        placeholder="Enter Designation"
                        type="text"
                        className="form-control"
                        value={this.state.Designation}
                        onChange={(e) => {
                          this.setState({ Designation: e.target.value });
                        }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-2">
                      <label>Mobile Number</label>
                      <input
                        id="txtCatColor"
                        placeholder="Enter Mobile Number"
                        type="text"
                        className="form-control"
                        value={this.state.MobileNo}
                        onChange={(e) => {
                          this.setState({ MobileNo: e.target.value });
                        }}
                      />
                    </div>
                  </div>
                  <br />
                </div>
                <div
                  className="modal-footer"
                  style={{ justifyContent: "flex-start" }}
                >
                  <Button
                    Id="btnSave"
                    Text="Save"
                    Action={this.handleSave}
                    ClassName="btn btn-primary"
                  />
                  <Button
                    Id="btnCancel"
                    Text="Cancel"
                    Action={this.handleCancel}
                    ClassName="btn btn-secondary"
                  />
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
        )}
      </div>
    );
  }
}

function mapStoreToprops(state, props) {
  return {
    // PropertyId: state.Commonreducer.puidn,
  };
}

function mapDispatchToProps(dispatch) {
  const actions = bindActionCreators(departmentAction, dispatch);
  return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(Employee);
