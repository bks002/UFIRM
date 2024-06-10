import * as  ValidationProvider from '../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../Common/AppCommon.js';

let validateAllControls = [
    { Id: 'txtFirstName', IsMandatory: true, MaxLength: '100', LabelMessage: 'First Name', Type: "TextBox" },
    { Id: 'txtLastName', IsMandatory: true, MaxLength: '100', LabelMessage: 'Last Name', Type: "TextBox" },
    { Id: 'lblRelationshipType', IsMandatory: true, LabelMessage: 'Relationship Type', Type: "DropDown", InitialValue: 'Select' },
];

let vehicleValidators = [
    { Id: 'txtVehicleNumber', IsMandatory: true, MaxLength: '50', LabelMessage: 'Vehicle Number', Type: "TextBox" },
    { Id: 'txtStickerNumber', MaxLength: '50', LabelMessage: 'Sticker Number', Type: "TextBox" },
    { Id: 'ddlVehicleType', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'Vehicle', InitialValue: "Select Vehicle", Type: "DropDown" },
];

export function CreateValidator() {
    ValidationProvider.InitializeValidation(validateAllControls);
    ValidationProvider.InitializeValidation(vehicleValidators);
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

export function VehicleValidateControls() {
    let error = '';
    error = ValidateCommon.ValidateControl(vehicleValidators);
    if (error != '') {
        AppCommon.ShownotifyError("Please Resolve validation error before submit");
        return false;
    }
    else {
        return true;
    }
}
