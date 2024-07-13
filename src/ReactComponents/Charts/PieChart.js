import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';

Chart.register(ArcElement);

const PieChart = () => {
  const [data, setData] = useState({
    "Today": {
      "total": 10,
      "pending": 3,
      "completed": 5,
      "actionable": 2
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

  const totalData = [
    data["Today"].total,
    data["Today"].completed,
    data["Today"].pending,
    data["Today"].actionable
  ];

  return (
    <div style={{height:350 }} >
      <Pie
        data={{
          labels: ["Total", "Closed", "Pending", "Actionable"],
          datasets: [{
            label: 'Tasks',
            data: totalData,
            backgroundColor: ['#8884d8', '#82ca9d', '#ffc658', '#8dd1e1']
          }]
        }}
        options={{
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

export default PieChart;
