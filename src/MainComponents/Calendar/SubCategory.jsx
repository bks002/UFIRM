import React, { Component } from 'react'
import { ToastContainer } from 'react-toastify';
import Button from '../../ReactComponents/Button/Button';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid';
import InputBox from '../../ReactComponents/InputBox/InputBox';
import DropdownList from '../../ReactComponents/SelectBox/DropdownList';
import ApiProvider from './DataProvider';

export default class SubCategory extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      PageMode: 'Home',
      subCategoryData: [],
      gridData: [],
      gridHeader: [
        { sTitle: 'Id',titleValue:'Value' },
        { sTitle: 'Sub Category Name' , titleValue: 'Name' },
        { sTitle: 'Category Name' , titleValue: 'CategoryId' },
      
      ],
      subCategoryName: '',
      selectedCategoryId: '',
      subCategoryId: '',
    };

    this.ApiProvider = new ApiProvider();
  }

  AddNew = () => {
    this.setState({ PageMode: 'Add' });
  }

  handleSave = () => {
    var type = 'C';

    if (this.state.PageMode == 'Edit')
      type = 'U';
    var model = this.getModel(type);
  }

  handleCancel = () => {

  }

  getModel = (type) => {
    var model = [];
    switch(type) {
      case 'R':
        model.push({
          "CmdType": type
        });
        break;
      default:
    };
    return model;
  }

  manageSubCategory = (model, type,catId) => {
    this.ApiProvider.manageSubCategory(model, type,catId).then(
      resp => {
        if (resp.ok && resp.status == 200) {
          return resp.json().then(rData => {
            switch(type) {
              case 'R':
                let subCatData = rData.map(element => ({
                  Value: element.SubCategoryId,
                  Name: element.SubCategoryName,
                  CategoryId: element.CategoryId,
                }));
                this.setState({ subCategoryData: subCatData });
                break;
              default:
            }
          })
        }
      }
    )
  }

  getSubCategory() {
    var type = 'R';
    var model = this.getModel(type);
    var catId =0
    this.manageSubCategory(model, type,catId);
  }

  onCategoryChanged = value => this.setState({ selectedCategoryId: parseInt(value) });

  componentDidMount() {
    this.getSubCategory();
  }

  render() {
    return (
      <div>
        {this.state.PageMode == 'Home' && (
          <div className='row'>
            <div className='col-12'>
              <div className='card'>
                <div className='card-header d-flex p-0'>
                  <ul className="nav ml-auto tableFilterContainer">
                      <li className="nav-item">
                          <div className="input-group input-group-sm">
                              <div className="input-group-prepend">
                                  <Button id="btnaddCalendarCategory"
                                      Action={this.AddNew.bind(this)}
                                      ClassName="btn btn-success btn-sm"
                                      Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                      Text=" Create New" />
                              </div>
                          </div>
                      </li>
                  </ul>
                </div>
                <div className='card-body pt-2'>
                  <DataGrid
                    Id="grdSubCategory"
                    key={1}
                    IsPagination={false}
                    ColumnCollection={this.state.gridHeader}
                    GridData={this.state.subCategoryData}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {(this.state.PageMode == 'Add' || this.state.PageMode == 'Edit') && (
          <div>
            <div className='modal-content'>
              <div className='modal-body'>
                <div className='row'>
                  <div className='col-sm-6'>
                    <div className='form-group'>
                      <label htmlFor='ddlCategoryName'>Category Name</label>
                      <DropdownList
                        Id="ddlCategoryName"
                        Options={this.state.categoryData}
                        onSelected={this.onCategoryChanged.bind(this)}
                      />
                    </div>
                  </div>
                  <div className='col-sm-6'>
                    <div className='form-group'>
                      <label htmlFor='txtSubCategoryName'>Sub Category Name</label>
                      <InputBox
                        Id="txtSubCategoryName"
                        Value={this.state.subCategoryName}
                        PlaceHolder="Sub Category Name"
                        Class="form-control"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className='modal-footer'>
                <Button
                  Id="btnSave"
                  Text="Save"
                  Action={this.handleSave}
                  ClassName="btn btn-primary"
                />
                <Button
                  Id="btnCancel"
                  Text="Cancel"
                  Action={this.handleCancel}
                  ClassName="btn btn-secondary"
                />
              </div>
            </div>
            <ToastContainer
              position='top-right'
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        )}
      </div>
    )
  }
}
