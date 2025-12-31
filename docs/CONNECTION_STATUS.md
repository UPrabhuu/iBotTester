# Frontend-Backend-Database Connection Report

## Status Overview

Generated: December 30, 2025

### 🔍 Connection Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Frontend   │ ──────> │   Backend   │ ──────> │  Database   │
│  (Next.js)  │  HTTP   │  (Express)  │  Prisma │ (PostgreSQL)│
│  Port 3000  │         │  Port 3001  │         │  Port 5432  │
└─────────────┘         └─────────────┘         └─────────────┘
```

---

## ✅ Configuration Status

### 1. Frontend Configuration

**Location:** `apps/frontend/services/api.ts`

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
```

- ✅ API endpoint properly configured
- ✅ Using environment variable `NEXT_PUBLIC_API_URL`
- ✅ Fallback to `http://localhost:3001`
- ✅ CORS-ready API calls with proper headers

**Frontend Package:** `apps/frontend/package.json`

- Framework: Next.js 16.1.1-canary.9
- React: 19.0.0
- Port: 3000 (default)

---

### 2. Backend Configuration

**Location:** `apps/backend/server.ts`

```typescript
const PORT = process.env.PORT || 3001;
```

**Key Features:**

- ✅ Express.js server
- ✅ CORS enabled for cross-origin requests
- ✅ Prisma Client for database access
- ✅ OpenAI integration (optional)
- ✅ Playwright integration for testing
- ✅ Health check endpoint: `/api/health`
- ✅ Agent system endpoints

**Backend Package:** `apps/backend/package.json`

- Dependencies: Express, Prisma, Playwright, OpenAI
- Database Adapter: @prisma/adapter-pg
- Node Requirement: 20.19+ (updated from 18)

**API Endpoints:**

```
GET  /                          - API info
GET  /api/health                - Health check
POST /api/auth/login            - Authentication
POST /api/auth/register         - User registration
GET  /api/projects              - Project list
POST /api/test-plan             - Generate test plan
POST /api/execute-test          - Execute test
POST /api/execute-test-plan     - Execute test plan
POST /api/orchestrated-test     - Full agent flow
```

---

### 3. Database Configuration

**Location:** `apps/backend/prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
}
```

**Connection String Format:**

```
DATABASE_URL=postgresql://ibottester:ibottester123@localhost:5432/ibottester
```

**Database Models (9 total):**

1. User
2. UserSettings
3. Project
4. TestCase
5. TestStep
6. Execution
7. ExecutionStep
8. ChatConversation
9. ChatMessage

**Prisma Client Location:** `apps/backend/src/utils/prisma.ts`

- ✅ Singleton pattern implemented
- ✅ Connection pooling with pg.Pool
- ✅ Graceful shutdown handlers
- ✅ Development logging enabled

---

### 4. Docker Configuration

**Location:** `docker-compose.yml`

**Services:**

1. **postgres:**

   - Image: postgres:15-alpine
   - Port: 5432
   - User: ibottester
   - Password: ibottester123
   - Database: ibottester
   - Health check: pg_isready

2. **backend:**

   - Base Image: node:20-alpine (✅ Updated)
   - Port: 3001
   - Dependencies: postgres (healthy state required)
   - Environment: DATABASE_URL, OPENAI_API_KEY

3. **frontend:**
   - Base Image: node:20-alpine (✅ Updated)
   - Port: 3000
   - Dependencies: backend
   - Environment: NEXT_PUBLIC_API_URL

---

## 🔧 Configuration Issues Fixed

### Issue 1: Node Version Mismatch

**Problem:** Prisma 7.2.0 requires Node.js 20.19+ but Docker images used Node 18

**Solution:**

```diff
# apps/backend/Dockerfile
- FROM node:18-alpine
+ FROM node:20-alpine

# apps/frontend/Dockerfile
- FROM node:18-alpine
+ FROM node:20-alpine
```

**Status:** ✅ Fixed

---

## 🧪 Connection Testing

### Test Script Created

**File:** `test-connections.js`

**Tests Performed:**

1. PostgreSQL TCP connection (port 5432)
2. Backend API connection (HTTP GET /)
3. Backend health endpoint (HTTP GET /api/health)
4. Frontend connection (HTTP GET /)
5. Frontend-Backend API configuration
6. Database schema validation

**Current Results:**

- ✅ PostgreSQL: Accessible on port 5432
- ✅ Database Schema: Configured with 9 models
- ✅ Frontend API Config: Pointing to http://localhost:3001
- ⚠️ Backend: Needs to be started
- ⚠️ Frontend: Needs to be started

---

## 🚀 How to Start Services

### Option 1: Using Docker Compose (Recommended for Production)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option 2: Running Locally (Development)

```bash
# 1. Start PostgreSQL only
docker-compose up -d postgres

# 2. Setup backend environment
cd apps/backend
echo "DATABASE_URL=postgresql://ibottester:ibottester123@localhost:5432/ibottester" > .env
echo "PORT=3001" >> .env

# 3. Run migrations
npx prisma migrate deploy

# 4. Start backend
npm run dev

# 5. In a new terminal, start frontend
cd apps/frontend
npm run dev
```

### Option 3: Using Start Script (Windows)

```bash
# Run the automated startup script
start-services.bat
```

---

## 🔍 Verification Steps

### 1. Check PostgreSQL

```bash
docker-compose ps postgres
# Should show: Up (healthy)
```

### 2. Test Backend API

```bash
curl http://localhost:3001
# Should return: JSON with API info

curl http://localhost:3001/api/health
# Should return: JSON with service status
```

### 3. Test Frontend

```bash
# Open browser to: http://localhost:3000
```

### 4. Run Connection Test

```bash
node test-connections.js
```

**Expected Result:** All 6 tests should pass

---

## 📊 Data Flow

### User Authentication Flow

```
Frontend Login Form
    │
    ├─> POST http://localhost:3001/api/auth/login
    │   {email, password}
    │
    ├─> Backend validates credentials
    │   └─> Query PostgreSQL: SELECT * FROM users WHERE email = ?
    │
    └─> Return JWT token + user data
        └─> Frontend stores token in state/localStorage
```

### Test Execution Flow

```
Frontend Test Panel
    │
    ├─> POST http://localhost:3001/api/test-plan
    │   {prompt, environment, options}
    │
    ├─> Backend AI Agent generates test plan
    │   └─> Save to PostgreSQL: INSERT INTO test_cases
    │
    ├─> POST http://localhost:3001/api/execute-test
    │   {testPlanId, url}
    │
    ├─> Backend Playwright executes test
    │   └─> Save results: INSERT INTO executions
    │
    └─> Return execution results + screenshot
        └─> Frontend displays results
```

---

## 🔐 Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://ibottester:ibottester123@localhost:5432/ibottester
PORT=3001
OPENAI_API_KEY=sk-... (optional)
NODE_ENV=development
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Docker Compose (.env)

```env
POSTGRES_USER=ibottester
POSTGRES_PASSWORD=ibottester123
POSTGRES_DB=ibottester
OPENAI_API_KEY=sk-... (optional)
```

---

## 🐛 Troubleshooting

### Backend won't start

**Error:** `Error: ECONNREFUSED 127.0.0.1:5432`
**Solution:** Start PostgreSQL first

```bash
docker-compose up -d postgres
```

### Frontend can't reach backend

**Error:** `Network Error` or `ERR_CONNECTION_REFUSED`
**Solution:**

1. Check backend is running on port 3001
2. Verify NEXT_PUBLIC_API_URL is set correctly
3. Check CORS settings in backend

### Database migrations fail

**Error:** `Can't reach database server`
**Solution:**

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Verify connection string
echo $DATABASE_URL
```

### Prisma version mismatch

**Error:** `Prisma only supports Node.js versions 20.19+`
**Solution:** Update Dockerfiles to use `node:20-alpine` ✅ Already fixed

---

## 📝 Summary

### ✅ What's Working

- Database schema is properly defined with 9 models
- Frontend API service is configured correctly
- Backend has all necessary routes and middleware
- Docker Compose setup is complete
- Prisma client is properly initialized
- Health check endpoints are available
- Node version compatibility issue is resolved

### ⚠️ What Needs Action

1. Start PostgreSQL: `docker-compose up -d postgres` ✅ Done
2. Start Backend: `cd apps/backend && npm run dev`
3. Start Frontend: `cd apps/frontend && npm run dev`
4. Verify all connections: `node test-connections.js`

### 🎯 Next Steps

1. Set OPENAI_API_KEY if AI features are needed
2. Run `npx prisma studio` to view database
3. Access frontend at http://localhost:3000
4. Test full flow: Login → Create Test → Execute Test
5. Monitor logs for any errors

---

## 📚 Documentation References

- **Frontend:** [apps/frontend/README.md](apps/frontend/README.md)
- **Backend:** [apps/backend/README.md](apps/backend/README.md)
- **API Docs:** [docs/API.md](docs/API.md)
- **Setup Guide:** [docs/SETUP.md](docs/SETUP.md)
- **Architecture:** [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md)

---

**Report Generated By:** Connection Test Script  
**Date:** December 30, 2025  
**Status:** Services configured correctly, ready to start
