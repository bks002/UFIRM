import * as  ValidationProvider from '../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../Common/AppCommon.js';

// add validation owner details validation
//txtPrimaryOwenrName ddlPrimaryOwnerGender  txtPrimaryOwenrMobileNumber   
let validateAllControls = [
    { Id: 'dllOwnershiptype', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Ownership Type', InitialValue: "Select Ownership Type", Type: "DropDown" },
    { Id: 'dllOwnerResidingStatus', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Owner Residing', InitialValue: "Select Owner Residing", Type: "DropDown" },
    // { Id: 'txtPrimaryOwenrEmail', IsMandatory: true, MaxLength: '100', LabelMessage: 'Enter Email Address', Type: "EmailID" },
    { Id: 'txtRegistrationDate', IsMandatory: true, MaxLength: '100', LabelMessage: 'Select Registration Date', Type: "TextBox" },

    { Id: 'ddlPrimaryOwnerGender', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Gender', InitialValue: "Select Gender", Type: "DropDown" },
    { Id: 'txtPrimaryOwenrName', IsMandatory: true, MaxLength: '100', LabelMessage: 'Primary Owner Name', Type: "TextBox" },
    { Id: 'txtPrimaryOwenrMobileNumber', IsMandatory: true, ValidationType: 'MobileNumber', MinLength: '10', LabelMessage: 'Primary Owner Mobile Number', Type: "MobileNumber" },
];

let validateSecondaryControls = [
    { Id: 'ddlSecondaryOwnerGender', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Gender', InitialValue: "Select Gender", Type: "DropDown" },
    { Id: 'txtSecondaryOwenrName', IsMandatory: true, MaxLength: '100', LabelMessage: 'Primary Owner Name', Type: "TextBox" },
    { Id: 'txtSecondaryOwenrMobileNumber', IsMandatory: true, ValidationType: 'MobileNumber', MinLength: '10', LabelMessage: 'Secondary Owner Mobile Number', Type: "MobileNumber" },
];

export function CreateValidator() {
    ValidationProvider.InitializeValidation(validateAllControls);
}
export function ValidateControls() {
    let error = '';
    error = ValidateCommon.ValidateControl(validateAllControls);
    if (error != '') {
        AppCommon.ShownotifyError("Please Resolve validation error before submit");
        return false;
    }
    else {
        return true;
    }
}

export function CreateSecondaryValidator() {
    ValidationProvider.InitializeValidation(validateSecondaryControls);
}
export function SecondaryValidateControls() {
    let error = '';
    error = ValidateCommon.ValidateControl(validateSecondaryControls);
    if (error != '') {
        AppCommon.ShownotifyError("Please Resolve validation error before submit");
        return false;
    }
    else {
        return true;
    }
}

