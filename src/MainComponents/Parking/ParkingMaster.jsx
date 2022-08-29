import React from 'react'
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button.jsx';
import DropDownList from '../../ReactComponents/SelectBox/DropdownList';
import Label from '../../ReactComponents/Label/Label'
class ParkingMaster extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            GridData:[],
            gridHeader: [
                { sTitle: 'ParkingNameId', titleValue: 'ParkingNameId', "orderable": false },
                { sTitle: 'ParkingArea', titleValue: 'ParkingArea',  },
                { sTitle: 'ParkingName', titleValue: 'ParkingName'},
                { sTitle: 'Action', titleValue: 'Action', Action: "ALL", Index: '0', "orderable": false }
               
            ],
            grdTotalRows: 1,
            grdTotalPages: 1,
            FilterData: [{ Name: 'Royal Nest Housing Society',Value:1},{Name: 'EON Society', Value:2 }],
            SearchValue:null,
            PageMode:'Home'
         };
    }
    componentDidMount(){
        const data = [{
            'ParkingNameId':'1',
            'ParkingArea':'Basement',
            'ParkingName':'B/N1001'
        },
        {
            'ParkingNameId':'1',
            'ParkingArea':'Basement',
            'ParkingName':'B/N1001'
        },
        {
            'ParkingNameId':'1',
            'ParkingArea':'Basement',
            'ParkingName':'B/N1001'
        },
        {
            'ParkingNameId':'1',
            'ParkingArea':'Basement',
            'ParkingName':'B/N1001'
        }]
        this.setState({GridData:data});
    }
    onPagechange = (page) => {
            
    }
    ongridedit=(Id) => {
        this.props.Action('Edit', this.findItem(Id));
    }

    ongridview=(Id)=> {
        this.props.Action('View', this.findItem(Id));
    }

 

    OnAddParking=()=> {
        this.props.Action('Add');        
    }

    render() {
        return (
            <div className="row">
            <div className="col-12">
                <div className="card">
                    <div className="card-header d-flex p-0">
                        <ul className="nav ml-auto tableFilterContainer">
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
                                    </div></div>
                                    </li>
                                     
                                </div>
                            </li>
                            <li className="nav-item">
                            <div className="input-group input-group-sm">
                                    <div className="input-group-prepend">
                                <Button id="btnNewComplain"
                                    Action={this.OnAddParking.bind(this)}
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
                            GridData={this.state.GridData} />
                    </div>
                </div>
            </div>
        </div>
        );
    }
}

export default ParkingMaster;