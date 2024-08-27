// ChartNavigator.js
import React, { useState ,useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import BarChart from './BarChart';
import PieChart from './PieChart';

const ChartNavigator = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const [initialDate, setInitialDate] = useState (new Date().toJSON().slice(0, 10));
  const [finalDate, setFinalDate] = useState (new Date().toJSON().slice(0, 10));
  const [chartData, setChartData] = useState ([{}]);

  useEffect(() => {
    console.log("Initial Date:", initialDate);
    console.log("Final Date:", finalDate);
    const fetchData = async () => {
      try {
        const response = await fetch(`https://api.urest.in:8096/GetAllTaskWiseStatusFinalCountDash?dateFrom=${initialDate}&dateTo=${finalDate}`);
        const data = await response.json();
        console.log("API Response:", data);
        setChartData(data);
        // Handle data processing or state updates as needed
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [initialDate, finalDate]);


  const handlePeriodChange = (period) => {
    
    const currentDate = new Date();
    if(period==="Today"){
      setInitialDate(currentDate.toJSON().slice(0,10));
    }
    else if (period === "Week") {
      // Calculate date 7 days ago
      const priorDate = new Date();
      priorDate.setDate(currentDate.getDate() - 7);
      setInitialDate(priorDate.toJSON().slice(0, 10));
    } else if (period === "Month") {
      // Calculate date 30 days ago
      const priorDate = new Date();
      priorDate.setDate(currentDate.getDate() - 30);
      setInitialDate(priorDate.toJSON().slice(0, 10));
    } else if (period === "Year") {
      // Calculate date 365 days ago
      const priorDate = new Date();
      priorDate.setDate(currentDate.getDate() - 365);
      setInitialDate(priorDate.toJSON().slice(0, 10));
    }
    setSelectedPeriod(period);
  };

  return (
    <>
    {/* <BarChart data={chartData} />
    <PieChart data={chartData}/> */}
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
    </>
  );
};

export default ChartNavigator;