// testEmail.js  ←  backend root folder માં મૂકો
// Run: node testEmail.js
//
// આ script cron wait કર્યા વગર તરત email send કરશે — debug માટે

require("dotenv").config();
const mongoose = require("mongoose");

const Booking = require("./models/Booking");
const Passenger = require("./models/Passenger");
const nodemailer = require("nodemailer");

const run = async () => {
  // ── 1. Connect DB ──────────────────────────────────────
  await mongoose.connect(process.env.MONGO_URL);
  console.log("✅ MongoDB connected");

  // ── 2. Test nodemailer directly ────────────────────────
  console.log("\n📧 Testing Gmail SMTP...");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ Gmail SMTP OK — credentials working");
  } catch (err) {
    console.error("❌ Gmail SMTP FAILED:", err.message);
    console.log("\n🔧 Fix: Gmail App Password check કરો:");
    console.log("   1. https://myaccount.google.com/apppasswords");
    console.log("   2. New App Password generate કરો");
    console.log("   3. .env માં EMAIL_PASS update કરો");
    process.exit(1);
  }

  // ── 3. Check today's bookings in DB ───────────────────
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  console.log(`\n📅 Checking bookings for today: ${todayStr}`);

  const bookings = await Booking.find({
    status: "confirmed",
    date: { $regex: `^${todayStr}` },
  }).lean();

  console.log(`📋 Found ${bookings.length} booking(s) for today`);

  if (bookings.length === 0) {
    // Show ALL bookings to debug date format
    const allBookings = await Booking.find({ status: "confirmed" })
      .select("flightNumber from to date status")
      .lean();
    console.log("\n⚠️  No today bookings found. All confirmed bookings:");
    console.table(
      allBookings.map((b) => ({
        id: b._id.toString().slice(-6),
        flight: b.flightNumber,
        route: `${b.from}→${b.to}`,
        date: b.date,
        status: b.status,
      })),
    );
    console.log(
      `\n👆 date field format check કરો — "${todayStr}" match થવો જોઈએ`,
    );
    await mongoose.disconnect();
    return;
  }

  // ── 4. Check passengers for those bookings ────────────
  for (const booking of bookings) {
    console.log(
      `\n✈️  Booking: ${booking.flightNumber} | ${booking.from}→${booking.to} | ${booking.date}`,
    );

    const passengers = await Passenger.find({ bookingId: booking._id }).lean();
    console.log(`   👥 Passengers found: ${passengers.length}`);

    if (passengers.length === 0) {
      console.warn("   ⚠️  No passengers linked to this booking!");
      continue;
    }

    for (const p of passengers) {
      console.log(
        `   🧑 ${p.fullName} | email: ${p.email || "❌ NO EMAIL"} | seat: ${p.seat}`,
      );

      if (!p.email) {
        console.warn("   ⚠️  Passenger has no email — skipping");
        continue;
      }

      // ── 5. Send test email ─────────────────────────────
      console.log(`   📤 Sending test email to ${p.email}...`);
      try {
        await transporter.sendMail({
          from: `"SkyJet Airlines ✈️" <${process.env.EMAIL_USER}>`,
          to: p.email,
          subject: `🛫 [TEST] Today is Your Flight Day! — ${booking.from} → ${booking.to}`,
          html: `
            <div style="font-family:sans-serif;background:#0f1117;color:#e8eaf6;padding:24px;border-radius:12px;">
              <h2 style="color:#f59e0b;">✈️ Today is Your Flight Day!</h2>
              <p>Dear <strong>${p.fullName}</strong>,</p>
              <p>Your flight <strong style="color:#a78bfa;">${booking.flightNumber}</strong> from 
                 <strong>${booking.from}</strong> to <strong>${booking.to}</strong> is today!</p>
              <div style="background:#1e2235;padding:16px;border-radius:8px;margin:16px 0;">
                <p>📅 Date: <strong>${booking.date}</strong></p>
                <p>💺 Seat: <strong>${p.seat || "—"}</strong></p>
                <p>🎟️ Status: <strong style="color:#10b981;">Confirmed</strong></p>
              </div>
              <p style="color:#7c82a3;font-size:12px;">This is a test email from SkyJet Airlines</p>
            </div>
          `,
        });
        console.log(`   ✅ Email sent successfully to ${p.email}`);
      } catch (emailErr) {
        console.error(`   ❌ Email send failed:`, emailErr.message);
      }
    }
  }

  await mongoose.disconnect();
  console.log("\n🏁 Test complete");
};

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
