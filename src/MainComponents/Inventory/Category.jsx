import React, { useState, useEffect, useCallback } from 'react';
import swal from 'sweetalert';
import { ToastContainer, toast } from 'react-toastify';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import { CreateValidator, ValidateControls } from '../Calendar/Validation';
import * as appCommon from '../../Common/AppCommon.js';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from "../../Services/InventoryService";
import { useSelector, useDispatch } from 'react-redux';
const $ = window.$;

const Category = (props) => {
    const [pageMode, setPageMode] = useState("Home");
    const [cName, setCName] = useState("");
    const [cDescription, setCDescription] = useState("");
    const [isApproved, setIsApproved] = useState(false);
    const [openDropDown, setOpenDropDown] = useState(false);
    const [gridData, setGridData] = useState([]);
    const [gridHeader] = useState([
        { sTitle: 'Id', titleValue: 'Id', "orderable": true },
        { sTitle: 'Name', titleValue: 'Name' },
        { sTitle: 'Description', titleValue: 'Description' },
        { sTitle: 'Action', titleValue: 'Action', Action: "Edit&View&Delete", Index: '0', "orderable": false },
    ]);
    const [gridDataA, setGridDataA] = useState([]);
    const [gridHeaderA] = useState([
        { sTitle: 'Id', titleValue: 'Id', "orderable": true },
        { sTitle: 'Name', titleValue: 'Name' },
        { sTitle: 'Description', titleValue: 'Description' },
        { sTitle: 'Is Approved', titleValue: 'IsApproved' },
        { sTitle: 'Action', titleValue: 'Action', Action: "Delete", Index: '0', "orderable": false },
    ]);
    const [catId, setCatId] = useState(0);
    const [loading, setLoading] = useState(false);
    const propertyId = useSelector((state) => state.Commonreducer.puidn);
    const dispatch = useDispatch();

    const getCategoriesList = useCallback(async (propertyId) => {
        try {
            setLoading(true);
            const data = await getCategories(propertyId);
            //console.log("Categories List:", data);
            setGridData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching Categories:', error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (propertyId) {
            setGridData([]); 
            getCategoriesList(propertyId);
        } else {
            setGridData([]); 
        }
    }, [getCategoriesList, propertyId]);


    const handleCreateCategory = async (newCategory) => {
        try {
            await createCategory(newCategory);
            appCommon.showtextalert("Category Saved Successfully!", "", "success");
            handleCancel();
            await getCategoriesList(propertyId);
        } catch (error) {
            appCommon.showtextalert("Error Creating Category", error.message, "error");
        }
    };

    const handleUpdateCategory = async (id, updatedCategory) => {
        try {
            await updateCategory(id, updatedCategory);
            appCommon.showtextalert("Category Updated Successfully!", "", "success");
            handleCancel();
            await getCategoriesList(propertyId);
        } catch (error) {
            appCommon.showtextalert("Error Updating Category", error.message, "error");
        }
    };

    const handleViewCategory = async (id) => {
        try {
            const data = await getCategoryById(id);
            //console.log("Category Data:", data);
            return data;
            //appCommon.showtextalert("Category Viewed Successfully!", "", "success");
            //handleCancel();
        } catch (error) {
            appCommon.showtextalert("Error viewing Category", error.message, "error");
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await deleteCategory(id);
            appCommon.showtextalert("Category Deleted Successfully!", "", "success");
            await getCategoriesList(propertyId);
        } catch (error) {
            appCommon.showtextalert("Error Deleting Category", error.message, "error");
        }
    };

    const onPagechange = (page) => {

    };

    const onGridDelete = (Id) => {
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
                    setCatId(Id);
                    handleDeleteCategory(Id);
                    break;
                case "cancel":
                default:
                    break;
            }
        });
    };

    const onGridView = async (catId) => {
        //console.log("catId", catId);
        setPageMode('View');
        CreateValidator();
        try {
            handleViewCategory(catId).then((data) => {
                setCName(data.Name);
                setCDescription(data.Description);
            });
            //console.log(handleViewCategory(catId));

        } catch (error) {
            console.error("Error fetching category details", error);
            appCommon.showtextalert("Error", "Failed to fetch category details.", "error");
        }

    };

    const onGridEdit = async (Id) => {
        setPageMode('Edit');
        CreateValidator();
        try {
            const categoryData = await getCategoryById(Id);
            //console.log("Category Data:", categoryData);
            setCatId(categoryData.Id);
            setCName(categoryData.name);
            setCDescription(categoryData.description);

        } catch (error) {
            console.error("Error fetching category details", error);
            appCommon.showtextalert("Error", "Failed to fetch category details.", "error");
        }
    };

    const Addnew = () => {
        setPageMode('Add');
        CreateValidator();
        setCName("");
        setCDescription("");
        getCategoriesList(propertyId);
    };

    const DropDown = () => {
        setOpenDropDown(!openDropDown);
    };

    const handleSave = () => {
        if (ValidateControls()) {
            if (pageMode === "Add") {
                const newCategory = {
                    Name: cName,
                    Description: cDescription,
                    PropertyId: propertyId
                }
                handleCreateCategory(newCategory);
            } else if (pageMode === "Edit") {
                const updatedCategory = {
                    Id: catId,
                    Name: cName,
                    Description: cDescription,
                    PropertyId: propertyId
                }
                //console.log("Updated Category:", updatedCategory);
                handleUpdateCategory(catId, updatedCategory);
            }
        }
    };

    const handleCancel = () => {
        setPageMode('Home');
        setCName("");
        setCDescription("");
        getCategoriesList(propertyId);
        setOpenDropDown(false);
    };

    return (
        <>
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex p-0">
                            <h5 className="ml-3 mt-2">Pending Approval</h5>
                            <ul className="nav ml-auto tableFilterContainer">
                                <li className="nav-item">
                                    <div className="input-group input-group-sm">
                                        <div className="input-group-prepend">
                                            <button
                                                id="dropdown"
                                                className="btn btn-primary dropdown-toggle"
                                                onClick={DropDown}
                                            >
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="card-body pt-2">
                            {openDropDown && (
                                <DataGrid
                                    Id="ApprovalGrid"
                                    IsPagination={false}
                                    ColumnCollection={gridHeaderA}
                                    Onpageindexchanged={onPagechange}
                                    onEditMethod={onGridEdit}
                                    onGridDeleteMethod={onGridDelete}
                                    onGridViewMethod={onGridView}
                                    IsSarching="false"
                                    GridData={gridData}
                                    pageSize="2000" />
                            )}
                        </div>
                    </div>
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
                                                <Button id="btnaddCalendarFrequency"
                                                    Action={Addnew}
                                                    ClassName="btn btn-success btn-sm"
                                                    Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                                    Text="Add Category" />
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="card-body pt-2">

                                <DataGrid
                                    Id="grdCalendarFrequency"
                                    IsPagination={false}
                                    ColumnCollection={gridHeader}
                                    Onpageindexchanged={onPagechange}
                                    onGridDeleteMethod={onGridDelete}
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
                                    {pageMode === 'Add' ? "Add Category" : "Edit Category"}
                                </h5>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-12">
                                        <label>Category Name</label>
                                        <input
                                            id="CName"
                                            required
                                            placeholder="Enter Category Name"
                                            type="text"
                                            className="form-control"
                                            value={cName}
                                            onChange={(e) => setCName(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12 mt-3">
                                        <label>Description</label>
                                        <input
                                            id="CDescription"
                                            required
                                            placeholder="Enter Description"
                                            type="text"
                                            className="form-control"
                                            value={cDescription}
                                            onChange={(e) => setCDescription(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer justify-content-start">
                                <Button Id="btnSave" Text="Save" Action={handleSave}
                                    ClassName="btn btn-primary" />
                                <Button Id="btnCancel" Text="Cancel" Action={handleCancel}
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
                <div className="modal d-flex align-items-center justify-content-center show" tabIndex="-1" role="dialog">
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" >View Category</h5>
                            </div>
                            <div className="modal-body p-2">
                                <form>
                                    <div className="row">
                                        <div className="form-group col-sm-6">
                                            <label htmlFor="name">Name:</label>
                                            <input type="text" className="form-control" id="CName" value={cName} readOnly />
                                        </div>
                                        <div className="form-group col-sm-6">
                                            <label htmlFor="name">Description:</label>
                                            <input type="text" className="form-control" id="CDescription" value={cDescription} readOnly />
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer justify-content-start">
                                <Button Id="btnCancel" Text="Close" Action={handleCancel}
                                    ClassName="btn btn-secondary" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default Category;

