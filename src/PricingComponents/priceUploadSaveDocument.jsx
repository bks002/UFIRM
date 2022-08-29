import React from 'react';
import TextAreaBox from '../ReactComponents/TextAreaBox/TextAreaBox.jsx';
import ButtonComponent from '../ReactComponents/Button/Button.jsx';
import FileUploader from "../ReactComponents/FileUploader/FileUploader.jsx";
import GridTable from '../ReactComponents/Grid/GridTable.jsx';
import CalendarJs from '../ReactComponents/Calendar/Calendar.jsx';
import ApiDataProvider from "../Common/ApiDataProvider.js";
import { Typeahead } from 'react-bootstrap-typeahead';
import { ToastContainer, toast } from 'react-toastify';
import CommonDataProvider from "../Common/DataProvider/CommonDataProvider.js";
import InputBox from "../ReactComponents/InputBox/InputBox.jsx";
import AppCommonjs from "../Common/AppCommon.js";
import UrlProvider from "../Common/ApiUrlProvider.js";
import ValidationProvider from '../Common/Validation/ValidationProvider.js';
import ValidationCommon from '../Common/Validation/ValidationCommon.js';
import CreatePricemanully from './CreatePriceManually.jsx'
import priceUploadSaveDocumentBL from './priceUploadSaveDocumentBL.js';
import swal from 'sweetalert';
let idJson = [
    { Id: 'custAccount .rbt-input-main', Label: 'Account Name' },
    { Id: 'StartDate .form-control', Label: 'Start Date' },
    { Id: 'EndDate .form-control', Label: 'End Date' },
    { Id: 'txtPriceName', Label: 'Price List Name' },
    { Id: 'txtBApprovel', Label: 'No Approval Justification' },
    { Id: 'grdItemPriceList', LabelMessage: 'Item Collection' },
];
let objBL = new priceUploadSaveDocumentBL();
let ItemPriceCollection = '';
let ItemCollection = '';
let DuplicateItems = [];
let itemlogdata = '';
let htmldata = '';

class PriceUploadSaveDocument extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            UploadFileData: null,
            UploadFileHeaders: [
                { headerName: 'No', field: 'SNo', type: 'Serial', order: 1 },
                { headerName: 'File Name', field: 'FileName', type: 'string', order: 2 },
                { headerName: 'Status', field: 'Status', type: 'string', order: 3 }
            ],
            PlaceHolderData: [],
            fileLogIDs: '',
            PriceListID: null,
            CustomerData: [],
            custoemrValue: '',
            startDate: '',
            endDate: '',
            currencyValue: '',
            currencyName: '',
            priceName: '',
            approvalJustification: '',
            isGridLoaded: false,
            PriceUploadDocURL: null,
            fileCount: 0,
            Isupload: true,
            ItemData: [],
            custjsondata: [],
            DeleteItemsList: []
        };
        this.apiData = new ApiDataProvider();
        this.commonDataProvider = new CommonDataProvider();
        this.calenderJS = new CalendarJs();
        this.appCommonJs = new AppCommonjs();
        this.objvalidateCommon = new ValidationCommon();
        this.getCustomers(null);
        this.CurrentUserId = null;

    }
    componentDidMount() {
        if (this.props.ControlMode == 'Upload') {
            this.CurrentUserId = priceupload.getAttribute('currentUserId');
            this.setState({ Isupload: true });
            let url = new UrlProvider().MainUrl;
            let uploadURL = `${url}/PriceUpload/UploadPriceListDocuments?userId=${priceupload.getAttribute('currentUserId')}`;
            this.setState({ PriceUploadDocURL: uploadURL });
            Dropzone.options.myDropzone = {
                maxFiles: 5,
                createImageThumbnails: false,
                acceptedFiles: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
                dictInvalidFileType: "You can upload only excel files.",
                dictMaxFilesExceeded: "You can upload maximum 5 files only.",
                init: function () {
                    this.on("uploadprogress", function (file, progress) {
                        $("#procesNumber").text("");
                        $("#procesNumber").text(Math.round(progress) + " %");
                    });
                    this.on('maxfilesreached', function () {
                        this.removeEventListeners();
                    });
                    this.on('addedfile', function (file) {
                        if (file.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && file.type != 'application/vnd.ms-excel') {
                            var tMessage = new AppCommonjs();
                            tMessage.ShownotifyError('You can upload only excel files.');
                            this.removeFile(file);
                        }
                    });
                },
                success: function (file, resp) {
                    this.setState({ UploadFileData: null });
                    this.setState({ isGridLoaded: false });
                    this.setState({ fileLogIDs: this.state.fileLogIDs == 0 ? resp : this.state.fileLogIDs + "," + resp });
                    this.apiData.getUploadedFileStatusByFileLogId(this.state.fileLogIDs)
                        .then(resv => resv.json())
                        .then(rData => {
                            if (rData.length > 0) {
                                rData.map((value, idx) => {
                                    rData[idx].SNo = idx + 1;
                                });
                                this.setState({ UploadFileData: rData }, () => {
                                    this.gridSetting();
                                });
                            }
                        })
                        .catch(error => {
                            console.log(`Error occured ${error.state}`);
                        });
                    $('.dz-processing').hide();
                }.bind(this)
            };

        }
        else {

            this.setState({ Isupload: false });
            this.CurrentUserId = pricelistbrowse.getAttribute('currentUserId');

        }
        this.CreateValidationForUploadPrice();
    }

    CreateValidationForUploadPrice() {
        let validation = new ValidationProvider();
        validation.CreateTextBoxValidator({
            Id: idJson[0].Id,
            IsMandatory: true,
            LabelMessage: idJson[0].Label
        });
        validation.CreateCalenderValidator({
            Id: idJson[1].Id,
            IsMandatory: true,
            LabelMessage: idJson[1].Label,
            DateToCampare: idJson[2].Id,
            Operator: '<'
        });
        validation.CreateCalenderValidator({
            Id: idJson[2].Id,
            IsMandatory: true,
            LabelMessage: idJson[2].Label,
            DateToCampare: idJson[1].Id,
            Operator: '>'
        });
        validation.CreateTextBoxValidator({
            Id: idJson[3].Id,
            IsMandatory: true,
            LabelMessage: idJson[3].Label,
        });
        validation.CreateTextBoxValidator({
            Id: idJson[4].Id,
            IsMandatory: true,
            LabelMessage: idJson[4].Label,
        });
       
    }

    ValidatePriceUpload() {
        let error = '';
        error = this.objvalidateCommon.ValidateControl(idJson);
        if (error != '') {
            this.appCommonJs.ShownotifyError('Please Resolve validation error before saving');
            return false;
        }
        else {
            return true;
        }
    }

    gridSetting() {
        if (this.state.isGridLoaded == false) {
            let fcot = this.state.fileCount;
            $('#priceUpload').dataTable({
                "searching": false,
                "paging": false,
                "ordering": false,
                "info": false,
                "createdRow": function (row, data, index) {
                    if (data[2].includes('Successfully')) {
                        $('td', row).eq(2).addClass('success');
                        fcot = fcot + 1;
                    }
                    if (data[2].includes('Failed')) {
                        $('td', row).eq(2).addClass('danger');
                    }
                }.bind(this),
                "dom": 'Bfrtip',
                "buttons": ['excel']
            });
            $('.dataTables_empty').hide();
            this.setState({ isGridLoaded: true });
            this.setState({ fileCount: fcot });
        }
    }

    CloseAddDocument() {
        this.tahCustomer.getInstance().clear();
        this.calenderJS.ResetData("StartDate");
        this.calenderJS.ResetData("EndDate");
        $('#txtBApprovel').val('');
        $('#txtPriceName').val('');
        this.setState({ priceName: '' });
        this.setState({ custoemrValue: '' });
        this.setState({ currencyValue: '' });
        this.setState({ currencyName: '' });
        this.setState({ startDate: '' });
        this.setState({ endDate: '' });
        this.setState({ approvalJustification: '' });
        this.setState({ fileLogIDs: 0 });
        this.setState({ PriceListID: null });
        this.setState({ UploadFileData: null });
        this.setState({ isGridLoaded: false });
        if (this.state.Isupload) {
            this.setState({ fileCount: 0 });
            var myDropzone = Dropzone.forElement("#my-dropzone");
            myDropzone.removeAllFiles(true);
        }
        this.props.onCancel();
        htmldata = '';
    }

    // Sanjay May 8 2019
    ShowDuplicateItems(htmlmsg, header, displayicon, obj1) {
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
                        this.RemoveduplicateItems();
                        break;
                    case "ExportToExcel":
                        this.DownlaodExcel();
                        break;
                    default:
                        break;
                }
            })



        );
    }
    RemoveduplicateItems() {
        this.setState({ DeleteItemsList: this.DuplicateItems });

    }
    ValidateandSave() {
        this.appCommonJs.disableControl('btnSavePriceList');
        this.setState({ DeleteItemsList: [] });
        if (!this.state.Isupload) {
            htmldata = '';
            this.apiData.CheckDuplicatePriceForPriceLock(this.state.custoemrValue,
                this.state.startDate,
                this.state.endDate,
                this.ItemCollection
            ).then(
                
                rdata => {
                    if (rdata.length > 0) {
                        this.appCommonJs.enableControl('btnSavePriceList');
                        htmldata = objBL.GetPriceLockItemTable(rdata);
                        this.DuplicateItems = rdata;
                        this.ShowDuplicateItems(htmldata, "Duplicate Item Price/Price Lock found", "", this);
                    }
                    else {
                        this.SaveAddedDocuments();
                    }
                }
            );
        }
        else {
            this.SaveAddedDocuments();
        }
    }

    SaveAddedDocuments() {
        let haserror = false;
        let checkduplicateitem = false;
        let userid = 0;
        let currentuname = '';
        objBL.CreateGridValidator();
        if (this.ValidatePriceUpload()) {
            
            if (this.state.Isupload) {
                userid = priceupload.getAttribute('currentUserId');
                currentuname = priceupload.getAttribute('currentUserName');
                if (this.state.fileLogIDs == "" || this.state.fileCount < 1) {
                    haserror = true;
                }
                else {
                    haserror = false;
                }
            }
            else {
                currentuname = pricelistbrowse.getAttribute('currentUserName')
                userid = pricelistbrowse.getAttribute('currentUserId');
                this.setState({ fileLogIDs: '' });
                haserror = false;


            }
            if (!haserror) {
                let saveUpload = [];
                saveUpload.push({
                    accountId: this.state.custoemrValue,
                    sDate: this.state.startDate,
                    eDate: this.state.endDate,
                    listName: this.state.priceName,
                    userId: userid,
                    currencyId: this.state.currencyValue,
                    fileLogIDs: this.state.fileLogIDs,
                    Justification: this.state.approvalJustification
                });
                this.appCommonJs.openprogressmodel('Start Saving Price List..', 0);
                this.apiData.saveUploadedPriceListDocuments(saveUpload[0])
                    .then(resv => resv.json())
                    .then(rData => {
                        
                        if (!this.state.Isupload) {
                            this.SavePriceManually(rData);
                        }
                        this.setState({ PriceListID: rData }, () => {
                            let message = '';
                            if (this.state.Isupload) {
                                message = `${currentuname} created new Price list { ${this.state.priceName}} with Price start date {${this.state.startDate}}, End Date {${this.state.endDate}}, currency { ${this.state.currencyName}}, Justification {${this.state.approvalJustification}} and total {${this.state.fileLogIDs.split(',').length}} files`;
                            }
                            else {
                                message = `${currentuname} created new Price list { ${this.state.priceName}} with Price start date {${this.state.startDate}}, End Date {${this.state.endDate}}, currency{ ${this.state.currencyName}}, Justification { ${this.state.approvalJustification}} and Items {${this.itemlogdata}} `;
                            }

                            this.appCommonJs.openprogressmodel('Price List creation is completed', 500);
                            this.commonDataProvider.createnewauditlog('P', message, userid, rData);
                            this.appCommonJs.showtextalert("Price List Created Successfully", "", "success");
                            this.CloseAddDocument();

                        });

                    })
                    .catch(error => {
                        this.appCommonJs.enableControl('btnSavePriceList');
                        console.log(`Error occured ${error.state}`);
                    });

            }
            else {
                this.appCommonJs.enableControl('btnSavePriceList');
                this.appCommonJs.ShownotifyError("Please Upload your file to Save Price List");
            }
        }
        else{
            this.appCommonJs.enableControl('btnSavePriceList');
        }
    }

    DownlaodSample() {
        let url = new UrlProvider().MainUrl;
        window.location = url + '/PriceUpload/DownlaodPriceUploadSample';
    }

    onCustomerSelected(value) {
        if (value.length > 0) {
            this.setState({ custoemrValue: value[0].AccountId });
            this.setState({ currencyName: value[0].QADCode });
            this.setState({ currencyValue: value[0].CurrencyId });
        }
    }

    onStartDateSelected(value) {
        let dtvalue = moment($(value.currentTarget).find('input')[0].value, "DD-MM-YYYY").format("MM/DD/YYYY");
        this.setState({ startDate: dtvalue });
    }

    onEndDateSelected(value) {
        let dtvalue = moment($(value.currentTarget).find('input')[0].value, "DD-MM-YYYY").format("MM/DD/YYYY");
        this.setState({ endDate: dtvalue });
    }

    onPriceNameChange(value) {
       // if (value.length > 0) {
            this.setState({ priceName: value });
       // }
    }

    onApprovalJustificationChange(value) {
        if (value.length > 0) {
            this.setState({ approvalJustification: value });
        }
    }

    getCustomers(e) {
        let searchVal;
        if (e == '' || e == null) {
            searchVal = null;
        } else {
            searchVal = e.trim();
        }
        //let userid = priceupload.getAttribute('currentUserId');
        this.commonDataProvider.getallCustomer(searchVal, "AccountId, CurrencyId, QADCode, SearchColumn","",this.CurrentUserId).then(
            resp => resp.json()).then(
                jsdata => this.setState({ CustomerData: jsdata })
            );
    }

    /// Manually mode method
    GetItemPriceList(itemlist, logdata, PriceItemCollection) {
        this.itemlogdata = logdata;
        this.ItemPriceCollection = itemlist;
        this.ItemCollection = PriceItemCollection;
    }

    SavePriceManually(pricelistid) {
        let datamodel = [{
            PriceListId: pricelistid,
            ItemandPriceCollection: this.ItemPriceCollection
        }];
        this.apiData.CreatePriceManually(datamodel).then(
            json => json.json()
        ).then(jsdata => {
            //MP149 populate DN table. Changes by Basawa on May 17 2019
            this.commonDataProvider.UpdateDenormalization(pricelistid, 0, 'Crtd','','');
        }).catch(error => {
            console.log(`Error occured ${error.state}`);
        });
    }
    DownlaodExcel() {
        if (!this.state.Isupload) {
            let url = new UrlProvider().MainUrl;
            if (this.DuplicateItems.length > 0) {
                this.appCommonJs.openprogressmodel('File download is in progress', 9000);
                this.apiData.DownloadDuplicateItemPriceForPriceLock(this.state.custoemrValue,
                    this.state.startDate,
                    this.state.endDate,
                    this.ItemCollection)
                    .then(resv => resv.json())
                    .then(rData => {
                        if (rData != "No Record Found" && rData != "Internal Server Error") {
                            window.location = url + `/PricingCommon/DownloadFile?filename=${rData}`;
                            swal.close();
                            this.ShowDuplicateItems(htmldata, "Duplicate Item Price/Price Lock found", "", this);

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
    ClearTyeahead(type, event) {
        if (type == 'C') {
           var option=this.tahCustomer.props.options;
           if(!option.includes(event.target.value))
               this.tahCustomer.getInstance().setState({ text: '' });
        }
   }
    render() {
        return (
            <div id="savePage" className="pr-fullwidth-padd">
                <div className="pr-fullwidth pr-pull-left">
                    <fieldset>
                        <legend>Save Price Details</legend>
                        <div className="pr-fullwidth cif">
                            <div className="pr-box-cover pr-pull-left">
                                <div className="cf-row">
                                    <label className="cf-label mar-top-eighteen">Account Name<span className="astrik">*</span></label>
                                    <div id="custAccount" className="pd-input-cover">
                                        <Typeahead
                                            ref={(typeahead) =>
                                                this.tahCustomer = typeahead}
                                            labelKey="SearchColumn"
                                            onChange={this.onCustomerSelected.bind(this)}
                                            onInputChange={this.getCustomers.bind(this)}
                                            options={this.state.CustomerData} placeholder="Account Name/Code"
                                            onBlur={this.ClearTyeahead.bind(this,'C')}
                                        />
                                    </div>
                                </div>
                                <div className="pr-fullwidth">
                                    <div className="cf-row-half">
                                        <label className="cf-label">Price List Name<span className="astrik">*</span></label>
                                        <div className="pd-input-cover">
                                            <InputBox 
                                            PlaceHolder="Price List Name" 
                                            Name="txtPriceName" 
                                            Id="txtPriceName" 
                                            Value={this.state.priceName}
                                            onChange={this.onPriceNameChange.bind(this)} />
                                        </div>
                                    </div>
                                    <div className="cf-row-half">
                                        <label className="cf-label">Currency</label>
                                        <div className="pd-input-cover mar-top-ten">
                                            <span className="data-text">{this.state.currencyName}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="cf-row-half">
                                    <label className="cf-label">Start Date<span className="astrik">*</span></label>
                                    <div className="pd-input-cover">
                                        <CalendarJs Id="StartDate" StartDate={new Date()} DateFormate="dd-mm-yyyy" onDateChange={this.onStartDateSelected.bind(this)} />
                                    </div>
                                </div>
                                <div className="cf-row-half">
                                    <label className="cf-label">End Date<span className="astrik">*</span></label>
                                    <div className="pd-input-cover">
                                        <CalendarJs Id="EndDate" StartDate={new Date()} DateFormate="dd-mm-yyyy" onDateChange={this.onEndDateSelected.bind(this)} />
                                    </div>
                                </div>
                                <div className="cf-row">
                                    <label className="cf-label-full">No Approval Justification<span className="astrik">*</span></label>
                                    <div className="cf-input-cover-full">
                                        <TextAreaBox Name="txtBApprovel" Id="txtBApprovel" 
                                        onChange={this.onApprovalJustificationChange.bind(this)} />
                                    </div>
                                </div>
                            </div>
                            <div className="pr-box-cover pr-pull-right">
                                {this.state.Isupload && (

                                    <div>
                                        <div className="cf-row">
                                            <ButtonComponent ClassName="d-blue-button pr-pull-right dnwbtn"
                                                Icon={<i className="fa fa-download" aria-hidden="true"></i>}
                                                Text=" Sample" Action={this.DownlaodSample.bind(this)}
                                            />
                                            <label className="cf-label minus-mar">Upload File</label>
                                        </div>
                                        <div className="pr-inner-block mar-bottom-zero-cover">
                                            {this.state && this.state.PriceUploadDocURL &&
                                                <FileUploader Action={this.state.PriceUploadDocURL} />
                                            }
                                        </div>
                                        <div className="pr-data-table">

                                            {this.state && this.state.UploadFileData &&
                                                <GridTable gridID="priceUpload"
                                                    TableHeader={this.state.UploadFileHeaders}
                                                    TableRow={this.state.UploadFileData}
                                                    GridSeetingData={{ "searching": false, "paging": false, "ordering": false, "info": false }}
                                                />
                                            }
                                        </div>
                                    </div>
                                )}
                                {!this.state.Isupload && (
                                    <CreatePricemanully
                                        CallSaveFunction={this.ValidateandSave.bind(this)}
                                        DeleteItemsList={this.state.DeleteItemsList}
                                        ReturnQuery={this.GetItemPriceList.bind(this)} />
                                )}
                            </div>
                        </div>
                    </fieldset>
                </div>
                <div className="pr-fullwidth-padd pr-bar-fixed">
                    <ButtonComponent ClassName="d-grey-button pr-pull-right space-left" Text="Close" Action={this.CloseAddDocument.bind(this)} />
                    <ButtonComponent ID='btnSavePriceList' ClassName="d-blue-button pr-pull-right" Text="Save" Action={this.ValidateandSave.bind(this)} />
                </div>
                <ToastContainer></ToastContainer>
            </div>
        );
    }
}

PriceUploadSaveDocument.defaultProps = {
    ControlMode: "Upload"
}
export default PriceUploadSaveDocument;