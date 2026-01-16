import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    tag: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      maxlength: 5,
    },

    logo: {
      type: String,
      default: "",
    },

    teamCaptain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },

    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
    ],

    maxPlayers: {
      type: Number,
      default: 6,
    },

    region: {
      type: String,
      default: "India",
    },

    game: {
      type: String,
      default: "Free Fire",
    },

    tier: {
      type: String,
      enum: ["Amateur", "Semi-Pro", "Pro"],
      default: "Amateur",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "disbanded"],
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Safety: max 6 players
teamSchema.pre("save", function (next) {
  if (this.players.length > this.maxPlayers) {
    return next(new Error("Team player limit exceeded"));
  }
  next();
});

export const Team =
  mongoose.models.Team || mongoose.model("Team", teamSchema);
