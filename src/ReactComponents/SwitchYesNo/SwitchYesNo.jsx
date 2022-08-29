import React from 'react';

class SwitchYesNo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {  }
    }

    render() {
        return (
            <label className="switch">
                <input onChange={this.props.OnSelected}  
                type={this.props.Type} 
                name={this.props.Name} 
                id={this.props.Id} 
                className={this.props.ClassName} />
                <span className="slider round">
                    <div className="yes">Yes</div>
                    <div className="no">No</div>
                </span>
            </label>            
          );
    }
}

SwitchYesNo.defaultProps = {
    Type: "checkbox",
    Name:"",
    ClassName:"",
    Id:""    
 }
 
export default SwitchYesNo;