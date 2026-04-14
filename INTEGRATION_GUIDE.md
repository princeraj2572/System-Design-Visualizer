# Full-Stack Integration Guide

## Overview

This guide explains how to integrate the frontend (Next.js React application) with the backend (Express API) for the System Design Visualizer.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
│                   Next.js Frontend                          │
│              (http://localhost:3000)                        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         │ +JWT Auth
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Express API Backend                        │
│              (http://localhost:5000)                        │
│                                                             │
│  ├─ User Authentication (JWT-based)                        │
│  ├─ Project Management (CRUD)                              │
│  ├─ Data Persistence                                       │
│  └─ Caching Layer                                          │
└────────┬────────────────────┬────────────────────┬──────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    PostgreSQL          Redis Cache         File Storage
    (Persist)           (Performance)       (Exports)
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Edit .env with your settings
# Example:
# NODE_ENV=development
# PORT=5000
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=postgres
# DB_NAME=system_visualizer
# REDIS_HOST=localhost
# REDIS_PORT=6379
# JWT_SECRET=your-secret-key-here

# Run database migrations
npm run setup

# Start development server
npm run dev
```

### 2. Frontend Setup

```bash
cd ..

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1

# Start development server
npm run dev
```

## API Integration in Frontend

### 1. Setup API Client

Create `src/lib/api-client.ts`:

```typescript
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage on init
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'
);
```

### 2. User Authentication Integration

Update `src/store/architecture-store.ts` to add auth state:

```typescript
import { apiClient } from '@/lib/api-client';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const createAuthSlice = (set: any) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setToken: (token: string) => {
    apiClient.setToken(token);
    set({ token });
  },

  setUser: (user: User) => set({ user }),

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post('/users/login', {
        email,
        password,
      });
      set({
        token: response.data.token,
        user: response.data.user,
        isAuthenticated: true,
      });
      apiClient.setToken(response.data.token);
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (
    email: string,
    username: string,
    password: string
  ) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post('/users/register', {
        email,
        username,
        password,
      });
      set({ user: response.data });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    apiClient.clearToken();
    set({ token: null, user: null, isAuthenticated: false });
  },
});
```

### 3. Project API Integration

Add project API methods to the store:

```typescript
interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  createProject: (
    name: string,
    description: string,
    nodes: Node[],
    edges: Edge[]
  ) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  exportProject: (id: string) => Promise<string>;
}

export const createProjectSlice = (set: any) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/projects');
      set({ projects: response.data.projects });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createProject: async (
    name: string,
    description: string,
    nodes: Node[],
    edges: Edge[]
  ) => {
    try {
      const response = await apiClient.post('/projects', {
        name,
        description,
        nodes,
        edges,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    try {
      await apiClient.put(`/projects/${id}`, updates);
      set((state: any) => ({
        currentProject: {
          ...state.currentProject,
          ...updates,
        },
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    try {
      await apiClient.delete(`/projects/${id}`);
      set((state: any) => ({
        projects: state.projects.filter((p: Project) => p.id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },

  exportProject: async (id: string) => {
    try {
      const response = await apiClient.get(`/projects/${id}/export`);
      return JSON.stringify(response, null, 2);
    } catch (error) {
      throw error;
    }
  },
});
```

### 4. Update Authentication UI

Create `src/components/auth/LoginForm.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import { useArchitectureStore } from '@/store/architecture-store';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const login = useArchitectureStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Redirect to projects page
      window.location.href = '/projects';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-cyan-500 text-white rounded-lg disabled:opacity-50"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

## Docker Deployment

### Run Full Stack Locally

```bash
# Start all services with docker-compose
docker-compose up

# Access:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### Production Deployment

```bash
# Build images
docker build -t system-visualizer-frontend .
docker build -t system-visualizer-backend backend/

# Push to registry
docker tag system-visualizer-frontend your-registry/system-visualizer-frontend
docker push your-registry/system-visualizer-frontend

# Deploy with docker-compose or Kubernetes
```

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "uuid",
    "name": "Project Name"
  },
  "operation": "read"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_TYPE",
  "details": {
    "field": "Error details"
  }
}
```

## Key Integration Points

### 1. Authentication Flow
```
1. User enters credentials → Frontend
2. Frontend calls POST /api/v1/users/login
3. Backend validates and returns JWT token
4. Frontend stores token in localStorage
5. Frontend includes token in Authorization header for all requests
```

### 2. Project Management Flow
```
1. User creates project → Frontend calls POST /api/v1/projects
2. Backend saves to PostgreSQL
3. Backend caches in Redis
4. Frontend receives project with ID
5. User modifies nodes/edges
6. Frontend calls PUT /api/v1/projects/:id
7. Backend updates database and invalidates cache
```

### 3. Data Synchronization
```
1. Frontend maintains local Zustand state
2. On each change, automatically syncs to backend
3. Backend updates PostgreSQL in real-time
4. Multiple clients can edit (last-write-wins strategy)
5. Export creates JSON file with complete project
```

## Error Handling

### Frontend Error Handling

```typescript
try {
  await updateProject(projectId, updates);
} catch (error: any) {
  if (error.message?.includes('Unauthorized')) {
    // Handle auth error - redirect to login
  } else if (error.message?.includes('not found')) {
    // Handle 404 - project deleted
  } else {
    // Handle generic error
    console.error('Failed to update project:', error);
  }
}
```

### Backend Error Handling

All errors return standard format:

```typescript
throw new AuthenticationError('Invalid credentials'); // 401
throw new AuthorizationError('Not authorized'); // 403
throw new ValidationError('Invalid input'); // 400
throw new NotFoundError('Resource not found'); // 404
throw new ConflictError('Email already exists'); // 409
```

## Performance Optimization

### Frontend
- Use React.memo for expensive components
- Implement virtual scrolling for large graphs
- Debounce store updates

### Backend
- Redis caching on project read
- Database connection pooling
- Pagination for list endpoints
- Database indexes on frequently queried fields

### Network
- Gzip compression
- Keep-alive connections
- Batch operations where possible

## Testing

### Backend Integration Tests

Create `backend/src/__tests__/integration.test.ts`:

```typescript
import request from 'supertest';
import app from '@/index';

describe('API Integration', () => {
  it('should register and login user', async () => {
    // Register user
    const registerRes = await request(app)
      .post('/api/v1/users/register')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });

    expect(registerRes.status).toBe(201);

    // Login user
    const loginRes = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data).toHaveProperty('token');
  });
});
```

## Troubleshooting

### CORS Errors
- Check `CORS_ORIGIN` in backend `.env`
- Ensure frontend URL is in allowed origins
- Verify `Access-Control-Allow-Credentials` header

### Authentication Errors
- Verify JWT_SECRET is same across sessions
- Check token expiration (default 7 days)
- Ensure Authorization header format: `Bearer <token>`

### Database Errors
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Run `npm run setup` to create tables

### Cache Errors
- Verify Redis is running
- Check Redis connection in `.env`
- Clear cache if data is stale

## Monitoring & Logging

### Backend Logs

```bash
# View real-time logs
docker-compose logs -f backend

# Check specific service
docker-compose logs backend | grep ERROR
```

### Database Monitoring

```sql
-- Monitor active connections
SELECT * FROM pg_stat_activity;

-- Check slowest queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Next Steps

1. **Real-time Collaboration**: Implement WebSocket for live editing
2. **Version History**: Add project versioning and rollback
3. **Sharing**: Implement project sharing with permissions
4. **Import/Export**: Support for additional formats (YAML, Protocol Buffers)
5. **Analytics**: Track usage and popular architectures
6. **ML Features**: Suggest improvements based on patterns

---

For more information, see:
- [Frontend Developer Guide](../DEVELOPER_GUIDE.md)
- [Backend README](./backend/README.md)
- [API Documentation](./backend/openapi.yaml)
