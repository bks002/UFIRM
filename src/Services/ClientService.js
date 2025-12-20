// src/services/clientService.js

const API_BASE = "https://api.urest.in:8096/api/clientmaster";

// --------------------------------------------------
// GET ALL CLIENTS
// --------------------------------------------------
export const getAllClients = async () => {
    const response = await fetch(`${API_BASE}/all`);
    if (!response.ok) throw new Error("Failed to fetch clients");
    return response.json();
};

// --------------------------------------------------
// CREATE CLIENT
// --------------------------------------------------
export const createClient = async (data) => {
    const response = await fetch(`${API_BASE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Failed to create client");
    return response.json();
};

// --------------------------------------------------
// UPDATE CLIENT
// --------------------------------------------------
export const updateClient = async (id, data) => {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Failed to update client");
    return response.json();
};

// --------------------------------------------------
// DELETE CLIENT (Soft Delete)
// --------------------------------------------------
export const deleteClient = async (id) => {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) throw new Error("Failed to delete client");
    return response.json();
};

// --------------------------------------------------
// GET SINGLE CLIENT BY ID (Optional)
// --------------------------------------------------
export const getClientById = async (id) => {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch client");
    return response.json();
};
