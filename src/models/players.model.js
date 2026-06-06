import mongoose from "mongoose"

const playerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },

   
    inGameRole: {
      type: String,
      enum: [
        "Rusher",
        "Support",
        "Sniper",
        "Nader",
      ],
      default: "Rusher",
    },

    isCaptain: {
      type: Boolean,
      default: false,
    },

  
   // In players.model.js — update stats object:
stats: {
  matchesPlayed: { type: Number, default: 0 },
  wins:          { type: Number, default: 0 },  // ← add this
  kills:         { type: Number, default: 0 },
  deaths:        { type: Number, default: 0 },
  assists:       { type: Number, default: 0 },
  winRate:       { type: Number, default: 0 },
  totalPoints:   { type: Number, default: 0 },  // ← add this
},

    // 🎬 Cloudinary clips
    clipPhotos: {
      type: [String], // max 2
      default: [],
      validate: {
        validator: (v) => v.length <= 2,
        message: "Maximum 2 photo clips allowed",
      },
    },

    clipVideo: {
      type: String, 
      default: "",
    },

   
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },

    likedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User", 
      default: [],
    },

   
  // Also update tournamentHistory entries:
tournamentHistory: [
  {
    tournamentName: { type: String, required: true },
    matchesPlayed:  { type: Number, default: 0 },
    wins:           { type: Number, default: 0 },
    kills:          { type: Number, default: 0 },
    placement:      { type: Number },
    points:         { type: Number, default: 0 },  // ← add this
    prize:          { type: Number, default: 0 },  // ← add this
    date:           { type: Date },
  },
],
// models/players.model.js — add to schema
upiId: { type: String, trim: true, default: "" },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

export const Player =
  mongoose.models.Player || mongoose.model("Player", playerSchema)
