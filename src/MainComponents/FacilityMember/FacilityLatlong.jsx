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
  const [editingRow, setEditingRow] = useState(null);

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
          id: item.Id,                           // ✅ PRIMARY KEY
          facilityMemberId: item.FacilityMemberId,
          employeeName: item.Name,
          mobileNumber: item.MobileNumber,
          latitude: item.Latitude,
          longitude: item.Longitude,
          locationName: item.LocationName,
          visitType: item.Type                  // ✅ rename
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
  
  const openEditDialog = (row) => {
  setEditingRow(row);

  setSelectedEmployee({
    FacilityMemberId: row.facilityMemberId,
    MobileNumber: row.mobileNumber
  });

  setLatitude(row.latitude);
  setLongitude(row.longitude);
  setLocationName(row.locationName);
  setVisitType(row.visitType);

  setDialogVisible(true);
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
    if (!selectedEmployee || !latitude || !longitude || !Type || !locationName) {
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

    const payload = {
  FacilityMemberId: selectedEmployee.FacilityMemberId,
  MobileNumber: selectedEmployee.MobileNumber,
  Latitude: parseFloat(latitude),
  Longitude: parseFloat(longitude),
  LocationName: locationName,
  Type: Type,
  IsActive: true
};

    try {
      if (editingRow) {
        await FacilityLatlongService.updateMember(editingRow.id, payload);
        toast.current.show({ severity: "success", summary: "Updated", detail: "Facility updated" });
      } else {
        await FacilityLatlongService.addMember(payload);
        toast.current.show({ severity: "success", summary: "Added", detail: "Facility added" });
      }

      loadFacilities();
      setDialogVisible(false);
      resetForm();
    } catch {
      toast.current.show({ severity: "error", summary: "Error", detail: "Operation failed" });
    }
  };

  // ✅ DELETE API
  const deleteFacility = async (rowData) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      await FacilityLatlongService.deleteMember(rowData.id);
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
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-text p-button-info"
        onClick={() => openEditDialog(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-text p-button-danger"
        onClick={() => deleteFacility(rowData)}
      />
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
                globalFilterFields={[
                  "employeeName",
                  "latitude",
                  "longitude",
                  "locationName",
                  "visitType"
                ]}
                emptyMessage="No facilities found."
                dataKey="id"                // ✅ MUST be unique
                responsiveLayout="scroll"
              >

                <Column header="#" body={indexTemplate} style={{ width: "5rem" }} />
                <Column field="employeeName" header="Employee Name" />
                <Column field="latitude" header="Latitude" />
                <Column field="longitude" header="Longitude" />
                <Column field="visitType" header="Visit Type" />
                <Column field="locationName" header="Location Name" />
                <Column header="Action" body={actionBodyTemplate} style={{ width: "9rem" }} />
              </DataTable>
            </div>
          </div>
        </div>
      </section>

      {/* Add/Edit Dialog */}
      <Dialog
        header={editingRow ? "Edit Facility Location" : "Add Facility Location"}
        visible={dialogVisible}
        style={{ width: "500px" }}
        modal
        onHide={() => setDialogVisible(false)}
      >
        <div className="p-fluid grid">
          <div className="field col-12">
            <label>Employee</label>
            <Dropdown
              value={selectedEmployee}
              options={employees}
              onChange={(e) => setSelectedEmployee(e.value)}
              placeholder="Select Employee"
              optionLabel="label"
              disabled={!!editingRow}
            />
          </div>

          <div className="field col-6">
            <label>Latitude</label>
            <InputText value={latitude} onChange={(e) => setLatitude(e.target.value)} />
          </div>

          <div className="field col-6">
            <label>Longitude</label>
            <InputText value={longitude} onChange={(e) => setLongitude(e.target.value)} />
          </div>

          <div className="field col-6">
            <label>Location Name</label>
            <InputText value={locationName} onChange={(e) => setLocationName(e.target.value)} />
          </div>

          <div className="field col-6">
            <label>Visit Type</label>
            <InputText value={Type} onChange={(e) => setVisitType(e.target.value)} />
          </div>

          <div className="col-12 d-flex justify-content-end gap-2 mt-3">
            <Button label="Cancel" className="p-button-text" onClick={() => setDialogVisible(false)} />
            <Button label={editingRow ? "Update" : "Add"} icon="pi pi-check" onClick={saveFacility} />
          </div>
        </div>
      </Dialog>

    </div>
  );
};

export default FacilityLatlong;
