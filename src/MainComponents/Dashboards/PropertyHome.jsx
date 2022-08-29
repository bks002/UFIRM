import React from 'react'
import DashboardCard from '../Dashboards/DashboardCard.jsx';
class PropertyHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentlyIn : [{ Title:'Visitors', Value:6 },
            { Title:'Service', Value:28 },
            { Title:'Delivery', Value:0 },
            { Title:'Cab', Value:0 }],
            staffOnDutty : [{ Title:'Security', Value:1 },
            { Title:'Others', Value:7 }],
            totalFlats : [{ Title:'Owners Residing', Value:869 },
            { Title:'Tenants', Value:54 },
            { Title:'Vacant', Value:85 },
            { Title:'Free', Value:0 }],
            pendingapprovals : [{ Title:'Residents', Value:6 },
            { Title:'Staff', Value:0 },
            { Title:'Services', Value:0 }],
            complains : [{ Title:'Open', Value:5 },
            { Title:'In Progress', Value:207 },
            { Title:'Resolved', Value:33 },
            { Title:'Closed', Value:2048 }],

          };
    }
    render() {
        return (
            <div className="row">
                 <div className="col-md-3">
                <DashboardCard CardTitle="Complains" 
                HeaderValue="2293"
                HeaderClass="card card-danger cardutline"
                ItemJson={this.state.complains}  />
                </div>
                <div className="col-md-3">
                <DashboardCard CardTitle="Currently In" 
                HeaderValue="34"
                HeaderClass="card card-success cardutline"
                ItemJson={this.state.currentlyIn}  />
                </div>
                <div className="col-md-3">
                <DashboardCard CardTitle="Staff On Duty" 
                HeaderValue="08"
                HeaderClass="card card-primary cardutline"
                ItemJson={this.state.staffOnDutty}  />
                </div>
                <div className="col-md-3">
                <DashboardCard CardTitle="Pending Approvals" 
                HeaderValue="06"
                HeaderClass="card card-warning cardutline"
                ItemJson={this.state.pendingapprovals}  />
                </div>
               
                <div className="col-md-3">
                <DashboardCard CardTitle="Total Flats" 
                HeaderValue="1008"
                HeaderClass="card card-info cardutline"
                ItemJson={this.state.totalFlats}  />
                </div>
               
            {/* <div className="col-md-3">
                            <div className="card card-prirary cardutline direct-chat direct-chat-primary">
                                <div className="card-header">
                                    <h3 className="card-title">Currently In</h3>

                                    <div className="card-tools">
                                        <span data-toggle="tooltip" title="3 New Messages" className="badge bg-dark">34</span>
                                        <button type="button" className="btn btn-tool" data-card-widget="collapse"><i className="fas fa-minus"></i>
                  </button>
                                    </div>
                                </div>
                                
                                <div className="card-footer" style={{display:'block'}}>
                                <ul className="nav flex-column">
                                        <li className="nav-item">
                                            <a href="#" className="nav-link">
                      Visitors <span className="float-right badge bg-primary">6</span>
                    </a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="#" className="nav-link">
                      Services <span className="float-right badge bg-info">28</span>
                    </a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="#" className="nav-link">
                      Delivery <span className="float-right badge bg-success">0</span>
                    </a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="#" className="nav-link">
                      Cab <span className="float-right badge bg-secondary">0</span>
                    </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div> */}
                      
            </div>
        );
    }
}
export default PropertyHome;