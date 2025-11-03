import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

// Cookie settings
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
};

// Send token + user data
const sendTokenResponse = (user, res, status = 200, message = 'Success') => {
  const token = generateToken(user._id);
  const expires = new Date(
    Date.now() + ((parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 30) * 86400000)
  );

  const sanitizedUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    status: user.status,
    isVerified: user.isVerified,
    provider: user.provider,
  };

  res
    .status(status)
    .cookie('token', token, { ...cookieOptions, expires })
    .json({ success: true, message, user: sanitizedUser });
};

// REGISTER USER
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email, and password required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, provider: 'local' });
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
      return res.status(500).json({ success: false, message: 'Failed to send verification email' });
    }
  } catch (err) {
    next(err);
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res, next) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      verificationToken: hashed,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
};

// ============================================
// RESEND VERIFICATION EMAIL
// ============================================

// @desc    Resend email verification link
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: 'Please provide your email' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: 'No account found with this email' });

    if (user.isVerified)
      return res.status(400).json({ success: false, message: 'This email is already verified' });

    const verificationToken = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });
    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      verificationToken,
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    });
  } catch (error) {
    next(error);
  }
};


// LOGIN
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
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

    sendTokenResponse(user, res, 200, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// ============================================
// OAUTH SUCCESS & FAILURE HANDLERS
// ============================================

// @desc    Handle OAuth success
// @route   GET /api/auth/google/callback
// @access  Public (triggered by Google OAuth)
export const oauthSuccess = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    req.user.lastSeen = Date.now();
    req.user.status = 'online';
    await req.user.save();

    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    });

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      })
      .redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (error) {
    console.error('OAuth success error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};

// @desc    Handle OAuth failure
// @route   GET /api/auth/oauth/failure
// @access  Public
export const oauthFailure = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
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

// UPDATE PROFILE
export const updateDetails = async (req, res, next) => {
  try {
    const allowed = (({ name, email, bio, avatar }) => ({ name, email, bio, avatar }))(req.body);
    const updated = await User.findByIdAndUpdate(req.user._id, allowed, {
      new: true,
      runValidators: true,
    });

    sendTokenResponse(updated, res, 200, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

// UPDATE PASSWORD
export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const match = await user.comparePassword(req.body.currentPassword);
    if (!match)
      return res.status(401).json({ success: false, message: 'Incorrect current password' });

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, res, 200, 'Password updated');
  } catch (err) {
    next(err);
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found with that email' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail({ email: user.email, name: user.name, resetToken });
      res.status(200).json({ success: true, message: 'Password reset email sent' });
    } catch (mailErr) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email sending failed' });
    }
  } catch (err) {
    next(err);
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res, next) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, res, 200, 'Password reset successful');
  } catch (err) {
    next(err);
  }
};
