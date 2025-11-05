import React, { useEffect, useState } from "react";
import PopUp from "../ReactComponents/CheckIn&OutModal/PopUp";
import "bootstrap/dist/css/bootstrap.min.css";
import ExportToCSV from "../ReactComponents/ExportToCSV/ExportToCSV"
import { connect } from 'react-redux';
import { PropagateLoader } from "react-spinners";
import LoadingOverlay from "react-loading-overlay";


const CheckInCheckOut = (actions) => {
  const [assetData, setAssetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [actionType, setActionType] = useState(""); // "checkin" or "checkout"

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = `https://api.urest.in:8096/api/Asset/GetAssetCheckOutData?PropId=${actions.propId}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setAssetData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [actions.propId]); // only depends on propId

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
    const url = actionType === "checkin"
      ? "https://api.urest.in:8096/ManageCheckIn"
      : "https://api.urest.in:8096/ManageCheckOut";

    try {
      const payload = { AssetId: currentAsset.Id, AssetName: currentAsset.Name, ...formData };

      const response = await fetch(url, {
        method: actionType === "checkin" ? "PUT" : "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // ✅ refresh asset list only after successful action
      const refreshUrl = `https://api.urest.in:8096/api/Asset/GetAssetCheckOutData?PropId=${actions.propId}`;
      const updatedRes = await fetch(refreshUrl);
      const updatedData = await updatedRes.json();
      setAssetData(updatedData);

      handleCloseModal();
    } catch (error) {
      console.error(`Error during ${actionType}:`, error);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          {/* <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="mt-5 text-dark">Check-IN & Check-OUT</h1>
            </div>
          </div> */}
        </div>
      </div>
      <section className="content">
        <div className="card container-fluid">
          <div className="d-flex justify-content-between align-items-center m-2">
            <h2 className="mb-0">Asset List</h2>
            <ExportToCSV data={assetData} className="btn btn-success btn-sm rounded px-3" />
          </div>
          <div className="table-responsive table-bordered table-hover table-sm">
            <LoadingOverlay
              active={loading}
              spinner={<PropagateLoader color="#336B93" size={30} />}
            >
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
                  {assetData.map((asset, index) => (
                    <tr key={asset.Id}>
                      <td>{index + 1}</td>
                      <td>{asset.Id}</td>
                      <td>{asset.Name}</td>
                      <td className="align-middle">
                        {asset.ReturnDate === null ?

                          <button
                            className="btn-lg btn-warning btn-sm m-1 px-4 "
                            onClick={() => handleCheckIn(asset)}
                          >
                            Check In
                          </button> :
                          <button
                            className="btn-lg btn-success btn-sm px-3 m-1"
                            onClick={() => handleCheckOut(asset)}
                          >
                            Check Out
                          </button>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </LoadingOverlay>

          </div>
        </div>
        {viewModal ? <PopUp
          show={viewModal}
          handleClose={handleCloseModal}
          asset={currentAsset}
          actionType={actionType}
          handleSubmit={handleSubmit}
        /> : undefined}
      </section>
    </div>
  );
};

function mapStateToProps(state, props) {
  return {
    propId: state.Commonreducer.puidn,
  }
}

export default connect(mapStateToProps)(CheckInCheckOut);
