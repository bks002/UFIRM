import React, { Component } from 'react';

class ItemConfigTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
        Data:{}
    }
    render() {
        return (
            
            <div className="ic-infos">
                <div className="ic-infos-row-header">
                    <div className="ic-info-col1">Type</div>
                    <div className="ic-info-col2">Operator</div>
                    <div className="ic-info-col3">Condition</div>
                </div>
                <div className="ic-infos-row">
                    <div className="ic-info-col1">Division</div>
                    <div className="ic-info-col2">Equals</div>
                    <div className="ic-info-col3">21 Proxima</div>
                </div>
                <div className="ic-infos-row">
                    <div className="ic-info-col1">type</div>
                    <div className="ic-info-col2">Does Not Equals</div>
                    <div className="ic-info-col3">XXXX - Some type</div>
                </div>
                <div className="ic-infos-row">
                    <div className="ic-info-col1">Product</div>
                    <div className="ic-info-col2">Equals</div>
                    <div className="ic-info-col3">P - 21ABC: A Nice Drape</div>
                </div>
                <div className="ic-infos-row">
                    <div className="ic-info-col1">Item</div>
                    <div className="ic-info-col2">Equals</div>
                    <div className="ic-info-col3">None123: An Item</div>
                </div>
            </div>

        );
    }
}
class Products extends React.Component {

    constructor(props) {
      super(props);
  
      this.state = {};
      this.state.filterText = "";
      this.state.products = [
        {
          id: 1,
          type: 'Division',
          operator: 'Does Not Equals',
          condition: '21 Proxima'
        }, {
          id: 2,
          type: 'Category',
          operator: 'Equals',
          condition: '22 Proxima'
        }, {
          id: 3,
          type: 'Product',
          operator: 'Does Not Equals',
          condition: '23 Proxima'
        }, {
          id: 4,
          type: 'Item',
          operator: 'Equals',
          condition: '24 Proxima'
        }, {
          id: 5,
          type: 'Product',
          operator: 'Equals',
          condition: '25 Proxima'
        }, {
          id: 6,
          type: 'Category',
          operator: 'Does Not Equals',
          condition: '26 Proxima'
        }
      ];
  
    }
    handleUserInput(filterText) {
      this.setState({filterText: filterText});
    };
    handleRowDel(product) {
      var index = this.state.products.indexOf(product);
      this.state.products.splice(index, 1);
      this.setState(this.state.products);
    };
  
    handleAddEvent(evt) {
      var id = (+ new Date() + Math.floor(Math.random() * 999999)).toString(36);
      var product = {
        id: id,
        operator: "",
        type: "",
        condition: 0
      }
      this.state.products.push(product);
      this.setState(this.state.products);
  
    }
  
    handleProductTable(evt) {
      var item = {
        id: evt.target.id,
        type: evt.target.type,
        value: evt.target.value
      };
      var products = this.state.products;
  
      var newProducts = products.map(function(product) {
        for (var key in product) {
          if (key == item.type && product.id == item.id) {
            product[key] = item.value;
  
          }
        }
        return product;
      });
      this.setState(newProducts);
      console.log(this.state.products);
    };
    render() {  
      return (
        <div>
          <ProductTable onProductTableUpdate={this.handleProductTable.bind(this)} onRowAdd={this.handleAddEvent.bind(this)} onRowDel={this.handleRowDel.bind(this)} products={this.state.products} filterText={this.state.filterText}/>
        </div>
      );
  
    }
  
  }
  class SearchBar extends React.Component {
    handleChange() {
      this.props.onUserInput(this.refs.filterTextInput.value);
    }
    render() {
      return (
        <div>
  
          <input type="text" placeholder="Search..." value={this.props.filterText} ref="filterTextInput" onChange={this.handleChange.bind(this)}/>
  
        </div>
  
      );
    }
  
  }
  
  class ProductTable extends React.Component {
  
    render() {
      var onProductTableUpdate = this.props.onProductTableUpdate;
      var rowDel = this.props.onRowDel;
      var filterText = this.props.filterText;
      var product = this.props.products.map(function(product) {
        if (product.type.indexOf(filterText) === -1) {
          return;
        }
        return (<ProductRow onProductTableUpdate={onProductTableUpdate} product={product} onDelEvent={rowDel.bind(this)} key={product.id}/>)
      });
      return (
        <div className="pr-fullwidth-padd">
          <div className="ic-table-cover">  
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Operator</th>
                  <th>Condition</th>
                  <th className="delete-cell">Action</th>
                </tr>
              </thead>  
              <tbody>
                {product}  
              </tbody>  
            </table>
          </div>
        </div>
      );
  
    }
  
  }
  
  class ProductRow extends React.Component {
    onDelEvent() {
      this.props.onDelEvent(this.props.product);
  
    }
    render() {
  
      return (
        <tr className="eachRow">
          <TexttableCell onProductTableUpdate={this.props.onProductTableUpdate} cellData={{
            "type": "type",
            value: this.props.product.type,
            id: this.props.product.id
          }}/>
          <TexttableCell onProductTableUpdate={this.props.onProductTableUpdate} cellData={{
            operator: "operator",
            value: this.props.product.operator,
            id: this.props.product.id
          }}/>
          <TexttableCell onProductTableUpdate={this.props.onProductTableUpdate} cellData={{
            condition: "condition",
            value: this.props.product.condition,
            id: this.props.product.id
          }}/>          
          <td className="delete-cell">
            
            <a title="Delete" class="fa fa-trash" href=""></a>
          </td>
        </tr>
      );
  
    }
  
  }
  class TexttableCell extends React.Component {  
    render() {
      return (
        <td>
          {this.props.cellData.value}          
        </td>
      );
  
    }
  
  }
  class EditableCell extends React.Component {  
    render() {
      return (
        <td>
          <input type='text' name={this.props.cellData.type} id={this.props.cellData.id} value={this.props.cellData.value} onChange={this.props.onProductTableUpdate}/>
        </td>
      );
  
    }
  
  } 

export default Products;