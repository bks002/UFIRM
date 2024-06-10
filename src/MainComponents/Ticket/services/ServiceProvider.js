//import "babel-polyfill";
import AppUrlProvider from "./ApiUrlProvider.js";
// Global Declaration
let urls = new AppUrlProvider();

// End

class ServiceProvider {
    get(url) {
        let jsonresponse = null;
        jsonresponse = fetch(urls.MainUrl + url,
            {
                method: "GET",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }).then(response => {
                if (!response.ok) {
                    return response.json().then(mes => {
                
                    });
                }
                else {
                    return response;
                }
            })
            .catch(function (error, obj) {
                
                console.log('Error occured ' + error.state);
            });
        return jsonresponse;
    }


    async  CallSynchronouse(url) {
        let response = await fetch(urls.MainUrl + url,
            {
                async: false,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            });
        let json = await response.json();
        return json;
    }
    PutUsingURL(url) {

        let respdata = fetch(urls.MainUrl + url, {
            method: 'PUT',

            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        return respdata;
    }

    PostUsingURL(url) {

        let respdata = fetch(urls.MainUrl + url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        return respdata;
    }

    PutUsingJSON(json, url) {
        let respdata = fetch(urls.MainUrl + url, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json)
        });
        return respdata;
    }

    CallPostService(url, Pdata) {
        let resp;
        resp = fetch(urls.MainUrl + url, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Pdata)
        });
        return resp;
    }

    async CallPostAsyncService(url, Pdata) {
        let resp;
        resp = await fetch(urls.MainUrl + url, {
            async: false,
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
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
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Pdata)
        });
        return resp;
    }
}

export default ServiceProvider;
