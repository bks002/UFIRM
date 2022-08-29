import React from 'react';
import Moment from 'react-moment';
import GridTable from '../ReactComponents/Grid/GridTable.jsx';
import DataGrid from '../ReactComponents/DataGrid/DataGrid.jsx';
import ApiDataProvider from "../Common/ApiDataProvider.js";
import ButtonComponent from '../ReactComponents/Button/Button.jsx';
import { Typeahead } from 'react-bootstrap-typeahead';
import ConnectionBL from "./PricingConnectionBL.js";
import { ToastContainer, toast } from 'react-toastify';
import SwitchYesNo from '../ReactComponents/SwitchYesNo/SwitchYesNo.jsx';
import Commonjs from '../Common/AppCommon.js';
import PriceUploadSaveDocument from './priceUploadSaveDocument.jsx';
import PriceListManagement from './priceListManagement.jsx';
import UrlProvider from "../Common/ApiUrlProvider.js";
import PriceListBrowseBL from './PriceListBrowseBL.js';
import CommonTitleHeader from '../ReactComponents/CommonTitleHeader/CommonTitleHeader.jsx';
import CommonDataProvider from "../Common/DataProvider/CommonDataProvider.js";
let objcommonjs = new Commonjs();
//let apiData = new ApiDataProvider();
let currentuser = parseInt(pricelistbrowse.getAttribute('currentUserId'));
let url = new UrlProvider().MainUrl;
// let showexpired = false;
// let showfuture = false;
// let showDeactivated = false;
// let showActive = false;
let pricelistidtitle = 0;
//let currentuser = parseInt(72);
let objBL = new ConnectionBL();
class PriceListBrowse extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            IsGridDataLoaded: false,
            GridData: [],
            headers: [
                // { headerName: 'Id', field: 'PriceListId', order: 1 },
                // { headerName: 'Name', field: 'ListName', order: 2, type: 'string', orderable: true },
                // { headerName: 'Type', field: 'CustomerType', order: 3, type: 'string' },
                // { headerName: 'Account', field: 'AccountName', order: 4, type: 'string', orderable: true },
                // { headerName: 'Currency', field: 'CurrencyCode', order: 5, type: 'string' },
                // { headerName: 'Domain', field: 'Domain', order: 6, type: 'string' },
                // { headerName: 'Start Date', field: 'StartDate', order: 7, type: 'string' },
                // { headerName: 'End Date', field: 'EndDate', order: 8, type: 'string' },
                // { headerName: 'Remaining', field: 'Remaining', order: 9, type: 'string', orderable: true },
                // { headerName: 'Created By', field: 'UserName', order: 10, type: 'string' },
                // { headerName: 'Created On', field: 'CreatedOn', order: 11, type: 'string' },
                // { headerName: 'Status', field: 'Status', order: 12, type: 'status', orderable: true },
                // { headerName: 'Action', field: 'PriceListId-i', order: 13, type: 'Edit' }
                {sTitle: 'Id', title: 'PriceListId', "orderable": false},
                { sTitle: 'Name', title: 'ListName', "orderable":  true },
                { sTitle: 'Type', title: 'CustomerType', "orderable": false },
                { sTitle: 'Account', title: 'AccountName', "orderable": true },
                { sTitle: 'Currency',title: 'CurrencyCode',"orderable": false},
                { sTitle: 'Domain', title: 'Domain',"orderable": false},
                { sTitle: 'Start Date',title: 'StartDate',"orderable": false},
                { sTitle: 'End Date', title: 'EndDate',"orderable": false},
                { sTitle: 'Remaining', title: 'Remaining',"orderable":  true },
                {sTitle: 'Created By',title: 'UserName', "orderable": false},
                { sTitle: 'Created On',title:'CreatedOn',"orderable": false},
                { sTitle: 'Status', title:'Status',  Type: "Status" ,"orderable":  true },
                { sTitle: 'Action', title: 'Action',  Action: "Edit", Index: '0',"orderable": false}
            ],
            headersView: [
                // { headerName: 'Id', field: 'PriceListId', order: 1 },
                // { headerName: 'Name', field: 'ListName', order: 2, type: 'string', orderable: true },
                // { headerName: 'Type', field: 'CustomerType', order: 3, type: 'string' },
                // { headerName: 'Account', field: 'AccountName', order: 4, type: 'string', orderable: true },
                // { headerName: 'Currency', field: 'CurrencyCode', order: 5, type: 'string' },
                // { headerName: 'Domain', field: 'Domain', order: 6, type: 'string' },
                // { headerName: 'Start Date', field: 'StartDate', order: 7, type: 'string' },
                // { headerName: 'End Date', field: 'EndDate', order: 8, type: 'string' },
                // { headerName: 'Remaining', field: 'Remaining', order: 9, type: 'string', orderable: true },
                // { headerName: 'Created By', field: 'UserName', order: 10, type: 'string' },
                // { headerName: 'Created On', field: 'CreatedOn', order: 11, type: 'string' },
                // { headerName: 'Status', field: 'Status', order: 12, type: 'status', orderable: true },
                // { headerName: 'Action', field: 'PriceListId-i', order: 13, type: 'View' }
                // { headerName: 'Action', field: 'PriceListId-i', order: 13, type: 'Edit' }
                {sTitle: 'Id', title: 'PriceListId', "orderable": false},
                { sTitle: 'Name', title: 'ListName', "orderable":  true },
                { sTitle: 'Type', title: 'CustomerType', "orderable": false },
                { sTitle: 'Account', title: 'AccountName', "orderable": true },
                { sTitle: 'Currency',title: 'CurrencyCode',"orderable": false},
                { sTitle: 'Domain', title: 'Domain',"orderable": false},
                { sTitle: 'Start Date',title: 'StartDate',"orderable": false},
                { sTitle: 'End Date', title: 'EndDate',"orderable": false},
                { sTitle: 'Remaining', title: 'Remaining',"orderable":  true },
                {sTitle: 'Created By',title: 'UserName', "orderable": false},
                { sTitle: 'Created On',title:'CreatedOn',"orderable": false},
                { sTitle: 'Status', title:'Status', Type: "Status" ,"orderable":  true },
                { sTitle: 'Action', title: 'Action',  Action: "View", Index: '0',"orderable": false}
            ],
            DisplayPage: 'Home',
            PriceListID: 0,
            GridSetting: {
                "order": [[0, "desc"]],
                // "createdRow": function (row, data, index) {
                //     
                //     if (data[8].includes('Deactivated') || data[8].includes('Expired')) {
                //         $("#" + data[1]).attr("disabled", true);
                //     }
                // }
            },
            customerData: [],
            grdTotalPages: 0,
            grdTotalRows: 0,
            serviceInputs: [{
                UserId:parseInt(pricelistbrowse.getAttribute('currentUserId')),
                FilterType: 'Active,Future',
                SearchValue: '',
                PageSize: 10,
                PageNumber: 1,
                callType:2
            }],
        };
        this.apiData = new ApiDataProvider();
        this.commonProvider = new CommonDataProvider();
        this.onCustomerList = this.onCustomerList.bind(this);
        this.onPriceSearch = this.onPriceSearch.bind(this);
    }

    AddNewPriceUpload() {
        // this.showexpired = false;
        // this.showfuture = false;
        // this.showDeactivated = false;
        // this.showActive = false;
        this.setState({ DisplayPage: 'New' });
    }
    ReloadPriceUploadList() {
        // this.showfuture = true;
        // this.showActive = true;
        this.state.serviceInputs[0].SearchValue='';
        this.state.serviceInputs[0].FilterType='Active,Future'
        this.state.serviceInputs[0].PageSize=10
        this.state.serviceInputs[0]. PageNumber= 1
        this.setState({ DisplayPage: 'Home' }, () => {
            this.GetPriceList();
        });
    }
    OnPriceListEdit(pricelistid) {
        this.pricelistidtitle = pricelistid;
        // this.showexpired = false;
        // this.showfuture = false;
        // this.showDeactivated = false;
        // this.showActive = false;
        this.setState({ PriceListID: pricelistid })
        this.setState({ DisplayPage: 'Edit' });
    }
    componentDidMount() {

    }
    componentWillMount() {
        // this.showfuture = true;
        // this.showActive = true;
        this.GetPriceList();
    }

    // Basawaraj Apr 30 19 -- MP127 Add filters 
    componentDidUpdate() {
        let object = this;
        $('#priceListBrosefillterlist').multiselect({
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

    // GetPriceList() {
    //     this.setState({ GridData: [] });
    //     apiData.getPriceListBrowse(currentuser, this.showfuture, this.showexpired, this.showDeactivated, this.showActive, 2)
    //         .then(resv => resv.json())
    //         .then(rData => {
    //             this.setState({ GridData: rData });//, () => {

    //         })
    //         .catch(error => {
    //             console.log(`Error occured ${error.state}`);
    //         });
    // }
    GetPriceList() {
        this.setState({ GridData: [] });
        this.apiData.getPriceListByUserId(this.state.serviceInputs)
            .then(resv => resv.json())
            .then(rData => {
            if (rData.length > 0) {
                this.setState({ GridData: rData });
                if (this.state.serviceInputs[0].PageNumber == 1)
                this.setState({
                grdTotalRows: rData[0].TotalRows,
                grdTotalPages: rData[0].TotalPages
                
            })
            }
            else {
                // No data found
                this.setState({
                    GridData:[], grdTotalRows: 0, grdTotalPages: 0

                });

            }
        });      

    }

    // DownlaodExcel(type) {
    //     if (this.state.GridData && this.state.GridData.length > 0) {
    //         objcommonjs.openprogressmodel('File download is in progress', 9000);
    //         apiData.CreatePriceListDownloadFile(currentuser, type, this.showfuture, this.showexpired, this.showDeactivated, this.showActive, 2)
    //             .then(resv => resv.json())
    //             .then(rData => {
    //                 swal.close();
    //                 window.location = url + `/PricingCommon/DownloadFile?filename=${rData}`;
    //             });
    //     } else {
    //         console.log('No data available');
    //     }
    // }
    DownlaodExcel(type) {
        if (this.state.GridData && this.state.GridData.length > 0) {
            objcommonjs.openprogressmodel('File download is in progress', 9000);
            this.apiData.DownloadPriceUploadFile(this.state.serviceInputs[0].UserId, this.state.serviceInputs[0].FilterType, this.state.serviceInputs[0].SearchValue, this.state.serviceInputs[0].PageSize, this.state.serviceInputs[0].PageNumber, this.state.serviceInputs[0].callType, type)
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
    }
    onPagechange(pageNumber) {
        let param = this.state.serviceInputs;
        param[0].PageNumber = pageNumber;
        this.setState({ serviceInputs: param }, () => {
            this.GetPriceList();
        });
    }
    onPriceSearch(arg) {
        if (arg.length > 0) {
            this.state.serviceInputs[0].SearchValue = arg[0].AccountCode;
        }
        else {
            this.state.serviceInputs[0].SearchValue = "";
        }
        this.state.serviceInputs[0].PageNumber = 1;
        this.GetPriceList();
    }
    onCustomerList(arg) {
        let searchVal;
        if (arg == '' || arg == null) {
            searchVal = null;
        } else {
            searchVal = arg.trim();
        }
        this.commonProvider.getallCustomer(searchVal, '','',this.currentuser).then(
            resp => resp.json()).then(

                jsdata => {
                    this.setState({ customerData: jsdata }
                    )
                }
            ).catch(error => console.log(`Eror:${error}`))

    }
      // End
      ClearTyeahead(type, event) {
        if (type == 'C') {
            var option = this.tahCustomers.props.options;
            if (!option.includes(event.target.value))
                this.tahCustomers.getInstance().setState({ text: '' });
        }
    }
    filterOnChange() {
        let object = this;
        // object.showfuture = false;
        // object.showDeactivated = false;
        // object.showexpired = false;
        // object.showActive = false;
        let filterValues = '';
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
            object.GetPriceList();
        });
    }

    render() {
        return (
            <div className="pr-body card-header">
                <div className="pr-connection-main">
                    <div className="pr-fullwidth card-title">
                        {this.state.DisplayPage == 'Home' &&
                            <div className="pr-heading">Price List Browse</div>
                        }
                        {this.state.DisplayPage == 'Edit' && this.state.PriceListID &&
                            // <div className="pr-heading">Price List Management</div>
                            <CommonTitleHeader HeadingName="Price List Management" SubTitle="Price List Id" Full={false} ConnId={this.pricelistidtitle} />
                        }

                        {this.state.DisplayPage == 'Home' && pricelistbrowse.getAttribute('currentUserAccessRole') == "Edit" &&
                            <div className="pr-cid">
                                <ButtonComponent ID="btnAddPriceList" Name="btnAddPriceList" ClassName="d-blue-button pr-pull-right space-left"
                                    Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                    Text=" Add"
                                    Action={this.AddNewPriceUpload.bind(this)}
                                />
                            </div>
                        }
                    </div>
                    {this.state.DisplayPage == 'Home' &&
                        <div>
                            <div className="pr-fullwidth">
                                <div className="dropdown prdd pull-left">
                                    <button className=" btn btn-secondary dropdown-toggle d-blue-button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        Export
                                    </button>
                                    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                        <a className="dropdown-item" title="Download Price List Browse Excel file" onClick={this.DownlaodExcel.bind(this, 'Excel')} href="#">Excel <span class="excel-icon"></span></a>
                                        <a className="dropdown-item" title="Download Price List Browse CSV file" onClick={this.DownlaodExcel.bind(this, 'CSV')} href="#">CSV <span class="csv-icon"></span></a>
                                    </div>
                                </div>

                                <div hidden className="btn-group pull-left index-high">
                                    <button title={this.props.Title} onClick={this.props.Action} type="button" className="btn d-blue-button">Button</button>
                                    <button type="button" className="btn d-blue-button dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <span className="sr-only">Toggle Dropdown</span>
                                    </button>
                                    <div className="dropdown-menu new-ddmenu">
                                        <a className="dropdown-item" title="To add customer using search option" href="#">Future Price</a>
                                        <a className="dropdown-item" title="To Upload customer excel file" href="#">Expired Price</a>
                                    </div>
                                </div>
                                <div id='dtfilter' className="pull-left index-high">
                                    <select className="multiselect-opacity"
                                        data-placeholder="Filter List Item"
                                        id="priceListBrosefillterlist"
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
                                        this.tahCustomers = typeahead}
                                        labelKey="SearchColumn"
                                        onChange={this.onPriceSearch}
                                        onInputChange={this.onCustomerList}
                                        options={this.state.customerData}
                                        placeholder="Type Customer Name/Code"
                                        onBlur={this.ClearTyeahead.bind(this, 'C')}
                                    />
                                </div>
                                <div className="tbl-grid-cover mar-top-ten">
                                    {pricelistbrowse.getAttribute('currentUserAccessRole') == "Edit" &&
                                        // <GridTable isTableGrid="True"
                                        //     GridSeetingData={this.state.GridSetting}
                                        //     gridID="grdPricelistbrowse"
                                        //     TableHeader={this.state.headers}
                                        //     TableRow={this.state.GridData}
                                        //     onEdit={this.OnPriceListEdit.bind(this)}
                                        // />
                                        <DataGrid
                                        ref={instance => this.child = instance}
                                        Id="grdPricelistbrowse"
                                        IsPagination={true}
                                        ColumnCollection={this.state.headers} 
                                        totalrows={this.state.grdTotalRows}
                                       totalpages={this.state.grdTotalPages}
                                       Onpageindexchanged={this.onPagechange.bind(this)}
                                       GridData={this.state.GridData}
                                       onEditMethod={this.OnPriceListEdit.bind(this)} 
                                       ActionButton="Edit" 
                                       />      
                                    }
                                    {pricelistbrowse.getAttribute('currentUserAccessRole') != "Edit" &&
                                        // <GridTable isTableGrid="True"
                                        //     GridSeetingData={this.state.GridSetting}
                                        //     gridID="grdPricelistbrowse"
                                        //     TableHeader={this.state.headersView}
                                        //     TableRow={this.state.GridData}
                                        //     onView={this.OnPriceListEdit.bind(this)}
                                        // />
                                        <DataGrid
                                        ref={instance => this.child = instance}
                                        Id="grdPricelistbrowse"
                                        IsPagination={true}
                                        ColumnCollection={this.state.headersView} 
                                        totalrows={this.state.grdTotalRows}
                                       totalpages={this.state.grdTotalPages}
                                       Onpageindexchanged={this.onPagechange.bind(this)}
                                       GridData={this.state.GridData}
                                       onEditMethod={this.OnPriceListEdit.bind(this)} 
                                       ActionButton="View" 
                                       />      
                                    }
                                </div>
                            </div>
                        </div>
                    }
                    {this.state.DisplayPage == 'New' &&
                        <div className="pr-fullwidth">
                            <PriceUploadSaveDocument ControlMode='Manual' onCancel={this.ReloadPriceUploadList.bind(this)} />
                        </div>
                    }
                    {this.state.DisplayPage == 'Edit' && this.state.PriceListID &&
                        <div className="pr-fullwidth-padd">
                            <PriceListManagement
                                CallMode="PM"
                                priceListID={this.state.PriceListID}
                                onCancel={this.ReloadPriceUploadList.bind(this)} />
                        </div>
                    }
                </div>

                <ToastContainer></ToastContainer>
            </div>
        );
    }
}
export default PriceListBrowse;