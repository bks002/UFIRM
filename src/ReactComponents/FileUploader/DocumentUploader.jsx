import React from 'react';
class DocumentUploader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            <div>
                <input
                    style={{padding: "2px"}}
                    className={this.props.Class}
                    id={this.props.Id} 
                    type={this.props.type} 
                    value={this.props.value} 
                    onChange={this.props.onChange}/> 
            </div>
        );
    }
}

export default DocumentUploader;