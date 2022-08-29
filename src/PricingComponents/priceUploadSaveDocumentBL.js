import ValidationProvider from '../Common/Validation/ValidationProvider.js';
import ValidationMain from '../Common/Validation/ValidationMain.js';
import validatecommon from '../Common/Validation/ValidationCommon.js';
import AppCommon from '../Common/AppCommon.js';
let idJson = [
    { Id: 'grdItemPriceList', IsMandatory: true, LabelMessage: 'Item Collection', Type: "Grid" },
];
let objvalidateCommon = new validatecommon();
class priceUploadSaveDocumentBL {
    
CreateGridValidator(){
    let validation = new ValidationProvider();
    validation.InitializeValidation(idJson);
}

ValidateGrid(){
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

GetPriceLockItemTable(data) {
    if (data.length > 0) {
        let table = `<div>
   <table class="table"">
   <thead>
   <tr><th>SN</th><th>ConnectionId</th><th>Type</th><th >GPO/Price List Name</th><th>Priority</th><th>Item Code</th><th>Item Name</th><th>From Date</th><th>To Date</th></tr></thead>
   <tbody>`;
        data.map((value, idx) => {
            table += `<tr><td>${idx + 1}</td><td>${value.ConnectionProfileId}</td><td>${value.Type}</td><td>${value.GPOName}</td><td>${value.Priority}</td><td>${value.ItemCode}</td><td>${value.ItemName}</td><td>${value.StartDate}</td><td>${value.EndDate}</td></tr>`

        });
        table += `</tbody></table></div>`;

        return table;
    }
    else
        return "";
}


}
 
export default priceUploadSaveDocumentBL