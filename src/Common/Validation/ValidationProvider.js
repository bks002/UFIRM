import * as  main from './ValidationMain.js';
//import ValidationCommon from "./ValidationCommon.js";
const $ = window.$;

//const main = new validationmain();
 

    export function InitializeValidation(JsonControls) {
        JsonControls.map((item, index) => {
            switch (item.Type) {

                case 'TextBox':
                    CreateTextBoxValidator(item);
                    break;
                case 'Calender':
                    CreateCalenderValidator(item);
                    break;
                case 'Spinner':
                    CreateSpinnerValidator(item);
                    break;
                case 'Numeric':
                    CreateNumericValidator(item);
                    break;
                case 'Grid':
                    CreateGridValidator(item);
                    break;
                case 'PinCode':
                    CreatePinCodeValidator(item);
                    break;
                case 'MobileNumber':
                    CreateMobileNumberValidator(item);
                    break;
                case 'EmailID':
                    CreateEmailAddressValidator(item);
                    break;
                case 'FaxNumber':
                    CreateFaxValidator(item);
                    break;
                case 'DropDown':
                    CreateDropdownValidator(item);
                    break;
                case 'Time':
                    CreateTimeValidator(item);
                    break;
                case 'Radio':
                    CreateRadioBtnListValidator(item);
                    break;
                case 'File':
                    CreateFileValidator(item);
                    break;
                case 'Password':
                    CreatePasswordValidator(item);
                    break;
                default:
                    break;
            }


        });
    }

    // Create file validator
    export function CreateFileValidator(options) {
        
        let Control = $("#" + options.Id);
        Control.attr('LabelMessage', options.LabelMessage);
        Control.attr('IsMandatory', options.IsMandatory);
        Control.attr('ValidationType', "File");
        $(Control).blur(function () {
            main.ValidateFile(options.Id);
        });
    }

    // Create numeric validator
    export function CreateNumericValidator(options) {
        let Control = $("#" + options.Id);
        Control.attr('MaxLength', options.MaxLength);
        Control.attr('MinValue', options.MinValue);
        Control.attr('MaxValue', options.MaxValue);
        Control.attr('Scale', options.Scale);
        Control.attr('LabelMessage', options.LabelMessage);
        Control.attr('ErrorMessage', options.ErrorMessage);
        Control.attr('IsMandatory', options.IsMandatory);
        Control.attr('ValidationType', "Numeric");
        Control.css({ 'text-align': 'right' });
        Control.attr('CampareTo', options.CampareTo);
        Control.attr('CampareToLable', options.CampareToLable);
        Control.attr('Operator', options.Operator);
        $(Control).blur(function () {
            main.ValidateNumeric(options.Id);
            
        });

    }
    //End -----------------------------------
    export function  CreateDropdownValidator(options) {
        let Control = $("#" + options.Id);
        Control.attr('LabelMessage', options.LabelMessage);
        Control.attr('IsMandatory', options.IsMandatory);
        Control.attr('ValidationType', "DropDown");
        Control.attr('InitialValue', options.InitialValue);
        $(Control).blur(function () {
            main.ValidateDropdownlist(options.Id);
        });
    }
    // Create email address validator
    export function CreateEmailAddressValidator(options) {
        
        let Control = $("#" + options.Id);
        Control.attr('LabelMessage', options.LabelMessage);
        Control.attr('MaxLength', options.MaxLength);
        Control.attr('MinLength', options.MinLength);
        Control.attr('IsMandatory', options.IsMandatory);
        Control.attr('ValidationType', "EmailID");
        $(Control).blur(function () {
            main.ValidateEmail(options.Id);
        });
    }
    // End
    /// Create pin code validator
    export function  CreatePinCodeValidator(options) {
        this.attr('LabelMessage', options.LabelMessage);
        this.attr('MaxLength', options.MaxLength);
        this.attr('MinLength', options.MinLength);
        this.attr('IsMandatory', options.IsMandatory);
        this.attr('ValidationType', "PinCode");
        $("#" + this[0].id).blur(function () {
            main.ValidatePincode(this.id);
        });
    }
    export function CreateFaxValidator(options) {
        this.attr('LabelMessage', options.LabelMessage);
        this.attr('MaxLength', options.MaxLength);
        this.attr('MinLength', options.MinLength);
        this.attr('IsMandatory', options.IsMandatory);
        this.attr('ValidationType', "FaxNumber");
        $("#" + this[0].id).blur(function () {
           // main.ValidateFax(this.id);
        });
    }

    

    export function  CreatePasswordValidator(options) {
        let Control = $("#" + options.Id);
        Control.attr('LabelMessage', options.LabelMessage);
        //Control.attr('MaxLen', options.MaxLength);
        //Control.attr('MinLength', options.MinLength);
        Control.attr('IsMandatory', options.IsMandatory);
        Control.attr('ValidationType', "Password");
        $(Control).blur(function () {
            main.ValidateText(options.Id);
        });
    }

    export function  CreateTextBoxValidator(options) {

        let Control = $("#" + options.Id);
        Control.attr('LabelMessage', options.LabelMessage);
        Control.attr('MaxLen', options.MaxLength);
        Control.attr('MinLength', options.MinLength);
        Control.attr('IsMandatory', options.IsMandatory);
        Control.attr('ValidationType', "TextBox");
        $(Control).blur(function () {
            main.ValidateText(options.Id);
        });


    }

    export function  CreateTimeValidator(options) {
        let Control = $("#" + options.Id);
        Control.attr('LabelMessage', options.LabelMessage);
        Control.attr('IsMandatory', options.IsMandatory);
        Control.attr('TimeToCompare', options.TimeToCompare);
        Control.attr('Operator', options.Operator);

        Control.attr('ValidationType', "Time");
        $("#" + options.id).blur(function () {
            main.ValidateTime(this.id);
        });


        // $("#"+this[0].id).setMask({mask: "time", defaultValue:"hh:mm"});


    }
    export function CreateMobileNumberValidator(options) {
        let Control = $("#" + options.Id);
        Control.attr('LabelMessage', options.LabelMessage);
        Control.attr('MinLength', options.MinLength);
        Control.attr('IsMandatory', options.IsMandatory);
        Control.attr('ValidationType', "MobileNumber");
        $(Control).blur(function () {
            main.ValidateMobileNumber(this.id);
        });
    }
    export function  CreateSpinnerValidator(options) {
        let Control = $("#" + options.Id);
        Control.attr('LabelMessage', options.LabelMessage);
        Control.attr('MinLength', options.MinLength);
        Control.attr('IsMandatory', options.IsMandatory);
        Control.attr('ValidationType', "Spinner");
        $(Control).blur(function () {
            main.ValidateSpinner(options.Id);
        });
    }
    export function  CreateGridValidator(options) {
        let Control = $("#" + options.Id);
        Control.attr('LabelMessage', options.LabelMessage);
        Control.attr('MinLength', options.MinLength);
        Control.attr('IsMandatory', options.IsMandatory);
        Control.attr('ValidationType', "Grid");
        $('#' + options.Id + '_wrapper').bind('DOMSubtreeModified', (function () {
            main.ValidateGrid(options.Id);
        }));
    }

    export function  CreateCalenderValidator(options) {
        let Control = $("#" + options.Id);
        Control.attr('LabelMessage', options.LabelMessage);
        Control.attr('MinLength', options.MinLength);
        Control.attr('IsMandatory', options.IsMandatory);
        Control.attr('DateToCampare', options.DateToCampare);
        Control.attr('Operator', options.Operator);
        Control.attr('ValidationType', "Calender");
        $(Control).change(function () {
            main.ValidateDatePicker(options.Id);
        });

        //    $("#"+this[0].id).datepicker({
        //     dateFormat: options.DateFormat,
        //     yearRange:options.yearRange,
        //     changeMonth: true,
        //     minDate: options.MinDate,//'01-sep-2012',
        //     maxDate: options.MaxDate,//'05-sep-2012',//new Date(31,12,2000 ), //'+30Y',
        //     inline: true,
        //     monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 
        //     changeYear: true,
        //      buttonImage: '../Images/Calender.png',
        //     buttonImageOnly: true,
        //     showOn: 'both',
        //     onSelect: function(dateText, inst){ ValidateDatePicker(this.id)}
        //      });
    }

    export function  ShowBubbleMessageOnHover(ControlId) {

        $('#' + ControlId).poshytip('disable');
        var ControlID = $('#' + ControlId);
        if ($('#' + ControlId).attr('ErrorMessage') != '') {
            $(ControlID).poshytip({
                className: 'tip-yellowsimple',
                //showTimeout: 1,
                // alignTo: 'target',
                // alignX: 'right',
                // alignY: 'center',
                // offsetX: 5,
                alignTo: 'target',
                alignX: 'inner-left',
                offsetX: 0,
                offsetY: 5,
                alignTo:'center',
                allowTipHover: false
            });
        }
    }

    export function  CreateRadioBtnListValidator(options) {
        let Control = $("#" + options.Id);
        Control.attr('LabelMessage', options.LabelMessage);
        Control.attr('IsMandatory', options.IsMandatory);
        Control.attr('ValidationType', "Radio");
        $("#" + options.Id + ' input:radio').change(function(){
            main.ValidateRadioBtnLst(options.Id);
        })
    }
