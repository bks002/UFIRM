import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getSalaryAllowancesByProperty,
  getAllowanceDeductionsByProperty,
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

  const [form, setForm] = useState({
    salaryGroupName: "",
    baseSalary: "",
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

    const deductionObj = deductions.find((x) => x.Name === activeDeduction);
    if (deductionObj) handleDeductionSelect(deductionObj);
  }, [allowanceAmounts, form.baseSalary]);

  const handleAllowanceAmount = (name, value) => {
    setAllowanceAmounts((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleDeductionSelect = (deduction) => {
    const name = deduction.Name;

    // Click again → unselect
    if (activeDeduction === name) {
      setActiveDeduction(null);
      setDeductionAmounts((prev) => ({ ...prev, [name]: 0 }));
      return;
    }

    setActiveDeduction(name);

    // Find percentage
    const percentObj = adPercentages.find((x) => x.AD_Name === name);
    const percentage = percentObj ? percentObj.Percentage : 0;

    const base = Number(form.baseSalary) || 0;

    // CASE 1: PF → only Base
    if (name === "PF") {
      const amount = (base * percentage) / 100;
      setDeductionAmounts((prev) => ({ ...prev, [name]: amount }));
      return;
    }

    // CASE 2: ALL OTHER DEDUCTIONS (ESI, ABC, XYZ…)
    let total = base;

    Object.keys(allowanceAmounts).forEach((key) => {
      total += allowanceAmounts[key] || 0;
    });

    const amount = (total * percentage) / 100;

    setDeductionAmounts((prev) => ({ ...prev, [name]: amount }));
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

  const allowances = adList.filter((x) => x.Type === "A");
  const deductions = adList.filter((x) => x.Type === "D");
  const otherAllowances = adList.filter((x) => x.Type === "OA");
  const otherDeductions = adList.filter((x) => x.Type === "OD");

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

      setForm((prev) => ({
        ...prev,
        totalWorkingDays: res.TotalWorkingDays || "",
        shiftHours: res.ShiftHours || "",
      }));
    } catch (err) {
      console.log("Failed to fetch property:", err);
    }
  };

  const handleDropdownSelect = (sg) => {
    if (!sg) return;

    setForm({
      salaryGroupName: sg.SalaryGroup,
      baseSalary: sg.BaseSalary,
      totalWorkingDays: sg.TotalWorkingDays,
      shiftHours: sg.ShiftHours,
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Saving: ", form);
  };

  return (
    <div
      className="content-wrapper"
      style={{
        minHeight: "100vh",
        padding: 30,
        width: "100%",
        maxWidth: "100%",
        margin: 0,
        display: "block",
      }}
    >
      <div
        className="card"
        style={{
          width: "95%",
          margin: 0,
          borderRadius: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          padding: "25px 40px",
          background: "#f7fafc",
        }}
      >
        <h2 style={{ fontWeight: "bold", color: "#2a4365", marginBottom: 25 }}>
          Create Salary Group
        </h2>

        {/* Row 1 — Working Days + Shift Hours */}
        <div style={{ display: "flex", gap: 25 }}>
          <div style={{ flex: 1 }}>
            <label>Total Working Days</label>
            <input
              name="totalWorkingDays"
              value={form.totalWorkingDays}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div style={{ flex: 1 }}>
            <label>Shift Hours</label>
            <input
              name="shiftHours"
              value={form.shiftHours}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        {/* Row 2 — SG Name + Dropdown */}
        <div style={{ display: "flex", gap: 25, marginTop: 20 }}>
          <div style={{ flex: 1 }}>
            <label>Salary Group Name</label>
            <input
              name="salaryGroupName"
              value={form.salaryGroupName}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div style={{ flex: 1 }}>
            <label>Select Existing SG</label>
            <select
              className="form-control"
              onChange={(e) =>
                handleDropdownSelect(
                  salaryGroups.find((s) => s.SalaryGroup_ID == e.target.value)
                )
              }
            >
              <option value="">Choose...</option>
              {salaryGroups.map((sg) => (
                <option key={sg.SalaryGroup_ID} value={sg.SalaryGroup_ID}>
                  {sg.SalaryGroup}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Base Salary */}
        <div style={{ marginTop: 20 }}>
          <label>Base Salary</label>
          <input
            name="baseSalary"
            value={form.baseSalary}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {/* ALLOWANCE & DEDUCTION SECTION */}
        <div style={{ marginTop: 40 }}>
          {/* Main Row */}
          <div style={{ display: "flex", gap: 30 }}>
            {/* ALLOWANCES */}
            <div style={{ flex: 1 }}>
              <h4 style={{ color: "#2a4365", marginBottom: 10 }}>Allowances</h4>

              <div style={{ background: "#fff", padding: 15, borderRadius: 8 }}>
                {allowances.map((a) => (
                  <div
                    key={a.ID}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    {/* Dynamic checkbox */}
                    <input
                      type="checkbox"
                      checked={!!allowanceAmounts[a.Name]}
                      onChange={(e) =>
                        handleAllowanceAmount(
                          a.Name,
                          e.target.checked ? allowanceAmounts[a.Name] || 0 : 0
                        )
                      }
                    />

                    {/* Name */}
                    <span>{a.Name}</span>

                    {/* Amount box */}
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: 120 }}
                      value={allowanceAmounts[a.Name] || ""}
                      onChange={(e) =>
                        handleAllowanceAmount(a.Name, e.target.value)
                      }
                    />

                    {/* FX button */}
                    <button
                      className="btn btn-sm btn-secondary"
                      style={{ marginLeft: "auto" }}
                    >
                      FX
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* DEDUCTIONS */}
            <div style={{ flex: 1 }}>
              <h4 style={{ color: "#2a4365", marginBottom: 10 }}>Deductions</h4>

              <div style={{ background: "#fff", padding: 15, borderRadius: 8 }}>
                {deductions.map((d) => (
                  <div
                    key={d.ID}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    {/* Dynamic Radio */}
                    <input
                      type="radio"
                      checked={activeDeduction === d.Name}
                      onChange={() => handleDeductionSelect(d)}
                    />

                    <span>{d.Name}</span>

                    {/* Auto-filled Amount */}
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: 120 }}
                      value={deductionAmounts[d.Name] || ""}
                      onChange={(e) =>
                        setDeductionAmounts((prev) => ({
                          ...prev,
                          [d.Name]: Number(e.target.value),
                        }))
                      }
                    />

                    <button
                      className="btn btn-sm btn-secondary"
                      style={{ marginLeft: "auto" }}
                    >
                      FX
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECOND ROW — OA + OD */}
          <div style={{ display: "flex", gap: 30, marginTop: 30 }}>
            {/* OTHER ALLOWANCES */}
            <div style={{ flex: 1 }}>
              <h4 style={{ color: "#2a4365", marginBottom: 10 }}>
                Other Allowances
              </h4>

              <div style={{ background: "#fff", padding: 15, borderRadius: 8 }}>
                {otherAllowances.map((a) => (
                  <div
                    key={a.ID}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <input type="checkbox" />
                    <span>{a.Name}</span>

                    <input
                      type="number"
                      placeholder="Amount"
                      className="form-control"
                      style={{ width: 120 }}
                    />

                    <button
                      className="btn btn-sm btn-secondary"
                      style={{ marginLeft: "auto" }}
                    >
                      FX
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* OTHER DEDUCTIONS */}
            <div style={{ flex: 1 }}>
              <h4 style={{ color: "#2a4365", marginBottom: 10 }}>
                Other Deductions
              </h4>

              <div style={{ background: "#fff", padding: 15, borderRadius: 8 }}>
                {otherDeductions.map((d) => (
                  <div
                    key={d.ID}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    {/* radio for selecting percentage calculation */}
                    <input
                      type="radio"
                      checked={activeDeduction === d.Name}
                      onChange={() => handleDeductionSelect(d)}
                    />

                    <span>{d.Name}</span>

                    {/* amount box supporting BOTH auto calculation + manual typing */}
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: 120 }}
                      value={deductionAmounts[d.Name] || ""}
                      onChange={(e) =>
                        setDeductionAmounts((prev) => ({
                          ...prev,
                          [d.Name]: Number(e.target.value),
                        }))
                      }
                    />

                    <button
                      className="btn btn-sm btn-secondary"
                      style={{ marginLeft: "auto" }}
                    >
                      FX
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY SECTION - CENTER BOTTOM */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 40,
            width: "100%",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "25px 40px",
              borderRadius: 12,
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              minWidth: 500,
              textAlign: "center",
            }}
          >
            <h4 style={{ color: "#2a4365", marginBottom: 20 }}>
              Salary Summary
            </h4>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 15,
                fontSize: 16,
              }}
            >
              <strong>Total Gross Salary:</strong>
              <span>₹ 0.00</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 15,
                fontSize: 16,
              }}
            >
              <strong>Total Deduction:</strong>
              <span>₹ 0.00</span>
            </div>

            <hr />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 15,
                fontSize: 18,
                fontWeight: "bold",
                color: "#2b6cb0",
              }}
            >
              <span>Net Pay:</span>
              <span>₹ 0.00</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          className="btn btn-primary mt-4"
          style={{ padding: "8px 20px", fontSize: 16 }}
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}
