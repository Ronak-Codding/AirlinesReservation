const express = require("express");
const router = express.Router();
const Passenger = require("../models/Passenger");
const Booking = require("../models/Booking");

// ══════════════════════════════════════════════════════════
// ✅ GET /api/passenger/allpassengers — All Passengers (Admin)
// ══════════════════════════════════════════════════════════
router.get("/allpassengers", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      gender = "",
      minAge = "",
      maxAge = "",
    } = req.query;

    let passengers = await Passenger.find()
      .populate("bookingId")
      .sort({ createdAt: -1 });

    // Format for frontend
    let formatted = passengers.map((p) => ({
      _id: p._id,
      bookingId: p.bookingId?._id || p.bookingId,
      bookingRef: p.bookingId
        ? "BK" + p.bookingId._id.toString().slice(-6).toUpperCase()
        : "—",
      fullName: p.fullName,
      gender: p.gender,
      dob: p.dob,
      nationality: p.nationality,
      passportNumber: p.passportNumber,
      passportExpiry: p.passportExpiry,
      email: p.email || "",
      phone: p.phone || "",
      seat: p.seat || "—",
      flightNumber: p.bookingId?.flightNumber || "",
      from: p.bookingId?.from || "",
      to: p.bookingId?.to || "",
      date: p.bookingId?.date || "",
      totalPrice: p.bookingId?.totalPrice || 0,
      createdAt: p.createdAt,
      age: p.dob
        ? Math.floor(
            (new Date() - new Date(p.dob)) / (365.25 * 24 * 60 * 60 * 1000),
          )
        : null,
    }));

    // Search filter
    if (search) {
      const s = search.toLowerCase();
      formatted = formatted.filter(
        (p) =>
          p.fullName?.toLowerCase().includes(s) ||
          p.bookingRef?.toLowerCase().includes(s) ||
          p.seat?.toLowerCase().includes(s) ||
          p.passportNumber?.toLowerCase().includes(s) ||
          p.email?.toLowerCase().includes(s),
      );
    }

    // Gender filter
    if (gender && gender !== "all") {
      formatted = formatted.filter(
        (p) => p.gender?.toLowerCase() === gender.toLowerCase(),
      );
    }

    // Age filter
    if (minAge) formatted = formatted.filter((p) => p.age >= parseInt(minAge));
    if (maxAge) formatted = formatted.filter((p) => p.age <= parseInt(maxAge));

    const total = formatted.length;
    const paginated = formatted.slice((page - 1) * limit, page * limit);

    res.json({
      passengers: paginated,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Passengers fetch error:", error);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// ══════════════════════════════════════════════════════════
// ✅ GET /api/passenger/onepassenger/:bookingId
// ══════════════════════════════════════════════════════════
router.get("/onepassenger/:bookingId", async (req, res) => {
  try {
    const passengers = await Passenger.find({
      bookingId: req.params.bookingId,
    }).populate("bookingId");
    if (!passengers.length)
      return res.status(404).json({ error: "No passengers found" });
    res.json(passengers);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// ══════════════════════════════════════════════════════════
// ✅ POST /api/passenger/passengers — Add Passenger manually
// ══════════════════════════════════════════════════════════
router.post("/passengers", async (req, res) => {
  try {
    const {
      bookingId,
      fullName,
      gender,
      dob,
      nationality,
      passportNumber,
      passportExpiry,
      email,
      phone,
      seat,
    } = req.body;

    const passenger = new Passenger({
      bookingId,
      fullName,
      gender,
      dob,
      nationality,
      passportNumber,
      passportExpiry,
      email,
      phone,
      seat,
    });

    await passenger.save();

    // Booking ma bhi passenger ID add karo
    await Booking.findByIdAndUpdate(bookingId, {
      $push: { passengers: passenger._id },
    });

    res.status(201).json({ success: true, passenger });
  } catch (error) {
    res.status(500).json({ error: "Add failed" });
  }
});

// ══════════════════════════════════════════════════════════
// ✅ PUT /api/passenger/passengers/:id — Edit Passenger
// ══════════════════════════════════════════════════════════
router.put("/passengers/:id", async (req, res) => {
  try {
    const passenger = await Passenger.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!passenger)
      return res.status(404).json({ error: "Passenger not found" });
    res.json({ success: true, passenger });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// ══════════════════════════════════════════════════════════
// ✅ DELETE /api/passenger/passengers/:id — Delete Passenger
// ══════════════════════════════════════════════════════════
router.delete("/passengers/:id", async (req, res) => {
  try {
    const passenger = await Passenger.findByIdAndDelete(req.params.id);
    if (!passenger)
      return res.status(404).json({ error: "Passenger not found" });

    // Booking se bhi passenger ID remove karo
    await Booking.findByIdAndUpdate(passenger.bookingId, {
      $pull: { passengers: passenger._id },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ══════════════════════════════════════════════════════════
// ✅ GET /api/passenger/passengers/export/csv
// ══════════════════════════════════════════════════════════
router.get("/passengers/export/csv", async (req, res) => {
  try {
    const passengers = await Passenger.find()
      .populate("bookingId")
      .sort({ createdAt: -1 });

    if (!passengers.length) return res.status(404).json({ error: "No data" });

    const rows = passengers.map((p) => ({
      BookingRef: p.bookingId
        ? "BK" + p.bookingId._id.toString().slice(-6).toUpperCase()
        : "—",
      FullName: p.fullName || "",
      Gender: p.gender || "",
      DOB: p.dob || "",
      Nationality: p.nationality || "",
      PassportNumber: p.passportNumber || "",
      PassportExpiry: p.passportExpiry || "",
      Email: p.email || "",
      Phone: p.phone || "",
      Seat: p.seat || "",
      Flight: p.bookingId?.flightNumber || "",
      From: p.bookingId?.from || "",
      To: p.bookingId?.to || "",
      Price: p.bookingId?.totalPrice || 0,
      BookedOn: new Date(p.createdAt).toLocaleDateString("en-IN"),
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
    res.setHeader("Content-Disposition", "attachment; filename=passengers.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: "Export failed" });
  }
});

module.exports = router;
