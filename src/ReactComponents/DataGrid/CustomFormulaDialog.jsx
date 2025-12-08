// File: CustomFormulaDialog.jsx
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Dialog } from "primereact/dialog";

// Allowed join operators between terms
const JOIN_OPS = ["", "+", "-", "*", "/"];
// Allowed per-term operators (inside row)
const OPS = ["", "+", "-", "*", "/"];

export default function CustomFormulaDialog({
  visible,
  onHide,
  targetItem,
  items = [],
  baseSalary = 0,
  onSave,
}) {
  // Exclude current item
  const available = useMemo(
    () => items.filter((it) => !(targetItem && it.ID === targetItem.ID)),
    [items, targetItem]
  );

  const [rows, setRows] = useState([]);
  const [globalOp, setGlobalOp] = useState("");
  const [globalVal, setGlobalVal] = useState("");

  useEffect(() => {
    if (!visible) return;

    // Initialize rows with joinOp, op, value, checked false
    const r = available.map((it) => ({
      id: it.ID,
      name: it.Name,
      amount: getNumericValue(it),
      checked: false,
      joinOp: "", // joinOp between terms
      op: "", // multiply/add/subtract *inside* this row
      value: "",
    }));

    setRows(r);
    setGlobalOp("");
    setGlobalVal("");
  }, [visible, available]);

  function getNumericValue(it) {
    if (!it) return 0;

    if (it.Name.toLowerCase().includes("base")) {
      return Number(baseSalary || 0);
    }

    if (it.Mode === "#") return Number(it.FixedAmount || 0);
    return Number(it.CalculatedAmount || 0);
  }

  // Handle checkbox toggle
  const toggleRow = (id) =>
    setRows((prev) =>
      prev.map((x) => (x.id === id ? { ...x, checked: !x.checked } : x))
    );

  // Handle joinOp change
  const setJoinOp = (id, joinOp) =>
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, joinOp } : x)));

  // Set per-row operator
  const setOp = (id, op) =>
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, op } : x)));

  // Set per-row value
  const setVal = (id, value) =>
    setRows((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              value: value, // raw for UI
              decimal: value ? Number(value) / 100 : "", // computed decimal
            }
          : x
      )
    );

  // Compute formula & result
  const { formulaString, calculatedResult } = useMemo(() => {
    // Filter checked rows
    const checked = rows.filter((x) => x.checked);

    if (checked.length === 0) {
      return { formulaString: "", calculatedResult: 0 };
    }

    // Build LHS using Option A:
    // Base*10 + HRA - ESI*5
    let parts = [];

    checked.forEach((r, idx) => {
      let term = r.name;

      if (r.op && r.value !== "") {
        const dec = r.decimal ?? Number(r.value) / 100;
        term = `${term}${r.op}${dec}`;
      }

      if (idx === 0) {
        parts.push(term);
      } else {
        const join = r.joinOp || "+";
        parts.push(`${join} ${term}`);
      }
    });

    const lhs = parts.join(" ").trim();

    // Apply global final operator
    let formula = lhs;

    if (globalOp && globalVal !== "") {
      const globalDecimal = globalVal ? Number(globalVal) / 100 : "";
      formula = globalDecimal ? `(${lhs}) ${globalOp} ${globalDecimal}` : lhs;
    }

    // Compute numeric result
    let evalStr = formula;
    available.forEach((it) => {
      const val = getNumericValue(it);
      const escaped = it.Name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      evalStr = evalStr.replace(
        new RegExp(`\\b${escaped}\\b`, "g"),
        String(val)
      );
    });

    evalStr = evalStr.replace(/\s+/g, " ");

    let result = 0;
    try {
      if (/[^0-9+\-*/().\s]/.test(evalStr)) {
        result = 0;
      } else {
        // eslint-disable-next-line no-new-func
        result = new Function(`return ${evalStr}`)();
        if (typeof result !== "number" || isNaN(result)) result = 0;
      }
    } catch {
      result = 0;
    }

    return {
      formulaString: formula,
      calculatedResult: Number(result.toFixed(2)),
    };
  }, [rows, globalOp, globalVal, available, baseSalary]);

  // Save handler
  const handleSave = () => {
    if (!formulaString) {
      alert("Please build a formula first.");
      return;
    }

    onSave(formulaString, calculatedResult);
    onHide();
  };

  return (
    <Dialog
      header={null}
      visible={visible}
      style={{ width: "1050px" }}
      modal
      onHide={onHide}
    >
      <div style={{ padding: "10px 15px" }}>
        {/* HEADER */}
        {/* TOP HEADING */}
        <div style={{ marginBottom: 25 }}>
          <div
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#1f2937",
              marginBottom: "12px",
              borderBottom: "2px solid #e5e7eb",
              paddingBottom: "6px",
              letterSpacing: "0.3px",
            }}
          >
            ⚡ Custom Formula
          </div>

          <div style={{ fontSize: 15, color: "#374151" }}>
            Editing Formula for :
          </div>

          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              background: "linear-gradient(90deg,#eef2ff,#fff7ed)",
              padding: "6px 12px",
              borderRadius: 8,
              color: "#111827",
              display: "inline-block",
              marginTop: 4,
            }}
          >
            {targetItem?.Name}
          </div>

          <div
            style={{
              marginTop: 20,
              fontSize: 15,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            Make Formula :-
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              Build using available terms and operators
            </span>
          </div>
        </div>

        {/* COLUMN HEADERS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "80px 60px 1fr 120px 160px 160px",
            gap: 10,
            padding: "8px 4px",
            borderBottom: "1px solid #e6e6e6",
            fontWeight: 700,
          }}
        >
          <div>Join</div>
          <div></div>
          <div>Name</div>
          <div>Amount</div>
          <div>Operation</div>
          <div>Value</div>
        </div>

        {/* TERMS LIST */}
        <div
          style={{
            maxHeight: 260,
            overflowY: "auto",
            border: "1px solid #efefef",
            borderRadius: 6,
            marginBottom: 15,
            marginTop: 5,
          }}
        >
          {rows.map((r, idx) => {
            const isFirstChecked =
              rows.filter((x) => x.checked)[0]?.id === r.id;

            return (
              <div
                key={r.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 60px 1fr 120px 160px 160px",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px",
                  borderBottom: "1px solid #f5f5f5",
                }}
              >
                {/* joinOp */}
                <select
                  disabled={!r.checked || isFirstChecked}
                  className="form-control form-control-sm"
                  value={r.joinOp}
                  onChange={(e) => setJoinOp(r.id, e.target.value)}
                >
                  {JOIN_OPS.map((op) => (
                    <option key={op} value={op}>
                      {op || "(none)"}
                    </option>
                  ))}
                </select>

                {/* checkbox */}
                <div style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={r.checked}
                    onChange={() => toggleRow(r.id)}
                  />
                </div>

                {/* name */}
                <div style={{ fontWeight: 600 }}>{r.name}</div>

                {/* amount */}
                <div style={{ textAlign: "right", paddingRight: 10 }}>
                  ₹ {Number(r.amount).toFixed(2)}
                </div>

                {/* per-row operation */}
                <select
                  disabled={!r.checked}
                  className="form-control form-control-sm"
                  value={r.op}
                  onChange={(e) => setOp(r.id, e.target.value)}
                >
                  {OPS.map((op) => (
                    <option key={op} value={op}>
                      {op || "(none)"}
                    </option>
                  ))}
                </select>

                {/* per-row value */}
                <input
                  type="number"
                  disabled={!r.checked}
                  className="form-control form-control-sm"
                  value={r.value}
                  onChange={(e) => setVal(r.id, e.target.value)}
                  placeholder="number"
                />
              </div>
            );
          })}
        </div>

        {/* FINAL ROW — moved BELOW terms */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "80px 60px 1fr 120px 160px 160px",
            gap: 10,
            alignItems: "center",
            marginBottom: 20,
            padding: "8px 4px",
          }}
        >
          <div style={{ color: "#6b7280" }}>Final</div>
          <div></div>
          <div style={{ color: "#6b7280" }}>Apply on result of (LHS)</div>

          <div></div>

          <select
            value={globalOp}
            onChange={(e) => setGlobalOp(e.target.value)}
            className="form-control form-control-sm"
          >
            <option value="">(none)</option>
            <option value="+">+ add</option>
            <option value="-">- subtract</option>
            <option value="*">× multiply</option>
            <option value="/">÷ divide</option>
          </select>

          <input
            type="number"
            className="form-control form-control-sm"
            value={globalVal}
            onChange={(e) => setGlobalVal(e.target.value)}
            placeholder="number"
          />
        </div>

        {/* PREVIEW */}
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Formula</div>
            <div
              style={{
                background: "#fafafa",
                border: "1px solid #eee",
                padding: 12,
                borderRadius: 6,
                minHeight: 46,
                fontFamily: "monospace",
              }}
            >
              {formulaString || "—"}
            </div>
          </div>

          <div style={{ width: 220 }}>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Result</div>
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #eee",
                padding: 12,
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 18,
                textAlign: "center",
              }}
            >
              ₹ {calculatedResult.toFixed(2)}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="d-flex justify-content-end"
          style={{ gap: 10, marginTop: 18 }}
        >
          <button className="btn btn-secondary" onClick={onHide}>
            Cancel
          </button>
          <button
            className="btn btn-success"
            onClick={handleSave}
            disabled={!formulaString}
          >
            Save Formula
          </button>
        </div>
      </div>
    </Dialog>
  );
}

CustomFormulaDialog.propTypes = {
  visible: PropTypes.bool,
  onHide: PropTypes.func,
  targetItem: PropTypes.object,
  items: PropTypes.array,
  baseSalary: PropTypes.number,
  onSave: PropTypes.func,
};
