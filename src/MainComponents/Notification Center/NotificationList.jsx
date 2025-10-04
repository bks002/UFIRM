import React, { useState, useEffect } from "react";
import FMResponseModal from "./FMResponseModal";
import "./Notification.css";

const NotificationList = ({ nList, apiCall }) => {
  const [selectedNotification, setSelectedNotification] = useState(null);

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
  };

  const handleCloseModal = () => {
    setSelectedNotification(null);
  };

  const handleReply = (message, currentStatus) => {
    if (message.trim() === "") {
      alert("Message cannot be empty!");
      return;
    }

    let newResponse = {};

   if (selectedNotification && selectedNotification.TaskId) {

      // Complaint notification (FM Task)
      newResponse = {
        TaskId: selectedNotification.TaskId,
        QuestionId: selectedNotification.QuestionId,
        TaskName: selectedNotification.TaskName,
        FmId: 0,
        FmRemark: message,
        FmDateTime: new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
        CurrentStatus: currentStatus,
        SUPdateTime: selectedNotification.SUPdateTime,
        TaskDate: selectedNotification.TaskDate,
      };
    } else if (selectedNotification && selectedNotification.TicketId) {
      // Ticket notification
      newResponse = {
        NotificationId: selectedNotification.NotificationId,
        TicketId: selectedNotification.TicketId,
        TicketNumber: selectedNotification.TicketNumber,
        Title: selectedNotification.Title,
        Description: selectedNotification.Description,
        Priority: selectedNotification.Priority,
        TicketType: selectedNotification.TicketType,
        CurrentStatus: currentStatus,
        FmRemark: message,
        FmDateTime: new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
      };
    }

    handleSendReply(newResponse);
    handleCloseModal();
  };

  const handleSendReply = async (newResponse) => {
    let apiUrl = "";

    if (newResponse.TaskId) {
      apiUrl = "https://api.urest.in:8096/FMResponse"; // complaints endpoint
    } else if (newResponse.TicketId) {
      apiUrl = "https://api.urest.in:8096/TicketResponse"; // tickets endpoint
    }

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newResponse),
      });

      if (res.ok) {
        apiCall();
      } else {
        throw new Error("Failed to send reply");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  if (!Array.isArray(nList) || nList.length === 0) {
    return <div>No notifications available.</div>;
  }

  return (
    <div className="notification-list-container">
      {nList.map((notification) => (
        <div
          key={
            notification.TaskId
              ? notification.TaskId + notification.QuestionId
              : notification.NotificationId
          }
          className="notification-item-card"
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="notification-item-content">
            {notification.TaskId ? (
              // Complaint notification display
              <span>
                Complaint: {notification.TaskName} – {notification.SupName}:{" "}
                {notification.SupRemark}
              </span>
            ) : (
              // Ticket notification display
              <span>
                <b>{notification.TicketNumber}</b> ({notification.Status}) –{" "}
                {notification.SupName}: {notification.SupRemark}
              </span>
            )}
          </div>
        </div>
      ))}

      {selectedNotification && (
        <FMResponseModal
          notification={selectedNotification}
          onClose={handleCloseModal}
          onReply={handleReply}
        />
      )}
    </div>
  );
};

export default NotificationList;