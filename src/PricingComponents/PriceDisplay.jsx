import React from 'react';
import ButtonComponent from '../ReactComponents/Button/Button.jsx';
import CalendarJs from '../ReactComponents/Calendar/Calendar.jsx';
import Autocomplete from "../ReactComponents/Autocomplete/Autocomplete.jsx";
import DisplayPriceDataProvider from "../Common/DataProvider/DisplayPriceDataProvider.js";
import DisplayPriceBL from './PriceDisplayBL.js';

import Label from "../ReactComponents/Label/Label.jsx";
import { Typeahead } from 'react-bootstrap-typeahead';


import CommonDataProvider from "../Common/DataProvider/CommonDataProvider.js";
import { debug } from 'util';
let objBL = new DisplayPriceBL();

class PriceDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            CustomerData: [],
            ItemData: [],
            custoemrvalue: '',
            datevalue: '',
            currencyvalue: '',
            itemvalue: '',
            datavalue: '',
            resultpriceid: "Null",
            resultunitprice: "Null",
            resultconnectionid: "Null",
            resultaccountid: "Null",
            resultitemid: "Null",
            resultpriceaccountid: "Null",
            show: false
        };
    }

    oncustomerselected(value) {
        if (value.length > 0) {
            this.setState({ custoemrvalue: value[0].AccountCode });
            this.setState({ currencyvalue: value[0].QADCode });
        }
    }

    onitemselected(value) {
        if (value.length > 0)
            this.setState({ itemvalue: value[0].ItemCode })
    }

    onsubmit() {
        if (objBL.ValidatePriceDisplay()) {
            let dbprovider = new DisplayPriceDataProvider();
            dbprovider.getproductprice(this.state.custoemrvalue, this.state.currencyvalue, this.state.itemvalue, this.state.datavalue).then(json => json.json()).then(
                jsresponse => {
                    if (jsresponse != "") {
                        if (jsresponse.PriceId > 0) {
                            this.setState({ resultpriceid: jsresponse.PriceId })
                            this.setState({ resultunitprice: jsresponse.UnitPrice })
                            this.setState({ resultitemid: jsresponse.ItemId })
                            this.setState({ resultconnectionid: jsresponse.ConnectionId })
                            this.setState({ resultaccountid: jsresponse.AccountId })
                            this.setState({ resultpriceaccountid: jsresponse.PriceAccountId })
                            jsresponse.ItemCode = this.state.itemvalue
                            jsresponse.QTY = 0
                            $("#json").html(JSON.stringify(jsresponse, undefined, 2))

                            $(".showresult").css("display", "block");
                            $(".hideresult").css("display", "none");
                        } else {
                            $(".hideresult").css("display", "block");
                            $(".showresult").css("display", "none");
                        }
                    }
                    else {
                        $(".hideresult").css("display", "block");
                        $(".showresult").css("display", "none");
                    }
                }
            )
        }
    }

    onreset() {
        this.setState({ currencyvalue: '' });
        this.tahItem.getInstance().clear()
        this.tahCustomer.getInstance().clear()
        $(".showresult").css("display", "none");
        $(".hideresult").css("display", "none");
        $('#dtValidDate input').val('');
    }

    getitems(e) {
        let db = new CommonDataProvider();
        db.getitems(e, "").then(
            resp => resp.json()).then(
                jsdata => this.setState({ ItemData: jsdata })
            );
    }

    getcustomers(e) {

        let db = new CommonDataProvider();
        db.getcustomer(e, "AccountCode, CurrencyId, QADCode, SearchColumn").then(
            resp => resp.json()).then(
                jsdata => this.setState({ CustomerData: jsdata })
            )
    }
    onDateSelected(value) {
        let dtvalue = moment($(value.currentTarget).find('input')[0].value, "DD-MM-YYYY").format("MM/DD/YYYY");
        this.setState({ datavalue: dtvalue });
    }
    componentDidMount() {
        objBL.CreateDispalyPriceValidators();
        $(".hideresult").css("display", "none");
    }
    ClearTyeahead(type, event) {
        if (type == 'I') {
            var option = this.tahItem.props.options;
            if (!option.includes(event.target.value))
                this.tahItem.getInstance().setState({ text: '' });
        }
        if (type == 'C') {
            var option = this.tahCustomer.props.options;
            if (!option.includes(event.target.value))
                this.tahCustomer.getInstance().setState({ text: '' });
        }
    }
    render() {
        return (
            <div className="pr-body card-header">
                <div className="pr-connection-main">
                    <div className="pr-fullwidth card-title">
                        <div className="pr-heading">Price Test</div>
                        <div className="pr-cid"></div>
                    </div>
                    <div className="pd-half-left">
                        <div className="pd-title">Request</div>
                        <div className="cf-row-half">
                            <label className="cf-label">Item Name</label>
                            <div className="pd-input-cover">
                                <div id="txtItem" className="pr-typeahead">
                                    <Typeahead
                                        ref={(typeahead) =>
                                            this.tahItem = typeahead}
                                        labelKey="Name"
                                        onChange={this.onitemselected.bind(this)}
                                        onInputChange={this.getitems.bind(this)}
                                        options={this.state.ItemData} placeholder="Type Item Name/Code"
                                        onBlur={this.ClearTyeahead.bind(this, 'I')}

                                    />
                                </div>
                            </div>
                        </div>
                        <div className="cf-row-half">
                            <label className="cf-label">Customer Name</label>
                            <div className="pd-input-cover">
                                <div id="txtCustomer" className="pr-typeahead">
                                    <Typeahead
                                        ref={(typeahead) =>
                                            this.tahCustomer = typeahead}
                                        labelKey="SearchColumn"
                                        onChange={this.oncustomerselected.bind(this)}
                                        onInputChange={this.getcustomers.bind(this)}
                                        options={this.state.CustomerData} placeholder="Customer Name/Code"
                                        onBlur={this.ClearTyeahead.bind(this, 'C')}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="cf-row-half">
                            <label className="cf-label">Date</label>
                            <div className="pd-input-cover">
                                <CalendarJs DateFormate="dd-mm-yyyy" onDateChange={this.onDateSelected.bind(this)} Id="dtValidDate" />
                            </div>
                        </div>
                        <div className="cf-row-half">
                            <label className="cf-label">Currency Code</label>
                            <div className="pd-input-cover mar-top-five">
                                <div id="txtCurrency" className="pr-typeahead">
                                    <span class="data-text">{this.state.currencyvalue}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pr-fullwidth-padd">
                            <ButtonComponent Action={this.onreset.bind(this)} ClassName="d-grey-button pr-pull-right space-left" Text="Reset" />
                            <ButtonComponent Action={this.onsubmit.bind(this)} ClassName="d-blue-button pr-pull-right" Text="Submit" />
                        </div>
                    </div>
                    {/*
                    <div className="pd-half-right">
                        <div className="pd-title">Result</div>
                        <div className="pr-fullwidth showresult">
                            <div className="cf-row-half">
                                <div className="pd-input-cover">
                                    <div className="cf-row">
                                        <label className="cf-label">Price Id <span className="colon">:</span></label>

                                        < Label Class="cf-text-cover ellipsiss" Value={this.state.resultpriceid} />

                                    </div>
                                </div>
                            </div>
                            <div className="cf-row-half">
                                <div className="pd-input-cover">
                                    <div className="cf-row">
                                        <label className="cf-label">Unit Price <span className="colon">:</span></label>

                                        < Label Class="cf-text-cover ellipsiss" Value={this.state.resultunitprice} />

                                    </div>
                                </div>
                            </div>
                            <div className="cf-row-half">
                                <div className="pd-input-cover">
                                    <div className="cf-row">
                                        <label className="cf-label">Connection Id <span className="colon">:</span></label>

                                        < Label Class="cf-text-cover ellipsiss" Value={this.state.resultconnectionid} />

                                    </div>
                                </div>
                            </div>
                            <div className="cf-row-half">
                                <div className="pd-input-cover">
                                    <div className="cf-row">
                                        <label className="cf-label">Account Id <span className="colon">:</span></label>

                                        < Label Class="cf-text-cover ellipsiss" Value={this.state.resultaccountid} />

                                    </div>
                                </div>
                            </div>
                            <div className="cf-row-half">
                                <div className="pd-input-cover">
                                    <div className="cf-row">
                                        <label className="cf-label">Item Id <span className="colon">:</span></label>

                                        < Label Class="cf-text-cover ellipsiss" Value={this.state.resultitemid} />

                                    </div>
                                </div>
                            </div>
                            <div className="cf-row-half">
                                <div className="pd-input-cover">
                                    <div className="cf-row">
                                        <label className="cf-label">Price ListID<span className="colon">:</span></label>

                                        < Label Class="cf-text-cover ellipsiss" Value={this.state.resultpriceaccountid} />

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pr-fullwidth hideresult">No Result Found</div>
</div>*/}
                    <div className="pd-half-right">
                        <div className="pd-title">Result json</div>
                        <div className="pr-fullwidth showresult">
                            {//PriceResult[
                                <pre>
                                    <div id='json' ></div>
                                </pre>
                                // <pre>               ]</pre>
                            }
                        </div>
                        <div className="pr-fullwidth hideresult">No Result Found</div>
                    </div>
                </div>
            </div>
        );
    }
}
export default PriceDisplay;