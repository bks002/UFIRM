"use client";

import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { FilterMatchMode } from "primereact/api";
import { Dropdown } from "primereact/dropdown"; // ✅ Added for dropdown
import {
  getItemSpecification,
  createItemSpecification,
  getItemSpecificationName,
} from "../../Services/ItemassignService";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

const ItemSpecificationPage = () => {
  const [items, setItems] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const toast = useRef(null);

  // Dialog states
  const [dialogVisible, setDialogVisible] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    Name: "",
    Specification: "",
  });

  // ✅ Dropdown states
  const [itemOptions, setItemOptions] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // 🔹 Fetch all items on load
  useEffect(() => {
    fetchAllItems();
  }, []);

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

  // 🔹 Fetch item list for dropdown
  const fetchItemDropdown = async () => {
    setLoadingItems(true);
    try {
      const response = await fetch(
        "https://api.urest.in:8096/api/inventory/items?propertyId=27"
      );
      const data = await response.json();
      const formatted = data.map((item) => ({
        label: item.Name,
        value: item.Name,
      }));
      setItemOptions(formatted);
    } catch (error) {
      console.error("Dropdown Fetch Error:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load item list",
      });
    } finally {
      setLoadingItems(false);
    }
  };

  // 🔹 Search by item name
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

  // 🔹 Create
  const handleSave = async () => {
    try {
      await createItemSpecification(formData);
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

  // 🔹 Search filter change
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
    fetchByName(value);
  };

  // 🔹 Open create dialog
  const openCreateDialog = async () => {
    setFormData({ Id: null, Name: "", Specification: "" });
    await fetchItemDropdown(); // ✅ Load dropdown data before opening
    setDialogVisible(true);
  };

  // 🔹 Handle dropdown change
  const handleItemChange = (value) => {
    setFormData({ ...formData, Name: value });
  };

  // 🔹 Table header
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

  // 🔹 Table
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

      {/* Dialog for create */}
      <Dialog
        header="Create Item"
        visible={dialogVisible}
        style={{ width: "400px" }}
        modal
        onHide={() => setDialogVisible(false)}
      >
        <div className="flex flex-col gap-4">
          <div className="modal-body">
            <div className="row">
              {/* ✅ Dropdown for Item Name */}
              <div className="col-12">
                <label htmlFor="name">Item Name</label>
                <Dropdown
                  value={formData.Name}
                  options={itemOptions}
                  onChange={(e) => handleItemChange(e.value)}
                  placeholder={
                    loadingItems ? "Loading items..." : "Select Item"
                  }
                  disabled={loadingItems}
                  className="w-full"
                />
              </div>

              <div className="col-12 mt-3">
                <label htmlFor="specification">Specification</label>
                <input
                  id="Specification"
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
