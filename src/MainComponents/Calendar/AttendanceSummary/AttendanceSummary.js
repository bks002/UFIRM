import React, { Component } from "react";
import moment from "moment";
import LoadingOverlay from "react-loading-overlay";
import { PropagateLoader } from "react-spinners";
import Button from "../../../ReactComponents/Button/Button";
import DataTable from "../../../ReactComponents/ReactTable/DataTable";
import ApiProvider from "../DataProvider";
import * as appCommon from "../../../Common/AppCommon.js";
import swal from "sweetalert";
import { DELETE_CONFIRMATION_MSG } from "../../../Contants/Common";
import { downloadExcel } from "react-export-table-to-excel";
import { CSVLink } from 'react-csv'

const $ = window.$;

export default class AttendanceSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          Header: "Id",
          accessor: "Id",
        },
        {
          Header: "Employee Name",
          accessor: "FacilityMemberName",
        },
        {
          Header: "Date",
          accessor: "Date",
        },
        {
          Header: "Leave Type",
          accessor: "Leave",
        },
        {
          Header: "Action",
          Cell: (data) => {
            return (
              <div style={{ display: "flex" }}>
                <button
                  className="btn btn-sm btn-danger"
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
      filterFromDate:'',
      filterToDate:'',
      taskStatus:'None',
      startDate : moment().clone().startOf("month"),
      endDate : moment().clone().endOf("month"),
      header :["Task Id", "Category", "Sub Category","Task Name","Occurence","Updated On","Task Status"]
    };
    this.ApiProvider = new ApiProvider();
  }


  getModel = (type, date) => {
    var model = [];
    switch (type) {
      case "R":
        model.push({
          CmdType: type,
          Date : date
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

  manageEmployee = (model, type) => {
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

  getFacilityMember(value) {
    var type = "R";
    var model = this.getModel(type, value);
    this.manageFacilityMember(model, type);
  }

  manageFacilityMember = (model, type) => {
    this.ApiProvider.manageFacility(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          let FacilityData = [];
          rData.forEach((element) => {
            FacilityData.push({
              Id: element.catId,
              Name: element.name,
            });
          });
          switch (type) {
            case "R":
              this.setState({ CategoryData: FacilityData });
              break;
            default:
          }
        });
      }
    });
  };

  manageAttendanceData = (model, type) => {
    console.log(model);
    this.ApiProvider.manageAttendanceData(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          switch (type) {
            case "R":
              let attendanceData = [];
              rData.forEach((element) => {
                attendanceData.push({
                  Id: element.Id,
                  FacilityMemberId: element.FacilityMemberId,
                  FacilityMemberName: element.FacilityMemberName,
                  Date: element.Date.split("T")[0],
                  Leave: element.Leave,
                });
              });
              this.setState({ data: attendanceData });
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
              this.getAttendanceData();
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

  getAttendanceData() {
    var type = "R";
    //today date
    var date = moment().format("2023-06-20");
    var model = this.getModel(type, date);
    this.manageAttendanceData(model, type);
  }

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
    this.getAttendanceData();
  }

  AddNew = () => {
    this.setState({ PageMode: "Add", showAddModal: true });
  };

  Filter = () => {
    if (this.state.selectedCategoryId > 0 ||this.state.assignTo > 0 || this.state.occurance !="" || this.state.taskStatus != "None") {
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
      }
    );
  };

  selectedCategory = (value) => this.setState({ selectedCategoryId: value });


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
                  {/* <div className="card-header d-flex p-0">
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
                          {this.state.assign &&
                            this.state.assign.map((e, key) => {
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
                    <ul className="nav ml-auto tableFilterContainer">
                      <li className="nav-item">
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <Button
                              id="btnNewTask"
                              Action={this.AddNew.bind(this)}
                              ClassName="btn btn-success"
                              Icon={
                                <i
                                  className="fa fa-plus"
                                  aria-hidden="true"
                                ></i>
                              }
                              Text=" Create New"
                            />
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div> */}
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
        {/* {this.state.showAddModal && (
          <AddTask
            showAddModal={this.state.showAddModal}
            closeModal={this.closeModal}
            categoryData={this.state.CategoryData}
            getTask={this.getTasks}
          />
        )} */}
      </div>
    );
  }
}
