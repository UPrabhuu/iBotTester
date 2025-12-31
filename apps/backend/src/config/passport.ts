import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import prisma from '../utils/prisma';

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user info from Google profile
          const email = profile.emails?.[0]?.value;
          const firstName = profile.name?.givenName || '';
          const lastName = profile.name?.familyName || '';
          const name = profile.displayName || `${firstName} ${lastName}`.trim();
          const avatar = profile.photos?.[0]?.value;

          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          // Check if user exists with this email or Google ID
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { email },
                { provider: 'google', providerId: profile.id }
              ]
            }
          });

          if (user) {
            // Update user with latest info if provider is google
            if (user.provider === 'google' || !user.provider) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  provider: 'google',
                  providerId: profile.id,
                  firstName: firstName || user.firstName,
                  lastName: lastName || user.lastName,
                  name: name || user.name,
                  avatar: avatar || user.avatar,
                }
              });
            }
          } else {
            // Create new user
            user = await prisma.user.create({
              data: {
                email,
                firstName,
                lastName,
                name,
                avatar,
                provider: 'google',
                providerId: profile.id,
                password: '', // OAuth users don't need a password
              }
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/api/auth/github/callback',
        scope: ['user:email'],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          // Extract user info from GitHub profile
          const email = profile.emails?.[0]?.value;
          
          if (!email) {
            return done(new Error('No email found in GitHub profile'), undefined);
          }

          // GitHub might not provide separate first/last names
          const displayName = profile.displayName || profile.username || '';
          const nameParts = displayName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          const name = displayName;
          const avatar = profile.photos?.[0]?.value || profile.avatar_url;

          // Check if user exists with this email or GitHub ID
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { email },
                { provider: 'github', providerId: profile.id }
              ]
            }
          });

          if (user) {
            // Update user with latest info if provider is github
            if (user.provider === 'github' || !user.provider) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  provider: 'github',
                  providerId: profile.id,
                  firstName: firstName || user.firstName,
                  lastName: lastName || user.lastName,
                  name: name || user.name,
                  avatar: avatar || user.avatar,
                }
              });
            }
          } else {
            // Create new user
            user = await prisma.user.create({
              data: {
                email,
                firstName,
                lastName,
                name,
                avatar,
                provider: 'github',
                providerId: profile.id,
                password: '', // OAuth users don't need a password
              }
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
