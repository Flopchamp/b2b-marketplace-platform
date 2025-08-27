#!/bin/bash

# B2B Marketplace Database Setup Script

echo "🗄️  Setting up PostgreSQL for B2B Marketplace..."

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "🐳 Docker found. Starting PostgreSQL container..."
    
    # Stop and remove existing container if it exists
    docker stop b2b-postgres 2>/dev/null || true
    docker rm b2b-postgres 2>/dev/null || true
    
    # Start new PostgreSQL container
    docker run --name b2b-postgres \
        -e POSTGRES_PASSWORD=yourpassword \
        -e POSTGRES_DB=b2b_marketplace \
        -p 5432:5432 \
        -d postgres:15
    
    echo "⏳ Waiting for PostgreSQL to start..."
    sleep 10
    
    # Copy and execute schema
    echo "📋 Creating database schema..."
    docker cp database/schema.sql b2b-postgres:/schema.sql
    docker exec -it b2b-postgres psql -U postgres -d b2b_marketplace -f /schema.sql
    
    echo "✅ PostgreSQL setup complete!"
    echo "📊 Database URL: postgresql://postgres:yourpassword@localhost:5432/b2b_marketplace"
    
else
    echo "❌ Docker not found. Please install Docker or set up PostgreSQL manually."
    echo "📖 See database/setup-instructions.md for manual setup steps."
fi

echo ""
echo "🚀 Next steps:"
echo "1. Update your .env.local with the correct DATABASE_URL"
echo "2. Run 'npm run dev' to start the application"
echo "3. Test registration with Postman"
