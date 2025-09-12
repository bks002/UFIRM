import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Dialog } from "primereact/dialog";
import {
  getSalaryAllowancesByProperty,
  deleteSalaryAllowance,
  updateSalaryAllowance,
  createSalaryAllowance,
} from "../../Services/PayrollService";
import { getAllowanceDeductionsByProperty } from "../../Services/PayrollService";

export default function SalaryGroups() {
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Allowance & Deduction options
  const [alDtOptions, setAlDtOptions] = useState([]);
  const [alDtInput, setAlDtInput] = useState("");
  const [selectedAllowancesDeductions, setSelectedAllowancesDeductions] =
    useState([]);

  // Dialog and form state
  const [dialogVisible, setDialogVisible] = useState(false);
  const [formData, setFormData] = useState({
    ID: 0,
    SalaryGroup_ID: 0,
    SalaryGroup: "",
    FixedSalary: "",
    Property_ID: propertyId || 0,
    CreatedOn: "",
    CreatedBy: 0,
    UpdatedOn: "",
    UpdatedBy: 0,
    IsActive: true,
    AllowancesDeductions: [],
  });
  const [editId, setEditId] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // Load salary groups
  const loadData = async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const salaryData = await getSalaryAllowancesByProperty(propertyId);
      setData(salaryData);
    } catch (error) {
      alert("Failed to load salary groups.");
    } finally {
      setLoading(false);
    }
  };

  // Load allowance & deduction options
  const loadAlDtOptions = async () => {
    if (!propertyId) return;
    try {
      const alDtData = await getAllowanceDeductionsByProperty(propertyId);
      const sorted = [...alDtData].sort((a, b) => {
        if (a.Type === b.Type) return 0;
        if (a.Type === "Allowance") return -1;
        return 1;
      });
      setAlDtOptions(sorted);
    } catch (error) {
      console.error("Failed to load allowance/deduction options:", error);
    }
  };

  useEffect(() => {
    loadData();
    loadAlDtOptions();
  }, [propertyId]);

  // Create dialog
  const openCreateDialog = () => {
    setFormData({
      ID: 0,
      SalaryGroup_ID: 0,
      SalaryGroup: "",
      FixedSalary: "",
      Property_ID: propertyId || 0,
      CreatedOn: "",
      CreatedBy: 0,
      UpdatedOn: "",
      UpdatedBy: 0,
      IsActive: true,
      AllowancesDeductions: [],
    });
    setSelectedAllowancesDeductions([]);
    setAlDtInput("");
    setEditId(null);
    setIsViewMode(false);
    setDialogVisible(true);
  };

  // Edit dialog
  const openEditDialog = (item) => {
    setFormData({
      ...item,
      FixedSalary: item.FixedSalary.toString(),
    });
    setSelectedAllowancesDeductions(item.AllowancesDeductions || []);
    setAlDtInput("");
    setEditId(item.SalaryGroup_ID);
    setIsViewMode(false);
    setDialogVisible(true);
  };

  // View dialog
  const openViewDialog = (item) => {
    setFormData({
      ...item,
      FixedSalary: item.FixedSalary.toString(),
    });
    setSelectedAllowancesDeductions(item.AllowancesDeductions || []);
    setAlDtInput("");
    setEditId(item.SalaryGroup_ID);
    setIsViewMode(true);
    setDialogVisible(true);
  };

  // Filter data
  const filteredData = data.filter(
    (item) =>
      item.SalaryGroup &&
      item.SalaryGroup.toLowerCase().includes(searchText.toLowerCase())
  );

  // Delete salary group
  const handleDelete = async (salaryGroupId) => {
    if (window.confirm("Are you sure you want to delete this salary group?")) {
      try {
        await deleteSalaryAllowance(salaryGroupId);
        alert("Deleted successfully!");
        loadData();
      } catch (error) {
        alert("Failed to delete salary group.");
      }
    }
  };

  // Form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // AL/DT input change
  const handleAlDtInputChange = (e) => setAlDtInput(e.target.value);

  // Add AL/DT item
  const addAlDtItem = () => {
    if (!alDtInput.trim()) return;
    const existingOption = alDtOptions.find(
      (opt) =>
        `${opt.Type} - ${opt.Name}`.toLowerCase() ===
        alDtInput.trim().toLowerCase()
    );
    if (existingOption) {
      if (
        !selectedAllowancesDeductions.some(
          (item) => item.ID === existingOption.ID
        )
      ) {
        setSelectedAllowancesDeductions((prev) => [...prev, existingOption]);
      }
    } else {
      let type = "Allowance";
      let name = alDtInput.trim();
      const lower = alDtInput.toLowerCase();
      if (lower.startsWith("deduction")) type = "Deduction";
      else if (lower.startsWith("allowance")) type = "Allowance";
      const customItem = {
        ID: Date.now() * -1,
        Type: type,
        Name: name,
        Percentage: 0,
        Property_ID: propertyId || 0,
        CreatedOn: new Date().toISOString(),
        CreatedBy: 1,
        UpdatedOn: new Date().toISOString(),
        UpdatedBy: 1,
        IsActive: true,
      };
      setSelectedAllowancesDeductions((prev) => [...prev, customItem]);
    }
    setAlDtInput("");
  };

  // Delete AL/DT item
  const handleDeleteAlDtItem = (id) => {
    setSelectedAllowancesDeductions((prev) =>
      prev.filter((item) => item.ID !== id)
    );
  };

  // Save form (create/update)
  const handleSave = async () => {
    if (!formData.SalaryGroup.trim()) {
      alert("Salary Group Name is required");
      return;
    }
    const fixedSalaryNum = Number(formData.FixedSalary);
    if (
      formData.FixedSalary === "" ||
      isNaN(fixedSalaryNum) ||
      fixedSalaryNum < 0
    ) {
      alert("Valid Fixed Salary is required");
      return;
    }
    for (const item of selectedAllowancesDeductions) {
      if (
        item.Percentage === undefined ||
        item.Percentage === null ||
        isNaN(Number(item.Percentage)) ||
        Number(item.Percentage) < 0
      ) {
        alert(
          "All Allowance/Deduction items must have valid non-negative Percentage"
        );
        return;
      }
    }
    const nowIso = new Date().toISOString();
    const model = {
      ID: 0,
      SalaryGroup_ID: 0,
      SalaryGroup: formData.SalaryGroup.trim(),
      FixedSalary: fixedSalaryNum,
      Property_ID: Number(propertyId),
      CreatedOn: formData.CreatedOn || nowIso,
      CreatedBy: formData.CreatedBy || 1,
      UpdatedOn: nowIso,
      UpdatedBy: 1,
      IsActive: true,
      AllowancesDeductions: selectedAllowancesDeductions.map((item) => ({
        ID: item.ID > 0 ? item.ID : 0,
        Type: item.Type,
        Name: item.Name.trim(),
        Percentage: Number(item.Percentage),
      })),
    };
    try {
      if (editId !== null) {
        await updateSalaryAllowance(editId, model);
        alert("Updated successfully!");
      } else {
        await createSalaryAllowance(model);
        alert("Created successfully!");
      }
      setDialogVisible(false);
      loadData();
    } catch (error) {
      alert("Failed to save salary group.");
      console.error(error);
    }
  };

  // For view dialog: non-editable footer
  const viewFooter = (
    <button
      className="btn btn-secondary"
      onClick={() => setDialogVisible(false)}
    >
      Close
    </button>
  );

  // For edit/create dialog: normal footer
  const editFooter = (
    <>
      <button
        className="btn btn-secondary me-2"
        onClick={() => setDialogVisible(false)}
        type="button"
      >
        Cancel
      </button>
      <button className="btn btn-primary" onClick={handleSave} type="submit">
        Save
      </button>
    </>
  );

  // AL/DT percentage change
  const handleAlDtPercentageChange = (id, value) => {
    setSelectedAllowancesDeductions((prev) =>
      prev.map((item) =>
        item.ID === id ? { ...item, Percentage: value } : item
      )
    );
  };

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
          Salary Groups
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
            Create New
          </button>
        </div>

        <div className="table-responsive px-3 pb-4">
          {loading ? (
            <div style={{ textAlign: "center", padding: 20 }}>Loading...</div>
          ) : (
            <table className="table mb-0" style={{ minWidth: 650 }}>
              <thead>
                <tr>
                  <th style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                    Salary Group Name
                  </th>
                  <th style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                    Fixed Salary
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
                      colSpan={3}
                      className="text-center text-muted py-4"
                      style={{ fontSize: "1.05rem" }}
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.SalaryGroup_ID}>
                      <td style={{ verticalAlign: "middle" }}>
                        {item.SalaryGroup}
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        ₹ {item.FixedSalary.toLocaleString()}
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
                          className="btn btn-sm btn-info me-2"
                          title="View"
                          onClick={() => openViewDialog(item)}
                        >
                          <i className="fa fa-eye" aria-hidden="true" />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          title="Delete"
                          onClick={() => handleDelete(item.SalaryGroup_ID)}
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

      {/* Dialog */}
      <Dialog
        header={
          isViewMode
            ? "View Salary Group"
            : editId !== null
            ? "Edit Salary Group"
            : "Create Salary Group"
        }
        visible={dialogVisible}
        style={{ width: "600px" }}
        modal
        onHide={() => setDialogVisible(false)}
        footer={isViewMode ? viewFooter : editFooter}
        draggable={false}
        resizable={false}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isViewMode) handleSave();
          }}
        >
          <div className="mb-3">
            <label className="form-label">Salary Group Name</label>
            <input
              type="text"
              name="SalaryGroup"
              className="form-control"
              value={formData.SalaryGroup}
              onChange={handleFormChange}
              placeholder="Enter salary group name"
              required
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Fixed Salary</label>
            <input
              type="number"
              name="FixedSalary"
              className="form-control"
              value={formData.FixedSalary}
              onChange={handleFormChange}
              placeholder="Enter fixed salary"
              min="0"
              step="0.01"
              required
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          {/* Show AL/DT fields and Add button ONLY when not in view mode */}
          {!isViewMode && (
            <div className="mb-3">
              <label htmlFor="alDtInput" className="form-label">
                AL & DT Name (Allowances & Deductions)
              </label>
              <input
                list="alDtOptionsList"
                id="alDtInput"
                className="form-control"
                value={alDtInput}
                onChange={handleAlDtInputChange}
                placeholder="Select or type Allowance or Deduction"
              />
              <datalist id="alDtOptionsList">
                {alDtOptions.map((opt) => (
                  <option
                    key={opt.ID}
                    value={`${opt.Type} - ${opt.Name}`}
                    label={`${opt.Type} | ${opt.Name} | ${opt.Percentage}%`}
                  />
                ))}
              </datalist>
              <button
                type="button"
                className="btn btn-success mt-2"
                onClick={addAlDtItem}
              >
                Add
              </button>
            </div>
          )}

          {selectedAllowancesDeductions.length > 0 && (
            <div className="table-responsive mt-3">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Name</th>
                    <th style={{ width: "100px" }}>Percentage</th>
                    {!isViewMode && <th style={{ width: "60px" }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {selectedAllowancesDeductions.map((item) => (
                    <tr key={item.ID}>
                      <td>{item.Type}</td>
                      <td>{item.Name}</td>
                      <td>
                        {isViewMode ? (
                          item.Percentage
                        ) : (
                          <input
                            type="number"
                            className="form-control"
                            style={{ minWidth: "60px" }}
                            min="0"
                            step="0.01"
                            value={item.Percentage}
                            onChange={(e) =>
                              handleAlDtPercentageChange(
                                item.ID,
                                e.target.value
                              )
                            }
                          />
                        )}
                      </td>
                      {!isViewMode && (
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteAlDtItem(item.ID)}
                            title="Delete"
                          >
                            <i className="fa fa-trash" aria-hidden="true" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </form>
      </Dialog>
    </div>
  );
}
