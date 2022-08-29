import React, { Component } from 'react';
import Button from '../../ReactComponents/Button/Button';
import ResidentPendingApproval from './Residents/ResidentPendingApproval';
import ServiceStaffPendingApproval from './Service-Staff/ServiceStaffPendingApproval';

class PendingApproval extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isActiveInactiveClass: 1,
        };
    }
    checkActiveInactiveData = (val) => {
        this.setState({ isActiveInactiveClass: val })
    }
    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-12">
                        <p>Comming Soon...</p>
                        {/* <div className="card">
                            <div className="card-header d-flex p-0">
                                <ul className="nav tableFilterContainer">
                                    <li className="nav-item">
                                        <div className="btn-group">
                                            <Button id="btnResident"
                                                Action={this.checkActiveInactiveData.bind(this, 1)}
                                                ClassName={this.state.isActiveInactiveClass === 1 ? 'btn btn-success' : 'btn btn-default'}
                                                Text="Residents" />

                                            <Button id="btnServicesStaff"
                                                Action={this.checkActiveInactiveData.bind(this, 0)}
                                                ClassName={this.state.isActiveInactiveClass === 0 ? 'btn btn-success' : 'btn btn-default'}
                                                Text="Services&Staff" />
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="card-body pt-2">
                                {
                                    this.state.isActiveInactiveClass == 1 ?
                                        <ResidentPendingApproval />
                                        :
                                        <ServiceStaffPendingApproval />
                                }
                            </div>
                        </div> */}
                    </div>
                </div>

            </div>
        );
    }
}

export default PendingApproval;