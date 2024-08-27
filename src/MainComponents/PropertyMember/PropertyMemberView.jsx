import React from 'react';
import Button from '../../ReactComponents/Button/Button.jsx';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';

class PropertyMemberView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gridPropertyMemberDocumentHeader: [
                { sTitle: 'Id', titleValue: 'propertyMemberDocumentId', "orderable": false, "visible":true },
                { sTitle: 'Document Type', titleValue: 'documentTypeName', "orderable": false, },
                { sTitle: 'Document Name', titleValue: 'documentName', "orderable": false, },
                { sTitle: 'Document Url', titleValue: 'documentUrl', "orderable": false, "visible":true},
                { sTitle: 'Action', titleValue: 'Action', Action: "Download", Index: '0',urlIndex:'3', "orderable": false }
            ],
            gridPropertyMemberDocumentData: []
        };
    }
    componentDidMount() {
        this.setState({ gridPropertyMemberDocumentData: this.props.Data.propertyMemberDocumentList });
    }
    onDocumentGridData(gridLink) {
        window.open(gridLink);
    }
    handleCancel = () => {
        this.props.Action("Home");
    };
    
    render() {
        return (
            <div>
                <div >
                    <div className="modal-content">
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="lbProfilePic">Profile Picture</label>
                                        <div style={{ marginRight: "15px" }}>
                                            <img className="ImageView" alt='profilepic' src={this.props.Data.profileImageUrl} style={{ height: "90px" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                        <label for="ticketType">MiddleName</label>
                                        <div className="dummyBox">
                                            {this.props.Data.middleName}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketType">Last Name</label>
                                        <div className="dummyBox">
                                            {this.props.Data.lastName}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                <div className="form-group">
                                        <label for="ticketType">Email Address</label>
                                        <div className="dummyBox">
                                            {this.props.Data.emailAddress}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketTitle">Contact Number</label>
                                        <div className="dummyBox">
                                            {this.props.Data.contactNumber}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketType">Alternate Number</label>
                                            <div className="dummyBox">
                                                {this.props.Data.alternateContactNumber}
                                            </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketTitle">Resident Type</label>
                                        <div className="dummyBox">
                                            {this.props.Data.residentTypeName}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketType">Relationship Type</label>
                                        <div className="dummyBox">
                                            {this.props.Data.relationshipTypeName}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-content">
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <DataGrid
                                                Id="grdPropertyMemberDocumentView"
                                                IsPagination={false}
                                                ColumnCollection={this.state.gridPropertyMemberDocumentHeader}
                                                GridData={this.state.gridPropertyMemberDocumentData}
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

export default PropertyMemberView;