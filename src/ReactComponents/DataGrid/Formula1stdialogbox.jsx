// File: src/ReactComponents/DataGrid/Formula1stdialogbox.jsx
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

/**
 * Enhanced Formula Builder with support for editing existing formulas
 * 
 * Props:
 * - visible: Boolean - show/hide dialog
 * - onClose: fn() - close dialog
 * - title: string - heading (the allowance/deduction name you clicked)
 * - baseSalary: number - the Base salary value
 * - items: array - list of available items
 * - currentFormula: string - EXISTING formula to edit (e.g., "(Base + HRA) * 0.12")
 * - currentCalculatedAmount: number - current calculated value
 * - onApply: fn(result) - called when user clicks Apply
 */

export default function Formula1stDialogBox({
  visible,
  onClose,
  title,
  baseSalary,
  items,
  currentFormula,
  currentCalculatedAmount,
  onApply,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [operator, setOperator] = useState("*");
  const [value, setValue] = useState("");
  const [previewFormula, setPreviewFormula] = useState("");
  const [previewResult, setPreviewResult] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);

  // Parse existing formula when dialog opens
  useEffect(() => {
    if (visible && currentFormula) {
      parseExistingFormula(currentFormula);
      setIsEditMode(true);
    } else if (visible && !currentFormula) {
      setSelectedIds([]);
      setOperator("*");
      setValue("");
      setPreviewFormula("");
      setPreviewResult(0);
      setIsEditMode(false);
    }
  }, [visible, currentFormula]);

  useEffect(() => {
    if (!visible) {
      setSelectedIds([]);
      setOperator("*");
      setValue("");
      setPreviewFormula("");
      setPreviewResult(0);
      setIsEditMode(false);
    }
  }, [visible]);

  useEffect(() => {
    computePreview();
  }, [selectedIds, operator, value, baseSalary, items]);

  /**
   * Parse existing formula to pre-populate the UI
   * Examples:
   * - "(Base + HRA) * 0.12" → Base + HRA, *, 12%
   * - "(Base) * 0.12" → Base, *, 12%
   */
  const parseExistingFormula = (formula) => {
    try {
      const trimmed = formula.trim();
      
      // Detect operator (last one outside parentheses)
      let detectedOperator = "*";
      let operatorIndex = -1;
      let parenDepth = 0;
      
      for (let i = 0; i < trimmed.length; i++) {
        if (trimmed[i] === '(') parenDepth++;
        else if (trimmed[i] === ')') parenDepth--;
        else if (parenDepth === 0 && ['+', '-', '*', '/'].includes(trimmed[i])) {
          detectedOperator = trimmed[i];
          operatorIndex = i;
        }
      }
      
      setOperator(detectedOperator);
      
      // Extract left and right sides
      let leftSide = trimmed.substring(0, operatorIndex).trim();
      let rightSide = trimmed.substring(operatorIndex + 1).trim();
      
      // Remove outer parentheses
      if (leftSide.startsWith('(') && leftSide.endsWith(')')) {
        leftSide = leftSide.substring(1, leftSide.length - 1).trim();
      }
      
      // Parse term names (split by +)
      const termNames = leftSide.split('+').map(t => t.trim());
      
      // Find matching items
      const matchedIds = [];
      termNames.forEach(termName => {
        const foundItem = items.find(item => 
          item.Name.toLowerCase() === termName.toLowerCase()
        );
        if (foundItem) matchedIds.push(foundItem.ID);
      });
      
      setSelectedIds(matchedIds);
      
      // Parse value
      const numericValue = parseFloat(rightSide);
      if (!isNaN(numericValue)) {
        if (detectedOperator === '*') {
          setValue((numericValue * 100).toString());
        } else {
          setValue(numericValue.toString());
        }
      }
      
    } catch (error) {
      console.error('Failed to parse formula:', error);
    }
  };

  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const getTermValue = (itm) => {
    if (itm.Name && itm.Name.toLowerCase().includes("base")) {
      return Number(baseSalary || 0);
    }
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

    const names = chosen.map((c) => c.Name);
    const termValues = chosen.map((c) => getTermValue(c));
    const lhsExpression = names.join(" + ");
    const lhsValue = termValues.reduce((s, v) => s + Number(v || 0), 0);

    let num = Number(value || 0);
    let formulaStr = "";
    let result = 0;

    if (operator === "*") {
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
    }

    setPreviewFormula(formulaStr);
    setPreviewResult(Number((result || 0).toFixed(2)));
  };

  const handleApply = () => {
    if (selectedIds.length === 0) {
      alert("Select at least one term to build formula.");
      return;
    }

    const chosen = items.filter((it) => selectedIds.includes(it.ID));
    const names = chosen.map((c) => c.Name);
    const termValues = chosen.map((c) => getTermValue(c));
    const lhsExpression = names.join(" + ");
    const lhsValue = termValues.reduce((s, v) => s + Number(v || 0), 0);
    const num = Number(value || 0);

    let finalFormulaString = "";
    let finalCalculatedAmount = 0;

    if (operator === "*") {
      const decimal = num / 100;
      finalFormulaString = `(${lhsExpression}) * ${decimal.toFixed(2)}`;
      finalCalculatedAmount = Number((lhsValue * decimal).toFixed(2));
    } else if (operator === "/") {
      finalFormulaString = `(${lhsExpression}) / ${num || 1}`;
      finalCalculatedAmount = num === 0 ? 0 : Number((lhsValue / num).toFixed(2));
    } else if (operator === "+") {
      finalFormulaString = `(${lhsExpression}) + ${num}`;
      finalCalculatedAmount = Number((lhsValue + num).toFixed(2));
    } else if (operator === "-") {
      finalFormulaString = `(${lhsExpression}) - ${num}`;
      finalCalculatedAmount = Number((lhsValue - num).toFixed(2));
    }

    onApply && onApply({
      formulaString: finalFormulaString,
      calculatedAmount: finalCalculatedAmount,
      fixedAmount: 0,
      usedValue: value,
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
      <div className="modal-dialog modal-lg" style={{ maxWidth: 760, marginTop: 60 }}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {title || "Formula Builder"}
              {isEditMode && (
                <span style={{ fontSize: 14, color: "#666", marginLeft: 10 }}>
                  (Editing)
                </span>
              )}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          
          <div className="modal-body">
            {/* Current Formula Display */}
            {isEditMode && currentFormula && (
              <div style={{
                background: "#e3f2fd",
                border: "1px solid #90caf9",
                borderRadius: 6,
                padding: 12,
                marginBottom: 15,
              }}>
                <div style={{ fontSize: 12, color: "#1565c0", fontWeight: 600 }}>
                  CURRENT FORMULA:
                </div>
                <div style={{ fontSize: 15, color: "#0d47a1", fontWeight: 500, marginTop: 4 }}>
                  {currentFormula}
                </div>
                <div style={{ fontSize: 13, color: "#1976d2", marginTop: 4 }}>
                  Result: ₹ {Number(currentCalculatedAmount || 0).toFixed(2)}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 10, color: "#333" }}>
              <strong>Available terms:</strong>
            </div>

            <div style={{
              maxHeight: 260,
              overflowY: "auto",
              border: "1px solid #eee",
              borderRadius: 6,
              padding: 8,
            }}>
              <table className="table table-sm mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 30 }} />
                    <th>Name</th>
                    <th style={{ width: 120, textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
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
                  ))}
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
                  placeholder={operator === "*" ? "percent (e.g. 12)" : "number"}
                />
                <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                  {operator === "*"
                    ? "Enter percentage (e.g. 12 = 12%)"
                    : "Value as raw number"}
                </div>
              </div>

              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <label className="form-label mb-1">
                  {isEditMode ? "New Result" : "Result"}
                </label>
                <div style={{
                  background: "#f6f7f8",
                  borderRadius: 6,
                  padding: "8px 12px",
                  minWidth: 160,
                }}>
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
            <div style={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
              marginBottom: "8px",
            }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleApply}>
                {isEditMode ? "Update" : "Apply"}
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
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
                  cursor: "pointer",
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
  currentFormula: PropTypes.string,
  currentCalculatedAmount: PropTypes.number,
  onApply: PropTypes.func,
};