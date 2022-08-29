import React from 'react';

class SplitButtonComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (

            <div className="btn-group pull-right">
                <button title={this.props.Title} onClick={this.props.Action} type="button" className="btn d-blue-button">Action</button>
                <button type="button" className="btn d-blue-button dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span className="sr-only">Toggle Dropdown</span>
                </button>
                <div className="dropdown-menu">
                    <a className="dropdown-item" title="To add customer using search option" onClick={this.props.AddCustomerEvent} href="#">Add Customer</a>
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item" title="To Upload customer excel file" onClick={this.props.ShowUploaderEvent} href="#">Upload Excel File</a>
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item" href="#">Sample Link</a>
                </div>
            </div>
        );
    }
}
export default SplitButtonComponent;