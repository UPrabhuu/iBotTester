# API Connection Test Documentation

## Overview

This document provides steps to verify that the frontend UI is properly connected to the backend API.

## Connection Components

### 1. API Service Layer

**File:** `apps/frontend/services/api.ts`

This file provides a centralized API service layer that handles all communication between the frontend and backend.

**Features:**

- Centralized API endpoint configuration
- Type-safe request/response handling
- Error handling
- Support for all backend routes

**Available APIs:**

- `api.auth` - Authentication (login, register, logout, forgot password)
- `api.settings` - User settings (profile, payment, integrations)
- `api.projects` - Project management
- `api.testCases` - Test case management
- `api.executions` - Test execution
- `api.dashboard` - Dashboard data
- `api.chat` - AI chat functionality
- `api.config` - Configuration management
- `api.health` - Health check

### 2. Connection Status Component

**File:** `apps/frontend/components/ConnectionStatus.tsx`

A visual component that shows the real-time connection status between frontend and backend.

**Features:**

- Real-time connection monitoring
- Auto-refresh every 30 seconds
- Manual refresh button
- Backend feature detection (Playwright, OpenAI)
- Error messages with troubleshooting steps

### 3. Environment Configuration

**File:** `apps/frontend/.env`

Contains the backend API URL configuration:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## How to Verify Connection

### Step 1: Start the Backend Server

```bash
cd apps/backend
npm run dev
```

The backend should start on port 3001. You should see:

```
Server running on port 3001
```

### Step 2: Start the Frontend Server

```bash
cd apps/frontend
npm run dev
```

The frontend should start on port 3000.

### Step 3: Check Connection Status

1. Open the application at http://localhost:3000
2. Login to the application
3. Navigate to **Settings** from the sidebar
4. Click on **Connection Status** in the settings menu
5. You should see:
   - ✅ Backend API: **Connected** (green badge)
   - Backend URL: http://localhost:3001
   - Backend Features: Playwright and OpenAI status

### Step 4: Test Backend Health Endpoint

You can manually test the backend health endpoint:

```bash
curl http://localhost:3001/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2025-01-14T...",
  "services": {
    "api": "running",
    "playwright": "available",
    "openai": "configured" or "not configured"
  }
}
```

### Step 5: Test Backend Root Endpoint

```bash
curl http://localhost:3001
```

Expected response:

```json
{
  "message": "iBotTester API Server",
  "version": "2.0.0",
  "status": "running",
  "features": {
    "playwright": true,
    "openai": true or false
  },
  "endpoints": {
    "auth": "/api/auth",
    "projects": "/api/projects",
    "tests": "/api/test-cases",
    ...
  }
}
```

## Troubleshooting

### Frontend Shows "Disconnected"

**Possible Causes:**

1. Backend server is not running
2. Backend is running on a different port
3. CORS is blocking the request
4. Network firewall is blocking the connection

**Solutions:**

1. Make sure backend is running: `cd apps/backend && npm run dev`
2. Check backend logs for errors
3. Verify `.env` file has correct `NEXT_PUBLIC_API_URL`
4. Check browser console for CORS errors
5. Try restarting both frontend and backend

### Connection Status Shows "Checking..." Forever

**Possible Causes:**

1. Backend endpoint is not responding
2. Network timeout
3. Incorrect API URL in environment variables

**Solutions:**

1. Check if backend is accessible: `curl http://localhost:3001/api/health`
2. Verify `.env` file exists and has correct URL
3. Check browser network tab for failed requests
4. Try manual refresh button in Connection Status

### Features Show as Unavailable

**OpenAI Not Configured:**

- This is normal if you haven't set up `OPENAI_API_KEY` in backend `.env`
- OpenAI is optional - the app works without it

**Playwright Not Available:**

- Check backend logs for Playwright installation errors
- Run: `cd apps/backend && npx playwright install`

## Integration Examples

### Using API Service in Components

```typescript
import api from "../services/api";

// Login example
const handleLogin = async (email: string, password: string) => {
  const response = await api.auth.login({ email, password });

  if (response.success && response.data) {
    // Login successful
    const { user, token } = response.data;
    localStorage.setItem("token", token);
    setUser(user);
  } else {
    // Login failed
    alert(response.error);
  }
};

// Get user profile
const loadProfile = async () => {
  const response = await api.settings.getProfile();

  if (response.success && response.data) {
    setProfile(response.data);
  }
};
```

## Current Status

### ✅ Implemented:

- API service layer with all endpoints
- Connection status monitoring component
- Environment configuration
- Health check endpoint
- Error handling and retry logic

### 🔄 Next Steps:

- Integrate API calls into existing components (LoginView, SettingsView, etc.)
- Add authentication token management
- Implement real data fetching instead of mock data
- Add loading states and error boundaries
- Set up API request interceptors for auth tokens

## Backend Routes Available

| Route                        | Method  | Purpose                    |
| ---------------------------- | ------- | -------------------------- |
| `/api/auth/login`            | POST    | User login                 |
| `/api/auth/register`         | POST    | User registration          |
| `/api/auth/logout`           | POST    | User logout                |
| `/api/auth/forgot-password`  | POST    | Password reset request     |
| `/api/projects`              | GET     | Get all projects           |
| `/api/projects/:id`          | GET     | Get project by ID          |
| `/api/test-cases`            | GET     | Get all test cases         |
| `/api/test-cases/:id`        | GET     | Get test case by ID        |
| `/api/executions`            | GET     | Get all executions         |
| `/api/executions`            | POST    | Execute a test             |
| `/api/dashboard/stats`       | GET     | Get dashboard statistics   |
| `/api/settings/profile`      | GET/PUT | Get/update user profile    |
| `/api/settings/payment`      | GET/PUT | Get/update payment details |
| `/api/settings/integrations` | GET     | Get integrations           |
| `/api/config`                | GET/PUT | Get/update configuration   |
| `/api/chat`                  | POST    | Send chat message          |
| `/api/health`                | GET     | Health check               |

## Notes

- The frontend currently uses **mock data** for all operations
- Backend has route handlers configured but may need database integration
- Connection monitoring works independently of actual data operations
- All components can be updated incrementally to use real API calls
