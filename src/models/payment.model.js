/**
 * /models/payment.model.js
 *
 * Tracks every Razorpay order from creation through capture/failure.
 * The webhook and the client-side verify route both update this record,
 * and idempotency checks rely on the status field.
 */

import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    // Razorpay order ID — created when user initiates checkout
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Razorpay payment ID — set after capture or failure
    // sparse: true is REQUIRED here — without it, two "null" values
    // will violate the unique constraint on insert
    paymentId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },

    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Amount in paise (e.g. ₹99 → 9900)
    amount: {
      type: Number,
      required: true,
    },

    // Lifecycle:
    //   created   → order created, user has not paid yet
    //   pending   → (reserved for future use, e.g. UPI collect pending)
    //   captured  → payment successful, tournament join complete
    //   failed    → payment failed or declined
    status: {
      type: String,
      enum: ["created", "pending", "captured", "failed"],
      default: "created",
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index: quickly find an active order for a given user+tournament
// (used for idempotency check in POST /api/payments/razorpay)
PaymentSchema.index({ tournamentId: 1, userId: 1, status: 1 });

export const Payment =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);