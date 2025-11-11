import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { FileUpload } from "primereact/fileupload";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ExpenseMasterService } from "../../Services/ExpenseMasterService";
import { useSelector } from "react-redux";
import { Dropdown } from "primereact/dropdown";

const ExpenseMaster = () => {
    const [viewing, setViewing] = useState(false);
    const [expenseTypes, setExpenseTypes] = useState([]);
const [expenseSubtypes, setExpenseSubtypes] = useState([]);
const [file, setFile] = useState(null);

  const propertyId = useSelector((state) => state.Commonreducer.puidn);
  const [expenses, setExpenses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    Id: 0,
    ExpenseType: "",
    ExpenseSubtype: "",
    DateFrom: null,
    DateTo: null,
    Amount: null,
    Description: "",
    BillImage: "",
    OfficeId: propertyId,
    IsActive: true,
    CreatedBy: 1,
    CreatedOn: new Date().toISOString(),
    UpdatedBy: 1,   
    UpdatedOn: new Date().toISOString(),
  });


  const handleView = (row) => {
  const formatForCalendar = (val) => val ? new Date(new Date(val).toDateString()) : null;

  setForm({
    ...row,
    DateFrom: formatForCalendar(row.DateFrom),
    DateTo: formatForCalendar(row.DateTo),
  });
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
  // ✅ Convert file -> base64
  const toBase64 = (file) =>{
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]); // remove prefix
      reader.onerror = (error) => reject(error);
    });
  };
  const handleFileUpload = async (e) => {
    const file = e.files[0];
    if (file) {
      const base64 = await toBase64(file);
      setForm((prev) => ({ ...prev, BillImage: base64 }));
    }
  };

  // ✅ Fetch data
 const fetchExpenses = async (propertyId) => {
    try {
      const data = await ExpenseMasterService.getExpensesByOffice(propertyId);
      const activeExpenses = data.filter(expense => expense.IsActive);
      setExpenses(activeExpenses);
    } catch (err) {
      console.error("Error loading expenses:", err);
    }
  };


useEffect(() => {
  if (propertyId) {
    ExpenseMasterService.getExpenseTypesByOffice(propertyId)
      .then(setExpenseTypes)
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
        .then((types) => setExpenseTypes(types.map(t => ({ label: t, value: t }))))
        .catch(console.error);
    }
  }, [propertyId]);

  // ✅ Fetch subtypes whenever ExpenseType changes
  useEffect(() => {
    if (form.ExpenseType) {
      ExpenseMasterService.getExpenseSubtypesByType(form.ExpenseType)
        .then((subtypes) => setExpenseSubtypes(subtypes.map(s => ({ label: s, value: s }))))
        .catch(console.error);
    } else {
      setExpenseSubtypes([]);
      setForm(prev => ({ ...prev, ExpenseSubtype: "" }));
    }
  }, [form.ExpenseType]);



  // ✅ Save / Update
  const handleSave = async () => {
  if (!form.BillImage) {
    alert("Please upload a bill image before saving.");
    return;
  }

  try {
    const payload = {
      ...form,
      OfficeId: propertyId,
      CreatedOn: new Date().toISOString(),
        CreatedBy: 1,
        UpdatedOn: new Date().toISOString(),
        UpdatedBy: 1,
      IsActive: true,
    };

    if (editing) {
      await ExpenseMasterService.updateExpense(form.Id, payload);
    } else {
      await ExpenseMasterService.createExpense(payload);
    }

    setOpen(false);
    setEditing(false);
    fetchExpenses(propertyId);
    resetForm();
  } catch (err) {
    console.error("Error saving:", err);
  }
};



  const resetForm = () => {
    const now = new Date().toISOString();
    setForm({
      Id: 0,
      ExpenseType: "",
      ExpenseSubtype: "",
      DateFrom: null,
      DateTo: null,
      Amount: null,
      Description: "",
      BillImage: "",
      OfficeId: propertyId,
      IsActive: true,
      CreatedBy: 1,
      CreatedOn: new Date().toISOString(),
      UpdatedBy: 1,
      UpdatedOn: new Date().toISOString(),
    });
     setFile(null);
  };

  // ✅ Edit
 const handleEdit = (row) => {
    const formatForCalendar = (val) => val ? new Date(new Date(val).toDateString()) : null;
    setForm({ ...row, DateFrom: formatForCalendar(row.DateFrom), DateTo: formatForCalendar(row.DateTo) });
    setEditing(true);
    setOpen(true);
  };


  // ✅ Delete
    const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this record?")) {
      await ExpenseMasterService.deleteExpense(id);
      setExpenses(prev => prev.filter(exp => exp.Id !== id));
    }
  };


  // ✅ Action Buttons in Table
  const actionTemplate = (rowData) => (
    <div className="flex gap-2">
       <Button
      icon="fa fa-eye"
      className="p-button-info p-button-sm rounded"
      style={{ backgroundColor: "#FFD700", border: "none", color: "#000", marginRight: "4px" }}
      onClick={() => handleView(rowData)}
      tooltip="View"
    />
      <Button
        icon="fa fa-pencil"
      className="p-button-warning p-button-sm rounded"
       style={{ backgroundColor: "#00CFFF", border: "none", color: "#000", marginRight: "4px" }}
      onClick={() => handleEdit(rowData)}
      tooltip="Edit"
      />
      <Button
        icon="fa fa-trash"
      className="p-button-danger p-button-sm rounded"
      style={{ backgroundColor: "#FF4D4D", border: "none", color: "#fff", marginRight: "4px" }}
      onClick={() => handleDelete(rowData)}
      tooltip="Delete"
      />
    </div>
  );

  // ✅ Image Preview
  const imageTemplate = (rowData) => {
  if (!rowData.BillImage) return "No Image";

  // Check if the base64 already has data:image prefix
  const isPrefixed = rowData.BillImage.startsWith("data:image");
  const src = isPrefixed
    ? rowData.BillImage
    : `data:image/png;base64,${rowData.BillImage}`;

  return (
    <img
      src={src}
      alt="bill"
      style={{ width: 60, height: 60, objectFit: "cover", borderRadius: "4px" }}
    />
  );
};


   const header = (
    <div className="d-flex justify-content-between align-items-center p-2">
      <h5>Expense Master</h5>
      <div className="d-flex gap-2 align-items-center">
      <Button
        label="Add Expense"
        icon="pi pi-plus"
        onClick={() => { resetForm(); setEditing(false); setOpen(true)}}
        className="mb-3"
        
      />
      </div>
      </div>
   );
  return (
    <>
      {/* Table */}
      <div className="content-wrapper">
        <section className="content">
          <div className="container-fluid">
            <div className="card">
              {/* If you use Toast, make sure it's imported and defined */}
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
    <Column field="DateFrom" header="Date From" body={(row) => formatDate(row.DateFrom)} />
   <Column field="DateTo" header="Date To" body={(row) => formatDate(row.DateTo)} />
    <Column field="Amount" header="Amount" />
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
                value={form.ExpenseType}
                options={expenseTypes}
                onChange={(e) => setForm(prev => ({ ...prev, ExpenseType: e.value }))}
                placeholder="Select Expense Type"
                className="w-full"
              />            </div>
           <div className="flex flex-col">
              <label>Expense Subtype</label>
 <Dropdown
                value={form.ExpenseSubtype}
                options={expenseSubtypes}
                onChange={(e) => setForm(prev => ({ ...prev, ExpenseSubtype: e.value }))}
                placeholder="Select Expense Subtype"
                disabled={!form.ExpenseType}
              />            </div>
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
            <div className="flex flex-col">
              <label>Amount</label>
              <InputNumber
                value={form.Amount}
                onValueChange={(e) =>
                  setForm((prev) => ({ ...prev, Amount: e.value }))
                }
                mode="currency"
                currency="INR"
                locale="en-IN"
              />
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
  <label>Upload Bill Image</label>
  <FileUpload
    mode="basic"
    accept="image/*"
    customUpload
    uploadHandler={async (e) => {
      const file = e.files[0];
      if (file) {
        const base64 = await toBase64(file);
        setForm((prev) => ({ ...prev, BillImage: base64 }));
      }
    }}
    chooseLabel="Choose"
  />
  {form.BillImage && (
    <img
      src={`data:image/png;base64,${form.BillImage}`}
      alt="Preview"
      style={{ width: 80, marginTop: 10, borderRadius: 4 }}
    />
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
              label={editing ? "Update" : "Save"}
              icon="pi pi-check"
              onClick={handleSave}
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
            <InputText value={form.ExpenseType} readOnly />
          </div>
         <div className="flex flex-col">
            <label>Expense Subtype</label>
            <InputText value={form.ExpenseSubtype} readOnly />
          </div>
          <div className="flex flex-col">
            <label>Date From</label>
            <InputText value={formatDate(form.DateFrom)} readOnly />
          </div>
          <div className="flex flex-col">
            <label>Date To</label>
            <InputText value={formatDate(form.DateTo)} readOnly />
          </div>
          <div className="flex flex-col">
            <label>Amount</label>
            <InputText value={form.Amount} readOnly />
          </div>
          <div className="flex flex-col">
            <label>Description</label>
            <InputTextarea value={form.Description} rows={3} readOnly />
          </div>
          <div className="flex flex-col">
            <label>Bill Image</label>
            {form.BillImage ? (
              <img
                src={`data:image/png;base64,${form.BillImage}`}
                alt="Bill"
                style={{ width: 100, borderRadius: 4 }}
              />
            ) : (
              "No Image"
            )}
          </div>
        </div>
      </Dialog>
      </div>
    </>
  );
};

export default ExpenseMaster;
