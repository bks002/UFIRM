// itemspecification.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux"; // ✅ Added (was missing)
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { FilterMatchMode } from "primereact/api";

import {
  getItemSpecification,
  createItemSpecification,
  getItemSpecificationName,
} from "../../Services/ItemassignService";
import { getAllItems } from "../../Services/InventoryService";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

const ItemSpecificationPage = () => {
  const [items, setItems] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const toast = useRef(null);
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [formData, setFormData] = useState({
    Id: null,
    ItemId: null,
    Name: "",
    Specification: "",
  });

  // 🔹 Fetch all data on mount
  useEffect(() => {
    fetchAllItems();
    fetchItemOptions();
  }, [propertyId]);

  // 🔹 Fetch item specifications
  const fetchAllItems = async () => {
    try {
      const res = await getItemSpecification();
      setItems(res || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load items",
      });
    }
  };

  // 🔹 Fetch items for dropdown
  const fetchItemOptions = async () => {
    try {
      const res = await getAllItems(propertyId);
      const formatted = res.map((item) => ({
        label: item.Name,
        value: { id: item.Id, name: item.Name },
      }));
      setItemOptions(formatted);
    } catch (err) {
      console.error("Error fetching item options:", err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load item list",
      });
    }
  };

  // 🔹 Fetch item specs by name
  const fetchByName = async (name) => {
    if (!name) {
      fetchAllItems();
      return;
    }
    try {
      const res = await getItemSpecificationName(name);
      setItems(res || []);
    } catch (err) {
      console.error("Error fetching by name:", err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to search items",
      });
    }
  };

  // 🔹 Save new item specification
  const handleSave = async () => {
    if (!formData.ItemId || !formData.Specification.trim()) {
      toast.current.show({
        severity: "warn",
        summary: "Missing Data",
        detail: "Please select an item and enter a specification.",
      });
      return;
    }

    try {
      const payload = {
        ItemId: formData.ItemId,
        Name: formData.Name,
        Specification: formData.Specification,
      };

      await createItemSpecification(payload);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Item created successfully",
      });
      setDialogVisible(false);
      fetchAllItems();
    } catch (err) {
      console.error("Save Error:", err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save item",
      });
    }
  };

  // 🔹 Global search filter
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
    fetchByName(value);
  };

  // 🔹 Open dialog for create
  const openCreateDialog = () => {
    setFormData({ Id: null, ItemId: null, Name: "", Specification: "" });
    setDialogVisible(true);
  };

  // 🔹 Header section
  const header = (
    <div className="d-flex justify-content-between align-items-center p-2">
      <h3 className="m-0">Item Master</h3>
      <div className="d-flex gap-2 align-items-center">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search by name..."
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

  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <Toast ref={toast} />
            <div className="pr-6 pl-6">
              <DataTable
                value={items}
                header={header}
                paginator
                rows={10}
                filters={filters}
                globalFilterFields={["Name", "Specification"]}
                emptyMessage="No items found."
                dataKey="Id"
                breakpoint="960px"
              >
                <Column field="Name" header="Item Name" />
                <Column field="Specification" header="Specification" />
              </DataTable>
            </div>
          </div>
        </div>
      </section>

      {/* Dialog for creating specification */}
      <Dialog
        header="Create Item Specification"
        visible={dialogVisible}
        style={{ width: "400px" }}
        modal
        onHide={() => setDialogVisible(false)}
      >
        <div className="flex flex-col gap-4">
          <div className="modal-body">
            <div className="row">
              {/* 🔹 Dropdown for selecting item */}
              <div className="col-12 mt-3 flex flex-column">
                <label htmlFor="item" className="mb-1">Select Item</label>

                <Dropdown
                  id="item"
                  value={
                    formData.ItemId
                      ? { id: formData.ItemId, name: formData.Name }
                      : null
                  }
                  options={itemOptions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ItemId: e.value.id,
                      Name: e.value.name,
                    })
                  }
                  placeholder="Select an Item"
                  className="w-full"
                  showClear
                  filter
                />
              </div>

              {/* 🔹 Specification field */}
              <div className="col-12 mt-3">
                <label htmlFor="specification">Specification</label>
                <input
                  id="specification"
                  placeholder="Enter Specification"
                  type="text"
                  className="form-control"
                  value={formData.Specification}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      Specification: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setDialogVisible(false)}
            />
            <Button label="Save" onClick={handleSave} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ItemSpecificationPage;
