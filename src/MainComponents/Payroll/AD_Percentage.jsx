import React, { useEffect, useState } from "react";
import {
  getAllowanceDeductionsByProperty,
  getADPercentages,
  addADPercentage,
  updateADPercentage,
  deleteADPercentage
} from "../../Services/PayrollService";
import { getAllProperties } from "../../Services/PropertyService";
import { useSelector } from "react-redux";

export default function AD_Percentage() {
  const [records, setRecords] = useState([]);
  const [adNames, setAdNames] = useState([]);
  const [properties, setProperties] = useState([]);

  const [showDialog, setShowDialog] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [percentage, setPercentage] = useState("");

  const [isGlobal, setIsGlobal] = useState(true);
  const [propertyId, setPropertyId] = useState(null);

  const [editRecord, setEditRecord] = useState(null);
  const [search, setSearch] = useState("");
const PropertyId = useSelector((state) => state.Commonreducer.puidn);

  // Load Data
  useEffect(() => {
    loadTable();
    loadADNames();
    loadProperties();
  }, [PropertyId]);

  const loadTable = () => {
  // CASE 1 → PropertyId = 0 → Show GLOBAL only
  if (!PropertyId || PropertyId === 0) {
    getADPercentages(0).then((data) => {
      const globalOnly = (data || []).filter((x) => x.IsGlobal === true);
      setRecords(globalOnly);
    });
    return;
  }

  // CASE 2 → PropertyId > 0 → Show global + that property
  getADPercentages(PropertyId).then((data) => setRecords(data || []));
};

  const loadProperties = async () => {
    try {
      const res = await getAllProperties();
      setProperties(res || []);
    } catch {
      setProperties([]);
    }
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
    } catch {
      setAdNames([]);
    }
  };

  // Save
  const handleSave = async () => {
    if (!selectedName || !percentage) {
      alert("Fill all fields");
      return;
    }

    const model = {
      ID: editRecord ? editRecord.ID : 0,
      AD_Name: selectedName,
      Percentage: parseFloat(percentage),
      PropertyId: isGlobal ? null : propertyId,
      IsGlobal: isGlobal,
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
    resetForm();
    loadTable();
  };

  const resetForm = () => {
    setSelectedName("");
    setPercentage("");
    setIsGlobal(true);
    setPropertyId(null);
    setEditRecord(null);
  };

  // Edit
  const openEdit = (item) => {
    setEditRecord(item);
    setSelectedName(item.AD_Name);
    setPercentage(item.Percentage);
    setIsGlobal(item.IsGlobal);
    setPropertyId(item.PropertyId || null);
    setShowDialog(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;

    await deleteADPercentage(id);
    loadTable();
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
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontWeight: "bold", color: "#2a4365", margin: 0 }}>
            Percentage Assigned List
          </h2>

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
                resetForm();
                setShowDialog(true);
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
              <th>Applied To</th> {/* NEW COLUMN */}
              <th style={{ width: 120, textAlign: "center" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "#718096" }}>
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
                    <td>{item.Percentage}%</td>

                    {/* Global / Property Column */}
                    <td>
                      {item.IsGlobal ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>
                          Global
                        </span>
                      ) : item.PropertyName ? (
                        <span style={{ color: "#2a4365" }}>
                          {item.PropertyName}
                        </span>
                      ) : (
                        <span style={{ color: "#dd6b20" }}>
                          {properties.find(p => p.PropertyId === item.PropertyId) ? properties.find(p => p.PropertyId === item.PropertyId).Name : "N/A"}
                        </span>
                      )}
                    </td>

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

            {/* Name */}
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

            {/* Percentage */}
            <div className="form-group mt-3">
              <label>Percentage</label>
              <input
                type="number"
                className="form-control"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
              />
            </div>

            {/* Global Toggle */}
            <div className="form-group mt-3">
              <label>
                <input
                  type="checkbox"
                  checked={isGlobal}
                  onChange={(e) => setIsGlobal(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                Use Globally for All Properties
              </label>
            </div>

            {/* Property Dropdown */}
            {!isGlobal && (
              <div className="form-group mt-3">
                <label>Select Property</label>
                <select
                  className="form-control"
                  value={propertyId || ""}
                  onChange={(e) => setPropertyId(e.target.value)}
                >
                  <option value="">-- Select Property --</option>
                  {properties.map((p) => (
                    <option key={p.PropertyId} value={p.PropertyId}>
                      {p.Name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Buttons */}
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
                  resetForm();
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
