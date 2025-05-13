import React, { useState, useEffect } from 'react';
import swal from 'sweetalert';
import { ToastContainer } from 'react-toastify';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import { CreateValidator, ValidateControls } from '../Calendar/Validation';
import * as appCommon from '../../Common/AppCommon.js';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import { getCategories, getAllItems, getVendors } from "../../Services/InventoryService";
import { useSelector, useDispatch } from 'react-redux';
import ExportToCSV from '../../ReactComponents/ExportToCSV/ExportToCSV.js';
const $ = window.$;

const ReadOnlyField = ({ label, value }) => (
    <div className="form-group col-12">
        <label>{label}</label>
        <input type="text" className="form-control" value={value || 'N/A'} readOnly />
    </div>
);

const RateCard = (props) => {
    const [pageMode, setPageMode] = useState('Home');
    const [Loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const emptyRateCardData = {
        Id: 0,
        category: 0,
        Item: 0,
        Vendors: 0,
        Rate: "",
        propertyId: propertyId,
    };
    const propertyId = useSelector((state) => state.Commonreducer.puidn);
    const [RateCardData, setRateCardData] = useState(emptyRateCardData);
    const gridHeader = [
        { sTitle: 'Id', titleValue: 'Id', "orderable": true },
        { sTitle: 'Category', titleValue: 'category' },
        { sTitle: 'Item', titleValue: 'Item' },
        { sTitle: 'Vendor', titleValue: 'Vendors' },
        { sTitle: 'Rate', titleValue: 'Rate' },
        { sTitle: 'Action', titleValue: 'Action', Action: "Edit&View&Delete", Index: '0', "orderable": false }
    ];
    const dispatch = useDispatch();
    const [gridData, setGridData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [Items, setItems] = useState([]);
    const [Vendor, setVendor] = useState([]);
    //const [SelectedItemDetails,setSelectedItemDetails]= useState(null);

    useEffect(() => {
        if (propertyId) {
            setGridData([]);
            getRatecardList(emptyRateCardData);
        }
        else {
            setGridData([]);
            swal({
                title: "Error",
                text: "Please select a property",
                icon: "error",
                button: "OK",
            });
        }
    }, []);

    const getRatecardList = async () => {
        try {
            setLoading(true);
            setGridData(RateCardData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching Rate Card:', error);
            setLoading(false);
        }
    };

    const handleDeleteRateCard = async (RateCardData) => {
        try {
            setLoading(true);
            //const response = await deleteRateCard(RateCardData);
            appCommon.showtextalert("Success", "Item deleted successfully", "success");
        } catch (error) {
            console.error('Error updating Item:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }

    const onGridDelete = (RateCardData) => {
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
                    handleDeleteRateCard(RateCardData);
                    break;
                case "cancel":
                default:
                    break;
            }
        });
    };

    const getRateCardById = async (catId) => {
        try {
            setLoading(true);
            console.log("Rate Card Got By Id");
            //const data = await getCategories(catId);
            //setGridData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching Rate Card:', error);
            setLoading(false);
        }
    };

    const onGridView = async (catId) => {
        await getCategoriesList(propertyId);
        await getItems(propertyId);
        await getAllVendors(propertyId);
        //const selectedRateCard = await getViewRateCard(catId);
        //setItem(selectedRateCard);
        setPageMode("View");
    };

    const onGridEdit = async (Id) => {
        setPageMode("Edit");
        await getCategoriesList(propertyId);
        await getItems(propertyId);
        await getAllVendors(propertyId);
        const selectedRateCard = await getRateCardById(Id);
        // if (selectedRateCard && selectedRateCard.Item) {
        //     const itemDetails = Items.find(item => item.Id === selectedRateCard.Item);
        //     setSelectedItemDetails(itemDetails);
        //     //console.log(SelectedItemDetails);
        // } else {
        //     setSelectedItemDetails(null);
        //     //console.log(SelectedItemDetails);
        // }
        setRateCardData(selectedRateCard);
    };

    const handleUpdateRateCard = async () => {
        try {
            setLoading(true);
            //const response = await updateRateCard(RateCardData.id, RateCardData);
            appCommon.showtextalert("Success", "Rate Card updated successfully", "success");
            //console.log(response);
        } catch (error) {
            console.error('Error updating Rate Card:', error);
            setError(error);
        } finally {
            setLoading(false);
            handleClose();
        }
    }

    const handleClose = () => {
        setPageMode('Home');
        setRateCardData(emptyRateCardData);
        setGridData([]);
        setLoading(false);
        setError("");
    }

    const handleCreateRateCard = async () => {
        try {
            setLoading(true);
            //const response = await createRateCard(RateCardData);
            appCommon.showtextalert("Success", "Rate Card created successfully", "success");
            //console.log(response);
        } catch (error) {
            console.error('Error creating Rate Card:', error);
            setError(error);
        } finally {
            setLoading(false);
            handleClose();
        }
    };

    const getCategoriesList = async (propertyId) => {
        try {
            setLoading(true);
            const data = await getCategories(propertyId);
            //setGridData(data);
            setCategories(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching Categories:', error);
            setLoading(false);
        }
    };

    const getItems = async (propertyId) => {
        try {
            setLoading(true);
            const data = await getAllItems(propertyId);
            //setGridData(data);
            setItems(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching Categories:', error);
            setLoading(false);
        }
    };

    const getAllVendors = async (propertyId) => {
        try {
            setLoading(true);
            const data = await getVendors(propertyId);
            //setGridData(data);
            setVendor(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching Categories:', error);
            setLoading(false);
        }
    };

    const onPagechange = () => { }

    const AddnewRateCard = async () => {
        await getCategoriesList(propertyId);
        await getItems(propertyId);
        await getVendors(propertyId);
        //setRateCardData(emptyRateCardData);
        setPageMode('Add');
    }

    const getCategoryName = (category) => {
        return categories.find(cat => cat.id === category).Name || "N/A";
    };

    const getItemName = (Items) => {
        return Items.find(item => item.id === Items.id).Name || "N/A";
    };
    //console.log(categories); 
    //console.log(Items);
    const getVendorName = (Vendor) => {
        return Vendor.find(vendor => vendor.id === Vendor).Name || "N/A";
    };

    return (
        <>
            {pageMode === 'Home' && (
                <div className='row'>
                    <div className='col-md-12'>
                        <div className='card'>
                            <div className='card-header d-flex p-0'>
                                <ul className='nav ml-auto tableFilterContainer'>
                                    <li className='nav-item'>
                                        <div className='input-group input-group-sm'>
                                            <div className="input-group-prepend">
                                                {/* <ExportToCSV data={RateCardData} className="btn btn-success btn-sm rounded mr-2" /> */}
                                                <Button id="btnaddCalendarFrequency"
                                                    Action={AddnewRateCard}
                                                    ClassName="btn btn-success btn-sm rounded"
                                                    Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                                    Text="Add Rate Card" />
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="card-body pt-2">
                                <DataGrid
                                    Id="RateCardGrid"
                                    IsPagination={false}
                                    ColumnCollection={gridHeader}
                                    Onpageindexchanged={onPagechange}
                                    onEditMethod={onGridEdit}
                                    onGridDeleteMethod={onGridDelete}
                                    onGridViewMethod={onGridView}
                                    IsSarching={true}
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
                                    {pageMode === 'Add' ? "Add Rate Card" : "Edit Rate Card"}
                                </h5>
                            </div>
                            <div className="modal-body">
                                <div className='row'>
                                    <div className='col-md-6'>
                                        <label>Category</label>
                                        <select
                                            name="category"
                                            value={RateCardData.category}
                                            onChange={(e) => {
                                                const selectedCategoryId = parseInt(e.target.value);
                                                setRateCardData({ ...RateCardData, category: selectedCategoryId}); 
                                            }}
                                            className="form-control"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.Id} value={cat.Id}>
                                                    {cat.Name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='col-md-6'>
                                        <label htmlFor="item">Item</label>
                                        <select
                                            name="item"
                                            value={RateCardData.Item}
                                            onChange={(e) => {
                                                const selectedItem= parseInt(e.target.value);
                                                setRateCardData({ ...RateCardData, Item: selectedItem })
                                            }}
                                            className="form-control"
                                            disabled={!RateCardData.category} 
                                        >
                                            <option value="">Select Item</option>
                                            {Items
                                                .filter(item => item.CategoryId === RateCardData.category)
                                                .map((item) => (
                                                    <option key={item.Id} value={item.Id}>
                                                        {item.Name}
                                                    </option>
                                                ))}
                                        </select>
                                        {!RateCardData.category && <small className="form-text text-muted">Please select a category first.</small>}
                                        {RateCardData.category && Items.filter(item => item.CategoryId === RateCardData.category).length === 0 && (
                                            <small className="form-text text-muted">No items available for the selected category.</small>
                                        )}
                                    </div>
                                    <div className='col-md-6'>
                                        <label htmlFor="vendor">Vendor</label>
                                        <select
                                            name="vendor"
                                            value={RateCardData.Vendors}
                                            onChange={(e) => setRateCardData({ ...RateCardData, Vendors: parseInt(e.target.value) })}
                                            className="form-control"
                                        >
                                            <option value="">Select Vendors</option>
                                            {Vendor.map((vendor) => (
                                                <option key={vendor.Id} value={vendor.Id}>
                                                    {vendor.Name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='col-md-6'>
                                        <label htmlFor="rate">Rate</label>
                                        <div className='input-group'>
                                        <input
                                            type="text"
                                            name="rate"
                                            value={RateCardData.Rate}
                                            onChange={(e) => setRateCardData({ ...RateCardData, Rate: e.target.value })}
                                            className="form-control"
                                            
                                        />
                                         {Items.find(item=>item.Id === RateCardData.Item) &&(<span className="input-group-text">
                                                /{Items.find(item => item.Id === RateCardData.Item).MeasurementUnit}
                                            </span>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer justify-content-start">
                                <Button
                                    Id="btnSave"
                                    Text={pageMode === "Add" ? "Create" : "Update"}
                                    Action={pageMode === "Add" ? handleCreateRateCard : handleUpdateRateCard}
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
            )
            }
            {pageMode === 'View' && (
                <div className="modal d-flex align-items-center justify-content-center show" tabIndex="-1" role="dialog"
                    aria-modal="true">
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">View Rate Card</h5>
                            </div>
                            <div className="modal-body p-2">
                                <form>
                                    <div className="row">
                                        <ReadOnlyField label="Category" value={getCategoryName(RateCardData.category)} />
                                        <ReadOnlyField label="Item" value={getItemName(RateCardData.Item)} />
                                        <ReadOnlyField label="Vendor" value={getVendorName(RateCardData.Vendors)} />
                                        <ReadOnlyField label="Rate" value={RateCardData.Rate} />
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

export default RateCard;
