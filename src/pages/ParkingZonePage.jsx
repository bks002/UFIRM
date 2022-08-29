import React from 'react'
import ParkingArea from '../MainComponents/ParkingArea/ParkingArea'
class ParkingZonePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            PageTitle: 'Property Zone'
        };
    }
    managepagemode(pagetype, data) {
        this.setState({ PageMode: pagetype, PageTitle: 'Property Zone' + pagetype, Data: data });
    }
    render() {
        return (
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0 text-dark">Parking Zone</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><a href="/">Home</a></li>
                                    <li className="breadcrumb-item active"><a href="/Account/App/ParkingZone">Parking Zone</a> </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="container-fluid">
                            <ParkingArea></ParkingArea>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default ParkingZonePage;