"use client";

import React, { useRef, useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { TabView, TabPanel } from "primereact/tabview";
import { Calendar } from "primereact/calendar";
import { PrimeReactProvider } from "primereact/api";
import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { useSelector } from "react-redux";
import { getAllDesignations } from "../../Services/DesignationService";

import FacilityService, {
  getEmployeesByOffice,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../Services/FacilityService";

// Import existing components from old project
import SalaryGroupView from "../../ReactComponents/DataGrid/SalaryGroupView.jsx";
import LoanAdvanceDialog from "../../ReactComponents/DataGrid/LoanAdvances.jsx";
const getSalaryGroupsByDesignation = async (propertyId, designation) => {
  const encodedDesignation = encodeURIComponent(designation);
  const response = await fetch(
    `https://api.urest.in:8096/api/salaryallowances/byDesignationFull/${propertyId}/${encodedDesignation}`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return await response.json();
};

const StaffPage = () => {
  const toast = useRef(null);
  const propertyId = useSelector((state) => state.Commonreducer.puidn);
  const [customDesignation, setCustomDesignation] = useState("");
  const [designations, setDesignations] = useState([]);
  const [isLoadingDesignations, setIsLoadingDesignations] = useState(false);
  const [salaryGroups, setSalaryGroups] = useState([]);
const [selectedSalaryGroup, setSelectedSalaryGroup] = useState(null);
const [isLoadingSalaryGroups, setIsLoadingSalaryGroups] = useState(false);
const [showSalaryGroupPopup, setShowSalaryGroupPopup] = useState(false);
const [salaryGroupDetails, setSalaryGroupDetails] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEmployeeId, setEditEmployeeId] = useState(null);

  // Salary & Loan dialog states
  const [showSalaryGroupView, setShowSalaryGroupView] = useState(false);
  const [selectedFacilityMemberId, setSelectedFacilityMemberId] = useState(null);
  const [selectedFacilityMemberName, setSelectedFacilityMemberName] = useState("");
  const [showLoanAdvanceDialog, setShowLoanAdvanceDialog] = useState(false);
  const [selectedLoanAdvanceId, setSelectedLoanAdvanceId] = useState(null);

  // Form fields
  const [employeeCode, setEmployeeCode] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [designation, setDesignation] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [aadharCard, setAadharCard] = useState("");
  const [panCard, setPanCard] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIFSCCode, setBankIFSCCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [uanNumber, setUanNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [pfNumber, setPfNumber] = useState("");
  const [esiNumber, setEsiNumber] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [family, setFamily] = useState("");

  const [workHistories, setWorkHistories] = useState([
    {
      CompanyName: "",
      Role: "",
      StartDate: null,
      EndDate: null,
      ThirdPartyVerification: false,
      UploadResume: null,
      ResumeUrl: "",
    },
  ]);

  const genders = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ];

  const employmentTypes = [
    { label: "Permanent", value: "Permanent" },
    { label: "Contractual", value: "Contractual" }
  ];

const fetchEmployee = async () => {
      try {
        const data = await getEmployeesByOffice(propertyId);
        setStaff(Array.isArray(data) ? data : [data]);
      } catch (err) {
        toast.current.show({ severity: "error", summary: "Error", detail: "Failed to load staff" });
      } finally {
        setLoading(false);
      }
    };

// ADD THIS FUNCTION
const fetchSalaryGroups = async (designation) => {
  if (!designation || !propertyId || designation === "OTHER") {
    setSalaryGroups([]);
    setSelectedSalaryGroup(null);
    return;
  }

  setIsLoadingSalaryGroups(true);
  try {
    const data = await getSalaryGroupsByDesignation(propertyId, designation);
    const formatted = Array.isArray(data)
      ? data.map(sg => ({
          label: sg.SalaryGroup,
          value: sg.SalaryGroup_ID,
          data: sg
        }))
      : [];
    setSalaryGroups(formatted);
  } catch (err) {
    console.error("[SALARY_GROUP_FETCH_ERR]", err);
    toast.current?.show({
      severity: "warn",
      summary: "Warning",
      detail: "Failed to load salary groups"
    });
    setSalaryGroups([]);
  } finally {
    setIsLoadingSalaryGroups(false);
  }
};
  // Load staff
useEffect(() => {
    const loadInitialData = async () => {
      // Fetch designations
      setIsLoadingDesignations(true);
      try {
        const designationsData = await getAllDesignations();
        const formatted = Array.isArray(designationsData)
          ? designationsData.map(d => ({ 
              label: d.DesignationName || d.Designation || d, 
              value: d.DesignationName || d.Designation || d 
            }))
          : [];
        
        // Always include OTHER option
        formatted.push({ label: "OTHER", value: "OTHER" });
        
        setDesignations(formatted);
      } catch (err) {
        console.error("[DESIGNATION_FETCH_ERR]", err);
        toast.current?.show({ 
          severity: "warn", 
          summary: "Warning", 
          detail: "Using default designations" 
        });
        // Fallback to hardcoded options
        setDesignations([
          { label: "H.K. SUPERVISOR", value: "H.K. SUPERVISOR" },
          { label: "TECHNICAL SUPERVISOR", value: "TECHNICAL SUPERVISOR" },
          { label: "OTHER", value: "OTHER" },
        ]);
      } finally {
        setIsLoadingDesignations(false);
      }

      // Fetch employees
      if (propertyId) fetchEmployee();
    };

    loadInitialData();
  }, [propertyId]);

  // Salary & Loan actions
  const openSalaryGroupView = (row) => {
    const memberId = String(row.FacilityMember.FacilityMemberId);
    const memberName = row.Profile?.EmployeeName || "";
    setSelectedFacilityMemberId(memberId);
    setSelectedFacilityMemberName(memberName);
    setShowSalaryGroupView(true);
  };

  const closeSalaryGroupView = () => {
    setShowSalaryGroupView(false);
    setSelectedFacilityMemberId(null);
  };
  // Convert JS Date to IST ISO String
  const toISTISOString = (date) => {
    if (!date) return null;
    const dt = new Date(date);
    const offsetIST = 5.5 * 60 * 60 * 1000; // IST offset (+5:30)
    const istTime = new Date(dt.getTime() + offsetIST);
    return istTime.toISOString().slice(0, 19); // remove 'Z'
  };

  const openLoanAdvanceDialog = (row) => {
    const memberId = row.FacilityMember.FacilityMemberId;
    setSelectedLoanAdvanceId(memberId);
    setShowLoanAdvanceDialog(true);
  };

  const closeLoanAdvanceDialog = () => {
    setShowLoanAdvanceDialog(false);
    setSelectedLoanAdvanceId(null);
  };

  const viewStaff = (row) => {
    setViewData(row);
    setViewDialogVisible(true);
  };

  const openDialog = () => {
    resetForm();
    setDialogVisible(true);
  };

  const resetForm = () => {
    setEmployeeCode("");
    setEmployeeName("");
    setDesignation("");
    setGender("");
    setMobile("");
    setEmail("");
    setDepartment("");
    setDateOfBirth("");
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setStateName("");
    setAadharCard("");
    setPanCard("");
    setBankAccountNumber("");
    setBankIFSCCode("");
    setBankName("");
    setUanNumber("");
    setPanNumber("");
    setPfNumber("");
    setEsiNumber("");
    setProfileImage(null);
    setFamily("");
    setWorkHistories([
      {
        CompanyName: "",
        Role: "",
        StartDate: null,
        EndDate: null,
        ThirdPartyVerification: false,
        UploadResume: null,
        ResumeUrl: "",
      },
    ]);
    setIsEditMode(false);
    setEditEmployeeId(null);
        setSalaryGroups([]);
    setSelectedSalaryGroup(null);
    setSalaryGroupDetails(null);
  };

  const openEditDialog = (row) => {
    setIsEditMode(true);
    setEditEmployeeId(row?.FacilityMember?.FacilityMemberId || "");

    // Profile Info
    const profile = row?.Profile || {};
    setEmployeeCode(profile.EmployeeCode || "");
    setEmployeeName(profile.EmployeeName || "");
    setDesignation(profile.EmploymentType || "");
    setEmail(profile.Email || "");
    setMobile(profile.PhoneNumber || "");
    setDepartment(profile.Department || profile.Designation || "");
    setGender(profile.Gender || "");
    setDateOfBirth(profile.DateOfBirth ? profile.DateOfBirth.slice(0, 10) : "");
    setPanCard(profile.PanCard || "");
    setAadharCard(profile.AadharCard || "");
    setAddressLine1(profile.AddressLine1 || "");
    setAddressLine2(profile.AddressLine2 || "");
    setCity(profile.City || "");
    setStateName(profile.State || "");
    setSelectedFacilityMemberId(row?.FacilityMember?.FacilityMemberId || "");

    // Work History - Handle both single and array
    if (row?.WorkHistories && Array.isArray(row.WorkHistories) && row.WorkHistories.length > 0) {
      setWorkHistories(
        row.WorkHistories.map((wh) => ({
          CompanyName: wh.CompanyName || "",
          Role: wh.Role || "",
          StartDate: wh.StartDate ? new Date(wh.StartDate) : null,
          EndDate: wh.EndDate ? new Date(wh.EndDate) : null,
          ThirdPartyVerification: wh.ThirdPartyVerification || false,
          UploadResume: null,
          ResumeUrl: wh.UploadResume || "",
        }))
      );
    } else {
      setWorkHistories([
        {
          CompanyName: "",
          Role: "",
          StartDate: null,
          EndDate: null,
          ThirdPartyVerification: false,
          UploadResume: null,
          ResumeUrl: "",
        },
      ]);
    }

    // Financial Info
    const fin = row?.FinancialInfo || {};
    setBankAccountNumber(fin.BankAccountNumber || "");
    setBankIFSCCode(fin.BankIFSCCode || "");
    setBankName(fin.BankName || "");
    setUanNumber(fin.UANNumber || "");
    setPanNumber(fin.PANNumber || "");
    setPfNumber(fin.PFNumber || "");
    setEsiNumber(fin.ESINumber || "");

    // Employee List
    const empList = row?.EmployeeList || {};
    setFamily(empList.FatherName || "");

    setDialogVisible(true);
  };

  // Work History handlers
  const addWorkHistory = () => {
    setWorkHistories([
      ...workHistories,
      {
        CompanyName: "",
        Role: "",
        StartDate: null,
        EndDate: null,
        ThirdPartyVerification: false,
        UploadResume: null,
        ResumeUrl: "",
      },
    ]);
  };

  const removeWorkHistory = (index) => {
    setWorkHistories(workHistories.filter((_, i) => i !== index));
  };

  const handleWorkHistoryChange = (index, field, value) => {
    const updated = [...workHistories];
    updated[index][field] = value;
    setWorkHistories(updated);
  };

  const saveStaff = async () => {
    // Validation
    if (!employeeName?.trim() || !employeeCode?.trim() || !mobile?.trim() || !gender) {
      toast.current.show({
        severity: "warn",
        summary: "Validation",
        detail: "Please fill all required fields (Name, Code, Mobile, Gender)"
      });
      return;
    }

    // Validate mobile number format (basic check)
    if (!/^\d{10}$/.test(mobile.trim())) {
      toast.current.show({
        severity: "warn",
        summary: "Validation",
        detail: "Please enter a valid 10-digit mobile number"
      });
      return;
    }

    let profileImageUrl = "";

    // Upload Profile Image if exists
    if (profileImage && profileImage instanceof File) {
      if (!["image/jpeg", "image/png"].includes(profileImage.type)) {
        toast.current.show({
          severity: "warn",
          summary: "Validation",
          detail: "Only JPG or PNG images are allowed",
        });
        return;
      }

      try {
        const formData = new FormData();
        formData.append("images", profileImage);

        const res = await fetch("http://194.238.18.39:8000/upload/", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.uploaded?.length) throw new Error("Image upload failed");
        profileImageUrl = data.uploaded[0];
      } catch (err) {
        console.error("Image upload error:", err);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to upload profile image",
        });
        return;
      }
    }

    // Upload all resumes
    let updatedWorkHistories = [...workHistories];

    for (let i = 0; i < updatedWorkHistories.length; i++) {
      const item = updatedWorkHistories[i];

      if (item.UploadResume && item.UploadResume instanceof File) {
        try {
          const formData = new FormData();
          formData.append("file", item.UploadResume);

          const res = await fetch("https://api.urest.in:8096/api/employee/upload-resume", {
            method: "POST",
            body: formData,
          });

          const url = await res.json();

          if (!res.ok || typeof url !== "string") {
            throw new Error("Resume upload failed");
          }

          updatedWorkHistories[i] = {
            ...item,
            ResumeUrl: url,
          };
        } catch (err) {
          console.error("Resume upload error:", err);
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to upload resume",
          });
          return;
        }
      }
    }

    // Filter valid work histories
    const validWorkHistories = updatedWorkHistories.filter(wh =>
      wh.CompanyName.trim() !== "" ||
      wh.Role.trim() !== "" ||
      wh.StartDate !== null ||
      wh.EndDate !== null
    );

    // Format work histories
    const now = toISTISOString(new Date());
    const formattedWorkHistories = validWorkHistories.map((wh) => ({
      CompanyName: wh.CompanyName,
      Role: wh.Role,
      StartDate: wh.StartDate ? toISTISOString(wh.StartDate) : null,
      EndDate: wh.EndDate ? toISTISOString(wh.EndDate) : null,
      ThirdPartyVerification: wh.ThirdPartyVerification,
      UploadResume: wh.ResumeUrl || "",
      CreatedOn: now,
      UpdatedOn: now,
      IsActive: true,
    }));

    // Determine Facility Master ID based on department
    let facilityMasterId = 0;
    if (department === "H.K. SUPERVISOR") facilityMasterId = 19;
    else if (department === "TECHNICAL SUPERVISOR") facilityMasterId = 34;

    // Build Payload matching backend structure
    const dobValue = dateOfBirth
      ? toISTISOString(dateOfBirth)
      : toISTISOString('1900-01-01');

    const employeeData = {
      Profile: {
        OfficeId: propertyId,
        EmployeeCode: employeeCode,
        EmployeeName: employeeName,
        EmploymentType: designation,
        CreatedOn: now,
        UpdatedOn: now,
        IsActive: true,
        Email: email || "",
        PhoneNumber: mobile,
        Designation: department === "OTHER" ? customDesignation : department,
        Department: department === "OTHER" ? customDesignation : department,
        Gender: gender,
        DateOfBirth: dobValue,
        PanCard: panCard || "",
        AadharCard: aadharCard || "",
        AddressLine1: addressLine1 || "",
        AddressLine2: addressLine2 || "",
        City: city || "",
        State: stateName || "",
      },

      WorkHistories: formattedWorkHistories,

      // Backend still expects WorkHistory single object for compatibility
      WorkHistory: formattedWorkHistories[0] || {},

      FinancialInfo: {
        BankAccountNumber: bankAccountNumber || "",
        BankIFSCCode: bankIFSCCode || "",
        BankName: bankName || "",
        UANNumber: uanNumber || "",
        PANNumber: panNumber || "",
        PFNumber: pfNumber || "",
        ESINumber: esiNumber || "",
        CreatedOn: now,
        UpdatedOn: now,
        IsActive: true,
      },

      FacilityMember: {
        FacilityMemberId: selectedFacilityMemberId || 0,
        PropertyId: propertyId || 0,
        Address: (addressLine1 + " " + addressLine2).trim() || "",
        FacilityMasterId: facilityMasterId,
        ProfileImageUrl: profileImageUrl || "",
        IsBlocked: false,
        AccessCode: "",
        IsApproved: true,
        ApprovedOn: now,
        ApprovedBy: 1,
        IsActive: true,
        IsDeleted: false,
        CreatedBy: 1,
        CreatedOn: now,
        UpdatedBy: 1,
        UpdatedOn: now,
        oldID: "0",
        SG_Link_ID: "0",
        tax_amount: 0,
      },

      EmployeeList: {
        FatherName: family || "",
        IsDeleted: false,
        Approved: true,
        Designation: department === "OTHER" ? customDesignation : department
      },
    };

    try {
      if (isEditMode) {
        await updateEmployee(editEmployeeId, employeeData);
        toast.current.show({
          severity: "success",
          summary: "Updated",
          detail: "Staff updated successfully"
        });

        // Refresh the list
        await fetchEmployee();
      } else {
        const response = await createEmployee(employeeData);
        toast.current.show({
          severity: "success",
          summary: "Added",
          detail: "Staff member added successfully"
        });

        // Refresh the list
        await fetchEmployee();
      }

      setDialogVisible(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: isEditMode ? "Failed to update employee" : "Failed to create employee",
      });
    }
  };

  const deleteStaff = async (selectedRow) => {
    if (!selectedRow) return;

    try {
      await deleteEmployee(selectedRow.FacilityMember.FacilityMemberId);
      setStaff(staff.filter(s =>
        s.FacilityMember.FacilityMemberId !== selectedRow.FacilityMember.FacilityMemberId
      ));
      toast.current.show({
        severity: "success",
        summary: "Deleted",
        detail: "Staff deleted successfully"
      });
      setSelectedRow(null);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete staff"
      });
    }
  };

  const header = (
    <div className="d-flex justify-content-between align-items-center p-2">
      <h5 className="m-0">Facility Member</h5>
      <div className="d-flex align-items-center gap-2">
        {selectedRow && (
          <>
            <Button
              icon="pi pi-pencil"
              className="p-button-text p-button-info"
              onClick={() => openEditDialog(selectedRow)}
              tooltip="Edit Staff"
            />
            <Button
              icon="pi pi-trash"
              className="p-button-text p-button-danger"
              onClick={() => deleteStaff(selectedRow)}
              tooltip="Delete Staff"
            />
            <Button
              icon="pi pi-eye"
              className="p-button-text p-button-help"
              onClick={() => viewStaff(selectedRow)}
              tooltip="View Staff"
            />
            <Button
              icon="pi pi-wallet"
              className="p-button-text p-button-warning"
              tooltip="View Salary"
              onClick={() => openSalaryGroupView(selectedRow)}
            />
            <Button
              icon="pi pi-credit-card"
              className="p-button-text p-button-secondary"
              tooltip="View Loan Advances"
              onClick={() => openLoanAdvanceDialog(selectedRow)}
            />
          </>
        )}

        <div className="p-input-left">

          <InputText
            value={globalFilterValue}
            onChange={(e) => setGlobalFilterValue(e.target.value)}
            placeholder="Search..."
          />
        </div>

        <Button
          label="Add Staff"
          icon="pi pi-plus"
          onClick={openDialog}
          className="p-button-success"
        />
      </div>
    </div>
  );

  // Allow selecting and deselecting a row
const handleRowSelection = (e) => {
  if (selectedRow?.FacilityMember?.FacilityMemberId === e.value?.FacilityMember?.FacilityMemberId) {
    // clicking same row → DESELECT
    setSelectedRow(null);
  } else {
    setSelectedRow(e.value);
  }
};

  return (
    <PrimeReactProvider>
      <div className="content-wrapper">
      <section className="content">
        <div className="container-fluid">
          <Toast ref={toast} />

          <div className="card">
            <div className="p-3">
              <DataTable
                value={staff}
                dataKey="FacilityMember.FacilityMemberId"
                header={header}
                paginator
                rows={10}
                loading={loading}
                responsiveLayout="scroll"
                emptyMessage="No staff found."
                selection={selectedRow}
                onSelectionChange={handleRowSelection}
                globalFilter={globalFilterValue}
                globalFilterFields={[
                  "Profile.EmployeeName",
                  "Profile.Gender",
                  "Profile.PhoneNumber",
                  "FacilityMember.AccessCode"
                ]}
              >
                <Column selectionMode="single" headerStyle={{ width: '3em' }} />
                <Column header="Employee Code" body={(row) => row.Profile?.EmployeeCode || "-"} />
                <Column header="Name" body={(row) => row.Profile?.EmployeeName || "-"} />
                <Column header="Department" body={(row) => row.Profile?.Department || "-"} />
                <Column header="Gender" body={(row) => row.Profile?.Gender || "-"} />
                <Column header="Contact" body={(row) => row.Profile?.PhoneNumber || "-"} />
                <Column header="Access Code" body={(row) => row.FacilityMember?.AccessCode || "-"} />
                <Column header="Approved" body={(row) => row.FacilityMember?.IsApproved ? "Yes" : "No"} />
              </DataTable>
            </div>

            {showSalaryGroupView && (
              <SalaryGroupView
                propertyId={propertyId}
                facilityMemberId={String(selectedFacilityMemberId)}
                employeeName={selectedFacilityMemberName}
                onClose={closeSalaryGroupView}
              />
            )}

            {showLoanAdvanceDialog && (
              <LoanAdvanceDialog
                show={showLoanAdvanceDialog}
                onClose={closeLoanAdvanceDialog}
                facilityMemberId={selectedLoanAdvanceId}
              />
            )}
          </div>
        </div>
      </section>

      {/* Add/Edit Dialog */}
      <Dialog
        header={isEditMode ? "Edit Facility Member" : "Add Facility Member"}
        visible={dialogVisible}
        style={{ width: "800px" }}
        modal
        onHide={() => {
          setDialogVisible(false);
          resetForm();
        }}
        footer={
          <div className="d-flex justify-content-end gap-2">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => {
                setDialogVisible(false);
                resetForm();
              }}
            />
            <Button
              label={isEditMode ? "Update" : "Save"}
              icon="pi pi-check"
              onClick={saveStaff}
            />
          </div>
        }
      >
        <TabView>
          {/* Personal Details */}
          <TabPanel header="Personal Details">
            <div className="p-fluid">
              <label>Employee Code *</label>
              <InputText
                placeholder="Employee Code"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                className="mb-3"
              />

              <label>Employee Name *</label>
              <InputText
                placeholder="Employee Name"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="mb-3"
              />

              <label>Employment Type</label>
              <Dropdown
                placeholder="Select Employment Type"
                value={designation}
                options={employmentTypes}
                onChange={(e) => setDesignation(e.value)}
                className="mb-3"
              />

              <label>Email</label>
              <InputText
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-3"
              />

              <label>Mobile *</label>
              <InputText
                placeholder="Mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="mb-3"
              />

              <label>Department/Designation</label>
              <div className="d-flex gap-2 mb-3">
                <Dropdown
                  placeholder={isLoadingDesignations ? "Loading..." : "Select Department"}
                  value={department}
                  options={designations}
                  onChange={(e) => {
                    setDepartment(e.value);
                    fetchSalaryGroups(e.value);
                  }}
                  style={{ flex: 1 }}
                  disabled={isLoadingDesignations}
                  emptyMessage="No designations available"
                />

                {salaryGroups.length > 0 && (
                  <Dropdown
                    placeholder={isLoadingSalaryGroups ? "Loading..." : "Select Salary Group"}
                    value={selectedSalaryGroup}
                    options={salaryGroups}
                    onChange={(e) => {
                      setSelectedSalaryGroup(e.value);
                      const selected = salaryGroups.find(sg => sg.value === e.value);
                      if (selected) {
                        setSalaryGroupDetails(selected.data);
                        setShowSalaryGroupPopup(true);
                      }
                    }}
                    style={{ flex: 1 }}
                    disabled={isLoadingSalaryGroups}
                    emptyMessage="No salary groups available"
                  />
                )}
              </div>

              {department === "OTHER" && (
                <InputText
                  placeholder="Enter Custom Department / Designation"
                  value={customDesignation}
                  onChange={(e) => setCustomDesignation(e.target.value)}
                  className="mb-3"
                />
              )}

              <label>Gender *</label>
              <Dropdown
                placeholder="Select Gender"
                value={gender}
                options={genders}
                onChange={(e) => setGender(e.value)}
                className="mb-3"
              />

              <label>Date of Birth</label>
              <InputText
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="mb-3"
              />

              <label>Father's Name</label>
              <InputText
                placeholder="Father's Name"
                value={family}
                onChange={(e) => setFamily(e.target.value)}
                className="mb-3"
              />

              <label>Pan Card</label>
              <InputText
                placeholder="Pan Card"
                value={panCard}
                onChange={(e) => setPanCard(e.target.value)}
                className="mb-3"
              />

              <label>Aadhar Card</label>
              <InputText
                placeholder="Aadhar Card"
                value={aadharCard}
                onChange={(e) => setAadharCard(e.target.value)}
                className="mb-3"
              />

              <label>Address Line 1</label>
              <InputText
                placeholder="Address Line 1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className="mb-3"
              />

              <label>Address Line 2</label>
              <InputText
                placeholder="Address Line 2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                className="mb-3"
              />

              <label>City</label>
              <InputText
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mb-3"
              />

              <label>State</label>
              <InputText
                placeholder="State"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className="mb-3"
              />

              <label>Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileImage(e.target.files[0])}
                className="form-control mb-3"
              />
            </div>
          </TabPanel>

          {/* Bank Details */}
          <TabPanel header="Bank Details">
            <div className="p-fluid">
              <label>Bank Account Number</label>
              <InputText
                placeholder="Bank Account Number"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                className="mb-3"
              />

              <label>Bank IFSC Code</label>
              <InputText
                placeholder="Bank IFSC Code"
                value={bankIFSCCode}
                onChange={(e) => setBankIFSCCode(e.target.value)}
                className="mb-3"
              />

              <label>Bank Name</label>
              <InputText
                placeholder="Bank Name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="mb-3"
              />

              <label>UAN Number</label>
              <InputText
                placeholder="UAN Number"
                value={uanNumber}
                onChange={(e) => setUanNumber(e.target.value)}
                className="mb-3"
              />

              <label>PAN Number</label>
              <InputText
                placeholder="PAN Number"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                className="mb-3"
              />

              <label>PF Number</label>
              <InputText
                placeholder="PF Number"
                value={pfNumber}
                onChange={(e) => setPfNumber(e.target.value)}
                className="mb-3"
              />

              <label>ESI Number</label>
              <InputText
                placeholder="ESI Number"
                value={esiNumber}
                onChange={(e) => setEsiNumber(e.target.value)}
                className="mb-3"
              />
            </div>
          </TabPanel>

          {/* Work History */}
          <TabPanel header="Work History">
            <div className="p-fluid">
              {workHistories.map((history, index) => (
                <div key={index} className="border rounded p-3 mb-3 shadow-sm bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="m-0">Work History #{index + 1}</h6>
                    {workHistories.length > 1 && (
                      <Button
                        icon="pi pi-times"
                        className="p-button-text p-button-danger"
                        onClick={() => removeWorkHistory(index)}
                        tooltip="Remove this record"
                      />
                    )}
                  </div>

                  <label>Company Name</label>
                  <InputText
                    placeholder="Company Name"
                    value={history.CompanyName}
                    onChange={(e) =>
                      handleWorkHistoryChange(index, "CompanyName", e.target.value)
                    }
                    className="mb-3"
                  />

                  <label>Role</label>
                  <InputText
                    placeholder="Role"
                    value={history.Role}
                    onChange={(e) =>
                      handleWorkHistoryChange(index, "Role", e.target.value)
                    }
                    className="mb-3"
                  />

                  <label>Start Date</label>
                  <Calendar
                    placeholder="Start Date"
                    value={history.StartDate}
                    onChange={(e) =>
                      handleWorkHistoryChange(index, "StartDate", e.value)
                    }
                    className="mb-3 w-full"
                    dateFormat="dd-mm-yy"
                    showIcon
                  />

                  <label>End Date</label>
                  <Calendar
                    placeholder="End Date"
                    value={history.EndDate}
                    onChange={(e) =>
                      handleWorkHistoryChange(index, "EndDate", e.value)
                    }
                    className="mb-3 w-full"
                    dateFormat="dd-mm-yy"
                    showIcon
                  />

                  <div className="flex align-items-center mb-3">
                    <Checkbox
                      inputId={`tpv-${index}`}
                      checked={history.ThirdPartyVerification}
                      onChange={(e) =>
                        handleWorkHistoryChange(index, "ThirdPartyVerification", e.checked)
                      }
                    />
                    <label htmlFor={`tpv-${index}`} className="ml-2">
                      Third Party Verification
                    </label>
                  </div>

                  <div className="mb-2">
                    <label className="block mb-1">Upload Resume</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        handleWorkHistoryChange(index, "UploadResume", e.target.files[0])
                      }
                      className="form-control"
                    />
                    {history.ResumeUrl && (
                      <small className="text-success d-block mt-1">
                        Previously uploaded: {history.ResumeUrl.split('/').pop()}
                      </small>
                    )}
                  </div>
                </div>
              ))}

              <Button
                label="Add Another Company"
                icon="pi pi-plus"
                className="p-button-text p-button-success mt-2"
                onClick={addWorkHistory}
              />
            </div>
          </TabPanel>
        </TabView>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        header="View Facility Member"
        visible={viewDialogVisible}
        style={{ width: "800px" }}
        modal
        onHide={() => setViewDialogVisible(false)}
      >
        {viewData && (
          <TabView>
            <TabPanel header="Personal Details">
              <div className="p-fluid">
                <label>Employee Code</label>
                <InputText
                  value={viewData.Profile?.EmployeeCode || ""}
                  readOnly
                  className="mb-3"
                />

                <label>Employee Name</label>
                <InputText
                  value={viewData.Profile?.EmployeeName || ""}
                  readOnly
                  className="mb-3"
                />

                <label>Employment Type</label>
                <InputText
                  value={viewData.Profile?.EmploymentType || ""}
                  readOnly
                  className="mb-3"
                />

                <label>Email</label>
                <InputText
                  value={viewData.Profile?.Email || ""}
                  readOnly
                  className="mb-3"
                />

                <label>Mobile</label>
                <InputText
                  value={viewData.Profile?.PhoneNumber || ""}
                  readOnly
                  className="mb-3"
                />

                <label>Department</label>
                <InputText
                  value={viewData.Profile?.Department || ""}
                  readOnly
                  className="mb-3"
                />

                <label>Designation</label>
                <InputText
                  value={viewData.Profile?.Designation || ""}
                  readOnly
                  className="mb-3"
                />

                <label>Gender</label>
                <InputText
                  value={viewData.Profile?.Gender || ""}
                  readOnly
                  className="mb-3"
                />

                <label>Date of Birth</label>
                <InputText
                  value={viewData.Profile?.DateOfBirth ? viewData.Profile.DateOfBirth.slice(0, 10) : ""}
                  readOnly
                  className="mb-3"
                />

                <label>Father's Name</label>
                <InputText
                  value={viewData.EmployeeList?.FatherName || ""}
                  readOnly
                  className="mb-3"
                />

                <label>Pan Card</label>
                <InputText
                  value={viewData.Profile?.PanCard || ""}
                  readOnly
                  className="mb-3"
                />

                <label>Aadhar Card</label>
                <InputText
                  value={viewData.Profile?.AadharCard || ""}
                  readOnly
                  className="mb-3"
                />

                <label>Address Line 1</label>
                <InputText
                  value={viewData.Profile?.AddressLine1 || ""}
                  readOnly
                  className="mb-3"
                />

                <label>Address Line 2</label>
                <InputText
                  value={viewData.Profile?.AddressLine2 || ""}
                  readOnly
                  className="mb-3"
                />

                <label>City</label>
                <InputText
                  value={viewData.Profile?.City || ""}
                  readOnly
                  className="mb-3"
                />

                <label>State</label>
                <InputText
                  value={viewData.Profile?.State || ""}
                  readOnly
                  className="mb-3"
                />
              </div>
            </TabPanel>

            <TabPanel header="Bank Details">
              <div className="p-fluid">
                <label>Bank Account Number</label>
                <InputText
                  value={viewData?.FinancialInfo?.BankAccountNumber || ""}
                  readOnly
                  className="mb-3"
                />

                <label>Bank IFSC Code</label>
                <InputText
                  value={viewData?.FinancialInfo?.BankIFSCCode || ""}
                  readOnly
                  className="mb-3"
                />

                <label>Bank Name</label>
                <InputText
                  value={viewData?.FinancialInfo?.BankName || ""}
                  readOnly
                  className="mb-3"
                />

                <label>UAN Number</label>
                <InputText
                  value={viewData?.FinancialInfo?.UANNumber || ""}
                  readOnly
                  className="mb-3"
                />

                <label>PAN Number</label>
                <InputText
                  value={viewData?.FinancialInfo?.PANNumber || ""}
                  readOnly
                  className="mb-3"
                />

                <label>PF Number</label>
                <InputText
                  value={viewData?.FinancialInfo?.PFNumber || ""}
                  readOnly
                  className="mb-3"
                />

                <label>ESI Number</label>
                <InputText
                  value={viewData?.FinancialInfo?.ESINumber || ""}
                  readOnly
                  className="mb-3"
                />
              </div>
            </TabPanel>


            <TabPanel header="Work History">
              <div className="p-fluid">
                {(() => {
                  // detect multiple or single history
                  const histories = Array.isArray(viewData?.WorkHistories)
                    ? viewData.WorkHistories
                    : viewData?.WorkHistory
                      ? [viewData.WorkHistory]
                      : [];

                  return histories.length > 0 ? (
                    histories.map((wh, index) => (
                      <div key={index} className="border rounded p-3 mb-3 bg-light">
                        <h6>Work History #{index + 1}</h6>

                        <label>Company Name</label>
                        <InputText value={wh.CompanyName || ""} readOnly className="mb-3" />

                        <label>Role</label>
                        <InputText value={wh.Role || ""} readOnly className="mb-3" />

                        <label>Start Date</label>
                        <InputText
                          value={wh.StartDate ? wh.StartDate.slice(0, 10) : ""}
                          readOnly
                          className="mb-3"
                        />

                        <label>End Date</label>
                        <InputText
                          value={wh.EndDate ? wh.EndDate.slice(0, 10) : ""}
                          readOnly
                          className="mb-3"
                        />

                        <div className="mb-3">
                          <Checkbox checked={!!wh.ThirdPartyVerification} readOnly disabled />
                          <span className="ml-2">Third Party Verification</span>
                        </div>

                        {wh.UploadResume && (
                          <div className="mb-2">
                            <label>Resume</label>
                            <div>
                              <a href={wh.UploadResume} target="_blank" rel="noopener noreferrer">
                                View Resume
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No work history available</p>
                  );
                })()}
              </div>
            </TabPanel>
          </TabView>
        )}
      </Dialog>
      {/* Salary Group Details Popup */}
      <Dialog
        header={`Salary Group → ${salaryGroupDetails?.SalaryGroup || 'Details'}`}
        visible={showSalaryGroupPopup}
        style={{ width: "900px" }}
        modal
        onHide={() => {
          setShowSalaryGroupPopup(false);
          setSalaryGroupDetails(null);
        }}
        footer={
          <Button
            label="Close"
            icon="pi pi-times"
            onClick={() => {
              setShowSalaryGroupPopup(false);
              setSalaryGroupDetails(null);
            }}
            className="p-button-primary"
          />
        }
      >
        {salaryGroupDetails && (
          <div className="row">
            {/* Allowances Section */}
            <div className="col-md-6">
              <div className="p-3 mb-3" style={{ backgroundColor: '#d4edda', borderRadius: '8px' }}>
                <h5 className="text-center mb-3">Allowance</h5>
                <table className="table table-borderless">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Base Salary</td>
                      <td className="text-end">₹{salaryGroupDetails.BaseSalary?.toLocaleString()}</td>
                    </tr>
                    {salaryGroupDetails.AllowancesDeductions
                      ?.filter(ad => ad.Type === 'A')
                      .map((allowance, idx) => (
                        <tr key={idx}>
                          <td>{allowance.Name}</td>
                          <td className="text-end">₹{allowance.FixedAmount?.toLocaleString()}</td>
                        </tr>
                      ))}
                    <tr className="border-top border-dark">
                      <td><strong>Total Allowance:</strong></td>
                      <td className="text-end">
                        <strong>
                          ₹{(
                            salaryGroupDetails.BaseSalary +
                            (salaryGroupDetails.AllowancesDeductions
                              ?.filter(ad => ad.Type === 'A')
                              .reduce((sum, ad) => sum + (ad.FixedAmount || 0), 0) || 0)
                          ).toLocaleString()}
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deductions Section */}
            <div className="col-md-6">
              <div className="p-3 mb-3" style={{ backgroundColor: '#f8d7da', borderRadius: '8px' }}>
                <h5 className="text-center mb-3">Deduction</h5>
                <table className="table table-borderless">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryGroupDetails.AllowancesDeductions
                      ?.filter(ad => ad.Type === 'D')
                      .map((deduction, idx) => (
                        <tr key={idx}>
                          <td>{deduction.Name}</td>
                          <td className="text-end">₹{deduction.CalculatedAmount?.toLocaleString()}</td>
                        </tr>
                      ))}
                    <tr className="border-top border-dark">
                      <td><strong>Total Deduction:</strong></td>
                      <td className="text-end">
                        <strong>
                          ₹{salaryGroupDetails.AllowancesDeductions
                            ?.filter(ad => ad.Type === 'D')
                            .reduce((sum, ad) => sum + (ad.CalculatedAmount || 0), 0)
                            .toLocaleString()}
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
        </PrimeReactProvider>
  );
};

export default StaffPage;