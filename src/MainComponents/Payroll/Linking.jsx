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

        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          {/* Salary Group */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <label style={{ fontWeight: "600" }}>Salary Group</label>
            <select
              value={salaryGroup}
              onChange={(e) => setSalaryGroup(parseInt(e.target.value))}
              style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            >
              <option value="">-- Select Salary Group --</option>
              {salaryGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Designation */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <label style={{ fontWeight: "600" }}>Designation</label>
            <select
              value={designation}
              onChange={(e) => {
                setDesignation(e.target.value);
                setSelectedEmployees([]);
              }}
              style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            >
              <option value="">-- Select Designation --</option>
              {designations.map((desig) => (
                <option key={desig} value={desig}>
                  {desig}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Employees with checkboxes */}
        {designation && filteredEmployees.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: "600" }}>Employees</label>
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: 4,
                padding: 10,
                maxHeight: 150,
                overflowY: "auto",
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

        <button
          onClick={handleSave}
          disabled={
            !salaryGroup || !designation || selectedEmployees.length === 0
          }
          style={{
            padding: "10px 20px",
            backgroundColor: "#3182ce",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
