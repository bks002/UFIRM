"use client"
import React, { useState, useEffect, useCallback } from "react"
import swal from "sweetalert"
import { ToastContainer } from "react-toastify"
import DataGrid from "../../ReactComponents/DataGrid/DataGrid.jsx"
import Button from "../../ReactComponents/Button/Button"
import { CreateValidator, ValidateControls } from "../Calendar/Validation"
import * as appCommon from "../../Common/AppCommon.js"
import { DELETE_CONFIRMATION_MSG } from "../../Contants/Common"
import { getVendors, getVendorById, createVendor, updateVendor, deleteVendor, PendingApprovalVendor } from "../../Services/InventoryService"
import { useSelector, useDispatch } from "react-redux"
import ExportToCSV from "../../ReactComponents/ExportToCSV/ExportToCSV.js"
import ApprovalPage from "./ApprovalPage";

const Vendor = (props) => {
  const [pageMode, setPageMode] = useState("Home")
  const [openDropDown, setOpenDropDown] = useState(false)
  const [gridData, setGridData] = useState([])
  const [GridApproval, setGridApproval]= useState([])
  const gridHeader = [
    { sTitle: "Id", titleValue: "Id", orderable: true },
    { sTitle: "Name", titleValue: "Name" },
    { sTitle: "Contact Person", titleValue: "ContactPerson" },
    { sTitle: "Contact Number", titleValue: "ContactNumber" },
    { sTitle: "Email", titleValue: "Email" },
    { sTitle: "Action", titleValue: "Action", Action: "Edit&View&Delete", Index: "0", orderable: false },
  ]
  const propertyId = useSelector((state) => state.Commonreducer.puidn)
  const emptyVendorData = {
    Id: 0,
    Name: "",
    ContactPerson: "",
    ContactNumber: "",
    Email: "",
    Address: "",
    GSTNumber: "",
    PANNumber: "",
    PAN_DocumentPath: "",
    GST_DocumentPath: "",
    Brochure: "",
    WebsiteURL: "",
    PropertyId: propertyId,
    IsApproved: false
  }
  const [VendorData, setVendorData] = useState(emptyVendorData)
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const dispatch = useDispatch()

  const [selectedPANFile, setSelectedPANFile] = useState(null)
  const [selectedGSTFile, setSelectedGSTFile] = useState(null)
  const [selectedBrochureFile, setSelectedBrochureFile] = useState(null)

  const handleFileChange = async (e) => {
    const { id, files } = e.target
    const file = files[0]
    if (file) {
      switch (id) {
        case "PAN_DocumentPath":
          setSelectedPANFile(file)
          setVendorData((prevState) => ({ ...prevState, PAN_DocumentPath: selectedPANFile }))
          break
        case "GST_DocumentPath":
          setSelectedGSTFile(file)
          setVendorData((prevState) => ({ ...prevState, GST_DocumentPath: selectedGSTFile }))
          break
        case "Brochure":
          setSelectedBrochureFile(file)
          setVendorData((prevState) => ({ ...prevState, Brochure: selectedBrochureFile}))
          break
        default:
          break
      }
    } else {
      switch (id) {
        case "PAN_DocumentPath":
          setSelectedPANFile(null)
          setVendorData((prevState) => ({ ...prevState, PAN_DocumentPath: "" }))
          break
        case "GST_DocumentPath":
          setSelectedGSTFile(null)
          setVendorData((prevState) => ({ ...prevState, GST_DocumentPath: "" }))
          break
        case "Brochure":
          setSelectedBrochureFile(null)
          setVendorData((prevState) => ({ ...prevState, Brochure: "" }))
          break
        default:
          break
      }
    }
  }

  const handleCreateVendor = async (newVendor) => {
    try {
      if (selectedPANFile) {
        newVendor.PAN_DocumentPath = selectedPANFile
      }
      if (selectedGSTFile) {
        newVendor.GST_DocumentPath = selectedGSTFile
      }
      if (selectedBrochureFile) {
        newVendor.Brochure = selectedBrochureFile
      }
      await createVendor(newVendor)
      appCommon.showtextalert("Vendor Saved Successfully!", "", "success")
      handleCancel()
      await getVendorList(propertyId)
    } catch (error) {
      appCommon.showtextalert("Error Creating Vendor", error.message, "error")
    }
  }

  const handleUpdateVendor = async (id, updatedVendor) => {
    try {
      if (selectedPANFile) {
        updatedVendor.PAN_DocumentPath = selectedPANFile
      }
      if (selectedGSTFile) {
        updatedVendor.GST_DocumentPath = selectedGSTFile
      }
      if (selectedBrochureFile) {
        updatedVendor.Brochure = selectedBrochureFile
      }
      await updateVendor(id, updatedVendor)
      appCommon.showtextalert("Vendor Updated Successfully!", "", "success")
      handleCancel()
      await getVendorList(propertyId)
    } catch (error) {
      appCommon.showtextalert("Error Updating Vendor", error.message, "error")
    }
  }

  const getVendorApproval = useCallback(async (propertyId) => {
    try {
      setLoading(true)
      const data = await PendingApprovalVendor(propertyId)
      setGridApproval(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching Vendors:", error)
      setLoading(false)
    }
  }, [])

  const getVendorList = useCallback(async (propertyId) => {
    try {
      setLoading(true)
      const data = await getVendors(propertyId)
      setGridData(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching Vendors:", error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (propertyId) {
      setGridApproval([])
      setGridData([])
      getVendorApproval(propertyId)
      getVendorList(propertyId)
    } else {
      setGridApproval([])
      setGridData([])
      appCommon.showtextalert("Error", "Please select a Property.", "error")
    }
  }, [getVendorApproval,getVendorList, propertyId])

  const handleViewVendor = async (id) => {
    try {
      const data = await getVendorById(id)
      setVendorData(data)
    } catch (error) {
      appCommon.showtextalert("Error viewing Vendor", error.message, "error")
    }
  }

  const handleDeleteVendor = async (id) => {
    try {
      await deleteVendor(id)
      appCommon.showtextalert("Vendor Deleted Successfully!", "", "success")
      await getVendorList(propertyId)
    } catch (error) {
      appCommon.showtextalert("Error Deleting Vendor", error.message, "error")
    }
  }

  const onPagechange = (page) => {
  }

 const onGridApprove = async (VendorApprovedId) => {
         try {
             const approvedVendor = GridApproval.find(item => item.Id === VendorApprovedId);
             if (approvedVendor) {
                 const updatedVendor = { ...approvedVendor, IsApproved: true };
                 await updateVendor(updatedVendor.Id, updatedVendor);
                 appCommon.showtextalert("Vendor Approved Successfully!", "", "success");
                 setGridApproval(prevData => prevData.filter(item => item.Id !== VendorApprovedId));
                 await getVendorList(propertyId);
             }
         } catch (error) {
             appCommon.showtextalert("Error Approving Vendor", error.message, "error");
             console.error("Error approving vendor:", error);
         }
     };

  const onGridDelete = (VendorData) => {
    const myhtml = document.createElement("div")
    myhtml.innerHTML = DELETE_CONFIRMATION_MSG + "</hr>"
    swal({
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
          handleDeleteVendor(VendorData)
          break
        case "cancel":
        default:
          break
      }
    })
  }

  const onGridView = async (VendorData) => {
    setPageMode("View")
    CreateValidator()
    try {
      handleViewVendor(VendorData)
    } catch (error) {
      console.error("Error fetching Vendor details", error)
      appCommon.showtextalert("Error", "Failed to fetch Vendor details.", "error")
    }
  }

  const onGridEdit = async (VendorData) => {
    setPageMode("Edit")
    CreateValidator()
    try {
      const VendorDetails = await getVendorById(VendorData)
      console.log("VendorDetails", VendorDetails)
      setVendorData(VendorDetails)
      setSelectedFile(null) // Reset selected file when editing
    } catch (error) {
      console.error("Error fetching Vendor details", error)
      appCommon.showtextalert("Error", "Failed to fetch Vendor details.", "error")
    }
  }

  const Addnew = () => {
    setPageMode("Add")
    CreateValidator()
    setVendorData(emptyVendorData)
    setSelectedFile(null) // Reset selected file when adding new
  }

  const DropDown = () => {
    setOpenDropDown(!openDropDown)
  }

  const handleCancel = () => {
    setPageMode("Home")
    setVendorData(emptyVendorData)
    setSelectedFile(null)
    getVendorList(propertyId)
    setOpenDropDown(false)
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setVendorData((prevState) => ({
      ...prevState,
      [id]: value,
    }))
  }

  const handleSave = async () => {
    if (!ValidateControls()) {
      appCommon.showtextalert("Validation Error", "Please fill in all required fields correctly.", "error")
      return
    }
    if (pageMode === "Add") {
      await handleCreateVendor(VendorData)
    } else if (pageMode === "Edit") {
      await handleUpdateVendor(VendorData.Id, VendorData)
    }
  }

  const viewDocument = () => {
    if(VendorData.PAN_DocumentPath && VendorData.PAN_DocumentPath !== "") {
      window.open(VendorData.PAN_DocumentPath, "_blank")
    } else if (VendorData.GST_DocumentPath && VendorData.GST_DocumentPath !== "") {
      window.open(VendorData.GST_DocumentPath, "_blank")
    } else if (VendorData.Brochure && VendorData.Brochure !== "") {
      window.open(VendorData.Brochure, "_blank")
    } else{
      appCommon.showtextalert("Error", "No document available to view.", "error")
    }
  }

  return (
    <>
      <div className="row">
                <div className="col-12">
                    {GridApproval.length > 0 && pageMode === "Home" && (
                        <ApprovalPage
                            title={"Pending For Approval"}
                            gridHeader={gridHeader}
                            gridData={GridApproval}
                            onGridEdit={onGridEdit}
                            onGridDelete={onGridDelete}
                            onGridApprove={onGridApprove}
                            onGridView={onGridView}
                        />
                    )}
                </div>
            </div>
      {pageMode === "Home" && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex p-0">
                <ul className="nav ml-auto tableFilterContainer">
                  <li className="nav-item">
                    <div className="input-group input-group-sm">
                      <div className="input-group-prepend">
                        <ExportToCSV data={gridData} className="btn btn-success btn-sm rounded mr-2" />
                        <Button
                          id="btnaddCalendarFrequency"
                          Action={Addnew}
                          ClassName="btn btn-success btn-sm rounded"
                          Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                          Text="Add Vendor"
                        />
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="card-body pt-2">
                <DataGrid
                  Id="VendorDataGrid"
                  IsPagination={false}
                  ColumnCollection={gridHeader}
                  Onpageindexchanged={onPagechange}
                  onEditMethod={onGridEdit}
                  onGridDeleteMethod={onGridDelete}
                  onGridViewMethod={onGridView}
                  IsSarching="false"
                  GridData={gridData}
                  pageSize="2000"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {(pageMode === "Add" || pageMode === "Edit") && (
        <div className="modal d-flex align-items-center justify-content-center show" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalToggleLabel">
                  {pageMode === "Add" ? "Add Vendor" : "Edit Vendor"}
                </h5>
              </div>
              <div className="modal-body p-2">
                <form>
                  <div className="row">
                    <div className="col-sm-6">
                      <label htmlFor="Name">Vendor Name</label>
                      <input
                        id="Name"
                        required
                        placeholder="Enter Vendor Name"
                        type="text"
                        className="form-control"
                        value={VendorData.Name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label>Contact Person</label>
                      <input
                        id="ContactPerson"
                        required
                        placeholder="Enter Description"
                        type="text"
                        className="form-control"
                        value={VendorData.ContactPerson}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label>Contact Number</label>
                      <input
                        id="ContactNumber"
                        required
                        placeholder="Enter Contact Number"
                        type="number"
                        maxLength="10"
                        className="form-control"
                        value={VendorData.ContactNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label>Email</label>
                      <input
                        id="Email"
                        required
                        placeholder="Enter Email"
                        type="text"
                        className="form-control"
                        value={VendorData.Email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label>Address</label>
                      <input
                        id="Address"
                        required
                        placeholder="Enter Address"
                        type="text"
                        className="form-control"
                        value={VendorData.Address}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label>GST Number</label>
                      <input
                        id="GSTNumber"
                        required
                        placeholder="Enter GST Number"
                        type="text"
                        className="form-control"
                        value={VendorData.GSTNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label>PAN Number</label>
                      <input
                        id="PANNumber"
                        required
                        placeholder="Enter PAN Number"
                        type="text"
                        className="form-control"
                        value={VendorData.PANNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label>Pan Card Document</label>
                      <div className="input-group">
                        <input
                          id="PAN_DocumentPath"
                          name="DocumentPath"
                          required
                          placeholder="Select Pan Card Document"
                          type="file"
                          className="form-control"
                          onChange={handleFileChange}
                          accept=".pdf, .doc, .docx, .jpg, .jpeg, .png"
                        />
                        {selectedFile && (
                          <div className="input-group-append">
                            <span className="input-group-text">{selectedFile.name}</span>
                          </div>
                        )}
                      </div>
                      {VendorData.PAN_DocumentPath && pageMode === "Edit" && !selectedFile && (
                        <small className="form-text text-muted">
                          Current document: {VendorData.PAN_DocumentPath.substring(0, 50)}...
                        </small>
                      )}
                    </div>
                    <div className="col-sm-6">
                      <label>GST Document</label>
                      <div className="input-group">
                        <input
                          id="GST_DocumentPath"
                          name="DocumentPath"
                          required
                          placeholder="Select GST Document"
                          type="file"
                          className="form-control"
                          onChange={handleFileChange}
                          accept=".pdf, .doc, .docx, .jpg, .jpeg, .png"
                        />
                        {selectedFile && (
                          <div className="input-group-append">
                            <span className="input-group-text">{selectedFile.name}</span>
                          </div>
                        )}
                      </div>
                      {VendorData.GST_DocumentPath && pageMode === "Edit" && !selectedFile && (
                        <small className="form-text text-muted">
                          Current document: {VendorData.GST_DocumentPath.substring(0, 50)}...
                        </small>
                      )}
                    </div>
                    <div className="col-sm-6">
                      <label>Brochure</label>
                      <div className="input-group">
                        <input
                          id="Brochure"
                          name="DocumentPath"
                          required
                          placeholder="Select Brochure"
                          type="file"
                          className="form-control"
                          onChange={handleFileChange}
                          accept=".pdf, .doc, .docx, .jpg, .jpeg, .png"
                        />
                        {selectedFile && (
                          <div className="input-group-append">
                            <span className="input-group-text">{selectedFile.name}</span>
                          </div>
                        )}
                      </div>
                      {VendorData.Brochure && pageMode === "Edit" && !selectedFile && (
                        <small className="form-text text-muted">
                          Current document: {VendorData.Brochure.substring(0, 50)}...
                        </small>
                      )}
                    </div>
                    <div className="col-sm-6">
                      <label>Website URL</label>
                      <input
                        id="WebsiteURL"
                        required
                        placeholder="Enter Website URL"
                        type="text"
                        className="form-control"
                        value={VendorData.WebsiteURL}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer justify-content-start">
                <Button Id="btnSave" Text="Save" Action={handleSave} ClassName="btn btn-primary" />
                <Button Id="btnCancel" Text="Cancel" Action={handleCancel} ClassName="btn btn-secondary" />
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
            </div>
          </div>
        </div>
      )}
      {pageMode === "View" && (
        <div className="modal d-flex align-items-center justify-content-center show" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">View Vendor</h5>
              </div>
              <div className="modal-body p-2">
                <form>
                  <div className="row">
                    <div className="form-group col-sm-6">
                      <label htmlFor="name">Name</label>
                      <input type="text" className="form-control" id="Name" value={VendorData.Name} readOnly />
                    </div>
                    <div className="form-group col-sm-6">
                      <label htmlFor="name">Contact Person</label>
                      <input
                        type="text"
                        className="form-control"
                        id="ContactPerson"
                        value={VendorData.ContactPerson}
                        readOnly
                      />
                    </div>
                    <div className="form-group col-sm-6">
                      <label htmlFor="name">Contact Number</label>
                      <input
                        type="text"
                        className="form-control"
                        id="ContactNumber"
                        value={VendorData.ContactNumber}
                        readOnly
                      />
                    </div>
                    <div className="form-group col-sm-6">
                      <label htmlFor="name">Email</label>
                      <input type="text" className="form-control" id="Email" value={VendorData.Email} readOnly />
                    </div>
                    <div className="form-group col-sm-6">
                      <label htmlFor="name">Address</label>
                      <input type="text" className="form-control" id="Address" value={VendorData.Address} readOnly />
                    </div>
                    <div className="form-group col-sm-6">
                      <label htmlFor="name">GST Number</label>
                      <input
                        type="text"
                        className="form-control"
                        id="GSTNumber"
                        value={VendorData.GSTNumber}
                        readOnly
                      />
                    </div>
                    <div className="form-group col-sm-6">
                      <label htmlFor="name">PAN Number</label>
                      <input
                        type="text"
                        className="form-control"
                        id="PANNumber"
                        value={VendorData.PANNumber}
                        readOnly
                      />
                    </div>
                    <div className="form-group col-sm-6">
                      <label htmlFor="name">Pan Card</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          id="DocumentPath"
                          value={VendorData.PAN_DocumentPath ? VendorData.PAN_DocumentPath.split("/").pop() : ""}
                          readOnly
                        />
                        {VendorData.PAN_DocumentPath && (
                          <div className="input-group-append">
                            <button type="button" className="btn btn-outline-secondary" onClick={viewDocument}>
                              View
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="form-group col-sm-6">
                      <label htmlFor="name">GST Document</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          id="DocumentPath"
                          value={VendorData.GST_DocumentPath ? VendorData.GST_DocumentPath.split("/").pop() : ""}
                          readOnly
                        />
                        {VendorData.GST_DocumentPath && (
                          <div className="input-group-append">
                            <button type="button" className="btn btn-outline-secondary" onClick={viewDocument}>
                              View
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="form-group col-sm-6">
                      <label htmlFor="name">Brochure</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          id="DocumentPath"
                          value={VendorData.Brochure ? VendorData.Brochure.split("/").pop() : ""}
                          readOnly
                        />
                        {VendorData.Brochure && (
                          <div className="input-group-append">
                            <button type="button" className="btn btn-outline-secondary" onClick={viewDocument}>
                              View
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="form-group col-sm-6">
                      <label htmlFor="name">Website URL</label>
                      <input
                        type="text"
                        className="form-control"
                        id="WebsiteURL"
                        value={VendorData.WebsiteURL}
                        readOnly
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer justify-content-start">
                <Button Id="btnCancel" Text="Close" Action={handleCancel} ClassName="btn btn-secondary" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Vendor;