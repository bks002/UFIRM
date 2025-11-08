import React, { useEffect, useState } from 'react';
import LoadingOverlay from 'react-loading-overlay';
import { PropagateLoader } from 'react-spinners';
import '../Style/ManageAssets.css';
import { connect } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchAssets, getServiceHistory, saveServiceRecord } from "../Services/AssetService";

const ServiceRecords = (actions) => {
    const [serviceOverdueAssets, setServiceOverdueAssets] = useState([]); // Initialize as an empty array
    const [upcomingServiceAssets, setUpcomingServiceAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showServiceRecord, setShowServiceRecord] = useState(false);
    const [addServiceRecord, setAddServiceRecord] = useState(false);
    const [serviceRecord, setServiceRecord] = useState([]);
    const [formData, setFormData] = useState({
        assetId: "0",
        serviceDate: "",
        remarks: "",
        image: null,
        receipt: null,
        nextServiceDate: "",
        servicedBy: "",
        approvedBy: "",
        serviceCost: "",
    });
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [filteredAssets, setFilteredAssets] = useState(upcomingServiceAssets);

    const getAssets = async () => {
        setLoading(true);
        try {
            const data = await fetchAssets(actions.propId);
            setServiceOverdueAssets(data.PassedServiceDates);
            const validServiceDates = data.UpcomingServiceDates.filter(
                (service) => service.NextServiceDate !== null
            );
            setUpcomingServiceAssets(validServiceDates);
            setFilteredAssets(validServiceDates);
            setError(null);
        } catch (err) {
            setError('Failed to load assets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAssets();
    }, [actions.propId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files[0],
        }));
    };

    const handleFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const formDataToSend = new FormData();
            formDataToSend.append("AssetId", formData.assetId);
            formDataToSend.append("ServiceDate", formData.serviceDate);
            formDataToSend.append("NextServiceDate", formData.nextServiceDate);
            formDataToSend.append("Remark", formData.remarks);
            formDataToSend.append("ServiceCost", formData.serviceCost || 0);
            formDataToSend.append("ServicedBy", formData.servicedBy || "");
            formDataToSend.append("ApprovedBy", formData.approvedBy || "");

            if (formData.image) {
                formDataToSend.append("ServiceImg", formData.image);
            }
            if (formData.receipt) {
                formDataToSend.append("ServiceDoc", formData.receipt);
            }

            const response = await saveServiceRecord(formDataToSend);
            console.log("✅ Record saved:", response);

            await getAssets();
            handleCancel();
        } catch (error) {
            console.error("❌ Error saving service record:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setAddServiceRecord(false);
        setFormData({
            assetId: "0",
            serviceDate: "",
            remarks: "",
            image: null,
            receipt: null,
            nextServiceDate: "",
            servicedBy: "",
            approvedBy: "",
            serviceCost: "",
        });
    };

    const handleFilter = () => {
        if (startDate && endDate) {
            const filtered = upcomingServiceAssets.filter((asset) => {
                const serviceDate = new Date(asset.NextServiceDate);
                return (
                    serviceDate >= startDate &&
                    serviceDate <= endDate
                );
            });
            setFilteredAssets(filtered);
        } else {
            setFilteredAssets(upcomingServiceAssets);
        }
    }
    const handleReset = () => {
        setStartDate(null);
        setEndDate(null);
        setFilteredAssets(upcomingServiceAssets); // Reset to show all data
    };
    const handleViewRecord = async (id) => {
        setLoading(true);
        try {
            const response = await getServiceHistory(id);
            setServiceRecord(response);
            setShowServiceRecord(true);
            handleCancel()
        } catch (error) {
            console.error('Error saving service record:', error);
        }
        finally {
            setLoading(false);
        }

    }

    const handleAddRecord = (id) => {
        setAddServiceRecord(true);
        setFormData((prev) => ({
            ...prev,
            assetId: id,
        }));
    };


    return (
        <div className="content-wrapper">
            <section className="content">
                <LoadingOverlay
                    active={loading}
                    spinner={<PropagateLoader color="#336B93" size={30} />}
                >
                    <div className="card container-fluid">
                        <h2>Service Over Due Assets</h2>
                        {error ? (
                            <p className="text-danger">{error}</p>
                        ) : serviceOverdueAssets.length > 0 ? (
                            <div
                                className="table-responsive"
                                style={{
                                    maxHeight: '350px',
                                    overflowY: 'auto',
                                }}
                            >
                                <table className="table table-striped table-danger table-hover">
                                    <thead className="table-danger" style={{ position: 'sticky', top: 0 }}>
                                        <tr>
                                            <th className="text-center">Id</th>
                                            <th className="text-center">Name</th>
                                            <th className="text-center">Service Due Date <span
                                                className="text-danger text-lg">!!</span></th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {serviceOverdueAssets.map((asset, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{asset.Id || 'N/A'}</td>
                                                <td className="text-center">{asset.Name || 'N/A'}</td>
                                                <td className="text-center">{asset.NextServiceDate || 'N/A'}</td>
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button type="button" className="btn btn-primary btn-sm"
                                                            onClick={() => handleViewRecord(asset.Id)}><i
                                                                className="fa fa-eye"></i>
                                                        </button>
                                                        <button type="button" className="btn btn-success btn-sm"
                                                            onClick={() => handleAddRecord(asset.Id)}><i
                                                                className="fa fa-plus"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No overdue service assets found.</p>
                        )}
                    </div>
                </LoadingOverlay>
            </section>
            <section className="content">
                <LoadingOverlay
                    active={loading}
                    spinner={<PropagateLoader color="#336B93" size={30} />}
                >
                    <div className="card container-fluid">
                        <div className="d-flex justify-content-between align-items-center mt-2">
                            <div><h2>Upcoming Services</h2></div>
                            <div className="d-flex gap-2">
                                <div>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        dateFormat="yyyy-MM-dd"
                                        className="form-control"
                                        placeholderText="Select Start Date"
                                    />
                                </div>
                                <div>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={(date) => setEndDate(date)}
                                        dateFormat="yyyy-MM-dd"
                                        className="form-control"
                                        placeholderText="Select End Date"
                                    />
                                </div>
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleFilter}
                                    >
                                        Filter
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleReset}
                                    >
                                        Reset
                                    </button>
                                </div>

                            </div>

                        </div>
                        {error ? (
                            <p className="text-danger">{error}</p>
                        ) : filteredAssets.length > 0 ? (
                            <div
                                className="table-responsive "
                                style={{
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                }}
                            >
                                <table className="table table-striped table-warning table-hover">
                                    <thead className="table-warning" style={{ position: 'sticky', top: 0 }}>
                                        <tr>
                                            <th className="text-center">Id</th>
                                            <th className="text-center">Name</th>
                                            <th className="text-center">Service Due Date</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAssets.map((asset, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{asset.Id || 'N/A'}</td>
                                                <td className="text-center">{asset.Name || 'N/A'}</td>
                                                <td className="text-center">{asset.NextServiceDate || 'N/A'}</td>
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button type="button" className="btn btn-primary btn-sm"
                                                            onClick={() => handleViewRecord(asset.Id)}><i
                                                                className="fa fa-eye"></i>
                                                        </button>
                                                        <button type="button" className="btn btn-success btn-sm"
                                                            onClick={() => handleAddRecord(asset.Id)}><i
                                                                className="fa fa-plus"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>All assets are healthy!</p>
                        )}
                    </div>
                </LoadingOverlay>
            </section>

            {addServiceRecord && (
                <div
                    className="modal fade show"
                    style={{ display: "block" }} // Makes the modal visible
                    tabIndex="-1"
                    aria-labelledby="exampleModalLabel"
                    aria-hidden="true"
                >
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">
                                    Add Service Record
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCancel}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit}>
                                    {/* Asset ID */}
                                    <div className="mb-3">
                                        <label htmlFor="assetId" className="form-label">
                                            Asset ID
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="assetId"
                                            name="assetId"
                                            value={formData.assetId}
                                            readOnly
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="serviceDate" className="form-label">
                                            Service Date
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="serviceDate"
                                            name="serviceDate"
                                            value={formData.serviceDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    {/* Serviced By */}
                                    <div className="mb-3">
                                        <label htmlFor="servicedBy" className="form-label">
                                            Serviced By
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="servicedBy"
                                            name="servicedBy"
                                            value={formData.servicedBy}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Approved By */}
                                    <div className="mb-3">
                                        <label htmlFor="approvedBy" className="form-label">
                                            Approved By
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="approvedBy"
                                            name="approvedBy"
                                            value={formData.approvedBy}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Service Cost */}
                                    <div className="mb-3">
                                        <label htmlFor="serviceCost" className="form-label">
                                            Service Cost (₹)
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="serviceCost"
                                            name="serviceCost"
                                            value={formData.serviceCost}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    {/* Remarks */}
                                    <div className="mb-3">
                                        <label htmlFor="remarks" className="form-label">
                                            Remarks
                                        </label>
                                        <textarea
                                            className="form-control"
                                            id="remarks"
                                            name="remarks"
                                            rows="3"
                                            value={formData.remarks}
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>
                                    {/* Upload Image */}
                                    <div className="mb-3">
                                        <label htmlFor="image" className="form-label">
                                            Upload Image
                                        </label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            id="image"
                                            name="image"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        {formData.image && (
                                            <button
                                                type="button"
                                                className="btn btn-link mt-1"
                                                onClick={() => window.open(URL.createObjectURL(formData.image))}
                                            >
                                                View Uploaded Image
                                            </button>
                                        )}
                                    </div>
                                    {/* Upload Service Receipt */}
                                    <div className="mb-3">
                                        <label htmlFor="receipt" className="form-label">
                                            Upload Service Receipt
                                        </label>
                                        z
                                        {formData.receipt && (
                                            <button
                                                type="button"
                                                className="btn btn-link mt-1"
                                                onClick={() => window.open(URL.createObjectURL(formData.receipt))}
                                            >
                                                View Uploaded Receipt
                                            </button>
                                        )}
                                    </div>
                                    {/* Next Service Date */}
                                    <div className="mb-3">
                                        <label htmlFor="nextServiceDate" className="form-label">
                                            Next Service Date
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="nextServiceDate"
                                            name="nextServiceDate"
                                            value={formData.nextServiceDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={handleCancel}
                                        >
                                            Close
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showServiceRecord && (
                <div
                    className="modal fade show"
                    style={{ display: 'block' }}
                    tabIndex="-1"
                    aria-labelledby="exampleModalLabel"
                    aria-hidden="true"
                >
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">View Service Record</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowServiceRecord(false)}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body timeline-container">
                                {serviceRecord.length > 0 ? (
                                    serviceRecord.map((item, index) => (
                                        <div className="timeline-item" key={item.Id || index}>
                                            <div className="timeline-content">
                                                <p>
                                                    <strong>Service Date:</strong> {item.ServiceDate}
                                                </p>
                                                <p>
                                                    <strong>Service Cost:</strong> {item.ServiceCost || "No cost"}
                                                </p>
                                                <p>
                                                    <strong>Serviced By:</strong> {item.ServicedBy || "No Serviced by"}
                                                </p>
                                                <p>
                                                    <strong>Approved By:</strong> {item.ApprovedBy || "No Approved by"}
                                                </p>
                                                <p>
                                                    <strong>Remark:</strong> {item.Remark || "No Remarks"}
                                                </p>

                                                {item.Image && (
                                                    <div className="mt-2">
                                                        <img
                                                            src={item.Image}
                                                            alt="Service Image"
                                                            style={{ width: "200px", height: "auto", borderRadius: "8px" }}
                                                            onError={(e) => (e.target.src = "https://via.placeholder.com/200?text=Image+Not+Available")}
                                                        />
                                                    </div>
                                                )}
                                                {item.ServiceDoc && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-link mt-1 text-decoration-none"
                                                        onClick={() => {
                                                            const serviceDocUrl = item.ServiceDoc.replace(/^"|"$/g, '');
                                                            // Open directly if it's a PDF or other file
                                                            if (serviceDocUrl.toLowerCase().endsWith(".pdf")) {
                                                                window.open(serviceDocUrl, "_blank");
                                                            } else {
                                                                // Otherwise treat it like an image
                                                                const newWindow = window.open();
                                                                newWindow.document.write(`
          <html><body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden;">
            <img src="${serviceDocUrl}" alt="Service Document" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
          </body></html>
        `);
                                                                newWindow.document.close();
                                                            }
                                                        }}
                                                    >
                                                        View Service Document
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-records">No records found</div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary"
                                    onClick={() => setShowServiceRecord(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
function mapStateToProps(state, props) {
    return {
        propId: state.Commonreducer.puidn,
    }
} export default connect(mapStateToProps)(ServiceRecords);
