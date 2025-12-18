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
  const [isViewMode, setIsViewMode] = useState(false);

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
  const [designation, setDesignation] = useState("");
  const [excludeEmployees, setExcludeEmployees] = useState(false);
  const [excludedEmployeeIds, setExcludedEmployeeIds] = useState([]);
  const [adFormula, setAdFormula] = useState({});
  const [selectedSG, setSelectedSG] = useState("");
  const [employees, setEmployees] = useState([]);
  const [deductionFormulaMap, setDeductionFormulaMap] = useState({});
  const [odDoubleFlags, setOdDoubleFlags] = useState({});
  const [multiplyValues, setMultiplyValues] = useState({});
  const [showMultiplier, setShowMultiplier] = useState({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [manualAD, setManualAD] = useState({});
  const [suppressPreview, setSuppressPreview] = useState({});
  const [adModeMap, setAdModeMap] = useState({}); // "percentage" or "fixed"
  const [editablePercentages, setEditablePercentages] = useState({});

  const [form, setForm] = useState({
    salaryGroupName: "",
    totalWorkingDays: "",
    shiftHours: "",
  });

  const [propertyDefaults, setPropertyDefaults] = useState({
    totalWorkingDays: "",
    shiftHours: "",
  });

  const basicAllowance = {
    ID: "BASIC",
    Name: "Basic",
    Type: "A",
  };

  useEffect(() => {
    if (!propertyId) return;
    loadPropertyInfo();
    loadSG();
    loadAD();
  }, [propertyId]);

  useEffect(() => {
    if (!propertyId) return;

    (async () => {
      try {
        const data = await getEmployeesByOffice(propertyId);

        const mappedEmployees = (data || [])
          .filter(e => e.Profile && e.FacilityMember)
          .map((e) => ({
            FacilityMemberId: e.FacilityMember.FacilityMemberId,
            EmployeeName: e.Profile.EmployeeName || "",
            PhoneNumber: e.Profile.PhoneNumber || "",
            Designation:
              e.EmployeeList?.Designation ||
              e.Profile.Designation ||
              "",
            SG_Link_ID: e.FacilityMember.SG_Link_ID
              ? parseInt(e.FacilityMember.SG_Link_ID)
              : null,
          }));

        setEmployees(mappedEmployees);
      } catch (err) {
        console.error("Failed to load employees", err);
      }
    })();
  }, [propertyId]);


  // Initialize mode map and editable percentages
  useEffect(() => {
    if (adPercentages.length === 0) return;

    const modeMap = {};
    const percentMap = {};

    adPercentages.forEach((item) => {
      modeMap[item.AD_Name] = "percentage";
      percentMap[item.AD_Name] = item.Percentage;
    });

    setAdModeMap(modeMap);
    setEditablePercentages(percentMap);
  }, [adPercentages]);

  useEffect(() => {
    if (!propertyId) return;

    (async () => {
      try {
        const empData = await FacilityMemberService.getFacilityMembers(propertyId);
        setEmployees(empData || []);
      } catch (err) {
        console.error("Failed to load employees", err);
      }
    })();
  }, [propertyId]);

  useEffect(() => {
    const base = Number(allowanceAmounts.Basic);
    if (!base) return;

    allowances.forEach((a) => {
      if (a.Name === "Basic") return;
      if (manualAD[a.Name]) return;
      handleAllowanceSelect(a, true);
    });
  }, [allowanceAmounts.Basic]);

  useEffect(() => {
    loadADPercentages();
  }, []);

  useEffect(() => {
    if (!activeDeduction) return;
    setAllowanceSelected(deductionAllowanceMap[activeDeduction] || {});
  }, [activeDeduction]);

  useEffect(() => {
    if (!activeDeduction) return;
    if (loadingSG) return;

    const deductionObj =
      deductions.find((x) => x.Name === activeDeduction) ||
      otherDeductions.find((x) => x.Name === activeDeduction);

    handleDeductionSelect(deductionObj);
  }, [allowanceSelected]);

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
      if (name === "Basic") return;
      let fixed = 0;
      let calculated = 0;

      if (item.Type === "D" || item.Type === "OD") {
        if (calculatedAD[name] || (adFormula && adFormula[name])) {
          calculated = deductionAmounts[name] || 0;
        } else {
          fixed = deductionAmounts[name] || 0;
        }
      } else {
        if (calculatedAD[name] && adFormula[name]) {
          calculated = allowanceAmounts[name] || 0;
        } else {
          fixed = allowanceAmounts[name] || 0;
        }
      }

      if (name === "OTAmount" && allowanceSelected["OTAmount"]) {
        list.push({
          AD_Id: item.ID,
          Name: name,
          Type: item.Type,
          FixedAmount: fixed,
          CalculatedAmount: calculated,
          Formula: adFormula[name] || null,
          FormulaId: null,
          IsDouble: false,
        });
        return;
      }

      if (item.Type !== "D" && item.Type !== "OD") {
        if (fixed === 0) return;
      } else {
        if (manualAD[name]) {
          fixed = deductionAmounts[name] || 0;
          calculated = 0;
        } else {
          if (
            !calculatedAD[name] &&
            !(adFormula[name] && deductionFormulaMap[name])
          )
            return;
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
        Dependencies:
          item.Type === "D" || item.Type === "OD"
            ? Object.keys(deductionAllowanceMap[name] || {}).filter(
              (k) => deductionAllowanceMap[name][k]
            )
            : null,
      });
    });

    return list;
  };

  const handleAllowanceSelect = (allowance, isPreview = false) => {
    if (!allowance) return;

    const name = allowance.Name;
    const mode = adModeMap[name] || "percentage";

    if (mode === "fixed") return;

    const percentage = editablePercentages[name] || 0;
    if (!percentage) return;

    const base = Number(allowanceAmounts.Basic) || 0;
    let total = base;
    let formulaParts = ["Base"];

    Object.keys(allowanceSelected).forEach((key) => {
      if (allowanceSelected[key] && key !== name) {
        const value = Number(allowanceAmounts[key]) || 0;
        total += value;
        formulaParts.push(key);
      }
    });

    const amount = Math.round(total * (percentage / 100));
    const formula =
      formulaParts.length === 1
        ? `Base * ${percentage / 100}`
        : `(${formulaParts.join(" + ")}) * ${percentage / 100}`;

    if (isPreview) {
      setAllowanceAmounts((prev) => ({ ...prev, [name]: amount }));
      setAdFormula((prev) => ({ ...prev, [name]: formula }));
      return;
    }

    setCalculatedAD((prev) => ({ ...prev, [name]: true }));
    setAllowanceAmounts((prev) => ({ ...prev, [name]: amount }));
    setAdFormula((prev) => ({ ...prev, [name]: formula }));
  };

  const handleDeductionSelect = (deduction, isPreview = false) => {
    if (!deduction) return;

    const name = deduction.Name;
    const mode = adModeMap[name] || "percentage";
    if (mode === "fixed") return;

    const percentage = editablePercentages[name] || 0;
    if (!percentage) return;

    const selectedAllowances = deductionAllowanceMap[name] || {};

    let total = 0;
    let formulaParts = [];

    Object.keys(selectedAllowances).forEach((key) => {
      if (selectedAllowances[key]) {
        const value =
          key === "Basic"
            ? Number(allowanceAmounts.Basic) || 0
            : Number(allowanceAmounts[key]) || 0;

        total += value;
        formulaParts.push(key);
      }
    });

    if (total === 0) return;

    const amount = Math.round(total * (percentage / 100));
    const formula =
      `(${formulaParts.join(" + ")}) * ${percentage / 100}`;

    if (isPreview) {
      setDeductionAmounts((prev) => ({ ...prev, [name]: amount }));
      setAdFormula((prev) => ({ ...prev, [name]: formula }));
      return;
    }

    setCalculatedAD((prev) => ({ ...prev, [name]: true }));
    setDeductionAmounts((prev) => ({ ...prev, [name]: amount }));
    setAdFormula((prev) => ({ ...prev, [name]: formula }));
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

  const cleanList = adList;
  const allowances = [basicAllowance, ...cleanList.filter((x) => x.Type === "A")];
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

      setPropertyDefaults({
        totalWorkingDays: twd,
        shiftHours: sh,
      });

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

    setForm({
      salaryGroupName: sg.SalaryGroup,
      totalWorkingDays: sg.TotalWorkingDays,
      shiftHours: sg.ShiftHours,
    });

    setAllowanceAmounts((prev) => ({
      ...prev,
      Basic: sg.BaseSalary,
    }));

    let newAllowances = {};
    let newDeductions = {};
    let calcFlags = {};
    let formulas = {};
    let newDeductionAllowanceMap = {};

    sg.AllowancesDeductions.forEach((ad) => {
      if ((ad.Type === "D" || ad.Type === "OD") && ad.Dependencies?.length) {
        newDeductionAllowanceMap[ad.Name] = {};
        ad.Dependencies.forEach((dep) => {
          newDeductionAllowanceMap[ad.Name][dep] = true;
        });
      }
    });

    setDeductionAllowanceMap(newDeductionAllowanceMap);


    sg.AllowancesDeductions.forEach((ad) => {
      const name = ad.Name;

      if (ad.CalculatedAmount && ad.CalculatedAmount > 0) {
        newDeductions[name] = ad.CalculatedAmount;
        calcFlags[name] = true;

        if (ad.Formula) {
          formulas[name] = ad.Formula;
        }
        return;
      }

      if (ad.FixedAmount && ad.FixedAmount > 0) {
        if (ad.Type === "A" || ad.Type === "OA") {
          newAllowances[name] = ad.FixedAmount;
        } else {
          newDeductions[name] = ad.FixedAmount;
        }
      }
    });

    setAllowanceAmounts({
      Basic: sg.BaseSalary,
      ...newAllowances,
    });

    setDeductionAmounts(newDeductions);
    setCalculatedAD(calcFlags);
    setAdFormula(formulas);
    setActiveDeduction(null);

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
        BaseSalary: Number(allowanceAmounts.Basic),
        Property_ID: propertyId,
        TotalWorkingDays: Number(form.totalWorkingDays),
        ShiftHours: Number(form.shiftHours),
        AllowancesDeductions: adModel,
        CreatedBy: 1,
        UpdatedBy: 1,
        IsActive: true,
      };

      if (isUpdate) {
        await updateSalaryAllowance(model.SalaryGroup_ID, model);
        alert("Salary group updated!");
      } else {
        await createSalaryAllowance(model);
        alert("Salary group created!");
      }

      await loadSG();
      resetSalaryGroupForm();
    } catch (err) {
      alert("Save failed! Check console.");
      console.log(err);
    }
  };

  const totalAllowance = Object.keys(allowanceAmounts)
    .filter((key) => Number(allowanceAmounts[key]) > 0)
    .reduce((sum, key) => sum + Number(allowanceAmounts[key]), 0);

  const totalDeduction = Object.keys(deductionAmounts).reduce(
    (sum, key) => sum + (Number(deductionAmounts[key]) || 0),
    0
  );

  const totalGross = (Number(allowanceAmounts.Basic) || 0) + totalAllowance;
  const netPay = totalGross - totalDeduction;

  const SalarySummaryBox = () => (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: "8px 12px",
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
        <div style={{ flex: 1 }}>
          Total Gross = <span style={{ color: "#000" }}>₹ {totalGross.toFixed(2)}</span>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          Total Deduction = <span style={{ color: "#000" }}>₹ {totalDeduction.toFixed(2)}</span>
        </div>
        <div style={{ flex: 1, textAlign: "right" }}>
          Net Pay = <span style={{ color: "#2b6cb0" }}>₹ {netPay.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
  const filteredEmployees = React.useMemo(() => {
    if (!designation) return employees; // no designation selected → show all
    return employees.filter(
      (emp) => emp.Designation === designation
    );
  }, [employees, designation]);

  const resetSalaryGroupForm = () => {
    setForm({
      salaryGroupName: "",
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

  const handleRefreshSelections = () => {
    setActiveDeduction(null);
    setAllowanceSelected({});
    setDeductionAllowanceMap({});
    setOdDoubleFlags({});
    setMultiplyValues({});
    setShowMultiplier({});
  };

  const renderAllowanceRow = (a) => (
    <div
      key={a.ID}
      style={{
        display: "grid",
        gridTemplateColumns: "24px 90px 100px 1fr 44px",
        columnGap: 4,
        marginBottom: 4,
        alignItems: "center",
      }}
    >
      <input
        type="checkbox"
        checked={a.Name === "Basic" ? true : !!allowanceSelected[a.Name]}
        onChange={(e) => {
          if (!activeDeduction && a.Name !== "Basic") {
            alert("Please select a deduction first!");
            return;
          }

          const checked = e.target.checked;

          setDeductionAllowanceMap((prev) => {
            const existing = prev[activeDeduction] || {};
            return {
              ...prev,
              [activeDeduction]: {
                ...existing,
                [a.Name]: checked,
              },
            };
          });

          setAllowanceSelected((prev) => ({
            ...prev,
            [a.Name]: checked,
          }));
        }}
        style={{ transform: "scale(1.1)" }}
        disabled={a.Name === "Basic"}
      />

      <span style={{ fontSize: 14 }}>{a.Name}</span>

      <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
        <select
          className="form-control"
          style={{
            width: "60px",
            height: "28px",
            padding: "2px 4px",
            fontSize: "12px",
          }}
          value={adModeMap[a.Name] || "percentage"}
          onChange={(e) => {
            const mode = e.target.value;
            setAdModeMap((prev) => ({ ...prev, [a.Name]: mode }));
            if (mode === "fixed") {
              setAdFormula((prev) => ({ ...prev, [a.Name]: null }));
              setCalculatedAD((prev) => ({ ...prev, [a.Name]: false }));
            }
          }}
          disabled={a.Name === "Basic"}
        >
          <option value="percentage">%</option>
          <option value="fixed">#</option>
        </select>

        {adModeMap[a.Name] === "percentage" && a.Name !== "Basic" && (
          <input
            type="number"
            className="form-control"
            style={{
              width: "50px",
              height: "28px",
              padding: "2px 4px",
              fontSize: "12px",
            }}
            value={editablePercentages[a.Name] || ""}
            onChange={(e) => {
              const value = Number(e.target.value);
              setEditablePercentages((prev) => ({ ...prev, [a.Name]: value }));
              if (value > 0) {
                handleAllowanceSelect(a, true);
              }
            }}
            placeholder="%"
          />
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="number"
          className="form-control"
          style={{
            width: 120,
            height: "28px",
            padding: "2px 6px",
            fontSize: "13px",
            backgroundColor: "#fff",
          }}
          value={allowanceAmounts[a.Name] || ""}
          onChange={(e) => {
            const value = Number(e.target.value) || 0;
            if (a.Name === "Basic") {
              setAllowanceAmounts((prev) => ({ ...prev, Basic: value }));
              setIsPreviewMode(true);
              return;
            }
            setManualAD((prev) => ({ ...prev, [a.Name]: true }));
            setAllowanceAmounts((prev) => ({ ...prev, [a.Name]: value }));
            setAdFormula((prev) => ({ ...prev, [a.Name]: null }));
          }}
          disabled={
            a.Name !== "Basic" &&
            adModeMap[a.Name] === "percentage" &&
            !manualAD[a.Name]
          }
        />
        {adFormula[a.Name] && !manualAD[a.Name] && (
          <span style={{ fontSize: 12, color: "#555" }}>
            = {adFormula[a.Name]}
          </span>
        )}
      </div>

      <button
        className="btn btn-sm btn-secondary"
        style={{ width: "100%", padding: "4px 0", fontSize: 12 }}
      >
        FX
      </button>
    </div>
  );

  const renderDeductionRow = (d, radioName) => {
    const isReal = activeDeduction === d.Name || !!calculatedAD[d.Name];
    const isManual = manualAD[d.Name];

    return (
      <div
        key={d.ID}
        style={{
          display: "grid",
          gridTemplateColumns: "24px 90px 100px 1fr 44px",
          columnGap: 4,
          marginBottom: 4,
          alignItems: "center",
        }}
      >
        <input
          type="radio"
          name={radioName}
          value={d.Name}
          checked={activeDeduction === d.Name}
          onChange={(e) => setActiveDeduction(e.target.value)}
          style={{ transform: "scale(1.1)" }}
        />

        <span style={{ fontSize: 14 }}>{d.Name}</span>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <select
            className="form-control"
            style={{
              width: "60px",
              height: "28px",
              padding: "2px 4px",
              fontSize: "12px",
            }}
            value={adModeMap[d.Name] || "percentage"}
            onChange={(e) => {
              const mode = e.target.value;
              setAdModeMap((prev) => ({ ...prev, [d.Name]: mode }));
              if (mode === "fixed") {
                setAdFormula((prev) => ({ ...prev, [d.Name]: null }));
                setCalculatedAD((prev) => ({ ...prev, [d.Name]: false }));
              }
            }}
          >
            <option value="percentage">%</option>
            <option value="fixed">#</option>
          </select>

          {adModeMap[d.Name] === "percentage" && (
            <input
              type="number"
              className="form-control"
              style={{
                width: "50px",
                height: "28px",
                padding: "2px 4px",
                fontSize: "12px",
              }}
              value={editablePercentages[d.Name] || ""}
              onChange={(e) => {
                const value = Number(e.target.value);
                setEditablePercentages((prev) => ({ ...prev, [d.Name]: value }));
                if (value > 0) {
                  handleDeductionSelect(d, true);
                }
              }}
              placeholder="%"
            />
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="number"
            className="form-control"
            style={{
              width: 120,
              height: "28px",
              padding: "2px 6px",
              fontSize: "13px",
              color: isManual ? "#000" : isReal ? "#000" : "rgba(0,0,0,0.3)",
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
            }}
            onFocus={() => {
              setSuppressPreview((prev) => ({ ...prev, [d.Name]: true }));
              const val = deductionAmounts[d.Name];
              if (!isManual && !isReal && isPreviewMode && Number(val) > 0) {
                setDeductionAmounts((prev) => ({ ...prev, [d.Name]: "" }));
                setAdFormula((prev) => ({ ...prev, [d.Name]: "" }));
              }
            }}
            onBlur={() => {
              const value = deductionAmounts[d.Name];
              if (!isManual && (value === "" || value === undefined)) {
                handleDeductionSelect(d, true);
              }
              setSuppressPreview((prev) => ({ ...prev, [d.Name]: false }));
            }}
            value={
              isManual
                ? deductionAmounts[d.Name] || ""
                : isReal
                  ? deductionAmounts[d.Name] || ""
                  : isPreviewMode
                    ? Number(deductionAmounts[d.Name]) > 0
                      ? Number(deductionAmounts[d.Name]).toFixed(2)
                      : ""
                    : ""
            }
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                setManualAD((prev) => ({ ...prev, [d.Name]: false }));
                setDeductionAmounts((prev) => ({ ...prev, [d.Name]: undefined }));
                return;
              }
              setManualAD((prev) => ({ ...prev, [d.Name]: true }));
              setDeductionAmounts((prev) => ({ ...prev, [d.Name]: Number(value) }));
            }}
            disabled={adModeMap[d.Name] === "percentage" && !isManual}
          />

          <span style={{ fontSize: 12, color: "#555", whiteSpace: "nowrap" }}>
            {isManual
              ? ""
              : isReal
                ? adFormula[d.Name]
                  ? `= ${adFormula[d.Name]}`
                  : ""
                : isPreviewMode
                  ? adFormula[d.Name] && (
                    <span style={{ opacity: 0.4 }}>= {adFormula[d.Name]}</span>
                  )
                  : ""}
          </span>
        </div>

        <button
          className="btn btn-sm btn-secondary"
          style={{ width: "100%", padding: "4px 0", fontSize: 12 }}
        >
          FX
        </button>
      </div>
    );
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
        {/* Header Section */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 3 }}>
          <div
            style={{
              display: "inline-block",
              background: "#e2e8f0",
              padding: "8px 18px",
              borderRadius: "6px",
              borderLeft: "5px solid #1e3a8a",
              marginBottom: "5px",
              marginTop: "-10px",
            }}
          >
            <h2
              style={{
                margin: 0,
                padding: 0,
                fontSize: 22,
                fontWeight: 700,
                color: "#1e3a8a",
                letterSpacing: "0.3px",
              }}
            >
              CREATE SALARY GROUP
            </h2>
          </div>

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

        {/* Row 2: Working Days and Shift Hours */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 25,
            marginBottom: 10,
            paddingLeft: "10px",
          }}
        >
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

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 5 }}>
              Designation <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              className="form-control"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              disabled={isViewMode}
              required
            >
              <option value="">-- Select Designation --</option>
              {Array.from(new Set(employees.map(emp => emp.Designation).filter(Boolean)))
                .sort()
                .map((desig) => (
                  <option key={desig} value={desig}>
                    {desig}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="excludeEmployees"
              checked={excludeEmployees}
              onChange={(e) => setExcludeEmployees(e.target.checked)}
              disabled={isViewMode}
            />
            <label className="form-check-label" htmlFor="excludeEmployees">
              Exclude specific employees
            </label>
          </div>
          {excludeEmployees && (
            <div className="mb-3">
              <label className="form-label">Exclude Employees</label>

              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  maxHeight: 250,
                  overflowY: "auto",
                  padding: 10,
                  background: "#fafafa",
                }}
              >
                {filteredEmployees.map((emp) => (
                  <div key={emp.FacilityMemberId} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={excludedEmployeeIds.includes(emp.FacilityMemberId)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setExcludedEmployeeIds((prev) =>
                          checked
                            ? [...prev, emp.FacilityMemberId]
                            : prev.filter((id) => id !== emp.FacilityMemberId)
                        );
                      }}
                    />
                    <label className="form-check-label">
                      {emp.EmployeeName}
                    </label>
                  </div>
                ))}

              </div>
            </div>
          )}

        </div>

        <hr style={{ margin: "3px 0", borderTop: "3px solid #001affff" }} />

        {/* Main Grid Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* LEFT SIDE: ALLOWANCES */}
          <div>
            <h4 style={{ color: "#2a4365", marginBottom: 10, maxHeight: "20px" }}>
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
              {allowances.map((a) => renderAllowanceRow(a))}
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
                if (a.Name === "OTAmount") {
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
                          setAllowanceSelected((prev) => ({
                            ...prev,
                            [a.Name]: checked,
                          }));
                        }}
                        style={{ transform: "scale(1.1)" }}
                      />

                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 14,
                          marginTop: 4,
                        }}
                      >
                        <span style={{ width: 120, marginTop: 2 }}>{a.Name}</span>

                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 3,
                            opacity: allowanceSelected[a.Name] ? 1 : 0.4,
                            cursor: allowanceSelected[a.Name]
                              ? "pointer"
                              : "not-allowed",
                          }}
                        >
                          <input
                            type="checkbox"
                            disabled={!allowanceSelected[a.Name]}
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

                        {odDoubleFlags[a.Name] && (
                          <select
                            style={{
                              width: 65,
                              height: 26,
                              fontSize: 12,
                              marginLeft: 6,
                              marginTop: 2,
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

                      <button
                        className="btn btn-sm btn-secondary"
                        style={{ width: "100%", padding: "4px 0", fontSize: 12 }}
                      >
                        FX
                      </button>
                    </div>
                  );
                }
                return renderAllowanceRow(a);
              })}
            </div>
          </div>

          {/* RIGHT SIDE: DEDUCTIONS */}
          <div>
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
              {deductions.map((d) => renderDeductionRow(d, "deductionMain"))}
            </div>

            {/* SALARY SUMMARY */}
            <h4 style={{ color: "#2a4365", margin: "15px 0 8px" }}>
              Salary Summary
            </h4>
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: "10px 12px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <strong>Total Gross:</strong>
                <span>₹ {totalGross.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <strong>Total Deduction:</strong>
                <span>₹ {totalDeduction.toFixed(2)}</span>
              </div>
              <hr style={{ margin: "6px 0" }} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                  fontSize: 16,
                  color: "#2b6cb0",
                  marginTop: 2,
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
              {otherDeductions.map((d) => renderDeductionRow(d, "deductionOther"))}
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