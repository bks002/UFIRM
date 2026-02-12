"use client"

import React, { useState, useEffect, useRef } from "react"
import axios from 'axios';
import { FilterMatchMode } from "primereact/api"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { InputText } from "primereact/inputtext"
import { Dropdown } from "primereact/dropdown"
import { Button } from "primereact/button"
import { Toast } from "primereact/toast"
import { getCategories, getAllItems, getVendors, createRateCard, getRateCard , fetchFilteredItems } from "../../Services/InventoryService"
import { confirmDialog } from "primereact/confirmdialog"
import { DELETE_CONFIRMATION_MSG } from "../../Contants/Common"
import { Dialog } from "primereact/dialog"
import { useSelector, useDispatch } from "react-redux"
import "primereact/resources/themes/lara-light-blue/theme.css"
import { Calendar } from "primereact/calendar"
import ExportToCSV from "../../ReactComponents/ExportToCSV/ExportToCSV"

const RateCard = (props) => {
  const [gridData, setGridData] = useState([])
  const [loading, setLoading] = useState(false)
  const propertyId = useSelector((state) => state.Commonreducer.puidn)
  const dispatch = useDispatch()
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [vendors, setVendors] = useState([])
  const [globalFilterValue, setGlobalFilterValue] = useState("")
  const toast = useRef(null)
  const [isDialogVisible, setIsDialogVisible] = useState(false)
  const [rateCardData, setRateCardData] = useState({
    CategoryId: 0,
    ItemId: 0,
    VendorId: 0,
    Price: 0.0,
    ValidTill: null,
    CreatedBy: 0,
    IsApproved: true,
    CategoryName: "",
    ItemName: "",
    VendorName: "",
  })
  const [viewDialogVisible, setViewDialogVisible] = useState(false)
  const [selectedRateCard, setSelectedRateCard] = useState(null)
  const [pageMode, setPageMode] = useState("home")
  const [viewMode, setViewMode] = useState("panel")
  const [selectedRateCardId, setSelectedRateCardId] = useState(null)
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    CategoryName: { value: null, matchMode: FilterMatchMode.EQUALS },
    ItemName: { value: null, matchMode: FilterMatchMode.EQUALS },
    VendorName: { value: null, matchMode: FilterMatchMode.EQUALS },
  })

  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    if(rateCardData.CategoryId){
      loadfiltereditems(propertyId,rateCardData)
    }
  }, [propertyId, rateCardData.CategoryId]);

  const loadfiltereditems = async (propertyId,rateCardData) => {
    try {
      const data = await fetchFilteredItems(propertyId, rateCardData.CategoryId)
      setFilteredItems(data);
    } catch (error) {
      console.error("Error fetching Item:", error)
      toast.current.show({ severity: "error", summary: "Error", detail: "Failed to load Item", life: 3000 })
    }
  }

  useEffect(() => {
    if (propertyId) {
      setGridData([])
      loadInitialData()
    } else {
      setGridData([])
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: <div className="flex items-center h-screen">Please select a property</div>,
        life: 3000,
      })
    }
  }, [propertyId])

  useEffect(() => {
    if (!gridData.length) {
      setSelectedRateCardId(null)
      return
    }
    if (!gridData.some((x) => x.Id === selectedRateCardId)) {
      setSelectedRateCardId(gridData[0].Id)
    }
  }, [gridData, selectedRateCardId])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      await Promise.all([loadCategories(), loadItems(), loadVendors()])
      await loadRateCardList()
    } catch (error) {
      console.error("Error loading initial data:", error)
      toast.current.show({ severity: "error", summary: "Error", detail: "Failed to load initial data", life: 3000 })
    } finally {
      setLoading(false)
    }
  }

  const loadRateCardList = async () => {
    try {
      const data = await getRateCard(propertyId)
      setGridData(data)
    } catch (error) {
      console.error("Error fetching Rate Card:", error)
      toast.current.show({ severity: "error", summary: "Error", detail: "Failed to load rate cards", life: 3000 })
    }
  }

  const loadCategories = async () => {
    const data = await getCategories(propertyId)
    setCategories(data)
  }

  const loadItems = async () => {
    const data = await getAllItems(propertyId)
    setItems(data)
  }

  const loadVendors = async () => {
    const data = await getVendors(propertyId)
    setVendors(data)
  }

  const openNew = async () => {
    setRateCardData({
      CategoryId: 0,
      ItemId: 0,
      VendorId: 0,
      Price: 0.0,
      ValidTill: null,
      CreatedBy: 1,
      IsApproved: true,
      CategoryName: "",
      ItemName: "",
      VendorName: "",
    })
    setPageMode("Add")
    setIsDialogVisible(true)
  }

  const editRateCard = (data) => {
    setRateCardData({
      Id: data.Id,
      CategoryId: data.CategoryId,
      ItemId: data.ItemId,
      VendorId: data.VendorId,
      Price: data.Price,
      ValidTill: data.ValidTill ? new Date(data.ValidTill) : null,
      CreatedBy: data.CreatedBy || 1,
      IsApproved: data.IsApproved ?? true,
      CategoryName: data.CategoryName || "",
      ItemName: data.ItemName || "",
      VendorName: data.VendorName || "",
    })
    setPageMode("Edit")
    setIsDialogVisible(true)
  }

  const viewRateCard = async (data) => {
    setSelectedRateCard({
      ...data,
      Category: data.CategoryName,
      Item: data.ItemName,
      Vendor: data.VendorName,
      ValidTill: data.ValidTill,
    })
    setViewDialogVisible(true)
  }

  const hideDialog = () => {
    setIsDialogVisible(false)
  }

  const hideViewDialog = () => {
    setViewDialogVisible(false)
  }

  const saveRateCard = async () => {
    setLoading(true)
    try {
      const payload = {
        ...rateCardData,
        PropertyId: propertyId,
        ValidTill: rateCardData.ValidTill ? new Date(rateCardData.ValidTill).toISOString() : null,
      }
      await createRateCard(payload)
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: `Rate Card ${rateCardData.Id === undefined ? "created" : "updated"} successfully`,
        life: 3000,
      })
      setIsDialogVisible(false)
      loadRateCardList()
    } catch (error) {
      console.error("Error saving Rate Card:", error)
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `Failed to ${rateCardData.Id === undefined ? "create" : "update"} rate card`,
        life: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (data) => {
    confirmDialog({
      message: DELETE_CONFIRMATION_MSG,
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => deleteRateCard(data),
      reject: () => {},
    })
  }

  const deleteRateCard = async (data) => {
    setLoading(true)
    try {
      const updatedGridData = gridData.filter((item) => item.Id !== data.Id)
      setGridData(updatedGridData)
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Rate Card deleted successfully",
        life: 3000,
      })
    } catch (error) {
      console.error("Error deleting Rate Card:", error)
      toast.current.show({ severity: "error", summary: "Error", detail: "Failed to delete rate card", life: 3000 })
    } finally {
      setLoading(false)
    }
  }

  const onCategoryChange = (e) => {
    const selectedCategoryId = e.value
    setRateCardData({
      ...rateCardData,
      CategoryId: selectedCategoryId.Id,
      CategoryName: selectedCategoryId.Name,
      ItemId: 0,
      ItemName: "",
    })
  }

  const onItemChange = (e) => {
    const selectedItemId = e.value
    setRateCardData({ ...rateCardData, ItemId: selectedItemId.Id, ItemName: selectedItemId.Name })
  }

  const onVendorChange = (e) => {
    const selectedVendorId = e.value
    setRateCardData({ ...rateCardData, VendorId: selectedVendorId.Id, VendorName: selectedVendorId.Name })
  }

  const formatDate = (value) => {
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      }
    }
    return ""
  }

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon={<i className="fa fa-eye" aria-hidden="true"></i>}
          className="p-button-rounded p-button-info mr-2 ratecard-icon-btn view"
          onClick={() => viewRateCard(rowData)}
          tooltip="View"
        />
        <Button
          icon={<i className="fa fa-pencil" aria-hidden="true"></i>}
          className="p-button-rounded p-button-warning mr-2 ratecard-icon-btn edit"
          onClick={() => editRateCard(rowData)}
          tooltip="Edit"
        />
        <Button
          icon={<i className="fa fa-trash" aria-hidden="true"></i>}
          className="p-button-rounded p-button-danger ratecard-icon-btn delete"
          onClick={() => confirmDelete(rowData)}
          tooltip="Delete"
        />
      </React.Fragment>
    )
  }

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    setGlobalFilterValue(value)
    setFilters((prevFilters) => ({
      ...prevFilters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    }))
  }

  const header = (
    <div className="card-header d-flex justify-content-between align-items-center p-2 flex-wrap" style={{ gap: "10px" }}>
      <div className="d-flex align-items-center" style={{ gap: "12px" }}>
        <div className="ratecard-view-toggle">
          <button
            type="button"
            className={viewMode === "panel" ? "active" : ""}
            onClick={() => setViewMode("panel")}
          >
            Panel View
          </button>
          <button
            type="button"
            className={viewMode === "table" ? "active" : ""}
            onClick={() => setViewMode("table")}
          >
            Table View
          </button>
        </div>
        <span className="p-input-icon-right">
          <i className="pi pi-search" />
          <InputText
            type="search"
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search..."
            className="form-control"
          />
        </span>
      </div>

      <div className="d-flex align-items-center" style={{ gap: "8px" }}>
        <ExportToCSV data={gridData} className="btn btn-success btn-sm rounded ml-2 mr-2" />
        <Button label="Add New Rate" icon="pi pi-plus" className="btn btn-success btn-sm rounded" onClick={openNew} />
      </div>
    </div>
  )

  const categoryFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={categories.map((cat) => cat.Name)}
        onChange={(e) => {
          options.filterApplyCallback(e.value)
        }}
        placeholder="All"
        className="p-column-filter"
      />
    )
  }

  const itemFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={items.map((item) => item.Name)}
        onChange={(e) => {
          options.filterApplyCallback(e.value)
        }}
        placeholder="All"
        className="p-column-filter"
      />
    )
  }

  const vendorFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={vendors.map((vendor) => vendor.Name)}
        onChange={(e) => {
          options.filterApplyCallback(e.value)
        }}
        placeholder="All"
        className="p-column-filter"
      />
    )
  }

  const viewRateCardDialogFooter = (
    <Button label="Close" icon="pi pi-times" onClick={hideViewDialog} className="p-button-secondary" />
  )

  const rateCardDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
      <Button
        label={pageMode === "Add" ? "Create" : "Update"}
        icon="pi pi-check"
        className="p-button-text"
        onClick={saveRateCard}
      />
    </React.Fragment>
  )

  return (
    <div className="card">
      <Toast ref={toast} />
      <style>{`
        .ratecard-view-toggle {
          display: inline-flex;
          border: 1px solid #d4e3ed;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
        }
        .ratecard-view-toggle button {
          border: none;
          background: transparent;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #4A7FA8;
          cursor: pointer;
        }
        .ratecard-view-toggle button.active {
          background: #e8f1f8;
          color: #1E4A6B;
        }
        .ratecard-icon-btn {
          width: 28px !important;
          height: 28px !important;
          padding: 0 !important;
          border-radius: 7px !important;
          border: 1px solid transparent !important;
        }
        .ratecard-icon-btn.view {
          background: #e8f1f8 !important;
          color: #1E4A6B !important;
          border-color: #cfe0ee !important;
        }
        .ratecard-icon-btn.edit {
          background: #fff4e8 !important;
          color: #ff8b00 !important;
          border-color: #ffd8ad !important;
        }
        .ratecard-icon-btn.delete {
          background: #ffecec !important;
          color: #d64545 !important;
          border-color: #ffc9c9 !important;
        }
        .ratecard-panel-layout {
          display: grid;
          grid-template-columns: 360px minmax(0, 1fr);
          gap: 12px;
          padding: 12px;
        }
        .ratecard-panel-list {
          border: 1px solid #d4e3ed;
          border-radius: 8px;
          background: #fff;
          max-height: 560px;
          overflow-y: auto;
          padding: 8px;
        }
        .ratecard-panel-item {
          width: 100%;
          text-align: left;
          border: 1px solid #e4edf4;
          border-radius: 8px;
          background: #fff;
          padding: 10px;
          margin-bottom: 8px;
          cursor: pointer;
        }
        .ratecard-panel-item.active {
          background: #eef5fb;
          border-color: #4A7FA8;
          box-shadow: inset 2px 0 0 #4A7FA8;
        }
        .ratecard-panel-detail {
          border: 1px solid #d4e3ed;
          border-radius: 8px;
          background: #fff;
          padding: 14px;
        }
        .ratecard-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(140px, 1fr));
          gap: 12px;
          margin-top: 10px;
        }
        .ratecard-label {
          font-size: 11px;
          text-transform: uppercase;
          color: #7a8ea0;
          font-weight: 700;
          margin-bottom: 3px;
        }
        .ratecard-value {
          font-size: 13px;
          color: #1E4A6B;
          font-weight: 600;
        }
        .ratecard-dialog .p-dialog-header {
          border-bottom: 1px solid #d4e3ed;
          background: #f8fafb;
        }
        .ratecard-dialog .p-dialog-title {
          color: #1E4A6B;
          font-weight: 700;
        }
        .ratecard-form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .ratecard-field label {
          font-size: 12px;
          color: #4f6475;
          font-weight: 600;
          margin-bottom: 6px;
          display: block;
        }
        .ratecard-dialog-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        @media (max-width: 1024px) {
          .ratecard-panel-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {viewMode === "table" && (
      <DataTable
        value={gridData}
        loading={loading}
        header={header}
        paginator
        rows={10}
        filters={filters}
        filterDisplay="row"
        globalFilter={globalFilterValue}
        emptyMessage="No rate cards found."
        dataKey="Id"
        globalFilterFields={["VendorName", "ItemName", "CategoryName"]}
        breakpoint="960px"
      >
        <Column
          field="VendorName"
          header="Vendor"
          sortable
          showFilterMenu={false}
          filter
          filterElement={vendorFilterTemplate}
        />
        <Column
          field="ItemName"
          header="Item"
          sortable
          showFilterMenu={false}
          filter
          filterElement={itemFilterTemplate}
        />
        <Column
          field="CategoryName"
          header="Category"
          sortable
          showFilterMenu={false}
          filter
          filterElement={categoryFilterTemplate}
        />
        <Column field="Price" header="Rate" body={(rowData) => `₹${rowData.Price}`} />
        <Column field="ValidTill" header=" Valid Till" body={(rowData) => formatDate(rowData.ValidTill)} />
        <Column header="Action" body={actionBodyTemplate} />
      </DataTable>
      )}

      {viewMode === "panel" && (
        <>
          {header}
          <div className="ratecard-panel-layout">
            <div className="ratecard-panel-list">
              {gridData.map((row) => (
                <button
                  key={row.Id}
                  type="button"
                  className={`ratecard-panel-item ${selectedRateCardId === row.Id ? "active" : ""}`}
                  onClick={() => setSelectedRateCardId(row.Id)}
                >
                  <div style={{ fontWeight: 700, color: "#1E4A6B", fontSize: 13 }}>{row.ItemName || "-"}</div>
                  <div style={{ marginTop: 2, color: "#7a8ea0", fontSize: 11 }}>{row.VendorName || "-"}</div>
                  <div style={{ marginTop: 6, color: "#4A7FA8", fontWeight: 700, fontSize: 12 }}>
                    ₹{row.Price} {row.ValidTill ? `• ${formatDate(row.ValidTill)}` : ""}
                  </div>
                </button>
              ))}
            </div>
            <div className="ratecard-panel-detail">
              {(() => {
                const active = gridData.find((x) => x.Id === selectedRateCardId) || gridData[0];
                if (!active) return <div className="text-muted">No rate cards found.</div>;
                return (
                  <>
                    <div className="d-flex justify-content-between align-items-start">
                      <h3 style={{ margin: 0, color: "#1E4A6B", fontWeight: 700 }}>{active.ItemName}</h3>
                      <div className="d-flex">
                        <Button
                          icon={<i className="fa fa-eye" aria-hidden="true"></i>}
                          className="p-button-rounded mr-2 ratecard-icon-btn view"
                          onClick={() => viewRateCard(active)}
                          tooltip="View"
                        />
                        <Button
                          icon={<i className="fa fa-pencil" aria-hidden="true"></i>}
                          className="p-button-rounded mr-2 ratecard-icon-btn edit"
                          onClick={() => editRateCard(active)}
                          tooltip="Edit"
                        />
                        <Button
                          icon={<i className="fa fa-trash" aria-hidden="true"></i>}
                          className="p-button-rounded ratecard-icon-btn delete"
                          onClick={() => confirmDelete(active)}
                          tooltip="Delete"
                        />
                      </div>
                    </div>
                    <div className="ratecard-detail-grid">
                      <div><div className="ratecard-label">Category</div><div className="ratecard-value">{active.CategoryName || "-"}</div></div>
                      <div><div className="ratecard-label">Vendor</div><div className="ratecard-value">{active.VendorName || "-"}</div></div>
                      <div><div className="ratecard-label">Rate</div><div className="ratecard-value">₹{active.Price}</div></div>
                      <div><div className="ratecard-label">Valid Till</div><div className="ratecard-value">{formatDate(active.ValidTill) || "-"}</div></div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </>
      )}

      <Dialog
        visible={isDialogVisible}
        style={{ width: "50vw" }}
        className="ratecard-dialog"
        contentStyle={{ backgroundColor: "white" }}
        header={`${pageMode === "Add" ? "Add" : "Edit"} Rate Card`}
        modal
        footer={<div className="ratecard-dialog-footer">{rateCardDialogFooter}</div>}
        onHide={hideDialog}
        breakpoints={{ "960px": "80vw", "640px": "95vw" }}
      >
        <div className="ratecard-form-grid">
          <div className="ratecard-field">
              <label htmlFor="category">Category</label>
                  <Dropdown
                    id="category"
                    onChange={onCategoryChange}
                    value={categories.find((cat) => cat.Id === rateCardData.CategoryId)}
                    options={categories}
                    optionLabel="Name"
                    placeholder="Select Category"
                  />
          </div>
          <div className="ratecard-field">
              <label htmlFor="item">Item</label>
                  <Dropdown
                    id="item"
                    value={filteredItems.find(item => item.Id === rateCardData.ItemId)}
                    onChange={onItemChange}
                    options={filteredItems}
                    optionLabel="Name"
                    placeholder="Select Item"
                    disabled={!rateCardData.CategoryId}
                  />
              {!rateCardData.CategoryId && <small className="p-error">Please select a category first.</small>}
              {rateCardData.CategoryId &&
                filteredItems.length === 0 && (
                  <small className="p-text-secondary">No items available for the selected category.</small>
                )}
          </div>
          <div className="ratecard-field">
              <label htmlFor="vendor">Vendor</label>
                  <Dropdown
                    id="vendor"
                    value={vendors.find((ven) => ven.Id === rateCardData.VendorId)}
                    onChange={onVendorChange}
                    options={vendors}
                    optionLabel="Name"
                    placeholder="Select Vendor"
                  />
          </div>
          <div className="ratecard-field">
              <label htmlFor="rate">Rate</label>
              <div className="p-inputgroup">
                <InputText
                  type="number"
                  id="rate"
                  value={rateCardData.Price}
                  onChange={(e) =>
                    setRateCardData({
                      ...rateCardData,
                      Price: e.target.value === "" ? "" : Number.parseFloat(e.target.value),
                    })
                  }
                />
                {items.find((item) => item.Id === rateCardData.ItemId) && (
                  <span className="p-inputgroup-addon">
                    /{items.find((item) => item.Id === rateCardData.ItemId).MeasurementUnit}
                  </span>
                )}
              </div>
          </div>
          <div className="ratecard-field">
              <label htmlFor="ValidTill">Valid Till</label>
              <div className="p-inputgroup">
                <Calendar
                  value={rateCardData.ValidTill ? new Date(rateCardData.ValidTill) : null}
                  dateFormat="dd/mm/yy"
                  onChange={(e) => setRateCardData({ ...rateCardData, ValidTill: e.value })}
                  showIcon
                />
              </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={viewDialogVisible}
        style={{ width: "50vw" }}
        header="View Rate Card"
        modal
        footer={viewRateCardDialogFooter}
        onHide={hideViewDialog}
        breakpoints={{ "960px": "50vw", "640px": "95vw" }}
      >
        {selectedRateCard && (
          <div className="p-fluid">
            <div className="p-field">
              <label>Category</label>
              <InputText value={`${selectedRateCard.CategoryName}`} readOnly />
            </div>
            <div className="p-field">
              <label>Item</label>
              <InputText value={`${selectedRateCard.ItemName}`} readOnly />
            </div>
            <div className="p-field">
              <label>Vendor</label>
              <InputText value={`${selectedRateCard.VendorName}`} readOnly />
            </div>

            <div className="p-field">
              <label>Rate</label>
              <div className="p-inputgroup">
                <InputText value={`₹${selectedRateCard.Price}`} readOnly />
                {items.find((item) => item.Name === selectedRateCard.ItemName) && (
                  <span className="p-inputgroup-addon">
                    &nbsp;/{items.find((item) => item.Name === selectedRateCard.ItemName).MeasurementUnit}
                  </span>
                )}
              </div>
            </div>

            <div className="p-field">
              <label>Valid Till</label>
              <InputText value={`${formatDate(selectedRateCard.ValidTill)}`} readOnly />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}

export default RateCard
