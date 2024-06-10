import React from 'react'
import HomeContainer from '../../AppContainers/home/homecontainer.jsx';
//import HomeContainer from '../../containers/home/homecontainer.jsx';
import Button from '../../ReactComponents/Button/Button.jsx';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
//import '../../Scripts/plugins/bootstrap-multiselect.js';
import '../../Style/bootstrap-multiselect.css';
import swal from 'sweetalert';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import * as appCommon from '../../Common/AppCommon';
import { Typeahead } from 'react-bootstrap-typeahead';


// import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';


//import { PropTypes } from 'prop-types';
import departmentActions from '../../redux/department/action';
import { connect } from 'react-redux';
import { promiseWrapper } from '../../utility/common';
import { bindActionCreators } from 'redux';
const $ = window.$;


class DepartmentHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customerData: [{ SearchColumn: '123', Name: 'Medline' }, { SearchColumn: '1234', Name: 'Medline-2' }],
            pageSize: 10,
            pageNumber: 1,
            gridHeader: [
                { sTitle: 'Id', titleValue: 'departmentId', "orderable": false },
                { sTitle: 'Name', titleValue: 'departmentName', "orderable": true },
                { sTitle: 'Description', titleValue: 'description' },
                { sTitle: 'Action', titleValue: 'Action', Action: "ALL", Index: '0', "orderable": false }
            ],

            grdTotalRows: 0,
            grdTotalPages: 0,
            gridData: [],
            pagemode: 'new',
            searchValue: null

        }
    }

    loadDepartmentTypeAhead = (searchtext) => {
        // if (searchtext == '' || searchtext == null || searchtext == undefined) {
        //     searchtext = 'a';
        // }
        promiseWrapper(this.props.actions.fetchDepartment, { SearchValue: searchtext, PageSize: 10, PageNumber: 1 }).then((data) => {
            this.setState({ customerData: data.departmentModel, });
        });


    }

    ClearTyeahead = (type, event) => {
        if (type === 'C') {
            var option = this.thaCustomer.props.options;
            if (!option.includes(event.target.value)) {
                // 
                // this.thaCustomer.getInstance().setState({ text: '' });
            }

        }
    }


    onCustomerList = (arg) => {
        // let searchVal;
        if (arg === '' || arg === null) {
            this.setState({ searchValue: null }, () => {
                this.loadDepartment();
                this.loadDepartmentTypeAhead(null);
            });
        }
        else {
            this.setState({ searchValue: arg.trim() }, () => {
                this.loadDepartment();
                this.loadDepartmentTypeAhead(arg.trim());
            });
        }

    }

    onDiscountSearch = (SearchText) => {
        if (SearchText.length > 0) {
            this.setState({ searchValue: SearchText[0].departmentName }, () => {
                this.loadDepartmentTypeAhead(SearchText[0].departmentName);
                this.loadDepartment();
            });
           
        }
        else {
            this.setState({ searchValue: null }, () => {
                this.loadDepartmentTypeAhead(null);
                this.loadDepartment();
            });
            
        }
     
    }

    onPagechange = (page) => {
        this.setState({ pageNumber: page }, () => {
            this.loadDepartment();
        })

    }


    loadDepartment = () => {
        //
        promiseWrapper(this.props.actions.fetchDepartment, { SearchValue: this.state.searchValue, PageSize: this.state.pageSize, PageNumber: this.state.pageNumber }).then((data) => {
            this.setState({ grdTotalPages: data.totalPages });
            this.setState({ grdTotalRows: data.totalRows });
            this.setState({ gridData: data.departmentModel, });
        });

    }
    componentDidMount() {
        this.loadDepartment();
        this.loadDepartmentTypeAhead(null);
        this.createFilterDropDown();
    }

    createFilterDropDown() {
        let object = this;
        $('#rebateFillterlist').multiselect(
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
    onaddnewdepartment() {
        //this.setState({pagemode:'new'})
        this.props.Action('Add');
        //this.props.actions.passData("medline");
    }
    findItem(departmentId) {
        return this.state.gridData.find((item) => item.departmentId === departmentId);
    }
    

    ongridedit(departmentId) {
        this.props.Action('Edit', this.findItem(departmentId));
    }
    ongridview(departmentId) {
        //alert('grid view');
        this.props.Action('View', this.findItem(departmentId));
    }
    ongriddelete(departmentId) {
        //appCommon.ShownotifySuccess("Department Deleted Successfully!");
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
                        promiseWrapper(this.props.actions.deleteDepartment, { departmentId: departmentId }).then((data) => {
                            //appCommon.ShownotifySuccess("Department Deleted Successfully!");
                            this.loadDepartment();
                            appCommon.showtextalert("Department Deleted Successfully", "", "success");

                        });
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
                                        {/* <input type="text" 
                            className="form-control float-right singleCalendar"></input> */}
                                        {/* <CalendarJs /> */}
                                        {/* <div className="input-group-append">
                                <span className="input-group-text">
                                    <i className="far fa-calendar-alt"></i>
                                </span>
                            </div> */}
                                    </div>
                                </li>
                                <li className="nav-item">
                                    <select className="form-control-sm btn-primary pr-0">
                                        <option>Filter:</option>
                                        <option>Department name</option>
                                        {/* <option>Closed</option>
                                        <option>Inprogress</option> */}
                                    </select>
                                </li>
                                <li className="nav-item">
                                    <div className="input-group input-group-sm">
                                        <div className="input-group-prepend">
                                            {/* <select className="form-control-sm pr-0 input-group-text"
                                                data-placeholder="Filter List Item"
                                                id="rebateFillterlist"
                                                defaultValue={['Active', 'Future']}
                                                multiple="multiple"  >
                                                <option value="Active">Active</option>
                                                <option value="Future">Future</option>
                                                <option value="Deactivated">Deactivated</option>
                                                <option value="Expired">Expired</option>
                                            </select> */}

                                            {/* <select className="form-control-sm pr-0 input-group-text">
                                    <option>Search By</option>
                                    <option>Ticket No.</option>
                                    <option>Assigned</option>
                                </select> */}
                                        </div>
                                        <Typeahead
                                            id="typeGridFilter"
                                            ref={(typeahead) =>
                                                this.thaCustomer = typeahead}
                                            labelKey="departmentName"
                                            onChange={this.onDiscountSearch}
                                            onInputChange={this.onCustomerList}
                                            options={this.state.customerData}
                                            placeholder='Type Department Name'
                                            onBlur={this.ClearTyeahead.bind(this, 'C')}
                                        />
                                        {/* <input type="text"
                                            className="form-control"
                                            aria-label="Small"
                                            aria-describedby="inputGroup-sizing-sm"
                                            placeholder="#Search text"></input> */}
                                    </div>
                                </li>
                                <li className="nav-item">
                                    <Button id="btnNewDepartment"
                                        DataToggle="modal"
                                        DataTarget={this.props.AddNewId}
                                        Action={this.onaddnewdepartment.bind(this)}
                                        ClassName="btn btn-success btn-sm"
                                        Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                        Text=" ADD NEW" />

                                </li>
                            </ul>
                        </div>
                        <div className="card-body pt-2">
                            <DataGrid
                                Id="grdDepartment"
                                IsPagination={true}
                                ColumnCollection={this.state.gridHeader}
                                totalpages={this.state.grdTotalPages}
                                totalrows={this.state.grdTotalRows}
                                Onpageindexchanged={this.onPagechange.bind(this)}
                                onEditMethod={this.ongridedit.bind(this)}
                                onGridViewMethod={this.ongridview.bind(this)}
                                onGridDeleteMethod={this.ongriddelete.bind(this)}
                                GridData={this.state.gridData} />

                        </div>

                    </div>
                </div>
            </div>

        )
    }
}
// function mapStoreToprops(state, props) {
//     
//     return {
//         userName: state.ForeCast.UsreName,
//         age: state.ForeCast.age,
//         data: JSON.stringify(state.ForeCast.data),
//     }

// }

// function mapDispatchToProps(dispatch) {
//     
//     const value1 = 'medline';
//     // const actions = bindActionCreators(foreCastActions, dispatch);
//     // return {
//     //   actions,

//     // };


//     // const value='new name';
//     // const actions = bindActionCreators(foreCastActions, dispatch);
//     // return {
//     //   foreCastActions,

//     //   value,
//     // };
//     const actions = bindActionCreators(foreCastActions, dispatch);
//     return { actions };
// }
function mapStoreToprops(state, props) {
    return {

        // userName: state.Catalog.usreName,
        // structureList: state.Catalog.structureData,
        // languageCode: state.Catalog.languageCode,
        // structureData: state.Catalog.currentStructure,
        // categoryList: state.Catalog.navigationData,
        // globalSearch: state.Catalog.globalSearch
    }

}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators(departmentActions, dispatch);
    return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(DepartmentHome);