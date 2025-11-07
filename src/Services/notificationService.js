// services/notificationService.js

const BASE_URL = "https://api.urest.in:8096/api/notification";
// const BASE_URL = "http://localhost:62929/api/notification";

const endpoints = {
    task: "FMTaskNotification",
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
        return [];
    }
};

// 🔹 NEW: Fetch Asset Service Notifications
export const fetchAssetServiceNotifications = async (propertyId) => {
  const url = `https://api.urest.in:8096/api/Asset/GetServiceNotifications/${propertyId}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Asset Service Notifications error:`, response.status, response.statusText);
      return [];
    }

    const data = await response.json();

    // ✅ Case 1: API returns object { Upcoming: [...], Overdue: [...] }
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const merged = [
        ...(data.Upcoming || []),
        ...(data.Overdue || []),
      ];
      return merged;
    }

    // ✅ Case 2: API already returns an array
    if (Array.isArray(data)) {
      return data;
    }

    console.warn("Unknown data format for Asset Service Notifications:", data);
    return [];
  } catch (error) {
    console.error(`Error fetching Asset Service Notifications:`, error);
    return [];
  }
};