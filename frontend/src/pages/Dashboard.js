import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import MetricCard from '../components/MetricCard';
import ChartDisplay from '../components/ChartDisplay';
import DistrictSelector from '../components/DistrictSelector';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign,
  MapPin,
  Calendar,
  RefreshCw
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { 
    selectedDistrict,
    metrics,
    error,
    fetchDistrictPerformance,
    setSelectedDistrict,
    syncData
  } = useData();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (selectedDistrict) {
      fetchDistrictPerformance(selectedDistrict.districtId, {
        year: selectedYear,
        month: selectedMonth
      });
    }
  }, [selectedDistrict, selectedYear, selectedMonth, fetchDistrictPerformance]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await syncData(true);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };


  if (error) {
    return (
      <div className="error-container">
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  const summaryMetrics = metrics.length > 0 ? [
    {
      title: 'Total Households',
      value: metrics.reduce((sum, m) => sum + (m.totalHouseholds || 0), 0).toLocaleString(),
      icon: Users,
      color: 'blue',
      description: 'Households registered for work'
    },
    {
      title: 'Persons Employed',
      value: metrics.reduce((sum, m) => sum + (m.personsProvidedWork || 0), 0).toLocaleString(),
      icon: Briefcase,
      color: 'green',
      description: 'People provided employment'
    },
    {
      title: 'Workdays Generated',
      value: metrics.reduce((sum, m) => sum + (m.workdaysGenerated || 0), 0).toLocaleString(),
      icon: TrendingUp,
      color: 'orange',
      description: 'Total workdays created'
    },
    {
      title: 'Wages Paid',
      value: `₹${metrics.reduce((sum, m) => sum + (m.wagesPaid || 0), 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'purple',
      description: 'Total wages disbursed'
    }
  ] : [];

  const performanceMetrics = metrics.length > 0 ? [
    {
      title: 'Employment Rate',
      value: `${Math.round(metrics.reduce((sum, m) => sum + (m.employmentRate || 0), 0) / metrics.length)}%`,
      icon: Users,
      color: 'blue',
      description: 'Average employment rate'
    },
    {
      title: 'Work Completion',
      value: `${Math.round(metrics.reduce((sum, m) => sum + (m.workCompletionRate || 0), 0) / metrics.length)}%`,
      icon: Briefcase,
      color: 'green',
      description: 'Average work completion rate'
    },
    {
      title: 'Wage Payment',
      value: `${Math.round(metrics.reduce((sum, m) => sum + (m.wagePaymentRate || 0), 0) / metrics.length)}%`,
      icon: DollarSign,
      color: 'purple',
      description: 'Average wage payment rate'
    }
  ] : [];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>District Performance Dashboard</h1>
          <p>Detailed analytics and insights for MGNREGA implementation</p>
        </div>
        
        <div className="header-controls">
          <button 
            className="refresh-button"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? 'spinning' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      <div className="dashboard-filters">
        <div className="filter-group">
          <label>Select District:</label>
          <DistrictSelector 
            onSelect={setSelectedDistrict}
            selectedDistrict={selectedDistrict}
            placeholder="Choose a district..."
          />
        </div>
        
        <div className="filter-group">
          <label>Year:</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Month:</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>
                {new Date(2023, month - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedDistrict ? (
        <>
          <div className="district-info">
            <div className="district-header">
              <MapPin size={20} />
              <h2>{selectedDistrict.districtName}, {selectedDistrict.stateName}</h2>
            </div>
            <div className="district-meta">
              <span>
                <Calendar size={16} />
                Data for {selectedYear} - {new Date(2023, selectedMonth - 1).toLocaleString('default', { month: 'long' })}
              </span>
            </div>
          </div>

          <div className="metrics-section">
            <h3>Summary Statistics</h3>
            <div className="metrics-grid">
              {summaryMetrics.map((metric, index) => (
                <MetricCard
                  key={index}
                  title={metric.title}
                  value={metric.value}
                  icon={metric.icon}
                  color={metric.color}
                  description={metric.description}
                />
              ))}
            </div>
          </div>

          <div className="metrics-section">
            <h3>Performance Indicators</h3>
            <div className="metrics-grid">
              {performanceMetrics.map((metric, index) => (
                <MetricCard
                  key={index}
                  title={metric.title}
                  value={metric.value}
                  icon={metric.icon}
                  color={metric.color}
                  description={metric.description}
                />
              ))}
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-container">
              <ChartDisplay 
                type="trends"
                data={metrics}
                title="Performance Trends"
                height={400}
              />
            </div>
            
            <div className="chart-container">
              <ChartDisplay 
                type="overview"
                data={metrics}
                title="Monthly Overview"
                height={400}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="no-district-selected">
          <MapPin size={48} />
          <h3>Select a District</h3>
          <p>Choose a district from the dropdown above to view detailed performance data</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
