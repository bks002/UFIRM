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

export default class AddQuestion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      taskId: "",
      QuestionName: "",
      QuesId: "",
      quesValues : [{TaskID:this.props.rowData.TaskId,QuestionName:''}]
    };
    this.ApiProvider = new ApiProvider();
  }

  getQuesModel = (type) => {
    var model = [];
    switch (type) {
      case "R":
        model.push({
          CmdType: type,
        });
        break;
      case "C":
        model.push(this.state.quesValues);
        console.log(this.state.quesValues)
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
              break;
            default:
          }
        });
      }
    });
  };

  handleSave = () => {
    var type = "C";
    var model = this.getQuesModel(type);
    this.manageQues(model, type);
  };
  handleCancel = () => {
    this.props.closeModal();
  };

  handleQuesChange=(i,e)=>{
    let newQuesValues = [...this.state.quesValues]
    newQuesValues[i][e.target.name] = e.target.value
    this.setState({quesValues:newQuesValues})
  }

  addQuesFields = ()=>{
    this.setState({quesValues:[...this.state.quesValues,{TaskID:this.props.rowData.TaskId,QuestionName:''}]})
  }

  removeQuesFields = (i)=>{
    let newQuesValues = [...this.state.quesValues]
    newQuesValues.splice(i,1)
    this.setState({quesValues:newQuesValues})
  }
  handleSubmit=(e)=>{
    e.preventDefault();
    console.log(this.state.quesValues)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedCategory !== this.state.selectedCategory) {
      this.getSubCategory();
    }
  }

  render() {
    return (
      <div>
        <Modal
          visible={this.props.showQuesModal}
          effect="fadeInRight"
          onClickAway={this.props.closeModal}
          width="800"
        >
          <div className="row">
            <div className="col-12">
              <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">Add Question</h3>
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
                  style={{ height: "320px", overflowY: "scroll" }}
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
                    <br />
                    <div className="col-md-12" style={{'marginTop':'20px','display':'flex','justifyContent':'flex-end'}}>
                      <Button
                        ClassName="btn btn-success btn-sm"
                        Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                        Text="Add Question"
                        Action={()=>this.addQuesFields()}
                      />
                    </div>
                    {this.state.quesValues.map((element,index)=>(

                    <div className="col-md-12">
                      <label>Question Name</label>
                      <div style={{'display':'flex'}}>
                      <div className="col-md-10">
                      <input
                        id="txtName" autoFocus
                        placeholder="Enter Question Name"
                        type="text"
                        name="QuestionName"
                        className="form-control"
                        value={element.QuestionName||""}
                        onChange={(e) => {
                          this.handleQuesChange(index,e);
                        }}
                      /> 
                      </div>
                      <div className="col-md-2">
                      {index ? <button class="btn btn-sm btn-danger" onClick={()=>this.removeQuesFields(index)} title="Delete"><i className="fa fa-trash"></i></button> : null}
                      </div>
                    </div>
                    </div>
                    ))}
                  </div>
                  <div className="modal-footer">
                    <Button
                      Id="btnSave"
                      Text="Save"
                      Action={this.handleSave}
                      ClassName="btn btn-primary"
                    />
                    <Button
                      Id="btnCancel"
                      Text="Cancel"
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
