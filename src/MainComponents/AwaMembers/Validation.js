import * as  ValidationProvider from '../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../Common/AppCommon.js';

let validateAllControls = [
    { Id: 'txtStartDate', IsMandatory: true, MaxLength: '100', LabelMessage: 'Select Start Date', Type: "TextBox" },
    { Id: 'txtEndDate', IsMandatory: true, MaxLength: '100', LabelMessage: 'Select End Date', Type: "TextBox" },
    { Id: 'ddlFlat', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Flat', InitialValue: "Select Flat", Type: "DropDown" },
    { Id: 'ddlFlatMember', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Member', InitialValue: "Select Member", Type: "DropDown" },
];

export function CreateValidator() {
    ValidationProvider.InitializeValidation(validateAllControls);
}
export function ValidateControls() {
    let error = '';
    error = ValidateCommon.ValidateControl(validateAllControls);
    if (error !== '') {
        AppCommon.ShownotifyError("Please Resolve validation error before submit");
        return false;
    }
    else {
        return true;
    }
}
