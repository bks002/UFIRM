import React, { Component, useState } from "react";
import DataGrid from "../../ReactComponents/DataGrid/DataGrid.jsx";
import Button from "../../ReactComponents/Button/Button";
import ApiProvider from "./DataProvider.js";
import InputBox from "../../ReactComponents/InputBox/InputBox.jsx";
import { ToastContainer, toast } from "react-toastify";
import * as appCommon from "../../Common/AppCommon.js";
import { DELETE_CONFIRMATION_MSG } from "../../Contants/Common";
import swal from "sweetalert";
import { CreateValidator, ValidateControls } from "./Validation.js"
import CommonDataProvider from "../../Common/DataProvider/CommonDataProvider.js";
import DocumentUploader from "../../ReactComponents/FileUploader/DocumentUploader.jsx";
import { ShowImageModal } from "../KanbanBoard/ImageModal.js";

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
        { sTitle: "S No.", titleValue: "sNo", orderable: false },
        { sTitle: "Id", titleValue: "Id", orderable: true },
        { sTitle: "Assets Name", titleValue: "Name" },
        { sTitle: "Description", titleValue: "Description" },
        { sTitle: "QRCode", titleValue: "QRCode" },
        { sTitle: "Service Due Date", titleValue: "NextServiceDate" },
        {
          sTitle: "Action",
          titleValue: "Action",
          Action: "Edit&View&Delete",
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
      IsMoveable: false,
      Name: "",
      Description: "",
      QRCode: "",
      ImageData:[],
      Image: "",
      ImageExt: "",
      documentVal: '',
      currentSelectedFile: null,
      showImagefilename: '',
      showImagefiletype: null,
      showImagefile: [],
      extension: '',
      LastServiceDate:"",
      NextServiceDate:"",
      IsRentable: 0,
      AssetValue:0,
      AMCdoc:[],
      AMCimage:"",
    };
    this.ApiProviderr = new ApiProvider();
    this.comdbprovider = new CommonDataProvider();
  }

  componentDidMount() {
    this.loadHomagePageData();
  }

  getModel = (type) => {
    var model = [
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
        IsMoveable : this.state.IsMoveable,
        Flag: type,
        Image: this.state.Image,
        LastServiceDate: this.state.LastServiceDate,
        NextServiceDate: this.state.NextServiceDate,
        IsRentable: this.state.IsRentable,
        AssetValue: this.state.AssetValue,
        AMCdoc: this.state.AMCimage,

      },
    ];
    return model;
  };

  loadHomagePageData() {
    let model = this.getModel();
    this.ApiProviderr.manageDocumentTypeMaster(model, "R").then((resp) => {
      if (resp.ok && resp.status === 200) {
        return resp.json().then((rData) => {
          console.log(rData);
          const updatedData = rData.map(asset => {
            return {
                ...asset,
                NextServiceDate: asset.NextServiceDate? asset.NextServiceDate.substr(0, 10):""
            };
        });
        console.log(updatedData);
          updatedData.sort((a, b) => (a.Id > b.Id ? 1 : -1))
          updatedData.map((item,index)=>{
            item['sNo']=index+1;
        })
          this.setState({ GridData: updatedData });
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
    const foundItem = this.state.GridData.find(item => item.Id === id);
    return foundItem || null; // Return found item or null if not found
  }
  

  findBySno(id) {
    
    return this.state.GridData.find((item) => {
      if (item.sNo === id) {
        return item;
      }
    });
  }

  ongridedit = (id) => {
    console.log(id);
    this.setState({ PageMode: "Edit" }, () => {
      CreateValidator(); // Ensure this function is defined and used correctly
  
      // Find the item by id in GridData
      const rowData = this.findBySno(id);
      console.log(rowData);
  
      // Check if rowData exists before setting state
      if (rowData) {
        this.setState({
          Id: rowData.Id,
        SelectedAssetName: rowData.Name,
        Description: rowData.Description,
        QRCode: rowData.QRCode,
        ManufacturerName :rowData.Manufacturer,
        SelectedAssetModel : rowData.AssetModel,
        IsMoveable : rowData.IsMoveable,
        LastServiceDate:rowData.LastServiceDate,
        NextServiceDate: rowData.NextServiceDate,
        LastServiceDate: rowData.LastServiceDate,
        NextServiceDate: rowData.NextServiceDate,
        IsRentable: rowData.IsRentable,
        AssetValue: rowData.AssetValue,
        AssetType: rowData.AssetType,
        });
        console.log(JSON.stringify(rowData)+"xcv");
        
        console.log(rowData.Id);
      } else {
        console.error(`Item with id ${id} not found`); // Handle error if needed
      }
    });console.log(this.state.Id);
    console.log(this.state.Name);
    console.log(this.state.IsMoveable);
  };
  
  

  onGridDelete = (Id) => {
    var rowData = this.findBySno(Id);
    console.log(rowData);
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
          this.setState({ Id: rowData.Id.toString() }, () => {
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

  onGridView = (Id) => {
    this.setState({ PageMode: "View" }, () => {
    var rowData = this.findBySno(Id);
    console.log(rowData);
    this.setState({

        Id: rowData.Id,
        Name: rowData.Name,
        Description: rowData.Description,
        QRCode: rowData.QRCode,
        ManufacturerName:rowData.Manufacturer,
        AssetModel : rowData.AssetModel,
        IsMoveable : rowData.IsMoveable,
        LastServiceDate:rowData.LastServiceDate,
        NextServiceDate: rowData.NextServiceDate,
        LastServiceDate: rowData.LastServiceDate,
        NextServiceDate: rowData.NextServiceDate,
        IsRentable: rowData.IsRentable,
        AssetValue: rowData.AssetValue,
        AssetType: rowData.AssetType,

      Image: rowData.Image,
      AMCimage:rowData.AMCdoc,
      showImagefiletype: rowData.ImageExt,
      showImagefile: rowData.Image,
      extension: rowData.ImageExt,
    })})
  };

    // Document change
    onFileChange(event) { 
      console.log("gdfg"+event.target);
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

    onAMCFileChange=(event)=>{
      console.log("gdfg"+JSON.stringify(event.target.files));
      let _validFileExtensions = ["jpg", "jpeg", "png", "pdf"];
      if (event.target.files[0]) {
        let extension = event.target.files[0].name.substring(event.target.files[0].name.lastIndexOf('.') + 1);
        let isvalidFiletype = _validFileExtensions.some(x => x === extension.toLowerCase());
        if (isvalidFiletype) {
  
          this.state.AMCdoc = event.target.files[0];
  
        }
        else {
          this.setState({ documentVal: '', currentSelectedFile: null })
          let temp_validFileExtensions = _validFileExtensions.join(',');
          appCommon.showtextalert(`${event.target.files[0].name.filename} Invalid file type, Please Select only ${temp_validFileExtensions} `, "", "error");
        }
      }
    }

  updatetextmodel = (ctrl, val) => {
    if (ctrl == "Name") {
      this.setState({ Name: val });
    } else if (ctrl == "Desc") {
      this.setState({ Description: val });
    } else if (ctrl == "QRCode") {
      this.setState({ QRCode: val });
    }
  };

//   handleSave = async () => {
//     let UpFile = this.state.ImageData;
//     let res = null
//     if (UpFile) {
//       if (UpFile!=""){
//       let fileD = await toBase64(UpFile);
//       var imgbytes = UpFile.size; // Size returned in bytes.        
//       var imgkbytes = Math.round(parseInt(imgbytes) / 1024); // Size returned in KB.    
//       let extension = UpFile.name.substring(UpFile.name.lastIndexOf('.') + 1);
//       res = {
//         filename: UpFile.name,
//         filepath: fileD[1],
//         sizeinKb: imgkbytes,
//         fileType: fileD[0],
//         extension: extension.toLowerCase()
//       }
//       this.state.Image = fileD[1];
//       this.state.ImageExt = extension;
//     };
//   };

//   let AMCUpFile = this.state.AMCdoc;
//   let AMCres = null
//   if (AMCUpFile) {
//     if (AMCUpFile!=""){
//     let fileD = await toBase64(AMCUpFile);
//     var imgbytes = AMCUpFile.size; // Size returned in bytes.        
//     var imgkbytes = Math.round(parseInt(imgbytes) / 1024); // Size returned in KB.    
//     let extension = AMCUpFile.name.substring(AMCUpFile.name.lastIndexOf('.') + 1);
//     res = {
//       filename: AMCUpFile.name,
//       filepath: fileD[1],
//       sizeinKb: imgkbytes,
//       fileType: fileD[0],
//       extension: extension.toLowerCase()
//     }
//     this.state.AMCimage = fileD[1];
//     this.state.ImageExt = extension;
//   };
// };

//     if (ValidateControls()) {
//       var type = "";
//       if (this.state.PageMode == "Add") {
//         type = "I";
//       } else if (this.state.PageMode == "Edit") {
//         type = "U";
//       }
//       var model = this.getModel(type);
//       this.mangaeSave(model, type);
//     }
    
//     this.state.ImageData="";
//     this.state.Image="";
//     this.state.ImageExt="";
//   };

handleSave = async () => {
  let UpFile = this.state.ImageData;
  let AMCUpFile = this.state.AMCdoc;
  
  let res = null;
  let AMCres = null;
  console.log(UpFile);
  if (UpFile && UpFile.name && UpFile.size) {
    console.log(UpFile);
      let fileD = await toBase64(UpFile);
      let imgbytes = UpFile.size; // Size returned in bytes.
      let imgkbytes = Math.round(parseInt(imgbytes) / 1024); // Size returned in KB.
      let extension = UpFile.name.substring(UpFile.name.lastIndexOf('.') + 1);
      
      res = {
          filename: UpFile.name,
          filepath: fileD,
          sizeinKb: imgkbytes,
          fileType: UpFile.type,
          extension: extension.toLowerCase()
      };
      
      this.setState({
          Image: fileD[1],
          ImageExt: extension
      });
  }
  console.log(AMCUpFile);
  if (AMCUpFile && AMCUpFile.name && AMCUpFile.size) {
    console.log(AMCUpFile);
      let fileD = await toBase64(AMCUpFile);
      let imgbytes = AMCUpFile.size; // Size returned in bytes.
      let imgkbytes = Math.round(parseInt(imgbytes) / 1024); // Size returned in KB.
      let extension = AMCUpFile.name.substring(AMCUpFile.name.lastIndexOf('.') + 1);
      
      AMCres = {
          filename: AMCUpFile.name,
          filepath: fileD,
          sizeinKb: imgkbytes,
          fileType: AMCUpFile.type,
          extension: extension.toLowerCase()
      };
      
      this.setState({
          AMCimage: fileD[1],
          AMCImageExt: extension
      });
  }

  if (ValidateControls()) {
      let type = this.state.PageMode === "Add" ? "I" : "U";
      let model = this.getModel(type);
      this.mangaeSave(model, type);
  }

  this.setState({
      ImageData: null,
      Image: "",
      ImageExt: "",
      AMCdoc: null,
      AMCimage: "",
      AMCImageExt: ""
  });
};


 

  mangaeSave = (model, type) => {
    //
    this.ApiProviderr.manageDocumentTypeMaster(model, type).then((resp) => {
      console.log(model,type);
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {

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
                {this.state.PageMode === "Home" && (
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
                                    Text=" Create New Asset"
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
                            onGridViewMethod={this.onGridView.bind(this)}
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
              {(this.state.PageMode === "Add" || this.state.PageMode == "Edit") && (
              <div>
                <div className="modal-content p-2 rounded">
                  <div className="modal-body">
                    <div className="container-fluid">

                      <div className="row bg-blue rounded p-2 mb-2 d-flex align-items-center">
                        <div className="col-sm-3">
                          <label >Choose Asset Type </label>
                        </div>

                        <div className="col-sm-3">
                          <div className="form-group m-0">
                            <label>
                              <input
                                id="radio1"
                                type="radio"
                                value="Machine/Equipment"
                                name="assetType"
                                className="form-check-input"
                                onChange={(e) =>
                                  this.setState({ AssetType: e.target.value })
                                }
                              />
                              Machine/Equipment
                            </label>
                          </div>
                        </div>
                        <div className="col-sm-3">
                          <div className="form-group m-0">
                            <label>
                              <input
                                id="radio2"
                                type="radio"
                                value="MeasuringEnquipment"
                                name="assetType"
                              className="form-check-input"
                                onChange={(e) =>
                                  this.setState({ AssetType: e.target.value })
                                }
                              />
                              Measuring Equipment
                            </label>
                          </div>
                        </div>
                        <div className="col-sm-3">
                          <div className="form-group m-0">
                            <label>
                              <input
                                id="radio3"
                                type="radio"
                                value="Facility"
                                name="assetType"
                                className="form-check-input"
                                onChange={(e) =>
                                  this.setState({ AssetType: e.target.value })
                                }
                              />
                              Facility
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label htmlFor="manufacturer">Manufacturer</label>
                            <input
                              type="text"
                              id="manufacturer"
                              placeholder="Manufacturer"
                              value={this.state.ManufacturerName||""}
                              className="form-control"
                              onChange={(e) =>
                                this.setState({ ManufacturerName: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label htmlFor="assetName">Enter Asset Name</label>
                            <input
                              type="text"
                              id="assetName"
                              placeholder="Asset Name"
                              className="form-control"
                              value={this.state.SelectedAssetName || ""}
                              onChange={(e) =>
                                this.setState({ SelectedAssetName: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label htmlFor="assetModel">Asset Model</label>
                            <input
                              type="text"
                              id="assetModel"
                              placeholder="Asset Model"
                              value={this.state.SelectedAssetModel||""}
                              className="form-control"
                              onChange={(e) =>
                                this.setState({ SelectedAssetModel: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="form-group col-sm-6">
  <label htmlFor="isMovable">Is Movable</label>
  <select
    id="isMovable"
    className="form-control"
    value={this.state.IsMoveable === null ? "" : (this.state.IsMoveable ? "true" : "false")}
    onChange={(e) =>
      this.setState({ IsMoveable: e.target.value === "true" })
    }
  >
    <option value="" disabled>
      Select an option
    </option>
    <option value="true">Yes</option>
    <option value="false">No</option>
  </select>
</div>


                      </div>

                      <div className="row">
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label htmlFor="lastServiceDate">Last Service Date</label>
                            <input
                              type="date"
                              id="lastServiceDate"
                              className="form-control"
                              value={this.state.LastServiceDate || ""}
                              onChange={(e) =>
                                this.setState({ LastServiceDate: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label htmlFor="nextServiceDate">Next Service Date</label>
                            <input
                              type="date"
                              id="nextServiceDate"
                              className="form-control"
                              value={this.state.NextServiceDate}
                              onChange={(e) =>
                                this.setState({ NextServiceDate: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-sm-6">
                          <div className="form-group ">
                            <label>Is Rentable?</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="1"
                              value={this.state.IsRentable}
                              className="form-control-range"
                              onChange={(e) =>
                                this.setState({ IsRentable: parseInt(e.target.value)})
                              }
                            />
                            <span>{this.state.IsRentable ===1? "Yes" : "No"}</span>
                          </div>
                        </div>
                        <div className="col-sm-6">
                <div className="form-group">
                  <label htmlFor="assetValue">Asset Value</label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">₹</span>
                    </div>
                    <input
                      type="number"
                      id="assetValue"
                      className="form-control currency"
                      value={this.state.AssetValue || ""}
                      onChange={(e) =>
                        this.setState({ AssetValue: parseFloat(e.target.value) || 0 })
                      }
                      onKeyDown={(e) => e.key === 'e' && e.preventDefault()} // Prevents input of 'e'
                    />
                  </div>
                </div>
              </div>
                      </div>

                      <div className="row">
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                              id="description"
                              onChange={(e) =>
                                this.setState({ Description: e.target.value })
                              }
                              placeholder="Description"
                              value={this.state.Description||""}
                              className="form-control form-control-sm"
                              rows="2"
                            />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label htmlFor="QRCode">QRCode</label>
                            <input
                              type="text"
                              id="QRCode"
                              placeholder="QR Code"
                              value={this.state.QRCode||""}
                              className="form-control"
                              onChange={(e) => this.setState({ QRCode: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-sm-6">
                          <label>Bill Upload</label>
                          <DocumentUploader
                            Class={"form-control"}
                            id={"kycfileUploader"}
                            type={"file"}
                            // value={this.state.ImageData.name}
                            onChange={this.onFileChange.bind(this)}
                          />
                        </div>
                        <div className="col-sm-6">
                          <label>AMC Upload</label>
                          <DocumentUploader
                            Class={"form-control"}
                            id={"AMCfileUploader"}
                            type={"file"}
                            // value={this.state.AMCdoc.name}
                            onChange={(this.onAMCFileChange.bind(this))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer m-2">

                    <Button
                      id="btnSave"
                      Text="Save"
                      Action={this.handleSave}
                      ClassName="btn btn-primary "
                    />

                    <Button
                      id="btnCancel"
                      Text="Cancel"
                      Action={this.handleCancel}
                      ClassName="btn btn-secondary"
                    />
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
                {(this.state.PageMode == "View") && (
    <div className="modal-dialog rounded" role="document">
      <div className="modal-content rounded ">
        <div className="modal-header bg-blue rounded-top p-1">
        <h5 class="modal-title p-1">Viewing Asset Details</h5>
        <button type="button" className="close " data-dismiss="modal" aria-label="Close" onClick={this.handleCancel}>
          <span aria-hidden="true">&times;</span>
        </button>
        </div>

        <div className="modal-body p-2">
          <form>
            <div className="row"><div className="form-group col-sm-6">
              <label htmlFor="id">ID:</label>
              <input type="text" className="form-control" id="id" value={this.state.Id} readOnly />
            </div>
            <div className="form-group col-sm-6">
              <label htmlFor="name">Asset Type:</label>
              <input type="text" className="form-control" id="name" value={this.state.AssetType} readOnly />
            </div>
            </div>
            
            <div className="row">
            <div className="form-group col-sm-6">
              <label htmlFor="name">Name:</label>
              <input type="text" className="form-control" id="name" value={this.state.Name} readOnly />
            </div>
            <div className="form-group col-sm-6">
              <label htmlFor="name">Asset Model:</label>
              <input type="text" className="form-control" id="name" value={this.state.AssetModel} readOnly />
            </div>
            </div>

            <div className="row">
            <div className="form-group col-sm-6">
              <label htmlFor="isMovable">Is Moveable:</label>
              <input type="text" className="form-control" id="isMovable" value={this.state.IsMoveable?"Yes":"No"} readOnly />
            </div>
            <div className="form-group col-sm-6">
              <label htmlFor="isRentable">Is Rentable:</label>
              <input type="text" className="form-control" id="isRentable" value={this.state.IsRentable===1 ? "Yes" : "No"} readOnly />
            </div></div>

            <div className="row">
            <div className="form-group col-sm-6">
              <label htmlFor="description">Description:</label>
              <textarea className="form-control" id="description" value={this.state.Description} readOnly />
            </div>
            <div className="form-group col-sm-6">
              <label htmlFor="qrCode">QR Code:</label>
              <input type="text" className="form-control" id="qrCode" value={this.state.QRCode} readOnly />
            </div>
            
            </div>

            <div className="row">
            <div className="form-group col-sm-6">
              <label htmlFor="lastServiceDate">Last Service Date:</label>
              <input type="text" className="form-control" id="lastServiceDate" value={this.state.LastServiceDate} readOnly />
            </div>
            <div className="form-group  col-sm-6">
              <label htmlFor="nextServiceDate">Next Service Date:</label>
              <input type="text" className="form-control" id="nextServiceDate" value={this.state.NextServiceDate} readOnly />
            </div>
            
            </div>

            <div className="row">
            <div className="form-group col-sm-6">
              <label htmlFor="assetValue">Manufacturer:</label>
              <input type="text" className="form-control" id="assetValue" value={this.state.ManufacturerName} readOnly />
            </div>
            <div className="form-group col-sm-6">
              <label htmlFor="assetValue">Asset Value:</label>
              <input type="text" className="form-control" id="assetValue" value={`₹${this.state.AssetValue}`} readOnly />
            </div>
            </div> 

            <div className="row">
              <div className="form-group col-sm-6">
              <label htmlFor="assetImage">Asset Image:</label>
              <img
                src={`data:image/png;base64,${this.state.Image}`}
                alt="Asset"
                className="img-fluid"
                style={{ height: "400px", width: "400px" }}
              />
              </div>
              <div className="form-group col-sm-6">
              <label htmlFor="assetImage">AMC Contract:</label>
              <img
                src={`data:image/png;base64,${this.state.AMCimage}`}
                alt="AMC Document"
                className="img-fluid"
                style={{ height: "400px", width: "400px" }}
              />
              </div>
            
            </div>
          </form>
        </div>
      </div>
    </div>
        )}
      </div>
    );
  }
}

export default AssetsMaster;
