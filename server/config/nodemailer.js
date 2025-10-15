// backend/nodemailer.js
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use TLS, not SSL
  auth: {
    user: process.env.SENDER_EMAIL,       // your Gmail
    pass: process.env.GMAIL_APP_PASSWORD, // app password generated in Google
  },
});

// import nodemailer from 'nodemailer'
// const transporter = nodemailer.createTransport({
//     host:'smtp-relay.brevo.com',
//     port:587,
//     auth:{
//         user:process.env.SMTP_USER,
//         pass:process.env.SMTP_PASS,
//     }
// });
// export default transporter;