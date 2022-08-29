import React from 'react'
import ParkingMaster from '../MainComponents/Parking/ParkingMaster';
import ParkingNew from '../MainComponents/Parking/ParkingNew';
class Parking extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            PageMode: 'Home',
            PageTitle: 'Property Home'
         };
    }
    managepagemode(pagetype, data) {
        this.setState({ PageMode: pagetype, PageTitle: 'Property Details ' + pagetype, Data: data });
    }
    render() {
        return (
            <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0 text-dark">Parking Master</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item"><a href="/">Home</a></li>
                                <li className="breadcrumb-item active"><a href="/department">Parking Master</a> </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
            <section className="content">
                <div className="container-fluid">
                    <div className="container-fluid">
                    {this.state.PageMode == 'Home' &&
                                <ParkingMaster
                                PageMode={this.state.PageMode}
                                Action={this.managepagemode.bind(this)} />

                                    
                            }
                            {this.state.PageMode == 'Add' &&
                                <ParkingNew 
                                PageMode={this.state.PageMode}
                                Action={this.managepagemode.bind(this)} />
                                    
                            }
                    </div>
                </div>
            </section>
        </div>
        );
    }
}

export default Parking;