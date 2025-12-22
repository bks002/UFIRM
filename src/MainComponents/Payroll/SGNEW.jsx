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
import { getEmployeesByOffice } from "../../Services/PayrollService";
import { getAllDesignations } from "../../Services/DesignationService";

export default function SGNEW() {
  const propertyId = useSelector((state) => state.Commonreducer.puidn);
  const [salaryGroups, setSalaryGroups] = useState([]);
  const [adList, setAdList] = useState([]);
  const [adPercentages, setAdPercentages] = useState([]);
  const [activeDeduction, setActiveDeduction] = useState(null);
  const [allowanceAmounts, setAllowanceAmounts] = useState({});
  const [deductionAmounts, setDeductionAmounts] = useState({});
  const [deductionAllowanceMap, setDeductionAllowanceMap] = useState({});
  const [allowanceSelected, setAllowanceSelected] = useState({});
  const [calculatedAD, setCalculatedAD] = useState({});
  const [adFormula, setAdFormula] = useState({});
  const [selectedSG, setSelectedSG] = useState("");
  const [deductionFormulaMap, setDeductionFormulaMap] = useState({});
  const [odDoubleFlags, setOdDoubleFlags] = useState({});
  const [multiplyValues, setMultiplyValues] = useState({});
  const [adValueType, setAdValueType] = useState({});
  const [editablePercentages, setEditablePercentages] = useState({});
  const [designation, setDesignation] = useState("");
  const [excludeEmployees, setExcludeEmployees] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

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
    if (!propertyId) return;
    loadADPercentages();
  }, [propertyId]);

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

  useEffect(() => {
    const base = Number(form.baseSalary) || 0;
    if (!base) return;

    let newAllowanceAmounts = {};
    let newFormulas = {};

    allowances.concat(otherAllowances).forEach((a) => {
      const name = a.Name;

      if (adValueType[name] !== "PERCENT") return;

      const percentObj = getEffectivePercentage(name);
      if (!percentObj) return;

      const percentage = percentObj.Percentage;
      const amount = Math.round(base * (percentage / 100));

      newAllowanceAmounts[name] = amount;
      newFormulas[name] = `Base * ${percentage / 100}`;
    });

    setAllowanceAmounts((prev) => ({ ...prev, ...newAllowanceAmounts }));
    setAdFormula((prev) => ({ ...prev, ...newFormulas }));
  }, [form.baseSalary, adValueType, adPercentages, propertyId]);

  useEffect(() => {
    const base = Number(form.baseSalary) || 0;
    if (!base) return;

    let newAllowanceAmounts = {};
    let newDeductionAmounts = {};
    let newFormulas = {};

    // 🔹 Allowances + OA
    allowances.concat(otherAllowances).forEach((a) => {
      const name = a.Name;

      if (adValueType[name] !== "PERCENT") return;

      const percentage = Number(editablePercentages[name]);
      if (!percentage) return;

      const amount = Math.round(base * (percentage / 100));

      newAllowanceAmounts[name] = amount;
      newFormulas[name] = `Base * ${percentage / 100}`;
    });

    // 🔹 Deductions + OD (ONLY active one)
    if (activeDeduction && adValueType[activeDeduction] === "PERCENT") {
      const percentage = Number(editablePercentages[activeDeduction]) || 0;

      let total = base;
      let formulaParts = ["Base"];

      Object.keys(allowanceSelected).forEach((key) => {
        if (allowanceSelected[key]) {
          const val = Number(allowanceAmounts[key]) || 0;
          total += val;
          formulaParts.push(key);
        }
      });

      const amount = Math.round(total * (percentage / 100));

      newDeductionAmounts[activeDeduction] = amount;

      newFormulas[activeDeduction] =
        formulaParts.length === 1
          ? `Base * ${percentage / 100}`
          : `(${formulaParts.join(" + ")}) * ${percentage / 100}`;
    }

    setAllowanceAmounts((prev) => ({ ...prev, ...newAllowanceAmounts }));
    setDeductionAmounts((prev) => ({ ...prev, ...newDeductionAmounts }));
    setAdFormula((prev) => ({ ...prev, ...newFormulas }));
  }, [
    form.baseSalary,
    editablePercentages,
    allowanceSelected,
    activeDeduction,
  ]);

  useEffect(() => {
    if (!excludeEmployees || !propertyId) {
      setEmployees([]);
      return;
    }

    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const res = await getEmployeesByOffice(propertyId);
        setEmployees(res || []);
      } catch (err) {
        console.log("Failed to load employees", err);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [excludeEmployees, propertyId]);

  const getEffectivePercentage = (adName) => {
    if (!adPercentages.length || !propertyId) return null;

    const pid = Number(propertyId); // 🔥 FORCE NUMBER

    // 1️⃣ Property-specific (highest priority)
    const propertySpecific = adPercentages.find(
      (p) =>
        p.AD_Name === adName &&
        Number(p.PropertyId) === pid &&
        p.IsGlobal === false &&
        p.IsActive
    );

    if (propertySpecific) return propertySpecific;

    // 2️⃣ Global fallback
    const globalPercent = adPercentages.find(
      (p) => p.AD_Name === adName && p.IsGlobal === true && p.IsActive
    );

    return globalPercent || null;
  };

  const buildADModel = () => {
    let list = [];

    adList.forEach((item) => {
      const name = item.Name;

      let fixed = 0;
      let calculated = 0;

      // ✅ ALLOWANCES & OA
      if (item.Type === "A" || item.Type === "OA") {
        const valueType = adValueType[name];

        if (valueType === "FIXED") {
          fixed = Number(allowanceAmounts[name]) || 0;
          if (fixed <= 0) return; // 🚫 DO NOT SEND
        }

        if (valueType === "PERCENT") {
          calculated = Number(allowanceAmounts[name]) || 0;
          if (calculated <= 0) return; // 🚫 DO NOT SEND
        }

        // ❗ If user never touched this allowance
        if (!valueType) return; // 🚫 DO NOT SEND
      }

      // ✅ DEDUCTIONS & OD
      if (item.Type === "D" || item.Type === "OD") {
        if (adValueType[name] === "FIXED") {
          fixed = deductionAmounts[name] || 0;
        } else {
          calculated = deductionAmounts[name] || 0;
        }
      }

      // Special case: OTAmount should always be included if selected
      if (name === "OTAmount" && allowanceSelected["OTAmount"]) {
        list.push({
          AD_Id: item.ID,
          Name: name,
          Type: item.Type,
          FixedAmount: 0,
          IsDouble: odDoubleFlags[name] && multiplyValues[name] ? true : false,
          MultiplyValue: multiplyValues[name] || null,
          Formula: null,
          FormulaId: null,
          CalculatedAmount: 0,
        });
        return;
      }

      // Allowances (A, OA) should ALWAYS be included if fixed amount > 0
      // ✅ ALLOWANCES & OA inclusion rule
      if (item.Type === "A" || item.Type === "OA") {
        if (adValueType[name] === "FIXED" && fixed === 0) return;
        if (adValueType[name] === "PERCENT" && calculated === 0) return;
      } else {
        // Deduction filtering
        if (adValueType[name] === "FIXED") {
          fixed = deductionAmounts[name] || 0;
          calculated = 0;
        } else {
          if (!calculatedAD[name]) return;
        }
      }

      list.push({
        AD_Id: item.ID,
        Name: name,
        Type: item.Type,
        FixedAmount: fixed,
        CalculatedAmount: calculated,
        Formula: adFormula[name] || null,
        FormulaId: null,
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

  const loadADPercentages = async () => {
    try {
      const res = await getADPercentages(propertyId); // ✅ PASS propertyId
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

  const extractPercentageFromFormula = (formula) => {
    if (!formula) return null;

    // matches: * 0.56 , *0.15 , * 0.0275
    const match = formula.match(/\*\s*([\d.]+)/);
    return match ? Number(match[1]) * 100 : null;
  };

  const handleDropdownSelect = (sg) => {
    if (!sg) return;

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

    // 3. Read Allowances + Deductions from API model
    sg.AllowancesDeductions.forEach((ad) => {
      const name = ad.Name;

      // CASE 1: Calculated Amount exists → percentage-based
      if (ad.CalculatedAmount && ad.CalculatedAmount > 0) {
        // restore % mode
        setAdValueType((prev) => ({
          ...prev,
          [name]: "PERCENT",
        }));

        // 🔥 restore editable percentage from formula
        const match = ad.Formula?.match(/([\d.]+)$/);
        const percentage = match ? Number(match[1]) * 100 : 0;

        setEditablePercentages((prev) => ({
          ...prev,
          [name]: percentage,
        }));

        if (ad.Type === "A" || ad.Type === "OA") {
          newAllowances[name] = ad.CalculatedAmount;
        } else {
          newDeductions[name] = ad.CalculatedAmount;
          calcFlags[name] = true;
        }

        if (ad.Formula) formulas[name] = ad.Formula;
        return;
      }

      // CASE 2: Fixed Amount exists → fixed
      if (ad.FixedAmount && ad.FixedAmount > 0) {
        if (ad.Type === "A" || ad.Type === "OA") {
          newAllowances[name] = ad.FixedAmount;
        } else {
          newDeductions[name] = ad.FixedAmount;
        }

        setAdValueType((prev) => ({
          ...prev,
          [name]: "FIXED",
        }));
      }
    });

    // 4. Set UI states
    setAllowanceSelected({}); // allow user to choose allowance afresh
    setAllowanceAmounts(newAllowances);
    setDeductionAmounts(newDeductions);
    setCalculatedAD(calcFlags); // RESTORE calculated flags
    setAdFormula(formulas); // RESTORE formulas
    setActiveDeduction(null); // keep all radios unchecked
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
      const normalizedDesignations = Array.isArray(designations)
        ? designations
        : designations
        ? [designations]
        : [];

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
        Designations: normalizedDesignations,
        ExcludedEmployeeIds: excludedEmployeeIds,
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
  const totalDeduction = Object.keys(deductionAmounts).reduce((sum, key) => {
    const val = Number(deductionAmounts[key]) || 0;

    const isReal = calculatedAD[key];
    const isFixed = adValueType[key] === "FIXED";

    if (isReal || isFixed) return sum + val;

    return sum;
  }, 0);

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
    setDesignations([]);
    setExcludedEmployeeIds([]);
  };

  const allowOnlyNumbers = (e) => {
    const value = e.target.value;

    if (/^\d*\.?\d*$/.test(value)) {
      setForm({ ...form, [e.target.name]: value });
    }
  };

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

    // DO NOT remove formula or calculated data
    // DO NOT remove deductionAmounts
  };
  // ================================
  // TYPE HELPERS (REQUIRED FOR POPUP)
  // ================================
  const isAllowance = (type) => type === "A" || type === "OA";
  const isDeduction = (type) => type === "D" || type === "OD";

  // Allowance amount resolver (Calculated > Fixed)
  const getAllowanceAmount = (a) =>
    a.CalculatedAmount > 0 ? a.CalculatedAmount : a.FixedAmount;

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
        {/* ROW 2: WORKING DAYS + SHIFT HOURS + DESIGNATION + EXCLUDE */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "max-content max-content max-content max-content max-content 200px auto",
            alignItems: "center",
            columnGap: 12,
            rowGap: 8,
            marginBottom: 12,
            paddingLeft: 10,
          }}
        >
          {/* Total Working Days */}
          <label
            style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}
          >
            Total Working Days =
          </label>
          <input
            name="totalWorkingDays"
            value={form.totalWorkingDays}
            onChange={allowOnlyNumbers}
            className="form-control"
            style={{
              width: 80,
              height: 30,
              fontSize: 14,
              padding: "2px 6px",
              marginRight: 50, // 👈 extra gap
            }}
          />

          {/* Shift Hours */}
          <label
            style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}
          >
            Total Shift Hours =
          </label>
          <input
            name="shiftHours"
            value={form.shiftHours}
            onChange={allowOnlyNumbers}
            className="form-control"
            style={{
              width: 80,
              height: 30,
              fontSize: 14,
              padding: "2px 6px",
              marginRight: 50, // 👈 extra gap
            }}
          />

          {/* Designation */}
          <label
            style={{
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Designation <span style={{ color: "red" }}>*</span>
          </label>
          <select
            className="form-control"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            style={{
              width: 170,
              height: 30,
              fontSize: 14,
              padding: "2px 8px",
            }}
          >
            <option value="">-- Select Designation --</option>
          </select>

          {/* Exclude checkbox + popup */}
          <div
            style={{
              position: "relative", // 🔥 anchor
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginLeft: 46, // 👈 THIS adds space from Designation
              whiteSpace: "nowrap",
            }}
          >
            <input
              type="checkbox"
              checked={excludeEmployees}
              onChange={(e) => setExcludeEmployees(e.target.checked)}
            />
            <span style={{ fontSize: 13, fontWeight: 500 }}>
              Exclude specific employees
            </span>

            {/* POPUP — NOW CORRECTLY ANCHORED */}
            {excludeEmployees && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: 8,
                  width: 220,
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: 10,
                  background: "#fff",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    marginBottom: 8,
                    color: "#1e293b",
                  }}
                >
                  Exclude Employees
                </div>

                {loadingEmployees ? (
                  <div style={{ fontSize: 12, color: "#555" }}>Loading...</div>
                ) : employees.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#777" }}>
                    No employees found
                  </div>
                ) : (
                  <div style={{ maxHeight: 180, overflowY: "auto" }}>
                    {employees.map((emp, idx) => (
                      <label
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 13,
                          marginBottom: 6,
                        }}
                      >
                        <input type="checkbox" />
                        {emp.Profile?.EmployeeName}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
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
              {/* BASE SALARY (MOVED HERE) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  paddingBottom: 8,
                  marginBottom: 10,
                  borderBottom: "1px dashed #cbd5e1",
                }}
              >
                <span
                  style={{
                    width: 80,
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#1e293b", // dark slate
                  }}
                >
                  Base Salary
                </span>

                <span style={{ fontWeight: 600 }}>=</span>

                <input
                  name="baseSalary"
                  value={form.baseSalary}
                  onChange={allowOnlyNumbers}
                  className="form-control"
                  style={{
                    width: 140,
                    height: 28,
                    fontSize: 13,
                  }}
                />
              </div>
              {allowances.map((a) => {
                const isPercentage = adValueType[a.Name] === "PERCENT";
                return (
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
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span style={{ width: 70 }}>{a.Name}</span>
                      {/* % / # Dropdown */}
                      <select
                        value={adValueType[a.Name] || "FIXED"}
                        onChange={(e) => {
                          const type = e.target.value;

                          setAdValueType((prev) => ({
                            ...prev,
                            [a.Name]: type,
                          }));

                          if (type === "PERCENT") {
                            const percentObj = getEffectivePercentage(a.Name);
                            setEditablePercentages((prev) => ({
                              ...prev,
                              [a.Name]: percentObj?.Percentage || 0,
                            }));
                          }
                        }}
                        style={{
                          width: 32,
                          height: 28,
                          fontSize: 12,
                        }}
                      >
                        <option value="FIXED">#</option>
                        <option value="PERCENT">%</option>
                      </select>
                      {adValueType[a.Name] === "PERCENT" && (
                        <input
                          type="number"
                          style={{
                            width: 55,
                            height: 28,
                            fontSize: 12,
                          }}
                          value={editablePercentages[a.Name] || ""}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;

                            setEditablePercentages((prev) => ({
                              ...prev,
                              [a.Name]: val,
                            }));
                          }}
                        />
                      )}

                      <input
                        type="number"
                        className="form-control"
                        disabled={isPercentage}
                        style={{
                          width: 110,
                          height: "28px",
                          fontSize: "13px",
                          backgroundColor: isPercentage ? "#f1f5f9" : "#fff",
                          cursor: isPercentage ? "not-allowed" : "text",
                        }}
                        value={allowanceAmounts[a.Name] || ""}
                        onChange={(e) =>
                          handleAllowanceAmount(a.Name, e.target.value)
                        }
                      />
                      <span
                        style={{
                          fontSize: 12,
                          color: "#555",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {adValueType[a.Name] === "PERCENT" && adFormula[a.Name]
                          ? `= ${adFormula[a.Name]}`
                          : ""}
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
              {otherAllowances.map((a) => {
                const isPercentage = adValueType[a.Name] === "PERCENT";
                return (
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
                        <span style={{ width: 120, marginTop: 2 }}>
                          {a.Name}
                        </span>

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
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span style={{ width: 70 }}>{a.Name}</span>
                        {/* % / # Dropdown */}
                        <select
                          value={adValueType[a.Name] || "FIXED"}
                          onChange={(e) => {
                            const type = e.target.value;

                            setAdValueType((prev) => ({
                              ...prev,
                              [a.Name]: type,
                            }));

                            if (type === "PERCENT") {
                              const percentObj = getEffectivePercentage(a.Name);
                              setEditablePercentages((prev) => ({
                                ...prev,
                                [a.Name]: percentObj?.Percentage || 0,
                              }));
                            }
                          }}
                          style={{
                            width: 32,
                            height: 28,
                            fontSize: 12,
                          }}
                        >
                          <option value="FIXED">#</option>
                          <option value="PERCENT">%</option>
                        </select>
                        {adValueType[a.Name] === "PERCENT" && (
                          <input
                            type="number"
                            style={{
                              width: 55,
                              height: 28,
                              fontSize: 12,
                            }}
                            value={editablePercentages[a.Name] || ""}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;

                              setEditablePercentages((prev) => ({
                                ...prev,
                                [a.Name]: val,
                              }));
                            }}
                          />
                        )}

                        <input
                          type="number"
                          className="form-control"
                          disabled={isPercentage}
                          style={{
                            width: 110,
                            height: "28px",
                            fontSize: "13px",
                            backgroundColor: isPercentage ? "#f1f5f9" : "#fff",
                            cursor: isPercentage ? "not-allowed" : "text",
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
                );
              })}
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
                const isReal = !!calculatedAD[d.Name];
                const valueType =
                  adValueType[d.Name] ||
                  (getEffectivePercentage(d.Name) ? "PERCENT" : "FIXED");

                const isPercentage = valueType === "PERCENT";

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
                        const name = e.target.value;

                        setActiveDeduction(name);

                        const percentObj = getEffectivePercentage(name);
                        const percentage = percentObj?.Percentage || 0;

                        setEditablePercentages((prev) => ({
                          ...prev,
                          [name]: percentage,
                        }));

                        setAdValueType((prev) => ({
                          ...prev,
                          [name]: "PERCENT",
                        }));

                        setCalculatedAD((prev) => ({
                          ...prev,
                          [name]: true,
                        }));
                      }}
                      style={{ transform: "scale(1.1)" }}
                    />

                    {/* Name + Amount */}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ width: 120 }}>{d.Name}</span>
                      <select
                        value={
                          adValueType[d.Name] ||
                          (getEffectivePercentage(d.Name) ? "PERCENT" : "FIXED")
                        }
                        onChange={(e) => {
                          const type = e.target.value;

                          setAdValueType((prev) => ({
                            ...prev,
                            [d.Name]: type,
                          }));

                          if (type === "FIXED") {
                            setCalculatedAD((prev) => ({
                              ...prev,
                              [d.Name]: false,
                            }));
                            setAdFormula((prev) => ({ ...prev, [d.Name]: "" }));
                          }
                        }}
                        style={{
                          width: 32,
                          height: 28,
                          fontSize: 12,
                        }}
                      >
                        <option value="PERCENT">%</option>
                        <option value="FIXED">#</option>
                      </select>
                      {activeDeduction === d.Name &&
                        adValueType[d.Name] === "PERCENT" && (
                          <input
                            type="number"
                            style={{ width: 55, height: 28, fontSize: 12 }}
                            value={editablePercentages[d.Name] || ""}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;

                              setEditablePercentages((prev) => ({
                                ...prev,
                                [d.Name]: val,
                              }));
                            }}
                          />
                        )}

                      <input
                        type="number"
                        className="form-control"
                        disabled={isPercentage} // ⭐ THIS IS THE KEY LINE
                        style={{
                          width: 120,
                          height: "28px",
                          padding: "2px 6px",
                          fontSize: "13px",

                          backgroundColor: isPercentage ? "#f1f5f9" : "#fff",
                          cursor: isPercentage ? "not-allowed" : "text",
                          border: "1px solid #e5e7eb",

                          color:
                            isReal || adValueType[d.Name] === "FIXED"
                              ? "#000"
                              : "rgba(0,0,0,0.3)",
                        }}
                        value={deductionAmounts[d.Name] || ""}
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
                        {adValueType[d.Name] === "PERCENT" && adFormula[d.Name]
                          ? `= ${adFormula[d.Name]}`
                          : ""}
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
                const isReal = !!calculatedAD[d.Name];
                const valueType =
                  adValueType[d.Name] ||
                  (getEffectivePercentage(d.Name) ? "PERCENT" : "FIXED");

                const isPercentage = valueType === "PERCENT";

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
                      onChange={(e) => {
                        const name = e.target.value;

                        setActiveDeduction(name);

                        const percentObj = getEffectivePercentage(name);
                        const percentage = percentObj?.Percentage || 0;

                        setEditablePercentages((prev) => ({
                          ...prev,
                          [name]: percentage,
                        }));

                        setAdValueType((prev) => ({
                          ...prev,
                          [name]: "PERCENT",
                        }));

                        setCalculatedAD((prev) => ({
                          ...prev,
                          [name]: true,
                        }));
                      }}
                      style={{ transform: "scale(1.1)" }}
                    />

                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ width: 120 }}>{d.Name}</span>
                      <select
                        value={
                          adValueType[d.Name] ||
                          (getEffectivePercentage(d.Name) ? "PERCENT" : "FIXED")
                        }
                        onChange={(e) => {
                          const type = e.target.value;

                          setAdValueType((prev) => ({
                            ...prev,
                            [d.Name]: type,
                          }));

                          if (type === "FIXED") {
                            setCalculatedAD((prev) => ({
                              ...prev,
                              [d.Name]: false,
                            }));
                            setAdFormula((prev) => ({ ...prev, [d.Name]: "" }));
                          }
                        }}
                        style={{
                          width: 32,
                          height: 28,
                          fontSize: 12,
                        }}
                      >
                        <option value="PERCENT">%</option>
                        <option value="FIXED">#</option>
                      </select>
                      {activeDeduction === d.Name &&
                        adValueType[d.Name] === "PERCENT" && (
                          <input
                            type="number"
                            style={{ width: 55, height: 28, fontSize: 12 }}
                            value={editablePercentages[d.Name] || ""}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;

                              setEditablePercentages((prev) => ({
                                ...prev,
                                [d.Name]: val,
                              }));
                            }}
                          />
                        )}
                      <input
                        type="number"
                        className="form-control"
                        disabled={isPercentage} // ⭐ THIS IS THE KEY LINE
                        style={{
                          width: 120,
                          height: "28px",
                          padding: "2px 6px",
                          fontSize: "13px",

                          backgroundColor: isPercentage ? "#f1f5f9" : "#fff",
                          cursor: isPercentage ? "not-allowed" : "text",
                          border: "1px solid #e5e7eb",

                          color:
                            isReal || adValueType[d.Name] === "FIXED"
                              ? "#000"
                              : "rgba(0,0,0,0.3)",
                        }}
                        value={deductionAmounts[d.Name] || ""}
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
                        {adValueType[d.Name] === "PERCENT" && adFormula[d.Name]
                          ? `= ${adFormula[d.Name]}`
                          : ""}
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
      {popupVisible && popupGroup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setPopupVisible(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 25,
              maxWidth: 850,
              width: "92%",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ marginBottom: 15 }}>
              Salary Group → {popupGroup.SalaryGroup}
            </h2>

            {/* FIXED SALARY ONLY VIEW */}
            {popupGroup.FixedSalary > 0 &&
            popupGroup.AllowancesDeductions.length === 0 ? (
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <td>Fixed Salary</td>
                    <td style={{ textAlign: "right" }}>
                      ₹{popupGroup.FixedSalary}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <b>Total Allowance:</b>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <b>₹{popupGroup.FixedSalary}</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              /* NORMAL ALLOWANCE + DEDUCTION VIEW */
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {/* Allowance Box */}
                <div
                  style={{
                    flex: 1,
                    marginRight: 20,
                    background: "#E8FBE8",
                    borderRadius: 12,
                    padding: "0 0 10px 0",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    style={{
                      background: "#C6F6D5",
                      padding: "10px 0",
                      textAlign: "center",
                      fontWeight: 700,
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                    }}
                  >
                    Allowance
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ padding: 8, textAlign: "left" }}>Name</th>
                        <th style={{ padding: 8, textAlign: "right" }}>
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {/* Base Salary */}
                      {popupGroup.BaseSalary > 0 && (
                        <tr>
                          <td style={{ padding: 8 }}>Base Salary</td>
                          <td style={{ padding: 8, textAlign: "right" }}>
                            ₹{popupGroup.BaseSalary}
                          </td>
                        </tr>
                      )}

                      {/* Allowances */}
                      {popupGroup.AllowancesDeductions.filter((a) =>
                        isAllowance(a.Type)
                      ).map((a) => (
                        <tr key={a.AD_Id}>
                          <td style={{ padding: 8 }}>{a.Name}</td>
                          <td style={{ padding: 8, textAlign: "right" }}>
                            ₹{getAllowanceAmount(a)}
                          </td>
                        </tr>
                      ))}

                      {/* Total */}
                      <tr style={{ borderTop: "2px solid #999" }}>
                        <td style={{ padding: 8, fontWeight: 700 }}>
                          Total Allowance:
                        </td>
                        <td
                          style={{
                            padding: 8,
                            textAlign: "right",
                            fontWeight: 700,
                          }}
                        >
                          ₹
                          {(
                            (popupGroup.BaseSalary || 0) +
                            popupGroup.AllowancesDeductions.filter((a) =>
                              isAllowance(a.Type)
                            ).reduce((sum, a) => sum + getAllowanceAmount(a), 0)
                          ).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Deduction Box */}
                <div
                  style={{
                    flex: 1,
                    background: "#FFECEC",
                    borderRadius: 12,
                    padding: "0 0 10px 0",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    style={{
                      background: "#FED7D7",
                      padding: "10px 0",
                      textAlign: "center",
                      fontWeight: 700,
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                    }}
                  >
                    Deduction
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ padding: 8, textAlign: "left" }}>Name</th>
                        <th style={{ padding: 8, textAlign: "right" }}>
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {/* Deductions */}
                      {popupGroup.AllowancesDeductions.filter((d) =>
                        isDeduction(d.Type)
                      ).map((d) => (
                        <tr key={d.AD_Id}>
                          <td style={{ padding: 8 }}>{d.Name}</td>
                          <td style={{ padding: 8, textAlign: "right" }}>
                            ₹{d.CalculatedAmount}
                          </td>
                        </tr>
                      ))}

                      {/* Total Deduction */}
                      <tr style={{ borderTop: "2px solid #999" }}>
                        <td style={{ padding: 8, fontWeight: 700 }}>
                          Total Deduction:
                        </td>
                        <td
                          style={{
                            padding: 8,
                            textAlign: "right",
                            fontWeight: 700,
                          }}
                        >
                          ₹
                          {popupGroup.AllowancesDeductions.filter((d) =>
                            isDeduction(d.Type)
                          ).reduce((sum, d) => sum + d.CalculatedAmount, 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ textAlign: "right", marginTop: 10 }}>
              <button
                onClick={() => setPopupVisible(false)}
                style={{
                  padding: "10px 22px",
                  background: "#2563eb",
                  color: "#fff",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
