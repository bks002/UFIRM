import React, { useState } from "react";

// Personal Details Component
const PersonalDetails = ({ formData, handleInputChange, setFormData }) => {
    const handleSameAddressToggle = (e) => {
        const isChecked = e.target.checked; // Get the checkbox value (true/false)
        setFormData((prevState) => ({
            ...prevState,
            isSameAddress: isChecked, // Update the `isSameAddress` state
            permanentAddress: isChecked ? prevState.currentAddress : "", // Copy or clear the permanent address
        }));
    };

    return (
        <div className="section">
            <h4>Personal Details</h4>
            <div className="row">
                <div className="form-group col-md-6">
                    <label>Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group col-md-6">
                    <label>Father's Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
            </div>
            <div className="row">
                <div className="form-group col-md-6">
                    <label>Mother's Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="motherName"
                        value={formData.motherName}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group col-md-6">
                    <label>Date of Birth</label>
                    <input
                        type="date"
                        className="form-control"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        required
                    />
                </div>
            </div>
            <div className="row">
                <div className="form-group col-md-6">
                    <label>Marital Status</label>
                    <select
                        className="form-control"
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                    </select>
                </div>
                <div className="form-group col-md-6">
                    <label>Spouse Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="spouseName"
                        value={formData.spouseName}
                        onChange={handleInputChange}
                        disabled={formData.maritalStatus === "single"}
                    />
                </div>

            </div>
            <div className="row">
                <div className="form-group col-md-6">
                    <label>Phone Number</label>
                    <input
                        type="text"
                        className="form-control"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group col-md-6">
                    <label>Gender</label>
                    <select
                        className="form-control"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
            <div className="row">
                <div className="form-group col-md-6">
                    <label>Current Address</label>
                    <textarea
                        className="form-control"
                        name="currentAddress"
                        value={formData.currentAddress}
                        onChange={handleInputChange}
                        rows="3"
                        required
                    ></textarea>
                </div>
                {/* Permanent Address */}
                <div className="form-group col-md-6">
                    <label>Permanent Address</label>
                    <textarea
                        className="form-control"
                        name="permanentAddress"
                        value={formData.permanentAddress}
                        onChange={handleInputChange}
                        rows="3"
                        required
                        disabled={formData.isSameAddress}
                    ></textarea>
                    {/* Checkbox: Same Address */}
                    <div className="form-check mt-2">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="sameAddress"
                            checked={formData.isSameAddress}
                            onChange={handleSameAddressToggle}
                        />
                        <label className="form-check-label" htmlFor="sameAddress">
                            Same as Current Address
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Educational Details Component
const EducationalDetails = ({ formData, handleInputChange }) => {
    // Generate the list of years (from 2000 to the current year)
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1950; year--) {
        years.push(year);
    }
    return (
        <div className="section">
            <h4>Educational Details</h4>
            <div className="row">
                <div className="form-group col-md-6">
                    <label>Highest Qualification</label>
                    <input
                        type="text"
                        className="form-control"
                        name="highestQualification"
                        value={formData.highestQualification}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group col-md-6">
                    <label>Year of Passing</label>
                    <select
                        className="form-control"
                        name="yearOfPassing"
                        value={formData.yearOfPassing}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Year</option>
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="row">
                <div className="form-group col-md-6">
                    <label>Institute Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="instituteName"
                        value={formData.instituteName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                {/* Basic Computer Knowledge Field */}
                <div className="form-group col-md-6">
                    <label>Do you have basic knowledge of computers?</label>
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            name="basicComputerKnowledge"
                            checked={formData.basicComputerKnowledge}
                            onChange={handleInputChange}
                        />
                        <label className="form-check-label">
                            Yes
                        </label>
                    </div>
                </div>
            </div>

            {/* Previous Work Experience */}
            <h4>Previous Work Experience</h4>
            <div className="row">
                <div className="form-group col-md-6">
                    <label>Do you have previous work experience?</label>
                    <select
                        className="form-control"
                        name="hasPreviousExperience"
                        value={formData.hasPreviousExperience}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </div>
                {formData.hasPreviousExperience === "yes" && (
                <div className="form-group col-md-6">
                    <label>Company Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                    />
                </div>)}
            </div>

            {formData.hasPreviousExperience === "yes" && (
                <>
                    <div className="row">
                        <div className="form-group col-md-6">
                            <label>Experience (in months)</label>
                            <input
                                type="number"
                                className="form-control"
                                name="experienceMonths"
                                value={formData.experienceMonths}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group col-md-6">
                            <label>Designation</label>
                            <input
                                type="text"
                                className="form-control"
                                name="designation"
                                value={formData.designation}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// Medical Details Component
const MedicalDetails = ({ formData, handleInputChange }) => {
    return (
        <div className="section">
            <h4>Medical Details</h4>
            <div className="row">
                <div className="form-group col-md-6">
                    <label>Height</label>
                    <input
                        type="text"
                        className="form-control"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group col-md-6">
                    <label>Weight</label>
                    <input
                        type="text"
                        className="form-control"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        required
                    />
                </div>
            </div>
            <div className="row">
                <div className="form-group col-md-6">
                    <label>Identification Mark</label>
                    <input
                        type="text"
                        className="form-control"
                        name="identificationMark"
                        value={formData.identificationMark}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group col-md-6">
                    <label>Blood Group</label>
                    <select
                        className="form-control"
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                    </select>
                </div>
            </div>

        </div>
    );
};

// Account Details Component
const AccountDetails = ({ formData, handleInputChange }) => {
    return (
        <div className="section">
            <h4>Bank Account Details</h4>
            <div className="row">
                <div className="form-group col-md-6">
                    <label>Bank Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group col-md-6">
                    <label>Branch Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="branchName"
                        value={formData.branchName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
            </div>
            <div className="row">
                <div className="form-group col-md-6">
                    <label>Account Number</label>
                    <input
                        type="text"
                        className="form-control"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group col-md-6">
                    <label>IFSC Code</label>
                    <input
                        type="text"
                        className="form-control"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleInputChange}
                        required
                    />
                </div>
            </div>
            <div className="row">
                <div className="form-group col-md-6">
                    <label>ESIC Code</label>
                    <input
                        type="text"
                        className="form-control"
                        name="esicCode"
                        value={formData.esicCode}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group col-md-6">
                    <label>UAN Number</label>
                    <input
                        type="text"
                        className="form-control"
                        name="uanNumber"
                        value={formData.uanNumber}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
            <div className="form-group">
                <label>Dispensary Name</label>
                <input
                    type="text"
                    className="form-control"
                    name="dispensaryName"
                    value={formData.dispensaryName}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
};

const DocumentUpload = ({ formData, handleInputChange }) => {
    // Handle file change event
    const handleFileChange = (e, fieldName) => {
        const files = e.target.files;
        handleInputChange({ target: { name: fieldName, value: files } });
    };

    // Generate a preview URL for images
    const getFilePreview = (file) => {
        return file ? URL.createObjectURL(file) : null;
    };

    return (
        <div className="section">
            <h4>Document Upload</h4>
            <div className="row">
                <div className="form-group col-md-6">
                    <label>Aadhaar Front</label>
                    <input
                        type="file"
                        className="form-control"
                        name="aadhaarFront"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, 'aadhaarFront')}
                        multiple
                    />
                    {/* Preview */}
                    {formData.aadhaarFront && formData.aadhaarFront[0] && (
                        <div>
                            <h5>Preview:</h5>
                            {formData.aadhaarFront[0].type.startsWith("image/") ? (
                                <img
                                    src={getFilePreview(formData.aadhaarFront[0])}
                                    alt="Aadhaar Front Preview"
                                    style={{ width: "100px", height: "auto" }}
                                />
                            ) : (
                                <p>{formData.aadhaarFront[0].name}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="form-group col-md-6">
                    <label>Aadhaar Back</label>
                    <input
                        type="file"
                        className="form-control"
                        name="aadhaarBack"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, 'aadhaarBack')}
                        multiple
                    />
                    {/* Preview */}
                    {formData.aadhaarBack && formData.aadhaarBack[0] && (
                        <div>
                            <h5>Preview:</h5>
                            {formData.aadhaarBack[0].type.startsWith("image/") ? (
                                <img
                                    src={getFilePreview(formData.aadhaarBack[0])}
                                    alt="Aadhaar Back Preview"
                                    style={{ width: "100px", height: "auto" }}
                                />
                            ) : (
                                <p>{formData.aadhaarBack[0].name}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Repeat similar structure for other file inputs */}

            <div className="row">
                <div className="form-group col-md-6">
                    <label>PAN Card</label>
                    <input
                        type="file"
                        className="form-control"
                        name="panCard"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, 'panCard')}
                        multiple
                    />
                    {/* Preview */}
                    {formData.panCard && formData.panCard[0] && (
                        <div>
                            <h5>Preview:</h5>
                            {formData.panCard[0].type.startsWith("image/") ? (
                                <img
                                    src={getFilePreview(formData.panCard[0])}
                                    alt="PAN Card Preview"
                                    style={{ width: "100px", height: "auto" }}
                                />
                            ) : (
                                <p>{formData.panCard[0].name}</p>
                            )}
                        </div>
                    )}
                </div>
                <div className="form-group col-md-6">
                    <label>Bank Passbook</label>
                    <input
                        type="file"
                        className="form-control"
                        name="bankPassbook"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, 'bankPassbook')}
                        multiple
                    />
                    {/* Preview */}
                    {formData.bankPassbook && formData.bankPassbook[0] && (
                        <div>
                            <h5>Preview:</h5>
                            {formData.bankPassbook[0].type.startsWith("image/") ? (
                                <img
                                    src={getFilePreview(formData.bankPassbook[0])}
                                    alt="Bank Passbook Preview"
                                    style={{ width: "100px", height: "auto" }}
                                />
                            ) : (
                                <p>{formData.bankPassbook[0].name}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="row">
                <div className="form-group col-md-6">
                    <label>Marksheet</label>
                    <input
                        type="file"
                        className="form-control"
                        name="marksheet"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, 'marksheet')}
                        multiple
                    />
                    {/* Preview */}
                    {formData.marksheet && formData.marksheet[0] && (
                        <div>
                            <h5>Preview:</h5>
                            {formData.marksheet[0].type.startsWith("image/") ? (
                                <img
                                    src={getFilePreview(formData.marksheet[0])}
                                    alt="Marksheet Preview"
                                    style={{ width: "100px", height: "auto" }}
                                />
                            ) : (
                                <p>{formData.marksheet[0].name}</p>
                            )}
                        </div>
                    )}
                </div>
                <div className="form-group col-md-6">
                    <label>Photo</label>
                    <input
                        type="file"
                        className="form-control"
                        name="photo"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'photo')}
                    />
                    {/* Preview */}
                    {formData.photo && formData.photo[0] && (
                        <div>
                            <h5>Preview:</h5>
                            <img
                                src={getFilePreview(formData.photo[0])}
                                alt="Photo Preview"
                                style={{ width: "100px", height: "auto" }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="row">
                <div className="form-group col-md-6">
                    <label>Signature</label>
                    <input
                        type="file"
                        className="form-control"
                        name="signature"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'signature')}
                    />
                    {/* Preview */}
                    {formData.signature && formData.signature[0] && (
                        <div>
                            <h5>Preview:</h5>
                            <img
                                src={getFilePreview(formData.signature[0])}
                                alt="Signature Preview"
                                style={{ width: "100px", height: "auto" }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Declaration Component
const Declaration = ({ formData, handleCheckboxChange }) => {
    return (
        <div className="section">
            <h4>Declaration</h4>
            <div className="form-check">
                <input
                    type="checkbox"
                    className="form-check-input"
                    id="declaration"
                    checked={formData.declaration}
                    onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="declaration">
                    I declare that the information provided is true and accurate.
                </label>
            </div>

            {/* Consent Approval Checkbox */}
            <div className="form-check">
                <input
                    type="checkbox"
                    className="form-check-input"
                    id="consentApproval"
                    checked={formData.consentApproval}
                    onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="consentApproval">
                    I consent to the terms and conditions and agree to the processing of my personal data.
                </label>
            </div>
        </div>
    );
};


// Main CreateNewUser Component
const CreateNewUser = () => {
    const [formData, setFormData] = useState({
        name: "",
        fatherName: "",
        spouseName: "",
        motherName:"",
        dob: "",
        image: null,
        address: "",
        maritalStatus: "",
        currentAddress: "",
        permanentAddress: "",
        isSameAddress: false,
        phoneNumber: "",
        dateOfJoining: "",
        previousEmployment: "",
        education: "",
        medicalDetails: "",
        bankAccountDetails: "",
        declaration: false,
        aadhaarFront: [],
        aadhaarBack: [],
        panCard: [],
        bankPassbook: [],
        marksheet: [],
        photo: null,
        signature: null,

    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageUpload = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleCheckboxChange = (e) => {
        setFormData({ ...formData, declaration: e.target.checked });
    };

    const handleFileUpload = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            // If the input is a file, update the formData with the selected files
            setFormData((prevState) => ({
                ...prevState,
                [name]: files, // Store multiple files in the state
            }));
        } else {
            // For other inputs, update as usual
            setFormData((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Data Submitted:", formData);
        // Add submission logic here
    };

    return (
        <div className="content-wrapper">
            <section className="content">
                <div className="container-fluid card bg-gray-light p-4">
                    <h3>Create New User</h3>
                    <form onSubmit={handleSubmit} className="mt-3">
                        {/* Personal Details */}
                        <PersonalDetails
                            formData={formData}
                            handleInputChange={handleInputChange}
                            setFormData={setFormData}
                        />

                        {/* Professional Details */}
                        <EducationalDetails
                            formData={formData}
                            handleInputChange={handleInputChange}
                        />

                        {/* Medical Details */}
                        <MedicalDetails
                            formData={formData}
                            handleInputChange={handleInputChange}
                        />

                        {/* Account Details */}
                        <AccountDetails
                            formData={formData}
                            handleInputChange={handleInputChange}
                        />

                        <DocumentUpload
                            formData={formData}
                            handleInputChange={handleFileUpload}
                        />

                        {/* Declaration */}
                        <Declaration
                            formData={formData}
                            handleCheckboxChange={handleCheckboxChange}
                        />

                        {/* Submit Button */}
                        <button type="submit" className="btn btn-primary mt-3">
                            Submit
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default CreateNewUser;
