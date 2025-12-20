export const getAllDesignations = async () => {
  const response = await fetch(
    "https://api.urest.in:8096/api/designations/GetAllDesignations"
  );

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return await response.json();
};
