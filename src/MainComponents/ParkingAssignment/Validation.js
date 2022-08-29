import * as  ValidationProvider from '../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../Common/AppCommon.js';

let validateAllControls = [
    { Id: 'ddlParking', IsMandatory: true, LabelMessage: 'Parking', Type: "DropDown", InitialValue: 'Select' },
    { Id: 'ddlParkingZone', IsMandatory: true, LabelMessage: 'Parking Zone', Type: "DropDown", InitialValue: 'Select' },
    { Id: 'ddlPropertyName', IsMandatory: true, LabelMessage: 'Flat/Shop', Type: "DropDown", InitialValue: 'Select' }
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




