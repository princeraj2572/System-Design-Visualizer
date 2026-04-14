# Frontend & Backend Integration Setup

## Quick Start Guide

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL running
- Redis running (optional for backend)

### Step 1: Start the Backend

```bash
cd backend

# Install dependencies (if not already done)
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run setup

# Start backend development server
npm run dev
```

Backend will run on: **http://localhost:5000**

### Step 2: Configure Frontend

```bash
cd ..

# Create environment file if not exists
cp .env.example .env.local

# Verify NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1 in .env.local
```

### Step 3: Start the Frontend

```bash
# Install dependencies (if not already done)
npm install

# Start frontend development server
npm run dev
```

Frontend will run on: **http://localhost:3000**

### Step 4: Access the Application

1. Open browser to **http://localhost:3000**
2. You should see the login form
3. Create a new account or login with existing credentials
4. After login, you'll be redirected to the architecture editor

## Architecture Integration Features

### ✅ Authentication System
- User registration and login
- JWT token-based authentication
- Automatic token storage in localStorage
- Protected routes with AuthGuard

### ✅ Project Management
- Create new architecture projects
- Save projects to backend (PostgreSQL)
- Load existing projects
- Update and delete projects
- Export projects as JSON

### ✅ API Integration
- Type-safe API client with fetch
- Automatic token injection in requests
- Error handling with user feedback
- Request/response formatting

### ✅ State Management
- Zustand store with auth state
- Project state management
- Architecture graph state (nodes, edges)
- History/undo-redo functionality
- Theme management

## API Endpoints Connected

**User Management:**
- `POST /api/v1/users/register` - Create account
- `POST /api/v1/users/login` - Login
- `GET /api/v1/users/profile` - Get profile
- `PUT /api/v1/users/profile` - Update profile

**Projects:**
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects` - List projects
- `GET /api/v1/projects/:id` - Get project
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project
- `GET /api/v1/projects/:id/export` - Export project

## Development

### Frontend Structure
```
src/
├── lib/
│   ├── api-client.ts        # API communication client
│   ├── auth-service.ts      # Authentication service
│   └── project-service.ts   # Project operations service
├── components/
│   ├── auth/                # Login, AuthGuard components  
│   └── canvas/              # Canvas, Palette, Properties
└── store/
    └── architecture-store.ts # Zustand store (updated)
```

### Key Features
- **LoginForm**: Handles registration and login
- **AuthGuard**: Protects routes, shows login if not authenticated
- **API Client**: Manages all backend communication with JWT tokens
- **Services**: Abstract backend operations (auth, projects)
- **Zustand Store**: Manages all application state

## Database Setup

The backend automatically creates tables on startup via `npm run setup`:

- `users` - User accounts
- `projects` - Architecture projects (with JSON nodes/edges)
- `project_shares` - Project permissions (future)
- `audit_logs` - Activity tracking (future)

## Troubleshooting

### CORS Errors
- Ensure backend env variable `CORS_ORIGIN` includes frontend URL
- Default: `http://localhost:3000`

### Login Fails
- Check backend is running on port 5000
- Verify database is accessible
- Check `.env.local` has correct `NEXT_PUBLIC_API_BASE_URL`

### "API Connection Failed"
- Backend must be running and accessible
- Check backend logs for errors
- Verify PostgreSQL/Redis are running (if configured)

### Projects Not Saving
- Confirm user is authenticated (check token in localStorage)
- Verify backend is receiving requests (check server logs)
- Check PostgreSQL is running and configured

## Production Build

```bash
# Build for production
npm run build

# Test production build
npm start
```

Production build will be optimized and minified, ready for deployment.

## Docker Deployment

```bash
# From project root
docker-compose up

# This starts:
# - PostgreSQL database
# - Redis cache
# - Backend API (port 5000)
# - Frontend still runs locally for development

# Or build production containers:
docker build -t system-visualizer-frontend .
docker build -t system-visualizer-backend backend/
```

## Next Steps

1. ✅ Frontend and backend are integrated
2. ✅ Users can create accounts
3. ✅ Users can create and save projects
4. 🔄 Add real-time collaboration (WebSocket)
5. 🔄 Add project sharing with permissions
6. 🔄 Add architecture templates
7. 🔄 Add AI-powered suggestions

## Support

For issues or questions, refer to:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Detailed integration info
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Frontend development
- [backend/README.md](./backend/README.md) - Backend documentation
