import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ReturnAsset from '../../pages/ReturnAssetPage';
import RentOut from '../../pages/RentOutAssetPage';

function RentalPopUp({ show, handleClose, asset, actionType, handleSubmit }) {
  const handleRentOutData = (rentOutData) => {
    console.log(rentOutData);
    handleSubmit(rentOutData);
  }
  
  const handleReturnData = (returnData) => {
    console.log(returnData);
    handleSubmit(returnData);
  }
  
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
        {actionType === "return" ? <ReturnAsset  Close={handleClose}  setData={handleReturnData}/> : <RentOut Close={handleClose} setData={handleRentOutData}/>}
      </Modal.Body>
    </Modal>
  );
}

export default RentalPopUp;
