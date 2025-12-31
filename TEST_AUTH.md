# Authentication Testing Guide

## Issues Fixed

### 1. ✅ Error Message Display

- Added proper error message display in both LoginView and RegisterView
- Errors from backend API are now shown directly in the UI with a red alert box
- No more generic alerts - users see specific error messages like "User not found", "Invalid credentials", "User already exists"

### 2. ✅ JSON Parse Error Fix

The "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" error has been fixed by:

- Enhanced API error handling to check Content-Type before parsing JSON
- Added better error messages when server is not reachable
- Improved error handling for non-JSON responses (like HTML error pages)

## Common Error Messages

### Login Errors

- **"Invalid credentials"** - Email or password is incorrect
- **"Unable to connect to server"** - Backend server is not running
- **"Server error: 404 Not Found"** - API endpoint not found

### Registration Errors

- **"User with this email already exists"** - Email is already registered
- **"Password must be at least 6 characters long"** - Password too short
- **"Invalid email format"** - Email format is incorrect
- **"Email, password, first name, and last name are required"** - Missing required fields

## Testing Instructions

### 1. Start the Backend Server

```bash
cd /d/CodeBase/New/iBotTester/apps/backend
npm run dev
```

The server should start on `http://localhost:3001`

### 2. Start the Frontend

```bash
cd /d/CodeBase/New/iBotTester/apps/frontend
npm run dev
```

The frontend should start on `http://localhost:3000`

### 3. Test Registration

1. Open `http://localhost:3000` in your browser
2. Click "Sign up for free"
3. Fill in the registration form:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: password123
   - Confirm Password: password123
4. Check the "I agree to Terms" checkbox
5. Click "Sign up for free" button

**Expected:** User is registered and logged in automatically

### 4. Test Login

1. After registration, logout
2. Try to login with the same credentials
3. Email: john@example.com
4. Password: password123

**Expected:** User is logged in successfully

### 5. Test Error Cases

#### Invalid Login

- Try logging in with wrong password
- **Expected Error:** "Invalid credentials"

#### Duplicate Registration

- Try registering with the same email again
- **Expected Error:** "User with this email already exists"

#### Weak Password

- Try registering with password "123"
- **Expected Error:** "Password must be at least 6 characters long"

#### Server Not Running

- Stop the backend server
- Try to login or register
- **Expected Error:** "Unable to connect to server. Please ensure the backend is running on http://localhost:3001"

## API Endpoints

### POST /api/auth/register

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt-token"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### POST /api/auth/login

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt-token"
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

## Troubleshooting

### Error: "Unexpected token '<'"

**Cause:** Frontend is receiving HTML instead of JSON from the backend
**Solutions:**

1. Ensure backend server is running on port 3001
2. Check NEXT_PUBLIC_API_URL in frontend .env file
3. Verify the API route exists in backend

### Error: "Failed to fetch"

**Cause:** Cannot connect to backend server
**Solutions:**

1. Start the backend server: `cd apps/backend && npm run dev`
2. Check if port 3001 is available
3. Verify CORS is enabled in backend

### Database Errors

**Cause:** Database is not running or migration not applied
**Solutions:**

1. Start PostgreSQL database
2. Run migrations: `cd apps/backend && npx prisma migrate dev`
3. Check database connection in .env file

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ibottester"
JWT_SECRET="your-secret-key"
PORT=3001
```
