import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
dotenv.config();

// Validate required envs early
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
  throw new Error('Missing Google OAuth environment variables. Check .env configuration.');
}

async function generateUniqueUsername(profile) {
  const base = (
    profile.username ||
    profile.displayName ||
    profile.emails?.[0]?.value?.split('@')[0] ||
    'user'
  )
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_');

  let username = base;
  let attempts = 0;
  while (await User.findOne({ username })) {
    username = `${base}_${Math.floor(Math.random() * 10000)}`;
    if (++attempts > 10) {
      username = `${base}_${randomUUID().slice(0, 8)}`;
      break;
    }
  }
  return username.toLowerCase();
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const avatar = profile.photos?.[0]?.value || '';
        const name = profile.displayName?.trim() || 'New User';

        let user = await User.findOne({ provider: 'google', providerId: profile.id });
        if (user) return done(null, user);

        if (email) {
          user = await User.findOne({ email });
          if (user) {
            user.provider = 'google';
            user.providerId = profile.id;
            user.avatar = avatar || user.avatar;
            user.isVerified = true;
            user.status = 'online';
            if (!user.username) user.username = await generateUniqueUsername(profile);
            await user.save();
            return done(null, user);
          }
        }

        const username = await generateUniqueUsername(profile);
        const newUser = await User.create({
          name,
          username,
          email: email || null,
          avatar,
          provider: 'google',
          providerId: profile.id,
          isVerified: Boolean(email),
          status: 'online',
        });

        return done(null, newUser);
      } catch (err) {
        console.error('OAuth Error:', err);
        return done(err, null);
      }
    }
  )
);

export default passport;
