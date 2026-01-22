import React, { useState, useEffect } from "react";
import {
  getEmployeeLoan,
  createEmployeeLoan,
} from "../../Services/PayrollService";

const LoanAdvanceDialog = ({ show, onClose, facilityMemberId }) => {
  const [loanAmount, setLoanAmount] = useState("");
  const [tenureMonths, setTenureMonths] = useState("");
  const [repaymentStartDate, setRepaymentStartDate] = useState("");
  const [empId, setEmpId] = useState(facilityMemberId);
  const [loading, setLoading] = useState(false);
  const [loanMaster, setLoanMaster] = useState(null);
  const [loanEMIs, setLoanEMIs] = useState([]);

  useEffect(() => {
    if (show && facilityMemberId) {
      fetchLoanData(facilityMemberId);
    }
  }, [show, facilityMemberId]);

  async function fetchLoanData(employeeId) {
    setLoading(true);
    try {
      const result = await getEmployeeLoan(employeeId);
      setEmpId(
        result && result.LoanMaster && result.LoanMaster.EmployeeID
          ? result.LoanMaster.EmployeeID
          : employeeId
      );
      setLoanMaster(result.LoanMaster || null);
      setLoanEMIs(result.LoanEMIs || []);
    } catch {
      setLoanMaster(null);
      setLoanEMIs([]);
    }
    setLoading(false);
  }

  const hasActiveLoan = () => {
    return loanEMIs.some((emi) => emi.BalanceAmount > 0);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!facilityMemberId) return;

    if (hasActiveLoan()) {
      alert(
        "User has an active unpaid loan. Cannot create new loan until previous is repaid."
      );
      return;
    }
    const loanAmt = parseFloat(loanAmount);
    const tenure = parseInt(tenureMonths, 10);
    if (
      isNaN(loanAmt) ||
      isNaN(tenure) ||
      !repaymentStartDate ||
      tenure < 1 ||
      tenure > 12
    ) {
      alert("Please enter valid loan amount, tenure (1-12), and start date.");
      return;
    }
    const monthlyInstallment = loanAmt / tenure;

    const LoanEMIs = [];
    for (let i = 0; i < tenure; i++) {
      let emiDate;
      if (i === 0) {
        // First EMI date = selected repaymentStartDate
        emiDate = new Date(repaymentStartDate);
      } else {
        // Next EMIs always 1st of each next month after start
        emiDate = new Date(repaymentStartDate);
        emiDate.setMonth(emiDate.getMonth() + i);
        emiDate.setDate(1);
      }
      const bal = loanAmt - monthlyInstallment * (i + 1);
      LoanEMIs.push({
        RowID: i + 1,
        LoanID: 0,
        EmployeeID: facilityMemberId,
        MonthlyInstallment: monthlyInstallment,
        RepaymentDoneDate: emiDate.toISOString(),
        BalanceAmount: bal > 0 ? bal : 0,
      });
    }

    const postData = {
      LoanMaster: {
        LoanID: 0,
        EmployeeID: facilityMemberId,
        LoanAdvanceAmount: loanAmt,
        CurrentMonth: new Date().toLocaleString("default", { month: "long" }),
        TenureMonths: tenure,
        IssueDate: new Date().toISOString(),
        RepaymentStartDate: new Date(repaymentStartDate).toISOString(),
      },
      LoanEMIs,
    };

    setLoading(true);
    try {
      await createEmployeeLoan(postData);
      fetchLoanData(facilityMemberId);
      setLoanAmount("");
      setTenureMonths("");
      setRepaymentStartDate("");
    } catch (err) {
      alert("Failed to create loan. Check console for errors.");
      console.error(err);
    }
    setLoading(false);
  };

  if (!show) return null;
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) onClose();
  };

  const handleTenureChange = (e) => {
    const value = e.target.value.replace(/\D/, "");
    if (!value) {
      setTenureMonths("");
    } else if (parseInt(value) > 12) {
      setTenureMonths("12");
    } else if (parseInt(value) < 1) {
      setTenureMonths("1");
    } else {
      setTenureMonths(value);
    }
  };

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = (today.getMonth() + 1).toString().padStart(2, "0");
    const dd = today.getDate().toString().padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal-dialog"
        tabIndex={0}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h4>Loan Advances</h4>
          <button
            className="close-btn"
            onClick={onClose}
            tabIndex={0}
            aria-label="Close dialog"
            style={{ transition: "background 0.2s" }}
            onMouseDown={(e) => (e.currentTarget.style.background = "#ddd")}
            onMouseUp={(e) => (e.currentTarget.style.background = "#efefef")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#efefef")}
          >
            ×
          </button>
        </div>
        <form className="modal-body" onSubmit={handleSave}>
          <label>
            Employee ID:
            <input
              type="text"
              value={empId || ""}
              disabled
              style={{ background: "#f7f7f7", color: "#555" }}
            />
          </label>
          <label>
            Loan Amount:
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              required
            />
          </label>
          <label>
            Tenure Months:
            <input
              type="number"
              min="1"
              max="12"
              value={tenureMonths}
              onChange={handleTenureChange}
              required
            />
          </label>
          <label>
            Repayment Start Date:
            <input
              type="date"
              value={repaymentStartDate}
              onChange={(e) => setRepaymentStartDate(e.target.value)}
              min={getTodayDateString()} // Restricts to today or future dates
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading} // Only disable if loading
            style={{ marginBottom: "14px" }}
          >
            Save
          </button>
          <hr />
        </form>
        <strong
          style={{ fontWeight: "bold", marginBottom: "12px", display: "block" }}
        >
          Saved Loan Advances:
        </strong>
        <h5 style={{ marginBottom: "13px", marginTop: "10px" }}>Loan Info</h5>
        {loanMaster ? (
          <table className="loan-table">
            <thead>
              <tr>
                <th>Loan Amount</th>
                <th>Current Month</th>
                <th>Tenure Months</th>
                <th>Issue Date</th>
                <th>Repayment Start Date</th>
                <th>Monthly Installment</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{loanMaster.LoanAdvanceAmount}</td>
                <td>{loanMaster.CurrentMonth}</td>
                <td>{loanMaster.TenureMonths}</td>
                <td>{new Date(loanMaster.IssueDate).toLocaleDateString()}</td>
                <td>
                  {new Date(loanMaster.RepaymentStartDate).toLocaleDateString()}
                </td>
                <td>
                  {loanEMIs.length > 0
                    ? loanEMIs[0].MonthlyInstallment.toFixed(2)
                    : "-"}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p>No Loan Info found.</p>
        )}
        <h5 style={{ marginTop: "28px", marginBottom: "10px" }}>
          Loan EMI Info
        </h5>
        {loanEMIs.length > 0 ? (
          <table className="loan-table">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Repayment Done Date</th>
                <th>EMI</th>
                <th>Balance Amount</th>
              </tr>
            </thead>
            <tbody>
              {loanEMIs.map((emi, idx) => (
                <tr key={emi.RowID}>
                  <td>{idx + 1}</td>
                  <td>
                    {new Date(emi.RepaymentDoneDate).toLocaleDateString()}
                  </td>
                  <td>{emi.MonthlyInstallment.toFixed(2)}</td>
                  <td>{emi.BalanceAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No Loan EMI Info found.</p>
        )}
        <div className="modal-footer">
          <button
            onClick={onClose}
            className="footer-close-btn"
            tabIndex={0}
            style={{ transition: "background 0.2s" }}
            onMouseDown={(e) => (e.currentTarget.style.background = "#ddd")}
            onMouseUp={(e) => (e.currentTarget.style.background = "#efefef")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#efefef")}
          >
            Close
          </button>
        </div>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex; justify-content: center; align-items: center;
          z-index: 1300; pointer-events: auto;
        }
        .modal-dialog {
          background-color: #ffffff;
          border-radius: 12px;
          width: 750px;
          max-width: 95vw;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          padding: 28px 38px 36px;
          font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #1e293b;
          display: flex;
          flex-direction: column;
          position: relative;
          outline: none;
          pointer-events: auto;
          margin: auto;
        }
        .modal-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
          border-bottom: 1px solid #ececec;
        }
        .close-btn, .footer-close-btn {
          background: #efefef;
          border: none;
          font-size: 27px;
          cursor: pointer;
          padding: 4px 13px;
          border-radius: 4px;
          outline: none;
        }
        .close-btn:hover, .footer-close-btn:hover,
        .close-btn:active, .footer-close-btn:active {
          background: #eeeef7;
          box-shadow: 0 0 3px #2996f5;
        }
        .modal-body label {
          display: block; margin-bottom: 12px; font-weight: 600; color: #222;
        }
        .modal-body input[type='number'], .modal-body input[type='date'], .modal-body select, .modal-body input[type='text'] {
          width: 100%; height: 37px;
          margin-top: 4px; margin-bottom: 10px;
          padding: 7px 9px; font-size: 16px;
          border-radius: 4px; border: 1px solid #ccd2df;
          box-sizing: border-box;
        }
        .modal-body button[type='submit'] {
          padding: 9px 35px;
          background: #007dff;
          color: #fff;
          border: none; border-radius: 4px;
          font-size: 16px; cursor: pointer; margin-top: 6px;
          box-shadow: 0 2px 8px rgba(80,145,255,0.11);
          font-weight: bold;
        }
        .modal-footer {
          padding: 0; text-align: right; margin-top: 10px;
        }
        .loan-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .loan-table th, .loan-table td {
          border: 1px solid #dee4ec;
          padding: 10px 6px;
          text-align: center;
          font-size: 15px;
        }
        .loan-table th {
          background-color: #f5f6fa;
        }
        .loan-table tr:nth-child(even) td {
          background-color: #fcfcfc;
        }
      `}</style>
    </div>
  );
};

export default LoanAdvanceDialog;
