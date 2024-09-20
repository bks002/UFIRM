import React, { Component } from 'react'
import TaskList from '../MainComponents/Calendar/Tasks/TaskList';

class PlannerTaskPage extends Component {
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
        {/* <div className='content-header mt-5'>
          <div className='container-fluid'>
            <div className='row mb-2'>
              <div className="col-sm-6">
                  <h1 className="m-0 text-dark"> Tasks</h1>
              </div>
            </div>
          </div>
        </div> */}
        <section className="content mt-4">
            <div className="container-fluid">
                <div className="container-fluid">
                  <TaskList />
                </div>
            </div>
        </section>
      </div>
    );
  }
}

export default PlannerTaskPage;