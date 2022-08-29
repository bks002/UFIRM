import React from 'react'
import PropertyMaster from '../MainComponents/PropertyMaster/PropertyMaster'
import PropertyNew from '../MainComponents/PropertyMaster/PropertyNew'
class PropertyMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            PageMode: 'Home',
            PageTitle: 'Property Home'

         };
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
                                <h1 className="m-0 text-dark">Property Master</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><a href="/">Home</a></li>
                                    <li className="breadcrumb-item active"><a href="/department">Property Master</a> </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="container-fluid">
                        {this.state.PageMode == 'Home' &&
                                <PropertyMaster
                                PageMode={this.state.PageMode}
                                Action={this.managepagemode.bind(this)} />

                                    
                            }
                            {this.state.PageMode == 'Add' &&
                                <PropertyNew 
                                PageMode={this.state.PageMode}
                                Action={this.managepagemode.bind(this)} />
                                    
                            }
                            {/* {this.state.PageMode == 'View' &&
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
                            } */}
                        
                        </div>
                    </div>
                </section>
            </div>
            
        );
    }
}

export default PropertyMain;