import mongoose from "mongoose"

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    gameMode: {
      type: String,
      enum: ["BR", "CS", "Mixed"],
      required: true,
    },
    teamMode: {
      type: String,
      enum: ["Solo", "Duo", "Squad"],
      required: true,
    },
    totalPlayers: {
      type: Number,
      required: true,
    },
    joinedPlayers: {
      type: Number,
      default: 0,
    },
    entryFee: {
      type: Number,
      default: 0,
    },
    prizePool: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    rules: String,
    organizer: mongoose.Schema.Types.ObjectId,
    participants: [mongoose.Schema.Types.ObjectId],
    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed"],
      default: "Upcoming",
    },
  },
  { timestamps: true },
)

export const Tournament = mongoose.models.Tournament || mongoose.model("Tournament", tournamentSchema)
