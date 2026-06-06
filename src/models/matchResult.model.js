import mongoose from "mongoose"

// ── Per-participant result ───────────────────────────────────
const participantResultSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null,
  },

  // BR fields
  placement:       { type: Number, default: 0 },
  kills:           { type: Number, default: 0 },
  assists:         { type: Number, default: 0 },
  deaths:          { type: Number, default: 0 },

  // CS fields
  matchWins:       { type: Number, default: 0 },
  matchLosses:     { type: Number, default: 0 },
  roundsWon:       { type: Number, default: 0 },
  roundsLost:      { type: Number, default: 0 },

  // Calculated
  placementPoints: { type: Number, default: 0 },
  killPoints:      { type: Number, default: 0 },
  totalPoints:     { type: Number, default: 0 },

  // Prize
  prize:           { type: Number, default: 0 },

  isDisqualified:  { type: Boolean, default: false },
  disqualifyReason:{ type: String,  default: "" },
}, { _id: true })

// ── Main MatchResult schema ──────────────────────────────────
const matchResultSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },

    gameMode:  { type: String, enum: ["BR", "CS"], required: true },
    teamMode:  { type: String, enum: ["Solo", "Duo", "Squad"], required: true },

    // Point system used
    pointSystem: {
      // BR placement points table: { 1: 12, 2: 9, ... }
      placementPoints: { type: Map, of: Number, default: {} },
      // Kill point value (usually 1)
      killPointValue:  { type: Number, default: 1 },
      // CS specific
      winPoints:       { type: Number, default: 3 },
      lossPoints:      { type: Number, default: 0 },
      roundPointValue: { type: Number, default: 1 },
    },

    results: [participantResultSchema],

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      default: "",
      maxlength: 1000,
    },
  },
  { timestamps: true }
)


export const MatchResult =
  mongoose.models.MatchResult ||
  mongoose.model("MatchResult", matchResultSchema)