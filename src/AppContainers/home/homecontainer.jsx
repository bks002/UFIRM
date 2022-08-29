import React from 'react'
//import '../../Style/index.css';
//import $ from 'jquery';
import '../../App.css';
import MainLayout from '../../Routing/MainLayout.jsx';


class HomeContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    componentDidMount() {

        // $('.singleCalendar').daterangepicker({
        //     singleDatePicker: true
        // });
        
        // $("#ticketTable").DataTable({
        //     "paging": true,
        //     "lengthChange": false,
        //     "searching": false,
        //     "ordering": true,
        //     "info": true,
        //     "autoWidth": false,
        //     "responsive": true,
        // });
        // $('[data-toggle="tooltip"]').tooltip()

}
render() {
    return (
        <MainLayout  Component={
        <div className="content-wrapper">
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>{this.props.title}</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item"><a href={this.props.navigation1.url}>{this.props.navigation1.text}</a></li>
                                <li className="breadcrumb-item active">{this.props.title}</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </section>
            <section className="content">
                {this.props.Component}
            </section>

        </div>
        } />

    )
}

}
export default HomeContainer
HomeContainer.defaultProps = {
    title: 'NA',
    navigation1: {url:'#',text:'NA'}

}