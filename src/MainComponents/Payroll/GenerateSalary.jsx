import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  getUngeneratedSalaryByOffice,
  createGeneratedSalary,
  getEmployeeGeneratedSalaries,
  getFacilityMemberSalaryDetails,
  deleteGeneratedSalary,
  regenerateEmployeeSalary,
} from "../../Services/PayrollService";

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

const allowanceKeys = [
  "Basic",
  "LEAVEWAGES",
  "HRA",
  "Gratuity",
  "OTDaysAmount",
  "OTHoursAmount",
  "AdjAmt/Incentive",
  "PFArrear",
  "OTHALL",
  "Bonus",
  "DA",
  "CONVEYACNE",
  // "Contractor Allowance",
  // "Housing Allowance",
  // "Transport Allowance",
  // "Medical Allowance",
  // "Performance Bonus",
  // "Overtime Allowance",
  // "Freelancer Allowance",
];

const deductionKeys = [
  "PF",
  "PftAmount",
  "LwfEmployeeAmount",
  "Fine",
  "AdvanceAmount",
  "OthDeduction",
  "UNIFORMDED",
  "FoodDeduction",
  "MaintDeduction",
  "ESI",
  "AccommodationDeduction",
  "IncomeTax",
  // "Pension Deduction",
  // "Health Insurance Deduction",
  // "Union Fees Deduction",
  // "Garnishment Deduction",
  // "Service Charge Deduction",
  // "Miscellaneous Deduction",
  // "Income Tax",
  //"LoanAdvanceAmount",
];

const displayNameMap = {
  // Allowances
  Basic: "Basic",
  LEAVEWAGES: "Leave Wages",
  HRA: "HRA",
  Gratuity: "Gratuity",
  OTDaysAmount: "OTDaysAmount",
  OTHoursAmount: "OTHoursAmount",
  "AdjAmt/Incentive": "AdjAmt/Incentive",
  PFArrear: "PFArrear",
  OTHALL: "OthAll",
  Bonus: "Bonus",
  DA: "DA",
  CONVEYACNE: "Conv",

  // Deductions
  PF: "PF",
  PftAmount: "PFT",
  LwfEmployeeAmount: "LWF",
  Fine: "Fine",
  AdvanceAmount: "Adv.",
  UNIFORMDED: "UniDed",
  OthDeduction: "OthDed",
  FoodDeduction: "Food",
  MaintDeduction: "Maint",
  ESI: "ESI",
  AccommodationDeduction: "Acmd",
  IncomeTax: "IncomeTax",
};

const boxStyle = {
  textAlign: "center",
  border: "1px solid #b0b8cc",
  borderRadius: 8,
  width: 250,
  minHeight: 250,
  background: "#fff",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

export default function GenerateSalary() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Get officeId from Redux store
  const officeId = useSelector((state) => state.Commonreducer.puidn);

  // State variables
  const [selectedOption, setSelectedOption] = useState("All");
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [searchText, setSearchText] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedEmployees, setGeneratedEmployees] = useState([]);
  const [loadingGenerated, setLoadingGenerated] = useState(false);
  const [selectedSalaryRows, setSelectedSalaryRows] = useState([]);
  const [viewPayslipHtml, setViewPayslipHtml] = useState("");
  const [viewPayslipOpen, setViewPayslipOpen] = useState(false);
  const [searchGeneratedText, setSearchGeneratedText] = useState("");
  const [selectedRegenEmployees, setSelectedRegenEmployees] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [salaryData, setSalaryData] = useState([]);
  const [showGrid, setShowGrid] = useState(false);
  const [loadingSalaryData, setLoadingSalaryData] = useState(false);

  // Fetch employees on component mount
  useEffect(() => {
    if (officeId && selectedMonth && selectedYear) {
      const monthName = monthNames[selectedMonth - 1]; // e.g. "October"
      getUngeneratedSalaryByOffice(officeId, monthName, selectedYear)
        .then((data) => {
          setAllEmployees(data || []);
          // Update unique designations for dropdown
          const uniqueDesignations = [
            ...new Set(
              (data || []).map((emp) => emp.Designation).filter(Boolean)
            ),
          ].sort();
          setDesignations(uniqueDesignations);
        })
        .catch((err) => {
          setAllEmployees([]);
          setDesignations([]);
        });
    }
  }, [officeId, selectedMonth, selectedYear]);

  // Filter employees when selection changes
  useEffect(() => {
    filterEmployees();
  }, [selectedOption, selectedDesignation, allEmployees, searchText]);

  // Fetch generated employees when month or year changes
  useEffect(() => {
    if (officeId && selectedMonth && selectedYear) {
      fetchGeneratedEmployees();
    }
  }, [officeId, selectedMonth, selectedYear]);

  useEffect(() => {
  // Whenever property changes → clear regen box + hide grid
  setSelectedRegenEmployees([]);
  setShowGrid(false);
}, [officeId]);

  // Fetch salary details when generated employees change
  // Prevent automatic fetch on first page load

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const monthName = monthNames[selectedMonth - 1];
      const data = await getUngeneratedSalaryByOffice(
        officeId,
        monthName,
        selectedYear
      );
      setAllEmployees(data || []);

      // Extract unique designations
      const uniqueDesignations = [
        ...new Set(data.map((emp) => emp.Designation).filter(Boolean)),
      ].sort();
      setDesignations(uniqueDesignations);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      alert("Failed to fetch employees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...allEmployees];

    // Filter by designation if Designation is selected
    if (selectedOption === "Designation" && selectedDesignation) {
      filtered = filtered.filter(
        (emp) => emp.Designation === selectedDesignation
      );
    }

    // Filter by search text
    if (searchText.trim()) {
      filtered = filtered.filter((emp) =>
        emp.EmployeeName.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  };

  const fetchGeneratedEmployees = async () => {
    setLoadingGenerated(true);
    try {
      const data = await getEmployeeGeneratedSalaries(officeId);

      // Filter by selected month and year
      const monthName = selectedMonth ? monthNames[selectedMonth - 1] : null;

      const filtered = data.filter((emp) => {
        // If whole year selected, match year only
        if (!monthName) {
          return emp.Year === selectedYear;
        }
        // Match both month and year
        return emp.Month === monthName && emp.Year === selectedYear;
      });

      setGeneratedEmployees(filtered || []);
    } catch (error) {
      console.error("Failed to fetch generated employees:", error);
      setGeneratedEmployees([]);
    } finally {
      setLoadingGenerated(false);
    }
  };

  const fetchSalaryDetails = async (specificIds = null) => {
    setLoadingSalaryData(true);
    try {
      const facilityMemberIds = specificIds.length
        ? specificIds
        : generatedEmployees.map((emp) => emp.EmployeeId);
      const monthName = selectedMonth ? monthNames[selectedMonth - 1] : null;

      if (!monthName) {
        // If whole year selected, cannot fetch salary details
        setSalaryData([]);
        setLoadingSalaryData(false);
        return;
      }

      const data = await getFacilityMemberSalaryDetails(
        facilityMemberIds,
        monthName.toLowerCase(),
        selectedYear
      );

      setSalaryData(data || []);

      // ✅ ADD THIS HERE
      if (data.length === 0) setShowGrid(false);
    } catch (error) {
      console.error("Failed to fetch salary details:", error);
      setSalaryData([]);
    } finally {
      setLoadingSalaryData(false);
    }
  };

  const handleEmployeeClick = (employee) => {
    // Check if already selected
    const isSelected = selectedEmployees.some(
      (emp) => emp.EmployeeId === employee.EmployeeId
    );

    if (isSelected) {
      // Remove from selected
      setSelectedEmployees(
        selectedEmployees.filter(
          (emp) => emp.EmployeeId !== employee.EmployeeId
        )
      );
    } else {
      // Add to selected
      setSelectedEmployees([...selectedEmployees, employee]);
    }
  };

  const isEmployeeSelected = (employeeId) => {
    return selectedEmployees.some((emp) => emp.EmployeeId === employeeId);
  };

  // Years and months
  const years = [];
  for (let y = 2021; y <= currentYear; y++) years.push(y);
  const months = [];
  const maxMonth = selectedYear === currentYear ? currentMonth : 12;
  for (let m = 1; m <= maxMonth; m++) months.push(m);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = salaryData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(salaryData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm("Are you sure you want to delete this salary record?")) {
      try {
        await deleteGeneratedSalary(employeeId);
        alert("Salary record deleted successfully");

        // Refresh the data after deletion
        fetchGeneratedEmployees();
      } catch (error) {
        console.error("Failed to delete salary record:", error);
        alert("Failed to delete salary record. Please try again.");
      }
    }
  };

  function calculateProratedNetSalary(row) {
  // Basic (from API)
  const basic = row.Basic || 0;

  // Allowances
  let totalAllowance = basic;
  for (const key of allowanceKeys) {
    if (key !== "Basic") {
      totalAllowance += row[key] || 0;
    }
  }

  // Deductions
  let totalDeduction = 0;
  for (const key of deductionKeys) {
    totalDeduction += row[key] || 0;
  }

  return totalAllowance - totalDeduction;
}

  function generatePayslipHTML(row) {
    // Determine total days in month
    const month = row.Month || "";
    const year = row.Year || new Date().getFullYear();
    let totalDaysInMonth = 31;
    if (month) {
      const num = new Date(`${month} 1, ${year}`);
      totalDaysInMonth = new Date(
        num.getFullYear(),
        num.getMonth() + 1,
        0
      ).getDate();
    }
    return `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #000; font-size: 15px; }
        .header-row { width: 100%; display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;}
        .header-left { text-align: left; line-height: 1.5;}
        .co-bold { font-size: 17px; font-weight: bold; letter-spacing: 1px;}
        .header-right { text-align: right; font-size: 13px; max-width: 270px; line-height: 1.5;}
        .est-header { font-size: 13px; font-weight: normal;}
        .est-bold { font-weight: bold; font-size: 15px; }
        .center-title { text-align: center; font-size: 20px; font-weight: bold; margin: 15px 0 12px 0;}
        .info-table { width: 100%; margin-bottom: 7px;}
        .info-table td { padding: 3px 7px; border: none; font-size: 15px;}
        .summary-table { width: 100%; margin-bottom: 12px;}
        .summary-table td { padding: 3px 7px; border: none; font-size: 15px;}
        table.pay-slip-table {
          width: 100%; border-collapse: collapse; margin-top: 10px;
        }
        table.pay-slip-table th {
          background: #fff; font-weight: bold; border-top: 2.8px double #111; border-bottom: 2.8px double #111;
          border-left: none; border-right: none;
          text-align: left;
        }
        table.pay-slip-table td {
          font-size: 15px; border: none; padding: 9px 9px;
        }
        /* vertical lines, custom: */
        .v-bold { border-right: 2.8px solid #111 !important; }
        .v-light { border-right: 1px solid #bababa !important; }
        /* No horizontal border for mid rows: */
        .no-horiz-border td { border-top: none !important; }
        /* double line for last row */
        .double-bottom td { border-bottom: 2.8px double #111 !important; padding-bottom: 9px;}
        .bold-top {
  border-top: 2.8px double #111 !important;
}
        .net-salary {
          color: #169c12; font-size: 19px; font-weight: bold; margin-top: 18px; text-align:center; letter-spacing:0.5px;
        }
      </style>
    </head>
    <body>
      <div class="center-title">Wages Slip for the month ${row.Month || ""} ${
      row.Year
    }</div>
      <div class="header-row">
        <div class="header-left">
          <div class="co-bold">UFIRM TECHNOLOGIES PVT. LTD.</div>
          <div>H-64, SEC-63</div>
          <div>NOIDA, UP</div>
        </div>
        <div class="header-right">
          <div class="est-header">Name and Address of Establishment in under which contract is carried on</div>
          <div class="est-bold">${row.PropertyName || ""}${
      row.AddressLine1 ? " - " + row.AddressLine1 : ""
    }${row.Landmark ? ", " + row.Landmark : ""}${
      row.Pincode ? ", PIN: " + row.Pincode : ""
    }</div>
          <div>${row.ContactNumber ? "Contact: " + row.ContactNumber : ""}</div>
        </div>
      </div>
      <table class="info-table">
  <tr>
    <td><b>Employee Name:</b></td>
    <td>${row.FacilityMemberName || ""}</td>
    <td><b>Bank Name:</b></td>
    <td>${row.BankName || "-"}</td>
    <td><b>Acc/Card No.:</b></td>
    <td>${row.BankAccountNumber || "-"}</td>
  </tr>
  <tr>
    <td><b>Emp ID:</b></td>
    <td>${row.FacilityMemberId || ""}</td>
    <td><b>IFSC Code:</b></td>
    <td>${row.BankIFSCCode || "-"}</td>
    <td><b>PF No.:</b></td>
    <td>${row.PF_number || ""}</td>
  </tr>
  <tr>
    <td><b>Father's Name:</b></td>
    <td>${row.FatherName || ""}</td>
    <td><b>Pay Mode:</b></td>
    <td>${"Bank Transfer"}</td>
    <td><b>UAN No.:</b></td>
    <td>${row.UANNumber || "-"}</td>
  </tr>
  <tr>
    <td><b>Designation:</b></td>
    <td>${row.Designation || ""}</td>
    <td><b>ESI No.:</b></td>
    <td>${row.ESINumber || ""}</td>
    <td><b>Mobile No.:</b></td>
    <td>${row.MobileNumber || ""}</td>
  </tr>
  <tr>
    <td><b>Joining Date:</b></td>
    <td>${row.DateOfJoining.split("T")[0] || ""}</td>
  </tr>
</table>
      <table class="pay-slip-table">
        <tr>
          <th>EARNING</th>
          <th class="v-bold">AMOUNT</th>
          <th>DEDUCTION</th>
          <th class="v-light">AMOUNT</th>
          <th>ATTENDANCE</th>
          <th>VALUE</th>
        </tr>
        <tr>
          <td>Basic</td>
          <td class="v-bold">${row.Basic || row.ProRatedSalary || 0}</td>
          <td >PF</td>
          <td class="v-light">${row.PF || 0}</td>
          <td >Working Days</td>
          <td>${row.WorkingDays || ""}</td>
        </tr>
        <tr class="no-horiz-border">
          <td>Leave Wages</td>
          <td class="v-bold">${row.LEAVEWAGES || 0}</td>
          <td >PFT</td>
          <td class="v-light">${row.PftAmount || 0}</td>
          <td >Leave Days</td>
          <td>${row.LeaveDays || 0}</td>
        </tr>
        <tr class="no-horiz-border">
          <td>HRA</td>
          <td class="v-bold">${row.HRA || 0}</td>
          <td>LWF</td>
          <td class="v-light">${row.LwfEmployeeAmount || 0}</td>
          <td>Week Offs</td>
          <td>${row.WeekDaysOff || 0}</td>
        </tr>
        <tr class="no-horiz-border">
          <td>Gratuity</td>
          <td class="v-bold">${row.Gratuity || 0}</td>
          <td>Fine</td>
          <td class="v-light">${row.Fine || 0}</td>
          <td>OTDays</td>
          <td>${row.OTDays || 0}</td>
        </tr>
        <tr class="no-horiz-border">
          <td>OTDaysAmount</td>
          <td class="v-bold">${row.OTDaysAmount || 0}</td>
          <td>Adv.</td>
          <td class="v-light">${row.AdvanceAmount || 0}</td>
          <td>OTHours</td>
          <td>${row.OTHours || 0}</td>
        </tr>
        <tr class="no-horiz-border">
          <td>OTHoursAmount</td>
          <td class="v-bold">${row.OTHoursAmount || 0}</td>
          <td>OthDed</td>
          <td>${row.OthDeduction || 0}</td>
        </tr>
        <tr class="no-horiz-border">
          <td>AdjAmt/Incentive</td>
          <td class="v-bold">${row.AdjAmt || row.Incentive || 0}</td>
          <td>UniDed</td>
          <td>${row.UNIFORMDED || 0}</td>
        </tr>
        <tr class="no-horiz-border">
          <td>PFArrear</td>
          <td class="v-bold">${row.PFArrear || 0}</td>
          <td>Food</td>
          <td>${row.FoodDeduction || 0}</td>
        </tr>
        <tr class="no-horiz-border">
          <td>OthAll</td>
          <td class="v-bold">${row.OTHALL || 0}</td>
          <td>Maint.</td>
          <td>${row.MaintDeduction || 0}</td>
        </tr>
        <tr class="no-horiz-border">
          <td>Bonus</td>
          <td class="v-bold">${row.Bonus || 0}</td>
          <td>ESI</td>
          <td>${row.ESI || 0}</td>
        </tr>
        <tr class="no-horiz-border">
          <td>DA</td>
          <td class="v-bold">${row.DA || 0}</td>
          <td>Acmd.Ded</td>
          <td>${row.AccommodationDeduction || 0}</td>
        </tr>
        <tr class="no-horiz-border">
          <td>Conv</td>
          <td class="v-bold">${row.CONVEYACNE || 0}</td>
          <td>IncomeTax</td>
          <td>${row.IncomeTax || 0}</td>
        </tr>
        <tr class="bold-top double-bottom">
          <td><b>Total Allowance</b></td>
          <td class="v-bold"><b>${
            (row.Basic || row.ProRatedSalary || 0) +
            (row.HRA || 0) +
            (row.LEAVEWAGES || 0) +
            (row.CONVEYACNE || 0) +
            (row.DA || 0) +
            (row.Gratuity || 0) +
            (row.Bonus || 0) +
            (row.OTDaysAmount || 0) +
            (row.OTHoursAmount || 0) +
            (row.AdjAmt || row.Incentive || 0) +
            (row.PFArrear || 0) +
            (row.OTHALL || 0)
          }</b></td>
          <td ><b>Total Deduction</b></td>
          <td><b>${
            (row.PF || 0) +
            (row.LwfEmployeeAmount || 0) +
            (row.PftAmount || 0) +
            (row.Fine || 0) +
            (row.AdvanceAmount || 0) +
            (row.OthDeduction || 0) +
            (row.UNIFORMDED || 0) +
            (row.FoodDeduction || 0) +
            (row.MaintDeduction || 0) +
            (row.ESI || 0) +
            (row.AccommodationDeduction || 0) +
            (row.IncomeTax || 0)
          }</b></td>
          <td><b></b></td>
          <td><b></b></td>
        </tr>
      </table>
      <div class="net-salary">Net Salary: ₹ ${
        (row.Basic || row.ProRatedSalary || 0) +
        (row.LEAVEWAGES || 0) +
        (row.HRA || 0) +
        (row.OTDaysAmount || 0) +
        (row.OTHoursAmount || 0) +
        (row.AdjAmt || row.Incentive || 0) +
        (row.PFArrear || 0) +
        (row.OTHALL || 0) +
        (row.Bonus || 0) +
        (row.DA || 0) +
        (row.CONVEYACNE || 0) -
        ((row.PF || 0) +
          (row.LwfEmployeeAmount || 0) +
          (row.PftAmount || 0) +
          (row.Fine || 0) +
          (row.AdvanceAmount || 0) +
          (row.OthDeduction || 0) +
          (row.UNIFORMDED || 0) +
          (row.FoodDeduction || 0) +
          (row.MaintDeduction || 0) +
          (row.ESI || 0) +
          (row.AccommodationDeduction || 0) +
          (row.IncomeTax || 0))
      }</div>
    </body>
  </html>
  `;
  }

  const handleCreatePDF = async () => {
    const selectedRows = salaryData.filter((row) =>
      selectedSalaryRows.includes(row.FacilityMemberId)
    );

    if (selectedRows.length === 0) {
      alert("Please select at least one employee to generate PDF.");
      return;
    }

    for (const row of selectedRows) {
      const payslipHtml = generatePayslipHTML(row);
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "210mm";
      container.style.height = "297mm";
      container.innerHTML = payslipHtml;
      document.body.appendChild(container);

      try {
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ unit: "mm", format: "a4" });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(
          `Payslip_${row.FacilityMemberId}_${row.Month || "All"}_${
            row.Year
          }.pdf`
        );
      } catch (error) {
        alert(
          "Failed to generate PDF for employee " +
            (row.FacilityMemberName || "")
        );
      } finally {
        document.body.removeChild(container);
      }
    }
  };

  const handleViewPayslip = (row) => {
    const payslipHtml = generatePayslipHTML(row);
    setViewPayslipHtml(payslipHtml);
    setViewPayslipOpen(true);
  };

  const handleGenerateFromGrid = async () => {
    if (selectedEmployees.length === 0) {
      alert("Please select at least one employee");
      return;
    }

    setGenerating(true);
    try {
      // Prepare month and year values
      const monthValue = selectedMonth ? monthNames[selectedMonth - 1] : null;
      const yearValue = selectedYear;

      // Create salary entry for each selected employee
      const promises = selectedEmployees.map(async (emp) => {
        const salaryData = {
          EmployeeId: emp.EmployeeId,
          EmployeeName: emp.EmployeeName,
          OfficeId: officeId,
          CreatedOn: new Date().toISOString(),
          Month: monthValue, // null if "Whole Year" selected
          Year: yearValue,
          is_active: true,
        };
        console.log("Creating salary with data:", salaryData);
        return await createGeneratedSalary(salaryData);
      });

      await Promise.all(promises);

      alert(
        `Successfully generated salary for ${selectedEmployees.length} employee(s)`
      );

      // Clear selected employees after successful generation
      setSelectedEmployees([]);

      // Refresh both employee lists
      fetchEmployees();
      await fetchGeneratedEmployees();

      // ✅ now fetch salary details only for newly generated IDs
      const generatedIds = selectedEmployees.map((emp) => emp.EmployeeId);
      await fetchSalaryDetails(generatedIds);
      setShowGrid(true);
    } catch (error) {
      console.error("Failed to generate salary:", error);
      alert("Failed to generate salary. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleMoveAllToSelected = () => {
    setSelectedEmployees((prev) => [
      ...prev,
      ...filteredEmployees.filter(
        (emp) => !prev.some((sel) => sel.EmployeeId === emp.EmployeeId)
      ),
    ]);
  };

  const filteredGeneratedEmployees = generatedEmployees.filter((emp) =>
    emp.EmployeeName.toLowerCase().includes(searchGeneratedText.toLowerCase())
  );

  const handleViewSelected = async () => {
    if (selectedRegenEmployees.length === 0) {
      alert("No employees selected to view salary.");
      return;
    }

    // get all ids
    const ids = selectedRegenEmployees.map((e) => e.EmployeeId);

    // fetch only these
    await fetchSalaryDetails(ids);

    setShowGrid(true);
  };

  const handleRegenerateSalary = async () => {
    if (selectedRegenEmployees.length === 0) {
      alert("No employees selected to regenerate.");
      return;
    }

    try {
      // Month + Year
      const monthValue = monthNames[selectedMonth - 1];
      const yearValue = selectedYear;

      // hit regenerate API for each selected employee
      for (const emp of selectedRegenEmployees) {
        const payload = {
          EmployeeId: emp.EmployeeId,
          EmployeeName: emp.EmployeeName,
          OfficeId: officeId,
          CreatedOn: new Date().toISOString(),
          Month: monthValue,
          Year: yearValue,
          is_active: true,
        };

        await regenerateEmployeeSalary(payload);
      }

      // ✅ collect IDs for filtered grid
      const ids = selectedRegenEmployees.map((e) => e.EmployeeId);

      await fetchGeneratedEmployees();

      // ✅ fetch only the regenerated employees
      await fetchSalaryDetails(ids);

      setShowGrid(true);

      // ✅ Clear after regeneration
      setSelectedRegenEmployees([]);
      alert("Regeneration done!");
    } catch (err) {
      console.error("Failed to regenerate salary:", err);
      alert("Failed to regenerate salary.");
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
          maxWidth: 1400,
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

        {/* Controls row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginBottom: 30,
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 500,
            }}
          >
            <input
              type="radio"
              name="salaryOption"
              value="All"
              checked={selectedOption === "All"}
              onChange={() => {
                setSelectedOption("All");
                setSelectedDesignation("");
              }}
              style={{ accentColor: "#2563eb" }}
            />
            All
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 500,
            }}
          >
            <input
              type="radio"
              name="salaryOption"
              value="Designation"
              checked={selectedOption === "Designation"}
              onChange={() => {
                setSelectedOption("Designation");
              }}
              style={{ accentColor: "#2563eb" }}
            />
            Designation
          </label>
          <select
            value={selectedDesignation}
            onChange={(e) => setSelectedDesignation(e.target.value)}
            disabled={selectedOption !== "Designation"}
            className="form-select"
            style={{ width: 220, fontWeight: 500 }}
          >
            <option value="">-- Select Designation --</option>
            {designations.map((desig, i) => (
              <option key={i} value={desig}>
                {desig}
              </option>
            ))}
          </select>
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

        {/* Main Boxes */}
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ gap: 60 }}
        >
          {/* Employee Names Box */}
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
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search name..."
              style={{
                margin: 14,
                padding: 7,
                borderRadius: 5,
                border: "1px solid #b0b8cc",
                width: "88%",
                fontSize: 15,
              }}
            />
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "0 10px",
                maxHeight: "150px", // Fixed height for scrollable area
              }}
            >
              {loading ? (
                <div
                  style={{ padding: 20, textAlign: "center", color: "#718096" }}
                >
                  Loading...
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div
                  style={{ padding: 20, textAlign: "center", color: "#718096" }}
                >
                  No employees found
                </div>
              ) : (
                filteredEmployees.map((emp) => (
                  <div
                    key={emp.EmployeeId}
                    onClick={() => handleEmployeeClick(emp)}
                    style={{
                      padding: "8px 10px",
                      margin: "5px 0",
                      cursor: "pointer",
                      borderRadius: 4,
                      background: isEmployeeSelected(emp.EmployeeId)
                        ? "#e0f2fe"
                        : "transparent",
                      border: isEmployeeSelected(emp.EmployeeId)
                        ? "1px solid #0ea5e9"
                        : "none", // <- NO border if not selected
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>
                      {emp.EmployeeName}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div
            style={{
              fontSize: "2.1rem",
              fontWeight: "bold",
              color: "#4b6cb7",
              alignSelf: "center",
              cursor: "pointer",
              userSelect: "none",
            }}
            title="Move all to Selected"
            onClick={handleMoveAllToSelected}
          >
            →
          </div>

          {/* Selected Employees Box */}
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
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "10px",
                maxHeight: "170px", // Fixed height for scrollable area
              }}
            >
              {selectedEmployees.length === 0 ? (
                <div
                  style={{ padding: 20, textAlign: "center", color: "#718096" }}
                >
                  No employees selected
                </div>
              ) : (
                selectedEmployees.map((emp) => (
                  <div
                    key={emp.EmployeeId}
                    style={{
                      padding: "8px 10px",
                      margin: "5px 0",
                      borderRadius: 4,
                      background: "#e0f2fe",
                      border: "1px solid #0ea5e9",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {/* Only show employee name, no designation */}
                    <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>
                      {emp.EmployeeName}
                    </div>
                    <button
                      onClick={() => handleEmployeeClick(emp)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                        padding: 0,
                      }}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
            <button
              style={{
                margin: 0,
                marginTop: "auto",
                background: generating ? "#94a3b8" : "#5b9aff",
                color: "#fff",
                border: "none",
                borderRadius: "0 0 8px 8px",
                width: "100%",
                padding: "12px 0",
                fontSize: "1rem",
                fontWeight: 500,
                cursor: generating ? "not-allowed" : "pointer",
              }}
              onClick={handleGenerateFromGrid}
              disabled={generating || selectedEmployees.length === 0}
            >
              {generating ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>

        {/* Down Arrow */}
        <div
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#4b6cb7",
            textAlign: "center",
            margin: "45px 0 24px 0",
          }}
        >
          ↓
        </div>

        {/* Second Row */}
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ gap: 60 }}
        >
          {/* Generated Salaries (3rd box) */}
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
              Generated Salaries
            </div>
            <input
              type="text"
              value={searchGeneratedText}
              onChange={(e) => setSearchGeneratedText(e.target.value)}
              placeholder="Search name..."
              style={{
                margin: 14,
                padding: 7,
                borderRadius: 5,
                border: "1px solid #b0b8cc",
                width: "88%",
                fontSize: 15,
              }}
            />
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "10px",
                maxHeight: "170px",
              }}
            >
              {loadingGenerated ? (
                <div
                  style={{ padding: 20, textAlign: "center", color: "#718096" }}
                >
                  Loading...
                </div>
              ) : generatedEmployees.length === 0 ? (
                <div
                  style={{ padding: 20, textAlign: "center", color: "#718096" }}
                >
                  No generated salaries for{" "}
                  {selectedMonth ? monthNames[selectedMonth - 1] : "Whole Year"}{" "}
                  {selectedYear}
                </div>
              ) : (
                filteredGeneratedEmployees.map((emp) => (
                  <div
                    key={emp.EmployeeId}
                    onClick={() => {
                      if (
                        selectedRegenEmployees.some(
                          (e) => e.EmployeeId === emp.EmployeeId
                        )
                      ) {
                        setSelectedRegenEmployees(
                          selectedRegenEmployees.filter(
                            (e) => e.EmployeeId !== emp.EmployeeId
                          )
                        );
                      } else {
                        setSelectedRegenEmployees([
                          ...selectedRegenEmployees,
                          emp,
                        ]);
                      }
                    }}
                    style={{
                      padding: "6px 10px",
                      margin: "4px 0",
                      borderRadius: 5,
                      fontWeight: 500,
                      fontSize: "0.92rem",
                      cursor: "pointer",
                      background: selectedRegenEmployees.some(
                        (e) => e.EmployeeId === emp.EmployeeId
                      )
                        ? "#e0f2fe"
                        : "transparent",
                      border: selectedRegenEmployees.some(
                        (e) => e.EmployeeId === emp.EmployeeId
                      )
                        ? "1px solid #1e90ff"
                        : "1px solid transparent",
                      transition: "all 0.2s",
                    }}
                  >
                    {emp.EmployeeName}
                  </div>
                ))
              )}
            </div>
          </div>

          <div
            style={{
              fontSize: "2.1rem",
              fontWeight: "bold",
              color: "#4b6cb7",
              alignSelf: "center",
              cursor: "pointer",
              userSelect: "none",
            }}
            title="Move all to Selected"
            onClick={() => {
              setSelectedRegenEmployees(filteredGeneratedEmployees);
            }}
          >
            →
          </div>

          {/* Selected Employees (4th box) */}
          <div style={boxStyle}>
            <div
              style={{
                height: 36,
                background: "#f0f3fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 10px",
                fontWeight: 600,
                borderBottom: "1px solid #b0b8cc",
              }}
            >
              <span>Selected Employees</span>

              {/* Eye icon inside header */}
              <button
                onClick={handleViewSelected}
                disabled={selectedRegenEmployees.length === 0}
                title="View selected salary info"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor:
                    selectedRegenEmployees.length === 0
                      ? "not-allowed"
                      : "pointer",
                  opacity: selectedRegenEmployees.length === 0 ? 0.4 : 1,
                  fontSize: "1.1rem",
                  color: "#2563eb",
                  padding: 4,
                }}
              >
                <i className="fa fa-eye" />
              </button>
            </div>
            <div
              style={{
                flex: 1,
                padding: "10px",
                maxHeight: "170px",
                overflowY: "auto",
              }}
            >
              {selectedRegenEmployees.length === 0 ? (
                <div
                  style={{ padding: 20, textAlign: "center", color: "#718096" }}
                >
                  No employees selected for regeneration
                </div>
              ) : (
                selectedRegenEmployees.map((emp) => (
                  <div
                    key={emp.EmployeeId}
                    style={{
                      padding: "8px 10px",
                      margin: "5px 0",
                      borderRadius: 4,
                      background: "#e0f2fe",
                      border: "1px solid #0ea5e9",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {/* Clicking name = regenerate + remove */}
                    <div
                      onClick={() =>
                        setSelectedRegenEmployees(
                          selectedRegenEmployees.filter(
                            (e) => e.EmployeeId !== emp.EmployeeId
                          )
                        )
                      }
                      style={{
                        fontWeight: 500,
                        fontSize: "0.9rem",
                        flex: 1,
                      }}
                      title="Click to mark regenerated (remove from list)"
                    >
                      {emp.EmployeeName}
                    </div>

                    {/* Clicking × = just remove manually */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent parent click
                        setSelectedRegenEmployees(
                          selectedRegenEmployees.filter(
                            (e) => e.EmployeeId !== emp.EmployeeId
                          )
                        );
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                        padding: 0,
                      }}
                      title="Remove manually"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
            <button
              style={{
                margin: 0,
                marginTop: "auto",
                background: "#5b9aff",
                color: "#fff",
                border: "none",
                borderRadius: "0 0 8px 8px",
                width: "100%",
                padding: "12px 0",
                fontSize: "1rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
              onClick={handleRegenerateSalary}
              disabled={selectedRegenEmployees.length === 0}
            >
              Regenerate
            </button>
          </div>
        </div>

        {/* Salary Data Grid Table */}
        {showGrid && (
          <div style={{ marginTop: 50, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: -24,
                right: 0,
                zIndex: 2,
              }}
            >
              <button
                onClick={handleCreatePDF}
                disabled={selectedSalaryRows.length === 0}
                style={{
                  background:
                    selectedSalaryRows.length === 0 ? "#d1eaff" : "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 28px",
                  fontWeight: 600,
                  letterSpacing: 1,
                  cursor:
                    selectedSalaryRows.length === 0 ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  marginBottom: "8px",
                }}
              >
                Create PDF
              </button>
            </div>

            <div style={{ overflowX: "auto", paddingTop: 45 }}>
              {/* Table header here */}
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <thead>
                  <tr style={{ background: "#f0f3fa" }}>
                    <th
                      rowSpan="2"
                      style={{
                        width: 30,
                        padding: "0 10px",
                        border: "1px solid #b0b8cc",
                        textAlign: "center",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          currentItems.length > 0 &&
                          currentItems.every((row) =>
                            selectedSalaryRows.includes(row.FacilityMemberId)
                          )
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSalaryRows(
                              currentItems.map((row) => row.FacilityMemberId)
                            );
                          } else {
                            setSelectedSalaryRows([]);
                          }
                        }}
                      />
                    </th>
                    <th
                      rowSpan="2"
                      style={{
                        padding: "12px 8px",
                        border: "1px solid #b0b8cc",
                        fontWeight: 600,
                      }}
                    >
                      S.No.
                    </th>
                    <th
                      rowSpan="2"
                      style={{
                        padding: "12px 8px",
                        border: "1px solid #b0b8cc",
                        fontWeight: 600,
                      }}
                    >
                      Name
                    </th>
                    <th
                      rowSpan="2"
                      style={{
                        padding: "12px 8px",
                        border: "1px solid #b0b8cc",
                        fontWeight: 600,
                      }}
                    >
                      Joining Date
                    </th>
                    <th
                      colSpan={5}
                      style={{
                        background: "#e6eefd",
                        padding: "12px 8px",
                        border: "1px solid #b0b8cc",
                        fontWeight: 600,
                      }}
                    >
                      Attendance
                    </th>
                    <th
                      colSpan={allowanceKeys.length}
                      style={{
                        padding: "12px 8px",
                        border: "1px solid #b0b8cc",
                        fontWeight: 600,
                        background: "#e6f2ff",
                      }}
                    >
                      Allowance
                    </th>
                    <th
                      colSpan={deductionKeys.length}
                      style={{
                        padding: "12px 8px",
                        border: "1px solid #b0b8cc",
                        fontWeight: 600,
                        background: "#ffe6e6",
                      }}
                    >
                      Deduction
                    </th>
                    <th
                      rowSpan="2"
                      style={{
                        padding: "12px 8px",
                        border: "1px solid #b0b8cc",
                        fontWeight: 600,
                      }}
                    >
                      Net Salary
                    </th>
                    <th
                      rowSpan="2"
                      style={{
                        padding: "12px 8px",
                        border: "1px solid #b0b8cc",
                        fontWeight: 600,
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                  <tr style={{ background: "#f0f3fa" }}>
                    <th style={{ borderRight: "1.5px solid #b0b8cc" }}>
                      Working Days
                    </th>
                    <th style={{ borderRight: "1.5px solid #b0b8cc" }}>
                      Week Days
                    </th>
                    <th style={{ borderRight: "1.5px solid #b0b8cc" }}>
                      Leave Days
                    </th>
                    <th style={{ borderRight: "1.5px solid #b0b8cc" }}>
                      OT Days
                    </th>
                    <th>OT Hours</th>
                    {allowanceKeys.map((key) => (
                      <th
                        key={key}
                        style={{
                          padding: "12px 8px",
                          border: "1px solid #b0b8cc",
                          fontWeight: 500,
                          background: "#e6f2ff",
                        }}
                      >
                        {displayNameMap[key] || key}
                      </th>
                    ))}
                    {deductionKeys.map((key) => (
                      <th
                        key={key}
                        style={{
                          padding: "12px 8px",
                          border: "1px solid #b0b8cc",
                          fontWeight: 500,
                          background: "#ffe6e6",
                        }}
                      >
                        {displayNameMap[key] || key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingSalaryData ? (
                    <tr>
                      <td
                        colSpan={
                          6 + allowanceKeys.length + deductionKeys.length + 2
                        }
                        style={{
                          padding: "40px",
                          textAlign: "center",
                          color: "#718096",
                        }}
                      >
                        Loading salary details...
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          6 + allowanceKeys.length + deductionKeys.length + 2
                        }
                        style={{
                          padding: "40px",
                          textAlign: "center",
                          color: "#718096",
                        }}
                      >
                        No salary data available. Please generate salary first.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((row, index) => (
                      <tr
                        key={row.FacilityMemberId}
                        style={{ borderBottom: "1px solid #e2e8f0" }}
                      >
                        <td
                          style={{
                            textAlign: "center",
                            border: "1px solid #b0b8cc",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSalaryRows.includes(
                              row.FacilityMemberId
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSalaryRows([
                                  ...selectedSalaryRows,
                                  row.FacilityMemberId,
                                ]);
                              } else {
                                setSelectedSalaryRows(
                                  selectedSalaryRows.filter(
                                    (id) => id !== row.FacilityMemberId
                                  )
                                );
                              }
                            }}
                          />
                        </td>
                        <td
                          style={{
                            padding: "12px 8px",
                            border: "1px solid #b0b8cc",
                            textAlign: "center",
                          }}
                        >
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td
                          style={{
                            padding: "12px 8px",
                            border: "1px solid #b0b8cc",
                          }}
                        >
                          {row.FacilityMemberName}
                        </td>
                        <td
                          style={{
                            padding: "12px 8px",
                            border: "1px solid #b0b8cc",
                          }}
                        >
                          {row.DateOfJoining
                            ? row.DateOfJoining.split("T")[0]
                            : "-"}
                        </td>
                        <td
                          style={{
                            padding: "12px 8px",
                            border: "1px solid #b0b8cc",
                            textAlign: "center",
                            borderRight: "1.5px solid #b0b8cc",
                          }}
                        >
                          {row.WorkingDays || 0}
                        </td>
                        <td
                          style={{
                            padding: "12px 8px",
                            border: "1px solid #b0b8cc",
                            textAlign: "center",
                            borderRight: "1.5px solid #b0b8cc",
                          }}
                        >
                          {row.WeekDaysOff || 0}
                        </td>
                        <td
                          style={{
                            padding: "12px 8px",
                            border: "1px solid #b0b8cc",
                            textAlign: "center",
                          }}
                        >
                          {row.LeaveDays || 0}
                        </td>
                        <td
                          style={{
                            padding: "12px 8px",
                            border: "1px solid #b0b8cc",
                            textAlign: "center",
                          }}
                        >
                          {row.OTDays || 0}
                        </td>

                        <td
                          style={{
                            padding: "12px 8px",
                            border: "1px solid #b0b8cc",
                            textAlign: "center",
                          }}
                        >
                          {row.OTHours || 0}
                        </td>

                        {allowanceKeys.map((key) => {
                          let value = row[key] || 0;
                          return (
                            <td
                              key={key}
                              style={{
                                padding: "12px 8px",
                                border: "1px solid #b0b8cc",
                                textAlign: "right",
                              }}
                            >
                              ₹{value.toLocaleString()}
                            </td>
                          );
                        })}
                        {deductionKeys.map((key) => (
                          <td
                            key={key}
                            style={{
                              padding: "12px 8px",
                              border: "1px solid #b0b8cc",
                              textAlign: "right",
                            }}
                          >
                            ₹{(row[key] || 0).toLocaleString()}
                          </td>
                        ))}
                        <td
                          style={{
                            padding: "12px 8px",
                            border: "1px solid #b0b8cc",
                            textAlign: "right",
                            fontWeight: 600,
                          }}
                        >
                          ₹{calculateProratedNetSalary(row).toLocaleString()}
                        </td>
                        <td
                          style={{
                            padding: "12px 8px",
                            border: "1px solid #b0b8cc",
                            textAlign: "center",
                          }}
                        >
                          <button
                            className="btn btn-sm btn-info"
                            title="View"
                            onClick={() => handleViewPayslip(row)}
                            style={{
                              backgroundColor: "#0dcaf0",
                              border: "none",
                              width: "32px",
                              height: "32px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "4px",
                              marginBottom: "6px", // adds a tiny gap between the two vertically
                            }}
                          >
                            <i className="fa fa-eye" aria-hidden="true"></i>
                          </button>
                          <br />
                          <button
                            className="btn btn-sm btn-danger"
                            title="Delete"
                            onClick={() => handleDelete(row.FacilityMemberId)}
                            style={{
                              border: "none",
                              width: "32px",
                              height: "32px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "4px",
                            }}
                          >
                            <i className="fa fa-trash" aria-hidden="true"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 20,
                gap: 10,
              }}
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 16px",
                  background: currentPage === 1 ? "#e2e8f0" : "#3b82f6",
                  color: currentPage === 1 ? "#94a3b8" : "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      padding: "8px 12px",
                      background: currentPage === pageNum ? "#3b82f6" : "#fff",
                      color: currentPage === pageNum ? "#fff" : "#334155",
                      border: "1px solid #cbd5e1",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontWeight: currentPage === pageNum ? 600 : 400,
                    }}
                  >
                    {pageNum}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: "8px 16px",
                  background:
                    currentPage === totalPages ? "#e2e8f0" : "#3b82f6",
                  color: currentPage === totalPages ? "#94a3b8" : "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      {viewPayslipOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.45)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 10,
              minWidth: 400,
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 0 20px rgba(0,0,0,0.3)",
            }}
          >
            <button
              style={{
                float: "right",
                border: "none",
                background: "transparent",
                fontSize: 20,
                cursor: "pointer",
              }}
              onClick={() => setViewPayslipOpen(false)}
            >
              ×
            </button>
            <div dangerouslySetInnerHTML={{ __html: viewPayslipHtml }} />
          </div>
        </div>
      )}
    </div>
  );
}
