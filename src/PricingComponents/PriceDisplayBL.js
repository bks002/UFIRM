import ValidationProvider from '../Common/Validation/ValidationProvider.js';
import ValidationMain from '../Common/Validation/ValidationMain.js';
import validatecommon from '../Common/Validation/ValidationCommon.js';
import AppCommon from '../Common/AppCommon.js';

let objvalidateCommon = new validatecommon();
let idJson = [{ Id: 'txtCustomer .rbt-input-main', IsMandatory: true, LabelMessage: 'Customer Name', Type: "TextBox" },
{ Id: 'txtCurrency .rbt-input-main', IsMandatory: true, LabelMessage: 'Currency', Type: "TextBox" },
{ Id: 'txtItem .rbt-input-main', IsMandatory: true, LabelMessage: 'Item', Type: "TextBox" },
{ Id: 'dtValidDate .form-control', IsMandatory: true, LabelMessage: 'Date', Type: "Calender" }];

class PriceDisplayBL {
    CreateDispalyPriceValidators() {
        let vmain = new ValidationMain();
        let validation = new ValidationProvider();
        validation.InitializeValidation(idJson);

    }


    ValidatePriceDisplay() {
        let objcommon = new AppCommon();

        let error = objvalidateCommon.ValidateControl(idJson);
        if (error != '') {
            objcommon.ShownotifyError("Please Resolve validation error before submit");
            return false;
        }
        else {
            return true;
        }
    }
}



export default PriceDisplayBL