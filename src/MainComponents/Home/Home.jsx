import React from 'react';
import DashboardCard from '../Dashboards/DashboardCard';

import ApiProvider from './DataProvider';
import { connect } from 'react-redux';
import departmentAction from '../../redux/department/action';
import { bindActionCreators } from 'redux';

import PieChart from '../../ReactComponents/Charts/PieChart';
import ChartNavigator from '../../ReactComponents/Charts/ChartNavigator';
import BarChart from '../../ReactComponents/Charts/BarChart';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            complains: [],
            complainsCnt: 0,

            totalFlats: [],
            totalFlatsCnt: 0
        }
        this.ApiProviderr = new ApiProvider();
    }
    
    componentDidMount() {
        this.loadDashboardData();
    }

    loadDashboardData(value, id) {
        var type = 'R';
        var model = this.getModel(type);
        this.manageDashboardCnt(model, type);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.loadDashboardData();
        }
    }

    manageDashboardCnt = (model, type) => {
        this.ApiProviderr.manageDashboardCnt(model, type).then(
            resp => {
                if (resp && resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        console.log(rData);
                        switch (type) {
                            case 'R':
                                if (rData !== null) {
                                    let totalFlats = [
                                        { Title: 'Owners Residing', Value: rData.dashbaordFlatCount.owner },
                                        { Title: 'Tenants', Value: rData.dashbaordFlatCount.tenant },
                                        { Title: 'Vacant', Value: rData.dashbaordFlatCount.vacant }
                                    ];
                                    let complains = [
                                        { Title: 'Closed', Value: rData.dashbaordComplainCount.open },
                                        { Title: 'Pending', Value: rData.dashbaordComplainCount.inProgress },
                                        { Title: 'Actionable', Value: rData.dashbaordComplainCount.resolved },
                                    ];
                                    this.setState({
                                        totalFlats: totalFlats,
                                        totalFlatsCnt: rData.dashbaordFlatCount.total,
                                        complains: complains,
                                        complainsCnt: rData.dashbaordComplainCount.total
                                    })
                                }
                                break;
                            default:
                        }
                    });
                }
            });
    }


    getModel = (type) => {
        var model = [];
        switch (type) {
            case 'R':
                model.push({
                    "PropertyId": parseInt(this.props.PropertyId),
                });
                break;
            default:
        };
        return model;
    }

    render() {
        return (
            <div className="content-wrapper mt-5">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0 text-dark">Dashboard</h1>
                            </div>
                        </div>
                    </div>
                </div>
               
                
                
                {console.log(this.state.complains)}
                <section className="content ">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6">
            <div className="card mb-3 shadow-sm chart-boundary">
              <div className="card-body">
                <BarChart/>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card mb-3 shadow-sm chart-boundary">
              <div className="card-body">
                <PieChart/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

                <section className="content  p-2">
                    <div className="container-fluid card p-2 shadow-sm">
                    <ChartNavigator/>
                    </div>
                </section>
               
                <section className="content ">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-6 ">
                                <DashboardCard CardTitle="Task Details"
                                    HeaderValue={this.state.complainsCnt}
                                    HeaderClass="card card-danger cardutline"
                                    ItemJson={this.state.complains}
                                    Link="/Account/App/TicketComplains" />
                            </div>
                            <div className="col-md-6">
                                <DashboardCard CardTitle="Total Flats"
                                    HeaderValue={this.state.totalFlatsCnt}
                                    HeaderClass="card card-info cardutline"
                                    ItemJson={this.state.totalFlats}
                                    Link="/Account/App/ManageResidentOwners" />
                            </div>                         
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}


// export default Home;

function mapStoreToprops(state, props) {
    return {
        PropertyId: state.Commonreducer.puidn,
        Entrolval: state.Commonreducer.entrolval,
    }
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentAction, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(Home);
