import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getEmployeesByOffices } from "../../Services/PayrollService";
import {
  getAllClients,
  getClientByPropertyId,
  getPropertiesByClientId,
} from "../../Services/ClientService";

export default function ESIReport() {
  const reduxPropertyId = useSelector(
    (state) => state.Commonreducer.puidn
  );

  const [selectedMonth, setSelectedMonth] = useState("");
  const [unitList, setUnitList] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  const [propertyList, setPropertyList] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load Clients
  useEffect(() => {
    const loadUnits = async () => {
      try {
        if (Number(reduxPropertyId) > 0) {
          const res = await getClientByPropertyId(reduxPropertyId);
          setUnitList(res ? [res] : []);
          setSelectedUnitId(res?.ClientID || null);
        } else {
          const res = await getAllClients();
          setUnitList(res || []);
        }
      } catch (err) {
        console.log("Failed to load clients", err);
      }
    };

    loadUnits();
  }, [reduxPropertyId]);

  // Load Properties
  useEffect(() => {
    const loadProperties = async () => {
      try {
        if (!selectedUnitId) {
          setPropertyList([]);
          setSelectedPropertyId(null);
          return;
        }

        const res = await getPropertiesByClientId(selectedUnitId);
        setPropertyList(res || []);

        if (reduxPropertyId) {
          setSelectedPropertyId(reduxPropertyId);
        } else {
          setSelectedPropertyId(null);
        }
      } catch (err) {
        console.log("Failed to load properties", err);
      }
    };

    loadProperties();
  }, [selectedUnitId]);

  // Load Employees
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        if (!selectedPropertyId) {
          setEmployees([]);
          return;
        }

        const data = await getEmployeesByOffices([selectedPropertyId]);
        setEmployees(data || []);
      } catch (err) {
        console.error("Employee load failed", err);
        setEmployees([]);
      }
    };

    loadEmployees();
  }, [selectedPropertyId]);

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
        ESI Report
      </h3>

      {/* Client + Unit Selection */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "8px 14px",
          marginBottom: 20,
          background: "#f9fafb",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Client */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontWeight: 600 }}>Select Client :</label>
          <select
            value={selectedUnitId || ""}
            onChange={(e) => {
              const clientId = Number(e.target.value) || null;
              setSelectedUnitId(clientId);
              setSelectedPropertyId(null);

              // Clear old data
              setEmployees([]);
            }}
            style={{ width: 240 }}
          >
            <option value="">-- Select Client --</option>
            {unitList.map((u) => (
              <option key={u.ClientID} value={u.ClientID}>
                {u.ClientName}
              </option>
            ))}
          </select>
        </div>

        {/* Unit */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontWeight: 600 }}>Select Unit :</label>
          <select
            value={selectedPropertyId || ""}
            onChange={(e) => {
              const value = Number(e.target.value) || null;
              setSelectedPropertyId(value);
              setEmployees([]);
            }}
            style={{ width: 240 }}
          >
            <option value="">-- Select Unit --</option>
            {propertyList.map((p) => (
              <option key={p.PropertyId} value={p.PropertyId}>
                {p.PropertyName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Month Selector */}
      <div style={{ marginBottom: 25 }}>
        <label>Select Month:</label>
        <input
          type="month"
          className="form-control"
          style={{ width: 200 }}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

      {loading && <div>Loading ESI data...</div>}

      {/* Table Placeholder */}
      <div style={{ overflowX: "auto" }}>
        <table
          className="table table-bordered"
          style={{ background: "#fff" }}
        >
          <thead style={{ background: "#edf2f7" }}>
            <tr>
              <th>S.No.</th>
              <th>Employee Code</th>
              <th>Employee Name</th>
              <th>Working Days</th>
              <th>Total Gross Earn</th>
              <th>ESI Wage</th>
              <th>0.75 %</th>
              <th>3.25 %</th>
              <th>Emp LWF</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="9" style={{ textAlign: "center" }}>
                Select month and unit to view ESI report
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}