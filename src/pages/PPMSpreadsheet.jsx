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

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
    const days = [];
    const firstDay = getFirstDayOfMonth(currentDate);
    const total = getDaysInMonth(currentDate);

    for (let i = 1; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= total; i++) days.push(i);

    return days;
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
    if (status.toLowerCase() === "pending") return "text-danger";
    if (status.toLowerCase() === "completed") return "text-success";
    return "text-warning";
  };

  const calendarDays = generateCalendarDays();

  /* ================= UI ================= */

  return (
    <div className="content-wrapper">
      <div className="card" style={{ maxWidth: 1300, margin: "0 auto" }}>

        {/* ===== HEADER ===== */}
        <div className="card-header d-flex justify-content-center gap-2">
          <select
            className="form-select"
            style={{ width: 160 }}
            value={currentDate.getMonth()}
            onChange={(e) =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), +e.target.value, 1)
              )
            }
          >
            {monthNames.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: 120 }}
            value={currentDate.getFullYear()}
            onChange={(e) =>
              setCurrentDate(
                new Date(+e.target.value, currentDate.getMonth(), 1)
              )
            }
          >
            {Array.from({ length: 8 }, (_, i) => 2024 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* ===== CALENDAR ===== */}
        <div className="card-body p-0">
          <table
            className="table table-bordered mb-0"
            style={{ tableLayout: "fixed", width: "100%" }}
          >
            <thead className="table-light">
              <tr>
                {dayNames.map((d) => (
                  <th key={d} className="text-center">{d}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map(
                (_, w) => (
                  <tr key={w}>
                    {Array.from({ length: 7 }).map((_, d) => {
                      const day = calendarDays[w * 7 + d];
                      const dateKey = day
                        ? `${currentDate.getFullYear()}-${String(
                            currentDate.getMonth() + 1
                          ).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                        : null;

                      const members = dateKey
                        ? summaryByDate[dateKey]
                        : null;

                      return (
                        <td
  key={d}
  style={{
    height: members && members.length > 1 ? 160 : "auto",
    minHeight: 90,                 // 👈 keeps UI neat for 1 item
    verticalAlign: "top",
    padding: 6,
  }}
>

                          {day && (
                            <>
                              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                                {day}
                              </div>

                              {/* 🔥 EXACT 2nd IMAGE STYLE SCROLL */}
                              <div
  style={{
    height: members && members.length > 1 ? 115 : "auto",
    overflowY: members && members.length > 1 ? "auto" : "visible",
    paddingRight: members && members.length > 1 ? 4 : 0,
  }}
>

                                {members?.map((m, i) => (
                                  <div
                                    key={i}
                                    onClick={() =>
                                      handleMemberClick(m, dateKey)
                                    }
                                    style={{
                                      background: "#f7f8fd",
                                      borderRadius: 6,
                                      padding: 8,
                                      marginBottom: 6,
                                      cursor: "pointer",
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    👷 {m.FacilityMemberName}<br />
                                    📝 Tasks: {m.TaskCount}
                                  </div>
                                ))}
                              </div>
                            </>
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

      {/* ===== TASK DETAILS DIALOG ===== */}
      <Dialog
        header="Task Details"
        visible={dialogVisible}
        style={{ width: "75vw" }}
        modal
        onHide={() => setDialogVisible(false)}
      >
        <h5>Facility Member: {dialogData.memberName}</h5>

        {Object.entries(dialogData.tasksByName).map(
          ([taskName, rows], idx) => (
            <div key={idx} style={{ marginBottom: 24 }}>
              <h6>Task Name: {taskName}</h6>

              <table className="table table-bordered table-striped">
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
