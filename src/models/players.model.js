import mongoose from "mongoose"

const playerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    wins: {
      type: Number,
      default: 0,
    },
    losses: {
      type: Number,
      default: 0,
    },
    kills: {
      type: Number,
      default: 0,
    },
    deaths: {
      type: Number,
      default: 0,
    },
    avgKill: {
      type: Number,
      default: 0,
    },
    likes: [mongoose.Schema.Types.ObjectId],
    tournamentHistory: [mongoose.Schema.Types.ObjectId],
  },
  { timestamps: true },
)

export const Player = mongoose.models.Player || mongoose.model("Player", playerSchema)
