// Validation 
import * as appCommon from '../Common/AppCommon';
import * as validationProvider from '../Common/Validation/ValidationProvider.js';
import * as validationCommon from '../Common/Validation/ValidationCommon.js';

const ParkingValidators = [
    { Id: 'txtVehicleNumber', IsMandatory: true, MaxLength: '50', LabelMessage: 'Vehicle Number', Type: "TextBox" },
    { Id: 'txtStickerNumber', IsMandatory: true, MaxLength: '50', LabelMessage: 'Sticker Number', Type: "TextBox" },
    { Id: 'ddlVehicleType', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'Vehicle', InitialValue: "Select Vehicle", Type: "DropDown" },
    { Id: 'ddlParkingArea', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'Property Area', InitialValue: "Select Parking Area", Type: "DropDown" },
    { Id: 'ddlParkingName', IsMandatory: true, ValidationType:'DropDown', LabelMessage: 'Property Name', InitialValue: "Select Parking Name", Type: "DropDown" },
    
];

export default class ParkingBL {
    CreateValidator = () => {
        validationProvider.InitializeValidation(ParkingValidators);
    }

    ValidateControls = () => {
        //let error = '';
        return validationCommon.ValidateControl(ParkingValidators);

    }
}