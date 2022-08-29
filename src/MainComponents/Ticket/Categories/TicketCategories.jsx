import React from 'react'
import DataGrid from '../../../ReactComponents/DataGrid/DataGrid.jsx';
import Button from '../../../ReactComponents/Button/Button';
import ApiProvider from './CategoryDataProvider.js';
import InputBox from '../../../ReactComponents/InputBox/InputBox.jsx';
import { ToastContainer, toast } from 'react-toastify';
import * as appCommon from '../../../Common/AppCommon.js';
import { DELETE_CONFIRMATION_MSG } from '../../../Contants/Common';
import swal from 'sweetalert';
import  {CreateValidator,ValidateControls} from './Validation.js';
import MultiSelectInline from '../../../ReactComponents/MultiSelectInline/MultiSelectInline.jsx';
import CommonDataProvider from '../../../Common/DataProvider/CommonDataProvider.js';
class TicketCategories extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            GridData:[],
            gridHeader: [
                { sTitle: 'categoryId', titleValue: 'categoryId', "orderable": false },
                { sTitle: 'categoryName', titleValue: 'categoryName',  },
                { sTitle: 'description', titleValue: 'description',  },
                { sTitle: 'jobCategory', titleValue: 'jobCategory',  },
                { sTitle: 'Action', titleValue: 'Action', Action: "Edit&Delete", Index: '0', "orderable": false },
            ],
            grdTotalRows: 1,
            grdTotalPages: 1,
            SearchValue:null,
            PageMode:'Home',
            Jobtype: [],
            JobTypeList: [],
            CategoryName:'',
                Description:'',
                CategoryId:0
         };
         this.ApiProviderr = new ApiProvider();
         this.comdbprovider = new CommonDataProvider();
    }
    
    getModel=(type)=>{
        var stafflist='';
        this.state.JobTypeList.forEach(item => {
            stafflist=stafflist+item.Id+',';
        });
        var mode =[{
            "ticketTypeId": this.state.CategoryId,
            "type": this.state.CategoryName!=null?this.state.CategoryName:'',
            "description": this.state.Description,
            "cmdType": ""+type+"",
            "Status":1,
            "StaffMappingList":stafflist
          }];
        return mode;
    }

    componentDidMount(){
        this.getTicketCategory();
        this.getStaff();
        
    }
    getTicketCategory() {
        
        var model = this.getModel('R');
        
        this.ApiProviderr.manageTicketCategory(model).then(
             resp => {          
                 if (resp.ok && resp.status == 200) {
                     return resp.json().then(rData => {
                         this.setState({GridData:rData});
                     });
                 }
                 else{             
                     this.setState({
                         DiscountProfileData: [], grdTotalRows: 0, grdTotalPages: 0
 
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
                        this.setState({CategoryId:Id},()=>{
                            var type = 'D'
                            var model = this.getModel(type);
                            this.mangeTicketCategory(model,type);
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
        });
        var rowData = this.findItem(Id)
        this.setState({CategoryId:rowData.categoryId});
        this.setState({CategoryName:rowData.categoryName});
        this.setState({Description:rowData.description});
        let selectedJobType = [];
        if(rowData.jobCategory!=''){
            rowData.jobCategory.split(',').forEach(item => {
                var startindex = item.indexOf('-');
                var id = item.substring(0,startindex);
                var value = item.substring(startindex+1,item.length-(startindex+1));
                selectedJobType.push({Id:parseInt(id), Name:value,value:value,label:value,color: '#0052CC'});
                //multiselectData.push({ Id: item.id, Name: item.text, value: item.text, label: item.text, color: '#0052CC' });
            });

          
            //let selectedJobType = ({Id:id,Name:value,lebel:value});
            this.onJobChanged(selectedJobType);
            //this.setState({ JobTypeList: selectedJobType });
        }
    }
    ongridview=(Id)=> {
        alert(Id);
        this.props.Action('View', this.findItem(Id));
    }

 

    Addnew=()=> {
        this.setState({PageMode:'Add'},()=>{
            CreateValidator();
        });
    }
    
    findItem(id) {
        
        return this.state.GridData.find((item) => {
            if (item.categoryId == id) {
                return item;
            }
        });
    }
UpdateCategory = (ctrl,val) => {
    if(ctrl=='name')
    {
        this.setState({CategoryName:val});
    }
    if(ctrl=='description')
    {
        this.setState({Description:val});
    }
}
handleSave = () => {
    
    if(ValidateControls()){
        if(this.state.JobTypeList.length>0){
        var type = 'C'
        if(this.state.PageMode=='Edit')
        type='U'
        var model = this.getModel(type);
        this.mangeTicketCategory(model,type);
        this.setState({JobTypeList:[]}); 
    }
    else{
        appCommon.ShownotifyError("Please select job type")
    }
    }
}
mangeTicketCategory=(model,type)=>{
    this.ApiProviderr.manageTicketCategory(model).then(
        resp => {          
            if (resp.ok && resp.status == 200) {
                return resp.json().then(rData => {
                    
                    if(type!='D')
                       appCommon.showtextalert("Category Saved Successfully!", "", "success");
                       else
                       appCommon.showtextalert("Category Deleted Successfully!", "", "success");
                   this.handleCancel();
                });
            }
            else{             
                this.setState({
                    DiscountProfileData: [], grdTotalRows: 0, grdTotalPages: 0

                });
            }
        });
}
handleCancel = () => {
    this.setState({ CategoryName:'',Description:'',CategoryId:0},()=>{
        this.setState({PageMode:'Home'});
        this.getTicketCategory();
    });
};
onJobChanged(value, event) {
    this.setState({ JobTypeList: value });
}

getStaff(){
    this.comdbprovider.getFacilityMaster(2).then(
        resp => {
            if (resp.ok && resp.status == 200) {
                return resp.json().then(rData => {
                    //rData = appCommon.changejsoncolumnname(rData, "id", "Value");
                   // rData = appCommon.changejsoncolumnname(rData, "text", "Name");
                    let multiselectData = [];
                        rData.forEach(item => {
                            multiselectData.push({ Id: item.id, Name: item.text.trim(), value: item.text.trim(), label: item.text.trim(), color: '#0052CC' });
                        });
                       
                        this.setState({ Jobtype: multiselectData });
                });
            }
        });
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
                            Id="grdCategories"
                            IsPagination={true}
                            ColumnCollection={this.state.gridHeader}
                            totalpages={this.state.grdTotalPages}
                            totalrows={this.state.grdTotalRows}
                            Onpageindexchanged={this.onPagechange.bind(this)}
                            onEditMethod={this.ongridedit.bind(this)}
                            onGridDeleteMethod ={this.onGridDelete.bind(this)}
                            //onGridViewMethod={this.ongridview.bind(this)}
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
         <div className="modal-content">
             <div className="modal-body">
                 <div className="row">
                     <div className="col-sm-6">
                        
                         <div className="form-group">

                             <label for="txtDepartmentName">Category Name</label>
                             <InputBox Id="txtCategoryName"
                             Value={this.state.CategoryName}
                                         onChange={this.UpdateCategory.bind(this,'name')}
                                         PlaceHolder="Category Name"
                                         className="form-control form-control-sm"
                                     />
                            
                         </div>
                     </div>
                     <div className="col-sm-6">
                         <div className="form-group">
                             <label for="ddlFacilityType">Job Type</label>
                             <MultiSelectInline
                                                    ID="ddljobType"
                                                    isMulti={true}
                                                    value={this.state.JobTypeList}
                                                    onChange={this.onJobChanged.bind(this)}
                                                    options={this.state.Jobtype}
                                                />

                         </div>
                     </div>
                 </div>
                 <div className="row">
                     <div className="col-sm-6">
                         <div className="form-group">
                             <label for="txtParkingZoneName">Description</label>
                             <InputBox Id="txtDescription"
                             Value={this.state.Description}
                                         onChange={this.UpdateCategory.bind(this,'description')}
                                         PlaceHolder="Description"
                                         className="form-control form-control-sm"
                                     />

                         </div>
                     </div>
                 </div>

             </div>
             <div className="modal-footer">
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
export default TicketCategories;