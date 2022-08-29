import React from 'react';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import TextAria from '../../ReactComponents/TextAreaBox/TextAreaBox.jsx';
import Button from '../../ReactComponents/Button/Button.jsx';
import Label from '../../ReactComponents/Label/Label.jsx';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';

class OwnerView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gridPropertyMemberDocumentHeader: [
                { sTitle: 'Document Type Id', titleValue: 'documentTypeId', "orderable": false },
                { sTitle: 'property Member Dcoument Id', titleValue: 'propertyMemberDcoumentId', "orderable": false, },
                { sTitle: 'Property Member Id', titleValue: 'propertyMemberId', "orderable": false },
                { sTitle: 'Document Type Name', titleValue: 'documentTypeName', "orderable": false, },
                { sTitle: 'Document Name', titleValue: 'documentName', "orderable": false, },
                { sTitle: 'Document Url', titleValue: 'documentURL', "orderable": false, },
                { sTitle: 'Action', titleValue: 'Action', Action: "Download", Index: '0',urlIndex:'5', "orderable": false }
            ],
            gridParkingHeader: [
                { sTitle: 'Id', titleValue: 'parkingId', "orderable": false, },
                { sTitle: 'Vehicle Type', titleValue: 'vehicleType', "orderable": false },
                { sTitle: 'Vehicle Number', titleValue: 'vehicleNumber', "orderable": false },
                { sTitle: 'Sticker Number', titleValue: 'stickerNumber', "orderable": false },
                { sTitle: 'Action', titleValue: 'Action', Action: "View", Index: '0', "orderable": false, "visible":true }
            ],
            gridPropertyMemberDocumentData: [],
            gridParkingData:[]
        };
    }
    componentDidMount() {
        //console.log(this.props.Data.parkingList)
        this.setState({ gridPropertyMemberDocumentData: this.props.Data.propertyMemberDocumentList });
        this.setState({ gridParkingData: this.props.Data.parkingList });
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
                                        <label for="lbProfilePic">Profile Picture</label>
                                        <div style={{ marginRight: "15px" }}>
                                            <img className="ImageView" src={this.props.Data.profileImageUrl} style={{ height: "90px" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketType">Name</label>
                                        <div className="dummyBox">
                                            {this.props.Data.ownerName}
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
                                                {this.props.Data.alternateNumber}
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
                                            <label for="ticketType">Owner Type</label>
                                                <div className="dummyBox">
                                                    {this.props.Data.ownerTypeName}
                                                </div>
                                        </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketType">Relationship Type</label>
                                        <div className="dummyBox">
                                            {this.props.Data.relationshipTypeName}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketTitle">Society Name</label>
                                        <div className="dummyBox">
                                            {this.props.Data.societyName}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketType">Tower/Block/Building Name</label>
                                        <div className="dummyBox">
                                            {this.props.Data.buildingName}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketType">Floor</label>
                                        <div className="dummyBox">
                                            {this.props.Data.floor}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketTitle">Flat</label>
                                        <div className="dummyBox">
                                            {this.props.Data.flat}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label for="ticketTitle">Flat Contact Number</label>
                                        <div className="dummyBox">
                                            {this.props.Data.flatContactNumber}
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
                        

                            <div className="modal-content">
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <DataGrid
                                                Id="grdParkingView"
                                                IsPagination={false}
                                                ColumnCollection={this.state.gridParkingHeader}
                                                GridData={this.state.gridParkingData}
                                                //onGridDownloadMethod={this.onDocumentGridData.bind(this)}
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

export default OwnerView;