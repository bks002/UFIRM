import React, { Component } from 'react';
import ItemMaster from "./itemMaster";
class ItemMasterPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            PageTitle: 'Item'
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
                    </div>
                </div>
            </div>
                <section className="content mt-3">
                    <div className="container-fluid">
                        <div className="container-fluid">
                            <ItemMaster />
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default ItemMasterPage;