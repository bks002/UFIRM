import ValidationProvider from '../Common/Validation/ValidationProvider.js';
import ValidationMain from '../Common/Validation/ValidationMain.js';
import validatecommon from '../Common/Validation/ValidationCommon.js';
import AppCommon from '../Common/AppCommon.js';
import { debug } from 'util';

let objvalidateCommon = new validatecommon();
let idJson = [
    { Id: 'txtprice', IsMandatory: true, LabelMessage: 'Item Price', Type: "Numeric" , MinValue:0.00001, Scale:5 },
    { Id: 'txtItem .rbt-input-main', IsMandatory: true, LabelMessage: 'Item', Type: "TextBox" }

];
class CreatePriceManually {

    CreatePriceValidator() {
        let vmain = new ValidationMain();
        let validation = new ValidationProvider();
        validation.InitializeValidation(idJson);
    }
    ValidatePrice(){
        let objcommon= new  AppCommon();
        let error = objvalidateCommon.ValidateControl(idJson);
        if (error != '') {
                objcommon.ShownotifyError("Please Resolve validation error before submit");
                return false;
            }
            else {
                return true;
            }
    }
    GetItemPriceCommonSeperatedvalue(json){
        let rvalue='';
        json.map((value, idx) => {
            rvalue += `${value.ItemId}#${value.Price},`;
        })
        return rvalue.substring(0, rvalue.length - 1);
    }

    GetItemCollection(json){
       
        let rvalue='';
        json.map((value, idx) => {
            rvalue += `${value.ItemId},`;
        })
        return rvalue.substring(0, rvalue.length - 1);
    }

    GetItempricelogdata(json){
        let rvalue='';
        json.map((value, idx) => {
            rvalue += `(${value.ItemCode} - ${value.Price}), `;
        })
        return rvalue.substring(0, rvalue.length - 2);
    }
}

export default CreatePriceManually;