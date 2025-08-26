# Development Setup Instructions

## Quick Start (Without External Databases)

For immediate testing, you can run the application in **mock mode** where we simulate the database operations:

1. **Install Dependencies** ✅ (Already done)
   ```bash
   npm install
   ```

2. **Environment Setup**
   - Copy `.env.local` and update it for your environment
   - For testing, you can use mock mode (see below)

3. **Run Development Server** ✅ (Currently running)
   ```bash
   npm run dev
   ```

## Database Setup Options

### Option 1: Mock Mode (Recommended for Testing)
Add this to your `.env.local`:
```
# Mock Mode - No real databases needed
USE_MOCK_DATA=true
```

### Option 2: Local Databases (Production-like)
You'll need to install and run:

**PostgreSQL:**
```bash
# Windows (using Chocolatey)
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/
```

**MongoDB:**
```bash
# Windows (using Chocolatey)  
choco install mongodb

# Or download from: https://www.mongodb.com/try/download/community
```

**Redis:**
```bash
# Windows (using Chocolatey)
choco install redis-64

# Or use Docker:
docker run -d -p 6379:6379 redis:latest
```

### Option 3: Cloud Databases (Easiest)
Update `.env.local` with cloud database URLs:
```
# PostgreSQL (Supabase/Neon/Railway)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# MongoDB (MongoDB Atlas)
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Redis (Upstash/Redis Cloud)
REDIS_URL=redis://user:pass@host:port
```

## Testing Your Authentication

1. **Visit Homepage**: http://localhost:3000
2. **Click "For Companies"** in header
3. **Register a new company account**
4. **Sign in with your credentials**

## Mock Mode Implementation

If you want to test immediately without setting up databases, I can implement mock services that simulate the database operations in memory.

## Next Steps After Testing

1. **Set up real databases** (PostgreSQL + MongoDB + Redis)
2. **Implement dashboard pages** for companies and retailers
3. **Add product management** functionality
4. **Integrate payment processing**

## Support

If you encounter any issues:
1. Check the terminal for error messages
2. Verify your `.env.local` configuration
3. Ensure all dependencies are installed
4. Try restarting the development server
