import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send verification email
export const sendVerificationEmail = async ({ email, name, verificationToken }) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  const message = `
    <h3>Hello ${name},</h3>
    <p>Thanks for registering. Please verify your email by clicking the link below:</p>
    <a href="${verifyUrl}">Verify Email</a>
    <p>This link expires in 24 hours.</p>
  `;

  await transporter.sendMail({
    from: `"ChatFlow" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Email Verification',
    html: message,
  });
};

// Send password reset email
export const sendPasswordResetEmail = async ({ email, name, resetToken }) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const message = `
    <h3>Hello ${name},</h3>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>This link expires in 1 hour.</p>
  `;

  await transporter.sendMail({
    from: `"ChatFlow" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: message,
  });
};
