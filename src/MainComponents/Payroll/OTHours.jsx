import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getOTHoursByProperty, addOTHours } from "../../Services/PayrollService";

export default function OTHours() {
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  const [otHoursList, setOtHoursList] = useState([]);

  // 🔹 Popup States
  const [showDialog, setShowDialog] = useState(false);
  const [designation, setDesignation] = useState("");
  const [price, setPrice] = useState("");

  // 🔹 Load Data
  useEffect(() => {
    if (!propertyId) return;

    getOTHoursByProperty(propertyId).then((data) => setOtHoursList(data));
  }, [propertyId]);

  // 🔹 Handle Create
  const handleCreate = async () => {
    if (!designation || !price) {
      alert("Please fill all fields");
      return;
    }

    const model = {
      ID: 0,
      Property_id: propertyId,
      designation: designation,
      price: parseFloat(price),
    };

    const result = await addOTHours(model);

    if (result !== null) {
      alert("OT Hours added successfully!");

      // Close dialog
      setShowDialog(false);

      // Clear fields
      setDesignation("");
      setPrice("");

      // Reload table
      getOTHoursByProperty(propertyId).then((data) => setOtHoursList(data));
    }
  };

  return (
    <div className="content-wrapper" style={{ minHeight: "100vh", padding: 30 }}>
      <div
        className="card"
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          borderRadius: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          padding: "20px 30px",
          background: "#f7fafc",
        }}
      >
        {/* Title + Create Button */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontWeight: "bold", color: "#2a4365" }}>OT Hours Amount List</h2>

          <button
            className="btn btn-primary"
            onClick={() => setShowDialog(true)}
          >
            + Create
          </button>
        </div>

        {/* Table */}
        <table
          className="table table-bordered"
          style={{ width: "100%", background: "#fff" }}
        >
          <thead style={{ background: "#edf2f7" }}>
            <tr>
              <th>S.No.</th>
              <th>Designation</th>
              <th>Price</th>
            </tr>
          </thead>

          <tbody>
            {otHoursList.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", color: "#718096" }}>
                  No data available
                </td>
              </tr>
            ) : (
              otHoursList.map((item, index) => (
                <tr key={item.ID}>
                  <td>{index + 1}</td>
                  <td>{item.designation}</td>
                  <td>{item.price}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Popup Dialog */}
      {showDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: 400,
              background: "#fff",
              padding: 25,
              borderRadius: 10,
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <h4 style={{ marginBottom: 20 }}>Create OT Hours</h4>

            <div className="form-group">
              <label>Designation</label>
              <input
                type="text"
                className="form-control"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>

            <div className="form-group mt-3">
              <label>Price</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div
              style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}
            >
              <button
                className="btn btn-secondary me-2"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </button>

              <button className="btn btn-success" onClick={handleCreate}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
