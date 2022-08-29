import ValidationProvider from '../Common/Validation/ValidationProvider.js';
import ValidationMain from '../Common/Validation/ValidationMain.js';
import validatecommon from '../Common/Validation/ValidationCommon.js';
import AppCommon from '../Common/AppCommon.js';
let idJson = [
    { Id: 'txtprice', IsMandatory: true, LabelMessage: 'Item Price', Type: "Numeric", MinValue:0.00001, Scale: 5 },
    { Id: 'txtItem .rbt-input-main', IsMandatory: true, LabelMessage: 'Item', Type: "TextBox" },

];
let JustificationJson = [{ Id: 'plmtxtarea', IsMandatory: true, LabelMessage: 'Justification', Type: "TextBox" }];
let objvalidateCommon = new validatecommon();
let objcommon = new AppCommon();
let validation = new ValidationProvider();
class PriceListManagementBL {
    CreatePriceValidator() {

        validation.InitializeValidation(idJson);

    }

    ValidatePrice() {


        let error = objvalidateCommon.ValidateControl(idJson);

        if (error != '') {
            objcommon.ShownotifyError("Please Resolve validation error before submit");
            return false;
        }
        else {
            return true;
        }
    }

    ValidateJustificationiInput(type) {

        let error = objvalidateCommon.ValidateControl(JustificationJson);
        if (error != '') {
            if (type == undefined) {
                objcommon.ShownotifyError("Please enter justification to deactivate price list/price");
            } else if (type == 'C') {
                objcommon.ShownotifyError("Please enter justification to create the price");

            }
            return false;
        }
        else {
            return true;
        }
    }

    CreateJustificationValidator() {
        validation.InitializeValidation(JustificationJson);
    }

}

export default PriceListManagementBL;