import mongoose from "mongoose"

const teamSchema = new mongoose.Schema(
  {
    name: {
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
      maxlength: 5, // e.g. TSM, FNX
    },

    logo: {
      type: String,
      default: "",
    },

    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },

    players: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Player",
        },
      ],
      validate: {
        validator: function (val) {
          return val.length <= 6
        },
        message: "A team can have maximum 6 players",
      },
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

    tournamentsPlayed: {
      type: Number,
      default: 0,
    },

    tournamentsWon: {
      type: Number,
      default: 0,
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
)

export const Team =
  mongoose.models.Team || mongoose.model("Team", teamSchema)
