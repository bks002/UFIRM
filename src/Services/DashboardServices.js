
const BASE_URL = "https://api.urest.in:8096";
//const BASE_URL = "http://localhost:62929";

export const fetchSubCatTaskCounts = async (propertyId, fromDate, toDate) => {
    const url = `${BASE_URL}/GetAllTaskStatusBySubCat?propId=${propertyId}&dateFrom=${fromDate}&dateTo=${toDate}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch subcategory task counts. Status: ${response.status}`);
            return {};
        }
        return await response.json();  // Returns the dictionary as-is
    } catch (error) {
        console.error(`Error fetching subcategory task counts:`, error);
        return {};
    }
};
