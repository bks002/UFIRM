import React, { Component } from 'react';
import ItemMaster from "./itemMaster";
class ItemMasterPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            PageTitle: 'Asstes Master'
        };
    }
    render() {
        return (
            <div className="content-wrapper">
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