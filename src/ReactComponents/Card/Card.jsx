import React from 'react';

class CardComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
            <div className="info-box">
                <span className={this.props.ClassName}>
                    <i className={this.props.Sign}></i>
                    <i className="fas fa-ticket-alt"></i>
                </span>

                <div className="info-box-content">
                    <span className="info-box-text">{this.props.Heading}</span>
                    <span className="info-box-number">{this.props.Value}</span>
                </div>
            </div>
        );
    }
}

CardComponent.defaultProps = {
    ClassName: "info-box-icon bg-danger",
    Sign:"fas fa-exclamation leftFont",
    Heading : "Ticket Heading",
    Value : "0"
}

export default CardComponent;