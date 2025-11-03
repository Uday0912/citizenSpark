import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './ChartDisplay.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartDisplay = ({ 
  type = 'line', 
  data = [], 
  height = 300,
  title,
  options = {}
}) => {
  const chartRef = useRef(null);

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280'
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6b7280'
        }
      }
    },
    ...options
  };

  const processData = () => {
    if (!data || data.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'No Data',
          data: [0],
          backgroundColor: 'rgba(156, 163, 175, 0.2)',
          borderColor: 'rgba(156, 163, 175, 1)',
          borderWidth: 1
        }]
      };
    }

    switch (type) {
      case 'overview':
        return getOverviewData();
      case 'trends':
        return getTrendsData();
      case 'comparison':
        return getComparisonData();
      case 'performance':
        return getPerformanceData();
      default:
        return getOverviewData();
    }
  };

  const getOverviewData = () => {
    const labels = data.slice(0, 6).map(item => 
      item.period || `${item.year}-${String(item.month).padStart(2, '0')}`
    );
    
    return {
      labels,
      datasets: [
        {
          label: 'Employment Rate (%)',
          data: data.slice(0, 6).map(item => item.employmentRate || 0),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: 'Work Completion (%)',
          data: data.slice(0, 6).map(item => item.workCompletionRate || 0),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        },
        {
          label: 'Wage Payment (%)',
          data: data.slice(0, 6).map(item => item.wagePaymentRate || 0),
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4
        }
      ]
    };
  };

  const getTrendsData = () => {
    const labels = data.map(item => 
      item.period || `${item.year}-${String(item.month).padStart(2, '0')}`
    );
    
    return {
      labels,
      datasets: [
        {
          label: 'Performance Score',
          data: data.map(item => item.performanceScore || 0),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  };

  const getComparisonData = () => {
    const labels = data.map(item => item.districtName || item.name);
    
    return {
      labels,
      datasets: [
        {
          label: 'Employment Rate',
          data: data.map(item => item.employmentRate || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        },
        {
          label: 'Work Completion',
          data: data.map(item => item.workCompletionRate || 0),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1
        },
        {
          label: 'Wage Payment',
          data: data.map(item => item.wagePaymentRate || 0),
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderColor: 'rgb(245, 158, 11)',
          borderWidth: 1
        }
      ]
    };
  };

  const getPerformanceData = () => {
    return {
      labels: data.map(item => item.label || item.name),
      datasets: [{
        data: data.map(item => item.value || 0),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)'
        ],
        borderWidth: 2
      }]
    };
  };

  const chartData = processData();

  const renderChart = () => {
    const commonProps = {
      ref: chartRef,
      data: chartData,
      options: defaultOptions
    };

    switch (type) {
      case 'bar':
        return <Bar {...commonProps} />;
      case 'doughnut':
        return <Doughnut {...commonProps} />;
      case 'line':
      default:
        return <Line {...commonProps} />;
    }
  };

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="chart-wrapper" style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartDisplay;
