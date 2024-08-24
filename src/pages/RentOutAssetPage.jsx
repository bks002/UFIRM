import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const RentOut = ({ Close, setData }) => {  // Destructure Close from props

  const [formData, setFormData] = useState({
    assigneeName: "",
    rentOutDateTime: "",
    outFrom: "",
    rentedTo: "",
    tentativeReturnDate: "",
    imageOut: null,
    approvedBy: "",
    rentalCharges: ""
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onloadend = () => {
      const imageString = reader.result;
      const base64String = imageString.split(',')[1]; // remove the "data:image/png;base64," part
      setFormData({ ...formData, imageOut: base64String });
    };
  
    reader.readAsDataURL(file); // start reading the file
  };
  // const handleFileChange = (event) => {
  //   setFormData({ ...formData, imageOut: event.target.files[0] });
  // };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData); // Replace with actual form submission logic
    setData(formData);
    setFormData({
      assigneeName: "",
      rentOutDateTime: "",
      outFrom: "",
      rentedTo: "",
      tentativeReturnDate: "",
      imageOut: null,
      approvedBy: "",
      rentalCharges: ""
    });
    if (Close) Close();
  };

  return (
    <div className="container mt-4">
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="assigneeName">
          <Form.Label>Assignee Name</Form.Label>
          <Form.Control
            type="text"
            name="assigneeName"
            value={formData.assigneeName}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="rentOutDateTime">
          <Form.Label>Rent Out Date and Time</Form.Label>
          <Form.Control
            type="datetime-local"
            name="rentOutDateTime"
            value={formData.rentOutDateTime}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="outFrom">
          <Form.Label>Out From</Form.Label>
          <Form.Control
            type="text"
            name="outFrom"
            value={formData.outFrom}
            onChange={handleInputChange}
          />
        </Form.Group>

        <Form.Group controlId="rentedTo">
          <Form.Label>Rented To</Form.Label>
          <Form.Control
            type="text"
            name="rentedTo"
            value={formData.rentedTo}
            onChange={handleInputChange}
          />
        </Form.Group>

        <Form.Group controlId="tentativeReturnDate">
          <Form.Label>Tentative Date of Returning</Form.Label>
          <Form.Control
            type="date"
            name="tentativeReturnDate"
            value={formData.tentativeReturnDate}
            onChange={handleInputChange}
          />
        </Form.Group>

        <Form.Group controlId="rentalCharges">
          <Form.Label>Monthly Rental Charges</Form.Label>
          <Form.Control
            type="number"
            name="rentalCharges"
            value={formData.rentalCharges}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="imageOut">
          <Form.Label>Upload Image</Form.Label>
          <Form.Control
            type="file"
            name="imageOut"
            onChange={handleFileChange}
            accept="image/*"
          />
        </Form.Group>

        <Form.Group controlId="approvedBy">
          <Form.Label>Approved By</Form.Label>
          <Form.Control
            type="text"
            name="approvedBy"
            value={formData.approvedBy}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <div className="form-footer mt-3 d-flex justify-content-between ">
      <Button variant="primary" type="submit" className="mt-3 px-4 ">
         Rent Out
        </Button>
        <Button variant="secondary" className="mt-3 px-5" onClick={Close}>
          Close
        </Button></div>
 
      </Form>
    </div>
   
  );
};

export default RentOut;
