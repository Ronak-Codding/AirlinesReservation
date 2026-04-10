const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/userRoutes");
const adminAuthRoutes = require("./routes/adminAuth.route");
const airlineRoutes = require("./routes/airlineRoutes");
const flightRoutes = require("./routes/flightslivedata");
const bookingRoutes = require("./routes/booking");
const otpRoutes = require("./routes/otp");
const passengerRoutes = require("./routes/passengerRoutes");
const paymentRoutes = require("./routes/Payment");

// ── Cron Job ──────────────────────────────────────────────
const {
  startFlightReminderCron,
  startFlightStatusUpdater,
  rescheduleExistingBookings,
} = require("./cron/flightReminder");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────
app.use("/api/otp", otpRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/user", authRoutes);
app.use("/api/contact", require("./routes/contact.routes"));
app.use("/api/airlines", airlineRoutes);
app.use("/api/airports", require("./routes/airportRoutes"));
app.use("/api/flights", require("./routes/flightRoutes"));
app.use("/api/flights", flightRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/passenger", passengerRoutes);
app.use("/api/payment", paymentRoutes);

// ── DB + Server Start ─────────────────────────────────────
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB Connected Successfully");
    startFlightReminderCron(); // daily 6 AM email backup
    startFlightStatusUpdater(); // ←  5 minute status update
    await rescheduleExistingBookings();
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
