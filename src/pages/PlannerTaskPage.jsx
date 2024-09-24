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