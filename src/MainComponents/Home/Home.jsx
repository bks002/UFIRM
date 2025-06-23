import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DataProvider from './DataProvider';
import ChartNavigator from "../Charts/ChartNavigator";
import DashboardCard from "../Dashboards/DashboardCard";
import departmentActions from "../../redux/department/action";
import {fetchSubCatTaskCounts} from "../../Services/DashboardServices";

const Home = ({ PropertyId }) => {
    const [complains, setComplains] = useState([]);
    const [complainsCnt, setComplainsCnt] = useState(0);

    const [totalFlats, setTotalFlats] = useState([]);
    const [totalFlatsCnt, setTotalFlatsCnt] = useState(0);

    const [taskStatus, setTaskStatus] = useState([]);
    const [totalTasks, setTotalTasks] = useState(0);

    const [taskPriority, setTaskPriority] = useState([]);
    const [totalActTasks, setTotalActTasks] = useState(0);

    const [assetCount, setAssetCount] = useState([]);
    const [totalAssets, setTotalAssets] = useState(0);

    const [initialDate, setInitialDate] = useState('');
    const [finalDate, setFinalDate] = useState('');

    const [subCategoryCards] = useState([{ name: "Lift", id: 4 }, { name: "DG", id: 69 }]);
    const [subCategoryTaskData, setSubCategoryTaskData] = useState({});

    const apiProvider = new DataProvider();

    const getModel = useCallback(() => {
        return [{ PropertyId: parseInt(PropertyId) }];
    }, [PropertyId]);

    const taskStatusCount = useCallback(async (model, initialDate, finalDate) => {
        try {
            const resp = await apiProvider.manageDashTaskStatusCnt(model, initialDate, finalDate);
            if (resp && resp.ok && resp.status === 200)
            {
                const data = await resp.json();
                const defaultCounts = { Actionable: 0, Completed: 0, Pending: 0 };
                let total = 0;

                data.forEach(task => {
                    if (defaultCounts.hasOwnProperty(task.TaskStatus)) {
                        defaultCounts[task.TaskStatus] = task.Count;
                    }
                    total += task.Count;
                });

                setTaskStatus([
                    { Title: 'Actionable', Value: defaultCounts.Actionable },
                    { Title: 'Completed', Value: defaultCounts.Completed },
                    { Title: 'Pending', Value: defaultCounts.Pending }
                ]);
                setTotalTasks(total);
            } else {
                setTaskStatus([
                    { Title: 'Actionable', Value: 0 },
                    { Title: 'Completed', Value: 0 },
                    { Title: 'Pending', Value: 0 }
                ]);
                setTotalTasks(0);
            }
        } catch (error) {
            console.error('Error fetching task status:', error);
        }
    }, []);

    const taskPriorityCount = useCallback(async (model, initialDate, finalDate) => {
        try {
            const resp = await apiProvider.manageDashTaskPriorityCnt(model, initialDate, finalDate);
            if (resp && resp.ok && resp.status === 200)
            {
                const data = await resp.json();
                const [completed = {}, SOS = {}, High = {}, Medium = {}, Low = {}] = data;

                const priorities = [
                    { Title: 'SOS', Value: SOS.Count || 0 },
                    { Title: 'High Priority', Value: High.Count || 0 },
                    { Title: 'Medium Priority', Value: Medium.Count || 0 },
                    { Title: 'Low Priority', Value: Low.Count || 0 }
                ];

                setTaskPriority(priorities);
                setTotalActTasks(priorities.reduce((sum, p) => sum + p.Value, 0));
            } else {
                setTaskPriority([
                    { Title: 'SOS', Value: 0 },
                    { Title: 'High Priority', Value: 0 },
                    { Title: 'Medium Priority', Value: 0 },
                    { Title: 'Low Priority', Value: 0 }
                ]);
                setTotalActTasks(0);
            }
        } catch (error) {
            console.error('Error fetching task priority:', error);
        }
    }, []);

    const getAssetCount = useCallback(async (model, initialDate, finalDate) => {
        try {
            const resp = await apiProvider.manageDashAssetCardCount(model, initialDate, finalDate);
            if (resp && resp.ok && resp.status === 200){
                const data = await resp.json();

                const assetStatus = [
                    { Title: 'Service Overdue', Value: data.ServiceOverdueAssets || 0 },
                    { Title: 'Upcoming Services', Value: data.UpcomingServices || 0 },
                    { Title: 'Rented-Out Assets', Value: data.RentedOutAsset || 0 },
                    { Title: 'Checked-Out Assets', Value: data.CheckedOutAssets || 0 }
                ];

                setAssetCount(assetStatus);
                setTotalAssets(data.TotalAsset || 0);
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
        }
    }, []);

    const loadSubCatData = async (propertyId, fromDate, toDate) => {
        const data = await fetchSubCatTaskCounts(propertyId, fromDate, toDate);
        setSubCategoryTaskData(data);
    };



    const getDates = useCallback(async (initialDate, finalDate) => {
        setInitialDate(initialDate);
        setFinalDate(finalDate);
        const model = getModel();
        loadSubCatData(model[0].PropertyId,initialDate, finalDate)
        taskStatusCount(model, initialDate, finalDate);
        taskPriorityCount(model, initialDate, finalDate);
        getAssetCount(model, initialDate, finalDate);
    }, [getModel, taskStatusCount, taskPriorityCount, getAssetCount, loadSubCatData, subCategoryCards]);

    const manageDashboardCnt = useCallback(async (model) => {
        const resp = await apiProvider.manageDashboardCnt(model, 'R');
        if (resp && resp.ok && resp.status === 200)
        {
            const rData = await resp.json();
            if (rData) {
                setTotalFlatsCnt(rData.dashbaordFlatCount.total);
                setTotalFlats([
                    { Title: 'Owners Residing', Value: rData.dashbaordFlatCount.owner },
                    { Title: 'Tenants', Value: rData.dashbaordFlatCount.tenant },
                    { Title: 'Vacant', Value: rData.dashbaordFlatCount.vacant },
                    { Title: 'Free', Value: rData.dashbaordFlatCount.free }
                ]);
                setComplainsCnt(rData.dashbaordComplainCount.total);
                setComplains([
                    { Title: 'Open', Value: rData.dashbaordComplainCount.open },
                    { Title: 'In Progress', Value: rData.dashbaordComplainCount.inProgress },
                    { Title: 'Resolved', Value: rData.dashbaordComplainCount.resolved },
                    { Title: 'Closed', Value: rData.dashbaordComplainCount.completed }
                ]);
            }
        }
    }, []);

    useEffect(() => {
        const model = getModel();
        manageDashboardCnt(model);
    }, [getModel, manageDashboardCnt]);

    useEffect(() => {
        if (initialDate && finalDate) {
            getDates(initialDate, finalDate);
        }
    }, [PropertyId]);

    return (
        <div className="content-wrapper mt-2">
            <section className="content ">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-3">
                            <DashboardCard CardTitle="Task Status" HeaderValue={totalTasks} HeaderClass="card card-danger cardutline" ItemJson={taskStatus} Link="/Account/App/PlannerTask" />
                        </div>
                        <div className="col-md-3">
                            <DashboardCard CardTitle="Priority Tasks" HeaderValue={totalActTasks} HeaderClass="card card-danger cardutline" ItemJson={taskPriority} Link="/Account/App/PlannerTask" />
                        </div>
                        <div className="col-md-3">
                            <DashboardCard CardTitle="Total Assets" HeaderValue={totalAssets} HeaderClass="card card-danger cardutline" ItemJson={assetCount} Link="/Account/App/ServiceRecords" />
                        </div>
                        <div className="col-md-3">
                            <DashboardCard CardTitle="Complains" HeaderValue={complainsCnt} HeaderClass="card card-danger cardutline" ItemJson={complains} Link="/Account/App/TicketComplains" />
                        </div>
                    </div>

                    <section className="content px-2">
                        <div className="container-fluid card p-2 shadow-sm">
                            <ChartNavigator onPeriodChange={getDates} />
                        </div>
                    </section>
                    <div className="row">
                        <div className="col-md-3">
                            <DashboardCard CardTitle="Total Flats" HeaderValue={totalFlatsCnt} HeaderClass="card card-info cardutline" ItemJson={totalFlats} Link="/Account/App/ManageResidentOwners" />
                        </div>
                        {subCategoryCards.map((x) => {
                            const counts = subCategoryTaskData[x.id] || { Actionable: 0, Completed: 0, Pending: 0 };
                            const itemJson = [
                                { Title: "Actionable", Value: counts.Actionable || 0 },
                                { Title: "Completed", Value: counts.Completed || 0 },
                                { Title: "Pending", Value: counts.Pending || 0 }
                            ];
                            const total = itemJson.reduce((sum, i) => sum + i.Value, 0);

                            return (
                                <div className="col-md-3" key={x.id}>
                                    <DashboardCard
                                        CardTitle={x.name}
                                        HeaderValue={total}
                                        HeaderClass="card card-danger cardutline"
                                        ItemJson={itemJson}
                                        Link="/Account/App/PlannerTask"
                                    />
                                </div>
                            );
                        })}

                    </div>
                </div>
            </section>
        </div>
    );
};

const mapStoreToProps = (state) => ({
    PropertyId: state.Commonreducer.puidn,
    Entrolval: state.Commonreducer.entrolval,
    dashDates: state.Commonreducer.dashDates
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(departmentActions, dispatch)
});

export default connect(mapStoreToProps, mapDispatchToProps)(Home);
