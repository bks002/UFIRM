import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const ReturnAsset = ({ Close, setData }) => {
  const [returnType, setReturnType] = useState("asset");
  const [formData, setFormData] = useState({
    returnedBy: "",
    returnDateTime: "",
    returnedFrom: "",
    imageIn: null,
  });

  
  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    if (index !== null) {
      const updatedSpareFields = [...formData.spareFields];
      updatedSpareFields[index][name] = value;
      setFormData({ ...formData, spareFields: updatedSpareFields });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onloadend = () => {
      const imageString = reader.result;
      const base64String = imageString.split(',')[1]; // remove the "data:image/png;base64," part
      setFormData({ ...formData, imageIn: base64String });
    };
  
    reader.readAsDataURL(file); // start reading the file
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData); // Replace with actual form submission logic
    setData(formData);// Example: Send formData to server, reset form, etc.
    setFormData({
      returnedBy: "",
      returnDateTime: "",
      returnedFrom: "",
      imageIn: null,
    });
    if (Close) Close();
  };

  return (
    <div className="container mt-4">
      <Form onSubmit={handleSubmit}>
          <div>
            <Form.Group controlId="returnedBy">
              <Form.Label>Returned By</Form.Label>
              <Form.Control
                type="text"
                name="returnedBy"
                value={formData.returnedBy}
                onChange={(e) => handleInputChange(null, e)}
                required
              />
            </Form.Group>

            <Form.Group controlId="returnDateTime">
              <Form.Label>Return Date & Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="returnDateTime"
                value={formData.returnDateTime}
                onChange={(e) => handleInputChange(null, e)}
                required
              />
            </Form.Group>

            <Form.Group controlId="returnedFrom">
              <Form.Label>Returned From</Form.Label>
              <Form.Control
                type="text"
                name="returnedFrom"
                value={formData.returnedFrom}
                onChange={(e) => handleInputChange(null, e)}
              />
            </Form.Group>

            <Form.Group controlId="imageIn">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control
                type="file"
                name="imageIn"
                onChange={handleFileChange}
                // onChange={(e) =>
                //   setFormData({ ...formData, imageIn: e.target.files[0] })
                // }
                accept="image/*"
              />
            </Form.Group>
          </div>

        <div className="form-footer mt-3 d-flex justify-content-between ">
      <Button variant="primary" type="submit" className="mt-3 px-4 ">
         Return
        </Button>
        <Button variant="secondary" className="mt-3 px-5" onClick={Close}>
          Close
        </Button></div>

      </Form>
    </div>
  );
};

export default ReturnAsset;
