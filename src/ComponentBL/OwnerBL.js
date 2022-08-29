// Validation 
import * as appCommon from '../Common/AppCommon';
import * as validationProvider from '../Common/Validation/ValidationProvider.js';
import * as validationCommon from '../Common/Validation/ValidationCommon.js';

const OwnerValidators = [
    { Id: 'txtName', IsMandatory: true, MaxLength: '100', LabelMessage: 'Name', Type: "TextBox" },
    { Id: 'txtEmailAddress', IsMandatory: true, ValidationType:'EmailID', MinLength: '2', MaxLength: '100', LabelMessage: 'Email Address', Type: "EmailID" },
    { Id: 'txtContactNumber', IsMandatory: true, ValidationType:'MobileNumber', MinLength: '10', LabelMessage: 'Contact Number', Type: "MobileNumber" },
    { Id: 'txtAlternateNumber', IsMandatory: true, ValidationType:'MobileNumber', MinLength: '10', LabelMessage: 'Alternate Number', Type: "MobileNumber" },
    { Id: 'ddlResidentType', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'ResidentType', InitialValue: "Select Resident Type", Type: "DropDown" },
    { Id: 'ddlOwnerType', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'OwnerType', InitialValue: "Select Owner Type", Type: "DropDown" },
    { Id: 'ddlRelationshipType', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'RelationshipType', InitialValue: "Select Relationship Type", Type: "DropDown" },
    { Id: 'ddlSociety', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'Society', InitialValue: "Select Society", Type: "DropDown" },
    { Id: 'txtBuildingName', IsMandatory: true, MaxLength: '100', LabelMessage: 'First Name', Type: "TextBox" },
    { Id: 'txtFlat', IsMandatory: true, MaxLength: '100', LabelMessage: 'First Name', Type: "TextBox" },
];

export default class OwnerBL {
    CreateValidator = () => {
        validationProvider.InitializeValidation(OwnerValidators);
    }

    ValidateControls = () => {
        //let error = '';
        return validationCommon.ValidateControl(OwnerValidators);

    }
}