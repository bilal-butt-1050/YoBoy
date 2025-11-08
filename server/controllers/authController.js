import User from '../models/User.js';
import { sendVerificationEmail } from '../utils/email.js';
import { sendTokenResponse } from '../utils/sendTokenResponse.js';
import { getCookieOptions } from '../utils/cookieOptions.js';
import { generateToken } from '../utils/jwt.js';

// REGISTER USER
export const register = async (req, res, next) => {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username';
      return res.status(400).json({ success: false, message: `${field} already registered` });
    }

    const user = await User.create({ name, email, password, username, provider: 'local' });
    const token = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendVerificationEmail({ email, name, verificationToken: token });
      res.status(201).json({
        success: true,
        message: 'Registered successfully. Check email for verification link.',
      });
    } catch (mailErr) {
      await User.findByIdAndDelete(user._id);
      res.status(500).json({ success: false, message: 'Failed to send verification email' });
    }
  } catch (err) {
    next(err);
  }
};

// LOGIN
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || user.provider !== 'local')
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Incorrect password' });

    if (!user.isVerified)
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
      });

    user.lastSeen = Date.now();
    user.status = 'online';
    await user.save();

    console.log('✅ Login successful for:', email);
    sendTokenResponse(user, res, 200, 'Login successful');
  } catch (err) {
    console.error('❌ Login error:', err);
    next(err);
  }
};

// OAUTH SUCCESS
export const oauthSuccess = async (req, res) => {
  try {
    if (!req.user)
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);

    req.user.lastSeen = Date.now();
    req.user.status = 'online';
    await req.user.save();

    const token = generateToken(req.user._id);

    const cookieOptions = getCookieOptions();

    console.log('🍪 OAuth: Setting cookie with options:', cookieOptions);

    res.cookie('token', token, cookieOptions)
       .redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (error) {
    console.error('OAuth success error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};

// LOGOUT
export const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      status: 'offline',
      lastSeen: Date.now(),
    });

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 5000),
      httpOnly: true,
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// GET CURRENT USER
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};