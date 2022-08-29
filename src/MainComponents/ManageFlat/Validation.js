import * as  ValidationProvider from '../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../Common/AppCommon.js';

let validateAllControls = [
    { Id: 'txtBedrooms', MaxLength: '32', LabelMessage: 'Bedrooms', Type: "TextBox" },
    { Id: 'txtContactNumber', MaxLength: '32', LabelMessage: 'Ext.', Type: "TextBox" },
    { Id: 'txtOccupancy', MaxLength: '32', LabelMessage: 'Occupancy', Type: "TextBox" },
    { Id: 'txtElectricityMeterId', MaxLength: '32', LabelMessage: 'Electricity Meter Id', Type: "TextBox" },
    { Id: 'txtPipeGassConnectionId', MaxLength: '32', LabelMessage: 'Pipe Gass Connection Id', Type: "TextBox" },
    { Id: 'txtTotalArea', MaxLength: '32', LabelMessage: 'Total Area', Type: "TextBox" },
    { Id: 'txtBuiltupArea', MaxLength: '32', LabelMessage: 'Buildup Area', Type: "TextBox" },
    { Id: 'txtCarpetArea', MaxLength: '32', LabelMessage: 'Carpet Area', Type: "TextBox" },
    { Id: 'txtSuperBuilUpArea', MaxLength: '32', LabelMessage: 'Super Built Up Area', Type: "TextBox" },
    { Id: 'txtUniteConfiguration', MaxLength: '32', LabelMessage: 'Unite Configuration', Type: "TextBox" },
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

    
    

