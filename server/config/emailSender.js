// server/config/emailSender.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { Welcome_Email_Template } from './emailTest.js';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendWelcomeEmail = async (to, name, email) => {
  try {
    const info = await transporter.sendMail({
      from: `"GreatStack" <${process.env.SENDER_EMAIL}>`,
      to,
      subject: "Welcome to GreatStack!",
      html: Welcome_Email_Template(name, email),
    });

    console.log("✅ Welcome email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
  }
};
