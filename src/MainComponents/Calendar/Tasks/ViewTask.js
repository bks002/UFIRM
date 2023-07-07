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
import EditQuestion from "./EditQuestion";


export default class ViewTask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      taskId: "",
      QuestionName: "",
      QuesId: "",
      QuesData: [],
      editQuesId :'',
      editQuesName :'',
      PageMode: "Home",
      supervisorRemarks:''
    };
    this.ApiProvider = new ApiProvider();
  }

  getQuesModel = (type, Id) => {
    var model = [];
    switch (type) {
      case "R":
        model.push({
          CmdType: type,
          Id: Id,
        });
        break;
        case "U":
          model.push({
            TaskID: this.props.taskId,
            QuestID: this.state.editQuesId,
            QuestionName: this.state.editQuesName,
          });
          break;
        case 'D':
            model.push({
                CmdType: type,
                Id: Id,
              });
              console.log(model)
            break;
      default:
            }

    return model;
  };
  getRemarksModel = (type) => {
    var model = [];
    switch (type) {
      case "C":
        model.push({
          CmdType: type,
          Id: 0,
          TaskId:this.props.taskId,
          QuestId:this.state.editQuesId,
          Date:new Date().toJSON().slice(0,10).replace(/-/g,'-'),
          Remarks:this.state.supervisorRemarks
        });
        break;
      default:
    }
    return model;
  };

  manageQues = (model, type) => {
    this.ApiProvider.manageQues(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          switch (type) {
            case "C":
              if (rData === "Created !") {
                appCommon.showtextalert(
                  "Question Saved Successfully!",
                  "",
                  "success"
                );
                console.log("Question Saved Successfully!");
                this.handleCancel();
              }
            case "R":
              let quesData = rData.map((element) => ({
                QuesId: element.QuestID,
                QuesName: element.QuestionName,
                Action:element.Action,
                Remark:element.Remarks
              }));
              this.setState({ QuesData: quesData });
              break;
            case "D":
              if (rData === "Deleted !") {
                appCommon.showtextalert(
                  "Question Deleted Successfully!",
                  "",
                  "success"
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
                    "success"
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

  manageRemarks = (model, type) => {
    this.ApiProvider.manageRemarks(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          switch (type) {
            case "C":
              if (rData === "Data inserted successfully!") {
                appCommon.showtextalert(
                  "Remarks Saved Successfully!",
                  "",
                  "success"
                );
                console.log("Remarks Saved Successfully!");
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
    var model = this.getQuesModel(type, taskId);
    this.manageQues(model, type);
  }

  componentDidMount() {
    this.getQuestion();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedCategory !== this.state.selectedCategory) {
      this.getSubCategory();
    }
  }

  handleCancel = () => {
    this.props.closeModal();
  };

  removeQuesFields = (QuesId) => {
      console.log(QuesId)
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
    console.log(data)
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
    this.setState({ PageMode: "EditQuestion",editQuesId:data.QuesId,editQuesName:data.QuesName});
  };
  AddRemarksPage = (data) => {
    this.setState({ PageMode: "SupervisorRemarks"});
  };
  handleCancelEditQuestion = () => {
    this.getQuestion();
    this.setState(
      {
        PageMode: "Home",
      }
    );
  }
  handleUpdateQuestion = () => {
    var type = "U";
    var model = this.getQuesModel(type);
    this.manageQues(model, type);
  }

  handleAddRemarks = () => {
    var type = "C";
    var model = this.getRemarksModel(type);
    this.manageRemarks(model, type);
  }

  render() {
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
                  <div className="row">
                    <div className="col-6">
                      <label>Task Id</label>
                      <input
                        id="txtName"
                        value={this.props.rowData.TaskId}
                        disabled
                        type="text"
                        className="form-control"
                      />
                    </div>
                    <div className="col-6">
                      <label>Task Name</label>
                      <input
                        id="txtName"
                        value={this.props.rowData.Name}
                        disabled
                        placeholder="Enter Task"
                        type="text"
                        className="form-control"
                      />
                    </div> 
                    <br/>
                    <div className="col-6">
                      <label>Assigned To</label>
                      <input
                        id="txtName"
                        value={this.props.rowData.AssignedTo}
                        disabled
                        type="text"
                        className="form-control"
                      />
                    </div> 
                    <div className="col-6">
                      <label>QR Code</label>
                      <input
                        id="txtName"
                        value={this.props.rowData.QRcode}
                        disabled
                        type="text"
                        className="form-control"
                      />
                    </div> 
                    <br />
                    <div className="col-6">
                      <label>Start Date</label>
                      <input
                        id="txtName"
                        value={this.props.rowData.DateFrom}
                        disabled
                        type="text"
                        className="form-control"
                      />
                    </div> 
                    <div className="col-6">
                      <label>End Data</label>
                      <input
                        id="txtName"
                        value={this.props.rowData.DateTo}
                        disabled
                        type="text"
                        className="form-control"
                      />
                    </div> 
                    <br />                    
                    <div className="col-md-12">
                      <div className="row">
                      <div className="col-md-5" style={{ marginTop: "20px" }}>
                      <label>Task Questionnaire</label>
                      </div>
                      <div className="col-md-3" style={{ marginTop: "20px" }}>
                      <label>Remark</label>
                      </div>
                      <div className="col-md-2" style={{ marginTop: "20px" }}>
                      <label>Status</label>
                      </div>
                      <div className="col-md-2" style={{ marginTop: "20px" }}>
                      <label>Actiom</label>
                      </div>
                      </div>
                    </div>
                    {this.state.QuesData.map((element, index) => (
                      <div className="col-md-12" style={{ marginTop: "20px" }}>
                        <div style={{ display: "flex" }}>
                          <div className="col-md-5">
                            <input
                              id="txtName"
                              type="text"
                              name="QuestionName"
                              className="form-control"
                              value={element.QuesName}
                              disabled
                            />
                          </div>
                          {/* {
                            element.Action === "No" ?( */}
                          <div className="col-md-3">
                          <input
                              id="txtName"
                              type="text"
                              name="Remark"
                              value={element.Remark}
                              disabled
                              className="form-control"
                            />
                          </div>
                            {/* ) : (<div className="col-md-3"></div>)
                          } */}
                          
                          <div className="col-md-2">
                            <select className="form-control" disabled>
                              <option value={element.Action}>{element.Action}</option>
                            </select>
                          </div>
                          <div className="col-md-2">
                          <button
                  className="btn btn-sm btn-success"
                  onClick={this.EditQuestion.bind(this, element)}
                  title="Edit"
                  style={{ marginRight: "5px" }}
                >
                  <i className="fa fa-edit"></i>
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={this.DeleteQuestion.bind(this, element)}
                  title="View"
                >
                  <i className="fa fa-trash"></i>
                </button>
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
                  {this.state.PageMode === "EditQuestion" && (


          <div className="row">
            <div className="col-12">
              <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">Edit Question</h3>
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
                  style={{ height: "250px", overflowY: "scroll" }}
                >
                  <div className="row">
                    <div className="col-6">
                      <label>Task Id</label>
                      <input
                        id="txtName"
                        value={this.props.rowData.TaskId}
                        disabled
                        type="text"
                        className="form-control"
                      />
                    </div>
                    <div className="col-6">
                      <label>Question Id</label>
                      <input
                        id="txtName"
                        value={this.state.editQuesId}
                        disabled
                        type="text"
                        className="form-control"
                      />
                    </div> 
                    <br/>
                    <div className="col-6">
                      <label>Edit Question Name</label>
                      <input
                        id="txtName"
                        value={this.state.editQuesName}
                        type="text"
                        className="form-control"
                        onChange={(e) => {
                          this.setState({ editQuesName: e.target.value });
                        }}
                      />
                    </div> 
                    <div className="col-md-6 mt-4">
                    <Button
                      Id="btnSave"
                      Text="Add FM Remarks"
                      Action={this.AddRemarksPage}
                      ClassName="btn btn-primary"
                    />
                    </div>
                    <br />
             
                  </div>
                  <div className="modal-footer">
                    <Button
                      Id="btnCancel"
                      Text="Close"
                      Action={this.handleCancelEditQuestion}
                      ClassName="btn btn-secondary"
                    />
                     <Button
                      Id="btnSave"
                      Text="Update"
                      Action={this.handleUpdateQuestion}
                      ClassName="btn btn-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

                          {this.state.PageMode === "SupervisorRemarks" && (


          <div className="row">
            <div className="col-12">
              <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">Add Facility Member Remarks</h3>
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
                  style={{ height: "250px", overflowY: "scroll" }}
                >
                  <div className="row">
                    <div className="col-6">
                      <label>Task Id</label>
                      <input
                        id="txtName"
                        value={this.props.rowData.TaskId}
                        disabled
                        type="text"
                        className="form-control"
                      />
                    </div>
                    <div className="col-6">
                      <label>Question Id</label>
                      <input
                        id="txtName"
                        value={this.state.editQuesId}
                        disabled
                        type="text"
                        className="form-control"
                      />
                    </div> 
                    <br/>
                    <div className="col-6">
                      <label>Remarks</label>
                      <input
                        id="txtName"
                        type="text"
                        className="form-control"
                        onChange={(e) => {
                          this.setState({ supervisorRemarks: e.target.value });
                        }}
                      />
                    </div> 
                    <br />
             
                  </div>
                  <div className="modal-footer">
                    <Button
                      Id="btnCancel"
                      Text="Close"
                      Action={this.handleCancelEditQuestion}
                      ClassName="btn btn-secondary"
                    />
                     <Button
                      Id="btnSave"
                      Text="Add"
                      Action={this.handleAddRemarks}
                      ClassName="btn btn-primary"
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
