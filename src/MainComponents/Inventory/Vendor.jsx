import React, { useState, useEffect, useCallback } from 'react';
import swal from 'sweetalert';
import { ToastContainer, toast } from 'react-toastify';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import { CreateValidator, ValidateControls } from '../Calendar/Validation';
import * as appCommon from '../../Common/AppCommon.js';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import { getVendors, getVendorById, createVendor, updateVendor, deleteVendor } from "../../Services/InventoryService";
import { useSelector, useDispatch } from 'react-redux';
const $ = window.$;

const Vendor = (props) => {
    const [pageMode, setPageMode] = useState("Home");
    const [vName, setvName] = useState("");
    const [vContactPerson, setvContactPerson] = useState("");
    const [vContactNo, setvContactNo] = useState("");
    const [vEmail, setvEmail] = useState("");
    const [vGSTNo, setvGSTNo] = useState("");
    const [isApproved, setIsApproved] = useState(false);
    const [openDropDown, setOpenDropDown] = useState(false);
    const [gridData, setGridData] = useState([]);
    const [gridHeader] = useState([
        { sTitle: 'Id', titleValue: 'Id', "orderable": true },
        { sTitle: 'Name', titleValue: 'Name' },
        { sTitle: 'Contact Person', titleValue: 'ContactPerson' },
        { sTitle: 'Contact Number', titleValue: 'ContactNo' },
        { sTitle: 'Email', titleValue: 'Email' },
        { sTitle: 'GST Number', titleValue: 'GSTNo' },
        { sTitle: 'Action', titleValue: 'Action', Action: "Edit&View&Delete", Index: '0', "orderable": false },
    ]);
    const [VenId, setVenId] = useState(0);
    const [loading, setLoading] = useState(false);
    const propertyId = useSelector((state) => state.Commonreducer.puidn);
    const dispatch = useDispatch();

    const getVendorList = useCallback(async (propertyId) => {
        try {
            setLoading(true);
            const data = await getVendors(propertyId);
            //console.log("Categories List:", data);
            setGridData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching Vendors:', error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (propertyId) {
            setGridData([]); 
            getVendorList(propertyId);
        } else {
            setGridData([]); 
        }
    }, [getVendorList, propertyId]);


    const handleCreateVendor = async (newVendor) => {
        try {
            await createVendor(newVendor);
            appCommon.showtextalert("Vendor Saved Successfully!", "", "success");
            handleCancel();
            await getVendorList(propertyId);
        } catch (error) {
            appCommon.showtextalert("Error Creating Vendor", error.message, "error");
        }
    };

    const handleUpdateVendor = async (id, updatedVendor) => {
        try {
            await updateVendor(id, updatedVendor);
            appCommon.showtextalert("Vendor Updated Successfully!", "", "success");
            handleCancel();
            await getVendorList(propertyId);
        } catch (error) {
            appCommon.showtextalert("Error Updating Vendor", error.message, "error");
        }
    };

    const handleViewVendor = async (id) => {
        try {
            const data = await getVendorById(id);
            //console.log("Vendor Data:", data);
            return data;
            //appCommon.showtextalert("Vendor Viewed Successfully!", "", "success");
            //handleCancel();
        } catch (error) {
            appCommon.showtextalert("Error viewing Vendor", error.message, "error");
        }
    };

    const handleDeleteVendor = async (id) => {
        try {
            await deleteVendor(id);
            appCommon.showtextalert("Vendor Deleted Successfully!", "", "success");
            await getVendorList(propertyId);
        } catch (error) {
            appCommon.showtextalert("Error Deleting Vendor", error.message, "error");
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
                    setVenId(Id);
                    handleDeleteVendor(Id);
                    break;
                case "cancel":
                default:
                    break;
            }
        });
    };

    const onGridView = async (VenId) => {
        //console.log("catId", catId);
        setPageMode('View');
        CreateValidator();
        try {
            handleViewVendor(VenId).then((data) => {
                setvName(data.Name);
                setvContactPerson(data.ContactPerson);
                setvContactNo(data.ContactNo);
                setvEmail(data.Email);
                setvGSTNo(data.GSTNo);
            });
            //console.log(handleViewVendor(catId));

        } catch (error) {
            console.error("Error fetching Vendor details", error);
            appCommon.showtextalert("Error", "Failed to fetch Vendor details.", "error");
        }

    };

    const onGridEdit = async (Id) => {
        setPageMode('Edit');
        CreateValidator();
        try {
            const VendorData = await getVendorById(Id);
            //console.log("Vendor Data:", VendorData);
            setVenId(VendorData.Id);
            setvName(VendorData.name);
            setvContactPerson(VendorData.ContactPerson);
            setvContactNo(VendorData.ContactNo);
            setvEmail(VendorData.Email);
            setvGSTNo(VendorData.GSTNo);

        } catch (error) {
            console.error("Error fetching Vendor details", error);
            appCommon.showtextalert("Error", "Failed to fetch Vendor details.", "error");
        }
    };

    const Addnew = () => {
        setPageMode('Add');
        CreateValidator();
        setvName("");
        setvContactPerson("");
        setvContactNo("");
        setvEmail("");
        setvGSTNo("");
        getVendorList(propertyId);
    };

    const DropDown = () => {
        setOpenDropDown(!openDropDown);
    };

    const handleSave = () => {
        if (ValidateControls()) {
            if (pageMode === "Add") {
                const newVendor = {
                    Name: vName,
                    ContactPerson: vContactPerson,
                    ContactNo: vContactNo,
                    Email: vEmail,
                    GSTNo: vGSTNo,
                    PropertyId: propertyId
                }
                handleCreateVendor(newVendor);
            } else if (pageMode === "Edit") {
                const updatedVendor = {
                    Id: VenId,
                    Name: vName,
                    ContactPerson: vContactPerson,
                    ContactNo: vContactNo,
                    Email: vEmail,
                    GSTNo: vGSTNo,
                    PropertyId: propertyId
                }
                //console.log("Updated Vendor:", updatedVendor);
                handleUpdateVendor(VenId, updatedVendor);
            }
        }
    };

    const handleCancel = () => {
        setPageMode('Home');
        setvName("");
        setvContactPerson("");
        setvContactNo("");
        setvEmail("");
        setvGSTNo("");
        getVendorList(propertyId);
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
                                    ColumnCollection={gridHeader}
                                    Onpageindexchanged={onPagechange}
                                    onGridDeleteMethod={onGridDelete}
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
                                                    Text="Add Vendor" />
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
                                    onEditMethod={onGridEdit}
                                    onGridDeleteMethod={onGridDelete}
                                    onGridViewMethod={onGridView}
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
                                    {pageMode === 'Add' ? "Add Vendor" : "Edit Vendor"}
                                </h5>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-12">
                                        <label>Vendor Name</label>
                                        <input
                                            id="vName"
                                            required
                                            placeholder="Enter Vendor Name"
                                            type="text"
                                            className="form-control"
                                            value={vName}
                                            onChange={(e) => setvName(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12 mt-3">
                                        <label>Contact Person</label>
                                        <input
                                            id="vContactPerson"
                                            required
                                            placeholder="Enter Description"
                                            type="text"
                                            className="form-control"
                                            value={vContactPerson}
                                            onChange={(e) => setvContactPerson(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12 mt-3">
                                        <label>Contact Number</label>
                                        <input
                                            id="vContactNo"
                                            required
                                            placeholder="Enter Contact Number"
                                            type="text"
                                            className="form-control"
                                            value={vContactNo}
                                            onChange={(e) => setvContactNo(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12 mt-3">
                                        <label>Email</label>
                                        <input
                                            id="vEmail"
                                            required
                                            placeholder="Enter Email"
                                            type="text"
                                            className="form-control"
                                            value={vEmail}
                                            onChange={(e) => setvEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12 mt-3">
                                        <label>GST Number</label>
                                        <input
                                            id="vGSTNo"
                                            required
                                            placeholder="Enter GST Number"
                                            type="text"
                                            className="form-control"
                                            value={vGSTNo}
                                            onChange={(e) => setvGSTNo(e.target.value)}
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
                                <h5 className="modal-title" >View Vendor</h5>
                            </div>
                            <div className="modal-body p-2">
                                <form>
                                    <div className="row">
                                        <div className="form-group col-sm-6">
                                            <label htmlFor="name">Name</label>
                                            <input type="text" className="form-control" id="vName" value={vName} readOnly />
                                        </div>
                                        <div className="form-group col-sm-6">
                                            <label htmlFor="name">Contact Person</label>
                                            <input type="text" className="form-control" id="vContactPerson" value={vContactPerson} readOnly />
                                        </div>
                                        <div className="form-group col-sm-6">
                                            <label htmlFor="name">Contact Number</label>
                                            <input type="text" className="form-control" id="vContactNo" value={vContactNo} readOnly />
                                        </div>
                                        <div className="form-group col-sm-6">
                                            <label htmlFor="name">Email</label>
                                            <input type="text" className="form-control" id="vEmail" value={vEmail} readOnly />
                                        </div>
                                        <div className="form-group col-sm-6">
                                            <label htmlFor="name">GST Number</label>
                                            <input type="text" className="form-control" id="vGSTNo" value={vGSTNo} readOnly />
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

export default Vendor;