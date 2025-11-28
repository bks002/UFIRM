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
import Formulaone from "../../ReactComponents/DataGrid/Formula1stdialogbox.jsx";
import { getPropertyById } from "../../Services/PropertyService";

export default function SalaryGroups() {
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alDtOptions, setAlDtOptions] = useState([]);
  const [selectedType, setSelectedType] = useState("Allowance");
  const [selectedAllowancesDeductions, setSelectedAllowancesDeductions] =
    useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [fxAvailableItems, setFxAvailableItems] = useState([]);

  const [formData, setFormData] = useState({
    ID: 0,
    SalaryGroup_ID: 0,
    SalaryGroup: "",
    BaseSalary: "",
    Property_ID: propertyId || 0,
    CreatedOn: "",
    CreatedBy: 0,
    UpdatedOn: "",
    UpdatedBy: 0,
    IsActive: true,
    TaxAmount: 0, // you can remove if not needed
    StartDate: "",
    EndDate: "",
    TotalWorkingDays: 0,
    ShiftHours: 0,
    AllowancesDeductions: [],
  });

  const [editId, setEditId] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [fxVisible, setFxVisible] = useState(false);
  const [fxTitle, setFxTitle] = useState("");
  const [fxTargetItem, setFxTargetItem] = useState(null); // the allowance/deduction row clicked

  const openFxFor = (row) => {
    const available = [
      {
        ID: -999,
        Name: "Base",
        Mode: "#",
        FixedAmount: Number(formData.BaseSalary || 0),
        CalculatedAmount: Number(formData.BaseSalary || 0),
      },
      ...selectedAllowancesDeductions.map((it) => ({
        ...it,
        FixedAmount: it.Mode === "#" ? Number(it.Value || 0) : 0,
        CalculatedAmount: Number(it.CalculatedAmount || 0),
      })),
    ];

    // REMOVE the current row from available list (common sense)
    const filtered = available.filter((a) => a.ID !== row.ID);

    setFxTargetItem(row);
    setFxTitle(row.Name);
    setFxVisible(true);
    setFxAvailableItems(filtered);
  };

  // Derived state for functional logic
  const baseSalaryNum = Number(formData.BaseSalary);
  const isBaseActive = baseSalaryNum > 0;
  const canCreate = isBaseActive;

  // Amount calculation utility
  const calculateAmount = (item, baseSalary, knownValues = {}) => {
    let formulaStrRaw = "";

    // NEW API → Formula is a string
    if (typeof item.Formula === "string") {
      formulaStrRaw = item.Formula.trim();
    }
    // OLD API fallback
    else if (item.Formula?.Formula) {
      formulaStrRaw = item.Formula.Formula.trim();
    }

    if (!formulaStrRaw) return 0;

    // Replace Base/Basic with numeric value
    let formulaStr = formulaStrRaw.replace(
      /\bBase\b|\bBasic\b/gi,
      baseSalary || 0
    );

    // Replace dependent values
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

  const recalculateAmounts = (items, _, baseSalary) => {
    // 1) Always compute in correct dependency order
    const sorted = [...items].sort((a, b) => {
      // Fx formulas last
      if (a.isFx && !b.isFx) return 1;
      if (!a.isFx && b.isFx) return -1;

      // Basic % or # first
      return 0;
    });

    const knownValues = {};

    const result = sorted.map((item) => {
      let amount = 0;

      if (item.isFx && item.Formula) {
        // Complex formula
        amount = calculateAmount(item, baseSalary, knownValues);
      } else if (item.Mode === "#") {
        amount = Number(item.Value || 0);
      } else if (item.Mode === "%") {
        const val = Number(item.Value || 0);
        amount = (val / 100) * baseSalary;
      }

      knownValues[item.Name] = amount;

      return { ...item, CalculatedAmount: amount };
    });

    return result;
  };

  // Data loading utilities
  useEffect(() => {
    (async () => {
      if (!propertyId) return;

      setLoading(true);
      try {
        // 1. GET Salary Groups
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

        // 2. GET Allowance + Deduction master list
        const alDtData = await getAllowanceDeductionsByProperty(propertyId);
        setAlDtOptions(
          [...alDtData].sort((a, b) =>
            a.Type === b.Type ? 0 : a.Type === "Allowance" ? -1 : 1
          )
        );

        // 3. GET Property values (Shift hours + Working days)
        const propertyData = await getPropertyById(propertyId);
        setFormData((prev) => ({
          ...prev,
          ShiftHours: propertyData.ShiftHours || 0,
          TotalWorkingDays: propertyData.TotalWorkingDays || 0,
        }));
      } catch (error) {
        console.error(error);
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
      BaseSalary: "",
      AllowancesDeductions: [],
    });
    setSelectedAllowancesDeductions([]);
    setEditId(null);
    setIsViewMode(false);
    setSelectedType("Allowance");
    setDialogVisible(true);
  };

  const openEditDialog = (item) => {
    const initialAllowances = (item.AllowancesDeductions || []).map((ad) => {
      let mode = "%";
      let value = "";

      // FIX: Normalize Formula
      const rawFormula =
        typeof ad.Formula === "string" ? ad.Formula : ad.Formula?.Formula || "";

      // Determine mode + value
      if (rawFormula !== "") {
        // % mode
        const match = rawFormula.match(/\*\s*(\d+(\.\d+)?)/);
        const decimal = match ? parseFloat(match[1]) : 0;
        value = (decimal * 100).toString(); // convert 0.10 → 10
        mode = "%";
      } else if (ad.FixedAmount > 0) {
        // # mode
        mode = "#";
        value = ad.FixedAmount.toString();
      }

      return {
        ...ad,
        ID: ad.AD_Id || ad.ID,
        Mode: mode,
        Value: value,
        Formula: rawFormula,
        FormulaId: ad.FormulaId || 0,
        CalculatedAmount: 0,
        isFx: rawFormula !== "" && !rawFormula.startsWith("Base *"), // 🔥 detect Fx formula
      };
    });
    setFormData({
      ...item,
      BaseSalary: item.BaseSalary ? item.BaseSalary.toString() : "",
      TotalWorkingDays: item.TotalWorkingDays || 0,
      ShiftHours: item.ShiftHours || 0,
    });
    setSelectedAllowancesDeductions(
      recalculateAmounts(initialAllowances, 0, Number(item.BaseSalary))
    );
    setEditId(item.SalaryGroup_ID);
    setIsViewMode(false);
    setSelectedType("Allowance");
    setDialogVisible(true);
  };

  const openViewDialog = (item) => {
    const initialAllowances = (item.AllowancesDeductions || []).map((ad) => {
      let mode = "%";
      let value = "";

      // CASE 1: Percentage mode
      // FIX: Normalize Formula
      const rawFormula =
        typeof ad.Formula === "string" ? ad.Formula : ad.Formula?.Formula || "";

      // Determine mode + value
      if (rawFormula !== "") {
        const match = rawFormula.match(/\*\s*(\d+(\.\d+)?)/);
        const decimal = match ? parseFloat(match[1]) : 0;
        value = (decimal * 100).toString();
        mode = "%";
      } else if (ad.FixedAmount > 0) {
        mode = "#";
        value = ad.FixedAmount.toString();
      }

      return {
        ...ad,
        ID: ad.AD_Id || ad.ID,
        Mode: mode,
        Value: value,
        Formula: rawFormula,
        FormulaId: ad.FormulaId || 0,
        CalculatedAmount: 0, // THIS FIXES PF
        isFx: rawFormula !== "" && !rawFormula.startsWith("Base *"),
      };
    });

    const recalculatedAD = recalculateAmounts(
      initialAllowances,
      0,
      Number(item.BaseSalary)
    );

    setFormData({
      ...item,
      BaseSalary: item.BaseSalary ? item.BaseSalary.toString() : "",
      TotalWorkingDays: item.TotalWorkingDays || 0,
      ShiftHours: item.ShiftHours || 0,
    });

    setSelectedAllowancesDeductions(recalculatedAD);
    setIsViewMode(true);
    setDialogVisible(true);
  };

  // Form and dialog logic
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "BaseSalary") {
      const newBase = Number(value);
      setSelectedAllowancesDeductions((prev) =>
        recalculateAmounts(prev, 0, newBase)
      );
    }
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

    const nowIso = new Date().toISOString();
    const model = {
      SalaryGroup_ID: editId || 0,
      SalaryGroup: formData.SalaryGroup.trim(),
      BaseSalary: Number(formData.BaseSalary),
      Property_ID: Number(propertyId),
      CreatedBy: formData.CreatedBy || 1,
      UpdatedBy: 1,
      CreatedOn: formData.CreatedOn || nowIso,
      UpdatedOn: nowIso,
      IsActive: true,
      TaxAmount: 0,
      StartDate: nowIso,
      EndDate: nowIso,
      TotalWorkingDays: Number(formData.TotalWorkingDays || 0),
      ShiftHours: Number(formData.ShiftHours || 0),
      AllowancesDeductions: selectedAllowancesDeductions.map((item) => {
        let FixedAmount = 0;
        let Formula = "";
        let CalculatedAmount = 0;

        // If Fx applied → trust the Fx values
        if (item.isFx && item.Formula) {
          Formula = item.Formula; // full formula like (Base + HRA + Leave) * 0.12
          CalculatedAmount = Number(item.CalculatedAmount || 0);
        } else {
          // Normal manual % or #
          const mode = item.Mode || "%";
          const val = Number(item.Value || 0);

          if (mode === "%") {
            const decimal = (val / 100).toFixed(2);
            Formula = `Base * ${decimal}`;
            CalculatedAmount = (
              (val / 100) *
              Number(formData.BaseSalary)
            ).toFixed(2);
          } else {
            FixedAmount = val;
            Formula = "";
            CalculatedAmount = 0;
          }
        }

        return {
          AD_Id: item.ID,
          Type: item.Type,
          Name: item.Name.trim(),
          FixedAmount: Number(FixedAmount),
          Formula: Formula,
          FormulaId: item.FormulaId || 0,
          CalculatedAmount: Number(CalculatedAmount),
        };
      }),
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
                        ₹ {(Number(item.BaseSalary) || 0).toLocaleString()}
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
            : editId
            ? "Edit Salary Group"
            : "Create Salary Group"
        }
        visible={dialogVisible}
        style={{ width: "850px" }}
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
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Total Working Days</label>
              <input
                type="number"
                step="0.01"
                name="TotalWorkingDays"
                className="form-control"
                value={formData.TotalWorkingDays || ""}
                onChange={handleFormChange}
                placeholder="Total working days"
                disabled={isViewMode}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Shift Hours</label>
              <input
                type="number"
                step="0.01"
                name="ShiftHours"
                className="form-control"
                value={formData.ShiftHours || ""}
                onChange={handleFormChange}
                placeholder="Shift hours"
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Salary Group Name */}
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
            />
          </div>

          {/* Base Salary */}
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
              required
              disabled={isViewMode}
            />
          </div>

          {/* VIEW MODE TABLE */}
          {isViewMode && (
            <div className="table-responsive mt-3">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th style={{ textAlign: "center" }}>Allowance</th>
                    <th style={{ textAlign: "center" }}>Amount</th>
                    <th style={{ textAlign: "center" }}>Deduction</th>
                    <th style={{ textAlign: "center" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(maxRows)].map((_, idx) => {
                    const allow = allowances[idx];
                    const deduct = deductions[idx];

                    return (
                      <tr key={idx}>
                        <td>
                          {allow ? (
                            <>
                              <div>{allow.Name}</div>
                              {allow.Formula && (
                                <div
                                  style={{ fontSize: "12px", color: "#6c757d" }}
                                >
                                  ({allow.Formula})
                                </div>
                              )}
                            </>
                          ) : (
                            ""
                          )}
                        </td>

                        <td style={{ textAlign: "right" }}>
                          {allow
                            ? Number(
                                allow.FixedAmount > 0
                                  ? allow.FixedAmount
                                  : allow.CalculatedAmount
                              ).toFixed(2)
                            : ""}
                        </td>

                        <td>
                          {deduct ? (
                            <>
                              <div>{deduct.Name}</div>
                              {deduct.Formula && (
                                <div
                                  style={{ fontSize: "12px", color: "#6c757d" }}
                                >
                                  ({deduct.Formula})
                                </div>
                              )}
                            </>
                          ) : (
                            ""
                          )}
                        </td>

                        <td style={{ textAlign: "right" }}>
                          {deduct
                            ? Number(
                                deduct.FixedAmount > 0
                                  ? deduct.FixedAmount
                                  : deduct.CalculatedAmount
                              ).toFixed(2)
                            : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TYPE SELECTOR */}
          {!isViewMode && (
            <div className="mb-3">
              <label className="form-label">Select Type:</label>
              <div className="d-flex align-items-center mt-1">
                <div className="form-check me-4">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="typeRadio"
                    id="allowanceTypeBtn"
                    checked={selectedType === "Allowance"}
                    onChange={() => setSelectedType("Allowance")}
                  />
                  <label
                    htmlFor="allowanceTypeBtn"
                    className="form-check-label"
                  >
                    Allowance
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="typeRadio"
                    id="deductionTypeBtn"
                    checked={selectedType === "Deduction"}
                    onChange={() => setSelectedType("Deduction")}
                  />
                  <label
                    htmlFor="deductionTypeBtn"
                    className="form-check-label"
                  >
                    Deduction
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* LIST OF ALLOWANCE OR DEDUCTION ITEMS */}
          {!isViewMode && (
            <div
              className="p-3"
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                maxHeight: "270px",
                overflowY: "auto",
                position: "relative",
              }}
            >
              {alDtOptions
                .filter((opt) => opt.Type === selectedType)
                .map((opt) => {
                  const isChecked = selectedAllowancesDeductions.some(
                    (item) => item.ID === opt.ID
                  );

                  const row = selectedAllowancesDeductions.find(
                    (x) => x.ID === opt.ID
                  );
                  const mode = row?.Mode || "%";
                  const val = Number(row?.Value || 0);

                  let calc = "";

                  if (row?.Formula) {
                    // When Fx is used → use calculatedAmount from state
                    calc = Number(row.CalculatedAmount || 0).toFixed(2);
                  } else if (mode === "%") {
                    // Normal % mode
                    calc = (
                      (val / 100) *
                      Number(formData.BaseSalary || 0)
                    ).toFixed(2);
                  } else {
                    // Fixed mode
                    calc = val;
                  }

                  return (
                    <div
                      key={opt.ID}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "18px",
                        padding: "12px 12px",
                        paddingLeft: "18px",
                        borderBottom: "1px solid #efefef",
                      }}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        className="form-check-input"
                        style={{ marginTop: 3 }}
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            const base = Number(formData.BaseSalary || 0);

                            const newItem = {
                              ...opt,
                              Formula: "",
                              UseFixedValue: false,
                              Mode: "%",
                              Value: "",
                              CalculatedAmount: null, // 🔥 FIXED
                            };
                            setSelectedAllowancesDeductions((prev) =>
                              recalculateAmounts(
                                [...prev, newItem],
                                0,
                                Number(formData.BaseSalary)
                              )
                            );
                          } else {
                            handleDeleteAlDtItem(opt.ID);
                          }
                        }}
                      />

                      {/* Name */}
                      <div style={{ width: "200px", fontWeight: 500 }}>
                        {opt.Name}
                      </div>

                      {/* Mode */}
                      <div
                        style={{
                          position: "relative",
                          width: "70px",
                        }}
                      >
                        <select
                          disabled={!isChecked || row?.isFx}
                          className="form-control"
                          value={mode}
                          onChange={(e) => {
                            const newMode = e.target.value;
                            setSelectedAllowancesDeductions((prev) =>
                              prev.map((item) =>
                                item.ID === opt.ID
                                  ? { ...item, Mode: newMode, Value: "" }
                                  : item
                              )
                            );
                          }}
                          style={{
                            appearance: "none",
                            WebkitAppearance: "none",
                            MozAppearance: "none",
                            paddingRight: "20px",
                            cursor: "pointer",
                          }}
                        >
                          <option value="%">%</option>
                          <option value="#">#</option>
                        </select>

                        {/* ▼ arrow */}
                        <div
                          style={{
                            position: "absolute",
                            right: "8px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            fontSize: "10px",
                            color: "#333",
                          }}
                        >
                          ▼
                        </div>
                      </div>

                      {/* Value box with formula below */}
                      <div style={{ width: "120px" }}>
                        <input
                          type="number"
                          disabled={!isChecked || row?.isFx}
                          className="form-control"
                          value={row?.Value || ""}
                          onChange={(e) => {
                            let raw = e.target.value;

                            if (mode === "%" && (raw < 0 || raw > 100)) return;

                            const base = Number(formData.BaseSalary || 0);

                            setSelectedAllowancesDeductions((prev) => {
                              // 1. update ONLY this row first
                              const updated = prev.map((item) =>
                                item.ID === opt.ID
                                  ? {
                                      ...item,
                                      Value: raw,
                                    }
                                  : item
                              );

                              // 2. RE-CALCULATE ALL rows (this fixes PF etc)
                              return recalculateAmounts(updated, 0, base);
                            });
                          }}
                        />

                        {/* Formula under box */}
                        {/* If Fx formula exists, show it. 
    Else show normal Base * % formula */}
                        {isChecked && row?.Formula ? (
                          <div
                            style={{
                              fontSize: "10px",
                              color: "#7d7d7d",
                              marginTop: "3px",
                              marginLeft: "2px",
                            }}
                          >
                            {row.Formula}
                          </div>
                        ) : (
                          mode === "%" &&
                          isChecked && (
                            <div
                              style={{
                                fontSize: "10px",
                                color: "#7d7d7d",
                                marginTop: "3px",
                                marginLeft: "2px",
                              }}
                            >
                              Base * {(val / 100).toFixed(2)}
                            </div>
                          )
                        )}
                      </div>

                      {/* Calculated */}
                      <input
                        className="form-control"
                        style={{
                          width: "120px",
                          background: "#f4f4f4",
                          textAlign: "right",
                        }}
                        value={isChecked ? calc : ""}
                        readOnly
                      />

                      {/* Fx */}
                      <button
                        type="button"
                        className={`btn ${
                          row?.isFx ? "btn-primary" : "btn-outline-secondary"
                        }`}
                        style={{ width: "55px", fontWeight: 600 }}
                        disabled={!isChecked}
                        onClick={() => openFxFor(row)}
                      >
                        Fx
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </form>
        <Formulaone
          visible={fxVisible}
          onClose={() => setFxVisible(false)}
          title={fxTitle}
          baseSalary={Number(formData.BaseSalary || 0)}
          items={fxAvailableItems} // we will define fxAvailable next
          onApply={(res) => {
            // Update only the clicked row
            setSelectedAllowancesDeductions((prev) =>
              prev.map((it) =>
                it.ID === fxTargetItem.ID
                  ? {
                      ...it,
                      Formula: res.formulaString,
                      CalculatedAmount: res.calculatedAmount,
                      Mode: "%", // lock to percent mode
                      Value: res.usedValue, // NEW: store the percentage user typed
                      FixedAmount: 0,
                      isFx: true, // NEW: mark row as “Fx applied”
                    }
                  : it
              )
            );
            setFxVisible(false);
          }}
        />
      </Dialog>
    </div>
  );
}
