import React, { useState, useEffect, useCallback } from 'react';
import swal from 'sweetalert';
import { ToastContainer, toast } from 'react-toastify';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import * as appCommon from '../../Common/AppCommon.js';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import { useSelector, useDispatch } from 'react-redux';
import { createItem, deleteItem, getAllItems, getCategories, getItemById, updateItem, PendingApprovalItem } from "../../Services/InventoryService";
import ExportToCSV from "../../ReactComponents/ExportToCSV/ExportToCSV";
import ApprovalPage from "./ApprovalPage";

const ReadOnlyField = ({ label, value }) => (
  <div className="form-group col-12">
    <label>{label}</label>
    <input type="text" className="form-control" value={value || 'N/A'} readOnly />
  </div>
);

const ItemMaster = (props) => {
  const [pageMode, setPageMode] = useState("Home");
  const [gridData, setGridData] = useState([]);
  const [gridApproved, setgridApproved] = useState([]);
  const gridHeader = [
    { sTitle: 'Id', titleValue: 'Id', "orderable": true },
    { sTitle: 'Name', titleValue: 'Name' },
    { sTitle: 'Description', titleValue: 'Description' },
    { sTitle: 'Action', titleValue: 'Action', Action: "Edit&View&Delete", Index: '0', "orderable": false },
  ];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openDropDown, setOpenDropDown] = useState(false);
  const propertyId = useSelector((state) => state.Commonreducer.puidn);
  const emptyItem = {
    Id: 0,
    Name: "",
    Description: "", CategoryId: 0, MeasurementUnit: "", MinStockLevel: "", BrandName: "", HSNCode: "", IsApproved: false
  };
  const [item, setItem] = useState(emptyItem);
  const [categories, setCategories] = useState([]);

  const getItems = async (propertyId) => {
    try {
      setLoading(true);
      const data = await getAllItems(propertyId);
      setGridData(data);
      setItem(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Categories:', error);
      setLoading(false);
    }
  };

  const getItemsApproved = async (propertyId) => {
    try {
      setLoading(true);
      const data = await PendingApprovalItem(propertyId);
      setgridApproved(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Categories:', error);
      setLoading(false);
    }
  };

  const getAllCategories = async (propertyId) => {
    try {
      setLoading(true);
      const data = await getCategories(propertyId);
      setGridData(data);
      setCategories(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Categories:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      setgridApproved([]);
      setGridData([]);
      getItemsApproved(propertyId);
      getItems(propertyId);
    } else {
      setgridApproved([]);
      setGridData([]);
      appCommon.showtextalert("Error", "Please Select a Property.", "error");
    }
  }, [propertyId, openDropDown]);

  const onPagechange = (page) => { };

  const onGridApprove = async (itemApprovedId) => {
    try {
      const approvedItem = gridApproved.find(item => item.Id === itemApprovedId);
      if (approvedItem) {
        const updatedItem = { ...approvedItem, IsApproved: true };
        await updateItem(updatedItem.Id, updatedItem);
        appCommon.showtextalert("Item Approved Successfully!", "", "success");
        setgridApproved(prevData => prevData.filter(item => item.Id !== itemApprovedId));
        await getItems(propertyId);
      }
    } catch (error) {
      appCommon.showtextalert("Error Approving Item", error.message, "error");
      console.error("Error approving Item:", error);
    }
  };

  const handleDeleteItem = async (Id) => {
    try {
      setLoading(true);
      const response = await deleteItem(Id);
      appCommon.showtextalert("Success", "Item deleted successfully", "success");
      getItemsApproved(propertyId);
      getItems(propertyId);
      console.log(response);
    } catch (error) {
      console.error('Error updating Item:', error);
      setError(error);
    } finally {
      setLoading(false);
    }

  }

  const onGridDelete = (item) => {
    let myhtml = document.createElement("div");
    myhtml.innerHTML = DELETE_CONFIRMATION_MSG + "</hr>";
    swal({
      buttons: {
        ok: "Yes",
        cancel: "No",
      },
      content: myhtml,
      icon: "warning",
      closeOnClickOutside: false,
      dangerMode: true
    }).then((value) => {
      switch (value) {
        case "ok":
          handleDeleteItem(item);
          break;
        case "cancel":
        default:
          break;
      }
    });
  };

  const onGridView = async (catId) => {
    await getAllCategories(propertyId);
    const selectedItem = await getItemById(catId);
    setItem(selectedItem);
    setPageMode("View");
  };

  const onGridEdit = async (Id) => {
    await getAllCategories(propertyId);
    const selectedItem = await getItemById(Id);
    setItem(selectedItem);
    setPageMode("Edit");
  };

  const handleUpdateItem = async () => {
    try {
      setLoading(true);
      const response = await updateItem(item.Id, item);
      appCommon.showtextalert("Success", "Item updated successfully", "success");
      getItemsApproved(propertyId);
      getItems(propertyId);
      console.log(response);
    } catch (error) {
      console.error('Error updating Item:', error);
      setError(error);
    } finally {
      setLoading(false);
      handleClose();
    }
  }

  const handleCreateItem = async () => {
    try {
      setLoading(true);
      const newItem = { ...item, PropertyId: propertyId };
      const response = await createItem(newItem);
      appCommon.showtextalert("Success", "Item created successfully", "success");
      getItemsApproved(propertyId);
      getItems(propertyId);
      console.log(response);
    } catch (error) {
      console.error('Error creating Item:', error);
      setError(error);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const addNewItem = async () => {
    await getAllCategories(propertyId);
    setPageMode("Add");
  };

  const handleClose = () => {
    setItem(emptyItem);
    setPageMode("Home");
    getItems(propertyId);
  };

  const getCategoryName = (categoryId) => {
    return categories.find(cat => cat.Id === categoryId).Name || "N/A";
  };

  return (
    <>
      <div className="row">
        <div className="col-12">
          {gridApproved.length > 0 && pageMode === "Home" && (
            <ApprovalPage
              title={"Pending For Approval"}
              gridHeader={gridHeader}
              gridData={gridApproved}
              onGridEdit={onGridEdit}
              onGridDelete={onGridDelete}
              onGridApprove={onGridApprove}
              onGridView={onGridView}
            />
          )}
        </div>
      </div>
      {pageMode === 'Home' && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex p-0">
                <ul className="nav ml-auto tableFilterContainer">
                  <li className="nav-item">
                    <div className="input-group input-group-sm">
                      <div className="input-group-prepend">
                        <ExportToCSV data={gridData} className="btn btn-success btn-sm rounded mr-2" />
                        <Button
                          id="btnNewItem"
                          Action={addNewItem}
                          ClassName="btn btn-success btn-sm rounded"
                          Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                          Text="Add New Item"
                        />
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="card-body pt-2">
                <DataGrid
                  Id="ItemMaster"
                  IsPagination={false}
                  ColumnCollection={gridHeader}
                  Onpageindexchanged={onPagechange}
                  onEditMethod={onGridEdit}
                  onGridDeleteMethod={onGridDelete}
                  onGridViewMethod={onGridView}
                  DefaultPagination={false}
                  IsSarching="false"
                  GridData={gridData}
                  pageSize="2000" />
              </div>
            </div>
          </div>
        </div>
      )}
      {(pageMode === 'Add' || pageMode === 'Edit') && (
        <div className="modal d-flex align-items-center justify-content-center show" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalToggleLabel">
                  {pageMode === 'Add' ? "Add Item" : "Edit Item"}
                </h5>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-12">
                    <label>Category</label>
                    <select
                      className="form-control"
                      value={item.CategoryId}
                      onChange={(e) => setItem({ ...item, CategoryId: parseInt(e.target.value) })}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.Id} value={cat.Id}>
                          {cat.Name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <label>Item Name</label>
                    <input
                      id="Name"
                      required
                      placeholder="Enter Item Name"
                      type="text"
                      className="form-control"
                      value={item.Name}
                      onChange={(e) => setItem({ ...item, Name: e.target.value })}
                    />
                  </div>
                  <div className="col-12 mt-3">
                    <label>Description</label>
                    <input
                      id="Description"
                      required
                      placeholder="Enter Description"
                      type="text"
                      className="form-control"
                      value={item.Description}
                      onChange={(e) => setItem({ ...item, Description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <label>Measuring Unit</label>
                    <input
                      id="Name"
                      required
                      placeholder="Enter Item Name"
                      type="text"
                      className="form-control"
                      value={item.MeasurementUnit}
                      onChange={(e) => setItem({ ...item, MeasurementUnit: e.target.value })}
                    />
                  </div>
                  <div className="col-12 mt-3">
                    <label>Minimum Stock Level</label>
                    <input
                      id="Description"
                      required
                      placeholder="Enter Description"
                      type="text"
                      className="form-control"
                      value={item.MinStockLevel}
                      onChange={(e) => setItem({ ...item, MinStockLevel: e.target.value })}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <label>Brand Name</label>
                    <input
                      id="BrandName"
                      required
                      placeholder="Enter Brand Name"
                      type="text"
                      className="form-control"
                      value={item.BrandName}
                      onChange={(e) => setItem({ ...item, BrandName: e.target.value })}
                    />
                  </div>
                  <div className="col-12 mt-3">
                    <label>HSN Code</label>
                    <input
                      id="HSN_Code"
                      required
                      placeholder="Enter HSN Code"
                      type="text"
                      className="form-control"
                      value={item.HSNCode}
                      onChange={(e) => setItem({ ...item, HSNCode: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer justify-content-start">
                <Button
                  Id="btnSave"
                  Text={pageMode === "Add" ? "Create" : "Update"}
                  Action={pageMode === "Add" ? handleCreateItem : handleUpdateItem}
                  ClassName="btn btn-primary"
                />

                <Button Id="btnCancel" Text="Cancel" Action={handleClose}
                  ClassName="btn btn-secondary" />
              </div>
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
            </div>
          </div>
        </div>
      )}
      {pageMode === 'View' && (
        <div className="modal d-flex align-items-center justify-content-center show" tabIndex="-1" role="dialog"
          aria-modal="true">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">View Item</h5>
              </div>
              <div className="modal-body p-2">
                <form>
                  <div className="row">
                    <ReadOnlyField label="Category" value={getCategoryName(item.CategoryId)} />
                    <ReadOnlyField label="Name" value={item.Name} />
                    <ReadOnlyField label="Description" value={item.Description} />
                    <ReadOnlyField label="Measuring Unit" value={item.MeasurementUnit} />
                    <ReadOnlyField label="Minimum Stock Level" value={item.MinStockLevel} />
                    <ReadOnlyField label="Brand Name" value={item.BrandName} />
                    <ReadOnlyField label="HSN Code" value={item.HSNCode} />
                  </div>
                </form>
              </div>
              <div className="modal-footer justify-content-start">
                <Button Id="btnCancel" Text="Close" Action={handleClose} ClassName="btn btn-secondary" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ItemMaster;