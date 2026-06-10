import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "tournament",  // joined, full, cancelled
        "payment",     // confirmed, failed, refunded
        "room",        // room credentials published
        "result",      // match results submitted
        "announcement",// admin broadcast
        "prize",       // prize distributed
        "team",        // invite, kick, join accepted
      ],
      required: true,
    },
    data: {
      type: Object,
      default: {},     // tournamentId, teamId etc for deep linking
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
)

notificationSchema.index({ user: 1, createdAt: -1 })
notificationSchema.index({ user: 1, read: 1 })

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema)