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
import { bindActionCreators } from "redux";
import departmentActions from "../../../redux/department/action";
import { connect } from "react-redux";
import ReactDatePicker from "react-datepicker";
// import { downloadExcel } from "react-export-table-to-excel";
// import { CSVLink } from 'react-csv'

const $ = window.$;
class AttendanceSummary extends Component {
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
      EmployeeData: [],
      selectedEmpId: "",
      selectedSubCategoryId: "",
      usersList: [],
      userIds: "",
      loading: false,
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
      filterFromDate:'',
      filterToDate:'',
      taskStatus:'None',
      summaryDate : new Date(),
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

  getEmployeeModel = (type) => {
    console.log(this.props.PropertyId);
    var model = [];
    switch (type) {
      case "R":
        model.push({
          PropertyId:parseInt(this.props.PropertyId),
          SearchValue:"NULL",
          PageSize:100,
          PageNumber:1,
          Filter:"All",
          FacilityType:"Staff"
        });
        break;
      default:
    }
    return model;
  };

  getDeleteTaskModel = (type, Id) => {
    var model = [];
    switch (type) {
      case "D":
        model.push({
          CmdType: type,
          Id: Id,
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

  manageEmployee = (model, type) => {
    this.ApiProvider.manageEmployee(model, type).then((resp) => {
      if (resp.ok && resp.status === 200) {
        return resp.json().then((rData) => {
          let empData = [];
          rData.facilityMember.forEach((element) => {
            empData.push({
              Id: element.facilityMemberId,
              Name: element.name,
            });
          });
          switch (type) {
            case "R":
              this.setState({ EmployeeData: empData });
              break;
            default:
          }
        });
      }
    });
  };


  manageFacilityMember = (model, type) => {
    this.ApiProvider.manageFacility(model, type).then((resp) => {
      if (resp.ok && resp.status === 200) {
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
    this.ApiProvider.manageAttendanceData(model, type).then((resp) => {
      if (resp.ok && resp.status === 200) {
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
              if (rData === "Data deleted successfully!") {
                appCommon.showtextalert(
                  "Entry Deleted Successfully!",
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


  getEmployee() {
    var type = "R";
    var model = this.getEmployeeModel(type);
    this.manageEmployee(model, type);
  }

  getAttendanceData() {
    var type = "R";
    //today date
    var date = moment().format("2023-06-22");
    var model = this.getModel(type, date);
    this.manageAttendanceData(model, type);
  }

  findItem(id) {
    return this.state.data.find((item) => item.TaskId === id);
}

  // findItem(id) {
  //   return this.state.data.find((item) => {
  //     if (item.TaskId == id) {
  //       return item;
  //     }
  //   });
  // }

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

  onSummaryDateChange = (date) => {
    this.setState({ summaryDate: date });
  }

  componentDidMount() {
    const startDate = this.state.startDate;
    const endDate = this.state.endDate;
    this.DateRangeConfig(startDate, endDate);

    this.getEmployee();
    this.getAttendanceData();
  }

  AddNew = () => {
    this.setState({ PageMode: "Add", showAddModal: true });
  };

  Filter = () => {
    if (this.state.selectedEmpId > 0) {
      this.setState({ filtered: true });
      this.getTasks();
    } else {
      appCommon.showtextalert("", "Please Select Any Filter Attribute", "warning");
    }
  };

  Reset = () => {
    this.setState({
      filtered: false,
      selectedEmpId: 0,
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
          var model = this.getDeleteTaskModel(type, data.Id);
          this.manageAttendanceData(model, type);
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
                  <div className="card-header d-flex p-0">
                    <ul className="nav tableFilterContainer">
                      <li className="nav-item">
                        <select
                          id="dllCategory"
                          className="form-control"
                          onChange={(e) =>
                            this.setState({
                              selectedEmpId: e.target.value,
                            })
                          }
                          disabled={this.state.filtered}
                          value={this.state.selectedEmpId}
                        >
                          <option value={0}>Select Employee</option>
                          {this.state.EmployeeData
                            ? this.state.EmployeeData.map((e, key) => {
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
                        <div className="input-group input-group-sm">
                          <div className="form-group">
                            <div className="input-group">
                              <div className="input-group-prepend" style={{
                                height: "38px"
                              }}>
                                <span className="input-group-text">
                                  <i className="far fa-calendar-alt"></i>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                      <li className="nav-item" style={{paddingLeft:"unset"}}>
                        <div className="input-group input-group-sm">
                          <div className="form-group">
                            <div className="input-group">
                              <ReactDatePicker
                        className="form-control"
                        selected={this.state.summaryDate}
                        onChange={this.onSummaryDateChange}
                        dateFormat="dd/MM/yyyy"
                        peekNextmonth
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        id="textStartDate"
                      />
                            </div>
                          </div>
                        </div>
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

function mapStoreToprops(state, props) {
  return {
    PropertyId: state.Commonreducer.puidn,
  };
}

function mapDispatchToProps(dispatch) {
  const actions = bindActionCreators(departmentActions, dispatch);
  return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(AttendanceSummary);

