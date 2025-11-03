import express from 'express';
import passport from '../config/passport.js';
import {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  oauthSuccess,
  oauthFailure,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// Regular Auth Routes
// ============================================
router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

// ============================================
// Email Verification Routes
// ============================================
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

// ============================================
// Password Reset Routes
// ============================================
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// ============================================
// Google OAuth Routes
// ============================================
// Force Google to ask for consent / account selection every time
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false,
    prompt: 'consent',        // ← forces re-consent every login
    accessType: 'offline'     // optional, for refresh tokens if needed
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/api/auth/oauth/failure',
    session: false 
  }),
  oauthSuccess
);


// ============================================
// OAuth Helper Routes
// ============================================
router.get('/oauth/failure', oauthFailure);

export default router;
