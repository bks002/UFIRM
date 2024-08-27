import React from "react";
import ReactMultiSelectCheckboxes from "react-multiselect-checkboxes";
class MultiSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    render() {
        return (
            <ReactMultiSelectCheckboxes
                ClassName="form-control form-control-sm"
                options={this.props.options}
                onChange={this.props.onChange}
                value={this.props.value}
            />
        );
    }
}
export default MultiSelect;
//https://codesandbox.io/s/react-multi-select-checkboxes-iz34q?from-embed=&file=/src/MultiSelectAll.js
//https://medium.com/@compmonk/react-multi-select-with-check-boxes-and-select-all-option-bd16941538f3
