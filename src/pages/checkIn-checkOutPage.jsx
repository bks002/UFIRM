import React, { useEffect, useState } from "react";
import CheckIn from "./CheckInPage";

const CheckInCheckOut = () => {
  const [assetData, setAssetData] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setAssetData(data); // Update state with fetched data
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false); // Set loading to false in case of error
      }
    };
    fetchData();
  }, []); // Empty dependency array to run effect only once on mount

  const handleCheckIn = (assetId) => {
    
    // Implement logic for check-in here
    console.log(`Asset ${assetId} checked in`);
  };

  const handleCheckOut = (assetId) => {
    // Implement logic for check-out here
    console.log(`Asset ${assetId} checked out`);
  };

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="mt-5 text-dark">Check-IN & Check-OUT </h1>
            </div>
          </div>
        </div>
      </div>
      <section className="content">
        <div className="container-fluid">
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
                        <td>
                          <button
                            className="btn btn-primary btn-sm mr-2"
                            onClick={() => handleCheckIn(asset.Id)}
                          >
                            Check In
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleCheckOut(asset.Id)}
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
        </div>
      </section>
    </div>
  );
};

export default CheckInCheckOut;
