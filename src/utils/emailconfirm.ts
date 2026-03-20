import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { passwordResetTemplate } from '@templates/emailTemplates';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetEmail = async (
  email: string,
  name: string,
  token: string,
  role: 'customer' | 'carOwner'
) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL is not defined!');
    }

    const resetLink = `${frontendUrl}/forgotpassword/newPassword?token=${token}&role=${role}`;

    const emailContent = passwordResetTemplate(name, resetLink);

    await sendEmail({
      to: email,
      ...emailContent,
    });
  } catch (error) {
    console.error('Error sending reset email:', error);
  }
};

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
