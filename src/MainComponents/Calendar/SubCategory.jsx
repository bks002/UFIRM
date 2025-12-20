import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import Button from '../../ReactComponents/Button/Button';
import DataGrid from '../../ReactComponents/DataGrid/DataGrid';
import ApiProvider from './DataProvider';

export default function SubCategory() {

  const [pageMode, setPageMode] = useState('Home');
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');

  const Api = new ApiProvider();

  const gridHeader = [
    { sTitle: 'Id', titleValue: 'Value' },
    { sTitle: 'Sub Category Name', titleValue: 'Name' },
    { sTitle: 'Category Name', titleValue: 'CategoryName' },
  ];

  // ---------------------------------------------------
  // LOAD CATEGORY LIST
  // ---------------------------------------------------
  const getCategory = async () => {
    const resp = await Api.manageCategory([{ CmdType: "R" }], 'R', 0);

    if (resp.ok) {
      const data = await resp.json();

      const formatted = data.map(item => ({
        Value: item.catId,
        Name: item.name,
      }));

      setCategoryData(formatted);
    }
  };

  // ---------------------------------------------------
  // LOAD SUBCATEGORY LIST
  // ---------------------------------------------------
  const getSubCategory = async () => {
    const resp = await Api.manageSubCategory([{ CmdType: "R" }], 'R', 0);

    if (resp.ok) {
      const data = await resp.json();

      const formatted = data.map(item => {
        const cat = categoryData.find(c => c.Value === item.CategoryId);
        return {
          Value: item.SubCategoryId,
          Name: item.SubCategoryName,
          CategoryName: cat ? cat.Name : "—"
        };
      });

      setSubCategoryData(formatted);
    }
  };

  // ---------------------------------------------------
  // LOAD CATEGORY FIRST → THEN SUBCATEGORY
  // ---------------------------------------------------
  useEffect(() => {
    (async () => {
      await getCategory();
    })();
  }, []);

  // reload subcategories after categories are loaded
  useEffect(() => {
    if (categoryData.length > 0) {
      getSubCategory();
    }
  }, [categoryData]);

  // ---------------------------------------------------
  // SAVE SUBCATEGORY
  // ---------------------------------------------------
  const handleSave = async () => {
    let type = subCategoryId ? 'U' : 'C';

    const model = [{
      categoryId: parseInt(selectedCategoryId),
      subCategoryName,
      subCategoryId: subCategoryId ? parseInt(subCategoryId) : null
    }];

    const resp = await Api.manageSubCategory(model, type);

    if (resp.ok) {
      setPageMode('Home');
      resetForm();
      getSubCategory();
    }
  };

  const resetForm = () => {
    setSelectedCategoryId('');
    setSubCategoryName('');
    setSubCategoryId('');
  };

  // ---------------------------------------------------
  // EDIT SUBCATEGORY
  // ---------------------------------------------------
  const editSubCategory = (row) => {
    setPageMode('Edit');
    setSubCategoryId(row.Value);
    setSubCategoryName(row.Name);
    const match = categoryData.find(c => c.Name === row.CategoryName);
    if (match) setSelectedCategoryId(match.Value);
  };

  // ---------------------------------------------------
  // UI RENDER
  // ---------------------------------------------------
  return (
    <div>

      {pageMode === 'Home' && (
        <div className='row'>
          <div className='col-12'>
            <div className='card'>
              <div className='card-header d-flex p-0'>
                <ul className="nav ml-auto tableFilterContainer">
                  <li className="nav-item">
                    <Button
                      Text="Create New"
                      Action={() => setPageMode('Add')}
                      ClassName="btn btn-success btn-sm"
                      Icon={<i className="fa fa-plus"></i>}
                    />
                  </li>
                </ul>
              </div>

              <div className='card-body pt-2'>
                <DataGrid
                  Id="gridSubCategory"
                  ColumnCollection={gridHeader}
                  GridData={subCategoryData}
                  IsPagination={false}
                  onRowClick={editSubCategory}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {(pageMode === 'Add' || pageMode === 'Edit') && (
        <div className='modal-content'>
          <div className='modal-body'>
            <div className='row'>

              <div className='col-sm-6'>
                <label>Category Name</label>
                <select
                  className='form-control'
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categoryData.map(c => (
                    <option key={c.Value} value={c.Value}>{c.Name}</option>
                  ))}
                </select>
              </div>

              <div className='col-sm-6'>
                <label>Sub Category Name</label>
                <input
                  className='form-control'
                  type="text"
                  value={subCategoryName}
                  onChange={(e) => setSubCategoryName(e.target.value)}
                />
              </div>

            </div>
          </div>

          <div className='modal-footer'>
            <Button
              Text="Save"
              ClassName="btn btn-primary"
              Action={handleSave}
            />
            <Button
              Text="Cancel"
              ClassName="btn btn-secondary"
              Action={() => { setPageMode('Home'); resetForm(); }}
            />
          </div>

          <ToastContainer />
        </div>
      )}

    </div>
  );
}
