import React, { Component } from "react";
import StockItems from "../MainComponents/Inventory/StockItems";

class StockItemsPage extends Component {
  render() {
    return (
      <div className="content-wrapper">
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0 text-dark">Stock Items</h1>
              </div>
            </div>
          </div>
        </div>

        <section className="content mt-3">
          <div className="container-fluid">
            <StockItems />
          </div>
        </section>
      </div>
    );
  }
}

export default StockItemsPage;