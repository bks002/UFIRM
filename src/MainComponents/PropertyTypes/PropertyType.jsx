import React, { useEffect, useState } from "react";
import {
  getAllPropertyTypes,
  createPropertyType,
  updatePropertyType,
  deletePropertyType,
} from "../../Services/Property";

export default function PropertyType() {
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    PropertyType: "",
    Description: "",
  });

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    loadPropertyTypes();
  }, []);

  const loadPropertyTypes = () => {
    getAllPropertyTypes()
      .then(setPropertyTypes)
      .catch(() => setPropertyTypes([]));
  };

  // -----------------------------
  // OPEN CREATE MODAL
  // -----------------------------
  const openCreate = () => {
    setIsEdit(false);
    setFormData({
      PropertyType: "",
      Description: "",
    });
    setDialogOpen(true);
  };

  // -----------------------------
  // OPEN EDIT MODAL
  // -----------------------------
  const openEdit = (item) => {
    setIsEdit(true);
    setSelectedRecord(item);
    setFormData({
      PropertyType: item.PropertyType,
      Description: item.Description,
    });
    setDialogOpen(true);
  };

  // -----------------------------
  // OPEN DELETE CONFIRMATION
  // -----------------------------
  const openDelete = (item) => {
    setSelectedRecord(item);
    setDeleteDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedRecord(null);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedRecord(null);
  };

  // -----------------------------
  // HANDLE CREATE & EDIT SUBMIT
  // -----------------------------
  const handleSubmit = async () => {
    try {
      if (isEdit) {
        // UPDATE
        await updatePropertyType(selectedRecord.PropertyTypeId, formData);
      } else {
        // CREATE
        await createPropertyType(formData);
      }

      loadPropertyTypes();
      closeDialog();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  // -----------------------------
  // DELETE FUNCTION
  // -----------------------------
  const handleDelete = async () => {
    try {
      await deletePropertyType(selectedRecord.PropertyTypeId);
      loadPropertyTypes();
      closeDeleteDialog();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  // FILTER
  const filteredList = propertyTypes.filter(
    (item) =>
      item.PropertyType.toLowerCase().includes(search.toLowerCase()) ||
      item.Description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="content-wrapper" style={{ minHeight: "100vh", padding: 30 }}>
      <div
        className="card"
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          borderRadius: 10,
          padding: "20px 30px",
          background: "#f7fafc",
        }}
      >
        <div style={{ display: "flex", marginBottom: 10 }}>
          <h2 style={{ fontWeight: "bold", color: "#2a4365" }}>Property Types</h2>

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: 5,
              borderRadius: 4,
              border: "1px solid #ccc",
              marginLeft: "auto",
            }}
          />

          <button className="btn btn-sm btn-success ml-3" onClick={openCreate}>
            CREATE
          </button>
        </div>

        {/* TABLE */}
        <table className="table table-bordered" style={{ background: "#fff" }}>
          <thead style={{ background: "#edf2f7" }}>
            <tr>
              <th>S.No.</th>
              <th>Property Type</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  No Data Found
                </td>
              </tr>
            ) : (
              filteredList.map((item, index) => (
                <tr key={item.PropertyTypeId}>
                  <td>{index + 1}</td>
                  <td>{item.PropertyType}</td>
                  <td>{item.Description}</td>
                  <td style={{ textAlign: "center" }}>
                    {/* EDIT BUTTON */}
                    <button
                      className="btn btn-sm btn-warning mr-2"
                      onClick={() => openEdit(item)}
                    >
                      <i className="fa fa-edit" />
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => openDelete(item)}
                    >
                      <i className="fa fa-trash" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      {dialogOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={closeDialog}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              minWidth: 400,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 20 }}>
              {isEdit ? "Edit Property Type" : "Create Property Type"}
            </h3>

            <label>Property Type</label>
            <input
              className="form-control mb-2"
              value={formData.PropertyType}
              onChange={(e) =>
                setFormData({ ...formData, PropertyType: e.target.value })
              }
            />

            <label>Description</label>
            <textarea
              className="form-control mb-3"
              value={formData.Description}
              onChange={(e) =>
                setFormData({ ...formData, Description: e.target.value })
              }
            ></textarea>

            <div style={{ textAlign: "right" }}>
              <button className="btn btn-secondary mr-2" onClick={closeDialog}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {isEdit ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteDialogOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={closeDeleteDialog}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              minWidth: 350,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4>"We are sure Akshat is Londiabaj
              
              
              
              
              
              
              
              
              
              
              
              
              
              "?</h4>
            <p>This will delete the property type permanently.</p>

            <div style={{ textAlign: "right" }}>
              <button className="btn btn-secondary mr-2" onClick={closeDeleteDialog}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
