import InputBox from '../ReactComponents/InputBox/InputBox.jsx';
import ButtonComponent from '../ReactComponents/Button/Button.jsx';
import React from 'react';
import Link from '../ReactComponents/LinkComponent/Link.jsx'
class ForgotPassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            <body className="hold-transition login-page">
                <div className="login-box">
                    {/* <!-- /.login-logo --> */}
                    <div className="card">
                        <div className="card-body login-card-body">
                            <div className="login-logo">
                                <img src="../../dist/img/Logo.png" alt="IMG"></img>
                            </div>
                            <p className="login-box-msg">Forgot password</p>

                            <form action="recover-password.html" method="post">
                                <div className="input-group mb-3">
                                <InputBox
                                        Class="form-control"
                                        PlaceHolder="Full name"
                                        Type="email"
                                        Id="txtFullName" />

                                    {/* <input type="email" className="form-control"
                                        placeholder="Email"></input> */}
                                    <div className="input-group-append">
                                        <div className="input-group-text">
                                            <span className="fas fa-envelope"></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12">
                                    <ButtonComponent
                                             Type="submit"
                                             ClassName="btn btn-primary btn-block"
                                             Text="Request new password" />
                                        {/* <button type="submit" 
                                        className="btn btn-primary btn-block">Request new password</button> */}
                                    </div>
                                    {/* <!-- /.col --> */}
                                </div>
                            </form>

                            <p className="mt-3 mb-1">
                            <Link
                            Id="lnkLogin"
                            Text="Login"
                            Url="login.html">
                            </Link>
                                {/* <a href="login.html">Login</a> */}
                            </p>
                            <p className="mb-0">
                            <Link
                            Id="lnkLogin"
                            Text="Register a new membership"
                            Class="text-center"
                            Url="register.html">
                            </Link>
                                {/* <a href="register.html" className="text-center">Register a new membership</a> */}
                            </p>
                        </div>
                    </div>
                </div>

            </body>
        );
    }
}


export default ForgotPassword;