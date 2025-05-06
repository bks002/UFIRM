import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import swal from 'sweetalert';
import { ToastContainer, toast } from 'react-toastify';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import { CreateValidator, ValidateControls } from '../Calendar/Validation';
import * as appCommon from '../../Common/AppCommon.js';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import { getVendors, getVendorById, createVendor, updateVendor, deleteVendor } from "../../Services/InventoryService";
import { useSelector, useDispatch } from 'react-redux';
import ExportToCSV from '../../ReactComponents/ExportToCSV/ExportToCSV.js';
const $ = window.$;

const Vendor = (props) => {
    const [pageMode, setPageMode] = useState("Home");
    const [openDropDown, setOpenDropDown] = useState(false);
    const [gridData, setGridData] = useState([]);
    const gridHeader = [
        { sTitle: 'Id', titleValue: 'Id', "orderable": true },
        { sTitle: 'Name', titleValue: 'Name' },
        { sTitle: 'Contact Person', titleValue: 'ContactPerson' },
        { sTitle: 'Contact Number', titleValue: 'ContactNumber' },
        { sTitle: 'Email', titleValue: 'Email' },
        { sTitle: 'Action', titleValue: 'Action', Action: "Edit&View&Delete", Index: '0', "orderable": false },
    ];
    const emptyVendorData = { Id: 0, Name: '', ContactPerson: '', ContactNumber: '', Email: '', Address: '', GSTNumber: '', PANNumber: '', KYC_DocumentPath: '', PropertyId: propertyId };
    const [VendorData, setVendorData] = useState(emptyVendorData);
    const [loading, setLoading] = useState(false);
    const propertyId = useSelector((state) => state.Commonreducer.puidn);
    const dispatch = useDispatch();

    const getVendorList = useCallback(async (propertyId) => {
        try {
            setLoading(true);
            const data = await getVendors(propertyId);
            setGridData(data);
            setVendorData(data);
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
            appCommon.showtextalert("Error", "Please select a Property.", "error");
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
            setVendorData(data);
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

    const onGridDelete = (VendorData) => {
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
                    handleDeleteVendor(VendorData);
                    break;
                case "cancel":
                default:
                    break;
            }
        });
    };

    const onGridView = async (VendorData) => {
        setPageMode('View');
        CreateValidator();
        try {
            handleViewVendor(VendorData);;

        } catch (error) {
            console.error("Error fetching Vendor details", error);
            appCommon.showtextalert("Error", "Failed to fetch Vendor details.", "error");
        }

    };

    const onGridEdit = async (VendorData) => {
        setPageMode('Edit');
        CreateValidator();
        try {
            const VendorDatails = await getVendorById(VendorData);
            console.log("VendorDatails", VendorDatails);
            setVendorData(VendorDatails);
        } catch (error) {
            console.error("Error fetching Vendor details", error);
            appCommon.showtextalert("Error", "Failed to fetch Vendor details.", "error");
        }
    };

    const Addnew = () => {
        setPageMode('Add');
        CreateValidator();
        setVendorData(emptyVendorData);
    };

    const DropDown = () => {
        setOpenDropDown(!openDropDown);
    };

    const handleSave = () => {
        if (ValidateControls()) {
            if (pageMode === "Add") {
                handleCreateVendor(VendorData);
            } else if (pageMode === "Edit") {
                handleUpdateVendor(VendorData.Id, VendorData);
            }
        }
    };

    const handleCancel = () => {
        setPageMode('Home');
        setVendorData(emptyVendorData);
        getVendorList(propertyId);
        setOpenDropDown(false);
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setVendorData(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const files = VendorData.KYC_DocumentPath ? [...VendorData.KYC_DocumentPath] : [];

    return (
        <>
            <div className="row">
                <div className="col-12">
                    {gridData && gridData.length > 0 && pageMode === 'Home' && (
                        <div className="card">
                            <div className="card-header d-flex p-0 bg" onClick={DropDown} style={{ cursor: 'pointer', backgroundColor: '#f1e7c3' }}>
                                <h5 className="ml-3 mt-2">Pending Approval</h5>
                                <ul className="nav ml-auto tableFilterContainer">
                                    <li className="nav-item">
                                        <div className="input-group input-group-sm">
                                            <div className="input-group-prepend">
                                                <span
                                                    className="btn btn-primary"
                                                    style={{ backgroundColor: '#f1e7c3', color: '#000000' }}
                                                >
                                                    {openDropDown ? '\u2191' : '\u2193'}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="card-body">
                                {openDropDown && (
                                    <DataGrid
                                        Id="ApprovalVendorGrid"
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
                    )}
                </div>
            </div >
            {pageMode === 'Home' && (
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header d-flex p-0">
                                <ul className="nav ml-auto tableFilterContainer">
                                    <li className="nav-item">
                                        <div className="input-group input-group-sm">
                                            <div className="input-group-prepend">
                                                <ExportToCSV data={gridData} classNam="btn btn-success btn-sm rounded mr-2" />
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
                                    Id="VendorDataGrid"
                                    IsPagination={false}
                                    ColumnCollection={gridHeader}
                                    Onpageindexchanged={onPagechange}
                                    onEditMethod={onGridEdit}
                                    onGridDeleteMethod={onGridDelete}
                                    onGridViewMethod={onGridView}
                                    IsSarching="false"
                                    GridData={gridData}
                                    pageSize="3000" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {
                (pageMode === 'Add' || pageMode === 'Edit') && (
                    <div className="modal d-flex align-items-center justify-content-center show" tabIndex="-1" role="dialog">
                        <div className="modal-dialog modal-lg" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalToggleLabel">
                                        {pageMode === 'Add' ? "Add Vendor" : "Edit Vendor"}
                                    </h5>
                                </div>
                                <div className="modal-body p-2">
                                    <form>
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <label htmlFor="Name">Vendor Name</label>
                                                <input
                                                    id="Name"
                                                    required
                                                    placeholder="Enter Vendor Name"
                                                    type="text"
                                                    className="form-control"
                                                    value={VendorData.Name}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="col-sm-6">
                                                <label>Contact Person</label>
                                                <input
                                                    id="ContactPerson"
                                                    required
                                                    placeholder="Enter Description"
                                                    type="text"
                                                    className="form-control"
                                                    value={VendorData.ContactPerson}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="col-sm-6">
                                                <label>Contact Number</label>
                                                <input
                                                    id="ContactNumber"
                                                    required
                                                    placeholder="Enter Contact Number"
                                                    type="number"
                                                    maxLength="10"
                                                    className="form-control"
                                                    value={VendorData.ContactNumber}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="col-sm-6">
                                                <label>Email</label>
                                                <input
                                                    id="Email"
                                                    required
                                                    placeholder="Enter Email"
                                                    type="text"
                                                    className="form-control"
                                                    value={VendorData.Email}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="col-sm-6">
                                                <label>Address</label>
                                                <input
                                                    id="Address"
                                                    required
                                                    placeholder="Enter Address"
                                                    type="text"
                                                    className="form-control"
                                                    value={VendorData.Address}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="col-sm-6">
                                                <label>GST Number</label>
                                                <input
                                                    id="GSTNumber"
                                                    required
                                                    placeholder="Enter GST Number"
                                                    type="text"
                                                    className="form-control"
                                                    value={VendorData.GSTNumber}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="col-sm-6">
                                                <label>PAN Number</label>
                                                <input
                                                    id="PANNumber"
                                                    required
                                                    placeholder="Enter PAN Number"
                                                    type="text"
                                                    className="form-control"
                                                    value={VendorData.PANNumber}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="col-sm-6">
                                                <label>KYC Document</label>
                                                <input
                                                    id="KYC_DocumentPath"
                                                    required
                                                    placeholder="Enter KYC Document Path"
                                                    type="text"
                                                    className="form-control"
                                                    value={VendorData.KYC_DocumentPath}
                                                    onChange={handleInputChange}
                                                    multiple
                                                />
                                            </div>
                                        </div>
                                    </form>
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
                                            <input type="text" className="form-control" id="Name" value={VendorData.Name} readOnly />
                                        </div>
                                        <div className="form-group col-sm-6">
                                            <label htmlFor="name">Contact Person</label>
                                            <input type="text" className="form-control" id="ContactPerson" value={VendorData.ContactPerson} readOnly />
                                        </div>
                                        <div className="form-group col-sm-6">
                                            <label htmlFor="name">Contact Number</label>
                                            <input type="text" className="form-control" id="ContactNumber" value={VendorData.ContactNumber} readOnly />
                                        </div>
                                        <div className="form-group col-sm-6">
                                            <label htmlFor="name">Email</label>
                                            <input type="text" className="form-control" id="Email" value={VendorData.Email} readOnly />
                                        </div>
                                        <div className="form-group col-sm-6">
                                            <label htmlFor="name">Address</label>
                                            <input type="text" className="form-control" id="Address" value={VendorData.Address} readOnly />
                                        </div>
                                        <div className="form-group col-sm-6">
                                            <label htmlFor="name">GST Number</label>
                                            <input type="text" className="form-control" id="GSTNumber" value={VendorData.GSTNumber} readOnly />
                                        </div>
                                        <div className="form-group col-sm-6">
                                            <label htmlFor="name">PAN Number</label>
                                            <input type="text" className="form-control" id="PANNumber" value={VendorData.PANNumber} readOnly />
                                        </div>
                                        <div className="form-group col-sm-6">
                                            <label htmlFor="name">KYC Document</label>
                                            <input type="text" className="form-control" id="KYC_DocumentPath" value={VendorData.KYC_DocumentPath} readOnly />
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