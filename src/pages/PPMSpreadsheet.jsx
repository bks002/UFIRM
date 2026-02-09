import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { useSelector } from "react-redux";
import { getTaskSummary, getTaskDetails } from "../Services/PPMSpreadsheet";

export default function PPMCalendar() {
  const propertyId = useSelector((s) => s.Commonreducer.puidn);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [summaryByDate, setSummaryByDate] = useState({});
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogData, setDialogData] = useState({
    memberName: "",
    tasksByName: {},
  });
  const [expandedCell, setExpandedCell] = useState(null);

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const dayHeaders = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

  const MAX_VISIBLE_CARDS = 2;

  /* ================= FETCH SUMMARY ================= */

  useEffect(() => {
    if (!propertyId) return;

    const fetchSummary = async () => {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const data = await getTaskSummary(propertyId, month, year);

      const grouped = {};
      data.forEach((item) => {
        const dateKey = item.TaskDate.slice(0, 10);
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(item);
      });

      setSummaryByDate(grouped);
    };

    fetchSummary();
  }, [propertyId, currentDate]);

  /* ================= HELPERS ================= */

  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate); // 0=Sun, 1=Mon...

    // Convert to Monday-start: Mon=0, Tue=1, ..., Sun=6
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, currentMonth: false });
    }

    // Current month
    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, currentMonth: true });
    }

    // Next month padding (fill to complete the last row)
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

  /* ================= MEMBER CLICK ================= */

  const handleMemberClick = async (member, dateKey) => {
    const taskIds = member.TaskIds.split(",");
    const taskMap = {};

    for (const taskId of taskIds) {
      const details = await getTaskDetails(
        taskId,
        dateKey,
        member.FacilityMemberId
      );

      details.forEach((d) => {
        if (!taskMap[d.TaskName]) {
          taskMap[d.TaskName] = [];
        }
        taskMap[d.TaskName].push(d);
      });
    }

    setDialogData({
      memberName: member.FacilityMemberName,
      tasksByName: taskMap,
    });

    setDialogVisible(true);
  };

  const getStatusColor = (status) => {
    if (!status) return "";
    if (status.toLowerCase() === "pending") return "ppm-status-pending";
    if (status.toLowerCase() === "completed") return "ppm-status-completed";
    return "ppm-status-other";
  };

  const calendarDays = generateCalendarDays();

  /* ================= UI ================= */

  return (
    <div className="content-wrapper">
      <div className="ppm-calendar-container">

        {/* ===== HEADER: Title + View Toggle ===== */}
        <div className="ppm-header">
          <h2 className="ppm-header-title">PPM Calendar</h2>
          <div className="ppm-view-toggle">
            <button className="ppm-view-toggle-btn active">Month</button>
            <button className="ppm-view-toggle-btn" disabled>Week</button>
          </div>
        </div>

        {/* ===== MONTH NAVIGATION ===== */}
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

        {/* ===== CALENDAR CARD ===== */}
        <div className="ppm-calendar-card">
          <div className="ppm-calendar-grid">

            {/* Day-of-Week Headers */}
            {dayHeaders.map((d) => (
              <div key={d} className="ppm-day-header">{d}</div>
            ))}

            {/* Day Cells */}
            {calendarDays.map((cell, idx) => {
              const dateKey = cell.currentMonth
                ? `${currentDate.getFullYear()}-${String(
                    currentDate.getMonth() + 1
                  ).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`
                : null;

              const members = dateKey ? summaryByDate[dateKey] : null;
              const visibleMembers = members
                ? members.slice(0, MAX_VISIBLE_CARDS)
                : [];
              const hiddenCount = members
                ? Math.max(0, members.length - MAX_VISIBLE_CARDS)
                : 0;

              return (
                <div
                  key={idx}
                  className={`ppm-day-cell${
                    !cell.currentMonth ? " ppm-other-month" : ""
                  }`}
                >
                  {/* Day Number */}
                  <div className="ppm-day-number">
                    <span
                      className={
                        cell.currentMonth && isToday(cell.day) ? "ppm-today" : ""
                      }
                    >
                      {cell.day}
                    </span>
                  </div>

                  {/* Task Cards */}
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
                            {m.FacilityMemberName}
                          </span>
                          <span className="ppm-task-card-count">
                            {m.TaskCount}
                          </span>
                        </div>
                      ))}

                      {hiddenCount > 0 && (
                        <button
                          className="ppm-more-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCell(
                              expandedCell === idx ? null : idx
                            );
                          }}
                        >
                          +{hiddenCount} more
                        </button>
                      )}
                    </div>
                  )}

                  {/* Overflow Popover */}
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
                              {m.FacilityMemberName}
                            </span>
                            <span className="ppm-task-card-count">
                              {m.TaskCount}
                            </span>
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

      {/* ===== TASK DETAILS DIALOG ===== */}
      <Dialog
        header="Task Details"
        visible={dialogVisible}
        className="ppm-dialog"
        style={{ width: "75vw" }}
        modal
        onHide={() => setDialogVisible(false)}
      >
        <h5 className="ppm-dialog-member-name">
          Facility Member: {dialogData.memberName}
        </h5>

        {Object.entries(dialogData.tasksByName).map(
          ([taskName, rows], idx) => (
            <div key={idx} className="ppm-dialog-task-section">
              <h6 className="ppm-dialog-task-title">Task: {taskName}</h6>

              <table className="ppm-detail-table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Remarks</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td>{r.QuestionName}</td>
                      <td>{r.Remarks || "-"}</td>
                      <td className={getStatusColor(r.Action)}>
                        {r.Action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </Dialog>
    </div>
  );
}
