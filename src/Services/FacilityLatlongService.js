import axios from "axios";

const API_BASE_URL = "https://api.urest.in:8096/api/UfirmEmployee";

export const FacilityLatlongService = {
  
  // ✅ Get all lat-long members by propertyId
  getMembers: async (propertyId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get-Members`, {
        params: { propertyId },
        withCredentials: false
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching facility members:", error);
      throw error;
    }
  },

  // ✅ Get facility members for names & details
  getFacilityMembers: async (propertyId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get-FacilityMembers`, {
        params: { propertyId },
        withCredentials: false
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching facility member names:", error);
      throw error;
    }
  },

  // ✅ Add new facility member
addMember: async (memberData) => {
    const response = await axios.post(
      `${API_BASE_URL}/add-Member`,
      memberData,
      { headers: { "Content-Type": "application/json" } , withCredentials:false}
      
    );
    return response.data;
  },
 

  // ✅ Delete facility member
  deleteMember: async (memberId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/delete-Member/${memberId}`,{withCredentials:false});
      return response.data;
    } catch (error) {
      console.error("Error deleting facility member:", error);
      throw error;
    }
  }
};
