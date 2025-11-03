import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  GitCompare, 
  MapPin, 
  Database,
  Sparkles,
  Clock
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/',
      icon: Home,
      label: 'Home',
      description: 'Overview & Summary'
    },
    {
      path: '/dashboard',
      icon: BarChart3,
      label: 'Dashboard',
      description: 'Detailed Analytics'
    },
    {
      path: '/compare',
      icon: GitCompare,
      label: 'Compare',
      description: 'District Comparison'
    },
    {
      path: '/districts',
      icon: MapPin,
      label: 'Districts',
      description: 'Browse Districts'
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} style={{ color: 'rgba(255, 255, 255, 0.95)' }} />
            {}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 className="sidebar-title">MGNREGA</h3>
              <span className="sidebar-subtitle">Navigation</span>
            </div>
          </div>
          <button 
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={onClose}
              >
                <div className="nav-item-icon">
                  <Icon size={20} />
                </div>
                <div className="nav-item-content">
                  <span className="nav-item-label">{item.label}</span>
                  <span className="nav-item-description">{item.description}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-section">
            <h4>Data Sources</h4>
            <div className="data-source">
              <Database size={16} />
              <span>data.gov.in</span>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h4>Last Updated</h4>
            <div className="last-updated">
              <Clock size={16} />
              <span>Auto-sync enabled</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
