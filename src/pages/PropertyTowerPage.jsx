import React from 'react'
import PropertyTower from '../MainComponents/PropertyTowers/PropertyTower'
class PropertyTowerPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            PageTitle: 'Property Tower/Block'
        };
    }
    render() {
        return (
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0 text-dark">Property Towers</h1>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="container-fluid">
                            <PropertyTower />
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default PropertyTowerPage;