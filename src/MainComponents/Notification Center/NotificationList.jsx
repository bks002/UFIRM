import React, { useState, useEffect } from 'react';
import FMResponseModal from './FMResponseModal';
import './Notification.css';


const NotificationList = ({ nList, apiCall }) => {
  const [selectedNotification, setSelectedNotification] = useState(null);


  const handleNotificationClick = (notification) => {
    console.log('clicked');
    setSelectedNotification(notification); // Set the selected notification
  };

  const handleCloseModal = () => {

    setSelectedNotification(null); // Reset selected notification
  };

  const handleReply = (message,currentStatus) => {
    console.log(message);
    if (message.trim() === '') {
        alert('Message cannot be empty!'); // Alert for empty message
        return;
      }
    // Create a new response object
    const newResponse = {
        TaskId: selectedNotification.TaskId,
        QuestionId: selectedNotification.QuestionId,
        TaskName: selectedNotification.TaskName,
        FmId: 0, // Assuming FmId starts at 0, adjust as needed
        FmRemark: message,
        FmDateTime: new Date(), 
        CurrentStatus:currentStatus,
        SUPdateTime:selectedNotification.SUPdateTime
    };
    console.log(newResponse)
    // Update the responseData state by appending the new response object
    handleSendReply(newResponse);
    alert('Reply submitted!'); 
    handleCloseModal(); 
    };

    const handleSendReply= async(newResponse)=>{
        console.log(newResponse);
        const apiUrl = 'https://api.urest.in:8096/FMResponse';
          try {
                const res = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newResponse),
            });

            // Check if the request was successful
            if (res.ok) {
                apiCall();
            // Clear the response data
            // setResponseData([]); // Assuming you have a state variable 'responseData'
            alert('Reply sent successfully!');
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
              {notification.TaskId} : {notification.QuestionId} : {notification.SupName} : 
              {notification.TaskName} : {notification.SupRemark} : {notification.SUPdateTime} : 
              {notification.PropertyId}
            </span>
          </div>
        </div>
      ))}

      {/* FMResponseModal component is rendered here */}
      <FMResponseModal 
        notification={selectedNotification} 
        onClose={handleCloseModal} 
        onReply={handleReply} 
      />
    </div>
  );
};

export default NotificationList;
