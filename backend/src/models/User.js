const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      required: true,
      default: "active",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", null],
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    // Mã xác thực quên mật khẩu (4 chữ số) và thời gian hết hạn
    resetCode: {
      type: String,
      default: null,
    },
    resetCodeExpires: {
      type: Date,
      default: null,
    },
    // Định danh Google phục vụ đăng nhập Google Sign In
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Prevent returning passwordHash in queries
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
