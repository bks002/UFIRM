import * as  ValidationProvider from '../../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../../Common/AppCommon.js';

let validateAllControls = [
    { Id: 'txtSubject', IsMandatory: true, MaxLength: '100', LabelMessage: 'Enter Subject', Type: "TextBox" },
    { Id: 'txtexpiryDate', IsMandatory: false, MaxLength: '100', LabelMessage: 'Select Expiry Date', Type: "TextBox" },
    { Id: 'txteditor', IsMandatory: true, MaxLength: '500', LabelMessage: 'Enter Notice', Type: "TextBox" },
    { Id: 'ddltype', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Type', InitialValue: "Select Type", Type: "DropDown" },
    { Id: 'ddlalerttype', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Alert Type', InitialValue: "Select Alert Type", Type: "DropDown" },
    { Id: 'ddlNotify', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Notify', InitialValue: "Select Notify", Type: "DropDown" },
    { Id: 'ddlRecipients', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Receipients', InitialValue: "Select Recipients", Type: "DropDown" },
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
