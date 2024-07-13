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

const BarChart = () => {
  const [data, setData] = useState({
    "Today": {
      "total": 20,
      "pending": 6,
      "completed": 10,
      "actionable": 4
    },
    "Week": {
      "total": 50,
      "pending": 15,
      "completed": 20,
      "actionable": 10
    },
    "Month": {
      "total": 200,
      "pending": 60,
      "completed": 80,
      "actionable": 40
    },
    "year": {
      "total": 1000,
      "pending": 300,
      "completed": 400,
      "actionable": 200
    }
  });
  

  useEffect(() => {
    // Call your API to fetch the data
    fetch('/api/task-counts')
    .then(response => response.json())
    .then(data => setData(data));
  }, []);

  const labels = Object.keys(data);
  const totalData = labels.map(label => data[label].total);
  const pendingData = labels.map(label => data[label].pending);
  const completedData = labels.map(label => data[label].completed);
  const actionableData = labels.map(label => data[label].actionable);

  return (
    <div  style={{height:350 }} >
      <Bar data={{
        labels,
        datasets: [
          {
            label: 'Total',
            data: totalData,
            backgroundColor: '#8884d8'
          },
          {
            label: 'Pending',
            data: pendingData,
            backgroundColor: '#82ca9d'
          },
          {
            label: 'Completed',
            data: completedData,
            backgroundColor: '#ffc658'
          },
          {
            label: 'Actionable',
            data: actionableData,
            backgroundColor: '#8dd1e1'
          }
        ]
      }}  options={{
        legend: {
          display: true
        },
        responsive: true,
        maintainAspectRatio: false 
        
      }}
      />
    </div>
  );
};

export default BarChart;
