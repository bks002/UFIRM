
import * as React from 'react';
import DepartmentHome from '../MainComponents/Department/DepartmentHome.jsx';
import DepartmentNew from '../MainComponents/Department/DepartmentNew.jsx';
import HomeContainer from '../AppContainers/home/homecontainer.jsx';
import DepartmentView from '../MainComponents/Department/DepartmentView.jsx';

import { connect } from 'react-redux';
import departmentAction from '../redux/department/action';
import { promiseWrapper } from '../utility/common';
import { bindActionCreators } from 'redux';

class Department extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PageMode: 'Home',
            PageTitle: 'Department Home'
        }
    }

    managepagemode(pagetype, data) {
        
        this.setState({ PageMode: pagetype, PageTitle: 'Department ' + pagetype, Data: data });

    }

    render() {
        return (
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0 text-dark">Department Master</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><a href="/">Home</a></li>
                                    <li className="breadcrumb-item active"><a href="/department">Department</a> </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="container-fluid">
                            {this.state.PageMode == 'Home' &&
                                <DepartmentHome

                                    Id="AddNewDepartment"
                                    Action={this.managepagemode.bind(this)} />
                            }
                            {this.state.PageMode == 'Add' &&
                                <DepartmentNew
                                    Id="AddNewDepartment"
                                    PageMode={this.state.PageMode}
                                    Action={this.managepagemode.bind(this)}
                                    Title={this.state.PageMode} />
                            }
                            {this.state.PageMode == 'View' &&
                                <DepartmentView
                                    Id="viewDepartment"
                                    Data={this.state.Data}
                                    Action={this.managepagemode.bind(this)}
                                    Title={this.state.PageMode} />
                            }
                            {this.state.PageMode == 'Edit' &&
                                <DepartmentNew
                                    Id="AddNewDepartment"
                                    PageMode={this.state.PageMode}
                                    Data={this.state.Data}
                                    Action={this.managepagemode.bind(this)}
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
    return {
        // userName: state.ForeCast.UsreName,
        // age: state.ForeCast.age,
        // data: JSON.stringify(state.ForeCast.data),
    }

}

function mapDispatchToProps(dispatch) {
    const value1 = 'medline';
    const actions = bindActionCreators(departmentAction, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(Department);

