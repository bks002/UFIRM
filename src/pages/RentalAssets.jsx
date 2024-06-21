import React from "react";

const RentalAssets=()=>{
        console.log("RentalAssets");
        return (
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="mt-5 text-dark">Rental Assets</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><a href="/">Home</a></li>
                                    <li className="breadcrumb-item active"><a href="/Account/App/AssetsMaster">Assets Master </a> </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <section className="content">
                    <div className="container-fluid">
                        <div className="container-fluid">
                            <AssetsMaster />
                        </div>
                    </div>
                </section> */}
            </div>
        );
    }

export default RentalAssets;