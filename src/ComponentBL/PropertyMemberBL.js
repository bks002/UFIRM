// Validation 
import * as appCommon from '../Common/AppCommon';
import * as validationProvider from '../Common/Validation/ValidationProvider.js';
import * as validationCommon from '../Common/Validation/ValidationCommon.js';

const PropertyMemberValidators = [
    { Id: 'txtFirstName', IsMandatory: true, MaxLength: '100', LabelMessage: 'First Name', Type: "TextBox" },
    { Id: 'txtLastName', IsMandatory: true, MaxLength: '100', LabelMessage: 'Last Name', Type: "TextBox" },
    { Id: 'txtEmailAddress', IsMandatory: true, ValidationType:'EmailID', MinLength: '2', MaxLength: '100', LabelMessage: 'Email Address', Type: "EmailID" },
    { Id: 'txtContactNumber', IsMandatory: true, ValidationType:'MobileNumber', MinLength: '10', LabelMessage: 'Contact Number', Type: "MobileNumber" },
    { Id: 'txtAlternateNumber', IsMandatory: true, ValidationType:'MobileNumber', MinLength: '10', LabelMessage: 'Alternate Number', Type: "MobileNumber" },
    { Id: 'ddlResidentType', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'ResidentType', InitialValue: "Select Resident Type", Type: "DropDown" },
    { Id: 'ddlRelationshipType', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'RelationshipType', InitialValue: "Select Relationship Type", Type: "DropDown" },
    { Id: 'ddlSelectedOwner', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'SelectOwner', InitialValue: "Select Owner", Type: "DropDown" },
];

export default class PropertyMemberBL {
    CreateValidator = () => {
        validationProvider.InitializeValidation(PropertyMemberValidators);
    }

    ValidateControls = () => {
        //let error = '';
        return validationCommon.ValidateControl(PropertyMemberValidators);

    }
}