import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './PopUp.css';
import CheckIn from '../../pages/CheckInPage';
import CheckOut from '../../pages/CheckOutPage';

function PopUp({ show, handleClose, asset, actionType, handleSubmit}) {
  const [formData, setFormData]=useState({});
  const handleCheckOutData=(CheckOutData)=>{
    console.log(CheckOutData);
    handleSubmit(CheckOutData);
  }
  const handleCheckInData =(CheckInData)=>{
    console.log(CheckInData);
   
    handleSubmit(CheckInData);
  }
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
        {actionType === "checkin" ? <CheckIn sendData={handleCheckInData} close={handleClose}/> : <CheckOut sendData={handleCheckOutData} close={handleClose}/>}
      </Modal.Body>
    </Modal>
  );
}

export default PopUp;
