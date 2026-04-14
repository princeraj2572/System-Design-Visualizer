# System Design Visualizer - Database Setup Required

## Current Status

✅ **Frontend Server:** Running on http://localhost:3000 (Next.js)
✅ **Backend Server:** Running on http://localhost:5000 (Express.js)
❌ **PostgreSQL Database:** Not connected (Authentication required)

## What's Working Now

You can access:
- **Home page:** http://localhost:3000
- **API health check:** http://localhost:5000/health
- **Frontend UI:** Fully functional
- **Project canvas:** Fully functional (data not persisted without DB)

## What's NOT Working (Requires Database)

- User registration
- User login
- Project creation & saving
- Project loading from database
- All backend API endpoints that use the database

## Why the Error Occurred

The PostgreSQL database requires authentication, and the default password wasn't set up correctly. The error `"password authentication failed for user postgres"` indicates:

1. PostgreSQL is installed and running ✓
2. But we can't authenticate with the configured credentials ✗

## How to Fix It

Choose ONE option below:

### Option 1: Reset PostgreSQL Password (Recommended for Windows)

Search your computer for "SQL Shell (psql)" or "pgAdmin 4" and open it:

**In SQL Shell:**
```sql
ALTER USER postgres WITH PASSWORD 'postgres';
```

Then restart the backend:
```bash
npm run dev
```

### Option 2: Configure Trust Authentication

1. Open: `C:\Program Files\PostgreSQL\16\data\pg_hba.conf`

2. Find these lines (around line 85-95):
```
local   all             all                                     scram-sha-256
host    all             all             127.0.0.1/32            scram-sha-256
```

3. Change them to:
```
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
```

4. Save the file

5. In Services, restart PostgreSQL:
   - Press Windows Key + R
   - Type: `services.msc`
   - Find: "postgresql-x64-16"
   - Right-click → Restart

6. Restart the backend:
```bash
npm run dev
```

### Option 3: Use Docker (Simplest)

If you have Docker Desktop installed:

```bash
cd backend
docker-compose up -d
```

## Testing After Setup

Once the database is connected, you should see:

```
info: Initializing database...
info: Starting database migrations...
info: Migration completed: create_users_table
info: Migration completed: create_projects_table
info: All migrations completed successfully
info: Server running on port 5000
```

Then you can test:
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Create a new account
4. Create and save projects

## File Locations

- **Backend config:** `backend/.env`
- **PostgreSQL setup guide:** `POSTGRESQL_SETUP.md`
- **Database creation script:** `backend/create-database.js`

## Questions?

Check these files:
- `POSTGRESQL_SETUP.md` - Detailed troubleshooting
- `backend/src/migrations/index.ts` - Database schema
- `backend/src/config/database.ts` - Database configuration

## Next Steps

1. Choose and complete ONE of the setup options above
2. Restart the backend server
3. Test account creation at http://localhost:3000
4. Start designing! ✨
