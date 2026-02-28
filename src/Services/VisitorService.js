const API_BASE_URL = 'https://api.urest.in:8096/api/attendance';

export const fetchVisitor = async (propertyId = 0) => {
    try {
        const response = await fetch(`${API_BASE_URL}/getVisitorDetails?propertyId=${propertyId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching visitor details:', error);
        throw error;
    }
};
