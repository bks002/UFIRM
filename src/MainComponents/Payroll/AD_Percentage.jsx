import React, { useEffect, useState } from "react";
import {
  getAllowanceDeductionsByProperty,
  getADPercentages,
  addADPercentage,
  updateADPercentage,
  deleteADPercentage,
} from "../../Services/PayrollService";

export default function AD_Percentage() {
  const [records, setRecords] = useState([]);
  const [adNames, setAdNames] = useState([]);

  const [showDialog, setShowDialog] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [percentage, setPercentage] = useState("");
  const [editRecord, setEditRecord] = useState(null);
  const [search, setSearch] = useState("");

  // Load table + dropdown names
  useEffect(() => {
    loadTable();
    loadADNames();
  }, []);

  const loadTable = () => {
    getADPercentages().then((data) => setRecords(data || []));
  };

  const loadADNames = async () => {
    try {
      const data = await getAllowanceDeductionsByProperty();

      const filtered = (data || [])
        .filter((x) =>
          ["A", "D", "OA", "OD"].includes(x.Type?.trim().toUpperCase())
        )
        .map((x) => x.Name);

      setAdNames([...new Set(filtered)]);
    } catch (error) {
      setAdNames([]);
    }
  };

  // Save (Create + Update)
  const handleSave = async () => {
    if (!selectedName || !percentage) {
      alert("Fill all fields");
      return;
    }

    const model = {
      ID: editRecord ? editRecord.ID : 0,
      AD_Name: selectedName,
      Percentage: parseFloat(percentage),
      IsActive: true,
      CreatedOn: editRecord ? editRecord.CreatedOn : new Date().toISOString(),
      UpdatedOn: new Date().toISOString(),
    };

    if (editRecord) {
      await updateADPercentage(editRecord.ID, model);
      alert("Updated Successfully!");
    } else {
      await addADPercentage(model);
      alert("Saved Successfully!");
    }

    setShowDialog(false);
    setSelectedName("");
    setPercentage("");
    setEditRecord(null);
    loadTable();
  };

  // Open dialog for edit
  const openEdit = (item) => {
    setEditRecord(item);
    setSelectedName(item.AD_Name);
    setPercentage(item.Percentage);
    setShowDialog(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;

    await deleteADPercentage(id);
    loadTable();
  };

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          {/* LEFT: Heading */}
          <h2 style={{ fontWeight: "bold", color: "#2a4365", margin: 0 }}>
            Percentage Assigned List
          </h2>

          {/* RIGHT: Search + Assign */}
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name..."
              style={{ width: 220 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button
              className="btn btn-success"
              onClick={() => {
                setShowDialog(true);
                setEditRecord(null);
                setSelectedName("");
                setPercentage("");
              }}
            >
              Assign
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="table table-bordered" style={{ background: "#fff" }}>
          <thead style={{ background: "#edf2f7" }}>
            <tr>
              <th>S.No.</th>
              <th>Name</th>
              <th>Percentage</th>
              <th style={{ width: 120, textAlign: "center" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: "center", color: "#718096" }}
                >
                  No data available
                </td>
              </tr>
            ) : (
              records
                .filter((x) =>
                  x.AD_Name.toLowerCase().includes(search.toLowerCase())
                )
                .map((item, index) => (
                  <tr key={item.ID}>
                    <td>{index + 1}</td>
                    <td>{item.AD_Name}</td>
                    <td>{item.Percentage}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => openEdit(item)}
                      >
                        <i className="fa fa-pencil" />
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(item.ID)}
                      >
                        <i className="fa fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      {showDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: 420,
              background: "#fff",
              padding: 25,
              borderRadius: 10,
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <h4 style={{ marginBottom: 20 }}>
              {editRecord ? "Edit Percentage" : "Assign Percentage"}
            </h4>

            <div className="form-group">
              <label>Name</label>
              <select
                className="form-control"
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
              >
                <option value="">-- Select Name --</option>
                {adNames.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group mt-3">
              <label>Percentage</label>
              <input
                type="number"
                className="form-control"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button
                className="btn btn-secondary me-2"
                onClick={() => {
                  setShowDialog(false);
                  setEditRecord(null);
                }}
              >
                Cancel
              </button>

              <button className="btn btn-success" onClick={handleSave}>
                {editRecord ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
