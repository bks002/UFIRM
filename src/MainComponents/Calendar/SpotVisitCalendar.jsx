import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { useSelector } from "react-redux";
import { getTaskDailySummary, getTaskDetails } from "../../Services/SpotVisitCalendar";

export default function SpotVisitCalendar() {
  const propertyId = useSelector((s) => s.Commonreducer.puidn);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [summaryByDate, setSummaryByDate] = useState({});
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogData, setDialogData] = useState({
    detailsByMemberAndTaskId: {},
  });
  const [expandedCell, setExpandedCell] = useState(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const dayHeaders = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  const MAX_VISIBLE_CARDS = 2;

  useEffect(() => {
    if (!propertyId) return;

    const fetchSummary = async () => {
      try {
        const data = await getTaskDailySummary(propertyId);
        const grouped = {};

        (data || []).forEach((item) => {
          const dateKey = (item.TaskDate || "").slice(0, 10);
          if (!dateKey) return;
          if (!grouped[dateKey]) grouped[dateKey] = {};

          const memberKey = String(item.FacilityMemberId || item.FacilityMemberName || "0");
          if (!grouped[dateKey][memberKey]) {
            grouped[dateKey][memberKey] = {
              ...item,
              TaskCount: 0,
              TaskIds: [],
              TaskNameById: {},
            };
          }

          grouped[dateKey][memberKey].TaskCount += Number(item.TaskCount || 0);
          if (item.TaskId) {
            grouped[dateKey][memberKey].TaskIds.push(item.TaskId);
            if (item.TaskName) {
              grouped[dateKey][memberKey].TaskNameById[String(item.TaskId)] = item.TaskName;
            }
          }
          if (item.TaskIds) {
            const splitIds = String(item.TaskIds)
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean);
            grouped[dateKey][memberKey].TaskIds.push(...splitIds);
          }
        });

        const normalized = {};
        Object.keys(grouped).forEach((dateKey) => {
          normalized[dateKey] = Object.values(grouped[dateKey]).map((member) => ({
            ...member,
            TaskIds: [...new Set(member.TaskIds.map(String))],
          }));
        });

        setSummaryByDate(normalized);
      } catch (error) {
        console.error("Error fetching task summary data:", error);
      }
    };

    fetchSummary();
  }, [propertyId, currentDate]);

  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const days = [];

    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, currentMonth: false });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, currentMonth: true });
    }

    const remainder = days.length % 7;
    if (remainder !== 0) {
      const needed = 7 - remainder;
      for (let i = 1; i <= needed; i++) {
        days.push({ day: i, currentMonth: false });
      }
    }

    return days;
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleMemberClick = async (_, dateKey) => {
    const membersOnDate = summaryByDate[dateKey] || [];
    const detailsByMemberAndTaskId = {};
    try {
      for (const member of membersOnDate) {
        const memberName = member.FacilityMemberName || "Unknown";
        const taskIds = (member.TaskIds || [])
          .map((id) => String(id).trim())
          .filter(Boolean);

        if (!detailsByMemberAndTaskId[memberName]) {
          detailsByMemberAndTaskId[memberName] = {};
        }

        for (const taskId of taskIds) {
          const details = await getTaskDetails(taskId, dateKey, member.FacilityMemberId);
          if (!detailsByMemberAndTaskId[memberName][taskId]) {
            detailsByMemberAndTaskId[memberName][taskId] = [];
          }

          const detailsWithTaskName = (details || []).map((d) => ({
            TaskName: d.TaskName || member.TaskNameById?.[String(taskId)] || "Task",
            ...d,
          }));

          detailsByMemberAndTaskId[memberName][taskId].push(...detailsWithTaskName);
        }
      }

      setDialogData({
        detailsByMemberAndTaskId,
      });
      setDialogVisible(true);
    } catch (error) {
      console.error("Error fetching task details:", error);
    }
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="content-wrapper">
      <div className="ppm-calendar-container">
        <div className="ppm-header">
          <h2 className="ppm-header-title">Spot Visit Calendar</h2>
          <div className="ppm-view-toggle">
            <button className="ppm-view-toggle-btn active">Month</button>
            <button className="ppm-view-toggle-btn" disabled>Week</button>
          </div>
        </div>

        <div className="ppm-nav-bar">
          <button className="ppm-nav-btn" onClick={goToPrevMonth}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className="ppm-nav-label">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button className="ppm-nav-btn" onClick={goToNextMonth}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <div className="ppm-calendar-card">
          <div className="ppm-calendar-grid">
            {dayHeaders.map((d) => (
              <div key={d} className="ppm-day-header">{d}</div>
            ))}

            {calendarDays.map((cell, idx) => {
              const dateKey = cell.currentMonth
                ? `${currentDate.getFullYear()}-${String(
                    currentDate.getMonth() + 1
                  ).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`
                : null;

              const members = dateKey ? summaryByDate[dateKey] : null;
              const visibleMembers = members ? members.slice(0, MAX_VISIBLE_CARDS) : [];
              const hiddenCount = members ? Math.max(0, members.length - MAX_VISIBLE_CARDS) : 0;

              return (
                <div
                  key={idx}
                  className={`ppm-day-cell${!cell.currentMonth ? " ppm-other-month" : ""}`}
                >
                  <div className="ppm-day-number">
                    <span className={cell.currentMonth && isToday(cell.day) ? "ppm-today" : ""}>
                      {cell.day}
                    </span>
                  </div>

                  {cell.currentMonth && members && (
                    <div className="ppm-tasks-container">
                      {visibleMembers.map((m, i) => (
                        <div
                          key={i}
                          className="ppm-task-card"
                          onClick={() => handleMemberClick(m, dateKey)}
                        >
                          <span className="ppm-task-card-dot"></span>
                          <span className="ppm-task-card-name">
                            <span>Member: {m.FacilityMemberName}</span>
                            <br />
                            <span className="ppm-task-card-property">Property: {m.PropertyName || "-"}</span>
                          </span>
                          <span className="ppm-task-card-count">{m.TaskCount}</span>
                        </div>
                      ))}

                      {hiddenCount > 0 && (
                        <button
                          className="ppm-more-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCell(expandedCell === idx ? null : idx);
                          }}
                        >
                          +{hiddenCount} more
                        </button>
                      )}
                    </div>
                  )}

                  {expandedCell === idx && members && (
                    <>
                      <div
                        className="ppm-popover-backdrop"
                        onClick={() => setExpandedCell(null)}
                      />
                      <div className="ppm-popover">
                        {members.map((m, i) => (
                          <div
                            key={i}
                            className="ppm-task-card"
                            onClick={() => {
                              setExpandedCell(null);
                              handleMemberClick(m, dateKey);
                            }}
                          >
                            <span className="ppm-task-card-dot"></span>
                            <span className="ppm-task-card-name">
                              <span>Member: {m.FacilityMemberName}</span>
                              <br />
                              <span className="ppm-task-card-property">Property: {m.PropertyName || "-"}</span>
                            </span>
                            <span className="ppm-task-card-count">{m.TaskCount}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog
        header="Task Details"
        visible={dialogVisible}
        className="ppm-dialog"
        style={{ width: "75vw" }}
        modal
        onHide={() => setDialogVisible(false)}
      >
        {Object.keys(dialogData.detailsByMemberAndTaskId || {}).length === 0 ? (
          <p>No task details available.</p>
        ) : (
          Object.entries(dialogData.detailsByMemberAndTaskId).map(([memberName, tasksById], memberIdx) => (
            <div key={memberIdx} className="ppm-dialog-task-section">
              <h5 className="ppm-dialog-member-name">Facility Member Name: {memberName}</h5>
              {Object.entries(tasksById).map(([taskId, rows], taskIdx) => (
                <div key={taskIdx} style={{ marginBottom: 18 }}>
                  <h6 className="ppm-dialog-task-title">Task ID: {taskId}</h6>
                  <table className="ppm-detail-table">
                    <thead>
                      <tr>
                        <th>TaskName</th>
                        <th>QuestionName</th>
                        <th>Remarks</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i}>
                          <td>{r.TaskName || "-"}</td>
                          <td>{r.QuestionName || r.Question || "-"}</td>
                          <td>{r.Remarks || r.Remark || "-"}</td>
                          <td>{r.Action || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ))
        )}
      </Dialog>
    </div>
  );
}
