import React from 'react';
import ReactDOM from 'react-dom';
import CanvasJSReact from '../Ticket/assets/canvasjs.react';
import CommonDataProvider from '../Ticket/services/CommonDataProvider.js';

import './ticketChart.css'
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

class SourcewiseTickets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
			dataP :[
				// { name: "Unsatisfied", y: 5 },
				// { name: "Very Unsatisfied", y: 31 },
				// { name: "Very Satisfied", y: 40 },
				// { name: "Satisfied", y: 17 },
				// { name: "Neutral", y: 7 }
			]
		};
		this.commonProvider = new CommonDataProvider();
		this.TickeSourceWise = this.TickeSourceWise.bind(this);
	}
	componentDidMount() {
        this.TickeSourceWise();
    }
    TickeSourceWise() {
        this.commonProvider.getTickeSourceWise().then(resp => resp.json()).then(
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
			animationEnabled: true,
			// title: {
			// 	text: "Customer Satisfaction"
			// },
			subtitles: [{
				text: "71% Positive",
				verticalAlign: "center",
				fontSize: 24,
				dockInsidePlotArea: true
			}],
			data: [{
				type: "doughnut",
				showInLegend: true,
				indexLabel: "{type}: {total}",
				yValueFormatString: "#,###'%'",
				dataPoints: this.state.dataP
			}]
		}
        return (

            <div className="card card-primary card-outline">
                <div className="card-header">
                    <h3 className="card-title">Sourcewise Tickets</h3>
                </div>
                <div className="card-body">
                    <CanvasJSChart options = {options}/>
                    {/* <canvas id="donutChart" className="canvasBox"></canvas> */}
                </div>
            </div>
        )
    }
}

export default SourcewiseTickets;