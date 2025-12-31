# OAuth Setup Guide for iBotTester

This guide will help you set up Google and GitHub OAuth authentication for iBotTester.

## Prerequisites

- Google Cloud Console account
- GitHub account
- PostgreSQL database running

## Setup Steps

### 1. Database Migration

The database schema has been updated to support OAuth. Run the migration:

```bash
cd apps/backend
npm run prisma:migrate
```

### 2. Google OAuth Setup

#### Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure OAuth consent screen if prompted:
   - Choose **External** for user type
   - Fill in application name: "iBotTester"
   - Add your email as support email
   - Add authorized domains if needed
6. Select **Web application** as application type
7. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback` (development)
   - Your production callback URL (e.g., `https://yourdomain.com/api/auth/google/callback`)
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

#### Update Backend .env

Add to `apps/backend/.env`:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

### 3. GitHub OAuth Setup

#### Create OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the form:
   - **Application name**: iBotTester
   - **Homepage URL**: `http://localhost:3000` (development) or your production URL
   - **Authorization callback URL**: `http://localhost:3001/api/auth/github/callback` (development)
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy it

#### Update Backend .env

Add to `apps/backend/.env`:

```env
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
```

### 4. Configure Frontend URL

Add to `apps/backend/.env`:

```env
FRONTEND_URL=http://localhost:3000
```

### 5. Configure Session Secret

Add a secure session secret to `apps/backend/.env`:

```env
SESSION_SECRET=generate-a-random-string-at-least-32-chars
```

To generate a secure secret, run:

```bash
openssl rand -base64 32
```

## Complete .env Example

Your `apps/backend/.env` should look like:

```env
# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=postgresql://ibottester:ibottester123@localhost:5432/ibottester

# JWT & Session Secrets
JWT_SECRET=your-jwt-secret-change-in-production
SESSION_SECRET=your-session-secret-change-in-production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback

# OpenAI (optional)
OPENAI_API_KEY=your-openai-api-key
```

## Testing OAuth Flow

### 1. Start the Backend

```bash
cd apps/backend
npm run dev
```

### 2. Start the Frontend

```bash
cd apps/frontend
npm run dev
```

### 3. Test OAuth Login

1. Navigate to `http://localhost:3000`
2. Click **Continue with Google** or **Continue with GitHub**
3. You'll be redirected to the OAuth provider
4. Authorize the application
5. You'll be redirected back to the app with authentication complete

## How It Works

### OAuth Flow

1. **User clicks OAuth button** → Frontend redirects to backend OAuth endpoint
2. **Backend redirects to OAuth provider** → User sees provider's authorization page
3. **User authorizes** → Provider redirects back to backend callback URL
4. **Backend processes callback**:
   - Exchanges authorization code for user info
   - Creates or updates user in database with:
     - First name
     - Last name
     - Email
     - Provider (google/github)
     - Provider ID
     - Avatar (if available)
   - Generates JWT token
5. **Backend redirects to frontend** → With token and user data in URL params
6. **Frontend stores token** → Saves to localStorage and authenticates user

### Database Schema

The User model includes OAuth fields:

```prisma
model User {
  id            String   @id @default(uuid())
  name          String
  firstName     String?
  lastName      String?
  email         String   @unique
  password      String?  // Optional for OAuth users
  avatar        String?
  provider      String?  // 'local', 'google', 'github'
  providerId    String?  // OAuth provider's user ID
  // ... other fields
}
```

### Security Notes

- OAuth users don't need passwords (password field is empty string)
- JWT tokens are used for API authentication
- Sessions are used temporarily during OAuth flow
- Tokens expire after 24 hours (configurable)
- User data is stored securely in PostgreSQL

## Production Deployment

### Update Callback URLs

1. **Google Cloud Console**:

   - Add production callback: `https://yourdomain.com/api/auth/google/callback`

2. **GitHub OAuth App**:
   - Add production callback: `https://yourdomain.com/api/auth/github/callback`

### Update Environment Variables

```env
FRONTEND_URL=https://yourdomain.com
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
GITHUB_CALLBACK_URL=https://yourdomain.com/api/auth/github/callback
SESSION_SECRET=use-a-strong-random-secret-in-production
JWT_SECRET=use-a-strong-random-secret-in-production
```

### Enable Secure Cookies

Set `NODE_ENV=production` to enable secure cookies.

## Troubleshooting

### "Redirect URI mismatch" error

- Ensure callback URLs match exactly in OAuth provider settings
- Check for http vs https
- Verify port numbers

### "No email found" error

- Ensure OAuth scopes include email permission
- Google: scope includes 'email'
- GitHub: scope includes 'user:email'

### User not created in database

- Check database connection
- Verify Prisma migration ran successfully
- Check backend console for errors

### Session errors

- Ensure SESSION_SECRET is set
- Check CORS configuration allows credentials
- Verify frontend URL matches FRONTEND_URL in backend

## API Endpoints

- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - GitHub OAuth callback
- `POST /api/auth/login` - Traditional email/password login
- `POST /api/auth/register` - Traditional registration
- `GET /api/auth/me` - Get current authenticated user

## Support

For issues or questions, refer to the main documentation or create an issue in the repository.
