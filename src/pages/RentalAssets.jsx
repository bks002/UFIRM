import React, { useEffect, useState } from "react";
import RentalPopUp from "../ReactComponents/RentalModal/RentalPopUp";
import "bootstrap/dist/css/bootstrap.min.css";
import ExportToCSV from "../ReactComponents/ExportToCSV/ExportToCSV";
import { connect } from "react-redux";
import { PropagateLoader } from "react-spinners";
import LoadingOverlay from "react-loading-overlay";
import {
  getAssetRentOutReturnHistoryByAssetId,
} from "../Services/RentalAssets";

/* ================= BASE64 IMAGE HELPER ================= */
const isValidImageBase64 = (b64) =>
  b64?.startsWith("/9j/") ||
  b64?.startsWith("iVBOR") ||
  b64?.startsWith("UklGR") ||
  b64?.startsWith("data:image");

const renderBase64Image = (base64) => {
  if (!base64 || !isValidImageBase64(base64)) {
    return <span>No Image</span>;
  }

  const src = base64.startsWith("data:image")
    ? base64
    : `data:image/*;base64,${base64}`;

  return <img src={src} width={180} alt="Asset" />;
};

const RentAssetPage = (actions) => {
  const [rentalAssets, setRentalAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Rent / Return modal */
  const [viewModal, setViewModal] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [actionType, setActionType] = useState("rentout");

  /* History modal */
  const [historyModal, setHistoryModal] = useState(false);
  const [rentHistory, setRentHistory] = useState([]);

  /* ================= FETCH ASSETS ================= */
  const fetchRentalAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.urest.in:8096/api/Asset/GetRentalAssetData?PropId=${actions.propId}`
      );
      const data = await res.json();
      setRentalAssets(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalAssets();
    // eslint-disable-next-line
  }, [actions.propId]);

  /* ================= RENT / RETURN ================= */
  const handleRentOut = (asset) => {
    setCurrentAsset(asset);
    setActionType("rentout");
    setViewModal(true);
  };

  const handleReturn = (asset) => {
    setCurrentAsset(asset);
    setActionType("return");
    setViewModal(true);
  };

  const handleCloseModal = () => {
    setViewModal(false);
    setCurrentAsset(null);
    setActionType("");
  };

  const handleSubmit = async (formData) => {
    const url =
      actionType === "return"
        ? "https://api.urest.in:8096/ManageRentInAsset"
        : "https://api.urest.in:8096/ManageRentOutAsset";

    try {
      await fetch(url, {
        method: actionType === "return" ? "PUT" : "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetId: currentAsset.Id,
          assetName: currentAsset.Name,
          ...formData,
        }),
      });

      fetchRentalAssets();
      handleCloseModal();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  /* ================= VIEW HISTORY ================= */
  const handleView = async (asset) => {
    try {
      setCurrentAsset(asset);
      setHistoryModal(true);

      const data =
        await getAssetRentOutReturnHistoryByAssetId(asset.Id);

      setRentHistory(data); // [{ RentOut:{}, Return:{} }]
    } catch (error) {
      console.error("History error:", error);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="card container-fluid">
          <div className="d-flex justify-content-between align-items-center m-2">
            <h2>Rental Asset List</h2>
            <ExportToCSV
              data={rentalAssets}
              className="btn btn-success btn-sm"
            />
          </div>

          <LoadingOverlay
            active={loading}
            spinner={<PropagateLoader color="#336B93" size={30} />}
          >
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Asset ID</th>
                  <th>Name</th>
                  <th>Manufacturer</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {rentalAssets.map((asset, index) => (
                  <tr key={asset.Id}>
                    <td>{index + 1}</td>
                    <td>{asset.Id}</td>
                    <td>{asset.Name}</td>
                    <td>{asset.Manufacturer}</td>
                    <td>{asset.Description}</td>
                    <td className="text-center">
  {(asset.RentedOutDate === null || asset.ReturnDate) ? (
    /* ✅ CHECK-OUT (GREEN ICON – SAME AS IMAGE) */
    <button
      className="btn btn-success btn-sm me-2"
      title="Check Out"
      onClick={() => handleRentOut(asset)}
    >
      <i className="pi pi-sign-out"></i>
    </button>
  ) : (
    /* 🔄 RETURN */
    <button
      className="btn btn-warning btn-sm me-2"
      title="Return"
      onClick={() => handleReturn(asset)}
    >
      <i className="pi pi-sign-in"></i>
    </button>
  )}

  {/* 👁️ VIEW */}
  <button
    className="btn btn-info btn-sm"
    title="View"
    onClick={() => handleView(asset)}
  >
    <i className="pi pi-eye"></i>
  </button>
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </LoadingOverlay>
        </div>

        {/* ================= RENT / RETURN POPUP ================= */}
        {viewModal && (
          <RentalPopUp
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
                    History : {currentAsset?.Name} (ID: {currentAsset?.Id})
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setHistoryModal(false)}
                  />
                </div>

                <div className="modal-body">
                  {rentHistory.length === 0 ? (
                    <p className="text-center">No history found</p>
                  ) : (
                    rentHistory.map((item, index) => (
                      <div
                        key={index}
                        className="row mb-4 border-bottom pb-3"
                      >
                        {/* 🔵 RENT OUT */}
                        <div className="col-md-6 border-end">
                          <h6 className="text-primary mb-2">Rent Out</h6>
                          <p><b>Assignee:</b> {item.RentOut?.AssigneeName}</p>
                          <p><b>Rented To:</b> {item.RentOut?.RentedTo}</p>
                          <p><b>Date:</b> {item.RentOut?.RentedOutDate}</p>
                          <p><b>Tentative:</b> {item.RentOut?.TentativeDate}</p>
                          <p><b>Out From:</b> {item.RentOut?.OutFrom}</p>
                          <p><b>Monthly Rent:</b> {item.RentOut?.MonthlyRent}</p>
                          <p><b>Approved By:</b> {item.RentOut?.ApprovedBy}</p>
                          <p><b>RentOut Image:</b></p>
                          {renderBase64Image(item.RentOut?.ImageOut)}
                        </div>

                        {/* 🟢 RETURN */}
                        <div className="col-md-6">
                          <h6 className="text-success mb-2">Return</h6>
                          <p><b>Returned By:</b> {item.Return?.ReturnedBy}</p>
                          <p><b>Return Date:</b> {item.Return?.ReturnDate}</p>
                          <p><b>Return From:</b> {item.Return?.ReturnFrom}</p>
                          <p><b>Return Image:</b></p>
                          {renderBase64Image(item.Return?.ImageIn)}
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

export default connect(mapStateToProps)(RentAssetPage);
