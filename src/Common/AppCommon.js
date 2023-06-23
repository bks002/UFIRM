/*
Created By:Sanjay Vishwakarma
Date:Jan 29 2018
Decription: common functions for site
*/
import swal from 'sweetalert';
import ToastNotify from '../ReactComponents/ToastNotify/ToastNotify.jsx';
import { ToastContainer, toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
import UrlProvider from "../Common/ApiUrlProvider.js";
import 'react-toastify/dist/ReactToastify.css';

const $ = window.$;
//class AppCommon {
export function textfunction() {
    alert('Test function method');
}
export function Progressbar(text) {
    alert: (swal({
        title: "An input!",
        text: text,
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        inputPlaceholder: "Write something"
    }));
}
export function showtextalert(msg, header, displayicon) {
    alert: (
        swal({
            title: header,
            //content: myhtml,
            icon: displayicon,
            // buttons: true,
            dangerMode: true,
            text: msg
        })

    )
}

export function showDeactivateSwal(html) {
    let myhtml = document.createElement("div");
    myhtml.innerHTML = html + "</hr>";
    alert: (
        swal({
            title: "Deactivate Justification",
            content: myhtml,
            buttons: true,
            dangerMode: false,
            closeOnClickOutside: false
        })
            .then((res) => {
                if (res) {
                    swal(`You typed: ${res}`);
                } else {
                    swal(`You typed: ${res}`);
                }
            })
    );
}

export function showhtmlalert(htmlmsg, header, displayicon) {
    let myhtml = document.createElement("div");
    myhtml.innerHTML = htmlmsg + "</hr>";
    alert: (
        swal({
            title: header,
            content: myhtml,
            icon: displayicon,
            // buttons: true,
            dangerMode: true
        })
    );
}
export function close_swal(e) {
    // console.log("Closing swal...");
    swal.close();
}

export function createtable(id) {

    $(`#${id}`).dataTable({
        "searching": true,
        "paging": true,
        "info": true,

    });
}
export function openprogressmodel(msg, timetoclose) {
    var myhtml = document.createElement("div");
    myhtml.innerHTML = `<div class='procase'>
    <div class='medline-logo'>
    <img alt='branding logo' src='/Assets/Ufirm-fabicon.png' class='brand-logo'></div>
    <div class='processingbar'>
    <span class='proc-img'><img src='../Assets/ajax-loader.gif'></span><span class='proc-text'>Please wait...</span></div>
    <div id='divsweetprogressmodelbox' class='pro-status'>${msg}</div>
    </div>`;

    if (timetoclose == 0) {
        timetoclose = -1;
    }
    alert: (
        swal({
            content: myhtml,
            buttons: false,
            dangerMode: false,
            closeOnClickOutside: false,
            timer: timetoclose
        })

    )

}


export function changejsoncolumnname(json, fromcolumn, tocolumn) {
    return JSON.parse(JSON.stringify(json).split('"' + fromcolumn + '":').join('"' + tocolumn + '":'));
}

export function convertboovalue(value) {
    if (value == 1)
        return 'Yes';
    else
        return 'No';
}

export function ShownotifyError(msg) {
    toast.dismiss();
    //if (toast.dismiss()) {
    toast.error('⚠ ' + msg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });

    // toast.error(msg, {
    //     maxOpened: 1,
    //     autoDismiss:true,
    //     enableHtml:true,
    //     preventDuplicate: msg,
    //     position: toast.POSITION.TOP_RIGHT,

    // });
}
//}

export function ShownotifySuccess(msg) {
    toast.success(msg, {
        preventDuplicate: msg,
        position: toast.POSITION.TOP_RIGHT
    });
}
export function ClearTableGrid(gridid) {
    let table = $(`#${gridid}`).DataTable();
    $(`#${gridid} tbody`).empty();
    table.destroy();
}
export function ResetGrid(gridid) {
    let table = $(`#${gridid}`).DataTable();
    if (table == null)
        $(`#${gridid}`).DataTable({
        });

}
export function ResetGridWithsetting(gridid, setting) {

    if (setting != '') {
        $(`#${gridid}`).DataTable(

            setting
        );
    }
    else {
        $(`#${gridid}`).DataTable({
            "order": [[0, "desc"]]
        });
    }
}
// Sanay Apr 26 19
export function GenerateListFillter(id) {
    $(`#${id}`).multiselect({
        allSelectedText: 'All Selected',
        maxHeight: 200,
        includeSelectAllOption: true
    });
}

//Sanjay may 07 19
export function GetSQLformatDate(date) {
    let dtpart = date.split('-');
    return `${dtpart[1]}-${dtpart[0]}-${dtpart[2]}`;
}
//Sanjay v Jun 26 19
export function GetNewGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
// end
//Sanjay jun 26 19
export function ChangeJsonValue(json, field, oldvalue, newvalue) {
    for (var k = 0; k < json.length; ++k) {
        if (oldvalue == json[k][field]) {
            json[k][field] = newvalue;
        }
    }
    return json;
}
//Sanjay Jul 01 2019
export function CheckBetweenValue(intValCheck, intFromValue, intToValue) {
    if (intToValue == 0) {
        intToValue = Number.MAX_VALUE;
    }
    if (intFromValue <= intValCheck && intValCheck <= intToValue) {
        return true;
    }
    else {
        return false;
    }
    //Sukanya Jul 03 2019

}

export function downLoadFile(rData) {
    let url = new UrlProvider().MainUrl;
    window.location = url + `/PricingCommon/DownloadFile?filename=${rData}`;
}

export function disableControl(controlid) {
    $(`#${controlid}`).prop('disabled', true);
}
export function enableControl(controlid) {
    $(`#${controlid}`).prop('disabled', false);
}
//Sanjay Jan 16 2020
export function getapitoken() {
    // Dev 


    // alert(window.sessionStorage.getItem("userinfo_key"));
     return window.sessionStorage.getItem("userinfo_key");
     //return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJUYW55YSIsImxhc3RuYW1lIjoiTWlzaHJhIiwiaW5mb190IjoiM2lFZXgrUWMwMXFGTElJdTdQRFVMbms0dFllNXdkNHc0ZU5saW44bHQwaTNRRHNZdkF5THBTMHBIRWkxTTFDenN5eVRLL3h5U0dUUW5NT0VtYmRkZWc3ZVVYeFUwTFZsRE00dVAwRElGb0UyTEIwMjAyeGw0WkhlS1JuT2VtK3VsZDhFZ2JMTC9GSjU4MFBMVFgveDI0Ly9GWWt3dzlwbWszK21MVXZicGNUaGh1THJLQWxpbU9qSjlQMklOUVVRSE9zTU9rOWZKcnZaQ0VnUExPblNqWjVtZ1MzNklZUGVzcTQrMDNPZzVhY2oyem1QN0R4clloTmVYNGtNMVJHZ3VWdWtPTmZUejQ4aENNOFpJcWRVMUE9PSIsIm5iZiI6MTY4NDczNjYzOSwiZXhwIjoxNzE2MzU5MDM5LCJpYXQiOjE2ODQ3MzY2Mzl9.JJwXBDngk7dfbs1kMqxbotgHj7uN0AN32m2Qe57RtAA';

    //test
    //return 'QEzfR6x94y32bBxRbU4YXgY8gKZqcr6hTIQYVn7PAjQpEU8K46uq8iymEMTVLy2z1IuMPAcpMlqVzf2VvoCnq6BfXmG-x1_ER43OvYxpDDglvOXdU5ZN-oEfg99Zee0a4BOar1hmCYAdWRbnc6rKLM8tZRRy7c9lF5Yxn0e2TzQMGVSK6Rn_vkZSf8AcYx3ouc18ifb1mAGwBDHMaZ4xB6xafOidNZ2_GKGsJ2NJJ1CqFnPquvLzpHrh_fmkeoR7qv4REsfH2UcQ4qhrXuJJGV2dW2HSKFcT2bbJyk1BnqweQz5ZtThvkKW5buBGF4xuu1pVApG6NBJO23HGDmaLEGU8_NYBSLdWjQioYZdWG01Zar2kLJ0kf-DPOVCJ3Y3VHgg_VO5b_ZL-8n1FoDX9KU6RvPBuMOISuZpte7mZ0oKuI5f78Z1bqBCC8B85B4lOZi5okqEIARwfuqsSb4-MQbFwUICIOcDQnt4XagTqT7VT3YbawKJYvPqoc4NtG0QD';

}

//}
// export default AppCommon;