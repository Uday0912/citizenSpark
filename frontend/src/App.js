import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CompareView from './pages/CompareView';
import DistrictSelectorPage from './pages/DistrictSelectorPage';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineIndicator from './components/OfflineIndicator';

import { DataProvider } from './context/DataContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ErrorBoundary>
      <Router>
        <DataProvider>
          <div className="app">
            <OfflineIndicator />
            <Header 
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              sidebarOpen={sidebarOpen}
            />
            
            <div className="app-body">
              <Sidebar 
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
              
              <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/compare" element={<CompareView />} />
                  <Route path="/districts" element={<DistrictSelectorPage />} />
                </Routes>
              </main>
            </div>
          </div>
        </DataProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
