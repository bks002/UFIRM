import React, { Component } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { setHours, setMinutes } from "date-fns";
import Modal from "react-awesome-modal";
import moment from "moment";
import { th } from "date-fns/locale";
import ApiProvider from "../DataProvider.js";
import Button from "../../../ReactComponents/Button/Button.jsx";
import * as appCommon from "../../../Common/AppCommon.js";
import { CreateValidator, ValidateControls } from "../Validation.js";
import { ToastContainer, toast } from "react-toastify";
import swal from "sweetalert";
import { DELETE_CONFIRMATION_MSG } from "../../../Contants/Common.js";
import { getTaskQuestionImage } from "../../../Services/notificationService";

export default class ViewQuestionImg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      taskId: "",
      QuestionName: "",
      QuesId: "",
      QuesData: [],
      beforeImage: null,
      afterImage: null,
      loadingImage: true,
    };
    this.ApiProvider = new ApiProvider();
  }

  manageQuestionImg = (model, type) => {
    this.ApiProvider.manageQuesImage(model, type)
      .then(async (resp) => {
        const text = await resp.text();

        if (!text) {
          swal({
            icon: "error",
            title: "Error",
            text: "No image exists for the specified TaskQuestionImageId",
          });
          return;
        }

        const rData = JSON.parse(text);

        if (!rData?.Image) {
          swal({
            icon: "error",
            title: "Error",
            text: "No image exists for the specified TaskQuestionImageId",
          });
          return;
        }

        this.setState({ QuestImageData: rData.Image });
      })
      .catch(() => {
        swal({
          icon: "error",
          title: "Error",
          text: "Unable to load image",
        });
      });
  };

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
        //console.log(model);
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

  componentDidMount = async () => {
    const { TaskId, QuesId, CreatedOn } = this.props.rowData || {};

    if (!TaskId || !QuesId || !CreatedOn) {
      swal({
        icon: "error",
        title: "Error",
        text: "Invalid question details",
      });
      return;
    }

    this.setState({ loadingImage: true }); // 👈 START LOADING

    try {
      const res = await getTaskQuestionImage({
        taskId: TaskId,
        questId: QuesId,
        createdOn: moment(
          CreatedOn,
          ["YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ss.SSS", "DD-MM-YYYY"],
          true,
        ).format("YYYY-MM-DD"),
      });

      this.setState({
        beforeImage: res.beforeImage,
        afterImage: res.afterImage,
        loadingImage: false, // 👈 DONE
      });
    } catch (err) {
      this.setState({ loadingImage: false }); // 👈 FAIL SAFE

      swal({
        icon: "error",
        title: "Error",
        text: "Unable to load question images",
      });
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedCategory !== this.state.selectedCategory) {
      this.getSubCategory();
    }
  }

  handleCancel = () => {
    this.props.closeModal();
  };

  removeQuesFields = (QuesId) => {
    //console.log(QuesId);
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

  render() {
    //console.log(this.props);
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
                  <h3 className="card-title">View Image</h3>
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
                    <div className="col-md-6 text-center">
                      <h6>Before</h6>
                      {this.state.loadingImage ? (
                        <p className="text-info">Loading image…</p>
                      ) : this.state.beforeImage ? (
                        <img
                          src={this.state.beforeImage}
                          alt="Before"
                          style={{ maxWidth: "100%", border: "1px solid #ddd" }}
                        />
                      ) : (
                        <p className="text-muted">No before image</p>
                      )}
                    </div>

                    <div className="col-md-6 text-center">
                      <h6>After</h6>
                      {this.state.loadingImage ? (
                        <p className="text-info">Loading image…</p>
                      ) : this.state.afterImage ? (
                        <img
                          src={this.state.afterImage}
                          alt="After"
                          style={{ maxWidth: "100%", border: "1px solid #ddd" }}
                        />
                      ) : (
                        <p className="text-muted">No after image</p>
                      )}
                    </div>
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
