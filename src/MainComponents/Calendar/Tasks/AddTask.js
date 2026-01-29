import React, { Component } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { setHours, setMinutes } from "date-fns";
import Modal from "react-awesome-modal";
import moment from "moment";
import { connect } from "react-redux";
import ApiProvider from "../DataProvider";
import Button from "../../../ReactComponents/Button/Button";
import * as appCommon from "../../../Common/AppCommon.js";
import { ToastContainer, toast } from "react-toastify";
import { getFrequencyList } from "../../../Services/masterService";

class AddTask extends Component {
  constructor(props) {
    super(props);

    this.ApiProvider = new ApiProvider();

    this.state = {
      // ===== Task Details =====
      taskName: "",
      location: "",
      categoryId: "",
      subCategoryId: "",
      selectedCategory: "",
      selectedSubCategory: "",
      subCategory: [],
      assignTo: "",
      assign: [],
      repeat: "",
      occurence: "",
      remindme: "",
      check: false,
      remarks: "",
      isSaving: false,

      startDate: new Date(),
      endDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      createdOn: moment().format(),

      frequencyData: [],
      propertyData: [],

      // ===== Tabs =====
      activeTab: "task",

      // ===== Assets =====
      assets: [],
      assetId: "",
      assetBrand: "",
      assetPhoto: null,
      lastServiceDate: null,
      nextServiceDate: null,
      QRCode: "",

      // ===== Questions =====
      quesValues: [
        {
          TaskID: "",
          QuestionName: "",
        },
      ],
    };

    this.onStartDateChange = this.onStartDateChange.bind(this);
    this.onEndDateChange = this.onEndDateChange.bind(this);
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
  getAssignModel = (type) => {
    var model = [];
    switch (type) {
      case "R":
        model.push({
          CmdType: type,
          PropertyId: this.props.PropertyId ? this.props.PropertyId : 0,
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
          Remarks: this.state.remarks,
          Occurence: this.state.occurence,
          CreatedBy: 1,
          CreatedOn: this.state.createdOn,
          AssignTo: parseInt(this.state.assignTo),
          RemindMe: this.state.remindme,
          Location: this.state.location,
          AssetsID: this.state.assetId ? parseInt(this.state.assetId) : 0,
          QRCode: this.state.QRCode,
          type: this.props.type,
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
      if (resp.ok && resp.status === 200) {
        return resp.json().then((rData) => {
          switch (type) {
            case "C":
              if (rData === "Created !") {
                appCommon.showtextalert(
                  "Task Saved Successfully!",
                  "",
                  "success",
                );
                console.log("Task Saved Successfully!");
                this.handleCancel();
              } else {
                appCommon.showtextalert(
                  "Task Cannot Be Created !",
                  rData.split("?")[0],
                  "warning",
                );
                this.handleCancel();
              }
              break;
            default:
          }
        });
      }
    });
  };

  loadAssets = async (propertyId) => {
    try {
      const res = await fetch(
        `https://api.urest.in:8096/GetAssets?propertyId=${propertyId}`,
      );
      const data = await res.json();

      const combined = [
        ...(Array.isArray(data.PassedServiceDates)
          ? data.PassedServiceDates
          : []),
        ...(Array.isArray(data.UpcomingServiceDates)
          ? data.UpcomingServiceDates
          : []),
      ];

      this.setState({ assets: combined });
    } catch (err) {
      console.error("Failed to load assets", err);
      this.setState({ assets: [] });
    }
  };

  handleQuesChange = (i, e) => {
    const quesValues = [...this.state.quesValues];
    quesValues[i][e.target.name] = e.target.value;
    this.setState({ quesValues });
  };

  addQuesFields = () => {
    this.setState({
      quesValues: [
        ...this.state.quesValues,
        {
          TaskID: this.props.taskId || "",
          QuestionName: "",
        },
      ],
    });
  };

  handleAssetChange = (e) => {
    const assetId = e.target.value;

    const selectedAsset = this.state.assets.find(
      (a) => String(a.Id) === String(assetId),
    );

    if (!selectedAsset) {
      this.setState({
        assetId: "",
        assetBrand: "",
        assetPhoto: null,
        lastServiceDate: null,
        nextServiceDate: null,
        QRCode: "",
      });
      return;
    }

    this.setState({
      assetId: assetId,

      // ✅ from AssetsMaster
      assetBrand: selectedAsset.Manufacturer || "",
      lastServiceDate: selectedAsset.LastServiceDate
        ? new Date(selectedAsset.LastServiceDate)
        : null,
      nextServiceDate: selectedAsset.NextServiceDate
        ? new Date(selectedAsset.NextServiceDate)
        : null,

      // base64 image from API
      assetPhoto: selectedAsset.AssetImage || null,

      QRCode: selectedAsset.QRCode || "",
    });
  };

  isTaskValid = () => {
    const {
      taskName,
      selectedCategory,
      selectedSubCategory,
      assignTo,
      occurence,
      location,
    } = this.state;

    return (
      taskName.trim() !== "" &&
      selectedCategory &&
      selectedSubCategory &&
      assignTo &&
      occurence &&
      location.trim() !== ""
    );
  };

  removeQuesFields = (i) => {
    const quesValues = [...this.state.quesValues];
    quesValues.splice(i, 1);
    this.setState({ quesValues });
  };

  manageAssign = (model, type) => {
    this.ApiProvider.manageAssign(model, type).then((resp) => {
      if (resp.ok && resp.status === 200) {
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

  manageProperties = (model, type) => {
    this.ApiProvider.manageProperties(model, type).then((resp) => {
      if (resp.ok && resp.status === 200) {
        return resp.json().then((rData) => {
          let propertyData = [];
          rData.forEach((element) => {
            propertyData.push({
              propertyId: element.PropertyId,
              name: element.Name,
            });
          });
          switch (type) {
            case "R":
              this.setState({ propertyData: propertyData });
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

  getAssign() {
    var type = "R";
    var model = this.getAssignModel(type);
    this.manageAssign(model, type);
  }

  getAllProperties() {
    var type = "R";
    var model = this.getModel(type);
    this.manageProperties(model, type);
  }

  getAllFrenquency = async () => {
    try {
      this.setState({ loading: true });
      const data = await getFrequencyList();
      this.setState({ frequencyData: data, loading: false });
    } catch (error) {
      console.error("Error fetching frequency:", error);
      this.setState({ loading: false });
    }
  };

  handleSave = async () => {
    if (this.state.isSaving) return;

    this.setState({ isSaving: true });

    try {
      // 1️⃣ Save Task
      const taskModel = this.getTaskModel("C");
      const taskResp = await this.ApiProvider.manageTask(taskModel, "C");

      if (!taskResp.ok) throw new Error("Task create failed");

      const taskResult = await taskResp.json();
      if (taskResult !== "Created !") {
        throw new Error(taskResult);
      }

      // 2️⃣ Prepare Questions payload (SINGLE array)
      const questions = this.state.quesValues
        .filter((q) => q.QuestionName && q.QuestionName.trim() !== "")
        .map((q) => ({
          TaskID: 0, // backend links task internally
          QuestionName: q.QuestionName.trim(),
        }));

      // 3️⃣ Save Questions only if present
      if (questions.length > 0) {
        await this.ApiProvider.manageQues(questions, "C");
      }

      appCommon.showtextalert(
        "Task & Questions Saved Successfully!",
        "",
        "success",
      );

      // 4️⃣ Close modal
      this.handleCancel();

      // 5️⃣ Refresh task list safely
      setTimeout(() => {
        if (this.props.onTaskAdded) {
          this.props.onTaskAdded();
        }
      }, 0);
    } catch (err) {
      console.error(err);
      appCommon.showtextalert(
        "Error while saving task",
        err.message || "Something went wrong",
        "error",
      );
      this.setState({ isSaving: false });
    }
  };

  handleCancel = () => {
    this.props.closeModal();
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedCategory !== this.state.selectedCategory) {
      this.getSubCategory();
    }

    if (prevProps.PropertyId !== this.props.PropertyId) {
      this.getAssign();
      this.loadAssets(this.props.PropertyId);
    }
  }

  componentDidMount() {
    this.getAssign();
    this.getAllProperties();
    this.getAllFrenquency();

    // ✅ ADD THIS
    if (this.props.PropertyId) {
      this.loadAssets(this.props.PropertyId);
    }
  }

  render() {
    return (
      <div>
        <style>
          {`
  .add-task-form label {
    font-weight: 500;
    margin-bottom: 6px;
    display: block;
  }

  .add-task-form .form-control,
  .add-task-form .react-datepicker-wrapper,
  .add-task-form .react-datepicker__input-container input {
    height: 38px;
    padding: 6px 12px;
    font-size: 14px;
  }

  .add-task-form .react-datepicker-wrapper {
    width: 100%;
  }

  .add-task-form .switch {
    transform: scale(0.9);
  }
    .add-task-form {
  padding-bottom: 10px;
}

.card-header {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #2f5f7f;
}

`}
        </style>

        <Modal
          visible={this.props.showAddModal}
          effect="fadeInDown"
          onClickAway={this.props.closeModal}
          width="1100"
          style={{
            top: "40px",
          }}
        >
          <div className="row">
            <div className="col-12">
              <div className="card card-primary">
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <h3 className="card-title mb-0">Add Task</h3>
                    <button
                      className="btn btn-tool"
                      onClick={this.props.closeModal}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  {/* divider */}
                  <hr className="my-2" />

                  {/* tabs */}
                  <ul className="nav nav-tabs mt-2">
                    <li className="nav-item">
                      <a
                        className={`nav-link ${this.state.activeTab === "task" ? "active" : ""}`}
                        onClick={() => this.setState({ activeTab: "task" })}
                      >
                        Task Details
                      </a>
                    </li>

                    <li className="nav-item">
                      <a
                        className={`nav-link ${this.state.activeTab === "question" ? "active" : ""}`}
                        onClick={() => this.setState({ activeTab: "question" })}
                      >
                        Question Details
                      </a>
                    </li>

                    <li className="nav-item">
                      <a
                        className={`nav-link ${this.state.activeTab === "asset" ? "active" : ""}`}
                        onClick={() => this.setState({ activeTab: "asset" })}
                      >
                        Asset Details
                      </a>
                    </li>
                  </ul>
                </div>

                <div
                  className="card-body"
                  style={{
                    maxHeight: "calc(100vh - 160px)",
                    overflowY: "auto",
                  }}
                >
                  {this.state.activeTab === "task" && (
                    <div className="add-task-form">
                      <div className="row mb-3 align-items-center">
                        <div className="col-md-2">
                          <label>Task Name</label>
                        </div>
                        <div className="col-md-10">
                          <input
                            className="form-control"
                            placeholder="Enter Task"
                            value={this.state.taskName}
                            onChange={(e) =>
                              this.setState({ taskName: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="row mb-3 align-items-center">
                        <div className="col-md-2">
                          <label>Property</label>
                        </div>
                        <div className="col-md-4">
                          <select
                            className="form-control"
                            disabled
                            value={this.props.PropertyId}
                          >
                            {this.state.propertyData.map((e, k) => (
                              <option key={k} value={e.propertyId}>
                                {e.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-2">
                          <label>Location</label>
                        </div>
                        <div className="col-md-4">
                          <input
                            className="form-control"
                            placeholder="Enter Location"
                            value={this.state.location}
                            onChange={(e) =>
                              this.setState({ location: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="row mb-3 align-items-center">
                        <div className="col-md-2">
                          <label>Category</label>
                        </div>
                        <div className="col-md-4">
                          <select
                            className="form-control"
                            value={this.state.selectedCategory}
                            onChange={(e) =>
                              this.setState({
                                selectedCategory: e.target.value,
                              })
                            }
                          >
                            <option value={0}>Select Category</option>
                            {this.props.categoryData?.map((e, k) => (
                              <option key={k} value={e.Id}>
                                {e.Name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-2">
                          <label>Sub Category</label>
                        </div>
                        <div className="col-md-4">
                          <select
                            className="form-control"
                            value={this.state.selectedSubCategory}
                            onChange={(e) =>
                              this.setState({
                                selectedSubCategory: e.target.value,
                              })
                            }
                          >
                            <option value={0}>Select Sub Category</option>
                            {this.state.subCategory.map((e, k) => (
                              <option key={k} value={e.SubCategoryId}>
                                {e.SubCategoryName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="row mb-3 align-items-center">
                        <div className="col-md-2">
                          <label>Start Date</label>
                        </div>
                        <div className="col-md-4">
                          <ReactDatePicker
                            className="form-control"
                            selected={this.state.startDate}
                            onChange={this.onStartDateChange}
                            dateFormat="dd/MM/yyyy"
                          />
                        </div>

                        <div className="col-md-2">
                          <label>End Date</label>
                        </div>
                        <div className="col-md-4">
                          <ReactDatePicker
                            className="form-control"
                            selected={this.state.endDate}
                            onChange={this.onEndDateChange}
                            dateFormat="dd/MM/yyyy"
                          />
                        </div>
                      </div>

                      <div className="row mb-3 align-items-center">
                        <div className="col-md-2">
                          <label>Start Time</label>
                        </div>
                        <div className="col-md-4">
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
                            dateFormat="h:mm a"
                          />
                        </div>

                        <div className="col-md-2">
                          <label>End Time</label>
                        </div>
                        <div className="col-md-4">
                          <ReactDatePicker
                            className="form-control"
                            selected={this.state.endTime}
                            onChange={(date) =>
                              this.setState({ endTime: date })
                            }
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            dateFormat="h:mm a"
                            minTime={moment(this.state.startTime)
                              .add(30, "m")
                              .toDate()}
                            maxTime={setHours(
                              setMinutes(this.state.startTime, 45),
                              23,
                            )}
                          />
                        </div>
                      </div>

                      <div className="row mb-3 align-items-center">
                        <div className="col-md-2">
                          <label>All Day</label>
                        </div>
                        <div className="col-md-4 d-flex align-items-center">
                          <label className="switch mb-0">
                            <input
                              type="checkbox"
                              checked={this.state.check}
                              onChange={(e) =>
                                this.setState({ check: e.target.checked })
                              }
                            />
                            <div className="slider round">
                              <span className="on">Yes</span>
                              <span className="off">No</span>
                            </div>
                          </label>
                        </div>

                        <div className="col-md-2">
                          <label>Remind Me</label>
                        </div>
                        <div className="col-md-4">
                          <select
                            className="form-control"
                            value={this.state.remindme}
                            onChange={(e) =>
                              this.setState({ remindme: e.target.value })
                            }
                          >
                            <option value="0">Never</option>
                            <option value="5">5 minutes before</option>
                            <option value="15">15 minutes before</option>
                            <option value="30">30 minutes before</option>
                            <option value="60">1 hour before</option>
                            <option value="720">12 hours before</option>
                          </select>
                        </div>
                      </div>
                      <div className="row mb-3 align-items-center">
                        <div className="col-md-2">
                          <label>Assign To</label>
                        </div>
                        <div className="col-md-4">
                          <select
                            className="form-control"
                            value={this.state.assignTo}
                            onChange={(e) =>
                              this.setState({ assignTo: e.target.value })
                            }
                          >
                            <option value={0}>Select Assignee</option>
                            {this.state.assign.map((e, k) => (
                              <option key={k} value={e.assignId}>
                                {e.assignName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-2">
                          <label>Repeat</label>
                        </div>
                        <div className="col-md-4">
                          <select
                            className="form-control"
                            value={this.state.occurence}
                            onChange={(e) =>
                              this.setState({ occurence: e.target.value })
                            }
                          >
                            <option value={0}>Select Occurrence</option>
                            {this.state.frequencyData.map((e, k) => (
                              <option key={k} value={e.Occurence}>
                                {e.Name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {this.state.activeTab === "asset" && (
                    <div className="add-task-form">
                      {/* Asset selection */}
                      <div className="row mb-3 align-items-center">
                        <div className="col-md-2">
                          <label>Asset</label>
                        </div>
                        <div className="col-md-10">
                          <select
                            className="form-control"
                            value={this.state.assetId}
                            onChange={this.handleAssetChange}
                          >
                            <option value="">Select Asset</option>
                            {this.state.assets.map((a, k) => (
                              <option key={k} value={a.Id}>
                                {a.Name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Asset brand */}
                      <div className="row mb-3 align-items-center">
                        <div className="col-md-2">
                          <label>Asset ID</label>
                        </div>
                        <div className="col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            value={this.state.assetId || ""}
                            readOnly
                          />
                        </div>
                        <div className="col-md-2">
                          <label>Asset Brand</label>
                        </div>
                        <div className="col-md-4">
                          <input
                            className="form-control"
                            value={this.state.assetBrand}
                            readOnly
                          />
                        </div>
                      </div>

                      {/* Dates row */}
                      <div className="row mb-3 align-items-center">
                        <div className="col-md-2">
                          <label>Last Service</label>
                        </div>
                        <div className="col-md-4">
                          <ReactDatePicker
                            className="form-control"
                            selected={this.state.lastServiceDate}
                            dateFormat="dd/MM/yyyy"
                            readOnly
                          />
                        </div>
                        <div className="col-md-2">
                          <label>Next Service</label>
                        </div>
                        <div className="col-md-4">
                          <ReactDatePicker
                            className="form-control"
                            selected={this.state.nextServiceDate}
                            dateFormat="dd/MM/yyyy"
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="row mb-3 align-items-center">
                        <div className="col-md-2">
                          <label>Asset Photo</label>
                        </div>

                        <div className="col-md-4">
                          {this.state.assetPhoto ? (
                            <img
                              src={`data:image/png;base64,${this.state.assetPhoto}`}
                              alt="Asset"
                              style={{
                                height: "90px",
                                borderRadius: "4px",
                                border: "1px solid #ddd",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              className="form-control d-flex align-items-center text-muted"
                              style={{ height: "38px" }}
                            >
                              No image available
                            </div>
                          )}
                        </div>
                        <div className="col-md-2">
                          <label>QR Code</label>
                        </div>
                        <div className="col-md-4">
                          <input
                            className="form-control"
                            value={this.state.QRCode}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {this.state.activeTab === "question" && (
                    <>
                      <div className="row mb-3">
                        {/* <div className="col-6">
                          <label>Task Id</label>
                          <input
                            className="form-control"
                            value={this.props.taskId || ""}
                            disabled
                          />
                        </div> */}

                        <div className="col-6">
                          <label>Task Name</label>
                          <input
                            className="form-control"
                            value={this.state.taskName || ""}
                            disabled
                          />
                        </div>
                      </div>

                      <div className="row mb-2">
                        <div className="col-12 d-flex justify-content-end">
                          <Button
                            ClassName="btn btn-success btn-sm"
                            Icon={<i className="fa fa-plus"></i>}
                            Text="Add Question"
                            Action={this.addQuesFields}
                          />
                        </div>
                      </div>

                      {this.state.quesValues.map((item, index) => (
                        <div key={index} className="row mb-3">
                          <div className="col-10">
                            <label>Question Name</label>
                            <input
                              type="text"
                              name="QuestionName"
                              className="form-control"
                              placeholder="Enter Question Name"
                              value={item.QuestionName}
                              onChange={(e) => this.handleQuesChange(index, e)}
                            />
                          </div>

                          <div className="col-2 d-flex align-items-end">
                            {index > 0 && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => this.removeQuesFields(index)}
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  <div className="modal-footer">
                    <button
                      className="btn btn-primary"
                      disabled={!this.isTaskValid() || this.state.isSaving}
                      onClick={this.handleSave}
                    >
                      {this.state.isSaving ? "Saving..." : "Save"}
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

function mapStoreToprops(state, props) {
  return {
    PropertyId: state.Commonreducer.puidn,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    // Add any actions if needed
  };
}

export default connect(mapStoreToprops, mapDispatchToProps)(AddTask);
