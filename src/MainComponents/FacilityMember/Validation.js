import * as  ValidationProvider from '../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../Common/AppCommon.js';

let validateAllControls = [
    { Id: 'txtName', IsMandatory: true, MaxLength: '100', LabelMessage: 'Name', Type: "TextBox" },
    { Id: 'txtContact', IsMandatory: true, ValidationType: 'MobileNumber', MinLength: '10', LabelMessage: 'Contact Number', Type: "MobileNumber" },
    // { Id: 'txtContact', IsMandatory: true, MaxLength: '100', LabelMessage: 'Contact', Type: "TextBox" },
    { Id: 'txtAddress', IsMandatory: true, MaxLength: '100', LabelMessage: 'Address', Type: "TextBox" },
    { Id: 'ddlFacilityType', IsMandatory: true, LabelMessage: 'Facility Type', Type: "DropDown", InitialValue: 'Select' },
    { Id: 'ddlFacilityMaster', IsMandatory: true, LabelMessage: 'Facility Master', Type: "DropDown", InitialValue: 'Select' },
    // { Id: 'ddlTowerList', IsMandatory: true, LabelMessage: 'Property Tower', Type: "DropDown" ,InitialValue: 'Select' },
    { Id: 'ddlFloorsList', IsMandatory: true, LabelMessage: 'Property Floor', Type: "DropDown", InitialValue: 'Select' },
    // { Id: 'ddlFlatList', IsMandatory: true, LabelMessage: 'Property Flat', Type: "DropDown" ,InitialValue: 'Select' },
    { Id: 'ddlGender', IsMandatory: true, LabelMessage: 'Gender', Type: "DropDown", InitialValue: 'Select' },
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




