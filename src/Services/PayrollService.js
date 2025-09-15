// src/Services/PayrollService.js

const API_BASE_URL = "https://api.urest.in:8096/api/allowancedeductions";

export async function getAllowanceDeductionsByProperty(propertyId) {
  try {
    const response = await fetch(`${API_BASE_URL}/byProperty/${propertyId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching allowance deductions:", error);
    throw error;
  }
}

export async function createAllowanceDeduction(model) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(model),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error creating allowance deduction:", error);
    throw error;
  }
}

export async function updateAllowanceDeduction(id, model) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(model),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error updating allowance deduction:", error);
    throw error;
  }
}

export async function deleteAllowanceDeduction(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error deleting allowance deduction:", error);
    throw error;
  }
}

const SALARY_API_BASE_URL = "https://api.urest.in:8096/api/salaryallowances";

export async function getSalaryAllowancesByProperty(propertyId) {
  try {
    const response = await fetch(
      `${SALARY_API_BASE_URL}/byProperty/${propertyId}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching salary allowances:", error);
    throw error;
  }
}

export async function deleteSalaryAllowance(salaryGroupId) {
  try {
    const response = await fetch(`${SALARY_API_BASE_URL}/${salaryGroupId}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error deleting salary allowance:", error);
    throw error;
  }
}

export async function updateSalaryAllowance(salaryGroupId, model) {
  try {
    const response = await fetch(`${SALARY_API_BASE_URL}/${salaryGroupId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(model),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error updating salary allowance:", error);
    throw error;
  }
}

export async function createSalaryAllowance(model) {
  try {
    const response = await fetch(SALARY_API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(model),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error creating salary allowance:", error);
    throw error;
  }
}

/**
 * Get salary allowances by facility member ID
 * @param {number} facilityMemberId - The facility member ID
 * @returns {Promise<Object>} - Salary allowance data for the facility member
 */
export async function getSalaryAllowancesByFacilityMember(facilityMemberId) {
  try {
    const response = await fetch(
      `${SALARY_API_BASE_URL}/byFacilityMember/${facilityMemberId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      "Failed to fetch salary allowances by facility member",
      error
    );
    throw error;
  }
}

export async function deleteSalaryGroupFromFacilityMember(
  facilityMemberId,
  salaryGroupId
) {
  try {
    const url = `https://api.urest.in:8096/api/salaryallowances/removeSalaryGroup/${facilityMemberId}/${salaryGroupId}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error deleting salary group from facility member:", error);
    throw error;
  }
}

export async function assignSalaryGroupToFacilityMember(model) {
  try {
    const response = await fetch(
      "https://api.urest.in:8096/api/salaryallowances/assignSalaryGroup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(model),
      }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error assigning salary group to facility member:", error);
    throw error;
  }
}
