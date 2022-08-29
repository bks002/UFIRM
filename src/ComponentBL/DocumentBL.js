// Validation 
import * as appCommon from '../Common/AppCommon';
import * as validationProvider from '../Common/Validation/ValidationProvider.js';
import * as validationCommon from '../Common/Validation/ValidationCommon.js';

const DocumentValidators = [
    { Id: 'txtDocumentNumber', IsMandatory: true, MaxLength: '100', LabelMessage: 'Document Number', Type: "TextBox" },
    { Id: 'txtDocumentName', IsMandatory: true, MaxLength: '100', LabelMessage: 'Document Name', Type: "TextBox" },
    { Id: 'ddlDocumentType', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'Document Type', InitialValue: "Select Document Type", Type: "DropDown" },
    { Id: 'fileDocumentUploader', IsMandatory: true, ValidationType:'File', LabelMessage: 'File', Type: "File" },
   

];

export default class DocumentBL {
    CreateValidator = () => {
        validationProvider.InitializeValidation(DocumentValidators);
    }

    ValidateControls = () => {
        //let error = '';
        return validationCommon.ValidateControl(DocumentValidators);

    }
}