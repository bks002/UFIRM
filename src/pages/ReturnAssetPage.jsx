import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const ReturnAsset = ({ Close, setData }) => {
  const [returnType, setReturnType] = useState("asset");
  const [formData, setFormData] = useState({
    returnedBy: "",
    returnDateTime: "",
    returnedFrom: "",
    uploadImage: null,
    // spareFields: [{ id: 1, spareName: "", returnDateTime: "" }],
  });

  // Handle input change for both asset and spare
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

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData); // Replace with actual form submission logic
    setData(formData);// Example: Send formData to server, reset form, etc.
    setFormData({
      returnedBy: "",
      returnDateTime: "",
      returnedFrom: "",
      uploadImage: null,
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

            <Form.Group controlId="uploadImage">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control
                type="file"
                name="uploadImage"
                onChange={(e) =>
                  setFormData({ ...formData, uploadImage: e.target.files[0] })
                }
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
