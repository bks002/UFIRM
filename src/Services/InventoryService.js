import axios from 'axios';

const API_BASE_URL = 'https://api.urest.in:8096/api/inventory';
//const API_BASE_URL = 'http://localhost:62929/api/inventory';
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false,
});

const handleApiError = (error) => {
    if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
    } else if (error.response && error.response.data) {
        throw new Error(JSON.stringify(error.response.data));
    } else {
        throw new Error('An unexpected error occurred.');
    }
};
// ========== CATEGORY ==========
export const getCategories = async (propertyId) => {
    try {
        const response = await api.get(`/categories?propertyId=${ propertyId }` );
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const getCategoryById = async (id) => {
    try {
        const response = await api.get(`/category/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const createCategory = async (category) => {
    try {
        const response = await api.post('/category', category);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const updateCategory = async (id, category) => {
    try {
        const response = await api.put(`/category/${id}`, category);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const deleteCategory = async (id) => {
    try {
        const response = await api.delete(`/category/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

// ========== ITEM ==========
export const getAllItems = async (propertyId) => {
    try {
        const response = await api.get('/items', { params: { propertyId } });
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const getItemById = async (id) => {
    try {
        const response = await api.get(`/item/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const createItem = async (item) => {
    try {
        const response = await api.post('/item', item);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const updateItem = async (id, item) => {
    try {
        const response = await api.put(`/item/${id}`, item);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const deleteItem = async (id) => {
    try {
        const response = await api.delete(`/item/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

// ========== VENDOR ==========
export const getVendors = async (propertyId) => {
    try {
        const response = await api.get(`/vendors?propertyId=${propertyId}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const getVendorById = async (id) => {
    try {
        const response = await api.get(`/vendor/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const createVendor = async (vendor) => {
    try {
        const response = await api.post('/vendor', vendor, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const updateVendor = async (id, vendor) => {
    try {
        const response = await api.put(`/vendor/${id}`, vendor);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const deleteVendor = async (id) => {
    try {
        const response = await api.delete(`/vendor/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};
