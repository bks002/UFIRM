import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getSalaryAllowancesByProperty } from "../../Services/PayrollService";

export default function SGNEW() {
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  const [salaryGroups, setSalaryGroups] = useState([]);

  const [form, setForm] = useState({
    salaryGroupName: "",
    baseSalary: "",
    totalWorkingDays: "",
    shiftHours: ""
  });

  useEffect(() => {
    if (!propertyId) return;
    loadSG();
  }, [propertyId]);

  const loadSG = async () => {
    try {
      const res = await getSalaryAllowancesByProperty(propertyId);
      setSalaryGroups(res);
    } catch (err) {
      console.log("Failed to fetch SG:", err);
    }
  };

  const handleDropdownSelect = (sg) => {
    if (!sg) return;

    setForm({
      salaryGroupName: sg.SalaryGroup,
      baseSalary: sg.BaseSalary,
      totalWorkingDays: sg.TotalWorkingDays,
      shiftHours: sg.ShiftHours
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Saving: ", form);
  };

  return (
    <div className="content-wrapper" style={{ minHeight: "100vh", padding: 30 }}>
      <div
        className="card"
        style={{
          maxWidth: 900,
          margin: "0 auto",
          borderRadius: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          padding: "25px 40px",
          background: "#f7fafc"
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
                  salaryGroups.find(
                    (s) => s.SalaryGroup_ID == e.target.value
                  )
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
