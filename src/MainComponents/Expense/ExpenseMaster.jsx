import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ExpenseMasterService } from "../../Services/ExpenseMasterService";
import { useSelector } from "react-redux";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { RadioButton } from "primereact/radiobutton";

const ExpenseMaster = () => {
  const [viewing, setViewing] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [expenseSubtypes, setExpenseSubtypes] = useState([]);

  const propertyId = useSelector((state) => state.Commonreducer.puidn);
  const [employees, setEmployees] = useState([]);
  const [showEmployee, setShowEmployee] = useState(false);
  const [amountType, setAmountType] = useState("");
  // values: "DEBIT" | "CREDIT" | "BOTH"
  const toast = useRef(null);
  const [expenses, setExpenses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    Id: 0,
    ExpenseTypeId: null,
    ExpenseTypeName: "",

    ExpenseSubtype: null,

    Employee: null,
    DateFrom: null,
    DateTo: null,
    DebitAmount: null,
    CreditAmount: null,
    Description: "",
    BillPDFs: [],
    OfficeId: propertyId,
    IsActive: true,
    CreatedBy: 1,
    CreatedOn: new Date().toISOString(),
    UpdatedBy: 1,
    UpdatedOn: new Date().toISOString(),
  });

  const handleView = (row) => {
    const formatForCalendar = (val) =>
      val ? new Date(new Date(val).toDateString()) : null;

    setForm((prev) => ({
      ...prev,
      ...row,
      ExpenseTypeName: row.ExpenseType,
      Employee: row.EmployeeId ?? null, // 👈 THIS IS THE FIX
      DateFrom: formatForCalendar(row.DateFrom),
      DateTo: formatForCalendar(row.DateTo),
    }));

    setViewing(true);
  };

  // Function to format date
  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ✅ Fetch data
  const fetchExpenses = async (propertyId) => {
    try {
      const data = await ExpenseMasterService.getExpensesByOffice(propertyId);

      setExpenses(
        data
          .map((item) => ({
            ...item.Expense,
            Documents: item.Documents ?? [],
            BillPDFs: item.Documents ?? [],
          }))
          .filter((exp) => exp.IsActive)
      );
    } catch (err) {
      console.error("Error loading expenses:", err);
    }
  };

  useEffect(() => {
    if (propertyId) {
      ExpenseMasterService.getEmployeesByOffice(propertyId)
        .then((res) => {
          const employeeDropdown = res
            .filter((e) => e.Profile?.IsActive)
            .map((e) => ({
              label: e.Profile.EmployeeName,
              value: e.FacilityMember.FacilityMemberId, // or any id you want
            }));

          setEmployees(employeeDropdown);
        })
        .catch(console.error);
    }
  }, [propertyId]);

  useEffect(() => {
    if (propertyId) {
      fetchExpenses(propertyId);
    }
  }, [propertyId]);

  // ✅ Fetch expense types
  useEffect(() => {
    if (propertyId) {
      ExpenseMasterService.getExpenseTypesByOffice(propertyId)
        .then((types) =>
          setExpenseTypes(
            types.map((t) => ({
              label: t.ExpenseType,
              value: t.ExpenseTypeId, // 👈 ID stored
            }))
          )
        )
        .catch(console.error);
    }
  }, [propertyId]);

  // ✅ Fetch subtypes whenever ExpenseType changes
  useEffect(() => {
    if (form.ExpenseTypeId) {
      ExpenseMasterService.getExpenseSubtypesByType(form.ExpenseTypeId)
        .then((subtypes) => {
          setExpenseSubtypes(
            subtypes.map((s) => ({
              label: s.ExpenseSubtype,
              value: s.ExpenseSubtype,
              includeEmployee: s.IncludeEmployee,
            }))
          );
        })
        .catch(console.error);
    } else {
      setExpenseSubtypes([]);
    }
  }, [form.ExpenseTypeId]);

  // ✅ Save / Update
  const handleSave = async () => {
    // 🚫 prevent double click / duplicate submit
    if (saving) return;

    if (amountType === "DEBIT" && !form.DebitAmount) {
      toast.current.show({
        severity: "warn",
        summary: "Missing amount",
        detail: "Please enter Debit Amount",
      });
      return;
    }

    if (amountType === "CREDIT" && !form.CreditAmount) {
      toast.current.show({
        severity: "warn",
        summary: "Missing amount",
        detail: "Please enter Credit Amount",
      });
      return;
    }

    // 🚫 validate required dates
    if (!form.DateFrom || !form.DateTo) {
      toast.current.show({
        severity: "warn",
        summary: "Missing dates",
        detail: "Please select Date From and Date To",
        life: 3000,
      });
      return;
    }
    if (!amountType) {
      toast.current.show({
        severity: "warn",
        summary: "Missing Amount Type",
        detail: "Please select Debit, Credit, or Both",
        life: 3000,
      });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();

      // text fields
      formData.append("expense_type", form.ExpenseTypeName);
      formData.append("office_id", propertyId);
      formData.append("created_by", 1);
      if (amountType === "DEBIT" || amountType === "BOTH") {
        if (form.DebitAmount) {
          formData.append("debit_amount", String(form.DebitAmount));
        }
      }

      if (amountType === "CREDIT" || amountType === "BOTH") {
        if (form.CreditAmount) {
          formData.append("credit_amount", String(form.CreditAmount));
        }
      }

      formData.append("description", form.Description || "");
      formData.append("date_from", formatDate(form.DateFrom));
      formData.append("date_to", formatDate(form.DateTo));

      if (form.ExpenseSubtype) {
        formData.append("expense_subtype", form.ExpenseSubtype);
      }

      if (form.Employee) {
        formData.append("employee_id", form.Employee);
      }

      // 📌 FILE HANDLING — EDIT MODE FIX
      const newFiles = form.BillPDFs.filter((f) => f instanceof File);
      const existingUrls = form.BillPDFs.filter((f) => typeof f === "string");

      if (editing) {
        if (newFiles.length > 0) {
          // 🚨 Backend replaces everything if files are sent
          newFiles.forEach((file) => {
            formData.append("files", file);
          });
          // ❌ DO NOT send existing_files here
        } else {
          // No new uploads → preserve remaining old PDFs
          if (existingUrls.length > 0) {
            existingUrls.forEach((url) => {
              formData.append("existing_files", url);
            });
          } else {
            formData.append("existing_files", "[]");
          }
        }
      } else {
        // CREATE MODE
        newFiles.forEach((file) => {
          formData.append("files", file);
        });
      }

      if (editing) {
        await ExpenseMasterService.updateExpense(form.Id, formData);
      } else {
        await ExpenseMasterService.createExpense(formData);
      }

      toast.current.show({
        severity: "success",
        summary: editing ? "Updated" : "Saved",
        detail: `Expense ${editing ? "updated" : "created"} successfully`,
        life: 3000,
      });

      setOpen(false);
      setEditing(false);
      fetchExpenses(propertyId);
      resetForm();
    } catch (err) {
      console.error("Error saving expense:", err);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    const now = new Date().toISOString();
    setForm({
      Id: 0,
      ExpenseTypeId: null,
      ExpenseTypeName: "",
      ExpenseSubtype: null,
      Employee: null,
      DateFrom: null,
      DateTo: null,
      DebitAmount: null,
      CreditAmount: null,
      Description: "",
      BillPDFs: [],
      OfficeId: propertyId,
      IsActive: true,
      CreatedBy: 1,
      CreatedOn: new Date().toISOString(),
      UpdatedBy: 1,
      UpdatedOn: new Date().toISOString(),
    });
    setShowEmployee(false);
    setAmountType("");
  };

  const handleEdit = (row) => {
    const formatForCalendar = (val) =>
      val ? new Date(new Date(val).toDateString()) : null;

    setForm({
      ...row,
      ExpenseTypeId: expenseTypes.find((t) => t.label === row.ExpenseType)
        ?.value,
      ExpenseTypeName: row.ExpenseType,
      Employee: row.EmployeeId ?? null,
      DateFrom: formatForCalendar(row.DateFrom),
      DateTo: formatForCalendar(row.DateTo),
      BillPDFs: row.Documents ?? [],
    });

    // TEMP: until backend sends this field
    if (row.DebitAmount && row.CreditAmount) {
      setAmountType("BOTH");
    } else if (row.DebitAmount) {
      setAmountType("DEBIT");
    } else if (row.CreditAmount) {
      setAmountType("CREDIT");
    }

    // 👇 decide if employee dropdown should be shown
    if (row.EmployeeId) {
      setShowEmployee(true);
    } else {
      setShowEmployee(false);
    }

    setEditing(true);
    setOpen(true);
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this record?")) {
      await ExpenseMasterService.deleteExpense(id);
      setExpenses((prev) => prev.filter((exp) => exp.Id !== id));
    }
  };

  // ✅ Action Buttons in Table
  const actionTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="fa fa-eye"
        className="p-button-info p-button-sm rounded"
        style={{
          backgroundColor: "#FFD700",
          border: "none",
          color: "#000",
          marginRight: "4px",
        }}
        onClick={() => handleView(rowData)}
        tooltip="View"
      />
      <Button
        icon="fa fa-pencil"
        className="p-button-warning p-button-sm rounded"
        style={{
          backgroundColor: "#00CFFF",
          border: "none",
          color: "#000",
          marginRight: "4px",
        }}
        onClick={() => handleEdit(rowData)}
        tooltip="Edit"
      />
      <Button
        icon="fa fa-trash"
        className="p-button-danger p-button-sm rounded"
        style={{
          backgroundColor: "#FF4D4D",
          border: "none",
          color: "#fff",
          marginRight: "4px",
        }}
        onClick={() => handleDelete(rowData.Id)}
        tooltip="Delete"
      />
    </div>
  );

  const header = (
    <div className="d-flex justify-content-between align-items-center p-2">
      <h5>Expense Master</h5>
      <div className="d-flex gap-2 align-items-center">
        <Button
          label="Add Expense"
          icon="pi pi-plus"
          onClick={() => {
            resetForm();
            setEditing(false);
            setOpen(true);
          }}
          className="mb-3"
        />
      </div>
    </div>
  );

  const handleAddPDFs = (files) => {
    setForm((prev) => ({
      ...prev,
      BillPDFs: [...prev.BillPDFs, ...Array.from(files)],
    }));
  };

  const getEmployeeNameById = (id) => {
    if (!id) return "";
    const emp = employees.find((e) => e.value === id);
    return emp ? emp.label : "";
  };
  const handleRemovePDF = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      BillPDFs: prev.BillPDFs.filter((_, i) => i !== indexToRemove),
    }));
  };

  return (
    <>
      <style>{`
  /* Amount label bold */
  .amount-label {
    font-weight: 500;
    min-width: 90px;
  }

  /* Amount row layout */
  .amount-header {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 8px;
  }

  /* Radio group spacing */
  .amount-radios {
    display: flex;
    gap: 16px;
  }

  /* Radio + text close together */
  .amount-radio {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* OVERRIDE PrimeReact label spacing */
  .amount-radio .p-radiobutton-label {
    margin-left: 4px !important;
    font-weight: 400;
  }
`}</style>

      {/* Table */}
      <div className="content-wrapper">
        <section className="content">
          <div className="container-fluid">
            <div className="card">
              <Toast ref={toast} />
              <div className="pr-6 pl-6">
                <DataTable
                  value={expenses}
                  header={header}
                  paginator
                  rows={10}
                  filterDisplay="row"
                  globalFilterFields={["ExpenseType", "ExpenseSubtype"]}
                  emptyMessage="No expenses found."
                  dataKey="Id"
                  breakpoint="960px"
                >
                  <Column field="ExpenseType" header="Expense Type" />
                  <Column field="ExpenseSubtype" header="Expense SubType" />
                  <Column
                    field="DateFrom"
                    header="Date From"
                    body={(row) => formatDate(row.DateFrom)}
                  />
                  <Column
                    field="DateTo"
                    header="Date To"
                    body={(row) => formatDate(row.DateTo)}
                  />
                  <Column
                    header="Debit Amount"
                    body={(row) =>
                      row.DebitAmount ? `₹ ${row.DebitAmount}` : "-"
                    }
                  />

                  <Column
                    header="Credit Amount"
                    body={(row) =>
                      row.CreditAmount ? `₹ ${row.CreditAmount}` : "-"
                    }
                  />

                  <Column field="Description" header="Description" />
                  <Column body={actionTemplate} header="Actions" />
                </DataTable>
              </div>
            </div>
          </div>
        </section>
        {/* Dialog */}
        <Dialog
          header={editing ? "Edit Expense" : "Add Expense"}
          visible={open}
          style={{ width: "40vw" }}
          modal
          onHide={() => setOpen(false)}
        >
          <div className="p-fluid formgrid grid">
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Expense Type</label>
              <Dropdown
                value={form.ExpenseTypeId}
                options={expenseTypes}
                onChange={(e) => {
                  const selected = expenseTypes.find(
                    (t) => t.value === e.value
                  );

                  setForm((prev) => ({
                    ...prev,
                    ExpenseTypeId: e.value,
                    ExpenseTypeName: selected?.label || "",
                    ExpenseSubtype: null, // 👈 use null, NOT ""
                  }));
                }}
                placeholder="Select Expense Type"
                className="w-full"
              />{" "}
            </div>
            <div className="flex flex-col">
              <label>Expense Subtype</label>
              <Dropdown
                value={form.ExpenseSubtype || null}
                options={expenseSubtypes}
                onChange={(e) => {
                  const selected = expenseSubtypes.find(
                    (s) => s.value === e.value
                  );

                  setForm((prev) => ({
                    ...prev,
                    ExpenseSubtype: e.value,
                    Employee: selected?.includeEmployee ? prev.Employee : null,
                  }));

                  setShowEmployee(!!selected?.includeEmployee);
                }}
                placeholder="Select Expense Subtype"
                disabled={!form.ExpenseTypeId}
              />{" "}
            </div>
            {showEmployee && (
              <div className="flex flex-col">
                <label>Employee</label>
                <Dropdown
                  value={form.Employee}
                  options={employees}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, Employee: e.value }))
                  }
                  placeholder="Select Employee"
                  className="w-full"
                  showClear
                />
              </div>
            )}

            <div className="flex flex-col">
              <label>Date From</label>
              <Calendar
                value={form.DateFrom}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, DateFrom: e.value }))
                }
                dateFormat="yy-mm-dd"
                showIcon
              />
            </div>
            <div className="flex flex-col">
              <label>Date To</label>
              <Calendar
                value={form.DateTo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, DateTo: e.value }))
                }
                dateFormat="yy-mm-dd"
                showIcon
              />
            </div>
            {/* Amount */}
            <div className="field col-12">
              {/* Amount + radios closer to input */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  marginBottom: "4px", // 👈 less space above input
                  marginTop: "12px", // 👈 pushes it DOWN
                }}
              >
                {/* Amount text bold */}
                <span
                  style={{
                    fontWeight: 700, // bolder
                    fontSize: "1.07rem", // slightly bigger, not screaming
                  }}
                >
                  Amount
                </span>

                {/* Radios */}
                {["DEBIT", "CREDIT", "BOTH"].map((type) => (
                  <div
                    key={type}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transform: "scale(0.85)", // 👈 makes RADIO smaller
                      transformOrigin: "left center",
                    }}
                  >
                    <RadioButton
                      inputId={`amount-${type}`}
                      name="amountType"
                      value={type}
                      onChange={(e) => {
                        setAmountType(e.value);
                        setForm((prev) => ({
                          ...prev,
                          DebitAmount: null,
                          CreditAmount: null,
                        }));
                      }}
                      checked={amountType === type}
                    />
                    <label
                      htmlFor={`amount-${type}`}
                      style={{
                        fontSize: "0.8rem", // 👈 makes TEXT smaller
                        fontWeight: 500,
                      }}
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>

              {/* Amount input(s) */}
              {amountType === "DEBIT" && (
                <InputNumber
                  value={form.DebitAmount}
                  onValueChange={(e) =>
                    setForm((prev) => ({ ...prev, DebitAmount: e.value }))
                  }
                  mode="currency"
                  currency="INR"
                  locale="en-IN"
                  placeholder="Debit amount"
                  className="w-full"
                />
              )}

              {amountType === "CREDIT" && (
                <InputNumber
                  value={form.CreditAmount}
                  onValueChange={(e) =>
                    setForm((prev) => ({ ...prev, CreditAmount: e.value }))
                  }
                  mode="currency"
                  currency="INR"
                  locale="en-IN"
                  placeholder="Credit amount"
                  className="w-full"
                />
              )}

              {amountType === "BOTH" && (
                <div style={{ display: "flex", gap: "12px" }}>
                  <InputNumber
                    value={form.DebitAmount}
                    onValueChange={(e) =>
                      setForm((prev) => ({ ...prev, DebitAmount: e.value }))
                    }
                    mode="currency"
                    currency="INR"
                    locale="en-IN"
                    placeholder="Debit amount"
                    className="w-full"
                  />

                  <InputNumber
                    value={form.CreditAmount}
                    onValueChange={(e) =>
                      setForm((prev) => ({ ...prev, CreditAmount: e.value }))
                    }
                    mode="currency"
                    currency="INR"
                    locale="en-IN"
                    placeholder="Credit amount"
                    className="w-full"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <label>Description</label>
              <InputTextarea
                rows={3}
                value={form.Description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, Description: e.target.value }))
                }
              />
            </div>
            <div className="field col-12">
              <div className="flex flex-col">
                <label>Upload Bill PDFs</label>

                {/* Hidden input */}
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  id="pdfUpload"
                  style={{ display: "none" }}
                  onChange={(e) => handleAddPDFs(e.target.files)}
                />

                {/* Initial / + button */}
                <Button
                  icon="pi pi-plus"
                  label={
                    !form.BillPDFs || form.BillPDFs.length === 0
                      ? "Add PDF"
                      : "Add More"
                  }
                  className="p-button-outlined p-button-sm w-fit"
                  onClick={() => document.getElementById("pdfUpload").click()}
                />

                {editing && form.BillPDFs?.length > 0 && (
                  <Button
                    label="Remove all PDFs"
                    icon="pi pi-trash"
                    className="p-button-danger p-button-sm w-fit"
                    style={{ marginTop: "6px" }}
                    onClick={() => {
                      if (
                        window.confirm(
                          "This will remove all existing PDFs. Continue?"
                        )
                      ) {
                        setForm((prev) => ({
                          ...prev,
                          BillPDFs: [],
                        }));
                      }
                    }}
                  />
                )}

                {/* PDF names list */}
                {form.BillPDFs?.length > 0 && (
                  <ul style={{ marginTop: "8px", paddingLeft: "16px" }}>
                    {form.BillPDFs.map((file, index) => {
                      const isUrl = typeof file === "string";
                      const fileName = isUrl
                        ? file.split("/").pop()
                        : file.name;

                      return (
                        <li key={index} style={{ fontSize: "0.9rem" }}>
                          <a
                            href={isUrl ? file : URL.createObjectURL(file)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#007bff",
                              textDecoration: "underline",
                            }}
                          >
                            📄 {fileName}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-content-end gap-2 mt-3">
            <Button
              label="Cancel"
              icon="pi pi-times"
              outlined
              onClick={() => setOpen(false)}
            />
            <Button
              label={saving ? "Saving..." : editing ? "Update" : "Save"}
              icon="pi pi-check"
              onClick={handleSave}
              disabled={saving}
            />
          </div>
        </Dialog>
        {/* View Dialog */}
        <Dialog
          header="View Expense"
          visible={viewing}
          style={{ width: "40vw" }}
          modal
          onHide={() => setViewing(false)}
        >
          <div className="p-fluid formgrid grid">
            <div className="flex flex-col">
              <label>Expense Type</label>
              <InputText value={form.ExpenseTypeName} readOnly />
            </div>
            <div className="flex flex-col">
              <label>Expense Subtype</label>
              <InputText value={form.ExpenseSubtype} readOnly />
            </div>
            {form.Employee && (
              <div className="flex flex-col">
                <label>Employee</label>
                <InputText
                  value={getEmployeeNameById(form.Employee)}
                  readOnly
                />
              </div>
            )}
            <div className="flex flex-col">
              <label>Date From</label>
              <InputText value={formatDate(form.DateFrom)} readOnly />
            </div>
            <div className="flex flex-col">
              <label>Date To</label>
              <InputText value={formatDate(form.DateTo)} readOnly />
            </div>
            <div className="flex flex-col">
              <label>Debit Amount</label>
              <InputText
                value={form.DebitAmount ? `₹ ${form.DebitAmount}` : "-"}
                readOnly
              />
            </div>

            <div className="flex flex-col">
              <label>Credit Amount</label>
              <InputText
                value={form.CreditAmount ? `₹ ${form.CreditAmount}` : "-"}
                readOnly
              />
            </div>

            <div className="flex flex-col">
              <label>Description</label>
              <InputTextarea value={form.Description} rows={3} readOnly />
            </div>
            <div className="flex flex-col">
              <label>Bill PDFs</label>

              {form.BillPDFs && form.BillPDFs.length > 0 ? (
                <ul style={{ paddingLeft: "16px", marginTop: "6px" }}>
                  {form.BillPDFs.map((item, index) => {
                    const isUrl = typeof item === "string";
                    const fileName = isUrl ? item.split("/").pop() : item.name;

                    return (
                      <li key={index}>
                        {isUrl ? (
                          <a
                            href={item}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#007bff",
                              textDecoration: "underline",
                            }}
                          >
                            📄 {fileName}
                          </a>
                        ) : (
                          <span>📄 {fileName}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <span>No PDFs uploaded</span>
              )}
            </div>
          </div>
        </Dialog>
      </div>
    </>
  );
};

export default ExpenseMaster;
