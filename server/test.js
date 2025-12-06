import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { Welcome_Email_Template } from './config/emailTest.js';

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

const testEmail = async () => {
  try {
    const htmlContent = Welcome_Email_Template("Prakash", "22ucs096@lnmiit.ac.in");

    const info = await transporter.sendMail({
      from: `"GreatStack" <${process.env.SENDER_EMAIL}>`,
      to: "22ucs096@lnmiit.ac.in",
      subject: "Welcome to GreatStack!",
      html: htmlContent,
    });

    console.log("Test email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("Error sending test email:", error);
  }
};

testEmail();
