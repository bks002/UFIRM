<ul className="navbar-nav ml-auto">
<li className="nav-item dropdown">
    <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
        <a href="#" className="dropdown-item">
            <div className="media">
                <img src="../../dist/img/user1-128x128.jpg" alt="User Avatar" className="img-size-50 mr-3 img-circle"></img>
                <div className="media-body">
                    <h3 className="dropdown-item-title">
                        Brad Diesel
                        <span className="float-right text-sm text-danger"><i className="fas fa-star"></i></span>
                    </h3>
                    <p className="text-sm">Call me whenever you can...</p>
                    <p className="text-sm text-muted"><i className="far fa-clock mr-1"></i> 4 Hours Ago</p>
                </div>
            </div>
        </a>
        <div className="dropdown-divider"></div>
        <a href="#" className="dropdown-item">
            <div className="media">
                <img src="../../dist/img/user8-128x128.jpg" alt="User Avatar" className="img-size-50 img-circle mr-3"></img>
                <div className="media-body">
                    <h3 className="dropdown-item-title">
                        John Pierce
                        <span className="float-right text-sm text-muted"><i className="fas fa-star"></i></span>
                    </h3>
                    <p className="text-sm">I got your message bro</p>
                    <p className="text-sm text-muted"><i className="far fa-clock mr-1"></i> 4 Hours Ago</p>
                </div>
            </div>
        </a>
        <div className="dropdown-divider"></div>
        <a href="#" className="dropdown-item">
            <div className="media">
                <img src="../../dist/img/user3-128x128.jpg" alt="User Avatar" className="img-size-50 img-circle mr-3"></img>
                <div className="media-body">
                    <h3 className="dropdown-item-title">
                        Nora Silvester
                        <span className="float-right text-sm text-warning"><i className="fas fa-star"></i></span>
                    </h3>
                    <p className="text-sm">The subject goes here</p>
                    <p className="text-sm text-muted"><i className="far fa-clock mr-1"></i> 4 Hours Ago</p>
                </div>
            </div>
        </a>
        <div className="dropdown-divider"></div>
        <a href="#" className="dropdown-item dropdown-footer">See All Messages</a>
    </div>
</li>
<li className="nav-item dropdown">
    <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
        <span className="dropdown-item dropdown-header">15 Notifications</span>
        <div className="dropdown-divider"></div>
        <a href="#" className="dropdown-item">
            <i className="fas fa-envelope mr-2"></i> 4 new messages
            <span className="float-right text-muted text-sm">3 mins</span>
        </a>
        <div className="dropdown-divider"></div>
        <a href="#" className="dropdown-item">
            <i className="fas fa-users mr-2"></i> 8 friend requests
            <span className="float-right text-muted text-sm">12 hours</span>
        </a>
        <div className="dropdown-divider"></div>
        <a href="#" className="dropdown-item">
            <i className="fas fa-file mr-2"></i> 3 new reports
            <span className="float-right text-muted text-sm">2 days</span>
        </a>
        <div className="dropdown-divider"></div>
        <a href="#" className="dropdown-item dropdown-footer">See All Notifications</a>
    </div>
</li>
<li className="nav-item">

</li>
{/* <li onLoad="setUserData();" className="nav-item dropdown"> */}
<li className="nav-item dropdown">
    <a href="#" data-toggle="dropdown" className="dropdown-toggle nav-link dropdown-user-link">
        <span className="avatar avatar-online">
            <img src={this.state.UserProfileImg} className="rounded-circle" alt="Avatar" width="35" height="35"></img>
        </span>
        <span id="lblusername" className="user-name">{this.state.UserName}</span>
    </a>
    <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
        <Link to="/Account/App/UserProfile" className="dropdown-item">
            <p>My Profile</p>
        </Link>
        <div className="dropdown-divider"></div>
        <Link to="/Account/App/ChangePassword" className="dropdown-item">
            <p>Change Password </p>
        </Link>
        <div className="dropdown-divider"></div>
        <a href="/Account/Logout" className="dropdown-item">
            Logout
        </a>
    </div>
</li>
</ul>