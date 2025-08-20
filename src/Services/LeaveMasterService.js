// src/Services/LeaveMasterService.js

import axios from "axios"

const BASE_URL = "https://api.urest.in:8096/api/attendance"

class LeaveMasterService {
  // Get all leave masters
  async getAllLeaveMasters() {
    return axios.get(`${BASE_URL}/getAllLeaveMasters`,{withCredentials:false})
  }

  // Create new leave
  async createLeaveMaster(data) {
    return axios.post(`${BASE_URL}/createLeaveMaster`, data,{withCredentials:false})
  }

  // Update leave by id
  async updateLeaveMaster(id, data) {
    return axios.put(`${BASE_URL}/updateLeaveMaster/${id}`, data,{withCredentials:false})
  }

  // Delete leave by id
  async deleteLeaveMaster(id) {
    return axios.delete(`${BASE_URL}/deleteLeaveMaster/${id}`,{withCredentials:false})
  }
}

export default new LeaveMasterService()
