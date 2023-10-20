import React, { Component } from "react";
import moment from "moment";
import LoadingOverlay from "react-loading-overlay";
import { PropagateLoader } from "react-spinners";
import Button from "../../../ReactComponents/Button/Button";
import DataTable from "../../../ReactComponents/ReactTable/DataTable";
import DropdownList from "../../../ReactComponents/SelectBox/DropdownList";
import MultiSelectDropdown from "../../KanbanBoard/MultiSelectDropdown";
import ApiProvider from "../DataProvider";
import ViewTask from "./ViewTask";
import * as appCommon from "../../../Common/AppCommon.js";
import swal from "sweetalert";
import { DELETE_CONFIRMATION_MSG } from "../../../Contants/Common";
import { downloadExcel } from "react-export-table-to-excel";
import { CSVLink } from 'react-csv'
import LayoutDataProvider from '../../../Routing/LayoutDataProvider'

const $ = window.$;

export default class TaskAnalysis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          Header: "Id",
          accessor: "Id",
        },
        {
          Header: "Category",
          accessor: "CategoryName",
        },
        {
          Header: "Task Name",
          accessor: "TaskName",
        },
        {
          Header: "Total Tasks",
          accessor: "TotalTasks",
        },
        {
          Header: "Completed Tasks",
          accessor: "CompletedTasks",
        },
        {
          Header: "Overdue Tasks",
          accessor:"OverdueTasks"
        },
        {
          Header: "Completion Percentage",
          accessor:"CompletionPercentage"
        },
        {
          Header: "Action Item",
          accessor:"ActionItem"
        },
        {
          Header: "Action",
          Cell: (data) => {
            return (
              <div style={{ display: "flex" }}>
                <button
                  className="btn btn-sm btn-info"
                  onClick={this.ViewTask.bind(this, data.cell.row.original)}
                  title="View"
                  style={{ marginRight: "5px" }}
                >
                  <i className="fa fa-eye"></i>
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
      showAddModal: false,
      showEditModal: false,
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
      dashboardAssign:[],
      taskPriorityList:[],
      taskPriority:'',
      filterFromDate:'',
      filterToDate:'',
      taskStatus:'None',
      startDate : moment().clone().startOf("month"),
      endDate : moment().clone().endOf("month"),
      propertyId:0,
      propertyData:[],
      header :["Task Id", "Category", "Sub Category","Task Name","Occurence","Updated On","Task Status"],
      pendingTasks:0,
      completedTasks:0,
      actionableTasks:0,
      assignedProperty:[]
    };
    this.ApiProvider = new ApiProvider();
    this.comdbprovider = new LayoutDataProvider();
  }

  handleDownloadExcel() {
    downloadExcel({
      fileName: `TaskList`,
      sheet: "react-export-table-to-excel",
      tablePayload: {
        header:this.state.header,
        // accept two different data structures
        body: this.state.data
      }
    });
  }

  loadProperty() {
    this.comdbprovider.getUserAssignedproperty().then(
        resp => {
            if (resp && resp.ok && resp.status == 200) {
                return resp.json().then(rData => {
                    this.setState({ propertyData: rData });
                });
            }
        });
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

  getTaskModel = (type, categoryId, subCategoryId,assignTo,occurance,startDate,endDate,taskStatus,propertyId,taskPriority) => {
    var model = [];
    switch (type) {
      case "GetAllTaskWiseSummary":
        // model.push({
        //   CmdType: type,
        //   CategoryId: categoryId,
        //   SubCategoryId: subCategoryId,
        //   AssignedTo: assignTo,
        //   Occurrence: occurance,
        //   DteFr : startDate,
        //   DteTo : endDate,
        //   TaskStatus : taskStatus,
        //   PropertyId : propertyId,
        //   TaskPriority:taskPriority
        // });
        let obj = {
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
        }
        for(let key in obj){
          if(obj[key] == '' || obj[key] == 0 ||obj[key] == undefined || obj[key] == null){
            delete obj[key]
          }
        }
        model.push(obj)
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
          PropertyId: this.state.propertyId ? this.state.propertyId : 0,
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
      if (resp.ok && resp.status == 200) {
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
    this.ApiProvider.manageTask(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          switch (type) {
            case "GetAllTaskWiseSummary":
              let taskData = [];
              rData.forEach((element) => {
                taskData.push({
                  Id: element.Id,
                  CategoryId:element.CategoryId,
                  CategoryName: element.CategoryName,
                  TaskName: element.TaskName,
                  TotalTasks: element.TotalTasks,
                  CompletedTasks: element.CompletedTasks,
                  OverdueTasks: element.OverdueTasks,
                  CompletionPercentage: element.CompletionPercentage,
                  ActionItem: element.ActionItem,
                });
              });
              this.countTasksByStatus(taskData)
              this.setState({ data: taskData});
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
  };

  modifyOccurence = (Occurrence)=>{
    if(Occurrence == 'W'){
      return 'Weekly'
    }
    if(Occurrence == 'Y'){
      return 'Yearly'
    }
    if(Occurrence == 'D'){
      return 'Daily'
    }
    if(Occurrence == 'M'){
      return 'Monthly'
    }
  }
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

  manageDashboardAssign = (model, type) => {
    this.ApiProvider.manageDashboardAssign(model, type).then((resp) => {
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
      if (resp.ok && resp.status == 200) {
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

  
  // manageProperties = (model, type) => {
  //   this.ApiProvider.manageProperties(model, type).then((resp) => {
  //     if (resp.ok && resp.status == 200) {
  //       return resp.json().then((rData) => {
  //         let propertyData = [];
  //         rData.forEach((element) => {
  //           propertyData.push({
  //             propertyId: element.PropertyId,
  //             name: element.Name,
  //           });
  //         });
  //         switch (type) {
  //           case "R":
  //             this.setState({ propertyData: propertyData });
  //             break;
  //           default:
  //         }
  //       });
  //     }
  //   });
  // };

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

  
  getAllProperties() {
    var type = "R";
    var model = this.getModel(type);
    this.manageProperties(model, type);
  }

  getTasks() {
    var type = "GetAllTaskWiseSummary";
    var propertyId = this.state.propertyId ? this.state.propertyId : 0;
    var categoryId = this.state.selectedCategoryId
      ? this.state.selectedCategoryId
      : 0;
    var subCategoryId = this.state.selectedSubCategoryId
      ? this.state.selectedSubCategoryId
      : 0;
      var assignToId = this.state.assignTo
      ? this.state.assignTo
      : 0;
      var occurance = this.state.occurance ? this.state.occurance : null;
      var startDate  = this.state.filterFromDate ? this.state.filterFromDate :null;
      var endDate  = this.state.filterToDate ? this.state.filterToDate : null;
      var taskStatus = this.state.taskStatus === 'None'? null : this.state.taskStatus;
      var taskPriority = this.state.taskPriority ? this.state.taskPriority : 0;
    var model = this.getTaskModel(type, categoryId, subCategoryId, assignToId, occurance,startDate,endDate,taskStatus,propertyId,taskPriority);
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
      if (item.TaskId == id) {
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
    $('#dataRange').on('apply.daterangepicker', function (ev, picker) {
      var startDate = picker.startDate;
      var endDate = picker.endDate;
      console.log(startDate , endDate);
      _this.setState({ filterFromDate: startDate.format('YYYY-MM-DD'), filterToDate: endDate.format('YYYY-MM-DD') })
  });
  }

  componentDidMount() {
    const startDate = this.state.startDate;
    const endDate = this.state.endDate;
    this.DateRangeConfig(startDate, endDate);

    this.getCategory();
    this.getTasksPriority();
    this.getAssign()
    this.getDashboardAssignList()
    // this.getAllProperties();
    this.loadProperty()

    // this.TaskStatusConfig();
  }

  AddNew = () => {
    this.setState({ PageMode: "Add", showAddModal: true });
  };

  Filter = () => {
    if (this.state.selectedCategoryId > 0) {
      this.setState({ filtered: true });
      this.getTasks();
    } else {
      appCommon.showtextalert("", "Please Select Any Filter Attribute", "warning");
    }
  };

  Reset = () => {
    this.setState({
      filtered: false,
      selectedCategoryId: 0,
      selectedSubCategoryId: 0,
      occurance:'',
      assignTo:0,
      taskStatus:"None",
      propertyId:0,
      completedTasks:0,
      pendingTasks:0,
      actionableTasks:0,
      taskPriority:0
    });
    this.getTasks();
  };

  AddQuestion = (data) => {
    this.setState({
      PageMode: "AddQuestion",
      showQuesModal: true,
      rowData: data,
    });
  };
  ViewTask = (data) => {
    if(this.state.occurance === ''){
      appCommon.showtextalert("", "Please Select Occurance", "warning");

    }
    else{
      this.setState({ PageMode: "ViewTask", showTaskModal: true, rowData: data });
    }
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

        this.getCategory();
        this.getTasks();
        // this.TaskStatusConfig();
      }
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

    if (prevState.propertyId !== this.state.propertyId) {
      this.getAssign();
      this.getDashboardAssignList()
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
    data.forEach((element)=>{
      if(element.TaskStatus === 'Completed'){
        this.setState({completedTasks:this.state.completedTasks+1})
      }
      if(element.TaskStatus === 'Pending'){
        this.setState({pendingTasks:this.state.pendingTasks+1})
      }
      if(element.TaskStatus === 'Actionable'){
        this.setState({actionableTasks:this.state.actionableTasks+1})
      }
    })
  };

  render() {
    return (
      <div>
        {this.state.PageMode === "Home" && (
          <div className="row">
            <LoadingOverlay
              active={this.state.loading}
              spinner={<PropagateLoader color="#336B93" size={30} />}
            >
              <div className="col-12">
                <div className="card">
                  <div className="card-header d-flex p-0">
                    <ul className="nav tableFilterContainer">
                      <li className="nav-item">
                        <select
                          id="dllCategory"
                          className="form-control"
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
                      </li>
                      <li className="nav-item">
                        <select
                          className="form-control"
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
                      </li>

                      <li className="nav-item">
                        <select
                          className="form-control"
                          onChange={(e) =>
                            this.setState({
                              propertyId: e.target.value,
                            })
                          }
                          value={this.state.propertyId}
                          disabled={this.state.filtered}

                        >
                          <option value={0}>Property</option>
                          {this.state.propertyData &&
                            this.state.propertyData.map((e, key) => {
                              return (
                                <option key={key} value={e.id}>
                                  {e.text}
                                </option>
                              );
                            })}
                        </select>
                      </li>
                      <li>
                        <select
                          className="form-control"
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
                      </li>
                      <li>
                        <select
                          className="form-control"
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
                      </li>

                      <li>
                        <select
                          className="form-control"
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
                      </li>
                      <li className="nav-item">
                        <div className="input-group input-group-sm">
                          <div className="form-group">
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  <i className="far fa-calendar-alt"></i>
                                </span>
                              </div>
                              <input
                                type="text"
                                className="form-control float-right"
                                id="dataRange"
                          disabled={this.state.filtered}
                              ></input>
                            </div>
                          </div>
                        </div>
                      </li>
                      <li>
                        <select
                          className="form-control"
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
                      </li>
                      {!this.state.filtered && (
                        <li>
                          <Button
                            id="btnNewTask"
                            Action={this.Filter.bind(this)}
                            ClassName="btn btn-primary"
                            Text="Filter"
                          />
                        </li>
                      )}
                      {this.state.filtered && (
                        <li>
                          <Button
                            id="btnNewTask"
                            Action={this.Reset.bind(this)}
                            ClassName="btn btn-danger"
                            Text="Reset"
                          />
                        </li>
                      )}
                      <li>
                          {/* <Button
                            id="btnNewTask"
                            Action={this.handleDownloadExcel.bind(this)}
                            ClassName="btn btn-info"
                            Text="Export"
                            Icon={
                              <i
                                className="fa fa-arrow-down"
                                aria-hidden="true"
                              ></i>
                            }
                          /> */}
        <button
                  className="btn btn-info"
                  name="Export"
                >
            <CSVLink data={this.state.data} filename={'Tasklist'} style={{ color: "white" }}><i
                                className="fa fa-arrow-down"
                                aria-hidden="true"
                              ></i> Export</CSVLink>
                </button>
                        </li>
                    </ul>
                  </div>
                  <div className="card-body pt-2">
                    <LoadingOverlay
                      active={this.state.loading}
                      spinner={<PropagateLoader color="#336B93" size={30} />}
                    >
                      <DataTable
                      data={this.state.data}
                      columns={this.state.columns}
                      hideGridSearchAndSize={true}
                      globalSearch={true}
                      isDefaultPagination={true}/> 
                      
                    </LoadingOverlay>
                  </div>
                </div>
              </div>
            </LoadingOverlay>
          </div>
        )}
        {this.state.PageMode === "ViewTask" && (
          <ViewTask
            showTaskModal={this.state.showTaskModal}
            closeModal={this.closeModal}
            rowData={this.state.rowData}
            occurance={this.state.occurance}
          />
        )}
      </div>
    );
  }
}
