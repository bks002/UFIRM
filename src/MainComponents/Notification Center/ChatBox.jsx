import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

const ChatBox = ({ remark, name, remarkDateTime, status, onSend }) => {
  const [inputValue, setInputValue] = useState('');
  const [currentStatus, setCurrentStatus] = useState('Actionable');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSend = () => {
    onSend(inputValue,currentStatus);
    setInputValue(''); // Clear the input after sending
  };

  const toggleStatus = () => {
    setCurrentStatus((prevStatus) => 
      prevStatus === 'Actionable' ? 'Completed' : 'Actionable'
    );
  };

  return (
    <>
      <div className="container mt-5">
        {/* Status Bar */}
        <div className="alert alert-info mb-3 d-flex justify-content-between align-items-center">
          <span>Status: <strong>{currentStatus}</strong></span>
          <Button variant="secondary" onClick={toggleStatus}>
            {currentStatus === 'Actionable' ? 'Mark as Completed' : 'Reopen'}
          </Button>
        </div>

        <div className="alert alert-secondary mb-3">
          <strong>{name}</strong>: {remark}
          <span className='mb-2px' style={{ display: 'block', fontSize: '1rem', color: 'white' }}>
  {new Date(remarkDateTime).toLocaleString()}
</span>
        
          {/* Input Box with Send Button inside the same div */}
          <div className="d-flex">
            <Form.Control
              type="text"
              placeholder="Type your message here..."
              value={inputValue}
              onChange={handleInputChange}
              className="form-control me-2"
            />
            <Button variant="primary" onClick={handleSend}>
              Send
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBox;