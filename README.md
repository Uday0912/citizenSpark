# MGNREGA Data Visualization Dashboard

A comprehensive MERN stack application for visualizing MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) data across Indian districts. The system fetches data from data.gov.in API, stores it in MongoDB, and provides a citizen-friendly dashboard with charts and insights.

## 🚀 Features

- **Real-time Data Sync**: Automated data fetching from data.gov.in API
- **District Performance**: Detailed analytics for individual districts
- **Comparison Tools**: Compare multiple districts and state rankings
- **Interactive Charts**: Visual representations of employment, workdays, and wages
- **Offline Capability**: Works even when government API is down
- **Responsive Design**: Mobile-friendly interface
- **Citizen-Friendly**: Color-coded indicators for non-literate users

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Express.js API │    │   MongoDB       │
│                 │◄──►│                 │◄──►│                 │
│  - Dashboard    │    │  - REST Routes  │    │  - Districts    │
│  - Charts       │    │  - Data Sync    │    │  - Metrics      │
│  - Comparison   │    │  - Cron Jobs    │    │  - Cache        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Static Files  │    │  data.gov.in    │
│  - PWA Support  │    │  - API Data     │
│  - Offline Mode │    │  - Real-time    │
└─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Axios** - HTTP client for API calls
- **node-cron** - Scheduled tasks
- **Helmet** - Security middleware

### Frontend
- **React.js** - UI library
- **Chart.js** - Data visualization
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons

## 📦 Quick Setup

### Prerequisites
- Node.js (v16 or higher)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd MGNREGA
```

### 2. Easy Setup (Windows)
```bash
# Run the setup script
setup.bat
```

### 3. Manual Setup
```bash
# Backend
cd backend
npm install
copy env.example .env
# Edit .env file with your API key

# Frontend  
cd ../frontend
npm install
```

### 4. Start the Application
```bash
# Easy way (Windows)
run.bat

# Manual way
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

## 🚀 Running the Application

### Development Mode

1. **Start Backend Server**
```bash
cd backend
npm run dev
```

2. **Start Frontend Development Server**
```bash
cd frontend
npm start
```

3. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

### Production Mode

1. **Build Frontend**
```bash
cd frontend
npm run build
```

2. **Start Production Server**
```bash
cd backend
npm start
```

## 📊 API Endpoints

### Districts
- `GET /api/districts` - List all districts
- `GET /api/districts/:id` - Get district details
- `GET /api/districts/:id/performance` - Get district performance data
- `POST /api/districts/sync` - Sync data from API

### Comparison
- `POST /api/compare` - Compare multiple districts
- `GET /api/compare/states` - Get state rankings
- `GET /api/compare/trends/:districtId` - Get performance trends

### Cache Management
- `GET /api/cache/status` - Get cache status
- `GET /api/cache/export` - Export cached data
- `DELETE /api/cache/clear` - Clear cache

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/mgnrega_data` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `DATA_GOV_API_KEY` | data.gov.in API key | Required |
| `DATA_GOV_BASE_URL` | API base URL | `https://api.data.gov.in/resource` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `CRON_SCHEDULE` | Data sync schedule | `0 2 * * *` (2 AM daily) |

### Data.gov.in API Setup

1. Visit [data.gov.in](https://data.gov.in)
2. Register for an API key
3. Add the key to your `.env` file
4. Update API endpoints in `backend/utils/fetchData.js`

## 📱 Features Overview

### Dashboard
- **Overview**: Summary statistics and key metrics
- **District Performance**: Detailed analytics for selected districts
- **Comparison**: Side-by-side district comparison
- **State Rankings**: Performance rankings by state

### Data Visualization
- **Line Charts**: Performance trends over time
- **Bar Charts**: Comparative metrics
- **Doughnut Charts**: Distribution analysis
- **Color Coding**: Visual indicators for performance levels

### Offline Capability
- **Cached Data**: Works without internet connection
- **Progressive Web App**: Installable on mobile devices
- **Data Export**: CSV export functionality

## 🔄 Data Synchronization

The system automatically syncs data from data.gov.in API:

- **Scheduled Sync**: Daily at 2 AM (configurable)
- **Manual Sync**: Available through API endpoints
- **Error Handling**: Graceful fallback to cached data
- **Data Validation**: Ensures data integrity

## 🎨 Customization

### Adding New Metrics
1. Update `backend/models/Metrics.js` schema
2. Modify `backend/utils/fetchData.js` data processing
3. Update frontend components to display new metrics

### Styling
- CSS files are organized by component
- Responsive design with mobile-first approach
- Dark mode support
- Custom color schemes for different performance levels

## 🚀 Deployment

### Development Setup

1. **Backend Setup**
```bash
cd backend
npm install
npm start
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

### Production Deployment

1. **Backend Deployment**
```bash
cd backend
npm install --production
npm start
```

2. **Frontend Deployment**
```bash
cd frontend
npm run build
# Deploy build folder to your web server
```

### Render (recommended for backend)

You can host both frontend (Static Site) and backend (Web Service) on Render. The repo includes a `render.yaml` manifest that defines both services. Steps:

1. Push your repository to GitHub (or use an existing GitHub repo).

2. In Render dashboard, click New -> "Import from Git" and select this repository. Render will read `render.yaml` and offer to create the two services.

3. After services are created, set the following environment variables in the Render dashboard for each service:

- Backend service (`mgnrega-backend`):
    - `MONGODB_URI` = your MongoDB connection string (e.g., from MongoDB Atlas)
    - `NODE_ENV` = production
    - `FRONTEND_URLS` = https://<your-frontend-domain> (or comma-separated list)

- Frontend static site (`mgnrega-frontend`):
    - `REACT_APP_API_URL` = https://<your-backend-domain>/api

4. Trigger a deploy (Render does this automatically on creation and on each push to `main`).

5. Verify:
    - Backend health: `https://<your-backend>.onrender.com/health`
    - Frontend: `https://<your-frontend>.onrender.com`

Notes:
- Do NOT commit secrets (like `MONGODB_URI`) to the repo. Use Render's environment settings.
- If CORS issues appear, set `FRONTEND_URLS` in backend to include the deployed frontend origin.

### Vercel (recommended for frontend)

Deploy the React frontend to Vercel for fast, global CDN distribution. The backend should be deployed separately (e.g., on Render, Railway, or Heroku).

#### Quick Deploy:

**Option 1: Via Vercel Dashboard**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and click "New Project"
3. Import your repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `.` (root)
   - **Build Command**: `cd frontend; npm install; npm run build`
   - **Output Directory**: `frontend/build`
5. Add Environment Variable:
   - `REACT_APP_API_URL` = `https://your-backend-url.com/api`
6. Click "Deploy"

**Option 2: Via CLI**
```bash
npm install -g vercel
vercel login
vercel
vercel env add REACT_APP_API_URL
# Enter your backend API URL (e.g., https://your-backend.onrender.com/api)
vercel --prod
```

#### Important Notes:
- Deploy backend separately (Render is recommended - see above)
- Set `FRONTEND_URLS` in backend to include your Vercel domain
- Update `REACT_APP_API_URL` in Vercel dashboard after deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.


## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### API Testing
Use tools like Postman or curl to test API endpoints:

```bash
# Health check
curl http://localhost:5000/health

# Get districts
curl http://localhost:5000/api/districts

# Get cache status
curl http://localhost:5000/api/cache/status
```

## 📈 Performance Optimization

### Backend
- Database indexing for faster queries
- Rate limiting to prevent abuse
- Caching for frequently accessed data
- Connection pooling for MongoDB

### Frontend
- Code splitting for faster loading
- Image optimization
- Lazy loading for components
- Service worker for offline functionality

## 🔒 Security

- **Helmet.js** for security headers
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **CORS** configuration
- **Environment variables** for sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Advanced filtering options
- [ ] Data export in multiple formats
- [ ] Integration with other government APIs

---

**Built with ❤️ for transparent governance and citizen empowerment**
