import React from 'react';
import InputBox from '../ReactComponents/InputBox/InputBox.jsx';
import CommonDataProvider from "../Common/DataProvider/CommonDataProvider.js";
import CommonTitleHeader from '../ReactComponents/CommonTitleHeader/CommonTitleHeader.jsx';
import ButtonComponent from '../ReactComponents/Button/Button.jsx';
import DropDownComponent from '../ReactComponents/Dropdown/DropDownComponent.jsx';
import SelectBox2 from '../ReactComponents/SelectBox/Selectbox.jsx';
import SwitchYesNo from '../ReactComponents/SwitchYesNo/SwitchYesNo.jsx';
import APIUrlProvider from './PricingConnectionBL.js';
import ConnectionItemConfiguration from "./ConnectionItemConfiguration.jsx";
import NumericInput from 'react-numeric-input';
import ConnectionDBProvider from "../Common/DataProvider/ConnectionDataProvider.js";
import SplitButtonComponent from "../ReactComponents/SplitButton/SplitButton.jsx";
import FileUploader from "../ReactComponents/FileUploader/FileUploader.jsx"
import UrlProvider from "../Common/ApiUrlProvider.js";
import ConnectionBL from "./PricingConnectionBL.js";
import Label from '../ReactComponents/Label/Label.jsx';
import Shield from "../ReactComponents/Shield/Shield.jsx";
import Table from '../ReactComponents/Table/Table.jsx';
import { Typeahead } from 'react-bootstrap-typeahead';
import {
    Accordion,
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
} from 'react-accessible-accordion';
import ItemConfigTable from '../ReactComponents/ItemConfigTable/ItemConfigTable.jsx';
import GridTable from '../ReactComponents/Grid/GridTable.jsx';
import CalendarJs from '../ReactComponents/Calendar/Calendar.jsx';
import Autocomplete from "../ReactComponents/Autocomplete/Autocomplete.jsx";
import { debug } from 'util';
import swal from 'sweetalert';
import Commonjs from '../Common/AppCommon.js';
import ToastNotify from '../ReactComponents/ToastNotify/ToastNotify.jsx';
import { ToastContainer, toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
import validationprovider from '../Common/Validation/ValidationProvider.js';
import TextAreaBox from '../ReactComponents/TextAreaBox/TextAreaBox.jsx';
import ApiDataProvider from "../Common/ApiDataProvider.js";
import AppCommon from '../Common/AppCommon.js';
import DataGrid from '../ReactComponents/DataGrid/DataGrid.jsx';

//Global declaration
let db = new CommonDataProvider();
let objBL = new ConnectionBL();
let odbconnection = new ConnectionDBProvider();
let objcommonjs = new Commonjs();
let currentuser = parseInt(app.getAttribute('currentUserId'));
let olddatevalue = '';
let apiData = new ApiDataProvider();
let objvld = new validationprovider();
let dupcusto = [];
let CustomerPriceLockLabel = "";
let ConnectToLabel = "";
// let showexpired = false;
// let showfuture = false;
// let showDeactivated = false;
// let showActive =false;
let phrases = [];
let currencyCode = '';
let eInputParam = null;
//End
class PricingConnection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            IsGridLoaded: false,
            AuditLogGPOName: "",
            AlertMessage: "Message",
            ConnectToLable: "",
            AllItemLabel: "",
            PriorityLabel: "",
            ConnectionBreakLabel: "",
            CustomerPriceLockLabel: "",
            StartDateLabel: "",
            EndDateLabel: "",
            StartDate: "",
            EndDate: "",
            ConnectionProfileId: 0,
            displaymode: "Home",
            show: "ds",
            itemconfigdisplaymode: "true",
            connecttodata: [],
            custjsondata: [],
            tempcustomerdata: [],
            CustomerData: [],

            customerdata: [
            ],
            customerheaders: [

                { headerName: 'Name', field: 'Name', order: 2 },
                { headerName: 'Code', field: 'AccountCode', order: 1 },
                { headerName: 'City', field: 'City', order: 3 },
                { headerName: 'Added On', field: 'CreatedOn', order: 4, type: 'string' },
                { headerName: 'Delete', field: 'AccountCode-s', order: 5, type: 'Delete' }
            ],
            headers: [
                { headerName: 'Product Id', field: 'ProdId', order: 1 },
                { headerName: 'Product Name', field: 'ProdName', order: 2 },
                { headerName: 'Price', field: 'Price', order: 5 },
                { headerName: 'Category Name', field: 'CategoryName', order: 4 },
                { headerName: 'Manufacturer', field: 'Manufacturer', order: 3 }
            ],
            HomeGridHeaders: [
                // { headerName: 'Select', field: 'ConnectionProfileId-A', order: 1, type: 'checkbox' },
                // { headerName: 'Id', field: 'ConnectionProfileId', order: 1 },
                // { headerName: 'GPO Name', field: 'Name', order: 2, type: 'string', orderable: true },
                // { headerName: 'Priority', field: 'Priority', order: 3, type: 'string' },
                // { headerName: 'All Items', field: 'AllItems', order: 4, type: 'string' },
                // { headerName: 'Start Date', field: 'StartDate', order: 5, type: 'string' },
                // { headerName: 'End Date', field: 'EndDate', order: 6, type: 'string' },
                // { headerName: 'Created', field: 'CreatedOn', order: 7, type: 'date' },
                // { headerName: 'Status', field: 'Status', order: 8, type: 'status', orderable: true },
                // { headerName: 'Created By', field: 'UserName', order: 9, type: 'string' },
                // { headerName: 'View', field: 'ConnectionProfileId-s', order: 10, type: 'Edit' }
                { sTitle: 'Select', title: 'Select', className: 'dt-center', StatusColumn: "Status", Index: "1", "orderable": false },
                { sTitle: 'Id', title: 'ConnectionProfileId', "orderable": false },
                {  sTitle: 'GPO Name', title: 'Name', "orderable": true },
                { sTitle: 'Priority', title: 'Priority',"orderable":false},
                { sTitle: 'All Items',  title: 'AllItems',"orderable":false},
                { sTitle: 'Start Date', title: 'StartDate',"orderable":false},
                {  sTitle: 'End Date',  title: 'EndDate',"orderable":false},
                {  sTitle: 'Created',  title:'CreatedOn', "orderable":false},
                { sTitle: 'Status',  title: 'Status', Type: "Status", "orderable": true },
                {  sTitle: 'Created By',  title: 'UserName', "orderable":false },
                {  sTitle: 'Action',  title: 'Action', Action: "Edit", Index: '1', "orderable": false  }
            ],
            HomeGridHeadersView: [
            //    // { headerName: 'Select', field: 'ConnectionProfileId-A', order: 1, type: 'checkbox' },
            //     { headerName: 'Id', field: 'ConnectionProfileId', order: 1 },
            //     { headerName: 'GPO Name', field: 'Name', order: 2, type: 'string', orderable: true },
            //     { headerName: 'Priority', field: 'Priority', order: 3, type: 'string' },
            //     { headerName: 'All Items', field: 'AllItems', order: 4, type: 'string' },
            //     { headerName: 'Start Date', field: 'StartDate', order: 5, type: 'string' },
            //     { headerName: 'End Date', field: 'EndDate', order: 6, type: 'string' },
            //     { headerName: 'Created', field: 'CreatedOn', order: 7, type: 'date' },
            //     { headerName: 'Status', field: 'Status', order: 8, type: 'status', orderable: true },
            //     { headerName: 'Created By', field: 'UserName', order: 9, type: 'string' },
            //     { headerName: 'View', field: 'ConnectionProfileId-s', order: 10, type: 'View' }
                { sTitle: 'Id', title: 'ConnectionProfileId',Index: "0", "orderable": false },
                {  sTitle: 'GPO Name', title: 'Name', "orderable": true },
                { sTitle: 'Priority', title: 'Priority',"orderable":false},
                { sTitle: 'All Items',  title: 'AllItems',"orderable":false},
                { sTitle: 'Start Date', title: 'StartDate',"orderable":false},
                {  sTitle: 'End Date',  title: 'EndDate',"orderable":false},
                {  sTitle: 'Created',  title:'CreatedOn', "orderable":false},
                { sTitle: 'Status',  title: 'Status', Type: "Status", "orderable": true },
                {  sTitle: 'Created By',  title: 'UserName', "orderable":false },
                {  sTitle: 'Action', title: 'Action', Action: "View", Index: '0', "orderable": false  }
            ],
            Justification: '',
            IsValid: false,
            SelectedIDs: [],
            ConnectionProfileData: null,
            callType: "1",
            ItemPlaceHolder: "Type Division name",
            operatorvalue: "Equal",
            ddlitemvalue: "Division",
            itemvalue: "",
            itemdata: [],
            UploadUrl: "Connection/UploadCustomersList?UserId=",
            FileUploadApiUrl: "",
            alert: null,
            ConnectionProfileModel: [
                {
                    AccountId: 0,
                    StartDate: "",
                    EndDate: "",
                    Priority: 0,
                    CreatedBy: currentuser,
                    IsAllItems: 0,
                    IsBreakOut: 0,
                    IsPriceLock: 0,
                    SqlQuery: "",
                    ListOfAccounts: "",
                    QueryJson: "",
                    GPOName: "",
                    EditId: 0
                }
            ],
            Priorityvalue: 0,
            ExistingConfigurationData: [],
            AuditLogHeader: [
                { headerName: 'SN', field: 'SN', order: 1, type: "Serial" },
                { headerName: 'Date Time', field: 'DateTime', order: 2 },
                { headerName: 'User Name', field: 'UserName', order: 3 },
                { headerName: 'Action', field: 'Action', order: 4 },
            ],
            grdTotalPages: 0,
            grdTotalRows: 0,
            AuditLogData: [],
            MaxPriority: 99,
            MinPriority: 0,
            DuplicateCustomerList: [],
            MainPageGridSetting: {
                "order": [[1, "desc"]],
                "createdRow": function (row, data, index) {
                    if (data[8].includes('Deactivated') || data[8].includes('Expired')) {
                        $("#" + data[1]).attr("disabled", true);
                    }
                }
            },
            CustomerGridSetting: {
                "order": [[1, "desc"]],
            },
            serviceInputs: [{
                UserId:currentuser,
                FilterType: 'Active,Future',
                SearchValue: '',
                PageSize: 10,
                PageNumber: 1,
            }],
        };
        this.ConnectionStartDate = new Date((new Date()).setDate((new Date()).getDate() + 1));
        this.ispricelockfound = false;


    }
    //Sukanya 11/14/2019
    createFilterDropDown() {
        let object = this;
        
        $('#connectionfillterlist').multiselect({
            onSelectAll: function () {
                object.filterOnChange();
            },
            onDeselectAll: function () {
                object.filterOnChange();
            },
            onChange: function (option, checked, select) {
                object.filterOnChange();
            }
        });
    }

    // By Aditya For Adding Deactivate Functionality Start
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
    }
    //#Deact
    DeactivateSelectedGPOs() {
        if (this.state.SelectedIDs != "") {
            var myhtml = document.createElement("div");
            myhtml.innerHTML = `<div class="cf-row">
                                    <label class="cf-label widfullimp">Deactivate Justification<span class="astrik">*</span></label>
                                    <textarea requried name="pctxtarea" id="pctxtarea" class="pr-textarea"></textarea>
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
                    this.setState({ Justification: $("#pctxtarea").val() });
                    switch (value) {
                        case "ok":
                            if (this.state.Justification != "" && this.state.SelectedIDs != "") {
                                apiData.deactivateConnectionProfile(this.state.SelectedIDs.join(",").toString(), this.state.Justification, currentuser)
                                    .then(resv => resv.json())
                                    .then(rData => {
                                        this.setState({ recordCount: rData }, () => {
                                            this.state.SelectedIDs.forEach((v, idx) => {
                                                let acName = '';
                                                $("#grdConnectionProfile td:contains(" + v + ")")
                                                    .next().text(function () {
                                                        acName = $(this).text();
                                                    });
                                                let message = `Deactivated Connection Profile ${acName} with Justification ${this.state.Justification}`;
                                                db.createnewauditlog('C', message, currentuser, v);
                                            });
                                            objcommonjs.showtextalert("Connection Profile deactivated successfully", "", "success");

                                            // Sanjay Apr 24 19
                                            // Repopulate denormalization table
                                            if (this.state.SelectedIDs.length > 0) {
                                                //MP149 populate DN table. Changes by Basawa on May 17 2019
                                                db.UpdateDenormalization(0, 0, 'DeactConProf', '', this.state.SelectedIDs.join(",").toString())
                                            }

                                            this.setState({ Justification: '' });
                                            this.setState({ SelectedIDs: [] });
                                            this.OnCancel();
                                        });
                                    });
                            }
                            else {
                                if (this.state.Justification != "") {
                                    objcommonjs.ShownotifyError("Please select Connection to deactivate");
                                }
                                else {
                                    objcommonjs.ShownotifyError('Please enter justification to deactivate Connection Profile');
                                    this.DeactivateSelectedGPOs();
                                }
                            }
                            break;
                        default:
                            return;
                    }
                });
        }
        else {
            objcommonjs.ShownotifyError("Please select Connection to deactivate");
        }
    }
    // By Aditya For Adding Deactivate Functionality End
    onallitemsselected(src) {
        if ($(src.target).prop('checked')) {
            this.state.ConnectionProfileModel[0].IsAllItems = 1;
            this.state.ConnectionProfileModel[0].SqlQuery = "";
            this.setState({ itemconfigdisplaymode: "false", MaxPriority: 199,
            MinPriority: 100,
            Priorityvalue: 100}, ()=>{
                this.setConnectionModelState();
            })
            
        //    this.setState({ MaxPriority: 199 });
            //this.setState({ MinPriority: 100 });
            //this.setState({ Priorityvalue: 100 })

        }
        else {
            this.state.ConnectionProfileModel[0].IsAllItems = 0;
            this.setState({ itemconfigdisplaymode: "true", MaxPriority: 99,
            MinPriority: 0, Priorityvalue: 0 },()=>{
                this.setConnectionModelState();
            })
            //this.setState({ MaxPriority: 99 });
            //this.setState({ MinPriority: 0 });
            //this.setState({ Priorityvalue: 0 })
        }
        
    }
    // connecto auto complete event
    getconnectto(e) {
        //MP -139 currency validation
        if (e == '' && this.state.custjsondata.length <= 0 && this.state.tempcustomerdata.length <= 0) {
            currencyCode = '';
            this.getcustomerdata(eInputParam);
        }
        let searchVal;
        if (e == '' || e == null) {
            searchVal = null;
        } else {
            searchVal = e.trim();
        }
        this.setState({ connecttodata: [] });
        db.getgpo(searchVal, "", currencyCode,currentuser).then(
            resp => resp.json()).then(rData => {
                this.setState({ connecttodata: rData })

            })
    }

    getcustomerdata(e) {
        let searchVal;
        //MP -139 currency validation
        if (e == '' && this.state.custjsondata.length <= 0 && this.state.ConnectionProfileModel.length == 1 && this.state.ConnectionProfileModel[0].AccountId == 0) {
            currencyCode = '';
            this.getconnectto(null);
        }
        //if type box is cleared then reset the list. 
        if (e == '' || e == null) {
            searchVal = null;
        } else {
            searchVal = e.trim();
        }
        this.setState({ CustomerData: [] });
        db.getcustomer(searchVal, "", currencyCode,currentuser).then(
            resp => resp.json()).then(
                jsdata => this.setState({ CustomerData: jsdata })
            ).catch(error => console.log(`Eror:${error}`))

    }
    onconnecttoselected(value) {
        if (value.length > 0) {

            this.state.ConnectionProfileModel[0].AccountId = value[0].AccountId;
            this.state.ConnectionProfileModel[0].GPOName = value[0].SearchColumn;
            this.setConnectionModelState();

            //MP -139 currency validation
            if (currencyCode == '' && this.state != null && this.state.custjsondata.length <= 0 && this.state.tempcustomerdata.length <= 0) {
                currencyCode = value[0].QADCode;
                this.getcustomerdata(eInputParam);
            }
        } else {
            this.state.ConnectionProfileModel[0].AccountId = 0;
            this.state.ConnectionProfileModel[0].GPOName = '';
            if (currencyCode == '' && this.state != null && this.state.custjsondata.length <= 0 && this.state.tempcustomerdata.length <= 0) {
                currencyCode = '';
            }

        }


    }

    setConnectionModelState() {
        this.setState({ ConnectionProfileModel: this.state.ConnectionProfileModel });
    }

    oncustomerselected(value) {
        let typedata = [];
        if (value.length > 0) {
            typedata = [{
                AccountCode: value[0].AccountCode,
                Name: value[0].Name,
                City: value[0].City,
                Id: value[0].AccountId,
                CreatedOn: moment(new Date().toLocaleDateString(), "MM-DD-YYYY").format("DD-MM-YYYY")
            }]
            this.setState({ tempcustomerdata: typedata });

            //MP -139 currency validation
            if (currencyCode == '' && this.state != null && this.state.custjsondata.length <= 0) {
                if (this.state.ConnectionProfileModel.length == 1 && this.state.ConnectionProfileModel[0].AccountId == 0) {
                    currencyCode = value[0].QADCode;
                    this.getconnectto(null);
                }
            }
        } else {
            this.setState({ tempcustomerdata: [] });
            if (this.state.custjsondata.length <= 0 && this.state.ConnectionProfileModel.length == 1 && this.state.ConnectionProfileModel[0].AccountId == 0) {
                currencyCode = '';
            }

        }
    }
    deletecustomer(id) {

    }
    onConnectionSearch(arg) {
        if (arg.length > 0) {
            this.state.serviceInputs[0].SearchValue = arg[0].AccountCode;
        }
        else {
            this.state.serviceInputs[0].SearchValue = "";
        }
        this.state.serviceInputs[0].PageNumber = 1;
        this.GetConnectionProfile();
        
    }
    createnewincustomerjson(json, type) {
        let data = [{}];
        let customerAccountId = 0;
        let itemid = 0;
        if (type == 1) {
            itemid = json.Id;
            customerAccountId = json.AccountId;

        }
        else {
            this.tahCustomers.getInstance().clear();
            customerAccountId = json.Id;
        }
        if (this.state.custjsondata.length > 0) {
            data = this.state.custjsondata.slice();
            data.push({
                AccountCode: json.AccountCode,
                Name: json.Name,
                City: json.City,
                Delete: json.Id,
                Id: json.Id,
                ItemId: itemid,
                CreatedOn: moment(json.CreatedOn, "DD-MM-YYYY").format("MM-DD-YYYY"),
                AccountId: customerAccountId
            });
            this.setState({ custjsondata: data });

        }
        else {
            data = [{
                AccountCode: json.AccountCode,
                Name: json.Name,
                City: json.City,
                Delete: json.Id,
                Id: json.Id,
                ItemId: itemid,
                CreatedOn: moment(json.CreatedOn, "DD-MM-YYYY").format("MM-DD-YYYY"),
                AccountId: customerAccountId
            }]

            this.setState({ custjsondata: data });
            if (this.state.displaymode != "Edit") {
                if (this.state.ConnectionProfileModel.length == 1 && this.state.ConnectionProfileModel[0].AccountId == 0) {
                    this.getcustomerdata(eInputParam);
                }
            } else {
                currencyCode = json.CurrencyCode;
            }

        }
    }

    addcustomer() {
        if (this.state.tempcustomerdata.length > 0) {
            let value = undefined
            value = this.state.custjsondata.find((item, idx) => {
                return item.AccountCode == this.state.tempcustomerdata[0].AccountCode;
            })
            if (value == undefined) {

                this.createnewincustomerjson(this.state.tempcustomerdata[0], 0)
            }
            else {
                objcommonjs.ShownotifyError(`Customer ( ${value.AccountCode} ) ${value.Name} is already`);
                this.tahCustomers.getInstance().clear();
            }
            this.setState({ tempcustomerdata: [] });
        }
    }
    //#sa
    OnConnectionSave(type) {
        objcommonjs.disableControl('btnSave');
        let duplicatelenght = 0
        if (objBL.ValidateConnection(type)) {
            let haserror = false;
            let priorityid = 'divpriority .react-numeric-input input';
            if (type != 'U') {
                if ((this.state.Priorityvalue < 100 || this.state.Priorityvalue > 199) && this.state.ConnectionProfileModel[0].IsAllItems == 1) {
                    objcommonjs.ShownotifyError('Priority should be 100 to 199 when all item is "YES" ');
                    objBL.SetBorderRed(priorityid);
                    objBL.ShowBubbleMessageOnHover(priorityid, 'Priority should be 100 to 199 when all item is "YES" ');
                    objcommonjs.enableControl('btnSave');
                    return;
                }
                else if (this.state.Priorityvalue > 99 && this.state.ConnectionProfileModel[0].IsAllItems == 0) {
                    objcommonjs.ShownotifyError('Priority should be 1 to 99 when all item is "NO" ');
                    objBL.SetBorderRed(priorityid);
                    objBL.ShowBubbleMessageOnHover(priorityid, 'Priority should be 1 to 99 when all item is "NO" ');
                    objcommonjs.enableControl('btnSave');
                    return;
                }
                else {
                    objBL.SetBorderDefault('divpriority .react-numeric-input input');
                    objBL.ShowBubbleMessageOnHover(priorityid, "");
                }
            }

            if (type == 'U') {
                this.state.ConnectionProfileModel[0].EditId = this.state.ConnectionProfileId;
                if ($('#dtend .form-control').val() == '')
                    this.state.ConnectionProfileModel[0].EndDate = '';
            }

            this.state.ConnectionProfileModel[0].CmdType = type;
            let listofcustomers = "";

            this.state.custjsondata.map((value, idx) => {
                if (value.ItemId == 0)
                    listofcustomers += `${value.Id},`;
            })
            this.state.ConnectionProfileModel[0].Priority = this.state.Priorityvalue;
            this.state.ConnectionProfileModel[0].ListOfAccounts = listofcustomers.substring(0, listofcustomers.length - 1);
            this.setConnectionModelState();
            let pcollection = this.state.ConnectionProfileModel[0];
            let param = {
                StartDate: pcollection.StartDate,
                EndDate: pcollection.EndDate,
                Priority: pcollection.Priority,
                CustomerList: pcollection.ListOfAccounts,
                Query: pcollection.SqlQuery,
                ConnectionProfileId: pcollection.EditId
            }
            objcommonjs.openprogressmodel('Start Customer validation', 0);
            objcommonjs.enableControl('btnSave');
            odbconnection.validatecustomersingpo(param).then(
                js => js.json()
            ).then(
                jsresult => {
                    duplicatelenght = jsresult.length;
                    this.setState({ DuplicateCustomerList: jsresult });
                    //Checking duplicate for price lock connection profiles 
                    odbconnection.validatecustomersinpricelock(param, pcollection.EditId, this.state.custjsondata).then(
                        jslock => jslock.json()
                    ).then(

                        jsresultlock => {
                            if (jsresultlock.length > 0) {

                                duplicatelenght = jsresultlock.length;
                                this.setState({ DuplicateCustomerList: jsresultlock });
                                this.ispricelockfound = true;
                            }
                            else {
                                this.ispricelockfound = false;

                            }
                            odbconnection.validateItemPriceForPriceLock(param, pcollection.IsPriceLock).then(
                                presult => {
                                    if (presult.length > 0) {

                                        duplicatelenght = presult.length;
                                        this.setState({ DuplicateCustomerList: presult });
                                        this.ispricelockfound = true;
                                        objcommonjs.openprogressmodel('Error in Customer Validation', 500);
                                        this.ShowDuplicateCustomer();
                                    }
                                    else {
                                        objcommonjs.openprogressmodel('Customer validation Completed ', 1000);
                                        if (duplicatelenght <= 0) {
                                            objcommonjs.openprogressmodel('Connection saving in progress', 0);
                                            odbconnection.createnewconnectionprofile(this.state.ConnectionProfileModel).then(
                                                js => {
                                                    haserror = js.ok;
                                                    return js.json().then(
                                                        jsdata => {
                                                            if (haserror) {
                                                                let resultmsg = ``;
                                                                if (type == 'U') {
                                                                    resultmsg = `Connection Profile Updated Successfully`

                                                                }
                                                                else {
                                                                    resultmsg = `Connection Profile Created Successfully`
                                                                    // updating denormalization price
                                                                    //MP149 populate DN table. Changes by Basawa on May 17 2019
                                                                    db.UpdateDenormalization(0, jsdata, 'Crtd', '', '');
                                                                    //end
                                                                }
                                                                objcommonjs.openprogressmodel('Connection Profile Created Successfully', 1000);
                                                                let customerocdes = ``;
                                                                this.state.custjsondata.map((value, idx) => {
                                                                    if (value.ItemId == 0)
                                                                        customerocdes += `${value.AccountCode},`;
                                                                })
                                                                let auditlogmsg = ``;
                                                                let auditdata = this.state.ConnectionProfileModel[0];
                                                                if (type == "U") {
                                                                    if (customerocdes != "") {

                                                                        //MP149 populate DN table. Changes by Basawa on May 17 2019
                                                                        db.UpdateDenormalization(0, this.state.ConnectionProfileModel[0].EditId, 'AddCustToConP', '', customerocdes);
                                                                        auditlogmsg = `Added new Customer [${customerocdes.substring(0, customerocdes.length - 1)}] in connection`
                                                                        db.createnewauditlog('C', auditlogmsg, currentuser, this.state.ConnectionProfileModel[0].EditId);
                                                                    }
                                                                    if (auditdata.EndDate != olddatevalue) {
                                                                        db.createnewauditlog('C', `Change connection date from (${olddatevalue}) to (${auditdata.EndDate}) `, currentuser, this.state.ConnectionProfileModel[0].EditId);
                                                                        // updating denormalization price
                                                                        //MP149 populate DN table. Changes by Basawa on May 17 2019
                                                                        db.UpdateDenormalization(0, this.state.ConnectionProfileModel[0].EditId, 'UpdConDate', '', '');
                                                                    }


                                                                }
                                                                else {
                                                                    auditlogmsg = `Created new Connection for GPO - [ ${auditdata.GPOName}] for start date (${auditdata.StartDate}) and End date (${auditdata.EndDate}), All Item (${objcommonjs.convertboovalue(auditdata.IsAllItems)}), Priority (${auditdata.Priority}), Connection breakout (${objcommonjs.convertboovalue(auditdata.IsBreakOut)}) ,Customer Price Lock (${objcommonjs.convertboovalue(auditdata.IsPriceLock)}) and Customers [${customerocdes.substring(0, customerocdes.length - 1)}]`;
                                                                    db.createnewauditlog('C', auditlogmsg, currentuser, jsdata);
                                                                }
                                                                this.setState({ IsGridLoaded: false });
                                                                this.setState({ displaymode: "Home" }, () => {
                                                                    objcommonjs.showtextalert(resultmsg, "", "success");
                                                                    this.ClearState();
                                                                    this.GetConnectionProfile();
                                                                })


                                                            }
                                                            else {
                                                                objcommonjs.openprogressmodel('', 100);
                                                                objcommonjs.ShownotifyError(jsdata);
                                                            }
                                                        });
                                                }).catch(error => {
                                                    console.log(`Eror:${error}`)
                                                })
                                        }
                                        else {
                                            objcommonjs.openprogressmodel('Error in Customer Validation', 500);
                                            this.ShowDuplicateCustomer();
                                        }
                                    }

                                });
                            // End of second price item validation

                        }
                    )
                });
        }
        else {
            objcommonjs.enableControl('btnSave');
        }
    }
    ShowDuplicateCustomers(htmlmsg, header, displayicon, obj1) {

        this.dupcusto = obj1;
        let myhtml = document.createElement("div");
        myhtml.innerHTML = htmlmsg + "</hr>"
        alert: (
            swal({
                buttons: {
                    cancel: "Close",
                    SaveConnection: {
                        text: "Delete and Process",
                    },
                    ExportToExcel: { text: "Export to Excel" },
                },
                title: header,
                content: myhtml,
                icon: displayicon,
                dangerMode: true
            }).then((value) => {

                switch (value) {
                    case "SaveConnection":
                        this.Removeduplicatecustomers();
                        break;
                    case "ExportToExcel":
                        this.DownlaodExcel('Excel', true);
                        break;
                    default:
                        break;
                }
            })



        );

        $("#confirmBtn").click(function () {

            let obj = new PricingConnection();
            obj.dupcusto;
            obj.Removeduplicatecustomers();
        });
    }
    //Sanjay {Mar 28 2019}
    ShowDuplicateCustomer() {

        let html = '';
        let title = "Duplicate customer connections";
        if (this.ispricelockfound) {
            title = "Customer Price Lock Found"
            html = objBL.GetPriceLockCustomersTable(this.state.DuplicateCustomerList);
        }
        else {
            html = objBL.ShowDuplicateCustomer(this.state.DuplicateCustomerList);
        }
        this.ShowDuplicateCustomers(html, title, "", this);
    }
    //Sanjay {Mar 28 2019}
    Removeduplicatecustomers() {
        this.state.DuplicateCustomerList.map((val, idx) => {
            this.DeleteDuplicateCustomerforGPOs(val.AccountCode);
        })
        if (this.state.displaymode == 'Edit')
            this.OnConnectionSave("U");
        else
            this.OnConnectionSave("C");
    }
    //Sanjay {Mar 28 2019}
    CheckDuplicateCustomersinGPO() {

        let pcollection = this.state.ConnectionProfileModel[0];
        let param = {
            StartDate: pcollection.StartDate,
            EndDate: pcollection.EndDate,
            Priority: pcollection.Priority,
            CustomerList: pcollection.ListOfAccounts
        }
        odbconnection.validatecustomersingpo(param).then(
            js => js.json()
        ).then(
            jsresult => {

                return false;
            }
        )

    }

    onAudiLogClick() {

        if (this.state.ConnectionProfileId > 0 && this.state.AuditLogData.length <= 0) {
            odbconnection.getconnectionauditlog(this.state.ConnectionProfileId).then(
                json => json.json()
            ).then(
                jsdata => {

                    if (jsdata.length > 0) {
                        this.setState({ AuditLogGPOName: `GPO: ${jsdata[0].GPOName}` });
                        jsdata.map((value, idx) => {
                            jsdata[idx].SN = idx + 1;
                        })

                        this.setState({ AuditLogData: jsdata }, () => {
                            $('#logpanel').addClass('show-logpanel');
                            $('#lp-overlay').addClass('lp-overlay-show');
                        });

                    }
                }
            ).catch(error => {
                console.log("Error in getting audit log:" + error);
            })


        }
        else {
            if (this.state.AuditLogData.length > 0) {
                $('#logpanel').addClass('show-logpanel');
                $('#lp-overlay').addClass('lp-overlay-show');
            }
        }
    }

    CloseLogPanel() {
        $('#logpanel').removeClass('show-logpanel');
        $('#lp-overlay').removeClass('lp-overlay-show');
    }

    OnCancel() {
        this.showActive=true;
        this.showfuture=true;
        this.resetpage();
        this.setState({ ConnectionProfileId: 0 });
        this.setState({ ConnectionProfileData: [] });
        this.state.serviceInputs[0].SearchValue='';
        this.state.serviceInputs[0].UserId=currentuser
        this.state.serviceInputs[0].FilterType='Active,Future'
        this.state.serviceInputs[0].PageSize=10
        this.state.serviceInputs[0]. PageNumber= 1
        this.GetConnectionProfile();
        this.setState({ displaymode: "Home" })
        this.setState({ itemconfigdisplaymode: "true" });
        currencyCode = '';
        this.setState({ tempcustomerdata: [] });
        this.setState({ConnectionProfileModel:[
            {
                AccountId: 0,
                StartDate: "",
                EndDate: "",
                Priority: 0,
                CreatedBy: currentuser,
                IsAllItems: 0,
                IsBreakOut: 0,
                IsPriceLock: 0,
                SqlQuery: "",
                ListOfAccounts: "",
                QueryJson: "",
                GPOName: "",
                EditId: 0
            }
        ]});
    }

    // Create on Mar 27 2019
    // Clear all the state on save the connection
    ClearState() {
        this.setState({ connecttodata: [] });
        this.setState({ PriorityLabel: 0 });
        this.setState({ MaxPriority: 99 });
        this.setState({ MinPriority: 0 });
        this.setState({ Priorityvalue: 0 });
        this.setState({ StartDateLabel: '' });
        this.setState({ EndDateLabel: '' });
        this.setState({ CustomerData: [] });
        this.setState({ ConnectToLable: "" });
        this.setState({ custjsondata: [] });
        this.setState({ DuplicateCustomerList: [] });
        currencyCode = '';
        this.setState({ tempcustomerdata: [] });
       // this.state.ConnectionProfileModel[0].Endate='';
        this.setState({ConnectionProfileModel:[
            {
                AccountId: 0,
                StartDate: "",
                EndDate: "",
                Priority: 0,
                CreatedBy: currentuser,
                IsAllItems: 0,
                IsBreakOut: 0,
                IsPriceLock: 0,
                SqlQuery: "",
                ListOfAccounts: "",
                QueryJson: "",
                GPOName: "",
                EditId: 0
            }
        ]});
        this.state.serviceInputs[0].SearchValue='';
        this.state.serviceInputs[0].UserId=currentuser
        this.state.serviceInputs[0].FilterType='Active,Future'
        this.state.serviceInputs[0].PageSize=10
        this.state.serviceInputs[0]. PageNumber= 1
        // this.showfuture=true;
        // this.showActive=true;
    }

    // End
    // Home page Events
    AddNewRecord() {

       // this.setFalseToFilterParam();
        this.onfileuplaod();

        let customercolums = this.state.customerheaders;
        let custidx;
        let custdata = customercolums.find((item, idx) => {
            custidx = idx;
            return item.headerName == 'Delete';
        });
        if (custdata == undefined) {
            customercolums.push({
                headerName: 'Delete', field: 'AccountCode-s', order: 4, type: 'Delete'
            });
            this.setState({ customerheaders: customercolums });
        }
        this.setState({ displaymode: "Add" }, () => {
            this.setState({ IsValid: true }, () => {
                this.OnAddCustomerSelected();
            })

            this.setState({ itemconfigdisplaymode: "true" });
            this.resetpage();
            this.getcustomerdata(eInputParam);
            this.getconnectto(null);
            objBL.CreateValidationForConnection('A');
        });
    }

    GetConnectionProfile() {
        this.setState({ ConnectionProfileData: [] });
        this.setState({ IsGridLoaded: false });
        odbconnection.getconnectionprofile(this.state.serviceInputs).then(
            response => response.json()
        ).then(
            rjson => {
                if ( rjson.length > 0) {
                this.setState({ IsGridLoaded: true });
                this.setState({ ConnectionProfileData: [] }, () => {
                    this.setState({ ConnectionProfileData: rjson });
                });
                if (this.state.serviceInputs[0].PageNumber == 1)
                this.setState({
                grdTotalRows: rjson[0].TotalRows,
                grdTotalPages: rjson[0].TotalPages
            })
        }
        else {
            // No data found
            this.setState({
                ConnectionProfileData: [], grdTotalRows: 0, grdTotalPages: 0
            });
        }
    });      
}

    // End
    // Sanjay Apr 26 19
    componentDidUpdate() {
        this.createFilterDropDown();
    }
    componentDidMount() {
        let url = new UrlProvider().MainUrl;
        this.setState({ FileUploadApiUrl: url + this.state.UploadUrl + currentuser })
        this.showActive=true;
        this.showfuture=true;
        this.createFilterDropDown();
        this.GetConnectionProfile();

        (function () {
            var warnTextNode
            // extend swal with a function for adding forms
            swal.withForm = function () {
                // initialize with field values supplied on `swal.withForm` call
                var swalForm = new SwalForm(arguments[0].formFields)
                // make form values inserted by the user available at `doneFunction`
                swalForm.addWayToGetFormValuesInDoneFunction(arguments)

                // Prepare arguments with the form html and html flag
                arguments[0].text = swalForm.generateHtmlForm()
                arguments[0].html = true

                // forward arguments
                swal.apply({}, arguments)

                swalForm.allowClickingDirectlyOnInputs()
                swalForm.focusOnFirstInput()
                swalForm.markFirstRadioButtons()
                swalForm.addTabOrder()
            }

            // constructor for helper object
            function SwalForm(formFields) {
                this.formFields = formFields
            }

            // helper methods
            extend(SwalForm.prototype, {
                formClass: 'swal-form',
                generateHtmlForm: function () {
                    var form = {
                        clazz: this.formClass,
                        innerHtml: this.formFields.map(toFormTag.bind(this)).reduce(toSingleString)
                    }

                    return t("<div class='{clazz}'>{innerHtml}</div>", form)

                    function toFormTag(field) {
                        var input = Input(field)
                        // to separate groups of checkboxes and radiobuttons in different lines
                        var conditionalLineBreak = (input.isRadioOrCheckbox() && this.lastFieldName !== field.name) ? '<br>' : ''
                        this.lastFieldName = field.name

                        return conditionalLineBreak + input.toHtml()
                    }
                },
                addWayToGetFormValuesInDoneFunction: function (swalArgs) {
                    var swalFormInstance = this
                    var doneFunction = swalArgs[1]
                    swalArgs[1] = function (isConfirm) {
                        // make form values available at `this` variable inside doneFunction
                        this.swalForm = swalFormInstance.getFormValues(isConfirm)

                        if (doneFunction.apply(this, arguments) !== false) {
                            // clean form to not interfere in normals sweet alerts
                            document.querySelector('.swal-form').innerHTML = ''
                        }
                    }
                },
                getFormValues: function (isConfirm) {
                    var inputHtmlCollection = document.getElementsByClassName('swal-form-field')
                    var inputArray = [].slice.call(inputHtmlCollection)

                    return inputArray
                        .filter(uncheckedRadiosAndCheckboxes)
                        .map(toValuableAttrs)
                        .reduce(toSingleObject, {})

                    function uncheckedRadiosAndCheckboxes(tag) {
                        return (isRadioOrCheckbox(tag) ? tag.checked : true)
                    }

                    function toValuableAttrs(tag) {
                        var attr = {}
                        attr[tag.id || tag.name] = tag.value
                        if (isConfirm && tag.dataset.swalFormsRequired && !tag.value) {
                            var warnMsg = 'Missing required attribute: ' + (tag.name || tag.id)
                            warnTextNode && warnTextNode.remove && warnTextNode.remove()
                            warnTextNode = document.createTextNode(warnMsg)
                            document.querySelector('.swal-form').appendChild(warnTextNode)
                            throw new Error(warnMsg)
                        }
                        return attr
                    }

                    function toSingleObject(obj1, obj2) {
                        return extendPreventingOverrides(obj1, obj2)

                        // for checkboxes we want to obtain all selected values in an array
                        function extendPreventingOverrides(a, b) {
                            Object.keys(b).forEach(addContentFromBtoA)
                            return a

                            function addContentFromBtoA(key) {
                                if (a.hasOwnProperty(key)) {
                                    mergeIntoAnArray(a, b, key)
                                } else {
                                    a[key] = b[key]
                                }
                            }
                        }

                        function mergeIntoAnArray(a, b, key) {
                            if (Array.isArray(a[key])) {
                                a[key].push(b[key])
                            } else {
                                a[key] = [a[key], b[key]]
                            }
                        }
                    }
                },
                allowClickingDirectlyOnInputs: function () {
                    // sweet-alert attaches an onblur handler which prevents clicks on of non
                    // button elements until click is made on the modal
                    document.querySelector('.sweet-alert button.confirm').onblur = function () { }
                    document.querySelector('.sweet-alert button.cancel').onblur = function () { }
                },
                getSelector: function () {
                    var firstField = this.formFields[0]
                    return (firstField.id ? t('#{id}', firstField) : t("[name='{name}']", firstField))
                },
                focusOnFirstInput: function () {
                    setTimeout(focus.bind(this))

                    function focus() {
                        document.querySelector(this.getSelector()).focus()
                    }
                },
                markFirstRadioButtons: function () {
                    setTimeout(markAsChecked.bind(this))

                    function markAsChecked() {
                        document.querySelector(this.getSelector()).checked = true
                    }
                },
                addTabOrder: function () {
                    var formFields = Array.prototype.slice.call(document.querySelectorAll('.swal-form .swal-form-field'))
                    formFields.forEach(addToTabNavigation)

                    function addToTabNavigation(formField, index) {
                        var myInput = formField
                        var nextInput = formFields[index + 1]

                        var keyHandler = function (e) {
                            var TABKEY = 9
                            if (e.keyCode === TABKEY) {
                                var next = this
                                setTimeout(function () { next.focus() })
                            }
                        }

                        if (myInput.addEventListener) {
                            myInput.addEventListener('keydown', keyHandler.bind(nextInput), false)
                        } else if (myInput.attachEvent) {
                            myInput.attachEvent('onkeydown', keyHandler.bind(nextInput)) /* damn IE hack */
                        }
                    }
                }
            })

            function isRadioOrCheckbox(tag) {
                return tag.type === 'radio' || tag.type === 'checkbox'
            }

            function extend(o1, o2) {
                for (var key in o2) {
                    if (o2.hasOwnProperty(key)) {
                        o1[key] = o2[key]
                    }
                }
                return o1
            }

            function Input(field) {
                var input = {
                    id: field.id || '',
                    name: field.name || '',
                    label: field.label || '',
                    clazz: field.clazz || '',
                    placeholder: field.placeholder || camelCaseToHuman(field.id),
                    value: field.value || '',
                    type: field.type || 'text',
                    options: field.options || [],
                    required: field.required,
                    isRadioOrCheckbox: function () {
                        return isRadioOrCheckbox(input)
                    },
                    toHtml: function () {
                        var inputTag
                        if (input.type !== 'select') {
                            inputTag = t("<input id='{id}' class='{clazz} swal-form-field' type='{type}' name='{name}'" +
                                " value='{value}' title='{placeholder}' placeholder='{placeholder}'" +
                                ' data-swal-forms-required={required}>', input)
                        } else {
                            inputTag = t("<select id='{id}' class='{clazz} swal-form-field' name='{name}'" +
                                " value='{value}' title='{placeholder}' style='width:100%'>" +
                                ' data-swal-forms-required={}', input) +
                                input.options.reduce(toHtmlOptions, '') +
                                '</select>'
                        }
                        var labelTag = t("<label for='{id}'>{label}</label>", input)

                        return inputTag + labelTag

                        function toHtmlOptions(optionsString, option) {
                            option.selected = option.selected ? ' selected' : ''
                            return optionsString + t("<option value='{value}'{selected}>{text}</option>", option)
                        }
                    }
                }
                // Should this label be set to title or id instead of value?
                input.label = input.isRadioOrCheckbox() && input.label === '' ? input.value : input.label
                input.clazz += input.isRadioOrCheckbox() ? ' patch-swal-styles-for-inputs' : ' nice-input'

                return input

                function camelCaseToHuman(arg) {
                    if (arg) {
                        return arg
                            .replace(/([A-Z])/g, ' $1') // insert a space before all caps
                            .replace(/^./, function (str) { return str.toUpperCase() }) // uppercase the first character
                    } else {
                        return ''
                    }
                }
            }

            // string interpolation hack
            function t(template, data) {
                for (var key in data) {
                    template = template.replace(new RegExp('{' + key + '}', 'g'), data[key] || '')
                }
                return template
            }

            function toSingleString(s1, s2) {
                return s1 + s2
            }

            swal.withFormAsync = function (options) {
                return new Promise(function (resolve, reject) {
                    swal.withForm(options, function (isConfirm) {
                        this._isConfirm = isConfirm
                        resolve(this)
                    })
                })
            }
        })()
    }
    //#up
    onfileuplaod() {

        // Upload event
        Dropzone.options.myDropzone = {
            maxFilesize: 1,
            init: function () {

                this.on("uploadprogress", function (file, progress) {

                    $(".dz-success-mark").css("display", "none");
                    $(".dz-error-mark").css("display", "none");
                    $(".dz-progress").text("");
                    $(".dz-progress").text(`Uploading ( ${Math.round(progress)}% )`);
                    if (Math.round(progress == 100)) {
                        $(".dz-progress").text("Validating Uploaded File..");
                    }

                });
                this.on("addedfiles", function (file) {

                    $(".dz-message").css("display", "none");
                });
                this.on("success", function (file, resp) {


                    $(".dz-success-mark svg").css("background", "green");
                    $(".dz-error-mark").css("display", "none");
                    $(".dz-success-mark").css("display", "block");

                });
                this.on("error", function (file, resp) {


                    $('.dz-preview').empty();
                    $(".dz-error-message").css("display", "none");
                    $(".dz-default").css("display", "");
                    swal({
                        title: "File Upload Failed",
                        text: resp,
                        icon: "error",
                        button: "Ok",
                        dangerMode: true,
                        closeOnClickOutside: false,
                    })
                });
            },
            drop: function () {
                $('#pr-filedrag').removeClass('active-drop');
            },
            dragover: function () {
                $('#pr-filedrag').addClass('active-drop');
            },
            dragleave: function () {
                $('#pr-filedrag').removeClass('active-drop');
            },
            success: function (file, resp) {
                let succesmsg = "";
                if (resp.length > 0) {
                    succesmsg = resp[0].ValidationMessage;
                    let responsedata = [];
                    if (this.state.custjsondata.length > 0) {
                        responsedata = this.state.custjsondata.slice();
                    }
                    resp.map((val, idx) => {
                        responsedata.push({
                            AccountCode: val.AccountCode,
                            Name: val.Name,
                            City: val.City,
                            Delete: val.Id,
                            Id: val.Id,
                            ItemId: 0
                        });
                    });
                    this.setState({ custjsondata: responsedata });

                }
                else {
                    alert(`${file.name} Uploaded and Validated successfully /n Result:${resp}`);
                }

                $(".dz-progress").text(succesmsg);
                $(".dz-error-message").css("display", "none");
                $(".dz-default dz-message").css("display", "none");

            }.bind(this)
        };
        //end
    }

    //split button event
    DownlaodSample() {
        let url = new UrlProvider().MainUrl;
        window.location = url + '/Connection/DownlaodAccountsSample';

    }
    //#con
    OnConnectionEdit(connectionid) {

        //this.setFalseToFilterParam();
        this.onfileuplaod();
        let currentitem = this.state.ConnectionProfileData.find((item, idx) => {
            return item.ConnectionProfileId == connectionid;
        })
        let customercolums = this.state.customerheaders;
        let custidx;
        let custdata = customercolums.find((item, idx) => {
            custidx = idx;
            return item.headerName == 'Delete';
        });

        if ((currentitem.Status == 'Active' || currentitem.Status == 'Future')&& app.getAttribute('currentUserAccessRole')=='Edit') {

            this.setState({ IsValid: true });
        }
        else {
            this.setState({ IsValid: false });
        }
        this.setState({ displaymode: "Edit" }, () => {
            this.setState({ ConnectionProfileData: null });
            this.setState({ itemconfigdisplaymode: "false" });
            this.resetpage();
            odbconnection.getconnectionmembers(connectionid).then(
                json => json.json()
            ).then(
                jsresult => {
                    let jsval = [];
                    if (jsresult.length > 0) {                  
                        let connprofile = jsresult[0];
                        this.state.ConnectionProfileModel[0].AccountId = connprofile.CPAccountId;
                        this.state.ConnectionProfileModel[0].StartDate =
                            moment(connprofile.StartDate, "DD-MM-YYYY").format("MM/DD/YYYY");
                        olddatevalue = "";
                        if (connprofile.EndDate != '') {
                            this.state.ConnectionProfileModel[0].EndDate =
                                moment(connprofile.EndDate, "DD-MM-YYYY").format("MM/DD/YYYY");
                            olddatevalue = moment(connprofile.EndDate, "DD-MM-YYYY").format("MM/DD/YYYY");
                        }

                        $('#dtend input').val(connprofile.EndDate);
                        if (connprofile.IsAllItems == false)
                            this.setState({ itemconfigdisplaymode: "true" });
                        this.setState({ ConnectToLable: `(${connprofile.cpAccountCode}) ${connprofile.CPAccountName}` });
                        this.setState({ Priorityvalue: connprofile.Priority });
                        this.setState({ AllItemLabel: connprofile.IsAllItems == false ? "No/" : "Yes/" });
                        this.setState({ CustomerPriceLockLabel: connprofile.IsPriceLock == false ? "No" : "Yes" });
                        this.setState({ ConnectionBreakLabel: connprofile.IsBreakOut == false ? "No" : "Yes" });
                        this.setState({ PriorityLabel: connprofile.Priority });
                        this.setConnectionModelState();
                        if (connprofile.QueryJSON != "")
                            jsval = JSON.parse(connprofile.QueryJSON);
                        this.setState({ ExistingConfigurationData: jsval })
                        this.setState({ ConnectionProfileId: connectionid })
                        this.setState({ StartDateLabel: connprofile.StartDate });
                        this.setState({ EndDateLabel: connprofile.EndDate });
                        jsresult.map((val, idx) => {
                            this.createnewincustomerjson(val, 1);
                        })
                        if (!this.state.IsValid) {
                            var table = $('#grdConnectionCustomers').DataTable();
                            table.columns(4).visible(false);
                        }
                        else {
                            this.getcustomerdata(eInputParam);
                            objBL.CreateValidationForConnection('E');
                        }

                    }


                }
            )
        });

    }
    //Sanjay Apr 18 2019
    CheckLastCustomer(customercode) {

        let count = 0;

        let customeritem = this.state.custjsondata.find((item, idx) => {
            return item.AccountCode == customercode;
        })
        if (customeritem.ItemId > 0) {
            this.state.custjsondata.map((value, idx) => {

                let d = customercode;
                if (value.ItemId != 0)
                    count++;
            })
            if (count == 1) {
                objcommonjs.showtextalert("You can't delete the last customer you can deactivate connection profile instead", '', 'info');
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return true;
        }



    }

    GridCallActionMehod(customercode) {

        if (this.CheckLastCustomer(customercode)) {
            swal({
                title: "Are you sure want to delete?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
                closeOnClickOutside: false,
            }).then((willDelete) => {
                if (willDelete) {
                    {
                        let index = 0;
                        let currentitem = this.state.custjsondata.find((item, idx) => {

                            index = idx;
                            if (item.AccountCode == customercode) {
                                return item;
                            }
                        })
                        let updatedState = this.state.custjsondata.slice(0, index).concat(this.state.custjsondata.slice(index + 1));
                        this.setState({ custjsondata: [] }, () => {
                            this.setState({ custjsondata: updatedState });
                        })

                        if (this.state.ConnectionProfileId > 0 && currentitem.ItemId > 0) {
                            odbconnection.deleteconnectionmember(currentitem.ItemId, this.state.ConnectionProfileId).then(
                                resjson => resjson.json()
                            ).then(

                                jsonresult => {
                                    //MP149 populate DN table. Changes by Basawa on May 17 2019
                                    db.UpdateDenormalization(0, this.state.ConnectionProfileId, 'delCustfromCon', '', currentitem.AccountCode);
                                    objcommonjs.ShownotifySuccess("Customer Deleted from Connection Profile");
                                    db.createnewauditlog('C', `Deleted Customer [ ${currentitem.AccountCode} ] from connection`, currentuser, this.state.ConnectionProfileId);
                                }

                            ).catch(error => console.log(`Eror:${error}`))
                        }
                        else {


                            if (this.state.displaymode != "Edit") {
                                if (this.state.custjsondata.length <= 0 && this.state.ConnectionProfileModel.length == 1 && this.state.ConnectionProfileModel[0].AccountId == 0) {
                                    currencyCode = '';
                                    this.getconnectto(null);
                                    this.getcustomerdata(eInputParam);
                                }
                            }

                            objcommonjs.ShownotifySuccess("Customer Deleted Successfully")
                        }

                    }

                } else {
                    swal.close();
                }
            });
        }


    }
    // Sanjay {Mar 29}
    DeleteDuplicateCustomerforGPOs(customercode) {


        let index = 0;
        let data = this.state.custjsondata;
        let currentitem = data.find((item, idx) => {

            index = idx;
            return item.AccountCode == customercode;
        })
        data.splice(index, 1);


        this.setState({ custjsondata: data });
        if (this.state.ConnectionProfileId > 0 && currentitem.ItemId > 0) {
            odbconnection.deleteconnectionmember(currentitem.ItemId, this.state.ConnectionProfileId).then(
                resjson => resjson.json()
            ).then(

                jsonresult => {

                }

            ).catch(error => console.log(`Eror:${error}`))
        }
        else {
            // objcommonjs.ShownotifySuccess("Customer Deleted Successfully")
        }



    }


    OnAddCustomerSelected() {
        objBL.hidecontrol('.cust-file-upload');
        objBL.showcontrol('.cust-code-name');
        objBL.showcontrol('#btnUploadFile');
        objBL.hidecontrol('.dnwbtn');
        objBL.hidecontrol('#btnAddCustomer');
    }
    onShowUploaderSelected() {
        objBL.hidecontrol('.cust-code-name');
        objBL.hidecontrol('#btnUploadFile');
        objBL.showcontrol('.cust-file-upload');
        objBL.showcontrol('.dnwbtn');
        objBL.showcontrol('#btnAddCustomer');

    }


    onStartDateSelected(type, value) {
        let dtvalue = moment($(value.currentTarget).find('input')[0].value, "DD-MM-YYYY").format("MM/DD/YYYY");
        if (type == "SD")// Start date
            this.state.ConnectionProfileModel[0].StartDate = dtvalue;
        else if (type == "ED") {
            this.state.ConnectionProfileModel[0].EndDate = dtvalue;
        }
        this.setConnectionModelState();
    }

    OnadvanceConfigurationChanged(type, value) {


        if (type == "DB") {
            if ($(value.target).prop('checked')) {
                this.state.ConnectionProfileModel[0].IsBreakOut = 1;
            }
            else {
                this.state.ConnectionProfileModel[0].IsBreakOut = 0;
            }
            this.setConnectionModelState();
        } // Connection breackout
        else if (type == "PL") // price lock
        {
            if ($(value.target).prop('checked')) {
                this.state.ConnectionProfileModel[0].IsPriceLock = 1;
            }
            else {
                this.state.ConnectionProfileModel[0].IsPriceLock = 0;
            }
            this.setConnectionModelState();
        }

    }
    onprioritychanged(value) {
        this.setState({ Priorityvalue: value })
    }
    updatequery(json) {

        if (json != "") {
            let query = objBL.generatequery(json);
            this.state.ConnectionProfileModel[0].SqlQuery = query;
            this.state.ConnectionProfileModel[0].QueryJson = JSON.stringify(json);
        }
    }

    resetpage() {
        this.setState({ ExistingConfigurationData: [] });
        if (this.state.DisplayMode != "Home")
            this.OnAddCustomerSelected();
        this.setState({ custjsondata: [] });
        this.setState({ Priorityvalue: 0 });
        this.setState({ Justification: '' });
        this.setState({ SelectedIDs: [] });
    }

    DownlaodExcel(type, isDuplicateRecord) {
        let url = new UrlProvider().MainUrl;
        if (isDuplicateRecord == false) {
            if (this.state.IsGridLoaded) {
                objcommonjs.openprogressmodel('File download is in progress', 9000);
                apiData.DownloadConnectionProfileFile(this.state.serviceInputs,type)
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
            } else {
                console.log('No data available');
            }
        } else if (isDuplicateRecord) {
            if (this.state.DuplicateCustomerList.length > 0) {
                objcommonjs.openprogressmodel('File download is in progress', 9000);
                apiData.DownloadDuplicateCustomerForGPO(this.state.DuplicateCustomerList)
                    .then(resv => resv.json())
                    .then(rData => {

                        if (rData != "No Record Found" && rData != "Internal Server Error") {
                            window.location = url + `/PricingCommon/DownloadFile?filename=${rData}`;
                            swal.close();
                            this.ShowDuplicateCustomer();

                        } else {
                            console.log(rData);
                        }
                    })
                    .catch(error => {
                        console.log(`Error occured during file download`);
                    });
            } else {
                console.log('No data available');
            }
        }

    }


    // setFalseToFilterParam() {
    //     this.showexpired = false;
    //     this.showfuture = false;
    //     this.showDeactivated = false;
    //     this.showActive = false;
    // }
    filterOnChange() {
        let object = this;
        let filterValues = '';
       //object.setFalseToFilterParam();
        $('.multiselect-container').each(function () {
            $(this).find('li').each(function () {
                if ($(this).hasClass("active")) {
                    if ($(this).find('input[type=checkbox]').val() == 'Future') {
                        //object.showfuture = true;
                        filterValues += "Future,"
                    } else if ($(this).find('input[type=checkbox]').val() == 'Deactivated') {
                        //object.showDeactivated = true;
                        filterValues += "Deactivated,"
                    } else if ($(this).find('input[type=checkbox]').val() == 'Expired') {
                       // object.showexpired = true;
                       filterValues += "Expired,"
                    } else if ($(this).find('input[type=checkbox]').val() == 'Active') {
                       // object.ShowActive = true;
                       filterValues += "Active,"
                    } 
                }
            });
            object.state.serviceInputs[0].FilterType = filterValues;
            object.state.serviceInputs[0].PageNumber = 1;
            object.GetConnectionProfile();
        });

    }
    onPagechange(pageNumber) {
        let param = this.state.serviceInputs;
        param[0].PageNumber = pageNumber;
        this.setState({ serviceInputs: param }, () => {
        this.GetConnectionProfile();
        });
    }
    ClearTyeahead(type, event) {
        if (type == 'G') {
            var option = this.tahConnectTo.props.options;
            if (!option.includes(event.target.value))
                this.tahConnectTo.getInstance().setState({ text: '' });
        }
        if (type == 'C') {
            var option = this.tahCustomers.props.options;
            if (!option.includes(event.target.value))
                this.tahCustomers.getInstance().setState({ text: '' });
        }
    }

    render() {
        if (this.state.displaymode == "Home") {
            return (

                <div className="pr-body card-header">
                    <Shield>
                        <div className="pr-connection-main">
                            <div className="pr-fullwidth card-title">
                                <div className="pr-heading">Connection Profile</div>
                                <div className="pr-cid">
                                    {app.getAttribute('currentUserAccessRole')=='Edit'&&
                                    <ButtonComponent Action={this.AddNewRecord.bind(this)} ClassName="d-blue-button pr-pull-right space-left"
                                        Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                        Text=" Add"
                                    />
                                    }
                                </div>
                            </div>

                            <div className="cf-row">
                                <div className="pull-left">



                                    <div class="dropdown prdd">
                                        <button class=" btn btn-secondary dropdown-toggle d-blue-button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            Export
</button>
                                        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                            <a className="dropdown-item" title="Download Connection Profile Excel file" onClick={this.DownlaodExcel.bind(this, 'Excel', false)} href="#">Excel <span class="excel-icon"></span></a>
                                            <a className="dropdown-item" title="Download Connection Profile CSV file" onClick={this.DownlaodExcel.bind(this, 'CSV', false)} href="#">CSV  <span class="csv-icon"></span></a>
                                        </div>
                                    </div>

                                </div>
                                {app.getAttribute('currentUserAccessRole')=='Edit'&&
                                <ButtonComponent ID="btnDeactivateSelectedPrice" ClassName="index-high d-blue-button pr-pull-left space-right" Text="Deactivate" Action={this.DeactivateSelectedGPOs.bind(this)} />
                                }
                                <div id='dtfilter' className="pull-left index-high">
                                    <select className="multiselect-opacity"
                                        data-placeholder="Filter List Item"
                                        id="connectionfillterlist"
                                        defaultValue={['Active', 'Future']}
                                        multiple="multiple"  >
                                        <option value="Active">Active</option>
                                        <option value="Future">Future</option>
                                        <option value="Deactivated">Deactivated</option>
                                        <option value="Expired">Expired</option>
                                    </select>
                                </div>
                                <div className="pull-right">
                                    <Typeahead
                                        id="typeGridFilter"
                                        ref={(typeahead) =>
                                            this.tahConnectTo = typeahead}
                                            labelKey="SearchColumn"
                                            onChange={this. onConnectionSearch.bind(this)}
                                            onInputChange={this.getconnectto.bind(this)}
                                            options={this.state.connecttodata}
                                            placeholder="Type GPO Name/Code"
                                            onBlur={this.ClearTyeahead.bind(this, 'G')}
                                    />
                                </div>
                            </div>

                            <div className="tbl-grid-cover mar-top-ten">
                                <div className="pr-fullwidth">
                                {app.getAttribute('currentUserAccessRole')=='Edit'&&
                                    // <GridTable
                                    //     isTableGrid="True"
                                    //     GridSeetingData={this.state.MainPageGridSetting}
                                    //     gridID="grdConnectionProfile"
                                    //     onEdit={this.OnConnectionEdit.bind(this)}
                                    //     TableHeader={this.state.HomeGridHeaders}
                                    //     TableRow={this.state.ConnectionProfileData}
                                    //     onGridAction={this.SelectedValuesUpdate.bind(this)}
                                    // />
                                    <DataGrid
                                    ref={instance => this.child = instance}
                                    Id="grdConnectionProfile"
                                    IsPagination={true}
                                    ColumnCollection={this.state.HomeGridHeaders}
                                    totalrows={this.state.grdTotalRows}
                                    totalpages={this.state.grdTotalPages}
                                    Onpageindexchanged={this.onPagechange.bind(this)}
                                    GridData={this.state.ConnectionProfileData}
                                    onEditMethod={this.OnConnectionEdit.bind(this)}
                                    ActionButton="Edit" />
                                }
                                {app.getAttribute('currentUserAccessRole')!='Edit'&&
                                    // <GridTable
                                    // isTableGrid="True"
                                    // GridSeetingData={this.state.MainPageGridSetting}
                                    // gridID="grdConnectionProfile"
                                    // onView={this.OnConnectionEdit.bind(this)}
                                    // TableHeader={this.state.HomeGridHeadersView}
                                    // TableRow={this.state.ConnectionProfileData}
                                    // onGridAction={this.SelectedValuesUpdate.bind(this)}
                                    // />
                                    <DataGrid
                                    ref={instance => this.child = instance}
                                    Id="grdConnectionProfile"
                                    IsPagination={true}
                                    ColumnCollection={this.state.HomeGridHeadersView}
                                    totalrows={this.state.grdTotalRows}
                                    totalpages={this.state.grdTotalPages}
                                    Onpageindexchanged={this.onPagechange.bind(this)}
                                    GridData={this.state.ConnectionProfileData}
                                    onEditMethod={this.OnConnectionEdit.bind(this)}
                                    ActionButton="View" />
                                }

                                </div>

                            </div>
                            <ToastContainer></ToastContainer>
                        </div>
                    </Shield>
                </div>

            );
        }
        else {
            return (
                <div className="pr-body card-header">
                    <Shield>
                        <div className="pr-connection-main">
                            <CommonTitleHeader ConnId={this.state.ConnectionProfileId} />

                            <div className="pr-fullwidth-padd">
                                <div className="pr-box-cover pr-pull-left">
                                    <fieldset>
                                        <legend>From</legend>

                                        {this.state.IsValid &&
                                            <div className="pr-form-box-buttons pr-fbb">

                                                <div className="cust-code-name">
                                                    <Typeahead
                                                        id="txtdata12"
                                                        ref={(typeahead) =>
                                                            this.tahCustomers = typeahead}
                                                        labelKey="SearchColumn"
                                                        onChange={this.oncustomerselected.bind(this)}
                                                        onInputChange={this.getcustomerdata.bind(this)}
                                                        options={this.state.CustomerData}
                                                        placeholder="Type Customer Name/Code"
                                                        onBlur={this.ClearTyeahead.bind(this, 'C')}

                                                    />
                                                    <ButtonComponent Action={this.addcustomer.bind(this)} ClassName="d-blue-button pr-pull-right space-left"
                                                        Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                                        Text=" Add"
                                                        Action={this.addcustomer.bind(this)}
                                                    />
                                                </div>
                                                <div className="cust-file-upload">
                                                    <FileUploader Action={this.state.FileUploadApiUrl} />
                                                </div>
                                                <div className="cust-action-btn">
                                                    <ButtonComponent ID="btnAddCustomer" Action={this.OnAddCustomerSelected.bind(this)} ClassName="d-blue-button pr-pull-left"
                                                        Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                                        Text=" Add Customer"
                                                        Action={this.OnAddCustomerSelected.bind(this)}
                                                    />
                                                    <ButtonComponent ID="btnUploadFile" Action={this.onShowUploaderSelected.bind(this)} ClassName="d-blue-button pr-pull-left"
                                                        Icon={<i className="fa fa-upload" aria-hidden="true"></i>}
                                                        Text=" Upload File"
                                                        Action={this.onShowUploaderSelected.bind(this)}
                                                    />
                                                    <ButtonComponent Action={this.DownlaodSample.bind(this)} ClassName="d-blue-button pr-pull-left dnwbtn"
                                                        Icon={<i className="fa fa-download" aria-hidden="true"></i>}
                                                        Text=" Sample"
                                                        Action={this.DownlaodSample.bind(this)}
                                                    />
                                                </div>


                                            </div>
                                        }

                                        <div className="cm-add-custo-table">

                                            <GridTable
                                                isTableGrid="True"
                                                gridID="grdConnectionCustomers"
                                                onDelete={this.GridCallActionMehod.bind(this)}
                                                TableHeader={this.state.customerheaders}
                                                TableRow={this.state.custjsondata}
                                                GridSeetingData={this.state.CustomerGridSetting} />
                                        </div>



                                    </fieldset>
                                </div>
                                <div className="pr-box-cover pr-pull-right">
                                    <fieldset>
                                        <legend>Configuration</legend>
                                        <div className="config-form">
                                            <form className="pr-gen-form" autoComplete="off" action="">
                                                <div className="cf-row">
                                                    <label className="cf-label">Connect To</label>
                                                    <div id='txtGpoName' className="cf-input-cover">
                                                        {this.state.displaymode != "Edit" &&
                                                            <Typeahead
                                                                ref={(typeahead) =>
                                                                    this.tahConnectTo = typeahead}
                                                                labelKey="SearchColumn"
                                                                onChange={this.onconnecttoselected.bind(this)}
                                                                onInputChange={this.getconnectto.bind(this)}
                                                                options={this.state.connecttodata}
                                                                placeholder="Type GPO Name/Code"
                                                                onBlur={this.ClearTyeahead.bind(this, 'G')}

                                                            />
                                                        }
                                                        {this.state.displaymode == "Edit" &&
                                                            <Label Value={this.state.ConnectToLable} />
                                                        }

                                                    </div>
                                                </div>
                                                <div className="cf-row">
                                                    <label className="cf-label">Start Date</label>
                                                    <div className="cf-input-cover">
                                                        {this.state.displaymode != "Edit" &&
                                                            <CalendarJs
                                                                StartDate={this.ConnectionStartDate}
                                                                onDateChange={this.onStartDateSelected.bind(this, "SD")}
                                                                DateFormate="dd-mm-yyyy"
                                                                Id="dtStart" />
                                                        }
                                                        {this.state.displaymode == "Edit" &&
                                                            <Label Value={this.state.StartDateLabel} />
                                                        }

                                                    </div>
                                                </div>

                                                <div className="cf-row">
                                                    <label className="cf-label">End Date</label>
                                                    <div className="cf-input-cover">
                                                        {this.state.IsValid &&
                                                            <CalendarJs

                                                                StartDate={this.ConnectionStartDate}
                                                                onDateChange={this.onStartDateSelected.bind(this, "ED")}
                                                                DateFormate="dd-mm-yyyy"
                                                                Id="dtend" />
                                                        }
                                                        {this.state.IsValid == false &&
                                                            <Label Value={this.state.EndDateLabel} />
                                                        }
                                                    </div>
                                                </div>
                                                <div className="cf-row">
                                                    <label className="cf-label">All Items / Priority</label>
                                                    <div id="divpriority" className="cf-input-cover">
                                                        {this.state.displaymode != "Edit" &&
                                                            <SwitchYesNo Id="chkallItems" OnSelected={this.onallitemsselected.bind(this)} />
                                                        }


                                                        {this.state.displaymode != "Edit" &&
                                                            <span className="pull-left">
                                                                <NumericInput onChange={this.onprioritychanged.bind(this)} min={this.state.MinPriority} max={this.state.MaxPriority} value={this.state.Priorityvalue} />
                                                            </span>

                                                        }
                                                        <label className="cf-label">
                                                            {this.state.displaymode == "Edit" &&
                                                                <span id="lblAllItems" >{this.state.AllItemLabel} </span>

                                                            }
                                                            {this.state.displaymode == "Edit" &&
                                                                <span>{this.state.PriorityLabel}</span>
                                                            }
                                                        </label>

                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="pr-fullwidth-padd">
                                            <Accordion>
                                                <AccordionItem>
                                                    <AccordionItemTitle>
                                                        <h4 className="panel-title">Advance Configuration</h4>
                                                    </AccordionItemTitle>
                                                    <AccordionItemBody>
                                                        <div className="pr-fullwidth-padd">
                                                            <div className="cf-row">
                                                                <label className="cf-label">Connection Breakout</label>
                                                                <div className="cf-input-cover">
                                                                    {this.state.displaymode != "Edit" &&
                                                                        <SwitchYesNo Id="chkConnectionBreackOut" OnSelected={this.OnadvanceConfigurationChanged.bind(this, "DB")} />
                                                                    }
                                                                    {this.state.displaymode == "Edit" &&
                                                                        <Label Id="lblConnectionBreackout" Value={this.state.ConnectionBreakLabel} />

                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="cf-row">
                                                                <label className="cf-label">Customer Price Lock</label>
                                                                <div className="cf-input-cover">
                                                                    {this.state.displaymode != "Edit" &&
                                                                        <SwitchYesNo Id="chkpricelock" OnSelected={this.OnadvanceConfigurationChanged.bind(this, "PL")} />
                                                                    }
                                                                    {this.state.displaymode == "Edit" &&
                                                                        <Label Id="lblCustomerPriceLock" Value={this.state.CustomerPriceLockLabel} />

                                                                    }

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </AccordionItemBody>
                                                </AccordionItem>
                                            </Accordion>
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                            <ConnectionItemConfiguration TempData={this.state.TempData} ExistingData={this.state.ExistingConfigurationData} ReturnQuery={this.updatequery.bind(this)} DisplayMode={this.state.itemconfigdisplaymode} PageMode={this.state.displaymode} />
                            <div className="pr-fullwidth-padd pr-bar-fixed">

                                <ButtonComponent Action={this.OnCancel.bind(this)}
                                    ClassName="d-grey-button pr-pull-right space-left"
                                    Text="Close" />
                                {this.state.displaymode == "Edit" &&
                                    <ButtonComponent Action={this.onAudiLogClick.bind(this)} ClassName="d-grey-button pr-pull-right space-left" Text="Audit Log" />
                                }

                                {this.state.displaymode == "Edit" && this.state.IsValid &&
                                    <ButtonComponent ID='btnSave' Action={this.OnConnectionSave.bind(this, 'U')} ClassName="d-blue-button pr-pull-right space-left" Text="Update" />
                                }
                                {this.state.displaymode != "Edit" &&
                                    <ButtonComponent ID='btnSave' Action={this.OnConnectionSave.bind(this, 'C')} ClassName="d-blue-button pr-pull-right space-left" Text="Save" />}


                            </div>
                            <div id="logpanel">
                                <div className="pr-fullwidth card-title">
                                    <div className="pr-heading" >Audit Log</div>
                                    <div className="pr-cid" >{this.state.AuditLogGPOName}  </div>
                                </div>
                                <div className="log-table">
                                    <div className="pr-fullwidth">
                                        <GridTable gridID="tblAuditLog"
                                            TableHeader={this.state.AuditLogHeader}
                                            TableRow={this.state.AuditLogData}
                                            isTableGrid="True"
                                            GridSeetingData={{ "searching": false, "paging": false, "ordering": false, "info": false }}

                                        />
                                    </div>
                                </div>
                                <ButtonComponent Action={this.CloseLogPanel.bind(this)} ClassName="d-grey-button pr-pull-right" Text="Close" />

                                <ToastContainer transition={Slide} />

                            </div>
                        </div>
                        <div id="lp-overlay"></div>
                    </Shield>
                </div>

            );
        }
    }
}
export default PricingConnection;

