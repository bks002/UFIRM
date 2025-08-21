import axios from "axios";

const API_BASE = "https://api.urest.in:8096/api/attendance";


export const EmployeeLeaveService = {
  // Get Leave Types by PropertyId
  getLeaveTypes: async (propertyId) => {
    try {
      const res = await axios.get(`${API_BASE}/leave-master/byProperty/${propertyId}`, { withCredentials: false });
      return res.data;
      
    } catch (err) {
      console.error("Error fetching leave types", err);
      return [];
    }
  },

  // Get Employee Leaves by PropertyId
  getLeaves: async (propertyId) => {
    try {
      const res = await axios.get(`${API_BASE}/employeeleave/property/${propertyId}`,{ withCredentials: false });
      return res.data;
    } catch (err) {
      console.error("Error fetching employee leaves", err);
      return [];
    }
  },

  // (agar Employees ki API hai to ye bhi add karna padega)
  getEmployees: async (propertyId) => {
    try {
      const res = await axios.get(`${API_BASE}/employee/byProperty/${propertyId}`,{ withCredentials: false });
      return res.data;
    } catch (err) {
      console.error("Error fetching employees", err);
      return [];
    }
  },

  // Create Employee Leave
  addLeave: async (data) => {
    try {
      const res = await axios.post(`${API_BASE}/employeeleave`, data,{ withCredentials: false });
      return res.data;
    } catch (err) {
      console.error("Error creating employee leave", err);
      throw err;
    }
  },

  // Update Employee Leave
  updateLeave: async (id, data) => {
    try {
      const res = await axios.put(`${API_BASE}/employeeleave/${id}`, data,{ withCredentials: false });
      return res.data;
    } catch (err) {
      console.error("Error updating employee leave", err);
      throw err;
    }
  },

  // Delete Employee Leave
  deleteLeave: async (id) => {
    try {
      await axios.delete(`${API_BASE}/employeeleave/${id}`,{ withCredentials: false });
      return true;
    } catch (err) {
      console.error("Error deleting employee leave", err);
      return false;
    }
  }
};
