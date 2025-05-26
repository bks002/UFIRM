import React, {useEffect, useState} from 'react';
import RateCard from './RateCard';
import {getCategories} from "../../Services/InventoryService";
import * as appCommon from "../../Common/AppCommon";
import {useSelector} from "react-redux";

const PurchaseOrderPage = () => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(0);
    const propertyId = useSelector((state) => state.Commonreducer.puidn);

    useEffect(() => {
        if (propertyId) {
            getAllCategories(propertyId);
            setSelectedCategory(null);
        } else {
            appCommon.showtextalert("Error", "Please Select a Property.", "error");
        }
    }, [propertyId]);

    useEffect(() => {
        if (selectedCategory > 0) {
            getAllCategories(propertyId);
        }
    }, [selectedCategory]);

    const getAllCategories = async (propertyId) => {
        try {
            setLoading(true);
            const data = await getCategories(propertyId);
            setCategories(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching Categories:', error);
            setLoading(false);
        }
    };

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0 text-dark">Purchase Order</h1>
                        </div>
                    </div>
                </div>
            </div>
            <section className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-6">
                            <label>Category</label>
                            <select
                                className="form-control"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.Id} value={cat.Id}>
                                        {cat.Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PurchaseOrderPage;
