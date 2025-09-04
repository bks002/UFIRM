// src/services/FacilityService.js
import axios from "axios";

const API_BASE_URL = "https://api.urest.in:8096/api/facilitymember";

const FacilityService = {
  resetPassword: async (mobileNumber) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/reset-password`,
        {
          MobileNumber: mobileNumber
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error.response?.data || { Success: false, Message: "Server Error" };
    }
  }
};

export default FacilityService;
