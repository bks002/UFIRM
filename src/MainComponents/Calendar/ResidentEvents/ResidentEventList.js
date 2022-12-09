import React, { Component } from "react";
import moment from "moment";
import LoadingOverlay from "react-loading-overlay";
import { PropagateLoader } from "react-spinners";
import Button from "../../../ReactComponents/Button/Button";
import DataTable from "../../../ReactComponents/ReactTable/DataTable";
import DropdownList from "../../../ReactComponents/SelectBox/DropdownList";
import MultiSelectDropdown from "../../KanbanBoard/MultiSelectDropdown";
import ApiProvider from "../DataProvider";
import AddResidentEvent from "./AddResidentEvent";
import AddQuestion from "./AddQuestion";
import ViewResidentEvent from "./ViewResidentEvent";
import * as appCommon from "../../../Common/AppCommon.js";
import swal from "sweetalert";
import { DELETE_CONFIRMATION_MSG } from "../../../Contants/Common";
import { APPROVE_CONFIRMATION_MSG } from "../../../Contants/Common";


const $ = window.$;

export default class ResidentEventList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          Header: "Id",
          accessor: "Id",
        },
        {
          Header: "Event Name",
          accessor: "EventName",
        },
        {
          Header: "Task Name",
          accessor: "TaskName",
        },
        {
          Header: "Booked By",
          accessor: "BookedByName",
        },
        {
          Header: "Action",
          Cell: (data) => {
            return (
              <div style={{ display: "flex" }}>
                { data.cell.row.original.IsApproved == 0 ?
                <button
                                            className="btn btn-success btn-sm mr-1"
                  onClick={this.handleApprove.bind(this, data.cell.row.original)}

                                            title="Approve"
                                        >
                                            <i className="fa fa-check"></i>
                                        </button> : <h6 className="bg-success p-1">Approved</h6>
          }
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
    };
    this.ApiProvider = new ApiProvider();
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


  getApproveTaskModel = (type, bookingId) => {
    var model = [];
    switch (type) {
      case "Approve":
        model.push({
          CmdType: type,
          BookingId: bookingId,
        });
        break;
      default:
    }
    return model;
  }

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

  manageEvents = (model, type) => {
    this.ApiProvider.manageResidentEvents(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          switch (type) {
            case "R":
              let eventData = [];
              rData.forEach((element) => {
                eventData.push({
                  Id: element.Id,
                  EventName: element.EventName,
                  TaskName : element.TaskName,
                  BookedByName : element.BookedByName,
                  IsApproved: element.IsApproved,
                });
              });
              this.setState({ data: eventData });
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
              this.getEvents();
              break;
              case "Approve":
                if (rData === "success") {
                  appCommon.showtextalert(
                    "Event Approved Successfully!",
                    "",
                    "success"
                  );
                } else {
                  appCommon.showtextalert("Someting went wrong !", "", "error");
                }
                this.getEvents();
                break;
            default:
          }
        });
      }
    });
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

  getEvents() {
    var type = "R";
    var model = this.getModel(type);
    console.log(model);
    this.manageEvents(model, type);
  }
  getAssign() {
    var type = "R";
    var model = this.getAssignModel(type);
    this.manageAssign(model, type);
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
  }

  componentDidMount() {
    const startDate = moment().clone().startOf("month");
    const endDate = moment().clone().endOf("month");
    this.DateRangeConfig(startDate, endDate);

    this.getCategory();
    this.getEvents();
    this.getAssign()
    // this.TaskStatusConfig();
  }

  AddNew = () => {
    this.setState({ PageMode: "Add", showAddModal: true });
  };

  Filter = () => {
    if (this.state.selectedCategoryId > 0) {
      this.setState({ filtered: true });
      this.getEvents();
    } else {
      appCommon.showtextalert("", "Please Select Category", "warning");
    }
  };

  Reset = () => {
    this.setState({
      filtered: false,
      selectedCategoryId: 0,
      selectedSubCategoryId: 0,
    });
    this.getEvents();
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

  DeleteTask = (data) => {
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

  handleApprove = (data) => {
    console.log(data);
    let myhtml = document.createElement("div");
    myhtml.innerHTML = APPROVE_CONFIRMATION_MSG + "</hr>";
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
          var type = "Approve";
          var model = this.getApproveTaskModel(type, data.Id);
          this.manageEvents(model, type);
          break;
        case "cancel":
          break;
        default:
          break;
      }
    });
  }

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
        this.getEvents();
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
                  <div className="card-header d-flex p-0">
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
                              Text=" Add New"
                            />
                          </div>
                        </div>
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
                        isDefaultPagination={true}
                      />
                    </LoadingOverlay>
                  </div>
                </div>
              </div>
            </LoadingOverlay>
          </div>
        )}
        {this.state.showAddModal && (
          <AddResidentEvent
            showAddModal={this.state.showAddModal}
            closeModal={this.closeModal}
            getEvents={this.getEvents}
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
          <ViewResidentEvent
            // showTaskModal={this.state.showTaskModal}
            // closeModal={this.closeModal}
            // rowData={this.state.rowData}
          />
        )}
      </div>
    );
  }
}
