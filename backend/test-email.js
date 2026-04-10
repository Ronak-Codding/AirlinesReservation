require("dotenv").config();
const { sendFlightDayEmail } = require("./utils/emailService");

const fakeBooking = {
  from: "DEL",
  to: "BLR",
  date: new Date().toISOString(),
  flightNumber: "BKE7C80E",
};

sendFlightDayEmail(
  "ronakhalpati884@gmail.com", 
  "Shiv Patel",
  fakeBooking,
)
  .then(() => console.log("✅ Email sent!"))
  .catch((err) => console.error("❌ Error:", err.message));
