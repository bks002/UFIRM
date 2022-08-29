import React, { Component } from 'react';
const $ = window.$;
class InputDate extends Component {
    constructor(props) {
        super(props);

        this.state = {
            date: ''
        }
    }
    componentDidMount() {
        var that = this;
        //Date picker
        $(`#${this.props.Id}`).datepicker({
            format: this.props.DateFormate,
            autoclose: true,
            todayHighlight: true,
            orientation: "bottom auto",
            todayBtn: true,
            // startDate: new Date(),
            //endDate: enddate        
        }).on('changeDate', function (ev) {
            // console.log("called", ev.target.value);
            that.props.handleOnchage(ev.target.value)
        });
    }

    render() {
        return (
            <div className="input-group">
                <input type="text"
                    className="form-control"
                    id={this.props.Id}
                    placeholder={this.props.DateFormate}
                    value={this.props.value}
                    readOnly={this.props.readOnly}
                />
                <div className="input-group-append">
                    <span className="input-group-text">
                        <i className="fa fa-calendar"></i>
                    </span>
                </div>
            </div>

        );
    }
}
InputDate.defaultProps = {
    Id: 'txtDate',
    DateFormate: "dd/mm/yyyy",
    readOnly: true


}

export default InputDate;