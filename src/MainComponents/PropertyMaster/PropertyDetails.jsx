import React from 'react'
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button.jsx';
import { Typeahead } from 'react-bootstrap-typeahead';
import DropDownList from '../../ReactComponents/SelectBox/DropdownList';
import Label from '../../ReactComponents/Label/Label'
class PropertyDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            PropertyDetailsData:[],
            gridHeader: [
                { sTitle: 'TowerName', titleValue: 'TowerName', "orderable": false },
                { sTitle: 'Floor', titleValue: 'Floor'},
                { sTitle: 'FlatName', titleValue: 'FlatName'},
                { sTitle: 'ContactNumber', titleValue: 'ContactNumber', "orderable": true },
                { sTitle: 'Action', titleValue: 'Action', Action: "ALL", Index: '0', "orderable": false }
               
            ],
            grdTotalRows: 1,
            grdTotalPages: 1,
            FilterData: [{ Name: 'Royal Nest Housing Society',Value:1, Name: 'EON Society', Value:2 }],
            SearchValue:null,
            PageMode:'Home'
         };
    }
    componentDidMount(){
        const data = [{
            'TowerName':'TOWER-N1',
            'Floor':'1',
            'FlatName':'N1-1001',
            'ContactNumber':'2154254154'            
        },
        {
            'TowerName':'TOWER-N1',
            'Floor':'1',
            'FlatName':'N1-1001',
            'ContactNumber':'2154254154'            
        },
        {
            'TowerName':'TOWER-N1',
            'Floor':'1',
            'FlatName':'N1-1001',
            'ContactNumber':'2154254154'            
        }
        ,{
            'TowerName':'TOWER-N1',
            'Floor':'1',
            'FlatName':'N1-1001',
            'ContactNumber':'2154254154'            
        }]
        this.setState({PropertyDetailsData:data});
    }
    onPagechange = (page) => {
            
    }
    ongridedit=(Id) => {
        this.props.Action('Edit', this.findItem(Id));
    }

    ongridview=(Id)=> {
        this.props.Action('View', this.findItem(Id));
    }

 

    OnAddNewProperty=()=> {
        this.props.Action('Add');        
    }

    render() {
        return (
            <div className="row">
            <div className="col-12">
                <div className="card">
                    <div className="card-header d-flex p-0">
                        {/* <h3 className="card-title p-2 mt-1 pl-4 d-none d-sm-block">Filter:</h3> */}
                        <ul className="nav ml-auto tableFilterContainer">
                            {/* <li className="nav-item dropdown">
                                
                                <button className="btn btn-primary btn-sm dropdown-toggle" data-toggle="dropdown">
                                    Export Data <span className="caret"></span>
                                </button>
                                <div className="dropdown-menu">
                                    <a className="dropdown-item" tabindex="-1" href="#"> PDF </a>
                                    <a className="dropdown-item" tabindex="-1" href="#"> Excell </a>
                                </div>
                            </li> */}
                          
                            
                            <li className="nav-item">
                                <div className="input-group input-group-sm">
                                <li className="nav-item">
                                    <div className="input-group input-group-sm">
                                    <div className="input-group-prepend">
                                    <Label Value="Filter"></Label>
                                    </div></div>
                                    </li>
                                    <li className="nav-item">
                                    <div className="input-group input-group-sm">
                                    <div className="input-group-prepend">
                                    <DropDownList 
                                    Id="ddlFilter"
                                    Options={this.state.FilterData} />
                                    {/* <select className="form-control-sm btn-primary pr-0">
                                    <option>Filter:</option>
                                    <option>Department name</option>
                                    <option>Closed</option>
                                    <option>Inprogress</option>
                                    </select> */}
                                    </div></div>
                                    </li>
                                     
                                </div>
                            </li>
                            <li className="nav-item">
                            <div className="input-group input-group-sm">
                                    <div className="input-group-prepend">
                                <Button id="btnNewComplain"
                                    Action={this.OnAddNewProperty.bind(this)}
                                    ClassName="btn btn-success btn-sm"
                                    Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                    Text=" Create New" />
                                    </div>
                                    </div>
                            </li>
                        </ul>
                    </div>
                    <div className="card-body pt-2">
                        <DataGrid
                            Id="grdPropertyDetails"
                            IsPagination={true}
                            ColumnCollection={this.state.gridHeader}
                            totalpages={this.state.grdTotalPages}
                            totalrows={this.state.grdTotalRows}
                            Onpageindexchanged={this.onPagechange.bind(this)}
                            onEditMethod={this.ongridedit.bind(this)}
                            onGridViewMethod={this.ongridview.bind(this)}
                            GridData={this.state.PropertyDetailsData} />
                    </div>
                </div>
            </div>
        </div>
        );
    }
}

export default PropertyDetails;