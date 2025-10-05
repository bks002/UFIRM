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
          {isTaskNotification
            ? 'Task Notification'
            : isAssetNotification
            ? 'Asset Notification'
            : isTicketNotification
            ? 'Complaint Notification'
            : 'Notification'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {notification && (
          <div>
            {isTaskNotification ? (
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
                  context="task"  // Task context
                  onSend={onReply}
                />
              </>
            ) : isAssetNotification ? (
              <>
                <p><strong>Asset ID:</strong> {notification.AssetId}</p>
                <p><strong>Asset Name:</strong> {notification.AssetName}</p>
                <p><strong>Location:</strong> {notification.Location || 'Not specified'}</p>
                <p><strong>Supervisor:</strong> {notification.SupName}</p>

                <ChatBox
                  remark={notification.SupRemark}
                  name={notification.SupName}
                  remarkDateTime={notification.SupDateTime}
                  status={notification.CurrentStatus}
                  context="asset" // Asset context
                  onSend={onReply}
                />
              </>
            ) : isTicketNotification ? (
              <>
                <p><strong>Ticket ID:</strong> {notification.TicketId}</p>
                <p><strong>Ticket Number:</strong> {notification.TicketNumber}</p>
                <p><strong>Location:</strong> {notification.Title || 'Not specified'}</p>
                <p><strong>Reported To:</strong> {notification.SupName}</p>
                <p><strong>Created On:</strong> {new Date(notification.CreatedOn).toLocaleString()}</p>
                <p><strong>Status:</strong> {notification.Status}</p>
                <p><strong>Description:</strong> {notification.Description}</p>

                {notification.AttachmentUrl && (
                  <p>
                    <strong>Attachment:</strong>{' '}
                    <a href={notification.AttachmentUrl} target="_blank" rel="noopener noreferrer">
                      {notification.AttachmentName}
                    </a>
                  </p>
                )}

                <ChatBox
                  remark={notification.SupRemark}
                  name={notification.SupName}
                  remarkDateTime={notification.CreatedOn}
                  status={notification.Status}
                  context="ticket" // Ticket context
                  onSend={onReply}
                />
              </>
            ) : (
              <p>Unknown notification type</p>
            )}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default FMResponseModal;
