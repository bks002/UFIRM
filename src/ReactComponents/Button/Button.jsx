import React from 'react';

class ButtonComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    onclick() {
        this.props.ClickEvent();
    }

    render() {
        return (
            <button
                className={this.props.ClassName}
                name={this.props.Name}
                id={this.props.ID}
                onClick={this.props.Action}
                data-toggle={this.props.DataToggle}
                data-target={'#' + this.props.DataTarget}
                type="button"
                title={this.props.Title}>
                {this.props.Text}
                &nbsp;
                {this.props.Icon}
            </button>
        );
    }
}

ButtonComponent.defaultProps = {
    ClassName: "btn btn-block btn-default",
    Text: "Button",
    Icon: "",
    ID: "btn",
    Name: "Name",
    DataToggle: 'NA',
    DataTarget: 'NA',
    Title: ''
}

export default ButtonComponent;