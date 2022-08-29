import React, { Component } from 'react';

class MedImage extends React.Component {
    constructor(props) {
        super(props);
    }
componentDidMount(){
    alert(this.props.path);
}
    render() {
        return (
            <div>
                <img src={this.props.path}>
                </img>
            </div>

        )
    }
}

export default MedImage;