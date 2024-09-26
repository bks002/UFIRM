// ChartNavigator.js
import React, { useState ,useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import BarChart from './BarChart';
import PieChart from './PieChart';
import { connect } from 'react-redux';
import departmentActions from '../../redux/department/action';
import { bindActionCreators } from 'redux';

const ChartNavigator = ({dashDates,actions,onPeriodChange}) => {
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const [initialDate, setInitialDate] = useState (new Date().toJSON().slice(0, 10));
  const [finalDate, setFinalDate] = useState (new Date().toJSON().slice(0, 10));

  useEffect(() => {
  //   console.log("Initial Date:", initialDate);
  //   console.log("Final Date:", finalDate);
  onPeriodChange(initialDate,finalDate);
  actions.fetchDashDates(initialDate);
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
function mapStateToProps(state,props)
{
  return{
  dashDates: state.Commonreducer.dashDates,
}
}
function mapDispatchToProps(dispatch) {
  const actions = bindActionCreators(departmentActions, dispatch);
  return { actions };
}
export default connect( mapStateToProps,mapDispatchToProps)(ChartNavigator);
