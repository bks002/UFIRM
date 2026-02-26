import React, { Component } from "react";
import { connect } from "react-redux";
import departmentAction from "../../../../src/redux/department/action.js";
import { bindActionCreators } from "redux";
import moment from "moment";
import LoadingOverlay from "react-loading-overlay";
import { PropagateLoader } from "react-spinners";
import Button from "../../../ReactComponents/Button/Button";
import DataTable from "../../../ReactComponents/ReactTable/DataTable";
import ApiProvider from "../DataProvider";
import AddTask from "./AddTask";
import AddQuestion from "./AddQuestion";
import ViewTask from "./ViewTask";
import * as appCommon from "../../../Common/AppCommon.js";
import swal from "sweetalert";
import { DELETE_CONFIRMATION_MSG } from "../../../Contants/Common";
import EditTask from "./EditTask";
import { downloadExcel } from "react-export-table-to-excel";
import { CSVLink } from "react-csv";
import LayoutDataProvider from "../../../Routing/LayoutDataProvider";
import ChatBox from "../../Notification Center/ChatBox";
import { getTaskRemarks, fetchNotifications } from "../../../Services/notificationService";

const $ = window.$;

class TaskList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          Header: "Task Id",
          accessor: "TaskId",
        },
        {
          Header: "Due Date",
          accessor: "DateFrom",
        },
        {
          Header: "Category",
          accessor: "CategoryName",
        },
        {
          Header: "Sub Category",
          accessor: "SubCategoryName",
        },
        {
          Header: "Task Name",
          accessor: "Name",
        },
        // {
        //   Header: "Assigned To",
        //   accessor: "AssignedTo",
        // },
        // {
        //   Header: "Due Date",
        //   accessor: "DateFrom",
        // },
        // {
        //   Header: "End Date",
        //   accessor: "DateTo",
        // },
        // {
        //   Header: "Start Time",
        //   accessor: "TimeFrom",
        // },
        // {
        //   Header: "End Time",
        //   accessor: "TimeTo",
        // },
        {
          Header: "Occurence",
          accessor: "OccurenceView",
        },
        {
          Header: "UpdatedOn",
          accessor: "UpdatedOn",
        },
        {
          Header: "Task Status",
          accessor: "TaskStatus",
        },
        {
          Header: "Task Priority",
          accessor: "TaskPriority",
        },
        {
          Header: "Remarks",
          accessor: "Remarks",
        },
        {
          Header: "Action",
          Cell: (data) => {
            return (
              <div style={{ display: "flex" }}>
                <button
                  className="planner-task-icon-btn view"
                  onClick={this.ViewTask.bind(this, data.cell.row.original)}
                  title="View"
                  style={{ marginRight: "5px" }}
                >
                  <i className="fa fa-eye"></i>
                </button>
                <button
                  className="planner-task-icon-btn edit"
                  onClick={this.EditTask.bind(this, data.cell.row.original)}
                  title="Edit"
                  style={{ marginRight: "5px" }}
                >
                  <i className="fa fa-edit"></i>
                </button>
                <button
                  className="planner-task-icon-btn delete"
                  onClick={this.DeleteTask.bind(this, data.cell.row.original)}
                  title="Delete"
                >
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            );
          },
        },
      ],
      columnsWithoutDueDate: [
        {
          Header: "Task Id",
          accessor: "TaskId",
        },
        {
          Header: "Category",
          accessor: "CategoryName",
        },
        {
          Header: "Sub Category",
          accessor: "SubCategoryName",
        },
        {
          Header: "Task Name",
          accessor: "Name",
        },
        {
          Header: "Occurence",
          accessor: "OccurenceView",
        },
        {
          Header: "UpdatedOn",
          accessor: "UpdatedOn",
        },
        {
          Header: "Task Status",
          accessor: "TaskStatus",
        },
        {
          Header: "Task Priority",
          accessor: "TaskPriority",
        },
        // {
        //   Header: "Assigned To",
        // },
        // {
        //   Header: "Assigned By",
        // },
        {
          Header: "Action",
          Cell: (data) => {
            return (
              <div style={{ display: "flex" }}>
                <button
                  className="planner-task-icon-btn add"
                  onClick={this.AddQuestion.bind(this, data.cell.row.original)}
                  title="Add"
                  style={{ marginRight: "5px" }}
                >
                  <i className="fa fa-plus"></i>
                </button>
                <button
                  className="planner-task-icon-btn view"
                  onClick={this.ViewTask.bind(this, data.cell.row.original)}
                  title="View"
                  style={{ marginRight: "5px" }}
                >
                  <i className="fa fa-eye"></i>
                </button>
                <button
                  className="planner-task-icon-btn edit"
                  onClick={this.EditTask.bind(this, data.cell.row.original)}
                  title="View"
                  style={{ marginRight: "5px" }}
                >
                  <i className="fa fa-edit"></i>
                </button>
                <button
                  className="planner-task-icon-btn delete"
                  onClick={this.DeleteTask.bind(this, data.cell.row.original)}
                  title="View"
                >
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            );
          },
        },
      ],
      data: [],
      CategoryData: [],
      selectedCategoryId: "",
      selectedSubCategoryId: "",
      usersList: [],
      userIds: "",
      loading: false,
      dataLoading: false,
      showAddModal: false,
      showEditModal: false,
      PageMode: "Home",
      showQuesModal: false,
      showTaskModal: false,
      actionVisible: false,
      taskId: "",
      taskName: "",
      rowData: {},
      subCategory: [],
      filtered: false,
      occurance: "",
      assignTo: "",
      assign: [],
      dashboardAssign: [],
      taskPriorityList: [],
      taskPriority: "",
      filterFromDate: "",
      filterToDate: "",
      taskStatus: "None",
      startDate: moment().clone().startOf("month"),
      endDate: moment().clone().endOf("month"),
      propertyId: 0,
      propertyData: [],
      header: [
        "Task Id",
        "Category",
        "Sub Category",
        "Task Name",
        "Occurence",
        "Updated On",
        "Task Status",
      ],
      pendingTasks: 0,
      completedTasks: 0,
      actionableTasks: 0,
      assignedProperty: [],
      exporting: false,
      viewMode: "panel",
      selectedTaskId: 0,
      searchText: "",
      showCelebration: false,
      celebrationType: "",
      celebrationText: "",
      celebrationCount: 0,
      panelQuestions: [],
      panelQuestionsLoading: false,
      panelQuestionTaskId: 0,
      panelFmQuestion: null,
      panelFmDate: "",
      panelRemarks: [],
      panelRemarksLoading: false,
      panelHasAnyRemarksForQuestion: false,
      panelRightMode: "details",
    };
    this.ApiProvider = new ApiProvider();
    this.comdbprovider = new LayoutDataProvider();
  }

  getExportDataWithQuestions = () => {
    const exportRows = [];

    this.state.data.forEach((task) => {
      // 🔹 assume questions are stored here (adjust key if needed)
      const questions = task.TaskTransactionModel1 || [];

      // ❗ If no questions, export task once
      if (!questions.length) {
        exportRows.push({
          ...task,
          Questionnaire: "",
        });
      } else {
        // ❗ If multiple questions, duplicate task row
        questions.forEach((q) => {
          exportRows.push({
            ...task, // 👈 keeps ALL existing columns
            Questionnaire: q.Question || q.QuestionName || "",
          });
        });
      }
    });

    return exportRows;
  };

  fetchQuestionsForTask = async (task) => {
    try {
      const taskId = task.TaskId;

      // Same date logic as ViewTask
      let date = task.UpdatedOn.split("-");
      const updatedOn = `${date[2]}-${date[1]}-${date[0]}`;

      const model = [
        {
          CmdType: "R",
          Id: taskId,
          date: updatedOn,
        },
      ];

      const resp = await this.ApiProvider.manageQues(model, "R");

      if (resp.ok && resp.status === 200) {
        const rData = await resp.json();

        return rData.map((q) => ({
          QuesId: q.QuestID,
          QuesName: q.QuestionName,
        }));
      }

      return [];
    } catch (e) {
      console.error("Question fetch failed for task", task.TaskId, e);
      return [];
    }
  };

  handleExportWithQuestions = async () => {
    // 🛑 prevent double click
    if (this.state.exporting) return;

    this.setState({ exporting: true });

    try {
      const exportRows = [];

      for (const task of this.state.data) {
        const questions = await this.fetchQuestionsForTask(task);

        const questionnaireText = questions.length
          ? questions.map((q, i) => `${i + 1}. ${q.QuesName}`).join("\n")
          : "";

        // ❌ remove unwanted columns ONLY for export
        const { AssignedToId, EntryType, Occurence, ...cleanTask } = task;

        exportRows.push({
          ...cleanTask,
          Questionnaire: questionnaireText,
        });
      }

      downloadExcel({
        fileName: "Tasklist",
        sheet: "Tasks",
        tablePayload: {
          header: Object.keys(exportRows[0] || {}),
          body: exportRows,
        },
      });
    } catch (err) {
      console.error("Export failed:", err);
      appCommon.showtextalert("Export failed", "Please try again", "error");
    } finally {
      // ✅ allow export again
      this.setState({ exporting: false });
    }
  };

  handleDownloadExcel() {
    downloadExcel({
      fileName: `TaskList`,
      sheet: "react-export-table-to-excel",
      tablePayload: {
        header: this.state.header,
        // accept two different data structures
        body: this.state.data,
      },
    });
  }

  loadProperty() {
    this.comdbprovider.getUserAssignedproperty().then((resp) => {
      if (resp && resp.ok && resp.status === 200) {
        return resp.json().then((rData) => {
          this.setState({ propertyData: rData });
        });
      }
    });
  }

  getModel = (
    type,
    categoryId,
    subCategoryId,
    assignTo,
    occurance,
    startDate,
    endDate,
    taskStatus,
    propertyId,
    taskPriority,
  ) => {
    var model = [];
    switch (type) {
      case "R":
        model.push({
          CmdType: type,
          CategoryId: categoryId,
          SubCategoryId: subCategoryId,
          AssignedTo: assignTo,
          Occurrence: occurance,
          DteFr: startDate,
          DteTo: endDate,
          TaskStatus: taskStatus,
          PropertyId: propertyId,
          TaskPriority: taskPriority,
        });
        break;
      default:
    }
    return model;
  };

  getDeleteTaskModel = (type, taskId) => {
    var model = [];
    switch (type) {
      case "D":
        model.push({
          CmdType: type,
          TaskId: taskId,
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
          PropertyId: this.props.PropertyVal ? this.props.PropertyVal : 0,
        });
        break;
      default:
    }
    return model;
  };

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
              this.setState({ CategoryData: catData });
              break;
            default:
          }
        });
      }
    });
  };

  manageTask = (model, type) => {
    if (this.state.filtered) {
      this.setState({ dataLoading: true });
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
                    TaskStatus: element.TaskStatus,
                    Occurence: element.Occurence.split(" ")[0],
                    OccurenceView: this.modifyOccurence(
                      element.Occurence.split(" ")[0],
                    ),
                    CategoryName: element.CategoryName,
                    SubCategoryName: element.SubCategoryName,
                    Location: element.Location,
                    EntryType: element.EntryType,
                    AssignedTo: element.AssignedTo,
                    AssignedToId: element.AssignedToId,
                    QRcode: element.QRCode,
                    UpdatedOn: element.UpdatedOn,
                    PropertyId: element.PropertyId,
                    AssetId: element.AssetId,
                    TaskPriority: element.TaskPriority,
                  });
                });
                this.countTasksByStatus(taskData);
                this.setState({ data: taskData, dataLoading: false });
                break;
              case "D":
                if (rData === "Deleted !") {
                  appCommon.showtextalert(
                    "Task Deleted Successfully!",
                    "",
                    "success",
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

  modifyOccurence = (Occurrence) => {
    if (Occurrence === "W") {
      return "Weekly";
    }
    if (Occurrence === "Y") {
      return "Yearly";
    }
    if (Occurrence === "D") {
      return "Daily";
    }
    if (Occurrence === "M") {
      return "Monthly";
    }
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
              this.setState({ subCategory: subCatData });
              break;
            default:
          }
        });
      }
    });
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

  manageDashboardAssign = (model, type) => {
    this.ApiProvider.manageDashboardAssign(model, type).then((resp) => {
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
              this.setState({ dashboardAssign: assignData });
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
              this.setState({ taskPriorityList: taskPriorityList });
              break;
            default:
          }
        });
      }
    });
  };

  getCategory() {
    var type = "R";
    var model = this.getModel(type);
    this.manageCategory(model, type);
  }

  getSubCategory() {
    var type = "R";
    var model = this.getModel(type);
    var categoryId = this.state.selectedCategoryId
      ? this.state.selectedCategoryId
      : 0;
    this.manageSubCategory(model, type, categoryId);
  }
  getTasks() {
    const type = "R";

    const categoryId = this.state?.selectedCategoryId || 0;
    const subCategoryId = this.state?.selectedSubCategoryId || 0;
    const assignToId = this.state?.assignTo || 0;
    const occurance = this.state?.occurance || 0;

    const startDate = this.state?.filterFromDate || "";
    const endDate = this.state?.filterToDate || "";

    const taskStatus =
      this.state?.taskStatus && this.state.taskStatus !== "None"
        ? this.state.taskStatus
        : "";

    const propertyId = this.props?.PropertyVal || 0;
    const taskPriority = this.state?.taskPriority || 0;

    const model = this.getModel(
      type,
      categoryId,
      subCategoryId,
      assignToId,
      occurance,
      startDate,
      endDate,
      taskStatus,
      propertyId,
      taskPriority,
    );

    this.manageTask(model, type);
  }
  getAssign() {
    var type = "R";
    var model = this.getAssignModel(type);
    this.manageAssign(model, type);
  }
  getDashboardAssignList() {
    var type = "R";
    var model = this.getAssignModel(type);
    this.manageDashboardAssign(model, type);
  }
  getTasksPriority() {
    var type = "R";
    var model = this.getTaskPriorityModel(type);
    this.manageTaskPriority(model, type);
  }

  onAddQuestion = (data) => {
    var rowData = this.findItem(data);
    if (rowData) {
      this.setState({
        taskId: rowData.TaskId,
        taskName: rowData.Name,
      });
    }
  };

  findItem(id) {
    return this.state.data.find((item) => {
      if (item.TaskId === id) {
        return item;
      }
    });
  }

  DateRangeConfig(startDate, endDate) {
    let _this = this;
    $("#dataRange").daterangepicker({
      locale: {
        format: "DD/MM/YYYY",
      },
      startDate: startDate,
      endDate: endDate,
    });
    $("#dataRange").on("apply.daterangepicker", function (ev, picker) {
      var startDate = picker.startDate;
      var endDate = picker.endDate;
      _this.setState({
        filterFromDate: startDate.format("YYYY-MM-DD"),
        filterToDate: endDate.format("YYYY-MM-DD"),
      });
    });
  }

  componentDidMount() {
    const { PropertyVal } = this.props;
    const status =
      this.props.status === "Completed" ? "Complete" : this.props.status;
    const priority = this.props.priority;
    const subCatId = parseInt(this.props.subCatId);
    const initialDate = this.props.dashDates;
    const today = moment();
    this.setState(
      {
        filterFromDate:
          status === null && priority === null
            ? today.format("YYYY-MM-DD")
            : initialDate,
        filterToDate: today.format("YYYY-MM-DD"),
        filtered: true,
        propertyId: PropertyVal,
        taskStatus: status === null ? 0 : status,
        taskPriority: priority === null ? 0 : priority,
        selectedSubCategoryId: subCatId === null ? 0 : subCatId,
      },
      // const startDate = moment().clone().startOf("month");
      // const endDate = moment().clone().endOf("month");
      // this.setState({
      //   filterFromDate: startDate.format('YYYY-MM-DD'),
      //   filterToDate: endDate.format('YYYY-MM-DD'),
      //   filtered: true
      // },
      () => {
        const dateTo = new Date(this.state.filterToDate);
        const dateFrom = new Date(this.state.filterFromDate);
        this.DateRangeConfig(dateFrom, dateTo);
        // this.DateRangeConfig(startDate, endDate);
        this.getCategory();
        this.getTasks();
        this.getTasksPriority();
        this.getAssign();
        this.getDashboardAssignList();
        // this.getAllProperties();
        this.loadProperty();
        // this.TaskStatusConfig();
      },
    );
  }

  componentWillUnmount() {
    window.clearTimeout(this._celebrateTimer);
  }

  AddNew = () => {
    this.setState({ PageMode: "Add", showAddModal: true });
  };

  Filter = () => {
    if (
      this.props.PropertyVal > 0 ||
      this.state.assignTo > 0 ||
      this.state.occurance !== "" ||
      this.state.taskStatus !== "None"
    ) {
      this.setState({ filtered: true }, () => {
        this.getTasks();
      });
    } else {
      appCommon.showtextalert(
        "",
        "Please Select Any Filter Attribute",
        "warning",
      );
    }
  };

  Reset = () => {
    this.setState({
      filtered: false,
      selectedCategoryId: 0,
      selectedSubCategoryId: 0,
      occurance: "",
      assignTo: 0,
      taskStatus: "None",
      completedTasks: 0,
      pendingTasks: 0,
      actionableTasks: 0,
      taskPriority: 0,
      data: [],
    });
    //this.getTasks();
  };

  AddQuestion = (data) => {
    this.setState({
      PageMode: "AddQuestion",
      showQuesModal: true,
      rowData: data,
    });
  };
  ViewTask = (data) => {
    this.setState({ PageMode: "ViewTask", showTaskModal: true, rowData: data });
  };
  EditTask = (data) => {
    this.setState({ PageMode: "EditTask", showEditModal: true, rowData: data });
  };

  DeleteTask = (data) => {
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
          var model = this.getDeleteTaskModel(type, data.TaskId);
          this.manageTask(model, type);
          break;
        case "cancel":
          break;
        default:
          break;
      }
    });
  };

  closeModal = () => {
    this.setState(
      {
        PageMode: "Home",
        showAddModal: false,
        showQuesModal: false,
        showTaskModal: false,
      },
      () => {
        const startDate = moment().clone().startOf("month");
        const endDate = moment().clone().endOf("month");
        this.DateRangeConfig(startDate, endDate);
        this.setState({
          pendingTasks: 0,
          actionableTasks: 0,
          completedTasks: 0,
        });

        this.getCategory();
        this.getTasks();
        // this.TaskStatusConfig();
      },
    );
  };

  selectedCategory = (value) => this.setState({ selectedCategoryId: value });

  // closeModal = () => this.setState({ PageMode: 'Home', showAddModal: false });

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedCategoryId !== this.state.selectedCategoryId) {
      this.getSubCategory();
    }
    if (
      prevState.selectedCategoryId !== this.state.selectedCategoryId &&
      prevState.selectedSubCategoryId !== this.state.selectedSubCategoryId
    ) {
      this.getTasks();
    }

    if (prevProps.PropertyVal !== this.props.PropertyVal) {
      this.getAssign();
      this.getDashboardAssignList();
    }

    if (prevProps.PropertyVal !== this.props.PropertyVal) {
      const { PropertyVal } = this.props;
      if (PropertyVal !== null && PropertyVal !== undefined) {
        this.setState({ localPropertyValue: PropertyVal });
        this.componentDidMount();
      }
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

    if (
      prevState.selectedTaskId !== this.state.selectedTaskId ||
      prevState.data !== this.state.data
    ) {
      const active = this.getActiveTask(this.state.data);
      if (
        active &&
        active.TaskId &&
        this.state.panelQuestionTaskId !== active.TaskId
      ) {
        this.loadPanelQuestions(active);
      }
      if (!active && this.state.panelQuestions.length > 0) {
        this.setState({
          panelQuestions: [],
          panelQuestionTaskId: 0,
          panelFmQuestion: null,
          panelRemarks: [],
        });
      }
      if (
        active &&
        prevState.selectedTaskId !== this.state.selectedTaskId &&
        this.state.panelFmQuestion
      ) {
        this.setState({
          panelFmQuestion: null,
          panelRemarks: [],
          panelRightMode: "details",
        });
      }
    }
  }
  onCategorySelected = (val) => {};

  // TaskStatusConfig() {
  //   let _this = this;
  //   $("#ticketMutliSelect").multiselect({
  //     onSelectAll: function () {
  //       // _this.filterOnChange();
  //     },
  //     onDeselectAll: function () {
  //       // _this.filterOnChange();
  //     },
  //     onChange: function (option, checked, select) {
  //       // _this.filterOnChange();
  //     },
  //   });
  // }

  countTasksByStatus = (data) => {
    data.forEach((element) => {
      if (element.TaskStatus === "Completed") {
        this.setState({ completedTasks: this.state.completedTasks + 1 });
      }
      if (element.TaskStatus === "Pending") {
        this.setState({ pendingTasks: this.state.pendingTasks + 1 });
      }
      if (element.TaskStatus === "Actionable") {
        this.setState({ actionableTasks: this.state.actionableTasks + 1 });
      }
    });
  };

  getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "complete") return "completed";
    if (s === "pending" || s === "open") return "pending";
    if (s === "actionable" || s === "in progress") return "actionable";
    return "";
  };

  getPriorityClass = (priority) => {
    const p = (priority || "").toLowerCase();
    if (p.includes("high")) return "high";
    if (p.includes("medium")) return "medium";
    if (p.includes("low")) return "low";
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
        taskStatus: statusMap[statusType] || "None",
        filtered: true,
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

  loadPanelQuestions = async (task) => {
    if (!task || !task.TaskId) return;
    this.setState({ panelQuestionsLoading: true, panelQuestionTaskId: task.TaskId });
    const questions = await this.fetchQuestionsForTask(task);
    this.setState({
      panelQuestions: questions || [],
      panelQuestionsLoading: false,
      panelQuestionTaskId: task.TaskId,
    });
  };

  handlePanelQuestionSelect = async (question, task) => {
    if (!question || !task) return;
    const taskDate = task.DateFrom || "";
    this.setState(
      {
        panelFmQuestion: question,
        panelFmDate: taskDate,
        panelRemarks: [],
        panelRemarksLoading: true,
        panelHasAnyRemarksForQuestion: false,
      },
      async () => {
        try {
          const list = await fetchNotifications("task", task.PropertyId || this.props.PropertyVal);
          const hasAny = list.some(
            (n) => n.TaskId === task.TaskId && n.QuestionId === question.QuesId,
          );
          this.setState({ panelHasAnyRemarksForQuestion: hasAny });
        } catch {
          this.setState({ panelHasAnyRemarksForQuestion: false });
        }
        this.loadPanelRemarks(task, question, taskDate);
      },
    );
  };

  loadPanelRemarks = (task, question, taskDate) => {
    if (!task || !question || !taskDate) {
      this.setState({ panelRemarks: [], panelRemarksLoading: false });
      return;
    }
    this.setState({ panelRemarksLoading: true });
    getTaskRemarks(task.TaskId, question.QuesId, taskDate)
      .then((data) => {
        this.setState({ panelRemarks: data || [], panelRemarksLoading: false });
      })
      .catch(() => {
        this.setState({ panelRemarks: [], panelRemarksLoading: false });
      });
  };

  handlePanelFMDateChange = (e, task) => {
    const selectedDate = e.target.value;
    this.setState(
      {
        panelFmDate: selectedDate,
        panelRemarks: [],
      },
      () => {
        if (this.state.panelFmQuestion) {
          this.loadPanelRemarks(
            task,
            this.state.panelFmQuestion,
            selectedDate,
          );
        }
      },
    );
  };

  sendPanelFMRemark = async (message, status, task) => {
    const selectedQ = this.state.panelFmQuestion;
    if (!selectedQ || !task || !message?.trim()) return;
    const lastSupRemark = (this.state.panelRemarks || []).find((r) =>
      r.RemarkHtml?.includes("SUP:"),
    );
    const payload = {
      TaskId: task.TaskId,
      QuestionId: selectedQ.QuesId,
      TaskName: task.Name,
      FmId: 0,
      FmRemark: message,
      FmDateTime: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      CurrentStatus: status || task.CurrentStatus || "Actionable",
      SUPdateTime: lastSupRemark?.RemarkDate || this.state.panelFmDate,
      TaskDate: this.state.panelFmDate,
    };
    try {
      const res = await fetch("https://api.urest.in:8096/FMResponse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("FM reply failed");
      this.loadPanelRemarks(task, selectedQ, this.state.panelFmDate);
    } catch (error) {
      console.error("FMResponse failed", error);
    }
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
        task.AssignedTo,
        task.TaskStatus,
        task.TaskPriority,
        task.Remarks,
        task.Location,
        task.DateFrom,
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
              spinner={<PropagateLoader color="#336B93" size={30} />}
            >
              <div className="col-12">
                <div className="card p-2">
                  <style>{`
                    .planner-task-view-toggle { display: inline-flex; border: 1px solid #d4e3ed; border-radius: 8px; overflow: hidden; background: #fff; margin-right: 8px; }
                    .planner-task-view-toggle button { border: none; background: transparent; padding: 6px 12px; font-size: 12px; font-weight: 600; color: #4a7fa8; cursor: pointer; }
                    .planner-task-view-toggle button.active { background: #e8f1f8; color: #1e4a6b; }
                    .planner-task-filter-row { display:flex; gap:8px; flex-wrap:wrap; }
                    .planner-task-filter-chip {
                      display:flex; align-items:center; gap:7px; background:#fff; border:1px solid #d8e6f0;
                      border-radius:7px; padding:0 8px; height:36px; min-width:130px;
                    }
                    .planner-task-filter-chip i { color:#2f9cff; font-size:13px; }
                    .planner-task-filter-input {
                      border: none !important; background: transparent !important; box-shadow: none !important;
                      font-size: 12px !important; height: 32px !important; padding: 0 !important; color:#2b465a;
                    }
                    .planner-task-filter-input:focus { outline:none !important; box-shadow:none !important; }
                    .planner-task-date-chip {
                      display:flex; align-items:center; gap:8px; background:#f8fbff; border:1px solid #d7e5ef;
                      border-radius:8px; height:36px; padding:0 10px; min-width:220px;
                    }
                    .planner-task-date-chip .date-icon {
                      width:20px; height:20px; border-radius:50%; background:#e8f1f8; color:#1e4a6b;
                      display:flex; align-items:center; justify-content:center; font-size:11px;
                    }
                    .planner-task-date-chip input { border:none !important; background:transparent !important; font-size:12px !important; color:#36546a; }
                    .planner-task-btn { height: 34px !important; padding: 0 12px !important; font-size: 12px !important; font-weight: 600 !important; border-radius: 7px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; }
                    .planner-task-icon-btn { width: 28px; height: 28px; padding: 0; border-radius: 7px; border: 1px solid transparent; display: inline-flex; align-items: center; justify-content: center; }
                    .planner-task-icon-btn.add { background: #eaf3ff; color: #2f9cff; border-color: #cfe5ff; }
                    .planner-task-icon-btn.view { background: #e8f1f8; color: #1e4a6b; border-color: #cfe0ee; }
                    .planner-task-icon-btn.edit { background: #fff4e8; color: #ff8b00; border-color: #ffd8ad; }
                    .planner-task-icon-btn.delete { background: #ffecec; color: #d64545; border-color: #ffc9c9; }
                    .planner-task-panel-shell { display: grid; grid-template-columns: 340px minmax(0, 1fr); border: 1px solid #d8e6f0; border-radius: 10px; overflow: hidden; min-height: 560px; }
                    .planner-task-panel-list { border-right: 1px solid #d8e6f0; max-height: 560px; overflow-y: auto; background: #fff; padding: 10px; }
                    .planner-task-panel-item { width: 100%; text-align: left; border: 1px solid #e6eff6; border-radius: 8px; background: #fff; padding: 10px; margin-bottom: 8px; cursor: pointer; }
                    .planner-task-panel-item.active { border-color: #2f9cff; background: #f5faff; box-shadow: inset 2px 0 0 #2f9cff; }
                    .planner-task-status-pill { display: inline-flex; align-items: center; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px; border: 1px solid transparent; }
                    .planner-task-status-pill.pending { background: #fff4e8; color: #ff8b00; border-color: #ffd8ad; }
                    .planner-task-status-pill.completed { background: #ebfff3; color: #1f9d57; border-color: #c5efd6; }
                    .planner-task-status-pill.actionable { background: #eaf3ff; color: #2f9cff; border-color: #cfe5ff; }
                    .planner-task-priority-chip { display: inline-flex; align-items: center; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px; border: 1px solid #d8e6f0; color: #4b6478; }
                    .planner-task-priority-chip.high { background: #ffecec; color: #d64545; border-color: #ffc9c9; }
                    .planner-task-priority-chip.medium { background: #fff4e8; color: #ff8b00; border-color: #ffd8ad; }
                    .planner-task-priority-chip.low { background: #ebfff3; color: #1f9d57; border-color: #c5efd6; }
                    .planner-task-panel-detail {
                      padding: 16px;
                      background: #fff;
                      max-height: 560px;
                      overflow-y: auto;
                    }
                    .planner-task-detail-grid { margin-top: 12px; display: grid; grid-template-columns: repeat(2, minmax(170px, 1fr)); gap: 14px; }
                    .planner-task-label { font-size: 11px; color: #7a8ea0; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
                    .planner-task-value { font-size: 13px; color: #22384c; font-weight: 600; word-break: break-word; }
                    .planner-task-summary-wrap { position: relative; }
                    .planner-task-summary-card {
                      flex: 1;
                      border-radius: 10px;
                      padding: 10px 14px;
                      min-width: 0;
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      cursor: pointer;
                      transition: transform .2s ease, box-shadow .25s ease, filter .2s ease;
                      border: 1px solid transparent;
                    }
                    .planner-task-summary-card:hover {
                      transform: translateY(-1px);
                      box-shadow: 0 6px 14px rgba(15, 42, 66, 0.16);
                      filter: brightness(1.02);
                    }
                    .planner-task-summary-card.completed {
                      background: radial-gradient(circle at 20% 20%, rgba(255,255,255,.2), transparent 40%), linear-gradient(130deg,#0e3f97,#245bd6 45%,#3ba8ff);
                      border-color:#1f4fba;
                    }
                    .planner-task-summary-card.pending {
                      background: radial-gradient(circle at 20% 20%, rgba(255,255,255,.2), transparent 45%), linear-gradient(130deg,#ff6a3d,#ff3f76 50%,#ff9a4f);
                      border-color:#e95f55;
                    }
                    .planner-task-summary-card.actionable {
                      background: radial-gradient(circle at 20% 20%, rgba(255,255,255,.2), transparent 45%), linear-gradient(130deg,#02a8b9,#0e7fd8 45%,#4ddcc8);
                      border-color:#1b8ca0;
                    }
                    .planner-task-summary-label { font-size: 12px; font-weight: 700; color:#fff; letter-spacing:.2px; }
                    .planner-task-summary-count { font-size: 18px; font-weight: 800; color:#fff; }
                    .planner-task-celebrate {
                      position: absolute;
                      left: 50%;
                      transform: translateX(-50%);
                      top: -22px;
                      background: linear-gradient(140deg,#0f2a42,#1c4e79);
                      color: #fff;
                      border-radius: 14px;
                      padding: 10px 14px;
                      min-width: 280px;
                      font-size: 12px;
                      font-weight: 700;
                      box-shadow: 0 8px 20px rgba(0,0,0,.25);
                      animation: plannerCelebratePop .35s ease;
                      z-index: 4;
                      display:flex; align-items:center; gap:10px;
                    }
                    .planner-task-celebrate.pending { background: linear-gradient(140deg,#ff7b00,#ff5a36); }
                    .planner-task-celebrate.actionable { background: linear-gradient(140deg,#0ea5c6,#2a7fff); }
                    .planner-task-celebrate.completed { background: linear-gradient(140deg,#1f9d57,#12b89a); }
                    .planner-task-celebrate .celebrate-icon {
                      width:46px; height:46px; border-radius:12px; background: rgba(255,255,255,.18); display:flex; align-items:center; justify-content:center;
                      font-size:24px;
                    }
                    .planner-task-celebrate .celebrate-text-1 { line-height:1.1; font-size:14px; letter-spacing:.3px; }
                    .planner-task-celebrate .celebrate-text-2 { line-height:1.15; font-size:12px; font-weight:700; opacity:.96; }
                    .planner-task-confetti { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
                    .planner-task-confetti span {
                      position:absolute; top:8px; width:8px; height:8px; border-radius:2px;
                      animation: plannerConfetti 1.4s ease forwards;
                      opacity:.95;
                    }
                    .planner-task-confetti span:nth-child(odd){ background:#ffd166; }
                    .planner-task-confetti span:nth-child(even){ background:#6ee7b7; }
                    .planner-task-confetti span:nth-child(3n){ background:#60a5fa; }
                    @keyframes plannerCelebratePop { from {opacity:0; transform:translateX(-50%) translateY(8px) scale(.94);} to {opacity:1; transform:translateX(-50%) translateY(0) scale(1);} }
                    @keyframes plannerConfetti { to { transform: translateY(70px) rotate(360deg); opacity:0; } }
                    .planner-task-search-wrap { width: 250px; margin-right: 10px; }
                    .planner-task-search-wrap input { height: 34px; border-radius: 7px; font-size:12px; border:1px solid #d8e6f0; }
                    .planner-task-questions-card {
                      margin-top: 12px;
                      border-top: 1px solid #d8e6f0;
                      padding-top: 12px;
                    }
                    .planner-task-questions-list {
                      border: 1px solid #d8e6f0;
                      border-radius: 8px;
                      max-height: 126px;
                      overflow-y: auto;
                      padding: 8px;
                      background: #fbfdff;
                    }
                    .planner-task-question-row {
                      font-size: 12px;
                      color: #355066;
                      padding: 6px 8px;
                      border-bottom: 1px dashed #dceaf3;
                    }
                    .planner-task-question-row:last-child { border-bottom: none; }
                    .planner-task-summary-wrap {
                      position: relative;
                      display: flex;
                      gap: 12px;
                      flex-wrap: wrap;
                    }
                    .planner-task-summary-card {
                      width: 210px;
                      height: 110px;
                      border-radius: 8px;
                      flex: none;
                    }
                    .planner-task-summary-card .card-icon {
                      width: 26px;
                      height: 26px;
                      border-radius: 7px;
                      background: rgba(255,255,255,.2);
                      display: inline-flex;
                      align-items: center;
                      justify-content: center;
                      margin-right: 8px;
                      font-size: 13px;
                    }
                    .planner-task-summary-title {
                      display: flex;
                      align-items: center;
                      font-size: 12px;
                      font-weight: 700;
                      color: #fff;
                    }
                    .planner-task-summary-count {
                      font-size: 26px;
                      line-height: 1;
                    }
                    .planner-task-card-sub {
                      font-size: 11px;
                      opacity: .9;
                      color: rgba(255,255,255,.92);
                    }
                    .planner-task-separator {
                      margin-top: 14px;
                      border-top: 1px solid #d8e6f0;
                      padding-top: 12px;
                    }
                    .planner-task-fm-shell {
                      border: 1px solid #d8e6f0;
                      border-radius: 8px;
                      background: #f9fcff;
                      padding: 10px;
                    }
                    .planner-task-fm-shell .btn {
                      border-radius: 8px;
                      font-size: 12px;
                      font-weight: 700;
                      height: 30px;
                      padding: 0 10px;
                    }
                    .planner-task-fm-shell .form-control {
                      border: 1px solid #d5e3ee;
                      border-radius: 8px;
                      height: 34px;
                      font-size: 12px;
                    }
                    .planner-task-chat-btn {
                      width: 28px;
                      height: 28px;
                      padding: 0;
                      border-radius: 7px;
                      border: 1px solid #cfe5ff;
                      background: #eaf3ff;
                      color: #2f9cff;
                      display: inline-flex;
                      align-items: center;
                      justify-content: center;
                    }
                    .planner-task-back-btn {
                      border: 1px solid #d8e6f0;
                      background: #fff;
                      color: #2b465a;
                      border-radius: 7px;
                      height: 30px;
                      padding: 0 10px;
                      font-size: 12px;
                      font-weight: 600;
                      display: inline-flex;
                      align-items: center;
                      gap: 6px;
                    }
                    @media (max-width: 1024px) { .planner-task-panel-shell { grid-template-columns: 1fr; } .planner-task-panel-list { border-right: none; border-bottom: 1px solid #d8e6f0; max-height: 250px; } .planner-task-search-wrap { width: 180px; } .planner-task-date-chip { min-width:180px; } }
                    @media (max-width: 1200px) { .planner-task-summary-card { width: 180px; height: 100px; } }
                  `}</style>
                  <div className="planner-task-summary-wrap" style={{ margin: "8px 0" }}>
                    {this.state.showCelebration && (
                      <>
                        <div className={`planner-task-celebrate ${this.state.celebrationType}`}>
                          <div className="celebrate-icon">
                            <i
                              className={`fa ${
                                this.state.celebrationType === "completed"
                                  ? "fa-trophy"
                                  : this.state.celebrationType === "pending"
                                    ? "fa-hourglass-half"
                                    : "fa-bolt"
                              }`}
                            ></i>
                          </div>
                          <div>
                            <div className="celebrate-text-1">{this.state.celebrationText}</div>
                            <div className="celebrate-text-2">
                              {this.state.celebrationCount} TASK
                              {this.state.celebrationCount === 1 ? "" : "S"}{" "}
                              {this.state.celebrationType === "completed"
                                ? "COMPLETED!"
                                : this.state.celebrationType === "pending"
                                  ? "PENDING!"
                                  : "ACTIONABLE!"}
                            </div>
                          </div>
                        </div>
                        <div className="planner-task-confetti">
                          {Array.from({ length: 18 }).map((_, idx) => (
                            <span
                              key={idx}
                              style={{
                                left: `${5 + idx * 5.2}%`,
                                animationDelay: `${(idx % 5) * 0.06}s`,
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    <div
                      className="planner-task-summary-card completed"
                      onClick={() =>
                        this.handleStatusCardClick("completed", this.state.completedTasks)
                      }
                    >
                      <div>
                        <div className="planner-task-summary-title">
                          <span className="card-icon"><i className="fa fa-check"></i></span>
                          Completed Tasks
                        </div>
                        <div className="planner-task-card-sub">Done today</div>
                      </div>
                      <span className="planner-task-summary-count">{this.state.completedTasks}</span>
                    </div>
                    <div
                      className="planner-task-summary-card pending"
                      onClick={() =>
                        this.handleStatusCardClick("pending", this.state.pendingTasks)
                      }
                    >
                      <div>
                        <div className="planner-task-summary-title">
                          <span className="card-icon"><i className="fa fa-clock-o"></i></span>
                          Pending Tasks
                        </div>
                        <div className="planner-task-card-sub">Need follow-up</div>
                      </div>
                      <span className="planner-task-summary-count">{this.state.pendingTasks}</span>
                    </div>
                    <div
                      className="planner-task-summary-card actionable"
                      onClick={() =>
                        this.handleStatusCardClick("actionable", this.state.actionableTasks)
                      }
                    >
                      <div>
                        <div className="planner-task-summary-title">
                          <span className="card-icon"><i className="fa fa-exclamation"></i></span>
                          Actionable Tasks
                        </div>
                        <div className="planner-task-card-sub">Immediate attention</div>
                      </div>
                      <span className="planner-task-summary-count">{this.state.actionableTasks}</span>
                    </div>
                    </div>
                  <div className="card-header d-flex p-2">
                    <div className="d-flex w-100 flex-column">
                      {/* First Row - Main Filters */}
                      <div className="d-flex align-items-center mb-2">
                        <div className="planner-task-filter-row flex-grow-1">
                          <div className="planner-task-filter-chip">
                            <i className="fa fa-tag"></i>
                            <select
                              id="dllCategory"
                              className="form-control planner-task-filter-input"
                              onChange={(e) =>
                                this.setState({
                                  selectedCategoryId: e.target.value,
                                })
                              }
                              disabled={this.state.filtered}
                              value={this.state.selectedCategoryId}
                            >
                              <option value={0}>Select Category</option>
                              {this.state.CategoryData
                                ? this.state.CategoryData.map((e, key) => {
                                    return (
                                      <option key={key} value={e.Id}>
                                        {e.Name}
                                      </option>
                                    );
                                  })
                                : null}
                            </select>
                          </div>
                          <div className="planner-task-filter-chip" style={{ maxWidth: "180px" }}>
                            <i className="fa fa-tags"></i>
                            <select
                              className="form-control planner-task-filter-input"
                              onChange={(e) =>
                                this.setState({
                                  selectedSubCategoryId: e.target.value,
                                })
                              }
                              value={this.state.selectedSubCategoryId}
                              disabled={this.state.filtered}
                            >
                              <option value={0}>Sub Category</option>
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
                          <div className="planner-task-filter-chip">
                            <i className="fa fa-repeat"></i>
                            <select
                              className="form-control planner-task-filter-input"
                              onChange={(e) =>
                                this.setState({
                                  occurance: e.target.value,
                                })
                              }
                              disabled={this.state.filtered}
                              value={this.state.occurance}
                            >
                              <option value="N">Repeat</option>
                              <option value="D">Daily</option>
                              <option value="W">Weekly</option>
                              <option value="M">Monthly</option>
                              <option value="Y">Yearly</option>
                            </select>
                          </div>
                          <div className="planner-task-filter-chip">
                            <i className="fa fa-clock-o"></i>
                            <select
                              className="form-control planner-task-filter-input"
                              onChange={(e) =>
                                this.setState({
                                  taskStatus: e.target.value,
                                })
                              }
                              disabled={this.state.filtered}
                              value={this.state.taskStatus}
                            >
                              <option value="None">Task Status</option>
                              <option value="Pending">Pending</option>
                              <option value="Complete">Complete</option>
                              <option value="Actionable">Actionable</option>
                            </select>
                          </div>
                          <div className="planner-task-filter-chip">
                            <i className="fa fa-exclamation-circle"></i>
                            <select
                              className="form-control planner-task-filter-input"
                              onChange={(e) =>
                                this.setState({
                                  taskPriority: e.target.value,
                                })
                              }
                              disabled={this.state.filtered}
                              value={this.state.taskPriority}
                            >
                              <option value={0}>Task Priority</option>
                              {this.state.taskPriorityList &&
                                this.state.taskPriorityList.map((e, key) => {
                                  return (
                                    <option key={key} value={e.Id}>
                                      {e.Name}
                                    </option>
                                  );
                                })}
                            </select>
                          </div>
                          <div className="planner-task-filter-chip" style={{ maxWidth: "220px" }}>
                            <i className="fa fa-user-o"></i>
                            <select
                              className="form-control planner-task-filter-input"
                              onChange={(e) =>
                                this.setState({
                                  assignTo: e.target.value,
                                })
                              }
                              disabled={this.state.filtered}
                              value={this.state.assignTo}
                            >
                              <option value={0}>Assigned To</option>
                              {this.state.dashboardAssign &&
                                this.state.dashboardAssign.map((e, key) => {
                                  return (
                                    <option key={key} value={e.assignId}>
                                      {e.assignName}
                                    </option>
                                  );
                                })}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Second Row - Assigned To, Date Range, and Buttons */}
                      <div className="d-flex align-items-center">
                        <div className="d-flex flex-grow-1">
                          <div className="planner-task-date-chip">
                            <span className="date-icon">
                              <i className="fa fa-calendar"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control float-right planner-task-filter-input"
                              id="dataRange"
                              disabled={this.state.filtered}
                            ></input>
                          </div>
                        </div>
                        <div className="d-flex ml-auto">
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
                            <button
                              type="button"
                              className={this.state.viewMode === "panel" ? "active" : ""}
                              onClick={() => this.setState({ viewMode: "panel" })}
                            >
                              Panel View
                            </button>
                            <button
                              type="button"
                              className={this.state.viewMode === "table" ? "active" : ""}
                              onClick={() => this.setState({ viewMode: "table" })}
                            >
                              Table View
                            </button>
                          </div>
                          {!this.state.filtered && (
                            <Button
                              id="btnNewTask"
                              Action={this.Filter.bind(this)}
                              ClassName="btn btn-primary mr-2 planner-task-btn rounded shadow-sm d-flex align-items-center"
                              Text={
                                <>
                                  <i className="fa fa-filter mr-1"></i> Filter
                                </>
                              }
                              title="Apply filters"
                            />
                          )}
                          {this.state.filtered && (
                            <Button
                              id="btnNewTask"
                              Action={this.Reset.bind(this)}
                              ClassName="btn btn-danger mr-2 planner-task-btn rounded shadow-sm d-flex align-items-center"
                              Text={
                                <>
                                  <i className="fa fa-times mr-1"></i> Reset
                                </>
                              }
                              title="Clear all filters"
                            />
                          )}
                          <button
                            className="btn btn-outline-success mr-2 planner-task-btn rounded shadow-sm d-flex align-items-center"
                            onClick={this.handleExportWithQuestions}
                            disabled={this.state.exporting}
                          >
                            {this.state.exporting ? (
                              <>
                                <i className="fa fa-spinner fa-spin mr-1"></i>{" "}
                                Exporting...
                              </>
                            ) : (
                              <>
                                <i className="fa fa-file-excel-o mr-1"></i>{" "}
                                Export
                              </>
                            )}
                          </button>

                          <Button
                            id="btnNewTask"
                            Action={this.AddNew.bind(this)}
                            ClassName="btn btn-success planner-task-btn rounded shadow-sm d-flex align-items-center px-3"
                            Icon={<i className="fa fa-plus mr-1"></i>}
                            Text={
                              <span style={{ fontWeight: 600 }}>Add Task</span>
                            }
                            title="Add a new task"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body pt-2">
                    <LoadingOverlay
                      active={this.state.dataLoading}
                      spinner={<PropagateLoader color="#336B93" size={30} />}
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
                        <div className="planner-task-panel-shell">
                          <div className="planner-task-panel-list">
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#6d7f8d",
                                fontWeight: 600,
                                marginBottom: "8px",
                              }}
                            >
                              All Tasks ({filteredData.length})
                            </div>
                            {filteredData.map((task) => (
                              <button
                                key={task.TaskId}
                                type="button"
                                className={`planner-task-panel-item ${
                                  (activeTask && activeTask.TaskId) === task.TaskId ? "active" : ""
                                }`}
                                onClick={() =>
                                  this.setState({ selectedTaskId: task.TaskId })
                                }
                              >
                                <div
                                  style={{
                                    fontWeight: 700,
                                    color: "#22384c",
                                    fontSize: "13px",
                                  }}
                                >
                                  {task.Name}
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#6d7f8d",
                                    marginTop: "2px",
                                  }}
                                >
                                  {task.AssignedTo || "-"}
                                </div>
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: "#8899a8",
                                    marginTop: "2px",
                                  }}
                                >
                                  {task.DateFrom || "-"}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "6px",
                                    marginTop: "6px",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <span
                                    className={`planner-task-status-pill ${this.getStatusClass(
                                      task.TaskStatus,
                                    )}`}
                                  >
                                    {task.TaskStatus || "-"}
                                  </span>
                                  <span
                                    className={`planner-task-priority-chip ${this.getPriorityClass(
                                      task.TaskPriority,
                                    )}`}
                                  >
                                    {task.TaskPriority || "-"}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                          <div className="planner-task-panel-detail">
                            {!activeTask && (
                              <div className="text-muted">No tasks found.</div>
                            )}
                            {activeTask && (
                              <>
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <h3
                                      style={{
                                        margin: 0,
                                        color: "#22384c",
                                        fontWeight: 700,
                                        fontSize: "24px",
                                      }}
                                    >
                                      {activeTask.Name || "-"}
                                    </h3>
                                    <div
                                      style={{
                                        marginTop: "4px",
                                        display: "flex",
                                        gap: "6px",
                                        flexWrap: "wrap",
                                      }}
                                    >
                                      <span
                                        className={`planner-task-status-pill ${this.getStatusClass(
                                          activeTask.TaskStatus,
                                        )}`}
                                      >
                                        {activeTask.TaskStatus || "-"}
                                      </span>
                                      <span
                                        className={`planner-task-priority-chip ${this.getPriorityClass(
                                          activeTask.TaskPriority,
                                        )}`}
                                      >
                                        {activeTask.TaskPriority || "-"}
                                      </span>
                                    </div>
                                  </div>
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    <button
                                      className="planner-task-chat-btn"
                                      onClick={() => {
                                        this.setState({ panelRightMode: "fm" });
                                        if (
                                          !this.state.panelFmQuestion &&
                                          this.state.panelQuestions.length > 0
                                        ) {
                                          this.handlePanelQuestionSelect(
                                            this.state.panelQuestions[0],
                                            activeTask,
                                          );
                                        }
                                      }}
                                      title="FM Remarks"
                                    >
                                      <i className="fa fa-comments"></i>
                                    </button>
                                    <button
                                      className="planner-task-icon-btn view"
                                      onClick={this.ViewTask.bind(this, activeTask)}
                                      title="View"
                                    >
                                      <i className="fa fa-eye"></i>
                                    </button>
                                    <button
                                      className="planner-task-icon-btn edit"
                                      onClick={this.EditTask.bind(this, activeTask)}
                                      title="Edit"
                                    >
                                      <i className="fa fa-edit"></i>
                                    </button>
                                    <button
                                      className="planner-task-icon-btn delete"
                                      onClick={this.DeleteTask.bind(this, activeTask)}
                                      title="Delete"
                                    >
                                      <i className="fa fa-trash"></i>
                                    </button>
                                  </div>
                                </div>
                                {this.state.panelRightMode === "details" && (
                                  <>
                                <div className="planner-task-detail-grid">
                                  <div>
                                    <div className="planner-task-label">Task Id</div>
                                    <div className="planner-task-value">
                                      #{activeTask.TaskId || "-"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="planner-task-label">Due Date</div>
                                    <div className="planner-task-value">
                                      {activeTask.DateFrom || "-"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="planner-task-label">Category</div>
                                    <div className="planner-task-value">
                                      {activeTask.CategoryName || "-"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="planner-task-label">Sub Category</div>
                                    <div className="planner-task-value">
                                      {activeTask.SubCategoryName || "-"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="planner-task-label">Assigned To</div>
                                    <div className="planner-task-value">
                                      {activeTask.AssignedTo || "-"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="planner-task-label">Occurence</div>
                                    <div className="planner-task-value">
                                      {activeTask.OccurenceView || "-"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="planner-task-label">Updated On</div>
                                    <div className="planner-task-value">
                                      {activeTask.UpdatedOn || "-"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="planner-task-label">Location</div>
                                    <div className="planner-task-value">
                                      {activeTask.Location || "-"}
                                    </div>
                                  </div>
                                  <div style={{ gridColumn: "1 / -1" }}>
                                    <div className="planner-task-label">Remarks</div>
                                    <div className="planner-task-value">
                                      {activeTask.Remarks || "-"}
                                    </div>
                                  </div>
                                </div>
                                <div className="planner-task-questions-card">
                                  <div className="planner-task-label">Question Details</div>
                                  <div className="planner-task-questions-list">
                                    {this.state.panelQuestionsLoading && (
                                      <div className="planner-task-question-row">
                                        Loading questions...
                                      </div>
                                    )}
                                    {!this.state.panelQuestionsLoading &&
                                      this.state.panelQuestions.length === 0 && (
                                        <div className="planner-task-question-row">
                                          No question details available.
                                        </div>
                                      )}
                                    {!this.state.panelQuestionsLoading &&
                                      this.state.panelQuestions.map((q, idx) => (
                                        <div
                                          key={`${q.QuesId}-${idx}`}
                                          className="planner-task-question-row"
                                        >
                                          {idx + 1}. {q.QuesName}
                                        </div>
                                      ))}
                                  </div>
                                </div>

                                <div className="planner-task-separator">
                                  <div className="planner-task-label">Asset Details</div>
                                  <div className="planner-task-detail-grid" style={{ marginTop: "8px" }}>
                                    <div>
                                      <div className="planner-task-label">Asset Id</div>
                                      <div className="planner-task-value">
                                        {activeTask.AssetId || "-"}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="planner-task-label">QR Code</div>
                                      <div className="planner-task-value">
                                        {activeTask.QRcode || "-"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                  </>
                                )}
                                {this.state.panelRightMode === "fm" && (
                                  <div className="planner-task-separator">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <button
                                        className="planner-task-back-btn"
                                        onClick={() =>
                                          this.setState({ panelRightMode: "details" })
                                        }
                                      >
                                        <i className="fa fa-arrow-left"></i> Back to Details
                                      </button>
                                      <div className="planner-task-label" style={{ margin: 0 }}>
                                        FM Remarks
                                      </div>
                                    </div>
                                    <div className="planner-task-fm-shell">
                                      <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="d-flex flex-wrap" style={{ gap: "6px" }}>
                                          {this.state.panelQuestions.map((q) => (
                                            <button
                                              key={q.QuesId}
                                              className={`btn btn-sm ${
                                                this.state.panelFmQuestion?.QuesId === q.QuesId
                                                  ? "btn-primary"
                                                  : "btn-outline-primary"
                                              }`}
                                              onClick={() =>
                                                this.handlePanelQuestionSelect(q, activeTask)
                                              }
                                            >
                                              {q.QuesName}
                                            </button>
                                          ))}
                                        </div>
                                        <input
                                          type="date"
                                          className="form-control"
                                          style={{ maxWidth: "180px" }}
                                          value={this.state.panelFmDate || ""}
                                          onChange={(e) =>
                                            this.handlePanelFMDateChange(e, activeTask)
                                          }
                                          disabled={!this.state.panelFmQuestion}
                                        />
                                      </div>

                                      {this.state.panelRemarksLoading && (
                                        <p className="text-muted mb-2">Loading task remarks...</p>
                                      )}

                                      {this.state.panelFmQuestion && (
                                        <ChatBox
                                          remarks={this.state.panelRemarks}
                                          status={activeTask.CurrentStatus || "Actionable"}
                                          context="task"
                                          onSend={(msg, status) =>
                                            this.sendPanelFMRemark(msg, status, activeTask)
                                          }
                                        />
                                      )}
                                      {this.state.panelFmQuestion &&
                                        !this.state.panelRemarksLoading &&
                                        this.state.panelRemarks.length === 0 && (
                                          <p className="text-muted mt-2 mb-0">
                                            {this.state.panelHasAnyRemarksForQuestion
                                              ? "No remarks available for selected date."
                                              : "No FM remarks available yet."}
                                          </p>
                                        )}
                                    </div>
                                  </div>
                                )}
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
            categoryData={this.state.CategoryData}
            onTaskAdded={() => this.getTasks()}
            type={"PPMtask"}
            sourceView={this.state.viewMode}
          />
        )}
        {this.state.PageMode === "AddQuestion" && (
          <AddQuestion
            showQuesModal={this.state.showQuesModal}
            closeModal={this.closeModal}
            rowData={this.state.rowData}
          />
        )}
        {this.state.PageMode === "ViewTask" && (
          <ViewTask
            showTaskModal={this.state.showTaskModal}
            closeModal={this.closeModal}
            rowData={this.state.rowData}
          />
        )}
        {this.state.PageMode === "EditTask" && (
          <EditTask
            showEditModal={this.state.showEditModal}
            closeModal={this.closeModal}
            rowData={this.state.rowData}
            categoryData={this.state.CategoryData}
          />
        )}
      </div>
    );
  }
}
const mapStateToProps = (state, props) => {
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

export default connect(mapStateToProps, mapDispatchToProps)(TaskList);
