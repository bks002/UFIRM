import React from 'react';
import './style.css';
class TicketDashBoard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
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
                                    <li className="breadcrumb-item"><a href="#">Home</a></li>
                                    <li className="breadcrumb-item active">Dashboard v2</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-4 col-sm-6 col-12">
                                <div className="info-box">
                                    <span className="info-box-icon bg-danger">
                                        <i className="fas fa-exclamation leftFont"></i>
                                        <i className="fas fa-ticket-alt"></i>
                                    </span>

                                    <div className="info-box-content">
                                        <span className="info-box-text">Ticket Past Due</span>
                                        <span className="info-box-number">4</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 col-sm-6 col-12">
                                <div className="info-box">
                                    <span className="info-box-icon bg-info">
                                        <i className="fas fa-plus leftFont"></i>
                                        <i className="fas fa-ticket-alt"></i>
                                    </span>

                                    <div className="info-box-content">
                                        <span className="info-box-text">New Tickets Today</span>
                                        <span className="info-box-number">1,410</span>
                                    </div>
                                </div>

                            </div>
                            <div className="col-md-4 col-sm-6 col-12">
                                <div className="info-box">
                                    <span className="info-box-icon bg-success">
                                        <i className="fas fa-check leftFont"></i>
                                        <i className="fas fa-ticket-alt"></i>
                                    </span>

                                    <div className="info-box-content">
                                        <span className="info-box-text">Tickets Closed Today</span>
                                        <span className="info-box-number">410</span>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <h5 className="mb-2 mt-4">Option 2</h5>
                        <div className="row">
                            <div className="col-lg-4 col-6">
                                <div className="small-box bg-danger">
                                    <div className="inner">
                                        <h3>150</h3>

                                        <p>Ticket Past Due</p>
                                    </div>
                                    <div className="icon">
                                        <i className="fas fa-exclamation leftFontOp2"></i>
                                        <i className="fas fa-ticket-alt"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-6">
                                <div className="small-box bg-info">
                                    <div className="inner">
                                        <h3>53</h3>

                                        <p>New Tickets Today</p>
                                    </div>
                                    <div className="icon">
                                        <i className="fas fa-plus leftFontOp2"></i>
                                        <i className="fas fa-ticket-alt"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-6">
                                <div className="small-box bg-success">
                                    <div className="inner">
                                        <h3>44</h3>

                                        <p>Tickets Closed Today</p>
                                    </div>
                                    <div className="icon">
                                        <i className="fas fa-check leftFontOp2"></i>
                                        <i className="fas fa-ticket-alt"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row rowHeight">
                            <div className="col-md-4">
                                <div className="card card-primary card-outline">
                                    <div className="card-header">
                                        <h3 className="card-title">Ticket Due Times</h3>
                                    </div>
                                    <div className="card-footer p-0">
                                        <ul className="nav flex-column">
                                            <li className="nav-item">
                                                <a href="#" className="nav-link">
                                                    Overdue <span className="float-right badge bg-danger">31</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a href="#" className="nav-link">
                                                    Today <span className="float-right badge bg-warning">5</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a href="#" className="nav-link">
                                                    Tomorrow <span className="float-right badge bg-primary">12</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a href="#" className="nav-link">
                                                    This week <span className="float-right badge bg-primary">842</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a href="#" className="nav-link">
                                                    Next week <span className="float-right badge bg-primary">842</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a href="#" className="nav-link">
                                                    Later<span className="float-right badge bg-primary">842</span>
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
                            </div>
                            <div className="col-md-4">
                                <div className="card card-primary card-outline">
                                    <div className="card-header">
                                        <h3 className="card-title">Open Tickets</h3>
                                    </div>
                                    <div className="card-body vCenter">
                                        <div className="row">
                                            <div className="col-xs-4 col-sm-4">
                                                <div className="circleShapeContainer">
                                                    <div className="circleShape bg-danger">
                                                        30
                                                </div>
                                                High
                                            </div>
                                            </div>
                                            <div className="col-xs-4 col-sm-4">
                                                <div className="circleShapeContainer">
                                                    <div className="circleShape bg-info">
                                                        30
                                                </div>
                                                Mediaum
                                            </div>
                                            </div>
                                            <div className="col-xs-4 col-sm-4">
                                                <div className="circleShapeContainer">
                                                    <div className="circleShape bg-warning">
                                                        30
                                                </div>
                                                Low
                                            </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card card-primary card-outline">
                                    <div className="card-header">
                                        <h3 className="card-title">Sourcewise Tickets</h3>
                                    </div>
                                    <div className="card-body">
                                        <canvas id="donutChart" className="canvasBox"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="card card-primary card-outline">
                                    <div className="card-header">
                                        <h3 className="card-title">Total Tickets v/s Closed Tickets</h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-xs-12 col-sm-8 push-sm-4">
                                                <div className="chart">
                                                    <canvas id="barChart" className="canvasBox"></canvas>
                                                </div>
                                            </div>
                                            <div className="col-xs-12 col-sm-4 pull-sm-8">
                                                <br/>
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
                                        </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
            </section>
            
        </div>
             
        
        
         );
    }
}
 
export default TicketDashBoard;