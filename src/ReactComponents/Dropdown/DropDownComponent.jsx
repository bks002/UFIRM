import React from 'react';
import Dropdown from './Dropdown.jsx';

class DropDownComponent extends React.Component {
  constructor() {
    super()
    this.state = {
      
     
    }
  }

  

  resetThenSet(id, key) {
    let temp = JSON.parse(JSON.stringify(this.state[key]))
    temp.forEach(item => item.selected = false);
    temp[id].selected = true;
    this.setState({
      [key]: temp
    })
  }

  render() {
    return (
      <div className="ddwrappercover pull-right">
        <Dropdown
          title={this.props.Title}
          list={this.props.Action}
          resetThenSet={this.resetThenSet}
        />
      </div>
    );
  }
}

DropDownComponent.defaultProps ={
  Title : "Action",
  Action: [
    {
      id: 0,
      title: 'Action -1',
      selected: false,
      key: 'action'
    },
    {
      id: 1,
      title: 'Actioin -2',
      selected: false,
      key: 'action'
    },
    {
      id: 2,
      title: 'Actioin -3',
      selected: false,
      key: 'action'
    }
  ]
}

export default DropDownComponent;