import React from 'react';
import DataGrid from '../ReactComponents/DataGrid/DataGrid.jsx';
import ApiDataProvider from "../Common/ApiDataProvider.js";
import ButtonComponent from '../ReactComponents/Button/Button.jsx';
import PriceListManagement from "../PricingComponents/priceListManagement.jsx";
import { Typeahead } from 'react-bootstrap-typeahead';
import CommonDataProvider from "../Common/DataProvider/CommonDataProvider.js";
import Commonjs from '../Common/AppCommon.js';
import UrlProvider from "../Common/ApiUrlProvider.js";
import swal from "sweetalert";
import Shield from "../ReactComponents/Shield/Shield.jsx";
import CommonTitleHeader from '../ReactComponents/CommonTitleHeader/CommonTitleHeader.jsx';

let url = new UrlProvider().MainUrl;

let objcommonjs = new Commonjs();
let showexpired = false;
let showfuture = false;
let showDeactivated = false;
let showActive = false;
let pricelistidtitle =0;
class PriceBrowse extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PriceBrowseGridData: null,
            PriceBrowseGridHeader: [
                { sTitle: 'Id', title: 'PriceId', "orderable": false },
                { sTitle: 'Item Code', title: 'ItemCode' },
                { sTitle: 'Item Name', title: 'Item' },
                { sTitle: 'Account Name', title: 'AccountNumber' },
                { sTitle: 'Domain', title: 'Domain', "orderable": false },
                { sTitle: 'Type', title: 'Type', "orderable": false },
                { sTitle: 'Start Date', title: 'StartDate', "orderable": false },
                { sTitle: 'End Date', title: 'EndDate', "orderable": false },
                { sTitle: 'Remaining', title: 'Remaining', "orderable": false },
                { sTitle: 'Currency', title: 'Currency', "orderable": false },
                { sTitle: 'Price', title: 'Price', "orderable": false },
                { sTitle: 'Status', title: 'Status' },
                { sTitle: 'Price List Id', title: 'PriceListId', "orderable": false },
                { sTitle: 'Action', title: 'Action', Action:"Edit", Index:'12',"orderable": false }
            ],
            CustomerData: [],
            custoemrValue: '',
            ItemData: [],
            itemValue: '',
            DisplayPage: 'Browse',
            PriceListID: '',
            // IsGridLoaded: false,
            "searching": true,
            priceGridSetting: {
            },
            totalrows: 0,
            totalpages: 0,
        };
        this.showActive=true;
        this.showfuture=true;
        this.PriceGridData = null;
        this.apiData = new ApiDataProvider();
        this.commonDataProvider = new CommonDataProvider();
        this.GetCustomers(null);
        this.GetItems('a');
        this.GetPriceBrowseList(20, 1);
    }
    // Basawaraj Apr 30 19 MP-127 add dropdown filters 
    componentDidUpdate() {
        let object = this;
        $('#priceBrowsefillterlist').multiselect({
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

    setUsername(jsonObj) {
        for (var i = 0; i < jsonObj.length; i++) {
            this.PriceGridData[i].Status = `<span class=${jsonObj[i].Status.toLowerCase()}>${jsonObj[i].Status}</span>`;
          }
      }

    GetPriceBrowseList(pageSize, pageNumber) {
        this.PriceGridData = null;
        this.apiData.getPriseBrowseList(pricebrowse.getAttribute('currentUserId'), this.state.custoemrValue, this.state.itemValue, false, this.showfuture, this.showexpired, this.showDeactivated, pageSize, pageNumber, this.showActive)
            .then(resv => resv.json())
            .then(rData => {
                this.PriceGridData = rData;
                this.setUsername(this.PriceGridData);
                if (rData.length > 0) {
                    this.setState({ totalrows: rData[0].TotalRows });
                    this.setState({ totalpages: rData[0].TotalPages });
                }
                else{
                    this.setState({ totalrows: 0 });
                    this.setState({ totalpages: 0 });
                }
                this.setState({ PriceBrowseGridData: rData });
            });
    }

    onCustomerSelected(value) {
        if (value.length > 0) {
            this.setState({ custoemrValue: value[0].AccountId }, () => {
                this.GetPriceBrowseList(20, 1);
            });

        }
        else {
            this.setState({ custoemrValue: '' }, function () {
                this.GetPriceBrowseList(20, 1);
            });
        }
    }

    onItemSelected(value) {
        if (value.length > 0) {
            this.setState({ itemValue: value[0].ItemCode }, () => {
                this.GetPriceBrowseList(20, 1);
            });
        }
        else {
            this.setState({ itemValue: '' }, function () {
                this.GetPriceBrowseList(20, 1);
            });
        }
    }

    GetCustomers(e) {
        let searchVal;
        if (e == '' || e == null) {
            searchVal = null;
        } else {
            searchVal = e.trim();
        }
        this.commonDataProvider.getallCustomer(searchVal, '','', pricebrowse.getAttribute('currentUserId')).then(
            resp => resp.json()).then(
                jsdata => this.setState({ CustomerData: jsdata })
            );
    }

    ReloadPriceBrowseList() {
        this.setState({ PriceListID: null });
        this.setState({ DisplayPage: "Browse" });
        this.GetPriceBrowseList(20, 1);
    }

    EditFromPriceBrowse(fID) {
        this.setFalseToFilterParam();
        this.setState({ PriceListID: fID }, function () {
            this.setState({ DisplayPage: 'Manage' });
        });
    }

    GetItems(e) {
        this.commonDataProvider.getitems(e, '').then(
            resp => resp.json()).then(
                jsdata => this.setState({ ItemData: jsdata })
            );
    }

    DownlaodExcel(type) {
        if (this.state.PriceBrowseGridData && this.state.PriceBrowseGridData.length > 0) {
            objcommonjs.openprogressmodel('File download is in progress', 9000);
            this.apiData.CreatePriceBrowseDownloadFile(pricebrowse.getAttribute('currentUserId'), type, this.state.custoemrValue, this.state.itemValue, this.showfuture, this.showexpired, this.showDeactivated, this.showActive)
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
            console.log('No data Available');
        }
    }

    setFalseToFilterParam() {
        this.showexpired = false;
        this.showfuture = false;
        this.showDeactivated = false;
        this.showActive = false;
        this.setState({ custoemrValue: '' });
        this.setState({ itemValue: '' });
    }

    filterOnChange() {
        let object = this;
        object.showfuture = false;
        object.showDeactivated = false;
        object.showexpired = false;
        this.showActive = false;
        $('.multiselect-container').each(function () {
            $(this).find('li').each(function () {
                if ($(this).hasClass("active")) {
                    if ($(this).find('input[type=checkbox]').val() == 'Future') {
                        object.showfuture = true;
                    } else if ($(this).find('input[type=checkbox]').val() == 'Deactivated') {
                        object.showDeactivated = true;
                    } else if ($(this).find('input[type=checkbox]').val() == 'Expired') {
                        object.showexpired = true;
                    } else if ($(this).find('input[type=checkbox]').val() == 'Active') {
                        object.showActive = true;
                    }
                }

            });
            object.GetPriceBrowseList(20, 1);
        });

    }

    EditPriceBrowse(fId) {
        this.pricelistidtitle =fId;
        this.EditFromPriceBrowse(fId);
    }

    onpagechange(index) {
        this.GetPriceBrowseList(20, index);
    }
    ClearTyeahead(type, event) {
        if (type == 'I') {
           var option=this.tahItems.props.options;
           if(!option.includes(event.target.value))
               this.tahItems.getInstance().setState({ text: '' });
        }
        if (type == 'C') {
           var option=this.tahCustomer.props.options;
           if(!option.includes(event.target.value))
               this.tahCustomer.getInstance().setState({ text: '' });
        }
   }
    render() {
        return (
            <div className="pr-body card-header">
                <Shield CurrentUserId={pricebrowse.getAttribute('currentUserId')}>
                    <div className="pr-connection-main">
                        <div className="pr-fullwidth card-title">
                            {this.state.DisplayPage == 'Browse' &&
                                <div className="pr-heading">Price Browse</div>
                            }
                            {this.state.DisplayPage == 'Manage' &&
                                // <div className="pr-heading">Price List Management</div>
                                <CommonTitleHeader HeadingName="Price List Management" SubTitle="Price List Id" Full={false} ConnId={this.pricelistidtitle} />
                            }
                        </div>
                        {this.state.DisplayPage == 'Browse' &&
                            <div>
                                <div className="pr-fullwidth">

                                    <div className="pull-left">
                                        <div className="dropdown prdd">
                                            <button className=" btn btn-secondary dropdown-toggle d-blue-button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
                                        id="priceBrowsefillterlist" 
                                        defaultValue={['Active', 'Future']}
                                        multiple="multiple"  >
                                            <option value="Active">Active</option>
                                            <option value="Future">Future</option>
                                            <option value="Deactivated">Deactivated</option>
                                            <option value="Expired">Expired</option>

                                        </select>
                                    </div>
                                    <div className="acc-item1 pull-right index-high">
                                        <Typeahead
                                            ref={(typeahead) => this.tahCustomer = typeahead}
                                            labelKey="SearchColumn"
                                            onChange={this.onCustomerSelected.bind(this)}
                                            onInputChange={this.GetCustomers.bind(this)}
                                            options={this.state.CustomerData} placeholder="Account Name/Code"
                                            onBlur={this.ClearTyeahead.bind(this, 'C')}
                                        />
                                    </div>
                                    <div className="acc-item2 pull-right  index-high">
                                        <Typeahead
                                            ref={(typeahead) => this.tahItems = typeahead}
                                            labelKey="Name"
                                            onChange={this.onItemSelected.bind(this)}
                                            onInputChange={this.GetItems.bind(this)}
                                            options={this.state.ItemData} placeholder="Item"
                                            onBlur={this.ClearTyeahead.bind(this, 'I')}
                                        />
                                    </div>
                                </div>
                                <div className="tbl-grid-cover mar-top-ten">
                                    <div className="tbl-loading"><img src="../../Content/UIAssets/images/loading_bar.gif" alt="processing" title="processing" /></div>
                                    <DataGrid Id="grdPriceBrowse" 
                                    ColumnCollection={this.state.PriceBrowseGridHeader}
                                        totalrows={this.state.totalrows} 
                                        totalpages={this.state.totalpages}
                                        Onpageindexchanged={this.onpagechange.bind(this)}
                                        GridData={this.PriceGridData} 
                                        onEditMethod={this.EditPriceBrowse.bind(this)} 
                                        ActionButton="Edit,Update" 
                                        IsPagination={true}
                                        />
                                </div>

                            </div>
                        }
                        {this.state.DisplayPage == 'Manage' && this.state.PriceListID &&
                            <div className="pr-fullwidth-padd">
                                <PriceListManagement
                                    CallMode="PB"
                                    priceListID={this.state.PriceListID}
                                    onCancel={this.ReloadPriceBrowseList.bind(this)} />
                            </div>
                        }
                    </div>
                </Shield>
            </div>
        );
    }
}
export default PriceBrowse;