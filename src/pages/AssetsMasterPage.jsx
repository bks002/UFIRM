import React, { Component } from 'react';
import AssetsMaster from '../MainComponents/AssetsMaster/AssetsMaster'
class AssetsMasterPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            PageTitle: 'Asstes Master '
        };
    }
    render() {
        return (
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="mt-5 text-dark">Assets Master </h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><a href="/">Home</a></li>
                                    <li className="breadcrumb-item active"><a href="/Account/App/AssetsMaster">Assets Master </a> </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="container-fluid">
                            <AssetsMaster />
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default AssetsMasterPage;