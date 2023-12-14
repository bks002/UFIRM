import React, { Component } from 'react';
import Category from '../MainComponents/Calendar/Category';

class CalendarCategoryPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            PageTitle: 'Category'
        };
    }
    setPageTitle = (val) => {
        this.setState({ PageTitle: val })
    }
    setPageMode = (val) => {
        this.setState({ PageMode: val })
    }
    render() {
        return (
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0 text-dark">{this.state.PageTitle}</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item">{this.state.PageMode}</li>
                                    <li className="breadcrumb-item active">{this.state.PageTitle}</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="container-fluid">
                            <Category
                                PageMode={this.state.PageMode}
                                PageTitle={this.state.PageTitle}
                                setPageTitle={this.setPageTitle}
                                setPageMode={this.setPageMode} />
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default CalendarCategoryPage;