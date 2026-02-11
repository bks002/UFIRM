// ⭐⭐⭐⭐⭐ FINAL MERGED ATTENDANCE SHEET WITH SALARY GROUP + MANUAL EDIT SUPPORT ⭐⭐⭐⭐⭐

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import {
  getAttendanceByProperty,
  createAttendance,
  updateAttendance,
  deleteMultipleAttendance,
  uploadAttendance,
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

  const [globalTotalDays, setGlobalTotalDays] = useState(
    totalDaysInSelectedMonth
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;
  const totalPages = Math.ceil(employees.length / recordsPerPage);
  const paginatedEmployees = employees.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Current system date
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Month-year dropdowns
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

  const baseExtraFields = {
    EL: "",
    CL: "",
    SL: "",
    nhDays: "",
    fhDays: "",
    holidays: "",
    divideByDays: "",
    otMonthDays: "",
    pfArrear: "",
    otherArrear: "",
    incentive: "",
    advanceDed: "",
    uniformDed: "",
    bgvDed: "",
    roomDed: "",
    fineDed: "",
    joiningKits: "",
    otherDed: "",
    foodDed: "",
    status: "",
  };

  const fileInputRef = React.useRef(null);
  async function handleImportClick() {
    fileInputRef.current.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const monthyear = getMonthYearString(month, year);

      const res = await uploadAttendance(file, propertyId, monthyear);

      alert(res?.Message || "Attendance uploaded successfully!");

      // Refresh attendance after upload
      const refreshed = await getAttendanceByProperty(propertyId);
      setAttendanceData(refreshed || []);
      setFilteredAttendance(
        (refreshed || []).filter(
          (item) => item.monthyear === monthyear
        )
      );
    } catch (err) {
      alert("Upload failed.");
    }

    e.target.value = null; // reset input
  }

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
        setDayInputs((prev) => {
          const updated = {};
          for (const empId of Object.keys(prev)) {
            if (prev[empId].manualTotalDays) {
              updated[empId] = prev[empId];
            } else {
              updated[empId] = {
                ...prev[empId],
                totalDays: prev[empId].totalDays || twd,
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
    setCurrentPage(1);

    async function loadAttendance() {
      if (!propertyId) return;

      try {
        const data = await getAttendanceByProperty(propertyId);

        const safeData = data || [];
        setAttendanceData(safeData);

        const currMonthYear = getMonthYearString(month, year);

        const filtered = safeData.filter(
          (item) => item.monthyear === currMonthYear
        );

        setFilteredAttendance(filtered);

        const mappedInputs = {};
        filtered.forEach((att) => {
          mappedInputs[att.EmpID] = {
            workingDays: att.WorkingDays,
            EL: att.EL ?? "",
            CL: att.CL ?? "",
            SL: att.SL ?? "",
            weekDaysOff: att.WeekDaysOff,
            otDays: att.OtDays || "",
            otHours: att.OtHours || "",
            totalDays:
              att.TotalWorkingDays ?? employeeSGMap[att.EmpID]?.totalDays ?? globalTotalDays,
            manualTotalDays: false,
            nhDays: att.NHDays ?? "",
            fhDays: att.FHDays ?? "",
            holidays: att.Holidays ?? "",
            divideByDays: att.DivideByDays ?? "",
            otMonthDays: att.OtMonthDays ?? "",
            pfArrear: att.PFArrear ?? "",
            otherArrear: att.OtherArrear ?? "",
            incentive: att.Incentive ?? "",
            advanceDed: att.AdvanceDed ?? "",
            uniformDed: att.UniformDed ?? "",
            bgvDed: att.BGVDed ?? "",
            roomDed: att.RoomDed ?? "",
            fineDed: att.FineDed ?? "",
            joiningKits: att.JoiningKits ?? "",
            otherDed: att.OtherDed ?? "",
            foodDed: att.FoodDed ?? "",
            status: att.Status ?? "",
          };
        });

        setDayInputs(mappedInputs);
        setSelectedEmpIds(new Set());
      } catch (err) {
        // ✅ IMPORTANT PART
        if (err?.response?.status === 404) {
          // No attendance exists → this is NOT an error
          setAttendanceData([]);
          setFilteredAttendance([]);
          setDayInputs({});
          setSelectedEmpIds(new Set());
        } else {
          console.error("Attendance load failed:", err);
        }
      }
    }

    loadAttendance();
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
              EL: "",
              CL: "",
              SL: "",
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
    if (field !== "status" && !/^\d*\.?\d*$/.test(value)) return;

    setDayInputs((prev) => {
      const current = prev[empId] || {
        workingDays: "",
        EL: "",
        CL: "",
        SL: "",
        weekDaysOff: "",
        otDays: "",
        otHours: "",
        totalDays: employeeSGMap[empId]?.totalDays ?? globalTotalDays,
        manualTotalDays: false,
        ...baseExtraFields,
      };

      const updated = { ...current, [field]: value };

      if (field === "totalDays") {
        updated.manualTotalDays = true; // user override!
      }

      const totalDays =
        field === "totalDays"
          ? parseFloat(value) || 0
          : parseFloat(current.totalDays) ||
          employeeSGMap[empId]?.totalDays ||
          globalTotalDays;

      const w = parseFloat(updated.workingDays) || 0;
      const el = parseFloat(updated.EL) || 0;
      const cl = parseFloat(updated.CL) || 0;
      const sl = parseFloat(updated.SL) || 0;
      const l = el + cl + sl;
      const wk = parseFloat(updated.weekDaysOff) || 0;

      if (["workingDays", "EL", "CL", "SL", "weekDaysOff"].includes(field)) {
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

    // ✅ helper to safely convert numbers
    const n = (v) => (v === "" || v === null || v === undefined ? 0 : Number(v));

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

      // ✅ compute once, reuse everywhere
      const EL = n(inp.EL);
      const CL = n(inp.CL);
      const SL = n(inp.SL);
      const LeaveDays = EL + CL + SL;

      const model = {
        EmpID: empId,
        EmployeeName: empName,
        PropertyID: propertyId,
        monthyear: currMonthYear,
        IsActive: true,
        CreatedOn: new Date().toISOString(),

        WorkingDays: n(inp.workingDays),
        WeekDaysOff: n(inp.weekDaysOff),

        EL,
        CL,
        SL,
        LeaveDays,

        NHDays: n(inp.nhDays),
        FHDays: n(inp.fhDays),
        Holidays: n(inp.holidays),
        DivideByDays: n(inp.divideByDays),
        OtMonthDays: n(inp.otMonthDays),

        PFArrear: n(inp.pfArrear),
        OtherArrear: n(inp.otherArrear),
        Incentive: n(inp.incentive),

        AdvanceDed: n(inp.advanceDed),
        UniformDed: n(inp.uniformDed),
        BGVDed: n(inp.bgvDed),
        RoomDed: n(inp.roomDed),
        FineDed: n(inp.fineDed),
        JoiningKits: n(inp.joiningKits),
        OtherDed: n(inp.otherDed),
        FoodDed: n(inp.foodDed),

        OtDays: n(inp.otDays),
        OtHours: n(inp.otHours),
        TotalWorkingDays: n(inp.totalDays),

        Status: inp.status || "",
      };

      const existing = attendanceData.find(
        (a) => a.EmpID === empId && a.monthyear === currMonthYear
      );

      if (existing)
        promises.push(updateAttendance(empId, currMonthYear, model));
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
      console.error("Save attendance error:", err);
      alert("Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------
  // Bulk Delete
  // ---------------------------------------------------------
  async function handleBulkDelete() {
    if (!window.confirm("Are you sure you want to delete selected attendance?"))
      return;

    setDeleting(true);

    try {
      await deleteMultipleAttendance(
        Array.from(selectedEmpIds).join(","),
        getMonthYearString(month, year)
      );

      // Clean UI after delete
      setAttendanceData((prev) =>
        prev.filter(
          (a) =>
            !selectedEmpIds.has(a.EmpID) ||
            a.monthyear !== getMonthYearString(month, year)
        )
      );

      setDayInputs((prev) => {
        const copy = { ...prev };
        selectedEmpIds.forEach((id) => delete copy[id]);
        return copy;
      });

      setSelectedEmpIds(new Set());
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed. Try again.");
    } finally {
      setDeleting(false);
    }
  }

  // ---------------------------------------------------------
  // CSV Export
  // ---------------------------------------------------------
  function exportToCSV() {
    const heading = `Attendance for: ${monthNames[month - 1]} ${year}\n\n`;

    const header = [
      "Employee Code",
      "Employee Name",
      "Designation",
      "Working Days",
      "EL",
      "CL",
      "SL",
      "Leave Days",
      "Week Days Off",
      "OT Days",
      "OT Hours",
      "NH Days",
      "FH Days",
      "Holidays",
      "Divide By Days",
      "OT Month Days",
      "PF Arrear",
      "Other Arrear",
      "Incentive",
      "Advance Ded",
      "Uniform Ded",
      "BGV Ded",
      "Room Ded",
      "Fine Ded",
      "Joining Kits",
      "Other Ded",
      "Food Ded",
      "Payable Days",
      "Total Working Days",
      "Status",
    ].join(",") + "\n";

    const rows = paginatedEmployees.map((emp, idx) => {
      const empId =
        emp?.FacilityMember?.FacilityMemberId ?? emp?.EmpID ?? idx;

      const empCode = emp?.Profile?.EmployeeCode || "-";

      const empName =
        emp?.Profile?.EmployeeName ||
        emp?.FacilityMember?.Name ||
        "Unknown";

      const designation =
        emp?.EmployeeList?.Designation ||
        emp?.Profile?.Designation ||
        "-";

      const inp = dayInputs[empId] || {};
      const saved =
        filteredAttendance.find(
          (a) => String(a.EmpID) === String(empId)
        ) || {};

      const EL = Number(inp.EL ?? saved.EL ?? 0);
      const CL = Number(inp.CL ?? saved.CL ?? 0);
      const SL = Number(inp.SL ?? saved.SL ?? 0);
      const leaveDays = EL + CL + SL;

      const values = [
        empCode,
        empName,
        designation,
        inp.workingDays ?? saved.WorkingDays ?? "",
        EL,
        CL,
        SL,
        leaveDays,
        inp.weekDaysOff ?? saved.WeekDaysOff ?? "",
        inp.otDays ?? saved.OtDays ?? "",
        inp.otHours ?? saved.OtHours ?? "",
        inp.nhDays ?? saved.NHDays ?? "",
        inp.fhDays ?? saved.FHDays ?? "",
        inp.holidays ?? saved.Holidays ?? "",
        inp.divideByDays ?? saved.DivideByDays ?? "",
        inp.otMonthDays ?? saved.OtMonthDays ?? "",
        inp.pfArrear ?? saved.PFArrear ?? "",
        inp.otherArrear ?? saved.OtherArrear ?? "",
        inp.incentive ?? saved.Incentive ?? "",
        inp.advanceDed ?? saved.AdvanceDed ?? "",
        inp.uniformDed ?? saved.UniformDed ?? "",
        inp.bgvDed ?? saved.BGVDed ?? "",
        inp.roomDed ?? saved.RoomDed ?? "",
        inp.fineDed ?? saved.FineDed ?? "",
        inp.joiningKits ?? saved.JoiningKits ?? "",
        inp.otherDed ?? saved.OtherDed ?? "",
        inp.foodDed ?? saved.FoodDed ?? "",
        inp.totalDays ?? saved.TotalWorkingDays ?? "",
        inp.totalDays ?? saved.TotalWorkingDays ?? "",
        inp.status ?? saved.Status ?? "",
      ];

      // ✅ quote ONCE, escape internal quotes safely
      return values
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });

    const csv = heading + header + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_full_${monthNames[
      month - 1
    ].toLowerCase()}_${year}.csv`;
    a.click();

    window.URL.revokeObjectURL(url);
  }

  const allEmpIds = paginatedEmployees
    .map((emp) => emp?.FacilityMember?.FacilityMemberId)
    .filter(Boolean);

  const isAllSelected =
    allEmpIds.length > 0 &&
    allEmpIds.every((id) => selectedEmpIds.has(id));

  function toggleSelectAll(checked) {
    setSelectedEmpIds((prev) => {
      const next = new Set(prev);

      if (checked) {
        allEmpIds.forEach((id) => {
          next.add(id);

          // ensure inputs exist
          if (!dayInputs[id]) {
            next.add(id);
          }
        });
      } else {
        allEmpIds.forEach((id) => next.delete(id));
      }

      return next;
    });
  }

  // ---------------------------------------------------------
  // RENDER UI (unchanged)
  // ---------------------------------------------------------

  const thStyle = {
    border: "1px solid #cbd5e0",
    padding: "10px 8px",
    textAlign: "center",
    fontWeight: 600,
    fontSize: 14,
    background: "#f7fafc",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    border: "1px solid #e2e8f0",
    padding: "8px",
    textAlign: "center",
    verticalAlign: "middle",
  };

  const inputStyle = {
    width: "90px",
    textAlign: "center",
    padding: "4px 6px",
    borderRadius: 4,
    border: "1px solid #cbd5e0",
    fontSize: 14,
  };
  return (
    <div
      style={{
        padding: "20px 24px",
        paddingLeft: "100px", // 👈 sidebar width
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          maxWidth: "100%",
        }}
      >
        <h2 style={{ fontWeight: "bold", fontSize: "2rem" }}>
          Employee Attendance Summary
        </h2>

        <div style={{ display: "flex", gap: 8 }}>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {monthNames[m - 1]}
              </option>
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
            }}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={exportToCSV}
            style={{
              background: "#3182ce",
              color: "#fff",
              padding: "6px 14px",
            }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Total Days (Left) + Actions (Right) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        {/* Left: Total Days */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            fontWeight: "bold",
          }}
        >
          <span>Total Number of Days:</span>
          <input
            type="text"
            value={globalTotalDays}
            onChange={(e) => {
              if (!/^\d*$/.test(e.target.value)) return;

              const newVal = Number(e.target.value || 0);
              if (newVal < 1 || newVal > getDaysInMonth(month, year)) return;
              setGlobalTotalDays(newVal);

              setDayInputs((prev) => {
                const out = {};
                Object.keys(prev).forEach((id) => {
                  if (prev[id].manualTotalDays) {
                    out[id] = prev[id];
                  } else {
                    out[id] = { ...prev[id], totalDays: newVal };
                  }
                });
                return out;
              });
            }}
            style={{
              width: 90,
              textAlign: "center",
              fontWeight: "bold",
              padding: "4px 6px",
              borderRadius: 4,
              border: "1px solid #cbd5e0",
            }}
          />
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".csv,.xlsx"
            onChange={handleFileChange}
          />

          <button
            onClick={handleImportClick}
            style={{
              background: "#38a169", // green
              color: "#fff",
              padding: "8px 20px",
              borderRadius: 6,
            }}
          >
            Import
          </button>

          <button
            disabled={selectedEmpIds.size === 0 || saving}
            onClick={handleSaveAttendance}
            style={{
              background: selectedEmpIds.size === 0 ? "#ccc" : "#48bb78",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: 6,
            }}
          >
            {saving
              ? "Saving..."
              : `Save Attendance (${selectedEmpIds.size})`}
          </button>

          <button
            onClick={handleBulkDelete}
            disabled={selectedEmpIds.size === 0 || deleting}
            style={{
              background:
                selectedEmpIds.size === 0 || deleting ? "#ccc" : "#e53e3e",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: 6,
              cursor:
                selectedEmpIds.size === 0 || deleting
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {deleting ? "Deleting..." : `Delete (${selectedEmpIds.size})`}
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          overflowX: "auto",
          maxWidth: "100%",
          border: "1px solid #e2e8f0",
          borderRadius: 6,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "auto", // ✅ IMPORTANT
            minWidth: "1600px",  // ensures columns don’t crush
          }}
        >
          <thead>
            <tr>
              <th rowSpan={2} style={{ ...thStyle, width: 50 }}>S.No.</th>
              <th rowSpan={2} style={{ ...thStyle, width: 120 }}>
                Employee Code
              </th>

              <th rowSpan={2} style={{ ...thStyle, width: 200, textAlign: "left" }}>
                Employee Name
              </th>
              <th rowSpan={2} style={{ ...thStyle, width: 180 }}>
                Designation
              </th>
              <th
                rowSpan={2}
                style={{
                  ...thStyle,
                  width: 70,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span>Select</span>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </div>
              </th>
              <th rowSpan={2} style={{ ...thStyle, width: 130 }}>Working Days</th>

              {/* Leave group */}
              <th colSpan={3} style={thStyle}>Leave</th>

              <th rowSpan={2} style={{ ...thStyle, width: 130 }}>Weekly Off</th>
              <th rowSpan={2} style={{ ...thStyle, width: 100 }}>OT Days</th>
              <th rowSpan={2} style={{ ...thStyle, width: 110 }}>OT Hours</th>
              <th rowSpan={2} style={{ ...thStyle, width: 100 }}>NH Days</th>
              <th rowSpan={2} style={{ ...thStyle, width: 100 }}>FH Days</th>
              <th rowSpan={2} style={{ ...thStyle, width: 100 }}>Holidays</th>
              <th rowSpan={2} style={{ ...thStyle, width: 130 }}>Divide By Days</th>
              <th rowSpan={2} style={{ ...thStyle, width: 130 }}>OT Month Days</th>
              <th rowSpan={2} style={{ ...thStyle, width: 130 }}>PF Arrear</th>
              <th rowSpan={2} style={{ ...thStyle, width: 130 }}>Other Arrear</th>
              <th rowSpan={2} style={{ ...thStyle, width: 130 }}>Incentive</th>
              <th rowSpan={2} style={{ ...thStyle, width: 130 }}>Advance Ded</th>
              <th rowSpan={2} style={{ ...thStyle, width: 130 }}>Uniform Ded</th>
              <th rowSpan={2} style={{ ...thStyle, width: 130 }}>BGV Ded</th>
              <th rowSpan={2} style={{ ...thStyle, width: 130 }}>Room Ded</th>
              <th rowSpan={2} style={{ ...thStyle, width: 130 }}>Fine Ded</th>
              <th rowSpan={2} style={{ ...thStyle, width: 130 }}>Joining Kits</th>
              <th rowSpan={2} style={{ ...thStyle, width: 130 }}>Other Ded</th>
              <th rowSpan={2} style={{ ...thStyle, width: 130 }}>Food Ded</th>
              <th rowSpan={2} style={{ ...thStyle, width: 180 }}>Payable Days / Total Days</th>
              <th rowSpan={2} style={{ ...thStyle, width: 100 }}>Status</th>
            </tr>

            <tr>
              <th style={{ ...thStyle, width: 90 }}>EL</th>
              <th style={{ ...thStyle, width: 90 }}>CL</th>
              <th style={{ ...thStyle, width: 90 }}>SL</th>
            </tr>
          </thead>

          <tbody>
            {paginatedEmployees.map((emp, idx) => {
              const empCode = emp?.Profile?.EmployeeCode || "-";
              if (!emp?.FacilityMember?.FacilityMemberId) return null;
              const empId = emp.FacilityMember.FacilityMemberId;

              const designation =
                emp?.EmployeeList?.Designation ||
                emp?.Profile?.Designation ||
                "-";

              const name =
                emp?.Profile?.EmployeeName ||
                emp?.EmployeeList?.Designation ||
                emp?.FacilityMember?.Name ||
                "Unknown";

              const isChecked = selectedEmpIds.has(empId);

              const inp = dayInputs[empId] || {
                workingDays: "",
                EL: "",
                CL: "",
                SL: "",
                weekDaysOff: "",
                otDays: "",
                otHours: "",
                totalDays: employeeSGMap[empId]?.totalDays ?? globalTotalDays,
                manualTotalDays: false,
                ...baseExtraFields,
              };

              return (
                <tr key={empId}>
                  <td style={tdStyle}>{idx + 1}</td>

                  {/* Employee Code */}
                  <td style={{ ...tdStyle, fontWeight: 500 }}>
                    {empCode}
                  </td>

                  {/* Employee Name */}
                  <td style={{ ...tdStyle, textAlign: "left", fontWeight: 500 }}>
                    {name}
                  </td>

                  {/* Designation */}
                  <td style={{ ...tdStyle, textAlign: "left" }}>
                    {designation}
                  </td>

                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCheckbox(empId)}
                    />
                  </td>

                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.workingDays}
                      onChange={(e) =>
                        handleInputChange(empId, "workingDays", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* EL */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.EL}
                      onChange={(e) =>
                        handleInputChange(empId, "EL", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* CL */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.CL}
                      onChange={(e) =>
                        handleInputChange(empId, "CL", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* SL */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.SL}
                      onChange={(e) =>
                        handleInputChange(empId, "SL", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.weekDaysOff}
                      onChange={(e) =>
                        handleInputChange(empId, "weekDaysOff", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.otDays}
                      onChange={(e) =>
                        handleInputChange(empId, "otDays", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.otHours}
                      onChange={(e) =>
                        handleInputChange(empId, "otHours", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* NH Days */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.nhDays}
                      onChange={(e) =>
                        handleInputChange(empId, "nhDays", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* FH Days */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.fhDays}
                      onChange={(e) =>
                        handleInputChange(empId, "fhDays", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* Holidays */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.holidays}
                      onChange={(e) =>
                        handleInputChange(empId, "holidays", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* Divide By Days */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.divideByDays}
                      onChange={(e) =>
                        handleInputChange(empId, "divideByDays", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* OT Month Days */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.otMonthDays}
                      onChange={(e) =>
                        handleInputChange(empId, "otMonthDays", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* PF Arrear */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.pfArrear}
                      onChange={(e) =>
                        handleInputChange(empId, "pfArrear", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* Other Arrear */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.otherArrear}
                      onChange={(e) =>
                        handleInputChange(empId, "otherArrear", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* Incentive */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.incentive}
                      onChange={(e) =>
                        handleInputChange(empId, "incentive", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* Advance Ded */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.advanceDed}
                      onChange={(e) =>
                        handleInputChange(empId, "advanceDed", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* Uniform Ded */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.uniformDed}
                      onChange={(e) =>
                        handleInputChange(empId, "uniformDed", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* BGV Ded */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.bgvDed}
                      onChange={(e) =>
                        handleInputChange(empId, "bgvDed", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* Room Ded */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.roomDed}
                      onChange={(e) =>
                        handleInputChange(empId, "roomDed", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* Fine Ded */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.fineDed}
                      onChange={(e) =>
                        handleInputChange(empId, "fineDed", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* Joining Kits */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.joiningKits}
                      onChange={(e) =>
                        handleInputChange(empId, "joiningKits", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* Other Ded */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.otherDed}
                      onChange={(e) =>
                        handleInputChange(empId, "otherDed", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  {/* Food Ded */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.foodDed}
                      onChange={(e) =>
                        handleInputChange(empId, "foodDed", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  <td style={tdStyle}>
                    <input
                      type="text"
                      disabled={!isChecked}
                      value={inp.totalDays}
                      onChange={(e) =>
                        handleInputChange(empId, "totalDays", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  <td style={tdStyle}>
                    <select
                      disabled={!isChecked}
                      value={inp.status || ""}
                      onChange={(e) =>
                        handleInputChange(empId, "status", e.target.value)
                      }
                      style={{
                        ...inputStyle,
                        width: "120px",
                        cursor: isChecked ? "pointer" : "not-allowed",
                      }}
                    >
                      <option value="">Select</option>
                      <option value="Open">Open</option>
                      <option value="Processed">Processed</option>
                      <option value="Hold">Hold</option>
                    </select>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Prev
        </button>

        <span style={{ margin: "0 12px" }}>
          Page {currentPage} / {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
