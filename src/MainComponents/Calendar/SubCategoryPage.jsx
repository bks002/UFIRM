import React, { Component } from 'react'
import SubCategory from '../MainComponents/Calendar/SubCategory';

export default class SubCategoryPage extends Component {
  render() {
    return (
      <div className="content-wrapper">
          <div className="content-header">
              <div className="container-fluid">
                  <div className="row mb-2">
                      <div className="col-sm-6">
                          <h1 className="m-0 text-dark">Sub Category</h1>
                      </div>
                      <div className="col-sm-6">
                          <ol className="breadcrumb float-sm-right">
                              <li className="breadcrumb-item"><a href="/">Home</a></li>
                              <li className="breadcrumb-item active"><a href="/Account/App/SubCategory">Sub Category</a> </li>
                          </ol>
                      </div>
                  </div>
              </div>
          </div>
          <section className="content">
              <div className="container-fluid">
                  <div className="container-fluid">
                      <SubCategory />
                  </div>
              </div>
          </section>
      </div>
    );
  }
}