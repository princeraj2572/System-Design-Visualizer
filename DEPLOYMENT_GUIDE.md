# System Design Visualizer - Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the System Design Visualizer to production environments.

## Pre-Deployment Requirements

### System Requirements
- Node.js 18+ 
- PostgreSQL 12+
- Redis 6+ (optional, for caching)
- Docker and Docker Compose (for containerized deployment)
- 2GB RAM minimum
- 10GB disk space minimum

### Environment Preparation
1. Ensure all dependencies are installed
2. Run database migrations
3. Configure environment variables
4. Test database connectivity
5. Verify Redis connectivity (if using)

## Deployment Options

### Option 1: Traditional Server Deployment

#### 1. Prepare Application
```bash
# Frontend
cd /app
npm run build
npm run start

# Backend (in separate terminal/process)
cd backend
npm run build
npm start
```

#### 2. Configure Web Server (Nginx)
```nginx
server {
  listen 80;
  server_name your-domain.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
  }
}
```

#### 3. Setup SSL with Certbot
```bash
sudo certbot certonly --webroot -w /var/www/html -d your-domain.com
```

### Option 2: Docker Deployment

#### 1. Build Images
```bash
# Build frontend image
docker build -t system-visualizer-frontend .

# Build backend image
docker build -t system-visualizer-backend ./backend
```

#### 2. Deploy with Docker Compose
```bash
docker-compose up -d
```

The docker-compose.yml includes:
- Frontend service (Next.js on port 3000)
- Backend service (Express.js on port 3001)
- PostgreSQL database
- Redis cache (optional)

#### 3. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Option 3: Cloud Deployment

#### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Heroku (Backend)
```bash
# Login
heroku login

# Create app
heroku create system-visualizer-api

# Deploy
git push heroku main
```

## Environment Configuration

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_WS_URL=wss://api.your-domain.com
NEXT_PUBLIC_APP_ENV=production
```

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@db:5432/visualizer
REDIS_URL=redis://cache:6379
JWT_SECRET=your-secure-random-string
JWT_EXPIRY=7d
CORS_ORIGIN=https://your-domain.com
```

## Database Setup

### 1. Create Database
```bash
createdb system_visualizer
```

### 2. Run Migrations
```bash
cd backend
npm run migrate
```

### 3. Verify Schema
```sql
\dt  -- List all tables
\d users  -- Show users table structure
```

## Backup Strategy

### Daily Backups
```bash
# PostgreSQL backup
pg_dump system_visualizer > backup_$(date +\%Y\%m\%d).sql

# Store in cloud (AWS S3, Azure Blob, etc.)
aws s3 cp backup_*.sql s3://my-backups/
```

### Restore from Backup
```bash
psql system_visualizer < backup_20240415.sql
```

## Monitoring & Logging

### Application Logging
- Winston configured for server-side logging
- Logs stored in: backend/logs/
- Rotation enabled (daily, 14 day retention)

### System Monitoring
```bash
# Check application health
curl https://your-domain.com/health

# Monitor Docker containers
docker stats

# View logs
docker logs -f container_name
```

### Performance Monitoring
1. Set up New Relic or DataDog
2. Configure error tracking with Sentry
3. Set up uptime monitoring
4. Configure alerting thresholds

## Scaling Considerations

### Horizontal Scaling
1. Load balance across multiple frontend instances
2. Scale backend API horizontally
3. Use sticky sessions for authentication
4. Share Redis cache across instances

### Database Scaling
1. Implement read replicas for scaling read operations
2. Use connection pooling
3. Archive old audit logs
4. Index optimization for large tables

## Security Checklist

- [ ] All traffic uses HTTPS (SSL/TLS)
- [ ] Database credentials not in code
- [ ] JWT secrets properly randomized
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers set (CSP, X-Frame-Options, etc.)
- [ ] Dependencies up to date
- [ ] Security scanning enabled
- [ ] Penetration testing completed
- [ ] Data encryption enabled

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql -h localhost -U postgres -d system_visualizer

# Check connection pool
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;
```

### High Memory Usage
```bash
# Check Node process memory
node --max-old-space-size=2048 server.js

# Monitor in production
free -h
```

### Performance Issues
```bash
# Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;

# Check indexes
SELECT * FROM pg_stat_user_indexes;
```

## Rollback Plan

### If Deployment Fails
1. Revert to previous Docker image
2. Restore database from latest backup
3. Clear Redis cache if needed
4. Test all critical flows

### Quick Rollback Commands
```bash
# Revert container
docker-compose down
docker-compose up -d  # Uses previous image

# Restore database
psql system_visualizer < backup_previous.sql

# Clear cache if needed
redis-cli FLUSHALL
```

## Post-Deployment Verification

### Day 1
- [ ] Monitor error rates
- [ ] Check database health
- [ ] Verify all API endpoints
- [ ] Test user registration/login
- [ ] Create test project
- [ ] Run performance tests

### Week 1
- [ ] Monitor system performance
- [ ] Collect user feedback
- [ ] Verify backups working
- [ ] Check security logs
- [ ] Monitor error trends

### Month 1
- [ ] Performance analysis
- [ ] Security audit
- [ ] Database optimization
- [ ] User engagement metrics
- [ ] Plan improvements

## Support & Maintenance

### Regular Maintenance
- Update dependencies monthly
- Run security scans
- Archive old logs
- Test backup restoration
- Performance optimization

### Update Procedure
```bash
# Test on staging first
git pull origin main
npm install
npm run build

# Deploy to production
docker-compose up -d --build
```

## Contact & Escalation

For deployment issues:
1. Check logs: `docker logs <container_name>`
2. Review monitoring dashboards
3. Check database health
4. Review error tracking (Sentry, etc.)
5. Contact DevOps team if needed

## Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [PostgreSQL Backup Guide](https://www.postgresql.org/docs/current/backup.html)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
