import React, { useState, useEffect } from "react";
import { getEmployeesByOffice } from "../../Services/PayrollService";
import { useSelector } from "react-redux";

export default function GenerateSalary() {
  const officeId = useSelector((state) => state.Commonreducer.puidn);
  const [employees, setEmployees] = useState([]);
  // Track which employees are selected with checkbox
  const [selectedEmpIds, setSelectedEmpIds] = useState(new Set());
  // Track input values keyed by employee Id
  const [dayInputs, setDayInputs] = useState({});

  useEffect(() => {
    if (officeId) {
      getEmployeesByOffice(officeId).then((data) => {
        setEmployees(data);
      });
    }
  }, [officeId]);

  const toggleCheckbox = (empId) => {
    setSelectedEmpIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(empId)) {
        newSet.delete(empId);
      } else {
        newSet.add(empId);
      }
      return newSet;
    });
  };

  const handleInputChange = (empId, field, value) => {
    setDayInputs((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [field]: value,
      },
    }));
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
        <h2 style={{ fontWeight: "bold", marginBottom: 20, fontSize: "2rem", color: "#2a4365" }}>
          Employee Attendance Summary
        </h2>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f3fa" }}>
              <th style={{ border: "1px solid #b0b8cc", padding: "8px", textAlign: "center" }}>S.No.</th>
              <th style={{ border: "1px solid #b0b8cc", padding: "8px", textAlign: "center" }}>Employee Name</th>
              <th style={{ border: "1px solid #b0b8cc", padding: "8px", textAlign: "center" }}>Select</th>
              <th style={{ border: "1px solid #b0b8cc", padding: "8px", textAlign: "center" }}>No. of Working Days</th>
              <th style={{ border: "1px solid #b0b8cc", padding: "8px", textAlign: "center" }}>No. of Leave Days</th>
              <th style={{ border: "1px solid #b0b8cc", padding: "8px", textAlign: "center" }}>Week Days Off</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 10, color: "#718096" }}>
                  No employees found
                </td>
              </tr>
            ) : (
              employees.map((emp, index) => {
                const empId =
                  (emp.EmployeeList && emp.EmployeeList.Id) ||
                  (emp.FacilityMember && emp.FacilityMember.FacilityMemberId) ||
                  index; // fallback id
                const name =
                  (emp.EmployeeList && emp.EmployeeList.EmployeeName) ||
                  (emp.FacilityMember && emp.FacilityMember.Name) ||
                  "Unknown";
                const isChecked = selectedEmpIds.has(empId);
                const inputValues = dayInputs[empId] || {
                  workingDays: "",
                  leaveDays: "",
                  weekDaysOff: "",
                };

                return (
                  <tr key={empId}>
                    <td style={{ border: "1px solid #b0b8cc", padding: "8px", textAlign: "center" }}>{index + 1}</td>
                    <td style={{ border: "1px solid #b0b8cc", padding: "8px" }}>{name}</td>
                    <td style={{ border: "1px solid #b0b8cc", padding: "8px", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheckbox(empId)}
                      />
                    </td>
                    <td style={{ border: "1px solid #b0b8cc", padding: "8px", textAlign: "center" }}>
                      <input
                        type="number"
                        value={inputValues.workingDays}
                        onChange={(e) => handleInputChange(empId, "workingDays", e.target.value)}
                        disabled={!isChecked}
                        style={{ width: "80px", textAlign: "center" }}
                        min={0}
                      />
                    </td>
                    <td style={{ border: "1px solid #b0b8cc", padding: "8px", textAlign: "center" }}>
                      <input
                        type="number"
                        value={inputValues.leaveDays}
                        onChange={(e) => handleInputChange(empId, "leaveDays", e.target.value)}
                        disabled={!isChecked}
                        style={{ width: "80px", textAlign: "center" }}
                        min={0}
                      />
                    </td>
                    <td style={{ border: "1px solid #b0b8cc", padding: "8px", textAlign: "center" }}>
                      <input
                        type="text"
                        value={inputValues.weekDaysOff}
                        onChange={(e) => handleInputChange(empId, "weekDaysOff", e.target.value)}
                        disabled={!isChecked}
                        placeholder="e.g. Sat, Sun"
                        style={{ width: "100px", textAlign: "center" }}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
