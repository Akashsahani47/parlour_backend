import bcrypt from "bcrypt";
import User from "../models/auth.js";

export const getMyProfile = async (req, res) => {
  try {
    // Get user from database to ensure we have the latest data
    const user = await User.findById(req.user._id).select("-password -otp -otpexpiresAt");
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNo: user.phoneNo,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get profile" 
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, phoneNo, password } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Check if email or phone number already exists (excluding current user)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ 
        email, 
        _id: { $ne: req.user._id } 
      });
      if (existingEmail) {
        return res.status(400).json({ 
          success: false, 
          message: "Email already exists" 
        });
      }
    }

    if (phoneNo && phoneNo !== user.phoneNo) {
      const existingPhone = await User.findOne({ 
        phoneNo, 
        _id: { $ne: req.user._id } 
      });
      if (existingPhone) {
        return res.status(400).json({ 
          success: false, 
          message: "Phone number already exists" 
        });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNo) user.phoneNo = phoneNo;

    // Update password if provided
    if (password && password.trim() !== '') {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    // Return updated user without sensitive data
    const updatedUser = await User.findById(user._id).select("-password -otp -otpexpiresAt");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update profile" 
    });
  }
};




export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: "Old password is incorrect" 
      });
    }
    
    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to change password" 
    });
  }
};