import React, { useState, useEffect } from "react";
import {
  getSalaryAllowancesByProperty,
  getEmployeesByOffice,
  assignSalaryGroupToFacilityMember,
} from "../../Services/PayrollService";
import { useSelector } from "react-redux";

export default function DesignationLinking() {
  const propertyId = useSelector((state) => state.Commonreducer.puidn);
  const [salaryGroups, setSalaryGroups] = useState([]);
  const [salaryGroup, setSalaryGroup] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [designation, setDesignation] = useState("");
  const [selectedGroupData, setSelectedGroupData] = useState(null);
  const [salaryGroupsData, setSalaryGroupsData] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]); // multiple employee ids

  // Filter employees by selected designation
  const filteredEmployees = employeeList.filter(
    (emp) => emp.Designation === designation
  );

  useEffect(() => {
    async function fetchEmployees() {
      if (!propertyId) return;
      try {
        const data = await getEmployeesByOffice(propertyId);

        const employees = (data || [])
          .map((item) => ({
            ...item.EmployeeList,
            FacilityMemberId: item.FacilityMember?.FacilityMemberId,
          }))
          .filter(Boolean);

        setEmployeeList(employees);

        // Extract unique designations, trimming and ignoring nulls
        const uniqueDesignations = [
          ...new Set(
            employees
              .map((emp) => (emp.Designation || "").trim())
              .filter(Boolean)
          ),
        ];
        setDesignations(uniqueDesignations);
      } catch (error) {
        setEmployeeList([]);
        setDesignations([]);
      }
    }
    fetchEmployees();
  }, [propertyId]);

  useEffect(() => {
    async function fetchSalaryGroups() {
      if (!propertyId) return;
      try {
        const response = await getSalaryAllowancesByProperty(propertyId);
        if (Array.isArray(response)) {
          setSalaryGroupsData(response); // store full data for lookup
          setSalaryGroups(
            response.map((item) => ({
              id: item.SalaryGroup_ID,
              name: item.SalaryGroup,
            }))
          );
        } else if (response && response.SalaryGroup) {
          setSalaryGroups([
            { id: response.SalaryGroup_ID, name: response.SalaryGroup },
          ]);
        }
      } catch {
        setSalaryGroups([]);
      }
    }
    fetchSalaryGroups();
  }, [propertyId]);

  const toggleEmployee = (facilityId) => {
    setSelectedEmployees((prev) =>
      prev.includes(facilityId)
        ? prev.filter((id) => id !== facilityId)
        : [...prev, facilityId]
    );
  };

  const handleSave = async () => {
    if (!salaryGroup || selectedEmployees.length === 0) {
      alert("Please select Salary Group and at least one employee.");
      return;
    }
    const FacilityMemberIds = selectedEmployees.join(","); // string of selected FacilityMemberIds
    const payload = {
      FacilityMemberIds: FacilityMemberIds,
      SalaryGroup_ID: parseInt(salaryGroup), // ensure number
    };

    try {
      await assignSalaryGroupToFacilityMember(payload);
      alert("Salary group assigned successfully.");
    } catch {
      alert("Operation failed.");
    }
  };

  return (
  <div className="content-wrapper" style={{ minHeight: "100vh", padding: 30 }}>
    <div
      className="card"
      style={{
        maxWidth: 1300,
        margin: "0 auto",
        borderRadius: 10,
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        padding: "20px 30px",
        background: "#f7fafc",
      }}
    >
      <h2 style={{ fontWeight: "bold", color: "#2a4365", marginBottom: 20 }}>
        Salary Designation Linking
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN - Salary Group */}
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <label style={{ fontWeight: "600" }}>Salary Group</label>
          <select
            value={salaryGroup}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setSalaryGroup(value);
              const groupData = salaryGroupsData.find(
                (g) => g.SalaryGroup_ID === value
              );
              setSelectedGroupData(groupData || null);
            }}
            style={{
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
              background: "#fff",
            }}
          >
            <option value="">-- Select Salary Group --</option>
            {salaryGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>

          {selectedGroupData && (
            <div
              style={{
                background: "#fff",
                borderRadius: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                padding: 20,
                height: 350,
                overflowY: "auto",
              }}
            >
              <h4
                style={{
                  fontWeight: "600",
                  color: "#2a4365",
                  marginBottom: 20,
                  fontSize: "18px",
                }}
              >
                Salary Group → {selectedGroupData.SalaryGroup}
              </h4>

              {selectedGroupData.AllowancesDeductions.length === 0 &&
              selectedGroupData.FixedSalary > 0 ? (
                // Fixed Salary Only
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: "#f0fff4",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        colSpan={2}
                        style={{
                          background: "#c6f6d5",
                          padding: 8,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        Allowance
                      </th>
                    </tr>
                    <tr>
                      <th style={{ textAlign: "left", padding: 6 }}>Name</th>
                      <th style={{ textAlign: "right", padding: 6 }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: 6 }}>Fixed Salary</td>
                      <td style={{ textAlign: "right", padding: 6 }}>
                        ₹{selectedGroupData.FixedSalary}
                      </td>
                    </tr>
                    <tr style={{ borderTop: "2px solid #999" }}>
                      <td style={{ fontWeight: "bold", padding: 6 }}>
                        Total Allowance:
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: "bold",
                          padding: 6,
                        }}
                      >
                        ₹{selectedGroupData.FixedSalary}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                // Allowances & Deductions Display
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  {/* Allowance Table */}
                  <div style={{ flex: 1, marginRight: 20 }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        background: "#f0fff4",
                        borderRadius: 8,
                        overflow: "hidden",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            colSpan={2}
                            style={{
                              background: "#c6f6d5",
                              padding: 8,
                              textAlign: "center",
                              fontWeight: "bold",
                            }}
                          >
                            Allowance
                          </th>
                        </tr>
                        <tr>
                          <th style={{ textAlign: "left", padding: 6 }}>Name</th>
                          <th style={{ textAlign: "right", padding: 6 }}>
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGroupData.AllowancesDeductions.filter(
                          (a) => a.Type === "Allowance"
                        ).map((a) => (
                          <tr key={a.AD_Id}>
                            <td style={{ padding: 6 }}>{a.Name}</td>
                            <td style={{ textAlign: "right", padding: 6 }}>
                              ₹{a.CalculatedAmount}
                            </td>
                          </tr>
                        ))}
                        <tr style={{ borderTop: "2px solid #999" }}>
                          <td style={{ fontWeight: "bold", padding: 6 }}>
                            Total Allowance:
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              fontWeight: "bold",
                              padding: 6,
                            }}
                          >
                            ₹
                            {selectedGroupData.AllowancesDeductions.filter(
                              (a) => a.Type === "Allowance"
                            ).reduce((sum, a) => sum + a.CalculatedAmount, 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Deduction Table */}
                  <div style={{ flex: 1 }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        background: "#fff5f5",
                        borderRadius: 8,
                        overflow: "hidden",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            colSpan={2}
                            style={{
                              background: "#fed7d7",
                              padding: 8,
                              textAlign: "center",
                              fontWeight: "bold",
                            }}
                          >
                            Deduction
                          </th>
                        </tr>
                        <tr>
                          <th style={{ textAlign: "left", padding: 6 }}>Name</th>
                          <th style={{ textAlign: "right", padding: 6 }}>
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGroupData.AllowancesDeductions.filter(
                          (a) => a.Type === "Deduction"
                        ).map((d) => (
                          <tr key={d.AD_Id}>
                            <td style={{ padding: 6 }}>{d.Name}</td>
                            <td style={{ textAlign: "right", padding: 6 }}>
                              ₹{d.CalculatedAmount}
                            </td>
                          </tr>
                        ))}
                        <tr style={{ borderTop: "2px solid #999" }}>
                          <td style={{ fontWeight: "bold", padding: 6 }}>
                            Total Deduction:
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              fontWeight: "bold",
                              padding: 6,
                            }}
                          >
                            ₹
                            {selectedGroupData.AllowancesDeductions.filter(
                              (a) => a.Type === "Deduction"
                            ).reduce((sum, a) => sum + a.CalculatedAmount, 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - Designation & Employees */}
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <label style={{ fontWeight: "600" }}>Designation</label>
          <select
            value={designation}
            onChange={(e) => {
              setDesignation(e.target.value);
              setSelectedEmployees([]);
            }}
            style={{
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
              background: "#fff",
            }}
          >
            <option value="">-- Select Designation --</option>
            {designations.map((desig) => (
              <option key={desig} value={desig}>
                {desig}
              </option>
            ))}
          </select>

          {designation && filteredEmployees.length > 0 && (
            <div
              style={{
                background: "#fff",
                borderRadius: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                padding: 20,
                height: 350,
                overflowY: "auto",
              }}
            >
              <h4
                style={{
                  fontWeight: "600",
                  color: "#2a4365",
                  marginBottom: 20,
                  fontSize: "18px",
                }}
              >
                Employees
              </h4>

              <div
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  padding: 10,
                  background: "#fff",
                  marginTop: 8,
                }}
              >
                {filteredEmployees.map((emp) => (
                  <div key={emp.Id || emp.EmployeeId} style={{ marginBottom: 8 }}>
                    <label>
                      <input
                        type="checkbox"
                        value={emp.FacilityMemberId}
                        checked={selectedEmployees.includes(emp.FacilityMemberId)}
                        onChange={() => toggleEmployee(emp.FacilityMemberId)}
                        style={{ marginRight: 8 }}
                      />
                      {emp.EmployeeName}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div style={{ textAlign: "center", marginTop: 30 }}>
        <button
          onClick={handleSave}
          disabled={
            !salaryGroup || !designation || selectedEmployees.length === 0
          }
          style={{
            padding: "12px 40px",
            backgroundColor: "#2b6cb0",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 3px 8px rgba(66,153,225,0.3)",
          }}
          onMouseOver={(e) =>
            (e.target.style.backgroundColor = "#2c5282")
          }
          onMouseOut={(e) =>
            (e.target.style.backgroundColor = "#2b6cb0")
          }
        >
          Save
        </button>
      </div>
    </div>
  </div>
);
}
