import React, { Component } from "react";
import DataGrid from "../../ReactComponents/DataGrid/DataGrid.jsx";
import Button from "../../ReactComponents/Button/Button";
import ApiProvider from "./DataProvider.js";
import InputBox from "../../ReactComponents/InputBox/InputBox.jsx";
import { ToastContainer, toast } from "react-toastify";
import * as appCommon from "../../Common/AppCommon.js";
import { DELETE_CONFIRMATION_MSG } from "../../Contants/Common";
import swal from "sweetalert";
import { CreateValidator, ValidateControls } from "./Validation.js";
import CommonDataProvider from "../../Common/DataProvider/CommonDataProvider.js";

const $ = window.$;

class AssetsMaster extends Component {
  constructor(props) {
    super(props);
    this.state = {
      GridData: [],
      gridHeader: [
        { sTitle: "Id", titleValue: "Id", orderable: false },
        { sTitle: "Assets Name", titleValue: "Name" },
        { sTitle: "Description", titleValue: "Description" },
        { sTitle: "QRCode", titleValue: "QRCode" },
        {
          sTitle: "Action",
          titleValue: "Action",
          Action: "Edit&Delete",
          Index: "0",
          orderable: false,
        },
      ],
      PageMode: "Home",
      Id: 0,
      AssetType: "",
      ManufacturerName: 0,
      SelectedCategory: 0,
      SelectedSubCategory: 0,
      SelectedAssetName: 0,
      SelectedAssetModel: 0,
      IsMovable: false,
      Name: "",
      Description: "",
      QRCode: "",
    };
    this.ApiProviderr = new ApiProvider();
    this.comdbprovider = new CommonDataProvider();
  }

  componentDidMount() {
    this.loadHomagePageData();
  }

  getModel = (type) => {
    var mode = [
      {
        Id: this.state.Id,
        Name: this.state.Name,
        Description: this.state.Description,
        QRCode: this.state.QRCode,
        Flag: type,
      },
    ];
    return mode;
  };

  loadHomagePageData() {
    //
    let model = this.getModel();
    this.ApiProviderr.manageDocumentTypeMaster(model, "R").then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          this.setState({ GridData: rData });
        });
      }
    });
  }

  onPagechange = (page) => {};

  Addnew = () => {
    this.setState({ PageMode: "Add" }, () => {
      CreateValidator();
    });
  };
  findItem(id) {
    //
    return this.state.GridData.find((item) => {
      if (item.Id == id) {
        return item;
      }
    });
  }

  ongridedit = (Id) => {
    //
    this.setState({ PageMode: "Edit" }, () => {
      CreateValidator();
      var rowData = this.findItem(Id);
      this.setState({ Id: rowData.Id });
      this.setState({ Name: rowData.Name });
      this.setState({ Description: rowData.Description });
      this.setState({ QRCode: rowData.QRCode });
    });
  };

  onGridDelete = (Id) => {
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
          this.setState({ Id: Id.toString() }, () => {
            var type = "D";
            var model = this.getModel(type);
            this.mangaeSave(model, type);
          });
          break;
        case "cancel":
          break;
        default:
          break;
      }
    });
  };

  updatetextmodel = (ctrl, val) => {
    if (ctrl == "Name") {
      this.setState({ Name: val });
    } else if (ctrl == "Desc") {
      this.setState({ Description: val });
    } else if (ctrl == "QRCode") {
      this.setState({ QRCode: val });
    }
  };

  handleSave = () => {
    //
    if (ValidateControls()) {
      var type = "";
      if (this.state.PageMode == "Add") {
        type = "I";
      } else if (this.state.PageMode == "Edit") {
        type = "U";
      }
      var model = this.getModel(type);
      this.mangaeSave(model, type);
    }
  };
  mangaeSave = (model, type) => {
    //
    this.ApiProviderr.manageDocumentTypeMaster(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          //

          if (rData === 0) {
            const val = model[0].Id.trim();
            appCommon.showtextalert("Assets Name Existed !", "", "error");
          } else {
            if (type != "D")
              appCommon.showtextalert(
                "Assets Saved Successfully!",
                "",
                "success"
              );
            else
              appCommon.showtextalert(
                "Assets Deleted Successfully!",
                "",
                "success"
              );
            this.handleCancel();
          }
        });
      }
    });
  };
  handleCancel = () => {
    this.setState({ Id: 0, Name: "", Description: "", QRCode: "" }, () => {
      this.setState({ PageMode: "Home" });
      this.loadHomagePageData();
    });
  };

  render() {
    return (
      <div>
        {this.state.PageMode == "Home" && (
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex p-0">
                  <ul className="nav ml-auto tableFilterContainer">
                    <li className="nav-item">
                      <div className="input-group input-group-sm">
                        <div className="input-group-prepend">
                          <Button
                            id="btnNewComplain"
                            Action={this.Addnew.bind(this)}
                            ClassName="btn btn-success btn-sm"
                            Icon={
                              <i className="fa fa-plus" aria-hidden="true"></i>
                            }
                            Text=" Create New"
                          />
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="card-body pt-2">
                  <DataGrid
                    Id="grdAssetsMaster"
                    IsPagination={false}
                    ColumnCollection={this.state.gridHeader}
                    Onpageindexchanged={this.onPagechange.bind(this)}
                    onEditMethod={this.ongridedit.bind(this)}
                    onGridDeleteMethod={this.onGridDelete.bind(this)}
                    DefaultPagination={false}
                    IsSarching="true"
                    GridData={this.state.GridData}
                    pageSize="2000"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {(this.state.PageMode == "Add" || this.state.PageMode == "Edit") && (
          <div>
            <div>
              <div className="modal-content">
                <div className="modal-body">
                <div className="row">
                  <div className="col-sm-6">
                      <div className="form-group">
                        <label for="radio1">Choose Asset Type</label>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-2">
                      <div className="form-group">
                        <label>
                          <input
                            id="radio1"
                            type="radio"
                            value="Machine/Equipment"
                            name="assetType"
                            onChange={(e) =>
                                this.setState({
                                    AssetType: e.target.value,
                                })
                              }
                          />
                          Machine/Equipment
                        </label>
                      </div>
                    </div>
                    <div className="col-sm-2">
                      <div className="form-group">
                        <label>
                          <input
                            id="radio1"
                            type="radio"
                            value="MeasuringEnquipment"
                            name="assetType"
                            onChange={(e) =>
                                this.setState({
                                    AssetType: e.target.value,
                                })
                              }
                          />
                          Measuring Enquipment
                        </label>
                      </div>
                    </div>
                    <div className="col-sm-2">
                      <div className="form-group">
                        <label>
                          <input
                            id="radio1"
                            type="radio"
                            value="Facility"
                            name="assetType"
                            onChange={(e) =>
                                this.setState({
                                    AssetType: e.target.value,
                                })
                              }
                          />
                          Facility
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <div className="form-group">
                      <select
                        id="dllCategory"
                        className="form-control"
                        onChange={(e) =>
                            this.setState({
                                ManufacturerName: e.target.value,
                            })
                          }
                      >
                        <option value={0}>Manufacturer</option>
                      </select>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                      <select
                        id="dllCategory"
                        className="form-control"
                        onChange={(e) =>
                            this.setState({
                                SelectedCategory: e.target.value,
                            })
                          }
                      >
                        <option value={0}>Category</option>
                      </select>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <div className="form-group">
                      <select
                        id="dllCategory"
                        className="form-control"
                        onChange={(e) =>
                            this.setState({
                                SelectedSubCategory: e.target.value,
                            })
                          }
                      >
                        <option value={0}>Sub-Category</option>
                      </select>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                      <select
                        id="dllCategory"
                        className="form-control"
                        onChange={(e) =>
                            this.setState({
                                SelectedAssetName: e.target.value,
                            })
                          }
                      >
                        <option value={0}>Asset Name</option>
                      </select>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <div className="form-group">
                      <select
                        id="dllCategory"
                        className="form-control"
                        onChange={(e) =>
                            this.setState({
                                SelectedAssetModel: e.target.value,
                            })
                          }
                      >
                        <option value={0}>Asset Model</option>
                      </select>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                      <select
                        id="dllCategory"
                        className="form-control"
                        onChange={(e) =>
                            this.setState({
                                IsMovable: e.target.value,
                            })
                          }
                      >
                        <option value={0}>Is Movable</option>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                      </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                  <div className="col-sm-4">
                      <div className="form-group">
                        <label for="txtDescriptionL">Description</label>
                                                   <textarea
                          Id="txtQRCode"
                          onChange={(e) =>
                            this.setState({
                                Description: e.target.value,
                            })
                          }
                          PlaceHolder="Description"
                          className="form-control form-control-sm"
                        rows="4"
                                    />
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label for="txtQRCodeL">QRCode</label>
                           <InputBox
                          Id="txtQRCode"
                          Value={this.state.QRCode}
                          onChange={this.updatetextmodel.bind(this, "QRCode")}
                          PlaceHolder="QRCode"
                          className="form-control form-control-sm"
                                    />
                    </div>
                  </div>
                  </div>
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
        )}
      </div>
    );
  }
}

export default AssetsMaster;
