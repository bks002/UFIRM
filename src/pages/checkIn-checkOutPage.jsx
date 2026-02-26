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
  const [viewMode, setViewMode] = useState("panel");
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [searchText, setSearchText] = useState("");

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
  const searchedAssets = (assetData || []).filter((asset) => {
    if (!searchText) return true;
    const text = `${asset.Id || ""} ${asset.Name || ""} ${asset.Manufacturer || ""} ${asset.Description || ""}`.toLowerCase();
    return text.includes(searchText.toLowerCase());
  });
  const currentRecords = searchedAssets.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(searchedAssets.length / recordsPerPage);
  const activeAsset = searchedAssets.find((x) => x.Id === selectedAssetId) || searchedAssets[0] || null;

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
        <style>{`
          .asset-view-toggle { display:inline-flex; border:1px solid #d4e3ed; border-radius:8px; overflow:hidden; background:#fff; }
          .asset-view-toggle button { border:none; background:transparent; padding:7px 12px; font-size:12px; font-weight:600; color:#4A7FA8; }
          .asset-view-toggle button.active { background:#e8f1f8; color:#1E4A6B; }
          .asset-panel-shell { display:grid; grid-template-columns:340px minmax(0,1fr); border:1px solid #d8e6f0; border-radius:10px; overflow:hidden; min-height:540px; }
          .asset-panel-list { border-right:1px solid #d8e6f0; max-height:540px; overflow-y:auto; padding:10px; background:#fff; }
          .asset-panel-item { width:100%; text-align:left; border:1px solid #e6eff6; border-radius:8px; background:#fff; padding:10px; margin-bottom:8px; cursor:pointer; }
          .asset-panel-item.active { border-color:#2f9cff; background:#f5faff; box-shadow: inset 2px 0 0 #2f9cff; }
          .asset-panel-detail { max-height:540px; overflow-y:auto; padding:16px; background:#fff; }
          .asset-meta-grid { margin-top:12px; display:grid; grid-template-columns:repeat(2,minmax(180px,1fr)); gap:14px; }
          .asset-label { font-size:11px; color:#7a8ea0; text-transform:uppercase; font-weight:700; margin-bottom:4px; }
          .asset-value { font-size:13px; color:#22384c; font-weight:600; word-break:break-word; }
          @media (max-width:1024px){ .asset-panel-shell { grid-template-columns:1fr; } .asset-panel-list { border-right:none; border-bottom:1px solid #d8e6f0; max-height:240px; } }
        `}</style>

        <div className="card container-fluid">
          <div className="d-flex justify-content-between align-items-center m-2">
            <h2 className="mb-0">Asset List</h2>
            <div className="d-flex align-items-center gap-2">
              <div className="asset-view-toggle">
                <button type="button" className={viewMode === "panel" ? "active" : ""} onClick={() => setViewMode("panel")}>Panel View</button>
                <button type="button" className={viewMode === "table" ? "active" : ""} onClick={() => setViewMode("table")}>Table View</button>
              </div>
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ width: 200 }}
                placeholder="Search..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <ExportToCSV
                data={searchedAssets}
                className="btn btn-success btn-sm rounded px-3"
              />
            </div>
          </div>

          <LoadingOverlay
            active={loading}
            spinner={<PropagateLoader color="#336B93" size={30} />}
          >
            {viewMode === "table" && <table className="table table-striped table-bordered table-sm">
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
            </table>}

            {viewMode === "panel" && (
              <div className="asset-panel-shell">
                <div className="asset-panel-list">
                  {searchedAssets.map((asset) => (
                    <button
                      key={asset.Id}
                      type="button"
                      className={`asset-panel-item ${activeAsset && activeAsset.Id === asset.Id ? "active" : ""}`}
                      onClick={() => setSelectedAssetId(asset.Id)}
                    >
                      <div style={{ fontWeight: 700, color: "#22384c", fontSize: 13 }}>{asset.Name || "-"}</div>
                      <div style={{ fontSize: 12, color: "#6d7f8d" }}>#{asset.Id} • {asset.Manufacturer || "-"}</div>
                    </button>
                  ))}
                </div>
                <div className="asset-panel-detail">
                  {!activeAsset && <div className="text-muted">No assets found.</div>}
                  {activeAsset && (
                    <>
                      <h3 style={{ margin: 0, color: "#22384c", fontWeight: 700 }}>{activeAsset.Name || "-"}</h3>
                      <div className="asset-meta-grid">
                        <div><div className="asset-label">Asset ID</div><div className="asset-value">{activeAsset.Id || "-"}</div></div>
                        <div><div className="asset-label">Manufacturer</div><div className="asset-value">{activeAsset.Manufacturer || "-"}</div></div>
                        <div><div className="asset-label">Description</div><div className="asset-value">{activeAsset.Description || "-"}</div></div>
                        <div><div className="asset-label">Status</div><div className="asset-value">{activeAsset.ReturnDate === null ? "Checked Out" : "Available"}</div></div>
                      </div>
                      <div className="d-flex gap-2 mt-3">
                        {activeAsset.ReturnDate === null ? (
                          <button className="btn btn-warning btn-sm" onClick={() => handleCheckIn(activeAsset)}>
                            <i className="pi pi-sign-in" /> Check In
                          </button>
                        ) : (
                          <button className="btn btn-success btn-sm" onClick={() => handleCheckOut(activeAsset)}>
                            <i className="pi pi-sign-out" /> Check Out
                          </button>
                        )}
                        <button className="btn btn-info btn-sm" onClick={() => handleViewHistory(activeAsset)}>
                          <i className="pi pi-eye" /> View History
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {viewMode === "table" && <div className="d-flex justify-content-between align-items-center">
              <span>
                Showing {searchedAssets.length === 0 ? 0 : indexOfFirst + 1} to{" "}
                {Math.min(indexOfLast, searchedAssets.length)} of {searchedAssets.length} entries
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
            </div>}
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
