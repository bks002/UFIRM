import axios from "axios";

const API_BASE_URL = "https://api.urest.in:8096/api/Branch";

// GET
export const getAllBranches = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/GetAllBranches`,
    { withCredentials: false }
  );
  return response.data;
};

// CREATE
export const createBranch = async (data) => {
  const response = await axios.post(
    `${API_BASE_URL}/CreateBranch`,
    data,
    { withCredentials: false }
  );
  return response.data;
};

// UPDATE
export const updateBranch = async (id, data) => {
  const response = await axios.put(
    `${API_BASE_URL}/UpdateBranch/${id}`,
    data,
    { withCredentials: false }
  );
  return response.data;
};

// DELETE
export const deleteBranch = async (id) => {
  const response = await axios.delete(
    `${API_BASE_URL}/DeleteBranch/${id}`,
    { withCredentials: false }
  );
  return response.data;
};