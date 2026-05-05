import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || "noreply@edusphere.com";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  // Add timeout to prevent hanging
  connectionTimeout: 10000, 
  greetingTimeout: 10000,
});

// Verify connection configuration
if (process.env.NODE_ENV !== "production") {
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ SMTP Connection Error:", error.message);
      console.error("Check your SMTP_HOST, SMTP_USER, and SMTP_PASS in .env");
    } else {
      console.log("✅ SMTP Server is ready to take messages");
    }
  });
}

export const sendResetEmail = async (email: string, resetUrl: string) => {
  // 1. Check if SMTP config exists
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("❌ Missing SMTP configuration in environment variables.");
    return false;
  }

  const mailOptions = {
    from: `"EduSphere Support" <${SMTP_FROM}>`,
    to: email,
    subject: "Password Reset Request - EduSphere",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #d4af37; text-align: center;">EduSphere</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your EduSphere account. Please click the button below to reset your password. This link will expire in 15 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #d4af37; color: #0b0b0f; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>If you did not request this, please ignore this email or contact support if you have concerns.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">&copy; 2026 EduSphere Sanctuary. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Reset email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending reset email:", error);
    return false;
  }
};
