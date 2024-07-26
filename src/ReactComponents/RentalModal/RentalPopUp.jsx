import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ReturnAsset from '../../pages/ReturnAssetPage';
import RentOut from '../../pages/RentOutAssetPage';

function RentalPopUp({ show, handleClose, asset, actionType, handleSubmit }) {
  const [formData, setFormData]=useState({});
  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>{actionType === "return" ? "Return Asset" : "Rent Out Asset"}</Modal.Title>
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
        {actionType === "return" ? <ReturnAsset/> : <RentOut/>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {actionType === "return" ? "Return" : "Rent Out"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RentalPopUp;
