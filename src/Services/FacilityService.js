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
         {withCredentials: false,},
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
     throw (error.response && error.response.data) ? error.response.data : { Success: false, Message: "Server Error" };
    }
  }
};



// FacilityMemberService.js
const BASE_URL = "https://api.urest.in:8096/api/UfirmEmployee";

export const FacilityMemberService = {
  // Fetch all facility members by propertyId
  getFacilityMembers: async (propertyId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/get-FacilityMembers?propertyId=${propertyId}`, {withCredentials: false,},
        {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data; // returns an array of facility members
    } catch (error) {
      console.error("Failed to fetch facility members:", error);
      throw error;
    }
  },

  // Optionally, you can add more methods like get by ID, create, update, delete
  getFacilityMemberById: async (facilityMemberId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/get-FacilityMembers/${facilityMemberId}`,
        {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch facility member:", error);
      throw error;
    }
  },
};
const API_URL = "https://api.urest.in:8096/api/employee"; 


export const createEmployee = async (employeeData) => {
  try {
    const response = await axios.post(`${API_URL}/create`, employeeData, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: false,
    },
   );
    return response.data; 
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
};
export default FacilityService;