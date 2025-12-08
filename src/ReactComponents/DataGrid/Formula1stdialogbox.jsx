// File: src/ReactComponents/DataGrid/Formula1stdialogbox.jsx
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

/**
 * Props:
 * - visible: Boolean - show/hide dialog
 * - onClose: fn() - close dialog
 * - title: string - heading (the allowance/deduction name you clicked)
 * - baseSalary: number - the Base salary value (used when "Base" is selected)
 * - items: array - list of available items (objects). Each item must include:
 *     { ID, Name, Type, FixedAmount, CalculatedAmount, Mode }
 *   Only items that have a value (FixedAmount > 0 OR CalculatedAmount > 0 OR Name === "Base")
 *   will be shown by the parent when calling the dialog.
 * - onApply: fn(result) - called when user clicks Apply.
 *     result = { formulaString, calculatedAmount, fixedAmount (if applicable) }
 *
 * Behavior decisions:
 * - For operator '*' the component treats the user-entered value as a percentage number
 *   (e.g. user enters 12 -> multiplier used is 0.12). This matches your earlier UI pattern.
 * - For + - / the value is treated as a raw numeric value.
 * - The component builds formula like: (Base + PT + Leave) * 0.12
 *   and computes the numeric result using Base/fixed/calculated values from items.
 */

export default function Formula1stDialogBox({
  visible,
  onClose,
  title,
  baseSalary,
  items,
  onApply,
}) {
  const [selectedIds, setSelectedIds] = useState([]); // selected checkbox IDs
  const [operator, setOperator] = useState("*");
  const [value, setValue] = useState(""); // user number input
  const [previewFormula, setPreviewFormula] = useState("");
  const [previewResult, setPreviewResult] = useState(0);

  useEffect(() => {
    if (!visible) {
      // reset when dialog closed
      setSelectedIds([]);
      setOperator("*");
      setValue("");
      setPreviewFormula("");
      setPreviewResult(0);
    }
  }, [visible]);

  useEffect(() => {
    computePreview();
  }, [selectedIds, operator, value, baseSalary, items]);

  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const getTermValue = (itm) => {
    // Priority: if name is "Base" use baseSalary param
    if (itm.Name && itm.Name.toLowerCase().includes("base")) {
      return Number(baseSalary || 0);
    }
    // If item mode '#' use FixedAmount else use CalculatedAmount
    if (itm.Mode === "#") return Number(itm.FixedAmount || 0);
    return Number(itm.CalculatedAmount || 0);
  };

  const computePreview = () => {
    const chosen = items.filter((it) => selectedIds.includes(it.ID));
    if (chosen.length === 0) {
      setPreviewFormula("");
      setPreviewResult(0);
      return;
    }

    // Build LHS expression text and sum numeric value
    const names = chosen.map((c) => c.Name);
    const termValues = chosen.map((c) => getTermValue(c));
    const lhsExpression = names.join(" + ");
    const lhsValue = termValues.reduce((s, v) => s + Number(v || 0), 0);

    // parse numeric input
    let num = Number(value || 0);
    let formulaStr = "";
    let result = 0;

    if (operator === "*") {
      // treat user value as percentage -> convert to decimal
      const decimal = num / 100;
      formulaStr = `(${lhsExpression}) * ${decimal.toFixed(2)}`;
      result = lhsValue * decimal;
    } else if (operator === "/") {
      formulaStr = `(${lhsExpression}) / ${num || 1}`;
      result = num === 0 ? 0 : lhsValue / num;
    } else if (operator === "+") {
      formulaStr = `(${lhsExpression}) + ${num}`;
      result = lhsValue + num;
    } else if (operator === "-") {
      formulaStr = `(${lhsExpression}) - ${num}`;
      result = lhsValue - num;
    } else {
      formulaStr = `(${lhsExpression}) ${operator} ${num}`;
      result = lhsValue;
    }

    setPreviewFormula(formulaStr);
    setPreviewResult(Number((result || 0).toFixed(2)));
  };

  const handleApply = () => {
    if (selectedIds.length === 0) {
      alert(
        "Select at least one term (Base / assigned allowances) to build formula."
      );
      return;
    }

    // Build final formula & calculated amount same as preview
    const chosen = items.filter((it) => selectedIds.includes(it.ID));
    const names = chosen.map((c) => c.Name);
    const termValues = chosen.map((c) => getTermValue(c));
    const lhsExpression = names.join(" + ");
    const lhsValue = termValues.reduce((s, v) => s + Number(v || 0), 0);
    const num = Number(value || 0);

    let finalFormulaString = "";
    let finalCalculatedAmount = 0;
    let finalFixedAmount = 0;

    if (operator === "*") {
      const decimal = num / 100;
      finalFormulaString = `(${lhsExpression}) * ${decimal.toFixed(2)}`;
      finalCalculatedAmount = Number((lhsValue * decimal).toFixed(2));
      finalFixedAmount = 0;
    } else if (operator === "/") {
      finalFormulaString = `(${lhsExpression}) / ${num || 1}`;
      finalCalculatedAmount =
        num === 0 ? 0 : Number((lhsValue / num).toFixed(2));
      finalFixedAmount = 0;
    } else if (operator === "+") {
      finalFormulaString = `(${lhsExpression}) + ${num}`;
      finalCalculatedAmount = Number((lhsValue + num).toFixed(2));
      finalFixedAmount = 0;
    } else if (operator === "-") {
      finalFormulaString = `(${lhsExpression}) - ${num}`;
      finalCalculatedAmount = Number((lhsValue - num).toFixed(2));
      finalFixedAmount = 0;
    }

    // Return object to parent. Parent will decide where to put Formula/Calculated/Fixed.
    onApply &&
      onApply({
        formulaString: finalFormulaString,
        calculatedAmount: finalCalculatedAmount,
        fixedAmount: finalFixedAmount,
        usedValue: value, // 🔥 send raw "10" or "12"
        terms: chosen.map((c) => ({ ID: c.ID, Name: c.Name })),
      });

    onClose && onClose();
  };

  return (
    <div
      className={`modal ${visible ? "show" : ""}`}
      style={{
        display: visible ? "block" : "none",
        background: "rgba(0,0,0,0.35)",
      }}
    >
      <div
        className="modal-dialog modal-lg"
        role="document"
        style={{ maxWidth: 760, marginTop: 60 }}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title || "Formula Builder"}</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            />
          </div>
          <div className="modal-body">
            <div style={{ marginBottom: 10, color: "#333" }}>
              <strong>
                Available terms (only previously assigned items are shown):
              </strong>
            </div>

            <div
              style={{
                maxHeight: 260,
                overflowY: "auto",
                border: "1px solid #eee",
                borderRadius: 6,
                padding: 8,
              }}
            >
              <table className="table table-sm mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 30 }} />
                    <th>Name</th>
                    <th style={{ width: 120, textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    // show only if the term has a numeric value OR is Base
                    // ALWAYS show Base + all checked items
                    return (
                      <tr key={it.ID}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(it.ID)}
                            onChange={() => toggleSelect(it.ID)}
                          />
                        </td>
                        <td>{it.Name}</td>
                        <td style={{ textAlign: "right" }}>
                          {Number(getTermValue(it) || 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="d-flex align-items-center mt-3" style={{ gap: 12 }}>
              <div>
                <label className="form-label mb-1">Operation</label>
                <select
                  className="form-control form-control-sm"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                >
                  <option value="*">× (multiply)</option>
                  <option value="/">÷ (divide)</option>
                  <option value="+">+ (add)</option>
                  <option value="-">- (subtract)</option>
                </select>
              </div>

              <div>
                <label className="form-label mb-1">Value</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={
                    operator === "*" ? "percent (e.g. 12)" : "number"
                  }
                />
                <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                  {operator === "*"
                    ? "For multiply, enter percentage (e.g. 12 => 12% => multiplier 0.12)."
                    : "Value used as raw number."}
                </div>
              </div>

              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <label className="form-label mb-1">Result</label>
                <div
                  style={{
                    background: "#f6f7f8",
                    borderRadius: 6,
                    padding: "8px 12px",
                    minWidth: 160,
                  }}
                >
                  <div style={{ fontSize: 13, color: "#444" }}>
                    {previewFormula || "—"}
                  </div>
                  <div style={{ fontWeight: 700, marginTop: 6 }}>
                    ₹ {Number(previewResult || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ display: "block" }}>
            {/* Row 1: Cancel + Apply */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginBottom: "8px",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleApply}
              >
                Apply
              </button>
            </div>

            {/* Row 2: Centered Custom Formula */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (window.openCustomFormula) window.openCustomFormula();
                }}
                style={{
                  background: "linear-gradient(135deg, #ff9800, #ffb74d)",
                  color: "#fff",
                  fontWeight: "600",
                  padding: "10px 26px",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                  fontSize: "15px",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 12px rgba(0,0,0,0.2)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
                }}
              >
                ⚡ Custom Formula
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Formula1stDialogBox.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  baseSalary: PropTypes.number,
  items: PropTypes.array,
  onApply: PropTypes.func,
};
