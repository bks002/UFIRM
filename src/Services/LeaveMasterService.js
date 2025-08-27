// src/Services/LeaveMasterService.js

import axios from "axios"

const BASE_URL = "https://api.urest.in:8096/api/attendance/leave-master"

class LeaveMasterService {
  // Get all leave masters
  async getAllLeaveMasters(propertyId) {
    return axios.get(`${BASE_URL}/byProperty/${propertyId}`,{withCredentials:false})
  }

  // Create new leave
  async createLeaveMaster(data) {
    return axios.post(`${BASE_URL}`, data,{withCredentials:false})
  }

  // Update leave by id
  async updateLeaveMaster(id, data) {
    return axios.put(`${BASE_URL}/${id}`, data,{withCredentials:false})
  }

  // Delete leave by id
  async deleteLeaveMaster(id) {
    return axios.delete(`${BASE_URL}/${id}`,{withCredentials:false})
  }
}

export default new LeaveMasterService()
