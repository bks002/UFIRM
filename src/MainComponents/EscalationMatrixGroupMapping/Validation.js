import * as  ValidationProvider from '../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../Common/AppCommon.js';

let validateAllControls = [
    { Id: 'txtGroupName', IsMandatory: true, MaxLength: '32', LabelMessage: 'Group Name', Type: "TextBox" },
    // { Id: 'txtDescription', IsMandatory: true, MaxLength: '100', LabelMessage: 'Description', Type: "TextBox" },
    { Id: 'ddlPropertyUsers', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'User', InitialValue: "Select User", Type: "DropDown" },
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




