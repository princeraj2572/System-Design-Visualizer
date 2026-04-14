# PostgreSQL Setup Guide for System Design Visualizer

## Problem
The backend cannot connect to PostgreSQL with "password authentication failed for user 'postgres'".

## Solutions

### Option 1: Reset PostgreSQL Password (Recommended)

#### On Windows:

1. **Open PostgreSQL Admin Tools:**
   - Start → "pgAdmin 4" or "PostgreSQL"
   
2. **Connect to localhost:**
   - Use Server: localhost
   - Port:5432
   - User: postgres
   - Password: (try empty or blank)

3. **If pgAdmin doesn't work, use Command Line:**
   ```powershell
   # Stop PostgreSQL service
   net stop postgresql-x64-16
   
   # Start in single-user mode
   "C:\Program Files\PostgreSQL\16\bin\postgres.exe" -D "C:\Program Files\PostgreSQL\16\data" -p 5432
   
   # In another terminal, connect without password
   psql -h localhost -U postgres
   
   # Reset password
   ALTER USER postgres WITH PASSWORD 'postgres';
   ```

4. **Restart PostgreSQL:**
   ```powershell
   net start postgresql-x64-16
   ```

5. **Update .env file:**
   ```
   DB_PASSWORD=postgres
   ```

6. **Restart backend:**
   ```bash
   npm run dev
   ```

### Option 2: Configure Trust Authentication (Development Only)

1. **Edit pg_hba.conf:**
   - Location: `C:\Program Files\PostgreSQL\16\data\pg_hba.conf`
   
2. **Change these lines:**
   ```
   FROM:
   local   all             all                                     scram-sha-256
   host    all             all             127.0.0.1/32            scram-sha-256
   
   TO:
   local   all             all                                     trust
   host    all             all             127.0.0.1/32            trust
   ```

3. **Restart PostgreSQL:**
   ```powershell
   net stop postgresql-x64-16
   net start postgresql-x64-16
   ```

4. **Update .env file:**
   ```
   DB_PASSWORD=
   ```

5. **Restart backend:**
   ```bash
   npm run dev
   ```

### Option 3: Use Docker (Simplest)

If you have Docker installed:

```bash
cd backend
docker-compose up -d
```

This will start PostgreSQL in a container with default credentials already configured.

## Verification

Once configured, you should see this in the backend logs:
```
info: Initializing database...
info: Starting database migrations...
info: Migration completed: create_users_table
info: Migration completed: create_projects_table
info: Migration completed: create_project_shares_table
info: Migration completed: create_audit_logs_table
info: All migrations completed successfully
info: Database initialized successfully
info: Server running on port 5000
```

## Still Having Issues?

1. **Check PostgreSQL is running:**
   ```powershell
   tasklist | findstr postgres
   ```

2. **Verify port 5432 is open:**
   ```powershell
   netstat -ano | findstr 5432
   ```

3. **Try connecting manually:**
   ```powershell
   psql -h localhost -U postgres -d postgres
   ```

## For Frontend Testing Without Backend Database

The frontend can still be tested without a working database:
- Home page: ✓ Works
- Login/Register: Shows API error dialog (expected)
- Project pages: Will redirect to login

Set up the database when ready to test full functionality.
