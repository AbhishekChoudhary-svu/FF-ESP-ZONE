import mongoose from "mongoose";

const teamRequestSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },

    type: {
      type: String,
      enum: ["invite", "request"], // team→player OR player→team
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // who initiated
      required: true,
    },
  },
  { timestamps: true }
);


teamRequestSchema.index(
  { team: 1, player: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

export const TeamRequest =
  mongoose.models.TeamRequest ||
  mongoose.model("TeamRequest", teamRequestSchema);
