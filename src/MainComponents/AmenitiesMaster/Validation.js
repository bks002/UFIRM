import * as  ValidationProvider from '../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../Common/AppCommon.js';

let validateAllControls = [
    { Id: 'txtName', IsMandatory: true, MaxLength: '32', LabelMessage: 'Name', Type: "TextBox" },
    //{ Id: 'txtContact', IsMandatory: true, ValidationType:'MobileNumber', MinLength: '10', LabelMessage: 'Contact Number', Type: "MobileNumber" },
    { Id: 'txtContact', IsMandatory: true, MaxLength: '100', LabelMessage: 'Contact', Type: "TextBox" },
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

    
    

