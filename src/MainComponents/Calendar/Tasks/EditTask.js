import React, { Component } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { setHours, setMinutes } from "date-fns";
import Modal from "react-awesome-modal";
import { connect } from "react-redux";
import moment from "moment";
import { th } from "date-fns/locale";
import ApiProvider from "../DataProvider";
import Button from "../../../ReactComponents/Button/Button";
import * as appCommon from "../../../Common/AppCommon.js";
import { CreateValidator, ValidateControls } from "../Validation";
import { ToastContainer, toast } from "react-toastify";
import EditQuestion from "../../Calendar/Tasks/EditQuestion";
import ViewQuestionImg from "../../Calendar/Tasks/ViewQuestionImg";
import ChatBox from "../../Notification Center/ChatBox";
import { getTaskRemarks } from "../../../Services/notificationService";
import { fetchNotifications } from "../../../Services/notificationService";
import { createTaskWithQuestions } from "../../../Services/notificationService";

export default class EditTask extends Component {
  constructor(props) {
    super(props);
    //console.log(props);
    this.state = {
      taskName: props.rowData.Name,
      location: props.rowData.Location,
      categoryId: "",
      subCategoryId: "",
      assignTo: props.rowData.AssignedToId,
      assign: [],
      remindme: "",
      repeat: "",
      check: false, // All Day = No by default
      startDate: new Date(),
      endDate: new Date(),

      // startDate: props.rowData.DateFrom,
      // endDate: props.rowData.DateTo,

      createdOn: moment().format(),
      // startTime: moment().add(moment().minute() > 30 && 1, 'hours').minutes(moment().minute() <= 30 ? 30 : 0).toDate(),
      // endTime: moment().add(moment().minute() > 30 && 1, 'hours').minutes(moment().minute() <= 30 ? 30 : 0).add(30, 'm').toDate(),
      startTime: props.rowData.TimeFrom
        ? moment(props.rowData.TimeFrom, "HH:mm:ss").toDate()
        : null,

      endTime: props.rowData.TimeTo
        ? moment(props.rowData.TimeTo, "HH:mm:ss").toDate()
        : null,
      selectedCategory: props.rowData.TaskCategoryId,
      selectedSubCategory: props.rowData.TaskSubCategoryId,
      subCategory: [],
      assets: [],
      assetId: props.rowData.AssetId,
      QRCode: props.rowData.QRcode,
      taskData: [],
      occurence: this.props.rowData.Occurence,
      propertyData: [],
      propertyId: props.rowData.PropertyId,
      activeTab: "task",
      assetBrand: "",
      assetPhoto: null,
      lastServiceDate: null,
      nextServiceDate: null,
      QuesData: [],
      loadingQuestions: false,
      showEditQuestionModal: false,
      showViewQuestionImgModal: false,
      selectedQuestion: null,
      fmRemarks: [],
      fmStatus: "Actionable",
      taskRemarks: [],
      loadingRemarks: false,
      selectedFMQuestion: null, // { QuesId, QuestionName }
      resolvedTaskDate: null,
      fmSelectedDate: null,
      hasAnyRemarksForQuestion: false,
      saving: false,
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

  getAssignModel = (type) => {
    var model = [];
    switch (type) {
      case "R":
        model.push({
          CmdType: type,
          PropertyId: this.state.propertyId ? this.state.propertyId : 0,
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
          Id: parseInt(this.props.rowData.TaskId),
          CategoryId: parseInt(this.state.selectedCategory),
          SubCategoryId: parseInt(this.state.selectedSubCategory),
          Name: this.state.taskName,
          Description: "Desc",
          DateFrom: this.state.startDate,
          DateTo: this.state.endDate,
          TimeFrom: this.state.startTime.toString().split(" GMT")[0],
          TimeTo: this.state.endTime.toString().split(" GMT")[0],
          Remarks: "remarks",
          Occurence: this.state.occurence,
          CreatedBy: 1,
          CreatedOn: this.state.createdOn,
          AssignTo: parseInt(this.state.assignTo),
          RemindMe: this.state.remindme,
          Location: this.state.location,
          AssetsId: parseInt(this.state.assetId),
          QRCode: this.state.QRCode,
          Type: type,
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
                  "success",
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
          assetsData = [
            ...rData.PassedServiceDates,
            ...rData.UpcomingServiceDates,
          ].map((element) => ({
            assetId: element.Id,
            assetName: element.Name,
            assetBrand: element.Brand || element.Manufacturer || "",
            lastServiceDate: element.LastServiceDate || null,
            nextServiceDate: element.NextServiceDate || null,
            assetPhoto: element.AssetImage || null,
            QRCode: element.QRCode || "",
          }));

          // rData.forEach((element) => {
          //   assetsData.push({
          //     assetId: element.Id,
          //     assetName: element.Name,
          //   });
          // });
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

  manageProperties = (model, type) => {
    this.ApiProvider.manageProperties(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
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

  getAssets(propId) {
    var type = "R";
    var model = this.getModel(type);
    model.propertyId = propId;
    console.log(model);
    this.manageAssets(model, type);
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
    // console.log(model);
    // this.getAssets(model);
  }

  handleSave = async (e) => {
    e.preventDefault();

    if (this.state.saving) return;

    if (!this.hasAtLeastOneQuestion()) {
      appCommon.showtextalert(
        "Please add at least one question before saving.",
        "",
        "warning",
      );
      return;
    }

    this.setState({ saving: true });

    try {
      // 🧱 TASK payload (EDIT mode)
      const taskPayload = {
        Id: this.props.rowData.TaskId, // 🔥 EXISTING TASK ID
        CategoryId: parseInt(this.state.selectedCategory),
        SubCategoryId: parseInt(this.state.selectedSubCategory),
        Name: this.state.taskName,
        Description: "Desc",
        DateFrom: this.state.startDate,
        DateTo: this.state.endDate,
        TimeFrom: this.state.startTime,
        TimeTo: this.state.endTime,
        Remarks: "remarks",
        Occurence: this.state.occurence,
        CreatedBy: 1,
        CreatedOn: this.state.createdOn,
        AssignTo: parseInt(this.state.assignTo),
        RemindMe: this.state.remindme,
        Location: this.state.location,
        AssetsID: this.state.assetId ? parseInt(this.state.assetId) : 0,
        QRCode: this.state.QRCode,
        Type: "U", // 🔥 UPDATE
      };

      // 🧱 QUESTIONS payload
      const questionsPayload = this.state.QuesData.map((q) => ({
        QuestionName: q.QuestionName,
      }));

      // 🧠 FINAL payload (same shape as AddTask)
      const payload = {
        Task: taskPayload,
        Questions: questionsPayload,
      };

      // 🚀 SINGLE API CALL
      await createTaskWithQuestions(payload);

      // ✅ SUCCESS
      appCommon.showtextalert("Task updated successfully!", "", "success");

      this.props.closeModal();
    } catch (err) {
      console.error("Edit task failed:", err);
      appCommon.showtextalert(
        "Error while updating task",
        err.message || "Something went wrong",
        "error",
      );
      this.setState({ saving: false });
    }
  };

  handleCancel = () => {
    this.props.closeModal();
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedCategory !== this.state.selectedCategory) {
      this.getSubCategory();
    }
    if (prevState.propertyId !== this.state.propertyId) {
      this.getAssign();
      this.getAssets(this.state.propertyId);
    }
    if (prevState.assets !== this.state.assets && this.state.assetId) {
      this.populateAssetDetails(this.state.assetId);
    }
  }

  componentDidMount() {
    this.getAssign();
    this.getSubCategory();
    this.getAllProperties();

    // 🔥 THIS IS THE MISSING PART
    if (this.state.propertyId) {
      this.getAssets(this.state.propertyId);
    }

    const taskDate = this.props.rowData.DateFrom;

    this.setState({
      fmSelectedDate: taskDate,
      resolvedTaskDate: taskDate,
    });
  }

  handleAssetChange = (e) => {
    const assetId = e.target.value;

    // 👇 If user selects "Select Asset"
    if (!assetId) {
      this.setState({
        assetId: "",
        assetBrand: "",
        lastServiceDate: null,
        nextServiceDate: null,
        assetPhoto: null,
        QRCode: "",
      });
      return;
    }

    this.setState({ assetId }, () => this.populateAssetDetails(assetId));
  };

  populateAssetDetails = (assetId) => {
    if (!assetId || !this.state.assets.length) return;

    const selectedAsset = this.state.assets.find(
      (a) => String(a.assetId) === String(assetId),
    );

    if (!selectedAsset) return;

    this.setState({
      assetBrand: selectedAsset.assetBrand || "",
      lastServiceDate: selectedAsset.lastServiceDate
        ? new Date(selectedAsset.lastServiceDate)
        : null,
      nextServiceDate: selectedAsset.nextServiceDate
        ? new Date(selectedAsset.nextServiceDate)
        : null,
      assetPhoto: selectedAsset.assetPhoto || null,
      QRCode: selectedAsset.QRCode || "",
    });
  };

  getQuesModel = (type, Id) => {
    let date = this.props.rowData.UpdatedOn
      ? this.props.rowData.UpdatedOn.split("-")
      : null;

    const updatedOn = date ? `${date[2]}-${date[1]}-${date[0]}` : null;

    return [
      {
        CmdType: type,
        Id: Id,
        date: updatedOn, // 🔥 REQUIRED
      },
    ];
  };

  manageQues = (model, type) => {
    this.ApiProvider.manageQues(model, type).then(async (resp) => {
      if (!resp.ok) return;

      let rData = null;

      try {
        const text = await resp.text(); // 👈 SAFE
        rData = text ? JSON.parse(text) : [];
      } catch (err) {
        console.warn("Question API returned non-JSON:", err);
        rData = [];
      }

      if (type === "R") {
        const quesData = Array.isArray(rData)
          ? rData.map((q) => ({
              QuesId: q.QuestID,
              QuestionName: q.QuestionName,
              Action: q.Action,
              Remark: q.Remarks,
            }))
          : [];

        this.setState(
          {
            QuesData: quesData,
            loadingQuestions: false,
          },
          () => {},
        );
      }

      if (type === "D") {
        if (rData === "Deleted !" || rData === "Deleted!") {
          appCommon.showtextalert(
            "Question Deleted Successfully!",
            "",
            "success",
          );
        }
        this.getQuestions();
      }
    });
  };

  getQuestions = () => {
    this.setState({ loadingQuestions: true });
    const model = this.getQuesModel("R", this.props.rowData.TaskId);
    this.manageQues(model, "R");
  };

  handleFMSend = async (message) => {
    if (!message.trim()) return;

    const payload = {
      TaskId: this.props.rowData.TaskId,
      RemarkHtml: `FM: ${message}`,
    };

    try {
      const resp = await this.ApiProvider.addTaskRemark(payload);

      if (!resp.ok) throw new Error("Remark failed");

      const savedRemark = await resp.json();

      this.setState((prev) => ({
        fmRemarks: [...prev.fmRemarks, savedRemark],
      }));
    } catch (err) {
      swal({
        icon: "error",
        title: "Error",
        text: "Unable to send remark",
      });
    }
  };

  getTaskRemarksForEdit = (question) => {
    const selectedQ = question || this.state.selectedFMQuestion;
    if (!selectedQ) return;

    const taskDate = this.getNormalizedTaskDate();
    if (!taskDate) return;

    this.setState({ loadingRemarks: true });

    getTaskRemarks(this.props.rowData.TaskId, selectedQ.QuesId, taskDate)
      .then((data) => {
        this.setState({
          taskRemarks: data || [], // ✅ DO NOT TOUCH SHAPE
          loadingRemarks: false,
        });
      })
      .catch(() => {
        this.setState({
          taskRemarks: [],
          loadingRemarks: false,
        });
      });
  };

  sendFMRemark = async (message, status) => {
    if (!message?.trim()) {
      swal({
        icon: "warning",
        title: "Message required",
        text: "Please type a message before sending.",
      });
      return;
    }

    const { selectedFMQuestion, resolvedTaskDate, taskRemarks } = this.state;
    if (!selectedFMQuestion || !resolvedTaskDate) return;

    // 🔥 REQUIRED by backend
    const lastSupRemark = taskRemarks.find((r) =>
      r.RemarkHtml?.includes("SUP:"),
    );

    const payload = {
      TaskId: this.props.rowData.TaskId,
      QuestionId: selectedFMQuestion.QuesId,
      TaskName: this.props.rowData.Name,
      FmId: 0,
      FmRemark: message,
      FmDateTime: new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      }),
      CurrentStatus: status,
      SUPdateTime: lastSupRemark?.RemarkDate || resolvedTaskDate, // 🔥 FIX
      TaskDate: resolvedTaskDate,
    };

    try {
      const res = await fetch("https://api.urest.in:8096/FMResponse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        console.error("FMResponse failed:", t);
        throw new Error("FM reply failed");
      }

      // reload chat
      this.getTaskRemarksForEdit(selectedFMQuestion);
    } catch (err) {
      swal({
        icon: "error",
        title: "Error",
        text: "Unable to send remark",
      });
    }
  };

  isEditTaskValid = () => {
    const {
      taskName,
      selectedCategory,
      selectedSubCategory,
      assignTo,
      occurence,
      location,
    } = this.state;

    return (
      taskName?.trim() !== "" &&
      selectedCategory &&
      selectedSubCategory &&
      assignTo &&
      occurence &&
      location?.trim() !== ""
    );
  };

  hasAtLeastOneQuestion = () => {
    return this.state.QuesData.some(
      (q) => q.QuestionName && q.QuestionName.trim() !== "",
    );
  };

  getNormalizedTaskDate = () => {
    return this.state.resolvedTaskDate;
  };

  resolveTaskDate = async (questionId) => {
    try {
      const { TaskId, PropertyId } = this.props.rowData;

      const list = await fetchNotifications("task", PropertyId);

      const hasAny = list.some(
        (n) => n.TaskId === TaskId && n.QuestionId === questionId,
      );

      this.setState(
        {
          hasAnyRemarksForQuestion: hasAny,
          loadingRemarks: true,
        },
        () => this.getTaskRemarksForEdit({ QuesId: questionId }),
      );
    } catch {
      this.setState(
        {
          hasAnyRemarksForQuestion: false,
          loadingRemarks: true,
        },
        () => this.getTaskRemarksForEdit({ QuesId: questionId }),
      );
    }
  };

  handleFMDateChange = (e) => {
    const selectedDate = e.target.value;

    this.setState(
      {
        fmSelectedDate: selectedDate,
        resolvedTaskDate: selectedDate,
        taskRemarks: [],
      },
      () => {
        if (this.state.selectedFMQuestion) {
          this.getTaskRemarksForEdit(this.state.selectedFMQuestion);
        }
      },
    );
  };

  render() {
    // console.log(this.props)
    return (
      <div>
        <style>
          {`
          .card-header .nav-tabs {
  border-bottom: 1px solid #dee2e6;
}
  .btn-icon {
  height: 38px; /* matches Bootstrap input height */
  width: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
/* ===== MAIN TITLE ROW ===== */
.add-task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: linear-gradient(135deg, #1f4f6d, #2f6f96);
  border-radius: 4px 4px 0 0;
}

.add-task-title {
  font-size: 22px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.5px;
  margin: 0;
}

.add-task-close i {
  color: #ffffff;
  font-size: 18px;
}

/* ===== TABS ROW ===== */
.card-header {
  padding: 0;
  background: #2f5f7f;
}

.card-header .nav-tabs {
  padding: 6px 12px 0;
  border-bottom: none;
  background: rgba(0, 0, 0, 0.08);
}

.card-header .nav-tabs .nav-link {
  font-size: 14px;
  font-weight: 500;
  color: #dbe7f0;
  border: none;
  padding: 8px 16px;
}

.card-header .nav-tabs .nav-link.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 4px 4px 0 0;
}
  /* Make tabs feel clickable */
.card-header .nav-tabs .nav-link {
  cursor: pointer;
}

/* Optional: slightly clearer hover feedback */
.card-header .nav-tabs .nav-link:hover {
  background: rgba(255, 255, 255, 0.12);
}
  select option[value=""] {
  color: #9aa0a6;
}
  .placeholder-select {
  color: #9aa0a6 !important;
}

.placeholder-select option {
  color: #000; /* dropdown items stay normal */
}
 `}
        </style>
        <Modal
          visible={this.props.showEditModal}
          effect="fadeInRight"
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
                  <div className="add-task-header">
                    <h3 className="add-task-title">Edit Task</h3>
                    <button
                      className="btn btn-tool add-task-close"
                      onClick={this.props.closeModal}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  <ul className="nav nav-tabs mt-3">
                    <li className="nav-item">
                      <a
                        className={`nav-link ${
                          this.state.activeTab === "task" ? "active" : ""
                        }`}
                        onClick={() => this.setState({ activeTab: "task" })}
                      >
                        Task Details
                      </a>
                    </li>

                    <li className="nav-item">
                      <a
                        className={`nav-link ${
                          this.state.activeTab === "question" ? "active" : ""
                        }`}
                        onClick={() =>
                          this.setState(
                            { activeTab: "question" },
                            this.getQuestions,
                          )
                        }
                      >
                        Question Details
                      </a>
                    </li>

                    <li className="nav-item">
                      <a
                        className={`nav-link ${
                          this.state.activeTab === "asset" ? "active" : ""
                        }`}
                        onClick={() =>
                          this.setState({ activeTab: "asset" }, () =>
                            this.populateAssetDetails(this.state.assetId),
                          )
                        }
                      >
                        Asset Details
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className={`nav-link ${this.state.activeTab === "fmremark" ? "active" : ""}`}
                        onClick={() =>
                          this.setState(
                            {
                              activeTab: "fmremark",
                              selectedFMQuestion: null,
                              taskRemarks: [],
                            },
                            () => {
                              this.getQuestions();
                            },
                          )
                        }
                      >
                        FM Remark
                      </a>
                    </li>
                  </ul>
                </div>

                <div
                  className="card-body"
                  style={{
                    maxHeight: "calc(100vh - 130px)",
                    overflowY: "auto",
                  }}
                >
                  {this.state.activeTab === "task" && (
                    <>
                      {/* ===== Row 1: Task Id + Task Name ===== */}
                      <div className="row mb-3 align-items-center">
                        <div className="col-md-2">
                          <label>Task Id</label>
                        </div>
                        <div className="col-md-4">
                          <input
                            className="form-control"
                            value={this.props.rowData.TaskId}
                            disabled
                          />
                        </div>

                        <div className="col-md-2">
                          <label>Task Name</label>
                        </div>
                        <div className="col-md-4">
                          <input
                            className="form-control"
                            value={this.state.taskName}
                            onChange={(e) =>
                              this.setState({ taskName: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      {/* ===== Row 2: Property + Location ===== */}
                      <div className="row mb-3 align-items-center">
                        <div className="col-md-2">
                          <label>Property</label>
                        </div>
                        <div className="col-md-4">
                          <select
                            className="form-control"
                            disabled
                            value={this.state.propertyId}
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
                            value={this.state.location}
                            onChange={(e) =>
                              this.setState({ location: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      {/* ===== Row 3: Category + Sub Category ===== */}
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

                      {/* ===== Row 4: Start Date + End Date ===== */}
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
                      {/* ===== Row 5: All Day + Start / End Time + Remind Me ===== */}
                      <div className="row mb-3 align-items-center">
                        <div className="col-md-2">
                          <label>All Day</label>
                        </div>
                        <div className="col-md-2">
                          <label className="switch mb-0">
                            <input
                              type="checkbox"
                              checked={this.state.check}
                              disabled
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
                          <label>Start Time</label>
                          <ReactDatePicker
                            className="form-control"
                            selected={this.state.startTime}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            dateFormat="h:mm a"
                            onChange={(date) =>
                              this.setState({
                                startTime: date,
                                endTime: moment(date).add(30, "m").toDate(),
                              })
                            }
                            disabled={this.state.check}
                          />
                        </div>

                        <div className="col-md-2">
                          <label>End Time</label>
                          <ReactDatePicker
                            className="form-control"
                            selected={this.state.endTime}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            dateFormat="h:mm a"
                            onChange={(date) =>
                              this.setState({ endTime: date })
                            }
                            disabled={this.state.check}
                            minTime={moment(this.state.startTime)
                              .add(30, "m")
                              .toDate()}
                            maxTime={setHours(
                              setMinutes(this.state.startTime, 45),
                              23,
                            )}
                          />
                        </div>

                        <div className="col-md-2">
                          <label>Remind Me</label>
                          <select
                            className="form-control"
                            value={this.state.remindme}
                            disabled
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
                      {/* ===== Row 6: Assign To + Repeat ===== */}
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
                            <option value="N">Do not repeat</option>
                            <option value="D">Daily</option>
                            <option value="W">Weekly</option>
                            <option value="M">Monthly</option>
                            <option value="Y">Yearly</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ================= QUESTION DETAILS TAB ================= */}
                  {this.state.activeTab === "question" && (
                    <div className="add-task-form">
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label>Task Name</label>
                          <input
                            className="form-control"
                            value={this.state.taskName}
                            disabled
                          />
                        </div>

                        <div className="col-md-6 text-right">
                          <button
                            className="btn btn-success mt-4"
                            onClick={() =>
                              this.setState({
                                showEditQuestionModal: true,
                                selectedQuestion: null,
                              })
                            }
                          >
                            Add Question +
                          </button>
                        </div>
                      </div>

                      {/* ===== Loading ===== */}
                      {this.state.loadingQuestions && (
                        <p className="text-muted">Loading questions...</p>
                      )}

                      {/* ===== Question list ===== */}
                      {!this.state.loadingQuestions &&
                        this.state.QuesData.map((q) => (
                          <div
                            key={q.QuesId}
                            className="row mb-3 align-items-center"
                          >
                            {/* Question input */}
                            <div className="col-md-9">
                              <label className="mb-1">Question</label>
                              <input
                                className="form-control"
                                value={q.QuestionName}
                                disabled
                              />
                            </div>

                            {/* Action buttons */}
                            <div className="col-md-3 d-flex align-items-center gap-2 mt-4">
                              {/* 👁 VIEW IMAGE */}
                              <button
                                className="btn btn-info btn-icon"
                                onClick={() => {
                                  this.setState({
                                    selectedQuestion: {
                                      QuesId: q.QuesId,
                                      TaskId: this.props.rowData.TaskId,
                                    },
                                    showViewQuestionImgModal: true,
                                  });
                                }}
                              >
                                <i className="fa fa-eye" />
                              </button>

                              {/* ✏️ EDIT QUESTION */}
                              <button
                                className="btn btn-success btn-icon"
                                onClick={() =>
                                  this.setState({
                                    showEditQuestionModal: true,
                                    selectedQuestion: q,
                                  })
                                }
                              >
                                <i className="fa fa-edit" />
                              </button>

                              {/* 🗑 DELETE QUESTION */}
                              <button
                                className="btn btn-danger btn-icon"
                                onClick={() => {
                                  swal({
                                    title: "Delete Question?",
                                    text: "This question will be removed. You can save to apply changes.",
                                    icon: "warning",
                                    buttons: ["Cancel", "Delete"],
                                    dangerMode: true,
                                  }).then((ok) => {
                                    if (!ok) return;

                                    this.setState((prev) => ({
                                      QuesData: prev.QuesData.filter(
                                        (item) => item.QuesId !== q.QuesId,
                                      ),
                                    }));
                                  });
                                }}
                              >
                                <i className="fa fa-trash" />
                              </button>
                            </div>
                          </div>
                        ))}

                      {/* ===== Empty state ===== */}
                      {!this.state.loadingQuestions &&
                        this.state.QuesData.length === 0 && (
                          <p className="text-muted">
                            No questions added for this task.
                          </p>
                        )}
                    </div>
                  )}

                  {/* ================= ASSET DETAILS TAB ================= */}
                  {this.state.activeTab === "asset" && (
                    <div className="add-task-form">
                      {/* Asset selection */}
                      <div className="row mb-3 align-items-center">
                        <div className="col-md-2">
                          <label>Asset Name</label>
                        </div>
                        <div className="col-md-10">
                          <select
                            className={`form-control ${!this.state.assetId ? "placeholder-select" : ""}`}
                            value={this.state.assetId || ""}
                            onChange={this.handleAssetChange}
                          >
                            <option value="">Select Asset</option>
                            {this.state.assets.map((a, k) => (
                              <option key={k} value={a.assetId}>
                                {a.assetName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Asset ID + Brand */}
                      <div className="row mb-3 align-items-center">
                        <div className="col-md-2">
                          <label>Asset ID</label>
                        </div>
                        <div className="col-md-4">
                          <input
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

                      {/* Service dates */}
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

                      {/* Asset photo + QR */}
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

                  {this.state.activeTab === "fmremark" && (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex flex-wrap gap-2">
                          {this.state.QuesData.map((q) => (
                            <button
                              key={q.QuesId}
                              className={`btn btn-sm ${
                                this.state.selectedFMQuestion?.QuesId ===
                                q.QuesId
                                  ? "btn-primary"
                                  : "btn-outline-primary"
                              }`}
                              onClick={() => {
                                this.setState(
                                  {
                                    selectedFMQuestion: q,
                                    taskRemarks: [],
                                    loadingRemarks: true,
                                    hasAnyRemarksForQuestion: false,
                                  },
                                  () => this.resolveTaskDate(q.QuesId),
                                );
                              }}
                            >
                              {q.QuestionName}
                            </button>
                          ))}
                        </div>

                        <input
                          type="date"
                          className="form-control"
                          style={{ maxWidth: "180px" }}
                          value={this.state.fmSelectedDate || ""}
                          onChange={this.handleFMDateChange}
                          disabled={!this.state.selectedFMQuestion}
                        />
                      </div>

                      {this.state.loadingRemarks && (
                        <p className="text-muted mb-2">Loading task remarks…</p>
                      )}

                      {/* 🔹 ChatBox ONLY when question selected */}
                      {this.state.selectedFMQuestion && (
                        <ChatBox
                          remarks={this.state.taskRemarks}
                          status={
                            this.props.rowData?.CurrentStatus || "Actionable"
                          }
                          context="task"
                          onSend={this.sendFMRemark}
                        />
                      )}

                      {this.state.selectedFMQuestion &&
                        !this.state.loadingRemarks &&
                        this.state.taskRemarks.length === 0 && (
                          <p className="text-muted mt-2">
                            {this.state.hasAnyRemarksForQuestion
                              ? "No remarks available for the selected date."
                              : "No remarks have been exchanged for this question yet."}
                          </p>
                        )}

                      {!this.state.selectedFMQuestion && (
                        <p className="text-muted">
                          Select a question to view FM remarks.
                        </p>
                      )}
                    </>
                  )}

                  <div className="modal-footer">
                    <button
                      className="btn btn-primary"
                      disabled={
                        !this.isEditTaskValid() ||
                        !this.hasAtLeastOneQuestion() ||
                        this.state.saving
                      }
                      onClick={this.handleSave}
                    >
                      {this.state.saving ? "Saving..." : "Save"}
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={this.handleCancel}
                    >
                      Cancel
                    </button>
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

        {/* ===== VIEW QUESTION IMAGE MODAL ===== */}
        {this.state.showViewQuestionImgModal && (
          <ViewQuestionImg
            showEditQuestionModel={this.state.showViewQuestionImgModal}
            closeModal={() =>
              this.setState({ showViewQuestionImgModal: false })
            }
            rowData={{
              TaskId: this.props.rowData.TaskId,
              QuesId: this.state.selectedQuestion?.QuesId,
              CreatedOn:
                this.props.rowData.UpdatedOn || this.props.rowData.CreatedOn,
            }}
          />
        )}

        {/* ===== EDIT QUESTION MODAL ===== */}
        {this.state.showEditQuestionModal && (
          <EditQuestion
            showEditQuestionModel={this.state.showEditQuestionModal}
            closeModal={() => this.setState({ showEditQuestionModal: false })}
            rowData={{
              TaskId: this.props.rowData.TaskId,
              ...this.state.selectedQuestion,
            }}
            onQuestionSave={(question) => {
              this.setState((prev) => {
                const exists = prev.QuesData.some(
                  (q) => q.QuesId === question.QuesId,
                );

                return {
                  QuesData: exists
                    ? prev.QuesData.map((q) =>
                        q.QuesId === question.QuesId ? question : q,
                      )
                    : [...prev.QuesData, question],
                };
              });
            }}
          />
        )}
      </div>
    );
  }
}
