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

const FormulaMaster = () => {
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

  // 🔹 Fetch all formulas
  const fetchData = async () => {
    try {
      const data = await FormulaMasterService.getAllFormulas();
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
    fetchData();
  }, []);

  // 🔹 Create or Update
  const handleSave = async () => {
    try {
      if (editMode) {
        await FormulaMasterService.updateFormula(formData.Id, formData);
        toast.current.show({
          severity: "success",
          summary: "Updated",
          detail: "Formula updated successfully",
        });
      } else {
        await FormulaMasterService.createFormula(formData);
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

  // 🔹 Delete
  const handleDelete = async (rowData) => {
    try {
      await FormulaMasterService.deleteFormula(rowData.Id);
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

  // 🔹 Open dialog
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
    setEditMode(false);
    setDialogVisible(true);
  };

  const openEditDialog = (rowData) => {
    setFormData({
      Id: rowData.Id,
      Name: rowData.Name,
      Formula: rowData.Formula,
      FixedValue: rowData.FixedValue,
      CreatedOn: rowData.CreatedOn ? new Date(rowData.CreatedOn) : new Date(),
      UpdatedOn: rowData.UpdatedOn ? new Date(rowData.UpdatedOn) : new Date(),
      IsActive: rowData.IsActive,
    });
    setEditMode(true);
    setDialogVisible(true);
  };

  // 🔹 Table header
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

  // 🔹 Action column
  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="fa fa-pencil-alt"
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
        style={{ width: "600px" }}
        modal
        onHide={() => setDialogVisible(false)}
      >
        <div className="flex flex-col gap-4">
          <div className="row">
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

            {/* ---------- Formula Builder Section ---------- */}
            <div className="col-12 mb-3">
              <h6 className="mt-3 mb-2">Make Formula</h6>

              <div className="row text-center fw-bold mb-2">
                <div className="col-4">Name</div>
                <div className="col-4">Operation</div>
                <div className="col-4">Value</div>
              </div>

              {[0, 1, 2].map((index) => (
                <div className="row mb-2" key={index}>
                  <div className="col-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Basic"
                      value={formData[`field${index + 1}_name`] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [`field${index + 1}_name`]: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-4">
                    <select
                      className="form-select"
                      value={formData[`field${index + 1}_op`] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [`field${index + 1}_op`]: e.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>
                      <option value="+">+</option>
                      <option value="-">-</option>
                      <option value="*">*</option>
                      <option value="%">%</option>
                    </select>
                  </div>

                  <div className="col-4">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 0.7"
                      value={formData[`field${index + 1}_val`] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [`field${index + 1}_val`]: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ))}

              <Button
                label="Add Formula"
                icon="pi pi-plus"
                className="p-button-sm mt-2"
                onClick={() => {
                  let formula = "";
                  const fields = [1, 2, 3].map((i) => ({
                    n: formData[`field${i}_name`],
                    o: formData[`field${i}_op`],
                    v: formData[`field${i}_val`],
                  }));

                  fields.forEach((f, i) => {
                    if (f.n && f.o) formula += `${f.n}${f.o}`;
                    else if (f.n) formula += `${f.n}`;
                  });

                  const lastVal = fields[2].v || fields[1].v || fields[0].v;
                  if (lastVal) formula = `(${formula.slice(0, -1)})*${lastVal}`;

                  setFormData({ ...formData, Formula: formula });
                }}
              />
            </div>
            {/* --------------------------------------------- */}

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
