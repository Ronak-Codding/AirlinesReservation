// cron/flightReminder.js
const cron = require("node-cron");
const Booking = require("../models/Booking");
const Passenger = require("../models/Passenger");
const Flight = require("../models/flights.model");
const { sendFlightDayEmail } = require("../utils/emailService");

// ── Helper: date string "YYYY-MM-DD" ─────────────────────
const getDateStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// ── Core: booking → passengers → email send ──────────────
const sendEmailsForBooking = async (booking, isTomorrow = false) => {
  try {
    const passengers = await Passenger.find({
      bookingId: booking._id,
      email: { $exists: true, $ne: "" },
    }).lean();

    if (passengers.length === 0) {
      console.warn(`⚠️  No passengers with email for booking ${booking._id}`);
      return;
    }

    for (const passenger of passengers) {
      try {
        await sendFlightDayEmail(
          passenger.email,
          passenger.fullName || "Traveller",
          booking,
          isTomorrow,
        );
        console.log(
          `📧 Sent [${isTomorrow ? "Tomorrow" : "Today"}] → ${passenger.email} | ${passenger.fullName} | Flight ${booking.flightNumber}`,
        );
      } catch (emailErr) {
        console.error(
          `❌ Email failed for ${passenger.email}:`,
          emailErr.message,
        );
      }
    }
  } catch (err) {
    console.error(`❌ sendEmailsForBooking crashed:`, err.message);
  }
};

// ══════════════════════════════════════════════════════════
// ✅ 1. AUTO FLIGHT STATUS UPDATER — every 5 minutes
// ══════════════════════════════════════════════════════════
const startFlightStatusUpdater = () => {
  cron.schedule(
    "*/5 * * * *",
    async () => {
      try {
        const now = new Date();

        // Scheduled/Delayed → Completed
        const completedResult = await Flight.updateMany(
          {
            status: { $in: ["Scheduled", "Delayed"] },
            arrival_time: { $lt: now },
          },
          { $set: { status: "Completed" } },
        );
        if (completedResult.modifiedCount > 0) {
          console.log(
            `✅ [Status] ${completedResult.modifiedCount} flight(s) → Completed`,
          );
        }

        // Scheduled → Delayed
        const delayedResult = await Flight.updateMany(
          {
            status: "Scheduled",
            departure_time: { $lt: now },
            arrival_time: { $gte: now },
          },
          { $set: { status: "Delayed" } },
        );
        if (delayedResult.modifiedCount > 0) {
          console.log(
            `🟡 [Status] ${delayedResult.modifiedCount} flight(s) → Delayed`,
          );
        }
      } catch (err) {
        console.error("❌ [Status Updater] Crashed:", err.message);
      }
    },
    { timezone: "Asia/Kolkata" },
  );

  console.log("🔄 [Cron] Flight status updater scheduled — every 5 minutes");
};

// ══════════════════════════════════════════════════════════
// ✅ 2. PER-BOOKING DYNAMIC SCHEDULER
//    Called when a booking is confirmed
// ══════════════════════════════════════════════════════════
const REMINDER_HOUR = 8; // 8:00 AM IST — fixed time for all reminders
const REMINDER_MINUTE = 0;

const scheduleBookingReminders = (booking) => {
  const flightDate = new Date(booking.date);
  const now = new Date();

  // ── A. 1 day before flight at 8:00 AM IST ────────────
  const dayBefore = new Date(flightDate);
  dayBefore.setDate(dayBefore.getDate() - 1);
  dayBefore.setHours(REMINDER_HOUR, REMINDER_MINUTE, 0, 0);

  if (dayBefore > now) {
    const cronExpr = `${REMINDER_MINUTE} ${REMINDER_HOUR} ${dayBefore.getDate()} ${dayBefore.getMonth() + 1} *`;
    cron.schedule(
      cronExpr,
      async () => {
        console.log(
          `\n⏰ [Reminder] 1-day before — Flight ${booking.flightNumber}`,
        );
        const freshBooking = await Booking.findById(booking._id).lean();
        if (
          freshBooking?.status === "confirmed" &&
          !freshBooking.reminderSentTomorrow
        ) {
          await sendEmailsForBooking(freshBooking, true);
          await Booking.findByIdAndUpdate(booking._id, {
            reminderSentTomorrow: true,
          });
        }
      },
      { timezone: "Asia/Kolkata" },
    );
    console.log(
      `📅 [Scheduled] 1-day before → ${dayBefore.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} | Flight ${booking.flightNumber}`,
    );
  }

  // ── B. Flight day at 8:00 AM IST ──────────────────────
  const flightDay = new Date(flightDate);
  flightDay.setHours(REMINDER_HOUR, REMINDER_MINUTE, 0, 0);

  if (flightDay > now) {
    const cronExpr = `${REMINDER_MINUTE} ${REMINDER_HOUR} ${flightDay.getDate()} ${flightDay.getMonth() + 1} *`;
    cron.schedule(
      cronExpr,
      async () => {
        console.log(
          `\n⏰ [Reminder] Flight day — Flight ${booking.flightNumber}`,
        );
        const freshBooking = await Booking.findById(booking._id).lean();
        if (
          freshBooking?.status === "confirmed" &&
          !freshBooking.reminderSentToday
        ) {
          await sendEmailsForBooking(freshBooking, false);
          await Booking.findByIdAndUpdate(booking._id, {
            reminderSentToday: true,
          });
        }
      },
      { timezone: "Asia/Kolkata" },
    );
    console.log(
      `📅 [Scheduled] Flight day → ${flightDay.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} | Flight ${booking.flightNumber}`,
    );
  }
};

// ══════════════════════════════════════════════════════════
// ✅ 3. SERVER START — reschedule + status sync
// ══════════════════════════════════════════════════════════
const rescheduleExistingBookings = async () => {
  console.log("\n🔄 [Startup] Rescheduling existing confirmed bookings...");
  try {
    const today = getDateStr(0);
    const tomorrow = getDateStr(1);

    // ── Future bookings — reschedule cron ─────────────────
    const futureBookings = await Booking.find({
      status: "confirmed",
      date: { $gt: tomorrow }, // strictly after tomorrow (tomorrow handled below)
    }).lean();
    console.log(
      `📋 [Startup] ${futureBookings.length} future booking(s) rescheduled`,
    );
    for (const booking of futureBookings) {
      scheduleBookingReminders(booking);
    }

    // ── Today's bookings — send if not already sent ───────
    const todayBookings = await Booking.find({
      status: "confirmed",
      date: { $regex: `^${today}` },
      reminderSentToday: { $ne: true },
    }).lean();
    console.log(
      `📋 [Startup] ${todayBookings.length} today's booking(s) — sending now`,
    );
    for (const booking of todayBookings) {
      await sendEmailsForBooking(booking, false);
      await Booking.findByIdAndUpdate(booking._id, { reminderSentToday: true });
    }

    // ── Tomorrow's bookings — send if not already sent ────
    const tomorrowBookings = await Booking.find({
      status: "confirmed",
      date: { $regex: `^${tomorrow}` },
      reminderSentTomorrow: { $ne: true },
    }).lean();
    console.log(
      `📋 [Startup] ${tomorrowBookings.length} tomorrow's booking(s) — sending now`,
    );
    for (const booking of tomorrowBookings) {
      await sendEmailsForBooking(booking, true);
      await Booking.findByIdAndUpdate(booking._id, {
        reminderSentTomorrow: true,
      });
    }

    // ── Startup flight status sync ────────────────────────
    const now = new Date();

    const completedResult = await Flight.updateMany(
      { status: { $in: ["Scheduled", "Delayed"] }, arrival_time: { $lt: now } },
      { $set: { status: "Completed" } },
    );
    if (completedResult.modifiedCount > 0)
      console.log(
        `✅ [Startup] ${completedResult.modifiedCount} flight(s) → Completed`,
      );

    const delayedResult = await Flight.updateMany(
      {
        status: "Scheduled",
        departure_time: { $lt: now },
        arrival_time: { $gte: now },
      },
      { $set: { status: "Delayed" } },
    );
    if (delayedResult.modifiedCount > 0)
      console.log(
        `🟡 [Startup] ${delayedResult.modifiedCount} flight(s) → Delayed`,
      );
  } catch (err) {
    console.error(
      "❌ [Startup] rescheduleExistingBookings crashed:",
      err.message,
    );
  }
};

// ══════════════════════════════════════════════════════════
// ✅ 4. DAILY CRON — 06:00 AM IST (backup safety net)
// ══════════════════════════════════════════════════════════
const startFlightReminderCron = () => {
  cron.schedule(
    "30 0 * * *",
    async () => {
      console.log(
        "\n⏰ [Cron] Daily backup reminder —",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      );

      try {
        const todayStr = getDateStr(0);
        const tomorrowStr = getDateStr(1);

        // ── Today — only unsent ───────────────────────────
        const todayBookings = await Booking.find({
          status: "confirmed",
          date: { $regex: `^${todayStr}` },
          reminderSentToday: { $ne: true },
        }).lean();
        for (const booking of todayBookings) {
          await sendEmailsForBooking(booking, false);
          await Booking.findByIdAndUpdate(booking._id, {
            reminderSentToday: true,
          });
        }

        // ── Tomorrow — only unsent ────────────────────────
        const tomorrowBookings = await Booking.find({
          status: "confirmed",
          date: { $regex: `^${tomorrowStr}` },
          reminderSentTomorrow: { $ne: true },
        }).lean();
        for (const booking of tomorrowBookings) {
          await sendEmailsForBooking(booking, true);
          await Booking.findByIdAndUpdate(booking._id, {
            reminderSentTomorrow: true,
          });
        }

        console.log(`✅ [Cron] Daily backup done\n`);
      } catch (err) {
        console.error("❌ [Cron] Daily backup crashed:", err.message);
      }
    },
    { timezone: "Asia/Kolkata" },
  );

  console.log("🕐 [Cron] Daily backup scheduled — 06:00 AM IST");
};

module.exports = {
  startFlightReminderCron,
  startFlightStatusUpdater,
  scheduleBookingReminders,
  rescheduleExistingBookings,
};
