import React, { Component } from 'react';
import swal from 'sweetalert';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as appCommon from '../../Common/AppCommon.js';
import Button from '../../ReactComponents/Button/Button';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import ApiProvider from './DataProvider';
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
// import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';
import departmentAction from '../../redux/department/action';
import AddPropertyOwner from '../PropertyOwner/AddPropertyOwner'
import PropertyTenant from '../PropertyTenant/PropertyTenant'

class OwnerResidentsGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            pageNumber: 1,
            grdTotalRows: 0,
            grdTotalPages: 0,
            isActiveInactiveClass: 1,
            gridData: [],
        };
        this.ApiProviderr = new ApiProvider();
        this.comdbprovider = new CommonDataProvider();
    }

    // checkActiveInactiveData = (val, residentTypeId) => {
    //     this.setState({ isActiveInactiveClass: val }, () => {
    //         this.props.CurrentOldOwnerAndTenant(val, residentTypeId);
    //         this.getPropertyMember("");
    //     })
    // }

    componentDidMount() {
        this.getPropertyMember("");
    }

    getPropertyMember(value) {
        var type = 'R';
        var model = this.getModel(type, value);
        // console.log(model);
        this.managePropertyMember(model, type);
    }

    managePropertyMember = (model, type) => {
        this.ApiProviderr.managePropertyMember(model, type).then(
            resp => {
                if (resp.ok && resp.status === 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'R':
                                this.setState({ grdTotalPages: rData.totalPages });
                                this.setState({ grdTotalRows: rData.totalRows });
                                this.setState({ gridData: rData.members });
                                // console.log(rData.members);
                                break;
                            case 'DLOT':
                                if (rData > 0) {
                                    appCommon.showtextalert("Propery Member Deactivate Successfully!", "", "success");
                                    // this.handleCancel();
                                    this.props.handleCancel();
                                }
                                else {
                                    // appCommon.showtextalert("Propery Member Deleted Successfully !", "", "error");
                                }
                                swal.close();
                                break;
                            default:
                        }
                    });
                }
            });
    }

    onPagechange = (page) => {
        this.setState({ pageNumber: page }, () => {
            this.getPropertyMember("");
        });
    }

    onGridDelete = (Id) => {

    }

    ongridedit(Id) {
        if (this.props.residentTypeId === 1) {
            this.setState({ PageMode: 'AddOwner', OwnerMode: 'Edit' });
        }
        if (this.props.residentTypeId === 2) {
            this.setState({ PageMode: 'AddTenant', OwnerMode: 'Edit' });
        }
    }

    ongridview(Id) {

    }

    findItem(id) {
        return this.state.gridOwnerData.find((item) => item.propertyMemberId === id);
    }
    
    // findItem(id) {
    //     return this.state.gridOwnerData.find((item) => {
    //         if (item.propertyMemberId === id) {
    //             return item;
    //         }
    //     });
    // }

    getModel = (type, value) => {
        var model = [];
        switch (type) {
            case 'R':
                model.push({
                    "SearchValue": "NULL",
                    "PageSize": 10,
                    "PageNumber": 1,
                    "PropertyId": parseInt(this.props.PropertyId),
                    "ResidentTypeId": parseInt(this.props.residentTypeId),
                    "FlatId": parseInt(this.props.flatId),
                    "IsActive": parseInt(this.state.isActiveInactiveClass),
                    "TabType": parseInt(this.props.residentTypeId) === 1 ? 'Owner' : 'Tenant',
                });
                break;
            default:
        };
        return model;
    }

    handleCancel = () => {
        this.setState({ PageMode: 'Home' }, () => this.getPropertyMember(""));
    };

    enableAddOwnerTenant = (val) => {
        this.setState({ PageMode: val, OwnerMode: 'Add' });
    }

    deleteOwnerTenant = (val) => {
        var textarea = document.createElement('textarea');
        textarea.rows = 6;
        textarea.className = 'swal-content__textarea';
        // Set swal return value every time an onkeyup event is fired in this textarea
        textarea.onkeyup = function () {
            swal.setActionValue({
                confirm: this.value
            });
        };
        let _this = this;
        swal({
            title: "Deactivate Personal Information",
            text: `Please provide the reason for Deactivate ${val} personal information of the resident. This action shall be audited.`,
            content: textarea,
            buttons: {
                confirm: {
                    text: 'Submit',
                    closeModal: false
                },
                cancel: {
                    text: 'Cancel',
                    visible: true
                }
            }
        }).then(function (value) {
            if (value && value !== true && value !== '') {
                let flatNum = 0;
                let membid = "";
                let tempMembId = [];
                _this.state.gridData.forEach(element => {
                    flatNum = element.flatId;
                    tempMembId.push(element.propertyMemberId);
                });
                membid = tempMembId.join(',');

                var model = [{
                    "Action": `Delete${val}`,
                    "JustificationComment": value,
                    "FlatId": parseInt(flatNum),
                    "Membid": membid,
                }];
                // console.log(model[0]);
                _this.managePropertyMember(model, 'DLOT');
            }

            if (value === true || value === '') {
                swal("", "Reason text can not be empty!", "info");
            }
        });
    }
    //End
    render() {
        return (
            <div>
                {this.state.PageMode === 'Home' &&
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header d-flex p-0">
                                    <ul className="nav tableFilterContainer">
                                        <li className="nav-item">
                                            <h5 className='mt-2'>Flat/Shop No: {this.props.flatNumber}</h5>
                                        </li>
                                        {/* <li className="nav-item">
                                            <div className="btn-group">
                                                <Button id="btnCurrent"
                                                    Action={this.checkActiveInactiveData.bind(this, 1, this.props.residentTypeId)}
                                                    ClassName={this.state.isActiveInactiveClass === 1 ? 'btn btn-success' : 'btn btn-default'}
                                                    Text="Current"
                                                />

                                                <Button id="btnOld"
                                                    Action={this.checkActiveInactiveData.bind(this, 0, this.props.residentTypeId)}
                                                    ClassName={this.state.isActiveInactiveClass === 0 ? 'btn btn-success' : 'btn btn-default'}
                                                    Text="Old"
                                                />
                                            </div>
                                        </li> */}
                                        {
                                            this.state.isActiveInactiveClass === 1 && this.props.residentTypeId === 1
                                                && this.state.gridData.length === 0 ?
                                                <li className="nav-item">
                                                    <Button id="btnAddOwner"
                                                        Action={this.enableAddOwnerTenant.bind(this, "AddOwner")}
                                                        ClassName="btn btn-primary"
                                                        Text="Add"
                                                    />
                                                </li>
                                                : null
                                        }
                                        {
                                            this.state.isActiveInactiveClass === 1 && this.props.residentTypeId === 1
                                                && this.state.gridData.length > 0 ?
                                                < li className="nav-item">
                                                    <Button id="btnDeleteOwner"
                                                        Action={this.deleteOwnerTenant.bind(this, "Owner")}
                                                        ClassName="btn btn-danger"
                                                        Text="Deactivate"
                                                    />
                                                </li> : null
                                        }
                                        {
                                            this.props.residentTypeId === 2 && (
                                                <li className="nav-item">
                                                    <Button id="btnAddTenant"
                                                        Action={this.enableAddOwnerTenant.bind(this, "AddTenant")}
                                                        ClassName="btn btn-primary"
                                                        Text="Add"
                                                    />
                                                </li>
                                            )
                                        }
                                        {/* {
                                            // if Owner Residing -> hide add tenant from here.. //&& this.props.isOwnerRegistered
                                            this.props.occupancyStatus !== 'Owner Residing' && this.props.isOwnerRegistered ?
                                                this.state.isActiveInactiveClass === 1 && this.props.residentTypeId === 2
                                                    && this.state.gridData.length == 0 ?
                                                    <li className="nav-item">
                                                        <Button id="btnAddTenant"
                                                            Action={this.enableAddOwnerTenant.bind(this, "AddTenant")}
                                                            ClassName="btn btn-primary"
                                                            Text="Add"
                                                        />
                                                    </li>
                                                    : null
                                                : null
                                        } */}
                                        {
                                            this.props.occupancyStatus !== 'Owner Residing' ?
                                                this.state.isActiveInactiveClass === 1 && this.props.residentTypeId === 2
                                                    && this.state.gridData.length > 0 ?
                                                    <li className="nav-item">
                                                        <Button id="btnDeleteTenant"
                                                            Action={this.deleteOwnerTenant.bind(this, "Tenant")}
                                                            ClassName="btn btn-danger"
                                                            Text="Deactivate"
                                                        />
                                                    </li>
                                                    : null
                                                : null
                                        }
                                    </ul>
                                </div>
                                <div className="card-body pt-2">
                                    <DataGrid
                                        Id={this.props.grdID}
                                        IsPagination={false}
                                        ColumnCollection={this.props.gridHeader}
                                        totalpages={this.state.grdTotalPages}
                                        totalrows={this.state.grdTotalRows}
                                        Onpageindexchanged={this.onPagechange.bind(this)}
                                        onEditMethod={this.ongridedit.bind(this)}
                                        //  onGridViewMethod={this.ongridview.bind(this)}
                                        onGridDeleteMethod={this.onGridDelete.bind(this)}
                                        IsSarching="true"
                                        GridData={this.state.gridData}
                                        pageSize="10" />
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {
                    this.state.PageMode === "AddOwner" &&
                    <AddPropertyOwner
                        flatId={this.props.flatId}
                        flatNumber={this.props.flatNumber}
                        handleCancel={this.handleCancel.bind(this)}
                        mode={this.state.OwnerMode}
                        occupancyStatus={this.props.occupancyStatus}
                    />
                }
                {
                    // Add Tenant
                    this.state.PageMode === "AddTenant" &&
                    <PropertyTenant
                        flatId={this.props.flatId}
                        flatNumber={this.props.flatNumber}
                        handleCancel={this.handleCancel.bind(this)}
                        mode={this.state.OwnerMode}
                    />
                }
            </div >
        );
    }
}

function mapStoreToprops(state, props) {
    return {
        PropertyId: state.Commonreducer.puidn,
    }
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentAction, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(OwnerResidentsGrid);