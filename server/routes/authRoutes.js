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
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
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
// GitHub OAuth Routes
// ============================================
router.get(
  '/github',
  passport.authenticate('github', { 
    scope: ['user:email'],
    session: false 
  })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { 
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