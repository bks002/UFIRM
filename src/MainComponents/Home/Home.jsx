import React, { useEffect } from 'react';
import DashboardCard from '../Dashboards/DashboardCard';
import ApiProvider from './DataProvider';
import { connect } from 'react-redux';
import departmentAction from '../../redux/department/action';
import { bindActionCreators } from 'redux';
import PieChart from '../Charts/PieChart';
import ChartNavigator from '../Charts/ChartNavigator';
import BarChart from '../Charts/BarChart';
class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            complains: [],
            complainsCnt: 0,

            totalFlats: [],
            totalFlatsCnt: 0,

            taskStatus:[],
            totalTAsks:0,

            taskPriority:[],
            totalActTasks:0,

            initialDate:"",
            finalDate:""
        };
        this.ApiProviderr = new ApiProvider();
    }
    
    componentDidMount() {
        this.taskStatusCount();
        this.loadDashboardData();
    }

    loadDashboardData(value, id) {
        var type = 'R';
        var model = this.getModel(type);
        console.log(model);
        this.manageDashboardCnt(model, type);
        
    }

    componentDidUpdate(prevProps) {
        if (prevProps.PropertyId !== this.props.PropertyId) {
            this.loadDashboardData();
            this.getDates(this.state.initialDate,this.state.finalDate);
        }
    }

    getDates = (initialDate,finalDate)=>{
        var type = 'R';
            var model = this.getModel(type);
            this.setState({initialDate:initialDate,finalDate:finalDate})
            console.log("Initial Date:", initialDate);
            console.log("Final Date:", finalDate);
            this.taskStatusCount(model,initialDate,finalDate);
            this.taskPriorityCount(model,initialDate,finalDate);
        
    }

    taskStatusCount = async (model,initialDate,finalDate) => {
        try {
            const resp = await this.ApiProviderr.manageDashTaskStatusCnt(model,initialDate,finalDate);
                    if(resp && resp.ok && resp.status===200)
                    {
                        const data = await resp.json();
                        console.log(data);
                        if (data) {
                            const [actionable = { Count: 0 }, completed = { Count: 0 }, pending = { Count: 0 }] = data;
                            const taskStatus = [
                              { Title: 'Actionable', Value: actionable.Count},
                              { Title: 'Completed', Value: completed.Count},
                              { Title: 'Pending', Value: pending.Count}
                            ];
                            this.setState({ taskStatus: taskStatus ,
                                totalTAsks :data.reduce((total, item) => total + item.Count, 0)
                            }); 
                        }
                    }else{
                        const taskStatus = [
                            { Title: 'Actionable', Value:0 },
                            { Title: 'Completed', Value: 0},
                            { Title: 'Pending', Value:0}
                          ];
                          this.setState({ taskStatus: taskStatus ,
                              totalTAsks :0
                          }); 
                    }
            } catch (error) 
                {
                    console.error("Error fetching data:", error);
                 }
    };

    taskPriorityCount = async (model,initialDate,finalDate) => {
        try {
            const resp = await this.ApiProviderr.manageDashTaskPriorityCnt(model,initialDate,finalDate);
                    if(resp && resp.ok && resp.status===200)
                    {
                        const data = await resp.json();
                        console.log(data);
                        if (data) {
                            const [completed = { Count: 0 }, SOS = { Count: 0 }, HighPriority = { Count: 0 },MediumPriority={ Count: 0 } ,LowPriority={ Count: 0 }] = data;
                            const taskPriority = [
                            //   { Title: 'Completed', Value: completed.Count},
                              { Title: 'SOS', Value: SOS.Count},
                              { Title: 'High Priority', Value: HighPriority.Count},
                              { Title: 'Medium Priority', Value: MediumPriority.Count},
                              { Title: 'Low Priority', Value: LowPriority.Count}
                            ];
                            console.log(taskPriority)
                            this.setState({ taskPriority: taskPriority ,
                                totalActTasks :taskPriority.reduce((total, item) => total + item.Value, 0)
                            }); 
                        }
                    }else{
                        const taskPriority = [
                            // { Title: 'Completed', Value:0},
                            { Title: 'SOS', Value:0 },
                            { Title: 'High Priority', Value: 0},
                            { Title: 'Medium Priority', Value: 0},
                            { Title: 'Low Priority', Value:0}
                          ];
                          this.setState({ taskPriority: taskPriority ,
                              totalActTasks :0
                          }); 
                    }
            } catch (error) 
                {
                    console.error("Error fetching data:", error);
                 }
    };

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
                                        { Title: 'Vacant', Value: rData.dashbaordFlatCount.vacant },
                                        { Title: 'Free', Value: rData.dashbaordFlatCount.free }

                                    ];
                                    let complains = [
                                        { Title: 'Open', Value: rData.dashbaordComplainCount.open },
                                        { Title: 'In Progress', Value: rData.dashbaordComplainCount.inProgress },
                                        { Title: 'Resolved', Value: rData.dashbaordComplainCount.resolved },
                                        {Title: 'Closed', Value: rData.dashbaordComplainCount.completed },
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
                <div className="row equal-height">
                <div className="col-md-6">
                <div className="card mb-3 shadow-sm chart-boundary">
                <div className="card-body">
                <BarChart/>
                </div>
                </div>
                </div>
                <div className="col-md-6 ">
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
                    <ChartNavigator onPeriodChange={this.getDates}/>
                    </div>
                </section>
               
                <section className="content ">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-3 ">
                                <DashboardCard CardTitle="Task Status"
                                    HeaderValue={this.state.totalTAsks}
                                    HeaderClass="card card-danger cardutline"
                                    ItemJson={this.state.taskStatus}
                                    Link="/Account/App/PlannerTask" />
                            </div>
                            <div className="col-md-3 ">
                                <DashboardCard CardTitle="Priority Tasks"
                                    HeaderValue={this.state.totalActTasks}
                                    HeaderClass="card card-danger cardutline"
                                    ItemJson={this.state.taskPriority}
                                    Link="/Account/App/PlannerTask" />
                            </div>
                            <div className="col-md-3 ">
                                <DashboardCard CardTitle="Complains"
                                    HeaderValue={this.state.complainsCnt}
                                    HeaderClass="card card-danger cardutline"
                                    ItemJson={this.state.complains}
                                    Link="/Account/App/TicketComplains" />
                            </div>
                            <div className="col-md-3">
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
