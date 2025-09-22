import bcrypt from "bcrypt";
import UserModel from "../models/auth.js";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";




export const signup = async (req, res) => {
  let { name, email, password, phoneNo } = req.body;

  try {
    // Basic field validation
    if (!name || !email || !password || !phoneNo) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Clean and validate phone number
    phoneNo = phoneNo.trim().replace(/\D/g, '');
    if (phoneNo.length !== 10) {
      return res.status(400).json({ success: false, message: "Invalid phone number" });
    }
    phoneNo = "+91" + phoneNo;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email ID already exists" });
    }
    const User = await UserModel.findOne({ phoneNo });
    if (User) {
      return res.status(400).json({ success: false, message: "Email ID already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      phoneNo,
    });

    res.status(201).json({ success: true, message: "Signup successful", newUser });

  } catch (error) {
    console.error("Error in signup controller:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All field are required" });
    }
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Please sign up first" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "Email or password is incorrect" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("itoken", token, {
      secure: true,
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Error in login controller:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("itoken", {
    secure: true,
    sameSite: "strict",
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "LogOut successfull" });
};





export const sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const OTP = Math.floor(100000 + Math.random() * 900000);

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "OTP for Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>OTP Verification</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <h3>${OTP}</h3>
          <p>This OTP is valid for 5 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Save OTP and expiry to user
    user.otp = OTP;
    user.otpexpiresAt = Date.now() + 5 * 60 * 1000;
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.log("Error in sendOTP controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2️⃣ Reset Password Controller
export const resetPass = async (req, res) => {
  const { otp, newpassword } = req.body;

  try {
    if (!otp || !newpassword) {
      return res.status(400).json({
        success: false,
        message: "OTP and new password are required",
      });
    }

    const user = await UserModel.findOne({ otp });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (Date.now() > user.otpexpiresAt) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpexpiresAt = null;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });

  } catch (error) {
    console.log("Error in resetPass controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
