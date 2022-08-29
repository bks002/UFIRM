import * as  ValidationProvider from '../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../Common/AppCommon.js';

let validateAllControls = [
    { Id: 'txtfloors', IsMandatory: true, LabelMessage: 'Total floors', Type: "TextBox" },
    { Id: 'txtTowerName', IsMandatory: true, LabelMessage: 'Tower name', Type: "TextBox" },
    { Id: 'ddlPropertyList', IsMandatory: true, LabelMessage: 'Property', Type: "DropDown" ,InitialValue: 'Select' },
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

    
    

