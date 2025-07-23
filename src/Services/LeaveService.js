const BASE_URL = "https://api.urest.in:8096";


export const fetchAllLeaveRequests = async (propertyId) => {
    if (!propertyId) {
        console.error("Property ID is required to fetch leave requests.");
        return [];
    }

    const url = `${BASE_URL}/api/attendance/getAllLeaves?propertyId=${propertyId}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Failed to fetch leave requests. Status: ${response.status}`);
            return [];
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching leave requests:", error);
        return [];
    }
};

export const updateAllLeaveRequests = async (updateAllLeaveRequests) => {
    try {
        const response = await fetch(`${BASE_URL}/api/attendance/updateLeaves`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateAllLeaveRequests),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating leave:', error);
        throw error;
    }
}


