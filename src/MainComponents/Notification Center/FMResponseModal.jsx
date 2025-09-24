import React from 'react';
import Modal from 'react-bootstrap/Modal';
import ChatBox from './ChatBox'; // Import the renamed component

const FMResponseModal = ({ notification, onClose, onReply }) => {
  const isTaskNotification = notification && notification.TaskId;
  const isAssetNotification = notification && notification.AssetId;
  const isTicketNotification = notification && notification.TicketId;

  return (
    <Modal show={!!notification} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {isTaskNotification ? 'Task Notification' :
            isAssetNotification ? 'Asset Notification' :
              isTicketNotification ? 'Complaint Notification' : 'Notification'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {notification && (
          <div>
            {isTaskNotification ? (
              // Task Notification Content
              <>
                <p><strong>Task ID:</strong> {notification.TaskId}</p>
                <p><strong>Question ID:</strong> {notification.QuestionId}</p>
                <p><strong>Task Name:</strong> {notification.TaskName}</p>
                <p><strong>Property ID:</strong> {notification.PropertyId}</p>

                <ChatBox
                  remark={notification.SupRemark}
                  name={notification.SupName}
                  remarkDateTime={notification.SUPdateTime}
                  status={notification.CurrentStatus}
                  onSend={onReply}
                />
              </>
            ) : isAssetNotification ? (
              // Asset Notification Content
              // Asset Notification Content
              <>
                <p><strong>Asset ID:</strong> {notification.AssetId}</p>
                <p><strong>Asset Name:</strong> {notification.AssetName}</p>
                <p><strong>Location:</strong> {notification.Location || 'Not specified'}</p>
                <p><strong>Supervisor:</strong> {notification.SupName}</p>  {/* Updated here */}

                <ChatBox
                  remark={notification.SupRemark}
                  name={notification.SupName}   // Keep using SupName for chat
                  remarkDateTime={notification.SupDateTime}
                  status={notification.CurrentStatus}
                  onSend={onReply}
                />
              </>
            ) : isTicketNotification ? (
              // Ticket/Complaint Notification Content
              <>
                <p><strong>Ticket ID:</strong> {notification.TicketId}</p>
                <p><strong>Ticket Number:</strong> {notification.TicketNumber}</p>
                <p><strong>Location:</strong> {notification.Location}</p>
                <p><strong>Reported To:</strong> {notification.SupName}</p> {/* Updated here */}
                <p><strong>Created On:</strong> {new Date(notification.CreatedOn).toLocaleString()}</p>
                <p><strong>Status:</strong> {notification.CurrentStatus}</p>

                <ChatBox
                  remark={notification.SupRemark}
                  name="Customer"  // Updated here
                  remarkDateTime={notification.CreatedOn}
                  status={notification.CurrentStatus}
                  onSend={onReply}
                />
              </>
            ) : (
              // Fallback for unknown notification type
              <p>Unknown notification type</p>
            )}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default FMResponseModal;