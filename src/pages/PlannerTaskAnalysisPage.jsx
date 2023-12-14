import React, { Component } from 'react'
import TaskAnalysis from '../MainComponents/Calendar/TasksAnalysis/TaskAnalysis';

class PlannerTaskAnalysisPage extends Component {
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
                  <h1 className="m-0 text-dark"> Task Analysis</h1>
              </div>
              <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-right">
                      <li className="breadcrumb-item">Home</li>
                      <li className="breadcrumb-item active">Task Analysis</li>
                  </ol>
              </div>
            </div>
          </div>
        </div>
        <section className="content">
            <div className="container-fluid">
                <div className="container-fluid">
                  <TaskAnalysis />
                </div>
            </div>
        </section>
      </div>
    );
  }
}

export default PlannerTaskAnalysisPage;