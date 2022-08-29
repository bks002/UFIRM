import * as  ValidationProvider from '../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../Common/AppCommon.js';

let validateAllControls = [
    { Id: 'txtPropertyName', IsMandatory: true, LabelMessage: 'Property name', Type: "TextBox" },
    { Id: 'txtAddress', IsMandatory: true, LabelMessage: 'Address', Type: "TextBox" },
    { Id: 'ddlCity', IsMandatory: true, LabelMessage: 'City', Type: "DropDown" ,InitialValue: 'Select' }
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

    
    

