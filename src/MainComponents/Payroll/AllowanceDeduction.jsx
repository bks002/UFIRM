import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useSelector } from "react-redux";
import {
  getAllowanceDeductionsByProperty,
  createAllowanceDeduction,
  updateAllowanceDeduction,
  deleteAllowanceDeduction,
} from "../../Services/PayrollService";
import FormulaService from "../../Services/FormulaService";
import "font-awesome/css/font-awesome.min.css";

export default function AllowanceDeduction() {
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  const [data, setData] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [formData, setFormData] = useState({
    Type: "Allowance",
    Name: "",
    FormulaId: null,
    FixedValue: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load allowance/deductions
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

  // Load formulas
  const loadFormulas = async () => {
    try {
      const formulaData = await FormulaService.getAllFormulas();
      setFormulas(formulaData || []);
    } catch (error) {
      console.error("Failed to load formulas:", error);
    }
  };

  useEffect(() => {
    loadData();
    loadFormulas();
  }, [propertyId]);

  // Get formula display string by formulaId
  const getFormulaDisplayById = (id) => {
    if (!id) return "";
    const formula = formulas.find((f) => f.Id === id);
    if (!formula) return "";
    return formula.Formula || "";
  };

  // Get fixed value by formulaId
  const getFixedValueById = (id) => {
    if (!id) return "";
    const formula = formulas.find((f) => f.Id === id);
    if (!formula) return "";
    return formula.FixedValue != null ? formula.FixedValue : "";
  };

  // Open create dialog
  const openCreateDialog = () => {
    setFormData({
      Type: "Allowance",
      Name: "",
      FormulaId: null,
      FixedValue: "",
    });
    setEditId(null);
    setDialogVisible(true);
  };

  // Open edit dialog
  const openEditDialog = (item) => {
    const selectedFormula = formulas.find((f) => f.Id === item.FormulaId);
    setFormData({
      Type: item.Type,
      Name: item.Name,
      FormulaId: item.FormulaId || null,
      FixedValue: selectedFormula.FixedValue || "",
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
    if (name === "FormulaId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number(value) : null,
      }));
      // Auto update fixed value from formula if exists
      const selectedFormula = formulas.find((f) => f.Id === Number(value));
      if (selectedFormula) {
        setFormData((prev) => ({
          ...prev,
          FixedValue:
            selectedFormula.FixedValue != null
              ? selectedFormula.FixedValue
              : "",
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!formData.Name.trim()) {
      alert("Name is required");
      return;
    }

    const nowIso = new Date().toISOString();

    const model = {
      ID: editId || 0,
      Type: formData.Type,
      Name: formData.Name,
      Property_ID: Number(propertyId),
      CreatedOn: nowIso,
      CreatedBy: 1,
      UpdatedOn: nowIso,
      UpdatedBy: 1,
      IsActive: true,
      FormulaId: formData.FormulaId,
      CalculatedAmount: 0,
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
          paddingBottom: 20,
        }}
      >
        {/* HEADER + ACTIONS */}
        <div
          className="d-flex justify-content-between align-items-center"
          style={{
            padding: "20px 28px 10px 28px",
            borderBottom: "1px solid #dee2e6",
          }}
        >
          <h2
            style={{
              fontWeight: "bold",
              fontSize: "2rem",
              margin: 0,
            }}
          >
            Allowance and Deduction
          </h2>

          <div className="d-flex align-items-center">
            <input
              type="text"
              className="form-control me-2"
              style={{
                maxWidth: 220,
                background: "#f8fafc",
                fontSize: 15,
                height: "38px",
              }}
              placeholder="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button
              className="btn btn-success d-flex align-items-center justify-content-center"
              style={{
                height: "38px",
                fontSize: 15,
                fontWeight: 500,
                padding: "0 18px",
                borderRadius: "6px",
                lineHeight: 1,
              }}
              onClick={openCreateDialog}
            >
              <i className="pi pi-plus me-2" style={{ fontSize: 14 }} />
              Create
            </button>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="table-responsive px-4 pb-4">
          {loading ? (
            <div style={{ textAlign: "center", padding: 20 }}>Loading...</div>
          ) : (
            <>
              <style>
                {`
                .uniform-table th:nth-child(1),
                .uniform-table td:nth-child(1) { width: 25%; }
                .uniform-table th:nth-child(2),
                .uniform-table td:nth-child(2) { width: 35%; }
                .uniform-table th:nth-child(3),
                .uniform-table td:nth-child(3) { width: 20%; text-align: center; }
                .uniform-table th:nth-child(4),
                .uniform-table td:nth-child(4) { width: 20%; text-align: center; }
              `}
              </style>

              {/* ALLOWANCES */}
              <h4
                style={{
                  marginTop: 25,
                  marginBottom: 12,
                  fontWeight: 600,
                  color: "#198754",
                }}
              >
                Allowances
              </h4>
              <table
                className="table table-bordered align-middle uniform-table"
                style={{
                  minWidth: 800,
                  tableLayout: "fixed",
                  borderCollapse: "collapse",
                }}
              >
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Formula</th>
                    <th>Fixed Value</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.filter((i) => i.Type === "Allowance").length ===
                  0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-3">
                        No Allowances Found.
                      </td>
                    </tr>
                  ) : (
                    filteredData
                      .filter((i) => i.Type === "Allowance")
                      .map((item) => (
                        <tr key={item.ID}>
                          <td>{item.Name}</td>
                          <td style={{ wordBreak: "break-word" }}>
                            {getFormulaDisplayById(item.FormulaId)}
                          </td>
                          <td>{getFixedValueById(item.FormulaId)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary me-2"
                              title="Edit"
                              onClick={() => openEditDialog(item)}
                            >
                              <i className="fa fa-pencil" />
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              title="Delete"
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

              {/* DEDUCTIONS */}
              <h4
                style={{
                  marginTop: 35,
                  marginBottom: 12,
                  fontWeight: 600,
                  color: "#dc3545",
                }}
              >
                Deductions
              </h4>
              <table
                className="table table-bordered align-middle uniform-table"
                style={{
                  minWidth: 800,
                  tableLayout: "fixed",
                  borderCollapse: "collapse",
                }}
              >
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Formula</th>
                    <th>Fixed Value</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.filter((i) => i.Type === "Deduction").length ===
                  0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-3">
                        No Deductions Found.
                      </td>
                    </tr>
                  ) : (
                    filteredData
                      .filter((i) => i.Type === "Deduction")
                      .map((item) => (
                        <tr key={item.ID}>
                          <td>{item.Name}</td>
                          <td style={{ wordBreak: "break-word" }}>
                            {getFormulaDisplayById(item.FormulaId)}
                          </td>
                          <td>{getFixedValueById(item.FormulaId)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary me-2"
                              title="Edit"
                              onClick={() => openEditDialog(item)}
                            >
                              <i className="fa fa-pencil" />
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              title="Delete"
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
            </>
          )}
        </div>

        {/* DIALOG INSIDE CARD */}
        <Dialog
          header={editId !== null ? "Edit Entry" : "Create New Entry"}
          visible={dialogVisible}
          style={{ width: "420px" }}
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
              <label htmlFor="formula" className="form-label">
                Formula
              </label>
              <select
                id="formula"
                name="FormulaId"
                className="form-select"
                value={formData.FormulaId || ""}
                onChange={handleFormChange}
              >
                <option value="">-- Select Formula --</option>
                {formulas.map((f) => (
                  <option key={f.Id} value={f.Id}>
                    {`${f.Name} -> ${f.Formula || ""}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="fixedValue" className="form-label">
                Fixed Value
              </label>
              <input
                type="text"
                id="fixedValue"
                name="FixedValue"
                className="form-control"
                value={formData.FixedValue}
                placeholder="Auto-filled from selected formula"
                readOnly
                style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
              />
            </div>
          </form>
        </Dialog>
      </div>
    </div>
  );
}
