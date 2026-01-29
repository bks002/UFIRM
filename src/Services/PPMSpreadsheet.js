const BASE_URL = "https://api.urest.in:8096/api/tasks";

export const getTaskSummary = async (propertyId, month, year) => {
  const res = await fetch(
    `${BASE_URL}/Tasksummary?propertyId=${propertyId}&month=${month}&year=${year}`
  );
  return res.json();
};

export const getTaskDetails = async (taskId, taskDate, assignTo) => {
  const res = await fetch(
    `${BASE_URL}/Taskdetails?taskId=${taskId}&taskDate=${taskDate}&assignTo=${assignTo}`
  );
  return res.json();
};
