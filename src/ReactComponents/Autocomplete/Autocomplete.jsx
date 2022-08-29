// created on Jan 02
import React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import ApiDataProvider from '../../Common/ApiDataProvider.js';
import ServiceCommon from '../../Common/ServiceCommon.js';

//import ApiDataProvider from "../../Common/ApiDataProvider.js";
class Autocomplete extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            
            //options: []
        }
    }

    ClearAutoComplete()
    {
        this.typeahead.getInstance().clear()
    }

    getData(e) {
        
        
        let objcom = new ServiceCommon();
        this.props.ChangeEvent(e);
        // .then(
        //     resp => resp.json()).then(
        //         jsdata => 
        //            {
        //             // for (var i in jsdata) {
        //             //     currency.push(jsdata[i].QADCode);
        //             //  }
                     
        //                 this.setState({ Data:   objcom.getarrayfromjson(jsdata,"QADCode") });
        //             }
     
       
       


        //alert(e);
        // let json =null;
        // let currency= [];
        
        // let db = new ApiDataProvider();
        // db.getcurrency(e, "QADCode").then(
        //     resp => resp.json()).then(
        //         jsdata => 
        //            {
        //             for (var i in jsdata) {
        //                 currency.push(jsdata[i].QADCode);
        //              }
        //              var address = Array.from(new Set(currency));
        //                 this.setState({ Data:   address });
        //             }
                    
                   
               // alert(JSON.stringify(result.join(",")));
                //this.setState({ Data:jsdata})    
                
              
                //this.setState({ Data:jsdata})
                
                //this.setState({ Data: ["sanjay", "kumar", "Rohan", "Goswami"] })


            //)
           
            // var array= [{"address":"Jaipur"},{"address":"Mumbai"},{"address":"Mumbai"}];
            // var address=[];
            
            // $.each(array,function(add,val){
            // address.push(val.address);
            // });
            // var address = Array.from(new Set(address));
            // console.log(address);

          //  console.log(jQuery.parseJSON( json))
        // let provider = new ApiDataProvider();
        // let data = provider.getproductprice("1100033","EUR","GEM2115-EU", "2018-10-29")
        //  console.log("data:",data.then(redata => JSON.stringify(redata)));

        // let srv = new ApiDataProvider();
        // srv.getcustomeraccounts(1,"s").then(jsdata =>
        //     //this.setState({Data:jsdata})
        //     console.log(JSON.stringify(jsdata))
        //     );
        //this.setState({ Data:   address });

    }
    render() {
        return (
            <div  className="pr-typeahead">
                <Typeahead id={this.props.Id} ref={(typeahead) => this.typeahead = typeahead} defaultInputValue ={this.props.DefaultValue} searchText="Searching.."
                labelKey={this.props.LabelKey}
                    onChange={(selected) => {
                            this.props.OnSelected(selected);
                    }}
                   onInputChange={this.props.Onchange}
                    options={this.props.Data} placeholder={this.props.placeholder}
                />
                
            </div>
        );
    }
}

Autocomplete.defaultProps = {
    placeholder: "Start Typing...",
    Data: ["Searching.."],
    
}

export default Autocomplete;