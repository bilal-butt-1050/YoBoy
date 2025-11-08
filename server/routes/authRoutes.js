import express from 'express';
import passport from '../config/passport.js';
import {
  register, login, logout, getMe,
  oauthSuccess
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
  prompt: 'consent',
  accessType: 'offline'
}));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/api/auth/oauth/failure',
  session: false
}), oauthSuccess);


export default router;
