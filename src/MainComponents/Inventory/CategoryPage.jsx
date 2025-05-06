import React, { useState } from 'react';
import Category from './Category';

const CategoryPage = () => {
    const [pageMode, setPageMode] = useState('Home');
    const [pageTitle, setPageTitle] = useState('Category');

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0 text-dark">{pageTitle}</h1>
                        </div>
                    </div>
                </div>
            </div>
            <section className="content">
                <div className="container-fluid">
                    <Category
                        PageMode={pageMode}
                        PageTitle={pageTitle}
                        setPageTitle={setPageTitle}
                        setPageMode={setPageMode}
                    />
                </div>
            </section>
        </div>
    );
};

export default CategoryPage;
