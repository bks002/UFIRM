import React, { Component } from 'react';
import Button from '../../ReactComponents/Button/Button';
import InputDate from '../NoticeBoard/InputDate';

import ApiProvider from './DataProvider';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import * as appCommon from '../../Common/AppCommon.js';
const $ = window.$;

class TicketOnhold extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Description: '',
            TillDate: ''
        }
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    onClose = () => {
        this.setState({ Description: '', TillDate: '' })
        $(`#${this.props.Id}`).modal('hide')
    }

    onDateChange = (date) => this.setState({ TillDate: date })

    OnSave = () => {
        // console.log(this.props.TicketId, this.state.Description.replace(/\n/g, " "), this.state.TillDate);
        if (this.props.TicketId !== null && this.state.Description !== '' && this.state.TillDate != '') {
            let type = 'TOH';
            var model = this.getModel(type);
            // console.log(model);
            this.manageTickets(model, type);

            let logsms = `Hold Till ${this.state.TillDate} with  ${this.state.Description}`;
            this.props.onAddTicketHistory(logsms);
        }
        else {
            appCommon.showtextalert("Expiry date and comment are mandatory!!", "", "error");
        }
    }
    getModel = (type) => {
        var model = [];
        switch (type) {
            case 'TOH':
                model.push({
                    "ticketId": this.props.TicketId ? parseInt(this.props.TicketId) : 0,
                    "pausedComment": this.state.Description.replace(/\n/g, " "),
                    "pausedTilDate": this.state.TillDate,
                });
                break;
            default:
        };
        return model;
    }

    manageTickets = (model, type) => {
        this.ApiProviderr.manageTickets(model, type).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'TOH':
                                if (rData === 1) {
                                    appCommon.showtextalert("Ticket Hold Successfully!", "", "success");
                                    //Refresh board data
                                    this.props.loadBoradData();
                                    this.props.onTicketHold(1);
                                    this.onClose();
                                }
                                else
                                    appCommon.showtextalert("Ticket Hold Failed !", "", "error");
                                break;
                            default:
                        }
                    });
                }
            });
    }

    render() {
        return (
            <div className="row">
                <div className="modal fade" id={this.props.Id} data-keyboard="false" data-backdrop="static">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content" style={{ top: "160px" }}>
                            <div className="modal-header">
                                <h4 className="modal-title">{this.props.titile}</h4>
                                <button type="button"
                                    className="close"
                                    // data-dismiss="modal"
                                    aria-label="Close"
                                    onClick={this.onClose.bind(this)}
                                >
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="txtexpiryDate">Expiry Date</label>
                                    <InputDate
                                        Id='txtexpiryDate'
                                        DateFormate="dd/mm/yyyy"
                                        handleOnchage={this.onDateChange.bind(this)}
                                        value={this.state.TillDate}
                                    />
                                </div>
                                <div className="form-group">
                                    <textarea
                                        onChange={(e) => this.setState({ Description: e.target.value },
                                            // () =>
                                            //     console.log(this.state.Description.replace(/\n/g, " "))
                                        )}
                                        value={this.state.Description}
                                        placeholder="Enter Description"
                                        className="form-control form-control-sm"
                                        rows="4"
                                    />
                                </div>

                            </div>
                            <div className="modal-footer">
                                <Button
                                    Id="btnSave"
                                    Text="Save"
                                    Action={this.OnSave.bind(this)}
                                    ClassName="btn btn-primary" />
                                <Button
                                    Id="btnCancel"
                                    Text="Cancel"
                                    Action={this.onClose.bind(this)}
                                    ClassName="btn btn-secondary" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default TicketOnhold;