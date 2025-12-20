import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";

// PrimeReact
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";

// Services
import {
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
} from "../../Services/PropertyService";

import { getAllClients } from "../../Services/ClientService";
import { getAllServices } from "../../Services/ServiceService";
import { getAllPropertyTypes } from "../../Services/PropertyTypeService";
import { getAllCities } from "../../Services/CityService";

export default function PropertyMaster() {
    const toast = useRef(null);
    const PropertyId = useSelector((state) => state.Commonreducer.puidn);

    // ---------------------------------------------------------
    // STATE
    // ---------------------------------------------------------
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState([]);
    const [searchText, setSearchText] = useState("");

    const [dialogVisible, setDialogVisible] = useState(false);
    const [viewDialogVisible, setViewDialogVisible] = useState(false);

    const [editId, setEditId] = useState(null);
    const [viewData, setViewData] = useState(null);

    const [clients, setClients] = useState([]);
    const [services, setServices] = useState([]);
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [cities, setCities] = useState([]);

    const [form, setForm] = useState({
        PropertyId: 0,
        PropertyTypeId: 0,
        Name: "",
        AddressLine1: "",
        AddressLine12: "",
        CityId: 0,
        ContactNumber: "",
        Landmark: "",
        Pincode: "",
        CreatedBy: 1,
        Latitude: "",
        Longitude: "",
        State: "",
        ShiftHour: 0,
        IsActive: 1,
        TotalWorkingDays: 0,
        ClientID: 0,
        ServiceIds: [],
    });

    // ---------------------------------------------------------
    // LOAD DATA
    // ---------------------------------------------------------
    const loadData = async () => {
        setLoading(true);

        try {
            const result = await getPropertyById(PropertyId);
            const clientList = await getAllClients();
            const serviceList = await getAllServices();
            const cityList = await getAllCities();
            const propertyTypeList = await getAllPropertyTypes();

            // Clients dropdown
            setClients(
                clientList.map(c => ({
                    label: c.ClientName,
                    value: c.ClientID,
                }))
            );

            // Services dropdown
            setServices(
                serviceList.map(s => ({
                    label: s.ServiceName,
                    value: s.ServiceId,
                }))
            );

            // Property Types dropdown
            setPropertyTypes(
                propertyTypeList.map(pt => ({
                    label: pt.PropertyType,
                    value: pt.PropertyTypeId,
                }))
            );

            // Cities dropdown
            setCities(
                cityList.map(ct => ({
                    label: ct.CityName,
                    value: ct.CityId,
                }))
            );

            setProperties([result]);
        } catch (err) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to load data",
            });
        }

        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [PropertyId]);

    // ---------------------------------------------------------
    // CREATE
    // ---------------------------------------------------------
    const openCreateDialog = () => {
        setForm({
            PropertyId: 0,
            PropertyTypeId: 0,
            Name: "",
            AddressLine1: "",
            AddressLine12: "",
            CityId: 0,
            ContactNumber: "",
            Landmark: "",
            Pincode: "",
            CreatedBy: 1,
            Latitude: "",
            Longitude: "",
            State: "",
            ShiftHour: 0,
            IsActive: 1,
            TotalWorkingDays: 0,
            ClientID: 0,
            ServiceIds: [],
        });

        setEditId(null);
        setDialogVisible(true);
    };

    // ---------------------------------------------------------
    // EDIT
    // ---------------------------------------------------------
    const openEditDialog = async (row) => {
        setEditId(row.PropertyId);

        try {
            const data = await getPropertyById(row.PropertyId);

            setForm({
                PropertyId: data.PropertyId,
                PropertyTypeId: data.PropertyTypeId,
                Name: data.Name,
                AddressLine1: data.AddressLine1,
                AddressLine12: data.AddressLine12,
                CityId: data.CityId,
                ContactNumber: data.ContactNumber,
                Landmark: data.Landmark,
                Pincode: data.Pincode,
                CreatedBy: data.CreatedBy,
                Latitude: data.Latitude,
                Longitude: data.Longitude,
                State: data.State,
                ShiftHour: data.ShiftHours || 0,
                IsActive: 1,
                TotalWorkingDays: data.TotalWorkingDays || 0,
                ClientID: data.ClientID || 0,
                ServiceIds: data.ServiceIds || [],
            });

            setDialogVisible(true);
        } catch (err) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to load property details",
            });
        }
    };

    // ---------------------------------------------------------
    // VIEW (READ ONLY)
    // ---------------------------------------------------------
    const openViewDialog = async (row) => {
        try {
            const data = await getPropertyById(row.PropertyId);

            const cityObj = cities.find(c => c.value === data.CityId);

            setViewData({
                ...data,
                CityName: cityObj ? cityObj.label : "—",
            });

            setViewDialogVisible(true);
        } catch (err) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to load property details",
            });
        }
    };

    // ---------------------------------------------------------
    // SAVE
    // ---------------------------------------------------------
    const handleSave = async () => {
        try {
            if (editId) {
                await updateProperty(editId, form);
                toast.current.show({ severity: "success", summary: "Updated", detail: "Property updated" });
            } else {
                await createProperty(form);
                toast.current.show({ severity: "success", summary: "Created", detail: "Property created" });
            }

            setDialogVisible(false);
            loadData();
        } catch {
            toast.current.show({ severity: "error", summary: "Error", detail: "Save failed" });
        }
    };

    // ---------------------------------------------------------
    // DELETE
    // ---------------------------------------------------------
    const handleDelete = async (row) => {
        if (!window.confirm("Are you sure you want to delete this?")) return;

        await deleteProperty(row.PropertyId);

        toast.current.show({
            severity: "success",
            summary: "Deleted",
            detail: "Property removed",
        });

        loadData();
    };

    // ---------------------------------------------------------
    // FILTER SEARCH
    // ---------------------------------------------------------
    const filteredData = properties.filter(p => {
        const k = searchText.toLowerCase();
        return (
            p.Name?.toLowerCase().includes(k) ||
            p.State?.toLowerCase().includes(k) ||
            p.Pincode?.toLowerCase().includes(k)
        );
    });

    // ---------------------------------------------------------
    // RENDER COLUMN HELPERS
    // ---------------------------------------------------------
    const clientBodyTemplate = (row) => {
        const client = clients.find(c => c.value === row.ClientID);
        return client ? client.label : "—";
    };

    const cityBodyTemplate = (row) => {
        const city = cities.find(c => c.value === row.CityId);
        return city ? city.label : "—";
    };

    const propertyTypeBodyTemplate = (row) => {
        const type = propertyTypes.find(pt => pt.value === row.PropertyTypeId);
        return type ? type.label : "—";
    };

    // ---------------------------------------------------------
    // DIALOG FOOTER
    // ---------------------------------------------------------
    const dialogFooter = (
        <div className="text-end">
            <Button label="Cancel" className="p-button-text me-2" onClick={() => setDialogVisible(false)} />
            <Button label="Save" className="p-button-primary" onClick={handleSave} />
        </div>
    );

    return (
        <div className="content-wrapper" style={{ padding: 30 }}>
            <Toast ref={toast} />

            <div className="card" style={{ borderRadius: 10, maxWidth: 1400, margin: "0 auto" }}>
                
                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                    <h2>Property Master</h2>
                    <div className="d-flex align-items-center">
                        <input
                            type="text"
                            className="form-control me-2"
                            placeholder="Search..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ maxWidth: 240 }}
                        />
                        <Button label="Create" icon="pi pi-plus" className="btn btn-success" onClick={openCreateDialog} />
                    </div>
                </div>

                {/* TABLE */}
                <div className="table-responsive p-3">
                    <DataTable value={filteredData} loading={loading} paginator rows={8} stripedRows>
                        <Column field="Name" header="Property Name" sortable />
                        <Column header="Type" body={propertyTypeBodyTemplate} />
                        <Column field="ContactNumber" header="Contact" />
                        <Column field="AddressLine1" header="Address" />
                        <Column field="State" header="State" />
                        <Column field="Pincode" header="Pincode" />
                        <Column header="City" body={cityBodyTemplate} />
                        <Column header="Client" body={clientBodyTemplate} />

                        <Column
                            header="Actions"
                            body={(row) => (
                                <>
                                    <Button icon="pi pi-eye" className="p-button-sm p-button-secondary me-2"
                                        onClick={() => openViewDialog(row)} />
                                    <Button icon="pi pi-pencil" className="p-button-sm p-button-info me-2"
                                        onClick={() => openEditDialog(row)} />
                                    <Button icon="pi pi-trash" className="p-button-sm p-button-danger"
                                        onClick={() => handleDelete(row)} />
                                </>
                            )}
                        />
                    </DataTable>
                </div>

                {/* CREATE/EDIT DIALOG */}
                <Dialog
                    header={editId ? "Edit Property" : "Create Property"}
                    visible={dialogVisible}
                    style={{ width: "650px" }}
                    modal
                    onHide={() => setDialogVisible(false)}
                    footer={dialogFooter}
                >
                    <div className="p-fluid">

                        <div className="mb-3">
                            <label>Property Type</label>
                            <Dropdown
                                value={form.PropertyTypeId}
                                options={propertyTypes}
                                placeholder="Select Type"
                                onChange={(e) => setForm({ ...form, PropertyTypeId: e.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Property Name</label>
                            <InputText
                                value={form.Name}
                                onChange={(e) => setForm({ ...form, Name: e.target.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Address Line 1</label>
                            <InputText
                                value={form.AddressLine1}
                                onChange={(e) => setForm({ ...form, AddressLine1: e.target.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Address Line 2</label>
                            <InputText
                                value={form.AddressLine12}
                                onChange={(e) => setForm({ ...form, AddressLine12: e.target.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <label>City</label>
                            <Dropdown
                                value={form.CityId}
                                options={cities}
                                placeholder="Select City"
                                filter
                                onChange={(e) => setForm({ ...form, CityId: e.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Contact Number</label>
                            <InputText
                                value={form.ContactNumber}
                                onChange={(e) => setForm({ ...form, ContactNumber: e.target.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Landmark</label>
                            <InputText
                                value={form.Landmark}
                                onChange={(e) => setForm({ ...form, Landmark: e.target.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Pincode</label>
                            <InputText
                                value={form.Pincode}
                                onChange={(e) => setForm({ ...form, Pincode: e.target.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <label>State</label>
                            <InputText
                                value={form.State}
                                onChange={(e) => setForm({ ...form, State: e.target.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Latitude</label>
                            <InputText
                                value={form.Latitude}
                                onChange={(e) => setForm({ ...form, Latitude: e.target.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Longitude</label>
                            <InputText
                                value={form.Longitude}
                                onChange={(e) => setForm({ ...form, Longitude: e.target.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Shift Hours</label>
                            <InputText
                                type="number"
                                value={form.ShiftHour}
                                onChange={(e) => setForm({ ...form, ShiftHour: Number(e.target.value) })}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Total Working Days</label>
                            <InputText
                                type="number"
                                value={form.TotalWorkingDays}
                                onChange={(e) => setForm({ ...form, TotalWorkingDays: Number(e.target.value) })}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Client</label>
                            <Dropdown
                                value={form.ClientID}
                                options={clients}
                                placeholder="Select Client"
                                onChange={(e) => setForm({ ...form, ClientID: e.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Services</label>
                            <MultiSelect
                                value={form.ServiceIds}
                                options={services}
                                placeholder="Select Services"
                                filter
                                display="chip"
                                onChange={(e) => setForm({ ...form, ServiceIds: e.value })}
                            />
                        </div>

                    </div>
                </Dialog>

                {/* VIEW ONLY DIALOG */}
                <Dialog
                    header="Property Details"
                    visible={viewDialogVisible}
                    modal
                    style={{ width: "600px" }}
                    onHide={() => setViewDialogVisible(false)}
                >
                    {viewData && (
                        <div className="p-fluid">
                            <div className="mb-2"><b>Property Name:</b> {viewData.Name}</div>
                            <div className="mb-2"><b>Type:</b> {propertyTypes.find(pt => pt.value === viewData.PropertyTypeId)?.label}</div>
                            <div className="mb-2"><b>Address Line 1:</b> {viewData.AddressLine1}</div>
                            <div className="mb-2"><b>Address Line 2:</b> {viewData.AddressLine12}</div>
                            <div className="mb-2"><b>City:</b> {viewData.CityName}</div>
                            <div className="mb-2"><b>State:</b> {viewData.State}</div>
                            <div className="mb-2"><b>Pincode:</b> {viewData.Pincode}</div>
                            <div className="mb-2"><b>Contact:</b> {viewData.ContactNumber}</div>
                            <div className="mb-2"><b>Landmark:</b> {viewData.Landmark}</div>
                            <div className="mb-2"><b>Latitude:</b> {viewData.Latitude}</div>
                            <div className="mb-2"><b>Longitude:</b> {viewData.Longitude}</div>
                            <div className="mb-2"><b>Shift Hours:</b> {viewData.ShiftHours}</div>
                            <div className="mb-2"><b>Total Working Days:</b> {viewData.TotalWorkingDays}</div>

                            <div className="mb-2">
                                <b>Client:</b> {clients.find(c => c.value === viewData.ClientID)?.label}
                            </div>

                            <div className="mb-2">
                                <b>Services:</b>{" "}
                                {viewData.ServiceIds.length === 0
                                    ? "—"
                                    : viewData.ServiceIds
                                        .map(id => services.find(s => s.value === id)?.label)
                                        .join(", ")}
                            </div>
                        </div>
                    )}
                </Dialog>

            </div>
        </div>
    );
}
