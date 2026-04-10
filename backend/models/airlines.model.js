const mongoose = require("mongoose");

const airlineSchema = new mongoose.Schema(
  {
    airline_name: {
      type: String,
      required: true,
    },
    airline_code: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Publish", "Draft"],
      default: "Publish",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Airline", airlineSchema);
