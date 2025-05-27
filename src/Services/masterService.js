//const API_URL = 'http://localhost:62929/';
 const API_URL = 'https://api.urest.in:8096/';

export const getFrequencyList = async () => {
    try {
        const response = await fetch(`${API_URL}api/master/getAllFrequency`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json' // Ensures correct response format
            }
        });

        if (!response.ok) {
            // More detailed error message
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${response.statusText}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error('Invalid response format: Expected an array');
        }

        return data;
    } catch (error) {
        console.error('Error fetching frequency list:', error.message);
        return []; // Return an empty array to avoid breaking the UI
    }
};
