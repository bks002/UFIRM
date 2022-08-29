import * as  ValidationProvider from '../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../Common/AppCommon.js';

let vehicleValidateAllControls = [
    // { Id: 'txtVehicleName', IsMandatory: true, MaxLength: '100', LabelMessage: 'Enter Vehicle Name', Type: "TextBox" },
    { Id: 'txtVehicleNumber', IsMandatory: true, MaxLength: '100', LabelMessage: 'Enter Vehicle Number', Type: "TextBox" },
    { Id: 'ddlVehicleType', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Vehicle Type', InitialValue: "Select Vehicle type", Type: "DropDown" },
];

let relationshipValidateAllControls = [
    { Id: 'txtOwnerFamilyName', IsMandatory: true, MaxLength: '100', LabelMessage: 'Enter Name', Type: "TextBox" },
    { Id: 'ddlFamilyMemberGender', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Gender', InitialValue: "Select Gender", Type: "DropDown" },
    { Id: 'ddlOwnerFamiliyRelationship', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Relationship', InitialValue: "Select Relationship", Type: "DropDown" },
];

let documentsValidateAllControls = [
    { Id: 'txtDocumentNumber', IsMandatory: true, MaxLength: '100', LabelMessage: 'Enter Document Number', Type: "TextBox" },
    { Id: 'fileDocumentUploader', IsMandatory: true, ValidationType: 'File', LabelMessage: 'File', Type: "File" },
    { Id: 'ddlNameDocument', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Name', InitialValue: "Select Name", Type: "DropDown" },
    { Id: 'ddlDocumentType', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Document Type', InitialValue: "Select Document Type", Type: "DropDown" },
];


export function CreateVehicleValidator() {
    ValidationProvider.InitializeValidation(vehicleValidateAllControls);
}
export function VehicleValidateControls() {
    let error = '';
    error = ValidateCommon.ValidateControl(vehicleValidateAllControls);
    if (error != '') {
        AppCommon.ShownotifyError("Please Resolve validation error before add vehicle");
        return false;
    }
    else {
        return true;
    }
}

export function CreateFamilyMemberValidator() {
    ValidationProvider.InitializeValidation(relationshipValidateAllControls);
}
export function FamilyMemberValidateControls() {
    let error = '';
    error = ValidateCommon.ValidateControl(relationshipValidateAllControls);
    if (error != '') {
        AppCommon.ShownotifyError("Please Resolve validation error before add family member");
        return false;
    }
    else {
        return true;
    }
}

export function CreateDocumentTypeValidator() {
    ValidationProvider.InitializeValidation(documentsValidateAllControls);
}
export function DocumentTypeValidateControls() {
    let error = '';
    error = ValidateCommon.ValidateControl(documentsValidateAllControls);
    if (error != '') {
        AppCommon.ShownotifyError("Please Resolve validation error before add document");
        return false;
    }
    else {
        return true;
    }
}