const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const crypto = require("crypto");

const {
  sendFlightPaymentEmail,
  sendRefundApprovedEmail,
  sendRefundRejectedEmail,
} = require("../utils/emailService");

const { scheduleBookingReminders } = require("../cron/flightReminder"); // ✅ added

const PAYU_KEY = "fELJ1T";
const PAYU_SALT = "k24eKJ1CxpEKaTFu6GZIElVjeAWx0dr6";
const PAYU_BASE_URL = "https://test.payu.in/_payment";
const FRONTEND_URL = "http://localhost:3000";
const GST_RATE = 0.18;

const PAYU_MODE_MAP = {
  CC: "card",
  DC: "card",
  NB: "netbanking",
  UPI: "upi",
  CASH: "wallet",
  EMI: "card",
};

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const calcRefundBreakdown = (total) => {
  const base = total / (1 + GST_RATE);
  const gst = total - base;
  return {
    base: Math.round(base),
    gst: Math.round(gst),
    net: Math.round(base),
  };
};

// ══════════════════════════════════════════════════════════
// POST /api/payment/payu-initiate
// ══════════════════════════════════════════════════════════
router.post("/payu-initiate", async (req, res) => {
  try {
    const {
      amount,
      name,
      email,
      phone,
      bookingId,
      from,
      to,
      flight,
      date,
      seats,
    } = req.body;

    const baseAmount = parseFloat(amount);
    const totalAmount = baseAmount + baseAmount * GST_RATE;
    const amountStr = totalAmount.toFixed(2);
    const txnid = "TXN" + Date.now();
    const productinfo = `Flight-${flight}`;
    const firstname = name || "Guest";
    const emailStr = email || "test@gmail.com";
    const udf1 = bookingId?.toString() || "";
    const udf2 = flight?.toString() || "";
    const udf3 = from?.toString() || "";
    const udf4 = to?.toString() || "";
    const udf5 = date?.toString() || "";
    const udf6 = Array.isArray(seats)
      ? seats.join(",")
      : seats?.toString() || "";

    const hashString = [
      PAYU_KEY,
      txnid,
      amountStr,
      productinfo,
      firstname,
      emailStr,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
      udf6,
      "",
      "",
      "",
      "",
      PAYU_SALT,
    ].join("|");

    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    console.log(
      `💰 Base: ₹${baseAmount} | GST(18%): ₹${(baseAmount * GST_RATE).toFixed(2)} | Total: ₹${amountStr}`,
    );

    res.json({
      success: true,
      payuData: {
        key: PAYU_KEY,
        txnid,
        amount: amountStr,
        productinfo,
        firstname,
        email: emailStr,
        phone: phone || "9999999999",
        surl: `http://localhost:5000/api/payment/payu-success`,
        furl: `http://localhost:5000/api/payment/payu-failure`,
        hash,
        udf1,
        udf2,
        udf3,
        udf4,
        udf5,
        udf6,
      },
      payuUrl: PAYU_BASE_URL,
      breakdown: {
        baseFare: baseAmount,
        gst: parseFloat((baseAmount * GST_RATE).toFixed(2)),
        total: parseFloat(amountStr),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PayU initiate failed" });
  }
});

// ══════════════════════════════════════════════════════════
// POST /api/payment/payu-success
// ══════════════════════════════════════════════════════════
router.post("/payu-success", async (req, res) => {
  try {
    const {
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      status,
      hash,
      mihpayid,
      mode,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
      udf6,
    } = req.body;

    const reverseHash = [
      PAYU_SALT,
      status,
      udf6 || "",
      udf5 || "",
      udf4 || "",
      udf3 || "",
      udf2 || "",
      udf1 || "",
      "",
      "",
      "",
      "",
      email || "",
      firstname || "",
      productinfo || "",
      amount || "",
      txnid || "",
      PAYU_KEY,
    ].join("|");

    const calcHash = crypto
      .createHash("sha512")
      .update(reverseHash)
      .digest("hex");
    if (calcHash !== hash)
      console.warn("⚠️ Hash mismatch - continuing in test mode");

    const paymentMethod = PAYU_MODE_MAP[mode] || "card";

    let parsedSeats = udf6 ? udf6.split(",").filter(Boolean) : [];
    if (parsedSeats.length === 0 && mongoose.Types.ObjectId.isValid(udf1)) {
      try {
        const booking = await Booking.findById(udf1);
        parsedSeats = booking?.seats?.filter(Boolean) || [];
      } catch (e) {
        console.warn("⚠️ Booking fetch failed:", e.message);
      }
    }

    const payment = new Payment({
      transactionId: txnid,
      bookingId: mongoose.Types.ObjectId.isValid(udf1)
        ? new mongoose.Types.ObjectId(udf1)
        : new mongoose.Types.ObjectId(),
      passengerName: firstname,
      email,
      amount: parseFloat(amount),
      paymentMethod,
      status: status === "success" ? "success" : "failed",
      flightNumber: udf2 || "",
      from: udf3 || "",
      to: udf4 || "",
      date: udf5 || "",
      seats: parsedSeats,
    });
    await payment.save();

    if (status === "success") {
      // ✅ Update booking status
      if (mongoose.Types.ObjectId.isValid(udf1)) {
        await Booking.findByIdAndUpdate(udf1, {
          status: "confirmed",
          paymentStatus: "success",
          transactionId: txnid,
          paymentMethod,
        });

        // ✅ Schedule reminder emails
        const confirmedBooking =
          await Booking.findById(udf1).populate("passengers");
        if (confirmedBooking) scheduleBookingReminders(confirmedBooking);
      }

      // ✅ Send payment confirmation email (single source of truth)
      if (email) {
        await sendFlightPaymentEmail(email, {
          passengerName: firstname,
          transactionId: txnid,
          flightNumber: udf2,
          from: udf3,
          to: udf4,
          date: udf5,
          seats: parsedSeats,
          amount: parseFloat(amount),
          paymentMethod,
        });
      }
    }

    res.redirect(
      `${FRONTEND_URL}/confirmation?bookingId=${udf1}&price=${amount}&from=${encodeURIComponent(udf3 || "")}&to=${encodeURIComponent(udf4 || "")}&flight=${encodeURIComponent(udf2 || "")}&date=${encodeURIComponent(udf5 || "")}&seats=${encodeURIComponent(parsedSeats.join(","))}&txnid=${txnid}&mihpayid=${mihpayid || ""}`,
    );
  } catch (err) {
    console.error("❌ payu-success error:", err);
    res.redirect(`${FRONTEND_URL}/checkout?error=server_error`);
  }
});

// ══════════════════════════════════════════════════════════
// POST /api/payment/payu-failure
// ══════════════════════════════════════════════════════════
router.post("/payu-failure", async (req, res) => {
  const { error_Message, txnid } = req.body;
  console.error("❌ PayU Failed:", error_Message);
  res.redirect(
    `${FRONTEND_URL}/checkout?error=${encodeURIComponent(error_Message || "Payment failed")}&txnid=${txnid || ""}`,
  );
});

// ══════════════════════════════════════════════════════════
// POST /api/payment/save  (cash / offline payments)
// ══════════════════════════════════════════════════════════
router.post("/save", async (req, res) => {
  try {
    const {
      bookingId,
      amount,
      paymentMethod,
      passengerName,
      email,
      flightNumber,
      from,
      to,
      date,
      seats,
    } = req.body;

    const base = parseFloat(amount);
    const total = base + base * GST_RATE;
    const parsedSeats = Array.isArray(seats)
      ? seats.filter(Boolean)
      : seats?.split(",").filter(Boolean) || [];

    const payment = new Payment({
      bookingId,
      amount: total,
      paymentMethod: paymentMethod || "cash",
      passengerName,
      email,
      flightNumber,
      from,
      to,
      date: date || "",
      seats: parsedSeats,
      status: "success",
    });
    await payment.save();

    // ✅ Confirm the booking
    await Booking.findByIdAndUpdate(bookingId, {
      status: "confirmed",
      paymentStatus: "success",
      transactionId: payment.transactionId || payment._id.toString(),
      paymentMethod: paymentMethod || "cash",
    });

    // ✅ Schedule reminder emails
    const confirmedBooking =
      await Booking.findById(bookingId).populate("passengers");
    if (confirmedBooking) scheduleBookingReminders(confirmedBooking);

    // ✅ Send payment confirmation email
    if (email) {
      await sendFlightPaymentEmail(email, {
        passengerName,
        transactionId: payment.transactionId || payment._id.toString(),
        flightNumber,
        from,
        to,
        date,
        seats: parsedSeats,
        amount: total,
        paymentMethod: paymentMethod || "cash",
      });
    }

    res.status(201).json({
      success: true,
      payment,
      breakdown: {
        baseFare: base,
        gst: parseFloat((base * GST_RATE).toFixed(2)),
        total: parseFloat(total.toFixed(2)),
      },
    });
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ error: "Payment save failed" });
  }
});

// ══════════════════════════════════════════════════════════
// GET /api/payment
// ══════════════════════════════════════════════════════════
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      method = "all",
      email = "",
    } = req.query;

    const query = {};
    if (status !== "all") query.status = status;
    if (method !== "all") query.paymentMethod = method;
    if (email) query.email = { $regex: `^${email}$`, $options: "i" };
    if (search)
      query.$or = [
        { transactionId: { $regex: search, $options: "i" } },
        { passengerName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { flightNumber: { $regex: search, $options: "i" } },
      ];

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const revenueMatch = { status: "success" };
    if (email) revenueMatch.email = { $regex: `^${email}$`, $options: "i" };
    const revenueData = await Payment.aggregate([
      { $match: revenueMatch },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      payments,
      total,
      pages: Math.ceil(total / limit),
      totalRevenue: revenueData[0]?.total || 0,
    });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// ══════════════════════════════════════════════════════════
// PATCH /api/payment/refund-request/:id  (User side)
// ══════════════════════════════════════════════════════════
router.patch("/refund-request/:id", async (req, res) => {
  try {
    const { reason, requestedBy } = req.body;
    if (!reason?.trim())
      return res.status(400).json({ error: "Refund reason is required" });

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (payment.status !== "success")
      return res
        .status(400)
        .json({ error: "Only successful payments can be refund-requested" });

    payment.status = "refund_requested";
    payment.refundReason = reason.trim();
    payment.refundRequestedAt = new Date();
    payment.refundRequestedBy = requestedBy || payment.email;
    await payment.save();

    console.log(
      `📩 Refund requested: ${payment.transactionId} | Reason: ${reason}`,
    );
    res.json({ success: true, payment });
  } catch (err) {
    console.error("Refund request error:", err);
    res.status(500).json({ error: "Refund request failed" });
  }
});

// ══════════════════════════════════════════════════════════
// PATCH /api/payment/refund/:id  (Admin approve)
// ══════════════════════════════════════════════════════════
router.patch("/refund/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    if (payment.status === "refunded") {
      console.log(
        `⚠️ Duplicate refund call blocked for: ${payment.transactionId}`,
      );
      return res
        .status(200)
        .json({ success: true, alreadyRefunded: true, payment });
    }

    const { reason, netRefundAmount, gstDeducted } = req.body;
    const { net, gst } = calcRefundBreakdown(payment.amount);
    const finalNet = netRefundAmount || net;
    const finalGst = gstDeducted || gst;

    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status: "refunded",
        refundReason: reason || payment.refundReason || "Approved by admin",
        refundedAt: new Date(),
        refundApprovedBy: "admin",
        netRefundAmount: finalNet,
        gstDeducted: finalGst,
      },
      { new: true },
    );

    // ✅ Mark booking as cancelled when refund approved
    await Booking.findByIdAndUpdate(payment.bookingId, {
      status: "cancelled",
      paymentStatus: "refunded",
    });

    if (payment.email) {
      await sendRefundApprovedEmail(payment.email, {
        passengerName: payment.passengerName,
        transactionId: payment.transactionId,
        amount: payment.amount,
        flightNumber: payment.flightNumber,
        from: payment.from,
        to: payment.to,
        netRefundAmount: finalNet,
        gstDeducted: finalGst,
      });
    }

    console.log(
      `✅ Refund approved: ${payment.transactionId} | Net: ₹${finalNet} (GST ₹${finalGst} deducted)`,
    );
    res.json({ success: true, payment: updatedPayment });
  } catch (err) {
    console.error("Refund approve error:", err);
    res.status(500).json({ error: "Refund approval failed" });
  }
});

// ══════════════════════════════════════════════════════════
// PATCH /api/payment/refund-reject/:id  (Admin reject)
// ══════════════════════════════════════════════════════════
router.patch("/refund-reject/:id", async (req, res) => {
  try {
    const { rejectReason } = req.body;
    if (!rejectReason?.trim())
      return res.status(400).json({ error: "Rejection reason is required" });

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (payment.status !== "refund_requested")
      return res
        .status(400)
        .json({ error: "Payment is not in refund_requested state" });

    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status: "success",
        refundRejectedReason: rejectReason.trim(),
        refundRejectedAt: new Date(),
        refundRejectedBy: "admin",
        refundReason: null,
        refundRequestedAt: null,
      },
      { new: true },
    );

    if (payment.email) {
      await sendRefundRejectedEmail(payment.email, {
        passengerName: payment.passengerName,
        transactionId: payment.transactionId,
        amount: payment.amount,
        flightNumber: payment.flightNumber,
        from: payment.from,
        to: payment.to,
        rejectReason: rejectReason.trim(),
      });
    }

    console.log(
      `❌ Refund rejected: ${payment.transactionId} | Reason: ${rejectReason}`,
    );
    res.json({ success: true, payment: updatedPayment });
  } catch (err) {
    console.error("Refund reject error:", err);
    res.status(500).json({ error: "Refund rejection failed" });
  }
});

// ══════════════════════════════════════════════════════════
// DELETE /api/payment/:id
// ══════════════════════════════════════════════════════════
router.delete("/:id", async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ══════════════════════════════════════════════════════════
// GET /api/payment/export/csv
// ══════════════════════════════════════════════════════════
router.get("/export/csv", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    if (!payments.length) return res.status(404).json({ error: "No data" });

    const rows = payments.map((p) => {
      const total = p.amount || 0;
      const base = total / (1 + GST_RATE);
      const gst = total - base;
      return {
        TransactionID: p.transactionId,
        BookingID: p.bookingId,
        PassengerName: p.passengerName,
        Email: p.email,
        BaseFare: base.toFixed(2),
        GST_18: gst.toFixed(2),
        TotalAmount: total.toFixed(2),
        NetRefundAmount: p.netRefundAmount || "",
        Method: p.paymentMethod,
        Status: p.status,
        RefundReason: p.refundReason || "",
        RefundRejectedReason: p.refundRejectedReason || "",
        Flight: p.flightNumber,
        Route: `${p.from} - ${p.to}`,
        TravelDate: p.date || "",
        Seats: p.seats?.join(", ") || "",
        CreatedOn: new Date(p.createdAt).toLocaleDateString("en-IN"),
      };
    });

    const csv = [
      Object.keys(rows[0]).join(","),
      ...rows.map((r) =>
        Object.values(r)
          .map((v) => `"${v}"`)
          .join(","),
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=payments.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: "Export failed" });
  }
});

module.exports = router;
