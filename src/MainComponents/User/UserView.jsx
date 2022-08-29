import React from 'react';
import Button from '../../ReactComponents/Button/Button.jsx';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import './User.css';

class UserView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userType: [],
            gridHeader: [
                // { sTitle: 'Id', titleValue: 'documentTypeId', "orderable": false,  },
                { sTitle: 'Document Type', titleValue: 'documentTypeName', "orderable": false },
                { sTitle: 'Document Number', titleValue: 'documentNumber', "orderable": false },
                { sTitle: 'Document Name', titleValue: 'documentName', "orderable": false, "visible": true },
                { sTitle: 'Document Url', titleValue: 'documentURL', "orderable": false, "visible": true },
                { sTitle: 'Action', titleValue: 'Action', Action: "Download", Index: '0', urlIndex: '3', "orderable": false }
            ],
            gridData: [],
        };
    }
    componentDidMount() {
        console.log(this.props.Data.userType);
        this.setState({ userType: this.props.Data.userType });
        this.setState({ gridData: this.props.Data.userDocumentList });
    }
    handleCancel = () => {
        this.props.Action("Home");
    };
    onDocumentGridData(gridLink) {
        window.open(gridLink);
    }

    render() {
        return (
            <div>
                <div >
                    <div className="modal-content">
                        <div className="modal-body">

                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketType">First Name</label>
                                        <div className="dummyBox">
                                            {this.props.Data.firstName}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketTitle">Last Name</label>
                                        <div className="dummyBox">
                                            {this.props.Data.lastName}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketType">Email Address</label>
                                        <div className="dummyBox">
                                            {this.props.Data.emailAddress}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketTitle">Contact Number</label>
                                        <div className="dummyBox">
                                            {this.props.Data.contactNumber}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketType">Company</label>
                                        <div className="dummyBox">
                                            {this.props.Data.companyName}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketType">Branch</label>
                                        <div className="dummyBox">
                                            {this.props.Data.branchName}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketTitle">Department</label>
                                        <div className="dummyBox">
                                            {this.props.Data.departmentName}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketType">City</label>
                                        <div className="dummyBox">
                                            {this.props.Data.cityName}
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketType">Role</label>
                                        <div className="dummyBox">
                                            {this.props.Data.userRoleList.map((person, index) => (
                                                <div>{person.userRoleName}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketType">Property</label>
                                        <div className="dummyBox">
                                            {this.props.Data.userPropertyList.map((person, index) => (
                                                <div>{person.userPropertyName}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketTitle">Vendor</label>
                                        <div className="dummyBox">
                                            {this.props.Data.vendorName}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketType">User Type</label>
                                        <div className="dummyBox">
                                            {this.props.Data.userType}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="lbProfilePic">Profile Picture</label>
                                        <div>
                                            <img className="ImageView" src={this.props.Data.profileImageUrl} style={{ height: "90px" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-content">
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <DataGrid
                                                Id="grdViewDoc"
                                                IsPagination={false}
                                                ColumnCollection={this.state.gridHeader}
                                                GridData={this.state.gridData}
                                                onGridDownloadMethod={this.onDocumentGridData.bind(this)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="modal-footer">
                            <Button
                                Id="btnCancel"
                                Text="Cancel"
                                Action={this.handleCancel}
                                ClassName="btn btn-secondary" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default UserView;