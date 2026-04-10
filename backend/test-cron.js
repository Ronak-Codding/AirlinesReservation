// test-cron.js
require("dotenv").config();
const Booking = require("./models/Booking");
const Passenger = require("./models/Passenger");
const { sendFlightDayEmail } = require("./utils/emailService");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL).then(async () => {
  console.log("✅ DB Connected");

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;
  console.log("📅 Today string:", todayStr);

  // Today's confirmed bookings
  const bookings = await Booking.find({
    status: "confirmed",
    date: { $regex: `^${todayStr}` },
  }).lean();

  console.log(`📋 Found ${bookings.length} booking(s):`, bookings);

  for (const booking of bookings) {
    const passengers = await Passenger.find({
      bookingId: booking._id,
      email: { $exists: true, $ne: "" },
    }).lean();

    console.log(`👥 Passengers for booking ${booking._id}:`, passengers);

    for (const passenger of passengers) {
      await sendFlightDayEmail(passenger.email, passenger.fullName, booking);
      console.log(`📧 Sent to ${passenger.email}`);
    }
  }

  mongoose.disconnect();
});