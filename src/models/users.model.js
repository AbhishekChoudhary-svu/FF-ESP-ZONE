import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, default: "" }, // empty for google users
    emailVerified: { type: Boolean, default: false },
    provider: { type: String, default: "password" },
    username: { type: String, required: true, unique: true, trim: true, index: true },
    bio: { type: String, default: "", maxlength: 160 },
    ffUid: { type: String, required: true, unique: true },
    rank: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Professional"],
      default: "Beginner",
    },
    playstyle: {
      type: String,
      enum: ["Primary Rusher", "Secondary Rusher", "Assaulter/Nader", "Sniper"],
      default: "Primary Rusher",
    },
    tournamentsJoined: { type: Number, default: 0 },
    role: { type: String, enum: ["user", "admin", "moderator"], default: "user" },
    plan: { type: String, enum: ["basic", "pro", "elite"], default: "basic" },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: "" },
    lastLoginAt: { type: Date },
    sessionVersion: { type: Number, default: 1 },

    // OTP fields
    otp: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export const User = mongoose.models.User || mongoose.model("User", userSchema)