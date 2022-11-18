import React, { Component } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { setHours, setMinutes } from "date-fns";
import Modal from "react-awesome-modal";
import moment from "moment";
import { th } from "date-fns/locale";
import ApiProvider from "../DataProvider";
import Button from "../../../ReactComponents/Button/Button";
import * as appCommon from "../../../Common/AppCommon.js";
import { CreateValidator, ValidateControls } from "../Validation";
import { ToastContainer, toast } from "react-toastify";

export default class AddTask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      taskName: "",
      location: "",
      categoryId: "",
      subCategoryId: "",
      assignTo: "",
      assign: [],
      remindme: "",
      repeat: "",
      check: true,
      startDate: new Date(),
      endDate: new Date(),
      createdOn: moment().format(),
      // startTime: moment().add(moment().minute() > 30 && 1, 'hours').minutes(moment().minute() <= 30 ? 30 : 0).toDate(),
      // endTime: moment().add(moment().minute() > 30 && 1, 'hours').minutes(moment().minute() <= 30 ? 30 : 0).add(30, 'm').toDate(),
      startTime: new Date(),
      endTime: new Date(),
      selectedCategory: "",
      selectedSubCategory: "",
      subCategory: [],
      assets: [],
      assetId: "",
      QRCode: "",
    };
    this.onStartDateChange = this.onStartDateChange.bind(this);
    this.onEndDateChange = this.onEndDateChange.bind(this);
    this.ApiProvider = new ApiProvider();
  }

  onStartDateChange(date) {
    this.setState({
      startDate: date,
    });
  }

  onEndDateChange(date) {
    this.setState({
      endDate: date,
    });
  }
  getModel = (type) => {
    var model = [];
    switch (type) {
      case "R":
        model.push({
          CmdType: type,
        });
        break;
      default:
    }
    return model;
  };

  getTaskModel = (type) => {
    var model = [];
    switch (type) {
      case "R":
        model.push({
          CmdType: type,
        });
        break;
      case "C":
        model.push({
          CategoryId: parseInt(this.state.selectedCategory),
          SubCategoryId: parseInt(this.state.selectedSubCategory),
          Name: this.state.taskName,
          Description: "Desc",
          DateFrom: this.state.startDate,
          DateTo: this.state.endDate,
          TimeFrom: this.state.startTime.toString().split(" GMT")[0],
          TimeTo: this.state.endTime.toString().split(" GMT")[0],
          Remarks: "remarks",
          Occurence: "W",
          CreatedBy: 1,
          CreatedOn: this.state.createdOn,
          AssignTo: parseInt(this.state.assignTo),
          RemindMe: this.state.remindme,
          Location: this.state.location,
          AssetsID: parseInt(this.state.assetId),
          QRCode: this.state.QRCode,
        });
        break;
      default:
    }
    return model;
  };

  manageSubCategory = (model, type, categoryId) => {
    this.ApiProvider.manageSubCategory(model, type, categoryId).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          let subCatData = [];
          rData.forEach((element) => {
            subCatData.push({
              SubCategoryId: element.SubCategoryId,
              CategoryId: element.CategoryId,
              SubCategoryName: element.SubCategoryName,
            });
          });
          switch (type) {
            case "R":
              this.setState({ subCategory: subCatData });
              break;
            default:
          }
        });
      }
    });
  };

  manageTask = (model, type) => {
    this.ApiProvider.manageTask(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          switch (type) {
            case "C":
              if (rData === "Created !") {
                appCommon.showtextalert(
                  "Task Saved Successfully!",
                  "",
                  "success"
                );
                console.log("Task Saved Successfully!");
                this.handleCancel();
              }
              break;
            default:
          }
        });
      }
    });
  };

  manageAssets = (model, type) => {
    this.ApiProvider.manageAssets(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          let assetsData = [];
          rData.forEach((element) => {
            assetsData.push({
              assetId: element.Id,
              assetName: element.Name,
            });
          });
          switch (type) {
            case "R":
              this.setState({ assets: assetsData });
              break;
            default:
          }
        });
      }
    });
  };

  manageAssign = (model, type) => {
    this.ApiProvider.manageAssign(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          let assignData = [];
          rData.forEach((element) => {
            assignData.push({
              assignId: element.Id,
              assignName: element.Name,
            });
          });
          switch (type) {
            case "R":
              this.setState({ assign: assignData });
              break;
            default:
          }
        });
      }
    });
  };

  getSubCategory() {
    var type = "R";
    var model = this.getModel(type);
    var categoryId = this.state.selectedCategory
      ? this.state.selectedCategory
      : 0;
    this.manageSubCategory(model, type, categoryId);
  }

  getAssets() {
    var type = "R";
    var model = this.getModel(type);
    this.manageAssets(model, type);
  }

  getAssign() {
    var type = "R";
    var model = this.getModel(type);
    this.manageAssign(model, type);
  }

  handleSave = (e) => {
    e.currentTarget.disabled = true;
    var type = "C";
    var model = this.getTaskModel(type);
    this.manageTask(model, type);
  };
  handleCancel = () => {
    this.props.closeModal();
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedCategory !== this.state.selectedCategory) {
      this.getSubCategory();
    }
  }

  componentDidMount() {
    this.getAssets();
    this.getAssign();
  }

  render() {
    return (
      <div>
        <Modal
          visible={this.props.showAddModal}
          effect="fadeInRight"
          onClickAway={this.props.closeModal}
          width="800"
        >
          <div className="row">
            <div className="col-12">
              <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">Add Task</h3>
                  <div className="card-tools">
                    <button
                      className="btn btn-tool"
                      onClick={this.props.closeModal}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div
                  className="card-body"
                  style={{ height: "600px", overflowY: "scroll" }}
                >
                  <div className="row">
                    <div className="col-6">
                      <label>Name</label>
                      <input
                        id="txtName"
                        placeholder="Enter Task"
                        type="text"
                        className="form-control"
                        onChange={(e) => {
                          this.setState({ taskName: e.target.value });
                        }}
                      />
                    </div>
                    <div className="col-6">
                      <label>Location</label>
                      <input
                        id="txtLocation"
                        placeholder="Enter Location"
                        type="text"
                        className="form-control"
                        onChange={(e) => {
                          this.setState({ location: e.target.value });
                        }}
                      />
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-6">
                      <label>Category</label>
                      <select
                        id="dllCategory"
                        className="form-control"
                        onChange={(e) =>
                          this.setState({
                            selectedCategory: e.target.value,
                          })
                        }
                      >
                        <option value={0}>Select Category</option>
                        {this.props.categoryData
                          ? this.props.categoryData.map((e, key) => {
                              return (
                                <option key={key} value={e.Id}>
                                  {e.Name}
                                </option>
                              );
                            })
                          : null}
                      </select>
                    </div>
                    <div className="col-6">
                      <label>Sub Category</label>
                      <select
                        id="dllCategory"
                        className="form-control"
                        onChange={(e) =>
                          this.setState({
                            selectedSubCategory: e.target.value,
                          })
                        }
                      >
                        <option value={0}>Select Sub Category</option>
                        {this.state.subCategory &&
                          this.state.subCategory.map((e, key) => {
                            return (
                              <option key={key} value={e.SubCategoryId}>
                                {e.SubCategoryName}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-6">
                      <label>Start Date</label>
                      <ReactDatePicker
                        className="form-control"
                        selected={this.state.startDate}
                        onChange={this.onStartDateChange}
                        dateFormat="dd/MM/yyyy"
                        peekNextmonth
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        id="textStartDate"
                      />
                    </div>
                    <div className="col-6">
                      <label>End Date</label>
                      <ReactDatePicker
                        className="form-control"
                        selected={this.state.endDate}
                        onChange={this.onEndDateChange}
                        dateFormat="dd/MM/yyyy"
                        peekNextmonth
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        id="textEndDate"
                      />
                    </div>
                    <div className="col-3 mt-2">
                      <label>All Day</label>
                      <br />
                      <label className="switch">
                        <input
                          type="checkbox"
                          // checked={this.state.check}
                          onChange={(e) => {
                            this.setState({ check: e.target.checked });
                          }}
                        />
                        <div className="slider round">
                          <span className="on">Yes</span>
                          <span className="off">No</span>
                        </div>
                      </label>
                    </div>
                    <div className="col-3 mt-2">
                      <label>Start Time</label>
                      <ReactDatePicker
                        className="form-control"
                        selected={this.state.startTime}
                        onChange={(date) =>
                          this.setState({
                            startTime: date,
                            endTime: moment(date).add(30, "m").toDate(),
                          })
                        }
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        timeCaption="Time"
                        dateFormat="h:mm a"
                        // disabled={this.state.check}
                      />
                    </div>
                    <div className="col-3 mt-2">
                      <label>End Time</label>
                      <ReactDatePicker
                        className="form-control"
                        selected={this.state.endTime}
                        onChange={(date) => this.setState({ endTime: date })}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        timeCaption="Time"
                        dateFormat="h:mm a"
                        // disabled={this.state.check}
                        minTime={moment(this.state.startTime)
                          .add(30, "m")
                          .toDate()}
                        maxTime={setHours(
                          setMinutes(this.state.startTime, 45),
                          23
                        )}
                      />
                    </div>
                    <div className="col-3 mt-2">
                      <label>Remind me</label>
                      <select
                        id="ddleventremindme"
                        className="form-control"
                        value={this.state.remindme}
                        onChange={(e) => {
                          this.setState({ remindme: e.target.value });
                        }}
                      >
                        <option value="0">Never</option>
                        <option value="5">5 minutes before</option>
                        <option value="15">15 minutes before</option>
                        <option value="30"> 30 minutes before</option>
                        <option value="60">1 hour before</option>
                        <option value="720">12 hours before</option>
                      </select>
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-6">
                      <label>Assign To</label>
                      <select
                        iid="ddlAssignee"
                        className="form-control"
                        onChange={(e) =>
                          this.setState({
                            assignTo: e.target.value,
                          })
                        }
                      >
                        <option value={0}>Select Assignee</option>
                        {this.state.assign &&
                          this.state.assign.map((e, key) => {
                            return (
                              <option key={key} value={e.assignId}>
                                {e.assignName}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                    <div className="col-3">
                      <label>Repeat</label>
                      <select
                        id="ddleventrepeat"
                        className="form-control"
                        value={this.state.repeat}
                        onChange={(e) => {
                          this.setState({
                            repeat: e.target.value,
                            RepeateEndBy: this.state.endDate,
                          });
                        }}
                      >
                        <option value="N">Do not repeat</option>
                        <option value="D">Daily</option>
                        <option value="W">Weekly</option>
                        <option value="M">Monthly</option>
                        <option value="Y">Yearly</option>
                        {/* <option>Custom</option> */}
                      </select>
                    </div>
                  </div>

                  <div className="row mt-2">
                    <div className="col-6">
                      <label>Assets</label>
                      <select
                        iid="ddlAssignee"
                        className="form-control"
                        onChange={(e) => {
                          this.setState({ assetId: e.target.value });
                        }}
                      >
                        <option value={0}>Select Assets</option>
                        {this.state.assets &&
                          this.state.assets.map((e, key) => {
                            return (
                              <option key={key} value={e.assetId}>
                                {e.assetName}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                    <div className="col-6">
                      <label>QR Code</label>
                      <input
                        id="txtLocation"
                        placeholder="QR Code"
                        type="text"
                        className="form-control"
                        onChange={(e) => {
                          this.setState({ QRCode: e.target.value });
                        }}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                      <button className="btn btn-primary" onClick={(e)=>this.handleSave(e)}>
                        Save
                      </button>
                    <Button
                      Id="btnCancel"
                      Text="Cancel"
                      Action={this.handleCancel}
                      ClassName="btn btn-secondary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
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
