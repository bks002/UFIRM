import React, { Component } from "react";
import Button from "../../../ReactComponents/Button/Button";
import ApiProvider from "../DataProvider";
import * as appCommon from "../../../Common/AppCommon.js";
import moment from "moment";
import LayoutDataProvider from '../../../Routing/LayoutDataProvider';

const $ = window.$;

class EditTask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      taskId: "",
      name: "",
      location: "",
      categoryId: 0,
      subCategoryId: 0,
      startDate: "",
      endDate: "",
      allDay: false,
      startTime: "",
      endTime: "",
      remindMe: "Never",
      propertyId: 0,
      propertyName: "",
      assignTo: 0,
      repeat: "D",
      assets: "",
      qrCode: "",
      remarks: "",
      taskPriority: 0,
      taskStatus: "",
      
      categoryData: [],
      subCategoryData: [],
      assignToList: [],
      taskPriorityList: [],
    };
    this.ApiProvider = new ApiProvider();
  }

  componentDidMount() {
    const { rowData, categoryData, propertyData } = this.props;
    
    if (rowData) {
      // Get property name from propertyData
      let propName = "";
      if (propertyData && rowData.PropertyId) {
        const property = propertyData.find(p => p.Id === rowData.PropertyId);
        if (property) {
          propName = property.Name;
        }
      }

      this.setState({
        taskId: rowData.TaskId || "",
        name: rowData.Name || "",
        location: rowData.Location || "",
        categoryId: rowData.TaskCategoryId || 0,
        subCategoryId: rowData.TaskSubCategoryId || 0,
        startDate: rowData.DateFrom || "",
        endDate: rowData.DateTo || "",
        startTime: rowData.TimeFrom || "",
        endTime: rowData.TimeTo || "",
        propertyId: rowData.PropertyId || 0,
        propertyName: propName,
        assignTo: rowData.AssignedToId || 0,
        repeat: rowData.Occurence || "D",
        assets: rowData.AssetId || "",
        qrCode: rowData.QRcode || "",
        remarks: rowData.Remarks || "",
        taskPriority: rowData.TaskPriority || 0,
        taskStatus: rowData.TaskStatus || "",
        categoryData: categoryData || [],
      }, () => {
        this.loadSubCategory();
        this.loadAssignToList();
        this.loadTaskPriority();
      });
    }
  }

  loadSubCategory = () => {
    if (this.state.categoryId > 0) {
      const model = [{ CmdType: "R" }];
      this.ApiProvider.manageSubCategory(model, "R", this.state.categoryId).then((resp) => {
        if (resp.ok && resp.status === 200) {
          return resp.json().then((rData) => {
            let subCatData = [];
            rData.forEach((element) => {
              subCatData.push({
                SubCategoryId: element.SubCategoryId,
                SubCategoryName: element.SubCategoryName,
              });
            });
            this.setState({ subCategoryData: subCatData });
          });
        }
      });
    }
  };

  loadAssignToList = () => {
    const model = [{ CmdType: "R", PropertyId: this.state.propertyId }];
    this.ApiProvider.manageAssign(model, "R").then((resp) => {
      if (resp.ok && resp.status === 200) {
        return resp.json().then((rData) => {
          let assignData = [];
          rData.forEach((element) => {
            assignData.push({
              assignId: element.Id,
              assignName: element.Name,
            });
          });
          this.setState({ assignToList: assignData });
        });
      }
    });
  };

  loadTaskPriority = () => {
    const model = [{ CmdType: "R" }];
    this.ApiProvider.manageTaskPriority(model, "R").then((resp) => {
      if (resp.ok && resp.status === 200) {
        return resp.json().then((rData) => {
          let taskPriorityList = [];
          rData.forEach((element) => {
            taskPriorityList.push({
              Id: element.Id,
              Name: element.Name,
            });
          });
          this.setState({ taskPriorityList: taskPriorityList });
        });
      }
    });
  };

  handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    this.setState({ 
      [name]: type === 'checkbox' ? checked : value 
    }, () => {
      if (name === 'categoryId') {
        this.setState({ subCategoryId: 0 });
        this.loadSubCategory();
      }
    });
  };

  handleSubmit = () => {
    const {
      taskId, name, location, categoryId, subCategoryId,
      startDate, endDate, startTime, endTime, propertyId,
      assignTo, repeat, assets, qrCode, remarks, taskPriority, taskStatus, allDay
    } = this.state;

    // Validation
    if (!name) {
      appCommon.showtextalert("", "Please enter task name", "warning");
      return;
    }
    if (!location) {
      appCommon.showtextalert("", "Please enter location", "warning");
      return;
    }
    if (categoryId === 0) {
      appCommon.showtextalert("", "Please select category", "warning");
      return;
    }
    if (subCategoryId === 0) {
      appCommon.showtextalert("", "Please select sub category", "warning");
      return;
    }
    if (!startDate) {
      appCommon.showtextalert("", "Please select start date", "warning");
      return;
    }
    if (!endDate) {
      appCommon.showtextalert("", "Please select end date", "warning");
      return;
    }

    // Prepare update model
    const model = [{
      CmdType: "U",
      TaskId: taskId,
      Name: name,
      Location: location,
      TaskCategoryId: categoryId,
      TaskSubCategoryId: subCategoryId,
      DateFrom: startDate,
      DateTo: endDate,
      TimeFrom: startTime,
      TimeTo: endTime,
      PropertyId: propertyId,
      AssignedTo: assignTo,
      Occurrence: repeat,
      AssetId: assets,
      QRCode: qrCode,
      Remarks: remarks,
      TaskPriority: taskPriority,
      TaskStatus: taskStatus,
      AllDay: allDay ? 1 : 0,
    }];

    // Call API to update task
    this.ApiProvider.manageTask(model, "U").then((resp) => {
      if (resp.ok && resp.status === 200) {
        return resp.json().then((rData) => {
          appCommon.showtextalert("Task Updated Successfully!", "", "success");
          this.props.closeModal();
        });
      } else {
        appCommon.showtextalert("Something went wrong!", "", "error");
      }
    }).catch((error) => {
      appCommon.showtextalert("Error updating task!", "", "error");
    });
  };

  render() {
    const { showEditModal, closeModal } = this.props;
    const {
      taskId, name, location, categoryId, subCategoryId,
      startDate, endDate, allDay, startTime, endTime, remindMe,
      propertyName, assignTo, repeat, assets, qrCode,
      categoryData, subCategoryData, assignToList,
      taskPriorityList, taskPriority, remarks, taskStatus
    } = this.state;

    if (!showEditModal) return null;

    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Task</h5>
              <button type="button" className="close" onClick={closeModal}>
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="row">
                {/* Task Id */}
                <div className="col-md-12 mb-3">
                  <label className="font-weight-bold">Task Id</label>
                  <input
                    type="text"
                    className="form-control"
                    value={taskId}
                    disabled
                    style={{ backgroundColor: '#e9ecef' }}
                  />
                </div>

                {/* Name */}
                <div className="col-md-6 mb-3">
                  <label className="font-weight-bold">Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={name}
                    onChange={this.handleInputChange}
                    placeholder="PPM Schedule For Reception"
                  />
                </div>

                {/* Location */}
                <div className="col-md-6 mb-3">
                  <label className="font-weight-bold">Location <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="location"
                    value={location}
                    onChange={this.handleInputChange}
                    placeholder="Reception"
                  />
                </div>

                {/* Category */}
                <div className="col-md-6 mb-3">
                  <label className="font-weight-bold">Category <span className="text-danger">*</span></label>
                  <select
                    className="form-control"
                    name="categoryId"
                    value={categoryId}
                    onChange={this.handleInputChange}
                  >
                    <option value={0}>Select Category</option>
                    {categoryData && categoryData.map((cat, key) => (
                      <option key={key} value={cat.Id}>
                        {cat.Name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub Category */}
                <div className="col-md-6 mb-3">
                  <label className="font-weight-bold">Sub Category <span className="text-danger">*</span></label>
                  <select
                    className="form-control"
                    name="subCategoryId"
                    value={subCategoryId}
                    onChange={this.handleInputChange}
                  >
                    <option value={0}>Select Sub Category</option>
                    {subCategoryData && subCategoryData.map((subCat, key) => (
                      <option key={key} value={subCat.SubCategoryId}>
                        {subCat.SubCategoryName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div className="col-md-6 mb-3">
                  <label className="font-weight-bold">Start Date <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    name="startDate"
                    value={startDate}
                    onChange={this.handleInputChange}
                  />
                </div>

                {/* End Date */}
                <div className="col-md-6 mb-3">
                  <label className="font-weight-bold">End Date <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    name="endDate"
                    value={endDate}
                    onChange={this.handleInputChange}
                  />
                </div>

                {/* All Day */}
                <div className="col-md-12 mb-3">
                  <div className="custom-control custom-switch">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="allDay"
                      name="allDay"
                      checked={allDay}
                      onChange={this.handleInputChange}
                    />
                    <label className="custom-control-label font-weight-bold" htmlFor="allDay">
                      All Day
                    </label>
                  </div>
                </div>

                {/* Start Time */}
                <div className="col-md-4 mb-3">
                  <label className="font-weight-bold">Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    name="startTime"
                    value={startTime}
                    onChange={this.handleInputChange}
                    disabled={allDay}
                  />
                </div>

                {/* End Time */}
                <div className="col-md-4 mb-3">
                  <label className="font-weight-bold">End Time</label>
                  <input
                    type="time"
                    className="form-control"
                    name="endTime"
                    value={endTime}
                    onChange={this.handleInputChange}
                    disabled={allDay}
                  />
                </div>

                {/* Remind me */}
                <div className="col-md-4 mb-3">
                  <label className="font-weight-bold">Remind me</label>
                  <select
                    className="form-control"
                    name="remindMe"
                    value={remindMe}
                    onChange={this.handleInputChange}
                  >
                    <option value="Never">Never</option>
                    <option value="15min">15 minutes before</option>
                    <option value="30min">30 minutes before</option>
                    <option value="1hour">1 hour before</option>
                    <option value="1day">1 day before</option>
                  </select>
                </div>

                {/* Property - DISABLED INPUT WITH VALUE */}
                <div className="col-md-4 mb-3">
                  <label className="font-weight-bold">Property</label>
                  <input
                    type="text"
                    className="form-control"
                    value={propertyName || "Business Park"}
                    disabled
                    style={{ backgroundColor: '#e9ecef' }}
                  />
                </div>

                {/* Assign To */}
                <div className="col-md-4 mb-3">
                  <label className="font-weight-bold">Assign To</label>
                  <select
                    className="form-control"
                    name="assignTo"
                    value={assignTo}
                    onChange={this.handleInputChange}
                  >
                    <option value={0}>Select User</option>
                    {assignToList && assignToList.map((user, key) => (
                      <option key={key} value={user.assignId}>
                        {user.assignName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Repeat */}
                <div className="col-md-4 mb-3">
                  <label className="font-weight-bold">Repeat</label>
                  <select
                    className="form-control"
                    name="repeat"
                    value={repeat}
                    onChange={this.handleInputChange}
                  >
                    <option value="D">Daily</option>
                    <option value="W">Weekly</option>
                    <option value="M">Monthly</option>
                    <option value="Y">Yearly</option>
                  </select>
                </div>

                {/* Assets */}
                <div className="col-md-6 mb-3">
                  <label className="font-weight-bold">Assets</label>
                  <input
                    type="text"
                    className="form-control"
                    name="assets"
                    value={assets}
                    onChange={this.handleInputChange}
                    placeholder="Select Assets"
                  />
                </div>

                {/* QR Code */}
                <div className="col-md-6 mb-3">
                  <label className="font-weight-bold">QR Code</label>
                  <input
                    type="text"
                    className="form-control"
                    name="qrCode"
                    value={qrCode}
                    onChange={this.handleInputChange}
                    placeholder="Reception"
                  />
                </div>

                {/* Task Priority */}
                <div className="col-md-6 mb-3">
                  <label className="font-weight-bold">Task Priority</label>
                  <select
                    className="form-control"
                    name="taskPriority"
                    value={taskPriority}
                    onChange={this.handleInputChange}
                  >
                    <option value={0}>Select Priority</option>
                    {taskPriorityList && taskPriorityList.map((priority, key) => (
                      <option key={key} value={priority.Id}>
                        {priority.Name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Task Status */}
                <div className="col-md-6 mb-3">
                  <label className="font-weight-bold">Task Status</label>
                  <select
                    className="form-control"
                    name="taskStatus"
                    value={taskStatus}
                    onChange={this.handleInputChange}
                  >
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Actionable">Actionable</option>
                  </select>
                </div>

                {/* Remarks */}
                <div className="col-md-12 mb-3">
                  <label className="font-weight-bold">Remarks</label>
                  <textarea
                    className="form-control"
                    name="remarks"
                    value={remarks}
                    onChange={this.handleInputChange}
                    rows="3"
                    placeholder="Enter remarks here..."
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button
                Action={this.handleSubmit}
                ClassName="btn btn-primary"
                Text="Save"
              />
              <Button
                Action={closeModal}
                ClassName="btn btn-secondary"
                Text="Cancel"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EditTask;
