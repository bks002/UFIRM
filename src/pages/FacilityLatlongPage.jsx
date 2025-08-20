import React from 'react'
import FacilityLatlong from '../MainComponents/FacilityMember/FacilityLatlong'
class FacilityLatlongPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            PageMode: 'Home',
            PageTitle: 'Facility Latlong'
         };
    }
    managepagemode(pagetype, data) {
        this.setState({ PageMode: pagetype, PageTitle: 'Facility Latlong ' + pagetype, Data: data });
    }
    render() {
        return (
            <div className="content-wrapper">
            <div className="content-header mt-5">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0 text-dark">Facility Latlong</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item"><a href="/">Home</a></li>
                                <li className="breadcrumb-item active"><a href="/FacilityMember">Facility Latlong</a></li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
            <section className="content">
                <div className="container-fluid">
                    <div className="container-fluid">
                            {this.state.PageMode === 'Home' &&
                                <FacilityLatlong
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

export default FacilityLatlongPage;