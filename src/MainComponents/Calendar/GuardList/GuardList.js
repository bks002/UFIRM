import React, { Component } from "react";
import moment from "moment";
import LoadingOverlay from "react-loading-overlay";
import { PropagateLoader } from "react-spinners";
import Button from "../../../ReactComponents/Button/Button";
import DataTable from "../../../ReactComponents/ReactTable/DataTable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ApiProvider from "../DataProvider";
import * as appCommon from "../../../Common/AppCommon.js";
import AddTask from "../Tasks/AddTask";
import {getFrequencyList} from "../../../Services/masterService";
import {bindActionCreators} from "redux";
import departmentAction from "../../../redux/department/action";
import {connect} from "react-redux";
import { downloadExcel } from "react-export-table-to-excel";

const $ = window.$;

class GuardList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          Header: "Task Id",
          accessor: "TaskId",
        },
        {
          Header: "Task Name",
          accessor: "Name",
        },
        {
          Header: "Date",
          accessor: "UpdatedOn",
        },
        {
          Header: "Frequency",
          accessor: "OccurenceView",
        },
        {
          Header: "Task Status",
          accessor:"TaskStatus"
        },
        {
          Header: "Task Priority",
          accessor: "TaskPriority",
        },
        {
          Header: "Remarks",
          accessor:"Remarks"
        },
      ],
      data: [],
      loading: false,
      PageMode: "Home",
      showAddModal: false,
      guardId: "",
      filtered: false,
      filterFromDate:'',
      filterToDate:'',
      startDate :moment().clone().startOf("month"),
      endDate :moment().clone().startOf("month"),
      categories: [],
      subCategories: [],
      filteredSubCategories: [],
      selectedCategory: 0,
      selectedSubCategory:0,
      frequencies: [],
      selectedFrequency:0,
      statusList: [
        { value: "Pending", label: "Pending" },
        { value: "Complete", label: "Complete" },
        { value: "Actionable", label: "Actionable" },
      ],
      selectedStatus:"None",
      priorityList: [],
      selectedPriority:0,
      assignToList: [],
      selectedUser:0,
      filtersApplied: false,
      fromDate: null,
      toDate: null,
      viewMode: "panel",
      selectedTaskId: 0,
      searchText: "",
      completedTasks: 0,
      pendingTasks: 0,
      actionableTasks: 0,
      showCelebration: false,
      celebrationType: "",
      celebrationText: "",
      celebrationCount: 0,
    };
    this.ApiProvider = new ApiProvider();
  }

  getModel = (type, categoryId, subCategoryId,assignTo,occurance,startDate,endDate,taskStatus,propertyId,taskPriority) => {
    var model = [];
    switch (type) {
      case "R":
        model.push({
          CmdType: type,
          CategoryId: categoryId,
          SubCategoryId: subCategoryId,
          AssignedTo: assignTo,
          Occurrence: occurance,
          DteFr : startDate,
          DteTo : endDate,
          TaskStatus : taskStatus,
          PropertyId : propertyId,
          TaskPriority:taskPriority
        });
        break;
      default:
    }
    return model;
  };

  getAllFrenquency= async()=>{
    try {
      this.setState({ loading: true }); // Show loading before fetching data
      const data = await getFrequencyList();
      this.setState({ frequencies: data, loading: false });
    } catch (error) {
      console.error('Error fetching frequency:', error);
      this.setState({ loading: false });
    }
  }

  manageCategory = (model, type) => {
    this.ApiProvider.manageCategory(model, type).then((resp) => {
      if (resp.ok && resp.status === 200) {
        return resp.json().then((rData) => {
          let catData = [];
          rData.forEach((element) => {
            catData.push({
              Id: element.catId,
              Name: element.name,
            });
          });
          switch (type) {
            case "R":
              this.setState({ categories: catData });
              break;
            default:
          }
        });
      }
    });
  };

  manageSubCategory = (model, type, categoryId) => {
    this.ApiProvider.manageSubCategory(model, type, categoryId).then((resp) => {
      if (resp.ok && resp.status === 200) {
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
              this.setState({ subCategories: subCatData });
              break;
            default:
          }
        });
      }
    });
  };

  manageTaskPriority = (model, type) => {
    this.ApiProvider.manageTaskPriority(model, type).then((resp) => {
      if (resp.ok && resp.status === 200) {
        return resp.json().then((rData) => {
          let taskPriorityList = [];
          rData.forEach((element) => {
            taskPriorityList.push({
              Id: element.Id,
              Name: element.Name,
            });
          });
          switch (type) {
            case "R":
              this.setState({ priorityList: taskPriorityList });
              break;
            default:
          }
        });
      }
    });
  };

  manageDashboardAssign = (model, type) => {
    this.ApiProvider.manageDashboardAssign(model, type).then((resp) => {
      if (resp.ok && resp.status === 200) {
        return resp.json().then((rData) => {
          let assignData = [];
          rData.forEach((element) => {
            assignData.push({
              Id: element.Id,
              Name: element.Name,
            });
          });
          switch (type) {
            case "R":
              this.setState({ assignToList: assignData });
              break;
            default:
          }
        });
      }
    });
  };

  manageTask = (model, type) => {
    if(this.state.filtersApplied){
      this.setState({ loading: true });
      this.ApiProvider.manageTask(model, type).then((resp) => {
        if (resp.ok && resp.status === 200) {
          return resp.json().then((rData) => {
            switch (type) {
              case "R":
                let taskData = [];
                rData.forEach((element) => {
                  taskData.push({
                    Id: element.Id,
                    TaskId: element.TaskId,
                    TaskCategoryId: element.TaskCategoryId,
                    TaskSubCategoryId: element.TaskSubCategoryId,
                    Name: element.Name,
                    Description: element.Description,
                    DateFrom: element.DateFrom.split("T")[0],
                    DateTo: element.DateTo.split("T")[0],
                    TimeFrom: element.TimeFrom.split("T")[1],
                    TimeTo: element.TimeTo.split("T")[1],
                    Remarks: element.Remarks,
                    TaskStatus:element.TaskStatus,
                    OccurenceView: element.Occurence.split(" ")[0] ,
                    // OccurenceView: this.modifyOccurence(element.Occurence.split(" ")[0]) ,
                    CategoryName: element.CategoryName,
                    SubCategoryName: element.SubCategoryName,
                    Location:element.Location,
                    EntryType: element.EntryType,
                    AssignedTo: element.AssignedTo,
                    AssignedToId:element.AssignedToId,
                    QRcode: element.QRCode,
                    UpdatedOn : element.UpdatedOn,
                    PropertyId:element.PropertyId,
                    AssetId:element.AssetId,
                    TaskPriority : element.TaskPriority
                  });
                });
                this.countTasksByStatus(taskData);
                this.setState({ data: taskData, loading: false });
                break;
              case "D":
                if (rData === "Deleted !") {
                  appCommon.showtextalert(
                      "Task Deleted Successfully!",
                      "",
                      "success"
                  );
                } else {
                  appCommon.showtextalert("Someting went wrong !", "", "error");
                }
                this.getTasks();
                break;
              default:
            }
          });
        }
      });
    }

  };

  countTasksByStatus = (data) => {
    let completedTasks = 0;
    let pendingTasks = 0;
    let actionableTasks = 0;
    data.forEach((element) => {
      const status = (element.TaskStatus || "").toLowerCase();
      if (status === "completed" || status === "complete") completedTasks += 1;
      if (status === "pending") pendingTasks += 1;
      if (status === "actionable") actionableTasks += 1;
    });
    this.setState({ completedTasks, pendingTasks, actionableTasks });
  };

  getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "complete") return "completed";
    if (s === "pending") return "pending";
    if (s === "actionable") return "actionable";
    return "";
  };

  getActiveTask = (dataSource = this.state.data) => {
    const { selectedTaskId } = this.state;
    if (!dataSource || dataSource.length === 0) return null;
    return dataSource.find((t) => t.TaskId === selectedTaskId) || dataSource[0];
  };

  handleStatusCardClick = (statusType, count) => {
    const statusMap = {
      completed: "Complete",
      pending: "Pending",
      actionable: "Actionable",
    };
    this.setState(
      {
        selectedStatus: statusMap[statusType] || "None",
        filtersApplied: true,
        showCelebration: true,
        celebrationType: statusType,
        celebrationCount: count,
        celebrationText:
          statusType === "completed"
            ? "CONGRATULATIONS"
            : statusType === "pending"
              ? "PENDING TASKS"
              : "ACTIONABLE TASKS",
      },
      () => {
        this.getTasks();
        window.clearTimeout(this._celebrateTimer);
        this._celebrateTimer = window.setTimeout(() => {
          this.setState({ showCelebration: false, celebrationType: "" });
        }, 1700);
      },
    );
  };

  handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;

    this.setState({ selectedCategory }, () => {
      this.getSubCategory();
    });
  };

  componentDidMount() {
    this.getCategory();
    this.getAllFrenquency();
    this.getTasksPriority();
    this.getDashboardAssignList()
  }

  componentDidUpdate(prevProps, prevState) {
    if (
        prevState.selectedCategoryId !== this.state.selectedCategoryId &&
        prevState.selectedSubCategory !== this.state.selectedSubCategory
    ) {
      this.getTasks();
    }

    if (prevProps.PropertyVal !== this.props.PropertyVal)
    {
      this.getDashboardAssignList();
      console.log(this.props.PropertyVal)
    }

    if (prevState.data !== this.state.data) {
      if (this.state.data.length === 0 && this.state.selectedTaskId !== 0) {
        this.setState({ selectedTaskId: 0 });
      } else if (
        this.state.data.length > 0 &&
        !this.state.data.some((t) => t.TaskId === this.state.selectedTaskId)
      ) {
        this.setState({ selectedTaskId: this.state.data[0].TaskId });
      }
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this._celebrateTimer);
  }

  getAssignModel = (type) => {
    var model = [];
    switch (type) {
      case "R":
        model.push({
          CmdType: type,
          PropertyId: this.props.PropertyVal ? this.props.PropertyVal : 0,
        });
        break;
      default:
    }
    return model;
  };

  getDashboardAssignList() {
    var type = "R";
    var model = this.getAssignModel(type);
    this.manageDashboardAssign(model, type);
  }

  getCategory() {
    var type = "R";
    var model = this.getModel(type);
    this.manageCategory(model, type);
  }

  getSubCategory() {
    var type = "R";
    var model = this.getModel(type);
    var categoryId = this.state.selectedCategory
        ? this.state.selectedCategory
        : 0;
    this.manageSubCategory(model, type, categoryId);
  }

  getTaskPriorityModel = (type) => {
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

  getTasksPriority() {
    var type = "R";
    var model = this.getTaskPriorityModel(type);
    this.manageTaskPriority(model, type);
  }

  AddNew = () => {
    this.setState({ PageMode: "Add", showAddModal: true });
  };

  closeModal = () => {
    this.setState(
        {
          PageMode: "Home",
          showAddModal: false,
        },
    );
  };

  getTasks() {
    var type = "R";
    var categoryId = this.state.selectedCategory
        ? this.state.selectedCategory
        : 0;
    var subCategoryId = this.state.selectedSubCategory
        ? this.state.selectedSubCategory
        : 0;
    var assignToId = this.state.selectedUser
        ? this.state.selectedUser
        : 0;
    var occurrence = this.state.selectedFrequency ? this.state.selectedFrequency : 0;
    var startDate  = this.state.fromDate ? moment(this.state.fromDate).format("YYYY-MM-DD") :'';
    var endDate  = this.state.toDate ? moment(this.state.toDate).format("YYYY-MM-DD") : '';
    var taskStatus = this.state.selectedStatus === 'None'? '' : this.state.selectedStatus;
    var propertyId = this.props.PropertyVal ? this.props.PropertyVal : 0;
    var taskPriority = this.state.selectedPriority ? this.state.selectedPriority : 0;
    console.log("filter set")
    var model = this.getModel(type, categoryId, subCategoryId, assignToId, occurrence,startDate,endDate,taskStatus,propertyId,taskPriority);
    console.log("got model"+ JSON.stringify(model));
    this.manageTask(model, type);
  }

  handleFilter = () => {
    if (this.props.PropertyVal > 0 || this.state.selectedUser > 0 || this.state.selectedFrequency> 0 || this.state.selectedStatus !== "None")
    {
      console.log(this.props.PropertyVal,this.state.selectedUser,this.state.selectedFrequency,this.state.selectedStatus)
      this.setState({ filtersApplied: true }, () => {
        this.getTasks();
      });

    } else {
      appCommon.showtextalert("", "Please Select Any Filter Attribute", "warning");
    }
  };

  handleReset = () => {
    this.setState({
      filtersApplied: false,
      selectedCategory: 0,
      selectedSubCategory: 0,
      selectedFrequency:0,
      selectedUser:0,
      selectedStatus:"None",
      selectedPriority:0,
      fromDate: null,
      toDate: null,

      propertyId:0,
      completedTasks:0,
      pendingTasks:0,
      actionableTasks:0,
      data:[],
    });
    //this.getTasks();
  };

  handleExport = () => {
    const body = (this.state.data || []).map((d) => ({
      TaskId: d.TaskId,
      Name: d.Name,
      UpdatedOn: d.UpdatedOn,
      Occurence: d.OccurenceView,
      TaskStatus: d.TaskStatus,
      TaskPriority: d.TaskPriority,
      Remarks: d.Remarks,
    }));
    if (!body.length) return;
    downloadExcel({
      fileName: "SpotVisitTasks",
      sheet: "SpotVisit",
      tablePayload: {
        header: Object.keys(body[0]),
        body,
      },
    });
  };


  render() {
    const searchText = (this.state.searchText || "").toLowerCase();
    const filteredData = (this.state.data || []).filter((task) => {
      if (!searchText) return true;
      const haystack = [
        task.TaskId,
        task.Name,
        task.CategoryName,
        task.SubCategoryName,
        task.TaskStatus,
        task.TaskPriority,
        task.Remarks,
        task.UpdatedOn,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(searchText);
    });
    const activeTask = this.getActiveTask(filteredData);
    return (
        <div>
          {this.state.PageMode === "Home" && (
              <div className="row">
                <LoadingOverlay
                    active={this.state.loading}
                    spinner={<PropagateLoader color="#336B93" size={30}/>}
                >
                  <div className="col-12">
                    <div className="card">
                      <style>{`
                        .planner-task-view-toggle { display: inline-flex; border: 1px solid #d4e3ed; border-radius: 8px; overflow: hidden; background: #fff; margin-right: 8px; }
                        .planner-task-view-toggle button { border: none; background: transparent; padding: 6px 12px; font-size: 12px; font-weight: 600; color: #4a7fa8; cursor: pointer; }
                        .planner-task-view-toggle button.active { background: #e8f1f8; color: #1e4a6b; }
                        .planner-task-filter-row { display:flex; gap:8px; flex-wrap:wrap; }
                        .planner-task-filter-chip { display:flex; align-items:center; gap:7px; background:#fff; border:1px solid #d8e6f0; border-radius:7px; padding:0 8px; height:36px; min-width:130px; }
                        .planner-task-filter-chip i { color:#2f9cff; font-size:13px; }
                        .planner-task-filter-input { border: none !important; background: transparent !important; box-shadow: none !important; font-size: 12px !important; height: 32px !important; padding: 0 !important; color:#2b465a; }
                        .planner-task-date-chip { display:flex; align-items:center; gap:8px; background:#f8fbff; border:1px solid #d7e5ef; border-radius:8px; height:36px; padding:0 10px; min-width:220px; }
                        .planner-task-date-chip .date-icon { width:20px; height:20px; border-radius:50%; background:#e8f1f8; color:#1e4a6b; display:flex; align-items:center; justify-content:center; font-size:11px; }
                        .planner-task-btn { height: 34px !important; padding: 0 12px !important; font-size: 12px !important; font-weight: 600 !important; border-radius: 7px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; }
                        .planner-task-search-wrap { width: 250px; margin-right: 10px; }
                        .planner-task-search-wrap input { height: 34px; border-radius: 7px; font-size:12px; border:1px solid #d8e6f0; }
                        .planner-task-summary-wrap { position: relative; display: flex; gap: 12px; flex-wrap: wrap; margin: 8px 0; }
                        .planner-task-summary-card { width: 210px; height: 110px; border-radius: 8px; display:flex; align-items:center; justify-content:space-between; padding:10px 14px; cursor:pointer; border:1px solid transparent; transition: transform .2s ease, box-shadow .25s ease, filter .2s ease; }
                        .planner-task-summary-card:hover { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(15, 42, 66, 0.16); filter: brightness(1.02); }
                        .planner-task-summary-card.completed { background: radial-gradient(circle at 20% 20%, rgba(255,255,255,.2), transparent 40%), linear-gradient(130deg,#0e3f97,#245bd6 45%,#3ba8ff); border-color:#1f4fba; }
                        .planner-task-summary-card.pending { background: radial-gradient(circle at 20% 20%, rgba(255,255,255,.2), transparent 45%), linear-gradient(130deg,#ff6a3d,#ff3f76 50%,#ff9a4f); border-color:#e95f55; }
                        .planner-task-summary-card.actionable { background: radial-gradient(circle at 20% 20%, rgba(255,255,255,.2), transparent 45%), linear-gradient(130deg,#02a8b9,#0e7fd8 45%,#4ddcc8); border-color:#1b8ca0; }
                        .planner-task-summary-title { display:flex; align-items:center; font-size:12px; font-weight:700; color:#fff; }
                        .planner-task-summary-card .card-icon { width:26px; height:26px; border-radius:7px; background:rgba(255,255,255,.2); display:inline-flex; align-items:center; justify-content:center; margin-right:8px; font-size:13px; }
                        .planner-task-summary-count { font-size:26px; line-height:1; color:#fff; font-weight:800; }
                        .planner-task-card-sub { font-size:11px; opacity:.9; color:rgba(255,255,255,.92); }
                        .planner-task-celebrate { position:absolute; left:50%; transform:translateX(-50%); top:-22px; background:linear-gradient(140deg,#0f2a42,#1c4e79); color:#fff; border-radius:14px; padding:10px 14px; min-width:280px; font-size:12px; font-weight:700; box-shadow:0 8px 20px rgba(0,0,0,.25); animation: plannerCelebratePop .35s ease; z-index:4; display:flex; align-items:center; gap:10px; }
                        .planner-task-celebrate.pending { background: linear-gradient(140deg,#ff7b00,#ff5a36); }
                        .planner-task-celebrate.actionable { background: linear-gradient(140deg,#0ea5c6,#2a7fff); }
                        .planner-task-celebrate.completed { background: linear-gradient(140deg,#1f9d57,#12b89a); }
                        .planner-task-celebrate .celebrate-icon { width:46px; height:46px; border-radius:12px; background:rgba(255,255,255,.18); display:flex; align-items:center; justify-content:center; font-size:24px; }
                        .planner-task-celebrate .celebrate-text-1 { line-height:1.1; font-size:14px; letter-spacing:.3px; }
                        .planner-task-celebrate .celebrate-text-2 { line-height:1.15; font-size:12px; font-weight:700; opacity:.96; }
                        .planner-task-confetti { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
                        .planner-task-confetti span { position:absolute; top:8px; width:8px; height:8px; border-radius:2px; animation: plannerConfetti 1.4s ease forwards; opacity:.95; }
                        .planner-task-confetti span:nth-child(odd){ background:#ffd166; }
                        .planner-task-confetti span:nth-child(even){ background:#6ee7b7; }
                        .planner-task-confetti span:nth-child(3n){ background:#60a5fa; }
                        .spot-visit-panel-shell { display: grid; grid-template-columns: 340px minmax(0, 1fr); border: 1px solid #d8e6f0; border-radius: 10px; overflow: hidden; min-height: 560px; }
                        .spot-visit-panel-list { border-right: 1px solid #d8e6f0; max-height: 560px; overflow-y: auto; padding: 10px; background: #fff; }
                        .spot-visit-panel-item { width: 100%; text-align: left; border: 1px solid #e6eff6; border-radius: 8px; background: #fff; padding: 10px; margin-bottom: 8px; cursor: pointer; }
                        .spot-visit-panel-item.active { border-color: #2f9cff; background: #f5faff; box-shadow: inset 2px 0 0 #2f9cff; }
                        .spot-visit-status-pill { display: inline-flex; align-items: center; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px; border: 1px solid transparent; }
                        .spot-visit-status-pill.pending { background: #fff4e8; color: #ff8b00; border-color: #ffd8ad; }
                        .spot-visit-status-pill.completed { background: #ebfff3; color: #1f9d57; border-color: #c5efd6; }
                        .spot-visit-status-pill.actionable { background: #eaf3ff; color: #2f9cff; border-color: #cfe5ff; }
                        .spot-visit-panel-detail { max-height: 560px; overflow-y: auto; padding: 16px; background: #fff; }
                        .spot-visit-detail-grid { margin-top: 12px; display: grid; grid-template-columns: repeat(2, minmax(170px, 1fr)); gap: 14px; }
                        .spot-visit-label { font-size: 11px; color: #7a8ea0; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
                        .spot-visit-value { font-size: 13px; color: #22384c; font-weight: 600; word-break: break-word; }
                        @keyframes plannerCelebratePop { from {opacity:0; transform:translateX(-50%) translateY(8px) scale(.94);} to {opacity:1; transform:translateX(-50%) translateY(0) scale(1);} }
                        @keyframes plannerConfetti { to { transform: translateY(70px) rotate(360deg); opacity:0; } }
                        @media (max-width: 1024px) { .spot-visit-panel-shell { grid-template-columns: 1fr; } .spot-visit-panel-list { border-right: none; border-bottom: 1px solid #d8e6f0; max-height: 250px; } .planner-task-search-wrap { width: 180px; } .planner-task-date-chip { min-width:180px; } .planner-task-summary-card { width: 180px; height: 100px; } }
                      `}</style>

                      <div className="planner-task-summary-wrap">
                        {this.state.showCelebration && (
                          <>
                            <div className={`planner-task-celebrate ${this.state.celebrationType}`}>
                              <div className="celebrate-icon">
                                <i className={`fa ${
                                  this.state.celebrationType === "completed"
                                    ? "fa-trophy"
                                    : this.state.celebrationType === "pending"
                                      ? "fa-hourglass-half"
                                      : "fa-bolt"
                                }`}></i>
                              </div>
                              <div>
                                <div className="celebrate-text-1">{this.state.celebrationText}</div>
                                <div className="celebrate-text-2">
                                  {this.state.celebrationCount} TASK{this.state.celebrationCount === 1 ? "" : "S"}{" "}
                                  {this.state.celebrationType === "completed" ? "COMPLETED!" : this.state.celebrationType === "pending" ? "PENDING!" : "ACTIONABLE!"}
                                </div>
                              </div>
                            </div>
                            <div className="planner-task-confetti">
                              {Array.from({ length: 18 }).map((_, idx) => (
                                <span key={idx} style={{ left: `${5 + idx * 5.2}%`, animationDelay: `${(idx % 5) * 0.06}s` }} />
                              ))}
                            </div>
                          </>
                        )}
                        <div className="planner-task-summary-card completed" onClick={() => this.handleStatusCardClick("completed", this.state.completedTasks)}>
                          <div>
                            <div className="planner-task-summary-title"><span className="card-icon"><i className="fa fa-check"></i></span>Completed Tasks</div>
                            <div className="planner-task-card-sub">Done today</div>
                          </div>
                          <span className="planner-task-summary-count">{this.state.completedTasks}</span>
                        </div>
                        <div className="planner-task-summary-card pending" onClick={() => this.handleStatusCardClick("pending", this.state.pendingTasks)}>
                          <div>
                            <div className="planner-task-summary-title"><span className="card-icon"><i className="fa fa-clock-o"></i></span>Pending Tasks</div>
                            <div className="planner-task-card-sub">Need follow-up</div>
                          </div>
                          <span className="planner-task-summary-count">{this.state.pendingTasks}</span>
                        </div>
                        <div className="planner-task-summary-card actionable" onClick={() => this.handleStatusCardClick("actionable", this.state.actionableTasks)}>
                          <div>
                            <div className="planner-task-summary-title"><span className="card-icon"><i className="fa fa-exclamation"></i></span>Actionable Tasks</div>
                            <div className="planner-task-card-sub">Immediate attention</div>
                          </div>
                          <span className="planner-task-summary-count">{this.state.actionableTasks}</span>
                        </div>
                      </div>

                      <div className="card-header d-flex p-2">
                        <div className="d-flex w-100 flex-column">
                          <div className="d-flex align-items-center mb-2">
                            <div className="planner-task-filter-row flex-grow-1">
                              <div className="planner-task-filter-chip">
                                <i className="fa fa-tag"></i>
                                <select id="category" className="form-control planner-task-filter-input" onChange={this.handleCategoryChange} value={this.state.selectedCategory}>
                                  <option value={0}>Select Category</option>
                                  {this.state.categories.map(cat => <option key={cat.Id} value={cat.Id}>{cat.Name}</option>)}
                                </select>
                              </div>
                              <div className="planner-task-filter-chip" style={{ maxWidth: "180px" }}>
                                <i className="fa fa-tags"></i>
                                <select id="subCategory" className="form-control planner-task-filter-input" disabled={!this.state.selectedCategory} value={this.state.selectedSubCategory} onChange={(e) => this.setState({selectedSubCategory: e.target.value})}>
                                  <option value={0}>Sub Category</option>
                                  {this.state.subCategories.map(sub => <option key={sub.SubCategoryId} value={sub.SubCategoryId}>{sub.SubCategoryName}</option>)}
                                </select>
                              </div>
                              <div className="planner-task-filter-chip">
                                <i className="fa fa-repeat"></i>
                                <select id="frequency" className="form-control planner-task-filter-input" value={this.state.selectedFrequency} onChange={(e) => this.setState({selectedFrequency: e.target.value})}>
                                  <option value={0}>Repeat</option>
                                  {this.state.frequencies.map(freq => <option key={freq.Id} value={freq.Id}>{freq.Name}</option>)}
                                </select>
                              </div>
                              <div className="planner-task-filter-chip">
                                <i className="fa fa-clock-o"></i>
                                <select id="status" className="form-control planner-task-filter-input" value={this.state.selectedStatus} onChange={(e) => this.setState({selectedStatus: e.target.value})}>
                                  <option value="None">Task Status</option>
                                  {this.state.statusList.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
                                </select>
                              </div>
                              <div className="planner-task-filter-chip">
                                <i className="fa fa-exclamation-circle"></i>
                                <select id="priority" className="form-control planner-task-filter-input" value={this.state.selectedPriority} onChange={(e) => this.setState({selectedPriority: e.target.value})}>
                                  <option value={0}>Task Priority</option>
                                  {this.state.priorityList.map(p => <option key={p.Id} value={p.Id}>{p.Name}</option>)}
                                </select>
                              </div>
                              <div className="planner-task-filter-chip" style={{ maxWidth: "220px" }}>
                                <i className="fa fa-user-o"></i>
                                <select id="assignedTo" className="form-control planner-task-filter-input" value={this.state.selectedUser} onChange={(e) => this.setState({selectedUser: e.target.value})}>
                                  <option value={0}>Assigned To</option>
                                  {this.state.assignToList.map(user => <option key={user.Id} value={user.Id}>{user.Name}</option>)}
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex align-items-center">
                            <div className="d-flex flex-grow-1">
                              <div className="planner-task-date-chip">
                                <span className="date-icon"><i className="fa fa-calendar"></i></span>
                                <DatePicker
                                  selectsRange
                                  startDate={this.state.fromDate}
                                  endDate={this.state.toDate}
                                  onChange={(dates) => {
                                    const [start, end] = dates;
                                    this.setState({ fromDate: start, toDate: end });
                                  }}
                                  isClearable
                                  className="form-control planner-task-filter-input"
                                  placeholderText="Select Date Range"
                                  dateFormat="dd-MM-yyyy"
                                />
                              </div>
                            </div>
                            <div className="d-flex ml-auto align-items-center">
                              <div className="planner-task-search-wrap">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Search here..."
                                  value={this.state.searchText}
                                  onChange={(e) => this.setState({ searchText: e.target.value })}
                                />
                              </div>
                              <div className="planner-task-view-toggle">
                                <button type="button" className={this.state.viewMode === "panel" ? "active" : ""} onClick={() => this.setState({ viewMode: "panel" })}>Panel View</button>
                                <button type="button" className={this.state.viewMode === "table" ? "active" : ""} onClick={() => this.setState({ viewMode: "table" })}>Table View</button>
                              </div>
                              <button type="button" className={`btn ${this.state.filtersApplied ? 'btn-danger' : 'btn-primary'} mr-2 planner-task-btn`} onClick={this.state.filtersApplied ? this.handleReset : this.handleFilter}>
                                <i className={`fa ${this.state.filtersApplied ? 'fa-times' : 'fa-filter'} mr-1`}/>
                                {this.state.filtersApplied ? 'Reset' : 'Filter'}
                              </button>
                              <button type="button" className="btn btn-outline-success mr-2 planner-task-btn" onClick={this.handleExport}>
                                <i className="fa fa-file-excel-o mr-1"/> Export
                              </button>
                              <Button
                                id="btnNewTask"
                                Action={this.AddNew.bind(this)}
                                ClassName="btn btn-success planner-task-btn"
                                Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                Text="Add Spot Visit Task"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card-body pt-2">
                        <LoadingOverlay
                            active={this.state.loading}
                            spinner={<PropagateLoader color="#336B93" size={30}/>}
                        >
                          {this.state.viewMode === "table" && (
                            <DataTable
                                data={filteredData}
                                columns={this.state.columns}
                                hideGridSearchAndSize={false}
                                globalSearch={false}
                                isDefaultPagination={true}
                            />
                          )}
                          {this.state.viewMode === "panel" && (
                            <div className="spot-visit-panel-shell">
                              <div className="spot-visit-panel-list">
                                <div style={{ fontSize: "12px", color: "#6d7f8d", fontWeight: 600, marginBottom: "8px" }}>
                                  Spot Visits ({filteredData.length})
                                </div>
                                {filteredData.map((task) => (
                                  <button
                                    key={task.TaskId}
                                    type="button"
                                    className={`spot-visit-panel-item ${
                                      (activeTask && activeTask.TaskId) === task.TaskId ? "active" : ""
                                    }`}
                                    onClick={() => this.setState({ selectedTaskId: task.TaskId })}
                                  >
                                    <div style={{ fontWeight: 700, color: "#22384c", fontSize: "13px" }}>{task.Name}</div>
                                    <div style={{ fontSize: "12px", color: "#6d7f8d", marginTop: "2px" }}>{task.UpdatedOn || "-"}</div>
                                    <div style={{ marginTop: "6px" }}>
                                      <span className={`spot-visit-status-pill ${this.getStatusClass(task.TaskStatus)}`}>
                                        {task.TaskStatus || "-"}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                              <div className="spot-visit-panel-detail">
                                {!activeTask && <div className="text-muted">No spot visit records found.</div>}
                                {activeTask && (
                                  <>
                                    <h3 style={{ margin: 0, color: "#22384c", fontWeight: 700, fontSize: "24px" }}>
                                      {activeTask.Name || "-"}
                                    </h3>
                                    <div style={{ marginTop: "6px" }}>
                                      <span className={`spot-visit-status-pill ${this.getStatusClass(activeTask.TaskStatus)}`}>
                                        {activeTask.TaskStatus || "-"}
                                      </span>
                                    </div>
                                    <div className="spot-visit-detail-grid">
                                      <div><div className="spot-visit-label">Task Id</div><div className="spot-visit-value">#{activeTask.TaskId || "-"}</div></div>
                                      <div><div className="spot-visit-label">Date</div><div className="spot-visit-value">{activeTask.UpdatedOn || "-"}</div></div>
                                      <div><div className="spot-visit-label">Category</div><div className="spot-visit-value">{activeTask.CategoryName || "-"}</div></div>
                                      <div><div className="spot-visit-label">Sub Category</div><div className="spot-visit-value">{activeTask.SubCategoryName || "-"}</div></div>
                                      <div><div className="spot-visit-label">Frequency</div><div className="spot-visit-value">{activeTask.OccurenceView || "-"}</div></div>
                                      <div><div className="spot-visit-label">Priority</div><div className="spot-visit-value">{activeTask.TaskPriority || "-"}</div></div>
                                      <div><div className="spot-visit-label">Assigned To</div><div className="spot-visit-value">{activeTask.AssignedTo || "-"}</div></div>
                                      <div><div className="spot-visit-label">Location</div><div className="spot-visit-value">{activeTask.Location || "-"}</div></div>
                                      <div style={{ gridColumn: "1 / -1" }}>
                                        <div className="spot-visit-label">Remarks</div>
                                        <div className="spot-visit-value">{activeTask.Remarks || "-"}</div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </LoadingOverlay>
                      </div>
                    </div>
                  </div>
                </LoadingOverlay>
              </div>
          )}
          {this.state.showAddModal && (
              <AddTask
                  showAddModal={this.state.showAddModal}
                  closeModal={this.closeModal}
                  categoryData={this.state.categories}
                  // getTask={this.getTasks}
                  type={"SpotVisit"}
                  sourceView={this.state.viewMode}
              />
          )}
        </div>
    );
  }
}
const mapStateToProps = (state,props) => {
  return {
    PropertyVal: state.Commonreducer.puidn,
    Entrolval: state.Commonreducer.entrolval,
    dashDates: state.Commonreducer.dashDates,
  };
};
const mapDispatchToProps = (dispatch) => {
  const actions = bindActionCreators(departmentAction, dispatch);
  return { actions };
};

export default connect(mapStateToProps,mapDispatchToProps)(GuardList)
