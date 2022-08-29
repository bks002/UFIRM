import React from 'react';
import ReactDOM from 'react-dom';
import CardComponent from '../../ReactComponents/Card/Card.jsx';
import CardBoxComponent from '../../ReactComponents/CardBox/CardBox.jsx';
import TicketDueTimes from '../Ticket/TicketDueTimes.jsx';
import OpenTickets from "../Ticket/OpenTickets.jsx";
import SourcewiseTickets from "../Ticket/SourcewiseTickets.jsx";
import TotalTicketsClosedTickets from '../Ticket/TotalTicketsClosedTickets.jsx';
import ColumnLineAreaChart from '../Ticket/ColumnLineAreaChart.jsx';
import CommonDataProvider from '../Ticket/services/CommonDataProvider.js';
import './styledashboad.css';

class TicketingDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allTeam:[],
            o1TicketPastDue : {Heading :"",  Value:""},
            o1NewTicketsToday : {Heading :"",  Value:""},
            o1TicketsClosedToday : {Heading :"",  Value:""},
            o2TicketPastDue : {Heading :"",  Value:""},
            o2NewTicketsToday : {Heading :"",  Value:""},
            o2TicketsClosedToday : {Heading :"",  Value:""},
        };
        this.commonProvider = new CommonDataProvider();
        this.o1TicketPastDue = this.o1TicketPastDue.bind(this);
        this.o1NewTicketsToday = this.o1NewTicketsToday.bind(this);
        this.o1TicketsClosedToday = this.o1TicketsClosedToday.bind(this);
        this.o2TicketPastDue = this.o2TicketPastDue.bind(this);
        this.o2NewTicketsToday = this.o2NewTicketsToday.bind(this);
        this.o2TicketsClosedToday = this.o2TicketsClosedToday.bind(this);
    }
    componentDidMount() {
        this.o1TicketPastDue();
        this.o1NewTicketsToday();
        this.o1TicketsClosedToday();
        this.o2TicketPastDue();
        this.o2NewTicketsToday();
        this.o2TicketsClosedToday();
    }
    
    o1TicketPastDue(){
        this.commonProvider.geto1TicketPastDue().then(resp => resp.json()).then(
            jsdata => {
                this.setState(prevState => {
                    let o1TicketPastDue = Object.assign({}, prevState.o1TicketPastDue); 
                    o1TicketPastDue.Heading = 'Ticket Past Due';
                    o1TicketPastDue.Value = jsdata.totalTicketPastDue;
                    return { o1TicketPastDue };
                  })
            }
        ).catch(error => console.log(`Eror:${error}`))
    }
    o1NewTicketsToday(){
        this.commonProvider.geto1NewTicketsToday().then(resp => resp.json()).then(
            jsdata => {
                this.setState(prevState => {
                    let o1NewTicketsToday = Object.assign({}, prevState.o1NewTicketsToday); 
                    o1NewTicketsToday.Heading = 'New Tickets Today';
                    o1NewTicketsToday.Value = jsdata.totalNewTicketsToday;
                    return { o1NewTicketsToday };
                  })
            }
        ).catch(error => console.log(`Eror:${error}`))
    }
    o1TicketsClosedToday(){
        this.commonProvider.geto1TicketsClosedToday().then(resp => resp.json()).then(
            jsdata => {
                this.setState(prevState => {
                    let o1TicketsClosedToday = Object.assign({}, prevState.o1TicketsClosedToday); 
                    o1TicketsClosedToday.Heading = 'Tickets Closed Today';
                    o1TicketsClosedToday.Value = jsdata.totalTicketClosedToday;
                    return { o1TicketsClosedToday };
                  })
            }
        ).catch(error => console.log(`Eror:${error}`))
    }
    o2TicketPastDue(){
        this.commonProvider.geto2TicketPastDue().then(resp => resp.json()).then(
            jsdata => {
                this.setState(prevState => {
                    let o2TicketPastDue = Object.assign({}, prevState.o2TicketPastDue); 
                    o2TicketPastDue.Heading = 'Ticket Past Due';
                    o2TicketPastDue.Value = jsdata.totalTicketPastDue;
                    return { o2TicketPastDue };
                  })
            }
        ).catch(error => console.log(`Eror:${error}`))
    }
    o2NewTicketsToday(){
        this.commonProvider.geto2NewTicketsToday().then(resp => resp.json()).then(
            jsdata => {
                this.setState(prevState => {
                    let o2NewTicketsToday = Object.assign({}, prevState.o2NewTicketsToday); 
                    o2NewTicketsToday.Heading = 'New Tickets Today';
                    o2NewTicketsToday.Value = jsdata.totalNewTicketsToday;
                    return { o2NewTicketsToday };
                  })
            }
        ).catch(error => console.log(`Eror:${error}`))
    }
    o2TicketsClosedToday(){
        this.commonProvider.geto2TicketsClosedToday().then(resp => resp.json()).then(
            jsdata => {
                this.setState(prevState => {
                    let o2TicketsClosedToday = Object.assign({}, prevState.o2TicketsClosedToday); 
                    o2TicketsClosedToday.Heading = 'Tickets Closed Today';
                    o2TicketsClosedToday.Value = jsdata.totalTicketClosedToday;
                    return { o2TicketsClosedToday };
                  })
            }
        ).catch(error => console.log(`Eror:${error}`))
    }



    render() {
        return (
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0 text-dark">Ticket Dashboard</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><a href="/">Home</a></li>
                                    <li className="breadcrumb-item active"><a href="/ticket">Ticket</a> </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-4 col-sm-6 col-12">
                                <CardComponent ClassName="info-box-icon bg-danger" Sign="fas fa-exclamation leftFont" Heading={this.state.o1TicketPastDue.Heading} Value={this.state.o1TicketPastDue.Value}></CardComponent>
                            </div>
                            <div className="col-md-4 col-sm-6 col-12">
                                <CardComponent ClassName="info-box-icon bg-info" Sign="fas fa-plus leftFont" Heading={this.state.o1NewTicketsToday.Heading} Value={this.state.o1NewTicketsToday.Value}></CardComponent>
                            </div>
                            <div className="col-md-4 col-sm-6 col-12">
                                <CardComponent ClassName="info-box-icon bg-success" Sign="fas fa-check leftFont" Heading={this.state.o1TicketsClosedToday.Heading} Value={this.state.o1TicketsClosedToday.Value}></CardComponent>
                            </div>
                        </div>
                        <h5 className="mb-2 mt-4">Option 2</h5>
                        <div className="row">
                            <div className="col-lg-4 col-6">
                                <CardBoxComponent ClassName="small-box bg-danger" Sign="fas fa-exclamation leftFontOp2" Heading={this.state.o2TicketPastDue.Heading} Value={this.state.o2TicketPastDue.Value}></CardBoxComponent>
                            </div>
                            <div className="col-lg-4 col-6">
                                <CardBoxComponent ClassName="small-box bg-info" Sign="fas fa-plus leftFontOp2" Heading={this.state.o2NewTicketsToday.Heading} Value={this.state.o2NewTicketsToday.Value}></CardBoxComponent>
                            </div>
                            <div className="col-lg-4 col-6">
                                <CardBoxComponent ClassName="small-box bg-success" Sign="fas fa-check leftFontOp2" Heading={this.state.o2TicketsClosedToday.Heading} Value={this.state.o2TicketsClosedToday.Value}></CardBoxComponent>
                            </div>
                        </div>
                        <div className="row rowHeight">
                            <div className="col-md-4">
                                <TicketDueTimes></TicketDueTimes>
                            </div>
                            <div className="col-md-4">
                                <OpenTickets></OpenTickets>
                            </div>
                            <div className="col-md-4">
                                <SourcewiseTickets></SourcewiseTickets>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                {/* <ColumnLineAreaChart></ColumnLineAreaChart> */}
                                <TotalTicketsClosedTickets></TotalTicketsClosedTickets>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default TicketingDashboard;