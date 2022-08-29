import InputBox from '../ReactComponents/InputBox/InputBox.jsx';
import ButtonComponent from '../ReactComponents/Button/Button.jsx';
import React from 'react';
class UserRegistration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            <body className="hold-transition register-page">
                <div className="register-box">

                    <div className="card">
                        <div className="card-body register-card-body">
                            <div className="login-logo">
                                <img src="../../dist/img/Logo.png" alt="IMG"></img>
                            </div>
                            <p className="login-box-msg">Register a new membership</p>

                            <form action="../../index.html" method="post">
                                <div className="input-group mb-3">
                                    <InputBox
                                        Class="form-control"
                                        PlaceHolder="Full name"
                                        Type="text"
                                        Id="txtFullName" />

                                    {/* <input type="text" className="form-control" 
                                placeholder="Full name"></input> */}
                                    <div className="input-group-append">
                                        <div className="input-group-text">
                                            <span className="fas fa-user"></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="input-group mb-3">
                                <InputBox
                                        Class="form-control"
                                        PlaceHolder="Email"
                                        Type="email"
                                        Id="txtEmail" />

                                    {/* <input type="email" className="form-control"
                                        placeholder="Email"></input> */}
                                    <div className="input-group-append">
                                        <div className="input-group-text">
                                            <span className="fas fa-envelope"></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="input-group mb-3">
                                <InputBox
                                        Class="form-control"
                                        PlaceHolder="password"
                                        Type="password"
                                        Id="txtPassword" />

                                    {/* <input type="password" className="form-control"
                                        placeholder="Password"></input> */}
                                    <div className="input-group-append">
                                        <div className="input-group-text">
                                            <span className="fas fa-lock"></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="input-group mb-3">
                                <InputBox
                                        Class="form-control"
                                        PlaceHolder="Retype password"
                                        Type="password"
                                        Id="txtRetryPassword" />

                                    {/* <input type="password"
                                        className="form-control" placeholder="Retype password"></input> */}

                                    <div className="input-group-append">
                                        <div className="input-group-text">
                                            <span className="fas fa-lock"></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    {/* <!-- /.col --> */}
                                    <div className="col-12">
                                    <ButtonComponent
                                             
                                             Type="submit"
                                             ClassName="btn btn-primary btn-block"
                                             Text="Submit" />
                                        {/* <button type="submit"
                                            className="btn btn-primary btn-block">Register</button> */}
                                    </div>
                                    {/* <!-- /.col --> */}
                                </div>
                            </form>
                            <p className="mb-1 mt-4">
                                <a href="login.html"
                                    className="text-center">I already have a membership</a>
                            </p>

                        </div>
                        {/* <!-- /.form-box --> */}
                    </div>
                    {/* <!-- /.card --> */}
                </div>
                {/* <!-- /.register-box --> */}


            </body>
        );
    }
}

export default UserRegistration;