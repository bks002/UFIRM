import React, { Component } from "react";
// import ReactDatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
import { setHours, setMinutes } from "date-fns";
import Modal from "react-awesome-modal";
import moment from "moment";
import { th } from "date-fns/locale";
import ApiProvider from "../DataProvider";
import Button from "../../../ReactComponents/Button/Button";
import * as appCommon from "../../../Common/AppCommon.js";
import { CreateValidator, ValidateControls } from "../Validation";
import { ToastContainer, toast } from "react-toastify";
import swal from "sweetalert";
import { DELETE_CONFIRMATION_MSG } from "../../../Contants/Common";
// import EditQuestion from "./EditQuestion";
import ViewQuestionImg from "./ViewQuestionImg";
import ChatBox from "../../Notification Center/ChatBox";
import { getTaskRemarks } from "../../../Services/notificationService";
import { fetchNotifications } from "../../../Services/notificationService";

export default class ViewTask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      taskId: "",
      QuestionName: "",
      QuesId: "",
      QuesData: [],
      editQuesId: "",
      editQuesName: "",
      PageMode: "Home",
      supervisorRemarks: "",
      activeTab: "task",
      showViewQuestionImgModal: false,
      selectedQuestion: null,
      assetName: "",
      assets: [],
      assetBrand: "",
      lastServiceDate: "",
      nextServiceDate: "",
      assetPhoto: null,
      taskRemarks: [],
      loadingRemarks: false,
      selectedFMQuestion: null,
      resolvedTaskDate: null,
      fmSelectedDate: null,
      propertyId: this.props.rowData.PropertyId,
      startDate: props.rowData.DateFrom
        ? moment(props.rowData.DateFrom).format("DD/MM/YYYY")
        : "",

      endDate:
        props.rowData.DateTo &&
        moment(props.rowData.DateTo).isSameOrAfter(props.rowData.DateFrom)
          ? moment(props.rowData.DateTo).format("DD/MM/YYYY")
          : moment(props.rowData.DateFrom).format("DD/MM/YYYY"),
      startTime: this.props.rowData.TimeFrom
        ? moment(this.props.rowData.TimeFrom, ["HH:mm:ss", "HH:mm"]).format(
            "h:mm A",
          )
        : "",

      endTime: this.props.rowData.TimeTo
        ? moment(this.props.rowData.TimeTo, ["HH:mm:ss", "HH:mm"]).format(
            "h:mm A",
          )
        : "",
      remindme: this.props.rowData.RemindMe,
      check: this.props.rowData.AllDay === "Y",
      hasAnyRemarksForQuestion: false,
      propertyData: [],
      subCategory: [],
      categoryData: [],
      selectedCategory: null,
      selectedSubCategory: null,
    };
    this.ApiProvider = new ApiProvider();
  }

  manageProperties = (model, type) => {
    this.ApiProvider.manageProperties(model, type).then((resp) => {
      if (resp.ok && resp.status === 200) {
        resp.json().then((rData) => {
          const propertyData = rData.map((e) => ({
            propertyId: e.PropertyId,
            name: e.Name,
          }));
          this.setState({ propertyData });
        });
      }
    });
  };

  getAllProperties = () => {
    const model = [{ CmdType: "R" }];
    this.manageProperties(model, "R");
  };
  getSubCategory = () => {
    const model = [{ CmdType: "R" }];
    const categoryId = this.state.selectedCategory || 0;

    this.ApiProvider.manageSubCategory(model, "R", categoryId).then((resp) => {
      if (resp.ok && resp.status === 200) {
        resp.json().then((rData) => {
          const subCategory = rData.map((e) => ({
            SubCategoryId: e.SubCategoryId,
            SubCategoryName: e.SubCategoryName,
          }));
          this.setState({ subCategory });
        });
      }
    });
  };

  handleFMDateChange = (e) => {
    const selectedDate = e.target.value;

    this.setState(
      {
        fmSelectedDate: selectedDate,
        resolvedTaskDate: selectedDate, // 🔥 override task date
        taskRemarks: [],
      },
      () => {
        if (this.state.selectedFMQuestion) {
          this.getTaskRemarksForEdit(this.state.selectedFMQuestion);
        }
      },
    );
  };

  getPropertyName = () => {
    const prop = this.state.propertyData.find(
      (p) => String(p.propertyId) === String(this.state.propertyId),
    );
    return prop?.name || "";
  };

  getCategory = () => {
    const model = [{ CmdType: "R" }];
    this.ApiProvider.manageCategory(model, "R").then((resp) => {
      if (resp.ok && resp.status === 200) {
        resp.json().then((rData) => {
          const categoryData = rData.map((e) => ({
            Id: e.catId,
            Name: e.name,
          }));

          this.setState({ categoryData });
        });
      }
    });
  };

  getCategoryName = () => {
    const cat = this.props.categoryData?.find(
      (c) => String(c.Id) === String(this.state.selectedCategory),
    );
    return cat?.Name || "";
  };

  getSubCategoryName = () => {
    const sub = this.state.subCategory?.find(
      (s) => String(s.SubCategoryId) === String(this.state.selectedSubCategory),
    );
    return sub?.SubCategoryName || "";
  };

  resolveTaskDate = async (questionId) => {
    try {
      const { TaskId, PropertyId } = this.props.rowData;

      // Check if ANY remarks ever existed for this question
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
    } catch (e) {
      this.setState(
        {
          hasAnyRemarksForQuestion: false,
          loadingRemarks: true,
        },
        () => {
          this.getTaskRemarksForEdit({ QuesId: questionId });
        },
      );
    }
  };

  getTaskRemarksForEdit = (question) => {
    const selectedQ = question || this.state.selectedFMQuestion;
    if (!selectedQ) return;

    const taskDate = this.state.resolvedTaskDate;
    if (!taskDate) return;

    this.setState({ loadingRemarks: true });

    getTaskRemarks(this.props.rowData.TaskId, selectedQ.QuesId, taskDate)
      .then((data) => {
        this.setState({
          taskRemarks: data || [],
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
    if (!message?.trim()) return;

    const { selectedFMQuestion, resolvedTaskDate, taskRemarks } = this.state;
    if (!selectedFMQuestion || !resolvedTaskDate) return;

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
      CurrentStatus: this.props.rowData?.CurrentStatus || "Actionable",
      SUPdateTime: lastSupRemark?.RemarkDate || resolvedTaskDate,
      TaskDate: resolvedTaskDate,
    };

    await fetch("https://api.urest.in:8096/FMResponse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    this.getTaskRemarksForEdit(selectedFMQuestion);
  };

  getAssets = (propertyId) => {
    var model = [{ CmdType: "R" }];
    model.propertyId = propertyId;

    this.ApiProvider.manageAssets(model, "R").then((resp) => {
      if (resp.ok && resp.status === 200) {
        resp.json().then((rData) => {
          const assets = [
            ...rData.PassedServiceDates,
            ...rData.UpcomingServiceDates,
          ].map((a) => ({
            assetId: a.Id,
            assetName: a.Name,
            assetBrand: a.Brand || a.Manufacturer || "",
            lastServiceDate: a.LastServiceDate,
            nextServiceDate: a.NextServiceDate,
            assetPhoto: a.AssetImage,
            QRCode: a.QRCode,
          }));

          this.setState({ assets }, () =>
            this.populateAssetDetails(this.props.rowData.AssetId),
          );
        });
      }
    });
  };

  populateAssetDetails = (assetId) => {
    const asset = this.state.assets.find(
      (a) => String(a.assetId) === String(assetId),
    );

    if (!asset) return;

    this.setState({
      assetName: asset.assetName,
      assetBrand: asset.assetBrand,
      lastServiceDate: asset.lastServiceDate,
      nextServiceDate: asset.nextServiceDate,
      assetPhoto: asset.assetPhoto,
    });
  };

  getQuesModel = (type, Id, date) => {
    var model = [];
    switch (type) {
      case "R":
        model.push({
          CmdType: type,
          Id: Id,
          date: date,
        });
        break;
      case "U":
        model.push({
          TaskID: this.props.taskId,
          QuestID: this.state.editQuesId,
          QuestionName: this.state.editQuesName,
        });
        break;
      case "D":
        model.push({
          CmdType: type,
          Id: Id,
        });
        console.log(model);
        break;
      default:
    }

    return model;
  };

  manageQues = (model, type) => {
    this.ApiProvider.manageQues(model, type).then((resp) => {
      console.log(resp);
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          console.log(rData);
          switch (type) {
            case "C":
              if (rData === "Created !") {
                appCommon.showtextalert(
                  "Question Saved Successfully!",
                  "",
                  "success",
                );
                console.log("Question Saved Successfully!");
                this.handleCancel();
              }
            case "R":
              let quesData = rData.map((element) => ({
                QuesId: element.QuestID,
                QuesName: element.QuestionName,
                Action: element.Action,
                Remark: element.Remarks,
              }));
              this.setState({ QuesData: quesData });
              break;
            case "D":
              if (rData === "Deleted !") {
                appCommon.showtextalert(
                  "Question Deleted Successfully!",
                  "",
                  "success",
                );
              } else {
                appCommon.showtextalert(rData, "", "error");
              }
              this.getQuestion();
              break;
            case "U":
              if (rData === "sucess !") {
                appCommon.showtextalert(
                  "Question Updated Successfully!",
                  "",
                  "success",
                );
                console.log("Question Saved Successfully!");
                this.handleCancelEditQuestion();
              }
            default:
          }
        });
      }
    });
  };

  getQuestion() {
    var type = "R";
    const taskId = this.props.rowData.TaskId;
    let date = this.props.rowData.UpdatedOn.split("-");
    const updatedOn = `${date[2]}-${date[1]}-${date[0]}`;
    var model = this.getQuesModel(type, taskId, updatedOn);
    this.manageQues(model, type);
  }

  componentDidMount() {
    this.getAllProperties();
    this.getCategory();

    if (this.props.rowData.PropertyId) {
      this.getAssets(this.props.rowData.PropertyId);
    }

    const taskDate = moment(this.props.rowData.DateFrom).format("YYYY-MM-DD");
    this.setState({
      fmSelectedDate: taskDate,
      resolvedTaskDate: taskDate,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // category arrived → set category + subcategory
    if (
      prevState.categoryData !== this.state.categoryData &&
      this.state.categoryData.length &&
      this.state.selectedCategory === null
    ) {
      this.setState({
        selectedCategory: Number(this.props.rowData.TaskCategoryId),
        selectedSubCategory: Number(this.props.rowData.TaskSubCategoryId),
      });
    }

    // 🔥 THIS IS THE MISSING PART
    if (
      prevState.selectedCategory !== this.state.selectedCategory &&
      this.state.selectedCategory
    ) {
      this.getSubCategory(); // refetch correct sub categories
    }
  }

  handleCancel = () => {
    this.props.closeModal();
  };

  removeQuesFields = (QuesId) => {
    console.log(QuesId);
    //debugger
    let myhtml = document.createElement("div");
    myhtml.innerHTML = DELETE_CONFIRMATION_MSG + "</hr>";
    alert: swal({
      buttons: {
        ok: "Yes",
        cancel: "No",
      },
      content: myhtml,
      icon: "warning",
      closeOnClickOutside: false,
      dangerMode: true,
    }).then((value) => {
      switch (value) {
        case "ok":
          this.setState({ QuesId: QuesId }, () => {
            var type = "D";
            var model = this.getQuesModel(type, QuesId);
            this.manageQues(model, type);
          });
          break;
        case "cancel":
          break;
        default:
          break;
      }
    });
  };

  DeleteQuestion = (data) => {
    console.log(data);
    let myhtml = document.createElement("div");
    myhtml.innerHTML = DELETE_CONFIRMATION_MSG + "</hr>";
    alert: swal({
      buttons: {
        ok: "Yes",
        cancel: "No",
      },
      content: myhtml,
      icon: "warning",
      closeOnClickOutside: false,
      dangerMode: true,
    }).then((value) => {
      switch (value) {
        case "ok":
          var type = "D";
          var model = this.getQuesModel(type, data.QuesId);
          this.manageQues(model, type);
          break;
        case "cancel":
          break;
        default:
          break;
      }
    });
  };

  EditQuestion = (data) => {
    this.setState({
      PageMode: "EditQuestion",
      editQuesId: data.QuesId,
      editQuesName: data.QuesName,
    });
  };

  handleCancelEditQuestion = () => {
    this.getQuestion();
    this.setState({
      PageMode: "Home",
    });
  };
  handleUpdateQuestion = () => {
    var type = "U";
    var model = this.getQuesModel(type);
    this.manageQues(model, type);
  };

  handleAddRemarks = () => {
    var type = "C";
    var model = this.getRemarksModel(type);
    this.manageRemarks(model, type);
  };
  getRemindMeText = () => {
    const map = {
      0: "Never",
      5: "5 minutes before",
      15: "15 minutes before",
      30: "30 minutes before",
      60: "1 hour before",
      720: "12 hours before",
    };

    return map[this.props.rowData.RemindMe] || "";
  };

  render() {
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
 `}
        </style>
        <Modal
          visible={this.props.showTaskModal}
          effect="fadeInRight"
          onClickAway={this.props.closeModal}
          width="1000"
        >
          {this.state.PageMode === "Home" && (
            <div className="row">
              <div className="col-12">
                <div className="card card-primary">
                  <div className="card-header">
                    <div className="add-task-header">
                      <h3 className="add-task-title">View Task</h3>
                      <button
                        className="btn btn-tool"
                        onClick={this.props.closeModal}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>

                    <ul className="nav nav-tabs mt-3">
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
                          onClick={() =>
                            this.setState(
                              { activeTab: "question" },
                              this.getQuestion,
                            )
                          }
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
                                this.getQuestion(); // 🔥 same trigger as EditTask
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
                    style={{ height: "450px", overflowY: "scroll" }}
                  >
                    {this.state.activeTab === "task" && (
                      <>
                        {/* Row 1 */}
                        <div className="row mb-3">
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
                              value={this.props.rowData.Name}
                              disabled
                            />
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-md-2">
                            <label>Property</label>
                          </div>
                          <div className="col-md-4">
                            <select
                              className="form-control"
                              value={this.state.propertyId}
                              disabled
                            >
                              {(this.state.propertyData || []).map((e, k) => (
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
                              value={this.props.rowData.Location}
                              disabled
                            />
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-md-2">
                            <label>Category</label>
                          </div>
                          <div className="col-md-4">
                            <select
                              className="form-control"
                              value={this.state.selectedCategory}
                              disabled
                            >
                              {(this.state.categoryData || []).map((e, k) => (
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
                              disabled
                            >
                              {(this.state.subCategory || []).map((e, k) => (
                                <option key={k} value={e.SubCategoryId}>
                                  {e.SubCategoryName}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-md-2">
                            <label>Start Date</label>
                          </div>
                          <div className="col-md-4">
                            <input
                              className="form-control"
                              value={this.state.startDate}
                              disabled
                            />
                          </div>

                          <div className="col-md-2">
                            <label>End Date</label>
                          </div>
                          <div className="col-md-4">
                            <input
                              className="form-control"
                              value={this.state.endDate}
                              disabled
                            />
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-md-2">
                            <label>Assigned To</label>
                          </div>
                          <div className="col-md-4">
                            <input
                              className="form-control"
                              value={this.props.rowData.AssignedTo}
                              disabled
                            />
                          </div>

                          <div className="col-md-2">
                            <label>Repeat</label>
                          </div>
                          <div className="col-md-4">
                            <input
                              className="form-control"
                              value={this.props.rowData.OccurenceView}
                              disabled
                            />
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-md-2">
                            <label>All Day</label>
                          </div>
                          <div className="col-md-4">
                            <input
                              className="form-control"
                              value={this.state.check ? "Yes" : "No"}
                              disabled
                            />
                          </div>
                          <div className="col-md-2">
                            <label>Remind Me</label>
                          </div>
                          <div className="col-md-4">
                            <select
                              className="form-control"
                              value={this.state.remindme}
                              disabled
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

                        <div className="row mb-3">
                          <div className="col-md-2">
                            <label>Start Time</label>
                          </div>
                          <div className="col-md-4">
                            <input
                              className="form-control"
                              value={this.state.startTime}
                              disabled
                            />
                          </div>

                          <div className="col-md-2">
                            <label>End Time</label>
                          </div>
                          <div className="col-md-4">
                            <input
                              className="form-control"
                              value={this.state.endTime}
                              disabled
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {this.state.activeTab === "question" && (
                      <div className="add-task-form">
                        {/* Task name */}
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label>Task Name</label>
                            <input
                              className="form-control"
                              value={this.props.rowData.Name}
                              disabled
                            />
                          </div>
                        </div>

                        {/* Loading state */}
                        {this.state.QuesData.length === 0 && (
                          <p className="text-muted">No questions available.</p>
                        )}

                        {/* Question list */}
                        {(this.state.QuesData || []).map((q) => (
                          <div
                            key={q.QuesId}
                            className="row mb-3 align-items-center"
                          >
                            {/* Question */}
                            <div className="col-md-9">
                              <label className="mb-1">Question</label>
                              <input
                                className="form-control"
                                value={q.QuesName}
                                disabled
                              />
                            </div>

                            {/* ONLY VIEW BUTTON */}
                            <div className="col-md-3 d-flex align-items-center mt-4">
                              <button
                                className="btn btn-info btn-icon"
                                title="View Image"
                                onClick={() =>
                                  this.setState({
                                    showViewQuestionImgModal: true,
                                    selectedQuestion: {
                                      QuesId: q.QuesId,
                                    },
                                  })
                                }
                              >
                                <i className="fa fa-eye" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {this.state.activeTab === "asset" && (
                      <div className="add-task-form">
                        {/* Asset Name */}
                        <div className="row mb-3 align-items-center">
                          <div className="col-md-2">
                            <label>Asset Details</label>
                          </div>
                          <div className="col-md-10">
                            <input
                              className="form-control"
                              value={this.state.assetName || ""}
                              disabled
                            />
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
                              value={this.props.rowData.AssetId || ""}
                              disabled
                            />
                          </div>

                          <div className="col-md-2">
                            <label>Asset Brand</label>
                          </div>
                          <div className="col-md-4">
                            <input
                              className="form-control"
                              value={this.state.assetBrand}
                              disabled
                            />
                          </div>
                        </div>

                        {/* Last / Next Service */}
                        <div className="row mb-3 align-items-center">
                          <div className="col-md-2">
                            <label>Last Service</label>
                          </div>
                          <div className="col-md-4">
                            <input
                              className="form-control"
                              value={this.state.lastServiceDate || ""}
                              disabled
                            />
                          </div>

                          <div className="col-md-2">
                            <label>Next Service</label>
                          </div>
                          <div className="col-md-4">
                            <input
                              className="form-control"
                              value={this.state.nextServiceDate || ""}
                              disabled
                            />
                          </div>
                        </div>

                        {/* Asset Photo + QR */}
                        <div className="row mb-3 align-items-center">
                          <div className="col-md-2">
                            <label>Asset Photo</label>
                          </div>

                          <div className="col-md-4">
                            {this.state.assetPhoto ? (
                              <img
                                src={`data:image/png;base64,${this.state.assetPhoto}`}
                                alt="Asset"
                                style={{ height: "90px" }}
                              />
                            ) : (
                              <div className="form-control text-muted">
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
                              value={this.props.rowData.QRcode || ""}
                              disabled
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {this.state.activeTab === "fmremark" && (
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="d-flex flex-wrap gap-2">
                            {(this.state.QuesData || []).map((q) => (
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
                                      hasAnyRemarksForQuestion: false,
                                      loadingRemarks: true,
                                    },
                                    () => this.resolveTaskDate(q.QuesId),
                                  );
                                }}
                              >
                                {q.QuesName}
                              </button>
                            ))}
                          </div>

                          {/* 📅 DATE PICKER */}
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
                          <p className="text-muted">Loading task remarks…</p>
                        )}

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
                      <Button
                        Id="btnCancel"
                        Text="Close"
                        Action={this.handleCancel}
                        ClassName="btn btn-secondary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

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
