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

const $ = window.$;

export default class AssetTracking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          Header: "Id",
          accessor: "Id",
        },
        {
          Header: "Asset Name",
          accessor: "AssetName",
        },
        {
          Header: "Task Name",
          accessor: "Name",
        },
        {
          Header: "Occurrence",
          accessor: "OccurenceView",
        },
        {
          Header: "Start Date",
          accessor: "StartDate",
        },
        {
          Header: "Start Time",
          accessor: "StartTime",
        },
        {
          Header: "End Date",
          accessor: "EndDate",
        },
        {
          Header: "End Time",
          accessor: "EndTime",
        },
        {
          Header: "Duration (Min)",
          accessor: "Duration",
        },
        {
          Header: "UpdatedOn",
          accessor: "UpdatedOn",
        },
        {
          Header: "Status",
          accessor: "Status",
        },
        {
          Header: "Remarks",
          accessor:"Remarks"
        },
        // {
        //   Header: "Assigned To",
        // },
        // {
        //   Header: "Assigned By",
        // },
        // {
        //   Header: "Action",
        //   Cell: (data) => {
        //     return (
        //       <div style={{ display: "flex" }}>
        //         <button
        //           className="btn btn-sm btn-info"
        //           onClick={this.ViewTask.bind(this, data.cell.row.original)}
        //           title="View"
        //           style={{ marginRight: "5px" }}
        //         >
        //           <i className="fa fa-eye"></i>
        //         </button>
        //         <button
        //           className="btn btn-sm btn-danger"
        //           onClick={this.DeleteTask.bind(this, data.cell.row.original)}
        //           title="View"
        //         >
        //           <i className="fa fa-trash"></i>
        //         </button>
        //       </div>
        //     );
        //   },
        // },
      ],
      data: [],
      AssetData: [],
      selectedAssetId: "",
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
      taskStatus:'',
      startDate : moment().clone().startOf("month"),
      endDate : moment().clone().endOf("month"),
      header :["Task Id", "Category", "Sub Category","Task Name","Occurence","Updated On","Task Status"]
    };
    this.ApiProvider = new ApiProvider();
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

  getModel = (type, assetId,startDate,endDate) => {
    var model = [];
    switch (type) {
      case "R":
        model.push({
          CmdType: type,
          AssetId: assetId,
          DteFr : startDate,
          DteTo : endDate,
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

  getAssetModel = (type) => {
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

  manageAssets = (model, type) => {
    this.ApiProvider.manageAssets(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          let assetData = [];
          rData.forEach((element) => {
            assetData.push({
              Id: element.Id,
              Name: element.Name,
            });
          });
          switch (type) {
            case "R":
              this.setState({ AssetData: assetData });
              break;
            default:
          }
        });
      }
    });
  };

  manageAssetTracking = (model, type) => {
    console.log(model);
    this.ApiProvider.manageAssetTracking(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          switch (type) {
            case "R":
              let assetTrackingData = [];
              rData.forEach((element,index) => {
                console.log(rData);
                assetTrackingData.push({
                  Id: index+1,
                  TaskId: element.TaskId,
                  AssetName : element.AssetName,
                  AssetId: element.AssetId,
                  Name: element.Name,
                  StartDate: element.DateFrom.split("T")[0],
                  StartTime: element.TimeFrom.split("T")[1],
                  EndDate: element.DateTo.split("T")[0],
                  EndTime: element.TimeTo.split("T")[1],
                  Duration: element.Duration,
                  Status: element.TaskStatus, 
                  Remarks: element.Remarks,
                  Occurence: element.Occurence.split(" ")[0] ,
                  OccurenceView: this.modifyOccurence(element.Occurence.split(" ")[0]) ,
                  UpdatedOn: element.UpdatedOn.split("T")[0],
                });
              });
              this.setState({ data: assetTrackingData });
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

  calculateDuration = (startTime, endTime) => {
    var start = moment(startTime, "HH:mm:ss");
    var end = moment(endTime, "HH:mm:ss");
    var duration = moment.duration(end.diff(start));
    var hours = parseInt(duration.asHours());
    var minutes = parseInt(duration.asMinutes()) % 60;
    var seconds = parseInt(duration.asSeconds()) % 60;
    return hours + "hrs " + minutes + "min " + seconds + "sec";
  }

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


  getAssets() {
    var type = "R";
    var model = this.getAssetModel(type);
    this.manageAssets(model, type);
  }


  getAssetTracking() {
    var type = "R";
    var assetId = this.state.selectedAssetId
      ? this.state.selectedAssetId
      : 0;
      var startDate  = this.state.filterFromDate ? this.state.filterFromDate : this.state.startDate.format('YYYY-MM-DD');
      var endDate  = this.state.filterToDate ? this.state.filterToDate : this.state.endDate.format('YYYY-MM-DD');
    var model = this.getModel(type, assetId,startDate,endDate);
    this.manageAssetTracking(model, type);
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

    this.getAssets();
  }

  Filter = () => {
    if (this.state.selectedAssetId > 0) {
      this.setState({ filtered: true });
      this.getAssetTracking();
    } else {
      appCommon.showtextalert("", "Please Select Any Filter Attribute", "warning");
    }
  };

  Reset = () => {
    this.setState({
      filtered: false,
      selectedAssetId: 0,
    });
    //this.getTasks();
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
      }
    );
  };

  selectedCategory = (value) => this.setState({ selectedAssetId: value });

  // closeModal = () => this.setState({ PageMode: 'Home', showAddModal: false });

  onCategorySelected = (val) => {};
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
                              selectedAssetId: e.target.value,
                            })
                          }
                          disabled={this.state.filtered}
                          value={this.state.selectedAssetId}
                        >
                          <option value={0}>Select Asset</option>
                          {this.state.AssetData
                            ? this.state.AssetData.map((e, key) => {
                                return (
                                  <option key={key} value={e.Id}>
                                    {e.Name}
                                  </option>
                                );
                              })
                            : null}
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
                        >
                          <option value="N">Repeat</option>
                          <option value="D">Daily</option>
                          <option value="W">Weekly</option>
                          <option value="M">Monthly</option>
                          <option value="Y">Yearly</option>
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
      </div>
    );
  }
}
