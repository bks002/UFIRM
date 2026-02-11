import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { getEmployeesByOffice } from "../../Services/PayrollService";

export default function OTReport() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const officeId = useSelector((state) => state.Commonreducer.puidn);

  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentEmployees = employees.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(employees.length / itemsPerPage);


  const daysInMonth = useMemo(() => {
    if (!selectedMonth) return 0;

    const [year, month] = selectedMonth.split("-");
    return new Date(year, month, 0).getDate();
  }, [selectedMonth]);

  const dateColumns = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  useEffect(() => {
    if (!officeId) return;

    async function loadEmployees() {
      try {
        const data = await getEmployeesByOffice(officeId);
        setEmployees(data || []);
      } catch (err) {
        console.error("Failed to load employees:", err);
        setEmployees([]);
      }
    }

    loadEmployees();
  }, [officeId]);

  return (
    <div
      className="card"
      style={{
        maxWidth: 1600,
        margin: "20px auto",
        borderRadius: 10,
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        padding: "20px 30px",
        background: "#f7fafc",
      }}
    >
      <h3 style={{ fontWeight: "bold", color: "#2a4365" }}>
        OT Report
      </h3>

      {/* Month Selector */}
      <div
        style={{
          marginBottom: 25,
          display: "flex",
          alignItems: "center",
          gap: 15,
        }}
      >
        <label style={{ fontWeight: 500 }}>Select Month:</label>

        <input
          type="month"
          className="form-control"
          style={{ width: 200 }}
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          className="table table-bordered"
          style={{ width: "100%", background: "#fff" }}
        >
          <thead style={{ background: "#edf2f7" }}>
            <tr>
              <th>S.No.</th>
              <th>Employee Code</th>
              <th>Employee Name</th>
              <th>Employee ID</th>
              <th>Designation</th>

              {dateColumns.map((day) => (
                <th key={day}>{day}</th>
              ))}

              <th>Total OT Days</th>
              <th>Total OT Hours</th>
              <th>Resultant OT</th>
            </tr>
          </thead>

          <tbody>
            {!selectedMonth ? (
              <tr>
                <td
                  colSpan={5 + dateColumns.length + 3}
                  style={{ textAlign: "center", color: "#718096" }}
                >
                  Select a month to view OT report
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td
                  colSpan={5 + dateColumns.length + 3}
                  style={{ textAlign: "center", color: "#718096" }}
                >
                  No employees found
                </td>
              </tr>
            ) : (
              currentEmployees.map((emp, index) => {
                const empCode = emp?.Profile?.EmployeeCode || "-";

                const empId =
                  emp?.FacilityMember?.FacilityMemberId || "-";

                const empName =
                  emp?.Profile?.EmployeeName || "Unknown";

                const designation =
                  emp?.EmployeeList?.Designation ||
                  emp?.Profile?.Designation ||
                  "-";

                return (
                  <tr key={empId}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{empCode}</td>
                    <td>{empName}</td>
                    <td>{empId}</td>
                    <td>{designation}</td>

                    {dateColumns.map((day) => (
                      <td key={day}></td>
                    ))}

                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {employees.length > itemsPerPage && (
        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <button
            className="btn btn-sm btn-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Prev
          </button>

          <span style={{ padding: "5px 10px" }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="btn btn-sm btn-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
