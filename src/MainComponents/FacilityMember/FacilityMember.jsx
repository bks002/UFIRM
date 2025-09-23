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
import "primeicons/primeicons.css";
import FacilityService, { FacilityMemberService } from "../../Services/FacilityService";
import { useSelector } from "react-redux";
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primeicons/primeicons.css';

const StaffPage = () => {
  const toast = useRef(null);

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);

  // Dialog
  const [dialogVisible, setDialogVisible] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [designation, setDesignation] = useState("");
  const [address, setAddress] = useState("");
  const [family, setFamily] = useState("");
  const [profileImage, setProfileImage] = useState(null);
   const propertyId = useSelector((state) => state.Commonreducer.puidn);

  const genders = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ];

  const designations = [
    { label: "Manager", value: "Manager" },
    { label: "Supervisor", value: "Supervisor" },
    { label: "Staff", value: "Staff" },
  ];

  // Fetch staff data on component mount
  useEffect(() => {
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await FacilityMemberService.getFacilityMembers(propertyId); // no propertyId
      setStaff(data);
    } catch (err) {
      setError("Failed to load facility members");
      toast.current.show({ severity: "error", summary: "Error", detail: "Failed to load staff data" });
    } finally {
      setLoading(false);
    }
  };

  fetchStaff();
}, [propertyId]);


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

  const saveStaff = () => {
    if (!name || !gender || !mobile || !designation) {
      toast.current.show({
        severity: "warn",
        summary: "Validation",
        detail: "Please fill all required fields",
      });
      return;
    }

    // Here you should call POST API to save staff
    toast.current.show({
      severity: "success",
      summary: "Added",
      detail: "Staff member added successfully",
    });
    setDialogVisible(false);
  };

  const deleteStaff = () => {
    if (selectedRow) {
      // Here you should call DELETE API to remove staff
      setStaff(staff.filter((s) => s.FacilityMemberId !== selectedRow.FacilityMemberId));
      toast.current.show({
        severity: "success",
        summary: "Deleted",
        detail: "Staff deleted successfully",
      });
      setSelectedRow(null);
    }
  };

  const actionBody = (rowData) => (
  <Checkbox
    inputId={"cb-" + rowData.FacilityMemberId}
    checked={selectedRow && selectedRow.FacilityMemberId === rowData.FacilityMemberId}
    onChange={(e) => {
      setSelectedRow(e.checked ? rowData : null);
    }}
  />
);



  const header = (
    <div className="d-flex justify-content-between align-items-center p-2">
      <h5 className="m-0">Facility Member</h5>
      <div className="d-flex align-items-center gap-2">
        {selectedRow && (
          <>
            <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-info" />
            <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" onClick={deleteStaff} />
            <Button icon="pi pi-ban" className="p-button-rounded p-button-text p-button-warning" />
            <Button
              icon="pi pi-key"
              className="p-button-rounded p-button-text p-button-secondary"
              onClick={async () => {
                if (!selectedRow) return;
                try {
                  const response = await FacilityService.resetPassword(selectedRow.MobileNumber);
                  toast.current.show({
                    severity: response.Success ? "success" : "error",
                    summary: "Reset Password",
                    detail: response.Message || (response.Success ? "Password reset successfully" : "Failed to reset password"),
                  });
                } catch (error) {
                  toast.current.show({
                    severity: "error",
                    summary: "Reset Password",
                    detail: error.Message || "Server Error",
                  });
                }
              }}
            />
          </>
        )}

        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={(e) => setGlobalFilterValue(e.target.value)}
            placeholder="Search..."
          />
        </span>

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
                header={header}
                paginator
                rows={5}
                loading={loading}
                responsiveLayout="scroll"
                emptyMessage="No staff found."
              >
                <Column field="FacilityMemberId" header="ID" style={{ width: "5rem" }} />
                <Column field="Name" header="Name" />
                <Column field="Gender" header="Gender" />
                <Column field="MobileNumber" header="Contact" />
                <Column field="FacilityMasterId" header="Facility Type" />
               <Column field="AccessCode" header="Access" />
                <Column field="IsApproved" header="Status" body={(row) => (row.IsApproved ? "Yes" : "No")} />
                <Column header="Action" body={actionBody} style={{ width: "5rem" }} />
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
    {/* ✅ Tab 1: Personal Details */}
    <TabPanel header="Personal Details">
      <div className="p-fluid">
        <div className="field">
          <label>Office Name</label>
          <InputText value={name} disabled />
        </div>

        <div className="field">
          <label>Employee Code</label>
          <InputText value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field">
          <label>Employee Name</label>
          <InputText value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field">
          <label>Employment Type</label>
          <Dropdown value={designation} options={designations} onChange={(e) => setDesignation(e.value)} placeholder="Select Type" />
        </div>

        <div className="field">
          <label>Email</label>
          <InputText />
        </div>

        <div className="field">
          <label>Phone Number</label>
          <InputText value={mobile} onChange={(e) => setMobile(e.target.value)} />
        </div>

        <div className="field">
          <label>Designation</label>
          <Dropdown value={designation} options={designations} onChange={(e) => setDesignation(e.value)} placeholder="Select Designation" />
        </div>

        <div className="field">
          <label>Department</label>
          <Dropdown options={[{ label: "HR", value: "HR" }, { label: "IT", value: "IT" }]} placeholder="Select Department" />
        </div>

        <div className="field">
          <label>Gender</label>
          <Dropdown value={gender} options={genders} onChange={(e) => setGender(e.value)} placeholder="Select Gender" />
        </div>

        <div className="field">
          <label>Date of Birth</label>
          <InputText type="date" />
        </div>

        <div className="field">
          <label>Pan Card</label>
          <InputText />
        </div>

        <div className="field">
          <label>Aadhar Card</label>
          <InputText />
        </div>

        <div className="field">
          <label>Address Line 1</label>
          <InputText value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div className="field">
          <label>Address Line 2</label>
          <InputText />
        </div>

        <div className="field">
          <label>City</label>
          <InputText />
        </div>

        <div className="field">
          <label>State</label>
          <InputText />
        </div>
      </div>
    </TabPanel>

    {/* ✅ Tab 2: Bank Details */}
    <TabPanel header="Bank Details">
      <div className="p-fluid">
        <div className="field">
          <label>Bank Account Number</label>
          <InputText />
        </div>
        <div className="field">
          <label>Bank IFSC Code</label>
          <InputText />
        </div>
        <div className="field">
          <label>Bank Name</label>
          <InputText />
        </div>
        <div className="field">
          <label>UAN Number</label>
          <InputText />
        </div>
        <div className="field">
          <label>PAN Number</label>
          <InputText />
        </div>
      </div>
    </TabPanel>

    {/* ✅ Tab 3: Work History */}
    <TabPanel header="Work History">
      <div className="p-fluid">
        <div className="field">
          <label>Company Name</label>
          <InputText />
        </div>
        <div className="field">
          <label>Role</label>
          <InputText />
        </div>
        <div className="field">
          <label>Start Date</label>
          <InputText type="date" />
        </div>
        <div className="field">
          <label>End Date</label>
          <InputText type="date" />
        </div>

        <div className="field">
          <label>Date of Joining</label>
          <InputText type="date" />
        </div>

        <div className="field">
          <label>Relieving Date</label>
          <InputText type="date" />
        </div>

        <div className="field">
          <Checkbox inputId="tpv" />
          <label htmlFor="tpv" className="ml-2">Third-Party Verification</label>
        </div>

        <div className="field">
          <label>Upload Resume</label>
          <input type="file" accept=".pdf,.doc,.docx" />
        </div>
      </div>
    </TabPanel>
  </TabView>
</Dialog>
    </div>
  );
};

export default StaffPage;
