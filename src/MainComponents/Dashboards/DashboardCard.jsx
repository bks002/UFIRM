import React from 'react'
import { Link } from "react-router-dom";

import { connect } from 'react-redux';
import departmentAction from '../../redux/department/action';
import { bindActionCreators } from 'redux';
class DashboardCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div className={this.props.HeaderClass}>
                <div className="card-header">
                    <h3 className="card-title">
                        {this.props.CardTitle}
                    </h3>
                    <div className="card-tools">
                        <span
                            //data-toggle="tooltip" title="3 New Messages"
                            style={{ fontSize: '16px' }}
                            className="badge">{this.props.HeaderValue}</span>
                        <button type="button" className="btn btn-tool" data-card-widget="collapse"><i className="fas fa-minus"></i>
                        </button>
                    </div>
                </div>

                <div className="card-footer" style={{ display: 'block', height: '180px' }}>
                    <ul className="nav flex-column">
                        {this.props.ItemJson.map((item, idx) => (
                            <li className="nav-item" key={idx}>
                                <Link to={this.props.Link} className="nav-link"
                                    style={
                                        this.props.Entrolval.includes("Admin") || this.props.Entrolval.includes("Property Manager") ?
                                            null : { pointerEvents: 'none', cursor: "no-drop" }
                                    }>
                                    {item.Title} <span className="float-right badge bg-primary">{item.Value}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div >
        );
    }
}
DashboardCard.defaultProps = {
    CardTitle: "No Title",
    HeaderValue: 0,
    ItemJson: [],
    HeaderClass: 'card card-prirary cardutline'
}
// export default DashboardCard;

function mapStoreToprops(state, props) {
    return {
        PropertyId: state.Commonreducer.puidn,
        Entrolval: state.Commonreducer.entrolval,
    }
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentAction, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(DashboardCard);