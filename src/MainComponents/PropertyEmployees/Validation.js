import * as  ValidationProvider from '../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../Common/AppCommon.js';

let validateAllControls = [
    { Id: 'txtTime1', IsMandatory: true, MaxLength: '3', LabelMessage: 'Time', Type: "TextBox" },
    { Id: 'ddlEscalationMatrixCategory', IsMandatory: true, LabelMessage: 'Category', Type: "DropDown", InitialValue: 'Select Category' },

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




