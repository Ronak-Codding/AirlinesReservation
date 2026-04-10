const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema(
  {
    // ── Reference to Booking ──
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    // ── Passenger Personal Info ──
    fullName: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dob: { type: String },
    nationality: { type: String },
    passportNumber: { type: String },
    passportExpiry: { type: String },

    // ── Contact Info ──
    email: { type: String },
    phone: { type: String },

    // ── Seat assigned to this passenger ──
    seat: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Passenger", passengerSchema);