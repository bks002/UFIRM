import React, { useState, useEffect } from 'react';
import FMResponseModal from './FMResponseModal';
import './Notification.css';

const NotificationList = ({ nList, apiCall }) => {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const handleNotificationClick = (notification) => {
     setSelectedNotification(notification);
  };

  const handleCloseModal = () => {
    setSelectedNotification(null);
  };

  const handleReply = (message,currentStatus) => {
    if (message.trim() === '') {
        alert('Message cannot be empty!'); // Alert for empty message
        return;
      }
    const newResponse = {
        TaskId: selectedNotification.TaskId,
        QuestionId: selectedNotification.QuestionId,
        TaskName: selectedNotification.TaskName,
        FmId: 0,
        FmRemark: message,
        FmDateTime: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        CurrentStatus:currentStatus,
        SUPdateTime:selectedNotification.SUPdateTime,
        TaskDate:selectedNotification.TaskDate
    };
    handleSendReply(newResponse);
    handleCloseModal(); 
    };

    const handleSendReply= async(newResponse)=>{
        const apiUrl = 'https://api.urest.in:8096/FMResponse';
        // const apiUrl = 'http://localhost:62929//FMResponse';
          try {
                const res = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newResponse),
            });
            if (res.ok) {
                apiCall();
            } else {
            throw new Error('Failed to send reply');
            }
         } catch (error) {
         console.error('Error sending reply:', error);
        }
    };

  if (!Array.isArray(nList) || nList.length === 0) {
    return <div>No notifications available.</div>;
  }

  return (
    <div className="notification-list-container">
      {nList.map((notification) => (
        <div
          key={notification.TaskId + notification.QuestionId}
          className="notification-item-card"
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="notification-item-content">
            <span>
              {notification.SupName} : {notification.SupRemark}
            </span>
          </div>
        </div>
      ))}

      <FMResponseModal 
        notification={selectedNotification} 
        onClose={handleCloseModal} 
        onReply={handleReply} 
      />
    </div>
  );
};

export default NotificationList;
