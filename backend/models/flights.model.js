const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema(
  {
    flight_number: {
      type: String,
      required: true,
      unique: true,
    },

    airline: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Airline",
      required: true,
    },  

    from_airport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Airport",
      required: true,
    },

    to_airport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Airport",
      required: true,
    },

    departure_time: { type: Date, required: true },
    arrival_time: { type: Date, required: true },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    seats_available: { type: Number, required: true, min: 0 },
    total_seats: { type: Number, required: true },
    aircraft_type: { type: String, default: "Boeing 737" },

    status: {
      type: String,
      enum: ["Scheduled", "Delayed", "Cancelled", "Completed"],
      default: "Scheduled",
    },

    admin_status: {
      type: String,
      enum: ["Publish", "Draft"],
      default: "Publish",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Flight", flightSchema);