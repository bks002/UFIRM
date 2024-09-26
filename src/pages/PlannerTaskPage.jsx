import React, { Component } from 'react'
import { withRouter } from 'react-router-dom/cjs/react-router-dom.min';
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
    const { location } = this.props;
    const status =  new URLSearchParams(location.search).get('status');
    const priority =  new URLSearchParams(location.search).get('priority');
    return (
      <div className='content-wrapper'>
        <section className="content mt-4">
            <div className="container-fluid">
                <div className="container-fluid">
                  <TaskList status={status} priority={priority} />
                </div>
            </div>
        </section>
      </div>
    );
  }
}

export default withRouter(PlannerTaskPage);