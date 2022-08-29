import React from 'react';
class Link extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    onlinkclick() {
        this.props.Acton();
    }

    render() {
        return (
            <a onClick={this.props.Acton} href={this.props.Url} id={this.props.Id} className={this.props.Class}>
                {this.props.Text}
            </a>
        );
    }
}

Link.defaultProps = {
    Text: "Link",
    Class: "",
    Id: "",
    Url:"#",
    Value: ""
}

export default Link;