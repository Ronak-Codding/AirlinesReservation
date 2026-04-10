const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      default: () =>
        "TXN" +
        Date.now() +
        Math.random().toString(36).slice(2, 7).toUpperCase(),
      unique: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    passengerName: String,
    email: String,

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet", "cash", "cheque"],
      default: "card",
    },

    // ✅ refund_requested added to enum
    status: {
      type: String,
      enum: ["success", "failed", "pending", "refunded", "refund_requested"],
      default: "success",
    },

    // Flight info
    flightNumber: String,
    from: String,
    to: String,
    date: String,
    seats: [String],

    // Refund request info (set by user when cancelling)
    refundReason: { type: String },
    refundRequestedAt: { type: Date },
    refundRequestedBy: { type: String },

    // Refund rejection info (set by admin when rejecting)
    refundRejectedReason: { type: String },
    refundRejectedAt: { type: Date },
    refundRejectedBy: { type: String },

    // Refund approval info (set by admin when approving)
    refundApprovedBy: { type: String },
    refundedAt: { type: Date },

    // ✅ Net refund amounts stored after admin approves
    netRefundAmount: { type: Number },
    gstDeducted: { type: Number },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Payment", paymentSchema);
