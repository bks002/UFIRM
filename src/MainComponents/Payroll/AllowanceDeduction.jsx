import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useSelector } from "react-redux";
import {
  getAllowanceDeductionsByProperty,
  createAllowanceDeduction,
  updateAllowanceDeduction,
  deleteAllowanceDeduction,
} from "../../Services/PayrollService";
import "font-awesome/css/font-awesome.min.css"; // Ensure FontAwesome CSS is imported

export default function AllowanceDeduction() {
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [formData, setFormData] = useState({
    Type: "Allowance",
    Name: "",
    Percentage: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const allowanceData = await getAllowanceDeductionsByProperty(propertyId);
      setData(allowanceData);
    } catch (error) {
      alert("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const openCreateDialog = () => {
    setFormData({ Type: "Allowance", Name: "", Percentage: "" });
    setEditId(null);
    setDialogVisible(true);
  };

  const openEditDialog = (item) => {
    setFormData({
      Type: item.Type,
      Name: item.Name,
      Percentage: item.Percentage,
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
      alert("Name is required");
      return;
    }
    if (formData.Percentage === "" || isNaN(formData.Percentage)) {
      alert("Valid Percentage is required");
      return;
    }

    const nowIso = new Date().toISOString();

    const model = {
      ID: editId || 0,
      Type: formData.Type,
      Name: formData.Name,
      Percentage: Number(formData.Percentage),
      Property_ID: Number(propertyId),
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

  const filteredData = data.filter((item) => {
    const type = item.Type || "";
    const name = item.Name || "";
    const search = searchText.toLowerCase();
    return (
      type.toLowerCase().includes(search) || name.toLowerCase().includes(search)
    );
  });

  const dialogFooter = (
    <>
      <button
        className="btn btn-secondary me-2"
        onClick={() => setDialogVisible(false)}
      >
        Cancel
      </button>
      <button className="btn btn-primary" onClick={handleSave}>
        Save
      </button>
    </>
  );

  return (
    <div
      className="content-wrapper"
      style={{ minHeight: "100vh", padding: 30 }}
    >
      <div
        className="card"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          borderRadius: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <h2
          style={{
            fontWeight: "bold",
            marginLeft: 28,
            marginTop: 12,
            fontSize: "2.2rem",
          }}
        >
          Allocation and Deduction
        </h2>

        <div
          className="d-flex justify-content-between align-items-center"
          style={{ padding: "12px 28px 16px 28px" }}
        >
          <div style={{ flex: 1 }} />
          <input
            type="text"
            className="form-control"
            style={{
              maxWidth: 220,
              marginRight: 15,
              background: "#f8fafc",
              fontSize: 16,
            }}
            placeholder="Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button
            className="btn"
            style={{
              background: "#198754",
              color: "white",
              fontWeight: 500,
              fontSize: 18,
              padding: "7px 25px",
            }}
            onClick={openCreateDialog}
          >
            Create New <i className="pi pi-plus" />
          </button>
        </div>

        <div className="table-responsive px-3 pb-4">
          {loading ? (
            <div style={{ textAlign: "center", padding: 20 }}>Loading...</div>
          ) : (
            <table className="table mb-0" style={{ minWidth: 650 }}>
              <thead>
                <tr>
                  <th style={{ fontWeight: 600, fontSize: "1.1rem" }}>Type</th>
                  <th style={{ fontWeight: 600, fontSize: "1.1rem" }}>Name</th>
                  <th style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                    Percentage
                  </th>
                  <th style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center text-muted py-4"
                      style={{ fontSize: "1.05rem" }}
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.ID}>
                      <td style={{ verticalAlign: "middle" }}>{item.Type}</td>
                      <td style={{ verticalAlign: "middle" }}>{item.Name}</td>
                      <td style={{ verticalAlign: "middle" }}>
                        {item.Percentage}%
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          title="Edit"
                          onClick={() => openEditDialog(item)}
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
          )}
        </div>
      </div>

      <Dialog
        header={editId !== null ? "Edit Entry" : "Create New Entry"}
        visible={dialogVisible}
        style={{ width: "400px" }}
        modal
        onHide={() => setDialogVisible(false)}
        footer={dialogFooter}
        draggable={false}
        resizable={false}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="mb-3">
            <label htmlFor="type" className="form-label">
              Type
            </label>
            <select
              id="type"
              name="Type"
              className="form-select"
              value={formData.Type}
              onChange={handleFormChange}
            >
              <option value="Allowance">Allowance</option>
              <option value="Deduction">Deduction</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="Name"
              className="form-control"
              value={formData.Name}
              onChange={handleFormChange}
              placeholder="Enter name"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="percentage" className="form-label">
              Percentage
            </label>
            <input
              type="number"
              id="percentage"
              name="Percentage"
              className="form-control"
              value={formData.Percentage}
              onChange={handleFormChange}
              placeholder="Enter percentage"
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
