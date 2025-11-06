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

import FacilityService, { getEmployeesByOffice } from "../../Services/FacilityService";
import { useSelector } from "react-redux";
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import { createEmployee, updateEmployee, deleteEmployee, getItemLinks } from "../../Services/FacilityService";
import { Calendar } from "primereact/calendar";

const StaffPage = () => {
  const toast = useRef(null);
  const [employee, setEmployee] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [viewData, setViewData] = useState(null);


  // Dialog
  const [dialogVisible, setDialogVisible] = useState(false);

  // Form fields
  const [officeName, setOfficeName] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [designation, setDesignation] = useState("");
  const [otherDesignation, setOtherDesignation] = useState("");
  const [address, setAddress] = useState("");
  const [family, setFamily] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [panCard, setPanCard] = useState("");
  const [aadharCard, setAadharCard] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIFSCCode, setBankIFSCCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [uanNumber, setUanNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateOfJoining, setDateOfJoining] = useState("");
  const [relievingDate, setRelievingDate] = useState("");
  const [tpv, setTpv] = useState(false);
  const [uploadResume, setUploadResume] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEmployeeId, setEditEmployeeId] = useState(null);
  const [pfNumber, setPfNumber] = useState("");
const [esiNumber, setEsiNumber] = useState("");
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  const genders = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ];

  const designations = [
    { label: "H.K. SUPERVISOR", value: "H.K. SUPERVISOR" },
    { label: "TECHNICAL SUPERVISOR", value: "TECHNICAL SUPERVISOR" },
    { label: "OTHER", value: "OTHER" },
  ];

  // Fetch staff data on component mount
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const data = await getEmployeesByOffice(propertyId);
        setStaff(Array.isArray(data) ? data : [data]); // 👈 ensure array
      } catch (err) {
        console.error("Failed to load employee", err);
        setError("Failed to load employee");
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchEmployee();
    } else {
      setLoading(false);
    }
  }, [propertyId]);


  const viewStaff = (row) => {
    setViewData(row); // store selected row data
    setViewDialogVisible(true);
  };
  // Handlers
  const openDialog = () => {
    resetForm();
    setDialogVisible(true);
  };

  const resetForm = () => {
    setName("");
    setGender("");
    setMobile("");
    setDesignation("");
    setAddress("");
    setFamily("");
    setProfileImage(null);
  };

  const openEditDialog = (row) => {
    setIsEditMode(true);
    setEditEmployeeId(
      row && row.FacilityMember && row.FacilityMember.FacilityMemberId
        ? row.FacilityMember.FacilityMemberId
        : ""
    );

    // Profile Info
    const profile = row && row.Profile ? row.Profile : {};
    setEmployeeCode(profile.EmployeeCode || "");
    setEmployeeName(profile.EmployeeName || "");
    setDesignation(profile.EmploymentType || "");
    setEmail(profile.Email || "");
    setMobile(profile.PhoneNumber || "");
    setDepartment(profile.Department || "");
    setGender(profile.Gender || "");
    setDateOfBirth(profile.DateOfBirth ? profile.DateOfBirth.slice(0, 10) : "");
    setPanCard(profile.PanCard || "");
    setAadharCard(profile.AadharCard || "");
    setAddressLine1(profile.AddressLine1 || "");
    setAddressLine2(profile.AddressLine2 || "");
    setCity(profile.City || "");
    setStateName(profile.State || "");

    // Work History
    const work = row && row.WorkHistory ? row.WorkHistory : {};
    setCompanyName(work.CompanyName || "");
    setRole(work.Role || "");
    setStartDate(work.StartDate ? new Date(work.StartDate) : "");
    setEndDate(work.EndDate ? new Date(work.EndDate) : "");
    setDateOfJoining(work.DateOfJoining ? new Date(work.DateOfJoining) : "");
    setRelievingDate(work.RelievingDate ? new Date(work.RelievingDate) : "");
    setTpv(work.ThirdPartyVerification || false);
    setUploadResume(null);

    // Financial Info
    const fin = row && row.FinancialInfo ? row.FinancialInfo : {};
    setBankAccountNumber(fin.BankAccountNumber || "");
    setBankIFSCCode(fin.BankIFSCCode || "");
    setBankName(fin.BankName || "");
    setUanNumber(fin.UANNumber || "");
    setPanNumber(fin.PANNumber || "");
setPfNumber(fin.PFNumber||"");
setEsiNumber(fin.ESINumber||"");
    setDialogVisible(true);
  };

  const saveStaff = async () => {
    if (!employeeName || !employeeCode || !mobile || !gender) {
      toast.current.show({ severity: "warn", summary: "Validation", detail: "Please fill all required fields" });
      return;
    }

    let profileImageUrl = "";

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
        formData.append("images", profileImage); // use key 'images' as API expects

        const res = await fetch("http://194.238.18.39:8000/upload/", {
          method: "POST",
          body: formData,
        });

        let data;
        try {
          data = await res.json();
        } catch {
          data = await res.text(); // fallback for plain text
        }

        if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);


        // const text = await res.text(); // <-- use text instead of json
        // console.log("Response text:", text);

        //         profileImageUrl =
        //           text.uploaded && text.uploaded.length > 0 ? text.uploaded[0] : "";

        if (!profileImageUrl) throw new Error("No image URL returned from server");
      } catch (err) {
        console.error("Image upload error:", err);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to upload profile image",
        });
        return; // stop saving if upload fails
      }
    }



    // 2️⃣ Determine FacilityMasterId
    let facilityMasterId = 0;
    if (designation === "H.K. SUPERVISOR") facilityMasterId = 19;
    else if (designation === "TECHNICAL SUPERVISOR") facilityMasterId = 34;

    // 3️⃣ Prepare employee payload
    const employeeData = {
      Profile: {
        OfficeId: propertyId,
        EmployeeCode: employeeCode,
        EmployeeName: employeeName,
        EmploymentType: designation,
        CreatedOn: new Date().toISOString(),
        UpdatedOn: new Date().toISOString(),
        IsActive: true,
        Email: email,
        PhoneNumber: mobile,
        Designation: designation,
        Department: department,
        Gender: gender,
        DateOfBirth: dateOfBirth,
        PanCard: panCard,
        AadharCard: aadharCard,
        AddressLine1: addressLine1,
        AddressLine2: addressLine2,
        City: city,
        State: stateName,
      },
      WorkHistory: {
        CompanyName: companyName,
        Role: role,
        StartDate: startDate ? startDate.toISOString() : new Date().toISOString(),
        EndDate: endDate ? endDate.toISOString() : new Date().toISOString(),
        DateOfJoining: dateOfJoining ? dateOfJoining.toISOString() : new Date().toISOString(),
        RelievingDate: relievingDate ? relievingDate.toISOString() : new Date().toISOString(),
        ThirdPartyVerification: tpv,
        UploadResume: uploadResume ? uploadResume.name : "",
        CreatedOn: new Date().toISOString(),
        UpdatedOn: new Date().toISOString(),
        IsActive: true
      },
      FinancialInfo: {
  BankAccountNumber: bankAccountNumber,
  BankIFSCCode: bankIFSCCode,
  BankName: bankName,
  UANNumber: uanNumber,
  PANNumber: panNumber,
  PFNumber: pfNumber,
  ESINumber: esiNumber,
  CreatedOn: new Date().toISOString(),
  UpdatedOn: new Date().toISOString(),
  IsActive: true
},
      FacilityMember: {
        PropertyId: propertyId || 0,
        Address: address,
        FacilityMasterId: facilityMasterId,
        ProfileImageUrl: profileImageUrl, // ✅ use uploaded image URL
        IsBlocked: false,
        AccessCode: "",
        IsApproved: true,
        ApprovedOn: new Date().toISOString(),
        ApprovedBy: 0,
        IsActive: true,
        IsDeleted: false,
        CreatedBy: 0,
        CreatedOn: new Date().toISOString(),
        UpdatedBy: 0,
        UpdatedOn: new Date().toISOString(),
        oldID: 0,
        Password: "",
        SG_Link_ID: 0,
        tax_amount: 0
      },
      EmployeeList: {
        FatherName: family,
        IsDeleted: 0,
        Approved: 1
      }
    };

    try {
      if (isEditMode) {
        await updateEmployee(editEmployeeId, employeeData);
        toast.current.show({ severity: "success", summary: "Updated", detail: "Staff updated successfully" });
        setStaff(staff.map(s => (
          s.FacilityMember.FacilityMemberId === editEmployeeId ? { ...s, ...employeeData } : s
        )));
      } else {
        const response = await createEmployee(employeeData);
        toast.current.show({ severity: "success", summary: "Added", detail: "Staff member added successfully" });
        setStaff([...staff, response]);
      }

      setDialogVisible(false);
      setIsEditMode(false);
      setEditEmployeeId(null);
    } catch (error) {
      toast.current.show({ severity: "error", summary: "Error", detail: isEditMode ? "Failed to update employee" : "Failed to create employee" });
    }
  };


  const deleteStaff = async () => {
    if (!selectedRow) return;

    try {
      await deleteEmployee(selectedRow.FacilityMember.FacilityMemberId); // ✅ delete by FacilityMemberId
      setStaff(staff.filter(s => s.FacilityMember.FacilityMemberId !== selectedRow.FacilityMember.FacilityMemberId)); // ✅ remove from state
      toast.current.show({ severity: "success", summary: "Deleted", detail: "Staff deleted successfully" });
      setSelectedRow(null);
    } catch (error) {
      toast.current.show({ severity: "error", summary: "Error", detail: "Failed to delete staff" });
    }
  };

  const actionBody = (rowData) => (
    <Checkbox
      inputId={"cb-" + rowData.FacilityMemberId}
      checked={selectedRow && selectedRow.FacilityMemberId === rowData.FacilityMemberId}
      onChange={(e) => setSelectedRow(e.checked ? rowData : null)}
    />
  );


  const header = (
    <div className="d-flex justify-content-between align-items-center p-2">
      <h5 className="m-0">Facility Member</h5>
      <div className="d-flex align-items-center gap-2">
        {selectedRow && (
          <>
            <Button
              icon="pi pi-pencil"
              className="p-button-rounded p-button-text p-button-info"
              onClick={() => openEditDialog(selectedRow)}
            />
            <Button
              icon="pi pi-trash"
              className="p-button-rounded p-button-text p-button-danger"
              onClick={deleteStaff}
            />
            <Button
              icon="pi pi-eye"
              className="p-button-rounded p-button-text p-button-help"
              onClick={() => viewStaff(selectedRow)}
            />
            <Button
              icon="pi pi-key"
              className="p-button-rounded p-button-text p-button-secondary"
              onClick={async () => {
                if (!selectedRow) return;
                try {
                  const response = await FacilityService.resetPassword(selectedRow.FacilityMember.MobileNumber);
                  toast.current.show({
                    severity: response.Success ? "success" : "error",
                    summary: "Reset Password",
                    detail: response.Message || (response.Success ? "Password reset successfully" : "Failed"),
                  });
                } catch (error) {
                  toast.current.show({ severity: "error", summary: "Reset Password", detail: "Server Error" });
                }
              }}
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

        <Button label="Add Staff" icon="pi pi-plus" onClick={openDialog} className="p-button-success" />
      </div>
    </div>
  );

  return (
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
                rows={5}
                loading={loading}
                responsiveLayout="scroll"
                emptyMessage="No staff found."
                selection={selectedRow}
                onSelectionChange={(e) => setSelectedRow(e.value)}
              >
                <Column selectionMode="single" headerStyle={{ width: '3em' }} />
                <Column header="Name" body={(row) => row.FacilityMember.Name} />
                <Column header="Gender" body={(row) => row.FacilityMember.Gender} />
                <Column header="Contact" body={(row) => row.FacilityMember.MobileNumber} />
                <Column header="Access" body={(row) => row.FacilityMember.AccessCode} />
                <Column header="Approved" body={(row) => row.FacilityMember.IsApproved ? "Yes" : "No"} />
              </DataTable>

            </div>
          </div>
        </div>
      </section>

      {/* Dialog remains same */}
      <Dialog
        header="Add Facility Member"
        visible={dialogVisible}
        style={{ width: "800px" }}
        modal
        onHide={() => setDialogVisible(false)}
        footer={
          <div className="d-flex justify-content-end gap-2">
            <Button label="Cancel" className="p-button-text" onClick={() => setDialogVisible(false)} />
            <Button label="Save" icon="pi pi-check" onClick={saveStaff} />
          </div>
        }
      >
        <TabView>
          {/* Personal Details */}
          <TabPanel header="Personal Details">
            <div className="p-fluid">
              <InputText placeholder="Employee Code" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} className="mb-2" />
              <InputText placeholder="Employee Name" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} className="mb-2" />
              <Dropdown placeholder="Employment Type" value={designation} options={designations} onChange={(e) => setDesignation(e.value)} className="mb-2" />
              {designation === "OTHER" && <InputText placeholder="Other Designation" value={otherDesignation} onChange={(e) => setOtherDesignation(e.target.value)} className="mb-2" />}
              <InputText placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-2" />
              <InputText placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} className="mb-2" />
              <Dropdown placeholder="Department" value={department} options={[{ label: "HR", value: "HR" }, { label: "IT", value: "IT" }]} onChange={(e) => setDepartment(e.value)} className="mb-2" />
              <Dropdown placeholder="Gender" value={gender} options={genders} onChange={(e) => setGender(e.value)} className="mb-2" />
              <InputText type="date" placeholder="Date of Birth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="mb-2" />
              <InputText placeholder="Pan Card" value={panCard} onChange={(e) => setPanCard(e.target.value)} className="mb-2" />
              <InputText placeholder="Aadhar Card" value={aadharCard} onChange={(e) => setAadharCard(e.target.value)} className="mb-2" />
              <InputText placeholder="Address Line 1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className="mb-2" />
              <InputText placeholder="Address Line 2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className="mb-2" />
              <InputText placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="mb-2" />
              <InputText placeholder="State" value={stateName} onChange={(e) => setStateName(e.target.value)} className="mb-2" />
              <InputText type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} className="mb-2" />
            </div>
          </TabPanel>

          {/* Bank Details */}
          <TabPanel header="Bank Details">
            <div className="p-fluid">
              <InputText placeholder="Bank Account Number" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} className="mb-2" />
              <InputText placeholder="Bank IFSC Code" value={bankIFSCCode} onChange={(e) => setBankIFSCCode(e.target.value)} className="mb-2" />
              <InputText placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} className="mb-2" />
              <InputText placeholder="UAN Number" value={uanNumber} onChange={(e) => setUanNumber(e.target.value)} className="mb-2" />
              <InputText placeholder="PAN Number" value={panNumber} onChange={(e) => setPanNumber(e.target.value)} className="mb-2" />
              <InputText placeholder="PF Number" value={pfNumber} onChange={(e) => setPfNumber(e.target.value)} className="mb-2" />
<InputText placeholder="ESI Number" value={esiNumber} onChange={(e) => setEsiNumber(e.target.value)} className="mb-2" />
            </div>
          </TabPanel>

          {/* Work History */}
          <TabPanel header="Work History">
            <div className="p-fluid">
              <InputText
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mb-2"
              />
              <InputText
                placeholder="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mb-2"
              />

              <Calendar
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.value)}
                className="mb-2 w-full"
                dateFormat="dd-mm-yy"
                showIcon
              />

              <Calendar
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.value)}
                className="mb-2 w-full"
                dateFormat="dd-mm-yy"
                showIcon
              />

              <Calendar
                placeholder="Date Of Joining"
                value={dateOfJoining}
                onChange={(e) => setDateOfJoining(e.value)}
                className="mb-2 w-full"
                dateFormat="dd-mm-yy"
                showIcon
              />

              <Calendar
                placeholder="Relieving Date"
                value={relievingDate}
                onChange={(e) => setRelievingDate(e.value)}
                className="mb-2 w-full"
                dateFormat="dd-mm-yy"
                showIcon
              />

              <div className="flex align-items-center mt-2">
                <Checkbox
                  inputId="tpv"
                  checked={tpv}
                  onChange={(e) => setTpv(e.checked)}
                />
                <label htmlFor="tpv" className="ml-2">Third Party Verification</label>
              </div>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setUploadResume(e.target.files[0])}
                className="mt-2"
              />
            </div>
          </TabPanel>

        </TabView>
      </Dialog>

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
                <InputText placeholder="Employee Code" value={viewData.Profile && viewData.Profile.EmployeeCode ? viewData.Profile.EmployeeCode : ""} readOnly className="mb-2" />
                <InputText placeholder="Employee Name" value={viewData.Profile && viewData.Profile.EmployeeName ? viewData.Profile.EmployeeName : ""} readOnly className="mb-2" />
                <InputText placeholder="Employment Type" value={viewData.Profile && viewData.Profile.EmploymentType ? viewData.Profile.EmploymentType : ""} readOnly className="mb-2" />
                <InputText placeholder="Email" value={viewData.Profile && viewData.Profile.Email ? viewData.Profile.Email : ""} readOnly className="mb-2" />
                <InputText placeholder="Mobile" value={viewData.Profile && viewData.Profile.PhoneNumber ? viewData.Profile.PhoneNumber : ""} readOnly className="mb-2" />
                <InputText placeholder="Department" value={viewData.Profile && viewData.Profile.Department ? viewData.Profile.Department : ""} readOnly className="mb-2" />
                <InputText placeholder="Gender" value={viewData.Profile && viewData.Profile.Gender ? viewData.Profile.Gender : ""} readOnly className="mb-2" />
                <InputText placeholder="Date of Birth" value={viewData.Profile && viewData.Profile.DateOfBirth ? viewData.Profile.DateOfBirth.slice(0, 10) : ""} readOnly className="mb-2" />
                <InputText placeholder="Pan Card" value={viewData.Profile && viewData.Profile.PanCard ? viewData.Profile.PanCard : ""} readOnly className="mb-2" />
                <InputText placeholder="Aadhar Card" value={viewData.Profile && viewData.Profile.AadharCard ? viewData.Profile.AadharCard : ""} readOnly className="mb-2" />
                <InputText placeholder="Address Line 1" value={viewData.Profile && viewData.Profile.AddressLine1 ? viewData.Profile.AddressLine1 : ""} readOnly className="mb-2" />
                <InputText placeholder="Address Line 2" value={viewData.Profile && viewData.Profile.AddressLine2 ? viewData.Profile.AddressLine2 : ""} readOnly className="mb-2" />
                <InputText placeholder="City" value={viewData.Profile && viewData.Profile.City ? viewData.Profile.City : ""} readOnly className="mb-2" />
                <InputText placeholder="State" value={viewData.Profile && viewData.Profile.State ? viewData.Profile.State : ""} readOnly className="mb-2" />
              </div>
            </TabPanel>
            <TabPanel header="Bank Details">
              <div className="p-fluid">
                <InputText placeholder="Bank Account Number" value={viewData.FinancialInfo && viewData.FinancialInfo.BankAccountNumber ? viewData.FinancialInfo.BankAccountNumber : ""} readOnly className="mb-2" />
                <InputText placeholder="Bank IFSC Code" value={viewData.FinancialInfo && viewData.FinancialInfo.BankIFSCCode ? viewData.FinancialInfo.BankIFSCCode : ""} readOnly className="mb-2" />
                <InputText placeholder="Bank Name" value={viewData.FinancialInfo && viewData.FinancialInfo.BankName ? viewData.FinancialInfo.BankName : ""} readOnly className="mb-2" />
                <InputText placeholder="UAN Number" value={viewData.FinancialInfo && viewData.FinancialInfo.UANNumber ? viewData.FinancialInfo.UANNumber : ""} readOnly className="mb-2" />
                <InputText placeholder="PAN Number" value={viewData.FinancialInfo && viewData.FinancialInfo.PANNumber ? viewData.FinancialInfo.PANNumber : ""} readOnly className="mb-2" />
                <InputText placeholder="PF Number" value={viewData.FinancialInfo && viewData.FinancialInfo.PFNumber ? viewData.FinancialInfo.PFNumber : ""} readOnly className="mb-2" />
<InputText placeholder="ESI Number" value={viewData.FinancialInfo && viewData.FinancialInfo.ESINumber ? viewData.FinancialInfo.ESINumber : ""} readOnly className="mb-2" />

              </div>
            </TabPanel>
            <TabPanel header="Work History">
              <div className="p-fluid">
                <InputText placeholder="Company Name" value={viewData.WorkHistory && viewData.WorkHistory.CompanyName ? viewData.WorkHistory.CompanyName : ""} readOnly className="mb-2" />
                <InputText placeholder="Role" value={viewData.WorkHistory && viewData.WorkHistory.Role ? viewData.WorkHistory.Role : ""} readOnly className="mb-2" />
                <InputText placeholder="Start Date" value={viewData.WorkHistory && viewData.WorkHistory.StartDate ? viewData.WorkHistory.StartDate.slice(0, 10) : ""} readOnly className="mb-2" />
                <InputText placeholder="End Date" value={viewData.WorkHistory && viewData.WorkHistory.EndDate ? viewData.WorkHistory.EndDate.slice(0, 10) : ""} readOnly className="mb-2" />
                <InputText placeholder="Date Of Joining" value={viewData.WorkHistory && viewData.WorkHistory.DateOfJoining ? viewData.WorkHistory.DateOfJoining.slice(0, 10) : ""} readOnly className="mb-2" />
                <InputText placeholder="Relieving Date" value={viewData.WorkHistory && viewData.WorkHistory.RelievingDate ? viewData.WorkHistory.RelievingDate.slice(0, 10) : ""} readOnly className="mb-2" />
                <div className="flex align-items-center mt-2 mb-2">
                  <Checkbox inputId="tpv-view" checked={viewData.WorkHistory ? !!viewData.WorkHistory.ThirdPartyVerification : false} readOnly />
                  <label htmlFor="tpv-view" className="ml-2">Third Party Verification</label>
                </div>
                <div className="mb-2">
                  <label>Resume</label>
                  <InputText value={viewData.WorkHistory ? (viewData.WorkHistory.UploadResume || "") : ""} readOnly className="w-full" />
                </div>
              </div>
            </TabPanel>
          </TabView>
        )}
      </Dialog>
    </div >
  );
};

export default StaffPage;