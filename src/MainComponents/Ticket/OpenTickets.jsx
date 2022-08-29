import React from 'react';
import ReactDOM from 'react-dom';
import CommonDataProvider from '../Ticket/services/CommonDataProvider.js';

class OpenTickets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            OpenTickets: { high: "", medium: "", low: "" }
        };
        this.commonProvider = new CommonDataProvider();
        this.OpenTickets = this.OpenTickets.bind(this);
    }
    componentDidMount() {
        this.OpenTickets();
    }
    OpenTickets() {
        this.commonProvider.getOpenTickets().then(resp => resp.json()).then(
            jsdata => {
                this.setState(prevState => {
                    let OpenTickets = Object.assign({}, prevState.OpenTickets);
                    OpenTickets.high = jsdata.high;
                    OpenTickets.medium = jsdata.medium;
                    OpenTickets.low = jsdata.low;
                    return { OpenTickets };
                })
            }

        ).catch(error => console.log(`Eror:${error}`))
    }
    render() {
        return (

            <div className="card card-primary card-outline">
                <div className="card-header">
                    <h3 className="card-title">Open Tickets</h3>
                </div>
                <div className="card-body vCenter">
                    <div className="row">
                        <div className="col-xs-4 col-sm-4">
                            <div className="circleShapeContainer">
                                <div className="circleShape bg-danger">
                                {this.state.OpenTickets.high}
                                                </div>
                                                High
                                            </div>
                        </div>
                        <div className="col-xs-4 col-sm-4">
                            <div className="circleShapeContainer">
                                <div className="circleShape bg-info">
                                {this.state.OpenTickets.medium}
                                                </div>
                                                Mediaum
                                            </div>
                        </div>
                        <div className="col-xs-4 col-sm-4">
                            <div className="circleShapeContainer">
                                <div className="circleShape bg-warning">
                                {this.state.OpenTickets.low}
                                                </div>
                                                Low
                                            </div>
                        </div>
                    </div>
                </div>
            </div>

        )
    }
}

export default OpenTickets;