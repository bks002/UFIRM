import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const RentOut = () => {
  const [rentOutType, setRentOutType] = useState("asset");
  const [formData, setFormData] = useState({
    assigneeName: "",
    // purpose: "",
    checkOutDateTime: "",
    outFrom: "",
    sentTo: "",
    tentativeReturnDate: "",
    uploadImage: null,
    // spareFields: [{ id: 1, spareName: "",tentativeReturnDate:"" }],
    approvedBy:"",
    rentalCharges:""
  });

  const handleSelectionChange = (event) => {
    setRentOutType(event.target.value);
  };

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

  const handleAddSpareField = () => {
    const newId = formData.spareFields.length + 1;
    setFormData({
      ...formData,
      spareFields: [...formData.spareFields, { id: newId, spareName: "", returnDateTime: "" }],
    });
  };

  const handleRemoveSpareField = (index) => {
    const updatedSpareFields = formData.spareFields.filter(
      (field, idx) => idx !== index
    );
    setFormData({ ...formData, spareFields: updatedSpareFields });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData); // Replace with actual form submission logic
    // Example: Send formData to server, reset form, etc.
  };

  return (
    <div className="container mt-4">
      <Form onSubmit={handleSubmit}>
        <Form.Group  >
          <Form.Check
            type="radio"
            id="check-asset"
            label="Rent Out Asset"
            value="asset"
            checked={rentOutType === "asset"}
            onChange={handleSelectionChange}
          />
          {/* <Form.Check
            type="radio"
            id="check-spare"
            label="Rent Out Spare"
            value="spare"
            checked={rentOutType === "spare"}
            onChange={handleSelectionChange}
          /> */}
        </Form.Group>

        {rentOutType === "asset" && (
          <div>
            <Form.Group controlId="assigneeName">
              <Form.Label>Assignee Name</Form.Label>
              <Form.Control
                type="text"
                name="assigneeName"
                value={formData.assigneeName}
                onChange={(e) => handleInputChange(null, e)}
                required
              />
            </Form.Group>

            {/* <Form.Group controlId="purpose">
              <Form.Label>Purpose Of Check Out</Form.Label>
              <Form.Control
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={(e) => handleInputChange(null, e)}
                required
              />
            </Form.Group> */}

            <Form.Group controlId="checkOutDateTime">
              <Form.Label>Rent Out Date and Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="checkOutDateTime"
                value={formData.checkOutDateTime}
                onChange={(e) => handleInputChange(null, e)}
                required
              />
            </Form.Group>

            <Form.Group controlId="outFrom">
              <Form.Label>Out From</Form.Label>
              <Form.Control
                type="text"
                name="outFrom"
                value={formData.outFrom}
                onChange={(e) => handleInputChange(null, e)}
              />
            </Form.Group>

            <Form.Group controlId="sentTo">
              <Form.Label>Rented To</Form.Label>
              <Form.Control
                type="text"
                name="sentTo"
                value={formData.sentTo}
                onChange={(e) => handleInputChange(null, e)}
              />
            </Form.Group>

            <Form.Group controlId="tentativeReturnDate">
              <Form.Label>Tentative Date of Returning</Form.Label>
              <Form.Control
                type="date"
                name="tentativeReturnDate"
                value={formData.tentativeReturnDate}
                onChange={(e) => handleInputChange(null, e)}
                
              />
            </Form.Group>
            <Form.Group controlId="rentalCharges">
              <Form.Label>Monthly Rental Charges</Form.Label>
              <Form.Control
                type="number"
                name="rentalCharges"
                value={formData.rentalCharges}
                onChange={(e) => handleInputChange(null, e)}
                required
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
            <Form.Group controlId="approvedBy">
              <Form.Label>Approved By</Form.Label>
              <Form.Control
                type="text"
                name="approvedBy"
                value={formData.approvedBy}
                onChange={(e) => handleInputChange(null, e)}
                required
              />
            </Form.Group>
          </div>
        )}

{/* {rentOutType === "spare" && (
  <div>
    {formData.spareFields.map((field, index) => (
      <div key={field.id}>
        <Form.Group>
          <Form.Label>Spare Name {index + 1}</Form.Label>
          <Form.Control
            type="text"
            name="spareName"
            value={field.spareName}
            onChange={(e) => handleInputChange(index, e)}
            required
          />
          {index > 0 && (
            <Button
              variant="danger"
              onClick={() => handleRemoveSpareField(index)}
              className="my-2"
            >
              Remove Spare
            </Button>
          )}
        </Form.Group>

        <Form.Group>
          <Form.Label>Tentative Date of Returning {index + 1}</Form.Label>
          <Form.Control
            type="date"
            name="tentativeReturnDate"
            value={field.tentativeReturnDate}
            onChange={(e) => handleInputChange(index, e)}
          />
        </Form.Group>
      </div>
    ))}

    <Button
      variant="primary"
      onClick={handleAddSpareField}
      className="mt-2"
    >
      Add Spare
    </Button>

    <Form.Group controlId="assigneeName">
      <Form.Label>Assignee Name</Form.Label>
      <Form.Control
        type="text"
        name="assigneeName"
        value={formData.assigneeName}
        onChange={(e) => handleInputChange(null, e)}
        required
      />
    </Form.Group>

    <Form.Group controlId="purpose">
      <Form.Label>Purpose Of Rent Out</Form.Label>
      <Form.Control
        type="text"
        name="purpose"
        value={formData.purpose}
        onChange={(e) => handleInputChange(null, e)}
        required
      />
    </Form.Group>

    <Form.Group controlId="checkOutDateTime">
      <Form.Label>Rent Out Date and Time</Form.Label>
      <Form.Control
        type="datetime-local"
        name="checkOutDateTime"
        value={formData.checkOutDateTime}
        onChange={(e) => handleInputChange(null, e)}
        required
      />
    </Form.Group>

    <Form.Group controlId="outFrom">
      <Form.Label>Out From</Form.Label>
      <Form.Control
        type="text"
        name="outFrom"
        value={formData.outFrom}
        onChange={(e) => handleInputChange(null, e)}
      />
    </Form.Group>

    <Form.Group controlId="sentTo">
      <Form.Label>Sent To</Form.Label>
      <Form.Control
        type="text"
        name="sentTo"
        value={formData.sentTo}
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
    <Form.Group controlId="approvedBy">
              <Form.Label>Approved By</Form.Label>
              <Form.Control
                type="text"
                name="approvedBy"
                value={formData.approvedBy}
                onChange={(e) => handleInputChange(null, e)}
                required
              />
            </Form.Group>
  </div>
)} */}

        <Button variant="primary" type="submit" className="mt-3">
          Submit
        </Button>
      </Form>
    </div>
  );
};
export default RentOut;