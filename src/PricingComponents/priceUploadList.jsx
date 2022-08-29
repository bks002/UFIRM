import React from 'react';
import SwitchYesNo from '../ReactComponents/SwitchYesNo/SwitchYesNo.jsx';
import DataGrid from '../ReactComponents/DataGrid/DataGrid.jsx';
import GridTable from '../ReactComponents/Grid/GridTable.jsx';
import ApiDataProvider from "../Common/ApiDataProvider.js";
import Commonjs from '../Common/AppCommon.js';
import UrlProvider from "../Common/ApiUrlProvider.js";
import { ToastContainer, toast } from 'react-toastify';
import { Typeahead } from 'react-bootstrap-typeahead';
import CommonDataProvider from "../Common/DataProvider/CommonDataProvider.js";
import swal from 'sweetalert';

let url = new UrlProvider().MainUrl;
let objcommonjs = new Commonjs();
// let showexpired = false;
// let showfuture = false;
// let showDeactivated = false;
// let ShowActive = false;
// let ShowProcessed=false;
// let ShowPartProcessed=false;
// let showFailed=false;
// let showStaging=false;
class PriceUploadList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            GridData: null,
            headers: [
                // { headerName: 'ID', field: 'PriceListId', order: 1, type: 'int' },
                // { headerName: 'Price List Name', field: 'ListName', order: 2, type: 'string', orderable: true },
                // { headerName: 'Account Name', field: 'AccountName', order: 3, type: 'string', orderable: true },
                // { headerName: 'Currency', field: 'CurrencyCode', order: 4, type: 'string' },
                // { headerName: 'Start Date', field: 'StartDate', order: 5, type: 'string'},
                // { headerName: 'End Date', field: 'EndDate', order: 6, type: 'string'},
                // { headerName: 'Created On', field: 'CreatedOn', order: 7, type: 'string'},
                // { headerName: 'Status', field: 'Status', order: 8, type: 'status', orderable: true },
                // { headerName: 'Action', field: 'PriceListId-A', order: 9, type: 'View'},
                { sTitle: 'ID', title: 'PriceListId', Index: "0", "orderable": false },
                { sTitle: 'Price List Name', title: 'ListName', orderable: true },
                { sTitle: 'Account Name', title: 'AccountName', orderable: true },
                { sTitle: 'Currency', title: 'CurrencyCode', "orderable": false },
                { sTitle: 'Start Date', title: 'StartDate', "orderable": false },
                { sTitle: 'End Date', title: 'EndDate', "orderable": false },
                { sTitle: 'Created On', title: 'CreatedOn', "orderable": false },
                { sTitle: 'Status', title: 'Status', Type: "Status", orderable: true },
                { sTitle: 'Action', title: 'Action', Action: "View", Index: '0', "orderable": false },
            ],
            // gridSetting: {
            //     "searching": true,
            //     "order": [],
            //     "columnDefs": [{
            //         "targets": 'no-sort',
            //         "orderable": false,
            //     }]
            // },
            grdTotalRows: 0,
            grdTotalPages: 0,
            serviceInputs: [{
                UserId: parseInt(priceupload.getAttribute('currentUserId')),
                FilterType: '',
                SearchValue: '',
                PageSize: 10,
                PageNumber: 1,
                callType: 1
            }],
            customerData: [],
        };
        this.apiData = new ApiDataProvider();
        this.commonProvider = new CommonDataProvider();
        this.onCustomerList = this.onCustomerList.bind(this);
        this.onPriceSearch = this.onPriceSearch.bind(this);
        this.UserId = parseInt(priceupload.getAttribute('currentUserId'))
    }

    // Basawaraj Apr 30 19 MP-127
    componentDidUpdate() {
        let object = this;
        $('#priceUploadfillterlist').multiselect({
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

    // componentWillReceiveProps(){
    //    // this.showfuture = true;
    //    // this.ShowActive = true;
    //     this.GetPriceList();
    // }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    componentDidMount() {
        //this.showfuture = true;
        //this.ShowActive = true;
        this.GetPriceList();
        this.interval = setInterval(() => {
            this.RefreshGrid()
        }, 10000);
        //setInterval(this.GetPriceList(),10000);
        //setInterval(this.RefreshGrid(),100000);
    }
    RefreshGrid() {
        this.GetPriceList();
    }
    // shouldComponentUpdate()
    // {
    //     setInterval(this.RefreshGrid(),100000);
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
                        GridData: [], grdTotalRows: 0, grdTotalPages: 0

                    });

                }
            });

    }

    GridCallActionMehod(fID) {
        this.props.onViewDetail(fID);
    }

    EditPriceManagement(fID) {
        this.props.onEditPriceManagement(fID);
    }

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
    filterOnChange() {
        let object = this;
        // object.showfuture = false;
        // object.showDeactivated = false;
        // object.showexpired = false;
        // object.ShowActive = false;
        // object.ShowProcessed=false;
        // object.ShowPartProcessed=false;
        // object.showFailed=false;
        // object.showStaging=false;
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
                    else if ($(this).find('input[type=checkbox]').val() == 'Processed') {
                        // object.ShowProcessed = true;
                        filterValues += "Processed,"
                    }
                    else if ($(this).find('input[type=checkbox]').val() == 'Part-Processed') {
                        //object.ShowPartProcessed= true;
                        filterValues += "Part-Processed,"
                    }
                    else if ($(this).find('input[type=checkbox]').val() == 'Failed') {
                        //object.showFailed= true;
                        filterValues += "Failed,"
                    }
                    else if ($(this).find('input[type=checkbox]').val() == 'Staging') {
                        //object.showStaging = true;
                        filterValues += "Staging,"
                    }
                }

            });
            object.state.serviceInputs[0].FilterType = filterValues;
            object.state.serviceInputs[0].PageNumber = 1;
            object.GetPriceList();
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
        //Sanjay needs to work on this
    }
    onCustomerList(arg) {
        let searchVal;
        if (arg == '' || arg == null) {
            searchVal = null;
        } else {
            searchVal = arg.trim();
        }
        this.commonProvider.getallCustomer(searchVal, '', '', this.UserId).then(
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
    render() {
        return (
            <div id="listPage" className="pr-fullwidth">
                <div className="pr-fullwidth">

                    <div className="pull-left">
                        <div id="exportSplitBtn" className="dropdown prdd">
                            <button className="btn btn-secondary dropdown-toggle d-blue-button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Export
                                </button>
                            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <a className="dropdown-item" title="Downlaod Price Browse Excel file" onClick={this.DownlaodExcel.bind(this, 'Excel')} href="#">Excel <span class="excel-icon"></span></a>
                                <a className="dropdown-item" title="Download Price Browse CSV file" onClick={this.DownlaodExcel.bind(this, 'CSV')} href="#">CSV <span class="csv-icon"></span></a>
                            </div>
                        </div>
                    </div>


                    <div id='dtfilter' className="pull-left index-high">
                        <select className="multiselect-opacity"
                            data-placeholder="Filter List Item"
                            id="priceUploadfillterlist"
                            multiple="multiple"  >
                            <option value="Active">Active</option>
                            <option value="Future">Future</option>
                            <option value="Deactivated">Deactivated</option>
                            <option value="Expired">Expired</option>
                            <option value="Processed">Processed</option>
                            <option value="Part-Processed">Part-Processed</option>
                            <option value="Failed">Failed</option>
                            <option value="Staging">Staging</option>
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
                </div>
                <div className="tbl-grid-cover mar-top-ten">
                    {/* <GridTable gridID="priceUploadList"
                     isTableGrid="True" 
                     GridSeetingData={this.state.gridSetting} 
                     onEdit={this.EditPriceManagement.bind(this)}
                      onView={this.GridCallActionMehod.bind(this)} 
                      TableHeader={this.state.headers} 
                      TableRow={this.state.GridData} /> */}
                    <DataGrid
                        ref={instance => this.child = instance}
                        Id="grdPriceUpload"
                        IsPagination={true}
                        ColumnCollection={this.state.headers}
                        totalrows={this.state.grdTotalRows}
                        totalpages={this.state.grdTotalPages}
                        Onpageindexchanged={this.onPagechange.bind(this)}
                        GridData={this.state.GridData}
                        // onEditMethod={this.EditPriceManagement.bind(this)}
                        onEditMethod={this.GridCallActionMehod.bind(this)}
                        ActionButton="View"
                    />
                </div>
            </div>
        );
    }
}

export default PriceUploadList;