import * as  ValidationProvider from '../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../Common/AppCommon.js';

let validateAllControls = [
    { Id: 'txtTime1', IsMandatory: true, MaxLength: '3', LabelMessage: 'Time', Type: "TextBox" },
    { Id: 'txtTime2', IsMandatory: true, MaxLength: '3', LabelMessage: 'Time', Type: "TextBox" },
    { Id: 'txtTime3', IsMandatory: true, MaxLength: '3', LabelMessage: 'Time', Type: "TextBox" },
    { Id: 'txtTime4', IsMandatory: true, MaxLength: '3', LabelMessage: 'Time', Type: "TextBox" },
    { Id: 'ddlEscalationMatrixCategory', IsMandatory: true, LabelMessage: 'Category', Type: "DropDown", InitialValue: 'Select Category' },
    { Id: 'ddlEscalationMatrixPriority', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Priority', InitialValue: "Select Priority", Type: "DropDown" },
    { Id: 'ddlType1', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Type', InitialValue: "Select Type", Type: "DropDown" },
    { Id: 'ddlType2', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Type', InitialValue: "Select Type", Type: "DropDown" },
    { Id: 'ddlType3', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Type', InitialValue: "Select Type", Type: "DropDown" },
    { Id: 'ddlType4', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Type', InitialValue: "Select Type", Type: "DropDown" },
    { Id: 'escalationMatrixGroupId1', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Escalation Group', InitialValue: "Select Group", Type: "DropDown" },
    { Id: 'escalationMatrixGroupId2', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Escalation Group', InitialValue: "Select Group", Type: "DropDown" },
    { Id: 'escalationMatrixGroupId3', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Escalation Group', InitialValue: "Select Group", Type: "DropDown" },
    { Id: 'escalationMatrixGroupId4', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Escalation Group', InitialValue: "Select Group", Type: "DropDown" },
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




