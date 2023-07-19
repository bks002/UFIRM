import React from 'react';
import { debug } from 'util';
import Common from "./ServiceCommon.js";
//import "babel-polyfill";
import AppUrlProvider from "./ApiUrlProvider.js";
import * as appCommonJs from "../Common/AppCommon.js";
import axios, { post } from 'axios';
// Global Declaration
let urls = new AppUrlProvider();

//let appCommonJs = new AppCommonjs();
// End

class ServiceProvider {
    get(url) {
        // debugger
        let jsonresponse = null;
        jsonresponse = fetch(urls.MainUrl + url,
            {
                method: "GET",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + appCommonJs.getapitoken()
                },
            }).then(response => {
                if (!response.ok) {
                    return response.json().then(mes => {
                        appCommonJs.showhtmlalert(mes.Message, 'Error', 'error');
                    });
                }
                else {
                    return response;
                }
            })
            .catch(function (error, obj) {
                appCommonJs.showhtmlalert('Unexpected Error... Please Try after some time...', 'Error', 'error');
                console.log('Error occured ' + error.state);
            });
        return jsonresponse;
    }

    getComplaint(url) {
        // debugger
        let jsonresponse = null;
        jsonresponse = fetch(urls.complaintUrl + url,
            {
                method: "GET",
                headers: {
                    'Accept': 'application/json',
                    // 'Content-Type': 'application/json',
                    // Authorization: 'Bearer ' + appCommonJs.getapitoken()
                },
            }).then(response => {
                if (!response.ok) {
                    return response.json().then(mes => {
                        appCommonJs.showhtmlalert(mes.Message, 'Error', 'error');
                    });
                }
                else {
                    return response;
                }
            })
            .catch(function (error, obj) {
                appCommonJs.showhtmlalert('Unexpected Error... Please Try after some time...', 'Error', 'error');
                console.log('Error occured ' + error.state);
            });
        return jsonresponse;
    }


    async CallSynchronouse(url) {
        let response = await fetch(urls.MainUrl + url,
            {
                async: false,
                method: "GET",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + appCommonJs.getapitoken()
                },
            });
        let json = await response.json();
        return json;
    }

    // get(url) {

    //     let jsonresponse = null;
    //     jsonresponse = fetch(urls.MainUrl + url, { method: "GET" })
    //         .then(response => {
    //             if (!response.ok) {
    //                 return response.json().then(mes => {
    //                     appCommonJs.showhtmlalert(mes, 'Error', 'error');
    //                 });
    //             }
    //             else {
    //                 return response;
    //             }
    //         })

    //         .catch(function (error, obj) {
    //             appCommonJs.showhtmlalert('Unexpected Error... Please Try after some time...', 'Error', 'error');
    //             console.log('Error occured ' + error.state);
    //         });
    //     return jsonresponse;
    // }


    // TODO: Pending
    // post(prd) {
    //     // alert("Post Called");
    //     let resp;
    //     resp = fetch("https://klevdevsrcap1:666/api/ProductPrice?AccountNumber=1100033&ItemNumber=GEM2115-EU&CurrencyCode=EUR&ValidDate=2018-10-29", {
    //         method: "GET",
    //         headers: {
    //             "Content-Type": "application/json",
    //             Accept: "application/json"
    //         },
    //         //body: JSON.stringify(prd)
    //     }).then()
    //     return resp;
    // }

    PutUsingURL(url) {

        let respdata = fetch(urls.MainUrl + url, {
            method: 'PUT',

            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + appCommonJs.getapitoken()
            },
        });
        return respdata;
    }

    PostUsingURL(url) {

        let respdata = fetch(urls.MainUrl + url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + appCommonJs.getapitoken()
            },
        });
        return respdata;
    }

    PutUsingJSON(json, url) {
        let respdata = fetch(urls.MainUrl + url, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + appCommonJs.getapitoken()
            },
            body: JSON.stringify(json)
        });
        return respdata;
    }

    CallPostFormData(url, formData) {
        console.log("track api");

        return axios.post(urls.MainUrl + url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: 'Bearer ' + appCommonJs.getapitoken()
            }
        });
    }

    CallPostFormDataNew(url, formData) {
        axios.defaults.withCredentials = false
        return axios.post(urls.MainUrl + url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Access-Control-Allow-Origin': 'true',
                Authorization: 'Bearer ' + appCommonJs.getapitoken()
            }
        })
    }

    CallPostService(url, Pdata) {
        //
        let resp;
        resp = fetch(urls.MainUrl + url, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + appCommonJs.getapitoken()
            },
            body: JSON.stringify(Pdata)
        });
        return resp;
    }

    CallPostNewService(url, Pdata) {
        //
        let resp;
        resp = fetch(urls.complaintUrl + url, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // Authorization: 'Bearer ' + appCommonJs.getapitoken()
            },
            
            body: JSON.stringify(Pdata)
        });
        console.log(resp);
        return resp;
    }

    CallGetNewService(url, Pdata) {
        //
        let resp;
        resp = fetch(urls.complaintUrl + url, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // Authorization: 'Bearer ' + appCommonJs.getapitoken()
            },
            
            body: JSON.stringify(Pdata)
        });
        console.log(resp);
        return resp;
    }

    CallGetService(url) {
        //
        let resp;
        resp = fetch(urls.MainUrl + url, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + appCommonJs.getapitoken()
            }
        });
        return resp;
    }

    CallPostServiceMy(url, Pdata) {
        let resp;
        //const data = new FormData(Pdata);
        const formData = new FormData();
        formData.append("name", Pdata.Name);
        resp = fetch(urls.MainUrl + url, {
            method: "POST",
            headers: {
                //'Accept': 'application/json',
                //'Content-Type': 'multipart/form-data',
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Bearer ' + appCommonJs.getapitoken(),
                //'Content-Type' : 'multipart/form-data; boundary=----WebKitFormBoundaryHl8DZV3dBSj0qBVe'
            },
            body: formData
        }).then(response => {
            console.log("image uploaded")
        }).catch(err => {
            console.log(err)
        })
        return resp;
    }

    async CallPostAsyncService(url, Pdata) {
        let resp;
        resp = await fetch(urls.MainUrl + url, {
            async: false,
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + appCommonJs.getapitoken()
            },
            body: JSON.stringify(Pdata)
        });
        return await resp;
    }

    CallDeleteService(url, Pdata) {
        let resp;
        resp = fetch(urls.MainUrl + url, {
            method: "Delete",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + appCommonJs.getapitoken()
            },
            body: JSON.stringify(Pdata)
        });
        return resp;
    }

    CallDeleteNewService(url, Pdata) {
        let resp;
        resp = fetch(urls.complaintUrl + url, {
            method: "Delete",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // Authorization: 'Bearer ' + appCommonJs.getapitoken()
            },
            body: JSON.stringify(Pdata)
        });
        return resp;
    }

    getElasticSearch(url, json, method) {
        console.log(JSON.stringify(json));
        console.log(url);
        console.log(method);
        let jsonresponse = null;
        jsonresponse = fetch(urls.ElasticUrl + url,
            {
                method: method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(json)
            }).then(response => {
                if (!response.ok) {
                    return response.json().then(mes => {
                        appCommonJs.showhtmlalert(mes.Message, 'Error', 'error');
                    });
                }
                else {
                    return response;
                }
            })
            .catch(function (error, obj) {
                appCommonJs.showhtmlalert('Unexpected Error... Please Try after some time...', 'Error', 'error');
                console.log('Error occured ' + error.state);
            });
        return jsonresponse;
    }
    // New
    makeGetRequest(url) {
        return new Promise(function (resolve, reject) {
            axios.get(urls.MainUrl + url).then(
                (response) => {
                    var result = response.data;
                    // console.log('Processing Request'); 
                    resolve(result);
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }
    getsynchronouse(url) {
        return fetch(urls.MainUrl + url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then((response) => response.json())
    };

    async getData(url) {

        try {
            let res = await axios({
                url: urls.MainUrl + url,
                method: 'get',
                timeout: 8000,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            if (res.status == 200) {
                // test for status you want, etc
                console.log(res.status)
            }
            // Don't forget to return something   
            return res.data
        }
        catch (err) {
            console.error(err);
        }
    }
}

export default ServiceProvider;
