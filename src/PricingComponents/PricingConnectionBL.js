import ApiUrl from '../Common/ApiUrlProvider.js';
import objcommon from '../Common/AppCommon.js';
import ValidationProvider from '../Common/Validation/ValidationProvider.js';
import ValidationMain from '../Common/Validation/ValidationMain.js';
import validatecommon from '../Common/Validation/ValidationCommon.js';
import AppCommon from '../Common/AppCommon.js';
let objvalidateCommon = new validatecommon();

let idJson = [{ Id: 'txtGpoName .rbt-input-main', Label: 'GPO Name' },
{ Id: 'dtStart .form-control', Label: 'Start Date' },
{ Id: 'dtend .form-control', Label: 'End Date' },
{ Id: 'divpriority .react-numeric-input input', Label: 'Priority' },
{ Id: 'grdConnectionCustomers', Label: 'Customer List' },
{ Id: 'tblItemConfiguration', Label: 'Item Configuration List' }
];
let appCommon = new AppCommon();
class PriceConnectionBL {

    getdownloadurl() {

    }


    hidecontrol(id) {
        $(id).attr("hidden", "");
    }
    showcontrol(id) {
        $(id).removeAttr("hidden");
    }

    getitemconfigurationquery() {
        return `select distinct i.Code,i.Name,i.ItemId from Pricing.Item i
        inner join  Pricing.ProductDivison pd on pd.ProductDivisonId=i.ProductDivisionId
        inner join Pricing.ProductCategory pc on pc.ProductCategoryId= i.ProductCategoryId
        inner join Pricing.ProductGroup pg on pg.ProductGroupId = i.ProductGroupId
        inner join Pricing.Product p on p.Productid=i.ProductId where  `;
    }

    generatequery(data) {
        if (data.length > 0) {
            let sqlquery = this.getitemconfigurationquery();
            let divistioneq = "";
            let divisionneq = "";
            let groupeq = "";
            let groupneq = "";
            let categoryeq = "";
            let categoryneq = "";
            let producteq = "";
            let productneq = "";
            let itemeq = "";
            let itemneq = "";
            let eqstatements = "";
            let neqstatements = "";
            data.map((value, idx) => {

                if (value.Type == 'Division') {
                    if (value.Operator == "Equal") {
                        divistioneq += `${value.ItemId},`
                    }
                    else {
                        divisionneq += `${value.ItemId},`
                    }
                }
                else if (value.Type == 'Group') {
                    if (value.Operator == "Equal") {
                        groupeq += `${value.ItemId},`
                    }
                    else {
                        groupneq += `${value.ItemId},`
                    }
                }
                else if (value.Type == 'Category') {
                    if (value.Operator == "Equal") {
                        categoryeq += `${value.ItemId},`
                    }
                    else {
                        categoryneq += `${value.ItemId},`
                    }
                }
                else if (value.Type == 'Product') {
                    if (value.Operator == "Equal") {
                        producteq += `${value.ItemId},`
                    }
                    else {
                        productneq += `${value.ItemId},`
                    }
                }
                else if (value.Type == 'Item') {
                    if (value.Operator == "Equal") {
                        itemeq += `${value.ItemId},`
                    }
                    else {
                        itemneq += `${value.ItemId},`
                    }
                }

            });

            if (divistioneq.length > 0) {
                if (eqstatements.length > 0) {
                    eqstatements += ` or pd.ProductDivisonId in(${divistioneq.substring(0, divistioneq.length - 1)})`
                }
                else {
                    eqstatements += ` pd.ProductDivisonId in(${divistioneq.substring(0, divistioneq.length - 1)})`
                }

            }
            if (divisionneq.length > 0) {
                if (neqstatements.length > 0) {
                    neqstatements += ` or pd.ProductDivisonId not in(${divisionneq.substring(0, divisionneq.length - 1)})`
                }
                else {
                    neqstatements += ` pd.ProductDivisonId not in(${divisionneq.substring(0, divisionneq.length - 1)})`
                }

            }

            if (groupeq.length > 0) {
                if (eqstatements.length > 0) {
                    eqstatements += ` or pg.ProductGroupId in(${groupeq.substring(0, groupeq.length - 1)})`
                }
                else {
                    eqstatements += ` pg.ProductGroupId in(${groupeq.substring(0, groupeq.length - 1)})`
                }
            }

            if (groupneq.length > 0) {
                if (neqstatements.length > 0) {
                    neqstatements += ` or pg.ProductGroupId not in(${groupneq.substring(0, groupneq.length - 1)})`
                }
                else {
                    neqstatements += ` pg.ProductGroupId not in(${groupneq.substring(0, groupneq.length - 1)})`
                }

            }

            if (categoryeq.length > 0) {
                if (eqstatements.length > 0) {
                    eqstatements += ` or pc.ProductCategoryId in(${categoryeq.substring(0, categoryeq.length - 1)})`
                }
                else {
                    eqstatements += ` pc.ProductCategoryId in(${categoryeq.substring(0, categoryeq.length - 1)})`
                }

            }
            if (categoryneq.length > 0) {
                if (neqstatements.length > 0) {
                    neqstatements += ` or pc.ProductCategoryId not in(${categoryneq.substring(0, categoryneq.length - 1)})`
                }
                else {
                    neqstatements += ` pc.ProductCategoryId not in(${categoryneq.substring(0, categoryneq.length - 1)})`
                }

            }
            if (producteq.length > 0) {
                if (eqstatements.length > 0) {
                    eqstatements += ` or p.Productid in(${producteq.substring(0, producteq.length - 1)})`
                }
                else {
                    eqstatements += `  p.Productid in(${producteq.substring(0, producteq.length - 1)})`
                }

            }
            if (productneq.length > 0) {
                if (neqstatements.length > 0) {
                    neqstatements += ` or  p.Productid not in(${productneq.substring(0, productneq.length - 1)})`
                }
                else {
                    neqstatements += `  p.Productid not in(${productneq.substring(0, productneq.length - 1)})`
                }

            }
            if (itemeq.length > 0) {
                if (eqstatements.length > 0) {
                    eqstatements += ` or i.ItemId in(${itemeq.substring(0, itemeq.length - 1)})`
                }
                else {
                    eqstatements += `i.ItemId in(${itemeq.substring(0, itemeq.length - 1)})`
                }

            }
            if (itemneq.length > 0) {
                if (neqstatements.length > 0) {
                    neqstatements += ` or i.ItemId not in(${itemneq.substring(0, itemneq.length - 1)})`
                }
                else {
                    neqstatements += ` i.ItemId not in (${itemneq.substring(0, itemneq.length - 1)})`
                }

            }
            if (eqstatements.length > 0)
                sqlquery += ` ( ${eqstatements} ) `
            if (neqstatements.length > 0 && eqstatements.length > 0)
                sqlquery += ` and ( ${neqstatements} ) `
            else if (neqstatements.length > 0)
                sqlquery += ` ( ${neqstatements} ) `
            return sqlquery;
        }
        else {
            return "";
        }
    }

    getitemconfigurationresulttable(data) {

        if (data.length > 0) {
            let table = `<div class="ic-table-cover">
       <table class="table table-fixed">
       <thead>
       <tr><th class="col-xs-1">SN</th><th class="col-xs-4">Item Code</th><th class="col-xs-7">Item Name</th></tr></thead>
       <tbody>`;
            data.map((value, idx) => {
                table += `<tr><td class="col-xs-1">${idx + 1}</td><td class="col-xs-4">${value.ItemCode}</td><td class="col-xs-7">${value.ItemName}</td></tr>`
            });
            table += `</tbody></table></div>`;
            return table;
        }
        else
            return "";
    }
    //Sanjay {Mar 28 2019}
    ShowDuplicateCustomer(data) {
        if (data.length > 0) {
            let table = `<div class="ic-table-cover">
       <table class="table table-fixed">
       <thead>
       <tr><th class="col-xs-1">SN</th><th class="col-xs-3">Customer Name</th><th class="col-xs-3">GPO Name</th><th class="col-xs-1">Priority</th><th class="col-xs-1">From Date</th><th class="col-xs-1">To Date</th></tr></thead>
       <tbody>`;
            data.map((value, idx) => {
                table += `<tr><td class="col-xs-1">${idx + 1}</td><td class="col-xs-3">${value.CustomerName}</td><td class="col-xs-3">${value.GPOName}</td><td class="col-xs-1">${value.Priority}</td><td class="col-xs-1">${value.StartDate}</td><td class="col-xs-1">${value.EndDate}</td></tr>`

            });
            table += `</tbody></table></div>`;

            return table;
        }
        else
            return "";
    }
    //sanjay Apr 23 2019
    GetPriceLockCustomersTable(data) {
        if (data.length > 0) {
            let table = `<div class="ic-table-cover">
       <table class="table table-fixed">
       <thead>
       <tr><th class="col-xs-1">SN</th><th class="col-xs-3">Customer Name</th><th class="col-xs-3">GPO Name</th><th class="col-xs-1">Priority</th><th class="col-xs-1">Item Code</th><th class="col-xs-1">From Date</th><th class="col-xs-1">To Date</th></tr></thead>
       <tbody>`;
            data.map((value, idx) => {
                table += `<tr><td class="col-xs-1">${idx + 1}</td><td class="col-xs-3">${value.CustomerName}</td><td class="col-xs-3">${value.GPOName}</td><td class="col-xs-1">${value.Priority}</td><td class="col-xs-1">${value.ItemCode}</td><td class="col-xs-1">${value.StartDate}</td><td class="col-xs-1">${value.EndDate}</td></tr>`

            });
            table += `</tbody></table></div>`;

            return table;
        }
        else
            return "";
    }


    validatform(json, savetype) {

        let common = new objcommon();
        if (savetype == 'C') {
            common.showtextalert("Eror", "Erorr", "alert")
        }
        else {
            common.showtextalert("Eror", "Erorr", "alert")
        }
        return true;
    }

    AddnewtoGrid(id, row) {
        table = $(`#${id}`).DataTable({
            paging: false
        });
        table.destroy();
        table = $(`#${id}`).DataTable({
            searching: false
        });
    }

    gridsetting(gridid) {
        alert(gridid);
        $(`#${gridid}`).dataTable({
            "searching": true,
            "order": [],
            "columnDefs": [{
                "targets": 'no-sort',
                "orderable": false

            }],
            destroy: true,
            retrieve: true,
            paging: true
        });
        $('.dataTables_empty').hide({
        });


    }
    ResetGrid(gridid) {
        let table = $(`#${gridid}`).DataTable();
        if (table == null)
            $(`#${gridid}`).DataTable({
            });

    }
    CreateValidationForConnection(mode) {
        let vmain = new ValidationMain();
        let validation = new ValidationProvider();
        let Control = $("#" +idJson[2].Id)
        let temp=Control.attr('DateToCampare',idJson[2].Id).val()
        if (mode == 'A' || mode=='C')// Add
        {
            validation.CreateTextBoxValidator({
                Id: idJson[0].Id,
                IsMandatory: true,
                LabelMessage: idJson[0].Label
            });
if(temp!=undefined)
if(temp!="")
{
            validation.CreateCalenderValidator({
                Id: idJson[1].Id,
                IsMandatory: true,
                LabelMessage: idJson[1].Label,
                DateToCampare: idJson[2].Id,
                Operator: '<'

            })
            validation.CreateCalenderValidator({
                Id: idJson[2].Id,
                IsMandatory: false,
                LabelMessage: idJson[2].Label,
                DateToCampare: idJson[1].Id,
                Operator: '>'

            })
        }
        else{
            validation.CreateCalenderValidator({
                Id: idJson[1].Id,
                IsMandatory: true,
                LabelMessage: idJson[1].Label

            })
        }
            validation.CreateSpinnerValidator({
                Id: idJson[3].Id,
                IsMandatory: true,
                LabelMessage: idJson[3].Label,
            })

            validation.CreateGridValidator({
                Id: idJson[4].Id,
                IsMandatory: true,
                LabelMessage: idJson[4].Label,
            })

            validation.CreateGridValidator({
                Id: idJson[5].Id,
                IsMandatory: true,
                LabelMessage: idJson[5].Label,
            })
            
        }
        
        else if (mode = 'E')// Edit mode
        {
            validation.CreateGridValidator({
                Id: idJson[4].Id,
                IsMandatory: true,
                LabelMessage: idJson[4].Label,
            })
            if(temp!=undefined)
            if(temp!="")
            validation.CreateCalenderValidator({
                Id: idJson[2].Id,
                IsMandatory:false,
                LabelMessage: idJson[2].Label

            })
        }
    }

    ValidateConnection(type) {
        this.CreateValidationForConnection(type);
        let controlcollection = idJson;
        let Control = $("#" +idJson[2].Id)
        if (type == 'U') {
            if(Control.attr('DateToCampare',idJson[2].Id).val()!=undefined)
            if(Control.attr('DateToCampare',idJson[2].Id).val()!='')
            controlcollection = [{ Id: 'grdConnectionCustomers', Label: 'Customer List' },
            { Id: 'dtend .form-control', Label: 'End Date' },];
            else
            {
                controlcollection = [{ Id: 'grdConnectionCustomers', Label: 'Customer List' },];
            }

        }
        let error = '';
        error = objvalidateCommon.ValidateControl(controlcollection);
        if (error != '') {
            appCommon.ShownotifyError('Please Resolve validation error before saving');
            return false;
        }
        else {
            return true;
        }



    }
    SetBorderRed(ControlID) {
        $('#' + ControlID).css("border", "1px solid red");
    }
    SetBorderDefault(ControlID) {
        $('#' + ControlID).css("border", "#d4d4d4  1px solid");


    }
    ShowBubbleMessageOnHover(ControlId, error) {

        $('#' + ControlId).poshytip('disable');
        var ControlID = $('#' + ControlId);
        if (error != "") {
            $(ControlID).attr("errormessage", error);
            $(ControlID).poshytip({
                className: 'tip-yellowsimple',
                alignTo: 'target',
                alignX: 'right',
                alignY: 'center',
                offsetX: 5,
                allowTipHover: false
            });
        }
        else
            $(ControlID).attr("errormessage", "");
    }




}

export default PriceConnectionBL;