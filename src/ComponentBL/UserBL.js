// Validation 
import * as appCommon from '../Common/AppCommon';
import * as validationProvider from '../Common/Validation/ValidationProvider.js';
import * as validationCommon from '../Common/Validation/ValidationCommon.js';

const UserValidators = [
    { Id: 'txtFirstName', IsMandatory: true, MaxLength: '100', LabelMessage: 'First Name', Type: "TextBox" },
    { Id: 'txtLastName', IsMandatory: true, MaxLength: '100', LabelMessage: 'Last Name', Type: "TextBox" },
    { Id: 'txtEmailAddress', IsMandatory: true, ValidationType:'EmailID', MinLength: '2', MaxLength: '100', LabelMessage: 'Email Address', Type: "EmailID" },
    { Id: 'txtContactNumber', IsMandatory: true, ValidationType:'MobileNumber', MinLength: '10', LabelMessage: 'Contact Number', Type: "MobileNumber" },
    { Id: 'ddlUserType', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'User Type', InitialValue: "Select User Type", Type: "DropDown" },
    { Id: 'ddlCity', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'City', InitialValue: "Select City", Type: "DropDown" },
    { Id: 'ddlBranch', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'Branch', InitialValue: "Select Branch", Type: "DropDown" },
    { Id: 'ddlDepartments', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'Department', InitialValue: "Select Department", Type: "DropDown" },
    { Id: 'ddlRole', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'Role', InitialValue: "Select User Role", Type: "DropDown" },
    //{ Id: 'ddlVendor', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'Vendor', InitialValue: "Select Vendor", Type: "DropDown" },
    { Id: 'ddlCompany', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'Company', InitialValue: "Select Company", Type: "DropDown" },
    { Id: 'txtAddress', MaxLength: '100', LabelMessage: 'Address', Type: "TextBox" },

    //{ Id: 'txtOldPassword', ValidationType:'Password', IsMandatory: true, LabelMessage: 'Old Password', Type: "Password" },
    { Id: 'txtNewPassword', ValidationType:'Password', IsMandatory: true, LabelMessage: 'New Password', Type: "Password" },
    { Id: 'txtConfirmPassword', ValidationType:'Password', IsMandatory: true, LabelMessage: 'Confirm Password', Type: "Password" },
];

export default class UserBL {
    CreateValidator = () => {
        validationProvider.InitializeValidation(UserValidators);
    }

    ValidateControls = () => {
        //let error = '';
        return validationCommon.ValidateControl(UserValidators);

    }
}