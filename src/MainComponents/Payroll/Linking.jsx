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
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupGroup, setPopupGroup] = useState(null);
  const [isSaving, setIsSaving] = useState(false); // 👈 Add this state at top with others

  // Filter employees by selected designation
  const filteredEmployees = employeeList.filter(
    (emp) => emp.Designation === designation
  );

  // ✅ Move these functions OUTSIDE of useEffect
  async function fetchEmployees() {
    if (!propertyId) return;
    try {
      const data = await getEmployeesByOffice(propertyId);

      const employees = (data || [])
        .map((item) => ({
          ...item.EmployeeList,
          FacilityMemberId: item.FacilityMember?.FacilityMemberId,
          SG_Link_ID: item.FacilityMember?.SG_Link_ID
            ? parseInt(item.FacilityMember.SG_Link_ID)
            : null, // ensure it's a number
          Designation: item.EmployeeList?.Designation || "",
          EmployeeName: item.Profile?.EmployeeName || "",
        }))
        .filter(Boolean);

      setEmployeeList(employees);

      // Extract unique designations, trimming and ignoring nulls
      const uniqueDesignations = [
        ...new Set(
          employees.map((emp) => (emp.Designation || "").trim()).filter(Boolean)
        ),
      ];
      setDesignations(uniqueDesignations);
    } catch (error) {
      setEmployeeList([]);
      setDesignations([]);
    }
  }

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

  // ✅ Use effects now just trigger them
  useEffect(() => {
    fetchEmployees();
  }, [propertyId]);

  useEffect(() => {
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

    const FacilityMemberIds = selectedEmployees.join(",");
    const payload = {
      FacilityMemberIds,
      SalaryGroup_ID: parseInt(salaryGroup),
    };

    try {
      setIsSaving(true); // 👈 start loader

      await assignSalaryGroupToFacilityMember(payload);

      // Refresh employees to reflect updated links
      await fetchEmployees();

      alert("Salary group assigned successfully.");

      // ✅ Keep the current selections open
      setSelectedEmployees([]); // clear only selected checkboxes
    } catch (error) {
      console.error("Error while assigning salary group:", error);
      alert("Operation failed.");
    } finally {
      setIsSaving(false); // 👈 stop loader
    }
  };

  const getGroupNameById = (id) => {
    if (!id || !salaryGroupsData.length) return null;
    const group = salaryGroupsData.find(
      (g) => parseInt(g.SalaryGroup_ID) === parseInt(id)
    );
    return group ? group.SalaryGroup : null;
  };

  const handleGroupClick = (groupId) => {
    const group = salaryGroupsData.find(
      (g) => parseInt(g.SalaryGroup_ID) === parseInt(groupId)
    );
    if (group) {
      setPopupGroup(group);
      setPopupVisible(true);
    }
  };

  const hasSelectedEmps = selectedEmployees.length > 0;

  return (
    <div
      className="content-wrapper"
      style={{ minHeight: "100vh", padding: 30 }}
    >
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
                        <th style={{ textAlign: "right", padding: 6 }}>
                          Amount
                        </th>
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
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
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
                            <th style={{ textAlign: "left", padding: 6 }}>
                              Name
                            </th>
                            <th style={{ textAlign: "right", padding: 6 }}>
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Base Salary Row - only when FixedSalary = 0 and BaseSalary > 0 */}
                          {selectedGroupData.FixedSalary === 0 &&
                            selectedGroupData.BaseSalary > 0 && (
                              <tr>
                                <td style={{ padding: 6, fontWeight: 500 }}>
                                  Base Salary
                                </td>
                                <td style={{ textAlign: "right", padding: 6 }}>
                                  ₹{selectedGroupData.BaseSalary}
                                </td>
                              </tr>
                            )}

                          {/* Allowances */}
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

                          {/* Total Allowance Row */}
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
                              {(
                                (selectedGroupData.BaseSalary || 0) +
                                selectedGroupData.AllowancesDeductions.filter(
                                  (a) => a.Type === "Allowance"
                                ).reduce(
                                  (sum, a) => sum + a.CalculatedAmount,
                                  0
                                )
                              ).toLocaleString()}
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
                            <th style={{ textAlign: "left", padding: 6 }}>
                              Name
                            </th>
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

            {salaryGroupsData.length > 0 &&
              designation &&
              filteredEmployees.length > 0 && (
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
                    {filteredEmployees.map((emp) => {
                      const alreadyAssignedGroup = getGroupNameById(
                        emp.SG_Link_ID
                      );
                      const isAssignedToCurrentSG =
                        emp.SG_Link_ID &&
                        parseInt(emp.SG_Link_ID) === parseInt(salaryGroup);
                      const isDifferentSG =
                        emp.SG_Link_ID &&
                        parseInt(emp.SG_Link_ID) !== parseInt(salaryGroup);

                      return (
                        <div
                          key={emp.Id || emp.EmployeeId}
                          style={{
                            marginBottom: 8,
                            opacity: isAssignedToCurrentSG ? 0.9 : 1,
                            backgroundColor: isAssignedToCurrentSG
                              ? "#e6fffa"
                              : "transparent",
                            borderRadius: 6,
                            padding: "4px 8px",
                            transition: "background 0.3s ease", // 👈 this line
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              flexWrap: "wrap",
                            }}
                          >
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                cursor: isAssignedToCurrentSG
                                  ? "not-allowed"
                                  : "pointer",
                              }}
                            >
                              <input
                                type="checkbox"
                                value={emp.FacilityMemberId}
                                checked={
                                  selectedEmployees.includes(
                                    emp.FacilityMemberId
                                  ) || isAssignedToCurrentSG
                                }
                                disabled={isAssignedToCurrentSG}
                                onChange={() =>
                                  toggleEmployee(emp.FacilityMemberId)
                                }
                                style={{
                                  marginRight: 8,
                                  cursor: isAssignedToCurrentSG
                                    ? "not-allowed"
                                    : "pointer",
                                }}
                              />
                              {emp.EmployeeName}
                            </label>

                            {emp.SG_Link_ID && (
                              <span
                                onClick={() => handleGroupClick(emp.SG_Link_ID)}
                                style={{
                                  color: "#0f766e",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  marginTop: -7,
                                  marginLeft: 4,
                                  position: "relative",
                                  transition: "all 0.25s ease-in-out",
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.color = "#0d9488";
                                  e.target.style.textDecoration = "underline";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.color = "#0f766e";
                                  e.target.style.textDecoration = "none";
                                }}
                                title="Click to view Salary Group details"
                              >
                                ({alreadyAssignedGroup})
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
              isSaving || !salaryGroup || !designation || !hasSelectedEmps
            }
            style={{
              padding: "12px 40px",
              backgroundColor:
                isSaving || !salaryGroup || !designation || !hasSelectedEmps
                  ? "#94a3b8"
                  : "#2b6cb0",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor:
                isSaving || !salaryGroup || !designation || !hasSelectedEmps
                  ? "not-allowed"
                  : "pointer",
              transition: "all 0.3s ease",
              boxShadow:
                isSaving || !salaryGroup || !designation || !hasSelectedEmps
                  ? "none"
                  : "0 3px 8px rgba(66,153,225,0.3)",
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
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
              boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ marginBottom: 15, color: "#1e3a8a", fontWeight: 700 }}>
              Salary Group → {popupGroup.SalaryGroup}
            </h2>

            {/* FIXED SALARY ONLY VIEW */}
            {popupGroup.FixedSalary > 0 &&
            popupGroup.AllowancesDeductions.length === 0 ? (
              <div>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: 20,
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        colSpan={2}
                        style={{
                          background: "#d1fae5",
                          padding: 10,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        Allowance
                      </th>
                    </tr>
                    <tr>
                      <th style={{ textAlign: "left", padding: 8 }}>Name</th>
                      <th style={{ textAlign: "right", padding: 8 }}>Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td style={{ padding: 8 }}>Fixed Salary</td>
                      <td style={{ textAlign: "right", padding: 8 }}>
                        ₹{popupGroup.FixedSalary}
                      </td>
                    </tr>

                    <tr>
                      <td
                        colSpan={2}
                        style={{
                          borderBottom: "2px solid #1e3a8a",
                          paddingTop: 15,
                        }}
                      ></td>
                    </tr>

                    <tr>
                      <td
                        style={{
                          fontWeight: "bold",
                          padding: 8,
                          textAlign: "left",
                          color: "#1e3a8a",
                        }}
                      >
                        Total Allowance:
                      </td>
                      <td
                        style={{
                          fontWeight: "bold",
                          padding: 8,
                          textAlign: "right",
                          color: "#1e3a8a",
                        }}
                      >
                        ₹{popupGroup.FixedSalary}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              /* BASE SALARY + NORMAL SG VIEW */
              <div style={{ display: "flex", gap: 20 }}>
                {/* ALLOWANCE TABLE */}
                <div style={{ flex: 1 }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginBottom: 20,
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          colSpan={2}
                          style={{
                            background: "#d1fae5",
                            padding: 10,
                            textAlign: "center",
                            fontWeight: "bold",
                          }}
                        >
                          Allowance
                        </th>
                      </tr>
                      <tr>
                        <th style={{ textAlign: "left", padding: 8 }}>Name</th>
                        <th style={{ textAlign: "right", padding: 8 }}>
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {/* BASE SALARY */}
                      {popupGroup.BaseSalary > 0 && (
                        <tr>
                          <td style={{ padding: 8 }}>Base Salary</td>
                          <td style={{ textAlign: "right", padding: 8 }}>
                            ₹{popupGroup.BaseSalary}
                          </td>
                        </tr>
                      )}

                      {/* NORMAL ALLOWANCES */}
                      {popupGroup.AllowancesDeductions.filter(
                        (a) => a.Type === "Allowance"
                      ).map((a) => (
                        <tr key={a.AD_Id}>
                          <td style={{ padding: 8 }}>{a.Name}</td>
                          <td style={{ textAlign: "right", padding: 8 }}>
                            ₹{a.CalculatedAmount}
                          </td>
                        </tr>
                      ))}

                      <tr>
                        <td
                          colSpan={2}
                          style={{
                            borderBottom: "2px solid #1e3a8a",
                            paddingTop: 15,
                          }}
                        ></td>
                      </tr>

                      {/* TOTAL ALLOWANCE */}
                      <tr>
                        <td
                          style={{
                            fontWeight: "bold",
                            padding: 8,
                            color: "#1e3a8a",
                          }}
                        >
                          Total Allowance:
                        </td>
                        <td
                          style={{
                            fontWeight: "bold",
                            padding: 8,
                            textAlign: "right",
                            color: "#1e3a8a",
                          }}
                        >
                          ₹
                          {(
                            (popupGroup.BaseSalary || 0) +
                            popupGroup.AllowancesDeductions.filter(
                              (a) => a.Type === "Allowance"
                            ).reduce((sum, a) => sum + a.CalculatedAmount, 0)
                          ).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* DEDUCTION TABLE */}
                <div style={{ flex: 1 }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginBottom: 20,
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          colSpan={2}
                          style={{
                            background: "#fee2e2",
                            padding: 10,
                            textAlign: "center",
                            fontWeight: "bold",
                            color: "#b91c1c",
                          }}
                        >
                          Deduction
                        </th>
                      </tr>
                      <tr>
                        <th style={{ textAlign: "left", padding: 8 }}>Name</th>
                        <th style={{ textAlign: "right", padding: 8 }}>
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {popupGroup.AllowancesDeductions.filter(
                        (a) => a.Type === "Deduction"
                      ).map((d) => (
                        <tr key={d.AD_Id}>
                          <td style={{ padding: 8 }}>{d.Name}</td>
                          <td style={{ textAlign: "right", padding: 8 }}>
                            ₹{d.CalculatedAmount}
                          </td>
                        </tr>
                      ))}

                      <tr>
                        <td
                          colSpan={2}
                          style={{
                            borderBottom: "2px solid #b91c1c",
                            paddingTop: 15,
                          }}
                        ></td>
                      </tr>

                      {/* TOTAL DEDUCTION */}
                      <tr>
                        <td
                          style={{
                            fontWeight: "bold",
                            padding: 8,
                            color: "#b91c1c",
                          }}
                        >
                          Total Deduction:
                        </td>
                        <td
                          style={{
                            fontWeight: "bold",
                            padding: 8,
                            textAlign: "right",
                            color: "#b91c1c",
                          }}
                        >
                          ₹
                          {popupGroup.AllowancesDeductions.filter(
                            (a) => a.Type === "Deduction"
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
                  background: "#2563eb",
                  color: "#fff",
                  padding: "10px 22px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
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
