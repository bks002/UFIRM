import * as  ValidationProvider from '../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../Common/AppCommon.js';

let validateAllControls = [
    { Id: 'txttitle', IsMandatory: true, MaxLength: '32', LabelMessage: 'Title', Type: "TextBox" },
    // { Id: 'txtDescription', IsMandatory: true, MaxLength: '100', LabelMessage: 'Description', Type: "TextBox" },
    { Id: 'ddlticketType', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Ticekt Type', InitialValue: "Select Ticket Type", Type: "DropDown" },
    { Id: 'ddlPriority', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Priority', InitialValue: "Select Priority", Type: "DropDown" },
    { Id: 'ddlComplainBy', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Reporter', InitialValue: "Select Reporter", Type: "DropDown" },
    { Id: 'ddlComplainVisibility', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Visibility', InitialValue: "Select Visibility", Type: "DropDown" },
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




