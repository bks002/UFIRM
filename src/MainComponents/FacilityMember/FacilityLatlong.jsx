"use client";

import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { FilterMatchMode } from "primereact/api";
import { useSelector } from "react-redux";

import "primereact/resources/themes/lara-light-blue/theme.css";

// ✅ Import service
import { FacilityLatlongService } from "../../Services/FacilityLatlongService";

const FacilityLatlong = () => {
  const toast = useRef(null);
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  // Table & filters
  const [facilityData, setFacilityData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  // Dialog (Add/Edit)
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // Form fields
  const [employees, setEmployees] = useState([]); // from get-FacilityMembers API
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationName, setLocationName] = useState("");
  const [Type, setVisitType] = useState(""); 

  useEffect(() => {
    if (propertyId) {
      loadFacilities();
      loadEmployees();
    }
  }, [propertyId]);

  // ✅ GET Members for table
  const loadFacilities = async () => {
    setLoading(true);
    try {
      const data = await FacilityLatlongService.getMembers(propertyId);
      setFacilityData(
        data.map((item) => ({
          employeeId: item.FacilityMemberId,
          employeeName: item.FacilityMemberName || item.MobileNumber, // if API gives name
          latitude: item.Latitude,
          longitude: item.Longitude,
          locationName: item.LocationName,
          Type:item.Type
        }))
      );
    } catch (error) {
      console.error(error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch data",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ GET Facility Members for dropdown
  const loadEmployees = async () => {
  try {
    const empData = await FacilityLatlongService.getFacilityMembers(propertyId);
    setEmployees(
      empData.map((e) => ({
        label: e.Name,
        value: { 
          FacilityMemberId: e.FacilityMemberId,
          MobileNumber: e.MobileNumber
        }
      }))
    );
  } catch (error) {
    console.error(error);
  }
};

  const resetForm = () => {
    setSelectedEmployee(null);
    setLatitude("");
    setLongitude("");
    setLocationName("");
    setVisitType("");
    setEditingIndex(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogVisible(true);
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters((prev) => ({
      ...prev,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    }));
  };

  const validate = () => {
    if (!selectedEmployee || !latitude || !longitude || !Type || !locationName ) {
      toast.current.show({
        severity: "warn",
        summary: "Validation",
        detail: "Please fill all fields",
        life: 2500,
      });
      return false;
    }
    return true;
  };

  // ✅ POST API
  const saveFacility = async () => {
  if (!validate()) return;

  const record = {
    FacilityMemberId: selectedEmployee.FacilityMemberId, // ✅ from dropdown object
    MobileNumber: selectedEmployee.MobileNumber,         // ✅ from dropdown object
    Latitude: parseFloat(latitude),
    Longitude: parseFloat(longitude),
    IsActive: true,
    Type: Type,
    LocationName: locationName
  };

  try {
    await FacilityLatlongService.addMember(record);
    toast.current.show({
      severity: "success",
      summary: "Added",
      detail: "Facility added successfully",
      life: 2000,
    });
    loadFacilities();
    setDialogVisible(false);
    resetForm();
  } catch (error) {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: "Failed to add facility",
    });
  }
};

  // ✅ DELETE API
  const deleteFacility = async (rowData) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      await FacilityLatlongService.deleteMember(rowData.employeeId);
      toast.current.show({
        severity: "success",
        summary: "Deleted",
        detail: "Facility deleted",
      });
      loadFacilities();
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete facility",
      });
    }
  };

  const header = (
    <div className="d-flex justify-content-between align-items-center p-2">
          <h5 className="m-0">Facility Latlong</h5>
          <div className="d-flex gap-2 align-items-center">
            <span className="p-input-icon-left">
             
              <InputText
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="Search..."
              />
            </span>

      <Button
        label="Create"
        icon="pi pi-plus"
        onClick={openCreateDialog}
        className="p-button-success"
      />
    </div>
    </div>
  );

  const actionBodyTemplate = (rowData) => (
    <div className="d-flex gap-2">
                  <Button icon={<i class='fa fa-times'></i>} className="btn btn-sm btn-danger rounded" onClick={() => deleteFacility(rowData)} />
      
    </div>
  );

  const indexTemplate = (_rowData, options) => options.rowIndex + 1;

  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="container-fluid">
          <Toast ref={toast} />
          <div className="card">
            <div className="p-3">
              <DataTable
                value={facilityData}
                loading={loading}
                header={header}
                paginator
                rows={10}
                filters={filters}
                filterDisplay="row"
                globalFilterFields={["employeeName", "latitude", "longitude", "locationName", "Type"]}
                emptyMessage="No facilities found."
                dataKey="employeeId"
                breakpoint="960px"
                responsiveLayout="scroll"
              >
                <Column header="#" body={indexTemplate} style={{ width: "5rem" }} />
                <Column field="employeeName" header="Employee Name" />
                <Column field="latitude" header="Latitude" />
                <Column field="longitude" header="Longitude" />
                <Column field="Type" header="Visit Type" />
                <Column field="locationName" header="Location Name" />
                <Column header="Action" body={actionBodyTemplate} style={{ width: "9rem" }} />
              </DataTable>
            </div>
          </div>
        </div>
      </section>

      {/* Add/Edit Dialog */}
      <Dialog
        header={editingIndex !== null ? "Edit Facility" : "Add Facility"}
        visible={dialogVisible}
        style={{ width: "450px" }}
        modal
        onHide={() => setDialogVisible(false)}
        footer={
          <div className="d-flex justify-content-end gap-2">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setDialogVisible(false)}
            />
            <Button
              label={editingIndex !== null ? "Update" : "Add"}
              icon="pi pi-check"
              onClick={saveFacility}
            />
          </div>
        }
      >
        <div className="p-fluid">
          <div className="field mb-3">
            <label>Employee</label>
            <Dropdown
  value={selectedEmployee}
  options={employees}
  onChange={(e) => setSelectedEmployee(e.value)}
  placeholder="Select Employee"
  className="w-full"
  optionLabel="label"
/>

          </div>

          <div className="field mb-3">
            <label>Latitude</label>
            <InputText value={latitude} onChange={(e) => setLatitude(e.target.value)} />
          </div>

          <div className="field mb-3">
            <label>Longitude</label>
            <InputText value={longitude} onChange={(e) => setLongitude(e.target.value)} />
          </div>

          <div className="field">
            <label>Location Name</label>
            <InputText value={locationName} onChange={(e) => setLocationName(e.target.value)} />
          </div>
           <div className="field">
            <label>Visit Type</label>
            <InputText value={Type} onChange={(e) =>     setVisitType(e.target.value)} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default FacilityLatlong;
