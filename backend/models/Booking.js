const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // ── Flight Info ──
    flightNumber: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    date: { type: String },
    seats: [{ type: String }],
    totalPrice: { type: Number, required: true },

    // ── Booking Status ──
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "pending"],
      default: "pending",
    },

    // ── Reference to Passengers ──
    passengers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Passenger",
      },
    ],

    // ── Payment Info ──
    transactionId: { type: String },
    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet", "cash", "cheque"],
      default: "card",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },

    // ── Email Reminder Flags (prevents duplicate sends on server restart) ──
    reminderSentToday: { type: Boolean, default: false },
    reminderSentTomorrow: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ── Indexes for cron query performance ──
bookingSchema.index({ status: 1, date: 1 });
bookingSchema.index({ status: 1, date: 1, reminderSentToday: 1 });
bookingSchema.index({ status: 1, date: 1, reminderSentTomorrow: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
