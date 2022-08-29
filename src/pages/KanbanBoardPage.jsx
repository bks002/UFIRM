import React, { Component } from 'react';
import KanbanBoard from '../MainComponents/KanbanBoard/KanbanBoard';
class KanbanBoardPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            PageTitle: 'Ticket Complains'
        };
    }
    changePageTitile = (title) => {
        this.setState({ PageTitle: title })
    }
    render() {
        return (
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0 text-dark">{this.state.PageTitle}</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><a href="/">Ticket Management</a></li>
                                    <li className="breadcrumb-item active"><a href="/Account/App/TicketComplains">{this.state.PageTitle}</a> </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="container-fluid">
                            <KanbanBoard pageTitile={this.state.PageTitle} changePageTitile={this.changePageTitile.bind(this)} />
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default KanbanBoardPage;