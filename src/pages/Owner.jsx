import * as React from 'react';
import OwnerHome from '../MainComponents/Owner/OwnerHome.jsx';
import OwnerNew from '../MainComponents/Owner/OwnerNew.jsx';
import OwnerView from '../MainComponents/Owner/OwnerView.jsx';

import { connect } from 'react-redux';
import departmentAction from '../redux/department/action';
import { promiseWrapper } from '../utility/common';
import { bindActionCreators } from 'redux';

class Owner extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            PageTitle: 'Owner Home',
            Value: {
                OwnerType:[],ownerTypeId:"0",
                RelationshipType:[],relationshipTypeId:"0",
                ResidentType:[],residentTypeId:"0",
                DocumentType:[],documentTypeId:"0",
                VehicleType:[],vehicleTypeId:"0",
                Society:[],SocietyId:"0",
            },
            
        }
    }

    componentDidMount() {
        let vehicleTypeData = [{"Id": "0","Name": "Select Vehicle"},{"Id": "2 wheeler","Name": "2 wheeler"},{"Id": "4 wheeler","Name": "4 wheeler"}];
        this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.VehicleType = vehicleTypeData; return { Value } }); 

        promiseWrapper(this.props.actions.fetchOwnerType, { OwnerTypeId: 0 }).then((data) => {
            let ownerData = [{"Id": "0","Name": "Select Owner Type"}];
            data.forEach(element => {
                ownerData.push({Id: element.ownershipTypeId.toString(), Name: element.ownership});
            });
            this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.OwnerType = ownerData; return { Value } });
        });
        promiseWrapper(this.props.actions.fetchRelationshipType, { RelationshipTypeId: 0 }).then((data) => {
            let relationshipData = [{"Id": "0","Name": "Select Relationship Type"}];
            data.forEach(element => {
                relationshipData.push({Id: element.relationshipTypeId.toString(), Name: element.relationship});
            });
            this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.RelationshipType = relationshipData; return { Value } }); 
        });
        promiseWrapper(this.props.actions.fetchResidentType, { ResidentTypeId: 0 }).then((data) => {
            let residentData = [{"Id": "0","Name": "Select Resident Type"}];
            data.forEach(element => {
                residentData.push({Id: element.residentTypeId.toString(), Name: element.resident});
            });
            this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.ResidentType = residentData; return { Value } });
        });
        promiseWrapper(this.props.actions.fetchDocumentType, { DocumentTypeId: 0 }).then((data) => {
            let documentTypeData = [{"Id": "0","Name": "Select Document Type"}];
            data.forEach(element => {
                documentTypeData.push({Id: element.documentTypeId.toString(), Name: element.documentTypeName});
            });
            this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.DocumentType = documentTypeData; return { Value } });
        });
        promiseWrapper(this.props.actions.fetchProperty, { PropertyId: 0 }).then((data) => {
            let societyData = [{"Id": "0","Name": "Select Society"}];
            data.forEach(element => {
                societyData.push({Id: element.id.toString(), Name: element.text});
            });
            this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.Society = societyData; return { Value } });
        });
    }

    componentDidUpdate() {
        console.log(this.state.Value);
    }

    onChangeUserType(e){
        
        console.log(e);
    }

    managePageMode(pagetype, data) {
        
        this.setState({ PageMode: pagetype, PageTitle: 'Owner ' + pagetype, Data: data });
    }
    
    onChange(userTypeId) {   
        
        this.setState(prevState => { 
            let Data = Object.assign({}, prevState.Data); 
            Data.userTypeId = userTypeId; 
            return { Data } 
        });
    }
   
    render() {
        return (
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0 text-dark">Manage Owners/Tenants</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><a href="/">Home</a></li>
                                    <li className="breadcrumb-item active"><a href="/Owner">Owner</a> </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="container-fluid">
                            {this.state.PageMode == 'Home' &&
                                <OwnerHome
                                    Id="AddNewOwner"
                                    Action={this.managePageMode.bind(this)} />
                            }
                            {this.state.PageMode == 'Add' &&
                                <OwnerNew
                                    Id="AddNewOwner"
                                    PageMode={this.state.PageMode}
                                    Value = {this.state.Value}
                                    Action={this.managePageMode.bind(this)}
                                    Title={this.state.PageMode} />
                            }
                            {this.state.PageMode == 'View' &&
                                <OwnerView
                                    Id="viewOwner"
                                    Data={this.state.Data}
                                    Value = {this.state.Value}
                                    Action={this.managePageMode.bind(this)}
                                    Title={this.state.PageMode} />
                            }
                            {this.state.PageMode == 'Edit' &&
                                <OwnerNew
                                    Id="AddNewOwner"
                                    PageMode={this.state.PageMode}
                                    Data={this.state.Data}
                                    Value = {this.state.Value}
                                    onNameChange={this.onChange.bind(this)}
                                    Action={this.managePageMode.bind(this)}
                                    Title={this.state.PageMode} />
                            }
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
function mapStoreToprops(state, props) {
    return { }
}

function mapDispatchToProps(dispatch) {
    const value1 = 'medline';
    const actions = bindActionCreators(departmentAction, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(Owner);

