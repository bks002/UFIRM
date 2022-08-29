import * as  ValidationProvider from '../../Common/Validation/ValidationProvider.js';
import * as ValidateCommon from '../../Common/Validation/ValidationCommon.js';
import * as AppCommon from '../../Common/AppCommon.js';

let validateAllControls = [
    { Id: 'txtCatColor', IsMandatory: true, MaxLength: '100', LabelMessage: 'Category Name', Type: "TextBox" },
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

let validateEventControls = [
    { Id: 'txtTitle', IsMandatory: true, MaxLength: '100', LabelMessage: 'Title', Type: "TextBox" },
    { Id: 'txtStartDate', IsMandatory: true, MaxLength: '100', LabelMessage: 'Select Start Date', Type: "TextBox" },
    { Id: 'txtEndDate', IsMandatory: true, MaxLength: '100', LabelMessage: 'Select End Date', Type: "TextBox" },
    { Id: 'dllEventCategory', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Categroy', InitialValue: "Select Category", Type: "DropDown" },
    { Id: 'ddleventassignee', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Assignee', InitialValue: "Select Assignee", Type: "DropDown" },
];

export function CreateAddEventValidator() {
    ValidationProvider.InitializeValidation(validateEventControls);
}
export function ValidateEventControls() {
    let error = '';
    error = ValidateCommon.ValidateControl(validateEventControls);
    if (error != '') {
        AppCommon.ShownotifyError("Please Resolve validation error before submit");
        return false;
    }
    else {
        return true;
    }
}

let validateUpdateEventControls = [
    { Id: 'updatetxtTitle', IsMandatory: true, MaxLength: '100', LabelMessage: 'Title', Type: "TextBox" },
    { Id: 'updatetxtStartDate', IsMandatory: true, MaxLength: '100', LabelMessage: 'Select Start Date', Type: "TextBox" },
    { Id: 'updatetxtEndDate', IsMandatory: true, MaxLength: '100', LabelMessage: 'Select End Date', Type: "TextBox" },
    { Id: 'updatedllEventCategory', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Categroy', InitialValue: "Select Category", Type: "DropDown" },
    { Id: 'updateddleventassignee', IsMandatory: true, ValidationType: 'DropDown', LabelMessage: 'Assignee', InitialValue: "Select Assignee", Type: "DropDown" },
];

export function UpdateEventValidator() {
    ValidationProvider.InitializeValidation(validateUpdateEventControls);
}
export function ValidateUpdateEventControls() {
    let error = '';
    error = ValidateCommon.ValidateControl(validateUpdateEventControls);
    if (error != '') {
        AppCommon.ShownotifyError("Please Resolve validation error before submit");
        return false;
    }
    else {
        return true;
    }
}


let validateDeleteEventControls = [
    { Id: 'txtDeleteComment', IsMandatory: true, MaxLength: '100', LabelMessage: 'Title', Type: "TextBox" },
];

export function CreateDeleteEventValidator() {
    ValidationProvider.InitializeValidation(validateDeleteEventControls);
}
export function ValidateDeleteEventControls() {
    let error = '';
    error = ValidateCommon.ValidateControl(validateDeleteEventControls);
    if (error != '') {
        AppCommon.ShownotifyError("Please Resolve validation error before submit");
        return false;
    }
    else {
        return true;
    }
}

let validateCompleteEventControls = [
    { Id: 'txtCompleteComment', IsMandatory: true, MaxLength: '100', LabelMessage: 'Title', Type: "TextBox" },
];

export function CreateCompleteEventValidator() {
    ValidationProvider.InitializeValidation(validateCompleteEventControls);
}
export function ValidateCompleteEventControls() {
    let error = '';
    error = ValidateCommon.ValidateControl(validateCompleteEventControls);
    if (error != '') {
        AppCommon.ShownotifyError("Please Resolve validation error before submit");
        return false;
    }
    else {
        return true;
    }
}
