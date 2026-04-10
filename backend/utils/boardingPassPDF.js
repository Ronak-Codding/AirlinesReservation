const PDFDocument = require("pdfkit");

const generateBoardingPass = (passenger, booking) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = 595.28,
      H = 841.89;
    const ML = 48; // margin left
    const MR = 48; // margin right
    const CW = W - ML - MR; // content width = 499.28

    // ── tiny helpers ─────────────────────────────────────────
    const lbl = (txt, x, y, opts = {}) =>
      doc
        .fillColor("#9090bb")
        .font("Helvetica")
        .fontSize(7)
        .text(txt, x, y, { lineBreak: false, characterSpacing: 1.2, ...opts });

    const val = (txt, x, y, size = 13, opts = {}) =>
      doc
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .fontSize(size)
        .text(txt, x, y, { lineBreak: false, ...opts });

    const sub = (txt, x, y, opts = {}) =>
      doc
        .fillColor("#aaaacc")
        .font("Helvetica")
        .fontSize(9)
        .text(txt, x, y, { lineBreak: false, ...opts });

    const detailBox = (labelTxt, valueTxt, x, y) => {
      lbl(labelTxt, x, y);
      val(valueTxt, x, y + 13);
    };

    // ── background ───────────────────────────────────────────
    doc.rect(0, 0, W, H).fill("#0f1117");

    // ── header ───────────────────────────────────────────────
    const HDR_H = 260;
    doc.rect(0, 0, W, HDR_H).fill("#6c63ff");

    // accent bar (bottom of header)
    doc.rect(0, HDR_H - 5, W / 3, 5).fill("#f59e0b");
    doc.rect(W / 3, HDR_H - 5, W / 3, 5).fill("#6c63ff");
    doc.rect((2 * W) / 3, HDR_H - 5, W / 3, 5).fill("#10b981");

    // airline name
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("SkyJet Airlines", ML, 44);
    doc
      .fillColor("rgba(200,200,255,0.8)")
      .font("Helvetica")
      .fontSize(8)
      .text("BOARDING PASS", ML, 68, { characterSpacing: 2 });

    // ── passenger name (left) | flight (right) ───────────────
    // Two columns: left half for name, right ~120px for flight
    const PAX_Y = 110;
    const COL_RIGHT_X = W - MR - 120; // right column starts here

    lbl("PASSENGER NAME", ML, PAX_Y);
    val(passenger.fullName.toUpperCase(), ML, PAX_Y + 13, 14, {
      width: COL_RIGHT_X - ML - 16,
    });

    lbl("FLIGHT", COL_RIGHT_X, PAX_Y);
    val(booking.flightNumber, COL_RIGHT_X, PAX_Y + 13, 14, { width: 120 });

    // ── route: FROM | arrow | TO ──────────────────────────────
    const ROUTE_Y = 170;
    const CODE_W = 130; // width reserved for each airport code
    const FROM_X = ML;
    const TO_X = W - MR - CODE_W; // right-aligned block

    // FROM
    lbl("FROM", FROM_X, ROUTE_Y);
    val(booking.from, FROM_X, ROUTE_Y + 11, 38, { width: CODE_W });
    sub(booking.fromCity || "Mumbai", FROM_X, ROUTE_Y + 54);

    // Arrow — center between FROM and TO blocks
    const ARROW_CENTER_X = FROM_X + CODE_W;
    const arrowX = FROM_X + CODE_W + 8;
    const arrowW = TO_X - arrowX - 8;
    doc
      .fillColor("rgba(255,255,255,0.35)")
      .font("Helvetica")
      .fontSize(11)
      .text("— — ✈ — —", arrowX, ROUTE_Y + 26, {
        width: arrowW,
        align: "center",
        lineBreak: false,
      });

    // TO
    lbl("TO", TO_X, ROUTE_Y, { width: CODE_W, align: "left" });
    val(booking.to, TO_X, ROUTE_Y + 11, 38, { width: CODE_W, align: "left" });
    sub(booking.toCity || "New Delhi", TO_X, ROUTE_Y + 54, {
      width: CODE_W,
      align: "left",
    });

    // ── tear divider ─────────────────────────────────────────
    const TEAR_Y = HDR_H + 24;
    doc.circle(0, TEAR_Y, 22).fill("#0a0c14");
    doc.circle(W, TEAR_Y, 22).fill("#0a0c14");
    doc
      .moveTo(ML - 8, TEAR_Y)
      .lineTo(W - MR + 8, TEAR_Y)
      .dash(5, { space: 4 })
      .strokeColor("#2a2f45")
      .lineWidth(1)
      .stroke();
    doc.undash();

    // ── details grid ─────────────────────────────────────────
    const GRID_Y = TEAR_Y + 24;
    const COL = CW / 4;

    const dateStr = new Date(booking.date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Row 1
    detailBox("DATE", dateStr, ML, GRID_Y);
    detailBox("SEAT", passenger.seatNumber || "13F", ML + COL, GRID_Y);
    detailBox("GATE", booking.gate || "B12", ML + COL * 2, GRID_Y);
    detailBox("TERMINAL", booking.terminal || "T2", ML + COL * 3, GRID_Y);

    // Row 2
    const ROW2_Y = GRID_Y + 46;
    detailBox("BOARDING TIME", booking.boardingTime || "06:30 AM", ML, ROW2_Y);
    detailBox(
      "DEPARTURE",
      booking.departureTime || "07:00 AM",
      ML + COL,
      ROW2_Y,
    );
    detailBox(
      "BOOKING REF",
      booking.bookingId || "SKYJET",
      ML + COL * 2,
      ROW2_Y,
    );
    detailBox("CLASS", booking.class || "ECONOMY", ML + COL * 3, ROW2_Y);

    // ── baggage box ──────────────────────────────────────────
    const BAG_Y = ROW2_Y + 46;
    doc.roundedRect(ML, BAG_Y, CW, 52, 8).fill("#1e2235");
    doc
      .fillColor("#f59e0b")
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("BAGGAGE ALLOWANCE", ML + 20, BAG_Y + 14);
    doc
      .fillColor("#9090bb")
      .font("Helvetica")
      .fontSize(8)
      .text(
        `Check-in: ${booking.checkinBag || "15 kg"}    |    Cabin: ${booking.cabinBag || "7 kg"}    |    Excess baggage charges apply beyond limits`,
        ML + 20,
        BAG_Y + 28,
        { width: CW - 40 },
      );

    // ── reminders box ────────────────────────────────────────
    const tips = booking.reminders || [
      "Arrive at airport at least 2 hours before departure",
      "Carry a valid government-issued photo ID (Aadhar / Passport)",
      "Web check-in closes 1 hour before departure — save time!",
    ];
    const REM_Y = BAG_Y + 64;
    const REM_H = 30 + tips.length * 16;
    doc.roundedRect(ML, REM_Y, CW, REM_H, 8).fill("#1e2235");
    doc
      .fillColor("#10b981")
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("IMPORTANT REMINDERS", ML + 20, REM_Y + 14);
    tips.forEach((tip, i) => {
      doc
        .fillColor("#9090bb")
        .font("Helvetica")
        .fontSize(8)
        .text(`• ${tip}`, ML + 20, REM_Y + 28 + i * 16, { width: CW - 40 });
    });

    // ── footer ───────────────────────────────────────────────
    doc.rect(0, H - 36, W, 36).fill("#1a1f30");
    doc
      .fillColor("#555577")
      .font("Helvetica")
      .fontSize(7)
      .text(
        "© 2026 SkyJet Airlines  ·  This is your official boarding pass — please keep it safe",
        0,
        H - 20,
        { align: "center", width: W },
      );

    doc.end();
  });
};

module.exports = { generateBoardingPass };
