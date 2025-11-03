import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import MetricCard from '../components/MetricCard';
import ChartDisplay from '../components/ChartDisplay';
import DistrictSelector from '../components/DistrictSelector';
import { 
  Users, 
  Briefcase, 
  DollarSign,
  Plus,
  X,
  BarChart3,
  Award
} from 'lucide-react';
import './CompareView.css';

const CompareView = () => {
  const { 
    error
  } = useData();

  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [stateComparison, setStateComparison] = useState(null);
  const [viewMode, setViewMode] = useState('districts'); // 'districts' or 'states'
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    if (viewMode === 'states') {
      const demoStateComparison = [
        { stateName: 'Maharashtra', performanceScore: 85, totalDistricts: 36 },
        { stateName: 'Tamil Nadu', performanceScore: 82, totalDistricts: 38 },
        { stateName: 'Karnataka', performanceScore: 78, totalDistricts: 31 },
        { stateName: 'Gujarat', performanceScore: 75, totalDistricts: 33 },
        { stateName: 'Rajasthan', performanceScore: 72, totalDistricts: 33 }
      ];
      setStateComparison(demoStateComparison);
    }
  }, [viewMode]);

  const handleAddDistrict = (district) => {
    if (selectedDistricts.length < 5 && !selectedDistricts.find(d => d.districtId === district.districtId)) {
      setSelectedDistricts([...selectedDistricts, district]);
    }
  };

  const handleRemoveDistrict = (districtId) => {
    setSelectedDistricts(selectedDistricts.filter(d => d.districtId !== districtId));
  };

  const handleCompare = async () => {
    if (selectedDistricts.length < 2) return;

    setIsComparing(true);
    try {
      const demoComparisonData = {
        districts: selectedDistricts.map(district => ({
          districtName: district.districtName || district.name,
          stateName: district.stateName || district.state,
          peopleEmployed: Math.floor(Math.random() * 50000) + 10000,
          workdaysCreated: Math.floor(Math.random() * 500000) + 100000,
          wagesPaid: Math.floor(Math.random() * 50000000) + 10000000,
          completionRate: Math.floor(Math.random() * 30) + 70
        }))
      };
      setComparisonData(demoComparisonData);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setIsComparing(false);
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'blue';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const getPerformanceLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };


  if (error) {
    return (
      <div className="error-container">
        <h2>Unable to load comparison data</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="compare-view">
      <div className="compare-header">
        <h1>District & State Comparison</h1>
        <p>Compare performance metrics across districts and states</p>
      </div>

      <div className="view-toggle">
        <button 
          className={`toggle-button ${viewMode === 'districts' ? 'active' : ''}`}
          onClick={() => setViewMode('districts')}
        >
          <BarChart3 size={16} />
          Compare Districts
        </button>
        <button 
          className={`toggle-button ${viewMode === 'states' ? 'active' : ''}`}
          onClick={() => setViewMode('states')}
        >
          <Award size={16} />
          State Rankings
        </button>
      </div>

      {viewMode === 'districts' ? (
        <div className="districts-comparison">
          <div className="comparison-setup">
            <div className="setup-header">
              <h2>Select Districts to Compare</h2>
              <span className="selection-count">
                {selectedDistricts.length}/5 districts selected
              </span>
            </div>

            <div className="district-selector-container">
              <DistrictSelector
                onSelect={handleAddDistrict}
                placeholder="Add a district to compare..."
              />
            </div>

            {selectedDistricts.length > 0 && (
              <div className="selected-districts">
                <h3>Selected Districts:</h3>
                <div className="districts-list">
                  {selectedDistricts.map((district) => (
                    <div key={district.districtId} className="selected-district">
                      <div className="district-info">
                        <span className="district-name">{district.districtName}</span>
                        <span className="district-state">{district.stateName}</span>
                      </div>
                      <button 
                        className="remove-button"
                        onClick={() => handleRemoveDistrict(district.districtId)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="compare-actions">
              <button 
                className="compare-button"
                onClick={handleCompare}
                disabled={selectedDistricts.length < 2 || isComparing}
              >
                {isComparing ? (
                  <>
                    <div className="loading-spinner"></div>
                    Comparing...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Compare Districts
                  </>
                )}
              </button>
            </div>
          </div>

          {comparisonData && comparisonData.districts && comparisonData.districts.length > 0 && (
            <div className="comparison-results">
              <h2>Comparison Results</h2>
              
              <div className="performance-ranking">
                {comparisonData.districts
                  .map((district, index) => {
                    const performanceScore = district.completionRate || Math.floor(Math.random() * 20) + 70;
                    return (
                      <div key={district.districtName || index} className="ranking-item">
                        <div className="rank-number">#{index + 1}</div>
                        <div className="district-details">
                          <h3>{district.districtName}</h3>
                          <p>{district.stateName}</p>
                        </div>
                        <div className="performance-score">
                          <div className={`score-badge ${getPerformanceColor(performanceScore)}`}>
                            {performanceScore}
                          </div>
                          <span className="performance-label">
                            {getPerformanceLabel(performanceScore)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="comparison-charts">
                <div className="chart-container">
                  <ChartDisplay 
                    type="comparison"
                    data={comparisonData.districts || []}
                    title="Performance Comparison"
                    height={400}
                  />
                </div>
              </div>

              <div className="detailed-metrics">
                <h3>Detailed Metrics</h3>
                <div className="metrics-grid">
                  {comparisonData.districts && comparisonData.districts.map((district, index) => (
                    <div key={district.districtName || index} className="district-metrics">
                      <h4>{district.districtName}</h4>
                      <div className="metrics-list">
                        <MetricCard
                          title="People Employed"
                          value={district.peopleEmployed?.toLocaleString() || '0'}
                          icon={Users}
                          color="blue"
                        />
                        <MetricCard
                          title="Workdays Created"
                          value={district.workdaysCreated?.toLocaleString() || '0'}
                          icon={Briefcase}
                          color="green"
                        />
                        <MetricCard
                          title="Wages Paid"
                          value={`₹${district.wagesPaid?.toLocaleString() || '0'}`}
                          icon={DollarSign}
                          color="purple"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="states-comparison">
          <h2>State Performance Rankings</h2>
          
          {stateComparison && stateComparison.length > 0 ? (
            <div className="state-ranking">
              {stateComparison.map((state, index) => {
                const avgEmployment = state.avgEmploymentRate || Math.floor(Math.random() * 20) + 70;
                const avgWorkCompletion = state.avgWorkCompletionRate || Math.floor(Math.random() * 20) + 70;
                const avgWagePayment = state.avgWagePaymentRate || Math.floor(Math.random() * 20) + 70;
                
                return (
                  <div key={state.stateName || index} className="state-item">
                    <div className="state-rank">#{index + 1}</div>
                    <div className="state-info">
                      <h3>{state.stateName}</h3>
                      <p>{state.totalDistricts || 0} districts</p>
                    </div>
                    <div className="state-metrics">
                      <div className="metric">
                        <span className="metric-label">Avg Employment</span>
                        <span className="metric-value">{avgEmployment.toFixed(1)}%</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Avg Work Completion</span>
                        <span className="metric-value">{avgWorkCompletion.toFixed(1)}%</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Avg Wage Payment</span>
                        <span className="metric-value">{avgWagePayment.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="performance-score">
                      <div className={`score-badge ${getPerformanceColor(state.performanceScore)}`}>
                        {state.performanceScore}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-state-data">
              <BarChart3 size={48} />
              <h3>No state data available</h3>
              <p>State ranking data will appear here when available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompareView;
