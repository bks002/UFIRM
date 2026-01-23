import axios from "axios";

const API_BASE = "https://api.urest.in:8096/api/expenses/master";
const API_EXPENSE_TYPE = "https://api.urest.in:8096/api/expenses/types";
const API_EMPLOYEE = "https://api.urest.in:8096/api/employee";

export const ExpenseMasterService = {
  // =========================
  // GET all expenses by office
  // =========================
  getExpensesByOffice: async (officeId) => {
    try {
      const res = await axios.get(`${API_BASE}/byOffice/${officeId}`, {
        withCredentials: false,
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  },

  // =========================
  // GET employees by office
  // =========================
  getEmployeesByOffice: async (officeId) => {
    try {
      const res = await axios.get(`${API_EMPLOYEE}/getByOffice/${officeId}`, {
        withCredentials: false,
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  },

  // =========================
  // POST - create new expense
  // multipart/form-data
  // =========================
  createExpense: async (formData) => {
    try {
      const res = await axios.post(API_BASE, formData, {
        withCredentials: false,
      });
      return res.data;
    } catch (error) {
      console.error("Error creating expense:", error);
      throw error;
    }
  },

  // =========================
  // PUT - update expense
  // multipart/form-data
  // =========================
  updateExpense: async (id, formData) => {
    try {
      const res = await axios.put(`${API_BASE}/${id}`, formData, {
        withCredentials: false,
      });
      return res.data;
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  },

  // =========================
  // DELETE expense
  // =========================
  deleteExpense: async (id) => {
    try {
      const res = await axios.delete(`${API_BASE}/${id}`, {
        withCredentials: false,
      });
      return res.data;
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  },

  // =========================
  // GET expense types by office
  // =========================
  getExpenseTypesByOffice: async (officeId) => {
    try {
      const res = await axios.get(
        `${API_EXPENSE_TYPE}/names/byOffice/${officeId}`,
        { withCredentials: false }
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching expense types:", error);
      throw error;
    }
  },

  // =========================
  // GET expense subtypes by type ID
  // =========================
  getExpenseSubtypesByType: async (expenseTypeId) => {
    try {
      const res = await axios.get(
        `${API_EXPENSE_TYPE}/subtypes/${expenseTypeId}`,
        { withCredentials: false }
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching expense subtypes:", error);
      throw error;
    }
  },
};
