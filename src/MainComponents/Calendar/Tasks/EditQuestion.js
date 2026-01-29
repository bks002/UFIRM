import React, { Component } from "react";
// import ReactDatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
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
import { DELETE_CONFIRMATION_MSG } from "../../../Contants/Common";

export default class EditQuestion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      taskId: "",
      QuestionName: "",
      QuesId: "",
      QuesData: [],
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
      case "D":
        model.push({
          CmdType: type,
          Id: Id,
        });
        console.log(model);
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
            case "U":
              if (
                rData === "sucess !" ||
                rData === "success !" ||
                rData === "Updated !" ||
                rData === "Updated!"
              ) {
                appCommon.showtextalert(
                  "Question Updated Successfully!",
                  "",
                  "success",
                );
              }
              {
                appCommon.showtextalert(
                  "Question Updated Successfully!",
                  "",
                  "success",
                );
              }
              break;
            case "C":
              if (rData === "Created !") {
                appCommon.showtextalert(
                  "Question Saved Successfully!",
                  "",
                  "success",
                );
                console.log("Question Saved Successfully!");
                this.handleCancel();
              }
            case "R":
              let quesData = rData.map((element) => ({
                QuesId: element.QuestID,
                QuesName: element.QuestionName,
                Action: element.Action,
                Remark: element.Remarks,
              }));
              this.setState({ QuesData: quesData });
              break;
            case "D":
              if (rData === "Deleted !") {
                appCommon.showtextalert(
                  "Question Deleted Successfully!",
                  "",
                  "success",
                );
              } else {
                appCommon.showtextalert("Someting went wrong !", "", "error");
              }
              this.getQuestion();
              break;
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
    const { rowData } = this.props;

    this.setState({
      taskId: rowData.TaskId,
      QuesId: rowData.QuesId,
      QuestionName: rowData.QuestionName,
    });
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
    console.log(QuesId);
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

  getQuesModel = (type) => {
    if (type === "U") {
      return [
        {
          TaskID: this.props.rowData.TaskId,
          QuestID: this.state.QuesId,
          QuestionName: this.state.QuestionName,
        },
      ];
    }

    return [];
  };

  render() {
    console.log(this.props);
    return (
      <div>
        <Modal
          visible={this.props.showEditQuestionModel}
          effect="fadeInRight"
          onClickAway={this.props.closeModal}
          width="1000"
        >
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
                      <label>Question Id</label>
                      <input
                        value={this.props.rowData.QuesId || ""}
                        disabled
                        type="text"
                        className="form-control"
                      />
                    </div>
                    <br />
                    <div className="col-6">
                      <label>Question</label>
                      <input
                        value={this.state.QuestionName}
                        type="text"
                        className="form-control"
                        onChange={(e) => {
                          const value = e.target.value;

                          this.setState({ QuestionName: value });
                        }}
                      />
                    </div>
                    <br />
                  </div>
                  <div className="modal-footer">
                    <Button
                      Id="btnSave"
                      Text="Save"
                      ClassName="btn btn-primary"
                      Action={() => {
                        const model = this.getQuesModel("U");

                        this.manageQues(model, "U");

                        // 🔥 THIS IS THE KEY PART
                        if (this.props.onQuestionUpdated) {
                          this.props.onQuestionUpdated({
                            QuesId: this.state.QuesId,
                            QuestionName: this.state.QuestionName,
                          });
                        }

                        this.props.closeModal();
                      }}
                    />

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
