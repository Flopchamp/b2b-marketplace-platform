# PostgreSQL Setup Instructions

## Option 1: Local PostgreSQL Installation

### Windows:
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the 'postgres' user
4. PostgreSQL will run on port 5432 by default

### After Installation:
1. Open pgAdmin or psql command line
2. Create the database:
   ```sql
   CREATE DATABASE b2b_marketplace;
   ```
3. Connect to the database and run the schema.sql file

## Option 2: Docker (Recommended for Development)

### Start PostgreSQL with Docker:
```bash
docker run --name b2b-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=b2b_marketplace \
  -p 5432:5432 \
  -d postgres:15
```

### Connect and run schema:
```bash
# Copy schema to container
docker cp database/schema.sql b2b-postgres:/schema.sql

# Execute schema
docker exec -it b2b-postgres psql -U postgres -d b2b_marketplace -f /schema.sql
```

## Option 3: Cloud PostgreSQL (Production)

### Popular Options:
- **Supabase** (Free tier): https://supabase.com/
- **Neon** (Free tier): https://neon.tech/
- **Railway** (Free tier): https://railway.app/
- **AWS RDS** (Paid): https://aws.amazon.com/rds/

### Update Environment:
Replace the DATABASE_URL in .env.local with your cloud database URL:
```
DATABASE_URL=postgresql://username:password@host:port/database_name
```

## Verification Steps:

1. **Test Connection:**
   ```bash
   npm run dev
   ```
   Check console for any database connection errors.

2. **Test Registration:**
   Use Postman to register a company/retailer.
   
3. **Check Database:**
   ```sql
   SELECT * FROM users;
   SELECT * FROM companies;
   SELECT * FROM retailers;
   ```

## Troubleshooting:

### Connection Issues:
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify credentials
- Check firewall settings

### Permission Issues:
- Grant proper permissions to database user
- Ensure database exists
- Check schema creation

### SSL Issues (Production):
Add `?sslmode=require` to DATABASE_URL for production databases.
