import React, { Component } from "react";
import moment from "moment";
import LoadingOverlay from "react-loading-overlay";
import { PropagateLoader } from "react-spinners";
import Button from "../../../ReactComponents/Button/Button";
import DataTable from "../../../ReactComponents/ReactTable/DataTable";
import DropdownList from "../../../ReactComponents/SelectBox/DropdownList";
import MultiSelectDropdown from "../../KanbanBoard/MultiSelectDropdown";
import ApiProvider from "../DataProvider";
import AddTask from "./AddTask";
import AddQuestion from "./AddQuestion";
import ViewTask from "./ViewTask";

const $ = window.$;

export default class TaskList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
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
          Header: "Start Date",
          accessor: "DateFrom",
        },
        {
          Header: "End Date",
          accessor: "DateTo",
        },
        {
          Header: "Start Time",
          accessor: "TimeFrom",
        },
        {
          Header: "End Time",
          accessor: "TimeTo",
        },
        // {
        //   Header: "Recurrence",
        //   accessor: "Occurrence",
        // },
        // {
        //   Header: "Status",
        // },
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
                  className="btn btn-sm btn-primary"
                  onClick={this.AddQuestion.bind(this, data.cell.row.original)}
                  title="Add"
                  style={{ marginRight: "5px" }}
                >
                  <i className="fa fa-plus"></i>
                </button>
                <button
                  className="btn btn-sm btn-info"
                  onClick={this.ViewTask.bind(this, data.cell.row.original)}
                  title="View"
                  style={{ marginRight: "5px" }}
                >
                  <i className="fa fa-eye"></i>
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={this.AddQuestion.bind(this, data.cell.row.original)}
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
      PageMode: "Home",
      showQuesModal: false,
      showTaskModal: false,
      actionVisible: false,
      taskId: "",
      taskName: "",
      rowData: {},
      subCategory: [],
    };
    this.ApiProvider = new ApiProvider();
  }

  getModel = (type,categoryId,subCategoryId) => {
    var model = [];
    switch (type) {
      case "R":
        model.push({
          CmdType: type,
          CategoryId: categoryId,
          SubCategoryId: subCategoryId,
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
              Occurence: element.Occurence,
              CategoryName: element.CategoryName,
              SubCategoryName: element.SubCategoryName,
              EntryType: element.EntryType,
            });
          });
          switch (type) {
            case "R":
              this.setState({ data: taskData });
              break;
            default:
          }
        });
      }
    });
  };

  manageSubCategory = (model, type,categoryId) => {
    this.ApiProvider.manageSubCategory(model, type,categoryId).then(
      resp => {
        if (resp.ok && resp.status == 200) {
          return resp.json().then(rData => {
            let subCatData = [];
            rData.forEach(element => {
              subCatData.push({
                SubCategoryId: element.SubCategoryId,
                CategoryId: element.CategoryId,
                SubCategoryName: element.SubCategoryName
              });
            });
            switch (type) {
              case 'R':
                this.setState({ subCategory: subCatData });
                break;
              default:
            }
          });
        }
      }
    );
  }

  getCategory() {
    var type = "R";
    var model = this.getModel(type);
    this.manageCategory(model, type);
  }

  getSubCategory() {
    var type='R'
    var model = this.getModel(type);
    var categoryId = this.state.selectedCategoryId ? this.state.selectedCategoryId : 0;
    this.manageSubCategory(model, type,categoryId);
  }

  getTasks() {
    var type = "R";
    const categoryId = this.state.selectedCategoryId ? this.state.selectedCategoryId : 0;
    const subCategoryId = this.state.selectedSubCategoryId ? this.state.selectedSubCategoryId : 0;
    var model = this.getModel(type,categoryId,subCategoryId);
    this.manageTask(model, type);
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
    this.getTasks();
    this.TaskStatusConfig();
  }

  AddNew = () => {
    this.setState({ PageMode: "Add", showAddModal: true });
  };

  Filter=()=>{
    console.log(this.state.selectedCategoryId,this.state.selectedSubCategoryId);
    this.getTasks();
  }

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
        this.TaskStatusConfig();
      }
    );
  };

  selectedCategory = (value) => this.setState({ selectedCategoryId: value });

  // closeModal = () => this.setState({ PageMode: 'Home', showAddModal: false });

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedCategoryId !== this.state.selectedCategoryId) {
      this.getSubCategory();
    }
  }
  onCategorySelected = (val) => {};

  TaskStatusConfig() {
    let _this = this;
    $("#ticketMutliSelect").multiselect({
      onSelectAll: function () {
        // _this.filterOnChange();
      },
      onDeselectAll: function () {
        // _this.filterOnChange();
      },
      onChange: function (option, checked, select) {
        // _this.filterOnChange();
      },
    });
  }
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
                          onChange={(e) => this.setState({
                            selectedSubCategoryId: e.target.value
                        })}
                        >
                          <option value="">Sub Category</option>
                          {
                          this.state.subCategory && this.state.subCategory.map((e, key) => {
                            return <option key={key} value={e.SubCategoryId}>{e.SubCategoryName}
                            </option>
                          }) 
                        }
                        </select>
                      </li>
                      <li className="nav-item">
                        <div className="input-group-prepend">
                          <select
                            className="form-control-sm pr-0 input-group-text"
                            data-placeholder="Status"
                            id="ticketMutliSelect"
                            multiple="multiple"
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="In Review">In Review</option>
                            <option value="Completed">Completed</option>
                            <option value="Deleted">Deleted</option>
                            <option value="Over Due">Over Due</option>
                          </select>
                        </div>
                      </li>
                      <li className="nav-item">
                        <MultiSelectDropdown
                          id="assigneeUser"
                          option={this.state.usersList}
                        />
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
                              ></input>
                            </div>
                          </div>
                        </div>
                      </li>
                      <li>
                      <Button
                              id="btnNewTask"
                              Action={this.Filter.bind(this)}
                              ClassName="btn btn-primary btn-sm"
                              Text="Filter"
                            />
                      </li>
                    </ul>
                    <ul className="nav ml-auto tableFilterContainer">
                      <li className="nav-item">
                        <div className="input-group input-group-sm">
                          <div className="input-group-prepend">
                            <Button
                              id="btnNewTask"
                              Action={this.AddNew.bind(this)}
                              ClassName="btn btn-success btn-sm"
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
          <AddTask
            showAddModal={this.state.showAddModal}
            closeModal={this.closeModal}
            categoryData={this.state.CategoryData}
            getTask={this.getTasks}
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
      </div>
    );
  }
}
