import React, { useEffect, useState, useCallback } from 'react';
import { connect, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import DataProvider from './DataProvider';
import ChartNavigator from "../Charts/ChartNavigator";
import departmentActions from "../../redux/department/action";
import { fetchSubCatTaskCounts } from "../../Services/DashboardServices";
import { getAttendance } from '../../Services/AttendanceService';
import { getTaskPriorityCountDash } from "../../Services/TaskPriorityService";
import { getAllExpenses } from "../../Services/ExpenseReportService";
import { Link, useHistory} from "react-router-dom";

import { Chart } from 'primereact/chart';

const Home = ({ PropertyId }) => {
    const [complains, setComplains] = useState([]);
    const [complainsCnt, setComplainsCnt] = useState(0);
const history = useHistory();

    const [totalFlats, setTotalFlats] = useState([]);
    const [totalFlatsCnt, setTotalFlatsCnt] = useState(0);

    const [taskStatus, setTaskStatus] = useState([]);
    const [totalTasks, setTotalTasks] = useState(0);

    const [taskPriority, setTaskPriority] = useState([]);
    const [totalActTasks, setTotalActTasks] = useState(0);

    const [assetCount, setAssetCount] = useState([]);
    const [totalAssets, setTotalAssets] = useState(0);

    const [attendance, setAttendance] = useState([]);
    const [attendanceTotal, setAttendanceTotal] = useState(0);

    const [initialDate, setInitialDate] = useState('');
    const [finalDate, setFinalDate] = useState('');

    const [subCategoryCards] = useState([{ name: "Lift", id: 4 }, { name: "DG", id: 69 }]);
    const [subCategoryTaskData, setSubCategoryTaskData] = useState({});

    const [expenses, setExpenses] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);


    const apiProvider = new DataProvider();
    const propertyId = useSelector((state) => state.Commonreducer.puidn);
    const getModel = useCallback(() => {
        return [{ PropertyId: parseInt(PropertyId) }];
    }, [PropertyId]);

    const getExpenseData = useCallback(async (model, initialDate, finalDate) => {
        try {
            const data = await getAllExpenses({
                dateFrom: initialDate,
                dateTo: finalDate,
                officeId: model[0].PropertyId,   // mapping officeId with PropertyId
            });

            // API returns array of expenses → group by category
            setExpenses(data);

            // Total calculate karna ho to reduce use karo
            setTotalExpenses(data.reduce((sum, e) => sum + (e.TotalAmount || 0), 0));
        } catch (error) {
            console.error("Error fetching expenses:", error);
            setExpenses([]);
            setTotalExpenses(0);
        }
    }, []);


    const taskStatusCount = useCallback(async (model, initialDate, finalDate) => {
        try {
            const resp = await apiProvider.manageDashTaskStatusCnt(model, initialDate, finalDate);
            if (resp && resp.ok && resp.status === 200) {
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
            const data = await getTaskPriorityCountDash(
                model[0].PropertyId,
                null, // categoryId
                null, // subCategoryId
                null, // occurance
                null, // status
                null, // priorityId

                initialDate,
                finalDate
            );

            // API se response aata hai jaise:
            // [ { "TaskPriority": "Medium Priority", "Count": 6 } ]
            const prioritiesMap = {
                "SOS": 0,
                "High Priority": 0,
                "Medium Priority": 0,
                "Low Priority": 0,
                "On Hold": 0,
            };

            data.forEach(item => {
                if (prioritiesMap.hasOwnProperty(item.TaskPriority)) {
                    prioritiesMap[item.TaskPriority] = item.Count;
                }
            });

            const priorities = [
                { Title: "SOS", Value: prioritiesMap["SOS"] },
                { Title: "High Priority", Value: prioritiesMap["High Priority"] },
                { Title: "Medium Priority", Value: prioritiesMap["Medium Priority"] },
                { Title: "Low Priority", Value: prioritiesMap["Low Priority"] },
                { Title: "On Hold", Value: prioritiesMap["On Hold"] },
            ];

            setTaskPriority(priorities);
            setTotalActTasks(priorities.reduce((sum, p) => sum + p.Value, 0));
        } catch (error) {
            console.error("Error fetching task priority:", error);
            setTaskPriority([
                { Title: "SOS", Value: 0 },
                { Title: "High Priority", Value: 0 },
                { Title: "Medium Priority", Value: 0 },
                { Title: "Low Priority", Value: 0 },
                { Title: "On Hold", Value: 0 },
            ]);
            setTotalActTasks(0);
        }
    }, []);


    const getAssetCount = useCallback(async (model, initialDate, finalDate) => {
        try {
            const resp = await apiProvider.manageDashAssetCardCount(model, initialDate, finalDate);
            if (resp && resp.ok && resp.status === 200) {
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

    const getAttendanceData = useCallback(async (model, initialDate, finalDate) => {
        try {
            const data = await getAttendance(model, initialDate, finalDate); // not 'resp'
            if (!Array.isArray(data)) {
                throw new Error("Attendance data is not an array");
            }

            const presentCount = data.filter(emp => emp.Status === 'Present').length;
            const absentCount = data.filter(emp => emp.Status === 'Absent').length;
            const leaveCount = data.filter(emp => emp.Status === 'Leave').length;

            const attendanceStatus = [
                { Title: 'Present', Value: presentCount },
                { Title: 'Absent', Value: absentCount },
                { Title: 'Leave', Value: leaveCount }
            ];

            setAttendance(attendanceStatus);
            setAttendanceTotal(presentCount + absentCount + leaveCount);

        } catch (error) {
            console.error('Error fetching attendance data:', error);

            setAttendance([
                { Title: 'Present', Value: 0 },
                { Title: 'Absent', Value: 0 },
                { Title: 'Leave', Value: 0 }
            ]);
            setAttendanceTotal(0);
        }
    }, []);

    const loadSubCatData = async (propertyId, fromDate, toDate) => {
        const data = await fetchSubCatTaskCounts(propertyId, fromDate, toDate);
        setSubCategoryTaskData(data);
    };

    const getDates = async (initialDate, finalDate) => {
    setInitialDate(initialDate);
    setFinalDate(finalDate);

    const model = getModel();

    await Promise.all([
        loadSubCatData(model[0].PropertyId, initialDate, finalDate),
        taskStatusCount(model, initialDate, finalDate),
        taskPriorityCount(model, initialDate, finalDate),
        getAssetCount(model, initialDate, finalDate),
        getAttendanceData(model, initialDate, finalDate),
        getExpenseData(model, initialDate, finalDate)
    ]);
};

    const manageDashboardCnt = useCallback(async (model) => {
        const resp = await apiProvider.manageDashboardCnt(model, 'R');
        if (resp && resp.ok && resp.status === 200) {
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
    }, []);

    return (
        <div className="content-wrapper mt-2">
            <section className="content px-2">
                <div className="container-fluid">

                    {/* ===== First Row: 4 Cards ===== */}
                    <div className="row mt-3">

            {/* 1. Tasks Pie Chart */}
            <div className="col-md-3">
                
                <div className="card shadow-sm p-3" style={{ minHeight: "300px" }}  >
                    <h5 className="text-center">Tasks</h5>
                    <Chart
                        type="pie"
                        data={{
                            labels: taskStatus.map(t => `${t.Title} (${t.Value})`),
                            // Link: `/Account/App/PlannerTask?status=${taskStatus.map(t => t.Title)}`,
                            datasets: [
                                {
                                    data: taskStatus.map(t => t.Value),
                                    backgroundColor: ['#42A5F5', '#66BB6A', '#EF5350']
                                }
                            ]
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom' } },
                            onClick: (e, elements) => {
                                if (elements.length > 0) {
                                    const chart = elements[0].element.$context.chart;
                                    const index = elements[0].index;
                                    const label = chart.data.labels[index].split(' ')[0]; // Extract status from label
                                    // Navigate to the desired URL
                                    history.push(`/Account/App/PlannerTask?status=${label}&fromDate=${initialDate}&toDate=${finalDate}`);
                                }
                            }

                                    }}
                                    style={{ width: "100%", height: "220px" }}

                                />

                            </div>
                        </div>

                        {/* 2. Priority Tasks Table */}
                        <div className="col-md-3">
                            <Link to="/Account/App/PlannerTask" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="card shadow-sm p-3" style={{ minHeight: "300px" }}>
                                    <h5 className="text-center">Priority Tasks</h5>
                                    <div style={{ overflowX: "auto", maxHeight: "220px" }}>
                                        <table className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Title</th>
                                                    <th>Value</th>
                                                </tr>

                                            </thead>

                                            <tbody>
                                                {taskPriority.map((p, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{p.Title}</td>
                                                        <td>{p.Value}</td>
                                                    </tr>

                                                ))

                                                }
                                            </tbody>

                                        </table>

                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* 3. Total Assets Bar Chart */}
                        <div className="col-md-3">
                            <Link to="/Account/App/ServiceRecords" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="card shadow-sm p-3" style={{ minHeight: "300px" }}>
                                    <h5 className="text-center">Total Assets</h5>
                                    <Chart
                                        type="bar"
                                        data={{
                                            labels: assetCount.map(a => a.Title),
                                            datasets: [
                                                {
                                                    label: 'Assets',
                                                    data: assetCount.map(a => a.Value),
                                                    backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC']
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } }


                                        }}
                                        style={{ width: "100%", height: "220px" }}
                                    />
                                </div>
                            </Link>
                        </div>

                        {/* 4. Complains Donut Chart */}
                        <div className="col-md-3">
                            <Link to="/Account/App/TicketComplains" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="card shadow-sm p-3" style={{ minHeight: "300px" }}>
                                    <h5 className="text-center">Complains</h5>
                                    <Chart
                                        type="doughnut"
                                        data={{
                                            labels: complains.map(c => `${c.Title} (${c.Value})`),
                                            datasets: [
                                                {
                                                    data: complains.map(c => c.Value),
                                                    backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC']
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom'
                                                }
                                            }

                                        }}
                                        style={{ width: "100%", height: "220px" }}
                                    />
                                </div>
                            </Link>
                        </div>

                    </div>

                    {/* ===== Chart Navigator ===== */}
                    <section className="content px-2">
                        <div className="container-fluid card p-2 shadow-sm">
                            <ChartNavigator onPeriodChange={getDates} />
                        </div>
                    </section>

                    {/* ===== Second Row: 3 Cards ===== */}
                    <div className="row mt-3">

                        {/* 1. Attendance Bar Chart */}
                        <div className="col-md-3">
                            <Link to="/Account/App/Attendance" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="card shadow-sm p-3" style={{ minHeight: "300px" }}>
                                    <h5 className="text-center">Attendance</h5>
                                    <Chart
                                        type="bar"
                                        data={{
                                            labels: attendance.map(a => a.Title),
                                            datasets: [
                                                {
                                                    label: 'Employees',
                                                    data: attendance.map(a => a.Value),
                                                    backgroundColor: ['#42A5F5', '#EF5350', '#FFCA28']
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } }

                                        }}
                                        style={{ width: "100%", height: "220px" }}
                                    />
                                </div>
                            </Link>
                        </div>

                        {/* 2. Expense Pie Chart */}
                        <div className="col-md-3">
                            <div className="card shadow-sm p-3" style={{ minHeight: "300px" }}>
                                <h5 className="text-center">Expenses</h5>
                                <Chart
                                    type="pie"
                                    data={{
                                        labels: expenses.map(e => e.ExpenseSubType),   // SubType ko label banaya
                                        datasets: [
                                            {
                                                data: expenses.map(e => e.TotalAmount),   // TotalAmount ko value banaya
                                                backgroundColor: ["#42A5F5", "#66BB6A", "#FFA726", "#AB47BC"],
                                                borderWidth: 1,
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: "bottom" },
                                        },
                                    }}
                                    style={{ width: "100%", height: "220px" }}
                                />



                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card shadow-sm p-3" style={{ minHeight: "300px" }}>
                                <h5 className="text-center">Lift</h5>
                                <Link to="/Account/App/PlannerTask" style={{ textDecoration: "none" }}>
                                    <Chart
                                        type="line"
                                        data={{
                                            labels: ["Actionable", "Completed", "Pending"],
                                            datasets: [
                                                {
                                                    label: "Lift Tasks",
                                                    data: [
                                                        subCategoryTaskData[4] ? subCategoryTaskData[4].Actionable || 0 : 0,
                                                        subCategoryTaskData[4] ? subCategoryTaskData[4].Completed || 0 : 0,
                                                        subCategoryTaskData[4] ? subCategoryTaskData[4].Pending || 0 : 0
                                                    ],
                                                    fill: false,
                                                    borderColor: "#42A5F5",
                                                    tension: 0.4
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                                        }}
                                        style={{ width: "100%", height: "220px" }}

                                    />
                                </Link>
                            </div>
                        </div>

                        {/* 3. DG Line Chart */}
                        <div className="col-md-3">
                            <div className="card shadow-sm p-3" style={{ minHeight: "300px" }}>
                                <h5 className="text-center">DG</h5>
                                <Link to="/Account/App/PlannerTask" style={{ textDecoration: "none" }}>
                                    <Chart
                                        type="line"
                                        data={{
                                            labels: ["Actionable", "Completed", "Pending"],
                                            datasets: [
                                                {
                                                    label: "DG Tasks",
                                                    data: [
                                                        subCategoryTaskData[69] ? subCategoryTaskData[69].Actionable || 0 : 0,
                                                        subCategoryTaskData[69] ? subCategoryTaskData[69].Completed || 0 : 0,
                                                        subCategoryTaskData[69] ? subCategoryTaskData[69].Pending || 0 : 0
                                                    ],
                                                    fill: false,
                                                    borderColor: "#EF5350",
                                                    tension: 0.4
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                                        }}
                                        style={{ width: "100%", height: "220px" }}

                                    />
                                </Link>
                            </div>
                        </div>



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
