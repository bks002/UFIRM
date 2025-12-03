import React from "react";

export default function AD_Percentage() {
  return (
    <div
      className="content-wrapper"
      style={{ minHeight: "100vh", padding: 30 }}
    >
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
        <h2 style={{ fontWeight: "bold", color: "#2a4365", marginBottom: 20 }}>
          Percentage Assigned List
        </h2>

        <table
          className="table table-bordered"
          style={{ width: "100%", background: "#fff" }}
        >
          <thead style={{ background: "#edf2f7" }}>
            <tr>
              <th>S.No.</th>
              <th>Name</th>
              <th>Percentage</th>
              <th style={{ width: 120, textAlign: "center" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td
                colSpan={4}
                style={{ textAlign: "center", color: "#718096" }}
              >
                No data available
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
