import { generateToken } from './jwt.js';
import { getCookieOptions } from './cookieOptions.js';

export const sendTokenResponse = (user, res, status = 200, message = 'Success') => {
  const token = generateToken(user._id);
  const cookieOptions = getCookieOptions();

  const sanitizedUser = {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
    status: user.status,
    isVerified: user.isVerified,
    provider: user.provider,
  };

  console.log('🍪 Setting cookie with options:', cookieOptions);
  console.log('🔑 Token (first 20 chars):', token.substring(0, 20));

  res
    .status(status)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      user: sanitizedUser,
      token // Include token for debugging/dev use
    });
};
