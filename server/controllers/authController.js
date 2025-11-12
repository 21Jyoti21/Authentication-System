import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import nodemailer from 'nodemailer';
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';
import { transporter } from '../config/nodemailer.js';

// ---------------- REGISTER ----------------
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing Details' });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Set JWT cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.SENDER_EMAIL,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        // Send simple welcome email
        try {
            const info = await transporter.sendMail({
                from: `"GreatStack" <${process.env.SENDER_EMAIL}>`,
                to: email,
                subject: "Welcome to GreatStack!",
                text: `Hello ${name},\n\nYour account has been successfully created with email: ${email}.\n\nThanks for joining!`,
            });

            console.log('✅ Email sent successfully!', info.messageId);
        } catch (emailError) {
            console.error('❌ Error sending email:', emailError);
        }

        return res.json({ success: true, message: 'User registered successfully. Check your email!' });

    } catch (error) {
        console.error('Registration error:', error);
        return res.json({ success: false, message: error.message });
    }
};

// ---------------- LOGIN ----------------
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: 'Email and password are required' });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'Invalid email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true, message: 'Logged in successfully' });

    } catch (error) {
        console.error('Login error:', error);
        return res.json({ success: false, message: error.message });
    }
};

// ---------------- LOGOUT ----------------
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        });

        return res.json({ success: true, message: 'Logged Out' });

    } catch (error) {
        console.error('Logout error:', error);
        return res.json({ success: false, message: error.message });
    }
};

// export const sendVerifyotp = async (req, res)=>{
//     try {
//         const {userId} = req.body;
//         const user = await userModel.findById(userId);
//         if(user.isAccountVerified) {
//             return res.json({success: false,message:"Account Already verified"})
//         }
//         const otp = String (Math.floor(100000 + Math.random() *900000));
//         user.verifyotp = otp;
//         user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000
//         await user.save();
//         const mailOption = {
//             from: process.env.SENDER_EMAIL,
//             to: user.email,
//             subject: 'Account Verification OTP',
//             text: `Your OTP is ${otp}. Verify your account using this OTP.`
//         }
//         await transporter.sendMail(mailOption);
//         res.json({ success: true, message: 'Verification OTP Sent on Email' });

//     } catch (error) {
//     res.json({ success: false, message: error.message });
//     }
// }

export const sendVerifyotp = async (req, res) => {
  try {
    const user = req.user; // full Mongoose document from userAuth

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    // generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyotp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry

    await user.save(); // ✅ save the updated user document

    // send email
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
    //   text: `Your OTP is ${otp}. Verify your account using this OTP.`,
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
    };

    await transporter.sendMail(mailOption);

    res.json({ success: true, message: "Verification OTP sent on email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const user = req.user; // from userAuth middleware
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const { otp } = req.body;
    if (!otp) {
      return res.json({ success: false, message: "Missing OTP" });
    }

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    if (user.verifyotp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    user.isAccountVerified = true;
    user.verifyotp = '';
    user.verifyOtpExpireAt = 0;

    await user.save();
    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// export const verifyEmail = async (req, res)=>{
//     const {userId, otp} = req.body;
//     if(!userId || !otp) {
//         return res.json({ success: false, message: 'Missing Details' });
//     }
//     try {
//         const user = await userModel.findById(userId);
//         if(!user) {
//             return res.json({ success: false, message: 'User not found' });
//         }
//         if(user.verifyOtp === '' || user.verifyotp !== otp) {
//             return res.json({ success: false, message: 'Invalid OTP'});
//         }
//         if(user.verifyOtpExpireAt < Date.now()){
//             return res.json({ success: false, message: 'OTP Expired' });
//         }
//         user.isAccountVerified = true;
//         user.verifyotp = '';
//         user.verifyOtpExpireAt = 0;

//         await user.save();
//         return res.json({success: true, message: 'Email verified successfully'})
//     } catch (error) {
//         return res.json({ success: false, message: error.message });
//     }
// }
export const isAuthenticated = async (req, res)=>{
    try {
        return res. json({ success: true }) ;
    } catch (error) {
        res. json({ success: false, message: error.message }) ;
    }
}
// export const sendResetOtp = async (req, res)=>{
//     const {email} = req.body;

//     if(!email){
//         return res.json({success: false, message: 'Email is required'})
//     }

//     try {
//         const user = await userModel.findOne({email});
//         if(!user){
//             return res. json({ success: false, message: 'User not found' }) ;
//         }
//         const otp = String (Math.floor(100000 + Math.random() *900000));
//         user.resetOtp = otp;
//         user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000
//         await user.save();
//         const mailOption = {
//             from: process.env.SENDER_EMAIL,
//             to: user.email,
//             subject: 'Password reset OTP',
//             text: `Your OTP for resetting password is ${otp}. Use this otp to proceed with resetting your password .`
//         }
//         await transporter.sendMail(mailOption);
//         return res.json({success: true, message: 'OTP sent to your email'});

//     }catch (error) {
//         return res.json({ success: false, message: error.message });
//     }
// }
// export const resetPassword = async (req, res)=>{
//     const {email, otp, newPassword} = req.body;

//     if(!email||!otp||!newPassword){
//         return res.json({ success: false, message: 'Email, OTP, and new password are required' });
//     }

//     try {
//         const user = await userModel. findOne({email});
//         if(!user){
//             return res.json({ success: false, message: 'User not found' });
//         }
//         if (!user.resetOtp || user.resetOtp.trim() !== otp.trim()) {
//             return res.json({ success: false, message: 'Invalid OTP' });
//         }
//         if (user.resetOtpExpireAt < Date.now()) {
//             return res.json({ success: false, message: 'OTP Expired' });
//         }

//         // hash password and save
//         const hashedPassword = await bcrypt.hash(newPassword, 10);
//         user.password = hashedPassword;
//         user.resetOtp = '';
//         user.resetOtpExpireAt = 0;
//         await user.save();
//         return res.json({ success: true, message: 'Password has been reset successfully' });

//         // if(user.resetOtp===""||user.resetOtp!== otp){
//         //     return res.json({ success: false, message: 'Invalid OTP' });
//         // }
//         // if(user.resetOtpExpireAt < Date.now() ){
//         //     return res.json({ success: false, message: 'OTP Expired' });
//         // }
        
//         // const hashedPassword = await bcrypt.hash(newPassword, 10);
        
//         // user.password = hashedPassword;
//         // user.resetOtp = '';
//         // user.resetOtpExpireAt = 0;
        
//         // await user.save();
//         // return res.json({ success: true, message: 'Password has been reset successfully' });
//     } catch (error) {
//         return res. json({ success: false, message: error.message });
//     }

// }

// ------------------- Send Reset OTP -------------------
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: 'Email is required' });
    }

    try {
        const user = await userModel.findOne({ email: email.trim() });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Generate OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        // Save OTP and expiry
        user.resetotp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save();

        // Send email
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            // text: `Your OTP for resetting password is ${otp}. Use this OTP to proceed with resetting your password.`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        };
        await transporter.sendMail(mailOption);

        console.log(`OTP ${otp} sent to ${user.email}`); // debug log
        return res.json({ success: true, message: 'OTP sent to your email' });

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};

// ------------------- Reset Password -------------------
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    try {
        const user = await userModel.findOne({ email: email.trim() });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Debug logs
        // console.log("Submitted OTP:", otp);
        // console.log("Stored OTP:", user.resetotp);
        // console.log("OTP type:", typeof user.resetotp, typeof otp);
        // console.log("OTP expiry:", new Date(user.resetOtpExpireAt));

        // Check OTP and expiry
        if (!user.resetotp || String(user.resetotp).trim() !== String(otp).trim()) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP Expired' });
        }

        // Hash new password and save
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Clear OTP
        user.resetotp = '';
        user.resetOtpExpireAt = 0;

        await user.save();
        // console.log(`Password reset successful for ${user.email}`);
        return res.json({ success: true, message: 'Password has been reset successfully' });

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};
