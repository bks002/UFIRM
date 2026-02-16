import React, { useEffect, useState } from "react";
import PopUp from "../ReactComponents/CheckIn&OutModal/PopUp";
import "bootstrap/dist/css/bootstrap.min.css";
import ExportToCSV from "../ReactComponents/ExportToCSV/ExportToCSV";
import { connect } from "react-redux";
import { PropagateLoader } from "react-spinners";
import LoadingOverlay from "react-loading-overlay";
import { getAssetCheckInOutHistoryByAssetId } 
  from "../Services/CheckInCheckOut";

const ASSET_API_BASE = "https://api.urest.in:8096";

/* ================= BASE64 IMAGE RENDER HELPER ================= */
const renderImageFromUrl = (url) => {
  if (!url) return <span>No Image</span>;

  return (
    <img
      src={url}
      alt="Asset"
      style={{
        width: "180px",
        height: "auto",
        border: "1px solid #ccc",
        borderRadius: "6px",
        marginTop: "6px",
      }}
    />
  );
};


const CheckInCheckOut = (actions) => {
  const [assetData, setAssetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [viewModal, setViewModal] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [actionType, setActionType] = useState("");

  // 🔹 History states
  const [historyModal, setHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyAssetName, setHistoryAssetName] = useState("");

  /* ================= FETCH ASSETS ================= */
  useEffect(() => {
    fetchData();
  }, [actions.propId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.urest.in:8096/api/Asset/GetAssetCheckOutData?PropId=${actions.propId}`
      );
      const data = await res.json();
      setAssetData(data || []);
      setCurrentPage(1);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = assetData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(assetData.length / recordsPerPage);

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
        ? `${ASSET_API_BASE}/ManageCheckIn`
        : `https://api.urest.in:8096/ManageCheckOut`;

    try {
      const response = await fetch(url, {
        method: actionType === "checkin" ? "PUT" : "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          AssetId: currentAsset.Id,
          AssetName: currentAsset.Name,
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Failed ${actionType} (${response.status}): ${errorBody || "Unknown error"}`
        );
      }

      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error(`Error during ${actionType}:`, error);
    }
  };

  /* ================= VIEW HISTORY ================= */
  const handleViewHistory = async (asset) => {
    try {
      setHistoryAssetName(asset.Name);
      setHistoryModal(true);

      const data = await getAssetCheckInOutHistoryByAssetId(asset.Id);
      setHistoryData(data); // [{ CheckOut:{}, CheckIn:{} }]
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="content-wrapper">
      <section className="content">

        <div className="card container-fluid">
          <div className="d-flex justify-content-between align-items-center m-2">
            <h2 className="mb-0">Asset List</h2>
            <ExportToCSV
              data={assetData}
              className="btn btn-success btn-sm rounded px-3"
            />
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((asset, index) => (
                  <tr key={asset.Id}>
                    <td>{indexOfFirst + index + 1}</td>
                    <td>{asset.Id}</td>
                    <td>{asset.Name}</td>
                    <td>{asset.Manufacturer}</td>
                    <td>{asset.Description}</td>
                    <td className="text-center">
                      {asset.ReturnDate === null ? (
                        <button
                          className="btn btn-warning btn-sm me-2"
                          title="Check In"
                          onClick={() => handleCheckIn(asset)}
                        >
                          <i className="pi pi-sign-in"></i>
                        </button>
                      ) : (
                        <button
                          className="btn btn-success btn-sm me-2"
                          title="Check Out"
                          onClick={() => handleCheckOut(asset)}
                        >
                          <i className="pi pi-sign-out"></i>
                        </button>
                      )}

                      <button
                        className="btn btn-info btn-sm"
                        title="View"
                        onClick={() => handleViewHistory(asset)}
                      >
                        <i className="pi pi-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="d-flex justify-content-between align-items-center">
              <span>
                Showing {assetData.length === 0 ? 0 : indexOfFirst + 1} to{" "}
                {Math.min(indexOfLast, assetData.length)} of {assetData.length} entries
              </span>

              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                    <i className="pi pi-angle-left"></i>
                  </button>
                </li>

                <li className="page-item active">
                  <span className="page-link">{currentPage}</span>
                </li>

                <li
                  className={`page-item ${
                    currentPage === totalPages || totalPages === 0 ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))
                    }
                  >
                    <i className="pi pi-angle-right"></i>
                  </button>
                </li>
              </ul>
            </div>
          </LoadingOverlay>
        </div>

        {/* ================= CHECK IN / OUT POPUP ================= */}
        {viewModal && (
          <PopUp
            show={viewModal}
            handleClose={handleCloseModal}
            asset={currentAsset}
            actionType={actionType}
            handleSubmit={handleSubmit}
          />
        )}

        {/* ================= HISTORY MODAL ================= */}
        {historyModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-xl">
              <div className="modal-content">

                <div className="modal-header">
                  <h5 className="modal-title">
                    History : {historyAssetName}
                  </h5>
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

                        {/* 🔵 CHECK OUT */}
                        <div className="col-md-6 border-end">
                          <h6 className="text-primary mb-2">Check Out</h6>
                          <p><b>Assignee:</b> {item.CheckOut?.AssigneeName}</p>
                          <p><b>Purpose:</b> {item.CheckOut?.Purpose}</p>
                          <p><b>Date:</b> {item.CheckOut?.CheckOutDateTime}</p>
                          <p><b>Out From:</b> {item.CheckOut?.OutFrom}</p>
                          <p><b>Sent To:</b> {item.CheckOut?.SentTo}</p>
                          <p><b>Approved By:</b> {item.CheckOut?.ApprovedBy}</p>

                          <p><b>CheckOut Image:</b></p>
                          {renderImageFromUrl(item.CheckOut?.CheckOutImage)}

                        </div>

                        {/* 🟢 CHECK IN */}
                        <div className="col-md-6">
                          <h6 className="text-success mb-2">Check In</h6>
                          <p><b>Returned By:</b> {item.CheckIn?.ReturnedBy}</p>
                          <p><b>Return Date:</b> {item.CheckIn?.ReturnDate}</p>

                          <p><b>Return Image:</b></p>
                          {renderImageFromUrl(item.CheckIn?.ReturnImage)}

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


