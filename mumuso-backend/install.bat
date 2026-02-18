@echo off
echo === Mumuso Backend Setup ===
cd /d c:\Professional\mumuso\mumuso-backend
echo Installing dependencies...
call npm install
echo Generating Prisma client...
call npx prisma generate
echo.
echo === Setup Complete ===
echo Next steps:
echo   1. Copy .env.example to .env.development and configure
echo   2. Start PostgreSQL and Redis (or run: docker-compose up -d postgres redis)
echo   3. Run migrations: npx prisma migrate dev
echo   4. Seed database: npx prisma db seed
echo   5. Start dev server: npm run dev
pause
