import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { demoDistricts, demoMetrics, demoCacheStatus } from '../utils/demoData';
import { API_BASE_URL } from '../config/api';

const DataContext = createContext();

const initialState = {
  districts: [],
  selectedDistrict: null,
  metrics: [],
  loading: false,
  error: null,
  lastUpdated: null,
  cacheStatus: {
    totalDistricts: 0,
    totalMetrics: 0,
    isHealthy: false
  }
};

const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_DISTRICTS: 'SET_DISTRICTS',
  SET_SELECTED_DISTRICT: 'SET_SELECTED_DISTRICT',
  SET_METRICS: 'SET_METRICS',
  SET_CACHE_STATUS: 'SET_CACHE_STATUS',
  SET_LAST_UPDATED: 'SET_LAST_UPDATED',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

const dataReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ActionTypes.SET_DISTRICTS:
      return { ...state, districts: action.payload, loading: false };
    
    case ActionTypes.SET_SELECTED_DISTRICT:
      return { ...state, selectedDistrict: action.payload };
    
    case ActionTypes.SET_METRICS:
      return { ...state, metrics: action.payload, loading: false };
    
    case ActionTypes.SET_CACHE_STATUS:
      return { ...state, cacheStatus: action.payload };
    
    case ActionTypes.SET_LAST_UPDATED:
      return { ...state, lastUpdated: action.payload };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
};

const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const DISTRICTS_CACHE_KEY = 'mgnrega:districts:v1';
const ongoingRequests = new Map();

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const getApiUrl = () => {
    if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
    if (API_BASE_URL) return API_BASE_URL;
    if (typeof window !== 'undefined') return `${window.location.origin}/api`;
    return '/api';
  };

  const apiCall = async (endpoint, options = {}, retries = 4, attempt = 0) => {
    const dedupeKey = `${endpoint}|${options.method || 'GET'}|${JSON.stringify(options.params || {})}|${JSON.stringify(options.data || {})}`;
    if (ongoingRequests.has(dedupeKey)) {
      return ongoingRequests.get(dedupeKey);
    }

    const promise = (async () => {
      try {
        const apiBaseUrl = getApiUrl();
        const response = await axios({
          url: `${apiBaseUrl}${endpoint}`,
          method: options.method || 'GET',
          data: options.data,
          params: options.params,
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
        return response.data;
      } catch (error) {
        console.error('API call failed:', error);

        const status = error.response?.status;

        const retryAfter = error.response?.headers?.['retry-after'];

        if (status === 429 && retries > 0) {
          let delayMs = 0;

          if (retryAfter) {
            const seconds = parseInt(retryAfter, 10);
            if (!Number.isNaN(seconds)) {
              delayMs = seconds * 1000;
            } else {
              const date = Date.parse(retryAfter);
              if (!Number.isNaN(date)) {
                delayMs = Math.max(1000, date - Date.now());
              } else {
                delayMs = 1000;
              }
            }
          } else {
            const base = 1000;
            delayMs = Math.min(30000, base * Math.pow(2, attempt)) + Math.floor(Math.random() * 1000);
          }

          console.log(`Rate limited, retrying in ${delayMs}ms (attempt ${attempt + 1})`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return apiCall(endpoint, options, retries - 1, attempt + 1);
        }

        console.log('API call failed, using fallback data');
        return null;
      }
    })();

    ongoingRequests.set(dedupeKey, promise);
    promise.finally(() => ongoingRequests.delete(dedupeKey));
    return promise;
  };

  const actions = {
    fetchDistricts: async (params = {}) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });
      
      try {
        try {
          const raw = localStorage.getItem(DISTRICTS_CACHE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.timestamp && (Date.now() - parsed.timestamp) < CACHE_TTL_MS && Array.isArray(parsed.data)) {
              dispatch({ type: ActionTypes.SET_DISTRICTS, payload: parsed.data });
              (async () => {
                const fresh = await apiCall('/districts', { params });
                if (fresh && fresh.data) {
                  localStorage.setItem(DISTRICTS_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: fresh.data }));
                  dispatch({ type: ActionTypes.SET_DISTRICTS, payload: fresh.data });
                }
              })();
              return { data: parsed.data };
            }
          }
        } catch (cacheErr) {
          console.warn('Districts cache read failed:', cacheErr);
        }

        await new Promise(resolve => setTimeout(resolve, 300));
        const data = await apiCall('/districts', { params });

        if (data && data.data) {
          try {
            localStorage.setItem(DISTRICTS_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: data.data }));
          } catch (saveErr) {
            console.warn('Failed to save districts to cache:', saveErr);
          }
          dispatch({ type: ActionTypes.SET_DISTRICTS, payload: data.data });
          return data;
        } else {
          dispatch({ type: ActionTypes.SET_DISTRICTS, payload: demoDistricts });
          return { data: demoDistricts };
        }
      } catch (error) {
        console.log('Using demo data for districts');
        dispatch({ type: ActionTypes.SET_DISTRICTS, payload: demoDistricts });
        return { data: demoDistricts };
      }
    },

    fetchDistrictPerformance: async (districtId, params = {}) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });
      
      try {
        const data = await apiCall(`/districts/${districtId}/performance`, { params });
        dispatch({ type: ActionTypes.SET_METRICS, payload: data.data.metrics });
        dispatch({ type: ActionTypes.SET_LAST_UPDATED, payload: data.data.lastUpdated });
        return data;
      } catch (error) {
        dispatch({ 
          type: ActionTypes.SET_ERROR, 
          payload: error.response?.data?.error || 'Failed to fetch district performance' 
        });
        throw error;
      }
    },

    compareDistricts: async (districtIds, params = {}) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });
      
      try {
        const data = await apiCall('/compare', { 
          method: 'POST', 
          data: { districtIds, ...params } 
        });
        return data;
      } catch (error) {
        dispatch({ 
          type: ActionTypes.SET_ERROR, 
          payload: error.response?.data?.error || 'Failed to compare districts' 
        });
        throw error;
      }
    },

    fetchStateComparison: async (params = {}) => {
      try {
        const data = await apiCall('/compare/states', { params });
        return data;
      } catch (error) {
        dispatch({ 
          type: ActionTypes.SET_ERROR, 
          payload: error.response?.data?.error || 'Failed to fetch state comparison' 
        });
        throw error;
      }
    },

    fetchTrends: async (districtId, params = {}) => {
      try {
        const data = await apiCall(`/compare/trends/${districtId}`, { params });
        return data;
      } catch (error) {
        dispatch({ 
          type: ActionTypes.SET_ERROR, 
          payload: error.response?.data?.error || 'Failed to fetch trends' 
        });
        throw error;
      }
    },

    fetchCacheStatus: async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const data = await apiCall('/cache/status');
        
        if (data && data.data) {
          dispatch({ type: ActionTypes.SET_CACHE_STATUS, payload: data.data });
          return data;
        } else {
          dispatch({ type: ActionTypes.SET_CACHE_STATUS, payload: demoCacheStatus });
          return { data: demoCacheStatus };
        }
      } catch (error) {
        console.log('Using demo cache status');
        dispatch({ type: ActionTypes.SET_CACHE_STATUS, payload: demoCacheStatus });
        return { data: demoCacheStatus };
      }
    },

    syncData: async (force = false) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });
      
      try {
        const data = await apiCall('/districts/sync', { 
          method: 'POST', 
          data: { force } 
        });
        dispatch({ type: ActionTypes.SET_LAST_UPDATED, payload: new Date() });
        return data;
      } catch (error) {
        dispatch({ 
          type: ActionTypes.SET_ERROR, 
          payload: error.response?.data?.error || 'Failed to sync data' 
        });
        throw error;
      }
    },

    setSelectedDistrict: (district) => {
      dispatch({ type: ActionTypes.SET_SELECTED_DISTRICT, payload: district });
    },

    clearError: () => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        dispatch({ type: ActionTypes.SET_DISTRICTS, payload: demoDistricts });
        dispatch({ type: ActionTypes.SET_METRICS, payload: demoMetrics });
        dispatch({ type: ActionTypes.SET_CACHE_STATUS, payload: demoCacheStatus });
        
        setTimeout(async () => {
          try {
            await actions.fetchCacheStatus();
            await actions.fetchDistricts({ limit: 50 });
          } catch (error) {
            console.log('Using demo data');
          }
        }, 2000);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    ...state,
    ...actions
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;
