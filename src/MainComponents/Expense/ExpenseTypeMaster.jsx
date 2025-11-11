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
  const [expenseSubType, setExpenseSubType] = useState("");
  const [loading, setLoading] = useState(false);

  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const toast = useRef(null);
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  // GET data
  const fetchExpenses = async (propertyId) => {
    try {
      setLoading(true);
      const data = await ExpenseService.getExpenseTypes(propertyId);

      setExpenses(data);
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

  useEffect(() => {
    fetchExpenses(propertyId);
  }, [propertyId]);

  // CREATE or UPDATE
  const saveExpense = async () => {
    const payload = {
      ExpenseId: editingRow ? editingRow.ExpenseId : 0,
      ExpenseTypeName: expenseTypeName,
      ExpenseSubtype: expenseSubType,
      CreatedBy: 1,
      UpdatedBy: 1,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
      IsActive: true,
      OfficeId: propertyId,
    };

    try {
      if (editingRow) {
        await ExpenseService.updateExpenseType(editingRow.ExpenseId, payload);
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
      setExpenseSubType("");
     
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
      await ExpenseService.deleteExpenseType(row.ExpenseId);
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
        style={{ backgroundColor: "#FFD700", border: "none", color: "#000", marginRight: "4px" }}
        onClick={() => {
          setViewRow(rowData); // ✅ selected row set
          setViewVisible(true); // ✅ open dialog
        }}
      />
      <Button
        icon="fa fa-pencil"
        className="p-button-warning p-button-sm rounded"
         style={{ backgroundColor: "#00CFFF", border: "none", color: "#000", marginRight: "4px" }}
        onClick={() => {
          setEditingRow(rowData);
          setExpenseTypeName(rowData.ExpenseTypeName);
          setExpenseSubType(rowData.ExpenseSubtype);
          setVisible(true);
        }}
      />
      <Button
        icon="fa fa-trash"
        className="p-button-danger p-button-sm rounded"
         style={{ backgroundColor: "#FF4D4D", border: "none", color: "#fff", marginRight: "4px" }}
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
            setExpenseSubType("");
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
                <Column field="ExpenseSubtype" header="Expense Sub Type" />
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
        style={{ width: "400px" }}
        modal
        className="p-fluid"
        onHide={() => setVisible(false)}
      >
        <div className="flex flex-col gap-4">
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

          <div>
            <label htmlFor="subtype" className="block mb-1">
              Expense Sub Type
            </label>
            <InputText
              id="subtype"
              value={expenseSubType}
              onChange={(e) => setExpenseSubType(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex justify-end">
            <Button label="Save" icon="pi pi-check" onClick={saveExpense} />
          </div>
        </div>
      </Dialog>

       {/* ✅ View Dialog */}
      <Dialog
        header="View Expense"
        visible={viewVisible}
        style={{ width: "400px" }}
        modal
        className="p-fluid"
        onHide={() => setViewVisible(false)}
      >
        {viewRow && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block mb-1">Expense Type</label>
              <InputText value={viewRow.ExpenseTypeName} className="w-full" readOnly />
            </div>
            <div>
              <label className="block mb-1">Expense Sub Type</label>
              <InputText value={viewRow.ExpenseSubtype} className="w-full" readOnly />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default ExpenseTypePage;
