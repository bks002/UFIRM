import React, { Component } from 'react';
import Frequency from "../MainComponents/Calendar/Frequency";

class FrequencyMasterPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            PageTitle: 'Frequency Master'
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
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="container-fluid">
                            <Frequency
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

export default FrequencyMasterPage;