// Component for the Posts by Hour line chart.
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

// Register all necessary components for a Line chart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);


const PostsByHourChart = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [{
      label: 'Posts per Hour',
      data: data.data,
      fill: true,
      backgroundColor: 'rgba(255, 191, 0, 0.3)',
      borderColor: 'rgba(255, 215, 0, 1)',
      tension: 0.4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
     scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#F5F5DC', precision: 0 },
        grid: { color: 'rgba(245, 245, 220, 0.2)' },
      },
      x: {
        ticks: { color: '#F5F5DC', maxRotation: 0, minRotation: 0, autoSkip: true, maxTicksLimit: 12 },
        grid: { display: false },
      },
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#281E15',
            titleColor: '#FFBF00',
            bodyColor: '#F5F5DC',
            borderColor: '#FFBF00',
            borderWidth: 1,
        },
    },
  };

  return <Line options={options} data={chartData} />;
};

export default PostsByHourChart;
