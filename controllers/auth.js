import dotenv from "dotenv";
import bcrypt from "bcrypt";
import UserModel from "../models/auth.js";
import jwt from "jsonwebtoken";
import axios from "axios";
dotenv.config({ path: "/Users/akashkumar/Desktop/demo/Parlour/backend/.env" });
//import transporter from "../config/nodemailer.js";




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
      return res.status(400).json({ success: false, message: "Phone Number is already exists" });
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

    res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

    res.status(200).json({
      success: true,
      message: "Login successful",
       token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
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



// export const checking = async (req, res) => {
//   try {
//     // Get token from multiple sources
//     let token;
    
//     // Check cookies first
//     if (req.cookies?.token) {
//       token = req.cookies.token;
//     } 
//     // Check Authorization header
//     else if (req.headers?.authorization && req.headers.authorization.startsWith('Bearer ')) {
//       token = req.headers.authorization.split(' ')[1];
//     }
    
//     if (!token) {
//       return res.status(200).json({ user: null, message: "No authentication token" });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // Find user
//     const user = await UserModel.findById(decoded.id).select("name email");
    
//     if (!user) {
//       return res.status(200).json({ user: null, message: "User not found" });
//     }

//     // Return user data
//     res.status(200).json({ 
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email
//       }
//     });

//   } catch (error) {
//     console.error("Auth check error:", error);
    
//     // Handle specific JWT errors
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(200).json({ user: null, message: "Invalid token" });
//     }
//     if (error.name === 'TokenExpiredError') {
//       return res.status(200).json({ user: null, message: "Token expired" });
//     }
    
//     res.status(500).json({ user: null, message: "Internal server error" });
//   }
// }


export const checking = async (req, res) => {
  try {
    // Disable caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    let token = null;

    console.log('🔍 Checking for token in headers:');
    console.log('Authorization header:', req.headers?.authorization);
    console.log('All headers:', req.headers);

    // Check Authorization header (case-insensitive)
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log('✅ Token found in Authorization header');
    } 
    // Check cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
      console.log('✅ Token found in cookies');
    }
    
    console.log('📝 Final token extracted:', token ? `Present (length: ${token.length})` : 'MISSING');

    if (!token) {
      return res.status(200).json({ 
        user: null, 
        message: "No authentication token found in request headers",
        receivedHeaders: req.headers // Debug info
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded successfully for user ID:', decoded.userId || decoded.id);
    
    // Find user - adjust based on your token structure
    const userId = decoded.userId || decoded.id;
    const user = await UserModel.findById(userId).select("name email");
    
    if (!user) {
      console.log('❌ User not found for ID:', userId);
      return res.status(200).json({ 
        user: null, 
        message: "User not found",
      });
    }

    console.log('✅ User found:', user.name);
    
    // Return user data
    res.status(200).json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("❌ Auth check error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(200).json({ 
        user: null, 
        message: "Invalid token",
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(200).json({ 
        user: null, 
        message: "Token expired",
      });
    }
    
    res.status(500).json({ 
      user: null, 
      message: "Internal server error",
    });
  }
}



export const sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const OTP = Math.floor(100000 + Math.random() * 900000);

    // Send email using Brevo API
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Asha Beauty Parlour", email: process.env.SENDER_EMAIL },
        to: [{ email: user.email }],
        subject: "OTP for Password Reset",
        htmlContent: `
          <div style="font-family: Arial, sans-serif;">
            <h2>OTP Verification</h2>
            <p>Your One-Time Password (OTP) is:</p>
            <h3>${OTP}</h3>
            <p>This OTP is valid for 5 minutes.</p>
          </div>
        `,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_PASS, // Brevo API key
        },
      }
    );

    console.log("✅ OTP email sent:", response.data);

    // Save OTP and expiry to user
    user.otp = OTP;
    user.otpexpiresAt = Date.now() + 5 * 60 * 1000; // 5 min expiry
    await user.save();

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Error in sendOTP controller:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.response?.data || error.message });
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
