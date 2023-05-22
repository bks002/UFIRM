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
import DocumentUploader from "../../ReactComponents/FileUploader/DocumentUploader.jsx";

const $ = window.$;
const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result.split(','));
  reader.onerror = error => reject(error);
});
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
      ManufacturerName: "",
      SelectedCategory: "",
      SelectedSubCategory: "",
      SelectedAssetName: "",
      SelectedAssetModel: "",
      IsMovable: false,
      Name: "",
      Description: "",
      QRCode: "",
      ImageData:[],
      Image: "",
      ImageExt: "",
      documentVal: '',
      currentSelectedFile: null,
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
        Name: this.state.SelectedAssetName,
        Description: this.state.Description,
        QRCode: this.state.QRCode,
        AssetType: this.state.AssetType,
        Manufacturer : this.state.ManufacturerName,
        Category : this.state.SelectedCategory,
        SubCategory : this.state.SelectedSubCategory,
        AssetName : this.state.SelectedAssetName,
        AssetModel : this.state.SelectedAssetModel,
        IsMovable : this.state.IsMovable,
        Flag: type,
        Image: this.state.Image,
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

    // Document change
    onFileChange(event) {
      let _validFileExtensions = ["jpg", "jpeg", "png", "pdf"];
      if (event.target.files[0]) {
        let extension = event.target.files[0].name.substring(event.target.files[0].name.lastIndexOf('.') + 1);
        let isvalidFiletype = _validFileExtensions.some(x => x === extension.toLowerCase());
        if (isvalidFiletype) {
  
          this.state.ImageData = event.target.files[0];
  
        }
        else {
          this.setState({ documentVal: '', currentSelectedFile: null })
          let temp_validFileExtensions = _validFileExtensions.join(',');
          appCommon.showtextalert(`${event.target.files[0].name.filename} Invalid file type, Please Select only ${temp_validFileExtensions} `, "", "error");
        }
      }
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

  handleSave = async () => {
    let UpFile = this.state.ImageData;
    let res = null
    if (UpFile) {
      if (UpFile!=""){
      let fileD = await toBase64(UpFile);
      var imgbytes = UpFile.size; // Size returned in bytes.        
      var imgkbytes = Math.round(parseInt(imgbytes) / 1024); // Size returned in KB.    
      let extension = UpFile.name.substring(UpFile.name.lastIndexOf('.') + 1);
      res = {
        filename: UpFile.name,
        filepath: fileD[1],
        sizeinKb: imgkbytes,
        fileType: fileD[0],
        extension: extension.toLowerCase()
      }
      this.state.Image = fileD[1];
      this.state.ImageExt = extension;
    };
  };
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
    
    this.state.ImageData="";
    this.state.Image="";
    this.state.ImageExt="";
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
                        <label htmlFor="radio1">Choose Asset Type</label>
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
                      <label htmlFor="manufacturer">Manufacturer</label>
                          <input type="text" id="manufacturer" placeholder="Manufacturer" 
                          className="form-control"
                          onChange={(e) =>this.setState({ManufacturerName: e.target.value})}
                          />
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                      <label for="txtQRCodeL">Asset Name</label>
                      <input type="text" id="manufacturer" placeholder="Asset Name" 
                          className="form-control"
                          onChange={(e) =>this.setState({SelectedAssetName: e.target.value})}
                          />
                      </div>
                    </div>
                    {/* <div className="col-sm-4">
                      <div className="form-group">
                      <label for="txtQRCodeL">Category</label>
                      <input type="text" id="manufacturer" placeholder="Category" 
                          className="form-control"
                          onChange={(e) =>this.setState({SelectedCategory: e.target.value})}
                          />
                      </div>
                    </div> */}
                  </div>
                  <div className="row">
                    {/* <div className="col-sm-4">
                      <div className="form-group">
                   <label for="txtQRCodeL">Sub Category</label>
                   <input type="text" id="manufacturer" placeholder="Sub Category" 
                          className="form-control"
                          onChange={(e) =>this.setState({SelectedSubCategory: e.target.value})}
                          />
                      </div>
                    </div> */}
                    {/* <div className="col-sm-4">
                      <div className="form-group">
                      <label for="txtQRCodeL">Asset Name</label>
                      <input type="text" id="manufacturer" placeholder="Asset Name" 
                          className="form-control"
                          onChange={(e) =>this.setState({SelectedAssetName: e.target.value})}
                          />
                      </div>
                    </div> */}
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <div className="form-group">
                      <label for="txtQRCodeL">Asset Model</label>
                      <input type="text" id="manufacturer" placeholder="Asset Name" 
                          className="form-control"
                          onChange={(e) =>this.setState({SelectedAssetModel: e.target.value})}
                          />
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                      <label for="txtDescriptionL">Is Movable</label>
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
                        <input type="text" id="manufacturer" placeholder="QR Code" 
                          className="form-control"
                          onChange={(e) =>this.setState({QRCode: e.target.value})}
                          />
                    </div>
                  </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-2">
                      <label>File Upload</label>
                      <DocumentUploader
                        Class={"form-control"}
                        Id={"kycfileUploader"}
                        type={"file"}
                        value={this.state.ImageData}
                        onChange={this.onFileChange.bind(this)}
                      />
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
