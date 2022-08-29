import React from 'react';
import DataGrid from '../ReactComponents/DataGrid/DataGrid.jsx';
import AccountDataProvider from "../Common/DataProvider/AccountDataProvider.js";
import TestingComponent from '../ReactComponents/Testing.jsx'
// import Highcharts from 'highcharts';
// import ReactHighcharts from 'react-highcharts';
// import highcharts3d from 'highcharts/highcharts-3d'
// highcharts3d(ReactHighcharts.Highcharts);
import ButtonComponent from '../ReactComponents/Button/Button.jsx';
import { deepStrictEqual } from 'assert';
class TestComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            GridColumns: [
                { title: 'Serail', sTitle: 'Serial', "orderable": false },
                { title: 'Number', sTitle: 'Account Code', "orderable": false },
                { title: 'Name', sTitle: 'Customer Name' },
                { title: 'Type', sTitle: 'Account Type' },
                { title: 'Domain', sTitle: 'Domain' },
                { title: 'AddressLine3', sTitle: 'Address' },
                { title: 'City', sTitle: 'City' },
                { title: 'AddressPostalCode', sTitle: 'Postal Code' },
                { sTitle: 'Action', title: 'Action', Action: "Edit", Index: '1', "orderable": false }
            ],
            TextValue:'medline',
            totalrows: 0,
            totalpages: 0,
            pagesize: 10,
            JsonData: null,
            pagemode: 'home',
        };
        this.apiData = new AccountDataProvider();
        this.pricelistdata = null;
        

    }

    GetPriceBrowseList() {
        this.GetdAccountDate(1);
    }
    GetdAccountDate(pagenumber) {
        this.apiData.GetAccountList(this.state.pagesize, pagenumber)
            .then(resv => resv.json())
            .then(rData => {
                if (rData.length > 0) {
                    this.pricelistdata = rData;
                    this.setState({ totalrows: rData[0].TotalRows })
                    this.setState({ totalpages: rData[0].TotalPages })
                    this.setState({ JsonData: rData });
                }
            });
    }

    async testmethod() {
        //let d;
        return await (await fetch('https://localhost:44302/api/Account/AccountList?PageSize=10&PageNumber=1')).json();
        //return d;
        //const response =  fetch('https://localhost:44302/api/Account/AccountList?PageSize=10&PageNumber=1');
        //return await response.json();
    }

    async componentDidMount() {
        let response = await this.testmethod();
        // alert(JSON.stringify(response));
        // alert("Done");
        this.GetPriceBrowseList();

    }
    editgridmethod() {
        // alert('Edit method');
    }
    callEdit() {
        //  alert('Edit method');
    }
    onpagechange(index) {
        // alert(index);
        this.GetdAccountDate(index);
    }

    onAccountView(id) {
        //alert(id);
    }
    onTextChanged(evt) {
        this.setState({TextValue:evt.target.value});
    }
    onsaveclick(){
        //alert('hello');
        this.setState({TextValue:'sanjay'});
    }

    render() {
        return (
            <div className="pr-fullwidth">
                <TestingComponent Value={this.state.TextValue} onsavechange={this.onsaveclick.bind(this)} />
                <input type="text" onChange={this.onTextChanged.bind(this)} ></input>
                {this.state.pagemode == 'home' &&


                    <div className="tbl-grid-cover">
                        <div className="tbl-loading"><img src="../../Content/UIAssets/images/loading_bar.gif" alt="processing" title="processing" /></div>
                        <DataGrid Id="tbl" ColumnCollection={this.state.GridColumns}
                            totalrows={this.state.totalrows} totalpages={this.state.totalpages}
                            Onpageindexchanged={this.onpagechange.bind(this)}
                            GridData={this.pricelistdata}
                            onEditMethod={this.onAccountView.bind(this)}
                        />
                    </div>
                }
                {this.state.pagemode == 'customer' &&
                    <div className="pr-fullwidth">
                        <ButtonComponent Action="" ClassName="d-blue-button pr-pull-right space-left"
                            // Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                            Text="Back"
                        />

                        <div class="tab custinfo" role="tabpanel">
                            <ul class="nav nav-tabs" role="tablist">
                                <li role="presentation" class="active"><a href="#Section1" aria-controls="home" role="tab" data-toggle="tab">Pricing</a></li>
                                <li role="presentation"><a href="#Section2" aria-controls="profile" role="tab" data-toggle="tab">Discount</a></li>
                                <li role="presentation"><a href="#Section3" aria-controls="messages" role="tab" data-toggle="tab">Rebate</a></li>
                            </ul>
                            <div class="tab-content">
                                <div role="tabpanel" class="tab-pane fade in active" id="Section1">
                                    <h2>306090 - Rohan Goswami</h2>
                                    <div className="cdtp-block-l brd-right-orng">
                                        <div className="custo-data">
                                            <div className="cd-row-half">
                                                <div className="cd-row">
                                                    <div className="cd-label-text">ID <span>:</span></div>
                                                    <div className="cd-data-text">906030</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Type <span>:</span></div>
                                                    <div className="cd-data-text">Customer</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Domain <span>:</span></div>
                                                    <div className="cd-data-text">GB</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Status <span>:</span></div>
                                                    <div className="cd-data-text">Active</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Currency <span>:</span></div>
                                                    <div className="cd-data-text">Euro</div>
                                                </div>
                                            </div>
                                            <div className="cd-row-half">
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Address <span>:</span></div>
                                                    <div className="cd-data-text-full">77 Umaid Heritage, Umaid Palace Road, Jodhpur, Rajasthan, India.</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Postal Code <span>:</span></div>
                                                    <div className="cd-data-text">342001</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">City <span>:</span></div>
                                                    <div className="cd-data-text">Jodhpur</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Country <span>:</span></div>
                                                    <div className="cd-data-text">India</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cdtp-block-r">
                                        <div className="cdtp-tiles">
                                            <div className="tile-titles">Connections (120)</div>
                                            <div className="detail-counts">
                                                <div className="dc-row"><font className="clur-1-txt">Active</font><span className="dc-numb clur-1">50</span></div>
                                                <div className="dc-row"><font className="clur-4-txt">Future</font><span className="dc-numb clur-4">24</span></div>
                                                <div className="dc-row"><font className="clur-2-txt">Deactivated</font><span className="dc-numb clur-2">36</span></div>
                                                <div className="dc-row"><font className="clur-5-txt">Expired</font><span className="dc-numb clur-5">10</span></div>
                                            </div>
                                        </div>
                                        <div className="cdtp-tiles">
                                            <div className="tile-titles">Price Lists (130)</div>
                                            <div className="detail-counts">
                                                <div className="dc-row"><font className="clur-3-txt">Staging</font><span className="dc-numb clur-3">25</span></div>
                                                <div className="dc-row"><font className="clur-1-txt">Active</font><span className="dc-numb clur-1">72</span></div>
                                                <div className="dc-row"><font className="clur-4-txt">Future</font><span className="dc-numb clur-4">18</span></div>
                                                <div className="dc-row"><font className="clur-2-txt">Deactivated</font><span className="dc-numb clur-2">10</span></div>
                                                <div className="dc-row"><font className="clur-5-txt">Expired</font><span className="dc-numb clur-5">5</span></div>
                                            </div>
                                        </div>
                                        <div className="cdtp-tiles ">
                                            <div className="tile-titles">Item price (245)</div>
                                            <div className="detail-counts">
                                                <div className="dc-row"><font className="clur-3-txt">Staging</font><span className="dc-numb clur-3">195</span></div>
                                                <div className="dc-row"><font className="clur-1-txt">Active</font><span className="dc-numb clur-1">88</span></div>
                                                <div className="dc-row"><font className="clur-4-txt">Future</font><span className="dc-numb clur-4">12</span></div>
                                                <div className="dc-row"><font className="clur-2-txt">Deactivated</font><span className="dc-numb clur-2">5</span></div>
                                                <div className="dc-row"><font className="clur-5-txt">Expired</font><span className="dc-numb clur-5">45</span></div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                <div role="tabpanel" class="tab-pane fade" id="Section2">
                                    <h2>306090 - Rohan Goswami</h2>
                                    <div className="cdtp-block-l brd-right-orng">
                                        <div className="custo-data">
                                            <div className="cd-row-half">
                                                <div className="cd-row">
                                                    <div className="cd-label-text">ID <span>:</span></div>
                                                    <div className="cd-data-text">906030</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Type <span>:</span></div>
                                                    <div className="cd-data-text">Customer</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Domain <span>:</span></div>
                                                    <div className="cd-data-text">GB</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Status <span>:</span></div>
                                                    <div className="cd-data-text">Active</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Currency <span>:</span></div>
                                                    <div className="cd-data-text">Euro</div>
                                                </div>
                                            </div>
                                            <div className="cd-row-half">
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Address <span>:</span></div>
                                                    <div className="cd-data-text-full">77 Umaid Heritage, Umaid Palace Road, Jodhpur, Rajasthan, India.</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Postal Code <span>:</span></div>
                                                    <div className="cd-data-text">342001</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">City <span>:</span></div>
                                                    <div className="cd-data-text">Jodhpur</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Country <span>:</span></div>
                                                    <div className="cd-data-text">India</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cdtp-block-r">
                                        <div className="cdtp-tiles">
                                            <div className="tile-titles">Connections (120)</div>
                                            <div className="detail-counts">
                                                <div className="dc-row"><font className="clur-1-txt">Active</font><span className="dc-numb clur-1">50</span></div>
                                                <div className="dc-row"><font className="clur-4-txt">Future</font><span className="dc-numb clur-4">24</span></div>
                                                <div className="dc-row"><font className="clur-2-txt">Deactivated</font><span className="dc-numb clur-2">36</span></div>
                                                <div className="dc-row"><font className="clur-5-txt">Expired</font><span className="dc-numb clur-5">10</span></div>
                                            </div>
                                        </div>
                                        <div className="cdtp-tiles">
                                            <div className="tile-titles">Price Lists (130)</div>
                                            <div className="detail-counts">
                                                <div className="dc-row"><font className="clur-3-txt">Staging</font><span className="dc-numb clur-3">25</span></div>
                                                <div className="dc-row"><font className="clur-1-txt">Active</font><span className="dc-numb clur-1">72</span></div>
                                                <div className="dc-row"><font className="clur-4-txt">Future</font><span className="dc-numb clur-4">18</span></div>
                                                <div className="dc-row"><font className="clur-2-txt">Deactivated</font><span className="dc-numb clur-2">10</span></div>
                                                <div className="dc-row"><font className="clur-5-txt">Expired</font><span className="dc-numb clur-5">5</span></div>
                                            </div>
                                        </div>
                                        <div className="cdtp-tiles ">
                                            <div className="tile-titles">Item price (245)</div>
                                            <div className="detail-counts">
                                                <div className="dc-row"><font className="clur-3-txt">Staging</font><span className="dc-numb clur-3">195</span></div>
                                                <div className="dc-row"><font className="clur-1-txt">Active</font><span className="dc-numb clur-1">88</span></div>
                                                <div className="dc-row"><font className="clur-4-txt">Future</font><span className="dc-numb clur-4">12</span></div>
                                                <div className="dc-row"><font className="clur-2-txt">Deactivated</font><span className="dc-numb clur-2">5</span></div>
                                                <div className="dc-row"><font className="clur-5-txt">Expired</font><span className="dc-numb clur-5">45</span></div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                <div role="tabpanel" class="tab-pane fade" id="Section3">
                                    <h2>306090 - Rohan Goswami</h2>
                                    <div className="cdtp-block-l brd-right-orng">
                                        <div className="custo-data">
                                            <div className="cd-row-half">
                                                <div className="cd-row">
                                                    <div className="cd-label-text">ID <span>:</span></div>
                                                    <div className="cd-data-text">906030</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Type <span>:</span></div>
                                                    <div className="cd-data-text">Customer</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Domain <span>:</span></div>
                                                    <div className="cd-data-text">GB</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Status <span>:</span></div>
                                                    <div className="cd-data-text">Active</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Currency <span>:</span></div>
                                                    <div className="cd-data-text">Euro</div>
                                                </div>
                                            </div>
                                            <div className="cd-row-half">
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Address <span>:</span></div>
                                                    <div className="cd-data-text-full">77 Umaid Heritage, Umaid Palace Road, Jodhpur, Rajasthan, India.</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Postal Code <span>:</span></div>
                                                    <div className="cd-data-text">342001</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">City <span>:</span></div>
                                                    <div className="cd-data-text">Jodhpur</div>
                                                </div>
                                                <div className="cd-row">
                                                    <div className="cd-label-text">Country <span>:</span></div>
                                                    <div className="cd-data-text">India</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cdtp-block-r">
                                        <div className="cdtp-tiles">
                                            <div className="tile-titles">Connections (120)</div>
                                            <div className="detail-counts">
                                                <div className="dc-row"><font className="clur-1-txt">Active</font><span className="dc-numb clur-1">50</span></div>
                                                <div className="dc-row"><font className="clur-4-txt">Future</font><span className="dc-numb clur-4">24</span></div>
                                                <div className="dc-row"><font className="clur-2-txt">Deactivated</font><span className="dc-numb clur-2">36</span></div>
                                                <div className="dc-row"><font className="clur-5-txt">Expired</font><span className="dc-numb clur-5">10</span></div>
                                            </div>
                                        </div>
                                        <div className="cdtp-tiles">
                                            <div className="tile-titles">Price Lists (130)</div>
                                            <div className="detail-counts">
                                                <div className="dc-row"><font className="clur-3-txt">Staging</font><span className="dc-numb clur-3">25</span></div>
                                                <div className="dc-row"><font className="clur-1-txt">Active</font><span className="dc-numb clur-1">72</span></div>
                                                <div className="dc-row"><font className="clur-4-txt">Future</font><span className="dc-numb clur-4">18</span></div>
                                                <div className="dc-row"><font className="clur-2-txt">Deactivated</font><span className="dc-numb clur-2">10</span></div>
                                                <div className="dc-row"><font className="clur-5-txt">Expired</font><span className="dc-numb clur-5">5</span></div>
                                            </div>
                                        </div>
                                        <div className="cdtp-tiles ">
                                            <div className="tile-titles">Item price (245)</div>
                                            <div className="detail-counts">
                                                <div className="dc-row"><font className="clur-3-txt">Staging</font><span className="dc-numb clur-3">195</span></div>
                                                <div className="dc-row"><font className="clur-1-txt">Active</font><span className="dc-numb clur-1">88</span></div>
                                                <div className="dc-row"><font className="clur-4-txt">Future</font><span className="dc-numb clur-4">12</span></div>
                                                <div className="dc-row"><font className="clur-2-txt">Deactivated</font><span className="dc-numb clur-2">5</span></div>
                                                <div className="dc-row"><font className="clur-5-txt">Expired</font><span className="dc-numb clur-5">45</span></div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
    }

}

export default TestComponent;