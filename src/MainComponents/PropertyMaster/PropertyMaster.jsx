<<<<<<< HEAD
import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import DataGrid from "../../ReactComponents/DataGrid/DataGrid.jsx";
import Button from "../../ReactComponents/Button/Button";
import InputBox from "../../ReactComponents/InputBox/InputBox.jsx";
import * as appCommon from "../../Common/AppCommon.js";
import { DELETE_CONFIRMATION_MSG } from "../../Contants/Common";
import swal from "sweetalert";
import { CreateValidator, ValidateControls } from "./Validation";
import DropDownList from "../../ReactComponents/SelectBox/DropdownList";
import CommonDataProvider from "../../Common/DataProvider/CommonDataProvider.js";

// API base
const API_BASE = "https://api.urest.in:8096/api/property";
// default updatedBy value (change if needed)
const UPDATED_BY_DEFAULT = 1;

export default function PropertyMaster() {
  const comdbprovider = new CommonDataProvider();

  // Redux propertyId (optional single-property fetch)
  const propertyIdFromRedux = useSelector((state) => state.Commonreducer?.puidn);

  // grid & dropdown data
  const [GridData, setGridData] = useState([]);
  const [CityData, setCityData] = useState([]);
  const [PropertyTypeData, setPropertyTypeData] = useState([]);

  // grid header (unchanged)
  const [gridHeader] = useState([
    { sTitle: "SNo.", titleValue: "id", orderable: false },
    { sTitle: "Property Name", titleValue: "name" },
    { sTitle: "Address Line 1", titleValue: "addressLine1" },
    { sTitle: "Address Line 2", titleValue: "addressLine2" },
    { sTitle: "City", titleValue: "cityName" },
    { sTitle: "State", titleValue: "state" },
    { sTitle: "Pin", titleValue: "pinCode" },
    { sTitle: "Contact", titleValue: "contactNumber" },
    { sTitle: "Latitude", titleValue: "latitude" },
    { sTitle: "Longitude", titleValue: "longitude" },
    {
      sTitle: "Action",
      titleValue: "Action",
      Action: "Edit&Delete",
      Index: "0",
      orderable: false,
    },
  ]);

  // page & form state
  const [PageMode, setPageMode] = useState("Home"); // Home | Add | Edit
  const [PropertyId, setPropertyId] = useState(0); // numeric id
  const [PropertyTypeId, setPropertyTypeId] = useState(0);
  const [Name, setName] = useState("");
  const [AddressLine1, setAddressLine1] = useState("");
  const [AddressLine2, setAddressLine2] = useState("");
  const [Address, setAddress] = useState("");
  const [ContactNumber, setContactNumber] = useState("");
  const [CityId, setCityId] = useState(0);
  const [LandMark, setLandMark] = useState("");
  const [PinCode, setPinCode] = useState("");
  const [StateVal, setStateVal] = useState("");
  const [Latitude, setLatitude] = useState("");
  const [Longitude, setLongitude] = useState("");

  // state to show single property retrieved by /property/{id} (optional)
  const [SinglePropertyData, setSinglePropertyData] = useState(null);

  // -------------------- helpers to normalize API responses --------------------
  const normalizeGridItem = (item, index) => {
    const normalized = {
      id: index + 1,
      propertyId: item.PropertyId ?? item.propertyId ?? 0,
      name: item.Name ?? item.name ?? "",
      addressLine1: item.AddressLine1 ?? item.addressLine1 ?? item.address ?? "",
      addressLine2:
        item.AddressLine12 ??
        item.AddressLine2 ??
        item.addressLine2 ??
        "",
      cityId: item.CityId ?? item.cityId ?? item.City ?? 0,
      cityName:
        item.CityName ?? item.cityName ?? item.City ?? item.city ?? "",
      state: item.State ?? item.state ?? "",
      pinCode: item.Pincode ?? item.Pincode ?? item.pinCode ?? item.pin ?? "",
      contactNumber:
        item.ContactNumber ?? item.contactNumber ?? item.Contact ?? "",
      latitude: item.Latitude ?? item.latitude ?? "",
      longitude: item.Longitude ?? item.longitude ?? "",
      landMark: item.Landmark ?? item.landMark ?? "",
      isActive:
        typeof item.IsActive === "boolean"
          ? item.IsActive
          : item.isActive ?? true,
    };
    return normalized;
  };

  // -------------------- Load City dropdown --------------------
  const loadCity = useCallback(() => {
    comdbprovider
      .getCityMaster(0)
      .then((resp) => {
        if (resp.ok && resp.status === 200) {
          return resp.json().then((rData) => {
            const changed = appCommon.changejsoncolumnname(
              appCommon.changejsoncolumnname(rData, "cityId", "Value"),
              "cityName",
              "Name"
            );
            setCityData(changed);
          });
        } else {
          setCityData([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load city master", err);
        setCityData([]);
      });
  }, [comdbprovider]);

  // -------------------- GET ALL PROPERTIES --------------------
  const getAllProperties = useCallback(async () => {
    try {
      const res = await fetch(API_BASE, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load properties");
      const data = await res.json();
      if (!Array.isArray(data)) {
        // If API returns object, try to handle gracefully
        setGridData([]);
        return;
      }
      const normalized = data.map((it, idx) => normalizeGridItem(it, idx));
      setGridData(normalized);
    } catch (err) {
      console.error("getAllProperties error:", err);
      setGridData([]);
    }
  }, []);

  // -------------------- GET SINGLE PROPERTY (by id) --------------------
  const getPropertyById = useCallback(async (id) => {
    if (!id) return null;
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch property");
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("getPropertyById error:", err);
      return null;
    }
  }, []);

  // -------------------- CREATE PROPERTY (POST) --------------------
  const createProperty = async (model) => {
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(model),
      });
      if (!res.ok) throw new Error("Create failed");
      return await res.json();
    } catch (err) {
      console.error("createProperty error:", err);
      throw err;
    }
  };

  // -------------------- UPDATE PROPERTY (PUT /{id}) --------------------
  const updateProperty = async (id, model) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(model),
      });
      if (!res.ok) throw new Error("Update failed");
      return await res.json();
    } catch (err) {
      console.error("updateProperty error:", err);
      throw err;
    }
  };

  // -------------------- DELETE PROPERTY (DELETE /{id}?updatedBy=) --------------------
  const deleteProperty = async (id, updatedBy = UPDATED_BY_DEFAULT) => {
    try {
      const res = await fetch(`${API_BASE}/${id}?updatedBy=${updatedBy}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Delete failed");
      return await res.json();
    } catch (err) {
      console.error("deleteProperty error:", err);
      throw err;
    }
  };

  // -------------------- Prepare request body from form state --------------------
  const buildRequestModel = () => {
    // Backend examples show fields with PascalCase; keep both AddressLine2 forms to be safe
    return {
      PropertyId: Number(PropertyId) || 0,
      PropertyTypeId: Number(PropertyTypeId) || 0,
      Name: Name || "",
      AddressLine1: AddressLine1 || "",
      AddressLine12: AddressLine2 || "", // include AddressLine12 as some APIs show that
      AddressLine2: AddressLine2 || "", // include AddressLine2 too
      CityId: Number(CityId) || 0,
      ContactNumber: ContactNumber || "",
      Landmark: LandMark || "",
      Pincode: PinCode || "",
      IsActive: true,
      Latitude: Latitude !== "" ? Number(Latitude) : null,
      Longitude: Longitude !== "" ? Number(Longitude) : null,
      State: StateVal || "",
      // optional metadata for update - backend may ignore on create
      UpdatedBy: UPDATED_BY_DEFAULT,
    };
  };

  // -------------------- lifecycle: load city + properties + single prop if redux id --------------------
  useEffect(() => {
    loadCity();
    getAllProperties();
  }, [loadCity, getAllProperties]);

  useEffect(() => {
    // If redux property id exists, fetch it and show in SinglePropertyData
    if (!propertyIdFromRedux) {
      setSinglePropertyData(null);
      return;
    }
    (async () => {
      const d = await getPropertyById(propertyIdFromRedux);
      setSinglePropertyData(d);
    })();
  }, [propertyIdFromRedux, getPropertyById]);

  // -------------------- Grid helpers --------------------
  const findItem = (gridId) => {
    // gridId is 1-based index (as your original code expects)
    return GridData[gridId - 1];
  };

  // -------------------- Handlers: Add / Edit / Delete / Save / Cancel --------------------
  const handleAddNew = () => {
    setPageMode("Add");
    CreateValidator && CreateValidator();
    // reset form
    setPropertyId(0);
    setPropertyTypeId(0);
    setName("");
    setAddressLine1("");
    setAddressLine2("");
    setAddress("");
    setContactNumber("");
    setCityId(0);
    setLandMark("");
    setPinCode("");
    setStateVal("");
    setLatitude("");
    setLongitude("");
  };

  const handleEdit = (gridId) => {
    const row = findItem(gridId);
    if (!row) return;
    setPageMode("Edit");
    CreateValidator && CreateValidator();

    // fill form using normalized row
    setPropertyId(row.propertyId ?? 0);
    setPropertyTypeId(row.propertyTypeId ?? 0);
    setName(row.name || "");
    setAddressLine1(row.addressLine1 || "");
    setAddressLine2(row.addressLine2 || "");
    setAddress(row.address || "");
    setContactNumber(row.contactNumber || "");
    setCityId(row.cityId ?? 0);
    setLandMark(row.landMark || "");
    setPinCode(row.pinCode || "");
    setStateVal(row.state || "");
    setLatitude(row.latitude ?? "");
    setLongitude(row.longitude ?? "");
  };

  const handleDelete = (gridId) => {
    const row = findItem(gridId);
    if (!row) return;

    let myhtml = document.createElement("div");
    myhtml.innerHTML = DELETE_CONFIRMATION_MSG + "</hr>";

    swal({
      buttons: { ok: "Yes", cancel: "No" },
      content: myhtml,
      icon: "warning",
      closeOnClickOutside: false,
      dangerMode: true,
    }).then(async (value) => {
      if (value === "ok") {
        try {
          await deleteProperty(row.propertyId, UPDATED_BY_DEFAULT);
          appCommon.showtextalert("Property Deleted Successfully!", "", "success");
          // refresh grid
          await getAllProperties();
          // ensure page mode reset
          setPageMode("Home");
        } catch (err) {
          appCommon.showtextalert("Delete failed", "", "error");
        }
      }
    });
  };

  const handleSave = async () => {
    // run existing validation if present
    if (ValidateControls && !ValidateControls()) return;

    const model = buildRequestModel();

    try {
      if (PageMode === "Add") {
        await createProperty(model);
        appCommon.showtextalert("Property Created Successfully!", "", "success");
      } else if (PageMode === "Edit") {
        const id = Number(PropertyId) || 0;
        if (!id) throw new Error("Invalid PropertyId for update");
        await updateProperty(id, model);
        appCommon.showtextalert("Property Updated Successfully!", "", "success");
      }
      // refresh and return home
      await getAllProperties();
      setPageMode("Home");
    } catch (err) {
      appCommon.showtextalert("Operation failed", "", "error");
    }
  };

  const handleCancel = () => {
    // reset form and go home
    setPropertyId(0);
    setPropertyTypeId(0);
    setName("");
    setAddressLine1("");
    setAddressLine2("");
    setAddress("");
    setContactNumber("");
    setCityId(0);
    setLandMark("");
    setPinCode("");
    setStateVal("");
    setLatitude("");
    setLongitude("");
    setPageMode("Home");
  };

  // -------------------- Small input helper for mapping original updatetextmodel --------------------
  const updateText = (ctrl, val) => {
    switch (ctrl) {
      case "name":
        setName(val);
        break;
      case "address":
        setAddress(val);
        break;
      case "address1":
        setAddressLine1(val);
        break;
      case "address2":
        setAddressLine2(val);
        break;
      case "landmark":
        setLandMark(val);
        break;
      case "pin":
        setPinCode(val);
        break;
      case "contact":
        setContactNumber(val);
        break;
      case "state":
        setStateVal(val);
        break;
      case "lat":
        setLatitude(val);
        break;
      case "lng":
        setLongitude(val);
        break;
      default:
        break;
    }
  };

  // -------------------- Render --------------------
  return (
    <div>
      {/* Optional: show single property data from redux-driven fetch */}
      {SinglePropertyData && (
        <div className="alert alert-info" style={{ whiteSpace: "pre-wrap" }}>
          <strong>Property (by Redux id):</strong>
          <pre style={{ margin: 0 }}>{JSON.stringify(SinglePropertyData, null, 2)}</pre>
        </div>
      )}

      {/* HOME (grid) */}
      {PageMode === "Home" && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex p-0">
                <ul className="nav ml-auto tableFilterContainer">
                  <li className="nav-item">
                    <div className="input-group input-group-sm">
                      <div className="input-group-prepend">
                        <Button
                          id="btnNewComplain"
                          Action={handleAddNew}
                          ClassName="btn btn-success btn-sm"
                          Icon={<i className="fa fa-plus" aria-hidden="true" />}
                          Text=" Create New Property"
                        />
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="card-body pt-2">
                <DataGrid
                  Id="grdPropertyMaster"
                  IsPagination={false}
                  ColumnCollection={gridHeader}
                  Onpageindexchanged={() => {}}
                  onEditMethod={handleEdit}
                  onGridDeleteMethod={handleDelete}
                  DefaultPagination={false}
                  IsSarching="true"
                  GridData={GridData}
                  pageSize="500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT */}
      {(PageMode === "Add" || PageMode === "Edit") && (
        <div>
          <div className="modal-content">
            <div className="modal-body">
              <div className="row">
                {/* Left column */}
                <div className="col-sm-6">
                  <div className="form-group">
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label htmlFor="ddlPropertyType">Property Type</label>
                          <DropDownList
                            Id="ddlPropertyType"
                            onSelected={(v) => setPropertyTypeId(Number(v))}
                            Options={PropertyTypeData}
                          />
                        </div>
                      </div>
                    </div>

                    <label htmlFor="txtPropertyName">Property Name</label>
                    <InputBox
                      Id="txtPropertyName"
                      Value={Name}
                      onChange={(v) => updateText("name", v)}
                      PlaceHolder="Property Name"
                      Class="form-control form-control-sm"
                    />
                  </div>
                </div>

                {/* Right column */}
                <div className="col-sm-6">
                  <div className="form-group">
                    <label htmlFor="txtAddress1">Address Line 1</label>
                    <InputBox
                      Id="txtAddress1"
                      Value={AddressLine1}
                      onChange={(v) => updateText("address1", v)}
                      PlaceHolder="Address Line 1"
                      Class="form-control form-control-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Address Line 2 & Landmark */}
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label htmlFor="txtAddress2">Address Line 2</label>
                    <InputBox
                      Id="txtAddress2"
                      Value={AddressLine2}
                      onChange={(v) => updateText("address2", v)}
                      PlaceHolder="Address Line 2"
                      Class="form-control form-control-sm"
                    />
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="form-group">
                    <label htmlFor="txtLandMark">Land Mark</label>
                    <InputBox
                      Id="txtLandMark"
                      Value={LandMark}
                      onChange={(v) => updateText("landmark", v)}
                      PlaceHolder="Landmark"
                      Class="form-control form-control-sm"
                    />
                  </div>
                </div>
              </div>

              {/* City + State */}
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label htmlFor="ddlCity">City</label>
                    <DropDownList
                      Id="ddlCity"
                      Options={CityData}
                      onSelected={(v) => setCityId(Number(v))}
                    />
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="form-group">
                    <label htmlFor="txtState">State</label>
                    <InputBox
                      Id="txtState"
                      Value={StateVal}
                      onChange={(v) => updateText("state", v)}
                      PlaceHolder="State"
                      Class="form-control form-control-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Pin + Contact */}
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label htmlFor="txtPinNumber">Pin number</label>
                    <InputBox
                      Id="txtPinNumber"
                      Value={PinCode}
                      onChange={(v) => updateText("pin", v)}
                      PlaceHolder="Pin"
                      Class="form-control form-control-sm"
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label htmlFor="txtContactNumber">Contact number</label>
                    <InputBox
                      Id="txtContactNumber"
                      Value={ContactNumber}
                      onChange={(v) => updateText("contact", v)}
                      PlaceHolder="Contact"
                      Class="form-control form-control-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Lat + Long */}
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label htmlFor="txtLatitude">Latitude</label>
                    <InputBox
                      Id="txtLatitude"
                      Value={Latitude}
                      onChange={(v) => updateText("lat", v)}
                      PlaceHolder="Latitude"
                      Class="form-control form-control-sm"
                    />
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="form-group">
                    <label htmlFor="txtLongitude">Longitude</label>
                    <InputBox
                      Id="txtLongitude"
                      Value={Longitude}
                      onChange={(v) => updateText("lng", v)}
                      PlaceHolder="Longitude"
                      Class="form-control form-control-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* modal footer */}
            <div className="modal-footer">
              <Button Id="btnSave" Text="Save" Action={handleSave} ClassName="btn btn-primary" />
              <Button Id="btnCancel" Text="Cancel" Action={handleCancel} ClassName="btn btn-secondary" />
            </div>
          </div>

          <ToastContainer position="top-right" autoClose={5000} />
        </div>
      )}
    </div>
  );
=======
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
>>>>>>> 029aa7298d8996602c0696bea662095705bf3ea1
}
