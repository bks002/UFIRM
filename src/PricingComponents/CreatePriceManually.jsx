import React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import CommonDataProvider from "../Common/DataProvider/CommonDataProvider.js";
import TextAreaBox from '../ReactComponents/TextAreaBox/TextAreaBox.jsx';
import ButtonComponent from '../ReactComponents/Button/Button.jsx';
import InputBox from "../ReactComponents/InputBox/InputBox.jsx";
import GridTable from '../ReactComponents/Grid/GridTable.jsx';
import Commonjs from '../Common/AppCommon.js';
import CreatePriceManully from './CreatePriceManually.js';
import { debug } from 'util';
let ItemName = '';
let ItemCode = '';
let Itemid = 0;
let Price = 0;
let objBL = new CreatePriceManully();
let commonjs = new Commonjs();
class CreatePricemanully extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ItemData: [],
            headers: [
                { headerName: 'Code', field: 'ItemCode', order: 1 },
                { headerName: 'Name', field: 'Name', order: 1 },
                { headerName: 'Price', field: 'Price', order: 2, type: 'string' },
                { headerName: 'Action', field: 'ItemCode-I', order: 3, type: 'Delete' }
            ],
            GridData: [],
        }
    }
    // Add Item manualy code
    onitemselectd(value) {

        if (value.length > 0) {
            this.ItemName = value[0].Name2;
            this.ItemCode = value[0].ItemCode;
            this.Itemid = value[0].ItemId;

        }
    }

    DeleteDuplicateItemPrice(itemid) {
        alert(itemid);
        let d = ItemData;
    }

    getitemconfiguration(e) {
        if (e != "") {
            let db = new CommonDataProvider();
            db.getitems(e, "").then(
                resp => resp.json()).then(
                    jsdata => {
                        this.setState({ ItemData: jsdata })
                    }
                ).catch(error => console.log(`Eror:${error}`))
        }
    }

    CheckDuplicateItem() {

        if (this.state.GridData.length > 0) {
            let value = undefined
            value = this.state.GridData.find((item, idx) => {
                return item.ItemCode == this.ItemCode
            })
            if (value == undefined) {

                return true;
            }
            else {
                commonjs.ShownotifyError(`Item ( ${this.ItemCode} ) ${this.ItemName} is already exist`);
                this.tahCustomers.getInstance().clear();
            }
            this.setState({ tempcustomerdata: [] });
        }
        return true;

    }

    ItemSave() {
        if (objBL.ValidatePrice()) {
            if (this.ItemName != '' && this.ItemName !== undefined) {
                if (this.CheckDuplicateItem()) {
                    let json = this.state.GridData
                    let id = json.length + 1;
                    let temitems = [{}]
                    if (json.length > 0) {
                        temitems = json.slice();
                        temitems.push({

                            ItemCode: this.ItemCode,
                            Name: this.ItemName,
                            Price: this.Price,
                            ItemId: this.Itemid

                        });
                    }
                    else {
                        temitems = [{

                            ItemCode: this.ItemCode,
                            Name: this.ItemName,
                            Price: this.Price,
                            ItemId: this.Itemid

                        }]
                    }
                    this.setState({ GridData: temitems }, () => {
                        this.tahItem.getInstance().clear()
                        this.ResetStateData();
                        $('#txtprice').val('');
                    });



                }
            }
            else {
                commonjs.ShownotifyError(`Item is Invalid.`);
            }
        }
    }
    onPriceChange(e) {
        this.Price = e;
        $('#txtprice').val('');

    }
    onItemPriceDelete(itemconde) {
        swal({
            title: "Are you sure to delete?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
            closeOnClickOutside: false,
        }).then((willDelete) => {
            if (willDelete) {
                {
                    let index = 0;
                    let data = this.state.GridData;
                    let currentitem = data.find((item, idx) => {

                        index = idx;
                        return item.ItemCode == itemconde;
                    })
                    data.splice(index, 1);
                    this.setState({ GridData: [] }, () => {
                        this.setState({ GridData: data }, () => {
                            this.ResetStateData();
                            commonjs.ShownotifySuccess("Item Deleted Successfully");
                        })

                    });

                }

            } else {
                swal.close();
            }
        });
    }
    componentDidMount() {

        objBL.CreatePriceValidator();
        this.getitemconfiguration('a');
    }

    componentWillReceiveProps(props) {
        let itemcount = props.DeleteItemsList.length - 1;
        if (props.DeleteItemsList.length > 0) {
            props.DeleteItemsList.map((val, idx) => {
                if (idx == itemcount) {
                    this.DeleteDuplicateItems(val.ItemCode, true);
                }
                else {
                    this.DeleteDuplicateItems(val.ItemCode, false);
                }
            });
        }
    }

    SavePrice() {
        this.props.CallSaveFunction();
    }

    //Sanjay May 09 2019
    DeleteDuplicateItems(itemconde, callsave) {
        let index = 0;
        let data = this.state.GridData;
        let currentitem = data.find((item, idx) => {
            index = idx;
            return item.ItemCode == itemconde;
        })
        data.splice(index, 1);
        this.setState({ GridData: [] }, () => {
            this.setState({ GridData: data }, () => {
                this.ResetStateData();
                if (callsave) {
                    this.SavePrice();
                }
            })

        });
    }

    ResetStateData() {
        let pricelistdata = objBL.GetItemPriceCommonSeperatedvalue(this.state.GridData)
        let ItemCollection = objBL.GetItemCollection(this.state.GridData)
        let logdata = objBL.GetItempricelogdata(this.state.GridData)
        this.props.ReturnQuery(pricelistdata, logdata, ItemCollection);
    }
    ClearTyeahead( type, event)
    {
        if(type=='I')
        {
            var option=this.tahItem.props.options;
            if(!option.includes(event.target.value))
                this.tahItem.getInstance().setState({ text: ''});
        }
                         
    }

    render() {
        return (
            <div className="pr-fullwidth-padd">
                <div className="pr-form-box-buttons pr-fbb">
                    <div className="pr-fullwidth">
                        <div id="txtItem" className="pu-itemprice">
                            <Typeahead ref={(typeahead) => this.tahItem = typeahead} searchText="Searching.."
                                labelKey="Name"
                                onChange={this.onitemselectd.bind(this)}
                                onInputChange={this.getitemconfiguration.bind(this)}
                                options={this.state.ItemData}
                                placeholder="Type Item Name/Code"
                                onBlur={this.ClearTyeahead.bind(this,'I')}
                            />
                        </div>
                        <div className="pu-itemprice">
                            <InputBox onChange={this.onPriceChange.bind(this)} PlaceHolder="Price" Name="Price" Id="txtprice" />
                        </div>
                        <ButtonComponent Action={this.ItemSave.bind(this)} ClassName="d-blue-button pr-pull-right space-left"
                            Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                            Text=" Add"
                        />
                    </div>
                </div>
                <div className="pr-fullwidth">
                    <GridTable isTableGrid="True"
                        GridSeetingData={{ "Searching": false, "paging": true, "ordering": true, "order": [[0, "desc"]] }}
                        gridID="grdItemPriceList"
                        TableHeader={this.state.headers}
                        TableRow={this.state.GridData}
                        onDelete={this.onItemPriceDelete.bind(this)}
                    />
                </div>
            </div>
        );
    }
}

export default CreatePricemanully;

