# Quick Start - OAuth Login

## ⚡ Quick Setup (5 minutes)

### 1. Install Dependencies ✅ (Already Done)

```bash
cd apps/backend
npm install  # OAuth packages already installed
```

### 2. Run Database Migration ✅ (Already Done)

```bash
cd apps/backend
npm run prisma:migrate  # Migration already applied
```

### 3. Get OAuth Credentials

#### Google OAuth (2 minutes)

1. Go to https://console.cloud.google.com/
2. Create project → APIs & Services → Credentials
3. Create OAuth client ID → Web application
4. Authorized redirect URIs: `http://localhost:3001/api/auth/google/callback`
5. Copy Client ID and Client Secret

#### GitHub OAuth (2 minutes)

1. Go to https://github.com/settings/developers
2. New OAuth App
3. Homepage: `http://localhost:3000`
4. Callback URL: `http://localhost:3001/api/auth/github/callback`
5. Copy Client ID and Client Secret

### 4. Configure Environment Variables

Edit `apps/backend/.env`:

```env
# Add these lines (keep existing variables)
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your-random-secret-at-least-32-chars

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
```

Generate a secure session secret:

```bash
openssl rand -base64 32
```

### 5. Start the Application

**Terminal 1 - Backend:**

```bash
cd apps/backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd apps/frontend
npm run dev
```

### 6. Test OAuth Login

1. Open http://localhost:3000
2. Click **"Continue with Google"** or **"Continue with GitHub"**
3. Authorize the application
4. You'll be redirected back and logged in!

## ✅ What's Working

- ✅ Google OAuth login with automatic user creation
- ✅ GitHub OAuth login with automatic user creation
- ✅ User data extraction: firstName, lastName, email
- ✅ Avatar from OAuth provider
- ✅ Automatic JWT token generation
- ✅ Seamless frontend authentication
- ✅ Database persistence

## 📁 Files Modified

### Backend:

- `prisma/schema.prisma` - Added provider, providerId fields
- `src/config/passport.ts` - OAuth strategies (NEW)
- `src/controllers/authController.ts` - OAuth handlers
- `src/routes/auth.ts` - OAuth endpoints
- `server.ts` - Session & passport middleware
- `.env.example` - OAuth configuration

### Frontend:

- `components/LoginView.tsx` - OAuth button handlers
- `pages/index.tsx` - OAuth callback processing

### Documentation:

- `OAUTH_SETUP_GUIDE.md` - Detailed setup guide
- `OAUTH_IMPLEMENTATION.md` - Technical implementation details
- `QUICK_START_OAUTH.md` - This file

## 🐛 Troubleshooting

### "Redirect URI mismatch"

- Ensure callback URLs match exactly in OAuth provider settings
- Use `http://localhost:3001` not `http://127.0.0.1`

### "No email found"

- Check OAuth scopes include email permission
- Some GitHub accounts have private emails - make email public

### Database errors

- Ensure PostgreSQL is running
- Run `npm run prisma:generate` in backend

### TypeScript errors

- Run `npm run prisma:generate` to update types
- Restart TypeScript server in VS Code

## 📞 Need Help?

1. Check `OAUTH_SETUP_GUIDE.md` for detailed instructions
2. Check `OAUTH_IMPLEMENTATION.md` for technical details
3. Verify all environment variables are set correctly
4. Check backend console for error messages

## 🎉 Success!

Once you see the login page and can click "Continue with Google/GitHub", the implementation is complete!

The user will:

1. Click OAuth button
2. Authorize on Google/GitHub
3. Get redirected back
4. Be automatically logged in
5. Their name and email will be saved to the database

Enjoy your new OAuth authentication! 🚀
