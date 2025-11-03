import React, { useEffect } from 'react';
import { useData } from '../context/DataContext';
import MetricCard from '../components/MetricCard';
import ChartDisplay from '../components/ChartDisplay';
import ErrorBoundary from '../components/ErrorBoundary';
import { TrendingUp, Users, Briefcase, DollarSign } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { 
    districts, 
    metrics, 
    error, 
    cacheStatus, 
    fetchCacheStatus,
    fetchDistricts 
  } = useData();

  useEffect(() => {
    fetchCacheStatus();
    if (districts.length === 0) {
      fetchDistricts({ limit: 10 });
    }
  }, [districts.length, fetchCacheStatus, fetchDistricts]);


  if (error) {
    return (
      <div className="error-container">
        <h2>Unable to load data</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  const totalDistricts = cacheStatus.totalDistricts || districts.length;
  const totalMetrics = cacheStatus.totalMetrics || 0;
  const isDataHealthy = cacheStatus.isHealthy;

  const summaryMetrics = [
    {
      title: 'Total Districts',
      value: totalDistricts.toLocaleString(),
      icon: TrendingUp,
      color: 'blue',
      description: 'Districts with MGNREGA data'
    },
    {
      title: 'Data Records',
      value: totalMetrics.toLocaleString(),
      icon: Users,
      color: 'green',
      description: 'Total data points available'
    },
    {
      title: 'Data Health',
      value: isDataHealthy ? 'Healthy' : 'Stale',
      icon: Briefcase,
      color: isDataHealthy ? 'green' : 'orange',
      description: isDataHealthy ? 'Data is up to date' : 'Data needs refresh'
    },
    {
      title: 'Last Updated',
      value: cacheStatus.latestUpdate ? 
        new Date(cacheStatus.latestUpdate).toLocaleDateString() : 
        'Unknown',
      icon: DollarSign,
      color: 'purple',
      description: 'Most recent data sync'
    }
  ];

  return (
    <ErrorBoundary>
      <div className="home">
        <div className="home-header">
          <h1>MGNREGA Data Dashboard</h1>
          <p className="home-subtitle">
            Track employment, workdays, and wages across Indian districts
          </p>
        </div>

        <div className="metrics-grid">
          {summaryMetrics.map((metric, index) => (
            <ErrorBoundary key={index}>
              <MetricCard
                title={metric.title}
                value={metric.value}
                icon={metric.icon}
                color={metric.color}
                description={metric.description}
              />
            </ErrorBoundary>
          ))}
        </div>

        <div className="home-content">
          <div className="content-section">
            <h2>Recent Performance</h2>
            <ErrorBoundary>
              <ChartDisplay 
                type="overview"
                data={metrics}
                height={300}
              />
            </ErrorBoundary>
          </div>

          <div className="content-section">
            <h2>Data Coverage</h2>
            <div className="coverage-stats">
              <div className="coverage-item">
                <span className="coverage-label">States Covered</span>
                <span className="coverage-value">
                  {cacheStatus.dataByState?.length || 0}
                </span>
              </div>
              <div className="coverage-item">
                <span className="coverage-label">Total Records</span>
                <span className="coverage-value">
                  {totalMetrics.toLocaleString()}
                </span>
              </div>
              <div className="coverage-item">
                <span className="coverage-label">Data Freshness</span>
                <span className={`coverage-value ${isDataHealthy ? 'healthy' : 'stale'}`}>
                  {isDataHealthy ? 'Fresh' : 'Needs Update'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="home-footer">
          <p>
            Data sourced from <strong>data.gov.in</strong> • 
            Last updated: {cacheStatus.latestUpdate ? 
              new Date(cacheStatus.latestUpdate).toLocaleString() : 
              'Unknown'
            }
          </p>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Home;
