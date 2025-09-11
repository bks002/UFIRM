// src/Services/ExpenseService.js
import axios from "axios";

const BASE_URL = "https://api.urest.in:8096/api/expenses";

export const getAllExpenses = async ({ dateFrom, dateTo, officeId }) => {
  try {
    const response = await axios.get(`${BASE_URL}/all-expense`, {
      params: {
        dateFrom,
        dateTo,
        officeId,
      },
       withCredentials: false,
    });
    return response.data.result || [];
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw error;
  }
};
