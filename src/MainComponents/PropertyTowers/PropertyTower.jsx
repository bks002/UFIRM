import React from 'react'
import DataGrid from '../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../ReactComponents/Button/Button';
import ApiProvider from './DataProvider.js';
import InputBox from '../../ReactComponents/InputBox/InputBox.jsx';
import { ToastContainer, toast } from 'react-toastify';
import * as appCommon from '../../Common/AppCommon.js';
import { DELETE_CONFIRMATION_MSG } from '../../Contants/Common';
import swal from 'sweetalert';
import  {CreateValidator,ValidateControls} from './Validation.js';
import DropDownList from '../../ReactComponents/SelectBox/DropdownList'
import CommonDataProvider from '../../Common/DataProvider/CommonDataProvider.js';
const $ = window.$;
class PropertyDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            PropertyListData:[],
            GridData:[],
            gridHeader: [
                { sTitle: 'Id', titleValue: 'propertyTowerId', "orderable": false },
                { sTitle: 'Property Name', titleValue: 'propertyName',  },
                { sTitle: 'Tower name', titleValue: 'towername',  },
                { sTitle: 'Foors', titleValue: 'totalFoors',  },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],

            PageMode:'Home',
            PropertyTowerId:'0',
            Towername:'',
            PropertyId:'0',
            TotalFoors:'',
         };
         this.ApiProviderr = new ApiProvider();
         this.comdbprovider = new CommonDataProvider();                
    }

    loadProperty()
    {
        this.comdbprovider.getPropertyMaster(0).then(
            resp => {          
                if (resp.ok && resp.status == 200) {
                    return resp.json().then(rData => {
                        
                        rData = appCommon.changejsoncolumnname(rData,"id","Value");
                        rData = appCommon.changejsoncolumnname(rData,"text","Name");
                        this.setState({PropertyListData:rData},()=>{
                            
                        });
                    });
                }
                
            });
    }

    getModel=(type)=>{
        var mode = [{
            "propertyTowerId": this.state.PropertyTowerId,
            "towername": this.state.Towername,
            "propertyId": this.state.PropertyId,
            "totalFoors": this.state.TotalFoors,
            "cmdType": ""+type+""
          }]
        return mode;
    }

    componentDidMount(){
        this.loadHomagePageData();
        
    }
    loadHomagePageData() {
        
        var model = this.getModel('R');
        this.ApiProviderr.managePropertyTowers(model).then(
             resp => {          
                 if (resp.ok && resp.status == 200) {
                     return resp.json().then(rData => {
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
                        this.setState({PropertyTowerId:  Id.toString()},()=>{
                            var type = 'D'
                            var model = this.getModel(type);
                            this.mangaeSave(model,type);
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
            this.loadProperty();
        var rowData = this.findItem(Id)
        this.setState({PropertyTowerId:rowData.propertyTowerId});
        this.setState({Towername:rowData.towername});
        this.setState({PropertyId:rowData.propertyId});
        this.setState({TotalFoors:rowData.totalFoors});
        $('#ddlPropertyList').val(Id);
        });
       
    }
    

    Addnew=()=> {
        this.setState({PageMode:'Add'},()=>{
            CreateValidator();
            this.loadProperty();
        });
    }
    
    findItem(id) {
        
        return this.state.GridData.find((item) => {
            if (item.propertyTowerId == id) {
                return item;
            }
        });
    }
updatetextmodel = (ctrl,val) => {
    if(ctrl=='floor')
    {
        this.setState({TotalFoors:val});
    }
    else if(ctrl=='tower')
    {
        this.setState({Towername:val});
    }
     
}
handleSave = () => {
    
    if(ValidateControls()){
        var type = 'C'
        if(this.state.PageMode=='Edit')
        type='U'
        var model = this.getModel(type);
        this.mangaeSave(model,type);    
    }
}
mangaeSave=(model,type)=>{
    
    this.ApiProviderr.managePropertyTowers(model).then(
        resp => {          
            if (resp.ok && resp.status == 200) {
                return resp.json().then(rData => {
                    
                    if(type!='D')
                       appCommon.showtextalert("Tower Saved Successfully!", "", "success");
                       else
                       appCommon.showtextalert("Tower Deleted Successfully!", "", "success");
                   this.handleCancel();
                });
            }
            
        });
}
handleCancel = () => {
    this.setState({ PropertyId:'0',Towername:'',TotalFoors:'0',PropertyTowerId:'0'},()=>{
        this.setState({PageMode:'Home'});
        this.loadHomagePageData();
    });
};
onPropertyChanged=(value)=>{
        this.setState({PropertyId:value});
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
                            Id="grdTowers"
                            IsPagination={false}
                            ColumnCollection={this.state.gridHeader}
                            Onpageindexchanged={this.onPagechange.bind(this)}
                            onEditMethod={this.ongridedit.bind(this)}
                            onGridDeleteMethod ={this.onGridDelete.bind(this)}
                            DefaultPagination={false}
                            IsSarching="true"
                            GridData={this.state.GridData} 
                            pageSize="2000"/>
                    </div>
                </div>
            </div>
        </div>
    }
    {(this.state.PageMode=='Add' || this.state.PageMode=='Edit') &&
      <div>
      <div>
          <div class="modal-content">
          <div class="modal-body">
                  <div class="row">
                      <div class="col-sm-6">
                          <div class="form-group">
                              <label for="ddlPropertyList">Property</label>
                              <DropDownList Id="ddlPropertyList"
                              onSelected={this.onPropertyChanged.bind(this)}
                          Options={this.state.PropertyListData} />
                          </div>
                      </div>
                      <div class="col-sm-6">
                          <div class="form-group">
                          <label for="txtLandMark">Tower Name</label>
                            <InputBox Id="txtTowerName"
                                  Value={this.state.Towername}
                                      onChange={this.updatetextmodel.bind(this,"tower")}
                                      PlaceHolder="Tower Name"
                                      Class="form-control form-control-sm"
                                  />
                          </div>
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-sm-6">
                          <div class="form-group">
                              <label for="txtPinNumber">Total Floors</label>
                                  <InputBox Id="txtfloors"
                                  Value={this.state.TotalFoors}
                                      onChange={this.updatetextmodel.bind(this,"floor")}
                                      PlaceHolder="Floors"
                                      Class="form-control form-control-sm"
                                  />                                  
                          </div>
                      </div>
                      <div class="col-sm-6">
                          <div class="form-group">
                              {/* <label for="txtAddress">Contact number</label>
                              <InputBox Id="txtContactNumber"
                              Value={this.state.ContactNumber}
                                      onChange={this.updatetextmodel.bind(this,"contact")}
                                      PlaceHolder="Contact"
                                      Class="form-control form-control-sm"
                                  /> */}
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
export default PropertyDetails;