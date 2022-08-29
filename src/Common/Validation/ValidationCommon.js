import * as objmain from './ValidationMain'
const $ = window.$;
//let objmain =  new ValidationRoot();
var MandatoryErrorMessage = '';
var FocusindexId = '';


//export default class ValidationCommon {

export function ValidateFormControl() {
    $(".ValidationCtrl").each(function (index) {
        alert(index + ": " + $(this).text());
    });
    var ErrorMessage;
    var MandatoryErrorMessage = '';
    var divError = $('#divError');
    var ControlList = $(".ValidationCtrl");
    if (ControlList != null) {
        var ControlId = ControlList[0].id;
        var validationType = $('#' + ControlId).attr('ValidationType');
        if (validationType == 'Numeric') {
            ErrorMessage = objmain.ValidateNumeric(ControlId);

        }

        if (ErrorMessage.length > 0 || MandatoryErrorMessage != '') {
            if (MandatoryErrorMessage != '') {
                ErrorMessage = MandatoryErrorMessage + ErrorMessage;
            }
            ErrorMessage = '<ul>' + ErrorMessage + '</ul>';
        }
        ShowErrorMsg(ErrorMessage);
    }
}

export function ValidateControl(IDCollection) {

    var ErrorMessage = '';
    const MandatoryErrorMessage = '';
    FocusindexId = '';
    let id = "";
    var divErrorId = 'divError';
    var divError = $('#' + divErrorId); // Div to be part of master page.
    // For loop for looping through the array and calling respective JS

    $(IDCollection).map((index, item) => {

        var ControlID = item.Id;
        var ControlType = $('#' + item.Id).attr('ValidationType');

        if (ControlType == "Spinner") {
            ErrorMessage = ErrorMessage + objmain.ValidateSpinner(ControlID);
        }
        else if (ControlType == "Grid") {
            ErrorMessage = ErrorMessage + objmain.ValidateGrid(ControlID);
        }
        else if (ControlType == "Numeric") {
            ErrorMessage = ErrorMessage + objmain.ValidateNumeric(ControlID);
        }
        else if (ControlType == "PinCode") {
            ErrorMessage = ErrorMessage + objmain.ValidatePincode(ControlID);
        }
        else if (ControlType == "TextBox") {
            ErrorMessage = ErrorMessage + objmain.ValidateText(ControlID);
        }
        else if (ControlType == "MobileNumber") {
            ErrorMessage = ErrorMessage + objmain.ValidateMobileNumber(ControlID);
        }
        else if (ControlType == "EmailID") {
            ErrorMessage = ErrorMessage + objmain.ValidateEmail(ControlID);
        }
        else if (ControlType == "FaxNumber") {
            ErrorMessage = ErrorMessage + objmain.ValidateFax(ControlID);
        }
        else if (ControlType == "Calender") {
            ErrorMessage = ErrorMessage + objmain.ValidateDatePicker(ControlID);
        }
        else if (ControlType == "DropDown") {
            ErrorMessage = ErrorMessage + objmain.ValidateDropdownlist(ControlID);
        }
        else if (ControlType == "Time") {
            ErrorMessage += objmain.ValidateTime(ControlID);
        }
        else if (ControlType == "Radio") {
            ErrorMessage = ErrorMessage + objmain.ValidateRadioBtnLst(ControlID);
        }
        else if (ControlType == "File") {
            ErrorMessage = ErrorMessage + objmain.ValidateFile(ControlID);
        }
        else if (ControlType == "Password") {
            ErrorMessage = ErrorMessage + objmain.ValidatePassword(ControlID);
        }
    });
    if (ErrorMessage.length > 0 || MandatoryErrorMessage != '') {
        ErrorMessage = '<ul>' + ErrorMessage + '</ul>';
    }

    return ErrorMessage;
}
export function CheckDuplicateMessage(ExistingErrorMessage, ErrorMessage) {

    if (ExistingErrorMessage.indexOf(ErrorMessage) == '-1') {
        return ErrorMessage
    }
    else {
        return "";
    }
}
//Created By : Sanjay V
//Desc : This Fuction is called by respective js for 
// 1) Appending the html <li> tag
// 2) It also sets the Border Color to red, as if any control has error it comes to these Fucntion.
// 3) It also Sets the FocusID if that control is the first control on the page which has any error.
export function AppendErrorMessage(Error, ControlID) {

    var AppendedError = Error;
    AppendedError = '<li> ' + AppendedError + '</li>';
    //  Changing the Border Color
    SetBorderRed(ControlID)
    //****** Appending the Error message text to the ErrorMessage attribute of the control for Bubble message.
    $('#' + ControlID).attr('ErrorMessage', Error);
    return AppendedError;
}


// Created by: Sanjay Vishwakarma
// To set border border color red of given control id
export function SetBorderRed(ControlID) {
    //  Changing the Border Color
    $('#' + ControlID).css("border", "1px solid red");

    // // Setting the Focus
    // if (FocusindexId == '') {
    //     FocusindexId = ControlID;
    // }
}

// Created by: Sanjay Vishwakarma
// To set border border color default (gray) of given control id
export function SetBorderDefault(ControlID) {
    //  Changing the Border Color
    // $('#' + ControlID).css("border", "1px solid gray");
    //if (ControlType == "")
    $('#' + ControlID).css("border", "#d4d4d4  1px solid");


}
export function SetBorderDefaultByID(ControlID) {
    //  Changing the Border Color
    $("[id$=" + ControlID + "]").css("border", "#5bb4fa 1px solid");

}

//Created By : Sanjay Vishwakarma
//Desc : This Fuction is called by respective js for for validating the Mandatory  
//Is Mandatory Validation
export function CheckIsMandatory(ControlID) {
    var Error = '';
    $('#' + ControlID).attr('ErrorMessage', "");
    if ($('#' + ControlID).attr('IsMandatory') == 'true' && $('#' + ControlID).attr('IsMandatory') != undefined) {
        if ($.trim($('#' + ControlID).val()) == "" || $.trim($('#' + ControlID).val()) == "__-___-____") {
            let error = $('#' + ControlID).attr('LabelMessage') + ' cannot be empty';
            SetBorderRed(ControlID);
            AppendErrorMessage(error, ControlID);
            return SetErrorMessage(ControlID);
            // AppendErrorMessage(Error, ControlID);
            //****** Appending the Error message text to the ErrorMessage attribute of the control for Bubble message.
        }
    }
    return Error;
}
//Created By : Sanjay Vishwakarma
//Desc : To Set Error message when mandatory validationi get failed.
//Is Mandatory Validation

export function SetErrorMessage(ControlID) {
    return MandatoryErrorMessage = "Enter all the fields marked as '*'";
    return MandatoryErrorMessage = AppendErrorMessage(MandatoryErrorMessage, ControlID);
}
//Created By : Sanjay Vishwakarma
//Desc : This Fuction is called by respective js for for validating the Mandatory for dropdown list
//Is Mandatory Validation

export function CheckIsMandatoryDropDown(ControlID) {
    // 
    var Error = '';
    var InitialValue = $('#' + ControlID).attr('InitialValue');
    $('#' + ControlID).attr('ErrorMessage', "");
    if ($('#' + ControlID).attr('IsMandatory') != "False" && $('#' + ControlID).attr('IsMandatory') != "false") {
        if ($('#' + ControlID + ' option:selected').text() == InitialValue) {
            SetBorderRed(ControlID);
            SetErrorMessage(ControlID);
            Error = 'Please select ' + $('#' + ControlID).attr('LabelMessage');
            AppendErrorMessage(Error, ControlID);
        }
    }
    return Error;
}



// Created By : Sanjay Vishwakarma 
// This funtion return Message on the base of message code provided to it.
// <Example>GetMessage('M001') it will return 'Saved successfully.' </Example>

export function GetMessage(Code) {
    // var i = 0;
    // for (i = 0; i < MessageArray.length; i++) {
    //     var SplitArray = MessageArray[i].split(',');
    //     if (SplitArray[0] == Code) {
    //         return SplitArray[1].toString();
    //     }
    // }
}
export function AllowOnlyNumericWithPoint(event, control) {
    var varChar;
    if (navigator.appName == "Netscape") {
        varChar = event.which
    }
    else {
        varChar = event.keyCode
    }

    var Scale = control.getAttribute('Scale');
    if (varChar == 8 || varChar == 0) {
        return true;
    }
    if (varChar == 46 && (Scale == 0 || Scale == null)) { //if scale is not set and it is null then . not allowe to enter
        return false;
    }
    if ((control.value.length - control.selectionEnd) > Scale && varChar == 46) { // point is not allowe to enter after scale value
        return false;
    }
    else if (varChar >= 48 && varChar <= 57 || (control.value.indexOf('.') < 1 && control.value.length > 0 && varChar == 46))
    //allow to enter only number and .
    {
        if ((control.value.split('.').length > 1) && (control.value.split('.')[1].length >= Scale)) {

            if (control.selectionEnd <= control.value.indexOf('.')) {
                return true;
            }
            else if ((control.selectionEnd - control.selectionStart) > 0) { //this is allowe to replace the selected number by other number
                return true;
            }

            return false;
        }
        return true;

    }
    else {
        return false;
    }
}


export function CompareDates() {
    // if (Date.parse(fromDate) > Date.parse(toDate)) {
    //     alert("Invalid Date Range!\nStart Date cannot be after End Date!")
    //     return false;
    //}
}

export function CheckNumerics(ControlID, Label, Num) {

    var Error = '';
    var RE = '';

    if ($('#' + ControlID).val() != "") {
        if ($('#' + ControlID).attr("Scale") == undefined || $('#' + ControlID).attr("Scale") == 0) {
            RE = /^-?[0-9]\d*$/;

        }
        else {
            RE = /^-?\d*\.?\d*$/;
        }

        if (RE.test(Num) == false) {
            Error = Label + ' value should be numeric';
            //            if (Error != '') {
            Error = AppendErrorMessage(Error, ControlID);
            // }
        }
    }
    return Error
}
export function ChecoToCompate(ControlID, Label, Num) {
    var value = parseFloat($('#' + ControlID).val());
    if (value == 0) {
        value = Number.MAX_VALUE;
    }
    var error = '';
    var compareTo = $('#' + ControlID).attr('CampareTo');
    var valLbl = $('#' + ControlID).attr('LabelMessage');
    var comparetolbl = $('#' + ControlID).attr('CampareToLable');
    if (compareTo != "" && compareTo != undefined) {
        var compareTo = parseFloat($('#' + compareTo).val());
        var Operator = $('#' + ControlID).attr('Operator');
        if (Operator == '>') {
            if (value <= compareTo) {
                error += valLbl + " can't be less then " + comparetolbl;
            }
        }
        else if (Operator == '<') {
            if (value > compareTo) {
                error += valLbl + " can't be greater then " + comparetolbl;
            }
        }
        else if (Operator == '<=') {
            // error += "can't be greater then " + comparetolbl;
        }
        else if (Operator == '=') {
            //  error += "should be equal to " + comparetolbl;
        }
        else if (Operator == '>=') {

        }
    }
    if (error != "") {
        AppendErrorMessage(error, ControlID);
    }
    return error;
}

export function CheckNumericsInt(ControlID, Label, Num) {
    var Error = '';
    var RE = '';

    if ($('#' + ControlID).val() != "") {
        if ($('#' + ControlID).attr("Scale") == undefined || $('#' + ControlID).attr("Scale") == 0) {
            RE = /^[0-9]\d*$/;
        }
        else {
            RE = /^\d*\.?\d*$/;
        }

        if (RE.test(Num) == false) {
            Error = Label + ' value should be numeric';
            Error = AppendErrorMessage(Error, ControlID);
        }
    }
    return Error
}

///====COMMON USE FUNCTIONS
// Created By: sanjay Vishwakarma
// Will validate Minimum Length of Numeric control for which ControlID is passed.
// It will check value of Num with MinLen and if validation fails will generate error message.
// Label is particular Control specific message to be appended with error message. 
// This error message will be appended to existing error message.
export function CheckMinLength(ControlID, Label, MinLen, Num) {
    var Error = '';
    if (MinLen != null && MinLen != "0") {
        if ($('#' + ControlID).val() != "") {
            if (parseInt(Num.length) < parseInt(MinLen)) {
                Error = Label + ' Minlength cannot be less than ' + MinLen;
                Error = AppendErrorMessage(Error, ControlID);
            }
        }
    }
    return Error
}
//Check Max Days Validation
export function CheckMaxValue(ControlID, Label, MaxValue, CompareValue) {
    var Error = '';
    if ($('#' + ControlID).attr('MaxDays') != null) {
        if ($('#' + ControlID).val() != "" || $('#' + ControlID).val() != "0") {
            if ((parseInt(CompareValue)) > parseInt(MaxValue)) {
                Error = Label + ' cannot be more than ' + MaxValue + ' days';
                Error = AppendErrorMessage(Error, ControlID);
            }
        }
    }
    return Error
}
//Check Min Days Validation
export function CheckMinValue(ControlID, Label, MinValue, CompareValue) {
    var Error = '';
    if ($('#' + ControlID).attr('MinDays') != null) {
        if ($('#' + ControlID).val() != "" || $('#' + ControlID).val() != "0") {
            if ((parseInt(CompareValue)) < parseInt(MinValue)) {
                Error = Label + ' cannot be less than ' + MinValue + ' days';
                Error = AppendErrorMessage(Error, ControlID);
            }
        }
    }
    return Error
}

// Created By: sanjay vishwakarma   
// Will validate Maximum Length of Numeric control for which ControlID is passed.
// It will check value of Num with MaxLen and if validation fails will generate error message.
// Label is particular Control specific message to be appended with error message. 
// This error message will be appended to existing error message.
export function CheckMaxLength(ControlID, Label, MaxVale, CompareValue) {
    var Error = '';
    if ($('#' + ControlID).attr('MaxLen') != null) {
        if ($('#' + ControlID).val() != "" && $('#' + ControlID).val() != "0") {
            if (parseInt(CompareValue.length) > parseInt(MaxVale)) {
                Error = Label + ' Maxlength cannot be greater than ' + MaxVale;
                Error = AppendErrorMessage(Error, ControlID);
            }
        }
    }
    return Error
}

export function SetControlError(ControlID, ErrorMessage) {
    if (ErrorMessage != "") {
        $('#' + ControlID).attr('ErrorMessage', ErrorMessage)

    }
}
export function HidDivError() {
    $('#divError').hide();
}

export function ShowErrorMsg(ErrorMessage) {
    alert(ErrorMessage);
    //$('#divError').html(ErrorMessage);
    // $('#divError').show();
    //setTimeout( HidDivError, 17000); // 17 sec.
}
///====EOF COMMON USE FUNCTIONS

//Created By : Sanjay Vishwakarma
//Desc : This Fuction is called by respective js for for validating the Mandatory for dropdown list
//Is Mandatory Validation

export function CheckIsMandatoryRadioButton(ControlID) {
    var Error = '';
    $('#' + ControlID).attr('ErrorMessage', "");
    if ($('#' + ControlID).attr('IsMandatory') != "False" && $('#' + ControlID).attr('IsMandatory') != "false") {
        var ischeckd = $('#' + ControlID + ' input:radio:checked');
        if (ischeckd.length <= 0) {
            SetBorderRed(ControlID);
            SetErrorMessage(ControlID);
            Error = 'Please select ' + $('#' + ControlID).attr('LabelMessage');
            AppendErrorMessage(Error, ControlID);
        }
    }
    return Error;
}

export function SetNoBorder(ControlID) {
    $('#' + ControlID).css("border", "none");
}
