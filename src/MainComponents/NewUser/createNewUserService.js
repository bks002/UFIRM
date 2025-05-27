const API_BASE_URL = "https://api.urest.in:8096"; // Define your base API URL here
// const API_BASE_URL = "http://localhost:62929";

// Helper function to make fetch requests
const fetchData = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "GET", // Default to GET method
            headers: {
                "Content-Type": "application/json",
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
};

// Fetch city data
export const fetchCities = async () => {
    return await fetchData("/GetAllCity"); // Replace with your actual API endpoint
};

// Fetch property data
export const fetchProperties = async () => {
    return await fetchData("/GetAllProperties");
};

// Fetch role data
export const fetchRoles = async () => {
    return await fetchData("/GetAllUserRole"); // Replace with your actual API endpoint
};

// Fetch branch data
export const fetchBranches = async () => {
    return await fetchData("/GetAllBranch"); // Replace with your actual API endpoint
};

export const fetchUserTypes = async () => {
    return await fetchData("/GetAllUserTypes"); // Replace with your actual API endpoint
};

// Service function to submit the form data using fetch
export const submitUserForm = async (formDataToSend) => {
    try {console.log(formDataToSend);
        const response = await fetch(`${API_BASE_URL}/CreateNewUser`, {

            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formDataToSend), // Send the FormData object as the body of the request
        });
        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        // Parse and return the response data
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error submitting user form:", error);
        throw error;
    }
};