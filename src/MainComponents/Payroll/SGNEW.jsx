import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getSalaryAllowancesByProperty,
  getAllowanceDeductionsByProperty,
  createSalaryAllowance,
  updateSalaryAllowance,
  getADPercentages,
} from "../../Services/PayrollService";
import { getPropertyById } from "../../Services/PropertyService";

export default function SGNEW() {
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  const [salaryGroups, setSalaryGroups] = useState([]);
  const [adList, setAdList] = useState([]);
  const [adPercentages, setAdPercentages] = useState([]);
  const [activeDeduction, setActiveDeduction] = useState(null);
  const [allowanceAmounts, setAllowanceAmounts] = useState({});
  const [deductionAmounts, setDeductionAmounts] = useState({});
  const [loadingSG, setLoadingSG] = useState(false);
  const [deductionAllowanceMap, setDeductionAllowanceMap] = useState({});
  const [allowanceSelected, setAllowanceSelected] = useState({});
  const [calculatedAD, setCalculatedAD] = useState({});
  const [adFormula, setAdFormula] = useState({});
  const [selectedSG, setSelectedSG] = useState("");
  const [deductionFormulaMap, setDeductionFormulaMap] = useState({});
  const [odDoubleFlags, setOdDoubleFlags] = useState({});
  const [multiplyValues, setMultiplyValues] = useState({});
  const [showMultiplier, setShowMultiplier] = useState({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [form, setForm] = useState({
    salaryGroupName: "",
    baseSalary: "",
    totalWorkingDays: "",
    shiftHours: "",
  });

  const [propertyDefaults, setPropertyDefaults] = useState({
    totalWorkingDays: "",
    shiftHours: "",
  });

  useEffect(() => {
    if (!propertyId) return;
    loadPropertyInfo();
    loadSG();
    loadAD();
  }, [propertyId]);

  useEffect(() => {
    loadADPercentages();
  }, []);

  useEffect(() => {
    if (!activeDeduction) return;

    setAllowanceSelected(deductionAllowanceMap[activeDeduction] || {});
  }, [activeDeduction]);

  useEffect(() => {
    if (!activeDeduction) return;

    // Load checkbox selections for this deduction
    setAllowanceSelected(deductionAllowanceMap[activeDeduction] || {});

    // Load saved formula if present
    if (deductionFormulaMap[activeDeduction]) {
      setAdFormula((prev) => ({
        ...prev,
        [activeDeduction]: deductionFormulaMap[activeDeduction],
      }));
    }
  }, [activeDeduction]);

  useEffect(() => {
    if (!activeDeduction) return;
    if (loadingSG) return;

    const deductionObj =
      deductions.find((x) => x.Name === activeDeduction) ||
      otherDeductions.find((x) => x.Name === activeDeduction);

    // Recalculate ONLY when checkbox selection changes
    handleDeductionSelect(deductionObj);
  }, [allowanceSelected]);

  useEffect(() => {
    if (!activeDeduction) return;

    const deductionObj =
      deductions.find((x) => x.Name === activeDeduction) ||
      otherDeductions.find((x) => x.Name === activeDeduction);

    handleDeductionSelect(deductionObj);
  }, [allowanceSelected, allowanceAmounts, form.baseSalary]);

  useEffect(() => {
    if (!salaryGroups.length || !adList.length) return;

    const sg = salaryGroups.find((s) => s.SalaryGroup === form.salaryGroupName);
    if (!sg) return;

    let newDeductions = {};

    sg.AllowancesDeductions.forEach((ad) => {
      if ((ad.Type === "D" || ad.Type === "OD") && ad.FixedAmount > 0) {
        newDeductions[ad.Name] = ad.FixedAmount;
      }
      if (ad.CalculatedAmount > 0) {
        newDeductions[ad.Name] = ad.CalculatedAmount;
      }
    });

    setDeductionAmounts((prev) => ({ ...prev, ...newDeductions }));
  }, [adList]);

  const buildADModel = () => {
    let list = [];

    adList.forEach((item) => {
      const name = item.Name;

      let fixed = 0;
      let calculated = 0;

      if (item.Type === "D" || item.Type === "OD") {
        // If we have a formula OR the calculated flag, treat as calculated
        if (calculatedAD[name] || (adFormula && adFormula[name])) {
          calculated = deductionAmounts[name] || 0;
        } else {
          fixed = deductionAmounts[name] || 0;
        }
      } else {
        fixed = allowanceAmounts[name] || 0;
      }

      // Special case: OTAmount should always be included if selected
      if (name === "OTAmount" && allowanceSelected["OTAmount"]) {
        list.push({
          AD_Id: item.ID,
          Name: name,
          Type: item.Type,
          FixedAmount: 0,
          IsDouble: odDoubleFlags[name] || false,
          MultiplyValue: multiplyValues[name] || null,
          Formula: null,
          FormulaId: null,
          CalculatedAmount: 0,
        });
        return;
      }

      // Allowances (A, OA) should ALWAYS be included if fixed amount > 0
      if (item.Type !== "D" && item.Type !== "OD") {
        if (fixed === 0) return; // HRA = 0 means user didn't enter any value
      } else {
        // Deduction filtering
        if (
          !calculatedAD[name] &&
          !(adFormula[name] && deductionFormulaMap[name])
        )
          return;
      }

      list.push({
        AD_Id: item.ID,
        Name: name,
        Type: item.Type,
        FixedAmount: fixed,
        Formula: adFormula[name] || null,
        FormulaId: null,
        CalculatedAmount: calculated,
        IsDouble: odDoubleFlags[name] || false,
      });
    });

    return list;
  };

  const handleAllowanceAmount = (name, value) => {
    setAllowanceAmounts((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleDeductionSelect = (deduction, isPreview = false) => {
    if (!deduction) return;

    const name = deduction.Name;
    const percentObj = adPercentages.find((x) => x.AD_Name === name);
    const percentage = percentObj ? percentObj.Percentage : 0;

    const base = Number(form.baseSalary) || 0;

    let total = base;
    let formulaParts = ["Base"];

    Object.keys(allowanceSelected).forEach((key) => {
      if (allowanceSelected[key]) {
        const value = Number(allowanceAmounts[key]) || 0;
        total += value;
        formulaParts.push(key);
      }
    });

    const rawAmount = total * (percentage / 100);
    const amount = Math.round(rawAmount);

    const formulaString =
      formulaParts.length === 1
        ? `Base * ${percentage / 100}`
        : `(${formulaParts.join(" + ")}) * ${percentage / 100}`;

    // 🟢 PREVIEW MODE: show preview but do NOT save real data
    if (isPreview) {
      setDeductionAmounts((prev) => ({
        ...prev,
        [name]: amount,
      }));

      setAdFormula((prev) => ({
        ...prev,
        [name]: formulaString,
      }));

      return;
    }

    // 🟢 REAL MODE: user clicked radio
    setCalculatedAD((prev) => ({
      ...prev,
      [name]: true,
    }));

    setDeductionAmounts((prev) => ({
      ...prev,
      [name]: amount,
    }));

    setDeductionFormulaMap((prev) => ({
      ...prev,
      [name]: formulaString,
    }));

    setAdFormula((prev) => ({
      ...prev,
      [name]: formulaString,
    }));
  };

  const loadADPercentages = async () => {
    try {
      const res = await getADPercentages();
      setAdPercentages(res);
    } catch (err) {
      console.log("Failed to fetch AD Percentages:", err);
    }
  };

  const loadAD = async () => {
    try {
      const res = await getAllowanceDeductionsByProperty();
      setAdList(res);
    } catch (err) {
      console.log("Failed to fetch AD:", err);
    }
  };

  const cleanList = adList; // DO NOT REMOVE DUPLICATES
  const allowances = cleanList.filter((x) => x.Type === "A");
  const deductions = cleanList.filter((x) => x.Type === "D");
  const otherAllowances = cleanList.filter((x) => x.Type === "OA");
  const otherDeductions = cleanList.filter((x) => x.Type === "OD");

  const loadSG = async () => {
    try {
      const res = await getSalaryAllowancesByProperty(propertyId);
      setSalaryGroups(res);
    } catch (err) {
      console.log("Failed to fetch SG:", err);
    }
  };

  const loadPropertyInfo = async () => {
    try {
      const res = await getPropertyById(propertyId);

      const twd = res.TotalWorkingDays || "";
      const sh = res.ShiftHours || "";

      // store defaults
      setPropertyDefaults({
        totalWorkingDays: twd,
        shiftHours: sh,
      });

      // update form initially
      setForm((prev) => ({
        ...prev,
        totalWorkingDays: twd,
        shiftHours: sh,
      }));
    } catch (err) {
      console.log("Failed to fetch property:", err);
    }
  };

  const handleDropdownSelect = (sg) => {
    if (!sg) return;

    setLoadingSG(true);

    // 1. Fill main fields
    setForm({
      salaryGroupName: sg.SalaryGroup,
      baseSalary: sg.BaseSalary,
      totalWorkingDays: sg.TotalWorkingDays,
      shiftHours: sg.ShiftHours,
    });

    // 2. Prepare maps
    let newAllowances = {};
    let newDeductions = {};
    let calcFlags = {};
    let formulas = {};
    let active = null;

    // 3. Read Allowances + Deductions from API model
    sg.AllowancesDeductions.forEach((ad) => {
      const name = ad.Name;

      // CASE 1: Calculated Amount exists → this AD was percentage-based
      if (ad.CalculatedAmount && ad.CalculatedAmount > 0) {
        newDeductions[name] = ad.CalculatedAmount;
        calcFlags[name] = true;
        if (ad.Formula) formulas[name] = ad.Formula;
        active = name; // last active deduction
        return;
      }

      // CASE 2: Fixed Amount exists → this AD was manual / allowance
      if (ad.FixedAmount && ad.FixedAmount > 0) {
        if (ad.Type === "A" || ad.Type === "OA") {
          newAllowances[name] = ad.FixedAmount;
        } else {
          newDeductions[name] = ad.FixedAmount;
        }
      }
    });

    // 4. Set UI states
    setAllowanceSelected({}); // allow user to choose allowance afresh
    setAllowanceAmounts(newAllowances);
    setDeductionAmounts(newDeductions);
    setCalculatedAD(calcFlags); // RESTORE calculated flags
    setAdFormula(formulas); // RESTORE formulas
    setActiveDeduction(null); // keep all radios unchecked

    setTimeout(() => setLoadingSG(false), 100);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const adModel = buildADModel();

      const isUpdate = salaryGroups.some(
        (sg) => sg.SalaryGroup === form.salaryGroupName
      );

      const model = {
        SalaryGroup_ID: isUpdate
          ? salaryGroups.find((sg) => sg.SalaryGroup === form.salaryGroupName)
              .SalaryGroup_ID
          : 0,

        SalaryGroup: form.salaryGroupName,
        BaseSalary: Number(form.baseSalary),
        Property_ID: propertyId,
        TotalWorkingDays: Number(form.totalWorkingDays),
        ShiftHours: Number(form.shiftHours),
        AllowancesDeductions: adModel,
        CreatedBy: 1,
        UpdatedBy: 1,
        IsActive: true,
      };

      if (isUpdate) {
        const id = model.SalaryGroup_ID;
        await updateSalaryAllowance(id, model);
        alert("Salary group updated!");
      } else {
        await createSalaryAllowance(model);
        alert("Salary group created!");
      }

      // IMPORTANT FIX
      await loadSG(); // <-- reload SG list so formulas update immediately
      // reset ONLY when save succeeds
      resetSalaryGroupForm();
    } catch (err) {
      alert("Save failed! Check console.");
      console.log(err);
    }
  };

  // SUM OF ALLOWANCES (A + OA)
  const totalAllowance = Object.keys(allowanceAmounts)
    .filter((key) => Number(allowanceAmounts[key]) > 0)
    .reduce((sum, key) => sum + Number(allowanceAmounts[key]), 0);

  // SUM OF ALL DEDUCTIONS (D + OD)
  const totalDeduction = Object.keys(deductionAmounts).reduce(
    (sum, key) => sum + (Number(deductionAmounts[key]) || 0),
    0
  );

  // GROSS = BASE + ALLOWANCES
  const totalGross = (Number(form.baseSalary) || 0) + totalAllowance;

  // NET PAY
  const netPay = totalGross - totalDeduction;

  const SalarySummaryBox = () => (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: "8px 12px", // much smaller
        background: "#fff",
        marginTop: 15,
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 16,
          fontWeight: 600,
          color: "#2a4365",
        }}
      >
        {/* Gross */}
        <div style={{ flex: 1 }}>
          Total Gross ={" "}
          <span style={{ color: "#000" }}>₹ {totalGross.toFixed(2)}</span>
        </div>

        {/* Deduction */}
        <div style={{ flex: 1, textAlign: "center" }}>
          Total Deduction ={" "}
          <span style={{ color: "#000" }}>₹ {totalDeduction.toFixed(2)}</span>
        </div>

        {/* Net Pay */}
        <div style={{ flex: 1, textAlign: "right" }}>
          Net Pay ={" "}
          <span style={{ color: "#2b6cb0" }}>₹ {netPay.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  const resetSalaryGroupForm = () => {
    setForm({
      salaryGroupName: "",
      baseSalary: "",
      totalWorkingDays: propertyDefaults.totalWorkingDays,
      shiftHours: propertyDefaults.shiftHours,
    });

    setAllowanceSelected({});
    setAllowanceAmounts({});
    setDeductionAmounts({});
    setActiveDeduction(null);
    setCalculatedAD({});
    setAdFormula({});
    setSelectedSG("");
    setOdDoubleFlags({});
    setMultiplyValues({});
  };

  const allowOnlyNumbers = (e) => {
    const value = e.target.value;

    if (/^\d*\.?\d*$/.test(value)) {
      setForm({ ...form, [e.target.name]: value });

      if (e.target.name === "baseSalary") {
        setIsPreviewMode(true);
      }
    }
  };

  useEffect(() => {
    if (!isPreviewMode) return;

    [...deductions, ...otherDeductions].forEach((d) => {
      handleDeductionSelect(d, true); // <-- PREVIEW MODE TRUE
    });
  }, [form.baseSalary]);

  const handleRefreshSelections = () => {
    // Unselect any deduction radio
    setActiveDeduction(null);

    // Clear selected allowances (but DO NOT touch allowanceAmounts)
    setAllowanceSelected({});

    // Clear selected allowance mapping for deductions
    setDeductionAllowanceMap({});

    // Reset OTAmount special flags
    setOdDoubleFlags({});
    setMultiplyValues({});
    setShowMultiplier({});

    // DO NOT remove formula or calculated data
    // DO NOT remove deductionAmounts
  };

  return (
    <div
      className="content-wrapper"
      style={{
        minHeight: "100vh",
        padding: 30,
        width: "94%",
        maxWidth: "100%",
        margin: 0,
        display: "block",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          padding: "20px",
          borderRadius: 10,
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          background: "#fff",
          marginBottom: 5,
          marginTop: -15,
        }}
      >
        {/* ROW 1: TITLE + SG NAME + SELECT SG */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 3, // reduced gap
          }}
        >
          {/* TITLE */}
          <div
            style={{
              display: "inline-block",
              background: "#e2e8f0", // soft gray-blue bg
              padding: "8px 18px",
              borderRadius: "6px",
              borderLeft: "5px solid #1e3a8a", // professional blue accent
              marginBottom: "5px",
              marginTop: "-10px",
            }}
          >
            <h2
              style={{
                margin: 0,
                padding: 0,
                fontSize: 22, // same size you wanted
                fontWeight: 700,
                color: "#1e3a8a",
                letterSpacing: "0.3px",
              }}
            >
              CREATE SALARY GROUP
            </h2>
          </div>

          {/* Salary Group Name */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label
              style={{
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: "nowrap",
                paddingLeft: 45,
                marginTop: "-10px",
              }}
            >
              Salary Group Name =
            </label>

            <input
              placeholder="Enter Name"
              name="salaryGroupName"
              value={form.salaryGroupName}
              onChange={handleChange}
              className="form-control"
              style={{
                width: "200px",
                height: "32px",
                fontSize: "14px",
                padding: "2px 8px",
                marginTop: "-15px",
              }}
            />
          </div>

          {/* Select Existing SG */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label
              style={{
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: "nowrap",
                paddingLeft: 43,
                marginTop: "-10px",
              }}
            >
              Select Existing SG =
            </label>

            <select
              className="form-control"
              style={{
                width: "200px",
                height: "32px",
                padding: "2px 8px",
                marginTop: "-15px",
                fontSize: "14px",
                color: selectedSG ? "#000" : "#999",
              }}
              value={selectedSG}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedSG(id);

                if (id === "") {
                  resetSalaryGroupForm();
                } else {
                  handleDropdownSelect(
                    salaryGroups.find((s) => s.SalaryGroup_ID == id)
                  );
                }
              }}
            >
              <option value="">-- Select Existing SG --</option>

              {salaryGroups.map((sg) => (
                <option key={sg.SalaryGroup_ID} value={sg.SalaryGroup_ID}>
                  {sg.SalaryGroup}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* ROW 2: BASE SALARY + WORKING DAYS + SHIFT HOURS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 25,
            marginBottom: 10,
            paddingLeft: "10px", // <-- Shift right (adjust as needed)
          }}
        >
          {/* Base Salary */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>
              Base Salary =
            </label>

            <input
              placeholder="Enter Base Salary"
              name="baseSalary"
              value={form.baseSalary}
              onChange={allowOnlyNumbers}
              className="form-control"
              style={{
                width: "150px",
                height: "30px",
                fontSize: "14px",
                padding: "2px 8px",
              }}
            />
          </div>

          {/* Total Working Days */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 600, paddingLeft: 86 }}>
              Total Working Days =
            </label>

            <input
              name="totalWorkingDays"
              value={form.totalWorkingDays}
              onChange={allowOnlyNumbers}
              className="form-control"
              style={{
                width: "90px",
                height: "30px",
                fontSize: "14px",
                padding: "2px 8px",
              }}
            />
          </div>

          {/* Shift Hours */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 600, paddingLeft: 152 }}>
              Total Shift Hours =
            </label>

            <input
              name="shiftHours"
              value={form.shiftHours}
              onChange={allowOnlyNumbers}
              className="form-control"
              style={{
                width: "90px",
                height: "30px",
                fontSize: "14px",
                padding: "2px 8px",
              }}
            />
          </div>
        </div>
        <hr style={{ margin: "3px 0", borderTop: "3px solid #001affff" }} />
        {/* MAIN BODY GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* ALLOWANCES */}
          <div>
            <h4
              style={{ color: "#2a4365", marginBottom: 10, maxHeight: "20px" }}
            >
              Allowances
            </h4>
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 10,
                maxHeight: 420,
                overflowY: "auto",
              }}
            >
              {allowances.map((a) => (
                <div
                  key={a.ID}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "30px 1fr 60px",
                    alignItems: "center",
                    marginBottom: 8,
                    columnGap: 8,
                  }}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={!!allowanceSelected[a.Name]}
                    onChange={(e) => {
                      if (!activeDeduction) {
                        alert("Please select a deduction first!");
                        return;
                      }

                      const checked = e.target.checked;

                      setDeductionAllowanceMap((prev) => ({
                        ...prev,
                        [activeDeduction]: {
                          ...(prev[activeDeduction] || {}),
                          [a.Name]: checked,
                        },
                      }));

                      // Update visible selected allowances
                      setAllowanceSelected((prev) => ({
                        ...prev,
                        [a.Name]: checked,
                      }));
                    }}
                    style={{ transform: "scale(1.1)" }}
                  />

                  {/* Name + Amount */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ width: 80 }}>{a.Name}</span>
                    <input
                      type="number"
                      className="form-control"
                      style={{
                        width: 120,
                        height: "28px", // reduced height
                        padding: "2px 6px", // tighter padding
                        fontSize: "13px",
                      }}
                      value={allowanceAmounts[a.Name] || ""}
                      onChange={(e) =>
                        handleAllowanceAmount(a.Name, e.target.value)
                      }
                    />
                  </div>

                  {/* FX */}
                  <button
                    className="btn btn-sm btn-secondary"
                    style={{ width: "100%", padding: "4px 0", fontSize: 12 }}
                  >
                    FX
                  </button>
                </div>
              ))}
            </div>

            {/* OTHER ALLOWANCES */}
            <h4
              style={{
                color: "#2a4365",
                margin: "20px 0 10px",
                maxHeight: "20px",
              }}
            >
              Other Allowances
            </h4>
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 10,
                maxHeight: 260,
                overflowY: "auto",
              }}
            >
              {otherAllowances.map((a) => (
                <div
                  key={a.ID}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "30px 1fr 60px",
                    alignItems: "center",
                    marginBottom: 8,
                    columnGap: 8,
                  }}
                >
                  {/* MAIN checkbox (select OTAmount allowance) */}
                  <input
                    type="checkbox"
                    checked={!!allowanceSelected[a.Name]}
                    onChange={(e) => {
                      if (!activeDeduction) {
                        alert("Please select a deduction first!");
                        return;
                      }

                      const checked = e.target.checked;

                      setDeductionAllowanceMap((prev) => ({
                        ...prev,
                        [activeDeduction]: {
                          ...(prev[activeDeduction] || {}),
                          [a.Name]: checked,
                        },
                      }));

                      // Update visible selected allowances
                      setAllowanceSelected((prev) => ({
                        ...prev,
                        [a.Name]: checked,
                      }));
                    }}
                    style={{ transform: "scale(1.1)" }}
                  />

                  {/* UI BLOCK (special for OTAmount) */}
                  {a.Name === "OTAmount" ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 14, // more spacing
                        marginTop: 4,
                      }}
                    >
                      {/* Label */}
                      <span style={{ width: 120, marginTop: 2 }}>{a.Name}</span>

                      {/* To Multiply Checkbox */}
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 3, // shift downward
                          opacity: allowanceSelected[a.Name] ? 1 : 0.4,
                          cursor: allowanceSelected[a.Name]
                            ? "pointer"
                            : "not-allowed",
                        }}
                      >
                        <input
                          type="checkbox"
                          disabled={!allowanceSelected[a.Name]} // disable until first checkbox selected
                          checked={odDoubleFlags[a.Name] || false}
                          onChange={(e) => {
                            const checked = e.target.checked;

                            setOdDoubleFlags((prev) => ({
                              ...prev,
                              [a.Name]: checked,
                            }));

                            if (!checked) {
                              setMultiplyValues((prev) => ({
                                ...prev,
                                [a.Name]: null,
                              }));
                            }
                          }}
                        />
                        <span style={{ fontSize: 12 }}>To Multiply</span>
                      </label>

                      {/* Dropdown (shows only when 2nd checkbox is checked) */}
                      {odDoubleFlags[a.Name] && (
                        <select
                          style={{
                            width: 65,
                            height: 26,
                            fontSize: 12,
                            marginLeft: 6, // add spacing between label and dropdown
                            marginTop: 2, // slight downward shift
                          }}
                          value={multiplyValues[a.Name] || ""}
                          onChange={(e) =>
                            setMultiplyValues((prev) => ({
                              ...prev,
                              [a.Name]: e.target.value,
                            }))
                          }
                        >
                          <option value="">--</option>
                          {[1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ) : (
                    /* NORMAL Allowances */
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ width: 120 }}>{a.Name}</span>
                      <input
                        type="number"
                        className="form-control"
                        style={{
                          width: 120,
                          height: "28px",
                          padding: "2px 6px",
                          fontSize: "13px",
                        }}
                        value={allowanceAmounts[a.Name] || ""}
                        onChange={(e) =>
                          handleAllowanceAmount(a.Name, e.target.value)
                        }
                      />
                    </div>
                  )}

                  {/* FX BUTTON */}
                  <button
                    className="btn btn-sm btn-secondary"
                    style={{ width: "100%", padding: "4px 0", fontSize: 12 }}
                  >
                    FX
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: DEDUCTIONS + SUMMARY */}
          <div>
            {/* MAIN DEDUCTIONS */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <h4 style={{ color: "#2a4365", margin: 0 }}>Deductions</h4>

              <button
                className="btn btn-sm btn-outline-primary"
                style={{
                  padding: "2px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
                onClick={handleRefreshSelections}
              >
                Refresh
              </button>
            </div>
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 10,
              }}
            >
              {deductions.map((d) => {
                // compute REAL vs PREVIEW for this deduction
                const isReal =
                  activeDeduction === d.Name || !!calculatedAD[d.Name];

                return (
                  <div
                    key={d.ID}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "30px 1fr 60px",
                      alignItems: "center",
                      marginBottom: 8,
                      columnGap: 8,
                    }}
                  >
                    {/* Radio */}
                    <input
                      type="radio"
                      name="deductionMain"
                      value={d.Name}
                      checked={activeDeduction === d.Name}
                      onChange={(e) => {
                        setActiveDeduction(e.target.value);
                      }}
                      style={{ transform: "scale(1.1)" }}
                    />

                    {/* Name + Amount */}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ width: 120 }}>{d.Name}</span>

                      <input
                        type="number"
                        className="form-control"
                        style={{
                          width: 120,
                          height: "28px",
                          padding: "2px 6px",
                          fontSize: "13px",
                          opacity: isReal ? 1 : 0.5,
                        }}
                        value={
                          isReal
                            ? deductionAmounts[d.Name] || "" // real for selected or previously calculated
                            : isPreviewMode
                            ? deductionAmounts[d.Name]?.toFixed(2) || "" // preview
                            : deductionAmounts[d.Name] || "" // fallback
                        }
                        onChange={(e) =>
                          setDeductionAmounts((prev) => ({
                            ...prev,
                            [d.Name]: Number(e.target.value),
                          }))
                        }
                      />

                      {/* FORMULA TEXT */}
                      <span
                        style={{
                          fontSize: 12,
                          color: "#555",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {isReal ? (
                          adFormula[d.Name] ? (
                            `= ${adFormula[d.Name]}`
                          ) : (
                            ""
                          )
                        ) : isPreviewMode ? (
                          <span style={{ opacity: 0.4 }}>
                            = {adFormula[d.Name]}
                          </span>
                        ) : adFormula[d.Name] ? (
                          `= ${adFormula[d.Name]}`
                        ) : (
                          ""
                        )}
                      </span>
                    </div>

                    {/* FX BUTTON */}
                    <button
                      className="btn btn-sm btn-secondary"
                      style={{ width: "100%", padding: "4px 0", fontSize: 12 }}
                    >
                      FX
                    </button>
                  </div>
                );
              })}
            </div>

            {/* SALARY SUMMARY */}
            <h4 style={{ color: "#2a4365", margin: "15px 0 8px" }}>
              Salary Summary
            </h4>

            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: "10px 12px", // reduced padding
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4, // tighter spacing
                }}
              >
                <strong>Total Gross:</strong>
                <span>₹ {totalGross.toFixed(2)}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4, // tighter spacing
                }}
              >
                <strong>Total Deduction:</strong>
                <span>₹ {totalDeduction.toFixed(2)}</span>
              </div>

              {/* TIGHT HR LINE */}
              <hr style={{ margin: "6px 0" }} />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                  fontSize: 16,
                  color: "#2b6cb0",
                  marginTop: 2, // reduced gap above net pay
                }}
              >
                <span>Net Pay:</span>
                <span>₹ {netPay.toFixed(2)}</span>
              </div>
            </div>

            {/* OTHER DEDUCTIONS */}
            <h4
              style={{
                color: "#2a4365",
                margin: "20px 0 10px",
                maxHeight: "20px",
              }}
            >
              Other Deductions
            </h4>

            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 10,
              }}
            >
              {otherDeductions.map((d) => {
                const isReal =
                  activeDeduction === d.Name || !!calculatedAD[d.Name];

                return (
                  <div
                    key={d.ID}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "30px 1fr 60px",
                      alignItems: "center",
                      marginBottom: 8,
                      columnGap: 8,
                    }}
                  >
                    {/* Radio */}
                    <input
                      type="radio"
                      name="deductionOther"
                      value={d.Name}
                      checked={activeDeduction === d.Name}
                      onChange={(e) => setActiveDeduction(e.target.value)}
                      style={{ transform: "scale(1.1)" }}
                    />

                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ width: 120 }}>{d.Name}</span>

                      <input
                        type="number"
                        className="form-control"
                        style={{
                          width: 120,
                          height: "28px",
                          padding: "2px 6px",
                          fontSize: "13px",
                          opacity: isReal ? 1 : 0.5,
                        }}
                        value={
                          isReal
                            ? deductionAmounts[d.Name] || ""
                            : isPreviewMode
                            ? deductionAmounts[d.Name]?.toFixed(2) || ""
                            : deductionAmounts[d.Name] || ""
                        }
                        onChange={(e) =>
                          setDeductionAmounts((prev) => ({
                            ...prev,
                            [d.Name]: Number(e.target.value),
                          }))
                        }
                      />

                      {/* FORMULA TEXT */}
                      <span
                        style={{
                          fontSize: 12,
                          color: "#555",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {isReal ? (
                          adFormula[d.Name] ? (
                            `= ${adFormula[d.Name]}`
                          ) : (
                            ""
                          )
                        ) : isPreviewMode ? (
                          <span style={{ opacity: 0.4 }}>
                            = {adFormula[d.Name]}
                          </span>
                        ) : adFormula[d.Name] ? (
                          `= ${adFormula[d.Name]}`
                        ) : (
                          ""
                        )}
                      </span>
                    </div>

                    {/* FX */}
                    <button
                      className="btn btn-sm btn-secondary"
                      style={{ width: "100%", padding: "4px 0", fontSize: 12 }}
                    >
                      FX
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* SALARY SUMMARY BOX */}
        <div style={{ marginTop: 2 }}>
          <SalarySummaryBox />
        </div>
        {/* SAVE BUTTON */}
        <button
          className="btn btn-primary mt-4"
          style={{ padding: "10px 25px", fontSize: 16 }}
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}
