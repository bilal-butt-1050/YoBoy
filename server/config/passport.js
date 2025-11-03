import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from "dotenv";
dotenv.config();

/**
 * Configure Google OAuth Strategy
 */


passport.use( 
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ providerId: profile.id, provider: 'google' });

        if (user) {
          // User exists, return user
          return done(null, user);
        }

        // Check if user exists with this email (from local auth)
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // User exists with same email, link the Google account
          user.provider = 'google';
          user.providerId = profile.id;
          user.avatar = profile.photos[0]?.value || user.avatar;
          user.isVerified = true; // Google emails are verified
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0]?.value || '',
          provider: 'google',
          providerId: profile.id,
          isVerified: true, // Google emails are verified
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);


export default passport;