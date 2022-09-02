import React, { Component } from 'react';
const $ = window.$;

class MultiSelectDropdown extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let _this = this;
        let data = [];
        // $(`#${this.props.id}`).multiselect(
        //     {
        //         enableHTML: true,
        //         optionLabel: function (element) {
        //             return '<img src="' + $(element).attr('data-img') + '" width="30px" height="30px" class="img-circle">' + " " + $(element).text();
        //         },
        //         onSelectAll: function (e) {
        //             data = [];
        //             $(`#${_this.props.id} :selected`).each(function (i, sel) {
        //                 // console.log($(sel).val());
        //                 data.push($(sel).val())
        //             });
        //             let val = data.join(',');
        //             _this.props.onAssigneeChange(val);
        //         },
        //         onDeselectAll: function (e) {
        //             data = [];
        //             $(`#${_this.props.id} :selected`).each(function (i, sel) {
        //                 // console.log($(sel).val());
        //                 data.push($(sel).val())
        //             });
        //             let val = data.join(',');
        //             _this.props.onAssigneeChange(val);
        //         },
        //         onChange: function (e) {
        //             data = [];
        //             $(`#${_this.props.id} :selected`).each(function (i, sel) {
        //                 // console.log($(sel).val());
        //                 data.push($(sel).val())
        //             });
        //             let val = data.join(',');
        //             _this.props.onAssigneeChange(val);
        //             $(`#${_this.props.id}`).removeClass('show');

        //         },
        //     }
        // );
    }

    render() {
        return (
            <div className="input-group-prepend">
                <select className="form-control-sm pr-0 input-group-text"
                    data-placeholder="Assignee"
                    id={this.props.id}
                    multiple="multiple"
                >
                    {this.props.option.map((item, idx) => (
                        <option key={idx} value={item.Id}
                            data-img={item.Image} >{item.Name}</option>
                    ))}
                </select>
            </div>
        );
    }
}

export default MultiSelectDropdown;