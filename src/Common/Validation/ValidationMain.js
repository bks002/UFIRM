// control validation librery
//Created by: Sanjay Vishwakrma
// Date: Feb 14 2018
import * as objvcommon from './ValidationCommon.js';
import * as validation from './ValidationProvider.js';
//import { Component } from 'react';
//import { debug } from 'util';
const $ = window.$;
//const objvcommon = new validationcommon();


//__________________________________________________________________________________________
// * Numeric Validation Scripts
//__________________________________________________________________________________________
//Created By: Sanjay Vishwakarma
//Description: Will validate Numeric control for which ControlID is passed 
// and if any error will generate error message.
export function ValidateNumeric(ControlID) {
    // Will set the border color of control to default color for that Numeric Control of 
    // which ControlID is passed.It is implemented in Common.js.    
    objvcommon.SetBorderDefault(ControlID);
    var ErrorMsg = '';
    var Num = $('#' + ControlID).val();
    if (Num !== undefined) {
        var MaxLen = $('#' + ControlID).attr('MaxLength');
        var MinVal = $('#' + ControlID).attr('MinValue');
        var MaxVal = $('#' + ControlID).attr('MaxValue');
        var Scale = $('#' + ControlID).attr('Scale');
        var Label = $('#' + ControlID).attr('LabelMessage');
        var period = $('#' + ControlID).val().split('.')
        var AfterDecimal = '';

        //    var beforeDecimal = period[0];         // This is the number before the decimal.
        //    var AfterDecimal = '';
        if (period.length > 1)                 // Check that there indeed is a decimal separator.
            AfterDecimal = period[1];          // This is the number after the decimal.

        if (isNaN(Num) === true || $.trim($('#' + ControlID).val()) === '') {
            $('#' + ControlID).val();
        }
        else {
            $('#' + ControlID).val(parseFloat(Num));
        }
        // Will validate whether input value for Numeric control is mandatory,
        // for which ControlID is passed.It is implemented in Common.js.
        ErrorMsg = objvcommon.CheckIsMandatory(ControlID);
        ErrorMsg = ErrorMsg + objvcommon.CheckNumerics(ControlID, Label, Num);
        ErrorMsg = ErrorMsg + objvcommon.ChecoToCompate(ControlID, Label, Num);

        if (ErrorMsg.length > 0) {
            objvcommon.SetControlError(ControlID)
            ResetBubbleMessage(ControlID);
            return ErrorMsg;
        }

        ErrorMsg = ErrorMsg + objvcommon.CheckMaxLength(ControlID, Label, MaxLen, Num);
        if (AfterDecimal !== '')
            ErrorMsg = ErrorMsg + CheckScale(ControlID, Label, Scale, AfterDecimal);

        ErrorMsg = ErrorMsg + CheckNumericMaxValue(ControlID, Label, MaxVal, Num);

        ErrorMsg = ErrorMsg + CheckNumericMinValue(ControlID, Label, MinVal, Num);
    }
    else {
        ErrorMsg = '';
    }

    ResetBubbleMessage(ControlID);
    return ErrorMsg;
}

// Created By: Sanjay Vishwakarma
// Will validate Scale property of Numeric control for which ControlID is passed.
// It will check value of AfterDecimal with Scale and if validation fails will generate error message.
// Label is particular Control specific message to be appended with error message. 
// This error message will be appended to existing error message.
export function CheckScale(ControlID, Label, Scale, AfterDecimal) {
    var Error = '';
    if ($('#' + ControlID).attr('Scale') == null && AfterDecimal == null) {
        return Error;
    }

    if ($('#' + ControlID).attr('Scale') === "0") {

        if ($('#' + ControlID).val().indexOf('.') > -1) {
            Error = 'Invalid ' + Label + ', decimal point not allowed  ';
            Error = objvcommon.AppendErrorMessage(Error, ControlID);
            return Error
        }
    }

    if ($('#' + ControlID).attr('Scale') !== "0") {
        if ($('#' + ControlID).val() != "" && $('#' + ControlID).val() !== "0") {
            if ((parseInt(AfterDecimal.length)) > parseInt(Scale)) {
                Error = ' For ' + Label + ' number of digits after decimals cannot be more than ' + Scale;
                Error = objvcommon.AppendErrorMessage(Error, ControlID);
            }
        }
    }
    return Error
}

//Check Max Value Validation
export function CheckNumericMaxValue(ControlID, Label, MaxVal, Num) {
    var Error = '';

    if (MaxVal !== null && MaxVal !== "0") {
        if ($('#' + ControlID).val() != "" || $('#' + ControlID).val() != "0") {
            if ((parseFloat(Num)) > parseFloat(MaxVal)) {
                Error = Label + ' value cannot be more than ' + MaxVal;
                Error = objvcommon.AppendErrorMessage(Error, ControlID);
            }
        }
    }
    return Error
}
//Check Min Value Validation
export function CheckNumericMinValue(ControlID, Label, MinVal, Num) {
    var Error = '';

    if (MinVal !== null) {
        if ($('#' + ControlID).val() !== "" || $('#' + ControlID).val() !== "0") {
            if ((parseFloat(Num)) < parseFloat(MinVal)) {
                Error = Label + ' value cannot be less than ' + MinVal;
                Error = objvcommon.AppendErrorMessage(Error, ControlID);
            }
        }
    }
    return Error
}
//* End of Numeric Validation Scripts
//******************************************************************************************



//__________________________________________________________________________________________
// * Dropdown List Validation Scripts
//__________________________________________________________________________________________
//  Created By Sanjay Vishwakarma
// Description : To validate AGTDropdownlist control.
export function ValidateDropdownlist(ControlID) {
    // 
    var Error = '';
    RemoveError(ControlID);
    objvcommon.SetBorderDefault(ControlID);
    Error = objvcommon.CheckIsMandatoryDropDown(ControlID);
    ResetBubbleMessage(ControlID);
    return Error;
}
// * End of Dropdown List Validation Scripts
//*******************************************************************************************


//__________________________________________________________________________________________    
// * File (ID) Validation Scripts
//__________________________________________________________________________________________

///Created By: Ravindra Vishwakarma
///Description: Validation for File
export function ValidateFile(ControlID) {

    RemoveError(ControlID);
    objvcommon.SetBorderDefault(ControlID);
    var ErrorMsg = '';
    ErrorMsg += objvcommon.CheckIsMandatory(ControlID);
    ResetBubbleMessage(ControlID);
    return ErrorMsg;
}
// * End of FIle (ID) Validation Scripts
//*******************************************************************************************

//__________________________________________________________________________________________    
// * Password (ID) Validation Scripts
//__________________________________________________________________________________________

///Created By: Ravindra Vishwakarma
///Description: Validation for Password
export function ValidatePassword(ControlID) {
    RemoveError(ControlID);
    objvcommon.SetBorderDefault(ControlID);
    var ErrorMsg = '';
    var password = $('#' + ControlID).val();
    ErrorMsg = objvcommon.CheckIsMandatory(ControlID);
    if (password !== "") {
        ErrorMsg = ValidatePasswordReg(ControlID);
    }
    ResetBubbleMessage(ControlID);
    return ErrorMsg;
}
///Check the input Password with Regular Expression
export function ValidatePasswordReg(ControlID, Label) {
    var password = $('#' + ControlID).val();
    var Label = $('#' + ControlID).attr('LabelMessage');
    var ErrorMsg = '';
    if (password.length < 8) {
        ErrorMsg = objvcommon.AppendErrorMessage("Your " + Label + " must be at least 8 characters", ControlID);
    }
    if (password.search(/[a-z]/i) < 0) {
        ErrorMsg = objvcommon.AppendErrorMessage("Your " + Label + " password must contain at least one letter.", ControlID);
    }
    if (password.search(/[0-9]/) < 0) {
        ErrorMsg = objvcommon.AppendErrorMessage("Your " + Label + " password must contain at least one digit.", ControlID);
    }
    if (password.length > 50) {
        ErrorMsg = objvcommon.AppendErrorMessage("Your " + Label + " must be less than 50 characters", ControlID);
    }
    if (ErrorMsg !== '') {
        objvcommon.SetBorderDefault(ControlID);
        ErrorMsg = objvcommon.AppendErrorMessage(ErrorMsg, ControlID);
    }
    return ErrorMsg;
}
// * End of Password (ID) Validation Scripts
//*******************************************************************************************


//__________________________________________________________________________________________
// * Email Address (ID) Validation Scripts
//__________________________________________________________________________________________

///Created By: Sanjay Vishwakarma
///Description: Validation for Email ID
export function ValidateEmail(ControlID) {
    var Error = '';
    var Emailvalue = $('#' + ControlID).val();
    objvcommon.SetBorderDefault(ControlID);
    objvcommon.CheckIsMandatory(ControlID);
    if (Emailvalue !== "") {
        Error = ValidateEmailReg(ControlID);
    }
    ResetBubbleMessage(ControlID);
    return Error;
}
///Check the input EmailId with Regular Expression
export function ValidateEmailReg(ControlID, Label) {
    var Emailvalue = $('#' + ControlID).val();
    var Label = $('#' + ControlID).attr('LabelMessage');
    var Error = '';
    var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (regex.test(Emailvalue) === false) {
        Error = 'Invalid ' + Label;
        objvcommon.SetBorderDefault(ControlID);
        Error = objvcommon.AppendErrorMessage(Error, ControlID);
    }
    ResetBubbleMessage(ControlID);
    return Error;
}
// * End of Email Address (ID) Validation Scripts
//*******************************************************************************************



//__________________________________________________________________________________________
// * Pincode Validation Scripts
//__________________________________________________________________________________________
//Created By: Sanjay Vishwakarma
//Description: Validation for Pincode for which ControlID is passed
// and if any error will generate error message.
export function ValidatePincode(ControlID) {
    // Will set the border color of control to default color for that Pincode Control for 
    // which ControlID is passed.It is implemented in Common.js.
    objvcommon.SetBorderDefault(ControlID);
    var ErrorMsg = '';
    var Num = $('#' + ControlID).val();
    var MinLen = $('#' + ControlID).attr('MinLength');
    var Label = $('#' + ControlID).attr('LabelMessage');

    // Will validate whether input value for Pincode control is mandatory,
    // for which ControlID is passed.It is implemented in Common.js.  
    objvcommon.CheckIsMandatory(ControlID);
    ErrorMsg = ErrorMsg + objvcommon.CheckNumericsInt(ControlID, Label, Num);
    if (ErrorMsg.length > 0) {
        return ErrorMsg;
    }

    ErrorMsg = ErrorMsg + objvcommon.CheckMinLength(ControlID, Label, MinLen, Num);
    return ErrorMsg;
}
// * End of Pincode Validation Scripts
//*******************************************************************************************



//__________________________________________________________________________________________
// * Fax number Validation Scripts
//__________________________________________________________________________________________

///Created By: Sanjay Vishwakarma
///Description: Validation for Fax

export function ValidateFax(ControlID) {

    var FaxValue = $('#' + ControlID).val();
    var Error = '';
    objvcommon.SetBorderDefault(ControlID);
    objvcommon.CheckIsMandatory(ControlID);

    var Num = $('#' + ControlID).val();
    var MinLen = $('#' + ControlID).attr('MinLength');
    var Label = $('#' + ControlID).attr('LabelMessage');

    Error = Error + objvcommon.CheckMinLength(ControlID, Label, MinLen, Num);
    return Error;
}
// * End of Fax number  Validation Scripts
//*******************************************************************************************


//__________________________________________________________________________________________
// * TestBox Validation Scripts
//__________________________________________________________________________________________

//Created By: Sanjay Vishwakarma
//Description: Validation for AGTTextBox for which ControlID is passed 
// and if any error will generate error message.

export function ValidateSpinner(ControlID) {

    $('#' + ControlID).attr('ErrorMessage', "");
    // Will set the border color of control to default color for that AGTTextBox Control for 
    // which ControlID is passed.It is implemented in Common.js.
    objvcommon.SetBorderDefault(ControlID);
    var ErrorMsg = '';
    var TextVal = parseInt($('#' + ControlID).val())
    var Label = $('#' + ControlID).attr('LabelMessage');
    var MinLength = $('#' + ControlID).attr('MinLength');
    var MaxLength = $('#' + ControlID).attr('MaxLen');
    if (TextVal <= 0) {
        ErrorMsg = Label + ' must be gretter than 0';

        objvcommon.AppendErrorMessage(ErrorMsg, ControlID);
        ErrorMsg = objvcommon.SetErrorMessage(ControlID)

    }

    // ErrorMsg += objvcommon.CheckIsMandatory(ControlID);
    // ErrorMsg +=  objvcommon.CheckMinLength(ControlID, Label, MinLength, TextVal);
    // ErrorMsg = ErrorMsg + objvcommon.CheckMaxLength(ControlID, Label, MaxLength, TextVal);
    //if(ErrorMsg!=""){$('#' + ControlID).poshytip('enable'); }
    ResetBubbleMessage(ControlID);
    return ErrorMsg;

}

export function ValidateGrid(ControlID) {
    if ($('#' + ControlID).length > 0) {
        $('#' + ControlID + '_wrapper').attr('ErrorMessage', "");
        // objvcommon.SetBorderDefault(ControlID+'_wrapper');
        $('#' + ControlID + '_wrapper').css("border", "#d4d4d4  0px solid");
        var ErrorMsg = '';
        var rowCount = parseInt($('#' + ControlID).find("tbody>tr>td").length);
        // alert(rowCount);
        if (rowCount <= 1) {
            var Label = $('#' + ControlID).attr('LabelMessage');
            ErrorMsg = Label + ' Cannot be empty';

            objvcommon.AppendErrorMessage(ErrorMsg, ControlID + '_wrapper');
            ErrorMsg = objvcommon.SetErrorMessage(ControlID + '_wrapper')
        }
        ResetBubbleMessage(ControlID + '_wrapper');
        return ErrorMsg;
    }

}



export function ValidateText(ControlID) {

    RemoveError(ControlID);
    objvcommon.SetBorderDefault(ControlID);
    var ErrorMsg = '';
    var TextVal = $('#' + ControlID).val();
    var Label = $('#' + ControlID).attr('LabelMessage');
    var MinLength = $('#' + ControlID).attr('MinLength');
    var MaxLength = $('#' + ControlID).attr('MaxLen');
    ErrorMsg += objvcommon.CheckIsMandatory(ControlID);
    ErrorMsg += objvcommon.CheckMinLength(ControlID, Label, MinLength, TextVal);
    ErrorMsg = ErrorMsg + objvcommon.CheckMaxLength(ControlID, Label, MaxLength, TextVal);
    ResetBubbleMessage(ControlID);
    return ErrorMsg;

}

// ValidateText(Json) {
//     //$('#' + ControlID).poshytip('disable');  
//     // Will set the border color of control to default color for that AGTTextBox Control for 
//     // which ControlID is passed.It is implemented in Common.js.
//     //objvcommon.SetBorderDefault(ControlID);

//     var ErrorMsg = '';
//     var TextVal = Json.Value;
//     var Label = Json.LabelMessage;
//     var MinLength = Json.MinLength;
//     var MaxLength=Json.MaxLen;

//     // Will validate whether input value for AGTTextBox control is mandatory,
//     // for which ControlID is passed.It is implemented in Common.js.
//     ErrorMsg += objvcommon.CheckIsMandatory(Json);
//     ErrorMsg += ErrorMsg + objvcommon.CheckMinLength(Json);
//     ErrorMsg += ErrorMsg + objvcommon.CheckMaxLength(Json);

//     return ErrorMsg;
// }

// * End TestBox Validation Scripts
//*******************************************************************************************



//__________________________________________________________________________________________
// * Time control Validation Scripts
//__________________________________________________________________________________________
/// <summary>
///Created By:Sanjay Vishwakarma
/// This method is called on blur event of AGTTIme control 
/// </summary>
export function ValidateTime(ControlID) {
    //alert('s')
    var Error = '';
    var TimeToCompare = $('#' + ControlID).attr('TimeToCompare');
    objvcommon.SetBorderDefault(ControlID);
    //SetBorderDefault("'" + TimeToCompare + "'");

    objvcommon.CheckIsMandatory(ControlID)
    // Error = objvcommon.CheckTimeFormat(ControlID);
    Error = Error + CompareTime(ControlID);
    if (Error !== "") {
        objvcommon.SetBorderRed(ControlID);
    }
    return Error;
}
/// <summary>
///Created By: Sanjay Vishwakarma
/// This method is used for validate Time format in hh:mm format 
/// Check Time format//
/// </summary>
export function CheckTimeFormat(ControlID) {
    var Error = '';
    var Timevalue = $('#' + ControlID).val();
    var AGTTIme = $('#' + ControlID)
    var isMandatory = AGTTIme.attr('IsMandatory');
    var ErrMsg = AGTTIme.attr('LabelMessage');
    if (Timevalue == "") {
    }
    else {
        Error = ValidateTimeFormat(ControlID);

    }
    return Error;
}
/// <summary>
///Created By: Sanjay Vishwakarma
/// This method is used for checking valid Time
/// <param name="CantroliD"></param>
/// <param name="Label"></param>
/// </summary>
//Check the valid date formats:
export function ValidateTimeFormat(ControlID, Label) {
    var Timevalue = $('#' + ControlID).val().toUpperCase();
    var Label = $('#' + ControlID).attr('LabelMessage');
    var Error = '';
    var regex = /^(20|21|22|23|[01]\d|\d)(([:][0-5]\d){1,2})$/;
    if (regex.test(Timevalue) == false) {
        Error = 'Invalid Time format ' + Label;
        Error = objvcommon.AppendErrorMessage(Error, ControlID);
    }
    return Error;
}
/// Created By: Sanjay Vishwakarma
/// Date : 23th SEP 2012
/// This method is used change date format of both the date and create the parameter to the 'DateComparison' method
/// such as sDate, eDate, LabelMessage and Operator etc..
/// <param name="ControlID">Id of the control</param>
/// </summary>
export function CompareTime(ControlID) {
    var sTime;
    var eTime;
    var Operator;
    var LabelMessageS;
    var LabelMessageE;
    var Error = '';
    var initails = ControlID.substr(0, ControlID.lastIndexOf("_") + 1);
    var TimeToCompare = $('#' + ControlID).attr('TimeToCompare');
    LabelMessageS = $('#' + ControlID).attr('LabelMessage');
    LabelMessageE = $("[id$=" + TimeToCompare + "]").attr('LabelMessage');
    if (TimeToCompare != undefined && TimeToCompare != "") {
        sTime = $('#' + ControlID).val();
        eTime = $("[id$=" + TimeToCompare + "]").val();
        Operator = $('#' + ControlID).attr('Operator');
        Error = TimeComparison(sTime, eTime, Operator, LabelMessageS, LabelMessageE, ControlID);
    }
    return Error;
}
/// <summary>
/// Created By: Sanjay Vishwakarma
/// This method is used compare the two dates and return the appropriate message based on the comparison 
/// <param name="sDate">Start Date</param>
/// <param name="eDate">End Date</param>
/// <param name="Operator">Operator for comparison Date</param>
/// <param name="LabelMessageS">Start Date Label Message to display in message</param>
/// <param name="LabelMessageE">End Date Label Message to display in message</param>
/// <param name="ControlID">Id of the control</param>
/// </summary>
export function TimeComparison(sDate, eDate, Operator, LabelMessageS, LabelMessageE, ControlID) {

    var Label = '';
    var Error = '';
    if (sDate != "" && eDate != "") {
        var tStart = new Date("1/1/2007 " + sDate);
        var tEnd = new Date("1/1/2007 " + eDate);
        //difference_in_milliseconds = tEnd - tStart;
        switch (Operator) {
            case '<':
                if (Date.parse(tEnd) <= Date.parse(tStart)) {
                    Label = LabelMessageS + ' must be less than ' + LabelMessageE;
                    Error = 'Invalid Time!\n' + Label;
                    Error = objvcommon.AppendErrorMessage(Error, ControlID);
                }
                break;
            case '<=':
                if (Date.parse(tEnd) < Date.parse(tStart)) {
                    Label = LabelMessageS + ' must be less than or equal to ' + LabelMessageE;
                    Error = 'Invalid Time!\n' + Label;
                    Error = objvcommon.AppendErrorMessage(Error, ControlID);
                }
                break;
            case '=':
                if (Date.parse(tEnd) != Date.parse(tStart)) {
                    Label = LabelMessageS + ' must be equal to ' + LabelMessageE;
                    Error = 'Invalid Time!\n' + Label;
                    Error = objvcommon.AppendErrorMessage(Error, ControlID);
                }
                break;
            case '>':
                if (Date.parse(tStart) <= Date.parse(tEnd)) {
                    Label = LabelMessageE + ' must be less than ' + LabelMessageS;
                    Error = 'Invalid Time!\n' + Label;
                    Error = objvcommon.AppendErrorMessage(Error, ControlID);
                }
                break;
        }
    }
    return Error;
}
// * End of Time Control Validation Scripts
//*******************************************************************************************



//__________________________________________________________________________________________
// * Mobile Number Validation Scripts
//__________________________________________________________________________________________

//  Created By : Sanjay Vishwakarma
/// <summary>
/// This method checks the all validation of the AGTFax control define in the property
/// </summary>
/// <param name="ControlID">This is id of the control for which we need to check the validation</param>
export function ValidateMobileNumber(ControlID) {
    // Remove the border of the control
    objvcommon.SetBorderDefault(ControlID);

    var ErrorMsg = '';
    var Num = $('#' + ControlID).val();                     // Get the entered value of the control
    var MinLen = $('#' + ControlID).attr('MinLength');      // Get the MinLength property value assign to the control
    var Label = $('#' + ControlID).attr('LabelMessage');    // Get the LabelMessage propety value assign to the control

    // Check the is mandatory property of the control if it is true and control is empty it will apply red border to the control
    objvcommon.CheckIsMandatory(ControlID);
    ErrorMsg = ErrorMsg + objvcommon.CheckNumericsInt(ControlID, Label, Num);
    if (ErrorMsg.length > 0) {
        return ErrorMsg;
    }

    ErrorMsg = ErrorMsg + objvcommon.CheckMinLength(ControlID, Label, MinLen, Num);
    return ErrorMsg;
}
// * End of Mobile Number Validation Scripts
//*******************************************************************************************



//__________________________________________________________________________________________
// * Datepicker (Calender) Validation Scripts
//__________________________________________________________________________________________
/// <summary>
///Created By: Sanjay Vishwakarma
/// This method is called on blur event of datepicker control
/// </summary>
export function ValidateDatePicker(ControlID) {
    RemoveError(ControlID);
    var Error = '';
    var DateToCompare = $('#' + ControlID).attr('DateToCampare');
    objvcommon.SetBorderDefault(ControlID);
    objvcommon.CheckIsMandatory(ControlID);
    Error = CheckDateFormat(ControlID);
    if ($('#' + DateToCompare).length > 0) {
        Error = Error + CompareDates(ControlID);
        if ($('#' + ControlID).attr('DateToCampare') != '' && $('#' + ControlID).attr('DateToCampare') != undefined)
            Error = Error + ValidateCompareControl($('#' + ControlID).attr('DateToCampare'));
    }
    ResetBubbleMessage(ControlID);
    return Error;
}

export function ValidateCompareControl(ControlID) {
    if ($('#' + ControlID).length > 0) {
        if ($('#' + ControlID).val() != undefined && $.trim($('#' + ControlID).val()) != "") {
            RemoveError(ControlID);
            var Error = '';
            var DateToCompare = $('#' + ControlID).attr('DateToCampare');
            objvcommon.SetBorderDefault(ControlID);
            objvcommon.CheckIsMandatory(ControlID)
            Error = CheckDateFormat(ControlID);
            Error = Error + CompareDates(ControlID);
            ResetBubbleMessage(ControlID);
            return Error;
        }
    }
}
/// <summary>
///Created By: Sanjay Vishwakarma
/// This method is used for valid Date format in dd-MMM-yyyy format 
/// Check date time format//
/// </summary>
export function CheckDateFormat(ControlID) {
    var Error = '';
    var Datevalue = $('#' + ControlID).val();
    var DatePicker = $('#' + ControlID)
    var isMandatory = DatePicker.attr('IsMandatory');
    var ErrMsg = DatePicker.attr('LabelMessage');
    if (Datevalue == "__-___-____" || Datevalue == "") {
    }
    else {
        Error = ValidateDateFormat(ControlID);
        if (Error != "") {
            objvcommon.SetBorderRed(ControlID);
        }
    }
    return Error;
}
/// <summary>
///Created By: Sanjay Vishwakarma
/// This method is used for checking valid Date of a month in a year
/// <param name="CantroliD"></param>
/// <param name="Label"></param>
/// </summary>

//Check the valid date formats:
export function ValidateDateFormat(ControlID, Label) {

    var Error = '';
    if ($('#' + ControlID).val() != undefined) {
        var Datevalue = $('#' + ControlID).val().toUpperCase();
        var Label = $('#' + ControlID).attr('LabelMessage');
        var regex = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
        if (regex.test(Datevalue) == false) {
            Error = 'Invalid Date format ' + Label;
            Error = objvcommon.AppendErrorMessage(Error, ControlID);
        }
        else {
            // Error = IsValidDate(Datevalue, ControlID);

        }
    }
    return Error;
}

/// <summary>
///Created By: Sanjay Vishwakarma
/// This method is used for valid Date like check for 29 of feb and 31 days for apr,jun,sep and nov 
/// <param name="dateStr"></param>
/// <param name="Label"></param>
/// </summary>

export function IsValidDate(dateStr, ControlID) {

    // dd-MMM-yyyy
    // Also separates date into month, day, and year variables
    var datePat = /^([012]?\d|3[01])-([Jj][Aa][Nn]|[Ff][Ee][bB]|[Mm][Aa][Rr]|[Aa][Pp][Rr]|[Mm][Aa][Yy]|[Jj][Uu][Nn]|[Jj][Uu][Ll]|[aA][Uu][gG]|[Ss][eE][pP]|[oO][Cc][Tt]|[Nn][oO][Vv]|[Dd][Ee][Cc])-(19|20|21)\d\d$/;

    var Label = '';
    var Error = '';
    var matchArray = dateStr.match(datePat); // is the format ok?
    var matchDate = matchArray[0];

    const month = matchArray[2].toUpperCase(); // parse date into variables
    const day = matchArray[1];
    const year = matchDate.substr(7, 9);

    if ((month == "apr" || month == "APR" || month == "Apr" || month == "jun" || month == "JUN" || month == "Jun" || month == "sep" || month == "SEP" || month == "Sep" || month == "nov" || month == "NOV" || month == "Nov" || month == "FEB" || month == "feb" || month == "Feb") && day == 31) {
        Label = "Month " + month + " doesn't have 31 days!";
        Error = 'Invalid Date format ' + Label;
        Error = objvcommon.AppendErrorMessage(Error, ControlID);
    }
    if ((month == "feb") || (month == "FEB") || (month == "Feb")) { // check for february 29th
        var isleap = (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0));
        if (day > 29 || (day == 29 && !isleap)) {
            Label = "February " + year + " doesn't have " + day + " days!";
            Error = 'Invalid Date format ' + Label;
            Error = objvcommon.AppendErrorMessage(Error, ControlID);
        }
    }
    return Error; // date is valid
}

/// <summary>
/// Created By: Sanjay Vishwakarma
/// This method is used to convert string month value to integer value
/// <param name="pDate">Date in the format dd-MMM-yyyy(22-MAY-2012)</param>
/// <Example> If we pass the '22-MAY-2012' to this method then this method will split the date and return a[0]=22, a[1]=5, a[2]=2012</Example>
/// </summary>
export function ChangeDateFormat(pDate) {

    if (pDate != "") {

        var SplitDate = pDate.split('-');

        switch (SplitDate[1].toLowerCase()) {
            case 'jan':
                SplitDate[1] = 1;
                break;
            case 'feb':
                SplitDate[1] = 2;
                break;
            case 'mar':
                SplitDate[1] = 3;
                break;
            case 'apr':
                SplitDate[1] = 4;
                break;
            case 'may':
                SplitDate[1] = 5;
                break;
            case 'jun':
                SplitDate[1] = 6;
                break;
            case 'jul':
                SplitDate[1] = 7;
                break;
            case 'aug':
                SplitDate[1] = 8;
                break;
            case 'sep':
                SplitDate[1] = 9;
                break;
            case 'oct':
                SplitDate[1] = 10;
                break;
            case 'nov':
                SplitDate[1] = 11;
                break;
            case 'dec':
                SplitDate[1] = 12;
                break;
        }
        return SplitDate;
    }
}

/// <summary>
/// Created By: Sanjay Vishwakarma
/// This method is used change date format of both the date and create the parameter to the 'DateComparison' method
/// such as sDate, eDate, LabelMessage and Operator etc..
/// <param name="ControlID">Id of the control</param>
/// </summary>
export function CompareDates(ControlID) {

    var sDate;
    var eDate;
    var Operator;
    var LabelMessageS;
    var LabelMessageE;
    var Error = '';
    var DateToCampare;
    var initails = ControlID.substr(0, ControlID.lastIndexOf("_") + 1);
    if ($('#' + ControlID).attr('DateToCampare') != '' && $('#' + ControlID).attr('DateToCampare') != undefined) {
        DateToCampare = initails + $('#' + ControlID).attr('DateToCampare');
    }
    else {
        DateToCampare = $('#' + ControlID).attr('DateToCampare');
    }
    LabelMessageE = $('#' + ControlID).attr('LabelMessage');
    LabelMessageS = $('#' + DateToCampare).attr('LabelMessage');

    if (DateToCampare != undefined && DateToCampare != "" && LabelMessageS != undefined) {

        sDate = $('#' + ControlID).val();
        sDate = ChangeDateFormat(sDate);

        Operator = $('#' + ControlID).attr('Operator');

        if (DateToCampare.toString().toLowerCase() == "today") {
            eDate = $('#' + ControlID).attr('TodayDate');
            eDate = ChangeDateFormat(eDate);
            LabelMessageE = "today date";
        }
        else {
            eDate = $("#" + DateToCampare).val();
            eDate = ChangeDateFormat(eDate);
        }

        if (sDate != 'Invalid Date' && eDate != 'Invalid Date' && sDate != undefined && eDate != undefined) {
            sDate = new Date(sDate[1] + "/" + sDate[0] + "/" + sDate[2]);
            eDate = new Date(eDate[1] + "/" + eDate[0] + "/" + eDate[2]);
            Error = DateComparison(sDate, eDate, Operator, LabelMessageS, LabelMessageE, ControlID);
        }
    }
    return Error;
}
/// <summary>
/// Created By: Sanjay Vishwakarma
/// This method is used compare the two dates and return the appropriate message based on the comparison 
/// <param name="sDate">Start Date</param>
/// <param name="eDate">End Date</param>
/// <param name="Operator">Operator for comparison Date</param>
/// <param name="LabelMessageS">Start Date Label Message to display in message</param>
/// <param name="LabelMessageE">End Date Label Message to display in message</param>
/// <param name="ControlID">Id of the control</param>
/// </summary>
export function DateComparison(sDate, eDate, Operator, LabelMessageS, LabelMessageE, ControlID) {

    var Label = '';
    var Error = '';

    switch (Operator) {
        case '<':
            if (Date.parse(eDate) <= Date.parse(sDate)) {
                Label = LabelMessageE + ' must be less than ' + LabelMessageS;
                Error = 'Invalid Date!\n' + Label;
                Error = objvcommon.AppendErrorMessage(Error, ControlID);
            }
            break;
        case '>':
            if (Date.parse(eDate) > Date.parse(sDate)) {
                Label = LabelMessageE + ' must be greater than ' + LabelMessageS;
                Error = 'Invalid Date!\n' + Label;
                Error = objvcommon.AppendErrorMessage(Error, ControlID);
            }
            break;
        case '<=':
            if (Date.parse(eDate) < Date.parse(sDate)) {
                Label = LabelMessageS + ' must be less than or equal to ' + LabelMessageE;
                Error = 'Invalid Date!\n' + Label;
                Error = objvcommon.AppendErrorMessage(Error, ControlID);
            }
            break;
        case '>=':
            if (Date.parse(eDate) > Date.parse(sDate)) {
                Label = LabelMessageS + ' must be greater than or equal to ' + LabelMessageE;
                Error = 'Invalid Date!\n' + Label;
                Error = objvcommon.AppendErrorMessage(Error, ControlID);
            }
            break;
        case '=':
            if (Date.parse(sDate) != Date.parse(eDate)) {
                Label = LabelMessageS + ' must be equal to ' + LabelMessageE;
                Error = 'Invalid Date!\n' + Label;
                Error = objvcommon.AppendErrorMessage(Error, ControlID);
            }
            break;
    }
    return Error;
}

export function ResetBubbleMessage(ControlID) {
    //let validation = new ValidationProvider();
    validation.ShowBubbleMessageOnHover(ControlID);
}
export function RemoveError(ControlID) {
    $('#' + ControlID).attr('ErrorMessage', "");
}
// * End of  Datepicker (Calender) Validation Scripts
//*******************************************************************************************

export function ValidateRadioBtnLst(ControlID) {
    var Error = '';
    RemoveError(ControlID);
    objvcommon.SetNoBorder(ControlID);
    Error = objvcommon.CheckIsMandatoryRadioButton(ControlID);
    ResetBubbleMessage(ControlID);
    return Error;
}
