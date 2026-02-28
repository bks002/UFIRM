import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getTaskDailySummary, getTaskDetails } from "../../Services/SpotVisitCalendar";
import { Dialog } from "primereact/dialog";

export default function SpotVisitCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [taskSummaryData, setTaskSummaryData] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogData, setDialogData] = useState({}); // { FacilityMemberName: { taskId: [details] } }
  const propertyId = useSelector((state) => state.Commonreducer.puidn);

  useEffect(() => {
    if (!propertyId) return;

    const fetchTaskSummary = async () => {
      try {
        const data = await getTaskDailySummary(propertyId);
        setTaskSummaryData(data);
      } catch (error) {
        console.error("Error fetching task summary data:", error);
      }
    };

    fetchTaskSummary();
  }, [propertyId]);

  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    for (let i = 1; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Group task data by date string (YYYY-MM-DD)
  const taskDataByDate = taskSummaryData.reduce((acc, item) => {
    const dateKey = item.TaskDate.slice(0, 10);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {});

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value, 10);
    setCurrentDate(new Date(currentDate.getFullYear(), newMonth, 1));
  };

  // On clicking a day box, fetch detailed task questionnaire info for each member's tasks and open dialog
  const handleDayClick = async (dayNumber) => {
    if (!dayNumber) return;

    const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
    const taskEntries = taskDataByDate[dateKey] || [];

    // Prepare a nested map: FacilityMemberName -> TaskId -> details array
    const detailsByMemberAndTaskId = {};

    try {
      for (const entry of taskEntries) {
        const details = await getTaskDetails(entry.TaskId, dateKey, entry.FacilityMemberId);

        if (!detailsByMemberAndTaskId[entry.FacilityMemberName]) {
          detailsByMemberAndTaskId[entry.FacilityMemberName] = {};
        }
        if (!detailsByMemberAndTaskId[entry.FacilityMemberName][entry.TaskId]) {
          detailsByMemberAndTaskId[entry.FacilityMemberName][entry.TaskId] = [];
        }

        const detailsWithTaskName = details.map(item => ({
          TaskName: entry.TaskName || entry.TaskName,
          ...item,
        }));

        detailsByMemberAndTaskId[entry.FacilityMemberName][entry.TaskId].push(...detailsWithTaskName);
      }

      setDialogData(detailsByMemberAndTaskId);
      setDialogVisible(true);
    } catch (error) {
      console.error("Error fetching task details:", error);
    }
  };

  const dialogFooter = (
    <button className="btn btn-secondary" onClick={() => setDialogVisible(false)}>
      Close
    </button>
  );

  return (
    <div className="content-wrapper" style={{ minHeight: "100vh" }}>
      <div className="card" style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div className="card-header d-flex justify-content-center align-items-center p-3 mb-0 pb-0">
          <div className="d-flex align-items-center">
            <select
              className="form-select me-2"
              style={{ width: 160, display: "inline-block" }}
              value={currentDate.getMonth()}
              onChange={handleMonthChange}
            >
              {monthNames.map((name, idx) => (
                <option value={idx} key={name}>
                  {name}
                </option>
              ))}
            </select>
            <span style={{ fontSize: "1.3rem", fontWeight: 500 }}>
              {currentDate.getFullYear()}
            </span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="card-body p-0 mt-0 pt-0">
          <div className="table-responsive">
            <table className="table table-bordered mb-0">
              <thead className="table-light">
                <tr>
                  {dayNames.map((day, idx) => (
                    <th
                      key={day}
                      className={`text-center py-3 ${idx === 6 ? "bg-light text-secondary" : ""}`}
                      style={{ width: "14.28%" }}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from(
                  { length: Math.ceil(calendarDays.length / 7) },
                  (_, weekIndex) => (
                    <tr key={weekIndex}>
                      {Array.from({ length: 7 }, (_, dayIndex) => {
                        const dayNumber = calendarDays[weekIndex * 7 + dayIndex];
                        const dateKey = dayNumber
                          ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`
                          : null;
                        const taskEntries = dateKey ? taskDataByDate[dateKey] || [] : [];

                        return (
                          <td
                            key={dayIndex}
                            className={`text-center align-top ${dayNumber ? "cursor-pointer" : ""}`}
                            style={{
                              height: "140px",
                              verticalAlign: "top",
                              background: "#fff",
                              color: "#22223b",
                              fontWeight: 500,
                              fontSize: "0.9rem",
                              padding: 4,
                            }}
                            onClick={() => handleDayClick(dayNumber)}
                          >
                            {dayNumber && (
                              <div>
                                <div style={{
                                  fontWeight: "bold",
                                  fontSize: '1.1rem',
                                  marginBottom: 4
                                }}>
                                  {dayNumber}
                                </div>
                                {taskEntries.length > 0 && (
                                  <div
                                    style={{
                                      margin: 0,
                                      fontSize: '0.81rem',
                                      textAlign: 'left',
                                      maxHeight: '100px',
                                      overflowY: "auto",
                                    }}
                                  >
                                    {taskEntries.map((entry, idx) => (
                                      <div
                                        key={idx}
                                        style={{
                                          boxShadow: "0 1px 3px rgba(60,60,60,0.08)",
                                          border: "1px solid #e4e4e4",
                                          borderRadius: 4,
                                          marginBottom: 3,
                                          padding: "3px 6px",
                                          background: "#f7f7fe",
                                          wordBreak: "break-word",
                                        }}
                                      >
                                        <div style={{ fontWeight: 600, fontSize: "0.8rem", lineHeight: "1.2" }}>
                                          Member: <span style={{ fontWeight: 400 }}>{entry.FacilityMemberName}</span>
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: "0.8rem", lineHeight: "1.2" }}>
                                          Property: <span style={{ fontWeight: 400 }}>{entry.PropertyName}</span>
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: "0.8rem", lineHeight: "1.2" }}>
                                          Tasks: <span style={{ fontWeight: 400 }}>{entry.TaskCount}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dialog for showing detailed tasks grouped by Facility Member Name and TaskId */}
      <Dialog
        header="Task Details"
        visible={dialogVisible}
        style={{ width: '70vw', maxHeight: '80vh' }}
        modal
        onHide={() => setDialogVisible(false)}
        draggable={false}
        resizable={false}
        blockScroll
      >
        <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {Object.entries(dialogData).length === 0 && (
            <p>No task details available.</p>
          )}
          {Object.entries(dialogData).map(([memberName, tasksById], memberIdx) => (
            <div key={memberIdx} style={{ marginBottom: 30 }}>
              <h5 style={{ borderBottom: '1px solid #ccc', paddingBottom: 6, marginBottom: 12 }}>
                Facility Member Name: {memberName}
              </h5>
              {Object.entries(tasksById).map(([taskId, details], taskIdx) => (
                <div key={taskIdx} style={{ marginBottom: 24 }}>
                  <h6 style={{ fontWeight: '600', marginBottom: 8 }}>Task ID: {taskId}</h6>
                  <table className="table table-striped table-bordered" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>TaskName</th>
                        <th>QuestionName</th>
                        <th>Remarks</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.map((detail, detailIdx) => (
                        <tr key={detailIdx}>
                          <td>{detail.TaskName}</td>
                          <td>{detail.QuestionName}</td>
                          <td>{detail.Remarks || '-'}</td>
                          <td>{detail.Action || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Dialog>
    </div>
  );
}
