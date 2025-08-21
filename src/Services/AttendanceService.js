import axios from 'axios';

const API_BASE_URL = 'https://api.urest.in:8096/api/attendance';
//const API_BASE_URL = 'http://localhost:62929/api/attendance';
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

export const getAttendance = async (propertyId,FromDate, ToDate) => {
    try {
        const response = await api.get(`/monthly-summary?PropertyId=${ propertyId }&FromDate=${FromDate}&ToDate=${ToDate}` );
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};