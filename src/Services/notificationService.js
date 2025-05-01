// services/notificationService.js

//const BASE_URL = "https://api.urest.in:8096/api/notification";
const BASE_URL = "http://localhost:62929/api/notification";

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
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${type} notifications:`, error);
        return [];
    }
};
