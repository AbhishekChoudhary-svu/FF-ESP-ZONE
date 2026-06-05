import mongoose from "mongoose";

// ── Participant entry ───────────────────────────────────────
// Stores who joined and in what capacity
const participantSchema = new mongoose.Schema(
  {
    // The player who registered (always the captain for squad/duo)
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },

    // For squad matches — the full team
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },

    // All player IDs in this slot (1 for solo, 2 for duo, 4 for squad)
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
    ],

    // Payment reference for paid tournaments
    paymentId: {
      type: String,
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "confirmed", "refunded"],
      default: "confirmed", // free tournaments auto-confirmed
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    // Final placement for this slot
    placement: {
      type: Number,
      default: null,
    },

    // Kills by this slot in the tournament
    kills: {
      type: Number,
      default: 0,
    },

    isDisqualified: {
      type: Boolean,
      default: false,
    },

    disqualifyReason: {
      type: String,
      default: "",
    },
  },
  { _id: true },
);

// ── Main Tournament Schema ──────────────────────────────────
const tournamentSchema = new mongoose.Schema(
  {
    // ── Basic Info ────────────────────────────────────────
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    rules: {
      type: String,
      default: "",
      maxlength: 3000,
    },

    bannerImage: {
      type: String,
      default: "",
    },

    // ── Tournament Type ───────────────────────────────────
    tournamentType: {
      type: String,
      enum: ["free", "paid"],
      required: true,
      index: true,
    },

    // ── Game Mode ─────────────────────────────────────────
    // BR = Battle Royale Ranked
    // CS = Clash Squad 4v4
    gameMode: {
      type: String,
      enum: ["BR", "CS"],
      required: true,
    },

    // ── Team Mode ─────────────────────────────────────────
    // CS only supports Squad (4v4)
    // BR supports Solo, Duo, Squad
    teamMode: {
      type: String,
      enum: ["Solo", "Duo", "Squad"],
      required: true,
    },

    // ── Slot & Player Limits ──────────────────────────────
    // Derived from gameMode + teamMode but stored for quick access
    // BR Squad  → 12 slots × 4 = 48 players
    // BR Duo    → 24 slots × 2 = 48 players
    // BR Solo   → 48 slots × 1 = 48 players
    // CS Squad  → 2 slots  × 4 =  8 players (4v4)
    totalSlots: {
      type: Number,
      default: 0, // ← was required: true
    },

    playersPerSlot: {
      type: Number,
      default: 0, // ← was required: true
    },

    totalPlayers: {
      type: Number,
      default: 0, // ← was required: true
    },

    filledSlots: {
      type: Number,
      default: 0,
    },

    // ── Entry & Prize ─────────────────────────────────────
    entryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    prizePool: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Prize breakdown — 1st, 2nd, 3rd etc
    prizeDistribution: [
      {
        placement: { type: Number }, // 1, 2, 3...
        prize: { type: Number }, // amount in rupees
        description: { type: String }, // "1st Place", "MVP" etc
      },
    ],

    // ── Dates ─────────────────────────────────────────────
    registrationDeadline: {
      type: Date,
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

    // ── Room Credentials ──────────────────────────────────
    // Published by organizer/admin before match starts
    roomId: {
      type: String,
      default: null,
    },

    roomPassword: {
      type: String,
      default: null,
    },

    // When room was published — players see countdown
    roomPublishedAt: {
      type: Date,
      default: null,
    },

    // ── Organizer ─────────────────────────────────────────
    // Free tournaments: any captain (Player ref)
    // Paid tournaments: admin/moderator (User ref)
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    organizerRole: {
      type: String,
      enum: ["user", "admin", "moderator"],
      required: true,
    },

    // ── Status ────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "draft", // created, not published yet
        "upcoming", // published, registration open
        "ongoing", // match in progress
        "completed", // match finished
        "cancelled", // cancelled by organizer/admin
      ],
      default: "draft",
      index: true,
    },

    // ── Participants ──────────────────────────────────────
    participants: [participantSchema],

    // ── Results ───────────────────────────────────────────
    results: [
      {
        placement: { type: Number },
        player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
        kills: { type: Number, default: 0 },
        prize: { type: Number, default: 0 },
      },
    ],

    // ── Visibility ────────────────────────────────────────
    isPublished: {
      type: Boolean,
      default: false,
    },

    region: {
      type: String,
      default: "India",
    },

    game: {
      type: String,
      default: "Free Fire",
    },
  },
  { timestamps: true },
);

// ── Virtual: spots remaining ────────────────────────────────
tournamentSchema.virtual("slotsRemaining").get(function () {
  return this.totalSlots - this.filledSlots;
});

// ── Virtual: is registration open ──────────────────────────
tournamentSchema.virtual("isRegistrationOpen").get(function () {
  const now = new Date();
  return (
    this.status === "upcoming" &&
    this.isPublished &&
    now < this.registrationDeadline &&
    this.filledSlots < this.totalSlots
  );
});

// ── Virtual: is room published ──────────────────────────────
tournamentSchema.virtual("hasRoomCredentials").get(function () {
  return Boolean(this.roomId && this.roomPassword);
});

// ── Pre-save: validate gameMode + teamMode combo ────────────
tournamentSchema.pre("save", function (next) {
  // Clash Squad only allows Squad mode
  if (this.gameMode === "CS" && this.teamMode !== "Squad") {
    return next(new Error("Clash Squad only supports Squad team mode"));
  }

  // Auto-calculate slots based on gameMode + teamMode
  if (this.gameMode === "CS") {
    this.totalSlots = 2; // 4v4
    this.playersPerSlot = 4;
    this.totalPlayers = 8;
  } else {
    // BR
    if (this.teamMode === "Squad") {
      this.totalSlots = 12;
      this.playersPerSlot = 4;
      this.totalPlayers = 48;
    } else if (this.teamMode === "Duo") {
      this.totalSlots = 24;
      this.playersPerSlot = 2;
      this.totalPlayers = 48;
    } else {
      // Solo
      this.totalSlots = 48;
      this.playersPerSlot = 1;
      this.totalPlayers = 48;
    }
  }

  // Paid tournaments must have entry fee > 0
  if (this.tournamentType === "paid" && this.entryFee <= 0) {
    return next(new Error("Paid tournaments must have an entry fee"));
  }

  // Free tournaments must have entry fee = 0
  if (this.tournamentType === "free" && this.entryFee > 0) {
    return next(new Error("Free tournaments cannot have an entry fee"));
  }

  // Registration deadline must be before start date
  if (this.registrationDeadline >= this.startDate) {
    return next(new Error("Registration deadline must be before start date"));
  }

  // Start must be before end
  if (this.startDate >= this.endDate) {
    return next(new Error("Start date must be before end date"));
  }

  next();
});

// ── Indexes ─────────────────────────────────────────────────
tournamentSchema.index({ status: 1, tournamentType: 1 });
tournamentSchema.index({ startDate: 1 });
tournamentSchema.index({ organizer: 1 });

tournamentSchema.set("toJSON", { virtuals: true });
tournamentSchema.set("toObject", { virtuals: true });

export const Tournament =
  mongoose.models.Tournament || mongoose.model("Tournament", tournamentSchema);
