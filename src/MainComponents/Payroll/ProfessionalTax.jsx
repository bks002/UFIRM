import React, { useEffect, useState } from "react";
import {
  getPftList,
  getCountries,
  getStatesByCountry,
  deletePft,
  addPft,
  updatePft,
} from "../../Services/PayrollService";

export default function ProfessionalTax() {
  const [pftData, setPftData] = useState([]);
  const [states, setStates] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchPft, setSearchPft] = useState("");

  useEffect(() => {
    getCountries()
      .then((countries) => {
        const india = countries.find(
          (c) => c.Name.toLowerCase() === "india"
        ) || countries[0];
        if (india) {
          getStatesByCountry(india.CountryId).then(setStates).catch(() => setStates([]));
        }
      })
      .catch(() => setStates([]));
    fetchData();
  }, []);

  function fetchData() {
    getPftList()
      .then((data) =>
        setPftData(
          data.map((item) => ({
            ...item,
            TaxAmountMale: item.TaxAmountMale ?? 0,
            TaxAmountFemale: item.TaxAmountFemale ?? 0,
          }))
        )
      )
      .catch(() => setPftData([]));
  }

  const getStateName = (stateId) => {
    const foundState = states.find((state) => state.StateId === stateId);
    return foundState ? foundState.StateName.toString() : stateId.toString();
  };

  const initialPftForm = {
    PftId: 0,
    StateId: 0,
    AmountFrom: 0,
    AmountTo: 0,
    TaxAmountMale: 0,
    TaxAmountFemale: 0,
  };

  const openDialog = (type, record = null) => {
    setDialogType(type);
    setSelectedRecord(record);
    if (type === "create-pft") {
      setFormData(initialPftForm);
    } else if (record) {
      setFormData({
        ...record,
        TaxAmountMale: record.TaxAmountMale ?? 0,
        TaxAmountFemale: record.TaxAmountFemale ?? 0,
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedRecord(null);
    setFormData({});
  };

  const handleDeletePft = async (id) => {
    if (window.confirm("Are you sure you want to delete this PFT record?")) {
      try {
        await deletePft(id);
        fetchData();
      } catch {
        alert("Delete failed.");
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (Number(formData.AmountTo) <= Number(formData.AmountFrom)) {
      alert("'Amount To' must be greater than 'Amount From'");
      return;
    }

    const payload = {
      PftId: formData.PftId,
      StateId: formData.StateId,
      AmountFrom: formData.AmountFrom,
      AmountTo: formData.AmountTo,
      TaxAmountMale: formData.TaxAmountMale,
      TaxAmountFemale: formData.TaxAmountFemale,
    };

    try {
      if (dialogType === "create-pft") {
        await addPft(payload);
      } else if (dialogType === "edit-pft") {
        await updatePft(formData.PftId, payload);
      }
      fetchData();
      closeDialog();
    } catch {
      alert("Operation failed.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "StateId"
          ? parseInt(value)
          : name === "AmountFrom" ||
            name === "AmountTo" ||
            name === "TaxAmountMale" ||
            name === "TaxAmountFemale"
            ? value === ""
              ? ""   // allow empty
              : Number(value)
            : value,
    }));
  };

  const isView = dialogType === "view-pft";

  const stateOptions = states.map((s) => (
    <option key={s.StateId} value={s.StateId}>
      {s.StateName}
    </option>
  ));

  const filteredPft = pftData.filter(
    (item) =>
      getStateName(item.StateId)
        .toLowerCase()
        .includes(searchPft.toLowerCase()) ||
      item.AmountFrom.toString().includes(searchPft) ||
      item.AmountTo.toString().includes(searchPft) ||
      item.TaxAmountMale?.toString().includes(searchPft) ||
      item.TaxAmountFemale?.toString().includes(searchPft)
  );

  return (
    <div className="content-wrapper" style={{ minHeight: "100vh", padding: 30 }}>
      <div
        className="card"
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          borderRadius: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          padding: "20px 30px",
          background: "#f7fafc",
        }}
      >
        {/* Professional Tax Section */}
        <div
          style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}
        >
          <h2 style={{ fontWeight: "bold", color: "#2a4365" }}>Professional Tax</h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchPft}
              onChange={(e) => setSearchPft(e.target.value)}
              style={{ padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
            />
            <button className="btn btn-success" onClick={() => openDialog("create-pft")}>
              Create
            </button>
          </div>
        </div>

        <table
          className="table table-bordered"
          style={{ width: "100%", marginBottom: 40, background: "#fff" }}
        >
          <thead style={{ background: "#edf2f7" }}>
            <tr>
              <th>S.No.</th>
              <th>State Name</th>
              <th>Salary Lower Limit</th>
              <th>Salary Upper Limit</th>
              <th>Tax Amount Male</th>
              <th>Tax Amount Female</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPft.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#718096" }}>
                  No data
                </td>
              </tr>
            ) : (
              filteredPft.map((item, index) => (
                <tr key={item.PftId}>
                  <td>{index + 1}</td>
                  <td>{getStateName(item.StateId)}</td>
                  <td>{item.AmountFrom}</td>
                  <td>{item.AmountTo}</td>
                  <td>{item.TaxAmountMale ?? 0}</td>
                  <td>{item.TaxAmountFemale ?? 0}</td>
                  <td style={{ textAlign: "center", fontSize: 18, userSelect: "none" }}>
                    <button
                      className="btn btn-sm btn-info me-2"
                      title="View"
                      onClick={() => openDialog("view-pft", item)}
                      type="button"
                    >
                      <i className="fa fa-eye" aria-hidden="true" />
                    </button>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      title="Edit"
                      onClick={() => openDialog("edit-pft", item)}
                      type="button"
                    >
                      <i className="fa fa-pencil" aria-hidden="true" />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      title="Delete"
                      onClick={() => handleDeletePft(item.PftId)}
                      type="button"
                    >
                      <i className="fa fa-trash" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog Modal */}
      {dialogOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={closeDialog}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 8,
              minWidth: 400,
              maxWidth: 600,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 20 }}>
              {dialogType === "create-pft" && "Create "}
              {dialogType === "edit-pft" && "Edit "}
              {dialogType === "view-pft" && "View "}
              Professional Tax
            </h3>

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: 10 }}>
                <label>State:</label>
                {isView ? (
                  <div>{getStateName(formData.StateId)}</div>
                ) : (
                  <select
                    name="StateId"
                    value={formData.StateId}
                    onChange={handleInputChange}
                    required
                    style={{ width: "100%", padding: 6 }}
                  >
                    <option value={0}>-- Select State --</option>
                    {stateOptions}
                  </select>
                )}
              </div>

              <div style={{ marginBottom: 10 }}>
                <label>Salary Lower Limit:</label>
                {isView ? (
                  <div>{formData.AmountFrom}</div>
                ) : (
                  <input
                    type="number"
                    step="0.01"
                    name="AmountFrom"
                    value={formData.AmountFrom}
                    onChange={handleInputChange}
                    required
                    style={{ width: "100%", padding: 6 }}
                  />
                )}
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>Salary Upper Limit:</label>
                {isView ? (
                  <div>{formData.AmountTo}</div>
                ) : (
                  <input
                    type="number"
                    step="0.01"
                    name="AmountTo"
                    value={formData.AmountTo}
                    onChange={handleInputChange}
                    required
                    style={{ width: "100%", padding: 6 }}
                  />
                )}
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>Tax Amount Male:</label>
                {isView ? (
                  <div>{formData.TaxAmountMale}</div>
                ) : (
                  <input
                    type="number"
                    step="0.01"
                    name="TaxAmountMale"
                    value={formData.TaxAmountMale}
                    onChange={handleInputChange}
                    required
                    style={{ width: "100%", padding: 6 }}
                  />
                )}
              </div>

              <div style={{ marginBottom: 10 }}>
                <label>Tax Amount Female:</label>
                {isView ? (
                  <div>{formData.TaxAmountFemale}</div>
                ) : (
                  <input
                    type="number"
                    step="0.01"
                    name="TaxAmountFemale"
                    value={formData.TaxAmountFemale}
                    onChange={handleInputChange}
                    required
                    style={{ width: "100%", padding: 6 }}
                  />
                )}
              </div>

              <div style={{ textAlign: "right", marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeDialog}
                  style={{ marginRight: 10 }}
                >
                  Cancel
                </button>
                {!isView && (
                  <button type="submit" className="btn btn-primary">
                    {dialogType === "create-pft" ? "Create" : "Update"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
