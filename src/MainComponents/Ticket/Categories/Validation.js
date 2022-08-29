import * as  ValidationProvider from '../../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../../Common/AppCommon.js';

let validateAllControls = [
    { Id: 'txtCategoryName', IsMandatory: true, LabelMessage: 'Ticket Category', Type: "TextBox" },
    { Id: 'ddljobType', IsMandatory: true, LabelMessage: 'Job type', Type: "TextBox" },
    
];
//let validationCommon = new ValidateCommon();
//let appCommon = new AppCommon();
//let validationProvider = new ValidationProvider();

 

    export function CreateValidator() {
        ValidationProvider.InitializeValidation(validateAllControls);        
    }
    export function ValidateControls() {
        let error = '';
            error = ValidateCommon.ValidateControl(validateAllControls);
        if (error != '' ) {
            AppCommon.ShownotifyError("Please Resolve validation error before submit");
            return false;
        }
        else {
            return true;
        }
    }

    
    

