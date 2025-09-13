import React, { useEffect, useState } from "react";
import RentalPopUp from "../ReactComponents/RentalModal/RentalPopUp";
import "bootstrap/dist/css/bootstrap.min.css";
import ExportToCSV from "../ReactComponents/ExportToCSV/ExportToCSV";
import { connect } from "react-redux";
import { PropagateLoader } from "react-spinners";
import LoadingOverlay from "react-loading-overlay";

// The main page component
const RentAssetPage = (actions) => {
  const [rentalAssets, setRentalAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [actionType, setActionType] = useState("rentout"); // "return" or "rentout"

  // New: extract the fetch rentalAssets logic separately
  const fetchRentalAssets = async () => {
    try {
      setLoading(true);
      const url = `https://api.urest.in:8096/api/Asset/GetRentalAssetData?PropId=${actions.propId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setRentalAssets(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  // Only depend on propId so list is fetched on mount/prop change
  useEffect(() => {
    fetchRentalAssets();
    // eslint-disable-next-line
  }, [actions.propId]);

  const handleReturn = (asset) => {
    setCurrentAsset(asset);
    setActionType("return");
    setViewModal(true);
  };

  const handleRentOut = (asset) => {
    setCurrentAsset(asset);
    setActionType("rentout");
    setViewModal(true);
  };

  const handleCloseModal = () => {
    setViewModal(false);
    setCurrentAsset(null);
    setActionType("");
  };

  // Modified: Now triggers an immediate fetch after successful submit
  const handleSubmit = async (formData) => {
    const url =
      actionType === "return"
        ? "https://api.urest.in:8096/ManageRentInAsset"
        : "https://api.urest.in:8096/ManageRentOutAsset";

    try {
      const response = await fetch(url, {
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

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // After successful submission, immediately update asset list
      await fetchRentalAssets();

      handleCloseModal();
    } catch (error) {
      console.error(`Error during ${actionType}:`, error);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="content-header"></div>
      <section className="content">
        <div className="card container-fluid">
          <div className="d-flex justify-content-between align-items-center m-2">
            <h2 className="mb-0">Rental Asset List</h2>
            <ExportToCSV
              data={rentalAssets}
              className="btn btn-success btn-sm rounded px-3"
            />
          </div>
          <LoadingOverlay
            active={loading}
            spinner={<PropagateLoader color="#336B93" size={30} />}
          >
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Serial No.</th>
                    <th>Asset ID</th>
                    <th>Asset Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rentalAssets.map((asset, index) => (
                    <tr key={asset.Id}>
                      <td>{index + 1}</td>
                      <td>{asset.Id}</td>
                      <td>{asset.Name}</td>
                      <td className="align-middle">
                        {asset.RentedOutDate === null || asset.ReturnDate ? (
                          <button
                            className="btn-lg btn-success btn-sm px-3 m-1"
                            onClick={() => handleRentOut(asset)}
                          >
                            Rent Out
                          </button>
                        ) : (
                          <button
                            className="btn btn-warning btn-sm m-1 px-3 mr-2"
                            onClick={() => handleReturn(asset)}
                          >
                            Return
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LoadingOverlay>
        </div>
        {viewModal ? (
          <RentalPopUp
            show={viewModal}
            handleClose={handleCloseModal}
            asset={currentAsset}
            actionType={actionType}
            handleSubmit={handleSubmit}
          />
        ) : undefined}
      </section>
    </div>
  );
};

function mapStateToProps(state, props) {
  return {
    propId: state.Commonreducer.puidn,
  };
}

export default connect(mapStateToProps)(RentAssetPage);
