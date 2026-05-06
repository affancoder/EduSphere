import nodemailer from "nodemailer";

export const sendEmail = async (options: {
  email: string;
  subject: string;
  message: string;
}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};

export const sendResetEmail = async (email: string, resetUrl: string) => {
  const subject = "Password Reset Request - EduSphere";
  const message = `
    <h1>You requested a password reset</h1>
    <p>Please click on the following link to reset your password:</p>
    <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
    <p>This link will expire in 15 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;

  await sendEmail({
    email,
    subject,
    message,
  });
};
