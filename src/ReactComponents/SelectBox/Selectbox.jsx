import React from 'react';

class SelectBoxComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
    // Data: { }
  }
  render() {

    return (

      <div>
        <select id={this.props.Id} name={this.props.Name} className={this.props.ClassName} >
          {this.props.Data.map((val, idx) => (

            <option value={val.Id}>{val.Text}</option>
          ))}
        </select>
      </div>

    );
  }
}
SelectBoxComponent.defaultProps = {
  ClassName: "form-control",
  Data: [{ Text: '-Select-', Id: 1 }]
}
class SelectBox2 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: 'Select an Option'
    };
  }

  onChange(e) {
    if (this.props.CallType !== undefined && this.props.CallType === 'All') {
      this.props.onSelected(e.target);
    }
    else {
      this.props.onSelected(e.target.value);
    }

    //this.onItemselected(e);
  }
  // new function to expose id and text of selecte item
  // onItemselected(e){
  //   if(this.props.onItemselected!=undefined)
  //   this.props.onItemselected(e.target);
  // }
  //end
  render() {
    return (
      <select
        id={this.props.ID}
        name={this.props.Name}
        value={this.props.Value}
        onChange={this.onChange.bind(this)}
        className={this.props.ClassName}
        disabled={this.props.disabled}
      >
        {this.props.Options.map(option => {
          return <option value={option.Id} key={option.Name} className="sel-opt">{option.Name}</option>
        })}
      </select>

    )
  }
}
SelectBox2.defaultProps = {
  ClassName: "form-control",
  ID: "",
  Name: "",
  Options: [{}]
}


export default SelectBox2;