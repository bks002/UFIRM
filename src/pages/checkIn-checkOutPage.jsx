import React, { useEffect, useState } from "react";
import PopUp from "../ReactComponents/CheckIn&OutModal/PopUp";
import "bootstrap/dist/css/bootstrap.min.css";

const CheckInCheckOut = () => {
  const [assetData, setAssetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [actionType, setActionType] = useState(""); // "checkin" or "checkout"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://api.urest.in:8096/GetAssets", {
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
  }, []);

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

  const handleSubmit = async () => {
    // const url = actionType === "checkin" 
    //   ? "https://api.urest.in:8096/CheckInAsset" 
    //   : "https://api.urest.in:8096/CheckOutAsset";
    
    // try {
    //   const response = await fetch(url, {
    //     method: "POST",
    //     headers: {
    //       'Accept': 'application/json',
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ assetId: currentAsset.Id }),
    //   });

    //   if (!response.ok) {
    //     throw new Error('Network response was not ok');
    //   }

    //   // Update the asset data after successful check-in/check-out
    //   const updatedData = assetData.map(asset =>
    //     asset.Id === currentAsset.Id 
    //       ? { ...asset, status: actionType === "checkin" ? "Checked In" : "Checked Out" }
    //       : asset
    //   );
    //   setAssetData(updatedData);
      handleCloseModal();
    // } catch (error) {
    //   console.error(`Error during ${actionType}:`, error);
    // }
  };

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="mt-5 text-dark">Check-IN & Check-OUT</h1>
            </div>
          </div>
        </div>
      </div>
      <section className="content">
        <div className="container-fluid">
          <h2>Asset List</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
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
                  {assetData.map((asset, index) => (
                    <tr key={asset.Id}>
                      <td>{index + 1}</td>
                      <td>{asset.Id}</td>
                      <td>{asset.Name}</td>
                      <td className="align-middle">
                      <button
                        className="btn btn-primary btn-sm m-1 px-2 mr-2"
                        onClick={() => handleCheckIn(asset)}
                      >
                        Check In
                      </button>
                      <button
                        className="btn btn-secondary btn-sm m-1"
                        onClick={() => handleCheckOut(asset)}
                      >
                        Check Out
                      </button>
                    </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {viewModal?<PopUp 
          show={viewModal} 
          handleClose={handleCloseModal} 
          asset={currentAsset} 
          actionType={actionType} 
          handleSubmit={handleSubmit} 
        />:undefined}
      </section>
    </div>
  );
};

export default CheckInCheckOut;
