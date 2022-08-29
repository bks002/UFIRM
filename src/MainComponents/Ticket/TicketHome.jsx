import React from 'react'
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button.jsx';
import { Typeahead } from 'react-bootstrap-typeahead';
import DropDownList from '../../ReactComponents/SelectBox/DropdownList';
import CalendarJs from '../../ReactComponents/Calendar/Calendar';
const $ = window.$;
class TicketHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
                TicketData:[],
                gridHeader: [
                    { sTitle: 'TicketNumber', titleValue: 'TicketNumber', "orderable": false },
                    { sTitle: 'Owner', titleValue: 'Owner'},
                    { sTitle: 'Location', titleValue: 'Location'},
                    { sTitle: 'Priority', titleValue: 'Priority', "orderable": true },
                    { sTitle: 'Solution', titleValue: 'Solution', "orderable": true },
                    { sTitle: 'CreatedDate', titleValue: 'CreatedDate' },
                    { sTitle: 'DueDate', titleValue: 'DueDate', "orderable": true },
                    { sTitle: 'Status', titleValue: 'Status' }
                ],
    
                grdTotalRows: 1,
                grdTotalPages: 1,
                FilterData:[{Name:'Ticket Number', Value:1}, {Name:'Created By', Value:2}],
                TypeAheadData: [{ TicketNumber: 'RN-178265252', Name: 'RN-178265252' }],
                SearchValue:null
         };
    }
    componentDidMount(){
        $(document).ready(function() {
            var table = $('#grdTicket').DataTable();
             
            $('#grdTicket tbody').on('click', 'tr', function () {
                var data = table.row( this ).data();
                alert( 'You clicked on '+data[0]+'\'s row' );
            } );
        } );

        this.createFilterDropDown();

        // //$('#grdTicket tbody').on('dblclick', 'tr', function (obj) {
        //     $('#grdTicket tbody').on('click', 'tr', function () {
        //     
        //      var row = obj.currentTarget;
        //    // var data = table.row( this ).data();
        //     alert( 'You clicked on '+row.rowIndex +'\'s row' );
            
        //     } );
        const data = [{
            'TicketNumber':'#RN-178265252',
            'Location':'Tower-N5-0205',
            'Priority':'High',
            'Solution':'3d',
            'DueDate':'05/01/2021',
            'Status':'Assigned',
            'Owner':'Sanjay_Vishwakarma',
            'CreatedDate':'01/01/2021 | 05:30 PM',
            'AssignedTo':'Ravindra Vishwakarma'
        },
        {
            'TicketNumber':'#RN-178265252',
            'Location':'Tower-N5-0205',
            'Priority':'High',
            'Solution':'3d',
            'DueDate':'05/01/2021',
            'Status':'Assigned',
            'Owner':'Sanjay Vishwakarma',
            'CreatedDate':'01/01/2021 | 05:30 PM',
            'AssignedTo':'Ravindra Vishwakarma'
        },
        {
            'TicketNumber':'#RN-178265252',
            'Location':'Tower-N5-0205',
            'Priority':'High',
            'Solution':'3d',
            'DueDate':'05/01/2021',
            'Status':'Assigned',
            'Owner':'Sanjay Vishwakarma',
            'CreatedDate':'01/01/2021 | 05:30 PM',
            'AssignedTo':'Ravindra Vishwakarma'
        },
        {
            'TicketNumber':'#RN-178265252',
            'Location':'Tower-N5-0205',
            'Priority':'High',
            'Solution':'3d',
            'DueDate':'05/01/2021',
            'Status':'Assigned',
            'Owner':'Sanjay Vishwakarma',
            'CreatedDate':'01/01/2021 | 05:30 PM',
            'AssignedTo':'Ravindra Vishwakarma'
        },
        {
            'TicketNumber':'#RN-178265252',
            'Location':'Tower-N5-0205',
            'Priority':'High',
            'Solution':'3d',
            'DueDate':'05/01/2021',
            'Status':'Assigned',
            'Owner':'Sanjay Vishwakarma',
            'CreatedDate':'01/01/2021 | 05:30 PM',
            'AssignedTo':'Ravindra Vishwakarma'
        }]
        this.setState({TicketData:data});
        
    }
    onPagechange = (page) => {
            
    }

    ongridedit=(departmentId) => {
        this.props.Action('Edit', this.findItem(departmentId));
    }
    ongridview=(departmentId)=> {
        this.props.Action('View', this.findItem(departmentId));
    }
    ClearTyeahead = (type, event) => {
        if (type == 'C') {
            var option = this.thaCustomer.props.options;
            if (!option.includes(event.target.value)) {
            }

        }
    }
    OnAddnewComplain=()=> {
        //this.setState({pagemode:'new'})
        //this.props.Action('Add');
        //this.props.actions.passData("medline");
    }

    createFilterDropDown() {
        let object = this;
        $('#dataRange').daterangepicker({

        },
        function(start, end, label) {
            alert("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
          }
        );
        $('#ticketMutliSelect').multiselect(

            {
                onSelectAll: function () {
                    object.filterOnChange();
                },
                onDeselectAll: function () {
                    object.filterOnChange();
                },
                onChange: function (option, checked, select) {
                    object.filterOnChange();
                },

            }

        );
    }

    filterOnChange() {
        let object = this;
        let filterValues = '';
        $('.multiselect-container').each(function () {
            $(this).find('li').each(function () {
                if ($(this).hasClass("active")) {
                    if ($(this).find('input[type=checkbox]').val() == 'Open') {
                        filterValues += "Open,"
                    } else if ($(this).find('input[type=checkbox]').val() == 'In Progress') {
                        filterValues += "In Progress,"
                    } else if ($(this).find('input[type=checkbox]').val() == 'Re-Open') {
                        filterValues += "Re-Open,"
                    } else if ($(this).find('input[type=checkbox]').val() == 'On Hold') {
                        filterValues += "On Hold,"
                    } else if ($(this).find('input[type=checkbox]').val() == 'Resolved') {
                        filterValues += "Resolved,"
                    }else if ($(this).find('input[type=checkbox]').val() == 'Resolved') {
                        filterValues += "Resolved,"
                    } else if ($(this).find('input[type=checkbox]').val() == 'Close') {
                        filterValues += "Close,"
                    }
                }

            });
            alert(filterValues);
            // object.state.serviceInputs[0].FilterType = filterValues;
            // object.state.serviceInputs[0].PageNumber = 1;
            // object.getRebateAccDetails();
        });

    }

    onTicketSearch = (SearchText) => {
        
        // let param = this.state.FilterData;
        if (SearchText.length > 0) {
            this.setState({ SearchValue: SearchText[0].Name }, () => {
              //  this.loadDepartmentTypeAhead(SearchText[0].Name);
              //  this.loadDepartment();
            });
            // y=y.concat('(',SearchText[0].AccountCode,')',SearchText[0].Name)
            // this.setState({SearchKey:y})
        }
        else {
            this.setState({ SearchValue: null }, () => {
              //  this.loadDepartmentTypeAhead(null);
             //   this.loadDepartment();
            });
            //            this.setState({SearchKey:''})
        }
        // param[0].PageNumber = 1;

        // this.setState({ FilterData: param }, () => {
        //     this.getDiscountProfileHome();
        // });   
    }

    onTicketLoad = (arg) => {
        
        let searchVal;
        if (arg == '' || arg == null) {
            this.setState({ searchValue: null }, () => {
               // this.loadDepartment();
              //  this.loadDepartmentTypeAhead(null);
            });
        }
        else {
            this.setState({ searchValue: arg.trim() }, () => {
                //this.loadDepartment();
               // this.loadDepartmentTypeAhead(arg.trim());
            });
        }

    }
    ClearTyeahead = (type, event) => {
        
        if (type == 'C') {
            var option = this.thaCustomer.props.options;
            if (!option.includes(event.target.value)) {
              
            }

        }
    }
    onStartDateSelected(value) {
        let dtvalue = $(value.currentTarget).find('input')[0].value;
        //this.setState({ startDate: dtvalue });
        alert(dtvalue);
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
                                    <div className="form-group">
                                        <div className="input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">
                                                <i className="far fa-calendar-alt"></i>
                                            </span>
                                            </div>
                                            <input type="text" className="form-control float-right" id="dataRange"></input>
                                        </div>
                                    </div>
                                    </div>
                                </li>
                                
                                <li className="nav-item">
                                    <div className="input-group input-group-sm">
                                        <div className="input-group-prepend">
                                            <select className="form-control-sm pr-0 input-group-text"
                                                data-placeholder="Filter List Item"
                                                id="ticketMutliSelect"
                                                defaultValue={['Open', 'In Progress']}
                                                multiple="multiple"  >
                                                <option value="Open">Open</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Re-Open">Re-Open</option>
                                                <option value="On Hold">On Hold</option>
                                                <option value="Resolved">Resolved</option>
                                                <option value="Close">Close</option>
                                            </select>
                                            
                                        </div>
                                        
                                         
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
                                        <li className="nav-item">
                                        <div className="input-group input-group-sm">
                                        <div className="input-group-prepend">
                                        <Typeahead
                                            id="typeGridFilter"
                                            ref={(typeahead) =>
                                                this.thaCustomer = typeahead}
                                            labelKey="TicketNumber"
                                            onChange={this.onTicketSearch}
                                            onInputChange={this.onTicketLoad}
                                            options={this.state.TypeAheadData}
                                            placeholder='Type To Search'
                                            onBlur={this.ClearTyeahead.bind(this, 'C')}
                                        />
                                        
                                        </div>
                                        </div>
                                        </li>
                                    </div>
                                </li>
                                <li className="nav-item">
                                <div className="input-group input-group-sm">
                                        <div className="input-group-prepend">
                                    <Button id="btnNewComplain"
                                        Action={this.OnAddnewComplain.bind(this)}
                                        ClassName="btn btn-success btn-sm"
                                        Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                        Text=" Create Complain" />
                                        </div>
                                        </div>
                                </li>
                            </ul>
                        </div>
                        <div className="card-body pt-2">
                            <DataGrid
                                Id="grdTicket"
                                IsPagination={true}
                                ColumnCollection={this.state.gridHeader}
                                totalpages={this.state.grdTotalPages}
                                totalrows={this.state.grdTotalRows}
                                Onpageindexchanged={this.onPagechange.bind(this)}
                                onEditMethod={this.ongridedit.bind(this)}
                                onGridViewMethod={this.ongridview.bind(this)}
                                GridData={this.state.TicketData} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default TicketHome;