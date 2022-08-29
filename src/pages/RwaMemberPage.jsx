import React, { Component } from 'react';
import RwaMember from '../MainComponents/AwaMembers/RwaMember';

class RwaMemberPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            PageTitle: 'Rwa Member'
        };
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
                                    <li className="breadcrumb-item"><a href="/">{this.state.PageMode}</a></li>
                                    <li className="breadcrumb-item active"><a href="/Account/App/RwaMember">{this.state.PageTitle}</a> </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="container-fluid">
                            <RwaMember />
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default RwaMemberPage;