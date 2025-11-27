import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Dialog } from "primereact/dialog";
import {
  getSalaryAllowancesByProperty,
  deleteSalaryAllowance,
  updateSalaryAllowance,
  createSalaryAllowance,
  getAllowanceDeductionsByProperty,
} from "../../Services/PayrollService";
import FormulaService from "../../Services/FormulaService";

export default function SalaryGroups() {
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alDtOptions, setAlDtOptions] = useState([]);
  const [alDtInput, setAlDtInput] = useState("");
  const [useFixedValue, setUseFixedValue] = useState(false);
  const [selectedType, setSelectedType] = useState("Allowance");
  const [selectedAllowancesDeductions, setSelectedAllowancesDeductions] =
    useState([]);
  const [formulas, setFormulas] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);

  const [formData, setFormData] = useState({
    ID: 0,
    SalaryGroup_ID: 0,
    SalaryGroup: "",
    FixedSalary: "",
    BaseSalary: "",
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

  // Derived state for functional logic
  const baseSalaryNum = Number(formData.BaseSalary);
  const isBaseActive = baseSalaryNum > 0;
  const canSelectType = true; // always allow selecting Allowance/Deduction
  const canShowTable =
    canSelectType && (selectedAllowancesDeductions.length > 0 || !isViewMode);
  const canCreate = isBaseActive;
  const filteredAlDtOptions = alDtOptions.filter(
    (opt) => opt.Type === selectedType
  );

  // Amount calculation utility
  const calculateAmount = (item, fixedSalary, baseSalary, knownValues = {}) => {
    if (!item.Formula) return 0;

    const formulaObj = item.Formula;
    const formulaStrRaw = formulaObj.Formula?.trim();
    if (!formulaStrRaw) return 0;

    // Replace known keywords (Basic, Fixed)
    let formulaStr = formulaStrRaw
      .replace(/\bBasic\b/gi, baseSalary || 0)
      .replace(/\bFixed\b/gi, fixedSalary || 0);

    // Replace already known calculated items
    Object.entries(knownValues).forEach(([key, val]) => {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedKey, "gi");
      formulaStr = formulaStr.replace(regex, val || 0);
    });

    try {
      const result = new Function("return " + formulaStr)();
      return typeof result === "number" && !isNaN(result) ? result : 0;
    } catch {
      return 0;
    }
  };

  const recalculateAmounts = (items, fixedSalary, baseSalary) => {
    const knownValues = {}; // to store already calculated allowances

    return items.map((item) => {
      const amount =
        item.UseFixedValue && item.Formula && item.Formula.FixedValue
          ? item.Formula.FixedValue
          : calculateAmount(item, fixedSalary, baseSalary, knownValues);

      // save this value for next formulas (like DA needs HRA)
      knownValues[item.Name] = amount;

      return { ...item, CalculatedAmount: amount };
    });
  };

  // Data loading utilities
  useEffect(() => {
    (async () => {
      if (!propertyId) return;
      setLoading(true);
      try {
        const salaryData = await getSalaryAllowancesByProperty(propertyId);
        setData(
          salaryData.map((group) => ({
            ...group,
            AllowancesDeductions: (group.AllowancesDeductions || []).map(
              (item) => ({
                ...item,
                AD_Id: item.AD_Id || item.ID,
                CalculatedAmount: item.CalculatedAmount || 0,
              })
            ),
          }))
        );
        const alDtData = await getAllowanceDeductionsByProperty(propertyId);
        setAlDtOptions(
          [...alDtData].sort((a, b) =>
            a.Type === b.Type ? 0 : a.Type === "Allowance" ? -1 : 1
          )
        );
        setFormulas((await FormulaService.getAllFormulas(propertyId)) || []);
      } catch {
        alert("Failed to load salary groups.");
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  // Edit, View, Create dialog handlers
  const openCreateDialog = () => {
    setFormData({
      ...formData,
      ID: 0,
      SalaryGroup_ID: 0,
      SalaryGroup: "",
      FixedSalary: "",
      BaseSalary: "",
      AllowancesDeductions: [],
    });
    setSelectedAllowancesDeductions([]);
    setAlDtInput("");
    setEditId(null);
    setIsViewMode(false);
    setUseFixedValue(false);
    setSelectedType("Allowance");
    setDialogVisible(true);
  };

  const openEditDialog = (item) => {
    const initialAllowances = (item.AllowancesDeductions || []).map((ad) => {
      let useFixedValue = false;
      if (
        ad.Formula &&
        ad.Formula.FixedValue &&
        ad.CalculatedAmount === ad.Formula.FixedValue
      )
        useFixedValue = true;
      return { ...ad, ID: ad.AD_Id || ad.ID, UseFixedValue: useFixedValue };
    });
    setFormData({
      ...item,
      FixedSalary: item.FixedSalary.toString(),
      BaseSalary: item.BaseSalary ? item.BaseSalary.toString() : "",
    });
    setSelectedAllowancesDeductions(
      recalculateAmounts(initialAllowances, +item.FixedSalary, +item.BaseSalary)
    );
    setAlDtInput("");
    setEditId(item.SalaryGroup_ID);
    setIsViewMode(false);
    setUseFixedValue(false);
    setSelectedType("Allowance");
    setDialogVisible(true);
  };

  const openViewDialog = (item) => {
    const initialAllowances = (item.AllowancesDeductions || []).map((ad) => {
      let useFixedValue = false;
      if (
        ad.Formula &&
        ad.Formula.FixedValue &&
        ad.CalculatedAmount === ad.Formula.FixedValue
      ) {
        useFixedValue = true;
      }
      return { ...ad, UseFixedValue: useFixedValue };
    });

    const recalculatedAD = recalculateAmounts(
      initialAllowances,
      Number(item.FixedSalary),
      Number(item.BaseSalary)
    );

    setFormData({
      ...item,
      FixedSalary: item.FixedSalary.toString(),
      BaseSalary: item.BaseSalary ? item.BaseSalary.toString() : "",
    });
    setSelectedAllowancesDeductions(recalculatedAD);
    setAlDtInput("");
    setEditId(item.SalaryGroup_ID);
    setIsViewMode(true);
    setSelectedType("Allowance");
    setDialogVisible(true);
  };

  // Form and dialog logic
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let updatedForm = { ...prev, [name]: value };

      let newFixed =
        name === "FixedSalary"
          ? Number(value)
          : Number(updatedForm.FixedSalary);
      let newBase =
        name === "BaseSalary" ? Number(value) : Number(updatedForm.BaseSalary);

      // Mutual exclusivity logic
      if (name === "FixedSalary" && Number(value) > 0) {
        updatedForm.BaseSalary = "";
      } else if (name === "BaseSalary" && Number(value) > 0) {
        updatedForm.FixedSalary = "";
      }

      newFixed = Number(updatedForm.FixedSalary);
      newBase = Number(updatedForm.BaseSalary);

      if (!isNaN(newFixed) && !isNaN(newBase)) {
        setSelectedAllowancesDeductions((prevAD) =>
          recalculateAmounts(prevAD, newFixed, newBase)
        );
      }

      return updatedForm;
    });
  };

  const handleAlDtInputChange = (e) => setAlDtInput(e.target.value);

  const addAlDtItem = () => {
    if (!alDtInput.trim()) return;
    const inputName = alDtInput.trim();
    const existingOption = alDtOptions.find(
      (opt) =>
        opt.Type === selectedType &&
        opt.Name.toLowerCase() === inputName.toLowerCase()
    );
    let matchedFormula = existingOption
      ? formulas.find(
          (f) => f.Name.toLowerCase() === existingOption.Name.toLowerCase()
        ) || null
      : formulas.find(
          (f) => f.Name.toLowerCase() === inputName.toLowerCase()
        ) || null;

    // ✅ Circular + dependency block START
    if (matchedFormula?.Formula) {
      const vars = extractVariables(matchedFormula.Formula);

      // ✅ Check self reference first
      if (vars.map((v) => v.toLowerCase()).includes(inputName.toLowerCase())) {
        alert(
          `Circular reference detected: Formula uses itself -> ${inputName}`
        );
        return;
      }

      const known = ["basic", "fixed"];
      const existingNames = selectedAllowancesDeductions.map((x) =>
        x.Name.toLowerCase()
      );

      const missing = vars.filter(
        (v) =>
          !known.includes(v.toLowerCase()) &&
          !existingNames.includes(v.toLowerCase())
      );

      if (missing.length > 0) {
        alert(
          `You must add these before "${inputName}": ` + missing.join(", ")
        );
        return;
      }
    }
    // ✅ Circular + dependency block END

    if (existingOption) {
      if (
        !selectedAllowancesDeductions.some(
          (item) => item.ID === existingOption.ID
        )
      ) {
        const newItem = {
          ...existingOption,
          Formula: matchedFormula,
          UseFixedValue: useFixedValue,
        };
        setSelectedAllowancesDeductions(
          recalculateAmounts(
            [...selectedAllowancesDeductions, newItem],
            0,
            +formData.BaseSalary
          )
        );
      }
    } else {
      const customItem = {
        ID: Date.now() * -1,
        Type: selectedType,
        Name: inputName,
        Percentage: 0,
        Property_ID: propertyId || 0,
        CreatedOn: new Date().toISOString(),
        CreatedBy: 1,
        UpdatedOn: new Date().toISOString(),
        UpdatedBy: 1,
        IsActive: true,
        CalculatedAmount: 0,
        Formula: matchedFormula,
        UseFixedValue: useFixedValue,
      };
      setSelectedAllowancesDeductions(
        recalculateAmounts(
          [...selectedAllowancesDeductions, customItem],
          0,
          +formData.BaseSalary
        )
      );
    }
    setAlDtInput("");
  };

  const handleDeleteAlDtItem = (id) =>
    setSelectedAllowancesDeductions((prev) =>
      prev.filter((item) => item.ID !== id)
    );

  const handleSave = async () => {
    const baseSalaryNum = Number(formData.BaseSalary);

    if (!formData.SalaryGroup.trim())
      return alert("Salary Group Name is required");

    // must have base salary
    if (
      formData.BaseSalary === "" ||
      isNaN(baseSalaryNum) ||
      baseSalaryNum < 0
    ) {
      return alert("Please enter Base Salary.");
    }

    // If NO allowances/deductions → treat base salary as fixed salary
    let finalFixed = 0;
    let finalBase = baseSalaryNum;

    if (
      !selectedAllowancesDeductions ||
      selectedAllowancesDeductions.length === 0
    ) {
      // no AD → base becomes fixed
      finalFixed = baseSalaryNum;
      finalBase = 0;
    } else {
      // at least one AD → use as normal base salary
      finalFixed = 0;
      finalBase = baseSalaryNum;
    }

    const nowIso = new Date().toISOString();
    const model = {
      ...formData,
      SalaryGroup_ID: editId || 0,
      FixedSalary: finalFixed,
      BaseSalary: finalBase,
      Property_ID: Number(propertyId),
      CreatedOn: formData.CreatedOn || nowIso,
      CreatedBy: formData.CreatedBy || 1,
      UpdatedOn: nowIso,
      UpdatedBy: 1,
      AllowancesDeductions: selectedAllowancesDeductions.map((item) => ({
        AD_Id: item.ID,
        Type: item.Type,
        Name: item.Name.trim(),
        CalculatedAmount: item.CalculatedAmount || 0,
        Formula: item.Formula
          ? formulas.find((f) => f.Id === item.Formula.Id) || null
          : null,
      })),
    };
    try {
      if (editId !== null) await updateSalaryAllowance(editId, model);
      else await createSalaryAllowance(model);
      alert(
        editId !== null ? "Updated successfully!" : "Created successfully!"
      );
      setDialogVisible(false);
      await getSalaryAllowancesByProperty(propertyId).then(setData);
    } catch (error) {
      alert("Failed to save salary group.");
    }
  };

  const allowances = selectedAllowancesDeductions.filter(
    (item) => item.Type === "Allowance"
  );
  const deductions = selectedAllowancesDeductions.filter(
    (item) => item.Type === "Deduction"
  );
  const maxRows = Math.max(allowances.length, deductions.length);
  const filteredData = data.filter(
    (item) =>
      item.SalaryGroup &&
      item.SalaryGroup.toLowerCase().includes(searchText.toLowerCase())
  );
  const handleDelete = async (salaryGroupId) => {
    if (window.confirm("Are you sure you want to delete this salary group?")) {
      try {
        await deleteSalaryAllowance(salaryGroupId);
        alert("Deleted successfully!");
        await getSalaryAllowancesByProperty(propertyId).then(setData);
      } catch {
        alert("Failed to delete salary group.");
      }
    }
  };

  const extractVariables = (formula) => {
    if (!formula) return [];

    // 1. Extract tokens properly (no junk tokens)
    const tokens =
      formula.match(/[A-Za-z][A-Za-z0-9_]*(?:\([A-Za-z0-9 _]*\))?/g) || [];

    // 2. Normalize extracted tokens
    const cleanedTokens = tokens.map((t) => t.trim().toLowerCase());

    // 3. Base Vars
    const baseVars = ["basic", "fixed"];

    // 4. Normalize valid names
    const cleanedValidNames = alDtOptions.map((opt) =>
      opt.Name.trim().toLowerCase()
    );

    // 5. Return only real matched items
    return cleanedTokens.filter(
      (t) => baseVars.includes(t) || cleanedValidNames.includes(t)
    );
  };

  // Dialog footers
  const viewFooter = (
    <button
      className="btn btn-secondary"
      onClick={() => setDialogVisible(false)}
    >
      Close
    </button>
  );
  const editFooter = (
    <>
      <button
        className="btn btn-secondary me-2"
        onClick={() => setDialogVisible(false)}
        type="button"
      >
        Cancel
      </button>
      <button
        className="btn btn-primary"
        onClick={handleSave}
        type="submit"
        disabled={!canCreate}
      >
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
                    Base Salary
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
                    <tr key={item.SalaryGroup_ID}>
                      <td style={{ verticalAlign: "middle" }}>
                        {item.SalaryGroup}
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        ₹ {item.FixedSalary.toLocaleString()}
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        ₹{" "}
                        {item.BaseSalary ? item.BaseSalary.toLocaleString() : 0}
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
      <Dialog
        header={
          isViewMode
            ? "View Salary Group"
            : editId !== null
            ? "Edit Salary Group"
            : "Create Salary Group"
        }
        visible={dialogVisible}
        style={{ width: "800px" }}
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
            <label className="form-label">Base Salary</label>
            <input
              type="number"
              name="BaseSalary"
              className="form-control"
              value={formData.BaseSalary}
              onChange={handleFormChange}
              placeholder="Enter base salary"
              min="0"
              step="0.01"
              required={true}
              disabled={isViewMode}
            />
          </div>

          {/* Only show select type and table if allowed by logic */}
          {!isViewMode && canSelectType && (
            <div className="mb-3">
              <div className="mb-2">
                <label className="form-label me-3">Select Type:</label>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="alDtType"
                    id="allowanceRadio"
                    value="Allowance"
                    checked={selectedType === "Allowance"}
                    onChange={() => setSelectedType("Allowance")}
                  />
                  <label className="form-check-label" htmlFor="allowanceRadio">
                    Allowance
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="alDtType"
                    id="deductionRadio"
                    value="Deduction"
                    checked={selectedType === "Deduction"}
                    onChange={() => setSelectedType("Deduction")}
                  />
                  <label className="form-check-label" htmlFor="deductionRadio">
                    Deduction
                  </label>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <input
                  list="alDtOptionsList"
                  id="alDtInput"
                  className="form-control"
                  value={alDtInput}
                  onChange={handleAlDtInputChange}
                  placeholder={`Select or type ${selectedType}`}
                  disabled={!canSelectType}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-success ms-2"
                  style={{ height: "38px", marginTop: "0" }}
                  onClick={addAlDtItem}
                  disabled={!canSelectType}
                >
                  Add
                </button>
                <div
                  className="form-check ms-3"
                  style={{ userSelect: "none", marginTop: 0 }}
                >
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="useFixedValueCheckbox"
                    checked={useFixedValue}
                    onChange={(e) => setUseFixedValue(e.target.checked)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="useFixedValueCheckbox"
                    style={{ fontSize: "14px" }}
                  >
                    Use Fixed Amount
                  </label>
                </div>
              </div>
              <datalist id="alDtOptionsList">
                {filteredAlDtOptions.map((opt) => {
                  const relatedFormula = formulas.find(
                    (f) => f.Name?.toLowerCase() === opt.Name?.toLowerCase()
                  );
                  const displayFormula = relatedFormula?.Formula
                    ? ` (${relatedFormula.Formula})`
                    : "";
                  return (
                    <option
                      key={opt.ID}
                      value={opt.Name}
                      label={`Formula = ${displayFormula}`}
                    />
                  );
                })}
              </datalist>
            </div>
          )}

          {(canShowTable || isViewMode) && (
            <div className="table-responsive mt-3">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th
                      colSpan={isViewMode ? 2 : 3}
                      style={{ textAlign: "center" }}
                    >
                      Allowance
                    </th>
                    <th
                      colSpan={isViewMode ? 2 : 3}
                      style={{ textAlign: "center" }}
                    >
                      Deduction
                    </th>
                  </tr>
                  <tr>
                    <th style={{ textAlign: "center" }}>Name</th>
                    <th style={{ textAlign: "center" }}>Amount</th>
                    {!isViewMode && (
                      <th style={{ textAlign: "center" }}>Action</th>
                    )}
                    <th style={{ textAlign: "center" }}>Name</th>
                    <th style={{ textAlign: "center" }}>Amount</th>
                    {!isViewMode && (
                      <th style={{ textAlign: "center" }}>Action</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(maxRows)].map((_, idx) => {
                    const allow = allowances[idx],
                      deduct = deductions[idx];
                    return (
                      <tr key={idx}>
                        <td style={{ textAlign: "center" }}>
                          {allow ? (
                            <>
                              <div>{allow.Name}</div>
                              {allow.Formula?.Formula && (
                                <div
                                  style={{ fontSize: "12px", color: "#6c757d" }}
                                >
                                  ({allow.Formula.Formula})
                                </div>
                              )}
                            </>
                          ) : (
                            ""
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {allow
                            ? Number(allow.CalculatedAmount).toFixed(2)
                            : ""}
                        </td>
                        {!isViewMode && (
                          <td style={{ textAlign: "center" }}>
                            {allow && (
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                title="Delete"
                                onClick={() => handleDeleteAlDtItem(allow.ID)}
                              >
                                <i className="fa fa-trash" aria-hidden="true" />
                              </button>
                            )}
                          </td>
                        )}
                        <td style={{ textAlign: "center" }}>
                          {deduct ? (
                            <>
                              <div>{deduct.Name}</div>
                              {deduct.Formula?.Formula && (
                                <div
                                  style={{ fontSize: "12px", color: "#6c757d" }}
                                >
                                  ({deduct.Formula.Formula})
                                </div>
                              )}
                            </>
                          ) : (
                            ""
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {deduct
                            ? Number(deduct.CalculatedAmount).toFixed(2)
                            : ""}
                        </td>
                        {!isViewMode && (
                          <td style={{ textAlign: "center" }}>
                            {deduct && (
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                title="Delete"
                                onClick={() => handleDeleteAlDtItem(deduct.ID)}
                              >
                                <i className="fa fa-trash" aria-hidden="true" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </form>
      </Dialog>
    </div>
  );
}
