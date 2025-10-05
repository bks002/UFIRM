import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

const ChatBox = ({ remark, name, remarkDateTime, status, onSend, context }) => {
  // Define status options based on context
  let statusOptions = [];
  if (context === 'task') {
    statusOptions = ['Actionable', 'Completed'];
  } else if (context === 'ticket') {
    statusOptions = ['IN PROGRESS', 'RESOLVED', 'CLOSED', 'REOPEN'];
  }

  const [inputValue, setInputValue] = useState('');
  const [currentStatus, setCurrentStatus] = useState(status || statusOptions[0]);

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleSend = () => {
    onSend(inputValue, currentStatus);
    setInputValue('');
  };

  // ✅ New: handle task "Mark as Complete"
  const handleMarkComplete = () => {
    setCurrentStatus('Completed');
    onSend(inputValue, 'Completed');
    setInputValue('');
  };

  const toggleStatus = () => {
    if (statusOptions.length <= 1) return; 
    const currentIndex = statusOptions.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOptions.length;
    setCurrentStatus(statusOptions[nextIndex]);
  };

  return (
    <div className="container mt-3">
      <div className="alert alert-info mb-3 d-flex justify-content-between align-items-center">
        <span>Status: <strong>{currentStatus}</strong></span>

        {context === "task" ? (
          currentStatus === "Actionable" && (
            <Button variant="success" onClick={handleMarkComplete}>
              Mark as Complete
            </Button>
          )
        ) : (
          statusOptions.length > 1 && (
            <Button variant="secondary" onClick={toggleStatus}>
              Change Status
            </Button>
          )
        )}
      </div>

      <div className="alert alert-secondary mb-3">
        <strong>{name}</strong>: {remark}
        <span style={{ display: 'block', fontSize: '0.9rem', color: '#555' }}>
          {new Date(remarkDateTime).toLocaleString()}
        </span>

        <div className="d-flex mt-2">
          <Form.Control
            type="text"
            placeholder="Type your message here..."
            value={inputValue}
            onChange={handleInputChange}
            className="me-2"
          />
          <Button variant="primary" onClick={handleSend}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;