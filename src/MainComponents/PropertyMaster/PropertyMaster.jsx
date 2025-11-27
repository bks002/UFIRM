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
}
