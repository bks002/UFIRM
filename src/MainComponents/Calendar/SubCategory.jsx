import React, { Component } from 'react'
import { ToastContainer } from 'react-toastify';
import Button from '../../ReactComponents/Button/Button';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid';
import InputBox from '../../ReactComponents/InputBox/InputBox';
import DropdownList from '../../ReactComponents/SelectBox/DropdownList';
import ApiProvider from './DataProvider';
import * as appCommon from '../../Common/AppCommon.js';

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
      categoryData: [],
    };

    this.ApiProvider = new ApiProvider();
  }

  AddNew = () => {
    this.setState({ PageMode: 'Add' });
  }

  handleSave = () => {
    var type = 'C';
    var model = this.getModel(type);
    this.saveSubCategory(model, type);

    if (this.state.PageMode == 'Edit')
      type = 'U';
    var model = this.getModel(type);

  }

  saveSubCategory = (model, type) => {
    console.log(model);
    this.ApiProvider.manageSubCategory(model, type).then(
        resp => {
            if (resp.ok && resp.status == 200) {
                return resp.json().then(rData => {
                    switch (type) {
                        case 'C':
                          this.handleCancel();
                          break;
                        default:
                    }
                });
            }
        });
  }

  handleCancel = () => {
    this.setState({
        PageMode: 'Home',
        subCategoryName: '',
        selectedCategoryId: '',
        subCategoryId: '',
        catColor: "#FFA500",
    }, () => this.getSubCategory());
  };

  getModel = (type) => {
    var model = [];
    switch(type) {
      case 'C':
        model.push({
          "categoryId": parseInt(this.state.selectedCategoryId),
          "subCategoryName": this.state.subCategoryName,     
        });
        break;
      case 'R':
        model.push({
          "CmdType": type
        });
        break;
      default:
    };
    return model;
  }

  manageCategory = (model, type,catId) => {
    this.ApiProvider.manageCategory(model, type,catId).then(
      resp => {
        if (resp.ok && resp.status == 200) {
          return resp.json().then(rData => {
            switch(type) {
              case 'R':
                let catData = rData.map(element => ({
                  Value: element.catId,
                  Name: element.name,
                  Description: element.description,
                  Color: element.color
                }));
                this.setState({ categoryData: catData });
                break;
              default:
            }
          })
        }
      }
    )
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
 
  getCategory() {
    var type = 'R';
    var model = this.getModel(type);
    var catId =0
    this.manageCategory(model, type,catId);
  }

  onCategoryChanged = value => this.setState({ selectedCategoryId: parseInt(value) });

  componentDidMount() {
    this.getSubCategory();
    this.getCategory();
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
                      {/* <DropdownList
                        Id="ddlCategoryName"
                        Options={this.state.categoryData}
                        onSelected={this.onCategoryChanged.bind(this)}
                      /> */}

                    <select
                        id="dllCategory"
                        className='form-control'
                        onChange={(e) => this.setState({
                          selectedCategoryId: e.target.value
                      })}
                      >
                          console.log(this.state.categoryData);
                        <option value={0}>Select Category</option>
                        {
                          this.state.categoryData ? this.state.categoryData.map((e, key) => {
                            return <option key={key} value={e.Value}>{e.Name}
                            </option>
                          }) : null
                        }
                      </select>



                    </div>
                  </div>
                  <div className='col-sm-6'>
                    <div className='form-group'>
                      <label htmlFor='txtSubCategoryName'>Sub Category Name</label>
                    <input
                        id="txtSubCategoryName"
                        placeholder="Enter Sub Category Name"
                        type="text"
                        className="form-control"
                        value={this.state.subCategoryName}
                        onChange={(e) => { this.setState({ subCategoryName: e.target.value }) }}
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
