import React, { useEffect } from 'react';
import DashboardCard from '../Dashboards/DashboardCard';
import ApiProvider from './DataProvider';
import { connect } from 'react-redux';
import departmentActions from '../../redux/department/action';
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

            assetCount:[],
            totalAssets:10,

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
            this.setState({initialDate:initialDate,finalDate:finalDate});
            this.taskStatusCount(model,initialDate,finalDate);
            this.taskPriorityCount(model,initialDate,finalDate);
            this.getAssetCount(model,initialDate,finalDate);
        
    }

    getAssetCount = async (model,initialDate,finalDate) => {
        try {
            const resp = await this.ApiProviderr.manageDashAssetCardCount(model,initialDate,finalDate);
            if(resp && resp.ok && resp.status===200)
            {
                const data = await resp.json();
                if (data) {
                    const defaultCounts = {
                        TotalAsset: { Count: 0 },
                        ServiceOverdueAssets: { Count: 0 },
                        UpcomingServices: { Count: 0 },
                        RentedOutAsset: { Count: 0 },
                        CheckedOutAssets: { Count: 0 },
                    };

                    const assetStatus = [
                        { Title: "Service Overdue",  Value:data.ServiceOverdueAssets },
                        { Title: "Upcoming Services", Value:data.UpcomingServices },
                        { Title: "Rented-Out Assets", Value:data.RentedOutAsset  },
                        { Title: "Checked-Out Assets", Value: data.CheckedOutAssets },
                    ];

                    this.setState({
                        assetCount: assetStatus,
                        totalAssets: data.TotalAsset,
                    });
                }

            }else{
                const assetStatus = [
                    { Title: "Service Overdue",  Value:0 },
                    { Title: "Upcoming Services", Value:0 },
                    { Title: "Rented-Out Assets", Value:0  },
                    { Title: "Checked-Out Assets", Value: 0 },
                ];
                this.setState({  assetCount: assetStatus,
                    totalAssets: 0,
                });
            }
        } catch (error)
        {
            console.error("Error fetching data:", error);
        }
    };

    taskStatusCount = async (model,initialDate,finalDate) => {
        try {
            const resp = await this.ApiProviderr.manageDashTaskStatusCnt(model,initialDate,finalDate);
                    if(resp && resp.ok && resp.status===200)
                    {
                        const data = await resp.json();
                        if (data) {
                            const defaultCounts = {
                                Actionable: { Count: 0 },
                                Completed: { Count: 0 },
                                Pending: { Count: 0 },
                            };

                            const taskCounts = data.reduce((acc, task) => {
                                if (task.TaskStatus === "Actionable") {
                                    acc.Actionable = { Count: task.Count };
                                } else if (task.TaskStatus === "Completed") {
                                    acc.Completed = { Count: task.Count };
                                } else if (task.TaskStatus === "Pending") {
                                    acc.Pending = { Count: task.Count };
                                }
                                return acc;
                            }, { ...defaultCounts });

                            const taskStatus = [
                                { Title: "Actionable", Value: taskCounts.Actionable.Count },
                                { Title: "Completed", Value: taskCounts.Completed.Count },
                                { Title: "Pending", Value: taskCounts.Pending.Count },
                            ];

                            const totalTasks = data.reduce((total, item) => total + item.Count, 0);
                            this.setState({
                                taskStatus: taskStatus,
                                totalTAsks: totalTasks,
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
                        if (data) {
                            const [completed = { Count: 0 }, SOS = { Count: 0 }, HighPriority = { Count: 0 },MediumPriority={ Count: 0 } ,LowPriority={ Count: 0 }] = data;
                            const taskPriority = [
                            //   { Title: 'Completed', Value: completed.Count},
                              { Title: 'SOS', Value: SOS.Count},
                              { Title: 'High Priority', Value: HighPriority.Count},
                              { Title: 'Medium Priority', Value: MediumPriority.Count},
                              { Title: 'Low Priority', Value: LowPriority.Count}
                            ];
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
                if (resp && resp.ok && resp.status === 200) {
                    return resp.json().then(rData => {
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
            <div className="content-wrapper mt-2">
                <section className="content ">
                <div className="container-fluid">
                    <div className="row equal-height">
                        <div className="col-md-3">
                            <div className="card mb-2 shadow-sm chart-boundary">
                                <div className="card-body">
                                    <BarChart chartData={this.state.taskStatus}/>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 ">
                            <div className="card mb-2 shadow-sm chart-boundary">
                                <div className="card-body">
                                    <PieChart chartData={this.state.taskPriority}/>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 ">
                            <div className="card mb-2 shadow-sm chart-boundary">
                                <div className="card-body">
                                    <PieChart chartData={this.state.assetCount}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </section>
                <section className="content  px-2">
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
                                               Link="/PlannerTask"/>
                            </div>
                            <div className="col-md-3 ">
                                <DashboardCard CardTitle="Priority Tasks"
                                               HeaderValue={this.state.totalActTasks}
                                               HeaderClass="card card-danger cardutline"
                                               ItemJson={this.state.taskPriority}
                                               Link="/PlannerTask"/>
                            </div>
                            <div className="col-md-3">
                                <DashboardCard CardTitle="Total Assets"
                                               HeaderValue={this.state.totalAssets}
                                               HeaderClass="card card-danger cardutline"
                                               ItemJson={this.state.assetCount}
                                               Link="/ServiceRecords"/>
                            </div>
                            <div className="col-md-3 ">
                                <DashboardCard CardTitle="Complains"
                                               HeaderValue={this.state.complainsCnt}
                                               HeaderClass="card card-danger cardutline"
                                               ItemJson={this.state.complains}
                                               Link="/TicketComplains"/>
                            </div>

                        </div>
                        <div className="row">
                            <div className="col-md-3">
                                <DashboardCard CardTitle="Total Flats"
                                               HeaderValue={this.state.totalFlatsCnt}
                                               HeaderClass="card card-info cardutline"
                                               ItemJson={this.state.totalFlats}
                                               Link="/ManageResidentOwners"/>
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
        dashDates: state.Commonreducer.dashDates,
    }
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentActions, dispatch);
    return {actions};
}

export default connect(mapStoreToprops, mapDispatchToProps)(Home);
