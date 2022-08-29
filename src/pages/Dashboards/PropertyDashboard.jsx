import React from 'react'
import PropertyHome from '../../MainComponents/Dashboards/PropertyHome.jsx'
class PropertyDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div className="content-wrapper">
                <div className="content-header">
                    {/* <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0 text-dark">Department Master</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item"><a href="/">Home</a></li>
                                <li className="breadcrumb-item active"><a href="/department">Department</a> </li>
                            </ol>
                        </div>
                    </div>
                </div> */}
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="container-fluid">
                            <PropertyHome />
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default PropertyDashboard;