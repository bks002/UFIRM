import * as  ValidationProvider from '../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../Common/AppCommon.js';

let validateAllControls = [
    { Id: 'txtFlatName', IsMandatory: true, LabelMessage: 'Flat name', Type: "TextBox" },
    { Id: 'ddlPropertyList', IsMandatory: true, LabelMessage: 'Property', Type: "DropDown" ,InitialValue: 'Select' },
    { Id: 'ddlTowerList', IsMandatory: true, LabelMessage: 'Tower', Type: "DropDown" ,InitialValue: 'Select' },
    { Id: 'ddlFloorsList', IsMandatory: true, LabelMessage: 'Floor', Type: "DropDown" ,InitialValue: 'Select' },
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

    
    

