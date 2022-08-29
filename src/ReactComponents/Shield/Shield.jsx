import React from "react";
import AppCommonjs from "../../Common/AppCommon.js";
import ApiDataProvider from "../../Common/ApiDataProvider.js";

let appCommonJs = new AppCommonjs();
let apiData = new ApiDataProvider();

class Shield extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            info: null
        };
    }

   

    componentDidCatch(error, info) {
        // Something happened to one of my children.
        // Add error to state
        this.setState({ hasError: true, error: error, info: info }, () => {
            apiData.postErrorLog(this.props.CurrentUserId, error, "React Component", info.componentStack)
                .then(resv => resv.json())
                .then(rData => {
                    let msg = `The error: ${this.state.error} -- Log Id : ${rData}`; // Where it occured: ${this.state.info.componentStack}`;
                    appCommonJs.showhtmlalert(msg, 'Oops, something went wrong :(', 'error');
                });
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div>
                   
                </div>
            );
        }
        return this.props.children;
    }
}

Shield.defaultProps = {
    CurrentUserId: ""
}


export default Shield;
