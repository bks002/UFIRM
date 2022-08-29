import React from 'react';

class CardBoxComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
            <div className={this.props.ClassName}>
                <div className="inner">
                    <h3>{this.props.Value}</h3>

                    <p>{this.props.Heading}</p>
                </div>
                <div className="icon">
                    <i className={this.props.Sign}></i>
                    <i className="fas fa-ticket-alt"></i>
                </div>
            </div>
        );
    }
}

CardBoxComponent.defaultProps = {
    ClassName: "info-box-icon bg-danger",
    Sign:"fas fa-exclamation leftFont",
    Heading : "Ticket Heading",
    Value : "0"
}

export default CardBoxComponent;