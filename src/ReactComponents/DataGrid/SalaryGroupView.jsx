import React, { useEffect, useState } from "react";
import {
  getSalaryAllowancesByProperty,
  getSalaryAllowancesByFacilityMember,
  deleteSalaryGroupFromFacilityMember,
  assignSalaryGroupToFacilityMember,
} from "../../Services/PayrollService";

export default function SalaryGroupView({
  propertyId,
  facilityMemberId,
  onClose,
}) {
  const [salaryGroups, setSalaryGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedGroupData, setSelectedGroupData] = useState(null);
  const [finalAddedGroups, setFinalAddedGroups] = useState([]);
  const [facilityMemberSalaryData, setFacilityMemberSalaryData] =
    useState(null);

  // Load salary groups by property as before
  useEffect(() => {
    if (propertyId) {
      getSalaryAllowancesByProperty(propertyId)
        .then((data) => {
          setSalaryGroups(data || []);
        })
        .catch((err) => {
          console.error("Failed to load salary groups", err);
        });
    }
  }, [propertyId]);

  // Load salary allowances by facility member when facilityMemberId changes
  useEffect(() => {
    if (facilityMemberId) {
      getSalaryAllowancesByFacilityMember(facilityMemberId)
        .then((data) => {
          setFacilityMemberSalaryData(data || null);
        })
        .catch((err) => {
          console.error("Failed to load facility member salary data", err);
          setFacilityMemberSalaryData(null);
        });
    }
  }, [facilityMemberId]);

  // Set selected group info when selection changes
  useEffect(() => {
    if (selectedGroupId) {
      const group = salaryGroups.find(
        (g) => g.SalaryGroup_ID === selectedGroupId
      );
      setSelectedGroupData(group || null);
    } else {
      setSelectedGroupData(null);
    }
  }, [selectedGroupId, salaryGroups]);

  // Combine existing and newly added salary groups for rendering, removing duplicates
  var existingGroups =
    (facilityMemberSalaryData && facilityMemberSalaryData.SalaryGroups) || [];
  var combinedSalaryGroups = existingGroups
    .concat(finalAddedGroups)
    .filter(function (group, index, self) {
      return (
        index ===
        self.findIndex(function (g) {
          return g.SalaryGroup_ID === group.SalaryGroup_ID;
        })
      );
    });

  const handleAdd = async () => {
    if (selectedGroupData) {
      // Prevent adding duplicate groups
      if (
        finalAddedGroups.some(
          (g) => g.SalaryGroup_ID === selectedGroupData.SalaryGroup_ID
        ) ||
        (facilityMemberSalaryData &&
          facilityMemberSalaryData.SalaryGroups &&
          facilityMemberSalaryData.SalaryGroups.some(
            (g) => g.SalaryGroup_ID === selectedGroupData.SalaryGroup_ID
          ))
      ) {
        alert("This salary group is already assigned.");
        return;
      }

      try {
        const model = {
          FacilityMemberId: facilityMemberId,
          SalaryGroup_ID: selectedGroupData.SalaryGroup_ID,
        };
        // Call POST API to assign salary group
        await assignSalaryGroupToFacilityMember(model);

        // Update UI state on success
        setFinalAddedGroups([...finalAddedGroups, selectedGroupData]);
        // Optionally, update facilityMemberSalaryData if needed or refetch data
      } catch (error) {
        console.error("Failed to assign salary group:", error);
        alert("Failed to add salary group. Please try again.");
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSalaryGroupFromFacilityMember(facilityMemberId, id);

      // Remove from both state arrays if present
      setFinalAddedGroups(
        finalAddedGroups.filter((g) => g.SalaryGroup_ID !== id)
      );
      setFacilityMemberSalaryData((prev) =>
        prev
          ? {
              ...prev,
              SalaryGroups: prev.SalaryGroups.filter(
                (g) => g.SalaryGroup_ID !== id
              ),
            }
          : prev
      );
    } catch (error) {
      console.error("Failed to delete salary group:", error);
      alert("Failed to delete salary group. Please try again.");
    }
  };

  // Helper to render the allowances and deductions table rows
  const renderAllowanceDeductionRows = (allowancesDeductions) => {
    const allowances = allowancesDeductions.filter(
      (a) => a.Type === "Allowance"
    );
    const deductions = allowancesDeductions.filter(
      (d) => d.Type === "Deduction"
    );
    const maxRows = Math.max(allowances.length, deductions.length);

    return Array.from({ length: maxRows }).map((_, i) => (
      <tr key={i} style={i % 2 === 0 ? styles.stripedRow : undefined}>
        <td style={styles.cell}>
          {(allowances[i] && allowances[i].Name) || ""}
        </td>
        <td style={styles.cellCenter}>
          {allowances[i] && allowances[i].Percentage != null
            ? allowances[i].Percentage
            : ""}
        </td>
        <td style={styles.cell}>
          {(deductions[i] && deductions[i].Name) || ""}
        </td>
        <td style={styles.cellCenter}>
          {deductions[i] && deductions[i].Percentage != null
            ? deductions[i].Percentage
            : ""}
        </td>
      </tr>
    ));
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <header style={styles.header}>
          <h3 style={styles.title}>View Salary Group</h3>
          <button
            onClick={onClose}
            style={styles.closeBtn}
            aria-label="Close dialog"
          >
            ×
          </button>
        </header>

        {/* Salary Group Selector */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Salary Group Name
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(Number(e.target.value))}
              style={styles.select}
            >
              <option value="">-- Select Salary Group --</option>
              {salaryGroups.map((group) => (
                <option key={group.SalaryGroup_ID} value={group.SalaryGroup_ID}>
                  {group.SalaryGroup}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Fixed Salary */}
        {selectedGroupData && (
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Fixed Salary
              <input
                type="text"
                readOnly
                value={selectedGroupData.FixedSalary || ""}
                style={styles.input}
              />
            </label>
          </div>
        )}

        {/* Allowance & Deduction Table */}
        {selectedGroupData && (
          <table style={styles.table} cellSpacing={0}>
            <thead>
              <tr>
                <th
                  colSpan={2}
                  style={{ ...styles.tableHeader, ...styles.allowanceHeader }}
                >
                  Allowance
                </th>
                <th
                  colSpan={2}
                  style={{ ...styles.tableHeader, ...styles.deductionHeader }}
                >
                  Deduction
                </th>
              </tr>
              <tr>
                <th style={styles.subHeader}>Name</th>
                <th style={styles.subHeader}>Percentage</th>
                <th style={styles.subHeader}>Name</th>
                <th style={styles.subHeader}>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {renderAllowanceDeductionRows(
                selectedGroupData.AllowancesDeductions
              )}
            </tbody>
          </table>
        )}

        {/* Add Button */}
        <button
          onClick={handleAdd}
          disabled={
            !selectedGroupData ||
            finalAddedGroups.some((g) => g.SalaryGroup_ID === selectedGroupId)
          }
          style={{
            ...styles.button,
            ...(!selectedGroupData ||
            finalAddedGroups.some((g) => g.SalaryGroup_ID === selectedGroupId)
              ? styles.buttonDisabled
              : {}),
          }}
        >
          Add
        </button>

        {/* Combined Salary Groups List */}
        {combinedSalaryGroups.length > 0 && (
          <section style={styles.addedSection}>
            <h4 style={styles.addedTitle}>Added Salary Groups</h4>

            {combinedSalaryGroups.map((group) => (
              <div
                key={group.SalaryGroup_ID}
                style={{ ...styles.finalGroupCard, position: "relative" }}
              >
                <button
                  onClick={() => handleDelete(group.SalaryGroup_ID)}
                  style={styles.deleteBtn}
                  aria-label={`Delete salary group ${group.SalaryGroup}`}
                  title="Delete This Entry"
                  onMouseOver={(e) => (e.currentTarget.style.color = "#ef4444")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#64748b")}
                >
                  🗑️
                </button>
                <div style={styles.groupHeader}>
                  <span style={styles.groupName}>
                    {group.SalaryGroup}{" "}
                    <span style={styles.fixedSalary}>
                      (Fixed Salary: ₹{group.FixedSalary})
                    </span>
                  </span>
                </div>
                <table style={styles.table} cellSpacing={0}>
                  <thead>
                    <tr>
                      <th
                        colSpan={2}
                        style={{
                          ...styles.tableHeader,
                          ...styles.allowanceHeader,
                        }}
                      >
                        Allowance
                      </th>
                      <th
                        colSpan={2}
                        style={{
                          ...styles.tableHeader,
                          ...styles.deductionHeader,
                        }}
                      >
                        Deduction
                      </th>
                    </tr>
                    <tr>
                      <th style={styles.subHeader}>Name</th>
                      <th style={styles.subHeader}>Percentage</th>
                      <th style={styles.subHeader}>Name</th>
                      <th style={styles.subHeader}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderAllowanceDeductionRows(group.AllowancesDeductions)}
                  </tbody>
                </table>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(20, 27, 54, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
    padding: 16,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: 640,
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
    padding: "28px 32px 36px",
    fontFamily: "'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#1e293b",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    margin: 0,
    color: "#0f172a",
  },
  closeBtn: {
    border: "none",
    backgroundColor: "transparent",
    fontSize: 26,
    fontWeight: "600",
    cursor: "pointer",
    color: "#64748b",
    lineHeight: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    display: "block",
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 8,
    color: "#334155",
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    fontSize: 15,
    borderRadius: 6,
    border: "1.5px solid #cbd5e1",
    backgroundColor: "#f8fafc",
    fontWeight: "400",
    color: "#334155",
    outline: "none",
    cursor: "pointer",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    fontSize: 15,
    borderRadius: 6,
    border: "1.5px solid #cbd5e1",
    backgroundColor: "#f1f5f9",
    fontWeight: "400",
    color: "#334155",
    outline: "none",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    marginBottom: 30,
  },
  tableHeader: {
    padding: "12px 14px",
    fontWeight: "700",
    fontSize: 15,
    color: "#1e293b",
    borderBottom: "2px solid #cbd5e1",
    userSelect: "none",
  },
  allowanceHeader: {
    backgroundColor: "#d1fae5",
    borderRight: "1.5px solid #a7f3d0",
    color: "#065f46",
  },
  deductionHeader: {
    backgroundColor: "#fee2e2",
    borderLeft: "1.5px solid #fca5a5",
    color: "#991b1b",
  },
  subHeader: {
    padding: "10px 12px",
    fontWeight: "600",
    fontSize: 14,
    borderBottom: "1.5px solid #e2e8f0",
    color: "#475569",
    textAlign: "center",
  },
  stripedRow: {
    backgroundColor: "#f8fafc",
  },
  cell: {
    padding: "10px 12px",
    fontSize: 14,
    color: "#344054",
  },
  cellCenter: {
    padding: "10px 12px",
    fontSize: 14,
    color: "#344054",
    textAlign: "center",
    fontWeight: "500",
  },
  button: {
    alignSelf: "flex-start",
    padding: "12px 32px",
    backgroundColor: "#2563eb", // Blue 600
    border: "none",
    borderRadius: 8,
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    cursor: "pointer",
    boxShadow: "0 4px 15px rgb(37 99 235 / 0.4)",
    transition: "background-color 0.3s ease",
    userSelect: "none",
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  addedSection: {
    marginTop: 32,
  },
  addedTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 20,
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: 6,
  },
  finalGroupCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    position: "relative",
    boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
  },
  groupHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  groupName: {
    fontWeight: "700",
    fontSize: 18,
    color: "#334155",
  },
  fixedSalary: {
    fontWeight: "500",
    fontSize: 15,
    color: "#64748b",
    marginLeft: 8,
    fontStyle: "normal",
  },
  deleteBtn: {
    position: "absolute",
    top: 18,
    right: 18,
    background: "transparent",
    border: "none",
    fontSize: 23,
    cursor: "pointer",
    color: "#94a3b8",
    padding: 0,
    width: 32,
    height: 32,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
};
