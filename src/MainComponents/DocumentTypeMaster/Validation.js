import * as  ValidationProvider from '../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../Common/AppCommon.js';

let validateAllControls = [
    { Id: 'txtDocumentType', IsMandatory: true, LabelMessage: 'Document Type', Type: "TextBox" },
    // { Id: 'txtdescription', IsMandatory: true, LabelMessage: 'Description', Type: "TextBox" },
];

export function CreateValidator() {
    ValidationProvider.InitializeValidation(validateAllControls);
}
export function ValidateControls() {
    // 
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




