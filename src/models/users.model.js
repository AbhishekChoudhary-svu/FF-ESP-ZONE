import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    provider: {
      type: String,
      default: "password", // google, facebook later
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    bio: {
      type: String,
      default: "",
      maxlength: 160,
    },

    
    ffUid: {
      type: String,
      required: true,
      unique: true,
    },

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

    tournamentsJoined: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    plan: {
      type: String,
      enum: ["basic", "pro", "elite"],
      default: "basic",
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    banReason: {
      type: String,
      default: "",
    },

    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
)

export const User =
  mongoose.models.User || mongoose.model("User", userSchema)
