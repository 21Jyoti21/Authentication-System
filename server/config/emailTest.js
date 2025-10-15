// Verification Email
export const Verification_Email_Template = (verificationCode) => `
  <!DOCTYPE html>
  <html lang="en">
  <head> ... </head>
  <body>
      <div class="container">
          <div class="header">Verify Your Email</div>
          <div class="content">
              <p>Hello,</p>
              <p>Thank you for signing up! Please confirm your email address by entering the code below:</p>
              <span class="verification-code">${verificationCode}</span>
              <p>If you did not create an account, no further action is required.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;

// Welcome Email
export const Welcome_Email_Template = (name, email) => `
  <!DOCTYPE html>
  <html lang="en">
  <head> ... </head>
  <body>
      <div class="container">
          <div class="header">Welcome to Our Community!</div>
          <div class="content">
              <p class="welcome-message">Hello ${name},</p>
              <p>We’re thrilled to have you join us! Your registration was successful.</p>
              <p>Your email: ${email}</p>
              <a href="#" class="button">Get Started</a>
              <p>If you need any help, don’t hesitate to contact us.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;
