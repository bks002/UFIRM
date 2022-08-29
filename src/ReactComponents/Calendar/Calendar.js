import React from 'react';
import '../../Style/bootstrap-datepicker.css';
const $ = window.$;

class CalendarJs{
GenerateCalendar(id,dtformat,onchange,startdate,enddate){
    
    $(`#${id}`).datepicker({
        format: dtformat,
        autoclose: true,
        todayHighlight: true,
        orientation: "bottom auto",
        todayBtn: true,
        startDate : startdate,
        endDate:enddate
    })
     .on('changeDate', onchange);
}
ResetCalendar(id){
    $(`#${id} .form-control`).val("");
}
}


export default CalendarJs