import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import {
  getAllowanceDeductionsByProperty,
  createAllowanceDeduction,
  updateAllowanceDeduction,
  deleteAllowanceDeduction,
} from "../../Services/PayrollService";
import "font-awesome/css/font-awesome.min.css";

export default function AllowanceDeduction() {

  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [formData, setFormData] = useState({
    Type: "A",
    Name: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load data (no propertyId now)
  const loadData = async () => {
    setLoading(true);
    try {
      const allowanceData = await getAllowanceDeductionsByProperty();
      setData(allowanceData);
    } catch (error) {
      alert("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Create dialog
  const openCreateDialog = () => {
    setFormData({ Type: "A", Name: "" });
    setEditId(null);
    setDialogVisible(true);
  };

  // Edit dialog
  const openEditDialog = (item) => {
    setFormData({
      Type: item.Type,
      Name: item.Name,
    });
    setEditId(item.ID);
    setDialogVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteAllowanceDeduction(id);
        alert("Deleted successfully!");
        loadData();
      } catch (error) {
        alert("Failed to delete entry.");
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.Name.trim()) {
      alert("Please enter a name before saving.");
      return;
    }

    const nowIso = new Date().toISOString();

    const model = {
      ID: editId || 0,
      Type: formData.Type,
      Name: formData.Name,
      CreatedOn: nowIso,
      CreatedBy: 1,
      UpdatedOn: nowIso,
      UpdatedBy: 1,
      IsActive: true,
    };

    try {
      if (editId !== null) {
        await updateAllowanceDeduction(editId, model);
        alert("Updated successfully!");
      } else {
        await createAllowanceDeduction(model);
        alert("Created successfully!");
      }

      setDialogVisible(false);
      loadData();
    } catch (error) {
      alert("Failed to save entry.");
    }
  };

  // Search Filter
  const filteredData = data.filter((item) => {
    const search = searchText.toLowerCase();
    return (
      (item.Type || "").toLowerCase().includes(search) ||
      (item.Name || "").toLowerCase().includes(search)
    );
  });

  const dialogFooter = (
    <>
      <button className="btn btn-secondary me-2" onClick={() => setDialogVisible(false)}>
        Cancel
      </button>

      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={!formData.Name.trim()}
      >
        Save
      </button>
    </>
  );

  return (
    <div className="content-wrapper" style={{ minHeight: "100vh", padding: 30 }}>
      <div
        className="card"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          borderRadius: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          paddingBottom: 20,
        }}
      >

        {/* HEADER */}
        <div
          className="d-flex justify-content-between align-items-center"
          style={{
            padding: "20px 28px 10px 28px",
            borderBottom: "1px solid #dee2e6",
          }}
        >
          <h2 style={{ fontWeight: "bold", fontSize: "2rem", margin: 0 }}>
            Allowance and Deduction
          </h2>

          <div className="d-flex align-items-center">
            <input
              type="text"
              className="form-control me-2"
              style={{ maxWidth: 220, background: "#f8fafc", fontSize: 15 }}
              placeholder="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <button
              className="btn btn-success d-flex align-items-center"
              style={{ padding: "0 18px", fontSize: 15, height: "38px" }}
              onClick={openCreateDialog}
            >
              <i className="pi pi-plus me-2" /> Create
            </button>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="table-responsive px-4 pb-4">
          {loading ? (
            <div style={{ textAlign: "center", padding: 20 }}>Loading...</div>
          ) : (
            <div className="row">

              {/* ALLOWANCE */}
              <div className="col-md-6">
                <h4 style={{ marginTop: 25, marginBottom: 12, color: "#198754" }}>
                  Allowance
                </h4>
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th style={{ width: 120, textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredData.filter(i => i.Type === "A").length === 0 ? (
                      <tr>
                        <td colSpan={2} className="text-center text-muted py-3">
                          No Allowance found.
                        </td>
                      </tr>
                    ) : (
                      filteredData
                        .filter(i => i.Type === "A")
                        .map((item) => (
                          <tr key={item.ID}>
                            <td>{item.Name}</td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-primary me-2"
                                onClick={() => openEditDialog(item)}
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

              {/* OTHER ALLOWANCE */}
              <div className="col-md-6">
                <h4 style={{ marginTop: 25, marginBottom: 12, color: "#0d6efd" }}>
                  Other Allowance
                </h4>
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th style={{ width: 120, textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredData.filter(i => i.Type === "OA").length === 0 ? (
                      <tr>
                        <td colSpan={2} className="text-center text-muted py-3">
                          No Other Allowance found.
                        </td>
                      </tr>
                    ) : (
                      filteredData
                        .filter(i => i.Type === "OA")
                        .map((item) => (
                          <tr key={item.ID}>
                            <td>{item.Name}</td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-primary me-2"
                                onClick={() => openEditDialog(item)}
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

              {/* DEDUCTION */}
              <div className="col-md-6">
                <h4 style={{ marginTop: 25, marginBottom: 12, color: "#dc3545" }}>
                  Deduction
                </h4>
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th style={{ width: 120, textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredData.filter(i => i.Type === "D").length === 0 ? (
                      <tr>
                        <td colSpan={2} className="text-center text-muted py-3">
                          No Deduction found.
                        </td>
                      </tr>
                    ) : (
                      filteredData
                        .filter(i => i.Type === "D")
                        .map((item) => (
                          <tr key={item.ID}>
                            <td>{item.Name}</td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-primary me-2"
                                onClick={() => openEditDialog(item)}
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

              {/* OTHER DEDUCTION */}
              <div className="col-md-6">
                <h4 style={{ marginTop: 25, marginBottom: 12, color: "#6f42c1" }}>
                  Other Deduction
                </h4>
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th style={{ width: 120, textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredData.filter(i => i.Type === "OD").length === 0 ? (
                      <tr>
                        <td colSpan={2} className="text-center text-muted py-3">
                          No Other Deduction found.
                        </td>
                      </tr>
                    ) : (
                      filteredData
                        .filter(i => i.Type === "OD")
                        .map((item) => (
                          <tr key={item.ID}>
                            <td>{item.Name}</td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-primary me-2"
                                onClick={() => openEditDialog(item)}
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

            </div>
          )}
        </div>

        {/* DIALOG */}
        <Dialog
          header={editId !== null ? "Edit Entry" : "Create New Entry"}
          visible={dialogVisible}
          style={{ width: "450px" }}
          modal
          onHide={() => setDialogVisible(false)}
          footer={dialogFooter}
        >
          <div className="mb-3">
            <label className="form-label">Type</label>
            <select
              name="Type"
              className="form-select"
              value={formData.Type}
              onChange={handleFormChange}
            >
              <option value="A">Allowance</option>
              <option value="OA">Other Allowance</option>
              <option value="D">Deduction</option>
              <option value="OD">Other Deduction</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="Name"
              className="form-control"
              value={formData.Name}
              onChange={handleFormChange}
              placeholder="Enter name"
            />
          </div>
        </Dialog>

      </div>
    </div>
  );
}