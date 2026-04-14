# Frontend-Backend Integration Implementation

## Overview

The System Design Visualizer frontend has been fully integrated with the Express.js backend. This document describes the implementation details and how the various components work together.

## Architecture

```
┌─────────────┐
│  Browser    │
└──────┬──────┘
       │ HTTP (Fetch)
       ▼
┌──────────────────────────────────┐
│  Frontend (Next.js 16)           │
├──────────────────────────────────┤
│  UI Components                   │
│  ├─ LoginForm                    │
│  ├─ ProjectsPage                 │
│  └─ EditorPage                   │
│                                  │
│  State Management (Zustand)      │
│  ├─ Auth State                   │
│  ├─ Project State                │
│  └─ Architecture State           │
│                                  │
│  Services Layer                  │
│  ├─ authService                  │
│  ├─ projectService               │
│  └─ apiClient                    │
└──────┬───────────────────────────┘
       │ HTTP/JWT Tokens
       ▼
┌──────────────────────────────────┐
│  Backend (Express.js)            │
├──────────────────────────────────┤
│  API Routes                      │
│  ├─ /users/register              │
│  ├─ /users/login                 │
│  ├─ /users/profile               │
│  └─ /projects/*                  │
│                                  │
│  Middleware                      │
│  ├─ Authentication (JWT)         │
│  ├─ Error Handling               │
│  └─ Logging                      │
│                                  │
│  Database                        │
│  └─ PostgreSQL                   │
└──────────────────────────────────┘
```

## Key Files and Components

### Frontend Integration Files

#### 1. **API Client** (`src/lib/api-client.ts`)
- **Purpose**: HTTP client that handles all API communication
- **Key Features**:
  - Automatic JWT token injection in request headers
  - Error handling and response parsing
  - Token persistence in localStorage
  - Methods: `get()`, `post()`, `put()`, `delete()`

#### 2. **Authentication Service** (`src/lib/auth-service.ts`)
- **Purpose**: Abstracts authentication operations
- **Methods**:
  - `register(email, username, password)` - Create new account
  - `login(email, password)` - User login, returns token
  - `getProfile()` - Fetch current user profile
  - `updateProfile(updates)` - Update user profile
  - `logout()` - Clear authentication

#### 3. **Project Service** (`src/lib/project-service.ts`)
- **Purpose**: Manages project CRUD operations
- **Methods**:
  - `createProject(data)` - Create new project
  - `listProjects()` - Fetch all user projects
  - `getProject(projectId)` - Load single project
  - `updateProject(projectId, updates)` - Save project changes
  - `deleteProject(projectId)` - Remove project
  - `exportProject(projectId)` - Export as JSON

#### 4. **Login Form Component** (`src/components/auth/LoginForm.tsx`)
- **Features**:
  - Registration and login modes
  - Form validation
  - Error display
  - Token storage on successful login
  - Redirects to projects page after auth

#### 5. **Auth Guard Component** (`src/components/auth/AuthGuard.tsx`)
- **Purpose**: Route protection wrapper
- **Features**:
  - Checks localStorage for existing token on mount
  - Validates token by fetching user profile
  - Shows LoginForm if unauthenticated
  - Restores session on page refresh

#### 6. **Zustand Store** (`src/store/architecture-store.ts`)
- **State Management**:
  - Authentication: `authToken`, `authUser`, `isCheckingAuth`
  - Projects: `currentProjectId`, `projectName`, `projectDescription`
  - Canvas: `nodes`, `edges`, `selectedNode`, `history`
  - Theme: `theme` (light/dark)
- **Methods**:
  - `setAuthToken()` - Store auth token
  - `setAuthUser()` - Store user data
  - `loadProject()` - Fetch project from backend
  - `saveProject()` - Save current state to backend
  - `createNewProject()` - Create new project on backend
  - `addNode()`, `removeNode()`, `updateNode()` - Canvas operations
  - `addEdge()`, `removeEdge()`, `updateEdge()` - Connection operations

### UI Pages

#### 1. **Home Page** (`src/app/page.tsx`)
- Redirects to `/projects` on load

#### 2. **Projects Page** (`src/app/projects/page.tsx`)
- **Features**:
  - Displays all user projects
  - Create new project form
  - Open project button
  - Delete project button
  - Project metadata (node count, last updated)
  - Responsive grid layout

#### 3. **Editor Page** (`src/app/editor/[projectId]/page.tsx`)
- **Features**:
  - Loads specific project by ID
  - Displays ArchitectureCanvas
  - Save button for project
  - Export button for JSON export
  - Toolbar with project name

#### 4. **Layout** (`src/app/layout.tsx`)
- Wraps entire app with `<AuthGuard>`
- Ensures authentication check on app load
- Initializes Zustand store

### Environment Configuration

#### `.env.local` (Development)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=System Design Visualizer
NEXT_PUBLIC_APP_VERSION=1.0.0
```

#### `.env.example`
- Template for environment variables
- Copy to `.env.local` for development

## Authentication Flow

```
User Input
    │
    ▼
LoginForm Component
    │
    ├─ register() ──→ authService.register()
    │                      │
    │                      ▼
    │                 apiClient.post("/users/register")
    │                      │
    │                      ▼
    │                 Backend creates user
    │
    └─ login() ───────→ authService.login()
                           │
                           ▼
                      apiClient.post("/users/login")
                           │
                           ▼
                      Backend returns token + user
                           │
                           ▼
                      apiClient.setToken(token)
                           │
                           ├─ localStorage.setItem('authToken', token)
                           └─ Authorization header injection
                           │
                           ▼
                      store.setAuthToken(token)
                      store.setAuthUser(user)
                           │
                           ▼
                      Redirect to /projects
```

## Project CRUD Flow

### Create Project
```
ProjectsPage
  │
  ├─ user enters name + description
  │
  └─ onClick: createNewProject(name, desc)
      │
      ▼
    store.createNewProject()
      │
      ▼
    projectService.createProject()
      │
      ▼
    apiClient.post("/projects", data)
      │
      ▼
    Backend creates project in PostgreSQL
      │
      ▼
    Returns project with ID
      │
      ▼
    store updates currentProjectId
      │
      ▼
    Navigate to /editor/[projectId]
```

### Load Project
```
EditorPage (mount with projectId param)
  │
  ├─ useEffect([projectId])
  │
  └─ projectService.getProject(projectId)
      │
      ▼
    apiClient.get("/projects/{projectId}")
      │
      ▼
    Backend queries PostgreSQL
      │
      ▼
    Returns project with nodes + edges
      │
      ▼
    store.loadProject()
      │
      ▼
    Updates: nodes, edges, projectName, projectDescription
      │
      ▼
    ArchitectureCanvas renders graph
```

### Save Project
```
EditorPage (save button)
  │
  ├─ onClick: handleSave()
  │
  └─ store.saveProject()
      │
      ▼
    Collects: currentProjectId, projectName, projectDescription, nodes, edges
      │
      ▼
    projectService.updateProject()
      │
      ▼
    apiClient.put("/projects/{projectId}", data)
      │
      ▼
    Backend updates PostgreSQL
      │
      ▼
    Returns success
      │
      ▼
    Show success message
```

## Token Management

### Storage
- Tokens stored in browser's `localStorage` under key `authToken`
- Persisted across browser sessions
- Cleared on logout or token expiration

### Injection
- Automatically added to every API request header:
  ```
  Authorization: Bearer <token>
  ```
- Handled by `apiClient.getHeaders()`

### Validation
- AuthGuard checks token on app load
- Validates by attempting to fetch user profile
- Redirects to login if token invalid/expired

### Lifecycle
1. User logs in → authService.login() returns token
2. Token stored in localStorage and Zustand store
3. Token auto-injected in all subsequent requests
4. On page refresh: AuthGuard validates token
5. On logout: Token cleared from localStorage and store

## Error Handling

### API Errors
- Caught and transformed to readable messages
- Displayed in error components
- Network errors handled gracefully
- 401 errors trigger re-authentication

### Validation
- LoginForm validates email/password format
- ProjectsPage requires project name
- Form submission disabled during loading

### User Feedback
- Loading spinners during async operations
- Error messages in red boxes
- Success indicators for operations
- Disabled states for buttons during requests

## Data Types

### User
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}
```

### Project
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  nodes: NodeData[];
  edges: Edge[];
  created_at: string;
  updated_at: string;
}
```

### Node
```typescript
interface NodeData {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  metadata?: { [key: string]: any };
}
```

### Edge
```typescript
interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}
```

## API Endpoints

### Authentication
- `POST /api/v1/users/register` - Create account
- `POST /api/v1/users/login` - Login
- `GET /api/v1/users/profile` - Get current user
- `PUT /api/v1/users/profile` - Update profile

### Projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects` - List user projects
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project
- `GET /api/v1/projects/:id/export` - Export as JSON

## Running the Application

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure database
cp .env.example .env
# Edit .env with database credentials

# Run migrations
npm run setup

# Start backend
npm run dev
```

### Frontend Setup
```bash
# From project root
npm install

# Configure environment (if needed)
cp .env.example .env.local
# Verify NEXT_PUBLIC_API_BASE_URL

# Start frontend
npm run dev
```

### Access Application
1. Open http://localhost:3000
2. Register new account or login
3. Create new project or open existing
4. Design architecture using canvas
5. Save project automatically persists to backend

## Testing Integration

### Login Flow
1. Register new user: email + username + password
2. Login with same credentials
3. Verify token persistence on page refresh
4. Verify logout clears authentication

### Project Flow
1. Create project with name + description
2. Add nodes and connections to canvas
3. Click Save button
4. Refresh page and verify project loads
5. Modify project and save again
6. Delete project and verify removal

### Error Cases
1. Invalid credentials → shows error message
2. Network error → shows connection error
3. Expired token → shows re-login prompt
4. Duplicate project name → shows backend error

## Future Enhancements

- [ ] Real-time collaboration (WebSocket)
- [ ] Project sharing and permissions
- [ ] Team management
- [ ] Export to Mermaid/PlantUML
- [ ] Import from other tools
- [ ] Undo/redo history UI
- [ ] Project templates
- [ ] Dark mode theme toggle

## Troubleshooting

### Authentication Not Working
- Check backend is running on port 5000
- Verify `.env.local` has correct API URL
- Check browser DevTools → Application → Storage for authToken
- Verify backend database is accessible

### Projects Not Loading
- Ensure user is authenticated
- Check backend API response in Network tab
- Verify database has project records
- Check browser console for errors

### Save Not Working
- Verify backend is running
- Check network requests in DevTools
- Ensure projectId is in URL
- Check backend logs for SQL errors

### Token Issues
- Clear localStorage in DevTools
- Logout and login again
- Check token expiration (default 7 days)
- Verify backend JWT secret is set
