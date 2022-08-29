import React, { Component } from 'react';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from './DataProvider';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
import * as appCommon from '../../Common/AppCommon.js';
const $ = window.$;
class TicketReopen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Description: ''
        }
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    onClose = () => {
        this.setState({ Description: '' })
        $(`#${this.props.Id}`).modal('hide')
    }

    OnSave = () => {
        //console.log(this.props.TicketId, this.state.Description.replace(/\n/g, " "));
        if (this.props.TicketId !== null && this.state.Description !== '') {
            let type = 'TRO';
            var model = this.getModel(type);
            // console.log(model);
            this.manageTickets(model, type);
            let logsms = `Re-Open the ticket with  ${this.state.Description}`;
            this.props.onAddTicketHistory(logsms);
            this.props.onCloseTicketDetails();
        }
        else {
            appCommon.showtextalert("Re-open reason can't be empty!", "", "error");
        }
    }

    getModel = (type) => {
        var model = [];
        switch (type) {
            case 'TRO':
                model.push({
                    "ticketId": this.props.TicketId ? parseInt(this.props.TicketId) : 0,
                    "reopenReason": this.state.Description.replace(/\n/g, " "),
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
                            case 'TRO':
                                if (rData === 1) {
                                    appCommon.showtextalert("Ticket Reopen Successfully!", "", "success");
                                    //Refresh board data
                                    this.props.loadBoradData();
                                    this.props.onTicketReopen(1);
                                    this.onClose();
                                }
                                else
                                    appCommon.showtextalert("Ticket Reopen Failed !", "", "error");
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
                                    <textarea
                                        onChange={(e) => this.setState({ Description: e.target.value },
                                            // () =>
                                            //     console.log(this.state.Description.replace(/\n/g, " "))
                                        )}
                                        value={this.state.Description}
                                        placeholder="Enter Re open Reason"
                                        className="form-control form-control-sm"
                                        rows="4"
                                    />
                                </div>

                            </div>
                            <div className="modal-footer">
                                <Button
                                    Id="btnSave"
                                    Text="Re-open"
                                    Action={this.OnSave.bind(this)}
                                    ClassName="btn btn-danger" />
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

export default TicketReopen;