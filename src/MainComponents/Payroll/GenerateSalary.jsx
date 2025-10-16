import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  getEmployeesByOffice,
  getEmployeeLoan,
  getSalaryAllowancesByFacilityMember,
  getAttendanceByProperty,
  getPropertyById,
} from "../../Services/PayrollService";

function unique(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function getEmpIds(emp) {
  return (
    (emp.FacilityMember && emp.FacilityMember.FacilityMemberId) ||
    (emp.EmployeeList && emp.EmployeeList.Id)
  );
}

function getMonthYearString(month, year) {
  const mon = month.toString().padStart(2, "0");
  return `${year}-${mon}`;
}

export default function GenerateSalary() {
  const officeId = useSelector((state) => state.Commonreducer.puidn);
  const [selectedOption, setSelectedOption] = useState("All");
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [apiEmployees, setApiEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [generatedEmployees, setGeneratedEmployees] = useState([]);
  const [regenerateEmployees, setRegenerateEmployees] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editedDataById, setEditedDataById] = useState({});
  const [attendanceData, setAttendanceData] = useState([]);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [propertyInfo, setPropertyInfo] = useState(null);

  const years = [];
  for (let y = 2021; y <= currentYear; y++) years.push(y);

  const months = [];
  const maxMonth = selectedYear === currentYear ? currentMonth : 12;
  for (let m = 1; m <= maxMonth; m++) months.push(m);

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

  const boxStyle = {
    textAlign: "center",
    border: "1px solid #b0b8cc",
    borderRadius: 8,
    width: 250,
    height: 250,
    background: "#fff",
    overflow: "hidden",
  };

  const tableBodyHeight = 167;

  useEffect(() => {
    if (officeId) {
      getEmployeesByOffice(officeId).then(async (data) => {
        // Batch fetch: get SalaryAllowances for all employees by their FacilityMemberId
        const salaryPayloads = await Promise.all(
          data.map((emp) =>
            getSalaryAllowancesByFacilityMember(
              emp.FacilityMember && emp.FacilityMember.FacilityMemberId
            )
          )
        );
        // Attach SalaryGroups to each employee
        const enrichedApiEmployees = data.map((emp, idx) => ({
          ...emp,
          SalaryGroups:
            salaryPayloads[idx] && salaryPayloads[idx].SalaryGroups
              ? salaryPayloads[idx].SalaryGroups
              : [],
        }));
        setApiEmployees(enrichedApiEmployees);

        setDesignations(
          unique(
            data.map((emp) =>
              emp.EmployeeList && emp.EmployeeList.Designation
                ? emp.EmployeeList.Designation.trim()
                : null
            )
          )
        );
      });

      getAttendanceByProperty(officeId).then((data) => {
        setAttendanceData(data);
      });
      getPropertyById(officeId)
        .then((data) => {
          setPropertyInfo(data);
        })
        .catch((err) => {
          console.error("Error fetching property:", err);
        });
    }
  }, [officeId]);

  const filteredEmployees = apiEmployees.filter((emp) => {
    const name =
      (emp.EmployeeList && emp.EmployeeList.EmployeeName) ||
      (emp.FacilityMember && emp.FacilityMember.Name) ||
      "";
    const designation = emp.EmployeeList && emp.EmployeeList.Designation;

    if (selectedOption === "Department") {
      if (!selectedDesignation) return false;
      if (designation !== selectedDesignation) return false;
    }

    if (searchText && !name.toLowerCase().includes(searchText.toLowerCase()))
      return false;

    const empId =
      (emp.EmployeeList && emp.EmployeeList.Id) ||
      (emp.FacilityMember && emp.FacilityMember.FacilityMemberId) ||
      null;
    if (generatedEmployees.some((g) => getEmpIds(g) === empId)) return false;

    // Salary start date filtering
    let empStartDateStr =
      emp.SalaryGroups && emp.SalaryGroups[0] && emp.SalaryGroups[0].StartDate
        ? emp.SalaryGroups[0].StartDate
        : null;
    if (!empStartDateStr) return false; // Exclude if salary not assigned

    if (selectedMonth) {
      if (empStartDateStr) {
        const startDateObj = new Date(empStartDateStr);
        if (isNaN(startDateObj.getTime())) {
          // StartDate invalid, optionally exclude employee or include
          return true; // assuming include for safety
        }
        const startYear = startDateObj.getFullYear();
        const startMonth = startDateObj.getMonth() + 1;
        if (
          startYear > selectedYear ||
          (startYear === selectedYear && startMonth > selectedMonth)
        ) {
          return false;
        }
      }
    } else {
      // Yearly pay: hide names if start year is after selected year
      const startDateObj = new Date(empStartDateStr);
      if (startDateObj.getFullYear() > selectedYear) {
        return false;
      }
    }
    return true;
  });

  const toggleSelectEmployee = (emp) => {
    const id =
      (emp.EmployeeList && emp.EmployeeList.Id) ||
      (emp.FacilityMember && emp.FacilityMember.FacilityMemberId) ||
      null;
    if (!id) return;
    const alreadySelected = selectedEmployees.find((e) => {
      const eid =
        (e.EmployeeList && e.EmployeeList.Id) ||
        (e.FacilityMember && e.FacilityMember.FacilityMemberId) ||
        null;
      return eid === id;
    });
    if (alreadySelected) {
      setSelectedEmployees(
        selectedEmployees.filter((e) => {
          const eid =
            (e.EmployeeList && e.EmployeeList.Id) ||
            (e.FacilityMember && e.FacilityMember.FacilityMemberId) ||
            null;
          return eid !== id;
        })
      );
    } else {
      setSelectedEmployees([
        ...selectedEmployees,
        {
          ...emp,
          _selectedMonth: selectedMonth,
          _selectedYear: selectedYear,
        },
      ]);
    }
  };

  const removeEmployeeFromSelected = (emp) => {
    const id =
      (emp.EmployeeList && emp.EmployeeList.Id) ||
      (emp.FacilityMember && emp.FacilityMember.FacilityMemberId) ||
      null;
    if (!id) return;
    setSelectedEmployees(
      selectedEmployees.filter((e) => {
        const eid =
          (e.EmployeeList && e.EmployeeList.Id) ||
          (e.FacilityMember && e.FacilityMember.FacilityMemberId) ||
          null;
        return eid !== id;
      })
    );
  };

  const handleGeneratedEmployeeClick = async (emp) => {
    const empId = getEmpIds(emp);
    let cached = editedDataById[empId];
    let salaryData, loanData;
    if (cached) {
      salaryData = cached.salaryData;
      loanData = cached.loanData;
    } else {
      salaryData = await getSalaryAllowancesByFacilityMember(empId);
      loanData = await getEmployeeLoan(empId);
    }
    setEditData({ ...emp, salaryData, loanData });
    setEditModalOpen(true);
  };

  const handleRegenerateEmployeeClick = (emp) => {
    setRegenerateEmployees(
      regenerateEmployees.filter((e) => getEmpIds(e) !== getEmpIds(emp))
    );
  };

  const findAttendance = (empId, monthYear) => {
    if (!attendanceData) return null;
    return attendanceData.find(
      (a) => a.EmpID === empId && a.monthyear === monthYear
    );
  };

  function getDefaultWeekends(year, month) {
    let count = 0;
    let date = new Date(year, month - 1, 1);
    while (date.getMonth() === month - 1) {
      let day = date.getDay();
      if (day === 0 || day === 6) count++; // Sunday = 0, Saturday = 6
      date.setDate(date.getDate() + 1);
    }
    return count;
  }

  function calculateYearlyNetSalary({
    baseSalary,
    earnings,
    deductions,
    attendanceData,
    empId,
    salaryStartDate,
    selectedYear,
  }) {
    const monthlyBaseSalary = baseSalary / 12;
    const totalAllowances = earnings.reduce(
      (a, x) => a + Number(x.CalculatedAmount || 0),
      0
    );
    const totalDeductions = deductions.reduce(
      (a, x) => a + Number(x.CalculatedAmount || 0),
      0
    );
    const monthlyAllowance = totalAllowances / 12;
    const monthlyDeduction = totalDeductions / 12;

    let yearlySalary = 0;

    for (let month = 1; month <= 12; month++) {
      if (
        salaryStartDate &&
        salaryStartDate.getFullYear() === selectedYear &&
        month < salaryStartDate.getMonth() + 1
      ) {
        continue; // skip months before start month
      }
      const monthYearStr = `${selectedYear}-${month
        .toString()
        .padStart(2, "0")}`;
      const attendance = attendanceData.find(
        (a) => a.EmpID === empId && a.monthyear === monthYearStr
      );
      const daysInMonth = new Date(selectedYear, month, 0).getDate();
      let paidDays;

      if (attendance) {
        paidDays =
          Number(attendance.WorkingDays || 0) +
          Number(attendance.WeekDaysOff || 0);
      } else if (
        salaryStartDate &&
        salaryStartDate.getFullYear() === selectedYear &&
        salaryStartDate.getMonth() + 1 === month
      ) {
        const joinDay = salaryStartDate.getDate();
        paidDays = daysInMonth - joinDay + 1;
      } else {
        paidDays = daysInMonth;
      }

      // <--- THIS IS THE KEY LOGIC FOR YOU --->
      // Prorate base only, always add full allowance/deduction for each month
      const monthlyProratedBase = (monthlyBaseSalary * paidDays) / daysInMonth;
      const monthlyNet =
        monthlyProratedBase + (monthlyAllowance - monthlyDeduction);

      yearlySalary += monthlyNet;
    }

    return Math.round(yearlySalary);
  }

  const generatePayslipHTML = (
    profile,
    salaryData,
    loanData,
    selectedMonth,
    selectedYear
  ) => {
    const empId =
      (profile.FacilityMember && profile.FacilityMember.FacilityMemberId) ||
      (profile.EmployeeList && profile.EmployeeList.Id) ||
      "";

    // Get StartDate (Join Date) from SalaryGroups or profile
    const salaryStartDateStr =
      (salaryData.SalaryGroups &&
        salaryData.SalaryGroups[0] &&
        salaryData.SalaryGroups[0].StartDate) ||
      (profile.EmployeeList && profile.EmployeeList.StartDate) ||
      (profile.FacilityMember && profile.FacilityMember.StartDate);

    const salaryStartDate = salaryStartDateStr
      ? new Date(salaryStartDateStr)
      : null;

    let months = Array.from({ length: 12 }, (_, i) => i + 1); // [1..12]
    let validMonths = months;
    if (salaryStartDate && salaryStartDate.getFullYear() === selectedYear) {
      const startMonth = salaryStartDate.getMonth() + 1;
      validMonths = months.filter((m) => m >= startMonth);
    }

    // Initialize data variables
    let workingDays = "N/A",
      leaveDays = "N/A",
      weekOffs = "N/A",
      currentMonthYear = "";

    let baseSalary = 0,
      fixedSalary = 0,
      earnings = [],
      deductions = [],
      taxAmount = 0,
      isFixedSalary = false;
    if (
      salaryData &&
      Array.isArray(salaryData.SalaryGroups) &&
      salaryData.SalaryGroups.length
    ) {
      const group = salaryData.SalaryGroups[0];
      baseSalary = group.BaseSalary || 0;
      fixedSalary = group.FixedSalary || 0;
      isFixedSalary = !baseSalary && !!fixedSalary;
      taxAmount = group.TaxAmount || 0;
      if (Array.isArray(group.AllowancesDeductions)) {
        group.AllowancesDeductions.forEach((item) => {
          if (item.Type === "Allowance") earnings.push(item);
          else if (item.Type === "Deduction") deductions.push(item);
        });
      }
    }

    let actualBaseSalary = isFixedSalary ? fixedSalary : baseSalary;

    if (selectedMonth) {
      currentMonthYear = getMonthYearString(selectedMonth, selectedYear);
      const attendance = attendanceData.find(
        (a) => a.EmpID === empId && a.monthyear === currentMonthYear
      );

      workingDays = attendance ? attendance.WorkingDays : "N/A";
      leaveDays = attendance ? attendance.LeaveDays : "N/A";
      weekOffs = attendance ? attendance.WeekDaysOff : "N/A";

      const totalDaysInMonth = new Date(
        selectedYear,
        selectedMonth,
        0
      ).getDate();

      const effectiveWeekDays =
        weekOffs !== "N/A" && weekOffs != null
          ? Number(weekOffs)
          : getDefaultWeekends(selectedYear, selectedMonth);

      let presentDays;

      if (
        (workingDays === "N/A" || workingDays == null) &&
        (leaveDays === "N/A" || leaveDays == null)
      ) {
        if (
          salaryStartDate &&
          salaryStartDate.getFullYear() === selectedYear &&
          salaryStartDate.getMonth() + 1 === selectedMonth
        ) {
          const joinDay = salaryStartDate.getDate();
          presentDays = totalDaysInMonth - joinDay + 1;
        } else {
          presentDays = totalDaysInMonth;
        }
      } else if (workingDays === "N/A" || workingDays == null) {
        presentDays = totalDaysInMonth - (Number(leaveDays) || 0);
      } else {
        presentDays = (Number(workingDays) || 0) + effectiveWeekDays;
      }

      actualBaseSalary = Math.round(
        (actualBaseSalary * presentDays) / totalDaysInMonth
      );
    } else {
      let attendanceByMonth = {};
      attendanceData.forEach((a) => {
        if (a.EmpID === empId && a.monthyear.startsWith(`${selectedYear}-`)) {
          const monthNum = Number(a.monthyear.split("-")[1]);
          attendanceByMonth[monthNum] = {
            working: Number(a.WorkingDays || 0),
            leave: Number(a.LeaveDays || 0),
            week: Number(a.WeekDaysOff || 0),
          };
        }
      });

      workingDays = 0;
      leaveDays = 0;
      weekOffs = 0;

      for (let m of validMonths) {
        if (attendanceByMonth[m]) {
          workingDays += attendanceByMonth[m].working;
          leaveDays += attendanceByMonth[m].leave;
          weekOffs += attendanceByMonth[m].week;
        } else {
          // If API doesn't return, calculate for that month
          const yearForMonth = selectedYear;
          const daysInMonth = new Date(yearForMonth, m, 0).getDate();
          let defaultWeekdays = 0;
          let defaultWeekends = 0;
          for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(yearForMonth, m - 1, d); // JS months: 0-indexed
            const dayOfWeek = dateObj.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
              defaultWeekends++;
            } else {
              defaultWeekdays++;
            }
          }
          workingDays += defaultWeekdays;
          weekOffs += defaultWeekends;
          // No attendance data means leave days = 0 for this month
        }
      }
      currentMonthYear = selectedYear;
    }

    let hasLoan = loanData && loanData.LoanMaster;
    let loanAmount = hasLoan ? loanData.LoanMaster.LoanAdvanceAmount : "";
    let loanTenure = hasLoan ? loanData.LoanMaster.TenureMonths : "";
    let loanIssueDate = hasLoan
      ? new Date(loanData.LoanMaster.IssueDate).toLocaleDateString()
      : "";
    let loanEmi =
      hasLoan && loanData.LoanEMIs && loanData.LoanEMIs[0]
        ? loanData.LoanEMIs[0].MonthlyInstallment
        : "";

    let totalAllow = isFixedSalary
      ? actualBaseSalary
      : actualBaseSalary +
        earnings.reduce((a, c) => a + Number(c.CalculatedAmount || 0), 0);

    let totalDeduction = isFixedSalary
      ? 0
      : deductions.reduce((a, c) => a + Number(c.CalculatedAmount || 0), 0);

    let netSalary = totalAllow - totalDeduction;

    let monthsActive = 12;
    if (salaryStartDate) {
      const startYear = salaryStartDate.getFullYear();
      const startMonth = salaryStartDate.getMonth() + 1; // JS months = 0-based
      if (startYear === selectedYear) {
        monthsActive = 13 - startMonth;
      }
    }

    let calculatedSalary;
    if (selectedMonth) {
      calculatedSalary = Math.round(netSalary / 12);
    } else {
      // Use fixedSalary as base for fixed salary yearly
      if (isFixedSalary) {
        netSalary = calculateYearlyNetSalary({
          baseSalary: fixedSalary, // <--- pass fixedSalary!
          earnings: [],
          deductions: [],
          attendanceData,
          empId,
          salaryStartDate,
          selectedYear,
        });
      } else {
        netSalary = calculateYearlyNetSalary({
          baseSalary,
          earnings,
          deductions,
          attendanceData,
          empId,
          salaryStartDate,
          selectedYear,
        });
      }
      calculatedSalary = netSalary;
    }

    // Header logic
    const payslipHeader = selectedMonth
      ? `Wages Slip for the month ${
          monthNames[selectedMonth - 1]
        } ${selectedYear}`
      : `Wages Slip for Year ${selectedYear}`;

    const formattedPropertyAddress = propertyInfo
      ? `${propertyInfo.Name} - ${propertyInfo.AddressLine1}, ${propertyInfo.Landmark}, ${propertyInfo.Pincode}`
      : "";

    const empName =
      (profile.EmployeeList && profile.EmployeeList.EmployeeName) ||
      (profile.FacilityMember && profile.FacilityMember.Name) ||
      "";
    const fatherName =
      (profile.EmployeeList && profile.EmployeeList.FatherName) || "N/A";
    const designation =
      (profile.EmployeeList && profile.EmployeeList.Designation) || "N/A";
    const mobile =
      (profile.EmployeeList && profile.EmployeeList.MobileNo) ||
      (profile.FacilityMember && profile.FacilityMember.MobileNumber) ||
      "";
    const address =
      (profile.FacilityMember && profile.FacilityMember.Address) || "";

    return `
  <html>
    <head>
      <title>${payslipHeader}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 25px; }
        .header-row { display: flex; justify-content: space-between; align-items: flex-start; }
        .header-left, .header-center, .header-right { width: 33%; }
        .header-center { text-align: center; }
        .header-right { text-align: right; font-size: 14px; }
        .header-left { font-size: 14px; }
        .section { margin-top: 18px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 0; }

        /* Header line + bottom-rule */
        .main-sal-table thead tr {
          border-bottom: 2px solid #000;
          border-top: 2px solid #000;
        }
        .main-sal-table tfoot tr, .main-sal-table tr.final-line {
          border-top: 2px solid #000;
        }
        .main-sal-table tbody tr.entry-row {
          border: none;
        }
        .main-sal-table tr:not(.final-line):not(.net-row) td {
          border: none;
        }
        th, td {
          font-size: 15px;
          padding: 7px 8px;
          text-align: left;
          background: #fff;
        }
        /* Deductions separator ONLY */
        .ded-sep, .th-ded-sep { border-left: 2px solid #111 !important; }
        /* Light line before attendance */
        .att-sep, .th-att-sep { border-left: 1.5px solid #bbb !important; }
        /* Totals and net salary styles */
        .total-line td { font-weight: bold; border-top: 1.5px solid #111; border-bottom: none;}
        .netsal-row td { font-size: 20px; font-weight: bold; color: green; text-align: center; padding-top: 4px;}
      </style>
    </head>
    <body>
      <div class="header-row">
        <div class="header-left">
          <b>UFIRM TECHNOLOGIES PVT. LTD.<br/>
          H-64,SEC-63<br/>
          NOIDA, UP</b>
        </div>
        <div class="header-center">
          <h2 style="margin:0;">${payslipHeader}</h2>
        </div>
        <div class="header-right">
          Name and Address of Establishment in under which contract is carried on<br/>
          <b>${formattedPropertyAddress}</b>
        </div>
      </div>
      <div class="section">
        <table>
          <tr>
            <td><b>Employee Name</b></td>
            <td>${empName}</td>
            <td><b>Emp ID</b></td>
            <td>${empId}</td>
          </tr>
          <tr>
            <td><b>Father's Name</b></td>
            <td>${fatherName}</td>
            <td><b>Designation</b></td>
            <td>${designation}</td>
          </tr>
          <tr>
            <td><b>Mobile</b></td>
            <td>${mobile}</td>
            <td><b>Address</b></td>
            <td>${address}</td>
          </tr>
        </table>
      </div>
      <div class="main-sal-row">
        <table class="main-sal-table">
          <thead>
            <tr>
              <th>EARNING</th>
              <th>AMOUNT</th>
              <th class="th-ded-sep">DEDUCTION</th>
              <th>AMOUNT</th>
              <th class="th-att-sep">ATTENDANCE</th>
              <th>VALUE</th>
            </tr>
          </thead>
          <tbody>
  ${
    isFixedSalary
      ? `
        <tr class="entry-row">
          <td></td>
          <td></td>
          <td class="ded-sep"></td>
          <td></td>
          <td class="att-sep">Working Days</td>
          <td>${workingDays}</td>
        </tr>
        <tr class="entry-row">
          <td></td>
          <td></td>
          <td class="ded-sep"></td>
          <td></td>
          <td class="att-sep">Leave Days</td>
          <td>${leaveDays}</td>
        </tr>
        <tr class="entry-row">
          <td></td>
          <td></td>
          <td class="ded-sep"></td>
          <td></td>
          <td class="att-sep">Week Offs</td>
          <td>${weekOffs}</td>
        </tr>
        <tr class="entry-row">
          <td><b>Fixed</b></td>
          <td><b>${fixedSalary}</b></td>
          <td class="ded-sep"><b>Tax</b></td>
          <td><b>${taxAmount}</b></td>
          <td class="att-sep"><b>${selectedMonth ? "Period" : "Year"}</b></td>
          <td><b>${selectedMonth ? currentMonthYear : selectedYear}</b></td>
        </tr>
        <tr class="netsal-row">
          <td colspan="6">Net Salary: ₹ ${calculatedSalary}</td>
        </tr>
      `
      : [0, 1, 2, 3, 4, 5]
          .map((i) => {
            let e = earnings[i];
            let d = deductions[i];
            let aType =
              i === 0
                ? "Working Days"
                : i === 1
                ? "Leave Days"
                : i === 2
                ? "Week Offs"
                : "";
            let aVal =
              i === 0
                ? workingDays
                : i === 1
                ? leaveDays
                : i === 2
                ? weekOffs
                : "";
            if (!e && !d && !aType) return "";
            return `
              <tr class="entry-row">
                <td>${e ? e.Name : ""}</td>
                <td>${e ? e.CalculatedAmount : ""}</td>
                <td class="ded-sep">${d ? d.Name : ""}</td>
                <td>${d ? d.CalculatedAmount : ""}</td>
                <td class="att-sep">${aType}</td>
                <td>${aVal}</td>
              </tr>
            `;
          })
          .join("") +
        `
      <tr class="entry-row">
        <td><b>Basic</b></td>
        <td><b>${baseSalary}</b></td>
        <td class="ded-sep"><b>Tax</b></td>
        <td><b>${taxAmount}</b></td>
        <td class="att-sep"><b>${selectedMonth ? "Period" : "Year"}</b></td>
        <td><b>${selectedMonth ? currentMonthYear : selectedYear}</b></td>
      </tr>
      <tr class="total-line">
        <td><b>Total Allow</b></td>
        <td><b>${earnings.reduce(
          (a, c) => a + Number(c.CalculatedAmount || 0),
          0
        )}</b></td>
        <td class="ded-sep"><b>Total Deduction</b></td>
        <td><b>${deductions.reduce(
          (a, c) => a + Number(c.CalculatedAmount || 0),
          0
        )}</b></td>
        <td class="att-sep"></td>
        <td></td>
      </tr>
      <tr class="netsal-row">
        <td colspan="6">Net Salary: ₹ ${calculatedSalary}</td>
      </tr>
      `
  }
</tbody>
  </html>
`;
  };

  const printForEmployees = async (employees) => {
    for (let emp of employees) {
      try {
        const empId = getEmpIds(emp);
        let cached = editedDataById[empId];
        let salaryData = cached
          ? cached.salaryData
          : await getSalaryAllowancesByFacilityMember(empId);
        let loanData = cached ? cached.loanData : await getEmployeeLoan(empId);
        const payslipHtml = generatePayslipHTML(emp, salaryData, loanData);
        const win = window.open("", "_blank");
        win.document.write(payslipHtml);
        win.document.close();
        win.focus();
        await new Promise((res) => setTimeout(res, 200));
        win.print();
      } catch (err) {
        alert("Could not generate payslip: " + err.message);
      }
    }
    setGeneratedEmployees((prev) => [...prev, ...employees]);
    const generatedIds = employees.map((e) => getEmpIds(e));
    setSelectedEmployees((prev) =>
      prev.filter((emp) => !generatedIds.includes(getEmpIds(emp)))
    );
    setRegenerateEmployees([]);
  };

  const handleGenerate = async () => {
    if (selectedEmployees.length === 0) {
      alert("Please select at least one employee.");
      return;
    }

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let i = 0; i < selectedEmployees.length; i++) {
      const emp = selectedEmployees[i];
      const empId = getEmpIds(emp);

      let salaryData = await getSalaryAllowancesByFacilityMember(empId);
      let loanData = await getEmployeeLoan(empId);

      const payslipHtml = generatePayslipHTML(
        emp,
        salaryData,
        loanData,
        emp._selectedMonth,
        emp._selectedYear
      );

      // Give each preview a unique window name (e.g., empId or index)
      const win = window.open("", `payslip_${empId}_${Date.now() + i}`);
      setTimeout(() => {
        win.document.open();
        win.document.write(payslipHtml);
        win.document.close();
        win.focus();
        win.print();
      }, 100);

      if (i < selectedEmployees.length - 1) {
        await delay(350); // Small delay helps prevent popup blockers/STC
      }
    }
  };

  const handleRegenerate = () => {
    if (regenerateEmployees.length === 0) {
      alert("Please select at least one employee to regenerate.");
      return;
    }
    printForEmployees(regenerateEmployees);
  };

  const handleEditSave = () => {
    const empId = getEmpIds(editData);
    setEditedDataById((prev) => ({ ...prev, [empId]: editData }));
    setRegenerateEmployees((prev) => [...prev, editData]);
    setGeneratedEmployees((prev) => prev.filter((e) => getEmpIds(e) !== empId));
    setEditModalOpen(false);
    setEditData(null);
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditData(null);
  };

  const renderEditModal = () => {
    if (!editModalOpen || !editData) return null;
    const { EmployeeList, FacilityMember, salaryData, loanData } = editData;
    const group =
      salaryData && salaryData.SalaryGroups && salaryData.SalaryGroups[0]
        ? salaryData.SalaryGroups[0]
        : {};
    function updateAllowanceDeduction(idx, key, value) {
      if (!group.AllowancesDeductions) group.AllowancesDeductions = [];
      if (!group.AllowancesDeductions[idx])
        group.AllowancesDeductions[idx] = {};
      group.AllowancesDeductions[idx][key] = value;
      setEditData({ ...editData });
    }
    function updateField(groupKey, val) {
      group[groupKey] = val;
      setEditData({ ...editData });
    }
    function updateLoan(key, val) {
      if (loanData && loanData.LoanMaster) loanData.LoanMaster[key] = val;
      setEditData({ ...editData });
    }
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,.18)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            minWidth: 430,
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 8px 32px #444",
            padding: 22,
          }}
        >
          <h3>Edit Payslip</h3>
          <div>
            <b>Name:</b>
            {(EmployeeList && EmployeeList.EmployeeName) ||
              (FacilityMember && FacilityMember.Name)}
          </div>
          <div>
            <b>Designation:</b> {EmployeeList && EmployeeList.Designation}
          </div>
          <div>
            <h4>Allowances & Deductions</h4>
            {(group.AllowancesDeductions || []).map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span>{item.Type}</span>
                <input style={{ width: 90 }} value={item.Name} disabled />
                <input
                  type="number"
                  style={{ width: 70 }}
                  value={item.CalculatedAmount}
                  onChange={(e) =>
                    updateAllowanceDeduction(
                      idx,
                      "CalculatedAmount",
                      e.target.value
                    )
                  }
                />
              </div>
            ))}
          </div>
          <div>
            <b>Basic Salary: </b>
            <input
              type="number"
              value={group.BaseSalary || ""}
              onChange={(e) => updateField("BaseSalary", e.target.value)}
              style={{ width: 90 }}
            />
          </div>
          <div>
            <b>Tax: </b>
            <input
              type="number"
              value={group.TaxAmount || ""}
              onChange={(e) => updateField("TaxAmount", e.target.value)}
              style={{ width: 90 }}
            />
          </div>
          {loanData && loanData.LoanMaster && (
            <div>
              <h4>Loan Details</h4>
              <div>
                Amount:{" "}
                <input
                  type="number"
                  value={loanData.LoanMaster.LoanAdvanceAmount}
                  onChange={(e) =>
                    updateLoan("LoanAdvanceAmount", e.target.value)
                  }
                  style={{ width: 90 }}
                />
              </div>
              <div>
                Tenure (months):{" "}
                <input
                  type="number"
                  value={loanData.LoanMaster.TenureMonths}
                  onChange={(e) => updateLoan("TenureMonths", e.target.value)}
                  style={{ width: 90 }}
                />
              </div>
            </div>
          )}
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary" onClick={handleEditSave}>
              Save
            </button>
            <button
              className="btn btn-secondary"
              style={{ marginLeft: 10 }}
              onClick={handleEditCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
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
        <h2
          style={{
            fontWeight: "bold",
            marginBottom: 20,
            fontSize: "2rem",
            color: "#2a4365",
          }}
        >
          Generate Salary
        </h2>
        <div
          className="d-flex align-items-center"
          style={{ marginBottom: "30px", gap: "20px" }}
        >
          {/* Radios */}
          <input
            type="radio"
            id="all"
            name="salaryOption"
            value="All"
            checked={selectedOption === "All"}
            onChange={() => {
              setSelectedOption("All");
              setSelectedDesignation("");
              setSelectedEmployees([]);
            }}
          />
          <label
            htmlFor="all"
            style={{ margin: "0 15px 0 5px", fontWeight: 500 }}
          >
            All
          </label>
          <input
            type="radio"
            id="dept"
            name="salaryOption"
            value="Department"
            checked={selectedOption === "Department"}
            onChange={() => {
              setSelectedOption("Department");
              setSelectedEmployees([]);
            }}
          />
          <label htmlFor="dept" style={{ marginLeft: "5px", fontWeight: 500 }}>
            Department
          </label>

          {/* Department dropdown */}
          <select
            value={selectedDesignation}
            onChange={(e) => setSelectedDesignation(e.target.value)}
            disabled={selectedOption !== "Department"}
            className="form-select"
            style={{ width: 220, fontWeight: 500 }}
          >
            <option value="">-- Select Department --</option>
            {designations.map((desig, i) => (
              <option key={i} value={desig}>
                {desig}
              </option>
            ))}
          </select>

          {/* Month dropdown */}
          <select
            value={selectedMonth || ""}
            onChange={(e) =>
              setSelectedMonth(e.target.value ? Number(e.target.value) : null)
            }
            className="form-select"
            style={{ width: 150 }}
          >
            <option value="">-- Whole Year --</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {monthNames[m - 1]}
              </option>
            ))}
          </select>

          {/* Year dropdown */}
          <select
            value={selectedYear}
            onChange={(e) => {
              const newYear = Number(e.target.value);
              setSelectedYear(newYear);
              if (newYear === currentYear && selectedMonth > currentMonth) {
                setSelectedMonth(currentMonth);
              }
            }}
            className="form-select"
            style={{ width: 120 }}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div
          className="d-flex flex-column align-items-center"
          style={{ gap: "60px" }}
        >
          {/* 1st and 2nd row */}
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ gap: 60 }}
          >
            <div style={boxStyle}>
              <div
                style={{
                  height: 36,
                  background: "#f0f3fa",
                  textAlign: "center",
                  fontWeight: 600,
                  padding: 8,
                  borderBottom: "1px solid #b0b8cc",
                }}
              >
                Employee Names
              </div>
              <div style={{ padding: 6 }}>
                <input
                  placeholder="Search name..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{
                    width: "85%",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "1px solid #d0d8e0",
                    marginBottom: "4px",
                  }}
                />
              </div>
              <div
                style={{
                  height: tableBodyHeight,
                  overflowY: "auto",
                  padding: "0 8px",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td
                          style={{
                            textAlign: "center",
                            padding: 7,
                            color: "#718096",
                          }}
                        >
                          No employees found
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp, idx) => {
                        const name =
                          (emp.EmployeeList && emp.EmployeeList.EmployeeName) ||
                          (emp.FacilityMember && emp.FacilityMember.Name) ||
                          "Unknown";
                        const selected = selectedEmployees.some((e) => {
                          const eid =
                            (e.EmployeeList && e.EmployeeList.Id) ||
                            (e.FacilityMember &&
                              e.FacilityMember.FacilityMemberId) ||
                            null;
                          const empId =
                            (emp.EmployeeList && emp.EmployeeList.Id) ||
                            (emp.FacilityMember &&
                              emp.FacilityMember.FacilityMemberId) ||
                            null;
                          return eid === empId;
                        });
                        return (
                          <tr
                            key={idx}
                            onClick={() => toggleSelectEmployee(emp)}
                            style={{
                              textAlign: "center",
                              padding: "7px",
                              borderBottom: "1px solid #edf2f7",
                              cursor: "pointer",
                              backgroundColor: selected ? "#b2d7ff" : "",
                              userSelect: "none",
                            }}
                          >
                            <td>{name}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div
              style={{
                fontSize: "2.1rem",
                fontWeight: "bold",
                color: "#4b6cb7",
              }}
            >
              →
            </div>
            <div style={boxStyle}>
              <div
                style={{
                  height: 36,
                  background: "#f0f3fa",
                  textAlign: "center",
                  fontWeight: 600,
                  padding: 8,
                  borderBottom: "1px solid #b0b8cc",
                }}
              >
                Selected Employees
              </div>
              <div style={{ height: tableBodyHeight, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {selectedEmployees.length === 0 ? (
                      <tr>
                        <td
                          style={{
                            textAlign: "center",
                            padding: 7,
                            color: "#718096",
                          }}
                        >
                          No employees selected
                        </td>
                      </tr>
                    ) : (
                      selectedEmployees.map((emp, idx) => {
                        const name =
                          (emp.EmployeeList && emp.EmployeeList.EmployeeName) ||
                          (emp.FacilityMember && emp.FacilityMember.Name) ||
                          "Unknown";
                        return (
                          <tr
                            key={idx}
                            onClick={() => removeEmployeeFromSelected(emp)}
                            style={{
                              textAlign: "center",
                              padding: "7px",
                              borderBottom: "1px solid #edf2f7",
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                            title="Click to remove"
                          >
                            <td>{name}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 7, padding: "0 8px" }}>
                <button
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                  onClick={handleGenerate}
                  disabled={selectedEmployees.length === 0}
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
          <div
            style={{
              color: "#a94442",
              fontSize: "15px",
              margin: "18px 0 0 0",
              textAlign: "center",
              minHeight: 24,
            }}
          >
            Please set browser pop-up preferences to 'Allow' for this site so
            multiple payslip preview tabs can open.
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#4b6cb7",
              textAlign: "center",
            }}
          >
            ↓
          </div>
          {/* 3rd and 4th row */}
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ gap: 60 }}
          >
            <div style={boxStyle}>
              <div
                style={{
                  height: 36,
                  background: "#f0f3fa",
                  textAlign: "center",
                  fontWeight: 600,
                  padding: 8,
                  borderBottom: "1px solid #b0b8cc",
                }}
              >
                Employee Names
              </div>
              <div style={{ height: tableBodyHeight, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {generatedEmployees.length === 0 ? (
                      <tr>
                        <td
                          style={{
                            textAlign: "center",
                            padding: 7,
                            color: "#718096",
                          }}
                        >
                          No salaries generated yet
                        </td>
                      </tr>
                    ) : (
                      generatedEmployees.map((emp, idx) => (
                        <tr
                          key={idx}
                          onClick={() => handleGeneratedEmployeeClick(emp)}
                          style={{
                            textAlign: "center",
                            padding: "7px",
                            borderBottom: "1px solid #edf2f7",
                            cursor: "pointer",
                            backgroundColor: regenerateEmployees.some(
                              (e) => e.employeeId === emp.employeeId
                            )
                              ? "#b2d7ff"
                              : "",
                            userSelect: "none",
                          }}
                          title="Click to select for regenerate"
                        >
                          <td>
                            {(emp.EmployeeList &&
                              emp.EmployeeList.EmployeeName) ||
                              (emp.FacilityMember && emp.FacilityMember.Name) ||
                              "Unknown"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 7, fontWeight: 500, color: "#0c7bb3" }}>
                Generated Salaries
              </div>
            </div>
            <div
              style={{
                fontSize: "2.1rem",
                fontWeight: "bold",
                color: "#4b6cb7",
              }}
            >
              →
            </div>
            <div style={boxStyle}>
              <div
                style={{
                  height: 36,
                  background: "#f0f3fa",
                  textAlign: "center",
                  fontWeight: 600,
                  padding: 8,
                  borderBottom: "1px solid #b0b8cc",
                }}
              >
                Employee Names
              </div>
              <div style={{ height: tableBodyHeight, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {regenerateEmployees.length === 0 ? (
                      <tr>
                        <td
                          style={{
                            textAlign: "center",
                            padding: 7,
                            color: "#718096",
                          }}
                        >
                          No employees selected to regenerate
                        </td>
                      </tr>
                    ) : (
                      regenerateEmployees.map((emp, idx) => (
                        <tr
                          key={idx}
                          onClick={() => handleRegenerateEmployeeClick(emp)}
                          style={{
                            textAlign: "center",
                            padding: "7px",
                            borderBottom: "1px solid #edf2f7",
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                          title="Click to remove from regenerate list"
                        >
                          <td>{emp.employeeName || "Unknown"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 7 }}>
                <button
                  className="btn btn-warning"
                  style={{ width: "100%" }}
                  onClick={handleRegenerate}
                  disabled={regenerateEmployees.length === 0}
                >
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {renderEditModal()}
    </div>
  );
}
