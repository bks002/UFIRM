export const fetchDmrReport = async (propertyId,fromDate,toDate) => {
  const query = new URLSearchParams({
    propertyId,
    fromDate,
    toDate,
  }).toString();

  const response = await fetch(`https://api.urest.in:8096/api/dmrreport?${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch DMR report");
  }

  return await response.json();
};

export const fetchAttendanceReport = async ({
  propertyId,
  fromDate,
  toDate,
  status,
  employeeName,
}) => {
  const params = new URLSearchParams();

  params.append("propertyId", propertyId);
  params.append("fromDate", fromDate);
  params.append("toDate", toDate);

  if (status) params.append("status", status);
  if (employeeName) params.append("employeeName", employeeName);

  const response = await fetch(
    `https://api.urest.in:8096/api/attendance-report?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch attendance report");
  }

  return await response.json();
};
