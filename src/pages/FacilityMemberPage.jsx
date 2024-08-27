import React from 'react'
import FacilityMember from '../MainComponents/FacilityMember/FacilityMember';
class FacilityMemberPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            PageMode: 'Home',
            PageTitle: 'Facility Member'
         };
    }
    managepagemode(pagetype, data) {
        this.setState({ PageMode: pagetype, PageTitle: 'Facility Member ' + pagetype, Data: data });
    }
    render() {
        return (
            <div className="content-wrapper">
            <div className="content-header mt-5">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0 text-dark">Facility Member</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item"><a href="/">Home</a></li>
                                <li className="breadcrumb-item active"><a href="/FacilityMember">Facility Member</a></li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
            <section className="content">
                <div className="container-fluid">
                    <div className="container-fluid">
                            {this.state.PageMode == 'Home' &&
                                <FacilityMember
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

export default FacilityMemberPage;