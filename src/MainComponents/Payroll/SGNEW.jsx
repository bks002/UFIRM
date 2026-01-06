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
  const [odDoubleFlags, setOdDoubleFlags] = useState({});
  const [multiplyValues, setMultiplyValues] = useState({});
  const [adValueType, setAdValueType] = useState({});
  const [editablePercentages, setEditablePercentages] = useState({});
  const [designation, setDesignation] = useState("");
  const [excludeEmployees, setExcludeEmployees] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeDesignations, setEmployeeDesignations] = useState([]);

  const [form, setForm] = useState({
    salaryGroupName: "",
    baseSalary: "",
    totalWorkingDays: "",
    shiftHours: "",
    salaryCycleFrom: "",
    salaryCycleTo: "",
    monthlySundays: "",
    excludeSunday: false,
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

    // 🔥 FULL HARD RESET ON PROPERTY CHANGE
    setSelectedSG("");
    setDesignation("");
    setExcludeEmployees(false);
    setExcludedEmployeeIds([]);

    // 🔥 CLEAR ALL MONEY + MODE STATE (THIS WAS MISSING)
    setAllowanceAmounts({});
    setDeductionAmounts({});
    setAdValueType({});
    setEditablePercentages({});
    setCalculatedAD({});
    setAdFormula({});
    setActiveDeduction(null);

    // 🔥 ALSO CLEAR API PERCENT CACHE
    setAdPercentages([]);

    // 🔥 RESET FORM
    setForm({
      salaryGroupName: "",
      baseSalary: "",
      totalWorkingDays: "",
      shiftHours: "",
    });
  }, [propertyId]);

  useEffect(() => {
    if (!propertyId) return;
    loadADPercentages();
  }, [propertyId]);

  useEffect(() => {
    if (!activeDeduction) return;

    // 🚫 DO NOT TOUCH PF / ESI HERE
    if (activeDeduction === "PF" || activeDeduction === "ESI") return;

    setAllowanceSelected({
      BaseSalary: true,
      ...(deductionAllowanceMap[activeDeduction] || {}),
    });
  }, [activeDeduction, deductionAllowanceMap]);

  useEffect(() => {
    // PF should ALWAYS react to allowance changes
    if (activeStatutory.PF) {
      setDeductionAmounts((prev) => ({ ...prev }));
    }

    // ESI should NOT react while in preview
    if (activeStatutory.ESI && calculatedAD.ESI !== false) {
      setDeductionAmounts((prev) => ({ ...prev }));
    }
  }, [allowanceAmounts, deductionAllowanceMap, activeStatutory, calculatedAD]);

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

    setDeductionAmounts((prev) => {
      const merged = { ...prev };

      Object.keys(newDeductions).forEach((key) => {
        // ❌ DO NOT overwrite preview deductions
        if (calculatedAD[key] === false) return;

        merged[key] = newDeductions[key];
      });

      return merged;
    });
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
    if (esiPreviewLock.current) return;
    const base = Number(form.baseSalary) || 0;
    if (!base) return;

    // 🔥 AUTO-ENABLE PF / ESI PREVIEW IN CREATE MODE
    if (base > 0) {
      if (
        activeStatutory.ESI &&
        deductionAllowanceMap.ESI?.BaseSalary === true &&
        calculatedAD.ESI !== false // 🔥 DO NOT override preview
      ) {
        activateDeductionWithBase("ESI");
      }
    }

    let newAllowanceAmounts = {};
    let newDeductionAmounts = {};
    let newFormulas = {};

    /* ===============================
     🔹 ALLOWANCES (percentage based)
     =============================== */
    allowances.concat(otherAllowances).forEach((a) => {
      const name = a.Name;

      if (adValueType[name] !== "PERCENT") return;

      const percentage = Number(editablePercentages[name]);
      if (!percentage) return;

      const amount = Math.round(base * (percentage / 100));

      newAllowanceAmounts[name] = amount;
      newFormulas[name] = `Base * ${percentage / 100}`;
    });

    /* ===============================
     🔹 PF & ESI (STATUTORY – ALWAYS)
     =============================== */
    ["PF", "ESI"].forEach((d) => {
      // 🔥 DO NOT recalc if in preview mode
      if (calculatedAD[d] === false) return;

      const percentObj = getEffectivePercentage(d);
      const percentage =
        editablePercentages[d] !== "" &&
        editablePercentages[d] !== undefined &&
        editablePercentages[d] !== null
          ? Number(editablePercentages[d])
          : Number(percentObj?.Percentage || 0);

      if (!percentage) return;

      let total = base;
      let formulaParts = ["Base"];

      Object.keys(deductionAllowanceMap[d] || {}).forEach((key) => {
        if (!deductionAllowanceMap[d][key]) return;
        if (key === "BaseSalary") return;

        const val = Number(allowanceAmounts[key]) || 0;
        total += val;
        formulaParts.push(key);
      });

      newDeductionAmounts[d] = Math.round(total * (percentage / 100));
      newFormulas[d] =
        formulaParts.length === 1
          ? `Base * ${percentage / 100}`
          : `(${formulaParts.join(" + ")}) * ${percentage / 100}`;
    });

    /* ===============================
     🔹 OTHER DEDUCTIONS (RADIO ONLY)
     =============================== */
    if (
      activeDeduction &&
      !["PF", "ESI"].includes(activeDeduction) &&
      adValueType[activeDeduction] === "PERCENT"
    ) {
      const percentage = Number(editablePercentages[activeDeduction]) || 0;
      if (percentage) {
        let total = base;
        let formulaParts = ["Base"];

        Object.keys(allowanceSelected).forEach((key) => {
          if (!allowanceSelected[key]) return;
          if (key === "BaseSalary") return;

          const val = Number(allowanceAmounts[key]) || 0;
          total += val;
          formulaParts.push(key);
        });

        const amount = Math.round(total * (percentage / 100));

        newDeductionAmounts[activeDeduction] = amount;
        newFormulas[activeDeduction] =
          formulaParts.length === 1
            ? `Base * ${percentage / 100}`
            : `(${formulaParts.join(" + ")}) * ${percentage / 100}`;
      }
    }

    setAllowanceAmounts((prev) => ({ ...prev, ...newAllowanceAmounts }));
    setDeductionAmounts((prev) => ({ ...prev, ...newDeductionAmounts }));
    setAdFormula((prev) => ({ ...prev, ...newFormulas }));
  }, [
    form.baseSalary,
    editablePercentages,
    allowanceAmounts,
    allowanceSelected,
    deductionAllowanceMap,
    activeStatutory,
    activeDeduction,
    adValueType,
  ]);

  useEffect(() => {
    if (!activeStatutory.PF) return;

    const base = Number(form.baseSalary) || 0;
    if (!base) return;

    const percentObj = getEffectivePercentage("PF");
    const percentage =
      editablePercentages.PF !== "" && editablePercentages.PF != null
        ? Number(editablePercentages.PF)
        : Number(percentObj?.Percentage || 0);

    if (!percentage) return;

    let total = base;

    Object.keys(deductionAllowanceMap.PF || {}).forEach((key) => {
      if (!deductionAllowanceMap.PF[key]) return;
      if (key === "BaseSalary") return;

      total += Number(allowanceAmounts[key]) || 0;
    });

    setDeductionAmounts((prev) => ({
      ...prev,
      PF: Math.round((total * percentage) / 100),
    }));

    setAdFormula((prev) => ({
      ...prev,
      PF: `(${[
        "Base",
        ...Object.keys(deductionAllowanceMap.PF || {}).filter(
          (k) => deductionAllowanceMap.PF[k] && k !== "BaseSalary"
        ),
      ].join(" + ")}) * ${percentage / 100}`,
    }));
  }, [
    allowanceAmounts,
    deductionAllowanceMap.PF,
    activeStatutory.PF,
    editablePercentages.PF,
    form.baseSalary,
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

        // 🔥 EXTRACT UNIQUE DESIGNATIONS (STRING)
        const uniqueDesignations = new Set();

        (res || []).forEach((emp) => {
          const des =
            emp.EmployeeList?.Designation || emp.EmployeeList?.Designation;
          if (des) uniqueDesignations.add(des.trim());
        });

        setEmployeeDesignations([...uniqueDesignations]);
      } catch (err) {
        console.log("Failed to load employees", err);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [propertyId]);

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

  const hasApiPercent = (name) => {
    return !!getEffectivePercentage(name);
  };

  const buildADModel = () => {
    let list = [];

    adList.forEach((item) => {
      const name = item.Name;

      let fixed = 0;
      let calculated = 0;

      // ✅ ALLOWANCES & OA (FIXED OR PERCENT)
      if (item.Type === "A" || item.Type === "OA") {
        const amount = Number(allowanceAmounts[name]) || 0;
        if (amount <= 0) return;

        if (adValueType[name] === "PERCENT") {
          calculated = amount;
          fixed = 0;
        } else {
          // 🔥 DEFAULT TO FIXED
          fixed = amount;
          calculated = 0;
        }
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
          Isbasic: otBaseType === "Base",
        });
        return;
      }

      // Allowances (A, OA) should ALWAYS be included if fixed amount > 0
      // ✅ ALLOWANCES & OA inclusion rule
      if (item.Type === "A" || item.Type === "OA") {
        if (adValueType[name] === "FIXED" && fixed === 0) return;
        if (adValueType[name] === "PERCENT" && calculated === 0) return;
      } else {
        // DEDUCTIONS & OD
        if (adValueType[name] === "FIXED") {
          fixed = Number(deductionAmounts[name]) || 0;
          if (fixed <= 0) return; // ❗ don’t send zero junk
          calculated = 0;
        } else {
          // percentage-based deduction
          if (!calculatedAD[name]) return;
          calculated = Number(deductionAmounts[name]) || 0;
          if (calculated <= 0) return;
        }
      }

      list.push({
        AD_Id: item.ID,
        Name: name,
        Type: item.Type,
        FixedAmount: fixed,
        CalculatedAmount: calculated,
        Formula: adValueType[name] === "FIXED" ? null : adFormula[name] || null,
        FormulaId: null,
        IsDouble: odDoubleFlags[name] || false,
        Perday:
          item.Type === "OD" &&
          (name === "Food" || name === "Accommodation" || name === "Uniform")
            ? !!perDayOD[name]
            : false,
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
        salaryCycleFrom: res.Salarycycledayfrom ?? "",
        salaryCycleTo: res.Salarycycledayto ?? "",
        excludeSunday: !!res.Excludesunday,
        monthlySundays: res.MonthSunday ?? "",
      }));
    } catch (err) {
      return null;
    }
  };

  const handleDropdownSelect = (sg) => {
    if (!sg) return;

    // 🔥 Store SG-based exclusions & designations
    setExcludedEmployeeIds(sg.ExcludedEmployeeIds || []);

    if (Array.isArray(sg.Designations) && sg.Designations.length > 0) {
      setDesignation(sg.Designations[0]); // auto-select designation
    }

    // 1. Fill main fields
    setForm({
      salaryGroupName: sg.SalaryGroup,
      baseSalary: sg.BaseSalary,
      totalWorkingDays: sg.TotalWorkingDays,
      shiftHours: sg.ShiftHours,
      salaryCycleFrom: sg.Salarystartfrom ?? "",
      salaryCycleTo: sg.Salaryendto ?? "",
      excludeSunday: !!sg.ExcludeSunday,
      monthlySundays: sg.MonthSundays ?? "",
    });

    // 2. Prepare maps
    let newAllowances = {};
    let newDeductions = {};
    let calcFlags = {};
    let formulas = {};
    let deductionAllowanceRestoreMap = {}; // 🔥 NEW

    // 3. Read Allowances + Deductions from API model
    sg.AllowancesDeductions.forEach((ad) => {
      const name = ad.Name;

      // SPECIAL CASE: OTAmount base type
      if (name === "OTAmount") {
        setOtBaseType(ad.Isbasic === false ? "Gross" : "Base");
      }

      // 🔥 RESTORE allowance usage FROM DEDUCTION FORMULA
      if (ad.Type === "D" && ad.Formula) {
        const usedAllowances = {};

        const tokens = ad.Formula.match(/[A-Z][A-Za-z0-9_]*/g) || [];
        tokens.forEach((t) => {
          if (t !== "Base") {
            usedAllowances[t] = true;
          }
        });

        deductionAllowanceRestoreMap[name] = usedAllowances;
      }

      // 🔥 RESTORE Per Day flag for OD items
      if (
        ad.Type === "OD" &&
        (ad.Name === "Food" ||
          ad.Name === "Accommodation" ||
          ad.Name === "Uniform")
      ) {
        setPerDayOD((prev) => ({
          ...prev,
          [ad.Name]: !!ad.Perday,
        }));
      }

      // CASE 1: Calculated Amount exists → percentage-based
      if (ad.CalculatedAmount && ad.CalculatedAmount > 0) {
        setAdValueType((prev) => ({
          ...prev,
          [name]: "PERCENT",
        }));

        // restore editable percentage from formula
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

        // 🔥 THIS WAS MISSING
        setAdValueType((prev) => ({
          ...prev,
          [name]: "FIXED",
        }));

        // 🔥 ALSO MARK DEDUCTION AS VALID
        if (ad.Type === "D" || ad.Type === "OD") {
          setCalculatedAD((prev) => ({
            ...prev,
            [name]: false,
          }));
        }
      }
    });
    // 🔥 FORCE Base Salary inclusion for PF & ESI when loading SG
    ["PF", "ESI"].forEach((d) => {
      if (deductionAllowanceRestoreMap[d]) {
        deductionAllowanceRestoreMap[d] = {
          ...deductionAllowanceRestoreMap[d],
          BaseSalary: true,
        };
      }
    });
    // 🔥 COMMIT deduction → allowance dependency map FIRST
    setDeductionAllowanceMap(deductionAllowanceRestoreMap);
    // 🔥 Mark PF / ESI as active statutory deductions
    setActiveStatutory({
      PF: !!deductionAllowanceRestoreMap.PF,
      ESI: !!deductionAllowanceRestoreMap.ESI,
    });

    // 🔥 Mark them calculated so amounts show
    setCalculatedAD((prev) => ({
      ...prev,
      PF: !!deductionAllowanceRestoreMap.PF,
      ESI: !!deductionAllowanceRestoreMap.ESI,
    }));

    // 🔥 RESTORE allowanceSelected for PF / ESI so formula works
    let restoredSelected = {};

    ["PF", "ESI"].forEach((d) => {
      if (deductionAllowanceRestoreMap[d]) {
        Object.keys(deductionAllowanceRestoreMap[d]).forEach((a) => {
          if (deductionAllowanceRestoreMap[d][a]) {
            restoredSelected[a] = true;
          }
        });
      }
    });

    // 4. Set UI states
    setAllowanceAmounts(newAllowances);
    setDeductionAmounts(newDeductions);
    setCalculatedAD((prev) => ({ ...prev, ...calcFlags }));
    setAdFormula(formulas);

    setAllowanceSelected((prev) => ({
      ...prev,
      ...restoredSelected,
    }));

    setPfLimit(sg.PFLimit ?? "");
    setEsiLimit(sg.ESILimit ?? "");
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
      const normalizedDesignations = Array.isArray(designation)
        ? designation
        : designation
          ? [designation]
          : [];

      const model = {
        SalaryGroup_ID: isUpdate
          ? salaryGroups.find((sg) => sg.SalaryGroup === form.salaryGroupName)
              .SalaryGroup_ID
          : 0,

        SalaryGroup: form.salaryGroupName,
        BaseSalary: Number(form.baseSalary),
        Property_ID: propertyId,
        PFLimit: pfLimit ? Number(pfLimit) : null,
        ESILimit: esiLimit ? Number(esiLimit) : null,
        TotalWorkingDays: Number(form.totalWorkingDays),
        ShiftHours: Number(form.shiftHours),
        Salarystartfrom: form.salaryCycleFrom
          ? Number(form.salaryCycleFrom)
          : null,
        Salaryendto: form.salaryCycleTo ? Number(form.salaryCycleTo) : null,
        ExcludeSunday: form.excludeSunday,
        MonthSundays:
          form.monthlySundays !== "" ? Number(form.monthlySundays) : null,
        Designations: designation ? [designation] : [],
        ExcludedEmployeeIds: excludeEmployees ? excludedEmployeeIds : [],
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
  const totalDeduction = Object.keys(deductionAmounts).reduce((sum, key) => {
    const val = Number(deductionAmounts[key]) || 0;

    const isReal = calculatedAD[key];
    const isFixed = adValueType[key] === "FIXED";

    if (isReal || isFixed || adValueType[key] === "PERCENT") {
      return sum + val;
    }

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
      salaryCycleFrom: "",
      salaryCycleTo: "",
      excludeSunday: false,
      monthlySundays: "",
    });

    setAdValueType({});
    setEditablePercentages({});
    setAllowanceSelected({});
    setAllowanceAmounts({});
    setDeductionAmounts({});
    setActiveDeduction(null);
    setCalculatedAD({});
    setAdFormula({});
    setSelectedSG("");
    setOdDoubleFlags({});
    setMultiplyValues({});
    setDesignation("");
    setExcludeEmployees(false);
    setExcludedEmployeeIds([]);
    setDesignationTouched(false);
    setPfLimit("");
    setEsiLimit("");
    setDeductionAllowanceMap({}); // 🔥 RESET PF / ESI CHECKBOX STATE
    setPerDayOD({}); // 🔥 RESET Per Day checkboxes (OD)
    setActiveStatutory({
      PF: false,
      ESI: false,
    });
    setOtBaseType("Base");
  };

  const allowOnlyNumbers = (e) => {
    const value = e.target.value;

    if (/^\d*\.?\d*$/.test(value)) {
      setForm({ ...form, [e.target.name]: value });
    }
  };

  const handleRefreshSelections = () => {
    // 🔹 Reset ONLY non-statutory deduction selection
    setActiveDeduction(null);

    // 🔹 Preserve BaseSalary selection (PF / ESI depend on it)
    setAllowanceSelected((prev) => ({
      BaseSalary: true,
    }));

    // 🔹 Preserve PF / ESI allowance mappings, reset others
    setDeductionAllowanceMap((prev) => ({
      PF: {
        ...(prev.PF || {}),
        BaseSalary: prev.PF?.BaseSalary ?? true,
      },
      ESI: {
        ...(prev.ESI || {}),
        BaseSalary: prev.ESI?.BaseSalary ?? true,
      },
    }));

    // 🔹 Reset OD / other deduction helpers
    setOdDoubleFlags({});
    setMultiplyValues({});

    // ❌ DO NOT touch:
    // - allowanceAmounts
    // - deductionAmounts
    // - adFormula
    // - editablePercentages
  };

  const filteredEmployees = designation
    ? employees.filter((e) => e.EmployeeList?.Designation === designation)
    : [];

  const getEmployeeSalaryGroupName = (emp) => {
    const sgId = Number(emp.FacilityMember?.SG_Link_ID);
    if (!sgId) return "Not Assigned";

    const sg = salaryGroups.find((s) => Number(s.SalaryGroup_ID) === sgId);

    return sg?.SalaryGroup || "Not Assigned";
  };

  const activateDeductionWithBase = (deductionName) => {
    // ❌ DO NOT touch activeDeduction for PF / ESI
    if (deductionName !== "PF" && deductionName !== "ESI") {
      setActiveDeduction(deductionName);
    }

    // 2️⃣ Force deduction into PERCENT mode
    setAdValueType((prev) => ({
      ...prev,
      [deductionName]: "PERCENT",
    }));

    // 3️⃣ Restore % from API if missing
    const percentObj = getEffectivePercentage(deductionName);
    setEditablePercentages((prev) => ({
      ...prev,
      [deductionName]: prev[deductionName] ?? percentObj?.Percentage ?? 0,
    }));

    // 4️⃣ Mark as calculated
    setCalculatedAD((prev) => ({
      ...prev,
      [deductionName]: true,
    }));
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
            onClick={() => {
              // 🔥 FULL RESET TO CREATE MODE
              setSelectedSG("");
              setDesignation("");
              setExcludeEmployees(false);
              setExcludedEmployeeIds([]);
              resetSalaryGroupForm();
            }}
            style={{
              display: "inline-block",
              background: "#e2e8f0",
              padding: "8px 18px",
              borderRadius: "6px",
              borderLeft: "5px solid #1e3a8a",
              marginBottom: "5px",
              marginTop: "-10px",
              cursor: "pointer", // UX hint only
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
                paddingLeft: 25,
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
                paddingLeft: 25,
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
                  // 🔥 FULL RESET (same as clicking CREATE SALARY GROUP)
                  resetSalaryGroupForm();
                  setDesignation("");
                  setExcludeEmployees(false);
                  setExcludedEmployeeIds([]);
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

          {/* TOP RIGHT SAVE BUTTON */}
          <div style={{ marginLeft: "auto", marginTop: "-15px" }}>
            <button
              className="btn btn-sm btn-primary"
              onClick={handleSave}
              style={{
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Save
            </button>
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
              marginLeft: -10, // 👈 extra gap
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
              marginLeft: -10, // 👈 extra gap
            }}
          />

          {/* Designation */}
          <label
            style={{
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: "nowrap",
              marginLeft: 70,
            }}
          >
            Designation <span style={{ color: "red" }}>*</span>
          </label>
          <select
            className="form-control"
            value={designation}
            onChange={(e) => {
              const newDesignation = e.target.value;

              setDesignation(newDesignation);
              setExcludeEmployees(false);

              // reset interaction flag for new designation
              setDesignationTouched(false);
            }}
            style={{
              width: 170,
              height: 30,
              fontSize: 14,
              padding: "2px 8px",
              marginLeft: -30,
            }}
          >
            <option value="">-- Select Designation --</option>

            {employeeDesignations.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Exclude checkbox + popup */}
          <div
            style={{
              position: "relative", // 🔥 anchor
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginLeft: 10, // 👈 THIS adds space from Designation
              whiteSpace: "nowrap",
            }}
          >
            <input
              type="checkbox"
              checked={excludeEmployees}
              onChange={(e) => {
                if (!designation) {
                  alert("Please select designation first");
                  return;
                }

                const checked = e.target.checked;
                setExcludeEmployees(checked);
              }}
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
                    {filteredEmployees.map((emp, idx) => (
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
                        <input
                          type="checkbox"
                          checked={excludedEmployeeIds.includes(
                            emp.FacilityMember?.FacilityMemberId
                          )}
                          onChange={(e) => {
                            const empId = emp.FacilityMember?.FacilityMemberId;

                            // 🔥 FIRST interaction in this designation clears old data
                            if (!designationTouched) {
                              setExcludedEmployeeIds([]);
                            }

                            // 🔥 mark that this designation was interacted with
                            setDesignationTouched(true);

                            setExcludedEmployeeIds((prev) =>
                              e.target.checked
                                ? [...prev, empId]
                                : prev.filter((id) => id !== empId)
                            );
                          }}
                        />
                        <span>
                          {emp.Profile?.EmployeeName}{" "}
                          <span style={{ color: "#0f766e", fontWeight: 500 }}>
                            ({getEmployeeSalaryGroupName(emp)})
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Salary Cycle Day From */}
          <label
            style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}
          >
            Salary Cycle Day From =
          </label>
          <input
            name="salaryCycleFrom"
            value={form.salaryCycleFrom}
            onChange={allowOnlyNumbers}
            className="form-control"
            style={{
              width: 70,
              height: 30,
              fontSize: 14,
              padding: "2px 6px",
            }}
          />

          {/* Salary Cycle Day To */}
          <label
            style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}
          >
            Salary Cycle Day To =
          </label>
          <input
            name="salaryCycleTo"
            value={form.salaryCycleTo}
            onChange={allowOnlyNumbers}
            className="form-control"
            style={{
              width: 70,
              height: 30,
              fontSize: 14,
              padding: "2px 6px",
            }}
          />

          {/* Exclude Sundays */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
              marginLeft: 70,
            }}
          >
            <input
              type="checkbox"
              checked={form.excludeSunday}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  excludeSunday: e.target.checked,
                }))
              }
            />
            <span style={{ fontSize: 13, fontWeight: 500 }}>
              Exclude Sundays
            </span>
          </div>

          {/* Monthly Sundays */}
          <label
            style={{
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: "nowrap",
              marginLeft: 70,
              marginTop: 5,
            }}
          >
            Monthly Sundays =
          </label>
          <input
            name="monthlySundays"
            value={form.monthlySundays}
            onChange={allowOnlyNumbers}
            className="form-control"
            style={{
              width: 70,
              height: 30,
              fontSize: 14,
              padding: "2px 6px",
            }}
          />
        </div>
        <hr
          style={{
            margin: "3px 0",
            borderTop: "3px solid #001affff",
            marginTop: -5,
          }}
        />
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 80px",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <h4 style={{ color: "#2a4365", margin: 0 }}>Allowances</h4>

              <div
                style={{
                  textAlign: "center",
                  fontWeight: 600,
                  marginLeft: -81,
                }}
              >
                PF
              </div>

              <div
                style={{
                  textAlign: "center",
                  fontWeight: 600,
                  marginLeft: -148,
                }}
              >
                ESI
              </div>
            </div>
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
                  display: "grid",
                  gridTemplateColumns: "30px 1fr 40px 110px 40px 40px 60px",
                  alignItems: "center",
                  columnGap: 8,
                  marginBottom: 8,
                }}
              >
                {/* Checkbox placeholder (no checkbox for Base Salary selection) */}
                <div />

                {/* Label */}
                <span>Base Salary</span>

                {/* Fixed # box (aligned above others) */}
                <input
                  value="#"
                  disabled
                  style={{
                    width: 32,
                    height: 28,
                    fontSize: 12,
                    textAlign: "center",
                    marginLeft: -95,
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #e5e7eb",
                    cursor: "not-allowed",
                  }}
                />

                {/* Amount input (aligned above other amounts) */}
                <input
                  name="baseSalary"
                  value={form.baseSalary}
                  onChange={allowOnlyNumbers}
                  className="form-control"
                  style={{
                    width: 110,
                    height: 28,
                    fontSize: 13,
                    marginLeft: -107,
                  }}
                />

                {/* PF checkbox */}
                <input
                  type="checkbox"
                  checked={!!deductionAllowanceMap.PF?.BaseSalary}
                  onChange={(e) => {
                    const checked = e.target.checked;

                    setActiveStatutory((prev) => ({ ...prev, PF: checked }));

                    setDeductionAllowanceMap((prev) => ({
                      ...prev,
                      PF: { BaseSalary: checked },
                    }));

                    setCalculatedAD((prev) => ({
                      ...prev,
                      PF: checked,
                    }));

                    if (checked) {
                      activateDeductionWithBase("PF");
                      setDeductionAmounts((prev) => ({ ...prev }));
                    }
                  }}
                  style={{ transform: "scale(1.1)", justifySelf: "center" }}
                />

                {/* ESI checkbox */}
                <input
                  type="checkbox"
                  checked={!!deductionAllowanceMap.ESI?.BaseSalary}
                  onChange={(e) => {
                    const checked = e.target.checked;

                    // ✅ ONLY control allowance dependency
                    setDeductionAllowanceMap((prev) => ({
                      ...prev,
                      ESI: { BaseSalary: checked },
                    }));

                    if (!checked) {
                      // 🔒 LOCK preview so effects cannot revert it
                      esiPreviewLock.current = true;

                      setActiveStatutory((prev) => ({ ...prev, ESI: false }));
                      setCalculatedAD((prev) => ({ ...prev, ESI: false }));

                      setAdValueType((prev) => ({
                        ...prev,
                        ESI: "PERCENT",
                      }));

                      const percentObj = getEffectivePercentage("ESI");
                      const percentage =
                        editablePercentages.ESI !== undefined &&
                        editablePercentages.ESI !== null &&
                        editablePercentages.ESI !== ""
                          ? Number(editablePercentages.ESI)
                          : Number(percentObj?.Percentage || 0);

                      const base = Number(form.baseSalary) || 0;

                      setDeductionAmounts((prev) => ({
                        ...prev,
                        ESI: Math.round(base * (percentage / 100)),
                      }));

                      setAdFormula((prev) => ({
                        ...prev,
                        ESI: `Base * ${percentage / 100}`,
                      }));

                      return;
                    }

                    activateDeductionWithBase("ESI");
                    esiPreviewLock.current = false; // 🔓 allow auto logic again
                  }}
                  style={{ transform: "scale(1.1)", justifySelf: "center" }}
                />

                {/* Empty FX placeholder to keep alignment */}
                <div />
              </div>
              {allowances.map((a) => {
                const isPreviewPercent =
                  !adValueType[a.Name] && hasApiPercent(a.Name);

                const isPercentMode = adValueType[a.Name] === "PERCENT";

                const disableAmount = isPreviewPercent || isPercentMode;

                return (
                  <div
                    key={a.ID}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "30px 1fr 40px 40px 60px",
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
                      {/* % / # Dropdown control */}
                      <select
                        value={adValueType[a.Name] || ""}
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
                          if (type === "FIXED") {
                            setEditablePercentages((prev) => ({
                              ...prev,
                              [a.Name]: "",
                            }));
                            setAdFormula((prev) => ({ ...prev, [a.Name]: "" }));
                          }
                        }}
                        style={{
                          width: 32,
                          height: 28,
                          fontSize: 12,
                          color:
                            !adValueType[a.Name] && hasApiPercent(a.Name)
                              ? "#94a3b8" // 🔥 light preview %
                              : "#000",
                        }}
                      >
                        {/* PREVIEW PLACEHOLDER (NOT A REAL OPTION) */}
                        {!adValueType[a.Name] && hasApiPercent(a.Name) && (
                          <option value="" hidden>
                            %
                          </option>
                        )}

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
                        disabled={disableAmount}
                        style={{
                          width: 110,
                          height: "28px",
                          fontSize: "13px",
                          backgroundColor: disableAmount ? "#f1f5f9" : "#fff",
                          cursor: disableAmount ? "not-allowed" : "text",
                          opacity: isPreviewPercent ? 0.6 : 1,
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
                    {/* PF Checkbox */}
                    <input
                      type="checkbox"
                      checked={!!deductionAllowanceMap.PF?.[a.Name]}
                      onChange={(e) => {
                        const checked = e.target.checked;

                        if (checked) {
                          activateDeductionWithBase("PF");
                        }

                        setDeductionAllowanceMap((prev) => ({
                          ...prev,
                          PF: {
                            ...(prev.PF || {}),
                            [a.Name]: checked,
                          },
                        }));

                        // 🔥 ALWAYS sync allowanceSelected when editing PF
                        setAllowanceSelected((prev) => ({
                          ...prev,
                          [a.Name]: checked,
                        }));

                        // 🔥 ENSURE fixed allowance value is present
                        if (checked && adValueType[a.Name] === "FIXED") {
                          setAllowanceAmounts((prev) => ({
                            ...prev,
                            [a.Name]:
                              prev[a.Name] || Number(a.FixedAmount) || 0,
                          }));
                        }
                      }}
                    />

                    {/* ESI Checkbox */}
                    <input
                      type="checkbox"
                      checked={!!deductionAllowanceMap.ESI?.[a.Name]}
                      onChange={(e) => {
                        const checked = e.target.checked;

                        if (checked) {
                          activateDeductionWithBase("ESI");
                        }

                        setDeductionAllowanceMap((prev) => ({
                          ...prev,
                          ESI: {
                            ...(prev.ESI || {}),
                            [a.Name]: checked,
                          },
                        }));

                        // 🔥 ALWAYS sync allowanceSelected for ESI (same as PF)
                        setAllowanceSelected((prev) => ({
                          ...prev,
                          [a.Name]: checked,
                        }));

                        // 🔥 ENSURE fixed allowance value is present for ESI
                        if (checked && adValueType[a.Name] === "FIXED") {
                          setAllowanceAmounts((prev) => ({
                            ...prev,
                            [a.Name]:
                              prev[a.Name] || Number(a.FixedAmount) || 0,
                          }));
                        }
                      }}
                    />

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
                const isPreviewPercent =
                  !adValueType[a.Name] && hasApiPercent(a.Name);

                const isPercentMode = adValueType[a.Name] === "PERCENT";

                const disableAmount = isPreviewPercent || isPercentMode;

                return (
                  <div
                    key={a.ID}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "30px 1fr 40px 40px 60px",
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
                          alignItems: "center",
                          gap: 14, // more spacing
                          marginTop: 3,
                        }}
                      >
                        {/* Label */}
                        <span style={{ width: 120, marginTop: -4 }}>
                          {a.Name}
                        </span>

                        {/* To Multiply Checkbox */}
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginLeft: -20,
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
                              marginLeft: -7, // add spacing between label and dropdown
                              marginTop: 0, // slight downward shift
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
                        {/* ✅ ALWAYS-CHECKED BASE CHECKBOX */}
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            marginTop: 3,
                            marginLeft: 25,
                            pointerEvents: "none", // 🔥 cannot be changed
                          }}
                        >
                          <input type="checkbox" checked />
                        </label>

                        {/* ✅ BASE / GROSS DROPDOWN */}
                        <select
                          value={otBaseType}
                          onChange={(e) => setOtBaseType(e.target.value)}
                          style={{
                            width: 70,
                            height: 26,
                            fontSize: 12,
                            marginLeft: -6,
                          }}
                        >
                          <option value="Base">Base</option>
                          <option value="Gross">Gross</option>
                        </select>
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
                          value={adValueType[a.Name] || ""}
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
                            if (type === "FIXED") {
                              setEditablePercentages((prev) => ({
                                ...prev,
                                [a.Name]: "",
                              }));
                              setAdFormula((prev) => ({
                                ...prev,
                                [a.Name]: "",
                              }));
                            }
                          }}
                          style={{
                            width: 32,
                            height: 28,
                            fontSize: 12,
                            color:
                              !adValueType[a.Name] && hasApiPercent(a.Name)
                                ? "#94a3b8" // 🔥 light preview %
                                : "#000",
                          }}
                        >
                          {/* PREVIEW PLACEHOLDER (NOT A REAL OPTION) */}
                          {!adValueType[a.Name] && hasApiPercent(a.Name) && (
                            <option value="" hidden>
                              %
                            </option>
                          )}

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
                          disabled={disableAmount}
                          style={{
                            width: 110,
                            height: "28px",
                            fontSize: "13px",
                            backgroundColor: disableAmount ? "#f1f5f9" : "#fff",
                            cursor: disableAmount ? "not-allowed" : "text",
                            opacity: isPreviewPercent ? 0.6 : 1,
                          }}
                          value={allowanceAmounts[a.Name] || ""}
                          onChange={(e) =>
                            handleAllowanceAmount(a.Name, e.target.value)
                          }
                        />
                      </div>
                    )}

                    <input
                      type="checkbox"
                      checked={!!deductionAllowanceMap.PF?.[a.Name]}
                      onChange={(e) => {
                        const checked = e.target.checked;

                        if (checked) {
                          activateDeductionWithBase("PF");
                        }

                        setDeductionAllowanceMap((prev) => ({
                          ...prev,
                          PF: {
                            ...(prev.PF || {}),
                            [a.Name]: checked,
                          },
                        }));

                        // 🔥 ALWAYS sync allowanceSelected when editing PF
                        setAllowanceSelected((prev) => ({
                          ...prev,
                          [a.Name]: checked,
                        }));

                        // 🔥 ENSURE fixed allowance value is present
                        if (checked && adValueType[a.Name] === "FIXED") {
                          setAllowanceAmounts((prev) => ({
                            ...prev,
                            [a.Name]:
                              prev[a.Name] || Number(a.FixedAmount) || 0,
                          }));
                        }
                      }}
                      style={{ transform: "scale(1.1)", justifySelf: "center" }}
                    />

                    <input
                      type="checkbox"
                      checked={!!deductionAllowanceMap.ESI?.[a.Name]}
                      onChange={(e) => {
                        const checked = e.target.checked;

                        if (checked) {
                          activateDeductionWithBase("ESI");
                        }

                        setDeductionAllowanceMap((prev) => ({
                          ...prev,
                          ESI: {
                            ...(prev.ESI || {}),
                            [a.Name]: checked,
                          },
                        }));

                        // 🔥 ALWAYS sync allowanceSelected for ESI (same as PF)
                        setAllowanceSelected((prev) => ({
                          ...prev,
                          [a.Name]: checked,
                        }));

                        // 🔥 ENSURE fixed allowance value is present for ESI
                        if (checked && adValueType[a.Name] === "FIXED") {
                          setAllowanceAmounts((prev) => ({
                            ...prev,
                            [a.Name]:
                              prev[a.Name] || Number(a.FixedAmount) || 0,
                          }));
                        }
                      }}
                      style={{ transform: "scale(1.1)", justifySelf: "center" }}
                    />

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
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
                gap: 12,
              }}
            >
              {/* LEFT: DEDUCTIONS + LIMITS */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <h4 style={{ color: "#2a4365", margin: 0 }}>Deductions</h4>

                {/* PF LIMIT */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{ fontSize: 13, fontWeight: 600, marginLeft: 22 }}
                  >
                    PF Limit
                  </span>
                  <input
                    type="text"
                    value={pfLimit}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*\.?\d*$/.test(val)) setPfLimit(val);
                    }}
                    className="form-control"
                    style={{
                      width: 90,
                      height: 26,
                      fontSize: 13,
                      padding: "2px 6px",
                    }}
                    placeholder="0.00"
                  />
                </div>

                {/* ESI LIMIT */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    ESI Limit
                  </span>
                  <input
                    type="text"
                    value={esiLimit}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*\.?\d*$/.test(val)) setEsiLimit(val);
                    }}
                    className="form-control"
                    style={{
                      width: 90,
                      height: 26,
                      fontSize: 13,
                      padding: "2px 6px",
                    }}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* RIGHT: REFRESH BUTTON */}
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
                    {/* PF / ESI = STATUTORY RADIOS | Others = NORMAL RADIO GROUP */}
                    {d.Name === "PF" || d.Name === "ESI" ? (
                      <input
                        type="radio"
                        /* ❌ NO name attribute → no mutual exclusion */
                        checked={
                          d.Name === "PF" || d.Name === "ESI"
                            ? !!deductionAllowanceMap[d.Name]?.BaseSalary
                            : activeDeduction === d.Name
                        }
                        onChange={() => {
                          // 🔥 PF / ESI are always ON once selected
                          setActiveStatutory((prev) => ({
                            ...prev,
                            [d.Name]: true,
                          }));

                          // 🔥 DO NOT set activeDeduction here
                          activateDeductionWithBase(d.Name);

                          // 🔥 Ensure % exists (API or previous)
                          const percentObj = getEffectivePercentage(d.Name);
                          setEditablePercentages((prev) => ({
                            ...prev,
                            [d.Name]:
                              prev[d.Name] ?? percentObj?.Percentage ?? 0,
                          }));

                          setAdValueType((prev) => ({
                            ...prev,
                            [d.Name]: "PERCENT",
                          }));

                          setCalculatedAD((prev) => ({
                            ...prev,
                            [d.Name]: true,
                          }));

                          // 🔥 Trigger recalculation safely
                          setDeductionAmounts((prev) => ({
                            ...prev,
                            [d.Name]: prev[d.Name] || 0,
                          }));
                        }}
                        style={{ transform: "scale(1.1)" }}
                      />
                    ) : (
                      <input
                        type="radio"
                        name="deductionMain"
                        value={d.Name}
                        checked={activeDeduction === d.Name}
                        onChange={(e) => {
                          const name = e.target.value;

                          // ✅ ONLY other deductions control activeDeduction
                          setActiveDeduction(name);

                          const percentObj = getEffectivePercentage(name);

                          setEditablePercentages((prev) => ({
                            ...prev,
                            [name]: prev[name] ?? percentObj?.Percentage ?? 0,
                          }));

                          setAdValueType((prev) => ({
                            ...prev,
                            [name]: "PERCENT",
                          }));

                          setCalculatedAD((prev) => ({
                            ...prev,
                            [name]: true,
                          }));

                          setDeductionAmounts((prev) => ({
                            ...prev,
                            [name]: prev[name] || 0,
                          }));
                        }}
                        style={{ transform: "scale(1.1)" }}
                      />
                    )}

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

                            setEditablePercentages((prev) => ({
                              ...prev,
                              [d.Name]: "",
                            }));

                            setAdFormula((prev) => ({
                              ...prev,
                              [d.Name]: null,
                            }));
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
                      {(d.Name === "PF"
                        ? !!deductionAllowanceMap.PF?.BaseSalary &&
                          adValueType.PF === "PERCENT"
                        : d.Name === "ESI"
                        ? !!deductionAllowanceMap.ESI?.BaseSalary &&
                          adValueType.ESI === "PERCENT"
                        : activeDeduction === d.Name &&
                          adValueType[d.Name] === "PERCENT") && (
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
                        value={deductionAmounts[d.Name] ?? ""}
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

            {/* OTHER DEDUCTIONS HEADER */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "30px 1fr 40px 60px",
                alignItems: "center",
                margin: "20px 0 10px",
              }}
            >
              {/* Empty radio column */}
              <div />

              {/* Heading */}
              <h4 style={{ color: "#2a4365", margin: 0, marginLeft: -30 }}>
                Other Deductions
              </h4>

              {/* Per Day heading — NOW aligned with checkbox column */}
              <div
                style={{
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#1e293b",
                  marginLeft: -30,
                }}
              >
                Per Day
              </div>

              {/* Empty FX column */}
              <div />
            </div>

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
                const showPerDay =
                  d.Name === "Food" ||
                  d.Name === "Accommodation" ||
                  d.Name === "Uniform";

                return (
                  <div
                    key={d.ID}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "30px 1fr 40px 60px",
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

                        // 🔥 SAME SAFETY NET AS MAIN DEDUCTIONS
                        const percentObj = getEffectivePercentage(name);

                        setEditablePercentages((prev) => ({
                          ...prev,
                          [name]: prev[name] ?? percentObj?.Percentage ?? 0,
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

                            setEditablePercentages((prev) => ({
                              ...prev,
                              [d.Name]: "",
                            }));

                            setAdFormula((prev) => ({
                              ...prev,
                              [d.Name]: null,
                            }));
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
                        value={deductionAmounts[d.Name] ?? ""}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;

                          // 1️⃣ store amount
                          setDeductionAmounts((prev) => ({
                            ...prev,
                            [d.Name]: val,
                          }));

                          // 2️⃣ FORCE FIXED mode
                          setAdValueType((prev) => ({
                            ...prev,
                            [d.Name]: "FIXED",
                          }));

                          // 3️⃣ MARK AS REAL (not preview)
                          setCalculatedAD((prev) => ({
                            ...prev,
                            [d.Name]: true,
                          }));

                          // 4️⃣ REMOVE formula (fixed has none)
                          setAdFormula((prev) => ({
                            ...prev,
                            [d.Name]: null,
                          }));
                        }}
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

                    {/* PER DAY checkbox (only for selected items) */}
                    {showPerDay ? (
                      <input
                        type="checkbox"
                        checked={!!perDayOD[d.Name]}
                        onChange={(e) =>
                          setPerDayOD((prev) => ({
                            ...prev,
                            [d.Name]: e.target.checked,
                          }))
                        }
                        style={{
                          transform: "scale(1.1)",
                          justifySelf: "center",
                        }}
                      />
                    ) : (
                      <div /> // placeholder to keep alignment
                    )}

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
