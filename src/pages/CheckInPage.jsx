import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const CheckIn = () => {
  const [checkoutType, setCheckoutType] = useState("asset");
  const [formData, setFormData] = useState({
    returnedBy: "",
    returnDateTime: "",
    returnedFrom: "",
    uploadImage: null,
    spareFields: [{ id: 1, spareName: "", returnDateTime: "" }],
  });

  // Handle radio button selection change
  const handleSelectionChange = (event) => {
    setCheckoutType(event.target.value);
  };

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

  // Add a spare field
  const handleAddSpareField = () => {
    const newId = formData.spareFields.length + 1;
    setFormData({
      ...formData,
      spareFields: [
        ...formData.spareFields,
        { id: newId, spareName: "", returnDateTime: "" },
      ],
    });
  };

  // Remove a spare field
  const handleRemoveSpareField = (index) => {
    const updatedSpareFields = formData.spareFields.filter(
      (field, idx) => idx !== index
    );
    setFormData({ ...formData, spareFields: updatedSpareFields });
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData); // Replace with actual form submission logic
    // Example: Send formData to server, reset form, etc.
  };

  return (
    <div className="container mt-4">
      <Form onSubmit={handleSubmit}>
        {/* Radio buttons to select checkout type */}
        <Form.Group>
          <Form.Check
            type="radio"
            id="check-asset"
            label="Check In Asset"
            value="asset"
            checked={checkoutType === "asset"}
            onChange={handleSelectionChange}
          />
          <Form.Check
            type="radio"
            id="check-spare"
            label="Check In Spare"
            value="spare"
            checked={checkoutType === "spare"}
            onChange={handleSelectionChange}
          />
        </Form.Group>

        {/* Asset check-in form */}
        {checkoutType === "asset" && (
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
        )}

        {/* Spare check-in form */}
        {checkoutType === "spare" && (
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
                </Form.Group>

                <Form.Group>
                  <Form.Label>Return Date & Time {index + 1}</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="returnDateTime"
                    value={field.returnDateTime}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                  />
                </Form.Group>

                {index > 0 && (
                  <Button
                    variant="danger"
                    onClick={() => handleRemoveSpareField(index)}
                    className="my-2"
                  >
                    Remove Spare
                  </Button>
                )}
              </div>
            ))}

            <Button
              variant="primary"
              onClick={handleAddSpareField}
              className="mt-2"
            >
              Add Spare
            </Button>
          </div>
        )}

        {/* Common fields for both asset and spare check-in */}
        {checkoutType === "spare" && (
          <>
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
          </>
        )}

        <Form.Group controlId="submit">
          <Button variant="primary" type="submit" className="mt-3">
            Submit
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default CheckIn;
