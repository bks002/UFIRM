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

/* ✅ IMAGE RENDER HELPER (URL BASED) */
const renderImage = (url) => {
  if (!url) return <span>No Image</span>;

  return (
    <img
      src={url}
      width={180}
      alt="Asset"
      style={{ borderRadius: "6px", border: "1px solid #ddd" }}
      onError={(e) => (e.target.style.display = "none")}
    />
  );
};

const RentAssetPage = (actions) => {
  const [rentalAssets, setRentalAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [viewModal, setViewModal] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [actionType, setActionType] = useState("");
  const [historyModal, setHistoryModal] = useState(false);
  const [rentHistory, setRentHistory] = useState([]);

  /* ================= FETCH ================= */
  const fetchRentalAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.urest.in:8096/api/Asset/GetRentalAssetData?PropId=${actions.propId}`
      );
      const data = await res.json();
      setRentalAssets(data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalAssets();
    // eslint-disable-next-line
  }, [actions.propId]);

  /* ================= PAGINATION ================= */
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = rentalAssets.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(rentalAssets.length / recordsPerPage);

  /* ================= ACTIONS ================= */
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

  const handleSubmit = async (formData) => {
    const url =
      actionType === "return"
        ? "https://api.urest.in:8096/ManageRentInAsset"
        : "https://api.urest.in:8096/ManageRentOutAsset";

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
    setViewModal(false);
  };

  const handleView = async (asset) => {
    setCurrentAsset(asset);
    setHistoryModal(true);
    const data = await getAssetRentOutReturnHistoryByAssetId(asset.Id);
    setRentHistory(data || []);
  };

  /* ================= UI ================= */
  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="card container-fluid p-3">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Rental Asset List</h4>
            <ExportToCSV
              data={rentalAssets}
              className="btn btn-success btn-sm"
            />
          </div>

          <LoadingOverlay
            active={loading}
            spinner={<PropagateLoader color="#336B93" size={20} />}
          >
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Asset ID</th>
                  <th>Asset Name</th>
                  <th>Manufacturer</th>
                  <th>Description</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentRecords.map((asset) => (
                  <tr key={asset.Id}>
                    <td>{asset.Id}</td>
                    <td>{asset.Name}</td>
                    <td>{asset.Manufacturer}</td>
                    <td>{asset.Description}</td>

                    <td className="text-center">
                      {(asset.RentedOutDate === null || asset.ReturnDate) ? (
                        <button
                          className="btn btn-success btn-sm me-2"
                          title="Check Out"
                          onClick={() => handleRentOut(asset)}
                        >
                          <i className="pi pi-sign-out"></i>
                        </button>
                      ) : (
                        <button
                          className="btn btn-warning btn-sm me-2"
                          title="Return"
                          onClick={() => handleReturn(asset)}
                        >
                          <i className="pi pi-sign-in"></i>
                        </button>
                      )}

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

        {/* RENT / RETURN MODAL */}
        {viewModal && (
          <RentalPopUp
            show={viewModal}
            handleClose={() => setViewModal(false)}
            asset={currentAsset}
            actionType={actionType}
            handleSubmit={handleSubmit}
          />
        )}

        {/* HISTORY MODAL */}
        {historyModal && (
          <div className="modal show d-block">
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
                      <div key={index} className="row border-bottom mb-3 pb-3">
                        <div className="col-md-6">
                          <h6 className="text-primary">Rent Out</h6>
                          <p>{item.RentOut?.AssigneeName}</p>
                          <p>{item.RentOut?.RentedOutDate}</p>
                          <p>{item.RentOut?.TentativeDate}</p>
                          <p>{item.RentOut?.RentedTo}</p>
                          <p>{item.RentOut?.OutFrom}</p>
                          <p>{item.RentOut?.MonthlyRent}</p>
                          <p>{item.RentOut?.ApprovedBy}</p>
                          
                          {renderImage(item.RentOut?.ImageOut)}
                        </div>
                        <div className="col-md-6">
                          <h6 className="text-success">Return</h6>
                          <p>{item.Return?.ReturnedBy}</p>
                          <p>{item.Return?.ReturnDate}</p>
                          <p>{item.Return?.ReturnFrom}</p>
                          
                          {renderImage(item.Return?.ImageIn)}
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