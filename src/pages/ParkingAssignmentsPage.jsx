import React from 'react'
import ParkingAssignment from '../MainComponents/ParkingAssignment/ParkingAssignment'
class ParkingAssignmentsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            PageTitle: 'Property Assignments'
        };
    }
    managepagemode(pagetype, data) {
        this.setState({ PageMode: pagetype, PageTitle: 'Property Assignments ' + pagetype, Data: data });
    }
    render() {
        return (
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0 text-dark">Parking Assignment</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><a href="/">Home</a></li>
                                    <li className="breadcrumb-item active"><a href="/Account/App/ParkingAssignment">Parking Assignment</a> </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="container-fluid">
                            <ParkingAssignment />
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
export default ParkingAssignmentsPage;