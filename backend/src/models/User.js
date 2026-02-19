import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // User profile fields
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },

    // Authentication fields
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    // Password reset fields
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster password reset token lookups
userSchema.index({ resetPasswordToken: 1, resetPasswordExpires: 1 });

export default mongoose.model("User", userSchema);