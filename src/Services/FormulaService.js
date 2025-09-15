import axios from "axios";

const API_BASE_URL = "https://api.urest.in:8096/api/formulas"; // adjust base URL if needed

const getAllFormulas = async () => {
  const response = await axios.get(API_BASE_URL, {
    withCredentials: false, // ✅ move inside config object
  });
  return response.data;
};

const getFormulaById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/${id}`,  {
        withCredentials: false,
      });
  return response.data;
};

const createFormula = async (data) => {
  const response = await axios.post(API_BASE_URL, data, {
    headers: { "Content-Type": "application/json" },
    withCredentials: false,
  });
  return response.data;
};

const updateFormula = async (id, data) => {
  const response = await axios.put(`${API_BASE_URL}/${id}`, data, {
    headers: { "Content-Type": "application/json" },
    withCredentials: false,
  });
  return response.data;
};

const deleteFormula = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`,{ withCredentials: false });
  return response.data;
};

export default {
  getAllFormulas,
  getFormulaById,
  createFormula,
  updateFormula,
  deleteFormula
};
