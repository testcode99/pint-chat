// Component for the Leaderboard bar chart.
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register all necessary components for a Bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LeaderboardChart = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [{
      label: 'Posts',
      data: data.data,
      backgroundColor: 'rgba(255, 191, 0, 0.7)',
      borderColor: 'rgba(255, 215, 0, 1)',
      borderWidth: 1,
    }],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: '#F5F5DC', precision: 0 },
        grid: { color: 'rgba(245, 245, 220, 0.2)' },
      },
      y: {
        ticks: { color: '#F5F5DC' },
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

  return <Bar options={options} data={chartData} />;
};

export default LeaderboardChart;
