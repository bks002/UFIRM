import axios from "axios";

const API_BASE_URL = "https://api.urest.in:8096/api/formulas"; // adjust base URL if needed

const getAllFormulas = async (propertyId) => {
  const response = await axios.get(API_BASE_URL, {
    params: { propertyId },
    withCredentials: false,
  });
  return response.data;
};

const getFormulaById = async (id, propertyId) => {
  const response = await axios.get(`${API_BASE_URL}/${id}`, {
    params: { propertyId },
    withCredentials: false,
  });
  return response.data;
};

const createFormula = async (data, propertyId) => {
  const response = await axios.post(`${API_BASE_URL}?propertyId=${propertyId}`, data, {
    headers: { "Content-Type": "application/json" },
    withCredentials: false,
  });
  return response.data;
};

const updateFormula = async (id, data, propertyId) => {
  const response = await axios.put(`${API_BASE_URL}/${id}?propertyId=${propertyId}`, data, {
    headers: { "Content-Type": "application/json" },
    withCredentials: false,
  });
  return response.data;
};

const deleteFormula = async (id, propertyId) => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`, {
    params: { propertyId },
    withCredentials: false,
  });
  return response.data;
};

export default {
  getAllFormulas,
  getFormulaById,
  createFormula,
  updateFormula,
  deleteFormula
};
