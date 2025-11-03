import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send verification email to user
 * @param {Object} options - Email options
 * @param {string} options.email - User's email
 * @param {string} options.name - User's name
 * @param {string} options.verificationToken - Verification token
 */
export const sendVerificationEmail = async ({ email, name, verificationToken }) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - ChatFlow</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f23; color: #ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f0f23; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%); border-radius: 24px; padding: 48px; border: 1px solid rgba(255, 255, 255, 0.1);">
                <!-- Logo -->
                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); width: 64px; height: 64px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center;">
                      <span style="font-size: 32px; color: white;">💬</span>
                    </div>
                    <h1 style="margin: 16px 0 0 0; font-size: 32px; font-weight: 700; background: linear-gradient(to right, #a78bfa, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">ChatFlow</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 0 0 24px 0;">
                    <h2 style="margin: 0 0 16px 0; font-size: 28px; font-weight: 700; color: #ffffff; text-align: center;">
                      Welcome to ChatFlow! 🎉
                    </h2>
                    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #d1d5db; text-align: center;">
                      Hi <strong style="color: #a78bfa;">${name}</strong>,<br/>
                      Thanks for signing up! We're excited to have you join our community.
                    </p>
                    <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #d1d5db; text-align: center;">
                      To get started, please verify your email address by clicking the button below:
                    </p>
                  </td>
                </tr>

                <!-- Button -->
                <tr>
                  <td align="center" style="padding: 0 0 32px 0;">
                    <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);">
                      Verify Email Address
                    </a>
                  </td>
                </tr>

                <!-- Alternative Link -->
                <tr>
                  <td style="padding: 0 0 24px 0;">
                    <p style="margin: 0; font-size: 14px; color: #9ca3af; text-align: center;">
                      Or copy and paste this link into your browser:
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 14px; text-align: center;">
                      <a href="${verificationUrl}" style="color: #a78bfa; word-break: break-all; text-decoration: underline;">
                        ${verificationUrl}
                      </a>
                    </p>
                  </td>
                </tr>

                <!-- Expiry Notice -->
                <tr>
                  <td style="padding: 24px 0; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <p style="margin: 0; font-size: 14px; color: #9ca3af; text-align: center;">
                      ⏰ This verification link will expire in <strong style="color: #a78bfa;">24 hours</strong>.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; text-align: center;">
                      If you didn't create an account with ChatFlow, you can safely ignore this email.
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #6b7280; text-align: center;">
                      © ${new Date().getFullYear()} ChatFlow. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [email],
      subject: 'Verify Your Email - ChatFlow',
      html: emailHtml,
    });

    console.log('✅ Verification email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset email
 * @param {Object} options - Email options
 * @param {string} options.email - User's email
 * @param {string} options.name - User's name
 * @param {string} options.resetToken - Reset token
 */
export const sendPasswordResetEmail = async ({ email, name, resetToken }) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - ChatFlow</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f23; color: #ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f0f23; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%); border-radius: 24px; padding: 48px; border: 1px solid rgba(255, 255, 255, 0.1);">
                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); width: 64px; height: 64px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center;">
                      <span style="font-size: 32px; color: white;">🔐</span>
                    </div>
                    <h1 style="margin: 16px 0 0 0; font-size: 32px; font-weight: 700; background: linear-gradient(to right, #a78bfa, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Password Reset</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 24px 0;">
                    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #d1d5db; text-align: center;">
                      Hi <strong style="color: #a78bfa;">${name}</strong>,
                    </p>
                    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #d1d5db; text-align: center;">
                      We received a request to reset your password. Click the button below to create a new password:
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 0 0 32px 0;">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);">
                      Reset Password
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 24px 0;">
                    <p style="margin: 0; font-size: 14px; color: #9ca3af; text-align: center;">
                      Or copy and paste this link:
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 14px; text-align: center;">
                      <a href="${resetUrl}" style="color: #a78bfa; word-break: break-all; text-decoration: underline;">
                        ${resetUrl}
                      </a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px 0; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <p style="margin: 0; font-size: 14px; color: #9ca3af; text-align: center;">
                      ⏰ This link will expire in <strong style="color: #a78bfa;">1 hour</strong>.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; text-align: center;">
                      If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #6b7280; text-align: center;">
                      © ${new Date().getFullYear()} ChatFlow. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [email],
      subject: 'Reset Your Password - ChatFlow',
      html: emailHtml,
    });

    console.log('✅ Password reset email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};