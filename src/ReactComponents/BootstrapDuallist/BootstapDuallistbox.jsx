import React, { Component } from 'react';
const $ = window.$;

class BootstapDuallistbox extends Component {
    constructor(props) {
        super(props)
    }
    // rerender problem need to solve
    componentDidMount() {
        var that = this;
        //Bootstrap Duallistbox        
        $(`#${this.props.id}`).bootstrapDualListbox({
            nonSelectedListLabel: 'Available ' + this.props.Duallistselectedlbl,
            selectedListLabel: 'Selected ' + this.props.Duallistselectedlbl,
            preserveSelectionOnMove: 'moved',
            moveAllLabel: 'Select all',
            removeAllLabel: 'Remove all'
        }).on('change', function () {
            // console.log($(this).val());
            that.props.onChange($(this).val());
        })
    }
    componentWillUnmount() {
        $(`#${this.props.id}`).bootstrapDualListbox('destroy');
    }

    render() {
        const Options = this.props.option.map((x, i) => <option key={i} value={x.value}>{x.name}</option>);
        return (
            <select id={this.props.id} multiple="multiple">
                { Options}
            </select>
        )
    }
}

export default BootstapDuallistbox;