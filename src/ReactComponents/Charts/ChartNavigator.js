// ChartNavigator.js
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ChartNavigator = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Today");

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  return (
    <div className="chart-navigator">
      <div className="btn-group w-100">
        <button
          className={`btn btn-success ${selectedPeriod === "Today"? "active" : ""}`}
          onClick={() => handlePeriodChange("Today")}
        >
          Today
        </button>
        <button
          className={`btn btn-success ${selectedPeriod === "Week"? "active" : ""}`}
          onClick={() => handlePeriodChange("Week")}
        >
          Week
        </button>
        <button
          className={`btn btn-success ${selectedPeriod === "Month"? "active" : ""}`}
          onClick={() => handlePeriodChange("Month")}
        >
          Month
        </button>
        <button
          className={`btn btn-success ${selectedPeriod === "Year"? "active" : ""}`}
          onClick={() => handlePeriodChange("Year")}
        >
          Year
        </button>
      </div>
    </div>
  );
};

export default ChartNavigator;