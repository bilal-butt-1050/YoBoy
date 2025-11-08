export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction, // only secure cookies in production
    sameSite: isProduction ? 'none' : 'lax', // 'lax' for localhost
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/', // available across all routes
  };
};
