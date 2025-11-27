import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getOTHoursByProperty,
  addOTHours,
  updateOTHours,
  deleteOTHours,
} from "../../Services/PayrollService";
import { getEmployeesByOffice } from "../../Services/PayrollService";

export default function OTHours() {
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  const [otHoursList, setOtHoursList] = useState([]);
  const [designations, setDesignations] = useState([]);

  // Popup + Form States
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("create");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [designation, setDesignation] = useState("");
  const [price, setPrice] = useState("");

  // Load Table Data
  useEffect(() => {
    if (!propertyId) return;
    loadData();
  }, [propertyId]);

  const fetchDesignations = async () => {
    if (!propertyId) return;

    try {
      const data = await getEmployeesByOffice(propertyId);

      const employees = (data || []).map(
        (item) => item.EmployeeList?.Designation || ""
      );

      const uniq = [...new Set(employees.filter((d) => d.trim() !== ""))];

      setDesignations(uniq);
    } catch (err) {
      setDesignations([]);
    }
  };

  useEffect(() => {
    if (!propertyId) return;

    loadData();
    fetchDesignations();
  }, [propertyId]);

  const loadData = () => {
    getOTHoursByProperty(propertyId).then((data) => setOtHoursList(data));
  };

  // Handle Save (Create + Edit)
  const handleSave = async () => {
    if (!designation || !price) {
      alert("Please fill all fields");
      return;
    }

    if (dialogType === "create") {
      const model = {
        ID: 0,
        Property_id: propertyId,
        designation,
        price: parseFloat(price),
      };

      const result = await addOTHours(model);
      if (result !== null) {
        alert("OT Hours added successfully!");
      }
    } else if (dialogType === "edit") {
      const body = [
        {
          ID: selectedRecord.ID,
          Property_id: propertyId,
          designation,
          price: parseFloat(price),
        },
      ];

      const result = await updateOTHours(propertyId, body);
      if (result !== null) {
        alert("OT Hours updated successfully!");
      }
    }

    setShowDialog(false);
    resetForm();
    loadData();
  };

  const resetForm = () => {
    setDesignation("");
    setPrice("");
    setSelectedRecord(null);
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    const result = await deleteOTHours(id);
    if (result !== null) {
      loadData();
    }
  };

  // Open Modal (Create/Edit)
  const openDialog = (type, record = null) => {
    setDialogType(type);
    setShowDialog(true);

    if (type === "edit" && record) {
      setSelectedRecord(record);
      setDesignation(record.designation);
      setPrice(record.price);
    } else {
      resetForm();
    }
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
        {/* Title + Create Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontWeight: "bold", color: "#2a4365" }}>
            OT Hours Amount List
          </h2>

          <button
            className="btn btn-success"
            onClick={() => openDialog("create")}
          >
            Create
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
              <th style={{ width: 120, textAlign: "center" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {otHoursList.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: "center", color: "#718096" }}
                >
                  No data available
                </td>
              </tr>
            ) : (
              otHoursList.map((item, index) => (
                <tr key={item.ID}>
                  <td>{index + 1}</td>
                  <td>{item.designation}</td>
                  <td>{item.price}</td>

                  <td style={{ textAlign: "center", fontSize: 18 }}>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      title="Edit"
                      onClick={() => openDialog("edit", item)}
                    >
                      <i className="fa fa-pencil" aria-hidden="true" />
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      title="Delete"
                      onClick={() => handleDelete(item.ID)}
                    >
                      <i className="fa fa-trash" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Popup Dialog */}
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
            <h4 style={{ marginBottom: 20 }}>
              {dialogType === "edit" ? "Edit OT Hours" : "Create OT Hours"}
            </h4>

            <div className="form-group">
              <label>Designation</label>
              <select
                className="form-control"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              >
                <option value="">-- Select Designation --</option>
                {designations.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
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
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button
                className="btn btn-secondary me-2"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </button>

              <button className="btn btn-success" onClick={handleSave}>
                {dialogType === "edit" ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
