import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './PopUp.css';
import CheckIn from '../../pages/CheckInPage';
import CheckOut from '../../pages/CheckOutPage';

function PopUp({ show, handleClose, asset, actionType, handleSubmit }) {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>{actionType === "checkin" ? "Check In Asset" : "Check Out Asset"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {asset ? (
          <>
            <p>Asset ID: {asset.Id}</p>
            <p>Asset Name: {asset.Name}</p>
          </>
        ) : (
          <p>Loading asset information...</p>
        )}
        {actionType === "checkin" ? <CheckIn/> : <CheckOut/>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {actionType === "checkin" ? "Check In" : "Check Out"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PopUp;
