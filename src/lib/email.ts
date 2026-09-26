import nodemailer from "nodemailer";

interface SendOtpParams {
  to: string;
  otp: string;
}

/**
 * Dispatches a password reset OTP verification code.
 * In production: Dispatches via configured SMTP transport. Never leaks OTP in logs.
 * In development: If SMTP is not configured or uses dummy defaults, safely logs for developer testing.
 */
export async function sendPasswordResetOtp({ to, otp }: SendOtpParams): Promise<{ success: boolean; delivered: boolean; error?: string }> {
  const host = process.env.EMAIL_SERVER_HOST;
  const port = parseInt(process.env.EMAIL_SERVER_PORT || "587", 10);
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;
  const from = process.env.EMAIL_FROM || "StockSense <noreply@stocksense.local>";

  const isConfigured = host && user && pass && host !== "smtp.example.com";

  if (!isConfigured) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[STOCKSENSE AUTH DEV ONLY] SMTP not configured. Password reset OTP for ${to}: ${otp}`);
      return { success: true, delivered: false };
    }
    console.error("[STOCKSENSE EMAIL ERROR] Cannot send OTP: SMTP email service is not configured in production.");
    return { success: false, delivered: false, error: "Email delivery service is currently unavailable." };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from,
      to,
      subject: "StockSense Password Reset Verification Code",
      text: `Your StockSense password reset verification code is: ${otp}\n\nThis code is valid for 15 minutes. If you did not request a password reset, please ignore this email.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #FFFFFF; border-radius: 8px; border: 1px solid rgba(70,75,113,0.12);">
          <h2 style="color: #464B71; margin-top: 0;">StockSense Password Reset</h2>
          <p style="color: #646981; font-size: 14px;">Your 6-digit one-time password (OTP) verification code is:</p>
          <div style="background: #F2F2ED; border: 1px solid rgba(70,75,113,0.2); border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
            <span style="font-family: monospace; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #464B71;">${otp}</span>
          </div>
          <p style="color: #646981; font-size: 12px; margin-bottom: 0;">This code expires in 15 minutes. If you did not request this, please disregard this email.</p>
        </div>
      `,
    });

    return { success: true, delivered: true };
  } catch (error: any) {
    console.error("[STOCKSENSE EMAIL ERROR] Failed to send OTP email via SMTP:", error?.message || error);
    return { success: false, delivered: false, error: "Failed to dispatch verification email." };
  }
}
