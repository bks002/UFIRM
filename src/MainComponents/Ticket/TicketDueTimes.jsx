import React from 'react';
import ReactDOM from 'react-dom';
import CommonDataProvider from '../Ticket/services/CommonDataProvider.js';

class TicketDueTime extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            TicketDueTimes: { overDue: "", today: "", tomorrow: "", thisWeek: "", nextWeek: "", later: "" }
        };
        this.commonProvider = new CommonDataProvider();
        this.TicketDueTimes = this.TicketDueTimes.bind(this);
    }
    componentDidMount() {
        this.TicketDueTimes();
    }
    TicketDueTimes() {
        this.commonProvider.getTicketDueTimes().then(resp => resp.json()).then(
            jsdata => {
                this.setState(prevState => {
                    let TicketDueTimes = Object.assign({}, prevState.TicketDueTimes);
                    TicketDueTimes.overDue = jsdata[0].overDue;
                    TicketDueTimes.today = jsdata[0].today;
                    TicketDueTimes.tomorrow = jsdata[0].tomorrow;
                    TicketDueTimes.thisWeek = jsdata[0].thisWeek;
                    TicketDueTimes.nextWeek = jsdata[0].nextWeek;
                    TicketDueTimes.later = jsdata[0].later;
                    return { TicketDueTimes };
                })
            }

        ).catch(error => console.log(`Eror:${error}`))
    }
    render() {
        return (

            <div className="card card-primary card-outline">
                <div className="card-header">
                    <h3 className="card-title">Ticket Due Times</h3>
                </div>
                <div className="card-footer p-0">
                    <ul className="nav flex-column">
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                Overdue <span className="float-right badge bg-danger">{this.state.TicketDueTimes.overDue}</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                Today <span className="float-right badge bg-warning">{this.state.TicketDueTimes.today}</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                Tomorrow <span className="float-right badge bg-primary">{this.state.TicketDueTimes.tomorrow}</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                This week <span className="float-right badge bg-primary">{this.state.TicketDueTimes.thisWeek}</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                Next week <span className="float-right badge bg-primary">{this.state.TicketDueTimes.nextWeek}</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                Later<span className="float-right badge bg-primary">{this.state.TicketDueTimes.later}</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link">
                                &nbsp;
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        )
    }
}

export default TicketDueTime;