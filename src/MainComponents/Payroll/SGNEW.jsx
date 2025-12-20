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
  const [isViewMode, setIsViewMode] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupGroup, setPopupGroup] = useState(null);
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
  const [designations, setDesignations] = useState([]);

  const [excludeEmployees, setExcludeEmployees] = useState(false);
  const [excludedEmployeeIds, setExcludedEmployeeIds] = useState([]);
  const [adFormula, setAdFormula] = useState({});
  const [selectedSG, setSelectedSG] = useState("");
  const [employees, setEmployees] = useState([]);
  const [salaryGroupsData, setSalaryGroupsData] = useState([]);
  const [deductionFormulaMap, setDeductionFormulaMap] = useState({});
  const [odDoubleFlags, setOdDoubleFlags] = useState({});
  const [multiplyValues, setMultiplyValues] = useState({});
  const [showMultiplier, setShowMultiplier] = useState({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [manualAD, setManualAD] = useState({});
  const [suppressPreview, setSuppressPreview] = useState({});
  const [adModeMap, setAdModeMap] = useState({}); // "percentage" or "fixed"
  const [editablePercentages, setEditablePercentages] = useState({});
const [designationList, setDesignationList] = useState([]);

  const [form, setForm] = useState({
    salaryGroupName: "",
    totalWorkingDays: "",
    shiftHours: "",
  });

  const [propertyDefaults, setPropertyDefaults] = useState({
    totalWorkingDays: "",
    shiftHours: "",
  });

  useEffect(() => {
  (async () => {
    try {
      const res = await getAllDesignations();
      setDesignationList(res || []);
    } catch (err) {
      console.error("Failed to load designations", err);
    }
  })();
}, []);


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

  useEffect(() => {
    async function fetchSalaryGroups() {
      if (!propertyId) return;
      try {
        const res = await getSalaryAllowancesByProperty(propertyId);
        setSalaryGroupsData(res || []);
      } catch {
        setSalaryGroupsData([]);
      }
    }

    fetchSalaryGroups();
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

    const basic = Number(allowanceAmounts.Basic) || 0;

    // ✅ DEFAULT: only Basic
    let total = basic;
    let formulaParts = ["Basic"];

    // 🔁 ONLY include other allowances if explicitly selected (and not Basic)
    Object.keys(allowanceSelected).forEach((key) => {
      if (
        allowanceSelected[key] &&
        key !== "Basic" &&
        key !== name
      ) {
        const value = Number(allowanceAmounts[key]) || 0;
        total += value;
        formulaParts.push(key);
      }
    });

    const amount = Math.round(total * (percentage / 100));
    const formula =
      formulaParts.length === 1
        ? `Basic * ${percentage / 100}`
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

    const selectedAllowances =
      deductionAllowanceMap[name] && Object.keys(deductionAllowanceMap[name]).length
        ? deductionAllowanceMap[name]
        : { Basic: true };


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
        Designations: designations,
        ExcludedEmployeeIds: excludedEmployeeIds,
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

  const getGroupNameById = (id) => {
    if (!id) return null;
    const group = salaryGroupsData.find(
      (g) => parseInt(g.SalaryGroup_ID) === parseInt(id)
    );
    return group ? group.SalaryGroup : null;
  };

  const handleGroupClick = (groupId) => {
    const group = salaryGroupsData.find(
      (g) => parseInt(g.SalaryGroup_ID) === parseInt(groupId)
    );

    if (!group) return;

    setPopupGroup(group);
    setPopupVisible(true);
  };

const filteredEmployees = React.useMemo(() => {
  if (!designations.length) return employees;

  return employees.filter((emp) =>
    designations.includes(emp.Designation)
  );
}, [employees, designations]);


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
    setDesignations([]);
    setExcludedEmployeeIds([]);
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
  useEffect(() => {
    if (!activeDeduction) return;

    const deduction =
      deductions.find((d) => d.Name === activeDeduction) ||
      otherDeductions.find((d) => d.Name === activeDeduction);

    if (!deduction) return;
    if (adModeMap[deduction.Name] !== "percentage") return;
    if (manualAD[deduction.Name]) return;

    handleDeductionSelect(deduction, true);
  }, [
    activeDeduction,
    editablePercentages,
    deductionAllowanceMap,
    allowanceAmounts,
    adModeMap,
  ]);
  useEffect(() => {
    if (!allowanceAmounts.Basic) return;

    allowances.forEach((a) => {
      if (a.Name === "Basic") return;
      if (adModeMap[a.Name] !== "percentage") return;
      if (manualAD[a.Name]) return;

      handleAllowanceSelect(a, true); // preview recalculation
    });
  }, [
    allowanceAmounts.Basic,
    editablePercentages,
    allowanceSelected,
    adModeMap,
  ]);

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
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={a.Name === "Basic" ? true : !!allowanceSelected[a.Name]}
        disabled={a.Name === "Basic"}
        onChange={(e) => {
          if (!activeDeduction && a.Name !== "Basic") {
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

      <span style={{ fontSize: 14 }}>{a.Name}</span>

      {/* Mode + Percentage */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <select
          className="form-control"
          style={{ width: 60, height: 28, fontSize: 12 }}
          value={adModeMap[a.Name] || "percentage"}
          disabled={a.Name === "Basic"}
          onChange={(e) => {
            const mode = e.target.value;
            setAdModeMap((prev) => ({ ...prev, [a.Name]: mode }));

            if (mode === "fixed") {
              setCalculatedAD((prev) => ({ ...prev, [a.Name]: false }));
              setAdFormula((prev) => ({ ...prev, [a.Name]: null }));
            }
          }}
        >
          <option value="percentage">%</option>
          <option value="fixed">#</option>
        </select>

        {adModeMap[a.Name] === "percentage" && a.Name !== "Basic" && (
          <input
            type="number"
            className="form-control"
            style={{ width: 60, height: 28, fontSize: 12 }}
            value={editablePercentages[a.Name] ?? ""}
            placeholder="%"
            onChange={(e) => {
              const value = Number(e.target.value);
              setEditablePercentages((prev) => ({
                ...prev,
                [a.Name]: value,
              }));
              // 🔥 recalculation handled by useEffect
            }}
          />
        )}
      </div>

      {/* Amount + Formula */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="number"
          className="form-control"
          style={{ width: 120, height: 28, fontSize: 13 }}
          value={allowanceAmounts[a.Name] ?? ""}
          disabled={
            a.Name !== "Basic" &&
            adModeMap[a.Name] === "percentage" &&
            !manualAD[a.Name]
          }
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
        />

        {!manualAD[a.Name] && adFormula[a.Name] && (
          <span style={{ fontSize: 12, color: "#555" }}>
            = {adFormula[a.Name]}
          </span>
        )}
      </div>

      <button className="btn btn-sm btn-secondary">FX</button>
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
        {/* Radio */}
        <input
          type="radio"
          name={radioName}
          value={d.Name}
          checked={activeDeduction === d.Name}
          style={{ transform: "scale(1.1)" }}
          onChange={() => {
            setActiveDeduction(d.Name);

            setDeductionAllowanceMap((prev) => ({
              ...prev,
              [d.Name]: { Basic: true, ...(prev[d.Name] || {}) },
            }));

            setAllowanceSelected({ Basic: true });
          }}
        />

        <span style={{ fontSize: 14 }}>{d.Name}</span>

        {/* Mode + Percentage */}
        <div style={{ display: "flex", gap: 4 }}>
          <select
            className="form-control"
            style={{ width: 60, height: 28, fontSize: 12 }}
            value={adModeMap[d.Name] || "percentage"}
            onChange={(e) => {
              const mode = e.target.value;
              setAdModeMap((prev) => ({ ...prev, [d.Name]: mode }));

              if (mode === "fixed") {
                setCalculatedAD((prev) => ({ ...prev, [d.Name]: false }));
                setAdFormula((prev) => ({ ...prev, [d.Name]: null }));
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
              style={{ width: 70, height: 28, fontSize: 12 }}
              value={editablePercentages[d.Name] ?? ""}
              placeholder="%"
              onChange={(e) => {
                const value = Number(e.target.value);
                setEditablePercentages((prev) => ({
                  ...prev,
                  [d.Name]: value,
                }));
                // 🔥 recalculation handled by useEffect
              }}
            />
          )}
        </div>

        {/* Amount + Formula */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="number"
            className="form-control"
            style={{ width: 120, height: 28, fontSize: 13 }}
            value={deductionAmounts[d.Name] ?? ""}
            disabled={adModeMap[d.Name] === "percentage" && !isManual}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setManualAD((prev) => ({ ...prev, [d.Name]: false }));
                setDeductionAmounts((prev) => ({ ...prev, [d.Name]: undefined }));
                return;
              }

              setManualAD((prev) => ({ ...prev, [d.Name]: true }));
              setDeductionAmounts((prev) => ({
                ...prev,
                [d.Name]: Number(val),
              }));
            }}
          />

          {!isManual && adFormula[d.Name] && (
            <span style={{ fontSize: 12, color: "#555" }}>
              = {adFormula[d.Name]}
            </span>
          )}
        </div>

        <button className="btn btn-sm btn-secondary">FX</button>
      </div>
    );
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
            gap: 20,
            marginBottom: 10,
            paddingLeft: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label style={{ fontSize: 14, fontWeight: 600, paddingLeft: 60 }}>
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
            <label style={{ fontSize: 14, fontWeight: 600, paddingLeft: 100 }}>
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
  value={designations[0] || ""}
  onChange={(e) =>
    setDesignations(
      e.target.value ? [e.target.value] : []
    )
  }
  disabled={isViewMode}
  required
>
  <option value="">-- Select Designation --</option>

  {designationList.map((d) => (
    <option key={d.Designation_ID} value={d.DesignationName}>
      {d.DesignationName}
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
                {filteredEmployees.map((emp) => {
                  const assignedGroup = getGroupNameById(emp.SG_Link_ID);


                  return (
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

                        {/* 👇 Salary Group Link */}
                        {emp.SG_Link_ID && assignedGroup && (

                          <span
                            onClick={() => handleGroupClick(emp.SG_Link_ID)}
                            style={{
                              marginLeft: 6,
                              color: "#0f766e",
                              cursor: "pointer",
                              fontWeight: 500,
                            }}
                          >
                            ({assignedGroup})
                          </span>
                        )}
                      </label>
                    </div>
                  );
                })}


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
                    <td><b>Total Allowance:</b></td>
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
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                  }}
                >
                  <div
                    style={{
                      background: "#C6F6D5",
                      padding: "10px 0",
                      textAlign: "center",
                      fontWeight: 700,
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12
                    }}
                  >
                    Allowance
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ padding: 8, textAlign: "left" }}>Name</th>
                        <th style={{ padding: 8, textAlign: "right" }}>Amount</th>
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
                        <td style={{ padding: 8, fontWeight: 700 }}>Total Allowance:</td>
                        <td style={{ padding: 8, textAlign: "right", fontWeight: 700 }}>
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
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                  }}
                >
                  <div
                    style={{
                      background: "#FED7D7",
                      padding: "10px 0",
                      textAlign: "center",
                      fontWeight: 700,
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12
                    }}
                  >
                    Deduction
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ padding: 8, textAlign: "left" }}>Name</th>
                        <th style={{ padding: 8, textAlign: "right" }}>Amount</th>
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
                        <td style={{ padding: 8, fontWeight: 700 }}>Total Deduction:</td>
                        <td style={{ padding: 8, textAlign: "right", fontWeight: 700 }}>
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