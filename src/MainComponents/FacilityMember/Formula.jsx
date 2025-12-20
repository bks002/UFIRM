import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { FilterMatchMode } from "primereact/api";
import FormulaMasterService from "../../Services/FormulaService";
import { useSelector } from "react-redux";

const FormulaMaster = () => {
  const propertyId = useSelector((state) => state.Commonreducer.puidn);
  const [gridData, setGridData] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const toast = useRef(null);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    Id: 0,
    Name: "",
    Formula: "",
    FixedValue: 0,
    CreatedOn: null,
    UpdatedOn: null,
    IsActive: true,
  });

  const [formulaParts, setFormulaParts] = useState([
    { bracket: "", name: "", op: "", value: "" },
  ]);

  // Fetch all formulas
  const fetchData = async () => {
    try {
      if (!propertyId) return;
      const data = await FormulaMasterService.getAllFormulas(propertyId);
      setGridData(data);
    } catch (err) {
      console.error(err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load formulas",
      });
    }
  };

  useEffect(() => {
    if (propertyId) fetchData();
  }, [propertyId]);

  // Save (Create / Update)
  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        FormulaParts: JSON.stringify(formulaParts),
        PropertyID: propertyId,
      };

      if (editMode) {
        await FormulaMasterService.updateFormula(
          formData.Id,
          payload,
          propertyId
        );
        toast.current.show({
          severity: "success",
          summary: "Updated",
          detail: "Formula updated successfully",
        });
      } else {
        await FormulaMasterService.createFormula(payload, propertyId);
        toast.current.show({
          severity: "success",
          summary: "Created",
          detail: "Formula created successfully",
        });
      }

      setDialogVisible(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Operation failed",
      });
    }
  };

  // Delete
  const handleDelete = async (rowData) => {
    try {
      await FormulaMasterService.deleteFormula(rowData.Id, propertyId);
      toast.current.show({
        severity: "warn",
        summary: "Deleted",
        detail: "Formula deleted successfully",
      });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Delete failed",
      });
    }
  };

  // Open Create Dialog
  const openCreateDialog = () => {
    setFormData({
      Id: 0,
      Name: "",
      Formula: "",
      FixedValue: 0,
      CreatedOn: new Date(),
      UpdatedOn: new Date(),
      IsActive: true,
    });
    setFormulaParts([{ bracket: "", name: "", op: "", value: "" }]);
    setEditMode(false);
    setDialogVisible(true);
  };

  // Open Edit Dialog
  const openEditDialog = (rowData) => {
    let savedParts = [];
    try {
      // Try to get saved FormulaParts
      savedParts = JSON.parse(rowData.FormulaParts || "[]");
    } catch {
      savedParts = [];
    }

    // 🧠 If FormulaParts not found but Formula string exists, parse it roughly
    if ((!savedParts || !savedParts.length) && rowData.Formula) {
      const formula = rowData.Formula.trim();
      const tokens =
        formula.match(/[\(\)\{\}\[\]]|[+\-*/]|[A-Za-z]+|\d+(\.\d+)?/g) || [];
      let tempParts = [];
      let current = { bracket: "", name: "", op: "", value: "" };

      tokens.forEach((token) => {
        if (["(", ")", "{", "}", "[", "]"].includes(token)) {
          if (current.name || current.op || current.value) {
            tempParts.push(current);
            current = { bracket: "", name: "", op: "", value: "" };
          }
          current.bracket = token;
        } else if (/^[A-Za-z]+$/.test(token)) {
          current.name = token;
        } else if (/^[+\-*/]$/.test(token)) {
          current.op = token;
        } else if (/^\d+(\.\d+)?$/.test(token)) {
          current.value = token;
          tempParts.push(current);
          current = { bracket: "", name: "", op: "", value: "" };
        }
      });

      if (current.name || current.op || current.value) tempParts.push(current);
      savedParts = tempParts.length
        ? tempParts
        : [{ bracket: "", name: "", op: "", value: "" }];
    }

    setFormData({
      Id: rowData.Id,
      Name: rowData.Name,
      Formula: rowData.Formula,
      FixedValue: rowData.FixedValue,
      CreatedOn: rowData.CreatedOn ? new Date(rowData.CreatedOn) : new Date(),
      UpdatedOn: rowData.UpdatedOn ? new Date(rowData.UpdatedOn) : new Date(),
      IsActive: rowData.IsActive,
    });

    setFormulaParts(savedParts);
    setEditMode(true);
    setDialogVisible(true);
  };

  // Build Formula
  const buildFormula = () => {
    const formula = formulaParts
      .map((f) => {
        const val = f.value ? parseFloat(f.value) : "";
        let part = "";
        if (f.bracket) part += f.bracket;
        if (f.name) part += f.name;
        if (f.op && f.value) part += `${f.op}${val}`;
        else if (f.op) part += `${f.op}`;
        else if (f.value && !f.name) part += `${val}`;
        return part;
      })
      .join(" ");

    setFormData({ ...formData, Formula: formula });
  };

  // Table Header
  const header = (
    <div className="d-flex justify-content-between align-items-center p-2">
      <h5 className="m-0">Formula Master</h5>
      <div className="d-flex gap-2 align-items-center">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={(e) => {
              const value = e.target.value;
              setGlobalFilterValue(value);
              setFilters({
                ...filters,
                global: { value, matchMode: FilterMatchMode.CONTAINS },
              });
            }}
            placeholder="Search..."
          />
        </span>
        <Button
          label="Create"
          icon="pi pi-plus"
          onClick={openCreateDialog}
          className="p-button-success"
        />
      </div>
    </div>
  );

  // Table Actions
  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="fa fa-pencil"
        className="p-button-warning p-button-sm rounded"
        style={{
          backgroundColor: "#00CFFF",
          border: "none",
          color: "#000",
          marginRight: "4px",
        }}
        onClick={() => openEditDialog(rowData)}
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
        onClick={() => handleDelete(rowData)}
      />
    </div>
  );

  return (
    <div className="content-wrapper">
      <Toast ref={toast} />
      <DataTable
        value={gridData}
        header={header}
        paginator
        rows={10}
        filters={filters}
        filterDisplay="row"
        globalFilterFields={["Name", "Formula", "FixedValue"]}
        emptyMessage="No formulas found."
        dataKey="Id"
        responsiveLayout="scroll"
      >
        <Column field="Name" header="Name" />
        <Column field="Formula" header="Formula" />
        <Column field="FixedValue" header="Fixed Value" />
        <Column header="Action" body={actionBodyTemplate} />
      </DataTable>

      {/* Dialog */}
      <Dialog
        header={editMode ? "Edit Formula" : "Create Formula"}
        visible={dialogVisible}
        style={{ width: "700px" }}
        modal
        onHide={() => setDialogVisible(false)}
      >
        <div className="flex flex-col gap-4">
          <div className="row">
            {/* Name */}
            <div className="col-12 mb-3">
              <label htmlFor="Name">Name</label>
              <input
                id="Name"
                type="text"
                className="form-control"
                value={formData.Name}
                onChange={(e) =>
                  setFormData({ ...formData, Name: e.target.value })
                }
              />
            </div>

            {/* Formula Builder */}
            <div className="col-12 mb-3">
              <h6 className="mt-3 mb-2">Make Formula</h6>

              <div className="row text-center fw-bold mb-2">
                <div className="col-3">Bracket</div>
                <div className="col-3">Name</div>
                <div className="col-3">Operation</div>
                <div className="col-3">Value</div>
              </div>

              {formulaParts.map((part, index) => (
                <div className="row mb-2" key={index}>
                  <div className="col-3">
                    <select
                      className="form-select"
                      value={part.bracket}
                      onChange={(e) => {
                        const updated = [...formulaParts];
                        updated[index].bracket = e.target.value;
                        setFormulaParts(updated);
                      }}
                    >
                      <option value="">None</option>
                      <option value="(">(</option>
                      <option value=")">)</option>
                    </select>
                  </div>

                  <div className="col-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Basic"
                      value={part.name}
                      onChange={(e) => {
                        const updated = [...formulaParts];
                        updated[index].name = e.target.value;
                        setFormulaParts(updated);
                      }}
                    />
                  </div>

                  <div className="col-3">
                    <select
                      className="form-select"
                      value={part.op}
                      onChange={(e) => {
                        const updated = [...formulaParts];
                        updated[index].op = e.target.value;
                        setFormulaParts(updated);
                      }}
                    >
                      <option value="">Select</option>
                      <option value="+">+</option>
                      <option value="-">-</option>
                      <option value="*">*</option>
                      <option value="/">/</option>
                    </select>
                  </div>

                  <div className="col-3">
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="e.g. 3 or 4.5"
                      value={part.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
                          const updated = [...formulaParts];
                          updated[index].value = val;
                          setFormulaParts(updated);
                        }
                      }}
                    />
                  </div>
                </div>
              ))}

              <div className="d-flex gap-2 mt-2">
                <Button
                  label="Add Row"
                  icon="pi pi-plus"
                  className="p-button-sm"
                  onClick={() =>
                    setFormulaParts([
                      ...formulaParts,
                      { bracket: "", name: "", op: "", value: "" },
                    ])
                  }
                />
                <Button
                  label="Build Formula"
                  icon="pi pi-check"
                  className="p-button-sm p-button-success"
                  onClick={buildFormula}
                />
              </div>
            </div>

            {/* Formula (readonly in edit) */}
            <div className="col-12 mb-3">
              <label htmlFor="Formula">Formula</label>
              <input
                id="Formula"
                type="text"
                className="form-control"
                value={formData.Formula}
                onChange={(e) =>
                  setFormData({ ...formData, Formula: e.target.value })
                }
              />
            </div>

            {/* Fixed Value */}
            <div className="col-12 mb-3">
              <label htmlFor="FixedValue">Fixed Value</label>
              <input
                id="FixedValue"
                type="number"
                className="form-control"
                value={formData.FixedValue}
                onChange={(e) =>
                  setFormData({ ...formData, FixedValue: e.target.value })
                }
              />
            </div>

            {/* Dates */}
            <div className="col-12 mb-3">
              <label htmlFor="CreatedOn">Created On</label>
              <Calendar
                id="CreatedOn"
                value={formData.CreatedOn}
                onChange={(e) =>
                  setFormData({ ...formData, CreatedOn: e.value })
                }
                showIcon
                dateFormat="dd-mm-yy"
              />
            </div>

            <div className="col-12 mb-3">
              <label htmlFor="UpdatedOn">Updated On</label>
              <Calendar
                id="UpdatedOn"
                value={formData.UpdatedOn}
                onChange={(e) =>
                  setFormData({ ...formData, UpdatedOn: e.value })
                }
                showIcon
                dateFormat="dd-mm-yy"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-3">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setDialogVisible(false)}
            />
            <Button
              label={editMode ? "Update" : "Create"}
              onClick={handleSave}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default FormulaMaster;
