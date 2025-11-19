import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

const ChatBox = ({ remark, name, remarkDateTime, status, onSend, context, assetData }) => {
  let statusOptions = [];
  if (context === 'task') statusOptions = ['Actionable', 'Completed'];
  else if (context === 'ticket') statusOptions = ['IN PROGRESS', 'RESOLVED', 'CLOSED', 'REOPEN'];

  const [inputValue, setInputValue] = useState('');
  const [currentStatus, setCurrentStatus] = useState(status || statusOptions[0]);
  const [serviceDate, setServiceDate] = useState('');
  const [nextServiceDate, setNextServiceDate] = useState('');
  const [serviceCost, setServiceCost] = useState('');
  const [serviceDoc, setServiceDoc] = useState(null);
  const [image, setImage] = useState(null);
  const [servicedBy, setServicedBy] = useState('');
  const [approvedBy, setApprovedBy] = useState('');

  const handleSend = async () => {
    if (context === 'asset') {
      // ✅ Validation
      if (!assetData.AssetId || !serviceDate || !nextServiceDate) {
        alert('Please fill Service Date, Next Service Date, and Asset ID.');
        return;
      }

      const formData = new FormData();
      formData.append('AssetId', assetData.AssetId);
      formData.append('ServiceDate', serviceDate);
      formData.append('NextServiceDate', nextServiceDate);
      formData.append('Remark', inputValue || 'No remarks');
      formData.append('ServiceCost', serviceCost || '');
      formData.append('ServicedBy', servicedBy || '');
      formData.append('ApprovedBy', approvedBy || '');

      // ✅ Attach files if selected
      if (serviceDoc) formData.append('ServiceDoc', serviceDoc);
      if (image) formData.append('Image', image);

      try {
        const response = await fetch('https://api.urest.in:8096/api/Asset/SaveServiceRecord', {
          method: 'POST',
          body: formData, // FormData automatically sets multipart/form-data
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error('Failed to save service record:', errText);
          alert('Failed to save service record.');
          return;
        }

        alert('Service Record saved successfully!');
setTimeout(() => {
  if (typeof assetData.apiCall === 'function') assetData.apiCall();
  if (typeof assetData.onClose === 'function') assetData.onClose();
}, 500);

        // Reset fields
        setInputValue('');
        setServiceDate('');
        setNextServiceDate('');
        setServiceCost('');
        setServiceDoc(null);
        setImage(null);
        setServicedBy('');
        setApprovedBy('');
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong while saving.');
      }
    } else {
      onSend(inputValue, currentStatus);
      setInputValue('');
    }
  };

  const formatDateTime = (dt) => {
  if (!dt) return "";

  const date = new Date(dt);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};

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
      {context !== 'asset' && (
        <div className="alert alert-info mb-3 d-flex justify-content-between align-items-center">
          <span>
            Status: <strong>{currentStatus}</strong>
          </span>

          {context === 'task' ? (
            currentStatus === 'Actionable' && (
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
      )}

      <div className="alert alert-secondary mb-3">
        {remark && (
          <div className="mb-3 p-2 border rounded bg-light">
            <div><strong>Remark:</strong> {remark}</div>
            <div><strong>By:</strong> {name}</div>
            <div><strong>Date:</strong> {formatDateTime(remarkDateTime)}</div>
          </div>
        )}
        {context === 'asset' ? (
          <div className="mt-3">
            <Form.Group className="mb-2">
              <Form.Label>FM Remark</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter FM remark..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Service Date</Form.Label>
              <Form.Control
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Next Service Date</Form.Label>
              <Form.Control
                type="date"
                value={nextServiceDate}
                onChange={(e) => setNextServiceDate(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Service Cost (₹)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter cost..."
                value={serviceCost}
                onChange={(e) => setServiceCost(e.target.value)}
              />
            </Form.Group>

            {/* File upload section */}
            <Form.Group className="mb-2">
              <Form.Label>Upload Service Document</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                onChange={(e) => setServiceDoc(e.target.files[0])}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Serviced By</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter technician name..."
                value={servicedBy}
                onChange={(e) => setServicedBy(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Approved By</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter approver name..."
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" onClick={handleSend}>
              Save Service Record
            </Button>
          </div>
        ) : (
          <div className="d-flex mt-2">
            <Form.Control
              type="text"
              placeholder="Type your message here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="me-2"
            />
            <Button variant="primary" onClick={handleSend}>
              Send
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
