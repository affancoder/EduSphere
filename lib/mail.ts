import sgMail from "@sendgrid/mail";

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const sendEmail = async (options: {
  email: string;
  subject: string;
  message: string;
}) => {
  const msg = {
    to: options.email,
    from: process.env.EMAIL_FROM || "noreply@edusphere.com", // Verified sender
    subject: options.subject,
    html: options.message,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully via SendGrid");
  } catch (error) {
    console.error("SendGrid email error:", error);
    throw new Error("Failed to send email");
  }
};

export const sendResetEmail = async (email: string, resetUrl: string) => {
  const subject = "Password Reset Request - EduSphere";
  const message = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #d4af37; text-align: center;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>You requested to reset your password for your EduSphere account. Please click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">If you did not request this, please ignore this email. This link will expire in 15 minutes.</p>
    </div>
  `;

  await sendEmail({
    email,
    subject,
    message,
  });
};
