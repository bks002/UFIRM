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

/* ================= IMAGE HELPERS ================= */
const isValidImageBase64 = (b64) =>
  b64?.startsWith("/9j/") ||
  b64?.startsWith("iVBOR") ||
  b64?.startsWith("UklGR") ||
  b64?.startsWith("data:image");

const renderBase64Image = (base64) => {
  if (!base64 || !isValidImageBase64(base64)) return <span>No Image</span>;

  const src = base64.startsWith("data:image")
    ? base64
    : `data:image/*;base64,${base64}`;

  return <img src={src} width={180} alt="Asset" />;
};

const RentAssetPage = (actions) => {
  const [rentalAssets, setRentalAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("panel");
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [searchText, setSearchText] = useState("");

  /* pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  /* modals */
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
  const searchedAssets = (rentalAssets || []).filter((asset) => {
    if (!searchText) return true;
    const text = `${asset.Id || ""} ${asset.Name || ""} ${asset.Manufacturer || ""} ${asset.Description || ""}`.toLowerCase();
    return text.includes(searchText.toLowerCase());
  });
  const currentRecords = searchedAssets.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(searchedAssets.length / recordsPerPage);
  const activeAsset = searchedAssets.find((x) => x.Id === selectedAssetId) || searchedAssets[0] || null;

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
        <style>{`
          .rental-view-toggle { display:inline-flex; border:1px solid #d4e3ed; border-radius:8px; overflow:hidden; background:#fff; }
          .rental-view-toggle button { border:none; background:transparent; padding:7px 12px; font-size:12px; font-weight:600; color:#4A7FA8; }
          .rental-view-toggle button.active { background:#e8f1f8; color:#1E4A6B; }
          .rental-panel-shell { display:grid; grid-template-columns:340px minmax(0,1fr); border:1px solid #d8e6f0; border-radius:10px; overflow:hidden; min-height:540px; }
          .rental-panel-list { border-right:1px solid #d8e6f0; max-height:540px; overflow-y:auto; padding:10px; background:#fff; }
          .rental-panel-item { width:100%; text-align:left; border:1px solid #e6eff6; border-radius:8px; background:#fff; padding:10px; margin-bottom:8px; cursor:pointer; }
          .rental-panel-item.active { border-color:#2f9cff; background:#f5faff; box-shadow: inset 2px 0 0 #2f9cff; }
          .rental-panel-detail { max-height:540px; overflow-y:auto; padding:16px; background:#fff; }
          .rental-label { font-size:11px; color:#7a8ea0; text-transform:uppercase; font-weight:700; margin-bottom:4px; }
          .rental-value { font-size:13px; color:#22384c; font-weight:600; word-break:break-word; }
          .rental-grid { margin-top:12px; display:grid; grid-template-columns:repeat(2,minmax(180px,1fr)); gap:14px; }
          @media (max-width:1024px){ .rental-panel-shell { grid-template-columns:1fr; } .rental-panel-list { border-right:none; border-bottom:1px solid #d8e6f0; max-height:240px; } }
        `}</style>
        <div className="card container-fluid p-3">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Rental Asset List</h4>
            <div className="d-flex align-items-center gap-2">
              <div className="rental-view-toggle">
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
                className="btn btn-success btn-sm"
              />
            </div>
          </div>

          <LoadingOverlay
            active={loading}
            spinner={<PropagateLoader color="#336B93" size={20} />}
          >
            {viewMode === "table" && <table className="table table-striped table-hover">
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

                    {/* 🔥 PRIME ICONS */}
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
            </table>}

            {viewMode === "panel" && (
              <div className="rental-panel-shell">
                <div className="rental-panel-list">
                  {searchedAssets.map((asset) => (
                    <button
                      key={asset.Id}
                      type="button"
                      className={`rental-panel-item ${activeAsset && activeAsset.Id === asset.Id ? "active" : ""}`}
                      onClick={() => setSelectedAssetId(asset.Id)}
                    >
                      <div style={{ fontWeight: 700, color: "#22384c", fontSize: 13 }}>{asset.Name || "-"}</div>
                      <div style={{ fontSize: 12, color: "#6d7f8d" }}>#{asset.Id} • {asset.Manufacturer || "-"}</div>
                    </button>
                  ))}
                </div>
                <div className="rental-panel-detail">
                  {!activeAsset && <div className="text-muted">No assets found.</div>}
                  {activeAsset && (
                    <>
                      <h3 style={{ margin: 0, color: "#22384c", fontWeight: 700 }}>{activeAsset.Name || "-"}</h3>
                      <div className="rental-grid">
                        <div><div className="rental-label">Asset ID</div><div className="rental-value">{activeAsset.Id || "-"}</div></div>
                        <div><div className="rental-label">Manufacturer</div><div className="rental-value">{activeAsset.Manufacturer || "-"}</div></div>
                        <div><div className="rental-label">Description</div><div className="rental-value">{activeAsset.Description || "-"}</div></div>
                        <div><div className="rental-label">Rental Status</div><div className="rental-value">{(activeAsset.RentedOutDate === null || activeAsset.ReturnDate) ? "Available" : "Rented Out"}</div></div>
                      </div>
                      <div className="d-flex gap-2 mt-3">
                        {(activeAsset.RentedOutDate === null || activeAsset.ReturnDate) ? (
                          <button className="btn btn-success btn-sm" onClick={() => handleRentOut(activeAsset)}>
                            <i className="pi pi-sign-out" /> Check Out
                          </button>
                        ) : (
                          <button className="btn btn-warning btn-sm" onClick={() => handleReturn(activeAsset)}>
                            <i className="pi pi-sign-in" /> Return
                          </button>
                        )}
                        <button className="btn btn-info btn-sm" onClick={() => handleView(activeAsset)}>
                          <i className="pi pi-eye" /> View History
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* PAGINATION */}
            {viewMode === "table" && <div className="d-flex justify-content-between align-items-center">
              <span>
                Showing {searchedAssets.length === 0 ? 0 : indexOfFirst + 1} to {Math.min(indexOfLast, searchedAssets.length)} of {searchedAssets.length} entries
              </span>

              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 && "disabled"}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    ‹
                  </button>
                </li>

                {[...Array(totalPages)].map((_, i) => (
                  <li
                    key={i}
                    className={`page-item ${
                      currentPage === i + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${
                    currentPage === totalPages && "disabled"
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    ›
                  </button>
                </li>
              </ul>
            </div>}
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
                          {renderBase64Image(item.RentOut?.ImageOut)}
                        </div>
                        <div className="col-md-6">
                          <h6 className="text-success">Return</h6>
                          <p>{item.Return?.ReturnedBy}</p>
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
