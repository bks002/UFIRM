import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ChatBox from './ChatBox'; // Import the renamed component

const FMResponseModal = ({ notification, onClose, onReply }) => {
  return (
    <Modal show={!!notification} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Task Notification</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {notification && (
          <div>
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
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default FMResponseModal;