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

  
    stats: {
      matchesPlayed: { type: Number, default: 0 },
      kills: { type: Number, default: 0 },
      deaths: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
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

   
    tournamentHistory: [
      {
        tournamentName: {
          type: String,
          required: true,
        },

        matchesPlayed: {
          type: Number,
          default: 0,
        },

        wins: {
          type: Number,
          default: 0,
        },

        kills: {
          type: Number,
          default: 0,
        },

        placement: {
          type: Number, 
        },

        date: {
          type: Date,
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

export const Player =
  mongoose.models.Player || mongoose.model("Player", playerSchema)
