import * as  ValidationProvider from '../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../Common/AppCommon.js';

let tenantvalidateAllControls = [
    { Id: 'txtTenantName', IsMandatory: true, MaxLength: '100', LabelMessage: 'Enter Tenant Name', Type: "TextBox" },
    //  { Id: 'txtTenantEmail', IsMandatory: true, ValidationType: 'EmailID', MinLength: '2', MaxLength: '100', LabelMessage: 'Email Address', Type: "EmailID" },
    { Id: 'txtTenantMobileNumber', IsMandatory: true, ValidationType: 'MobileNumber', MinLength: '10', LabelMessage: 'Mobile Number', Type: "MobileNumber" },
    // { Id: 'tenantfileDocumentUploader', IsMandatory: true, ValidationType: 'File', LabelMessage: 'File', Type: "File" },
    { Id: 'ddlTenantGender', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Gender', InitialValue: "Select Gender", Type: "DropDown" },
    { Id: 'ddlTenantType', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Gender', InitialValue: "Select Tenant Type", Type: "DropDown" },
];

let UpdatetenantvalidateAllControls = [
    { Id: 'txtTenantName', IsMandatory: true, MaxLength: '100', LabelMessage: 'Enter Tenant Name', Type: "TextBox" },
    //  { Id: 'txtTenantEmail', IsMandatory: true, ValidationType: 'EmailID', MinLength: '2', MaxLength: '100', LabelMessage: 'Email Address', Type: "EmailID" },
    { Id: 'txtTenantMobileNumber', IsMandatory: true, ValidationType: 'MobileNumber', MinLength: '10', LabelMessage: 'Mobile Number', Type: "MobileNumber" },
    // { Id: 'tenantfileDocumentUploader', IsMandatory: true, ValidationType: 'File', LabelMessage: 'File', Type: "File" },
    { Id: 'ddlTenantGender', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Gender', InitialValue: "Select Gender", Type: "DropDown" },
    { Id: 'ddlTenantType', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Gender', InitialValue: "Select Tenant Type", Type: "DropDown" },
];

let rentagreementvalidateAllControls = [
    { Id: 'txtStartDate', IsMandatory: true, MaxLength: '100', LabelMessage: 'Select Start Date', Type: "TextBox" },
    { Id: 'txtEndDate', IsMandatory: true, MaxLength: '100', LabelMessage: 'Select End Date', Type: "TextBox" },
    { Id: 'rentagreementfileDocumentUploader', IsMandatory: true, ValidationType: 'File', LabelMessage: 'File', Type: "File" },
];


export function CreateTenantValidator() {
    ValidationProvider.InitializeValidation(tenantvalidateAllControls);
}
export function TenantValidateControls() {
    let error = '';
    error = ValidateCommon.ValidateControl(tenantvalidateAllControls);
    if (error != '') {
        AppCommon.ShownotifyError("Please Resolve validation error before add tenant details");
        return false;
    }
    else {
        return true;
    }
}

export function UpdateTenantValidator() {
    ValidationProvider.InitializeValidation(UpdatetenantvalidateAllControls);
}
export function UpdateTenantValidateControls() {
    let error = '';
    error = ValidateCommon.ValidateControl(UpdatetenantvalidateAllControls);
    if (error != '') {
        AppCommon.ShownotifyError("Please Resolve validation error before add tenant details");
        return false;
    }
    else {
        return true;
    }
}

export function CreateRentAgreementValidator() {
    ValidationProvider.InitializeValidation(rentagreementvalidateAllControls);
}
export function RentAgreementValidateControls() {
    let error = '';
    error = ValidateCommon.ValidateControl(rentagreementvalidateAllControls);
    if (error != '') {
        AppCommon.ShownotifyError("Please Resolve validation error before add rent agreement details");
        return false;
    }
    else {
        return true;
    }
}