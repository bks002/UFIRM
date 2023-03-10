import React, { Component } from 'react'
import GuardList from '../MainComponents/Calendar/GuardList/GuardList';

class GuardListPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      PageMode: 'Home',
      PageTitle: 'Guard List'
    };
  }

  render() {
    return (
      <div className='content-wrapper'>
        <div className='content-header'>
          <div className='container-fluid'>
            <div className='row mb-2'>
              <div className="col-sm-6">
                  <h1 className="m-0 text-dark">Guard List</h1>
              </div>
              <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-right">
                      <li className="breadcrumb-item"><a href="/">Home</a></li>
                      <li className="breadcrumb-item active"><a href="/Account/App/GuardList">Tasks</a> </li>
                  </ol>
              </div>
            </div>
          </div>
        </div>
        <section className="content">
            <div className="container-fluid">
                <div className="container-fluid">
                  <GuardList />
                </div>
            </div>
        </section>
      </div>
    );
  }
}

export default GuardListPage;