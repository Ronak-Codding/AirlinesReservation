const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Passenger = require("../models/Passenger");
const { generateBoardingPass } = require("../utils/boardingPassPDF");
const { scheduleBookingReminders } = require("../cron/flightReminder"); // ✅ added

// ══════════════════════════════════════════════════════════
// GET /api/booking/:bookingId/boarding-pass/:passengerId
// ══════════════════════════════════════════════════════════
router.get("/:bookingId/boarding-pass/:passengerId", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    const passenger = await Passenger.findById(req.params.passengerId);

    if (!booking || !passenger)
      return res.status(404).json({ message: "Not found" });

    const pdfBuffer = await generateBoardingPass(passenger, booking);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=boarding-pass-${booking.flightNumber}.pdf`,
      "Content-Length": pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════
// POST /api/booking — Save Booking + Passengers
// ══════════════════════════════════════════════════════════
router.post("/", async (req, res) => {
  try {
    const {
      flightNumber,
      from,
      to,
      date,
      seats,
      totalPrice,
      paymentMethod,
      transactionId,
      passengers,
    } = req.body;

    const booking = new Booking({
      flightNumber,
      from,
      to,
      date,
      seats: seats || [],
      totalPrice,
      paymentMethod: paymentMethod || "card",
      transactionId: transactionId || "",
      paymentStatus: "pending",
      status: "pending",
      passengers: [],
    });
    await booking.save();

    const savedPassengers = [];
    for (let i = 0; i < (passengers || []).length; i++) {
      const p = passengers[i];
      const passenger = new Passenger({
        bookingId: booking._id,
        fullName: p.fullName,
        gender: p.gender,
        dob: p.dob,
        nationality: p.nationality,
        passportNumber: p.passportNumber,
        passportExpiry: p.passportExpiry,
        email: p.email,
        phone: p.phone,
        seat: seats?.[i] || "",
      });
      await passenger.save();
      savedPassengers.push(passenger._id);
    }

    booking.passengers = savedPassengers;
    await booking.save();

    res.status(201).json({ success: true, bookingId: booking._id });
  } catch (error) {
    console.error("Booking save error:", error);
    res.status(500).json({ error: "Booking save failed" });
  }
});

// ══════════════════════════════════════════════════════════
// GET /api/booking — All Bookings (Admin)
// ══════════════════════════════════════════════════════════
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      startDate = "",
      endDate = "",
    } = req.query;

    let bookings = await Booking.find()
      .populate("passengers")
      .sort({ createdAt: -1 });

    let rows = bookings.map((booking) => ({
      _id: booking._id,
      bookingRef: "BK" + booking._id.toString().slice(-6).toUpperCase(),
      flightNumber: booking.flightNumber || "",
      from: booking.from || "",
      to: booking.to || "",
      date: booking.date || "",
      seats: booking.seats || [],
      totalPrice: booking.totalPrice || 0,
      passengersCount: booking.passengers?.length || 0,
      userName: booking.passengers?.[0]?.fullName || "—",
      email: booking.passengers?.[0]?.email || "—",
      phone: booking.passengers?.[0]?.phone || "—",
      status: booking.status || "confirmed",
      paymentMethod: booking.paymentMethod || "",
      transactionId: booking.transactionId || "",
      createdAt: booking.createdAt,
    }));

    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.bookingRef.toLowerCase().includes(s) ||
          r.userName.toLowerCase().includes(s) ||
          r.email.toLowerCase().includes(s) ||
          r.flightNumber.toLowerCase().includes(s) ||
          r.from.toLowerCase().includes(s) ||
          r.to.toLowerCase().includes(s),
      );
    }

    if (startDate)
      rows = rows.filter((r) => new Date(r.createdAt) >= new Date(startDate));
    if (endDate)
      rows = rows.filter(
        (r) => new Date(r.createdAt) <= new Date(endDate + "T23:59:59"),
      );
    if (status !== "all") rows = rows.filter((r) => r.status === status);

    const total = rows.length;
    const paginated = rows.slice((page - 1) * limit, page * limit);

    res.json({
      bookings: paginated,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Bookings fetch error:", error);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// ══════════════════════════════════════════════════════════
// GET /api/booking/my-bookings/:email — User bookings
// ══════════════════════════════════════════════════════════
router.get("/my-bookings/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const passengers = await Passenger.find({
      email: { $regex: `^${email}$`, $options: "i" },
    });

    const bookingIds = [
      ...new Set(passengers.map((p) => p.bookingId.toString())),
    ];

    const bookings = await Booking.find({ _id: { $in: bookingIds } })
      .populate("passengers")
      .sort({ createdAt: -1 });

    const formatted = bookings.map((booking) => ({
      _id: booking._id,
      bookingId: "BK" + booking._id.toString().slice(-6).toUpperCase(),
      flightNumber: booking.flightNumber || "",
      from: booking.from || "",
      to: booking.to || "",
      date: booking.date || "",
      seats: booking.seats || [],
      totalPrice: booking.totalPrice || 0,
      passengers: booking.passengers || [],
      status: booking.status || "confirmed",
      paymentMethod: booking.paymentMethod || "",
      createdAt: booking.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("My bookings error:", error);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// ══════════════════════════════════════════════════════════
// PUT /api/booking/cancel/:id — Cancel Booking
// ══════════════════════════════════════════════════════════
router.put("/cancel/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true },
    );
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: "Cancel failed" });
  }
});

// ══════════════════════════════════════════════════════════
// GET /api/booking/:id — Single Booking by ID
// ══════════════════════════════════════════════════════════
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      "passengers",
    );
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// ══════════════════════════════════════════════════════════
// PUT /api/booking/:id — Update Booking
// ══════════════════════════════════════════════════════════
router.put("/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("passengers");
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// ══════════════════════════════════════════════════════════
// DELETE /api/booking/:id — Delete Booking + its Passengers
// ══════════════════════════════════════════════════════════
router.delete("/:id", async (req, res) => {
  try {
    await Passenger.deleteMany({ bookingId: req.params.id });
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ══════════════════════════════════════════════════════════
// PATCH /api/booking/confirm-payment/:id ✅ FIXED
// — called by frontend after PayU redirect
// — email already sent by payu-success (no duplicate here)
// ══════════════════════════════════════════════════════════
router.patch("/confirm-payment/:id", async (req, res) => {
  try {
    const { transactionId, paymentMethod } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: "confirmed",
        paymentStatus: "success",
        transactionId,
        paymentMethod,
      },
      { new: true },
    ).populate("passengers");

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // ✅ Schedule reminder emails — payment email already sent by payu-success
    scheduleBookingReminders(booking);

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: "Confirm failed" });
  }
});

// ══════════════════════════════════════════════════════════
// GET /api/booking/export/csv — Export CSV
// ══════════════════════════════════════════════════════════
router.get("/export/csv", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("passengers")
      .sort({ createdAt: -1 });

    if (bookings.length === 0)
      return res.status(404).json({ error: "No data to export" });

    const rows = bookings.map((booking) => ({
      BookingRef: "BK" + booking._id.toString().slice(-6).toUpperCase(),
      PassengerName: booking.passengers?.[0]?.fullName || "",
      Email: booking.passengers?.[0]?.email || "",
      Phone: booking.passengers?.[0]?.phone || "",
      Flight: booking.flightNumber || "",
      From: booking.from || "",
      To: booking.to || "",
      Date: booking.date || "",
      Seats: booking.seats?.join(", ") || "",
      Passengers: booking.passengers?.length || 0,
      Amount: booking.totalPrice || 0,
      PaymentMethod: booking.paymentMethod || "",
      Status: booking.status || "confirmed",
      BookedOn: new Date(booking.createdAt).toLocaleDateString("en-IN"),
    }));

    const headers = Object.keys(rows[0]).join(",");
    const csv = [
      headers,
      ...rows.map((r) =>
        Object.values(r)
          .map((v) => `"${v}"`)
          .join(","),
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=bookings.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: "Export failed" });
  }
});

module.exports = router;
