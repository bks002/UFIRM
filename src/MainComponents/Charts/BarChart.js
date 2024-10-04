import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({chartData}) => {
  const [data, setData] = useState({
    "total": 10,
    "pending": 3,
    "completed": 5,
    "actionable": 2
});
const [labels,setLabels] = useState(["Total", "Closed", "Pending", "Actionable"]);
  

useEffect(() => {
  console.log(chartData);
  if(chartData.length>0)
  {  const label = [...chartData.map((item)=> item.Title)]
     const newData = [
    ...chartData.map((item) => item.Value)
  ];
  console.log(newData,label);
  setLabels(label);
  setData(newData);
  }else setData(data);
  // console.log(totalData);
}, [chartData]);

  
  // const totalData = labels.map(label => data[label].total);
  // const pendingData = labels.map(label => data[label].pending);
  // const completedData = labels.map(label => data[label].completed);
  // const actionableData = labels.map(label => data[label].actionable);

  return (
    <div  style={{height:350 }} >
      <Bar 
       data={{
        labels: labels,
        datasets: 
        [{
           data: data,
           label: 'labels',
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

export default BarChart;
