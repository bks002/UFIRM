import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Title } from 'chart.js';

Chart.register(ArcElement);

const PieChart = ({chartData}) => {
  const [data, setData] = useState({
      "total": 10,
      "pending": 3,
      "completed": 5,
      "actionable": 2
  });
  const [labels,setLabels] = useState(["Total", "Closed", "Pending", "Actionable"]);

  useEffect(() => {
    if(chartData.length>0)
    {  const label = [...chartData.map((item)=> item.Title)]
       const newData = [
      ...chartData.map((item) => item.Value)
    ];
    setLabels(label);
    setData(newData);
    }else setData(data);
  }, [chartData]);

  return (
    <div style={{height:350}} >
      <Pie
        data={{
          labels: labels,
          datasets: [{
            label: 'Tasks',
            data: data,
            backgroundColor: ['#8884d8', '#82ca9d', '#ffc658', '#8dd1e1']
          }]
        }}
        options={{
          legend: {
            display: false
          },
          responsive: true,
          maintainAspectRatio: false 
          
        }}
        
      />
    </div>
  );
};

export default PieChart;
