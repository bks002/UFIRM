import React from 'react';
import ButtonComponent from '../ReactComponents/Button/Button.jsx';
import SelectBox2 from '../ReactComponents/SelectBox/Selectbox.jsx';
import GridTable from '../ReactComponents/Grid/GridTable.jsx';
import ItemConfigTable from '../ReactComponents/ItemConfigTable/ItemConfigTable.jsx';
import Autocomplete from "../ReactComponents/Autocomplete/Autocomplete.jsx";
import CommonDataProvider from "../Common/DataProvider/CommonDataProvider.js";
import Table from '../ReactComponents/Table/Table.jsx';
import { debug } from 'util';
import { SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG } from 'constants';
import { Typeahead } from 'react-bootstrap-typeahead';
import connectionBL from "./PricingConnectionBL.js"
import swal from 'sweetalert';
import AppCommonjs from "../Common/AppCommon.js";
import ConnectionDBProvider from "../Common/DataProvider/ConnectionDataProvider.js";
let ConBL = new connectionBL();
let commonjs = new AppCommonjs();

class ConnectionItemConfiguration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PageDisplaymode: "Add",
            QueryJson: [],
            InputDefaultValue: "",

            itemconfigheader: [
                { headerName: 'Type', field: 'Type', order: 1 },
                { headerName: 'Operator', field: 'Operator', order: 2 },
                { headerName: 'Condition', field: 'Condition', order: 3 },
                { headerName: 'Delete', field: 'Delete-s', type: "Delete", order: 4 }

            ],

            ItemConfigurationQueryResult: [],
            itemconfigdata: [
            ],
            callType: "1",
            ItemPlaceHolder: "Type Division name",
            operatorvalue: "Equal",
            ddlitemvalue: "Division",
            itemvalue: "",
            ItemId: 0,
            itemdata: [],
            Options: [{
                "Name": "Division",
                "Id": "Division"
            },
            {
                "Name": "Group",
                "Id": "Group"
            },
            {
                "Name": "Category",
                "Id": "Category"
            },
            {
                "Name": "Product",
                "Id": "Product"
            },
            {
                "Name": "Item",
                "Id": "Item"
            }
            ],
            CopyOptions: [],
            EqualOptions: [{
                "Name": "Equal",
                "Id": "Equal"
            },
            {
                "Name": "Not Equal",
                "Id": "Not Equal"
            }],
        }
    }
    onddllitemsselected(e) {

        this.setState({ itemvalue: "" })
        this.setState({ ddlitemvalue: e });
        if (e == "Division") {
            this.setState({ callType: "1" })
            this.setState({ ItemPlaceHolder: "Type Division name" });
        }
        else if (e == "Group") {
            this.setState({ callType: "2" })
            this.setState({ ItemPlaceHolder: "Type Group name" });
        }
        else if (e == "Category") {
            this.setState({ callType: "3" })
            this.setState({ ItemPlaceHolder: "Type Category name" });
        }
        else if (e == "Product") {
            this.setState({ callType: "4" })
            this.setState({ ItemPlaceHolder: "Type Product Name/Code" });
        }
        else if (e == "Item") {
            this.setState({ callType: "5" })
            this.setState({ ItemPlaceHolder: "Type Item Name/Code" });
        }
        this.setState({ itemdata: [] }, () => {
            this.tahItem.getInstance().clear()
            this.getitemconfiguration("a");
        });

    }
    onoperatorselected(e) {
        this.setState({ operatorvalue: e });
    }
    onitemselectd(value) {
        if (value.length > 0) {
            this.setState({ itemvalue: value[0].Name })
            this.setState({ ItemId: value[0].Id })
        }
    }
    getitemconfiguration(e) {
        if (e != "") {
            let db = new CommonDataProvider();
            db.getitemconfiguration(this.state.callType, e).then(
                resp => resp.json()).then(
                    jsdata => {
                        if (jsdata != null) {
                            this.setState({ itemdata: jsdata })
                        }
                    }
                ).catch(error => console.log(`Eror:${error}`))
        }
    }
    additemquery() {
        if (this.state.itemvalue != '') {
            if (this.props.RestrictedItems > 0 && this.state.itemconfigdata.length >= this.props.RestrictedItems) {
                commonjs.showtextalert("You Can't Add more than (" + this.props.RestrictedItems + ") value", '', 'info');
            }
            else {

                this.creattablejson(this.state.itemconfigdata);
                this.setState(({ itemvalue: '' }), () => {
                });
            }
        }
    }
    creattablejson(json) {
        let temp = 0;
        let flag = true;
        let id = json.length + 1;
        let temitems = [{}];
        if (json.length > 0) {
            for (var i = 0; i < json.length; i++) {
                if ((json[i].Condition != this.state.itemvalue) && (json[i].Operator != this.state.operatorvalue)) {
                    if (temp == 0)
                        flag = true;
                }
                else {
                    flag = false;
                    temp++;
                }
            }
            if (flag) {
                temitems = json.slice();
                temitems.push({

                    Type: this.state.ddlitemvalue,
                    Operator: this.state.operatorvalue,
                    Condition: this.state.itemvalue,
                    ItemId: this.state.ItemId,
                    Delete: id,
                    Id: id
                });
            }
        }
        else {
            temitems = [{

                Type: this.state.ddlitemvalue,
                Operator: this.state.operatorvalue,
                Condition: this.state.itemvalue,
                ItemId: this.state.ItemId,
                Delete: id,
                Id: id,
            }]
        }
        if (flag)
            this.setState({ itemconfigdata: temitems }, () => {

                this.props.ReturnQuery(temitems);
            });

        this.tahItem.getInstance().clear();
    }

    deleteitems(id) {
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
                    this.state.itemconfigdata.find((item, idx) => {
                        index = idx;
                        return item.Id == id;
                    })
                    let newjson = this.state.itemconfigdata.slice(0, index).concat(this.state.itemconfigdata.slice(index + 1));
                    //this.state.itemconfigdata.splice(index, 1);
                    this.setState({ itemconfigdata: [] }, () => {
                        this.setState({ itemconfigdata: newjson }, () => {
                            commonjs.ShownotifySuccess("Item Deleted Successfully");
                            this.props.ReturnQuery(this.state.itemconfigdata);

                        });
                    });
                }

            } else {
                swal.close();
            }
        });
    }

    viewitems() {
        let query = ConBL.generatequery(this.state.itemconfigdata);
        if (query != "")
            commonjs.showtextalert(query, "SQL Query", "");

    }
    componentWillReceiveProps(props) {
        if (this.props.FilterType != undefined) {
            let filterdItems = undefined;
            let call = "0";
            this.setState({ Options:[]},()=>{

            this.setState({ itemconfigdata: [] });
            if (this.props.FilterType == 'P') {
                this.setState({ Options: [{ "Name": "Product", "Id": "Product" }] })
                this.setState({ ItemPlaceHolder: "Type Product Name/Code" });
                call = "4";
                this.setState({ ddlitemvalue: "Product" });
            }
            else if (this.props.FilterType == 'I') {
                this.setState({ Options: [{ "Name": "Item", "Id": "Item" }] })
                this.setState({ ItemPlaceHolder: "Type Item Name/Code" });
                call = "5";
                this.setState({ ddlitemvalue: "Item" });
            }
            else if (this.props.FilterType == 'D') {
                this.setState({ Options: [{ "Name": "Division", "Id": "Division" }] })
                this.setState({ ItemPlaceHolder: "Type Division name/Code" });
                call = "1";
                this.setState({ ddlitemvalue: "Division" });
            }
            else if (this.props.FilterType == 'PH') {
                this.setState({ Options: [{ "Name": "Division", "Id": "Division" }, { "Name": "Group", "Id": "Group" }, { "Name": "Category", "Id": "Category" }] })
                this.setState({ ItemPlaceHolder: "Type Division name/Code" });
                call = "1";
                this.setState({ ddlitemvalue: "Division" });
            }
            else if (this.props.FilterType == 'AL') {
                this.setState({ Options:   [{
                    "Name": "Division",
                    "Id": "Division"
                },
                {
                    "Name": "Group",
                    "Id": "Group"
                },
                {
                    "Name": "Category",
                    "Id": "Category"
                },
                {
                    "Name": "Product",
                    "Id": "Product"
                },
                {
                    "Name": "Item",
                    "Id": "Item"
                }
                ], })
                this.setState({ ItemPlaceHolder: "Type Division name/Code" });
                call = "1";
                this.setState({ ddlitemvalue: "Division" });

            }
        });

            this.setState({ callType: call }, () => {
                this.getitemconfiguration("a");
            })

        }



        this.setState({ tempdata: props.TempData })
        if (this.props.DisplayMode == "true") {
            if (props.ExistingData.length > 0) {

                this.setState({ itemconfigdata: props.ExistingData }, () => {

                });
            }
            if (props.PageMode == "Edit") {
                this.setState({ PageDisplaymode: "Edit" })
                if (this.state.itemconfigheader.length == 4) {
                    delete this.state.itemconfigheader[3];
                    this.setState({ itemconfigheader: this.state.itemconfigheader })
                }

            }

        }

    }
    componentDidMount() {


        if (this.state.itemdata.length == 0) {
            // DOTO: add comment on bellow line

            this.getitemconfiguration("a");
        }
    }
    updatestate(data) {

        this.setState({ itemconfigdata: data });
    }
    viewqueryresult() {
        if (this.state.itemconfigdata.length > 0) {
            let query = ConBL.generatequery(this.state.itemconfigdata);

            let conprovider = new ConnectionDBProvider();
            conprovider.getitemconfigurationresult(query).then(js => js.json()).then(
                jsresult => {

                    commonjs.showhtmlalert(ConBL.getitemconfigurationresulttable(jsresult), "Query Result", "");
                }
            ).catch(error => console.log(`Eror:${error}`))
        }
    }

    settabledata(json) {
        this.setState({ itemconfigdata: json });
    }
    ClearTyeahead(type, event) {
        if (type == 'I') {
            var option = this.tahItem.props.options;
            if (!option.includes(event.target.value))
                this.tahItem.getInstance().setState({ text: '' });
        }

    }
    render() {

        if (this.props.DisplayMode == "true") {
            this.props.ReturnQuery(this.state.itemconfigdata);
            return (
                <div id="divItemConfiguration" className="pr-fullwidth-padd">
                    <fieldset>
                        <legend>Item Configuration</legend>
                        <div className="pr-fullwidth">
                            {this.state.PageDisplaymode == "Add" &&
                                <SelectBox2 onSelected={this.onddllitemsselected.bind(this)} ID="ddlItems" Options={this.state.Options} ClassName="d-blue-select pr-pull-left" />
                            }
                            {this.state.PageDisplaymode == "Add" &&
                                <SelectBox2 onSelected={this.onoperatorselected.bind(this)} ID="ddlOperator" Options={this.state.EqualOptions} ClassName="d-blue-select pr-pull-left space-left" />
                            }
                            <div className="ic-input-cover space-left">
                                {this.state.PageDisplaymode == "Add" &&

                                    <Typeahead ref={(typeahead) => this.tahItem = typeahead} searchText="Searching.."
                                        labelKey='Name'
                                        onChange={this.onitemselectd.bind(this)}
                                        onInputChange={this.getitemconfiguration.bind(this)}
                                        options={this.state.itemdata}
                                        renderMenuItemChildren={(option) => (
                                            <div className="division-images">
                                                <img src={option.DivImgUrl} /> {option.Name}
                                            </div>
                                        )}
                                        placeholder={this.state.ItemPlaceHolder}
                                        filterBy={['Name', 'DivisionCode']}
                                        onBlur={this.ClearTyeahead.bind(this, 'I')}
                                    />
                                }

                            </div>
                            {this.state.PageDisplaymode == "Add" &&
                                <ButtonComponent Action={this.additemquery.bind(this)} ClassName="d-blue-button pr-pull-left space-left"
                                    Icon={<i className="fa fa-plus" aria-hidden="true"></i>}
                                    Text=" Add"
                                />
                            }

                            <ButtonComponent Action={this.viewqueryresult.bind(this)} ClassName="d-blue-button pr-pull-right space-left"
                                Text="View Items"
                            />
                            <ButtonComponent Action={this.viewitems.bind(this)} ClassName="d-blue-button pr-pull-right"
                                Text="View Query"
                            />
                        </div>
                        <div className="pr-fullwidth mar-top-ten">
                            <GridTable
                                isTableGrid="True"
                                gridID="tblItemConfiguration"
                                TableHeader={this.state.itemconfigheader}
                                GridSeetingData={{ "searching": false, "paging": false, "ordering": false, "info": false }}
                                TableRow={this.state.itemconfigdata}
                                onDelete={this.deleteitems.bind(this)}
                            />
                        </div>
                    </fieldset>

                </div>

            );
        }
        else {
            return (null);
        }

    }
}
ConnectionItemConfiguration.defaultProps = {
    DisplayMode: "true"
}
export default ConnectionItemConfiguration;