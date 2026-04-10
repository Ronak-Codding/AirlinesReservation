const mongoose = require("mongoose");

const airportSchema = new mongoose.Schema(
  {
    airport_name: {
      type: String,
      required: [true, "Airport name is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    airport_code: {
      type: String,
      required: [true, "Airport code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Airport code must be 3 characters"],
      maxlength: [3, "Airport code must be 3 characters"],
    },
    status: {
      type: String,
      enum: ["Publish", "Draft"],
      default: "Publish",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Airport", airportSchema);


