"use client"

import React, { useState, useEffect, useRef } from "react"
import { FilterMatchMode } from "primereact/api"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { InputText } from "primereact/inputtext"
import { Dropdown } from "primereact/dropdown"
import { Button } from "primereact/button"
import { Toast } from "primereact/toast"
import { getCategories, getAllItems, getVendors, createRateCard, getRateCard } from "../../Services/InventoryService"
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
    const [filters, setFilters] = useState({
        CategoryName: { value: null, matchMode: FilterMatchMode.EQUALS },
        ItemName: { value: null, matchMode: FilterMatchMode.EQUALS },
        VendorName: { value: null, matchMode: FilterMatchMode.EQUALS },
    })

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
            setSelectedRateCard(data)
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

    useEffect(() => {
        console.log("Categories:", categories)
        console.log("Items:", items)
        console.log("Vendors:", vendors)
    }, [categories, items, vendors])

    const openNew = async () => {
        setRateCardData({
            CategoryId: 0,
            ItemId: 0,
            VendorId: 0,
            Price: 0.0,
            ValidTill: null,
            CreatedBy: 1,
            IsApproved: true,
        })
        setPageMode("addAttachment")
        setIsDialogVisible(true)
    }

    // const editRateCard = async (data) => {
    //     setRateCardData({ ...data, ValidTill: data.ValidTill ? new Date(data.ValidTill) : null });
    //     setPageMode('Edit');
    //     setIsDialogVisible(true);
    // };

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
            reject: () => { },
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
            return new Date(value).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
        }
        return ""
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button
                    icon={<i className="fa fa-eye" aria-hidden="true"></i>}
                    className="p-button-rounded p-button-info mr-2"
                    onClick={() => viewRateCard(rowData)}
                    tooltip="View"
                />
                {/* <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editRateCard(rowData)} tooltip="Edit" /> */}
                <Button
                    icon={<i className="fa fa-trash" aria-hidden="true"></i>}
                    className="p-button-rounded p-button-danger"
                    onClick={() => confirmDelete(rowData)}
                    tooltip="Delete"
                />
            </React.Fragment>
        )
    }

    const header = (
        <div className="d-flex p-0">
            <h2>Rate Card</h2>
            <ul className="nav ml-auto tableFilterContainer">
                <li className="nav-item">
                    <div className="input-group input-group-sm">
                        <div className="input-group-prepend">
                            <span className="p-input-icon-right">
                                <i className="pi pi-search" />
                                <InputText
                                    type="search"
                                    onInput={(e) => setGlobalFilterValue(e.target.value)}
                                    placeholder="Search..."
                                />
                            </span>
                            <ExportToCSV data={gridData} className="btn btn-success btn-sm rounded ml-4 mr-2" />
                            <Button
                                label="Add New Rate"
                                icon="pi pi-plus"
                                className="btn btn-success btn-sm rounded ml-4"
                                onClick={openNew}
                            />
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    )

    const categoryFilterTemplate = (options) => {
        if (!options) {
            return null
        }

        return (
            <Dropdown
                value={categories.find(cat => cat.Name === options.value)}
                options={categories}
                onChange={(e) => {
                    options.filterCallback(e.value ? e.value.Name : null)
                }}
                itemTemplate={(item) => <span>{item.Name}</span>}
                placeholder="All"
                className="p-column-filter"
                optionLabel="Name"
            />
        )
    }

    const itemFilterTemplate = (options) => {
        if (!options) {
            return null
        }

        return (
            <Dropdown
                value={items.find(item => item.Name === options.value)}
                options={items}
                onChange={(e) => {
                    options.filterCallback(e.value ? e.value.Name : null)
                }}
                itemTemplate={(item) => <span>{item.Name}</span>}
                placeholder="All"
                className="p-column-filter"
                optionLabel="Name"
            />
        )
    }

    const vendorFilterTemplate = (options) => {
        if (!options) {
            return null
        }

        return (
            <Dropdown
                value={vendors.find(ven => ven.Name === options.value)}
                options={vendors}
                onChange={(e) => {
                    options.filterCallback(e.value ? e.value.Name : null)
                }}
                itemTemplate={(item) => <span>{item.Name}</span>}
                placeholder="All"
                className="p-column-filter"
                optionLabel="Name"
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
                label={pageMode === "Add" ? "Create" : "Create"}
                icon="pi pi-check"
                className="p-button-text"
                onClick={saveRateCard}
            />
        </React.Fragment>
    )

    return (
        <div className="card">
            <Toast ref={toast} />
            <confirmDialog />
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
            >
                <Column field="VendorName" header="Vendor" sortable filter filterElement={vendorFilterTemplate} />
                <Column field="ItemName" header="Item" sortable filter filterElement={itemFilterTemplate} />
                <Column field="CategoryName" header="Category" sortable filter filterElement={categoryFilterTemplate} />
                <Column field="Price" header="Rate" body={(rowData) => `${rowData.Price}`} />
                <Column field="ValidTill" header=" Valid Till" body={(rowData) => formatDate(rowData.ValidTill)} />
                <Column header="Action" body={actionBodyTemplate} />
            </DataTable>

            <Dialog
                visible={isDialogVisible}
                style={{ width: "30vw" }}
                header={`${pageMode === "Add" ? "Add" : "Add"} Rate Card`}
                modal
                footer={rateCardDialogFooter}
                onHide={hideDialog}
            >
                <div className="row">
                    <div className="col-12 md:col-6">
                        <div className="mb-3">
                            <label htmlFor="category">Category</label>
                            <div className="mb-3"><Dropdown
                                id="category"
                                onChange={onCategoryChange}
                                value={categories.find((cat) => cat.Id === rateCardData.CategoryId)}
                                options={categories}
                                optionLabel="Name"
                                placeholder="Select Category"
                            /></div>
                        </div>
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="mb-3">
                            <label htmlFor="item">Item</label>
                            <div className="mb-3">
                                <Dropdown
                                    id="item"
                                    value={items.find((item) => item.Id === rateCardData.ItemId)}
                                    onChange={onItemChange}
                                    options={items.filter((item) => item.CategoryId === rateCardData.CategoryId)}
                                    optionLabel="Name"
                                    placeholder="Select Item"
                                    disabled={!rateCardData.CategoryId}
                                />
                            </div>
                            {!rateCardData.CategoryId && <small className="p-error">Please select a category first.</small>}
                            {rateCardData.CategoryId &&
                                items.filter((item) => item.CategoryId === rateCardData.CategoryId).length === 0 && (
                                    <small className="p-text-secondary">No items available for the selected category.</small>
                                )}
                        </div>
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="mb-3">
                            <label htmlFor="vendor">Vendor</label>
                            <div className="mb-3">
                                <Dropdown
                                    id="vendor"
                                    value={vendors.find((ven) => ven.Id === rateCardData.VendorId)}
                                    onChange={onVendorChange}
                                    options={vendors}
                                    optionLabel="Name"
                                    placeholder="Select Vendor"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-12 md:col-6">
                        <div>
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
                    </div>
                    <div className="col-12 md:col-6">
                        <div>
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
                </div>
            </Dialog>

            <Dialog
                visible={viewDialogVisible}
                style={{ width: "50vw" }}
                header="View Rate Card"
                modal
                footer={viewRateCardDialogFooter}
                onHide={hideViewDialog}
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
                                <InputText value={`${selectedRateCard.Price}`} readOnly />
                                {items.find((item) => item.Name === selectedRateCard.ItemName) && (
                                    <span className="p-inputgroup-addon">
                                        &nbsp;/{items.find((item) => item.Name === selectedRateCard.ItemName).MeasurementUnit}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-field">
                            <label>Valid Till</label>
                            <InputText value={`${selectedRateCard.ValidTill}`} readOnly />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    )
}

export default RateCard
