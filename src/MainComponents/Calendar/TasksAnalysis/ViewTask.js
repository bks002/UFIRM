import React, { Component } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
import { DELETE_CONFIRMATION_MSG } from '../../../Contants/Common';


export default class ViewTask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      taskId: "",
      catId:"",
      PageMode: "Home",
      TaskData:[],
      TaskDefaultData:[],
      filterType:'All'
    };
    this.ApiProvider = new ApiProvider();
  }

  getTaskModel = (type, catId,occurance,dateFrom,dateTo,propertyId) => {
    var model = [];
    switch (type) {
      case "GetAllTaskWiseStatusFinalDash":
        model.push({
          CmdType: 'GetAllTaskWiseStatusFinalDash',
          catId: catId,
          occurance:occurance,
          dateFrom : dateFrom,
          dateTo : dateTo,
          propId : propertyId
        });
        break;
      default:
            }

    return model;
  };

  manageTask = (model, type) => {
    this.ApiProvider.manageTask(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          switch (type) {
            case "GetAllTaskWiseStatusFinalDash":
              let taskData = rData.map((element) => ({
                TaskName: element.TaskName,
                AssignToName: element.AssignToName,
                Updatedon:element.Updatedon.split('T')[0],
                TaskStatus:element.TaskStatus
              }));
              this.setState({ TaskData: taskData , TaskDefaultData : taskData});
              break;
            default:
          }
        });
      }
    });
  };

  getTasks() {
    var type = "GetAllTaskWiseStatusFinalDash";
    const categoryId = this.props.rowData.CategoryId;
    const occurance = this.props.occurance
    const dateFrom = this.props.dateFrom
    const dateTo = this.props.dateTo
    const propertyId = this.props.propId
    var model = this.getTaskModel(type, categoryId,occurance,dateFrom,dateTo,propertyId);
    this.manageTask(model, type);
  }

  componentDidMount() {
    this.getTasks();
  }


  handleCancel = () => {
    this.props.closeModal();
  };


  render() {
    const {filterType,TaskData} = this.state
    const filteredData = filterType === 'All' ? TaskData : TaskData.filter(item => item.TaskStatus === filterType);
    return (
      <div>
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
                  <h3 className="card-title">View Task</h3>
                  <div className="card-tools">
                    <button
                      className="btn btn-tool"
                      onClick={this.props.closeModal}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div
                  className="card-body"
                  style={{ height: "450px", overflowY: "scroll" }}
                >
                                      <ul className="nav tableFilterContainer align-items-center justify-content-between">
                      <li>
                        <select
                          className="form-control"
                          onChange={(e) =>
                            this.setState({
                              filterType: e.target.value,
                            })
                          }
                          value={this.state.filterType}
                        >
                          <option value="All">All</option>
                          <option value="Pending">Pending</option>
                          <option value="Completed">Complete</option>
                          <option value="Actionable">Actionable</option>
                        </select>
                      </li>
                      {/* <li>
                          <Button
                            id="btnNewTask"
                            Action={this.Filter.bind(this)}
                            ClassName="btn btn-primary ml-2"
                            Text="Filter"
                          />
                        </li> */}
                        <li>Total Tasks : {filteredData.length}</li>
                    </ul>
                  <div className="row">                   
                    <div className="col-md-12">
                      <div className="row">
                      <div className="col-md-5" style={{ marginTop: "20px" }}>
                      <label>Task Name</label>
                      </div>
                      <div className="col-md-3" style={{ marginTop: "20px" }}>
                      <label>Assigned To</label>
                      </div>
                      <div className="col-md-2" style={{ marginTop: "20px" }}>
                      <label>Updated On</label>
                      </div>
                      <div className="col-md-2" style={{ marginTop: "20px" }}>
                      <label>Status</label>
                      </div>
                      </div>
                    </div>
                    {filteredData.map((element, index) => (
                      <div className="col-md-12" style={{ marginTop: "20px" }}>
                        <div style={{ display: "flex" }} key={index}>
                          <div className="col-md-5">
                            <input
                              id="txtName"
                              type="text"
                              name="QuestionName"
                              className="form-control"
                              value={element.TaskName}
                              disabled
                            />
                          </div>
                          <div className="col-md-3">
                          <input
                              id="txtName"
                              type="text"
                              name="Remark"
                              value={element.AssignToName}
                              disabled
                              className="form-control"
                            />
                          </div>
                          <div className="col-md-2">
                          <input
                              id="txtName"
                              type="text"
                              name="Remark"
                              value={element.Updatedon}
                              disabled
                              className="form-control"
                            />
                          </div>
                          <div className="col-md-2">
                          <input
                              id="txtName"
                              type="text"
                              name="Remark"
                              value={element.TaskStatus}
                              disabled
                              className="form-control"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
