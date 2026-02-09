import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";

import PopUp from "../ReactComponents/CheckIn&OutModal/PopUp";
import "bootstrap/dist/css/bootstrap.min.css";
import ExportToCSV from "../ReactComponents/ExportToCSV/ExportToCSV";
import { connect } from "react-redux";
import { PropagateLoader } from "react-spinners";
import LoadingOverlay from "react-loading-overlay";
import { getAssetCheckInOutHistoryByAssetId } from "../Services/CheckInCheckOut";

/* ================= BASE64 IMAGE RENDER HELPER ================= */
const renderBase64Image = (base64) => {
  if (!base64) return <span>No Image</span>;

  return (
    <img
      src={`data:image/jpeg;base64,${base64}`}
      alt="Asset"
      style={{
        width: "180px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        marginTop: "6px",
      }}
    />
  );
};

const CheckInCheckOut = ({ propId: actions }) => {
  const [assetData, setAssetData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewModal, setViewModal] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [actionType, setActionType] = useState("");

  const [historyModal, setHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyAssetName, setHistoryAssetName] = useState("");

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* ================= FETCH ASSETS ================= */
  useEffect(() => {
    fetchData();
  }, [actions?.propId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.urest.in:8096/api/Asset/GetAssetCheckOutData?PropId=${actions.propId}`
      );
      const data = await res.json();
      setAssetData(data);
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setLoading(false);
    }
  };

  /* ================= CHECK IN / OUT ================= */
  const handleCheckIn = (asset) => {
    setCurrentAsset(asset);
    setActionType("checkin");
    setViewModal(true);
  };

  const handleCheckOut = (asset) => {
    setCurrentAsset(asset);
    setActionType("checkout");
    setViewModal(true);
  };

  const handleCloseModal = () => {
    setViewModal(false);
    setCurrentAsset(null);
    setActionType("");
  };

  const handleSubmit = async (formData) => {
    const url =
      actionType === "checkin"
        ? "https://api.urest.in:8096/ManageCheckIn"
        : "https://api.urest.in:8096/ManageCheckOut";

    await fetch(url, {
      method: actionType === "checkin" ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        AssetId: currentAsset.Id,
        AssetName: currentAsset.Name,
        ...formData,
      }),
    });

    fetchData();
    handleCloseModal();
  };

  /* ================= VIEW HISTORY ================= */
  const handleViewHistory = async (asset) => {
    setHistoryAssetName(asset.Name);
    setHistoryModal(true);
    const data = await getAssetCheckInOutHistoryByAssetId(asset.Id);
    setHistoryData(data);
  };

  /* ================= PAGINATION ================= */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = assetData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(assetData.length / itemsPerPage);

  /* ================= UI ================= */
  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="card container-fluid">
          <div className="d-flex justify-content-between align-items-center m-2">
            <h4>Asset List</h4>
            <ExportToCSV data={assetData} className="btn btn-success btn-sm" />
          </div>

          <LoadingOverlay
            active={loading}
            spinner={<PropagateLoader color="#336B93" size={30} />}
          >
            <table className="table table-striped table-bordered table-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Asset ID</th>
                  <th>Asset Name</th>
                  <th>Manufacturer</th>
                  <th>Description</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentItems.map((asset, index) => (
                  <tr key={asset.Id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{asset.Id}</td>
                    <td>{asset.Name}</td>
                    <td>{asset.Manufacturer}</td>
                    <td>{asset.Description}</td>

                    <td className="text-center d-flex justify-content-center gap-2">
                      {asset.ReturnDate === null ? (
                        <button
                          className="btn btn-warning btn-sm rounded"
                          style={{ width: 38, height: 38 }}
                          title="Check In"
                          onClick={() => handleCheckIn(asset)}
                        >
                          <i className="pi pi-arrow-left"></i>
                        </button>
                      ) : (
                        <button
                          className="btn btn-success btn-sm rounded"
                          style={{ width: 38, height: 38 }}
                          title="Check Out"
                          onClick={() => handleCheckOut(asset)}
                        >
                          <i className="pi pi-arrow-right"></i>
                        </button>
                      )}

                      <button
                        className="btn btn-info btn-sm rounded"
                        style={{ width: 38, height: 38 }}
                        title="View History"
                        onClick={() => handleViewHistory(asset)}
                      >
                        <i className="pi pi-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div className="d-flex justify-content-end align-items-center mb-2">
              <button
                className="btn btn-sm btn-secondary me-2"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Prev
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="btn btn-sm btn-secondary ms-2"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </LoadingOverlay>
        </div>

        {/* ================= CHECK IN / OUT MODAL ================= */}
        {viewModal && (
          <PopUp
            show={viewModal}
            handleClose={handleCloseModal}
            asset={currentAsset}
            actionType={actionType}
            handleSubmit={handleSubmit}
          />
        )}

        {/* ================= HISTORY MODAL (FULL DATA RESTORED) ================= */}
        {historyModal && (
          <div className="modal show d-block">
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>History : {historyAssetName}</h5>
                  <button
                    className="btn-close"
                    onClick={() => setHistoryModal(false)}
                  />
                </div>

                <div className="modal-body">
                  {historyData.length === 0 ? (
                    <p className="text-center">No history found</p>
                  ) : (
                    historyData.map((item, index) => (
                      <div key={index} className="row mb-4 border-bottom pb-3">
                        {/* CHECK OUT */}
                        <div className="col-md-6 border-end">
                          <h6 className="text-primary mb-2">Check Out</h6>
                          <p><b>Assignee:</b> {item.CheckOut?.AssigneeName}</p>
                          <p><b>Purpose:</b> {item.CheckOut?.Purpose}</p>
                          <p><b>Date:</b> {item.CheckOut?.CheckOutDateTime}</p>
                          <p><b>Out From:</b> {item.CheckOut?.OutFrom}</p>
                          <p><b>Sent To:</b> {item.CheckOut?.SentTo}</p>
                          <p><b>Approved By:</b> {item.CheckOut?.ApprovedBy}</p>
                          <p><b>CheckOut Image:</b></p>
                          {renderBase64Image(item.CheckOut?.CheckOutImage)}
                        </div>

                        {/* CHECK IN */}
                        <div className="col-md-6">
                          <h6 className="text-success mb-2">Check In</h6>
                          <p><b>Returned By:</b> {item.CheckIn?.ReturnedBy}</p>
                          <p><b>Return Date:</b> {item.CheckIn?.ReturnDate}</p>
                          <p><b>Return Image:</b></p>
                          {renderBase64Image(item.CheckIn?.ReturnImage)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    propId: state.Commonreducer.puidn,
  };
}

export default connect(mapStateToProps)(CheckInCheckOut);
