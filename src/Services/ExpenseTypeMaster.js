import axios from "axios";

const API_BASE = "https://api.urest.in:8096/api/expenses/types";

export const ExpenseService = {
    // GET - fetch all expense types for a property
  getExpenseTypes: async (propertyId) => {
    try {
      const res = await axios.get(`${API_BASE}/${propertyId}`,  {withCredentials: false});
      return res.data;
    } catch (error) {
      console.error("Error fetching expense types:", error);
      throw error;
    }
  },

  // POST - create expense type
    createExpenseType: async (payload) => {
    try {
      const res = await axios.post(API_BASE, payload, {withCredentials: false});
      return res.data;
    } catch (error) {
      console.error("Error creating expense type:", error);
      throw error;
    }
  },

  // PUT - update expense type
  updateExpenseType: async (id, payload) => {
    try {
      const res = await axios.put(`${API_BASE}/${id}`, payload, {withCredentials: false});
      return res.data;
    } catch (error) {
      console.error("Error updating expense type:", error);
      throw error;
    }
  },

  // DELETE - delete expense type
  deleteExpenseType: async (id) => {
    try {
      const res = await axios.delete(`${API_BASE}/${id}`, {withCredentials: false});
      return res.data;
    } catch (error) {
      console.error("Error deleting expense type:", error);
      throw error;
    }
  },
};
