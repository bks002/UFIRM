import React, { Component } from 'react';
import swal from 'sweetalert';

import * as appCommon from '../../Common/AppCommon';
import ApiProvider from './DataProvider.js';
import Button from '../../ReactComponents/Button/Button.jsx';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import SelectBox from '../../ReactComponents/SelectBox/Selectbox.jsx';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';

import { CreateFamilyMemberValidator, FamilyMemberValidateControls } from './Validation';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common.js';

class FamilyMemberDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            familyMembName: '',
            familyMembMobile: '',
            familyMembEmail: '',
            selectedfamilyMembRel: 0,
            gridFamilyMembereHeader: [
                { sTitle: 'SN', titleValue: 'id', "orderable": false, },
                { sTitle: 'Name', titleValue: 'name', "orderable": false, },
                { sTitle: 'Gender', titleValue: 'gender', "orderable": false, },
                { sTitle: 'MobileNumber', titleValue: 'mobilenumber', "orderable": false, },
                { sTitle: 'Email', titleValue: 'email', "orderable": false, },
                { sTitle: 'Relation', titleValue: 'relation', "orderable": false, },
                { sTitle: 'Action', titleValue: 'Action', Action: "Delete", Index: '0', "orderable": false }
            ],

            selectedGender: '', genderdllOptions: [
                { Id: '', Name: "Select Gender" },
                { Id: 'Male', Name: "Male" },
                { Id: 'Female', Name: "Female" },
                { Id: 'Other', Name: "Other" }
            ],
        }
        this.ApiProviderr = new ApiProvider();
    }
    // Dropdown value set
    onSelected(name, value) {
        switch (name) {
            case "OwnerFamiliyRelationship":
                this.setState({ selectedfamilyMembRel: value })
                break;
            case "FamilyMemberGender":
                this.setState({ selectedGender: value })
                break;
            default:
        }
    }

    onAddFamilyRelationship = () => {
        CreateFamilyMemberValidator();
        if (FamilyMemberValidateControls()) {
            let relationshipName = this.props.ownerFamilyRelationshipdllOptions
                .find(x => x.Id === parseInt(this.state.selectedfamilyMembRel));
            let data = this.props.familyMemberDtDetails;
            let existedName = data.some(x => x.name.toLowerCase() === this.state.familyMembName.toLowerCase());
            if (!existedName) {
                let newData = {
                    id: data.length + 1,
                    name: this.state.familyMembName,
                    gender: this.state.selectedGender,
                    mobilenumber: this.state.familyMembMobile,
                    email: this.state.familyMembEmail,
                    relation: relationshipName.Name,
                    relationshipid: parseInt(this.state.selectedfamilyMembRel),
                    rowType: 'Add'
                }
                this.setState({ selectedfamilyMembRel: 0, familyMembName: '', selectedGender: '', familyMembEmail: '', familyMembMobile: '' }
                    , () => this.props.getFamilyMemberDetails(newData))
            }
            else {
                appCommon.showtextalert(`${this.state.familyMembName} Already Added`, "", "error");
            }
        }
    }
    onRemoveFamilyRelationship(gridId) {
        let myhtml = document.createElement("div");
        //myhtml.innerHTML = "Save your changes otherwise all change will be lost! </br></br> Are you sure want to close this page?" + "</hr>"
        myhtml.innerHTML = DELETE_CONFIRMATION_MSG + "</hr>"
        alert: (
            swal({
                buttons: {
                    ok: "Yes",
                    cancel: "No",
                },
                content: myhtml,
                icon: "warning",
                closeOnClickOutside: false,
                dangerMode: true
            }).then((value) => {
                switch (value) {
                    case "ok":
                        this.props.removeFamilyMemberDetails(gridId)
                        appCommon.showtextalert("Family Member Deleted Successfully", "", "success");
                        break;
                    case "cancel":
                        //do nothing 
                        break;
                    default:
                        break;
                }
            })
        );
    }


    render() {
        return (
            <div className="card card-primary">
                <div className="card-header">
                    <h3 className="card-title">Family Member Details</h3>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-sm-3">
                            <div className="form-group">
                                <label htmlFor="txtOwnerFamilyName">Name</label>
                                <input
                                    type="text"
                                    id="txtOwnerFamilyName"
                                    placeholder="Family Member Name"
                                    className="form-control"
                                    value={this.state.familyMembName}
                                    onChange={(e) => this.setState({ familyMembName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-sm-3">
                            <div className="form-group">
                                <label htmlFor="ddlFamilyMemberGender">Gender </label>
                                <SelectBox
                                    Value={this.state.selectedGender}
                                    ID="ddlFamilyMemberGender"
                                    ClassName="form-control "
                                    onSelected={this.onSelected.bind(this, "FamilyMemberGender")}
                                    Options={this.state.genderdllOptions}
                                />
                            </div>
                        </div>
                        <div className="col-sm-3">
                            <div className="form-group">
                                <label htmlFor="txtOwnerFamilyMobile">Mobile</label>
                                <input
                                    type="text"
                                    id="txtOwnerFamilyMobile"
                                    placeholder="Family Member Mobile"
                                    className="form-control"
                                    value={this.state.familyMembMobile}
                                    onChange={(e) => this.setState({ familyMembMobile: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-sm-3">
                            <div className="form-group">
                                <label htmlFor="txtOwnerFamilyEmail">Email</label>
                                <input
                                    type="text"
                                    id="txtOwnerFamilyEmail"
                                    placeholder="Family Member Email"
                                    className="form-control"
                                    value={this.state.familyMembEmail}
                                    onChange={(e) => this.setState({ familyMembEmail: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-sm-3">
                            <div className="form-group">
                                <label htmlFor="ddlOwnerFamiliyRelationship">Relelationship </label>
                                <SelectBox
                                    Value={this.state.selectedfamilyMembRel}
                                    ID="ddlOwnerFamiliyRelationship"
                                    ClassName="form-control "
                                    onSelected={this.onSelected.bind(this, "OwnerFamiliyRelationship")}
                                    Options={this.props.ownerFamilyRelationshipdllOptions}
                                />
                            </div>
                        </div>
                        <div className="col-sm-3">
                            <div className="form-group">
                                <br></br>
                                <Button
                                    Id="btnAddMoreOwnerFamilyMember"
                                    Text="Add"
                                    Action={this.onAddFamilyRelationship.bind(this)}
                                    ClassName="btn btn-info mt-2" />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <DataGrid
                                Id="grdFimilyMembList"
                                IsPagination={false}
                                ColumnCollection={this.state.gridFamilyMembereHeader}
                                onGridDeleteMethod={this.onRemoveFamilyRelationship.bind(this)}
                                GridData={this.props.familyMemberDtDetails.filter(item => item.rowType !== 'Delete')}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default FamilyMemberDetails;