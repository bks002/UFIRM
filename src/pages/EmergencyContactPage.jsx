import React from 'react'
import EmergencyContact from '../MainComponents/EmergencyContact/EmergencyContact';
class EmergencyContactPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            PageMode: 'Home',
            PageTitle: 'Emergency Contact'
         };
    }
    managepagemode(pagetype, data) {
        this.setState({ PageMode: pagetype, PageTitle: 'Emergency Contact ' + pagetype, Data: data });
    }
    render() {
        return (
            <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0 text-dark">Emergency Contact</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item"><a href="/">Home</a></li>
                                <li className="breadcrumb-item active"><a href="/EmergencyContact">Emergency Contact</a> </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
            <section className="content">
                <div className="container-fluid">
                    <div className="container-fluid">
                            {this.state.PageMode == 'Home' &&
                                <EmergencyContact
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

export default EmergencyContactPage;