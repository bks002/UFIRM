import React, { Component } from 'react';

import Button from '../../ReactComponents/Button/Button';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import ApiProvider from './DataProvider';
import { ShowImageModal } from '../KanbanBoard/ImageModal';
import { ShowPdfModal } from '../KanbanBoard/ShowPdf';

const $ = window.$;

class OwnerTenantView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ownerShiptype: '',
            registrationDate: '',
            gridOwnerTenantHeader: [
                { sTitle: 'ID', titleValue: 'id', "orderable": false, },
                { sTitle: 'Name', titleValue: 'name', "orderable": false, },
                { sTitle: 'Gender', titleValue: 'gender', "orderable": false, },
                { sTitle: 'MobileNumber', titleValue: 'mobilenumber', "orderable": false, },
                { sTitle: 'Email', titleValue: 'email', "orderable": false, },
                { sTitle: 'File', titleValue: 'filename', "orderable": false, },
                { sTitle: 'DocUrl', titleValue: 'editDocUrl', "orderable": false, bVisible: false },
                { sTitle: 'Action', titleValue: 'Action', Action: "View", Index: '0', "orderable": false }
            ],
            gridOwnerTenantData: [],

            gridRentAgreementHeader: [
                { sTitle: 'ID', titleValue: 'id', "orderable": false, },
                { sTitle: 'Start Date', titleValue: 'startDate', "orderable": false, },
                { sTitle: 'End Date', titleValue: 'endDate', "orderable": false, },
                { sTitle: 'File', titleValue: 'filename', "orderable": false, },
                { sTitle: 'EditDocUrl', titleValue: 'editDocUrl', "orderable": false, bVisible: false },
                { sTitle: 'Action', titleValue: 'Action', Action: "View", Index: '0', "orderable": false }
            ],
            gridRentAgreementData: [],

            gridVehicleHeader: [
                { sTitle: 'Id', titleValue: 'id', "orderable": false, },
                { sTitle: 'Parking', titleValue: 'parkingName', "orderable": false, },
                { sTitle: 'Type', titleValue: 'vehicletype', "orderable": false, },
                { sTitle: 'Name', titleValue: 'name', "orderable": false, },
                { sTitle: 'Number', titleValue: 'vehiclenumber', "orderable": false, },
            ],
            gridVehicleData: [],

            gridFamilyMembereHeader: [
                { sTitle: 'SN', titleValue: 'id', "orderable": false, },
                { sTitle: 'Name', titleValue: 'name', "orderable": false, },
                { sTitle: 'Gender', titleValue: 'gender', "orderable": false, },
                { sTitle: 'MobileNumber', titleValue: 'mobilenumber', "orderable": false, },
                { sTitle: 'Email', titleValue: 'email', "orderable": false, },
                { sTitle: 'Relation', titleValue: 'relation', "orderable": false, },
            ],
            gridFamilyMembereData: [],

            gridDocumentHeader: [
                { sTitle: 'SN', titleValue: 'id', "orderable": false, },
                { sTitle: 'Name', titleValue: 'name', "orderable": false, },
                { sTitle: 'Type', titleValue: 'type', "orderable": false, },
                { sTitle: 'Document Number', titleValue: 'documentnumber', "orderable": false, },
                { sTitle: 'File', titleValue: 'filename', "orderable": false, },
                { sTitle: 'EditDocUrl', titleValue: 'editDocUrl', "orderable": false, bVisible: false },
                { sTitle: 'Action', titleValue: 'Action', Action: "View", Index: '0', "orderable": false }
            ],
            gridDocumentData: [],
        }
        this.ApiProviderr = new ApiProvider();
    }
    componentDidMount() {
        this.loadTenatReadonlyViewDetails();
    }


    onCancel = () => {
        this.props.handleCancel()
    }
    //this.props.primaryMemeberId  t->339 o->342
    loadTenatReadonlyViewDetails() {
        // console.log(this.props.flatId, this.props.primaryMemeberId, this.props.residentTypeId, 'Read only view data');
        this.ApiProviderr.getOwnerTenantReadonlyViewDetails(this.props.flatId, this.props.primaryMemeberId, this.props.residentTypeId).then(
            resp => {
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        // console.log(rData, "Veiw Data");
                        if (rData.ownership) {
                            this.setState({ ownerShiptype: rData.ownership })
                        }
                        if (rData.registationDate) {
                            this.setState({ ownerShiptype: rData.registationDate })
                        }
                        if (rData.viewTenantPersonalDetails) {
                            this.setState({ gridOwnerTenantData: rData.viewTenantPersonalDetails });
                        }
                        if (rData.viewTenantRentAgreementDetails) {
                            this.setState({ gridRentAgreementData: rData.viewTenantRentAgreementDetails });
                        }
                        if (rData.viewTenantVehicleDetails) {
                            this.setState({ gridVehicleData: rData.viewTenantVehicleDetails });
                        }
                        if (rData.viewTenantFamilyMemberDetails) {
                            this.setState({ gridFamilyMembereData: rData.viewTenantFamilyMemberDetails });
                        }
                        if (rData.viewTenantDocumentDetails) {
                            this.setState({ gridDocumentData: rData.viewTenantDocumentDetails });
                        }
                    });
                }
            });
    }

    onOwnerTenantImageDocument(gridId) {
        let data = this.state.gridOwnerTenantData.find(x => x.id === gridId);
        this.showDocument(data);
    }


    onRentAgreementDocument(gridId) {
        let data = this.state.gridRentAgreementData.find(x => x.id === gridId);
        this.showDocument(data);
    }


    onOwnerTenantDocument(gridId) {
        let data = this.state.gridDocumentData.find(x => x.id === gridId);
        this.showDocument(data);
    }

    showDocument(data) {
        if (data !== null) {
            this.setState({
                showImagefilename: data.filename,
                showImagefiletype: null,
                showImagefile: data.editDocUrl,
                extension: ''
            },
                () => {
                    let ext = data.editDocUrl.substring(data.editDocUrl.lastIndexOf('.') + 1);
                    if (ext === "pdf") {
                        $('#modal-lg-pdf-RentAgreementdocumentPreview').modal('show')
                    }
                    else {
                        $('#modal-lg-rentagreementImgPreview').modal('show')
                    }
                })
        }
    }


    // show image and pdf pending when dynamic data add then work 
    render() {
        return (
            <div>
                <ShowImageModal
                    Id="modal-lg-rentagreementImgPreview"
                    titile={this.state.showImagefilename}
                    showImagefiletype={this.state.showImagefiletype}
                    showImagefile={this.state.showImagefile}
                    extension={this.state.extension}
                />

                <ShowPdfModal
                    Id="modal-lg-pdf-RentAgreementdocumentPreview"
                    titile={this.state.showImagefilename}
                    showImagefiletype={this.state.showImagefiletype}
                    showImagefile={this.state.showImagefile}
                    extension={this.state.extension}
                />
                <div className="card card-default">
                    <div className="card-header">
                        {
                            this.props.residentTypeId === 2 ? <div className="row">
                                <div className="col-md-6">
                                    <h5 style={{ fontWeight: "bold" }}> Flat/Shop Number : {this.props.flatNumber}</h5>
                                </div>

                                <div className="col-md-6">
                                    <h5 style={{ fontWeight: "bold" }} className="float-right">ResidentType : {this.props.residentType}</h5>
                                </div>

                            </div> :
                                <div className="row">
                                    <div className="col-md-3">
                                        <h5 style={{ fontWeight: "bold" }}> Flat/Shop Number : {this.props.flatNumber}</h5>
                                    </div>
                                    <div className="col-md-3">
                                        <h5 style={{ fontWeight: "bold" }} >ResidentType : {this.props.residentType}</h5>
                                    </div>
                                    <div className="col-md-3">
                                        <h5 style={{ fontWeight: "bold" }} >Ownership : {this.state.ownerShiptype}</h5>
                                    </div>
                                    <div className="col-md-3">
                                        <h5 style={{ fontWeight: "bold" }} >RegistrationDate : {this.state.registrationDate}</h5>
                                    </div>
                                </div>
                        }
                    </div>
                </div>

                <div className="card card-primary">
                    <div className="card-header">
                        <h3 className="card-title">{this.props.residentType} Details</h3>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-sm-12">
                                <DataGrid
                                    Id="grdPropertyDetails"
                                    IsPagination={false}
                                    ColumnCollection={this.state.gridOwnerTenantHeader}
                                    onEditMethod={() => { }}
                                    onGridViewMethod={this.onOwnerTenantImageDocument.bind(this)}
                                    onGridDeleteMethod={() => { }}
                                    GridData={this.state.gridOwnerTenantData}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {
                    this.props.residentTypeId === 2 && <div className="card card-primary">
                        <div className="card-header">
                            <h3 className="card-title">Rent Agreement Details</h3>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-sm-12">
                                    <DataGrid
                                        Id="grdRentAgreementDetails"
                                        IsPagination={false}
                                        ColumnCollection={this.state.gridRentAgreementHeader}
                                        onEditMethod={() => { }}
                                        onGridViewMethod={this.onRentAgreementDocument.bind(this)}
                                        onGridDeleteMethod={() => { }}
                                        GridData={this.state.gridRentAgreementData}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                }


                <div className="card card-primary">
                    <div className="card-header">
                        <h3 className="card-title">Vehicle Details</h3>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-sm-12">
                                <DataGrid
                                    Id="grdVehicleDetails"
                                    IsPagination={false}
                                    ColumnCollection={this.state.gridVehicleHeader}
                                    onEditMethod={() => { }}
                                    onGridViewMethod={() => { }}
                                    onGridDeleteMethod={() => { }}
                                    GridData={this.state.gridVehicleData}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card card-primary">
                    <div className="card-header">
                        <h3 className="card-title">Family Member Details</h3>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-sm-12">
                                <DataGrid
                                    Id="grdFamilyMemeberDetails"
                                    IsPagination={false}
                                    ColumnCollection={this.state.gridFamilyMembereHeader}
                                    onEditMethod={() => { }}
                                    onGridViewMethod={() => { }}
                                    onGridDeleteMethod={() => { }}
                                    GridData={this.state.gridFamilyMembereData}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card card-primary">
                    <div className="card-header">
                        <h3 className="card-title">Document Details</h3>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-sm-12">
                                <DataGrid
                                    Id="grdDocumentDetails"
                                    IsPagination={false}
                                    ColumnCollection={this.state.gridDocumentHeader}
                                    onEditMethod={() => { }}
                                    onGridViewMethod={this.onOwnerTenantDocument.bind(this)}
                                    onGridDeleteMethod={() => { }}
                                    GridData={this.state.gridDocumentData}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card card-primary">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-sm-12 text-right">
                                <Button
                                    Id="btnCancel"
                                    Text="Back to List"
                                    Action={this.onCancel.bind(this)}
                                    ClassName="btn btn-secondary" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

OwnerTenantView.defaultProps = {
    flatId: 0,
    flatNumber: 'Abc',
    residentTypeId: 0,
    residentType: 'Abc',
    primaryMemeberId: 0,
}

export default OwnerTenantView;