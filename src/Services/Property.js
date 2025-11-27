import axios from "axios";

const API_BASE = "https://api.urest.in:8096/api/propertytype";

// ----------------------------
// GET ALL PROPERTY TYPES
// ----------------------------
export const getAllPropertyTypes = async () => {
  try {
    const response = await axios.get(`${API_BASE}/getall`, {
      withCredentials: false
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch property types:", error);
    throw error;
  }
};

// ----------------------------
// CREATE PROPERTY TYPE
// ----------------------------
export const createPropertyType = async (data) => {
  try {
    const response = await axios.post(`${API_BASE}/create`, data, {
      withCredentials: false
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create property type:", error);
    throw error;
  }
};

// ----------------------------
// UPDATE (EDIT) PROPERTY TYPE
// ----------------------------
export const updatePropertyType = async (id, data) => {
  try {
    const response = await axios.put(`${API_BASE}/update/${id}`, data, {
      withCredentials: false
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update property type:", error);
    throw error;
  }
};

// ----------------------------
// DELETE PROPERTY TYPE
// ----------------------------
export const deletePropertyType = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE}/delete/${id}`, {
      withCredentials: false
    });
    return response.data;
  } catch (error) {
    console.error("Failed to delete property type:", error);
    throw error;
  }
};

// --------------------------------------------------
// GET PROPERTY BY ID ( /api/property/{propertyId} )
// --------------------------------------------------
export const getPropertyById = async (propertyId) => {
  try {
    const response = await axios.get(
      `https://api.urest.in:8096/api/property/${propertyId}`,
      { withCredentials: false }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch property by ID:", error);
    throw error;
  }
};
