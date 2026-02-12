"use client"
import React, { useState, useEffect, useCallback, useMemo } from "react"
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
import ApprovalModal, { ApprovalTriggerButton } from "./ApprovalPage"

// Icons for Panel View
const TableViewIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
    </svg>
);

const PanelViewIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="18" rx="1"/>
        <rect x="12" y="3" width="9" height="18" rx="1"/>
    </svg>
);

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
    </svg>
);

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
);

const VendorIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);

const EditIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);

const DeleteIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#A83232" strokeWidth="2" width="18" height="18">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        <line x1="10" y1="11" x2="10" y2="17"/>
        <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
);

const EmptyIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 9h6M9 15h6"/>
    </svg>
);

const DownloadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);

const ChevronRightIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <polyline points="9 18 15 12 9 6"/>
    </svg>
);

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

const CameraIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
    </svg>
);

const AttachIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
);

const LocationIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
    </svg>
);

const AssetIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
);

const ContactIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
);

const FilterIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
);

// Vendor Colors
const VENDOR_COLORS = [
    { id: 1, color: '#2563eb', name: 'Blue' },
    { id: 2, color: '#16a34a', name: 'Green' },
    { id: 3, color: '#f97316', name: 'Orange' },
    { id: 4, color: '#ef4444', name: 'Red', outline: true },
    { id: 5, color: '#14b8a6', name: 'Teal' },
    { id: 6, color: '#f43f5e', name: 'Rose' },
    { id: 7, color: '#8b5cf6', name: 'Purple' },
    { id: 8, color: '#fb923c', name: 'Coral' }
];

const Vendor = (props) => {
  const [pageMode, setPageMode] = useState("Home")
  const [viewMode, setViewMode] = useState("panel") // 'panel' or 'table'
  const [openDropDown, setOpenDropDown] = useState(false)
  const [gridData, setGridData] = useState([])
  const [GridApproval, setGridApproval]= useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState("name-asc")
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [activeTab, setActiveTab] = useState('details')

  // Filter states
  const [activeFilters, setActiveFilters] = useState([])
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  const gridHeader = [
    { sTitle: "Id", titleValue: "Id", orderable: true },
    { sTitle: "Name", titleValue: "Name" },
    { sTitle: "Contact Person", titleValue: "ContactPerson" },
    { sTitle: "Contact Number", titleValue: "ContactNumber" },
    { sTitle: "Email", titleValue: "Email" },
    { sTitle: "Action", titleValue: "Action", Action: "Edit&View&Delete", Index: "0", orderable: false },
  ]
  const propertyId = useSelector((state) => state.Commonreducer.puidn)
  const userId = useSelector((state) => state.Commonreducer.userId)

  const emptyVendorData = {
    Id: 0,
    Name: "",
    Description: "",
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
    IsApproved: false,
    VendorColor: '#2563eb',
    VendorImage: '',
    Contacts: [],
    Locations: [],
    Assets: []
  }
  const [VendorData, setVendorData] = useState(emptyVendorData)
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const dispatch = useDispatch()

  const [selectedPANFile, setSelectedPANFile] = useState(null)
  const [selectedGSTFile, setSelectedGSTFile] = useState(null)
  const [selectedBrochureFile, setSelectedBrochureFile] = useState(null)
  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const [showApprovalModal, setShowApprovalModal] = useState(false)

  // Refs for file inputs
  const panFileRef = React.useRef(null)
  const gstFileRef = React.useRef(null)
  const brochureFileRef = React.useRef(null)

  // Local color overrides (in case API doesn't return VendorColor)
  const vendorColorMap = React.useRef({})

  // Filtered and sorted data
  const filteredAndSortedData = useMemo(() => {
    let filtered = gridData;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ContactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return (a.Name || '').localeCompare(b.Name || '');
        case 'name-desc':
          return (b.Name || '').localeCompare(a.Name || '');
        case 'id-asc':
          return a.Id - b.Id;
        case 'id-desc':
          return b.Id - a.Id;
        default:
          return 0;
      }
    });

    return sorted;
  }, [gridData, searchTerm, sortOption]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
      const createdResult = await createVendor(newVendor)
      // Store the color locally so it persists in the UI even if API doesn't return it
      if (createdResult && createdResult.Id) {
        vendorColorMap.current[createdResult.Id] = newVendor.VendorColor || '#2563eb'
      }
      appCommon.showtextalert("Vendor Saved Successfully!", "", "success")
      setPageMode("Home")
      setVendorData(emptyVendorData)
      setSelectedFile(null)
      setImagePreview(null)
      setOpenDropDown(false)
      await getVendorList(propertyId)
      await getVendorApproval(propertyId)
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
      // Store the color locally so it persists in the UI even if API doesn't return it
      vendorColorMap.current[id] = updatedVendor.VendorColor || '#2563eb'
      appCommon.showtextalert("Vendor Updated Successfully!", "", "success")
      setPageMode("Home")
      setVendorData(emptyVendorData)
      setSelectedFile(null)
      setImagePreview(null)
      setOpenDropDown(false)
      await getVendorList(propertyId)
      await getVendorApproval(propertyId)
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
      // Merge local color overrides for vendors where API doesn't return VendorColor
      const mergedData = data.map(item => ({
        ...item,
        VendorColor: item.VendorColor || vendorColorMap.current[item.Id] || '#336B93'
      }))
      setGridData(mergedData)
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
      // Apply local color override if API doesn't return VendorColor
      if (!data.VendorColor && vendorColorMap.current[data.Id]) {
        data.VendorColor = vendorColorMap.current[data.Id]
      }
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
      setSelectedVendor(null)
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
      // Apply local color override if API doesn't return VendorColor
      if (!VendorDetails.VendorColor && vendorColorMap.current[VendorDetails.Id]) {
        VendorDetails.VendorColor = vendorColorMap.current[VendorDetails.Id]
      }
      setVendorData(VendorDetails)
      setSelectedFile(null) // Reset selected file when editing
      setImagePreview(VendorDetails.VendorImage || null)
    } catch (error) {
      console.error("Error fetching Vendor details", error)
      appCommon.showtextalert("Error", "Failed to fetch Vendor details.", "error")
    }
  }

  const Addnew = () => {
    setPageMode("Add")
    setViewMode("panel")
    CreateValidator()
    setVendorData(emptyVendorData)
    setSelectedFile(null)
    setImagePreview(null)
    setSelectedVendor(null)
  }

  const DropDown = () => {
    setOpenDropDown(!openDropDown)
  }

  const handleCancel = () => {
    setPageMode("Home")
    setVendorData(emptyVendorData)
    setSelectedFile(null)
    setImagePreview(null)
    getVendorList(propertyId)
    getVendorApproval(propertyId)
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
    if (!VendorData.Name || VendorData.Name.trim() === '') {
      appCommon.showtextalert("Validation Error", "Vendor name is required.", "error")
      return
    }
    if (pageMode === "Add") {
      await handleCreateVendor(VendorData)
    } else if (pageMode === "Edit") {
      await handleUpdateVendor(VendorData.Id, VendorData)
    }
  }

  const handleVendorSelect = (vendor) => {
    if (pageMode === 'Add') {
      setPageMode('Home');
    }
    setSelectedVendor(vendor);
    setActiveTab('details');
  };

  const handleColorSelect = (color) => {
    setVendorData(prev => ({ ...prev, VendorColor: color }));
  };

  const handleVendorBulkApprove = async (ids) => {
    appCommon.showtextalert("In Progress", "Bulk Approve API is not yet developed.", "info");
  };

  const handleVendorBulkReject = async (ids) => {
    appCommon.showtextalert("In Progress", "Bulk Reject API is not yet developed.", "info");
  };

  const viewDocument = (path) => {
    if(path && path !== "") {
      window.open(path, "_blank")
    } else {
      appCommon.showtextalert("Error", "No document available to view.", "error")
    }
  }

  const handleDownloadReport = () => {
    if (gridData.length === 0) {
      appCommon.showtextalert("No Data", "There is no data to export.", "info");
      return;
    }
    const exportBtn = document.querySelector('.vendor-hidden-export button');
    if (exportBtn) {
      exportBtn.click();
    }
  };

  const confirmDeleteVendor = (vendor) => {
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
      if (value === "ok") {
        handleDeleteVendor(vendor.Id)
      }
    })
  }

  // Panel View Component
  const renderPanelView = () => (
    <div className="vendor-panel-container">
      {/* Left Panel - List */}
      <div className="vendor-panel-list">
        <div className="vendor-panel-list-header">
          <div className="vendor-panel-sort">
            <span>Sort By:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="name-asc">Name: Ascending Order</option>
              <option value="name-desc">Name: Descending Order</option>
              <option value="id-asc">ID: Low to High</option>
              <option value="id-desc">ID: High to Low</option>
            </select>
          </div>
        </div>
        <div className="vendor-panel-items">
          {filteredAndSortedData.length === 0 ? (
            <div className="vendor-panel-empty">
              <EmptyIcon />
              <h4>No vendors found</h4>
              <p>Add a new vendor to get started</p>
            </div>
          ) : (
            filteredAndSortedData.map(item => (
              <div
                key={item.Id}
                className={`vendor-panel-item ${selectedVendor?.Id === item.Id && pageMode !== 'Add' ? 'active' : ''}`}
                onClick={() => handleVendorSelect(item)}
              >
                <div
                  className="vendor-panel-item-avatar"
                  style={{ backgroundColor: item.VendorColor || '#336B93' }}
                >
                  {item.Name?.charAt(0)?.toUpperCase() || 'V'}
                </div>
                <div className="vendor-panel-item-content">
                  <h4 className="vendor-panel-item-name">{item.Name}</h4>
                  <p className="vendor-panel-item-desc">
                    {item.ContactPerson || 'No contact person'}
                  </p>
                </div>
                <span className="vendor-panel-item-id">ID: {item.Id}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Detail / Create Form */}
      <div className={`vendor-panel-detail ${pageMode === 'Add' ? 'vendor-panel-detail--creating' : ''}`}>
        {pageMode === 'Add' ? (
          // Create New Vendor Form
          <div className="vendor-create-form">
            <div className="vendor-create-form-scroll">
              <div className="vendor-create-header">
                <h3 className="vendor-create-title">New Vendor</h3>
                <button
                  type="button"
                  className="vendor-create-close-btn"
                  onClick={handleCancel}
                  title="Close"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Vendor Name Input */}
              <div className="vendor-create-name-section">
                <input
                  type="text"
                  id="Name"
                  className="vendor-name-input"
                  placeholder="Enter Vendor Name (Required)"
                  value={VendorData.Name}
                  onChange={handleInputChange}
                  autoFocus
                />
              </div>

              {/* Image Upload - Commented out for now
              <div className="vendor-image-upload">
                <label htmlFor="vendorImage" className="vendor-image-upload-area">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="vendor-image-preview" />
                  ) : (
                    <>
                      <CameraIcon />
                      <span>Add or drag pictures</span>
                    </>
                  )}
                  <input
                    type="file"
                    id="vendorImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              */}

              {/* Vendor Color */}
              <div className="vendor-form-section vendor-form-section-divider">
                <label className="vendor-form-label">Vendor Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    className="vendor-panel-item-avatar"
                    style={{
                      backgroundColor: VendorData.VendorColor || '#336B93',
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '20px',
                      flexShrink: 0,
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    {VendorData.Name?.charAt(0)?.toUpperCase() || 'V'}
                  </div>
                  <div className="vendor-color-picker">
                    {VENDOR_COLORS.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        className={`vendor-color-option ${VendorData.VendorColor === c.color ? 'selected' : ''} ${c.outline ? 'outline' : ''}`}
                        style={{
                          backgroundColor: c.outline ? 'transparent' : c.color,
                          borderColor: c.color
                        }}
                        onClick={() => handleColorSelect(c.color)}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="vendor-form-section vendor-form-section-divider">
                <label className="vendor-form-label">Description</label>
                <textarea
                  id="Description"
                  className="vendor-form-textarea"
                  placeholder="Add a description"
                  value={VendorData.Description || ''}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              {/* Contact Person */}
              <div className="vendor-form-section">
                <label className="vendor-form-label">Contact Person</label>
                <input
                  type="text"
                  id="ContactPerson"
                  className="vendor-form-input"
                  placeholder="Enter Contact Person"
                  value={VendorData.ContactPerson}
                  onChange={handleInputChange}
                />
              </div>

              {/* Contact Number & Email Row */}
              <div className="vendor-form-row">
                <div className="vendor-form-section">
                  <label className="vendor-form-label">Contact Number</label>
                  <input
                    type="tel"
                    id="ContactNumber"
                    className="vendor-form-input"
                    placeholder="Enter Contact Number"
                    value={VendorData.ContactNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="vendor-form-section">
                  <label className="vendor-form-label">Email</label>
                  <input
                    type="email"
                    id="Email"
                    className="vendor-form-input"
                    placeholder="Enter Email"
                    value={VendorData.Email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="vendor-form-section vendor-form-section-divider">
                <label className="vendor-form-label">Address</label>
                <textarea
                  id="Address"
                  className="vendor-form-textarea"
                  placeholder="Enter Address"
                  value={VendorData.Address}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              {/* GST Number & PAN Number Row */}
              <div className="vendor-form-row">
                <div className="vendor-form-section">
                  <label className="vendor-form-label">GST Number</label>
                  <input
                    type="text"
                    id="GSTNumber"
                    className="vendor-form-input"
                    placeholder="Enter GST Number"
                    value={VendorData.GSTNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="vendor-form-section">
                  <label className="vendor-form-label">PAN Number</label>
                  <input
                    type="text"
                    id="PANNumber"
                    className="vendor-form-input"
                    placeholder="Enter PAN Number"
                    value={VendorData.PANNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Pan Card Document */}
              <div className="vendor-form-section">
                <label className="vendor-form-label">Pan Card Document</label>
                <input
                  type="file"
                  id="PAN_DocumentPath"
                  ref={panFileRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="vendor-attach-btn"
                  onClick={() => panFileRef.current?.click()}
                >
                  <AttachIcon />
                  {selectedPANFile ? selectedPANFile.name : 'Attach file'}
                </button>
              </div>

              {/* GST Document */}
              <div className="vendor-form-section">
                <label className="vendor-form-label">GST Document</label>
                <input
                  type="file"
                  id="GST_DocumentPath"
                  ref={gstFileRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="vendor-attach-btn"
                  onClick={() => gstFileRef.current?.click()}
                >
                  <AttachIcon />
                  {selectedGSTFile ? selectedGSTFile.name : 'Attach file'}
                </button>
              </div>

              {/* Brochure */}
              <div className="vendor-form-section vendor-form-section-divider">
                <label className="vendor-form-label">Brochure</label>
                <input
                  type="file"
                  id="Brochure"
                  ref={brochureFileRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="vendor-attach-btn"
                  onClick={() => brochureFileRef.current?.click()}
                >
                  <AttachIcon />
                  {selectedBrochureFile ? selectedBrochureFile.name : 'Attach file'}
                </button>
              </div>

              {/* Website URL */}
              <div className="vendor-form-section vendor-form-section-divider">
                <label className="vendor-form-label">Website URL</label>
                <input
                  type="url"
                  id="WebsiteURL"
                  className="vendor-form-input"
                  placeholder="https://example.com"
                  value={VendorData.WebsiteURL}
                  onChange={handleInputChange}
                />
              </div>

            </div>

            {/* Create Button - Fixed at bottom */}
            <div className="vendor-create-actions">
              <button type="button" className="vendor-cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button type="button" className="vendor-create-btn" onClick={handleSave}>
                Create
              </button>
            </div>
          </div>
        ) : selectedVendor ? (
          // Vendor Detail View
          <>
            <div className="vendor-panel-detail-header">
              <div className="vendor-panel-detail-title">
                <div
                  className="vendor-detail-avatar"
                  style={{ backgroundColor: selectedVendor.VendorColor || '#336B93' }}
                >
                  {selectedVendor.Name?.charAt(0)?.toUpperCase() || 'V'}
                </div>
                <h3>{selectedVendor.Name}</h3>
              </div>
              <div className="vendor-panel-detail-actions">
                <button
                  className="vendor-detail-btn"
                  onClick={() => onGridEdit(selectedVendor.Id)}
                  title="Edit Vendor"
                >
                  <EditIcon />
                  Edit
                </button>
                <button
                  className="vendor-detail-btn delete"
                  onClick={() => confirmDeleteVendor(selectedVendor)}
                  title="Delete Vendor"
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>

            <p className="vendor-panel-detail-subtitle">
              Vendor ID: {selectedVendor.Id}
            </p>

            {/* Tabs */}
            <div className="vendor-detail-tabs">
              <button
                className={`vendor-detail-tab ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
            </div>

            {activeTab === 'details' && (
              <div className="vendor-detail-content">
                {/* Description */}
                {selectedVendor.Description && (
                  <div className="vendor-detail-section">
                    <h4>Description</h4>
                    <p className="vendor-detail-description-text">{selectedVendor.Description}</p>
                  </div>
                )}

                <div className="vendor-detail-section">
                  <h4>Contact Information</h4>
                  <div className="vendor-detail-grid">
                    <div className="vendor-detail-item">
                      <span className="vendor-detail-label">Contact Person</span>
                      <span className="vendor-detail-value">{selectedVendor.ContactPerson || '-'}</span>
                    </div>
                    <div className="vendor-detail-item">
                      <span className="vendor-detail-label">Phone</span>
                      <span className="vendor-detail-value">{selectedVendor.ContactNumber || '-'}</span>
                    </div>
                    <div className="vendor-detail-item">
                      <span className="vendor-detail-label">Email</span>
                      <span className="vendor-detail-value">{selectedVendor.Email || '-'}</span>
                    </div>
                    <div className="vendor-detail-item">
                      <span className="vendor-detail-label">Website</span>
                      <span className="vendor-detail-value">
                        {selectedVendor.WebsiteURL ? (
                          <a href={selectedVendor.WebsiteURL} target="_blank" rel="noopener noreferrer">
                            {selectedVendor.WebsiteURL}
                          </a>
                        ) : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="vendor-detail-section">
                  <h4>Business Details</h4>
                  <div className="vendor-detail-grid">
                    <div className="vendor-detail-item">
                      <span className="vendor-detail-label">Address</span>
                      <span className="vendor-detail-value">{selectedVendor.Address || '-'}</span>
                    </div>
                    <div className="vendor-detail-item">
                      <span className="vendor-detail-label">GST Number</span>
                      <span className="vendor-detail-value">{selectedVendor.GSTNumber || '-'}</span>
                    </div>
                    <div className="vendor-detail-item">
                      <span className="vendor-detail-label">PAN Number</span>
                      <span className="vendor-detail-value">{selectedVendor.PANNumber || '-'}</span>
                    </div>
                  </div>
                </div>

                {(selectedVendor.PAN_DocumentPath || selectedVendor.GST_DocumentPath || selectedVendor.Brochure) && (
                  <div className="vendor-detail-section">
                    <h4>Documents</h4>
                    <div className="vendor-documents-list">
                      {selectedVendor.PAN_DocumentPath && (
                        <button
                          className="vendor-document-btn"
                          onClick={() => viewDocument(selectedVendor.PAN_DocumentPath)}
                        >
                          <AttachIcon />
                          PAN Card
                        </button>
                      )}
                      {selectedVendor.GST_DocumentPath && (
                        <button
                          className="vendor-document-btn"
                          onClick={() => viewDocument(selectedVendor.GST_DocumentPath)}
                        >
                          <AttachIcon />
                          GST Document
                        </button>
                      )}
                      {selectedVendor.Brochure && (
                        <button
                          className="vendor-document-btn"
                          onClick={() => viewDocument(selectedVendor.Brochure)}
                        >
                          <AttachIcon />
                          Brochure
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="vendor-panel-empty-state">
            <div className="vendor-empty-illustration">
              <svg viewBox="0 0 200 200" fill="none" width="150" height="150">
                <rect x="40" y="30" width="120" height="140" rx="8" stroke="#336B93" strokeWidth="3" fill="#e8f4fc"/>
                <rect x="55" y="50" width="90" height="10" rx="2" fill="#336B93" opacity="0.3"/>
                <rect x="55" y="70" width="70" height="6" rx="2" fill="#336B93" opacity="0.2"/>
                <rect x="55" y="85" width="80" height="6" rx="2" fill="#336B93" opacity="0.2"/>
                <circle cx="100" cy="130" r="25" stroke="#336B93" strokeWidth="3" fill="white"/>
                <path d="M90 130 L97 137 L110 124" stroke="#336B93" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Start adding Vendors to your organization</h3>
            <p>Click "New Vendor" to add your first vendor</p>
          </div>
        )}
      </div>
    </div>
  );

  // Vendor approval modal columns
  const approvalColumns = [
    { key: 'Id', label: 'ID' },
    { key: 'Name', label: 'Name' },
    { key: 'ContactPerson', label: 'Contact Person' },
    { key: 'ContactNumber', label: 'Contact Number' },
    { key: 'Email', label: 'Email' },
  ];

  return (
    <>
      {/* Hidden ExportToCSV for Download Report */}
      <div className="vendor-hidden-export" style={{ display: 'none' }}>
        <ExportToCSV data={gridData} className="btn btn-success btn-sm" />
      </div>

      {/* Breadcrumb Navigation */}
      <div className="vendor-breadcrumb">
        <span className="breadcrumb-link">Inventory Management</span>
        <ChevronRightIcon />
        <span className="breadcrumb-current">Vendors</span>
      </div>

      {/* Approval Modal Dialog */}
      <ApprovalModal
        show={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        gridData={GridApproval}
        columns={approvalColumns}
        entityName="Vendor"
        onEdit={onGridEdit}
        onDelete={onGridDelete}
        onApprove={onGridApprove}
        onView={onGridView}
        onBulkApprove={handleVendorBulkApprove}
        onBulkReject={handleVendorBulkReject}
        bulkApproveInProgress={true}
        bulkRejectInProgress={true}
      />

      {pageMode === "Home" || pageMode === "Add" ? (
        <div className="row">
          <div className="col-12">
            {/* View Header with Toggle */}
            <div className="vendor-view-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="vendor-view-toggle">
                  <button
                    className={`vendor-view-toggle-btn ${viewMode === 'panel' ? 'active' : ''}`}
                    onClick={() => setViewMode('panel')}
                    title="Panel View"
                  >
                    <PanelViewIcon />
                    Panel View
                  </button>
                  <button
                    className={`vendor-view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                    title="Table View"
                  >
                    <TableViewIcon />
                    Table View
                  </button>
                </div>
              </div>
              <div className="vendor-header-actions">
                <ApprovalTriggerButton count={GridApproval.length} onClick={() => setShowApprovalModal(true)} />
                <div className="vendor-search-box">
                  <span className="search-icon">
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    placeholder="Search Vendors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  className="vendor-download-btn"
                  onClick={handleDownloadReport}
                >
                  <DownloadIcon />
                  Download Report
                </button>
                <button className="vendor-add-btn" onClick={Addnew}>
                  <PlusIcon />
                  New Vendor
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="vendor-filter-tabs">
              <button className="vendor-filter-tab">
                <AssetIcon />
                Asset
              </button>
              <button className="vendor-filter-tab">
                <LocationIcon />
                Location
              </button>
              <button className="vendor-filter-tab add-filter">
                <PlusIcon />
                Add Filter
              </button>
            </div>

            {/* Panel View */}
            <div style={{ display: viewMode === 'panel' ? 'block' : 'none' }}>
              {renderPanelView()}
            </div>

            {/* Table View */}
            <div style={{ display: viewMode === 'table' ? 'block' : 'none' }}>
              <div className="card vendor-table-card">
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
                    GridData={filteredAndSortedData}
                    pageSize="2000"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit Modal - MaintainX Style */}
      {pageMode === "Edit" && (
        <div className="vendor-modal-overlay">
          <div className="vendor-edit-modal">
            <div className="vendor-edit-modal-header">
              <div className="vendor-edit-modal-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div className="vendor-edit-modal-title-section">
                <h3>Edit Vendor</h3>
                <p>Update the vendor details below</p>
              </div>
              <button className="vendor-edit-modal-close" onClick={handleCancel}>
                <CloseIcon />
              </button>
            </div>
            <div className="vendor-edit-modal-body">
              {/* Vendor ID Badge */}
              <div className="vendor-id-badge">
                <span>Vendor ID: {VendorData.Id}</span>
              </div>

              <div className="vendor-edit-form-row">
                <div className="vendor-edit-form-group">
                  <label htmlFor="Name">Vendor Name <span className="required">*</span></label>
                  <input
                    id="Name"
                    required
                    placeholder="Enter Vendor Name"
                    type="text"
                    className="vendor-form-input"
                    value={VendorData.Name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="vendor-edit-form-group">
                  <label>Contact Person</label>
                  <input
                    id="ContactPerson"
                    placeholder="Enter Contact Person"
                    type="text"
                    className="vendor-form-input"
                    value={VendorData.ContactPerson}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="vendor-edit-form-row">
                <div className="vendor-edit-form-group full-width">
                  <label>Description</label>
                  <textarea
                    id="Description"
                    placeholder="Add a description"
                    className="vendor-form-textarea"
                    value={VendorData.Description || ''}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </div>

              <div className="vendor-edit-form-row">
                <div className="vendor-edit-form-group">
                  <label>Contact Number</label>
                  <input
                    id="ContactNumber"
                    placeholder="Enter Contact Number"
                    type="tel"
                    className="vendor-form-input"
                    value={VendorData.ContactNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="vendor-edit-form-group">
                  <label>Email</label>
                  <input
                    id="Email"
                    placeholder="Enter Email"
                    type="email"
                    className="vendor-form-input"
                    value={VendorData.Email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="vendor-edit-form-row">
                <div className="vendor-edit-form-group full-width">
                  <label>Address</label>
                  <textarea
                    id="Address"
                    placeholder="Enter Address"
                    className="vendor-form-textarea"
                    value={VendorData.Address}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>
              </div>

              <div className="vendor-edit-form-row">
                <div className="vendor-edit-form-group">
                  <label>GST Number</label>
                  <input
                    id="GSTNumber"
                    placeholder="Enter GST Number"
                    type="text"
                    className="vendor-form-input"
                    value={VendorData.GSTNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="vendor-edit-form-group">
                  <label>PAN Number</label>
                  <input
                    id="PANNumber"
                    placeholder="Enter PAN Number"
                    type="text"
                    className="vendor-form-input"
                    value={VendorData.PANNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="vendor-edit-form-row">
                <div className="vendor-edit-form-group">
                  <label>Website URL</label>
                  <input
                    id="WebsiteURL"
                    placeholder="https://example.com"
                    type="url"
                    className="vendor-form-input"
                    value={VendorData.WebsiteURL}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="vendor-edit-form-section-title">Documents</div>

              <div className="vendor-edit-form-row">
                <div className="vendor-edit-form-group">
                  <label>PAN Card Document</label>
                  <div className="vendor-file-input-wrapper">
                    <input
                      id="PAN_DocumentPath"
                      type="file"
                      ref={panFileRef}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="vendor-attach-btn"
                      onClick={() => panFileRef.current?.click()}
                    >
                      <AttachIcon />
                      {selectedPANFile ? selectedPANFile.name : 'Attach file'}
                    </button>
                    {VendorData.PAN_DocumentPath && !selectedPANFile && (
                      <small className="vendor-current-file">
                        Current: {typeof VendorData.PAN_DocumentPath === 'string' ? VendorData.PAN_DocumentPath.split("/").pop() : ''}
                      </small>
                    )}
                  </div>
                </div>
                <div className="vendor-edit-form-group">
                  <label>GST Document</label>
                  <div className="vendor-file-input-wrapper">
                    <input
                      id="GST_DocumentPath"
                      type="file"
                      ref={gstFileRef}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="vendor-attach-btn"
                      onClick={() => gstFileRef.current?.click()}
                    >
                      <AttachIcon />
                      {selectedGSTFile ? selectedGSTFile.name : 'Attach file'}
                    </button>
                    {VendorData.GST_DocumentPath && !selectedGSTFile && (
                      <small className="vendor-current-file">
                        Current: {typeof VendorData.GST_DocumentPath === 'string' ? VendorData.GST_DocumentPath.split("/").pop() : ''}
                      </small>
                    )}
                  </div>
                </div>
              </div>

              <div className="vendor-edit-form-row">
                <div className="vendor-edit-form-group">
                  <label>Brochure</label>
                  <div className="vendor-file-input-wrapper">
                    <input
                      id="Brochure"
                      type="file"
                      ref={brochureFileRef}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="vendor-attach-btn"
                      onClick={() => brochureFileRef.current?.click()}
                    >
                      <AttachIcon />
                      {selectedBrochureFile ? selectedBrochureFile.name : 'Attach file'}
                    </button>
                    {VendorData.Brochure && !selectedBrochureFile && (
                      <small className="vendor-current-file">
                        Current: {typeof VendorData.Brochure === 'string' ? VendorData.Brochure.split("/").pop() : ''}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="vendor-edit-modal-footer">
              <button className="vendor-modal-btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button className="vendor-modal-btn-primary" onClick={handleSave}>
                <EditIcon />
                Update Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {pageMode === "View" && (
        <div className="vendor-modal-overlay">
          <div className="vendor-view-modal">
            <div className="vendor-view-modal-header">
              <div
                className="vendor-view-avatar"
                style={{ backgroundColor: VendorData.VendorColor || '#336B93' }}
              >
                {VendorData.Name?.charAt(0)?.toUpperCase() || 'V'}
              </div>
              <div className="vendor-view-title-section">
                <h3>{VendorData.Name}</h3>
                <span className="vendor-view-id">ID: {VendorData.Id}</span>
              </div>
              <button className="vendor-edit-modal-close" onClick={handleCancel}>
                <CloseIcon />
              </button>
            </div>
            <div className="vendor-view-modal-body">
              <div className="vendor-view-section">
                <h4>Contact Information</h4>
                <div className="vendor-view-grid">
                  <div className="vendor-view-item">
                    <label>Contact Person</label>
                    <span>{VendorData.ContactPerson || '-'}</span>
                  </div>
                  <div className="vendor-view-item">
                    <label>Contact Number</label>
                    <span>{VendorData.ContactNumber || '-'}</span>
                  </div>
                  <div className="vendor-view-item">
                    <label>Email</label>
                    <span>{VendorData.Email || '-'}</span>
                  </div>
                  <div className="vendor-view-item">
                    <label>Website</label>
                    <span>
                      {VendorData.WebsiteURL ? (
                        <a href={VendorData.WebsiteURL} target="_blank" rel="noopener noreferrer">
                          {VendorData.WebsiteURL}
                        </a>
                      ) : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="vendor-view-section">
                <h4>Business Details</h4>
                <div className="vendor-view-grid">
                  <div className="vendor-view-item full-width">
                    <label>Address</label>
                    <span>{VendorData.Address || '-'}</span>
                  </div>
                  <div className="vendor-view-item">
                    <label>GST Number</label>
                    <span>{VendorData.GSTNumber || '-'}</span>
                  </div>
                  <div className="vendor-view-item">
                    <label>PAN Number</label>
                    <span>{VendorData.PANNumber || '-'}</span>
                  </div>
                </div>
              </div>

              {(VendorData.PAN_DocumentPath || VendorData.GST_DocumentPath || VendorData.Brochure) && (
                <div className="vendor-view-section">
                  <h4>Documents</h4>
                  <div className="vendor-view-documents">
                    {VendorData.PAN_DocumentPath && (
                      <button
                        className="vendor-doc-view-btn"
                        onClick={() => viewDocument(VendorData.PAN_DocumentPath)}
                      >
                        <AttachIcon />
                        View PAN Card
                      </button>
                    )}
                    {VendorData.GST_DocumentPath && (
                      <button
                        className="vendor-doc-view-btn"
                        onClick={() => viewDocument(VendorData.GST_DocumentPath)}
                      >
                        <AttachIcon />
                        View GST Document
                      </button>
                    )}
                    {VendorData.Brochure && (
                      <button
                        className="vendor-doc-view-btn"
                        onClick={() => viewDocument(VendorData.Brochure)}
                      >
                        <AttachIcon />
                        View Brochure
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="vendor-view-modal-footer">
              <button className="vendor-modal-btn-secondary" onClick={handleCancel}>
                Close
              </button>
              <button className="vendor-modal-btn-primary" onClick={() => onGridEdit(VendorData.Id)}>
                <EditIcon />
                Edit Vendor
              </button>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
};

export default Vendor;
