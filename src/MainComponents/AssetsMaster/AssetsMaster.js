import React, { Component, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import departmentActions from "../../redux/department/action.js";
import DataGrid from "../../ReactComponents/DataGrid/DataGrid.jsx";
import Button from "../../ReactComponents/Button/Button";
import ApiProvider from "./DataProvider.js";
import { ToastContainer, toast } from "react-toastify";
import * as appCommon from "../../Common/AppCommon.js";
import { DELETE_CONFIRMATION_MSG } from "../../Contants/Common";
import swal from "sweetalert";
import { CreateValidator, ValidateControls } from "./Validation.js"
import CommonDataProvider from "../../Common/DataProvider/CommonDataProvider.js";
import DocumentUploader from "../../ReactComponents/FileUploader/DocumentUploader.jsx";
import ExportToCSV from "../../ReactComponents/ExportToCSV/ExportToCSV.js";

const $ = window.$;
const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result.split(','));
  reader.onerror = error => reject(error);
});
const RadioButtonGroup = ({ options, name, selectedValue, onChange }) => (
    <div className="d-flex align-items-center justify-content-around">
      {options.map((opt) => (
          <label
              key={opt.value}
              className="form-check-label d-flex align-items-center gap-2"
              style={{ cursor: "pointer" }}
          >
            <input
                type="radio"
                name={name}
                value={opt.value}
                checked={selectedValue === opt.value}
                onChange={onChange}
                className="form-check-input"
            />
            {opt.label}
          </label>
      ))}
    </div>
);


class AssetsMaster extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      GridData: [],
      DueGridData:[],
      viewMode: "panel",
      searchText: "",
      selectedAssetId: null,
      gridHeader: [
        // { sTitle: "S No.", titleValue: "sNo", orderable: false },
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
      AssetImage: "",
      ImageExt: "",
      documentVal: '',
      currentSelectedFile: null,
      showImagefilename: '',
      showImagefiletype: null,
      showImagefile: [],
      extension: '',
      LastServiceDate:null,
      NextServiceDate:null,
      IsRentable: false,
      AssetValue:0,
      AMCdoc:[],
      AMCimage:"",
      status:false,
      category:null,
      location:null,
      serviceReminderDay:"",
    };
    this.ApiProviderr = new ApiProvider();
    this.comdbprovider = new CommonDataProvider();
  }

  componentDidMount() {
    this.loadHomagePageData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.PropertyId !== this.props.PropertyId) {
        this.loadHomagePageData();
    }
}

  getModel = (type) => {
    var model = [
      {
        Id: this.state.Id,
        Name: this.state.Name,
        Description: this.state.Description,
        QRCode: this.state.QRCode,
        AssetType: this.state.AssetType,
        Manufacturer : this.state.ManufacturerName,
        AssetModel : this.state.AssetModel,
        IsMoveable : this.state.IsMoveable,
        Flag: type,
        AssetImage: this.state.AssetImage,
        LastServiceDate: this.state.LastServiceDate,
        NextServiceDate: this.state.NextServiceDate,
        IsRentable: this.state.IsRentable,
        AssetValue: this.state.AssetValue,
        AMCdoc: this.state.AMCimage,
        status:this.state.status,
        category: this.state.category,
        location: this.state.location,
        serviceReminderDay:this.state.serviceReminderDay,
        propertyId: this.props.PropertyId,

      },
    ];
    return model;
  };

  loadHomagePageData() {
    let model = this.getModel();
    this.setState({ isLoading: true });
    this.ApiProviderr.manageDocumentTypeMaster(model, "R").then((resp) => {
      console.log(model);
      if (resp.ok && resp.status === 200) {
        return resp.json().then((rData) => {
          const dueServiceAssets = rData.PassedServiceDates;
          const upcomingServiceAssets = rData.UpcomingServiceDates;
          this.setState({ 
            GridData: [...dueServiceAssets, ...upcomingServiceAssets],
            DueGridData: dueServiceAssets,
            isLoading: false 
          });
        });
      } else {
        console.error('Error:', resp.status);
        this.setState({ isLoading: false });
      }
    }).catch((error) => {
      console.error('Error:', error);
      this.setState({ isLoading: false });
    });
  }

  // loadHomagePageData() {
  //   let model = this.getModel();
  //   this.ApiProviderr.manageDocumentTypeMaster(model, "R").then((resp) => {
  //     if (resp.ok && resp.status === 200) {
  //       return resp.json().then((rData) => {
  //         console.log(this.props.PropertyId)
  //         console.log(rData);
  //         const updatedData = rData.map(asset => {
  //           return {
  //               ...asset,
  //               NextServiceDate: asset.NextServiceDate? asset.NextServiceDate.substr(0, 10):""
  //           };
  //       });
  //       console.log(updatedData);
  //         updatedData.sort((a, b) => (a.Id > b.Id ? 1 : -1))
  //         updatedData.map((item,index)=>{
  //           item['sNo']=index+1;
  //       })
  //         this.setState({ GridData: updatedData });
  //       });
        
  //     }
  //   });
  // }
  

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
    this.setState({ PageMode: "Edit" }, () => {
      CreateValidator(); // Ensure this function is defined and used correctly
      // Find the item by id in GridData
      const rowData = this.findItem(id);
      console.log(rowData);
      // Check if rowData exists before setting state
      if (rowData) {
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
          IsRentable: rowData.IsRentable,
          AssetValue: rowData.AssetValue,
          AssetType: rowData.AssetType,
          AssetImage: rowData.AssetImage,
          AMCimage:rowData.AMCdoc,
          showImagefiletype: rowData.ImageExt,
          showImagefile: rowData.Image,
          extension: rowData.ImageExt,
          status:rowData.Status,
          category: rowData.Category,
          location: rowData.Location,
          serviceReminderDay:"",
        });
      } else {
        console.error(`Item with id ${id} not found`); // Handle error if needed
      }
    });
  };
  

  onGridDelete = (Id) => {
    var rowData = this.findItem(Id);
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
    var rowData = this.findItem(Id);
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
        IsRentable: rowData.IsRentable,
        AssetValue: rowData.AssetValue,
        AssetType: rowData.AssetType,
      AssetImage: rowData.AssetImage,
      AMCimage:rowData.AMCdoc,
      showImagefiletype: rowData.ImageExt,
      showImagefile: rowData.Image,
      extension: rowData.ImageExt,
      status:rowData.Status,
      category: rowData.Category,
      location: rowData.Location,
      serviceReminderDay:"",
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
          AssetImage: fileD[1],
          ImageExt: extension
      });
  }
  // console.log(AMCUpFile);
  if (AMCUpFile && AMCUpFile.name && AMCUpFile.size) {
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
      AssetImage: "",
      ImageExt: "",
      AMCdoc: null,
      AMCimage: "",
      AMCImageExt: ""
  });
};

  mangaeSave = (model, type) => {
    console.log(model);
    this.ApiProviderr.manageDocumentTypeMaster(model, type).then((resp) => {
      if (resp.ok && resp.status === 200) {
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
    this.setState({ Id:0,
      Name:"",
      Description: "",
      QRCode: "",
      ManufacturerName:"",
      AssetModel : "",
      IsMoveable : false,
      LastServiceDate:"",
      NextServiceDate:"",
      IsRentable:false,
      AssetValue: 0,
      AssetType: "",
      AssetImage: null,
      AMCimage:null,
      showImagefiletype:null,
      showImagefile: null,
      extension: null,
      status:false,
      category:"",
      location: "",
      serviceReminderDay:""}, () => {
      this.setState({ PageMode: "Home" });
      this.loadHomagePageData();
    });
  };

// Then use it directly in AssetModal


  render() {
            const filteredAssets = (this.state.GridData || []).filter((item) => {
              if (!this.state.searchText) return true;
              const text = `${item.Id || ""} ${item.Name || ""} ${item.Description || ""} ${item.Manufacturer || ""}`.toLowerCase();
              return text.includes(this.state.searchText.toLowerCase());
            });
            const activeAsset =
              filteredAssets.find((a) => a.Id === this.state.selectedAssetId) || filteredAssets[0] || null;
            return (
              <div>
                <style>{`
                  .asset-breadcrumb { display:flex; align-items:center; gap:6px; font-size:14px; color:#4A7FA8; margin-bottom:12px; }
                  .asset-breadcrumb .breadcrumb-link { cursor:pointer; }
                  .asset-breadcrumb .breadcrumb-link:hover { color:#1E4A6B; text-decoration:underline; }
                  .asset-breadcrumb .breadcrumb-current { color:#1E4A6B; font-weight:600; }
                  .asset-page-title { font-size:24px; font-weight:700; color:#1E4A6B; margin:0 0 16px 0; }
                  .asset-view-header { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:16px; padding:0; }
                  .asset-view-toggle { display:inline-flex; border:1px solid #d4e3ed; border-radius:10px; overflow:hidden; background:#e8eff5; padding:4px; gap:4px; }
                  .asset-view-toggle button { border:none; background:transparent; padding:8px 16px; font-size:13px; font-weight:600; color:#4A7FA8; border-radius:7px; transition:all 0.25s ease; display:flex; align-items:center; gap:6px; }
                  .asset-view-toggle button:hover { background:rgba(51,107,147,0.12); color:#1E4A6B; }
                  .asset-view-toggle button.active { background:#336B93; color:#fff; box-shadow:0 2px 6px rgba(51,107,147,0.25); }
                  .asset-search-box { position:relative; }
                  .asset-search-box input { padding:10px 14px 10px 40px; border:1px solid #d4e3ed; border-radius:10px; font-size:14px; width:260px; background:#fff; transition:all 0.25s ease; }
                  .asset-search-box input:focus { outline:none; border-color:#336B93; box-shadow:0 0 0 3px rgba(51,107,147,0.15); }
                  .asset-search-box .search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#7a8ea0; }
                  .asset-export-btn { display:flex; align-items:center; gap:6px; padding:10px 16px; border:1px solid #d4e3ed; border-radius:10px; background:#fff; color:#336B93; font-weight:600; font-size:13px; cursor:pointer; transition:all 0.25s ease; }
                  .asset-export-btn:hover { background:#e8f1f8; border-color:#336B93; }
                  .asset-add-btn { display:flex; align-items:center; gap:8px; padding:10px 18px; border:none; border-radius:10px; background:#2E7D4A; color:#fff; font-weight:600; font-size:13px; cursor:pointer; transition:all 0.25s ease; box-shadow:0 2px 6px rgba(46,125,74,0.25); }
                  .asset-add-btn:hover { background:#256b3e; box-shadow:0 4px 12px rgba(46,125,74,0.35); transform:translateY(-1px); }
                  .asset-panel-shell { display:grid; grid-template-columns:340px minmax(0,1fr); border:1px solid #d8e6f0; border-radius:12px; overflow:hidden; min-height:560px; box-shadow:0 2px 8px rgba(51,107,147,0.12); }
                  .asset-panel-list { border-right:1px solid #d8e6f0; max-height:560px; overflow-y:auto; padding:12px; background:#fff; }
                  .asset-panel-item { width:100%; text-align:left; border:1px solid #e6eff6; border-radius:10px; background:#fff; padding:12px; margin-bottom:10px; cursor:pointer; transition:all 0.2s ease; }
                  .asset-panel-item:hover { border-color:#4A7FA8; background:#f8fbff; }
                  .asset-panel-item.active { border-color:#336B93; background:#f0f7ff; box-shadow:inset 3px 0 0 #336B93; }
                  .asset-panel-create { width:100%; border:2px dashed #336B93; border-radius:10px; padding:14px; margin-bottom:12px; background:#f3f9ff; color:#1E4A6B; font-weight:700; cursor:pointer; transition:all 0.2s ease; }
                  .asset-panel-create:hover { background:#e8f1f8; border-color:#1E4A6B; }
                  .asset-panel-detail { max-height:560px; overflow-y:auto; padding:20px; background:#fff; }
                  .asset-d-label { font-size:11px; color:#7a8ea0; text-transform:uppercase; font-weight:700; margin-bottom:4px; letter-spacing:0.5px; }
                  .asset-d-value { font-size:14px; color:#22384c; font-weight:600; word-break:break-word; }
                  .asset-d-grid { margin-top:16px; display:grid; grid-template-columns:repeat(2,minmax(180px,1fr)); gap:16px; }
                  .asset-detail-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 14px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s ease; }
                  .asset-edit-btn { background:#336B93; color:#fff; border:none; }
                  .asset-edit-btn:hover { background:#1E4A6B; }
                  .asset-delete-btn { background:#fff; color:#A83232; border:1px solid #A83232; }
                  .asset-delete-btn:hover { background:#fef2f2; }
                  .asset-create-shell { border:1px solid #d8e6f0; border-radius:12px; box-shadow:0 10px 24px rgba(20,42,61,0.08); background:#fff; }
                  .asset-create-shell .modal-body { max-height:calc(100vh - 200px); overflow-y:auto; }
                  .asset-table-card { border-radius:12px; border:1px solid #d8e6f0; box-shadow:0 2px 8px rgba(51,107,147,0.12); }
                  @media (max-width:1024px){ .asset-panel-shell { grid-template-columns:1fr; } .asset-panel-list { border-right:none; border-bottom:1px solid #d8e6f0; max-height:250px; } }
                `}</style>

                {/* Breadcrumb */}
                <div className="asset-breadcrumb">
                  <span className="breadcrumb-link">Assets</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>
                  <span className="breadcrumb-current">Asset Master</span>
                </div>

                {/* Page Title */}
                <h1 className="asset-page-title">Asset Master</h1>

                {this.state.PageMode === "Home" && (
                  <div className="row">
                    <div className="col-12">
                      <div className="card p-3">
                        <div className="asset-view-header">
                          <div className="asset-view-toggle">
                            <button type="button" className={this.state.viewMode === "panel" ? "active" : ""} onClick={() => this.setState({ viewMode: "panel" })}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="12" y="3" width="9" height="18" rx="1"/></svg>
                              Panel View
                            </button>
                            <button type="button" className={this.state.viewMode === "table" ? "active" : ""} onClick={() => this.setState({ viewMode: "table" })}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
                              Table View
                            </button>
                          </div>
                          <div className="d-flex align-items-center gap-3">
                            <div className="asset-search-box">
                              <span className="search-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                              </span>
                              <input
                                type="text"
                                placeholder="Search assets..."
                                value={this.state.searchText}
                                onChange={(e) => this.setState({ searchText: e.target.value })}
                              />
                            </div>
                            <ExportToCSV data={filteredAssets} className="asset-export-btn"/>
                            {this.state.viewMode === "table" && (
                              <button type="button" className="asset-add-btn" onClick={this.Addnew.bind(this)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                Create New Asset
                              </button>
                            )}
                          </div>
                        </div>
                        {this.state.viewMode === "table" && <div className="card-body pt-2 asset-table-card">
                          <DataGrid
                            key={`asset-grid-${filteredAssets.length}`}
                            Id="grdAssetsMaster"
                            IsPagination={false}
                            ColumnCollection={this.state.gridHeader}
                            Onpageindexchanged={this.onPagechange.bind(this)}
                            onEditMethod={this.ongridedit.bind(this)}
                            onGridDeleteMethod={this.onGridDelete.bind(this)}
                            onGridViewMethod={this.onGridView.bind(this)}
                            DefaultPagination={true}
                            IsSarching={false}
                            GridData={filteredAssets}
                            pageSize="2000"
                          />
                        </div>}
                        {this.state.viewMode === "panel" && (
                          <div className="asset-panel-shell">
                            <div className="asset-panel-list">
                              <button type="button" className="asset-panel-create" onClick={this.Addnew.bind(this)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{marginRight:6}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                Create New Asset
                              </button>
                              {filteredAssets.map((item) => (
                                <button
                                  key={item.Id}
                                  type="button"
                                  className={`asset-panel-item ${activeAsset && activeAsset.Id === item.Id ? "active" : ""}`}
                                  onClick={() => this.setState({ selectedAssetId: item.Id })}
                                >
                                  <div style={{ fontWeight: 700, color: "#22384c", fontSize: 14 }}>{item.Name || "-"}</div>
                                  <div style={{ fontSize: 12, color: "#6d7f8d" }}>#{item.Id} • {item.Manufacturer || "-"}</div>
                                </button>
                              ))}
                            </div>
                            <div className="asset-panel-detail">
                              {!activeAsset && <div className="text-muted">No assets found.</div>}
                              {activeAsset && (
                                <>
                                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12}}>
                                    <h3 style={{ margin: 0, color: "#1E4A6B", fontWeight: 700, fontSize:20 }}>{activeAsset.Name || "-"}</h3>
                                    <div className="d-flex gap-2">
                                      <button type="button" className="asset-detail-btn asset-edit-btn" onClick={() => this.ongridedit(activeAsset.Id)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        Edit
                                      </button>
                                      <button type="button" className="asset-detail-btn asset-delete-btn" onClick={() => this.onGridDelete(activeAsset.Id)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                  <p style={{color:'#7a8ea0', fontSize:13, marginBottom:16}}>Asset ID: #{activeAsset.Id}</p>
                                  <div className="asset-d-grid">
                                    <div><div className="asset-d-label">Asset Type</div><div className="asset-d-value">{activeAsset.AssetType || "-"}</div></div>
                                    <div><div className="asset-d-label">Manufacturer</div><div className="asset-d-value">{activeAsset.Manufacturer || "-"}</div></div>
                                    <div><div className="asset-d-label">Model</div><div className="asset-d-value">{activeAsset.AssetModel || "-"}</div></div>
                                    <div><div className="asset-d-label">QR Code</div><div className="asset-d-value">{activeAsset.QRCode || "-"}</div></div>
                                    <div><div className="asset-d-label">Last Service Date</div><div className="asset-d-value">{activeAsset.LastServiceDate || "-"}</div></div>
                                    <div><div className="asset-d-label">Next Service Date</div><div className="asset-d-value">{activeAsset.NextServiceDate || "-"}</div></div>
                                    <div><div className="asset-d-label">Is Moveable</div><div className="asset-d-value">{activeAsset.IsMoveable ? "Yes" : "No"}</div></div>
                                    <div><div className="asset-d-label">Is Rentable</div><div className="asset-d-value">{activeAsset.IsRentable ? "Yes" : "No"}</div></div>
                                    <div><div className="asset-d-label">Asset Value</div><div className="asset-d-value">₹{activeAsset.AssetValue || 0}</div></div>
                                    <div><div className="asset-d-label">Status</div><div className="asset-d-value">{activeAsset.Status ? "Functional" : "Non-Functional"}</div></div>
                                    <div><div className="asset-d-label">Category</div><div className="asset-d-value">{activeAsset.Category || "-"}</div></div>
                                    <div><div className="asset-d-label">Location</div><div className="asset-d-value">{activeAsset.Location || "-"}</div></div>
                                  </div>
                                  {activeAsset.Description && (
                                    <div style={{marginTop:20}}>
                                      <div className="asset-d-label">Description</div>
                                      <div className="asset-d-value">{activeAsset.Description}</div>
                                    </div>
                                  )}
                                  {activeAsset.AssetImage && (
                                    <div style={{marginTop:20}}>
                                      <div className="asset-d-label">Asset Image</div>
                                      <img src={`data:image/png;base64,${activeAsset.AssetImage}`} alt="Asset" style={{maxWidth:200, borderRadius:8, marginTop:8, border:'1px solid #d8e6f0'}} />
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              {(this.state.PageMode === "Add" || this.state.PageMode === "Edit") && (
              <div>
                <div className="modal-content p-2 rounded asset-create-shell">
                  <div className="modal-body">
                    <div className="container-fluid">

                      <div className="row bg-blue rounded p-2 mb-2 d-flex align-items-center justify-content-between">
                        <div className="col-auto">
                          <label className="mb-0 fw-bold">Choose Asset Type:</label>
                        </div>
                        <div className="col">
                          <RadioButtonGroup
                              options={[
                                {label: "Machine/Equipment", value: "Machine/Equipment"},
                                {label: "Measuring Equipment", value: "MeasuringEnquipment"},
                                {label: "Facility", value: "Facility"},
                              ]}
                              name="AssetType"
                              selectedValue={this.state.AssetType}
                              onChange={(e) => this.setState({AssetType: e.target.value})}
                          />
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
                              value={this.state.ManufacturerName}
                              className="form-control"
                              onChange={(e) =>
                                    this.setState({ManufacturerName: e.target.value})
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
                                value={this.state.Name}
                                onChange={(e) =>
                                    this.setState({Name: e.target.value})
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
                                value={this.state.AssetModel}
                                className="form-control"
                                onChange={(e) =>
                                    this.setState({AssetModel: e.target.value})
                                }
                            />
                          </div>
                        </div>
                        <div className="form-group col-sm-6">
                          <label htmlFor="isMovable">Is Movable</label>
                          <select
                              id="isMovable"
                              className="form-control"
                              value={this.state.IsMoveable}
                              onChange={(e) =>
                                  this.setState({IsMoveable: e.target.value})
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
                                value={this.state.LastServiceDate}
                                onChange={(e) =>
                                    this.setState({LastServiceDate: e.target.value})
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
                                    this.setState({NextServiceDate: e.target.value})
                                }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-sm-6">
                          <div className="form-group ">
                            <label>Is Rentable?</label>
                            <select
                                id="IsRentable"
                                className="form-control"
                                value={this.state.IsRentable}
                                onChange={(e) =>
                                    this.setState({IsRentable: e.target.value})
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
                                  value={this.state.AssetValue}
                                  onChange={(e) =>
                                      this.setState({AssetValue: parseFloat(e.target.value)||0})
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
                                    this.setState({Description: e.target.value})
                                }
                                placeholder="Description"
                                value={this.state.Description}
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
                                value={this.state.QRCode}
                                className="form-control"
                                onChange={(e) => this.setState({QRCode: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="form-group col-sm-6">
                          <label>Asset Status</label>
                          <select
                              id="status"
                              className="form-control"
                              value={this.state.status}
                              onChange={(e) =>
                                  this.setState({status: e.target.value})
                              }
                          >
                            <option value="" disabled>
                              Select an option
                            </option>
                            <option value="true">Functional</option>
                            <option value="false">Non-Functional</option>
                          </select>
                        </div>

                        <div className="form-group col-sm-6">
                          <label htmlFor="category">Asset Category:</label>
                          <input type="text" className="form-control" id="category" value={this.state.category}
                          onChange={(e) => this.setState({category: e.target.value})}/>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-sm-6">
                          <label htmlFor="location">Asset Location:</label>
                          <input type="location" className="form-control" id="status"
                                 value={this.state.location}
                                 onChange={(e) => this.setState({location: e.target.value})}/>
                        </div>
                        <div className="form-group col-sm-6">
                          <label>Asset Service Reminder</label>
                          <select
                              id="serviceReminderDay"
                              className="form-control"
                              value={this.state.serviceReminderDay}
                              onChange={(e) =>
                                  this.setState({serviceReminderDay: e.target.value})
                              }
                          >
                            <option value="" disabled>
                              No Reminder
                            </option>
                            <option value="1">One Day Prior</option>
                            <option value="7">One Week Prior</option>
                            <option value="15">15 Days Prior</option>
                            <option value="30">One Month Prior</option>
                          </select>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-sm-6">
                          <label>Asset Image</label>
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
                <ToastContainer/>
              </div>
        )}
                {(this.state.PageMode === "View") && (
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
            <div className="row">
              <div className="form-group col-sm-6">
                <label htmlFor="id">ID:</label>
                <input type="text" className="form-control" id="id" value={this.state.Id} readOnly/>
              </div>
              <div className="form-group col-sm-6">
                <label htmlFor="name">Asset Type:</label>
                <input type="text" className="form-control" id="name" value={this.state.AssetType} readOnly/>
              </div>
            </div>

            <div className="row">
              <div className="form-group col-sm-6">
                <label htmlFor="name">Name:</label>
                <input type="text" className="form-control" id="name" value={this.state.Name} readOnly/>
              </div>
              <div className="form-group col-sm-6">
                <label htmlFor="name">Asset Model:</label>
                <input type="text" className="form-control" id="name" value={this.state.AssetModel} readOnly/>
              </div>
            </div>

            <div className="row">
              <div className="form-group col-sm-6">
                <label htmlFor="isMovable">Is Moveable:</label>
                <input type="text" className="form-control" id="isMovable"
                       value={this.state.IsMoveable === true ? "Yes" : "No"} readOnly/>
              </div>
              <div className="form-group col-sm-6">
                <label htmlFor="isRentable">Is Rentable:</label>
                <input type="text" className="form-control" id="isRentable"
                       value={this.state.IsRentable === true ? "Yes" : "No"} readOnly/>
              </div>
            </div>

            <div className="row">
              <div className="form-group col-sm-6">
                <label htmlFor="description">Description:</label>
                <textarea className="form-control" id="description" value={this.state.Description} readOnly/>
              </div>
              <div className="form-group col-sm-6">
                <label htmlFor="qrCode">QR Code:</label>
                <input type="text" className="form-control" id="qrCode" value={this.state.QRCode} readOnly/>
              </div>

            </div>

            <div className="row">
              <div className="form-group col-sm-6">
                <label htmlFor="lastServiceDate">Last Service Date:</label>
                <input type="text" className="form-control" id="lastServiceDate" value={this.state.LastServiceDate}
                       readOnly/>
              </div>
              <div className="form-group  col-sm-6">
                <label htmlFor="nextServiceDate">Next Service Date:</label>
                <input type="text" className="form-control" id="nextServiceDate" value={this.state.NextServiceDate}
                       readOnly/>
              </div>

            </div>

            <div className="row">
              <div className="form-group col-sm-6">
                <label htmlFor="assetValue">Manufacturer:</label>
                <input type="text" className="form-control" id="assetValue" value={this.state.ManufacturerName}
                       readOnly/>
              </div>
              <div className="form-group col-sm-6">
                <label htmlFor="assetValue">Asset Value:</label>
                <input type="text" className="form-control" id="assetValue" value={`₹${this.state.AssetValue}`}
                       readOnly/>
              </div>
            </div>
            <div className="row">
              <div className="form-group col-sm-6">
                <label htmlFor="status">Status:</label>
                <input type="text" className="form-control" id="status"
                       value={this.state.status === true ? "Functional" : "Non-Functional"} readOnly/>
              </div>
              <div className="form-group col-sm-6">
                <label htmlFor="category">Asset Category:</label>
                <input type="text" className="form-control" id="category" value={this.state.category} readOnly/>
              </div>
            </div>
            <div className="row">
              <div className="form-group col-sm-6">
                <label htmlFor="location">Asset Location:</label>
                <input type="location" className="form-control" id="status"
                       value={this.state.location} readOnly/>
              </div>
            </div>

            <div className="row">
              <div className="form-group col-sm-6">
                <label htmlFor="assetImage">Asset Image:</label>
                <div>
                  <img
                      src={`data:image/png;base64,${this.state.AssetImage}`}
                      alt="Asset"
                      className="img-fluid"
                      style={{height: "400px", width: "500px"}}
                  />
                </div>

              </div>
              <div className="form-group col-sm-6">
                <label htmlFor="assetImage">AMC Contract:</label>
                <div>
                  <img
                      src={`data:image/png;base64,${this.state.AMCimage}`}
                      alt="AMC Document"
                      className="img-fluid"
                      style={{height: "400px", width: "500px"}}
                  />
                </div>
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

function mapStoreToprops(state, props) {
  return {
    PropertyId: state.Commonreducer.puidn,
  }
}

function mapDispatchToProps(dispatch) {
  const actions = bindActionCreators(departmentActions, dispatch);
  return {actions};
}

export default connect(mapStoreToprops, mapDispatchToProps)(AssetsMaster);
