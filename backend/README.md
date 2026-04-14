# System Design Visualizer Backend

## Overview

Production-ready REST API backend for the System Design Visualizer. Built with Express, TypeScript, PostgreSQL, and Redis.

## Features

- **User Management**: Registration, authentication, JWT-based authorization
- **Project Management**: Create, read, update, delete system architecture projects
- **Real-time Caching**: Redis integration for performance optimization
- **Type Safety**: Full TypeScript support with strict mode
- **Error Handling**: Comprehensive error handling with custom error classes
- **Logging**: Structured logging with Winston
- **Validation**: Request validation with Joi schemas

## Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Edit .env with your database credentials
# Run database migrations and setup
npm run setup

# Start development server
npm run dev
```

## Docker Setup

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run migrations
docker-compose exec backend npm run setup
```

## Environment Variables

See `.env.example` for all required variables:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default 5000)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - PostgreSQL config
- `REDIS_HOST`, `REDIS_PORT` - Redis config
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Allowed origins for CORS

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── models/           # TypeScript types
│   ├── middleware/       # Express middleware
│   ├── validators/       # Input validation schemas
│   ├── utils/            # Utility functions
│   ├── migrations/       # Database migrations
│   ├── setup.ts          # Setup script
│   └── index.ts          # Application entry point
├── dist/                 # Compiled JavaScript
├── .env.example          # Environment template
├── package.json
├── tsconfig.json
├── openapi.yaml          # API documentation
└── docker-compose.yml    # Docker configuration
```

## API Documentation

Complete OpenAPI specification in [openapi.yaml](./openapi.yaml)

### Key Endpoints

**Authentication**:
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - Login user
- `GET /api/v1/users/profile` - Get user profile (protected)
- `PUT /api/v1/users/profile` - Update user profile (protected)

**Projects**:
- `POST /api/v1/projects` - Create project (protected)
- `GET /api/v1/projects` - List user projects (protected, paginated)
- `GET /api/v1/projects/:id` - Get project details (protected)
- `PUT /api/v1/projects/:id` - Update project (protected)
- `DELETE /api/v1/projects/:id` - Delete project (protected)
- `GET /api/v1/projects/:id/export` - Export project as JSON (protected)

### Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <jwt-token>
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(30) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  nodes JSONB DEFAULT '[]',
  edges JSONB DEFAULT '[]',
  version VARCHAR(20) DEFAULT '1.0.0',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Development

### Available Scripts

```bash
npm run dev           # Start development server with auto-reload
npm run build         # Compile TypeScript to JavaScript
npm run setup         # Run database migrations
npm start             # Start production server
npm run typecheck     # Check TypeScript types
npm run lint          # Run ESLint
npm test              # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Error Handling

The backend uses custom error classes for consistent error responses:

```typescript
import { AppError, AuthenticationError, ValidationError } from '@/utils/errors';

// Throw errors that will be automatically formatted
throw new ValidationError('Invalid input');
throw new AuthenticationError('Invalid credentials');
throw new AppError('Something went wrong', 500);
```

### Database Migrations

Migrations run automatically on server startup:

```typescript
import { runMigrations } from '@/migrations';

// All migrations are idempotent and safe to run multiple times
await runMigrations();
```

## Production Deployment

### Build and Deploy

```bash
# Build for production
npm run build

# Set environment variables in production
export NODE_ENV=production
export JWT_SECRET=your-secret-key

# Start server
npm start
```

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET`
- [ ] Configure PostgreSQL connection pool
- [ ] Enable Redis connection
- [ ] Setup CORS origins
- [ ] Enable HTTPS
- [ ] Configure logging and monitoring
- [ ] Setup database backups
- [ ] Configure health checks
- [ ] Setup rate limiting in production

### Scaling

- **Horizontal**: Use load balancer in front of multiple instances
- **Database**: PostgreSQL connection pooling with PgBouncer
- **Caching**: Redis for session and project data
- **API**: REST API is stateless and horizontally scalable

## Monitoring & Logging

### Winston Logger

```typescript
import logger from '@/utils/logger';

logger.info('User registered', { userId: user.id });
logger.error('Database error', error);
logger.warn('High memory usage', { memory: process.memoryUsage() });
```

### Metrics to Track

- Request response times
- Error rates by endpoint
- Database query performance
- Redis cache hit rates
- Active user sessions
- Project data size

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT - See LICENSE file

## Support

For issues and questions, visit: https://github.com/princeraj2572/System-Design-Visualizer
