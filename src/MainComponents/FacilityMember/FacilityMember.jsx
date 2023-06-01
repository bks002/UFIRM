import React from "react";
import DataGrid from "../../ReactComponents/DataGrid/DataGrid.jsx";
import Button from "../../ReactComponents/Button/Button";
import ApiProvider from "../FacilityMember/DataProvider.js";
import { ToastContainer, toast } from "react-toastify";
import * as appCommon from "../../Common/AppCommon.js";
import swal from "sweetalert";
import {
  CreateValidator,
  ValidateControls,
} from "../FacilityMember/Validation.js";
import CommonDataProvider from "../../Common/DataProvider/CommonDataProvider.js";
import MultiSelectInline from "../../ReactComponents/MultiSelectInline/MultiSelectInline.jsx";
import DropDownList from "../../ReactComponents/SelectBox/DropdownList.jsx";
import InputBox from "../../ReactComponents/InputBox/InputBox.jsx";
import DocumentBL from "../../ComponentBL/DocumentBL";
import {
  DELETE_CONFIRMATION_MSG,
  BLOCK_CONFIRMATION_MSG,
  UNBLOCK_CONFIRMATION_MSG,
} from "../../Contants/Common";
import DocumentUploader from "../../ReactComponents/FileUploader/DocumentUploader.jsx";
import SelectBox from "../../ReactComponents/SelectBox/Selectbox.jsx";
import UrlProvider from "../../Common/ApiUrlProvider.js";
import axios from "axios";
import ImageUploader from "react-images-upload";
import * as appCommonJs from "../../Common/AppCommon.js";
import "./FacilityMember.css";

import { connect } from "react-redux";
import departmentAction from "../../redux/department/action";
import { convertEsTojson, promiseWrapper } from "../../utility/common";
import { bindActionCreators } from "redux";

const $ = window.$;
const documentBL = new DocumentBL();

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(","));
    reader.onerror = (error) => reject(error);
  });

class FacilityMember extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Pictures: null,
      PageMode: "Home",
      FacilityMemberId: "0",
      PropertyId: 0,
      ProfileImageUrl: "",
      Name: "",
      Contact: "",
      Address: "",
      FacilityMasterId: "0",
      FacilityMaster: [],
      PropertyTowerId: "0",
      PropertyTowersData: [],
      PropertyFloorId: "0",
      PropertyFloors: [],
      PropertyFlatId: "0",
      PropertyFlat: [],
      FacilityMemberDocumentId: "0",
      FacilityMemberId: "0",
      documentTypeId: "0",
      DocumentTypeName: "",
      Gender: "0",
      GenderList: [],
      Filter: [],
      FilterValue: "All",
      PropertyDetailsIds: [],
      pageSize: 10,
      pageNumber: 1,
      Image: "",
      gridFacilityMemberHeader: [
        { sTitle: "Id", titleValue: "sNo", orderable: false }, //"visible": true
        // { sTitle: 'Image', titleValue: 'Image', ImagePath: 'profileImageUrl', Index: '0' },
        { sTitle: "Name", titleValue: "name" },
        { sTitle: "Gender", titleValue: "gender" },
        { sTitle: "Contact", titleValue: "mobileNumber" },
        { sTitle: "Facility Type", titleValue: "facilityName" },
        {
          sTitle: "Access",
          titleValue: "ToggleSwitch",
          Value: "accessCode",
          Index: "0",
          Width: "70",
        },
        // { sTitle: 'Status', titleValue: 'IsBlocked', Value: 'isBlocked', Value2: 'isApproved', Index: '0' },
        { sTitle: "Status", titleValue: "status" },
        // { sTitle: 'Approved On', titleValue: 'approvedOn' },
        {
          sTitle: "Action",
          titleValue: "Action",
          Action: "Edit&Delete&Block",
          Index: "0",
          orderable: false,
        },
      ],
      gridFacilityMemberData: [],
      gridDocumentHeader: [
        {
          sTitle: "Id",
          titleValue: "facilityMemberDocumentId",
          orderable: false,
        },
        {
          sTitle: "Document Type",
          titleValue: "documentTypeName",
          orderable: false,
        },
        // { sTitle: 'Document Name', titleValue: 'documentName', "orderable": false, },
        {
          sTitle: "Action",
          titleValue: "Action",
          Action: "Edit&View",
          Index: "0",
          urlIndex: "3",
          orderable: false,
        },
      ],
      addDocumentHeader: [
        {
          sTitle: "Id",
          titleValue: "id",
          orderable: false,
        },
        {
          sTitle: "Document Type",
          titleValue: "documentTypeName",
          orderable: false,
        },
        // { sTitle: 'Document Name', titleValue: 'documentName', "orderable": false, },
        {
          sTitle: "Action",
          titleValue: "Action",
          Action: "View&Delete",
          Index: "0",
          urlIndex: "3",
          orderable: false,
        },
      ],
      gridDocumentData: [],
      kycDocumentData: [],
      kycDocumentType: "",
      grdTotalRows: 0,
      grdTotalPages: 0,
      //Document file
      DocumentType: [],
      documentType: [],
      documentName: "",
      DocumentNumber: "",
      selectedFile: undefined,
      selectedFileName: undefined,
      imageSrc: undefined,
      value: "",
      Showimguploader: false,
      isServiceStaff: "Staff",
      FacilityTypeId: 2,
      documentVal: "",
      currentSelectedFile: null,
      ImageData: [],
      FileData: [],
      File: "",
      FileExt: "",
      addKYCData : [],
      gridAddKYCData : [],
      showDocfile:""
    };
    this.onDrop = this.onDrop.bind(this);
    this.removeImage = this.removeImage.bind(this);
    this.ApiProviderr = new ApiProvider();
    this.comdbprovider = new CommonDataProvider();
  }

  componentDidMount() {
    documentBL.CreateValidator();
    this.setState({ PropertyId: this.props.PropertyId, pageNumber: 1 }, () => {
      this.loadPropertyTowers(this.props.PropertyId);
      this.loadGender();
      this.getDocumentType();
      this.getFacilityMember("All");
      this.loadFilter();
    });
    $("#grdFacilityMember").find("[aria-label=Action]").addClass("addWidth");
  }
  componentDidUpdate(prevProps) {
    //
    if (prevProps.PropertyId !== this.props.PropertyId) {
      this.setState(
        { PropertyId: this.props.PropertyId, pageNumber: 1 },
        () => {
          this.loadPropertyTowers(this.props.PropertyId);
          this.loadGender();
          this.getDocumentType();
          this.getFacilityMember("All");
          this.loadFilter();
        }
      );
    }
  }

  loadGender() {
    let gender = [
      { Value: "Male", Name: "Male" },
      { Value: "Female", Name: "Female" },
      { Value: "Other", Name: "Other" },
    ];
    this.setState({ GenderList: gender });
  }

  loadFilter() {
    let value = [
      { Value: "All", Name: "All" },
      { Value: "Active", Name: "Active" },
      { Value: "Pending", Name: "Pending" },
      { Value: "Blocked", Name: "Blocked" },
      { Value: "Old", Name: "Old" },
    ];
    this.setState({ Filter: value });
  }

  getFacilityMember(value) {
    var type = "R";
    var model = this.getModel(type, value);
    this.manageFacilityMember(model, type);
  }

  getFacilityType() {
    this.comdbprovider.getFacilityType().then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          rData = appCommon.changejsoncolumnname(rData, "id", "Value");
          rData = appCommon.changejsoncolumnname(rData, "text", "Name");
          this.setState({ FacilityType: rData });

          let data = [{ Id: "All", Name: "All" }];
          rData.map((item) => {
            data.push(item);
          });
          this.setState({ FilterFacilityType: data });
        });
      }
    });
  }

  getFacilityMaster(id) {
    this.comdbprovider.getFacilityMaster(id).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          rData = appCommon.changejsoncolumnname(rData, "id", "Value");
          rData = appCommon.changejsoncolumnname(rData, "text", "Name");
          this.setState({ FacilityMaster: rData });
        });
      }
    });
  }

  getDocumentType() {
    this.comdbprovider.getDocumentType(0).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          rData = appCommon.changejsoncolumnname(rData, "documentTypeId", "Id");
          rData = appCommon.changejsoncolumnname(
            rData,
            "documentTypeName",
            "Name"
          );
          let documentTypeData = [{ Id: "0", Name: "Select Document Type" }];
          rData.forEach((element) => {
            documentTypeData.push({
              Id: element.Id.toString(),
              Name: element.Name,
            });
          });
          this.setState({ DocumentType: documentTypeData });
        });
      }
    });
  }

  loadPropertyTowers(id) {
    this.comdbprovider.getPropertyTowers(id).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          rData = appCommon.changejsoncolumnname(rData, "id", "Value");
          rData = appCommon.changejsoncolumnname(rData, "text", "Name");
          this.setState({ PropertyTowersData: rData });
        });
      }
    });
  }

  loadPropertyFlat(id) {
    this.comdbprovider.getPropertyFlat(id).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          rData = appCommon.changejsoncolumnname(rData, "id", "Value");
          rData = appCommon.changejsoncolumnname(rData, "text", "Name");
          this.setState({ PropertyFlat: rData });
        });
      }
    });
  }

  manageFacilityMember = (model, type) => {
    this.ApiProviderr.manageFacilityMember(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          switch (type) {
            case "U":
              appCommon.showtextalert(
                "Facility Member Saved Successfully!",
                "",
                "success"
              );
              this.handleCancel();
              break;
            case "D":
              appCommon.showtextalert(
                "Facility Member Deleted Successfully!",
                "",
                "success"
              );
              this.handleCancel();
              break;
            case "B":
              if (model[0].isBlocked) {
                appCommon.showtextalert(
                  "Facility Member Update Unblock Successfully!",
                  "",
                  "success"
                );
              } else {
                appCommon.showtextalert(
                  "Facility Member Update Block Successfully!",
                  "",
                  "success"
                );
              }
              this.handleCancel();
              break;
            case "R":
              rData.facilityMember.map((item,index)=>{
                item['sNo']=index+1;
            })
              this.setState({ grdTotalPages: rData.totalPages });
              this.setState({ grdTotalRows: rData.totalRows });
              this.setState({ gridFacilityMemberData: rData.facilityMember });
              break;
            default:
          }
        });
      }
    });
  };

  addNew() {
    this.setState({ PageMode: "Add", Showimguploader: false }, () => {
      CreateValidator();
      documentBL.CreateValidator();
    });

    this.getModel("C");

    //load gender
    this.loadGender();
    this.setState({ PropertyId: this.state.PropertyId });

    //load tower
    this.loadPropertyTowers(this.state.PropertyId);
        //load documents panel
        this.getDocumentType();
        $("#grdFacilityMember").find("[aria-label=Action]").addClass("addWidth");
        let arrayCopy = [...this.state.DocumentType];
        this.setState({ documentType: arrayCopy });
        this.setState({ documentTypeId: "0" });
        this.getFacilityMaster(parseInt(this.state.FacilityTypeId));
  }

  addDocs() {
    this.setState({ PageMode: "AddDocs" }, () => {
      CreateValidator();
      documentBL.CreateValidator();
    });

    //load documents panel
    this.getDocumentType();
    $("#grdFacilityMember").find("[aria-label=Action]").addClass("addWidth");
    let arrayCopy = [...this.state.DocumentType];
    this.setState({ documentType: arrayCopy });
    this.setState({ documentTypeId: "0" });
    this.getFacilityMaster(parseInt(this.state.FacilityTypeId));
  }

  uploadDocs() {
    this.setState({ PageMode: "UploadDocs" }, () => {
      CreateValidator();
      documentBL.CreateValidator();
    });

    //load documents panel
    this.getDocumentType();
    $("#grdFacilityMember").find("[aria-label=Action]").addClass("addWidth");
    let arrayCopy = [...this.state.DocumentType];
    this.setState({ documentType: arrayCopy });
    this.setState({ documentTypeId: "0" });
  }

  onPagechange = (page) => {
    this.setState({ pageNumber: page }, () => {
      this.getFacilityMember(this.state.FilterValue);
    });
  };

  onDrop(pictureFiles, pictureDataURLs) {
    this.setState({ Pictures: pictureFiles });
  }

  onGridDelete = (Id) => {
    var rowData = this.findByRowId(Id)
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
          var model = [{ facilityMemberId: parseInt(rowData.facilityMemberId) }];
          this.manageFacilityMember(model, "D");
          break;
        case "cancel":
          break;
        default:
          break;
      }
    });
  };

  onDocDelete = (Id) => {
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
          this.setState({
            gridAddKYCData : this.state.gridAddKYCData.filter((item) => item.id !== Id),
          })
          break;
        case "cancel":
          break;
        default:
          break;
      }
    });
  };

  onDocView = (Id) => {
    this.setState({ PageMode: "docView" }, () => {
    var doc = this.state.gridAddKYCData.find((item) => item.id == Id);
    this.setState({ showDocfile: doc.docURl });
    })
  }

  onGridBlock = (Id) => {
    let val = this.findByRowId(parseInt(Id)).isBlocked;
    let myhtml = document.createElement("div");
    myhtml.innerHTML = BLOCK_CONFIRMATION_MSG + "</hr>";
    if (val) myhtml.innerHTML = UNBLOCK_CONFIRMATION_MSG + "</hr>";

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
          var model = [{ facilityMemberId: parseInt(Id), isBlocked: val }];
          this.manageFacilityMember(model, "B");
          break;
        case "cancel":
          break;
        default:
          break;
      }
    });
  };

  async ongridedit(Id) {
    this.setState({ PageMode: "Edit", Showimguploader: false }, () => {
      CreateValidator();
      documentBL.CreateValidator();
    });
    this.loadGender();
    var rowData = this.findByRowId(Id);
    this.setState({ FacilityMemberId: rowData.facilityMemberId });
    this.setState({ ProfileImageUrl: rowData.profileImageUrl });
    // if(rowData.profileImageUrl != null && rowData.profileImageUrl != ""){
    //     this.state.gridDocumentData.push({
    //         "facilityMemberDocumentId": 0,
    //         "facilityMemberId": 0,
    //         "documentTypeId": 0,
    //         "documentTypeName": "Profile Image",
    //         "documentName": rowData.profileImageUrl,
    //         "documentUrl": rowData.profileImageUrl,
    //     })
    // }
    this.setState({ Name: rowData.name });
    this.setState({ Contact: rowData.mobileNumber });
    this.setState({ Address: rowData.address });
    $("#ddlGender").val(rowData.gender);
    this.setState({ Gender: rowData.gender });

    this.comdbprovider
      .getFacilityMaster(this.state.FacilityTypeId)
      .then((resp) => {
        if (resp.ok && resp.status == 200) {
          return resp.json().then((rData) => {
            rData = appCommon.changejsoncolumnname(rData, "id", "Value");
            rData = appCommon.changejsoncolumnname(rData, "text", "Name");
            this.setState(
              {
                FacilityMaster: rData,
                FacilityMasterId: rowData.facilityMasterId,
              },
              () => {
                $("#ddlFacilityMaster").val(rowData.facilityMasterId);
              }
            );
          });
        }
      });

    if (rowData.facilityTypeId == 1) {
      //load tower
      this.loadPropertyTowers(this.state.PropertyId);
      let dataValue = [];
      rowData.facilityMemberPropertyAssignmentList.map((item) => {
        dataValue.push({
          Id: item.value,
          Name: item.name,
          value: item.name,
          label: item.name,
          color: "#0052CC",
        });
      });
      this.onDropdownChanges("PropertyDetails", dataValue);
    }

    //Document Grid
    this.getDocumentType();

    let arrayCopy = [...this.state.DocumentType];
    this.state.gridDocumentData = [];
    rowData.facilityMemberDocumentList.map((item) => {
      this.removeByAttr(arrayCopy, "Id", item.documentTypeId.toString());
    });
    this.setState({ documentType: arrayCopy });
    this.setState({ documentTypeId: "0" });
    this.setState({
      gridDocumentData: [
        ...this.state.gridDocumentData,
        ...rowData.facilityMemberDocumentList,
      ],
    });
  }

  async ongridShow(Id) {
    this.setState({ PageMode: "Edit", Showimguploader: false }, () => {
      CreateValidator();
      documentBL.CreateValidator();
    });
    this.loadGender();
    var rowData = this.findByRowId(Id);
    this.setState({ FacilityMemberId: rowData.facilityMemberId });
    this.setState({ ProfileImageUrl: rowData.profileImageUrl });
    this.setState({ Name: rowData.name });
    this.setState({ Contact: rowData.mobileNumber });
    this.setState({ Address: rowData.address });
    $("#ddlGender").val(rowData.gender);
    this.setState({ Gender: rowData.gender });

    this.comdbprovider
      .getFacilityMaster(this.state.FacilityTypeId)
      .then((resp) => {
        if (resp.ok && resp.status == 200) {
          return resp.json().then((rData) => {
            rData = appCommon.changejsoncolumnname(rData, "id", "Value");
            rData = appCommon.changejsoncolumnname(rData, "text", "Name");
            this.setState(
              {
                FacilityMaster: rData,
                FacilityMasterId: rowData.facilityMasterId,
              },
              () => {
                $("#ddlFacilityMaster").val(rowData.facilityMasterId);
              }
            );
          });
        }
      });

    if (rowData.facilityTypeId == 1) {
      //load tower
      this.loadPropertyTowers(this.state.PropertyId);
      let dataValue = [];
      rowData.facilityMemberPropertyAssignmentList.map((item) => {
        dataValue.push({
          Id: item.value,
          Name: item.name,
          value: item.name,
          label: item.name,
          color: "#0052CC",
        });
      });
      this.onDropdownChanges("PropertyDetails", dataValue);
    }

    //Document Grid
    this.getDocumentType();

    let arrayCopy = [...this.state.DocumentType];
    rowData.facilityMemberDocumentList.map((item) => {
      this.removeByAttr(arrayCopy, "Id", item.documentTypeId.toString());
    });
    this.setState({ documentType: arrayCopy });
    this.setState({ documentTypeId: "0" });
  }

  findItem(id) {
    return this.state.gridFacilityMemberData.find((item) => {
      if (item.facilityMemberId == id) {
        return item;
      }
    });
  }

  findByRowId(id) {
    return this.state.gridFacilityMemberData.find((item) => {
      if (item.sNo == id) {
        return item;
      }
    });
  }

  getModel = (type, value) => {
    var model = [];
    switch (type) {
      case "R":
        model.push({
          SearchValue: "NULL",
          PropertyId: parseInt(this.state.PropertyId),
          PageSize: this.state.pageSize,
          PageNumber: this.state.pageNumber,
          Filter: this.state.FilterValue,
          FacilityType: this.state.isServiceStaff,
        });
        break;
      case "U":
        model.push({
          Name: this.state.Name,
          Contact: this.state.Contact,
          Address: this.state.Address,
          FacilityTypeId: this.state.FacilityTypeId,
          FacilityMasterId: this.state.FacilityMasterId,
          PropertyTowerId: this.state.PropertyTowerId,
          PropertyFloorId: this.state.PropertyFloorId,
          PropertyFlatId: this.state.PropertyFlatId,
          Gender: this.state.Gender,
        });
        break;
      case "C":
        this.setState({ Pictures: null, ProfileImageUrl: "" });
        this.setState({ Name: "", Contact: "", Address: "" });
        this.setState({ FacilityMemberId: "0" });
        this.setState({ FacilityMasterId: "0", FacilityMaster: [] });
        this.setState({ PropertyTowerId: "0", PropertyTowersData: [] });
        this.setState({ PropertyFloorId: "0", PropertyFloors: [] });
        this.setState({ PropertyFlatId: "0", PropertyFlat: [] });
        this.setState({ Gender: "0" });
        this.setState({ gridFacilityMemberData: [], gridDocumentData: [] });
        this.setState({
          documentType: [],
          documentTypeId: "0",
          documentName: "",
        });
        this.removeImage();
        break;
      default:
    }
    return model;
  };

  handleSave = (saveType) => {
      let url = new UrlProvider().MainUrl;
      if (ValidateControls()) {
          const formData = new FormData();
          formData.append("propertyId", this.props.PropertyId);
          formData.append("name", this.state.Name);
          formData.append("mobileNumber", this.state.Contact);
          formData.append("address", this.state.Address);
          formData.append("gender", this.state.Gender);
          formData.append("facilityMasterId", this.state.FacilityMasterId);
          formData.append("saveType", saveType);
          this.state.gridAddKYCData.map((item,index) => {
              formData.append(`fileData[${index}].file`, item.file);
              formData.append(`fileData[${index}].DocumentTypeId`, item.documentTypeId);
              formData.append(`fileData[${index}].DocumentNumber`, item.documentNumber);
              formData.append(`fileData[${index}].DocumentName`, item.documentName);
          });
          formData.append('document', JSON.stringify(this.state.gridAddKYCData));
          if (this.state.FacilityTypeId == 1 && this.state.PropertyDetailsIds.length > 0) {
              if (this.state.gridAddKYCData.length > 0) {
                  this.ApiProviderr.saveFacilityMember(formData)
                      .then(res => {
                          if (res.data <= 0) {
                              appCommon.ShownotifyError("Facility Member Contact is already created");
                          }
                          else {
                              if (this.props.PageMode != "Edit") {
                                  appCommon.showtextalert("Facility Member Created Successfully", "", "success");
                              }
                              else {
                                  appCommon.showtextalert("Facility Member Updated Successfully", "", "success");
                              }
                              this.handleCancel();
                          }
                      });
              }
              else
                  appCommon.showtextalert("At least one document is required", "", "error");
          }
          else if (this.state.FacilityTypeId == 2) {
              if (this.state.gridAddKYCData.length > 0) {
                  this.ApiProviderr.saveFacilityMember(formData)
                      .then(res => {
                          if (res.data <= 0) {
                              appCommon.ShownotifyError("Facility Member Contact is already created");
                          }
                          else {
                              if (this.props.PageMode != "Edit") {
                                  appCommon.showtextalert("Facility Member Created Successfully", "", "success");
                              }
                              else {
                                  appCommon.showtextalert("Facility Member Updated Successfully", "", "success");
                              }
                              this.handleCancel();
                          }
                      });
              }
              else
                  appCommon.showtextalert("At least one document is required", "", "error");
          }
          else {
              appCommon.showtextalert("At least one flat is required", "", "error");
          }
      }
  }

  getFacilityModel = (type, value) => {
    var model = [];
    switch (type) {
      case "C":
        model.push({
          propertyId: parseInt(this.props.PropertyId),
          name: this.state.Name,
          mobileNumber: this.state.Contact,
          address: this.state.Address,
          gender: this.state.Gender,
          facilityMasterId: this.state.FacilityMasterId,
          fileData : this.state.gridAddKYCData,
        });
        break;
        case "U":
          model.push({
            facilityMemberId: parseInt(this.state.FacilityMemberId),
            propertyId: parseInt(this.props.PropertyId),
            name: this.state.Name,
            mobileNumber: this.state.Contact,
            address: this.state.Address,
            gender: this.state.Gender,
            facilityMasterId: this.state.FacilityMasterId,
          });
          break;
      case "R":
        model.push({
          CmdType: type,
        });
        break;
      case "Upload":
        model.push({
          FacilityMemberId: this.state.FacilityMemberId,
          Document: JSON.stringify(this.state.kycDocumentData),
        });
        break;
      case "DeleteFile":
        model.push({
          FacilityMemberDocumentId: value,
        });
      default:
    }
    return model;
  };

  // handleSave = async (e) => {
  //   e.currentTarget.disabled = true;
  //   if (ValidateControls()) {
  //     if (
  //       this.state.FacilityTypeId == 1 &&
  //       this.state.PropertyDetailsIds.length > 0
  //     ) {
  //       var type = "C";
  //       var model = this.getFacilityModel(type);
  //       console.log(model)
  //       this.ApiProviderr.manageFacilityMember(model, type).then((res) => {
  //         if (res.data <= 0) {
  //           appCommon.ShownotifyError(
  //             "Facility Member Contact is already created"
  //           );
  //         } else {
  //           if (this.props.PageMode != "Edit") {
  //             appCommon.showtextalert(
  //               "Facility Member Created Successfully",
  //               "",
  //               "success"
  //             );
  //           } else {
  //             appCommon.showtextalert(
  //               "Facility Member Updated Successfully",
  //               "",
  //               "success"
  //             );
  //           }
  //           this.handleCancel();
  //         }
  //       });
  //     } else if (this.state.FacilityTypeId == 2) {
  //       var type = "C";
  //       var model = this.getFacilityModel(type);
  //       console.log(model)
  //       this.ApiProviderr.manageFacilityMember(model, type).then((res) => {
  //         if (res.data <= 0) {
  //           appCommon.ShownotifyError(
  //             "Facility Member Contact is already created"
  //           );
  //         } else {
  //           if (this.props.PageMode != "Edit") {
  //             appCommon.showtextalert(
  //               "Facility Member Created Successfully",
  //               "",
  //               "success"
  //             );
  //           } else {
  //             appCommon.showtextalert(
  //               "Facility Member Updated Successfully",
  //               "",
  //               "success"
  //             );
  //           }
  //           this.handleCancel();
  //         }
  //       });
  //     } else {
  //       appCommon.showtextalert("At least one flat is required", "", "error");
  //     }
  //   }

  //   // this.state.ImageData="";
  //   // this.state.Image="";
  //   // this.state.ImageExt="";
  // };

  handleEdit = async (e) => {
    e.currentTarget.disabled = true;
    if (ValidateControls()) {
      if (
        this.state.FacilityTypeId == 1 &&
        this.state.PropertyDetailsIds.length > 0
      ) {
        var type = "U";
        var model = this.getFacilityModel(type);
        this.ApiProviderr.manageFacilityMember(model, type).then((res) => {
          if (res.data <= 0) {
              appCommon.showtextalert(
                "Facility Member Updated Successfully",
                "",
                "success"
              );
            this.handleCancel();
          }
        });
      } else if (this.state.FacilityTypeId == 2) {
        var type = "U";
        var model = this.getFacilityModel(type);
        this.ApiProviderr.manageFacilityMember(model, type).then((res) => {
          if (res.data <= 0) {
            appCommon.ShownotifyError(
              "Facility Member Contact is already created"
            );
          } else {
            if (this.props.PageMode != "Edit") {
              appCommon.showtextalert(
                "Facility Member Created Successfully",
                "",
                "success"
              );
            } else {
              appCommon.showtextalert(
                "Facility Member Updated Successfully",
                "",
                "success"
              );
            }
            this.handleCancel();
          }
        });
      } else {
        appCommon.showtextalert("At least one flat is required", "", "error");
      }
    }
  };
  addFile = async (e) => {
    e.currentTarget.disabled = true;
    this.state.addKYCData = [];
    let upfile = this.state.ImageData;
    let fileD = await toBase64(upfile);
    this.state.addKYCData.push({
      id:this.state.gridAddKYCData.length+1,
      //Have to implement a formData
      file:this.state.ImageData,
      documentTypeId: parseInt(this.state.documentTypeId),
      documentTypeName: this.state.DocumentTypeName,
      documentNumber: this.state.DocumentNumber,
      docURl : fileD[1],
    });
    console.log(this.state.addKYCData)
    this.setState({
      gridAddKYCData: [
        ...this.state.gridAddKYCData,
        ...this.state.addKYCData,
      ],
    });
    console.log(this.state)
    this.handleCancelAddUpload()
  };

  uploadFile = async (e) => {
    e.currentTarget.disabled = true;
    let UpFile = this.state.ImageData;
    let res = null;
    if (UpFile) {
      if (UpFile != "") {
        let fileD = await toBase64(UpFile);
        var imgbytes = UpFile.size; // Size returned in bytes.
        var imgkbytes = Math.round(parseInt(imgbytes) / 1024); // Size returned in KB.
        let extension = UpFile.name.substring(UpFile.name.lastIndexOf(".") + 1);
        res = {
          filename: UpFile.name,
          filepath: fileD[1],
          sizeinKb: imgkbytes,
          fileType: fileD[0],
          extension: extension.toLowerCase(),
        };
        this.state.ImageFileName = UpFile.name;
        this.state.Image = fileD[1];
        this.state.ImageExt = extension;
        this.state.kycDocumentData = [];
        this.state.kycDocumentData.push({
          facilityMemberDocumentId: 0,
          facilityMemberId: this.state.FacilityMemberId,
          documentTypeId: parseInt(this.state.documentTypeId),
          documentTypeName: this.state.DocumentTypeName,
          documentName: res.filename,
          documentUrl: res.filepath,
          documentNumber: this.state.DocumentNumber,
        });
        this.setState({
          gridDocumentData: [
            ...this.state.gridDocumentData,
            ...this.state.kycDocumentData,
          ],
        });
      }
    }
    let url = new UrlProvider().MainUrl;
    if (ValidateControls()) {
      var type = "Upload";
      var model = this.getFacilityModel(type);
      this.ApiProviderr.manageFacilityMember(model, type).then((res) => {
        if (res.data == "Success") {
          appCommon.ShownotifyError("File Uploaded Successfully");
        }
        this.handleSaveUpload()
      });
    }

    this.state.ImageData = "";
    this.state.Image = "";
    this.state.ImageExt = "";
  };

  updateFile = async (e) => {
    e.currentTarget.disabled = true;

    let UpFile = this.state.ImageData;
    let res = null;
    if (UpFile) {
      if (UpFile != "") {
        let fileD = await toBase64(UpFile);
        var imgbytes = UpFile.size; // Size returned in bytes.
        var imgkbytes = Math.round(parseInt(imgbytes) / 1024); // Size returned in KB.
        let extension = UpFile.name.substring(UpFile.name.lastIndexOf(".") + 1);
        res = {
          filename: UpFile.name,
          filepath: fileD[1],
          sizeinKb: imgkbytes,
          fileType: fileD[0],
          extension: extension.toLowerCase(),
        };
        this.state.ImageFileName = UpFile.name;
        this.state.Image = fileD[1];
        this.state.ImageExt = extension;
        this.state.kycDocumentData.push({
          facilityMemberDocumentId: this.state.FacilityMemberDocumentId,
          facilityMemberId: this.state.FacilityMemberId,
          documentTypeId: this.state.documentTypeId,
          documentTypeName: this.state.DocumentTypeName,
          documentName: res.filename,
          documentUrl: res.filepath,
          documentNumber: this.state.DocumentNumber,
        });
        this.state.gridDocumentData.forEach((item, index) => {
          if (
            item.facilityMemberDocumentId == this.state.FacilityMemberDocumentId
          ) {
            this.state.gridDocumentData[index].documentUrl =
              this.state.gridDocumentData[index].documentUrl.split(
                "FacilityMemberDocuments/"
              )[0] +
              "FacilityMemberDocuments/" +
              res.filename;
          }
        });
      }
    }
    let url = new UrlProvider().MainUrl;
    if (ValidateControls()) {
      var type = "Upload";
      var model = this.getFacilityModel(type);
      this.ApiProviderr.manageFacilityMember(model, type).then((res) => {
        if (res.data == "Success") {
          appCommon.ShownotifyError("File Uploaded Successfully");
        }
        this.handleCancelUpload();
      });
    }

    this.state.ImageData = "";
    this.state.Image = "";
    this.state.ImageExt = "";
  };

  handleCancel = () => {
    this.setState({ PageMode: "Home" }, () => {
      this.getFacilityMember(this.state.FilterValue);
      this.state.gridAddKYCData = [];
    });
  };

  handleCancelAddUpload = () => {
    this.state.ImageData = "";
    this.addNew();
  };

  handleCancelUpload = () => {
    this.setState({ PageMode: "Edit" }, () => {
      this.state.gridDocumentData = [];
      var rowId = this.state.gridFacilityMemberData.find((item)=>{
        return item.facilityMemberId == this.state.FacilityMemberId
      })
      this.ongridedit(rowId.sNo);
    });
  };

  handleSaveUpload = () => {
    this.setState({ PageMode: "Edit" },()=>{
      var rowId = this.state.gridFacilityMemberData.find((item)=>{
        return item.facilityMemberId == this.state.FacilityMemberId
      })
      this.ongridShow(rowId.sNo)
    });
  };

  handleDeleteFile = () => {
    this.setState({ PageMode: "AddDocs" });
  };

  onSelected(name, value) {
    switch (name) {
      case "DocumentType":
        this.state.documentType.find((item) => {
          if (item.Id == value) {
            this.setState({ DocumentTypeName: item.Name });
            this.setState({ documentTypeId: item.Id });
          }
        });
        break;
      case "Filter":
        this.setState({ FilterValue: value, pageNumber: 1 }, () => {
          this.getFacilityMember(value);
        });
        break;
      // case "FilterFacilityType":
      //     this.setState({ FilterFacilityTypeValue: value, pageNumber: 1 }, () => {
      //         this.getFacilityMember(this.state.FilterValue);
      //     });
      //     break;
      default:
    }
  }

  removeImage() {
    this.setState({
      selectedFile: undefined,
      selectedFileName: undefined,
      imageSrc: undefined,
      value: "",
    });
  }

  // onFileChange(event) {
  //     if (event.target.files[0]) {
  //         this.setState({
  //             selectedFile: event.target.files[0],
  //             selectedFileName: event.target.files[0].name,
  //             imageSrc: window.URL.createObjectURL(event.target.files[0]),
  //             value: event.target.value,
  //         });
  //     }
  // };

  onFileChange(event) {
    let _validFileExtensions = ["jpg", "jpeg", "png", "pdf"];
    if (event.target.files[0]) {
      let extension = event.target.files[0].name.substring(
        event.target.files[0].name.lastIndexOf(".") + 1
      );
      let isvalidFiletype = _validFileExtensions.some(
        (x) => x === extension.toLowerCase()
      );
      if (isvalidFiletype) {
        this.state.FileData = event.target.files[0];
      } else {
        this.setState({ documentVal: "", currentSelectedFile: null });
        let temp_validFileExtensions = _validFileExtensions.join(",");
        appCommon.showtextalert(
          `${event.target.files[0].name.filename} Invalid file type, Please Select only ${temp_validFileExtensions} `,
          "",
          "error"
        );
      }
    }
  }

  onImageChange(event) {
    let _validFileExtensions = ["jpg", "jpeg", "png", "pdf"];
    if (event.target.files[0]) {
      let extension = event.target.files[0].name.substring(
        event.target.files[0].name.lastIndexOf(".") + 1
      );
      let isvalidFiletype = _validFileExtensions.some(
        (x) => x === extension.toLowerCase()
      );
      if (isvalidFiletype) {
        this.state.ImageData = event.target.files[0];
      } else {
        this.setState({ documentVal: "", currentSelectedFile: null });
        let temp_validFileExtensions = _validFileExtensions.join(",");
        appCommon.showtextalert(
          `${event.target.files[0].name.filename} Invalid file type, Please Select only ${temp_validFileExtensions} `,
          "",
          "error"
        );
      }
    }
  }

  compareBy(key) {
    return function (a, b) {
      if ("" + a[key] < "" + b[key]) return -1;
      if ("" + a[key] > "" + b[key]) return 1;
      return 0;
    };
  }

  handleDocSave = async () => {
    if (documentBL.ValidateControls() == "") {
      let UpFile = this.state.FileData;
      let res = null;
      if (UpFile) {
        if (UpFile != "") {
          let fileD = await toBase64(UpFile);
          var imgbytes = UpFile.size; // Size returned in bytes.
          var imgkbytes = Math.round(parseInt(imgbytes) / 1024); // Size returned in KB.
          let extension = UpFile.name.substring(
            UpFile.name.lastIndexOf(".") + 1
          );
          res = {
            filename: UpFile.name,
            filepath: fileD[1],
            sizeinKb: imgkbytes,
            fileType: fileD[0],
            extension: extension.toLowerCase(),
          };
          this.state.File = fileD[1];
          this.state.FileExt = extension;
        }
      }
      let documentTypeName = this.state.documentType.find((item) => {
        return item.Id == this.state.documentTypeId;
      }).Name;
      this.setState({
        documentType: this.removeByAttr(
          this.state.documentType,
          "Id",
          this.state.documentTypeId
        ),
      });
      let gridDocumentData = this.state.gridDocumentData;
      gridDocumentData.push({
        facilityMemberDocumentId: 0,
        // propertyMemberDocumentId: 0,
        documentTypeId: this.state.documentTypeId,
        documentTypeName: documentTypeName,
        documentName: UpFile.name,
        documentNumber: this.state.documentName,
        documentFileName: this.state.selectedFileName,
        documentUrl: this.state.File,
        documentExt: this.state.FileExt,
        selectedFile: this.state.selectedFile,
      });
      this.setState({ gridDocumentData: gridDocumentData });
      //clear object
      this.setState({
        documentName: " ",
        documentTypeName: " ",
        documentTypeId: 0,
        selectedFile: undefined,
        selectedFileName: undefined,
        File: "",
        FileExt: "",
      });
      this.removeImage();
    }
  };

  onDocumentGridData(gridLink) {
    window.open(gridLink);
  }

  onDocumentGridDelete(gridId) {
    let myhtml = document.createElement("div");
    //myhtml.innerHTML = "Save your changes otherwise all change will be lost! </br></br> Are you sure want to close this page?" + "</hr>"
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
          this.setState({
            gridDocumentData: this.removeByAttr(
              this.state.gridDocumentData,
              "facilityMemberDocumentId",
              gridId
            ),
          });

          //dropdown
          let documentType = this.state.documentType;
          this.state.documentType.map((item) => {
            if (item.Id == gridId) documentType.push(item);
          });
          let arrayCopy = [...this.state.documentType];
          arrayCopy.sort(this.compareBy("Id"));
          this.setState({ documentType: arrayCopy });
          this.setState({ documentTypeId: "0" });
          appCommon.showtextalert(
            "Document Deleted Successfully",
            "",
            "success"
          );
          break;
        case "cancel":
          //do nothing
          break;
        default:
          break;
      }
    });
  }

  onKYCDocumentDelete(docId) {
    let data = this.state.gridDocumentData.find(
      (x) => x.facilityMemberDocumentId === docId
    );
    this.setState({
      PageMode: "UpdateDocs",
      documentTypeId: data.documentTypeId,
      FacilityMemberDocumentId: data.facilityMemberDocumentId,
    });
  }

  removeByAttr(arr, attr, value) {
    var i = arr.length;
    while (i--) {
      if (
        arr[i] &&
        arr[i].hasOwnProperty(attr) &&
        arguments.length > 2 &&
        arr[i][attr] === value
      ) {
        arr.splice(i, 1);
      }
    }
    return arr;
  }

  updateData = (name, value) => {
    switch (name) {
      case "Name":
        this.setState({ Name: value });
        break;
      case "Contact":
        this.setState({ Contact: value });
        break;
      case "Address":
        this.setState({ Address: value });
        break;
      case "DocumentName":
        this.setState({ documentName: value });
        break;
      case "DocumentNumber":
        this.setState({ DocumentNumber: value });
        break;
      default:
    }
  };

  onDropdownChanges = (value, id) => {
    switch (value) {
      case "Gender":
        this.setState({ Gender: id });
        break;
      case "FacilityMaster":
        this.setState({ FacilityMasterId: id });
        break;
      case "PropertyTower":
        this.setState({ PropertyTowerId: id });
        this.loadPropertyFlat(id);
        break;
      case "PropertyDetails":
        this.setState({ PropertyDetailsIds: id });
        break;
      case "PropertyFlat":
        let dataValue = [...this.state.PropertyDetailsIds];
        let isExist = dataValue.find((i) => {
          if (i.Id.toString() == id.toString()) {
            return true;
          } else {
            return false;
          }
        });
        if (!isExist) {
          let item = this.state.PropertyFlat.find((item) => {
            if (item.Value == id) {
              dataValue.push({
                Id: item.Value,
                Name: item.Name,
                value: item.Name,
                label: item.Name,
                color: "#0052CC",
              });
              this.onDropdownChanges("PropertyDetails", dataValue);
              return item;
            }
          });
          this.state.PropertyDetailsIds.push(item);
        }
        //remove item from flat dropdown
        let data = this.removeByAttr(
          this.state.PropertyFlat,
          "Value",
          parseInt(id)
        );
        this.setState({ PropertyFlat: data });
        $("#ddlFlatList").val("0");
        break;
      default:
    }
  };

  handleImagechange = () => {
    this.setState({ Showimguploader: true });
  };
  handleImageClose = () => {
    this.setState({ Showimguploader: false });
  };

  checkActiveInactiveData = (val) => {
    this.setState({ isServiceStaff: val }, () => {
      if (val === "Staff") {
        this.setState({ FacilityTypeId: 2 });
      } else if (val === "Service") {
        this.setState({ FacilityTypeId: 1 });
      }
      this.getFacilityMember(val);
    });
  };

  openInNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };
  onViewDocument(docId) {
    let data = this.state.gridDocumentData.find(
      (x) => x.facilityMemberDocumentId === docId
    );
    this.openInNewTab(data.documentUrl);
  }

  //End
  render() {
    return (
      <div>
        {this.state.PageMode == "Home" && (
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex p-0">
                  <ul className="nav tableFilterContainer">
                    <li className="nav-item">
                      <div className="btn-group">
                        <Button
                          id="btnStaff"
                          Action={this.checkActiveInactiveData.bind(
                            this,
                            "Staff"
                          )}
                          ClassName={
                            this.state.isServiceStaff === "Staff"
                              ? "btn btn-success"
                              : "btn btn-default"
                          }
                          Text="Staff"
                        />
                        <Button
                          id="btnService"
                          Action={this.checkActiveInactiveData.bind(
                            this,
                            "Service"
                          )}
                          ClassName={
                            this.state.isServiceStaff === "Service"
                              ? "btn btn-success"
                              : "btn btn-default"
                          }
                          Text="Service"
                        />
                      </div>
                    </li>
                    <li className="nav-item ">
                      <div className="form-inline">
                        <label htmlFor="lblFilter">Filter</label>
                        <SelectBox
                          ID="ddlFilter"
                          Value={this.state.FilterValue}
                          onSelected={this.onSelected.bind(this, "Filter")}
                          Options={this.state.Filter}
                          ClassName="form-control"
                        />
                      </div>
                    </li>
                  </ul>
                  <ul className="nav ml-auto tableFilterContainer">
                    {this.state.PropertyId !== 0 && (
                      <li className="nav-item">
                        <div className="input-group input-group-sm">
                          <div className="input-group-prepend">
                            <Button
                              id="btnNewComplain"
                              Action={this.addNew.bind(this)}
                              ClassName="btn btn-success btn-sm"
                              Icon={
                                <i
                                  className="fa fa-plus"
                                  aria-hidden="true"
                                ></i>
                              }
                              Text={`Add ${this.state.isServiceStaff}`}
                            />
                          </div>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
                <div className="card-body pt-2">
                  <DataGrid
                    Id="grdFacilityMember"
                    IsPagination={true}
                    ColumnCollection={this.state.gridFacilityMemberHeader}
                    totalpages={this.state.grdTotalPages}
                    totalrows={this.state.grdTotalRows}
                    Onpageindexchanged={this.onPagechange.bind(this)}
                    onEditMethod={this.ongridedit.bind(this)}
                    onGridDeleteMethod={this.onGridDelete.bind(this)}
                    onGridBlockMethod={this.onGridBlock.bind(this)}
                    DefaultPagination={false}
                    IsSarching="true"
                    GridData={this.state.gridFacilityMemberData}
                    pageSize="500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {this.state.PageMode == "Add" && (
          <div>
            <div>
              <div className="modal-content">
                <div className="modal-body">
                  <div className="row">
                    <div class="col-sm-4">
                      <div class="form-group">
                        <label htmlFor="lblName">Name</label>
                        {/* <InputBox
                          Id="txtName"
                          Value={this.state.Name}
                          onChange={this.updateData.bind(this, "Name")}
                          PlaceHolder="Name"
                          className="form-control"
                        /> */}
                         <input
                            id="txtCatColor"
                            placeholder="Enter Name"
                            type="text"
                            className="form-control"
                            value={this.state.Name}
                            onChange={(e) => { this.setState({ Name: e.target.value }) }}
                        />
                      </div>
                    </div>
                    <div class="col-sm-4">
                      <div class="form-group">
                        <label htmlFor="lblGender">Gender</label>
                        <DropDownList
                          Id="ddlGender"
                          Value={this.state.Gender}
                          onSelected={this.onDropdownChanges.bind(
                            this,
                            "Gender"
                          )}
                          Options={this.state.GenderList}
                        />
                      </div>
                    </div>
                    <div class="col-sm-4">
                      <div class="form-group">
                        <label htmlFor="lblFacilityMaster">Job Profile</label>
                        <DropDownList
                          Id="ddlFacilityMaster"
                          onSelected={this.onDropdownChanges.bind(
                            this,
                            "FacilityMaster"
                          )}
                          Options={this.state.FacilityMaster}
                        />
                      </div>
                    </div>
                    <div class="col-sm-4">
                      <div class="form-group">
                        <label htmlFor="lblContact">Contact</label>
                        <InputBox
                          Id="txtContact"
                          Value={this.state.Contact}
                          onChange={this.updateData.bind(this, "Contact")}
                          PlaceHolder="Contact"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div class="col-sm-4">
                      <div class="form-group">
                        <label htmlFor="lblAddress">Address</label>
                        <InputBox
                          Id="txtAddress"
                          Value={this.state.Address}
                          onChange={this.updateData.bind(this, "Address")}
                          PlaceHolder="Address"
                          className="form-control"
                        />
                      </div>
                    </div>
                    {this.state.FacilityTypeId == 1 && (
                      <div class="col-sm-4">
                        <div class="form-group">
                          <label htmlFor="ddlTowerList">Tower/Wing</label>
                          <DropDownList
                            Id="ddlTowerList"
                            onSelected={this.onDropdownChanges.bind(
                              this,
                              "PropertyTower"
                            )}
                            Options={this.state.PropertyTowersData}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className="row"
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <label>KYC Documents</label>

                    <div>
                      <Button
                        id="btnNewComplain"
                        Action={this.uploadDocs.bind(this)}
                        ClassName="btn btn-success btn-sm"
                        Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                        Text={`Add Documents`}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-12">
                      <DataGrid
                        Id="grdDoc"
                        IsPagination={false}
                        ColumnCollection={this.state.addDocumentHeader}
                        onGridDeleteMethod={this.onDocDelete.bind(this)}
                        onGridViewMethod={this.onDocView.bind(this)}
                        GridData={this.state.gridAddKYCData}
                      />
                    </div>
                  </div>

                  {this.state.FacilityTypeId == 1 && (
                    <div>
                      <div className="row">
                        <div class="col-sm-4">
                          <div class="form-group">
                            <label htmlFor="ddlFlatList">Flat Name</label>
                            <DropDownList
                              Id="ddlFlatList"
                              onSelected={this.onDropdownChanges.bind(
                                this,
                                "PropertyFlat"
                              )}
                              Options={this.state.PropertyFlat}
                            />
                          </div>
                        </div>
                        <div class="col-sm-8">
                          <label htmlFor="selectedFlat">
                            Selected Flat Name
                          </label>
                          <div class="form-group">
                            <div className="disableKey">
                              <MultiSelectInline
                                ID="ddlPropertyDetails"
                                isMulti={true}
                                value={this.state.PropertyDetailsIds}
                                onChange={this.onDropdownChanges.bind(
                                  this,
                                  "PropertyDetails"
                                )}
                                //options={this.state.OwnerData}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* <div className="row">
                                        <div className="col-sm-4">
                                            {
                                                (this.state.PageMode === 'Add' || this.state.Showimguploader) ?
                                                    <div className="form-group">
                                                        <label htmlFor="lbPictureUpload">Picture Upload</label>
                                                        <div style={{ display: "flex" }}>
                                                            <div style={{ marginRight: "15px" }}>
                                                                
                                                                <DocumentUploader
                                                                Class={"form-control"}
                                                                Id={"kycfileUploader"}
                                                                type={"file"}
                                                                onChange={this.onImageChange.bind(this)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    : null
                                            }
                                            {this.state.PageMode === "Edit" && !this.state.Showimguploader &&
                                                <div style={{ marginRight: "15px" }}>
                                                    <img className="ImageView" src={this.state.ProfileImageUrl}
                                                        style={{ height: "90px" }} />
                                                </div>
                                            }
                                            {!this.state.Showimguploader && this.state.PageMode === "Edit" &&
                                                <Button
                                                    Id="bntShowimage"
                                                    Text="Upload Image"
                                                    Action={this.handleImagechange}
                                                    ClassName="btn btn-link" />
                                            }
                                            {this.state.Showimguploader && this.state.PageMode === "Edit" &&
                                                <Button
                                                    Id="bnthideimage"
                                                    Text="Cancel"
                                                    Action={this.handleImageClose}
                                                    ClassName="btn btn-link" />
                                            }
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="modal-content">
                                            <div className="modal-body">
                                                <div className="row">
                                                    <div className="col-sm-3">
                                                        <div className="form-group">
                                                            <label htmlFor="lbDocumentType">Document Type</label>
                                                            <SelectBox
                                                                ID="ddlDocumentType"
                                                                Value={this.state.documentTypeId}
                                                                onSelected={this.onSelected.bind(this, "DocumentType")}
                                                                Options={this.state.documentType}
                                                                ClassName="form-control " />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-3">
                                                        <div className="form-group">
                                                            <label htmlFor="lbDocumentName">Document Number</label>
                                                            <InputBox Id="txtDocumentName"
                                                                onChange={this.updateData.bind(this, "DocumentName")}
                                                                PlaceHolder="Document Number"
                                                                Value={this.state.documentName}
                                                                Class="form-control"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-3">
                                                        <div className="form-group">
                                                            <label htmlFor="lbDocumentUpload">Document Upload</label>
                                                            <div className="pr-inner-block mar-bottom-zero-cover">
                                                                <DocumentUploader
                                                                    Class={"form-control "}
                                                                    Id={"fileDocumentUploader"}
                                                                    type={"file"}
                                                                    // value={this.state.FileData.name}
                                                                    onChange={this.onFileChange.bind(this)} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-3">
                                                        <br></br>
                                                        <Button
                                                            Id="btnAddDoc"
                                                            Text="Add Document"
                                                            Action={this.handleDocSave.bind(this)}
                                                            ClassName="btn btn-primary" />
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-sm-12">
                                                        <DataGrid
                                                            Id="grdDoc"
                                                            IsPagination={false}
                                                            ColumnCollection={this.state.gridDocumentHeader}
                                                            onGridDeleteMethod={this.onDocumentGridDelete.bind(this)}
                                                            onGridDownloadMethod={this.onDocumentGridData.bind(this)}
                                                            GridData={this.state.gridDocumentData}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div> */}
                </div>
                <div className="modal-footer">
                  {/* <Button
                    Id="btnSave"
                    Text="Save"
                    Action={this.handleSave.bind(this, "Save")}
                    ClassName="btn btn-primary"
                  /> */}
                  {/* <button className="btn btn-primary" onClick={(e)=>this.handleSave(e)}>
                        Save
                      </button> */}
                  <Button
                                        Id="btnSaveAndApprove"
                                        Text="Save &amp; Approve"
                                        Action={this.handleSave.bind(this, "SaveApprove")}
                                        ClassName="btn btn-success" />
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
        {this.state.PageMode == "Edit" && (
          <div>
            <div>
              <div className="modal-content">
                <div className="modal-body">
                  <div className="row">
                    <div class="col-sm-4">
                      <div class="form-group">
                        <label htmlFor="lblName">Name</label>
                        <InputBox
                          Id="txtName"
                          Value={this.state.Name}
                          onChange={this.updateData.bind(this, "Name")}
                          PlaceHolder="Name"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div class="col-sm-4">
                      <div class="form-group">
                        <label htmlFor="lblGender">Gender</label>
                        <DropDownList
                          Id="ddlGender"
                          onSelected={this.onDropdownChanges.bind(
                            this,
                            "Gender"
                          )}
                          Options={this.state.GenderList}
                        />
                      </div>
                    </div>
                    <div class="col-sm-4">
                      <div class="form-group">
                        <label htmlFor="lblFacilityMaster">Job Profile</label>
                        <DropDownList
                          Id="ddlFacilityMaster"
                          onSelected={this.onDropdownChanges.bind(
                            this,
                            "FacilityMaster"
                          )}
                          Options={this.state.FacilityMaster}
                        />
                      </div>
                    </div>
                    <div class="col-sm-4">
                      <div class="form-group">
                        <label htmlFor="lblContact">Contact</label>
                        <InputBox
                          Id="txtContact"
                          Value={this.state.Contact}
                          onChange={this.updateData.bind(this, "Contact")}
                          PlaceHolder="Contact"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div class="col-sm-4">
                      <div class="form-group">
                        <label htmlFor="lblAddress">Address</label>
                        <InputBox
                          Id="txtAddress"
                          Value={this.state.Address}
                          onChange={this.updateData.bind(this, "Address")}
                          PlaceHolder="Address"
                          className="form-control"
                        />
                      </div>
                    </div>
                    {this.state.FacilityTypeId == 1 && (
                      <div class="col-sm-4">
                        <div class="form-group">
                          <label htmlFor="ddlTowerList">Tower/Wing</label>
                          <DropDownList
                            Id="ddlTowerList"
                            onSelected={this.onDropdownChanges.bind(
                              this,
                              "PropertyTower"
                            )}
                            Options={this.state.PropertyTowersData}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className="row"
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <label>KYC Documents</label>

                    <div>
                      <Button
                        id="btnNewComplain"
                        Action={this.addDocs.bind(this)}
                        ClassName="btn btn-success btn-sm"
                        Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                        Text={`Add Documents`}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-12">
                      <DataGrid
                        Id="grdDoc"
                        IsPagination={false}
                        ColumnCollection={this.state.gridDocumentHeader}
                        onEditMethod={this.onKYCDocumentDelete.bind(this)}
                        onGridDownloadMethod={this.onDocumentGridData.bind(
                          this
                        )}
                        onGridViewMethod={this.onViewDocument.bind(this)}
                        GridData={this.state.gridDocumentData}
                      />
                    </div>
                  </div>

                  {this.state.FacilityTypeId == 1 && (
                    <div>
                      <div className="row">
                        <div class="col-sm-4">
                          <div class="form-group">
                            <label htmlFor="ddlFlatList">Flat Name</label>
                            <DropDownList
                              Id="ddlFlatList"
                              onSelected={this.onDropdownChanges.bind(
                                this,
                                "PropertyFlat"
                              )}
                              Options={this.state.PropertyFlat}
                            />
                          </div>
                        </div>
                        <div class="col-sm-8">
                          <label htmlFor="selectedFlat">
                            Selected Flat Name
                          </label>
                          <div class="form-group">
                            <div className="disableKey">
                              <MultiSelectInline
                                ID="ddlPropertyDetails"
                                isMulti={true}
                                value={this.state.PropertyDetailsIds}
                                onChange={this.onDropdownChanges.bind(
                                  this,
                                  "PropertyDetails"
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  {/* <Button
                    Id="btnSave"
                    Text="Save"
                    Action={this.handleSave.bind(this, "Save")}
                    ClassName="btn btn-primary"
                  /> */}
                  <button className="btn btn-primary" onClick={(e)=>this.handleEdit(e)}>
                        Save
                      </button>
                  {/* <Button
                                        Id="btnSaveAndApprove"
                                        Text="Save &amp; Approve"
                                        Action={this.handleSave.bind(this, "SaveApprove")}
                                        ClassName="btn btn-success" /> */}
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
{/* While Creating New User */}
      {this.state.PageMode == "UploadDocs" && (
          <div>
            <div>
              <div className="modal-content">
                <div className="modal-body">
                  <div className="row">
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label htmlFor="lbDocumentType">Document Type</label>
                        <SelectBox
                          ID="ddlDocumentType"
                          Value={this.state.documentTypeId}
                          onSelected={this.onSelected.bind(
                            this,
                            "DocumentType"
                          )}
                          Options={this.state.DocumentType}
                          ClassName="form-control "
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <div>
                        <label>Upload KYC Documents</label>
                      </div>
                      <div style={{ display: "flex" }}>
                        <div style={{ marginRight: "15px" }}>
                          <DocumentUploader
                            Class={"form-control"}
                            Id={"kycfileUploader"}
                            type={"file"}
                            // value={this.state.documentName}
                            onChange={this.onImageChange.bind(this)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-4">
                      <div className="form-group">
                        <label htmlFor="lblName">Document Number</label>
                        <InputBox
                          Id="txtName"
                          value={this.state.DocumentNumber}
                          onChange={this.updateData.bind(
                            this,
                            "DocumentNumber"
                          )}
                          PlaceHolder="Document Number"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  {/* <Button
                    Id="btnSave"
                    Text="Save"
                    Action={this.uploadFile.bind(this)}
                    ClassName="btn btn-primary"
                  /> */}
                  <button className="btn btn-primary" onClick={(e)=>this.addFile(e)}>
                        Save
                      </button>
                  <Button
                    Id="btnCancel"
                    Text="Cancel"
                    Action={this.handleCancelAddUpload}
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
{/* While Editing User and adding new documents */}
        {this.state.PageMode == "AddDocs" && (
          <div>
            <div>
              <div className="modal-content">
                <div className="modal-body">
                  <div className="row">
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label htmlFor="lblName">Id</label>
                        <InputBox
                          Id="txtName"
                          Disabled={true}
                          Value={this.state.FacilityMemberId}
                          PlaceHolder="Id"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label htmlFor="lblName">Name</label>
                        <InputBox
                          Id="txtName"
                          Value={this.state.Name}
                          PlaceHolder="Name"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label htmlFor="lbDocumentType">Document Type</label>
                        <SelectBox
                          ID="ddlDocumentType"
                          Value={this.state.documentTypeId}
                          onSelected={this.onSelected.bind(
                            this,
                            "DocumentType"
                          )}
                          Options={this.state.DocumentType}
                          ClassName="form-control "
                        />
                        {/* <select className='form-control' onSelect={(e)=>{this.setState({documentTypeId:e.target.value})}}>
                                                                {this.state.documentType.map((item, index) => {
                                                                    return <option value={item.Id}>{item.Name}</option>
                                                                })}
                                                            </select> */}
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <div>
                        <label>Upload KYC Documents</label>
                      </div>
                      <div style={{ display: "flex" }}>
                        <div style={{ marginRight: "15px" }}>
                          <DocumentUploader
                            Class={"form-control"}
                            Id={"kycfileUploader"}
                            type={"file"}
                            // value={this.state.documentName}
                            onChange={this.onImageChange.bind(this)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-4">
                      <div className="form-group">
                        <label htmlFor="lblName">Document Number</label>
                        <InputBox
                          Id="txtName"
                          value={this.state.DocumentNumber}
                          onChange={this.updateData.bind(
                            this,
                            "DocumentNumber"
                          )}
                          PlaceHolder="Document Number"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  {/* <Button
                    Id="btnSave"
                    Text="Save"
                    Action={this.uploadFile.bind(this)}
                    ClassName="btn btn-primary"
                  /> */}
                  <button className="btn btn-primary" onClick={(e)=>this.uploadFile(e)}>
                        Save
                      </button>
                  <Button
                    Id="btnCancel"
                    Text="Cancel"
                    Action={this.handleCancelUpload}
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
{/* While Editing User and updating documents */}
        {this.state.PageMode == "UpdateDocs" && (
          <div>
            <div>
              <div className="modal-content">
                <div className="modal-body">
                  <div className="row">
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label htmlFor="lblName">Id</label>
                        <InputBox
                          Id="txtName"
                          Disabled={true}
                          Value={this.state.FacilityMemberId}
                          PlaceHolder="Id"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label htmlFor="lblName">Name</label>
                        <InputBox
                          Id="txtName"
                          Disabled={true}
                          Value={this.state.Name}
                          PlaceHolder="Name"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label htmlFor="lbDocumentType">Document Type</label>
                        <SelectBox
                          disabled={true}
                          ID="ddlDocumentType"
                          Value={this.state.documentTypeId}
                          onSelected={this.onSelected.bind(
                            this,
                            "DocumentType"
                          )}
                          Options={this.state.DocumentType}
                          ClassName="form-control "
                        />
                        {/* <select className='form-control' onSelect={(e)=>{this.setState({documentTypeId:e.target.value})}}>
                                                                {this.state.documentType.map((item, index) => {
                                                                    return <option value={item.Id}>{item.Name}</option>
                                                                })}
                                                            </select> */}
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <div>
                        <label>Update KYC Documents</label>
                      </div>
                      <div style={{ display: "flex" }}>
                        <div style={{ marginRight: "15px" }}>
                          <DocumentUploader
                            Class={"form-control"}
                            Id={"kycfileUploader"}
                            type={"file"}
                            onChange={this.onImageChange.bind(this)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-4">
                      <div className="form-group">
                        <label htmlFor="lblName">Document Id</label>
                        <InputBox
                          Id="txtName"
                          Disabled={true}
                          Value={this.state.FacilityMemberDocumentId}
                          // onChange={this.updateData.bind(this, "DocumentNumber")}
                          PlaceHolder="Document Id"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  {/* <Button
                    Id="btnSave"
                    Text="Save"
                    Action={this.updateFile.bind(this)}
                    ClassName="btn btn-primary"
                  /> */}
                      <button className="btn btn-primary" onClick={(e)=>this.updateFile(e)}>
                        Save
                      </button>
                  <Button
                    Id="btnCancel"
                    Text="Cancel"
                    Action={this.handleCancelUpload}
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
          {(this.state.PageMode == "docView") && (
          <div>
            <div>
              <div className="modal-content">
                <div className="modal-body">
                  <h3>Document Images</h3>
                <div className="row">
                  <div className="col-sm-6">
                      <div className="form-group">
                        {/* <img src={this.state.showImagefile} alt="Image" width="100" height="100" /> */}
                        <img src={`data:image/jpeg;base64,${this.state.showDocfile}`} style={{"height":"400px","width":"400px"}} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <Button
                    Id="btnCancel"
                    Text="Close"
                    Action={this.handleCancelAddUpload}
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

function mapStoreToprops(state, props) {
  return {
    PropertyId: state.Commonreducer.puidn,
  };
}

function mapDispatchToProps(dispatch) {
  const actions = bindActionCreators(departmentAction, dispatch);
  return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(FacilityMember);
