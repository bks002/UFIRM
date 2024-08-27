import React, { useEffect, useState } from 'react';

import ApiProvider from './DataProvider';

const FlatDetails = (props) => {
    const ApiProviderr = new ApiProvider();

    const [FlatDetails, setFlatDetails] = useState(null);

    useEffect(() => {
        var type = 'FD';
        var model = getModel(type);
        managePropertyMember(model, type);
    }, [])

    const managePropertyMember = (model, type, Id) => {
        ApiProviderr.managePropertyMember(model, type).then(
            resp => {
                if (resp.ok && resp.status === 200) {
                    return resp.json().then(rData => {
                        switch (type) {
                            case 'FD':
                                setFlatDetails(rData);
                                break;
                            default:
                        }
                    });
                }
            });
    }

    const getModel = (type) => {
        var model = [];
        switch (type) {
            case 'FD':
                model.push({
                    "FlatId": parseInt(props.flatId),
                });
                break;
            default:
        };
        return model;
    }

    return (
        <div>
            <div className="row">
                <div className="col-sm-3">
                    Floor: <b>{FlatDetails ? FlatDetails.floor : null}</b>
                </div>
                <div className="col-sm-3">
                    Flat: <b>{FlatDetails ? FlatDetails.flatDetailNumber : null}</b>
                </div>
                <div className="col-sm-3">
                    Extention: <b>{FlatDetails ? FlatDetails.extension : null}</b>
                </div>
                <div className="col-sm-3">
                    Flat/Shop Type: <b>{FlatDetails ? FlatDetails.propertyDetailTypeValue : null}</b>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col-sm-3">
                    Measure Unit: <b>{FlatDetails ? FlatDetails.measurementUnitsValue : null}</b>
                </div>
                <div className="col-sm-3">
                    Super Buildup Area: <b>{FlatDetails ? FlatDetails.superBuilUpArea : null}</b>
                </div>
                <div className="col-sm-3">
                    Total Area: <b>{FlatDetails ? FlatDetails.totalArea : null}</b>
                </div>
                <div className="col-sm-3">
                    Buildup Area: <b>{FlatDetails ? FlatDetails.builtupArea : null}</b>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col-sm-3">
                    Carpet Area: <b>{FlatDetails ? FlatDetails.carpetArea : null}</b>
                </div>
                <div className="col-sm-3">
                    Property Configuration: <b>{FlatDetails ? FlatDetails.uniteConfiguration : null}</b>
                </div>
            </div>
        </div>
    );
};

export default FlatDetails;