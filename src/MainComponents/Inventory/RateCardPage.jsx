import React, { useState } from 'react';
import RateCard from './RateCard';

const RateCardPage = () => {
    const [pageMode, setPageMode] = useState('Home');
    const [pageTitle, setPageTitle] = useState('Rate Card');

    return (
        <div className="content-wrapper">
            <section className="content">
                <div className="container-fluid">
                    <RateCard
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

export default RateCardPage;
