import React from 'react';
import cal from "../Calendar/Calendar.js";
import { debug } from 'util';


class Calendar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        let calobj = new cal();
        calobj.GenerateCalendar(this.props.Id, this.props.DateFormate, this.props.onDateChange, this.props.StartDate, this.props.EndDate);

    }





    componentDidUpdate() {

    }
    ResetData(id) {
        let calobj = new cal();
        calobj.ResetCalendar(id);
    }

    render() {
        return (

            <div className="pr-fullwidth">



                <div className="form-group">
                    <div className="input-group date" id={this.props.Id}>
                        <input type="text" className="form-control" placeholder={this.props.DateFormate} data-date-format={this.props.DateFormate} /><span className="input-group-addon"><i className="glyphicon glyphicon-th"></i></span>
                    </div>
                </div>

            </div>
        );
    }
}

Calendar.defaultProps = {
    Id: 'txtDate',
    DateFormate: "dd-mm-yyyy",


}
export default Calendar;