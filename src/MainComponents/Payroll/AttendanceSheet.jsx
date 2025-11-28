// ⭐⭐⭐⭐⭐ FINAL MERGED ATTENDANCE SHEET WITH SALARY GROUP + MANUAL EDIT SUPPORT ⭐⭐⭐⭐⭐

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import {
  getAttendanceByProperty,
  createAttendance,
  updateAttendance,
  deleteMultipleAttendance,
} from "../../Services/PayrollService";

import { getEmployeesByOffice } from "../../Services/PayrollService";
import { getPropertyById } from "../../Services/PropertyService";
import { getSalaryAllowancesByFacilityMember } from "../../Services/PayrollService";

// Helper: Format month-year as "YYYY-MM"
function getMonthYearString(month, year) {
  const mon = month.toString().padStart(2, "0");
  return `${year}-${mon}`;
}

// Helper: Get days in a month
function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

export default function AttendanceSheet() {
  const officeId = useSelector((state) => state.Commonreducer.puidn);
  const propertyId = officeId;

  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [selectedEmpIds, setSelectedEmpIds] = useState(new Set());

  // { empId: { totalDays, shiftHours } }
  const [employeeSGMap, setEmployeeSGMap] = useState({});

  const [dayInputs, setDayInputs] = useState({});

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const totalDaysInSelectedMonth = getDaysInMonth(month, year);

  const [globalTotalDays, setGlobalTotalDays] = useState(totalDaysInSelectedMonth);

  const [saving, setSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;
  const totalPages = Math.ceil(employees.length / recordsPerPage);
  const paginatedEmployees = employees.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  // Current system date
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Month-year dropdowns
  const years = [];
  for (let y = 2021; y <= currentYear; y++) years.push(y);

  const maxMonth = year === currentYear ? currentMonth : 12;
  const months = [];
  for (let m = 1; m <= maxMonth; m++) months.push(m);

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // -------------------------------------------------------------------
  // Load PropertyMaster TotalWorkingDays
  // -------------------------------------------------------------------
  useEffect(() => {
    async function loadPropertyWorkingDays() {
      if (!propertyId) return;

      try {
        const prop = await getPropertyById(propertyId);
        const twd = prop?.TotalWorkingDays || getDaysInMonth(month, year);

        setGlobalTotalDays(twd);

        // Apply property default only to employees who do NOT have manual edit
        setDayInputs(prev => {
          const updated = {};
          for (const empId of Object.keys(prev)) {
            if (prev[empId].manualTotalDays) {
              updated[empId] = prev[empId];
            } else {
              updated[empId] = {
                ...prev[empId],
                totalDays: prev[empId].totalDays || twd
              };
            }
          }
          return updated;
        });

      } catch {
        setGlobalTotalDays(getDaysInMonth(month, year));
      }
    }

    loadPropertyWorkingDays();
  }, [propertyId]);

  // ---------------------------------------------------------
  // Load Employees
  // ---------------------------------------------------------
  useEffect(() => {
    if (officeId) {
      getEmployeesByOffice(officeId).then((data) => setEmployees(data || []));
    }
  }, [officeId]);

  // ---------------------------------------------------------
  // Load Salary Group per employee
  // ---------------------------------------------------------
  useEffect(() => {
    async function loadSG() {
      const map = {};

      for (const emp of employees) {
        const fmId = emp?.FacilityMember?.FacilityMemberId;
        if (!fmId) continue;

        try {
          const res = await getSalaryAllowancesByFacilityMember(fmId);
          const sg = res?.SalaryGroups?.[0];

          if (sg) {
            map[fmId] = {
              totalDays: sg.TotalWorkingDays ?? null,
              shiftHours: sg.ShiftHours ?? null,
            };
          }
        } catch (err) {
          console.error("SG load error:", err);
        }
      }

      setEmployeeSGMap(map);
    }

    if (employees.length > 0) loadSG();
  }, [employees]);

  // ---------------------------------------------------------
  // Load attendance (ALL records), then filter current month
  // ---------------------------------------------------------
  useEffect(() => {
    if (propertyId) {
      getAttendanceByProperty(propertyId).then((data) => {
        setAttendanceData(data || []);

        const currMonthYear = getMonthYearString(month, year);

        const filtered = (data || []).filter(
          (item) => item.monthyear === currMonthYear
        );

        setFilteredAttendance(filtered);

        // Map saved attendance → but allow manual override
        const mappedInputs = {};
        filtered.forEach((att) => {
          mappedInputs[att.EmpID] = {
            workingDays: att.WorkingDays,
            leaveDays: att.LeaveDays,
            weekDaysOff: att.WeekDaysOff,
            otDays: att.OtDays || "",
            otHours: att.OtHours || "",
            totalDays:
              att.TotalWorkingDays || att.TotalWorkingDays === 0
                ? att.TotalWorkingDays
                : (employeeSGMap[att.EmpID]?.totalDays ?? globalTotalDays),
            manualTotalDays: false,  // saved data is NOT manual
          };
        });

        setDayInputs(mappedInputs);
        setSelectedEmpIds(new Set());
      });
    }
  }, [propertyId, month, year, globalTotalDays, employeeSGMap]);

  // ---------------------------------------------------------
  // Checkbox toggle
  // ---------------------------------------------------------
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
            [empId]: {
              workingDays: "",
              leaveDays: "",
              weekDaysOff: "",
              otDays: "",
              otHours: "",
              totalDays: employeeSGMap[empId]?.totalDays ?? globalTotalDays,
              manualTotalDays: false,
            },
          }));
        }
      }

      return next;
    });
  }

  // ---------------------------------------------------------
  // Handle per-employee input (manual override supported)
  // ---------------------------------------------------------
  function handleInputChange(empId, field, value) {
    if (!/^\d*\.?\d*$/.test(value)) return;

    setDayInputs((prev) => {
      const current = prev[empId] || {
        workingDays: "",
        leaveDays: "",
        weekDaysOff: "",
        otDays: "",
        otHours: "",
        totalDays: employeeSGMap[empId]?.totalDays ?? globalTotalDays,
        manualTotalDays: false,
      };

      const updated = { ...current, [field]: value };

      if (field === "totalDays") {
        updated.manualTotalDays = true;  // user override!
      }

      const totalDays =
        field === "totalDays"
          ? parseFloat(value) || 0
          : parseFloat(current.totalDays) ||
            employeeSGMap[empId]?.totalDays ||
            globalTotalDays;

      const w = parseFloat(updated.workingDays) || 0;
      const l = parseFloat(updated.leaveDays) || 0;
      const wk = parseFloat(updated.weekDaysOff) || 0;

      if (["workingDays", "leaveDays", "weekDaysOff"].includes(field)) {
        if (parseFloat(value) > totalDays) return prev;
      }

      if (w + l + wk > totalDays) return prev;

      return { ...prev, [empId]: updated };
    });
  }

  // ---------------------------------------------------------
  // Save Attendance
  // ---------------------------------------------------------
  async function handleSaveAttendance() {
    if (selectedEmpIds.size === 0) {
      alert("Please select at least one employee.");
      return;
    }

    setSaving(true);

    const currMonthYear = getMonthYearString(month, year);
    const promises = [];

    selectedEmpIds.forEach((empId) => {
      const emp = employees.find(
        (e) => e?.FacilityMember?.FacilityMemberId === empId
      );

      const empName =
        emp?.Profile?.EmployeeName ||
        emp?.EmployeeList?.Designation ||
        emp?.FacilityMember?.Name ||
        "Unknown";

      const inp = dayInputs[empId];

      const model = {
        EmpID: empId,
        EmployeeName: empName,
        WorkingDays: Number(inp.workingDays) || 0,
        LeaveDays: Number(inp.leaveDays) || 0,
        WeekDaysOff: Number(inp.weekDaysOff) || 0,
        OtDays: Number(inp.otDays) || 0,
        OtHours: Number(inp.otHours) || 0,
        TotalWorkingDays: Number(inp.totalDays),
        PropertyID: propertyId,
        CreatedOn: new Date().toISOString(),
        IsActive: true,
        monthyear: currMonthYear,
      };

      const existing = attendanceData.find(
        (a) => a.EmpID === empId && a.monthyear === currMonthYear
      );

      if (existing) promises.push(updateAttendance(empId, currMonthYear, model));
      else promises.push(createAttendance(model));
    });

    try {
      await Promise.all(promises);

      alert("Attendance saved successfully!");

      const refreshed = await getAttendanceByProperty(propertyId);
      setAttendanceData(refreshed || []);

      setFilteredAttendance(
        (refreshed || []).filter((item) => item.monthyear === currMonthYear)
      );

      setSelectedEmpIds(new Set());
    } catch (err) {
      alert("Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------
  // Bulk Delete
  // ---------------------------------------------------------
  async function handleBulkDelete() {
    if (selectedEmpIds.size === 0) {
      alert("No employees selected.");
      return;
    }

    if (!window.confirm("Delete attendance for selected employees?")) return;

    try {
      const empList = Array.from(selectedEmpIds);
      const currMonthYear = getMonthYearString(month, year);

      await deleteMultipleAttendance(empList, currMonthYear);

      const updated = attendanceData.filter(
        (a) => !(selectedEmpIds.has(a.EmpID) && a.monthyear === currMonthYear)
      );

      setAttendanceData(updated);
      setFilteredAttendance(
        updated.filter((a) => a.monthyear === currMonthYear)
      );

      setDayInputs((prev) => {
        const copy = { ...prev };
        empList.forEach((id) => delete copy[id]);
        return copy;
      });

      setSelectedEmpIds(new Set());

      alert("Attendance deleted!");
    } catch {
      alert("Delete failed!");
    }
  }

  // ---------------------------------------------------------
  // CSV Export
  // ---------------------------------------------------------
 function exportToCSV() {
  const heading = `Attendance for: ${monthNames[month - 1]} ${year}\n\n`;
  const header = "Employee Name,Working Days,Leave Days,Week Days Off,OT Days,OT Hours,Total Working Days\n";

  const rows = paginatedEmployees.map((emp, idx) => {
    const empId = emp?.FacilityMember?.FacilityMemberId ?? emp?.EmpID ?? idx;
    const nameRaw =
      emp?.Profile?.EmployeeName ||
      emp?.EmployeeList?.Designation ||
      emp?.FacilityMember?.Name ||
      "Unknown";

    // escape any double-quotes in name for CSV
    const name = `"${String(nameRaw).replace(/"/g, '""')}"`;

    const inp = dayInputs[empId] || {};

    // fallback to saved attendance if inputs are empty
    const saved = (filteredAttendance || []).find(a => String(a.EmpID) === String(empId));

    const workingDays = inp.workingDays ?? saved?.WorkingDays ?? "";
    const leaveDays = inp.leaveDays ?? saved?.LeaveDays ?? "";
    const weekDaysOff = inp.weekDaysOff ?? saved?.WeekDaysOff ?? "";
    const otDays = inp.otDays ?? saved?.OtDays ?? "";
    const otHours = inp.otHours ?? saved?.OtHours ?? "";
    const totalWorkingDays = inp.totalDays ?? saved?.TotalWorkingDays ?? "";

    // ensure values are strings and escape quotes if any (though numeric fields unlikely to have quotes)
    const row = [
      name,
      `"${String(workingDays)}"`,
      `"${String(leaveDays)}"`,
      `"${String(weekDaysOff)}"`,
      `"${String(otDays)}"`,
      `"${String(otHours)}"`,
      `"${String(totalWorkingDays)}"`
    ].join(",");

    return row;
  });

  const csv = heading + header + rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance_${monthNames[month - 1].toLowerCase()}_${year}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}


  // ---------------------------------------------------------
  // RENDER UI (unchanged)
  // ---------------------------------------------------------
  return (
    <div className="content-wrapper" style={{ minHeight: "100vh", padding: 30 }}>
      <div className="card" style={{ maxWidth: 1300, margin: "0 auto", borderRadius: 10, padding: 30 }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontWeight: "bold", fontSize: "2rem" }}>Employee Attendance Summary</h2>

          <div style={{ display: "flex", gap: 8 }}>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {months.map(m => (
                <option key={m} value={m}>{monthNames[m - 1]}</option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => {
                const newY = Number(e.target.value);
                setYear(newY);
                if (newY === currentYear && month > currentMonth) {
                  setMonth(currentMonth);
                }
              }}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <button onClick={exportToCSV} style={{ background: "#3182ce", color: "#fff", padding: "6px 14px" }}>
              Export CSV
            </button>
          </div>
        </div>

        {/* Global Total Number of Days */}
        <div style={{ marginBottom: 20, fontSize: 18, fontWeight: "bold" }}>
          Total Number of Days:{" "}
          <input
            type="text"
            value={globalTotalDays}
            onChange={(e) => {
              if (!/^\d*$/.test(e.target.value)) return;

              const newVal = Number(e.target.value || 0);
              setGlobalTotalDays(newVal);

              setDayInputs(prev => {
                const out = {};
                Object.keys(prev).forEach(id => {
                  if (prev[id].manualTotalDays) {
                    out[id] = prev[id];
                  } else {
                    out[id] = { ...prev[id], totalDays: newVal };
                  }
                });
                return out;
              });
            }}
            style={{ width: 80, textAlign: "center", fontWeight: "bold" }}
          />
        </div>

        {/* Save + Delete */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 15 }}>
          <button
            disabled={selectedEmpIds.size === 0 || saving}
            onClick={handleSaveAttendance}
            style={{
              background: selectedEmpIds.size === 0 ? "#ccc" : "#48bb78",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: 6
            }}
          >
            {saving ? "Saving..." : `Save Attendance (${selectedEmpIds.size})`}
          </button>

          <button
            disabled={selectedEmpIds.size === 0}
            onClick={handleBulkDelete}
            style={{
              background: selectedEmpIds.size === 0 ? "#ccc" : "#e53e3e",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: 6
            }}
          >
            Delete ({selectedEmpIds.size})
          </button>
        </div>

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f3fa" }}>
              <th>S.No.</th>
              <th>Employee Name</th>
              <th>Select</th>
              <th>No. of Working Days</th>
              <th>No. of Leave Days</th>
              <th>Week Days Off</th>
              <th>OT Days</th>
              <th>OT Hours</th>
              <th>Total Days</th>
            </tr>
          </thead>

          <tbody>
            {paginatedEmployees.map((emp, idx) => {
              const empId = emp?.FacilityMember?.FacilityMemberId || idx;

              const name =
                emp?.Profile?.EmployeeName ||
                emp?.EmployeeList?.Designation ||
                emp?.FacilityMember?.Name ||
                "Unknown";

              const isChecked = selectedEmpIds.has(empId);

              const inp = dayInputs[empId] || {
                workingDays: "",
                leaveDays: "",
                weekDaysOff: "",
                otDays: "",
                otHours: "",
                totalDays: employeeSGMap[empId]?.totalDays ?? globalTotalDays,
                manualTotalDays: false,
              };

              return (
                <tr key={empId}>
                  <td style={{ textAlign: "center" }}>{idx + 1}</td>
                  <td>{name}</td>
                  <td style={{ textAlign: "center" }}>
                    <input type="checkbox" checked={isChecked} onChange={() => toggleCheckbox(empId)} />
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.workingDays}
                      onChange={(e) => handleInputChange(empId, "workingDays", e.target.value)}
                      style={{ width: 80, textAlign: "center" }}
                    />
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.leaveDays}
                      onChange={(e) => handleInputChange(empId, "leaveDays", e.target.value)}
                      style={{ width: 80, textAlign: "center" }}
                    />
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.weekDaysOff}
                      onChange={(e) => handleInputChange(empId, "weekDaysOff", e.target.value)}
                      style={{ width: 80, textAlign: "center" }}
                    />
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.otDays}
                      onChange={(e) => handleInputChange(empId, "otDays", e.target.value)}
                      style={{ width: 80, textAlign: "center" }}
                    />
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.otHours}
                      onChange={(e) => handleInputChange(empId, "otHours", e.target.value)}
                      style={{ width: 80, textAlign: "center" }}
                    />
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.totalDays}
                      onChange={(e) => handleInputChange(empId, "totalDays", e.target.value)}
                      style={{ width: 80, textAlign: "center" }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            Prev
          </button>

          <span style={{ margin: "0 12px" }}>
            Page {currentPage} / {totalPages}
          </span>

          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
