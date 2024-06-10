import React from 'react';

class Label extends React.Component {
    constructor(props) {
        super(props);
        this.state = {  }
    }
    render() { 
        
        if(this.props.DisplayMode === 'view' ){
        return ( 
            
            <label  id={this.props.ID} className={this.props.Class}>{this.props.Value}</label>
         );
        }
        else{
            return null
        }
    }
}
Label.defaultProps ={
    Class : "cf-text-cover ellipsiss",
    ID : "",
    Name :"",
    Value:"",
    DisplayMode:"view"
    }
 
export default Label;