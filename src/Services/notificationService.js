// services/notificationService.js

const BASE_URL = "https://api.urest.in:8096/api/notification";
//const BASE_URL = "http://localhost:62929/api/notification";

const endpoints = {
    task: "FMTaskNotification",
    asset: "FMAssetNotification",
    complaint: "FMComplaintNotification",
};

export const fetchNotifications = async (type, propertyId) => {
    const endpoint = endpoints[type];
    if (!endpoint) throw new Error("Invalid notification type");

    const url = `${BASE_URL}/${type}?propertyId=${propertyId}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error(`${type} notification error:`, response.status, response.statusText);
            
            // Special handling for asset notifications - they might not be implemented yet
            if (type === 'asset') {
                console.warn('Asset notifications endpoint might not be implemented. Returning empty array.');
                return [];
            }
            
            return [];
        }
        
        const data = await response.json();
        
        // Ensure data is an array
        if (!Array.isArray(data)) {
            console.warn(`${type} notification data is not an array:`, data);
            return [];
        }
        
        return data;
    } catch (error) {
        console.error(`Error fetching ${type} notifications:`, error);
        
        // Special handling for asset notifications
        if (type === 'asset') {
            console.warn('Asset notifications endpoint might not be available. Error:', error.message);
        }
        
        return [];
    }
};
