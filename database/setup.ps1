# B2B Marketplace Database Setup Script for Windows

Write-Host "🗄️  Setting up PostgreSQL for B2B Marketplace..." -ForegroundColor Green

# Check if Docker is available
$dockerAvailable = Get-Command docker -ErrorAction SilentlyContinue

if ($dockerAvailable) {
    Write-Host "🐳 Docker found. Starting PostgreSQL container..." -ForegroundColor Blue
    
    # Stop and remove existing container if it exists
    docker stop b2b-postgres 2>$null
    docker rm b2b-postgres 2>$null
    
    # Start new PostgreSQL container
    docker run --name b2b-postgres `
        -e POSTGRES_PASSWORD=yourpassword `
        -e POSTGRES_DB=b2b_marketplace `
        -p 5432:5432 `
        -d postgres:15
    
    Write-Host "⏳ Waiting for PostgreSQL to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Copy and execute schema
    Write-Host "📋 Creating database schema..." -ForegroundColor Blue
    docker cp database/schema.sql b2b-postgres:/schema.sql
    docker exec -it b2b-postgres psql -U postgres -d b2b_marketplace -f /schema.sql
    
    Write-Host "✅ PostgreSQL setup complete!" -ForegroundColor Green
    Write-Host "📊 Database URL: postgresql://postgres:yourpassword@localhost:5432/b2b_marketplace" -ForegroundColor Cyan
    
} else {
    Write-Host "❌ Docker not found. Please install Docker or set up PostgreSQL manually." -ForegroundColor Red
    Write-Host "📖 See database/setup-instructions.md for manual setup steps." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Green
Write-Host "1. Update your .env.local with the correct DATABASE_URL" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start the application" -ForegroundColor White
Write-Host "3. Test registration with Postman" -ForegroundColor White
