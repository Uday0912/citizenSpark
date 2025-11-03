const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');

const districtRoutes = require('./routes/districts');
const compareRoutes = require('./routes/compare');
const cacheRoutes = require('./routes/cache');

const { startCronJob } = require('./utils/scheduleCron');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

const allowedOrigins = (() => {
  if (process.env.NODE_ENV === 'production') {
    if (process.env.FRONTEND_URLS) return process.env.FRONTEND_URLS.split(',').map(s => s.trim());
    return [
      'https://mgnrega-oqlp-izewi2ci8-udays-projects-d8504db5.vercel.app'
    ];
  }
  return ['http://localhost:3000', 'http://localhost:3001'];
})();

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased limit for development
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

app.get('/status', (req, res) => {
  res.status(200).json({
    message: 'MGNREGA API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/districts', districtRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/cache', cacheRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'MGNREGA Data Visualization API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      districts: '/api/districts',
      compare: '/api/compare',
      cache: '/api/cache'
    }
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }
  
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

const startServer = async () => {
  try {
    await connectDB();
    
    startCronJob();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 MGNREGA Data API is ready`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
