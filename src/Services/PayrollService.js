// src/Services/PayrollService.js
import axios from "axios";

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

export async function addLoanAdvance(loanAdvanceData) {
  try {
    const response = await fetch(
      `${SALARY_API_BASE_URL}/addLoanAdvance`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: false,
        body: JSON.stringify(loanAdvanceData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to save loan advance", error);
    throw error;
  }
}


// Create a new loan for an employee
export async function createEmployeeLoan(requestData) {
  const url = "https://api.urest.in:8096/api/loan/create";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(requestData)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // returns {} on success
    return await response.json();
  } catch (error) {
    console.error("Failed to create loan:", error);
    throw error;
  }
}


// Get loan details for a specific employee
export async function getEmployeeLoan(employeeId) {
  const url = `https://api.urest.in:8096/api/loan/get/${employeeId}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch loan by employee:", error);
    throw error;
  }
}


//Generate Salary API Calls
const EMPLOYEE_API_BASE_URL = "https://api.urest.in:8096/api/employee";

export const getEmployeesByOffice = async (officeId) => {
  try {
    const response = await axios.get(`${EMPLOYEE_API_BASE_URL}/getByOffice/${officeId}`, { withCredentials: false });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch employees by officeId", error);
    throw error;
  }
};


// Location API Calls
export async function getCountries() {
  const response = await fetch("https://api.urest.in:8096/api/location/countries", {
    headers: { Accept: "application/json" }
  });
  if (!response.ok) throw new Error("Failed to fetch countries");
  return response.json();
}

export async function getStatesByCountry(countryId) {
  const response = await fetch(`https://api.urest.in:8096/api/location/states/${countryId}`, {
    headers: { Accept: "application/json" }
  });
  if (!response.ok) throw new Error("Failed to fetch states");
  return response.json();
}


// Fetch PFT and LWF data
export async function getPftList() {
  const response = await fetch("https://api.urest.in:8096/api/master/pft", {
    headers: { Accept: "application/json" }
  });
  if (!response.ok) throw new Error("Failed to fetch PFT data");
  return response.json();
}

export async function getLwfList() {
  const response = await fetch("https://api.urest.in:8096/api/master/lwf", {
    headers: { Accept: "application/json" }
  });
  if (!response.ok) throw new Error("Failed to fetch LWF data");
  return response.json();
}

// Delete API
export async function deletePft(id) {
  const response = await fetch(`https://api.urest.in:8096/api/master/pft/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete PFT");
  return response.json();
}

export async function deleteLwf(id) {
  const response = await fetch(`https://api.urest.in:8096/api/master/lwf/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete LWF");
  return response.json();
}

// Create API
export async function addPft(pft) {
  const response = await fetch("https://api.urest.in:8096/api/master/pft/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pft),
  });
  if (!response.ok) throw new Error("Failed to add PFT");
  return response.json();
}

export async function addLwf(lwf) {
  const response = await fetch("https://api.urest.in:8096/api/master/lwf/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lwf),
  });
  if (!response.ok) throw new Error("Failed to add LWF");
  return response.json();
}

// Update API
export async function updatePft(id, pft) {
  const response = await fetch(`https://api.urest.in:8096/api/master/pft/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pft),
  });
  if (!response.ok) throw new Error("Failed to update PFT");
  return response.json();
}

export async function updateLwf(id, lwf) {
  const response = await fetch(`https://api.urest.in:8096/api/master/lwf/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lwf),
  });
  if (!response.ok) throw new Error("Failed to update LWF");
  return response.json();
}


// Get employee generated salaries for a given office ID
export async function getEmployeeGeneratedSalaryByOffice(officeId) {
  const response = await fetch(`https://api.urest.in:8096/api/employee/generatedSalary/${officeId}`, {
    method: "GET",
    headers: { "Accept": "application/json" }
  });
  if (!response.ok) throw new Error("Failed to fetch generated salaries");
  return await response.json();
}

// Add a new employee generated salary entry
export async function addEmployeeGeneratedSalary(data) {
  const response = await fetch(`https://api.urest.in:8096/api/employee/generatedSalary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Failed to add generated salary");
  return await response.json();
}

