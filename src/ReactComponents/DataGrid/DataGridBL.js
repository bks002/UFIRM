import DataGrid from '../DataGrid/DataGrid.jsx';
import GridPagination from './GridPagination.jsx';
import { getIterator } from 'core-js';
const $ = window.$;

export default class DataGridBL {
    getobject() {
        let grid = new DataGrid();
        return grid;
    }
    getpaginationobject() {
        return new GridPagination();
    }
    //Sanjay V.
    // Jun 17 2019
    initpagination(totalitems, pagesize, totalpages, currentpage, pageclick) {
        // alert('did mount');
        $('#singlePagination').pagination({
            items: totalitems,
            itemsOnPage: pagesize,
            cssStyle: 'light-theme',
            //cssStyle: 'dark-theme',
            currentPage: currentpage,
            pages: totalpages,
            useAnchors: false,
            onPageClick: pageclick
        });
    }
    //Sanjay V jul 04 19
    GetSelectOption(gridColumns) {
        let index = null;
        let returnJson = [];
        let selectButton = gridColumns.find((item, idx) => {
            index = idx;
            return item.titleValue == "Select"
        });
        if (selectButton != undefined) {
            let selectIndex = null;
            returnJson = [{ Index: index, Buttons: selectButton.title, StatusColumnIndex: null }];
            let statusColIndex = gridColumns.find((item, idx) => {
                selectIndex = idx;
                return item.titleValue == selectButton.StatusColumn;
            });
            if (statusColIndex != undefined) {
                returnJson[0].StatusColumnIndex = selectIndex;
                //returnJson.splice(returnJson.length-1,selectIndex); 
            }
            return returnJson;

        }
        else
            return null;
    }
    //Sanjay Jun 25 19
    GetStatusColumn(gridColumns) {
        let index = null;
        let statusCols = gridColumns.find((item, idx) => {
            index = idx;
            return item.Type == "Status"
        });
        if (statusCols != undefined)
            return [{ Index: index, Status: statusCols.Type }];
        else
            return null;
    }

    //Sanjay Jun 25 19
    GetActionButton(gridColumns) {
        //
        let index = null;
        let actionButtons = gridColumns.find((item, idx) => {
            index = idx;
            return item.titleValue == "Action"
        });
        if (actionButtons != undefined)
            return [{ Index: index, Buttons: actionButtons.Action.split(',') }];
        else
            return null;
    }
    //Sanjay jun 27 get reference key index
    GetReferenceIdIndex(gridColumns, Title) {
        let actionButtons = gridColumns.find((item, idx) => {
            return item.titleValue == Title
        });
        if (actionButtons != undefined)
            return actionButtons.Index;
        else
            return null;
    }

    //ravindra 15-jan-21 get reference key index for url download 
    GetReferenceIdIndexForUrl(gridColumns, Title) {
        let actionButtons = gridColumns.find((item, idx) => {
            return item.titleValue == Title
        });
        if (actionButtons != undefined)
            return actionButtons.urlIndex;
        else
            return null;
    }


    //ravindra 10-Mar-2021
    GetStatusColorColumn(gridColumns) {
        let index = null;
        let action = gridColumns.find((item, idx) => {
            index = idx;
            return item.titleValue == "StatusColor"
        });
        if (action != undefined)
            return [{ Index: index, Value: action.Value }];
        else
            return null;
    }

    //ravindra 08-feb-21 get reference key index for Image
    GetImageIndexForUrl(gridColumns) {
        let index = null;
        let action = gridColumns.find((item, idx) => {
            index = idx;
            return item.titleValue == "Image"
        });
        if (action != undefined)
            return [{ Index: index, ImagePath: action.ImagePath }];
        else
            return null;
    }

    GetToggleSwitch(gridColumns) {
        let action = [];
        gridColumns.filter((item, idx) => {
            if (item.titleValue == "ToggleSwitch") {
                action.push({ Index: idx, ToggleSwitch: item.Value, Width: item.Width });
            }
        });
        if (action.length != 0) {
            return action;
        }
        else
            return null;
    }

    GetIsBlockedColumn(gridColumns) {
        //
        let index = null;
        let action = gridColumns.find((item, idx) => {
            index = idx;
            return item.titleValue == "IsBlocked"
        });
        if (action != undefined)
            return [{ Index: index, IsBlocked: action.Value, IsApproved: action.Value2 }];
        else
            return null;
    }

    // //RG Changes because added status col in facilty member (finding index)
    GetIsBlockedColumnFaciltyMember(gridColumns) {
        let index = null;
        let action = gridColumns.find((item, idx) => {
            index = idx;
            return item.titleValue == "status"
        });

        if (action != undefined)
            return index;
        else
            return null;
    }
    // Sanjay- Dec 29 2021
    GetCurrentRow(table,index){
        var currentpage  = table.page()
        var  page=0;
        if(currentpage>0){
        page=currentpage*10;

        }
        var tbldata = table.data();
        return   tbldata[page+index-1]
    }

}

