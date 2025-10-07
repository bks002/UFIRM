import React, { useState, useEffect } from "react";
import { getEmployeesByOffice, getEmployeeLoan, getSalaryAllowancesByFacilityMember } from "../../Services/PayrollService";
import { useSelector } from "react-redux";

function unique(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function downloadCSV(csv, filename = "EmployeeSalaryWithLoans.csv") {
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function GenerateSalary() {
  const officeId = useSelector((state) => state.Commonreducer.puidn);
  const [selectedOption, setSelectedOption] = useState("All");
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [apiEmployees, setApiEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [searchText, setSearchText] = useState("");

  // Employees currently in the "Selected Employees" table (2nd table)
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  // Employees whose salaries have been generated (3rd table)
  const [generatedEmployees, setGeneratedEmployees] = useState([]);

  // Employees selected for regeneration (4th table)
  const [regenerateEmployees, setRegenerateEmployees] = useState([]);

  const months = [
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
      getEmployeesByOffice(officeId).then((data) => {
        setApiEmployees(data);
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

    // Don't show employee in first list if they have already been generated
    const empId =
      (emp.EmployeeList && emp.EmployeeList.Id) ||
      (emp.FacilityMember && emp.FacilityMember.FacilityMemberId) ||
      null;
    if (
      generatedEmployees.some(
        (g) =>
          g.employeeId === empId
      )
    )
      return false;

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
      setSelectedEmployees([...selectedEmployees, emp]);
    }
  };

  const removeEmployeeFromSelected = (emp) => {
    // Remove employee when clicked in 2nd table
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

  // 3rd table click - move employee to 4th table
  const handleGeneratedEmployeeClick = (emp) => {
    const alreadyInRegen = regenerateEmployees.some(e => e.employeeId === emp.employeeId);
    if (alreadyInRegen) return; // no duplicates
    setRegenerateEmployees([...regenerateEmployees, emp]);
  };

  // 4th table click - remove employee from regenerate list
  const handleRegenerateEmployeeClick = (emp) => {
    setRegenerateEmployees(
      regenerateEmployees.filter(e => e.employeeId !== emp.employeeId)
    );
  };

  // Generate CSV for employees selected in 2nd table
  const handleGenerate = async () => {
    if (selectedEmployees.length === 0) {
      alert("Please select at least one employee.");
      return;
    }
    const results = [];
    for (const emp of selectedEmployees) {
      try {
        const empId =
          (emp.FacilityMember && emp.FacilityMember.FacilityMemberId) ||
          (emp.EmployeeList && emp.EmployeeList.Id);
        const empName =
          (emp.EmployeeList && emp.EmployeeList.EmployeeName) ||
          (emp.FacilityMember && emp.FacilityMember.Name) ||
          "";

        // Fetch salary and loan details to build CSV rows
        let salaryInfo = [];
        try {
          const sres = await getSalaryAllowancesByFacilityMember(empId);
          salaryInfo = Array.isArray(sres.SalaryGroups) ? sres.SalaryGroups : [];
        } catch {}
        let loan = null;
        try {
          loan = await getEmployeeLoan(empId);
        } catch {}
        results.push({ employeeName: empName, employeeId: empId, salaryInfo, loan });
      } catch {}
    }

    // Build CSV rows
    const header = [
      "Employee Name",
      "Employee ID",
      "Salary Group",
      "Base Salary",
      "Fixed Salary",
      "Tax Amount",
      "Allowance/Deduction Type",
      "Allowance/Deduction Name",
      "Calculated Amount",
      "Loan ID",
      "Loan Amount",
      "Loan Balance",
      "Tenure (Months)",
      "Loan EMI",
      "Loan Issue Date",
    ];
    let rows = [header];
    results.forEach(({ employeeName, employeeId, salaryInfo, loan }) => {
      if (salaryInfo.length === 0 && (!loan || !loan.LoanMaster)) {
        rows.push([`"${employeeName}"`, employeeId, "No Data", "", "", "", "", "", "", "", "", "", "", "", ""]);
        return;
      }
      if (salaryInfo.length > 0) {
        salaryInfo.forEach((group) => {
          if (Array.isArray(group.AllowancesDeductions) && group.AllowancesDeductions.length) {
            group.AllowancesDeductions.forEach((ad) => {
              rows.push([
                `"${employeeName}"`,
                employeeId,
                group.SalaryGroup,
                group.BaseSalary,
                group.FixedSalary,
                group.TaxAmount,
                ad.Type,
                ad.Name,
                ad.CalculatedAmount,
                loan && loan.LoanMaster ? loan.LoanMaster.LoanID : "",
                loan && loan.LoanMaster ? loan.LoanMaster.LoanAdvanceAmount : "",
                loan && loan.LoanMaster ? loan.LoanMaster.BalanceAmount : "",
                loan && loan.LoanMaster ? loan.LoanMaster.TenureMonths : "",
                loan && loan.LoanEMIs && loan.LoanEMIs[0] ? loan.LoanEMIs[0].MonthlyInstallment : "",
                loan && loan.LoanMaster ? new Date(loan.LoanMaster.IssueDate).toLocaleDateString() : "",
              ]);
            });
          } else {
            rows.push([
              `"${employeeName}"`,
              employeeId,
              group.SalaryGroup,
              group.BaseSalary,
              group.FixedSalary,
              group.TaxAmount,
              "",
              "",
              "",
              loan && loan.LoanMaster ? loan.LoanMaster.LoanID : "",
              loan && loan.LoanMaster ? loan.LoanMaster.LoanAdvanceAmount : "",
              loan && loan.LoanMaster ? loan.LoanMaster.BalanceAmount : "",
              loan && loan.LoanMaster ? loan.LoanMaster.TenureMonths : "",
              loan && loan.LoanEMIs && loan.LoanEMIs[0] ? loan.LoanEMIs[0].MonthlyInstallment : "",
              loan && loan.LoanMaster ? new Date(loan.LoanMaster.IssueDate).toLocaleDateString() : "",
            ]);
          }
        });
      } else if (loan && loan.LoanMaster) {
        rows.push([
          `"${employeeName}"`,
          employeeId,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          loan.LoanMaster.LoanID,
          loan.LoanMaster.LoanAdvanceAmount,
          loan.LoanMaster.BalanceAmount,
          loan.LoanMaster.TenureMonths,
          loan.LoanEMIs && loan.LoanEMIs[0] ? loan.LoanEMIs[0].MonthlyInstallment : "",
          new Date(loan.LoanMaster.IssueDate).toLocaleDateString(),
        ]);
      }
    });
    downloadCSV(rows.map((r) => r.join(",")).join("\n"));

    // Move these generated employees from selectedEmployees to generatedEmployees
    const newlyGenerated = selectedEmployees.map((emp) => {
      const empId =
        (emp.FacilityMember && emp.FacilityMember.FacilityMemberId) ||
        (emp.EmployeeList && emp.EmployeeList.Id);
      const empName =
        (emp.EmployeeList && emp.EmployeeList.EmployeeName) ||
        (emp.FacilityMember && emp.FacilityMember.Name) ||
        "";

      return { employeeName: empName, employeeId: empId };
    });
    setGeneratedEmployees((prev) => [...prev, ...newlyGenerated]);

    // Remove generated employees from selectedEmployees
    const generatedIds = newlyGenerated.map((e) => e.employeeId);
    setSelectedEmployees((prev) =>
      prev.filter((emp) => {
        const empId =
          (emp.FacilityMember && emp.FacilityMember.FacilityMemberId) ||
          (emp.EmployeeList && emp.EmployeeList.Id);
        return !generatedIds.includes(empId);
      })
    );

    // Clear regenerateEmployees as new generation occurred
    setRegenerateEmployees([]);
  };

  // Regenerate CSV for employees in 4th table
  const handleRegenerate = async () => {
    if (regenerateEmployees.length === 0) {
      alert("Please select at least one employee to regenerate.");
      return;
    }
    const results = [];
    for (const emp of regenerateEmployees) {
      try {
        const empId = emp.employeeId;
        const empName = emp.employeeName;

        let salaryInfo = [];
        try {
          const sres = await getSalaryAllowancesByFacilityMember(empId);
          salaryInfo = Array.isArray(sres.SalaryGroups) ? sres.SalaryGroups : [];
        } catch {}
        let loan = null;
        try {
          loan = await getEmployeeLoan(empId);
        } catch {}
        results.push({ employeeName: empName, employeeId: empId, salaryInfo, loan });
      } catch {}
    }

    const header = [
      "Employee Name",
      "Employee ID",
      "Salary Group",
      "Base Salary",
      "Fixed Salary",
      "Tax Amount",
      "Allowance/Deduction Type",
      "Allowance/Deduction Name",
      "Calculated Amount",
      "Loan ID",
      "Loan Amount",
      "Loan Balance",
      "Tenure (Months)",
      "Loan EMI",
      "Loan Issue Date",
    ];
    let rows = [header];
    results.forEach(({ employeeName, employeeId, salaryInfo, loan }) => {
      if (salaryInfo.length === 0 && (!loan || !loan.LoanMaster)) {
        rows.push([`"${employeeName}"`, employeeId, "No Data", "", "", "", "", "", "", "", "", "", "", "", ""]);
        return;
      }
      if (salaryInfo.length > 0) {
        salaryInfo.forEach((group) => {
          if (Array.isArray(group.AllowancesDeductions) && group.AllowancesDeductions.length) {
            group.AllowancesDeductions.forEach((ad) => {
              rows.push([
                `"${employeeName}"`,
                employeeId,
                group.SalaryGroup,
                group.BaseSalary,
                group.FixedSalary,
                group.TaxAmount,
                ad.Type,
                ad.Name,
                ad.CalculatedAmount,
                loan && loan.LoanMaster ? loan.LoanMaster.LoanID : "",
                loan && loan.LoanMaster ? loan.LoanMaster.LoanAdvanceAmount : "",
                loan && loan.LoanMaster ? loan.LoanMaster.BalanceAmount : "",
                loan && loan.LoanMaster ? loan.LoanMaster.TenureMonths : "",
                loan && loan.LoanEMIs && loan.LoanEMIs[0] ? loan.LoanEMIs[0].MonthlyInstallment : "",
                loan && loan.LoanMaster ? new Date(loan.LoanMaster.IssueDate).toLocaleDateString() : "",
              ]);
            });
          } else {
            rows.push([
              `"${employeeName}"`,
              employeeId,
              group.SalaryGroup,
              group.BaseSalary,
              group.FixedSalary,
              group.TaxAmount,
              "",
              "",
              "",
              loan && loan.LoanMaster ? loan.LoanMaster.LoanID : "",
              loan && loan.LoanMaster ? loan.LoanMaster.LoanAdvanceAmount : "",
              loan && loan.LoanMaster ? loan.LoanMaster.BalanceAmount : "",
              loan && loan.LoanMaster ? loan.LoanMaster.TenureMonths : "",
              loan && loan.LoanEMIs && loan.LoanEMIs[0] ? loan.LoanEMIs[0].MonthlyInstallment : "",
              loan && loan.LoanMaster ? new Date(loan.LoanMaster.IssueDate).toLocaleDateString() : "",
            ]);
          }
        });
      } else if (loan && loan.LoanMaster) {
        rows.push([
          `"${employeeName}"`,
          employeeId,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          loan.LoanMaster.LoanID,
          loan.LoanMaster.LoanAdvanceAmount,
          loan.LoanMaster.BalanceAmount,
          loan.LoanMaster.TenureMonths,
          loan.LoanEMIs && loan.LoanEMIs[0] ? loan.LoanEMIs[0].MonthlyInstallment : "",
          new Date(loan.LoanMaster.IssueDate).toLocaleDateString(),
        ]);
      }
    });
    downloadCSV(rows.map((r) => r.join(",")).join("\n"));

    // Clear regenerate employees after regeneration
    setRegenerateEmployees([]);
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
          Generate Salary
        </h2>
        <div className="d-flex align-items-center" style={{ marginBottom: "30px", gap: "20px" }}>
          <div>
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
            <label htmlFor="all" style={{ margin: "0 15px 0 5px", fontWeight: 500 }}>
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
          </div>
          <div>
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
          </div>
          <div className="d-flex align-items-center">
            <label style={{ marginRight: "10px", fontWeight: 500 }}>Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="form-select"
              style={{ width: 200, fontWeight: 500 }}
            >
              <option value="">-- Select Month --</option>
              {months.map((m, i) => (
                <option key={i} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="d-flex flex-column align-items-center" style={{ gap: "60px" }}>
          {/* 1st and 2nd row */}
          <div className="d-flex justify-content-center align-items-center" style={{ gap: 60 }}>
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
              <div style={{ height: tableBodyHeight, overflowY: "auto", padding: "0 8px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td style={{ textAlign: "center", padding: 7, color: "#718096" }}>
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
                            (e.FacilityMember && e.FacilityMember.FacilityMemberId) ||
                            null;
                          const empId =
                            (emp.EmployeeList && emp.EmployeeList.Id) ||
                            (emp.FacilityMember && emp.FacilityMember.FacilityMemberId) ||
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
            <div style={{ fontSize: "2.1rem", fontWeight: "bold", color: "#4b6cb7" }}>→</div>
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
                        <td style={{ textAlign: "center", padding: 7, color: "#718096" }}>
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
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#4b6cb7", textAlign: "center" }}>↓</div>
          {/* 3rd and 4th row */}
          <div className="d-flex justify-content-center align-items-center" style={{ gap: 60 }}>
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
                        <td style={{ textAlign: "center", padding: 7, color: "#718096" }}>
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
                          <td>{emp.employeeName || "Unknown"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 7, fontWeight: 500, color: "#0c7bb3" }}>Generated Salaries</div>
            </div>
            <div style={{ fontSize: "2.1rem", fontWeight: "bold", color: "#4b6cb7" }}>→</div>
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
                        <td style={{ textAlign: "center", padding: 7, color: "#718096" }}>
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
    </div>
  );
}
