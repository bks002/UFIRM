import React from 'react'
import Button from '../../ReactComponents/Button/Button.jsx';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import TextAria from '../../ReactComponents/TextAreaBox/TextAreaBox.jsx';
import { ToastContainer, toast } from 'react-toastify';
import DropDownList from '../../ReactComponents/SelectBox/DropdownList'
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import swal from 'sweetalert';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
class PropertyNew extends React.Component {
    constructor(props) {
        super(props);
        this.state = {  
            CityData:[{Name:'Delhi', Value:'1'},
            {Name:'Pune', Value:'2'}],
            PropertyTowersData:[],
            gridHeader: [
                { sTitle: 'BlockName', titleValue: 'BlockName', "orderable": false },
                { sTitle: 'TotalFloors', titleValue: 'TotalFloors', "orderable": true },
                { sTitle: 'Action', titleValue: 'Action', Action: "ALL", Index: '0', "orderable": false }
            ],
            grdTotalRows: 0,
            grdTotalPages: 0,

        };
    }
    componentDidMount(){
        var tempData=[{BlockName:'Tower N1',TotalFloors:10},
        {BlockName:'Tower N2',TotalFloors:10},
        {BlockName:'Tower N3',TotalFloors:10}];
        this.setState({PropertyTowersData:tempData});

    }
    handleCancel = () => {
        this.props.Action("Home");
    };

    updateDepartment = () => {

    }
    
    onUpdateProperty=()=>{

    }
    handleSave = () => {
       
        }
        onPagechange = (page) => {
            
    
        }
        ongridedit(departmentId) {
          //  this.props.Action('Edit', this.findItem(departmentId));
        }
        ongridview(departmentId) {
            //alert('grid view');
          //  this.props.Action('View', this.findItem(departmentId));
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
                            alert('deleted...');
                           // promiseWrapper(this.props.actions.deleteDepartment, { departmentId: departmentId }).then((data) => {
                                //appCommon.ShownotifySuccess("Department Deleted Successfully!");
                              //  this.loadDepartment();
                              //  appCommon.showtextalert("Department Deleted Successfully", "", "success");
    
                           // });
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
            <div>
            <div >
            
                <div class="modal-content">
                <div class="modal-body">
                    <div class="row"><div class="col-12"><div class="card card-info"><div class="card-header">
                        <h3 class="card-title ">Property Details</h3></div>
                     
                                        <div class="card-body pt-2">
                                        <div class="modal-body">
                        <div class="row">
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label for="txtDepartmentName">Property Name</label>
                                        <InputBox Id="Propertyname"
                                            onChange={this.updateDepartment.bind(this)}
                                            PlaceHolder="PropertyName"
                                            Class="form-control form-control-sm"
                                        />
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label for="txtAddress">Address</label>
                                    <InputBox Id="txtAddress"
                                            onChange={this.updateDepartment.bind(this)}
                                            PlaceHolder="PropertyName"
                                            Class="form-control form-control-sm"
                                        />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label for="txtDepartmentName">Land Mark</label>
                                        <InputBox Id="txtLandMark"
                                            onChange={this.updateDepartment.bind(this)}
                                            PlaceHolder="PropertyName"
                                            Class="form-control form-control-sm"
                                        />
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label for="ddlCity">City</label>
                                    <DropDownList Id="ddlCity"
                                Options={this.state.CityData} />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label for="txtDepartmentName">Pin number</label>
                                        <InputBox Id="Propertyname"
                                            onChange={this.updateDepartment.bind(this)}
                                            PlaceHolder="PropertyName"
                                            Class="form-control form-control-sm"
                                        />                                  
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label for="txtAddress">Contact number</label>
                                    <InputBox Id="txtAddress"
                                            onChange={this.updateDepartment.bind(this)}
                                            PlaceHolder="PropertyName"
                                            Class="form-control form-control-sm"
                                        />
                                </div>
                            </div>
                        </div>
                    </div>
                                        </div></div></div></div></div>
                    
                 
                                <div class="modal-body">
                      
                                <div className="row">
            <div className="col-12">
                <div className="card card-warning">
                <div className="card-header">
                                    <h3 className="card-title">Property Towers Details</h3>
                                </div>
                    <div className=" d-flex p-0">
                        <ul className="nav ml-auto tableFilterContainer">
                        <li className="nav-item">
                        <label for="txtAddress">Block/Tower Name</label>
                            </li>
                            <li className="nav-item">
                            <InputBox Id="txtBlockName"
                                            onChange={this.updateDepartment.bind(this)}
                                            PlaceHolder="Block name"
                                            Class="form-control form-control-sm"
                                        />
                            </li>
                            <li className="nav-item">
                        <label for="txtAddress">Total Floors</label>
                            </li>
                            <li className="nav-item">
                            <InputBox Id="txtTotalFloors"
                                            onChange={this.updateDepartment.bind(this)}
                                            PlaceHolder="No. Of Floors"
                                            Class="form-control form-control-sm"
                                        />
                            </li>
                            <li className="nav-item">
                            
                                    <div className="input-group-prepend">
                                <Button id="btnNewComplain"
                                    // Action={this.OnAddNewProperty.bind(this)}
                                    ClassName="btn btn-success btn-sm"
                                    // Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                    Text=" Save Block" />
                                    </div>
                                    
                            </li>
                        </ul>
                    </div>
                    <div className="card-body pt-2">
                        <DataGrid
                            Id="grdProperty"
                            IsPagination={true}
                            ColumnCollection={this.state.gridHeader}
                            totalpages={this.state.grdTotalPages}
                            totalrows={this.state.grdTotalRows}
                            Onpageindexchanged={this.onPagechange.bind(this)}
                            onEditMethod={this.ongridedit.bind(this)}
                            // onGridViewMethod={this.ongridview.bind(this)}
                            GridData={this.state.PropertyTowersData} />
                    </div>
                </div>
            </div>
        </div>

                    </div>

                    <div className="card-header">
                    </div>
                    <div class="modal-footer">
                        <Button
                            Id="btnSave"
                            Text="Save"
                            Action={this.handleSave}
                            ClassName="btn btn-primary" />
                        <Button
                            Id="btnCancel"
                            Text="Cancel"
                            Action={this.handleCancel}
                            ClassName="btn btn-secondary" />
                    </div>
                </div>
            
            </div>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <ToastContainer />
        </div>
         
        );
    }
}

export default PropertyNew;