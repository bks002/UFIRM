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

export const getTopDebitExpenses = async ({ dateFrom, dateTo, officeId }) => {
  try {
    const res = await axios.get(`${BASE_URL}/top-debit`, {
      params: { dateFrom, dateTo, officeId },
      withCredentials: false,
    });
    return res.data || [];
  } catch (err) {
    console.error("Error fetching top debit expenses:", err);
    return [];
  }
};

export const getTopCreditExpenses = async ({ dateFrom, dateTo, officeId }) => {
  try {
    const res = await axios.get(`${BASE_URL}/top-credit`, {
      params: { dateFrom, dateTo, officeId },
      withCredentials: false,
    });
    return res.data || [];
  } catch (err) {
    console.error("Error fetching top credit expenses:", err);
    return [];
  }
};

export const getTop5Expenses = async ({ dateFrom, dateTo, officeId }) => {
  try {
    const res = await axios.get(`${BASE_URL}/top5-expense`, {
      params: { dateFrom, dateTo, officeId },
      withCredentials: false,
    });

    return res.data?.result || [];
  } catch (err) {
    console.error("Error fetching top 5 expenses:", err);
    return [];
  }
};