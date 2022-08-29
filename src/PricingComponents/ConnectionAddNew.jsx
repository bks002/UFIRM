import React from 'react';

import DataProvider from '../Common/ApiDataProvider.js';
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


import { Typeahead } from 'react-bootstrap-typeahead';
import {
    Accordion,
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
} from 'react-accessible-accordion';

import GridTable from '../ReactComponents/Grid/GridTable.jsx';
import CalendarJs from '../ReactComponents/Calendar/Calendar.jsx';

import { debug } from 'util';
class ConnectionAddNew extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    // connecto auto complete event
    getconnectto(e) {
        let db = new CommonDataProvider();
        db.getgpo(e, "").then(
            resp => resp.json()).then(

                jsdata => this.setState({ connecttodata: jsdata })
            )

    }

    onconnecttoselected(value) {
        alert("gpo selected");
        this.setState({ connecttoid: value[0].AccountId })
    }
    render() {
        return (
            <div>
                <div className="pr-box-cover pr-pull-left">
                    <fieldset>
                        <legend>Form</legend>
                        <div className="pr-form-box-buttons">
                            <ButtonComponent ClassName="d-blue-button pr-pull-right space-left"
                                Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                Text=" Add"
                                ClickEvent={this.downloadtemplate}
                            />

                            <DropDownComponent Title=" Import" Action={this.state.DropDownListActions} />
                        </div>
                        <GridTable TableHeader={this.state.headers} TableRow={this.state.GridData} />
                    </fieldset>
                </div>
                <div className="pr-box-cover pr-pull-right">
                    <fieldset>
                        <legend>Configuration</legend>
                        <div className="config-form">
                            <form className="pr-gen-form" autoComplete="off" action="">
                                <div className="cf-row">
                                    <label className="cf-label">Connect To</label>
                                    <div className="cf-input-cover">

                                        <Typeahead
                                            ref={(typeahead) =>
                                                this.tahConnectTo = typeahead}
                                            labelKey="Name"
                                            onChange={this.onconnecttoselected.bind(this)}
                                            onInputChange={this.getconnectto.bind(this)}
                                            options={this.state.connecttodata}
                                            placeholder="Type GPO Name"
                                        />
                                    </div>
                                </div>
                                <div className="cf-row">
                                    <label className="cf-label">Start Date</label>
                                    <div className="cf-input-cover">
                                        <CalendarJs Id="dtStart" />
                                    </div>
                                </div>
                                <div className="cf-row">
                                    <label className="cf-label">End Date</label>
                                    <div className="cf-input-cover">
                                        <CalendarJs Id="dtend" />
                                    </div>
                                </div>
                                <div className="cf-row">
                                    <label className="cf-label">All Items / Priority</label>
                                    <div className="cf-input-cover">
                                        <SwitchYesNo Id="chkallItems" OnSelected={this.onallitemsselected.bind(this)} />
                                        <NumericInput min={0} max={100} value={50} />
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
                                                    <SwitchYesNo />
                                                </div>
                                            </div>
                                            <div className="cf-row">
                                                <label className="cf-label">Customer Price Lock</label>
                                                <div className="cf-input-cover">
                                                    <SwitchYesNo />
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionItemBody>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </fieldset>
                </div>
                <ConnectionItemConfiguration DisplayMode={this.state.itemconfigdisplaymode} />
                <div className="pr-fullwidth-padd pr-bar-fixed">
                    <ButtonComponent ClassName="d-grey-button pr-pull-right space-left" Text="Close" />
                    <ButtonComponent ClassName="d-grey-button pr-pull-right space-left" Text="Audit Log" />
                    <ButtonComponent ClassName="d-blue-button pr-pull-right space-left" Text="Save" />

                </div>
            </div>
        );
    }
}

export default ConnectionAddNew;