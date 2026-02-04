import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";

import PopUp from "../ReactComponents/CheckIn&OutModal/PopUp";
import ExportToCSV from "../ReactComponents/ExportToCSV/ExportToCSV";
import { getAssetCheckInOutHistoryByAssetId } from "../Services/CheckInCheckOut";

/* ================= IMAGE HELPER ================= */
const renderBase64Image = (base64) =>
  base64 ? (
    <img
      src={`data:image/jpeg;base64,${base64}`}
      alt="Asset"
      style={{ width: "180px", borderRadius: "6px", marginTop: "6px" }}
    />
  ) : (
    <span className="text-500">No Image</span>
  );

const CheckInCheckOut = () => {
  const propId = useSelector((state) => state.Commonreducer.puidn);

  const [assetData, setAssetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  const [viewModal, setViewModal] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [actionType, setActionType] = useState("");

  const [historyModal, setHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyAssetName, setHistoryAssetName] = useState("");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchData();
  }, [propId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.urest.in:8096/api/Asset/GetAssetCheckOutData?PropId=${propId}`
      );
      setAssetData(await res.json());
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
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

    try {
      await fetch(url, {
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

      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  /* ================= HISTORY ================= */
  const handleViewHistory = async (asset) => {
    setHistoryAssetName(asset.Name);
    setHistoryModal(true);
    setHistoryData(await getAssetCheckInOutHistoryByAssetId(asset.Id));
  };

  /* ================= ACTION COLUMN ================= */
  const actionTemplate = (asset) => (
    <div className="flex gap-2 justify-content-center">
      {asset.ReturnDate === null ? (
        <Button
          icon="pi pi-sign-in"
          severity="warning"
          rounded
          tooltip="Check In"
          onClick={() => handleCheckIn(asset)}
        />
      ) : (
        <Button
          icon="pi pi-sign-out"
          severity="success"
          rounded
          tooltip="Check Out"
          onClick={() => handleCheckOut(asset)}
        />
      )}

      <Button
        icon="pi pi-eye"
        severity="info"
        rounded
        tooltip="View History"
        onClick={() => handleViewHistory(asset)}
      />
    </div>
  );

  /* ================= TABLE HEADER ================= */
  const tableHeader = (
    <div className="flex justify-content-between align-items-center flex-wrap gap-2">
      <span className="p-input-icon-left">

        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search assets..."
        />
      </span>
    </div>
  );
  const buildHistoryExportData = (historyData, assetName) => {
    if (!historyData || !historyData.length) return [];

    return historyData.map((item) => ({
      "Asset Name": assetName,
      "Assignee": item.CheckOut?.AssigneeName || "",
      "Purpose": item.CheckOut?.Purpose || "",
      "Check Out Date": item.CheckOut?.CheckOutDateTime || "",
      "Out From": item.CheckOut?.OutFrom || "",
      "Sent To": item.CheckOut?.SentTo || "",
      "Approved By": item.CheckOut?.ApprovedBy || "",
      "Returned By": item.CheckIn?.ReturnedBy || "",
      "Return Date": item.CheckIn?.ReturnDate || ""
    }));
  };

  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="card">

          <div className="card-header d-flex align-items-center">
            <h2 className="card-title m-0">Check IN Check OUT</h2>

            {/* PUSH TO RIGHT */}
            <div className="ms-auto">
              <ExportToCSV data={assetData} fileName="Asset_List.csv" />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-content-center p-6">
              <ProgressSpinner />
            </div>
          ) : (
            <DataTable
              value={assetData}
              paginator
              rows={10}
              rowsPerPageOptions={[10, 25, 50]}
              stripedRows
              scrollable
              scrollHeight="calc(100vh - 260px)"
              responsiveLayout="scroll"
              globalFilter={globalFilter}
              header={tableHeader}
              emptyMessage="No assets found"
              className="p-datatable-sm"
            >
              <Column field="Id" header="Asset ID" sortable style={{ width: "8rem" }} />
              <Column field="Name" header="Asset Name" sortable style={{ width: "20rem" }} />
              <Column field="Manufacturer" header="Manufacturer" style={{ width: "14rem" }} />
              <Column field="Description" header="Description" style={{ width: "24rem" }} />
              <Column header="Actions" body={actionTemplate} style={{ width: "10rem" }} />
            </DataTable>
          )}

          {/* CHECK IN / OUT MODAL */}
          {viewModal && (
            <PopUp
              show={viewModal}
              handleClose={handleCloseModal}
              asset={currentAsset}
              actionType={actionType}
              handleSubmit={handleSubmit}
            />
          )}

          {/* HISTORY DIALOG */}
          <Dialog
            header={
              <div className="flex align-items-center flex-grow-1">
                {/* LEFT */}
                <span className="font-semibold text-lg">
                  History : {historyAssetName}
                </span>

                {/* RIGHT */}
                <div className="ms-auto">
                  <ExportToCSV
                    data={buildHistoryExportData(historyData, historyAssetName)}
                    fileName={`History_${historyAssetName}.csv`}
                  />
                </div>
              </div>
            }
            visible={historyModal}
            style={{ width: "75vw" }}
            onHide={() => setHistoryModal(false)}
          >
            {historyData.length === 0 ? (
              <p>No history found</p>
            ) : (
              historyData.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "2rem",
                    borderBottom: "1px solid #e5e7eb",
                    paddingBottom: "1rem",
                    marginBottom: "1rem"
                  }}
                >
                  <div style={{ width: "50%" }}>
                    <h4 style={{ color: "#0d6efd" }}>Check Out</h4>
                    <p><b>Assignee:</b> {item.CheckOut?.AssigneeName}</p>
                    <p><b>Purpose:</b> {item.CheckOut?.Purpose}</p>
                    <p><b>Date:</b> {item.CheckOut?.CheckOutDateTime}</p>
                    <p><b>Out From:</b> {item.CheckOut?.OutFrom}</p>
                    <p><b>Sent To:</b> {item.CheckOut?.SentTo}</p>
                    <p><b>Approved By:</b> {item.CheckOut?.ApprovedBy}</p>
                    {renderBase64Image(item.CheckOut?.CheckOutImage)}
                  </div>

                  <div style={{ width: "50%" }}>
                    <h4 style={{ color: "#198754" }}>Check In</h4>
                    <p><b>Returned By:</b> {item.CheckIn?.ReturnedBy}</p>
                    <p><b>Return Date:</b> {item.CheckIn?.ReturnDate}</p>
                    {renderBase64Image(item.CheckIn?.ReturnImage)}
                  </div>
                </div>
              ))
            )}
          </Dialog>
        </div>
      </section>
    </div>
  );
};

export default CheckInCheckOut;
