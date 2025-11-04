import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  getAttendanceByProperty,
  createAttendance,
  updateAttendance,
} from "../../Services/PayrollService";
import { getEmployeesByOffice } from "../../Services/PayrollService";

// Helper to format monthyear as "YYYY-MM"
function getMonthYearString(month, year) {
  const mon = month.toString().padStart(2, "0"); // "10", "08", etc.
  return `${year}-${mon}`;
}

export default function AttendanceSheet() {
  const officeId = useSelector((state) => state.Commonreducer.puidn);
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]); // all attendance
  const [filteredAttendance, setFilteredAttendance] = useState([]); // matches selected monthyear
  const [selectedEmpIds, setSelectedEmpIds] = useState(new Set());
  const [dayInputs, setDayInputs] = useState({});
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [saving, setSaving] = useState(false);

  // Month/Year dropdown helpers
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const years = [];
  for (let y = 2021; y <= currentYear; y++) years.push(y);
  const maxMonth = year === currentYear ? currentMonth : 12;
  const months = [];
  for (let m = 1; m <= maxMonth; m++) months.push(m);
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const propertyId = officeId;

  // Load employees for this office
  useEffect(() => {
    if (officeId) {
      getEmployeesByOffice(officeId).then((data) => setEmployees(data));
    }
  }, [officeId]);

  // Load ALL attendance by property, then filter for current monthyear
  useEffect(() => {
    if (propertyId) {
      getAttendanceByProperty(propertyId).then((data) => {
        setAttendanceData(data || []);
        const currMonthYear = getMonthYearString(month, year);
        const filtered = (data || []).filter(
          (item) => item.monthyear === currMonthYear
        );
        setFilteredAttendance(filtered);

        // Map existing attendance for current monthyear to input values
        const inputs = {};
        filtered.forEach((att) => {
          inputs[att.EmpID] = {
            workingDays: att.WorkingDays,
            leaveDays: att.LeaveDays,
            weekDaysOff: att.WeekDaysOff,
          };
        });
        setDayInputs(inputs);
        setSelectedEmpIds(new Set());
      });
    }
  }, [propertyId, month, year]);

  function toggleCheckbox(empId) {
    setSelectedEmpIds((prev) => {
      const next = new Set(prev);
      if (next.has(empId)) {
        next.delete(empId);
      } else {
        next.add(empId);
        if (!dayInputs[empId]) {
          setDayInputs((old) => ({
            ...old,
            [empId]: { workingDays: "", leaveDays: "", weekDaysOff: "" },
          }));
        }
      }
      return next;
    });
  }

  function isNumericInput(val) {
    return /^\d*$/.test(val);
  }

  function handleInputChange(empId, field, value) {
    if (!isNumericInput(value)) return;
    setDayInputs((prev) => {
      const current = prev[empId] || {
        workingDays: "",
        leaveDays: "",
        weekDaysOff: "",
      };
      return {
        ...prev,
        [empId]: { ...current, [field]: value },
      };
    });
  }

  async function handleSaveAttendance() {
    if (selectedEmpIds.size === 0) {
      alert("Please select at least one employee to save attendance.");
      return;
    }

    setSaving(true);
    const currMonthYear = getMonthYearString(month, year);

    try {
      const savePromises = [];

      selectedEmpIds.forEach((empId) => {
        const emp = employees.find((e) => {
          const id =
            e.FacilityMember && e.FacilityMember.FacilityMemberId
              ? e.FacilityMember.FacilityMemberId
              : null;
          return id === empId;
        });

        const empName =
          emp && emp.FacilityMember && emp.FacilityMember.Name
            ? emp.FacilityMember.Name
            : "Unknown";

        const inputs = dayInputs[empId] || {
          workingDays: 0,
          leaveDays: 0,
          weekDaysOff: 0,
        };

        const model = {
          EmpID: empId,
          EmployeeName: empName,
          WorkingDays: Number(inputs.workingDays) || 0,
          LeaveDays: Number(inputs.leaveDays) || 0,
          WeekDaysOff: Number(inputs.weekDaysOff) || 0,
          PropertyID: propertyId,
          CreatedOn: new Date().toISOString(),
          IsActive: true,
          monthyear: currMonthYear,
        };

        const attendanceRecord = attendanceData.find(
          (a) => a.EmpID === empId && a.monthyear === currMonthYear
        );

        if (attendanceRecord) {
          savePromises.push(updateAttendance(empId, currMonthYear, model));
        } else {
          savePromises.push(createAttendance(model));
        }
      });

      await Promise.all(savePromises);

      // Refresh attendance data
      const newData = await getAttendanceByProperty(propertyId);
      setAttendanceData(newData);

      const filtered = (newData || []).filter(
        (item) => item.monthyear === currMonthYear
      );
      setFilteredAttendance(filtered);

      // Clear selections after save
      setSelectedEmpIds(new Set());

      alert("Attendance saved successfully!");
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Failed to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleYearChange(e) {
    const chosen = Number(e.target.value);
    setYear(chosen);
    if (chosen === currentYear && month > currentMonth) {
      setMonth(currentMonth);
    }
  }

  function exportToCSV() {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const heading = `Attendance for: ${monthNames[month - 1]} ${year}\n\n`;
    const header = "Employee Name,Working Days,Leave Days,Week Days Off\n";
    const rows = employees.map((emp, idx) => {
      const empId =
        emp.FacilityMember && emp.FacilityMember.FacilityMemberId
          ? emp.FacilityMember.FacilityMemberId
          : idx;
      const name =
        emp.FacilityMember && emp.FacilityMember.Name
          ? emp.FacilityMember.Name
          : "Unknown";
      const data = dayInputs[empId] || {
        workingDays: "",
        leaveDays: "",
        weekDaysOff: "",
      };
      return `"${name}","${data.workingDays}","${data.leaveDays}","${data.weekDaysOff}"`;
    });
    const csv = heading + header + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const filename = `attendance_${monthNames[
      month - 1
    ].toLowerCase()}_${year}.csv`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

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
        {/* Header Row - Title on left, Dropdowns on right */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontWeight: "bold",
              fontSize: "2rem",
              color: "#2a4365",
              margin: 0,
            }}
          >
            Employee Attendance Summary
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              style={{ padding: 6, fontSize: 16 }}
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthNames[m - 1]}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={handleYearChange}
              style={{ padding: 6, fontSize: 16 }}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              style={{
                padding: "6px 14px",
                fontSize: 16,
                background: "#3182ce",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={exportToCSV}
            >
              Export to CSV
            </button>
          </div>
        </div>

        {/* Save Button - Above Table, Right Corner */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 15,
          }}
        >
          <button
            onClick={handleSaveAttendance}
            disabled={saving || selectedEmpIds.size === 0}
            style={{
              padding: "8px 20px",
              fontSize: 16,
              background: selectedEmpIds.size === 0 ? "#cbd5e0" : "#48bb78",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: selectedEmpIds.size === 0 ? "not-allowed" : "pointer",
              fontWeight: "bold",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving
              ? "Saving..."
              : `Save Attendance ${
                  selectedEmpIds.size > 0 ? `(${selectedEmpIds.size})` : ""
                }`}
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f3fa" }}>
              <th
                style={{
                  border: "1px solid #b0b8cc",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                S.No.
              </th>
              <th
                style={{
                  border: "1px solid #b0b8cc",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                Employee Name
              </th>
              <th
                style={{
                  border: "1px solid #b0b8cc",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                Select
              </th>
              <th
                style={{
                  border: "1px solid #b0b8cc",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                No. of Working Days
              </th>
              <th
                style={{
                  border: "1px solid #b0b8cc",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                No. of Leave Days
              </th>
              <th
                style={{
                  border: "1px solid #b0b8cc",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                Week Days Off
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: 10, color: "#718096" }}
                >
                  No employees found
                </td>
              </tr>
            ) : (
              employees.map((emp, index) => {
                const empId =
                  emp.FacilityMember && emp.FacilityMember.FacilityMemberId
                    ? emp.FacilityMember.FacilityMemberId
                    : index;
                const name =
                  emp.FacilityMember && emp.FacilityMember.Name
                    ? emp.FacilityMember.Name
                    : "Unknown";
                const isChecked = selectedEmpIds.has(empId);
                const inputValues = dayInputs[empId] || {
                  workingDays: "",
                  leaveDays: "",
                  weekDaysOff: "",
                };

                return (
                  <tr key={empId}>
                    <td
                      style={{
                        border: "1px solid #b0b8cc",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td style={{ border: "1px solid #b0b8cc", padding: "8px" }}>
                      {name}
                    </td>
                    <td
                      style={{
                        border: "1px solid #b0b8cc",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheckbox(empId)}
                      />
                    </td>
                    <td
                      style={{
                        border: "1px solid #b0b8cc",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      <input
                        type="text"
                        value={inputValues.workingDays}
                        onChange={(e) =>
                          handleInputChange(
                            empId,
                            "workingDays",
                            e.target.value
                          )
                        }
                        disabled={!isChecked}
                        style={{ width: "80px", textAlign: "center" }}
                        maxLength={2}
                      />
                    </td>
                    <td
                      style={{
                        border: "1px solid #b0b8cc",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      <input
                        type="text"
                        value={inputValues.leaveDays}
                        onChange={(e) =>
                          handleInputChange(empId, "leaveDays", e.target.value)
                        }
                        disabled={!isChecked}
                        style={{ width: "80px", textAlign: "center" }}
                        maxLength={2}
                      />
                    </td>
                    <td
                      style={{
                        border: "1px solid #b0b8cc",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      <input
                        type="text"
                        value={inputValues.weekDaysOff}
                        onChange={(e) =>
                          handleInputChange(
                            empId,
                            "weekDaysOff",
                            e.target.value
                          )
                        }
                        disabled={!isChecked}
                        style={{ width: "80px", textAlign: "center" }}
                        maxLength={2}
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
