const API_BASE_URL = "https://api.urest.in:8096";

export async function getTaskDailySummary(propertyId) {
  try {
    // Append propertyId query param if provided
    const url = new URL(`${API_BASE_URL}/api/tasks/summary`);
    if (propertyId) {
      url.searchParams.append("propertyId", propertyId);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data; // Array of task summary objects
  } catch (error) {
    console.error("Failed to fetch Task Daily Summary:", error);
    throw error;
  }
}

/**
 * Fetch detailed task questionnaire for a given taskId, taskDate, and assignTo (FacilityMemberId)
 * @param {number} taskId - Task ID
 * @param {string} taskDate - Date string in ISO format "YYYY-MM-DD"
 * @param {number} assignTo - Facility Member ID
 * @returns {Promise<Array>} - Array of detail objects with TaskName, QuestionName, Remarks, Action
 */
export async function getTaskDetails(taskId, taskDate, assignTo) {
  try {
    const url = new URL(`${API_BASE_URL}/api/tasks/details`);
    if (taskId) url.searchParams.append("taskId", taskId);
    if (taskDate) url.searchParams.append("taskDate", taskDate);
    if (assignTo) url.searchParams.append("assignTo", assignTo);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data; // Array of task detail objects
  } catch (error) {
    console.error("Failed to fetch Task Details:", error);
    throw error;
  }
}
