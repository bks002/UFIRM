import React, { useEffect, useState } from "react";
import RentalPopUp from "../ReactComponents/RentalModal/RentalPopUp"
import "bootstrap/dist/css/bootstrap.min.css";

const RentAssetPage = () => {
  const [rentalAssets, setRentalAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [actionType, setActionType] = useState("rentout"); // "return" or "rentout"

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const url="https://api.urest.in:8096/GetAssets";
       const url="https://api.urest.in:8096/GetRentalAssetData"
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
        console.log(data);
        // const filteredAssets = data.filter(asset=> asset.IsRentable.includes("true")||asset.IsRentable.includes("1"));
        setRentalAssets(data);
        // console.log(filteredAssets);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [currentAsset, actionType]);

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

  const handleSubmit = async (formData) => {
    const url = actionType === "return" 
      ? "https://api.urest.in:8096/ManageRentInAsset" 
      : "https://api.urest.in:8096/ManageRentOutAsset";
    
    try {
      const response = await fetch(url, {
        method: actionType === "return"?"PUT":"POST",
        // mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assetId: currentAsset.Id, assetName: currentAsset.Name,...formData }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

    //   // Update the asset data after successful check-in/check-out
    //   const updatedData = assetData.map(asset =>
    //     asset.Id === currentAsset.Id 
    //       ? { ...asset, status: actionType === "return" ? "Checked In" : "Checked Out" }
    //       : asset
    //   );
    //   setAssetData(updatedData);
    console.log(formData);
      handleCloseModal();
    } catch (error) {
      console.error(`Error during ${actionType}:`, error);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="mt-5 text-dark">Rental Assets</h1>
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
                  {rentalAssets.map((asset, index) => (
                    <tr key={asset.Id}>
                      <td>{index + 1}</td>
                      <td>{asset.Id}</td>
                      <td>{asset.Name}</td>
                      <td className="align-middle">
                        {asset.ReturnDate===null?
                      <button
                        className="btn btn-warning btn-sm m-1 px-3 mr-2"
                        onClick={() => handleReturn(asset)}
                      >
                        Return
                      </button>:
                      <button
                        className="btn-lg btn-success btn-sm px-3 m-1"
                        onClick={() => handleRentOut(asset)}
                      >
                        Rent Out
                      </button>}
                    </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {viewModal?<RentalPopUp
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

export default RentAssetPage;
