import React from 'react';
import InputBox from '../ReactComponents/InputBox/InputBox.jsx';
import ButtonComponent from '../ReactComponents/Button/Button.jsx';

class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            <body class="hold-transition login-page">
                <div className="login-box">
                    {/* <!-- /.login-logo --> */}
                    <div className="card">
                        <div className="card-body login-card-body">
                            <div className="login-logo">
                                <img src="../../dist/img/Logo.png" alt="IMG"></img>
                            </div>
                            <p className="login-box-msg">Sign in</p>

                            <form action="../../index.html" method="post">
                                <div className="input-group mb-3">
                                    <InputBox
                                        Class="form-control"
                                        PlaceHolder="Email"
                                        Type="Email"
                                        Id="txtFrom" />

                                    {/* <input type="email"
                                        className="form-control"
                                        placeholder="Email">
                                    </input> */}
                                    <div className="input-group-append">
                                        <div className="input-group-text">
                                            <span className="fas fa-envelope"></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="input-group mb-3">
                                    <InputBox
                                        Class="form-control"
                                        PlaceHolder="Password"
                                        Type="password"
                                        Id="txtFrom" />

                                    {/* <input type="password" className="form-control" 
                                    placeholder="Password"></input> */}
                                    <div className="input-group-append">
                                        <div className="input-group-text">
                                            <span className="fas fa-lock"></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12">
                                        <ButtonComponent
                                             
                                            Type="submit"
                                            ClassName="btn btn-primary btn-block"
                                            Text="Sign In" />

                                        {/* <button type="submit"
                                            className="btn btn-primary btn-block">Sign In</button> */}
                                    </div>
                                </div>
                            </form>

                            <p className="mb-1 mt-4">
                                <a href="forgot-password.html">I forgot my password</a>
                            </p>
                            <p className="mb-0">
                                <a href="register.html" className="text-center">Register a new membership</a>
                            </p>
                        </div>
                        {/* <!-- /.login-card-body --> */}
                    </div>
                </div>
            </body>
        );
    }
}

export default LoginPage;