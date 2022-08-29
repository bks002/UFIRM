import React from 'react';
import Moment from 'react-moment';
import GridTable from '../ReactComponents/Grid/GridTable.jsx';
import ApiDataProvider from "../Common/ApiDataProvider.js";
import ButtonComponent from '../ReactComponents/Button/Button.jsx';
import { ToastContainer, toast } from 'react-toastify';
import AppCommonjs from "../Common/AppCommon.js";
import CommonDataProvider from "../Common/DataProvider/CommonDataProvider.js";
import UrlProvider from "../Common/ApiUrlProvider.js";
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';

class PriceUploadDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            auditlogGridSetting: {
                "searching": false,
                "info": true,
                "paging": true,
                "pageLength": 10

            },
            PriceListID: null,
            UploadFileData: null,
            UploadFileHeaders: [
                { headerName: 'No', field: 'SNo', type: 'Serial', order: 1 },
                { headerName: 'File Name', field: 'FileName', type: 'string', order: 2 },
                { headerName: 'Status', field: 'Status', type: 'string', order: 3 },
                { headerName: '', field: 'FileId-a', type: 'View', order: 4 }
            ],
            PriceListDetail: {
                AccountName: '',
                ListName: '',
                CurrencyCode: '',
                StartDate: '',
                EndDate: '',
                Justification: ''

            },
            recordCount: 0,
            ErrorLogHeader: [
                { headerName: 'No', field: 'SNo', type: 'Serial', order: 1 },
                { headerName: 'Code', field: 'ItemCode', type: 'string', order: 2 },
                { headerName: 'Item Name', field: 'ItemName', type: 'string', order: 3 },
                { headerName: 'Date Time', field: 'DateTime', type: 'string', order: 4 },
                { headerName: 'Log Details', field: 'LogDetails', type: 'string', order: 5 },
            ],
            FileId: null,
            enableAuditLog: "No",
            grdAuditLogHeader: [
                { headerName: 'SN', field: 'SN', order: 1, type: "Serial" },
                { headerName: 'Date Time', field: 'DateTime', order: 2 },
                { headerName: 'User Name', field: 'UserName', order: 3 },
                { headerName: 'Action', field: 'Action', order: 4 },
            ],
            grdAuditLogData: [],
            gridSetting: {
                "searching": false,
                "paging": false,
                "ordering": false,
                "info": false,
                "createdRow": function (row, data, index) {

                    let liststatus = this.state.PriceListDetail.Status;
                    if ((data[2] == "Processed Successfully" || data[2].includes('Partially Processed') && liststatus.includes('Processed'))) {
                        $('#btnActivatePrice').show();
                        // $('td', row).eq(3).text('');
                    }
                    if (data[2].includes('Successfully') || data[2].includes('Activated')) {
                        $('td', row).eq(3).text('');
                        $('td', row).eq(2).addClass('success');

                    }
                    else if (data[2].includes('Failed') || data[2].includes('Partially')) {
                        $('td', row).eq(2).addClass('danger');
                        // $('td', row).eq(3).text('s');
                    }
                    else if (!data[2].includes('Failed') || !data[2].includes('Partially')) {
                        $('td', row).eq(3).text('');
                    }
                }.bind(this),
                "initComplete": function (settings, json) {
                    var showHead = false;
                    $.each(settings.aoData, function (key, value) {
                        if (value._aData[2].includes('Failed') || value._aData[2].includes('Partially')) {
                            showHead = true;
                        }
                    });
                    if (showHead == false) {
                        $('#priceUploadDetails tr').find('td:eq(3),th:eq(3)').hide();
                    }
                }.bind(this),

            }
        };
        this.apiData = new ApiDataProvider();
        this.appCommonJs = new AppCommonjs();
        this.commonDataProvider = new CommonDataProvider();
        this.dateFormat = require('dateformat');
    }

    componentDidMount() {
        this.setState({ PriceListID: this.props.priceListID });
        $('#btnActivatePrice').hide();
        this.apiData.getPriceListDetailById(this.props.priceListID)
            .then(resv => resv.json())
            .then(rData => {
                this.setState({ PriceListDetail: rData }, () => {
                    this.LoadUploadedFiles(this.props.priceListID);
                });
            });
    }

    CloseAddDocument() {
        this.setState({ PriceListDetail: null });
        this.setState({ UploadFileData: null });
        this.setState({ PriceListID: null });
        this.setState({ FileId: null });
        this.props.onCancel();
    }

    LoadUploadedFiles(fID) {
        this.apiData.getFileUploadLogsByRefId(fID)
            .then(resv => resv.json())
            .then(rData => {
                if (rData.length > 0) {
                    rData.map((value, idx) => {
                        rData[idx].SNo = idx + 1;
                    });
                    this.setState({ UploadFileData: rData }, () => {
                        if (this.state.PriceListDetail != null) {
                            let todate = new Date();
                            let eod = new Date(this.state.PriceListDetail["EndDate"].replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
                            if (moment(eod).isBefore(todate)) {
                                $('#btnActivatePrice').hide();
                            }
                        }
                    });
                }
                else {
                    this.setState({ UploadFileData: [] });
                }
            });
    }

    ActivatePrices() {
        this.apiData.activatePriceListByPriceListId(this.state.PriceListID)
            .then(resv => resv.json())
            .then(rData => {
                //MP149 populate DN table. Changes by Basawa on May 17 2019
                this.commonDataProvider.UpdateDenormalization(this.state.PriceListID, 0, 'Act', '', '');
                this.appCommonJs.showtextalert("PriceList Activated Successfully", "", "success");
                let message = "Activated Price"; //`${priceupload.getAttribute('currentUserName')} is activated price o`;
                this.commonDataProvider.createnewauditlog('P', message, priceupload.getAttribute('currentUserId'), this.state.PriceListID);
                this.CloseAddDocument();
            });
    }

    ViewFileErrorLog(fileId) {
        this.setState({ ErrorLogData: null });
        this.setState({ FileId: null });
        this.apiData.viewUploadedFileErrorLog(fileId)
            .then(resv => resv.json())
            .then(rData => {
                if (rData.length > 0) {
                    this.setState({ FileId: fileId });
                    rData.map((value, idx) => {
                        rData[idx].SNo = idx + 1;
                    });
                    this.setState({ ErrorLogData: rData }, () => {
                        $('#logpanel').addClass('show-logpanel');
                        $('#lp-overlay').addClass('lp-overlay-show');
                    });
                }
                else {
                    this.appCommonJs.ShownotifyError('Error log will coming soon.');
                }
            });
    }

    CloseLogPanel() {
        $('#logpanel').removeClass('show-logpanel');
        this.setState({ ErrorLogData: null, grdAuditLogData: null, enableAuditLog: "No" });
        $('#lp-overlay').removeClass('lp-overlay-show');
    }

    DownlaodExcel(type) {
        if (this.state.ErrorLogData.length > 0) {
            let url = new UrlProvider().MainUrl;
            this.appCommonJs.openprogressmodel('File download is in progress', 9000);
            this.apiData.DownloadFileErrorLog(this.state.FileId, type)
                .then(resv => resv.json())
                .then(rData => {
                    swal.close();
                    if (rData != "No Record Found" && rData != "Internal Server Error") {
                        window.location = url + `/PricingCommon/DownloadFile?filename=${rData}`;
                    } else {
                        console.log(rData);
                    }
                });
        }
    }
    onAudiLogClick() {
        if (this.state.PriceListID != null && this.state.PriceListID > 0) {
            this.apiData.getAuditLog('P', this.state.PriceListID)
                .then(json => json.json())
                .then(rData => {
                    if (rData.length > 0) {
                        this.setState({ enableAuditLog: "Yes" }, () => {
                            rData.map((value, idx) => {
                                rData[idx].SN = idx + 1;
                            });
                            this.appCommonJs.ClearTableGrid('grdAuditLog');
                            this.setState({ grdAuditLogData: rData }, () => {
                                $('#logpanel').addClass('show-logpanel');
                                $('#lp-overlay').addClass('lp-overlay-show');
                            });
                        });
                    }
                });
        }
    }

    render() {
        return (
            <div id="detailPage" className="pr-fullwidth">
                <div className="pr-fullwidth-padd">
                    <div className="pr-fullwidth pr-pull-left">
                        <fieldset>
                            <legend>Price Details</legend>
                            {this.state.PriceListDetail != null &&
                                <div className="pr-fullwidth cif">

                                    <div className="pr-box-cover pr-pull-left">
                                        <div className="cf-row">
                                            <label className="cf-label">Customer Name</label>
                                            <div className="pd-input-cover">
                                                <span className="data-text">{this.state.PriceListDetail["AccountName"]}</span>
                                            </div>
                                        </div>
                                        <div className="cf-row-half">
                                            <label className="cf-label">Price List Name</label>
                                            <div className="pd-input-cover">
                                                <span className="data-text">{this.state.PriceListDetail["ListName"]}</span>
                                            </div>
                                        </div>
                                        <div className="cf-row-half">
                                            <label className="cf-label">Currency</label>
                                            <div className="pd-input-cover">
                                                <span className="data-text">{this.state.PriceListDetail["CurrencyCode"]}</span>
                                            </div>
                                        </div>
                                        <div className="cf-row-half">
                                            <label className="cf-label">Start Date</label>
                                            <div className="pd-input-cover">
                                                <span className="data-text">{this.state.PriceListDetail["StartDate"]}</span>
                                            </div>
                                        </div>
                                        <div className="cf-row-half">
                                            <label className="cf-label">End Date</label>
                                            <div className="pd-input-cover">
                                                <span className="data-text">{this.state.PriceListDetail["EndDate"]}</span>
                                            </div>
                                        </div>
                                        <div className="cf-row">
                                            <label className="cf-label-full">No Approval Justification<span className="astrik">*</span></label>
                                            <div className="cf-input-cover-full">
                                                <div className="naj-data">{this.state.PriceListDetail["Justification"]}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pr-box-cover pr-pull-right">


                                        <div>
                                            <div className="cf-row">
                                                <label className="cf-label">Uploaded File Details</label>
                                            </div>
                                            <div className="pr-inner-block mar-bottom-zero-cover mrt-ten">
                                                <div className="pr-data-table mar-top-zero">
                                                    <GridTable gridID="priceUploadDetails"
                                                        isTableGrid="True"
                                                        GridSeetingData={this.state.gridSetting}
                                                        onView={this.ViewFileErrorLog.bind(this)}
                                                        TableHeader={this.state.UploadFileHeaders}
                                                        TableRow={this.state.UploadFileData} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                        </fieldset>
                    </div>
                    <div className="pr-fullwidth-padd pr-bar-fixed">
                        <ButtonComponent ClassName="d-grey-button pr-pull-right space-left" Text="Close" Action={this.CloseAddDocument.bind(this)} />
                        {priceupload.getAttribute('currentUserAccessRole') == "Edit" &&
                            <ButtonComponent ClassName="d-blue-button pr-pull-right space-left" ID="btnActivatePrice" Text="Activate Price" Action={this.ActivatePrices.bind(this)} />
                        }
                        <ButtonComponent Action={this.onAudiLogClick.bind(this)} ClassName="d-blue-button pr-pull-right" Text="Audit Log" />
                    </div>
                </div>
                <div id="logpanel">
                    {this.state.enableAuditLog == "No" &&
                        <div className="pr-fullwidth">
                            {this.state && this.state.UploadFileData &&
                                <div className="pr-fullwidth card-title">
                                    <div className="pr-heading" >Error Log</div>

                                </div>
                            }
                            <div className="log-table">

                                <div className="pr-fullwidth">
                                    {this.state && this.state.ErrorLogData &&
                                        <GridTable Id="grdErrorLog"
                                            isTableGrid="True"
                                            GridSeetingData={this.state.auditlogGridSetting}
                                            TableHeader={this.state.ErrorLogHeader}
                                            TableRow={this.state.ErrorLogData}
                                        />
                                    }

                                </div>
                            </div>
                            <div className="pr-fullwidth">
                                <ButtonComponent id="btnErrLogPanelClose" Action={this.CloseLogPanel.bind(this)} ClassName="d-grey-button pr-pull-right" Text="Close" />
                                {this.state && this.state.ErrorLogData &&
                                    this.state.ErrorLogData.length > 0 &&
                                    <div className="pull-right">
                                        <div className="dropdown prdd">
                                            <button className=" btn btn-secondary dropdown-toggle d-blue-button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                Export
                                        </button>
                                            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                                <a className="dropdown-item" title="Downlaod Price List Management Excel file" onClick={this.DownlaodExcel.bind(this, 'Excel')} href="#">Excel </a>
                                                <a className="dropdown-item" title="Download Price List Management CSV file" onClick={this.DownlaodExcel.bind(this, 'CSV')} href="#">CSV</a>
                                            </div>
                                        </div>
                                    </div>
                                }

                            </div>
                        </div>
                    }
                    {this.state.enableAuditLog == "Yes" &&
                        <div className="pr-fullwidth">
                            <div className="pr-fullwidth card-title">
                                <div className="pr-heading" >Audit Log</div>
                                <div className="pr-cid" >Customer Name:{this.state.PriceListDetail["AccountName"]}  </div>
                            </div>
                            <div className="log-table">
                                <div className="pr-fullwidth">
                                    <GridTable gridID="tblAuditLog"
                                        TableHeader={this.state.grdAuditLogHeader}
                                        TableRow={this.state.grdAuditLogData}
                                        //isTableGrid="True"
                                        GridSeetingData={{ "searching": false, "paging": false, "ordering": false, "info": false }}
                                    />
                                </div>
                            </div>
                            <ButtonComponent id="btnLogPanelClose" Action={this.CloseLogPanel.bind(this)} ClassName="d-grey-button pr-pull-right" Text="Close" />

                            <ToastContainer transition={Slide} />
                        </div>
                    }
                </div>
                <div id="lp-overlay"></div>
            </div>
        );
    }
}

export default PriceUploadDetails;