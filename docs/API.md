# iBotTester Backend API Documentation

Complete REST API documentation for the iBotTester platform.

**Base URL:** `http://localhost:3001/api`

## Table of Contents

1. [Authentication](#authentication)
2. [Projects](#projects)
3. [Test Management](#test-management)
4. [Test Execution](#test-execution)
5. [Chat & AI](#chat--ai)
6. [Dashboard](#dashboard)
7. [Configuration](#configuration)
8. [Settings](#settings)
9. [Legacy Endpoints](#legacy-endpoints)

---

## Authentication

### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/google
Login with Google OAuth.

**Request:**
```json
{
  "token": "google_oauth_token"
}
```

### POST /auth/github
Login with GitHub OAuth.

**Request:**
```json
{
  "code": "github_oauth_code"
}
```

### POST /auth/logout
Logout current user.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### POST /auth/forgot-password
Request password reset.

**Request:**
```json
{
  "email": "john.doe@example.com"
}
```

### GET /auth/me
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  }
}
```

---

## Projects

All project endpoints require authentication.

### GET /projects
List all projects for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "project-1",
      "name": "E-commerce Testing",
      "description": "E-commerce testing suite",
      "branches": [...],
      "currentBranch": "branch-1",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

### GET /projects/:id
Get project details.

### POST /projects
Create a new project.

**Request:**
```json
{
  "name": "My Test Project",
  "description": "Optional description"
}
```

### PUT /projects/:id
Update a project.

**Request:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

### DELETE /projects/:id
Delete a project.

### GET /projects/:id/branches
List branches for a project.

### POST /projects/:id/branches
Create a new branch.

**Request:**
```json
{
  "name": "feature/new-tests"
}
```

### PUT /projects/:id/branches/:branchId
Switch to a branch.

**Request:**
```json
{
  "setCurrent": true
}
```

---

## Test Management

All test endpoints require authentication.

### GET /test-cases
List test cases with optional filters.

**Query Parameters:**
- `projectId` - Filter by project
- `branchId` - Filter by branch
- `status` - Filter by status (active, inactive, draft)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "test-1",
      "name": "Login Test",
      "description": "Test user login",
      "status": "active",
      "projectId": "project-1",
      "branchId": "branch-1",
      "steps": ["step-1", "step-2"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastModified": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

### GET /test-cases/:id
Get test case details.

### POST /test-cases
Create a new test case.

**Request:**
```json
{
  "name": "New Test Case",
  "description": "Test description",
  "projectId": "project-1",
  "branchId": "branch-1",
  "status": "draft"
}
```

### PUT /test-cases/:id
Update a test case.

### DELETE /test-cases/:id
Delete a test case.

### GET /test-cases/:id/steps
Get test steps for a test case.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "step-1",
      "stepNumber": 1,
      "action": "Click login button",
      "expectedResult": "User should be logged in",
      "elementLocator": "#login-btn",
      "uiSection": "Login Page",
      "testCaseId": "test-1"
    }
  ]
}
```

### POST /test-cases/:id/steps
Add a test step.

**Request:**
```json
{
  "action": "Enter username",
  "expectedResult": "Username should be entered",
  "elementLocator": "#username",
  "uiSection": "Login Page",
  "stepNumber": 1
}
```

### PUT /test-steps/:id
Update a test step.

### DELETE /test-steps/:id
Delete a test step.

---

## Test Execution

All execution endpoints require authentication.

### GET /executions
List test executions with optional filters.

**Query Parameters:**
- `projectId` - Filter by project
- `branchId` - Filter by branch
- `status` - Filter by status (running, passed, failed, pending)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "exec-1",
      "suiteName": "Login Flow",
      "labels": ["smoke", "authentication"],
      "status": "passed",
      "timestamp": "2024-01-15T10:00:00.000Z",
      "duration": 45000,
      "results": "All tests passed",
      "triggeredBy": "john.doe@example.com",
      "projectId": "project-1",
      "branchId": "branch-1"
    }
  ]
}
```

### GET /executions/:id
Get execution details.

### POST /executions
Create and run a test execution.

**Request:**
```json
{
  "testCaseId": "test-1",
  "projectId": "project-1",
  "branchId": "branch-1"
}
```

### POST /executions/:id/rerun
Re-run a previous execution.

### DELETE /executions/:id
Delete an execution.

### GET /executions/:id/logs
Get execution logs.

**Response:**
```json
{
  "success": true,
  "data": [
    "[INFO] Starting test execution",
    "[INFO] Navigating to target URL",
    "[SUCCESS] Test completed successfully"
  ]
}
```

### GET /executions/:id/screenshots
Get execution screenshots.

---

## Chat & AI

All chat endpoints require authentication.

### GET /chat/history
Get chat history for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "chat-1",
      "title": "Nike Checkout Flow",
      "userId": "user-1",
      "projectId": "project-1",
      "timestamp": "2024-01-15T10:00:00.000Z",
      "lastMessageAt": "2024-01-15T10:05:00.000Z"
    }
  ]
}
```

### GET /chat/:id
Get a specific chat conversation with messages.

**Response:**
```json
{
  "success": true,
  "data": {
    "chat": { ... },
    "messages": [
      {
        "id": "msg-1",
        "chatId": "chat-1",
        "type": "user",
        "content": "Create a login test",
        "timestamp": "2024-01-15T10:00:00.000Z"
      },
      {
        "id": "msg-2",
        "chatId": "chat-1",
        "type": "agent",
        "content": "I'll help you create a login test...",
        "timestamp": "2024-01-15T10:00:05.000Z",
        "steps": [...],
        "status": "completed"
      }
    ]
  }
}
```

### POST /chat/new
Create a new chat.

**Request:**
```json
{
  "title": "New Chat",
  "projectId": "project-1"
}
```

### POST /chat/message
Send a message to AI assistant.

**Request:**
```json
{
  "chatId": "chat-1",
  "content": "Create a test for login functionality"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chatId": "chat-1",
    "userMessage": { ... },
    "agentMessage": {
      "id": "msg-2",
      "type": "agent",
      "content": "I've created a test plan...",
      "steps": [
        {
          "id": "step1",
          "description": "Analyzing requirements",
          "status": "success"
        }
      ]
    }
  }
}
```

### DELETE /chat/:id
Delete a chat conversation.

---

## Dashboard

All dashboard endpoints require authentication.

### GET /dashboard/metrics
Get dashboard metrics for projects.

**Query Parameters:**
- `projectId` - Filter by specific project (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTests": 245,
    "passRate": 94.2,
    "avgDuration": 45300,
    "activeSuites": 12,
    "executionTrends": [...],
    "recentActivity": [...],
    "slowestTests": [...],
    "testDistribution": {
      "passed": 230,
      "failed": 12,
      "skipped": 3,
      "running": 0
    }
  }
}
```

### GET /dashboard/activity
Get recent activity.

**Query Parameters:**
- `projectId` - Filter by project (optional)
- `limit` - Number of results (default: 20)

### GET /dashboard/trends
Get execution trends.

**Query Parameters:**
- `projectId` - Filter by project (optional)
- `days` - Number of days (default: 7)

---

## Configuration

All configuration endpoints require authentication.

### GET /config/:projectId
Get project configuration.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "config-1",
    "projectId": "project-1",
    "environment": {
      "baseUrl": "https://example.com",
      "credentials": {
        "username": "test@example.com",
        "password": "********"
      }
    },
    "browser": {
      "type": "chromium",
      "headless": false,
      "viewport": {
        "width": 1280,
        "height": 720
      }
    },
    "execution": {
      "timeout": 30000,
      "retries": 2,
      "screenshots": true,
      "video": true
    }
  }
}
```

### PUT /config/:projectId
Update project configuration.

**Request:**
```json
{
  "environment": {
    "baseUrl": "https://new-url.com"
  },
  "browser": {
    "type": "chromium",
    "headless": true
  }
}
```

---

## Settings

All settings endpoints require authentication.

### GET /settings/profile
Get user profile.

### PUT /settings/profile
Update user profile.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "company": "Tech Corp",
  "role": "QA Engineer"
}
```

### PUT /settings/password
Change password.

**Request:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

### GET /settings/integrations
Get available integrations.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Jira",
      "icon": "🎯",
      "connected": false,
      "config": {}
    },
    {
      "name": "Slack",
      "icon": "💬",
      "connected": true,
      "config": {
        "workspace": "tech-corp"
      }
    }
  ]
}
```

### POST /settings/integrations
Connect an integration.

**Request:**
```json
{
  "name": "Slack",
  "config": {
    "workspace": "my-workspace",
    "apiKey": "xoxb-****"
  }
}
```

### DELETE /settings/integrations/:name
Disconnect an integration.

---

## Legacy Endpoints

These endpoints are maintained for backward compatibility.

### POST /api/test-plan
Create a test plan using AI.

**Request:**
```json
{
  "prompt": "Test login functionality on example.com"
}
```

**Response:**
```json
{
  "success": true,
  "testPlan": {
    "id": "test-1234567890",
    "prompt": "Test login functionality on example.com",
    "steps": [
      "Navigate to the target website",
      "Perform the requested action",
      "Validate the expected result"
    ],
    "status": "created",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### POST /api/execute-test
Execute a test with Playwright.

**Request:**
```json
{
  "testPlanId": "test-1234567890",
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "execution": {
    "id": "exec-1234567890",
    "testPlanId": "test-1234567890",
    "url": "https://example.com",
    "title": "Example Domain",
    "screenshot": "data:image/png;base64,...",
    "status": "completed",
    "timestamp": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

To get a token, use the `/api/auth/login` endpoint.

---

## Mock Data

The backend currently uses in-memory mock data for development. All data is reset when the server restarts. Mock users:

**Default User:**
- Email: `john.doe@example.com`
- Password: `password123`

**Alternative User:**
- Email: `jane.smith@example.com`
- Password: `password123`
