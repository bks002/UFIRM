import React from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import login from "./login.jsx";
import resetpaaaword from "./resetpassword.jsx";
import AdminDashboard from "../components/AdminDashboard.jsx";
// import LoginPage from '../components/LoginPage.jsx';
// import Registration from '../components/UserRegistration.jsx';
// import UserRegistration from '../components/UserRegistration.jsx';
import ForgotPassword from "../MainComponents/AdminDashboard.jsx";

// import '../theme/dist/css/adminlte.min.css';

export default class app extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      IsUserActive: true,
    };
  }
  render() {
    if (this.state.IsUserActive) {
      return <AdminDashboard />;
    } else {
      return (
        // <UserRegistration></UserRegistration>
        // <LoginPage/>
        <ForgotPassword></ForgotPassword>
      );
    }
  }
}
