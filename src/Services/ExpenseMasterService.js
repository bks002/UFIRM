import axios from "axios";

const API_BASE = "https://api.urest.in:8096/api/expenses/master";
const API_EXPENSE_TYPE = "https://api.urest.in:8096/api/expenses/types";

// 🔹 Helper function to convert file → base64 string
const toBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]); // only base64 part
    reader.onerror = (error) => reject(error);
  });
};

export const ExpenseMasterService = {
  // GET all expenses by officeId
  getExpensesByOffice: async (propertyId) => {
    try {
      const res = await axios.get(`${API_BASE}/byOffice/${propertyId}`, {
        withCredentials: false,
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  },

  // POST - create new expense
  createExpense: async (payload, file) => {
    try {
      if (file) {
        const base64Image = await toBase64(file);
        payload.BillImage = base64Image;
      }
      const res = await axios.post(API_BASE, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: false,
      });
      return res.data;
    } catch (error) {
      console.error("Error creating expense:", error);
      throw error;
    }
  },

  // PUT - update expense
  updateExpense: async (id, payload, file) => {
    try {
      if (file) {
        const base64Image = await toBase64(file);
        payload.BillImage = base64Image;
      }
      const res = await axios.put(`${API_BASE}/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: false,
      });
      return res.data;
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  },

  // DELETE - delete expense
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

  // GET Expense Types by Office
  getExpenseTypesByOffice: async (propertyIdId) => {
    try {
      const res = await axios.get(`${API_EXPENSE_TYPE}/names/byOffice/${propertyIdId}`, {
        withCredentials: false,
      });
      return res.data; // array of ExpenseType names
    } catch (error) {
      console.error("Error fetching expense types:", error);
      throw error;
    }
  },

  // GET Expense Subtypes by Type
  getExpenseSubtypesByType: async (expenseTypeName) => {
    try {
      const res = await axios.get(`${API_EXPENSE_TYPE}/subtypes/byType`, {
        params: { expenseTypeName },
        withCredentials: false,
      });
      return res.data; // array of subtypes
    } catch (error) {
      console.error("Error fetching expense subtypes:", error);
      throw error;
    }
  },
};
