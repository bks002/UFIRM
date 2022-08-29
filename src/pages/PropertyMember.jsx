import * as React from 'react';
import PropertyMemberHome from '../MainComponents/PropertyMember/PropertyMemberHome.jsx';
import PropertyMemberNew from '../MainComponents/PropertyMember/PropertyMemberNew.jsx';
import PropertyMemberView from '../MainComponents/PropertyMember/PropertyMemberView.jsx';

import { connect } from 'react-redux';
import departmentAction from '../redux/department/action';
import { promiseWrapper } from '../utility/common';
import { bindActionCreators } from 'redux';

class PropertyMember extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            PageTitle: 'PropertyMember Home',
            Value: {
                RelationshipType: [], relationshipTypeId: "0",
                ResidentType: [], residentTypeId: "0",
                MemberType:[],memberTypeId:"0",
                DocumentType:[],documentTypeId:"0",
            },

        }
    }

    componentDidMount() {
        let memberData = [{ "Id": "0", "Name": "Select Member Type" }, { "Id": "Owner", "Name": "Owner" }, { "Id": "Member", "Name": "Member" }];
        this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.MemberType = memberData; return { Value } });
        promiseWrapper(this.props.actions.fetchRelationshipType, { RelationshipTypeId: 0 }).then((data) => {
            let relationshipData = [{ "Id": "0", "Name": "Select Relationship Type" }];
            data.forEach(element => {
                relationshipData.push({ Id: element.relationshipTypeId.toString(), Name: element.relationship });
            });            
            this.setState(prevState => { let Value = Object.assign({}, prevState.Value); Value.RelationshipType = relationshipData; return { Value } });
        });
        promiseWrapper(this.props.actions.fetchResidentType, { ResidentTypeId: 0 }).then((data) => {
            let residentData = [{ "Id": "0", "Name": "Select Resident Type" }];
            data.forEach(element => {
                residentData.push({ Id: element.residentTypeId.toString(), Name: element.resident });
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
    }

    componentDidUpdate() {
        console.log(this.state.Value);
    }

    onChangeUserType(e) {
        
        console.log(e);
    }

    managePageMode(pagetype, data) {
        
        this.setState({ PageMode: pagetype, PageTitle: 'Property Member ' + pagetype, Data: data });
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
                                <h1 className="m-0 text-dark">Property Member</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><a href="/">Home</a></li>
                                    <li className="breadcrumb-item active"><a href="/PropertyMember">Property Member</a> </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="container-fluid">
                            {this.state.PageMode == 'Home' &&
                                <PropertyMemberHome
                                    Id="AddNewPropertyMember"
                                    Action={this.managePageMode.bind(this)} />
                            }
                            {this.state.PageMode == 'Add' &&
                                <PropertyMemberNew
                                    Id="AddNewPropertyMember"
                                    PageMode={this.state.PageMode}
                                    Value={this.state.Value}
                                    Action={this.managePageMode.bind(this)}
                                    Title={this.state.PageMode} />
                            }
                            {this.state.PageMode == 'View' &&
                                <PropertyMemberView
                                    Id="ViewPropertyMember"
                                    Data={this.state.Data}
                                    Value={this.state.Value}
                                    Action={this.managePageMode.bind(this)}
                                    Title={this.state.PageMode} />
                            }
                            {this.state.PageMode == 'Edit' &&
                                <PropertyMemberNew
                                    Id="AddNewPropertyMember"
                                    PageMode={this.state.PageMode}
                                    Data={this.state.Data}
                                    Value={this.state.Value}
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
    return {}
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentAction, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(PropertyMember);

