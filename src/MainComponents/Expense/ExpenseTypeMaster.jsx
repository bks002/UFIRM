"use client";

import React, { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { FilterMatchMode } from "primereact/api";
import { ExpenseService } from "../../Services/ExpenseTypeMaster.js";
import { useSelector } from "react-redux";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

const ExpenseTypePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [viewVisible, setViewVisible] = useState(false); // ✅ View dialog state
  const [viewRow, setViewRow] = useState(null); // ✅ View row state

  const [visible, setVisible] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [expenseTypeName, setExpenseTypeName] = useState("");
  const [expenseSubTypes, setExpenseSubTypes] = useState([""]);

  const [loading, setLoading] = useState(false);

  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const toast = useRef(null);
  const propertyId = useSelector((state) => state.Commonreducer.puidn);
  const [isApplicable, setIsApplicable] = useState(false);

  // GET data
  const fetchExpenses = async (propertyId) => {
    try {
      setLoading(true);
      const data = await ExpenseService.getExpenseTypes(propertyId);

      const formatted = data.map((item) => ({
        ...item,
        ExpenseSubtypes: item.ExpenseSubtypes || [], // ensure array
      }));

      setExpenses(formatted);
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch data",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSubType = () => {
    setExpenseSubTypes((prev) => [
      ...prev,
      { ExpenseSubtype: "", IncludeEmployee: false },
    ]);
  };

  const updateSubType = (index, value) => {
    const updated = [...expenseSubTypes];
    updated[index] = value;
    setExpenseSubTypes(updated);
  };

  const removeSubType = (index) => {
    setExpenseSubTypes((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    fetchExpenses(propertyId);
  }, [propertyId]);

  // CREATE or UPDATE
  const saveExpense = async () => {
    const payload = {
      ExpenseTypeId: editingRow ? editingRow.ExpenseTypeId : 0,
      ExpenseTypeName: expenseTypeName,
      ExpenseSubtypes: expenseSubTypes.filter((s) => s.ExpenseSubtype?.trim()),
      OfficeId: propertyId,
      IsActive: true,
      CreatedBy: 1,
      UpdatedBy: 1,
    };

    try {
      if (editingRow) {
        await ExpenseService.updateExpenseType(
          editingRow.ExpenseTypeId,
          payload
        );
        toast.current.show({
          severity: "success",
          summary: "Updated",
          detail: "Expense updated successfully",
        });
      } else {
        await ExpenseService.createExpenseType(payload);
        toast.current.show({
          severity: "success",
          summary: "Created",
          detail: "Expense created successfully",
        });
      }
      setVisible(false);
      setEditingRow(null);
      setExpenseTypeName("");
      setExpenseSubTypes([""]);

      fetchExpenses(propertyId);
    } catch {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save data",
      });
    }
  };

  // DELETE
  const deleteExpense = async (row) => {
    try {
      await ExpenseService.deleteExpenseType(row.ExpenseTypeId);
      toast.current.show({
        severity: "warn",
        summary: "Deleted",
        detail: "Expense deleted",
      });
      fetchExpenses(propertyId);
    } catch {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete data",
      });
    }
  };

  // ACTION Buttons
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
        onClick={() => {
          setViewRow(rowData); // ✅ selected row set
          setViewVisible(true); // ✅ open dialog
        }}
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
        onClick={() => {
          setEditingRow(rowData);
          setExpenseTypeName(rowData.ExpenseTypeName);
          setExpenseSubTypes(
            rowData.ExpenseSubtypes?.length
              ? rowData.ExpenseSubtypes.map((s) => ({
                  ExpenseSubtype: s.ExpenseSubtype,
                  IncludeEmployee: s.IncludeEmployee,
                }))
              : [{ ExpenseSubtype: "", IncludeEmployee: false }]
          );

          setVisible(true);
          const anyLinked = rowData.ExpenseSubtypes?.some(
            (s) => s.IncludeEmployee
          );

          setIsApplicable(anyLinked);
        }}
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
        onClick={() => deleteExpense(rowData)}
      />
    </div>
  );

  // Search filter
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  // Header Layout (same as Expenses Master)
  const header = (
    <div className="d-flex justify-content-between align-items-center p-2">
      <h5 className="m-0">Expense Type Master</h5>
      <div className="d-flex gap-2 align-items-center">
        <span className="p-input-icon-left">
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search..."
          />
        </span>
        <Button
          label="Create"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={() => {
            setEditingRow(null);
            setExpenseTypeName("");
            setExpenseSubTypes([
              { ExpenseSubtype: "", IncludeEmployee: false },
            ]);

            setIsApplicable(false);
            setVisible(true);
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <Toast ref={toast} />
            <div className="pr-6 pl-6">
              <DataTable
                value={expenses}
                loading={loading}
                header={header}
                paginator
                rows={10}
                filters={filters}
                filterDisplay="row"
                globalFilterFields={["ExpenseTypeName", "ExpenseSubtype"]}
                emptyMessage="No expenses found."
                dataKey="ExpenseId"
                breakpoint="960px"
              >
                <Column field="ExpenseTypeName" header="Expense Type" />
                <Column
                  header="Expense Sub Type"
                  body={(row) => (
                    <div>
                      {row.ExpenseSubtypes?.map((sub, i) => (
                        <span
                          key={i}
                          style={{
                            display: "inline-block", // 🔥 critical
                            background: "#eef2f7",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontSize: "0.85rem",
                            marginRight: "8px", // 🔥 horizontal space
                            marginBottom: "6px", // 🔥 vertical space
                          }}
                        >
                          {sub.ExpenseSubtype}
                        </span>
                      ))}
                    </div>
                  )}
                />

                <Column header="Actions" body={actionTemplate} />
              </DataTable>
            </div>
          </div>
        </div>
      </section>

      {/* Create/Edit Dialog */}
      <Dialog
        header={editingRow ? "Edit Expense" : "Create Expense"}
        visible={visible}
        style={{ width: "420px" }}
        modal
        className="p-fluid"
        onHide={() => setVisible(false)}
      >
        <div className="flex flex-col gap-4">
          {/* Expense Type */}
          <div>
            <label htmlFor="type" className="block mb-1">
              Expense Type
            </label>
            <InputText
              id="type"
              value={expenseTypeName}
              onChange={(e) => setExpenseTypeName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Expense Sub Types */}
          <div>
            <label className="block mb-1">Expense Sub Type</label>

            {expenseSubTypes.map((subType, index) => (
              <div key={index} className="mb-3">
                {/* Row 1: Input + buttons */}
                <div className="flex align-items-center gap-2">
                  {/* Subtype input */}
                  <InputText
                    value={subType.ExpenseSubtype}
                    onChange={(e) =>
                      updateSubType(index, {
                        ...subType,
                        ExpenseSubtype: e.target.value,
                      })
                    }
                    placeholder={`Sub Type ${index + 1}`}
                    style={{ width: "200px" }} // 👈 shorter width
                  />

                  {/* Remove button */}
                  {expenseSubTypes.length > 1 && (
                    <Button
                      icon="pi pi-times"
                      className="p-button-text p-button-danger p-button-sm"
                      onClick={() => removeSubType(index)}
                      tooltip="Remove"
                    />
                  )}

                  {/* Add button (only on last row) */}
                  {index === expenseSubTypes.length - 1 && (
                    <Button
                      icon="pi pi-plus"
                      className="p-button-text p-button-success p-button-sm"
                      onClick={addSubType}
                      tooltip="Add Sub Type"
                    />
                  )}
                </div>

                {/* Row 2: Employee linking */}
                <div className="flex align-items-center mt-1">
                  <input
                    type="checkbox"
                    checked={subType.IncludeEmployee}
                    onChange={(e) =>
                      updateSubType(index, {
                        ...subType,
                        IncludeEmployee: e.target.checked,
                      })
                    }
                    style={{ marginRight: "8px" }} // 👈 spacing
                  />
                  <small>Employee Linking</small>
                </div>
              </div>
            ))}
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <Button label="Save" icon="pi pi-check" onClick={saveExpense} />
          </div>
        </div>
      </Dialog>

      {/* ✅ View Dialog */}
      <Dialog
        header="View Expense"
        visible={viewVisible}
        style={{ width: "420px" }}
        modal
        className="p-fluid"
        onHide={() => setViewVisible(false)}
      >
        {viewRow && (
          <div className="flex flex-col gap-4">
            {/* Expense Type */}
            <div>
              <label className="block mb-1">Expense Type</label>
              <InputText
                value={viewRow.ExpenseTypeName}
                className="w-full"
                readOnly
              />
            </div>

            {/* Expense Sub Types */}
            <div>
              <label className="block mb-1">Expense Sub Type</label>

              <div className="flex flex-col gap-3">
                {viewRow.ExpenseSubtypes?.map((sub, i) => (
                  <div
                    key={i}
                    className="flex align-items-center justify-between"
                    style={{
                      background: "#f8fafc",
                      padding: "8px 12px",
                      borderRadius: "8px",
                    }}
                  >
                    {/* Subtype name */}
                    <span style={{ fontSize: "0.9rem" }}>
                      {sub.ExpenseSubtype}
                    </span>

                    {/* Employee linking */}
                    <div className="flex align-items-center">
                      <input
                        type="checkbox"
                        checked={sub.IncludeEmployee}
                        readOnly
                        style={{ marginRight: "8px" }}
                      />
                      <small>Employee Linking</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default ExpenseTypePage;
