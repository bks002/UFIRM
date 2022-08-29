
import React from 'react';
import TextAreaBox from '../ReactComponents/TextAreaBox/TextAreaBox.jsx';
import ButtonComponent from '../ReactComponents/Button/Button.jsx';
import GridTable from '../ReactComponents/Grid/GridTable.jsx';
import CommonDataProvider from "../Common/DataProvider/CommonDataProvider.js";
import ApiDataProvider from "../Common/ApiDataProvider.js";
import AppCommonjs from "../Common/AppCommon.js";
import InputBox from "../ReactComponents/InputBox/InputBox.jsx";
import { Typeahead } from 'react-bootstrap-typeahead';
import { ToastContainer, toast } from 'react-toastify';
import { debug } from 'util';
import PriceListManagementBL from './PriceListManagementBL.js';
import Commonjs from '../Common/AppCommon.js';
import UrlProvider from "../Common/ApiUrlProvider.js";
import swal from 'sweetalert';

let objBL = new PriceListManagementBL();

let objcommonjs = new Commonjs();

let url = new UrlProvider().MainUrl;

class PriceListManagement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            DisplayPriceBox: false,
            priceData: null,
            priceHeader: [
                { headerName: 'Select', field: 'PriceId-S', order: 1, type: 'checkbox' },
                { headerName: 'ID', field: 'PriceId', order: 2, type: 'int' },
                { headerName: 'Code', field: 'ItemCode', order: 3, type: 'string', orderable: true },
                { headerName: 'ItemName', field: 'ItemName', order: 4, type: 'string', orderable: true },
                { headerName: 'Price', field: 'UnitPrice', order: 5, type: 'double' },
                { headerName: 'CIG Code', field: 'CIGCode', order: 6, type: 'string' },
                { headerName: 'Status', field: 'Status', order: 7, type: 'status', orderable: true },
                { headerName: 'Update', field: 'PriceId-i', order: 8, type: 'Edit' }
            ],
            priceHeaderView: [
                { headerName: 'ID', field: 'PriceId', order: 2, type: 'int' },
                { headerName: 'Code', field: 'ItemCode', order: 3, type: 'string', orderable: true },
                { headerName: 'ItemName', field: 'ItemName', order: 4, type: 'string', orderable: true },
                { headerName: 'Price', field: 'UnitPrice', order: 5, type: 'double' },
                { headerName: 'CIG Code', field: 'CIGCode', order: 6, type: 'string' },
                { headerName: 'Status', field: 'Status', order: 7, type: 'status', orderable: true }

            ],
            PriceListDetail: {
                ListName: '',
                AccountName: '',
                CurrencyCode: '',
                StartDate: '',
                EndDate: '',
                AccountNumber: '',
                AccountId: ''
            },
            RemaingDays: null,
            dispStatus: '',
            dispRemaining: '',
            PriceListID: 0,
            Justification: '',
            SelectedIDs: [],
            SelectedItems: [],
            recordCount: 0,
            AuditLogHeader: [
                { headerName: 'SN', field: 'SN', order: 1, type: "Serial" },
                { headerName: 'Date Time', field: 'DateTime', order: 2, type: "date" },
                { headerName: 'User Name', field: 'UserName', order: 3, type: "string" },
                { headerName: 'Action', field: 'Action', order: 4, type: "string" },
            ],
            AuditLogData: null,
            ItemData: [],
            priceGridSetting: {
                "searching": true,
                "createdRow": function (row, data, index) {
                    if (data[5].includes('Deactivated') || data[5].includes('Expired')) {
                        $("#" + data[1]).attr("disabled", true);
                    }
                }
            },
            priceGridSettingView: {
                "searching": true
            },
            auditlogGridSetting: {
                "searching": false,
                "info": false,
                "paging": false

            }
        };
        this.apiData = new ApiDataProvider();
        this.CurrentDate = new Date();
        this.commonDataProvider = new CommonDataProvider();
        this.appCommonJs = new AppCommonjs();
        this.nitemCollection = [{
            Mode: 'new'
        }],
            this.currentUserName = "";
        this.CurrrentUserId = "";
        this.CurrentUserRole = "";
    }

    componentWillMount() {
        //console.log('First this called');
    }
    componentDidMount() {
        if (this.props.CallMode == "PM")// Price List management
        {
            this.currentUserName = pricelistbrowse.getAttribute('currentUserName');
            this.CurrrentUserId = pricelistbrowse.getAttribute('currentUserId');
            this.CurrentUserRole = pricelistbrowse.getAttribute('currentUserAccessRole');

        }
        else if (this.props.CallMode == "PB") // Price Browse
        {
            this.currentUserName = pricebrowse.getAttribute('currentUserName');
            this.CurrrentUserId = pricebrowse.getAttribute('currentUserId');
            this.CurrentUserRole = pricebrowse.getAttribute('currentUserAccessRole');
        }

        this.setState({ PriceListID: this.props.priceListID });

        this.apiData.getPriceListDetailById(this.props.priceListID)
            .then(resv => resv.json())
            .then(rData => {
                this.setState({ PriceListDetail: rData }, () => {
                    let todate = new Date();
                    let eod = this.state.PriceListDetail["EndDate"];
                    this.setState({ dispStatus: this.state.PriceListDetail["Status"] });
                    if (this.state.PriceListDetail["Status"] != null) {
                        if (this.state.PriceListDetail["DeactivatedOn"] != '') {
                            this.setState({ dispStatus: "Deactivated" });
                        }
                        else if (this.state.PriceListDetail["Status"] == "Expired") {

                        }
                    }
                    this.setState({ dispRemaining: this.state.PriceListDetail["Remaining"] }, () => {
                        if (this.state.dispRemaining == "Expired") {

                        }
                    });

                });
                this.LoadPriceGridData();
            });

        this.getitemconfiguration('a');
    }

    LoadPriceGridData() {
        this.setState({ priceData: [] });
        this.apiData.getPriceByPriceListId(this.props.priceListID)
            .then(resv => resv.json())
            .then(rData => {
                this.setState({ priceData: rData });
            });
    }

    SelectedValuesUpdate(sVal) {
        var selIDs = this.state.SelectedIDs.slice();
        if (selIDs.includes(sVal)) {
            var index = selIDs.indexOf(sVal);
            if (index > -1) {
                selIDs.splice(index, 1);
            }
        }
        else {
            selIDs.push(sVal);
        }
        this.setState({ SelectedIDs: selIDs });
        let item = '';
        $("#pricManagement td:contains(" + sVal + ")")
            .next().text(function () {
                item = $(this).text();
            });

        var selITems = this.state.SelectedItems.slice();
        if (selITems.includes(item)) {
            var index1 = selITems.indexOf(item);
            if (index1 > -1) {
                selITems.splice(index1, 1);
            }
        }
        else {
            selITems.push(item);
        }
        this.setState({ SelectedItems: selITems });
    }

    DeactivatePriceListByPriceListId() {
        objcommonjs.disableControl('btnDeactivatePriceList');
        var myhtml = document.createElement("div");
        myhtml.innerHTML = `<div class="cf-row">
                                    <label class="cf-label widfullimp">Deactivate Justification<span class="astrik">*</span></label>
                                    <textarea requried name="plmtxtarea" id="plmtxtarea" class="pr-textarea"></textarea>
                                </div>`
        swal({
            title: "Justification",
            content: myhtml,
            closeOnClickOutside: false,
            buttons: {
                cancel: "Cancel",
                ok: "Ok",
            },
        })
            .then((value) => {
                objcommonjs.enableControl('btnDeactivatePriceList');
                this.setState({ Justification: $("#plmtxtarea").val() });
                switch (value) {
                    case "ok":
                        objBL.CreateJustificationValidator();
                        if (objBL.ValidateJustificationiInput()) {
                            this.apiData.deactivatePriceListByPriceListId(this.state.PriceListID, this.state.Justification)
                                .then(resv => resv.json())
                                .then(rData => {

                                    //MP149 populate DN table. Changes by Basawa on May 17 2019
                                    this.commonDataProvider.UpdateDenormalization(this.state.PriceListID, 0, 'DeactPrcLst', '', '');
                                    this.setState({ recordCount: rData }, () => {
                                        let message = `${this.currentUserName} is Deactivated price list with Justification {${this.state.Justification}}`;
                                        this.commonDataProvider.createnewauditlog('P', message, this.CurrrentUserId, this.state.PriceListID);
                                        this.appCommonJs.showtextalert("Price list deactivated successfully", "", "success");
                                        $("#plmtxtarea").val('');
                                        this.ClosePriceListManagement();
                                    });
                                }).catch(error => {
                                    objcommonjs.enableControl('btnDeactivatePriceList');
                                    console.log(`Error occured ${error.state}`);
                                });
                        }
                        else {
                            this.DeactivatePriceListByPriceListId();
                        }
                        break;
                    default:
                        return;
                }
            });
    }

    DeactivateSelectedPrice() {
        let activeCount = 0;
        this.state.priceData.forEach((v, idx) => {
            if (v.Status == "Active")
                activeCount += 1;
        });
        if (this.state.SelectedIDs.length < activeCount) {
            objcommonjs.disableControl('btnDeactivateSelectedPrice');
            if (this.state.SelectedIDs != "") {
                var myhtml = document.createElement("div");
                myhtml.innerHTML = `<div class="cf-row">
                                        <label class="cf-label widfullimp">Deactivate Justification<span class="astrik">*</span></label>
                                        <textarea requried name="plmtxtarea" id="plmtxtarea" class="pr-textarea"></textarea>
                                    </div>`;
                swal({
                    title: "Justification",
                    content: myhtml,
                    closeOnClickOutside: false,
                    buttons: {
                        cancel: "Cancel",
                        ok: "Ok",
                    },
                }).then((value) => {
                    objcommonjs.enableControl('btnDeactivateSelectedPrice');
                    this.setState({ Justification: $("#plmtxtarea").val() });
                    switch (value) {
                        case "ok":
                            objBL.CreateJustificationValidator();
                            if (objBL.ValidateJustificationiInput()) {
                                this.apiData.deactivatePriceByPriceIDs(this.state.SelectedIDs.join(",").toString(), this.state.Justification)
                                    .then(resv => resv.json())
                                    .then(rData => {
                                        this.commonDataProvider.UpdateDenormalization(this.state.PriceListID, 0, 'DectPrcItem', this.state.SelectedIDs.join(",").toString(), '');
                                        this.setState({ recordCount: rData }, () => {
                                            let message = `${this.currentUserName} is Deactivated the price for {${this.state.SelectedItems}} with Justification {${this.state.Justification}}`;
                                            this.commonDataProvider.createnewauditlog('P', message, this.CurrrentUserId, this.state.PriceListID);
                                            this.appCommonJs.ShownotifySuccess("Prices deactivated successfully");
                                            $("#plmtxtarea").val('');
                                            this.setState({ priceData: null });
                                            this.setState({ AuditLogData: null });
                                            this.setState({ Justification: '' });
                                            this.setState({ SelectedIDs: [] });
                                            this.setState({ SelectedItems: [] });
                                            this.setState({ recordCount: 0 });
                                            this.LoadPriceGridData();
                                        });
                                    });
                            }
                            else {
                                this.DeactivateSelectedPrice();
                            }
                            break;
                        default:
                            return;
                    }
                });
            }
            else {
                objcommonjs.enableControl('btnDeactivateSelectedPrice');
                this.appCommonJs.ShownotifyError("Please select an item to deactivate");
            }
        }
        else {
            objcommonjs.showtextalert("You can't delete all price you can deactivate price list instead", '', 'info');
        }

    }

    ClosePriceListManagement() {
        this.setState({ PriceListDetail: null });
        this.setState({ AuditLogData: null });
        this.setState({ RemaingDays: null });
        this.setState({ priceData: null });
        this.setState({ Justification: '' });
        this.setState({ PriceListID: 0 });
        this.setState({ SelectedIDs: [] });
        this.setState({ SelectedItems: [] });
        this.setState({ recordCount: 0 });
        this.props.onCancel();
    }

    ShowAuditLog() {
        this.setState({ AuditLogData: null });
        this.apiData.getAuditLog('P', this.state.PriceListID)
            .then(json => json.json())
            .then(rData => {
                if (rData.length > 0) {
                    rData.map((value, idx) => {
                        rData[idx].SN = idx + 1;
                    });
                    objcommonjs.ClearTableGrid('tblAuditLog');
                    this.setState({ AuditLogData: rData }, () => {
                        $('#logpanel').addClass('show-logpanel');
                    });
                }
            });
    }

    CloseLogPanel() {
        $('#logpanel').removeClass('show-logpanel');
        this.setState({ AuditLogData: [] });
    }

    ShowCreatePrice() {

        let iscreateprice = this.state.DisplayPriceBox == true ? false : true;
        this.setState({ DisplayPriceBox: iscreateprice }, () => {
            objBL.CreatePriceValidator();
        });
    }

    // # Add new Item Price code
    CreateAuditlogonPriceCreate() {

        let message = `${this.currentUserName} created new price for {${this.nitemCollection[0].ItemCode} - ${this.nitemCollection[0].UnitPrice}} with Justification {${this.nitemCollection[0].Justification}}`;
        this.commonDataProvider.createnewauditlog('P', message, this.CurrrentUserId, this.state.PriceListID);
    }

    AddPriceinPrceGrid() {
        let json = this.state.priceData
        let id = json.length + 1;
        let temitems = [{}]
        let status = this.state.dispStatus;
        if (json.length > 0) {
            temitems = json.slice();
            temitems.push({
                ItemCode: this.nitemCollection[0].ItemCode,
                ItemName: this.nitemCollection[0].ItemName,
                PriceId: this.nitemCollection[0].PriceId,
                Status: status,
                CIGCode: '0000000000',
                UnitPrice: this.nitemCollection[0].UnitPrice
            });
        }
        else {
            temitems = [{
                ItemCode: this.nitemCollection[0].ItemCode,
                ItemName: this.nitemCollection[0].ItemName,
                PriceId: this.nitemCollection[0].PriceId,
                Status: status,
                CIGCode: '0000000000',
                UnitPrice: this.nitemCollection[0].UnitPrice
            }]
        }
        this.setState({ priceData: temitems }, () => {
            this.appCommonJs.ShownotifySuccess("Price created successfully");
        });
        this.setState({ Justification: '' });
    }

    CheckDuplicateItem() {
        if (this.state.priceData.length > 0) {
            let value = undefined
            value = this.state.priceData.find((item, idx) => {
                return (item.ItemCode == this.nitemCollection[0].ItemCode) && (item.Status != "Deactivated");
            })
            if (value == undefined) {

                return true;
            }
            else {
                this.appCommonJs.ShownotifyError(`Item ( ${this.nitemCollection[0].ItemCode} ) ${this.nitemCollection[0].ItemName} is already exist`);
                this.tahItem.getInstance().clear();
                return false;
            }
        }
        return true;
    }
    CreateNewItemPrice() {
        objcommonjs.disableControl('btnSavePrice');
        if (objBL.ValidatePrice()) {
            //this.apiData.CheckDuplicatePriceForPriceLock
            this.SaveItempriceinList();

        }
        else {
            objcommonjs.enableControl('btnSavePrice');

        }
    }
    SaveItempriceinList() {
        if (this.CheckDuplicateItem()) {
            //check duplicate price in db 
            this.apiData.CheckDuplicatePriceForPriceLock(this.state.PriceListDetail["AccountId"], this.appCommonJs.GetSQLformatDate(this.state.PriceListDetail["StartDate"]), this.appCommonJs.GetSQLformatDate(this.state.PriceListDetail["EndDate"]), this.nitemCollection[0].ItemId)
                .then(rData => {
                    if (rData.length > 0) {

                        let pobject = rData[0];
                        if (pobject.ConnectionProfileId <= 0) {
                            this.appCommonJs.ShownotifyError(`Price Lock is found for Item ( ${this.nitemCollection[0].ItemCode} ) in GPO  (${pobject.GPOName}) for Priority (${pobject.Priority}) and from date (${pobject.StartDate}) to (${pobject.EndDate})`);
                        }
                        else {
                            this.appCommonJs.ShownotifyError(`Item ( ${this.nitemCollection[0].ItemCode} ) price is already exist in pricelist (${pobject.GPOName}) from date (${pobject.StartDate}) to (${pobject.EndDate})`);
                        }
                        this.tahItem.getInstance().clear();
                        return false;
                    }
                    else {
                        this.AddjustificationAndCreatePrice();
                    }
                });
        }
    }
    onitemselectd(value) {
        if (value.length > 0) {
            this.nitemCollection[0].ItemId = value[0].ItemId;
            this.nitemCollection[0].ItemCode = value[0].ItemCode;
            this.nitemCollection[0].ItemName = value[0].Name2;
        }
    }
    onPriceChange(e) {
        this.nitemCollection[0].UnitPrice = e;
    }

    getitemconfiguration(e) {
        if (e != "") {
            let db = new CommonDataProvider();
            db.getitems(e, '').then(
                resp => resp.json()).then(
                    jsdata => {
                        this.setState({ ItemData: jsdata })
                    }
                );
        }
    }

    DownlaodExcel(type) {

        if (this.state.priceData.length > 0) {
            objcommonjs.openprogressmodel('File download is in progress', 9000);
            this.apiData.CreatePriceListMgmtDownloadFile(this.props.priceListID, type)
                .then(resv => resv.json())
                .then(rData => {

                    swal.close();
                    if (rData != "No Record Found" && rData != "Internal Server Error") {

                        window.location = url + `/PricingCommon/DownloadFile?filename=${rData}`;
                    } else {
                        console.log(rData);
                    }
                })
                .catch(error => {
                    console.log(`Error occured during file download`);
                });
        }
    }

    AddjustificationAndCreatePrice() {

        var myhtml = document.createElement("div");
        myhtml.innerHTML = `<div class="cf-row">
                                <label class="cf-label widfullimp">Justification<span class="astrik">*</span></label>
                                <textarea requried name="plmtxtarea" id="plmtxtarea" class="pr-textarea"></textarea>
                            </div>`
        swal({
            title: "Justification",
            content: myhtml,
            closeOnClickOutside: false,
            buttons: {
                cancel: "Cancel",
                ok: "Ok",
            },
        })
            .then((value) => {
                objcommonjs.enableControl('btnSavePrice');
                switch (value) {
                    case "ok":
                        objBL.CreateJustificationValidator();
                        if (objBL.ValidateJustificationiInput('C')) {
                            this.setState({ Justification: $("#plmtxtarea").val() });
                            this.nitemCollection[0].Justification = $("#plmtxtarea").val();
                            this.nitemCollection[0].CreatedBy = this.CurrrentUserId;
                            this.nitemCollection[0].PriceListId = this.state.PriceListID;
                            this.apiData.AddItemPriceInPriceList(this.nitemCollection).then(
                                json => json.json()
                            ).then(
                                jsresult => {
                                    this.tahItem.getInstance().clear();
                                    $("#plmtxtarea").val('');
                                    this.nitemCollection[0].PriceId = jsresult;
                                    //MP149 populate DN table. Changes by Basawa on May 17 , 2019
                                    this.commonDataProvider.UpdateDenormalization(this.state.PriceListID, 0, 'Upd', this.nitemCollection[0].PriceId, '');
                                    this.AddPriceinPrceGrid();
                                    this.CreateAuditlogonPriceCreate();
                                    $('#txtprice').val('');
                                }

                            );
                        }
                        else {
                            this.AddjustificationAndCreatePrice();
                        }
                        break;
                    default:
                        return;
                }
            });

    }
    ClearTyeahead(type, event) {
        if (type == 'I') {
            var option = this.tahItem.props.options;
            if (!option.includes(event.target.value))
                this.tahItem.getInstance().setState({ text: '' });
        }

    }

    OnPriceEdit(priceId) {
        let index = undefined;
        let curretnItem = this.state.priceData.find((item, idx) => {
            index = idx;
            return (item.PriceId == priceId);
        })
        if (curretnItem.Status == 'Active' || curretnItem.Status == 'Future') {
            var myhtml = document.createElement("div");
            myhtml.innerHTML = `<div class="cf-row">
                                <label class="cf-label widfullimp">Enter C.I.G Code<span class="astrik">*</span></label>
                                <input autocomplete="off" maxlength="10" type="text" value='${curretnItem.CIGCode}' name="txtCIGcode" id="txtCIGcode" class="form-control ui-inputbox" placeholder="CIG Code"/>
                            </div>`
            swal({
                title: "Update C.I.G Code",
                content: myhtml,
                closeOnClickOutside: false,
                buttons: {
                    cancel: "Cancel",
                    ok: "Update",
                },
            })
                .then((value) => {

                    let CIGcode = $("#txtCIGcode").val()
                    if (CIGcode != '') {

                        if (value == 'ok' && curretnItem.CIGCode != CIGcode) {
                            this.apiData.UpdatePrice(this.CurrrentUserId, priceId, CIGcode).then(
                                json => json.json()
                            ).then(
                                jsresult => {
                                    let message = `${this.currentUserName} update C.I.G. Code {${CIGcode}} for Item {${curretnItem.ItemCode} }`;
                                    this.commonDataProvider.createnewauditlog('P', message, this.CurrrentUserId, this.state.PriceListID);
                                    this.commonDataProvider.UpdateDenormalization(this.state.PriceListID, 0, 'Upd', curretnItem.PriceId, '');
                                    this.componentDidMount();
                                    this.appCommonJs.showtextalert("Price update successfully", "", "success");
                                })
                        }
                    }
                    else {
                        if (value == 'ok')
                            this.OnPriceEdit(priceId);
                    }
                });
        }

    }







    render() {
        return (
            <div id="priceListManage" className="pr-connection-main">

                <fieldset>
                    <legend>Price List Management</legend>

                    <div className="pr-fullwidth">
                        <div className="pd-half-left">
                            <div>
                                <div className="cf-row">
                                    <label className="cf-label">Price List Name <span className="colon">:</span></label>
                                    <div className="cf-text-cover ellipsiss">{this.state.PriceListDetail["ListName"]}</div>
                                </div>
                                <div className="cf-row">
                                    <label className="cf-label">Account <span className="colon">:</span></label>
                                    <div className="cf-text-cover ellipsiss">{this.state.PriceListDetail["AccountName"]}</div>
                                </div>
                                <div className="cf-row">
                                    <label className="cf-label">Currency <span className="colon">:</span></label>
                                    <div className="cf-text-cover ellipsiss">{this.state.PriceListDetail["CurrencyCode"]}</div>
                                </div>
                            </div>
                        </div>
                        <div className="pd-half-right">
                            <div>
                                <div className="cf-row">
                                    <label className="cf-label">Start Date <span className="colon">:</span></label>
                                    <div className="cf-text-cover ellipsiss">
                                        {this.state.PriceListDetail["StartDate"]}
                                    </div>
                                </div>
                                <div className="cf-row">
                                    <label className="cf-label">End Date <span className="colon">:</span></label>
                                    <div className="cf-text-cover ellipsiss">
                                        {this.state.PriceListDetail["EndDate"]}
                                        {this.state.dispRemaining == 'Expired' && this.state.dispStatus != 'Deactivated' &&
                                            <span className="red"> &nbsp;&nbsp;&nbsp; ({this.state.dispRemaining})</span>
                                        }
                                        {this.state.dispRemaining != 'Expired' && this.state.dispStatus != 'Deactivated' &&
                                            <span className="green"> &nbsp;&nbsp;&nbsp; ({this.state.dispRemaining})</span>
                                        }
                                    </div>
                                </div>
                                <div className="cf-row">
                                    <label className="cf-label">Status <span className="colon">:</span></label>
                                    <div className="cf-text-cover ellipsiss"><span className={this.state.dispStatus.toLowerCase()}>{this.state.dispStatus}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pr-fullwidth anim-price">
                        {this.state.DisplayPriceBox == true &&
                            <div className="cf-row " id="CreatePriceBlock">
                                <div className="pr-fullwidth">
                                    <div id="txtItem" className="pu-itemprice pull-left">
                                        <Typeahead ref={(typeahead) => this.tahItem = typeahead} searchText="Searching.."
                                            labelKey="Name"
                                            onChange={this.onitemselectd.bind(this)}
                                            onInputChange={this.getitemconfiguration.bind(this)}
                                            options={this.state.ItemData}
                                            placeholder="Type Item Name/Code"
                                            onBlur={this.ClearTyeahead.bind(this, 'I')}
                                        />
                                    </div>
                                    <div className="pu-itemprice pull-left">
                                        <InputBox PlaceHolder="Price" Name="Item" Id="txtprice" onChange={this.onPriceChange.bind(this)} />
                                    </div>
                                    <ButtonComponent ClassName="d-blue-button pr-pull-left space-left"
                                        Text=" Save" ID='btnSavePrice'
                                        Action={this.CreateNewItemPrice.bind(this)}
                                    />
                                </div>
                            </div>
                        }
                    </div>
                    <div className="pr-fullwidth">
                        <div className="pull-left">
                            <div className="dropdown prdd">
                                <button className=" btn btn-secondary dropdown-toggle d-blue-button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    Export
                                    </button>
                                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <a className="dropdown-item" title="Downlaod Price List Management Excel file" onClick={this.DownlaodExcel.bind(this, 'Excel')} href="#">Excel <span class="excel-icon"></span></a>
                                    <a className="dropdown-item" title="Download Price List Management CSV file" onClick={this.DownlaodExcel.bind(this, 'CSV')} href="#">CSV <span class="csv-icon"></span></a>
                                </div>
                            </div>
                        </div>

                        {this.state.dispStatus != 'Expired' && this.state.dispStatus != 'Deactivated' && this.CurrentUserRole == "Edit" &&
                            <div>
                                <ButtonComponent ID="btnDeactivateSelectedPrice" ClassName="d-blue-button pr-pull-left space-right index-high" Text="Deactivate" Action={this.DeactivateSelectedPrice.bind(this)} />
                                <div className="pull-left index-high">
                                    <ButtonComponent Icon={<i className="fa fa-plus" aria-hidden="true"></i>} Action={this.ShowCreatePrice.bind(this)} ID="CreatePrice" ClassName="d-blue-button pr-pull-right" Text="Create Price" />
                                </div>
                            </div>
                        }
                    </div>
                    <div className="pr-fullwidth fkmartp">
                        {this.CurrentUserRole == "Edit" &&
                            <GridTable gridID="pricManagement"
                                isTableGrid="True"
                                GridSeetingData={this.state.priceGridSetting}
                                TableHeader={this.state.priceHeader}
                                TableRow={this.state.priceData}
                                onEdit={this.OnPriceEdit.bind(this)}
                                onGridAction={this.SelectedValuesUpdate.bind(this)} />
                        }
                        {this.CurrentUserRole != "Edit" &&
                            <GridTable gridID="pricManagementView"
                                isTableGrid="True"
                                GridSeetingData={this.state.priceGridSettingView}
                                TableHeader={this.state.priceHeaderView}
                                onEdit={this.OnPriceEdit.bind(this)}
                                TableRow={this.state.priceData} />
                        }
                    </div>
                    <div className="pr-fullwidth-padd pr-bar-fixed">
                        <ButtonComponent ClassName="d-grey-button pr-pull-right space-left" Text="Close" Action={this.ClosePriceListManagement.bind(this)} />
                        <ButtonComponent ClassName="d-blue-button pr-pull-right space-left" Action={this.ShowAuditLog.bind(this)} Text="Audit History" />
                        {this.state.dispStatus != 'Expired' && this.state.dispStatus != 'Deactivated' && this.CurrentUserRole == "Edit" &&
                            <ButtonComponent ID="btnDeactivatePriceList" ClassName="d-blue-button pr-pull-right index-high" Text="Deactivate Price List" ID='btnDeactivatePriceList' Action={this.DeactivatePriceListByPriceListId.bind(this)} />
                        }
                    </div>
                </fieldset>
                <div id="logpanel">
                    {this.state && this.state.PriceListDetail &&
                        <div className="pr-fullwidth card-title">
                            <div className="pr-heading" >Audit Log</div>
                            <div className="pr-cid" >Account Name :  {this.state.PriceListDetail["AccountName"]}  </div>
                        </div>
                    }
                    <div className="log-table">
                        <div className="pr-fullwidth">
                            <GridTable Id="tblAuditLog"
                                TableHeader={this.state.AuditLogHeader}
                                GridSeetingData={this.state.auditlogGridSetting}
                                TableRow={this.state.AuditLogData}
                            />

                        </div>
                    </div>
                    <ButtonComponent Action={this.CloseLogPanel.bind(this)} ClassName="d-grey-button pr-pull-right" Text="Close" />
                </div>
                <ToastContainer></ToastContainer>
            </div>
        );
    }
}

export default PriceListManagement;