import React, { Component } from 'react';
import AddPropertyOwner from '../MainComponents/PropertyOwner/AddPropertyOwner';

class PropertyOwnerPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Add',
            PageTitle: 'Add Property Owner '
        };
    }
    render() {
        return (
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0 text-dark"> {this.state.PageTitle}</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><a href="/">Home</a></li>
                                    <li className="breadcrumb-item active"><a href="/Account/App/PropertyOwner"> {this.state.PageTitle}</a> </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="container-fluid">
                            {this.state.PageMode === 'Add' &&
                                <AddPropertyOwner />
                            }
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default PropertyOwnerPage;