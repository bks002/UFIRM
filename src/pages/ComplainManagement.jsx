import React from 'react'
import TicketHome from '../MainComponents/Ticket/TicketHome';
class ComplainManagement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {  };
    }
    render() {
        return (
            <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                   
                </div>
            </div>
            <section className="content">
                <div className="container-fluid">
                    <div className="container-fluid">
                        <TicketHome/>
                    </div>
                </div>
            </section>
        </div>
        );
    }
}

export default ComplainManagement;