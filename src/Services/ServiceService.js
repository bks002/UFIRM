// src/Services/ServiceService.js

const SERVICE_API = "https://api.urest.in:8096/api/service";

// ----------------------------------------------------------
// GET ALL SERVICES
// ----------------------------------------------------------
export async function getAllServices() {
  try {
    const response = await fetch(`${SERVICE_API}/getall`, {
      method: "GET",
      headers: { Accept: "application/json" }
    });

    if (!response.ok)
      throw new Error(`Failed to fetch services. Status: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
}

// ----------------------------------------------------------
// CREATE SERVICE
// Body: { serviceName: "Security" }
// ----------------------------------------------------------
export async function createService(model) {
  try {
    const response = await fetch(`${SERVICE_API}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(model)
    });

    if (!response.ok)
      throw new Error(`Failed to create service. Status: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
}

// ----------------------------------------------------------
// UPDATE SERVICE
// ----------------------------------------------------------
export async function updateService(serviceId, model) {
  try {
    const response = await fetch(`${SERVICE_API}/update/${serviceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(model)
    });

    if (!response.ok)
      throw new Error(`Failed to update service. Status: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
}

// ----------------------------------------------------------
// DELETE SERVICE
// ----------------------------------------------------------
export async function deleteService(serviceId) {
  try {
    const response = await fetch(`${SERVICE_API}/delete/${serviceId}`, {
      method: "DELETE",
      headers: { Accept: "application/json" }
    });

    if (!response.ok)
      throw new Error(`Failed to delete service. Status: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
}
