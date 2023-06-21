import React, { Component } from 'react'
import AttendanceSummary from '../MainComponents/Calendar/AttendanceSummary/AttendanceSummary';

class AttendanceSummaryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      PageMode: 'Home',
      PageTitle: 'Tasks'
    };
  }

  render() {
    return (
      <div className='content-wrapper'>
        <div className='content-header'>
          <div className='container-fluid'>
            <div className='row mb-2'>
              <div className="col-sm-6">
                  <h1 className="m-0 text-dark">Attendance Summary</h1>
              </div>
              <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-right">
                      <li className="breadcrumb-item"><a href="/">Home</a></li>
                      <li className="breadcrumb-item active"><a href="/Account/App/PlannerTask">Attendance Summary</a> </li>
                  </ol>
              </div>
            </div>
          </div>
        </div>
        <section className="content">
            <div className="container-fluid">
                <div className="container-fluid">
                  <AttendanceSummary />
                </div>
            </div>
        </section>
      </div>
    );
  }
}

export default AttendanceSummaryPage;