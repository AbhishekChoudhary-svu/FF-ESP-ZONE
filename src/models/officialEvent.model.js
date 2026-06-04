import mongoose from "mongoose"

const officialEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    // Short summary shown on card
    summary: {
      type: String,
      required: true,
      maxlength: 200,
    },

    type: {
      type: String,
      enum: ["tournament", "announcement", "maintenance", "update", "event"],
      default: "tournament",
    },

    status: {
      type: String,
      enum: ["upcoming", "ongoing", "ended", "cancelled"],
      default: "upcoming",
    },

    prizePool: {
      type: Number,
      default: 0,
    },

    prizeDistribution: [
      {
        placement:   { type: Number },
        prize:       { type: Number },
        description: { type: String },
      },
    ],

    entryFee: {
      type: Number,
      default: 0,
    },

    rules: {
      type: String,
      default: "",
      maxlength: 5000,
    },

    bannerImage: {
      type: String,
      default: "",
    },

    registrationLink: {
      type: String,
      default: "",
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    organizerName: {
      type: String,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    viewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

officialEventSchema.index({ status: 1, isPublished: 1 })
officialEventSchema.index({ isPinned: -1, createdAt: -1 })

export const OfficialEvent =
  mongoose.models.OfficialEvent ||
  mongoose.model("OfficialEvent", officialEventSchema)