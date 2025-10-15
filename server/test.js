import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { Welcome_Email_Template } from './config/emailTest.js'; // make sure this exports a function

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
    const htmlContent = Welcome_Email_Template("Prakash", "22ucs096@lnmiit.ac.in"); // pass name/email

    const info = await transporter.sendMail({
      from: `"GreatStack" <${process.env.SENDER_EMAIL}>`,
      to: "22ucs096@lnmiit.ac.in",  // recipient
      subject: "Welcome to GreatStack!",
      html: htmlContent,            // use template
    });

    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending test email:", error);
  }
};

testEmail();

// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.SENDER_EMAIL,
//     pass: process.env.GMAIL_APP_PASSWORD,
//   },
// });

// const testEmail = async () => {
//   try {
//     const info = await transporter.sendMail({
//       from: `"Tester" <${process.env.SENDER_EMAIL}>`,
//       to: process.env.SENDER_EMAIL,  // send to yourself
//       subject: "Hi from Node.js",
//       text: "Hi! This is a test email.", // plain text
//       html: "<b>Hi! This is a test email.</b>", // simple HTML
//     });

//     console.log("✅ Test email sent successfully!");
//     console.log("Message ID:", info.messageId);
//   } catch (error) {
//     console.error("❌ Error sending test email:", error);
//   }
// };

// testEmail();
