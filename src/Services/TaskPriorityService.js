// Services/TaskPriorityService.js
const API_BASE_URL = "https://api.urest.in:8096";

export const getTaskPriorityCountDash = async (propId, categoryId, subCategoryId, occurance, status, priorityId, dateFrom, dateTo) => {
    try {
        let url = `${API_BASE_URL}/GetTaskPriorityCountDash?propId=${propId}`;

        if (categoryId) url += `&categoryId=${categoryId}`;
        if (subCategoryId) url += `&subCategoryId=${subCategoryId}`;
        if (occurance) url += `&occurance=${encodeURIComponent(occurance)}`;
        if (status) url += `&status=${encodeURIComponent(status)}`;
        if (priorityId) url += `&priorityId=${priorityId}`;
        if (dateFrom) url += `&dateFrom=${encodeURIComponent(dateFrom)}`;
        if (dateTo) url += `&dateTo=${encodeURIComponent(dateTo)}`;
        

        const resp = await fetch(url, {
            method: "GET",
            headers: { Accept: "application/json" },
        });

        if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
        }

        return await resp.json();
    } catch (error) {
        console.error("Error fetching task priority count:", error);
        return [];
    }
};
