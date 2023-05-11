import React from 'react'
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from '../PropertyMaster/DataProvider.js';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import { ToastContainer, toast } from 'react-toastify';
import * as appCommon from '../../Common/AppCommon.js';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import swal from 'sweetalert';
import  {CreateValidator,ValidateControls} from '../PropertyMaster/Validation.js';
import DropDownList from '../../ReactComponents/SelectBox/DropdownList'
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
const $ = window.$;
class PropertyMaster extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            CityData:[],
            GridData:[],
            gridHeader: [
                { sTitle: 'Id', titleValue: 'id', "orderable": false },
                { sTitle: 'property Name', titleValue: 'name',  },
                { sTitle: 'Type', titleValue: 'propertyType',  },
                { sTitle: 'Number', titleValue: 'contactNumber',  },
                { sTitle: 'City', titleValue: 'cityName',  },
                { sTitle: 'pin', titleValue: 'pinCode',  },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],
            PageMode:'Home',
            PropertyId:'0',
            PropertTypeyId:'5',
            Name:'',
            Address:'',
            ContactNumber:'',
            CityId:'0',
            LandMark:'',
            PinCode:''

         };
         this.ApiProviderr = new ApiProvider();
         this.comdbprovider = new CommonDataProvider();
         
        
    }
    loadCity=()=>
    {
        this.comdbprovider.getCityMaster(0).then(
            resp => {          
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        rData = appCommon.changejsoncolumnname(rData,"cityId","Value");
                        rData = appCommon.changejsoncolumnname(rData,"cityName","Name");
                        this.setState({CityData:rData});
                    });
                }
                
            });
    }
    getModel=(type)=>{
        var mode = [{
            "propertyId": this.state.PropertyId,
            "properertyTypeId": this.state.PropertTypeyId,
            "name": this.state.Name,
            "address": this.state.Address,
            "contactNumber": this.state.ContactNumber,
            "cityId": this.state.CityId,
            "landMark": this.state.LandMark,
            "pinCode": this.state.PinCode,
            "cmdType": ""+type+""
          }]
        return mode;
    }

    componentDidMount(){
        this.loadCity();
        this.getPropertyMaster();
        
    }
    getPropertyMaster() {
        
        var model = this.getModel('R');
        this.ApiProviderr.managePropertyMaster(model).then(
             resp => {          
                 if (resp.ok && resp.status == 200) {
                     return resp.json().then(rData => {
                        rData.map((item,index)=>{
                            item['id']=index+1;
                        })
                         this.setState({GridData:rData});
                     });
                 
                 }
             });
     }

    onPagechange = (page) => {
            
    }
    onGridDelete=(Id)=>{
        let myhtml = document.createElement("div");
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
                        this.setState({PropertyId:  Id.toString()},()=>{
                            var type = 'D'
                            var model = this.getModel(type);
                            this.managePropertyMaster(model,type);
                        });
                        break;
                    case "cancel":
                        break;
                    default:
                        break;
                }
            })
        );
      
    }
    ongridedit=(Id) => {
        
        this.setState({PageMode:'Edit'},()=>{
            CreateValidator();
            
            var rowData = this.findItem(Id)
            this.setState({PropertyId:rowData.propertyId.toString()});
            //this.setState({PropertTypeyId:rowData.propertTypeyId});
            this.setState({Name:rowData.name});
            this.setState({Address:rowData.address});
            this.setState({ContactNumber:rowData.contactNumber});
            this.setState({CityId:rowData.cityId.toString()});
            this.setState({LandMark:rowData.landMark});
            this.setState({PinCode:rowData.pinCode});
            $('#ddlCity').val(rowData.cityId);
        });
      
    }
    

 

    Addnew=()=> {
        this.setState({PageMode:'Add'},()=>{
            CreateValidator();
            this.loadCity();
        });
    }
    
    findItem(id) {
        
        return this.state.GridData.find((item) => {
            if (item.propertyId == id) {
                return item;
            }
        });
    }
updatetextmodel = (ctrl,val) => {
    if(ctrl=='name')
    {
        this.setState({Name:val});
    }
    else if(ctrl=='address')
    {
        this.setState({Address:val});
    }
    else if(ctrl=='landmark')
    {
        this.setState({LandMark:val});
    }
    else if(ctrl=='pin')
    {
        this.setState({PinCode:val});
    }
    else if(ctrl=='contact')
    {
        this.setState({ContactNumber:val});
    }
}
handleSave = () => {
    
    if(ValidateControls()){
        var type = 'C'
        if(this.state.PageMode=='Edit')
        type='U'
        var model = this.getModel(type);
        this.managePropertyMaster(model,type);    
    }
}
managePropertyMaster=(model,type)=>{
    
    this.ApiProviderr.managePropertyMaster(model).then(
        resp => {          
            if (resp.ok && resp.status == 200) {
                return resp.json().then(rData => {
                    
                    if(type!='D')
                       appCommon.showtextalert("Property Saved Successfully!", "", "success");
                       else
                       appCommon.showtextalert("Property Deleted Successfully!", "", "success");
                   this.handleCancel();
                });
            }
            
        });
}
handleCancel = () => {
    this.setState({ PropertyId:'0',Name:'',Address:'',ContactNumber:'',CityId:'0',LandMark:'',PinCode:''},()=>{
        this.setState({PageMode:'Home'});
        this.getPropertyMaster();
    });
};

oncityChange=(value)=>{
        this.setState({CityId:value});
}

//End
    render() {
        return (
            <div>
            {this.state.PageMode=='Home' &&
            <div className="row">
            <div className="col-12">
                <div className="card">
                    <div className="card-header d-flex p-0">
                        <ul className="nav ml-auto tableFilterContainer">
                           
                            <li className="nav-item">
                            <div className="input-group input-group-sm">
                                    <div className="input-group-prepend">
                                <Button id="btnNewComplain"
                                    Action={this.Addnew.bind(this)}
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
                            Id="grdPrakingZone"
                            IsPagination={false}
                            ColumnCollection={this.state.gridHeader}
                            // totalpages={this.state.grdTotalPages}
                            // totalrows={this.state.grdTotalRows}
                            Onpageindexchanged={this.onPagechange.bind(this)}
                            onEditMethod={this.ongridedit.bind(this)}
                            onGridDeleteMethod ={this.onGridDelete.bind(this)}
                            DefaultPagination={false}
                            IsSarching="true"
                            GridData={this.state.GridData} 
                            pageSize="500"/>
                    </div>
                </div>
            </div>
        </div>
    }
    {(this.state.PageMode=='Add' || this.state.PageMode=='Edit') &&
      <div>
      <div >
          <div class="modal-content">
          <div class="modal-body">
                  <div class="row">
                      <div class="col-sm-6">
                          <div class="form-group">
                              <label for="txtDepartmentName">Property Name</label>
                                  <InputBox Id="txtPropertyName"
                                  Value={this.state.Name}
                                      onChange={this.updatetextmodel.bind(this,"name")}
                                      PlaceHolder="Property Name"
                                      Class="form-control form-control-sm"
                                  />
                          </div>
                      </div>
                      <div class="col-sm-6">
                          <div class="form-group">
                              <label for="txtAddress">Address</label>
                              <InputBox Id="txtAddress"
                              Value={this.state.Address}
                                      onChange={this.updatetextmodel.bind(this,"address")}
                                      PlaceHolder="Address"
                                      Class="form-control form-control-sm"
                                  />
                          </div>
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-sm-6">
                          <div class="form-group">
                              <label for="txtLandMark">Land Mark</label>
                                  <InputBox Id="txtLandMark"
                                  Value={this.state.LandMark}
                                      onChange={this.updatetextmodel.bind(this,"landmark")}
                                      PlaceHolder="Landmark"
                                      Class="form-control form-control-sm"
                                  />
                          </div>
                      </div>
                      <div class="col-sm-6">
                          <div class="form-group">
                              <label for="ddlCity">City</label>
                              <DropDownList Id="ddlCity"
                              onSelected={this.oncityChange.bind(this)}
                          Options={this.state.CityData} />
                          </div>
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-sm-6">
                          <div class="form-group">
                              <label for="txtPinNumber">Pin number</label>
                                  <InputBox Id="txtPinNumber"
                                  Value={this.state.PinCode}
                                      onChange={this.updatetextmodel.bind(this,"pin")}
                                      PlaceHolder="Pin"
                                      Class="form-control form-control-sm"
                                  />                                  
                          </div>
                      </div>
                      <div class="col-sm-6">
                          <div class="form-group">
                              <label for="txtAddress">Contact number</label>
                              <InputBox Id="txtContactNumber"
                              Value={this.state.ContactNumber}
                                      onChange={this.updatetextmodel.bind(this,"contact")}
                                      PlaceHolder="Contact"
                                      Class="form-control form-control-sm"
                                  />
                          </div>
                      </div>
                  </div>
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
    }
    </div>        
        );
    }
}
export default PropertyMaster;