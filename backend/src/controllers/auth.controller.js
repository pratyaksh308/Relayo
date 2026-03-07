import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Constants
const BCRYPT_ROUNDS = 10;
const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const JWT_EXPIRES_IN = "7d";

// Helper: Extract user data without sensitive fields
const getUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
});

// Helper: Hash reset token
const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const registerUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Validate input
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        message: "Username already taken",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: getUserResponse(user),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: getUserResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Invalid email or password",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");

    user.resetPasswordToken = hashResetToken(resetToken);
    user.resetPasswordExpires = Date.now() + RESET_TOKEN_EXPIRY_MS;

    await user.save();

    res.status(200).json({
      message: "If account exists, password reset instructions sent",
      resetToken, // only for testing
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    const hashedToken = hashResetToken(token);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    user.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    user: req.user,
  });
};