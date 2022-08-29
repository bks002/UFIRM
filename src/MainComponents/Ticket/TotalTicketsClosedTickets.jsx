import React from 'react';
import ReactDOM from 'react-dom';
import CanvasJSReact from '../Ticket/assets/canvasjs.react';
import CommonDataProvider from '../Ticket/services/CommonDataProvider.js';
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

class TotalTicketsClosedTickets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dpoint1 :[
                { x: new Date(2020, 0), y: 27 },
                { x: new Date(2020, 1), y: 29 },
                { x: new Date(2020, 2), y: 22 },
                { x: new Date(2020, 3), y: 26 },
                { x: new Date(2020, 4), y: 33 },
                { x: new Date(2020, 5), y: 37 },
                { x: new Date(2020, 6), y: 32 },
                { x: new Date(2020, 7), y: 27 },
                { x: new Date(2020, 8), y: 29 },
                { x: new Date(2020, 9), y: 43 },
                { x: new Date(2020, 10), y: 55 },
                { x: new Date(2020, 11), y: 39 }
            ],
            dpoint2 :[
                { x: new Date(2020, 0), y: 38 },
                { x: new Date(2020, 1), y: 39 },
                { x: new Date(2020, 2), y: 35 },
                { x: new Date(2020, 3), y: 37 },
                { x: new Date(2020, 4), y: 42 },
                { x: new Date(2020, 5), y: 48 },
                { x: new Date(2020, 6), y: 41 },
                { x: new Date(2020, 7), y: 38 },
                { x: new Date(2020, 8), y: 42 },
                { x: new Date(2020, 9), y: 45 },
                { x: new Date(2020, 10), y: 48 },
                { x: new Date(2020, 11), y: 47 }
            ]
        };
        this.commonProvider = new CommonDataProvider();
		this.TotalTicketCT = this.TotalTicketCT.bind(this);
    }
    componentDidMount() {
        this.TotalTicketCT();
    }
    TotalTicketCT() {
        this.commonProvider.getTotalTicketCT().then(resp => resp.json()).then(
            jsdata => {
				this.setState({
                    dataP: jsdata.map(function (i) {
                        return i;
                    })
                })
				console.log(jsdata);
            }

        ).catch(error => console.log(`Eror:${error}`))
	}
    render() {
        const options = {
            // title: {
            //     text: "Basic Column Chart"
            // },
            data: [{
				type: "column",
				name: "Closed Tickets",
				showInLegend: true,
				xValueFormatString: "MMMM YYYY",
				yValueFormatString: "0",
				dataPoints: this.state.dpoint1
			},{
				type: "column",
				name: "Total Tickets",
                showInLegend: true,
                xValueFormatString: "MMMM YYYY",
				yValueFormatString: "0",
				dataPoints: this.state.dpoint2
			}]
        }
        return (

            <div className="card card-primary card-outline">
                <div className="card-header">
                    <h3 className="card-title">Total Tickets v/s Closed Tickets</h3>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-xs-12 col-sm-12 push-sm-12">
                            <div className="chart">
                                <CanvasJSChart options={options}
                                /* onRef={ref => this.chart = ref} */
                                />
                                {/* <canvas id="barChart" className="canvasBox"></canvas> */}
                            </div>
                        </div>
                        {/* <div className="col-xs-12 col-sm-4 pull-sm-8">
                            <br />
                            <div className="form-group">
                                <select className="form-control">
                                    <option>Last 30 days</option>
                                    <option>Last 15 days</option>
                                    <option>Last 7 days</option>
                                </select>
                            </div>
                            <h5 className="mb-0 pt-2"><b>4780</b></h5>
                            <div className="block">
                                <span className="text-sm">Closed Tickets</span>
                                <span className="text-sm float-right">60%</span>
                            </div>
                            <div className="progress progress-xs">
                                <div className="progress-bar bg-success" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                                    style={{ width: "60%" }}>
                                    <span className="sr-only">60% Complete (warning)</span>
                                </div>
                            </div>

                            <h5 className="mb-0 mt-3"><b>6780</b></h5>
                            <div className="block">
                                <span className="text-sm">Total Tickets</span>
                                <span className="text-sm float-right">100%</span>
                            </div>
                            <div className="progress progress-xs">
                                <div className="progress-bar bg-primary" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                                    style={{ width: "100%" }}>
                                    <span className="sr-only">100% Complete (warning)</span>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        )
    }
}

export default TotalTicketsClosedTickets;