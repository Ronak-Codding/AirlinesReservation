// utils/emailService.js
const nodemailer = require("nodemailer");

const GST_RATE = 0.18;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Helper ────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

// ══════════════════════════════════════════════════════════
// ✅ 1. Payment Success Email  (PayU / Save route)
//    Light theme — booking confirmed + GST breakdown
// ══════════════════════════════════════════════════════════
const sendFlightPaymentEmail = async (toEmail, data) => {
  const {
    passengerName,
    transactionId,
    flightNumber,
    from,
    to,
    date,
    seats,
    amount,
    paymentMethod,
  } = data;

  const totalAmount = parseFloat(amount) || 0;
  const baseAmount = totalAmount / (1 + GST_RATE);
  const gstAmount = totalAmount - baseAmount;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  const seatsDisplay = Array.isArray(seats)
    ? seats.filter(Boolean).join(", ") || "—"
    : seats || "—";

  try {
    await transporter.sendMail({
      from: `"SkyJet Payments" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `✅ Booking Confirmed – ${flightNumber || "Your Flight"} | Txn: ${transactionId || ""}`,
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">

        <tr><td style="background:linear-gradient(135deg,#0ea5e9,#2563eb);padding:36px 40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;">✅ Booking Confirmed!</h1>
          <p style="color:#bae6fd;margin:10px 0 4px;font-size:15px;font-weight:600;">Your payment has been received successfully.</p>
          <p style="color:#e0f2fe;margin:0;font-size:13px;">Dear <strong style="color:#fff;">${passengerName || "Passenger"}</strong>, your flight ticket is now confirmed. 🎉</p>
        </td></tr>

        <tr><td style="background:#f0f9ff;padding:14px 40px;border-bottom:1px solid #e0f2fe;">
          <p style="margin:0;font-size:12px;color:#0369a1;font-weight:700;text-transform:uppercase;">Transaction ID</p>
          <p style="margin:4px 0 0;font-family:monospace;font-size:14px;color:#2563eb;font-weight:700;">${transactionId || "—"}</p>
        </td></tr>

        <tr><td style="padding:32px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1px solid #e0f2fe;border-radius:12px;margin-bottom:20px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;text-transform:uppercase;color:#0369a1;letter-spacing:0.5px;">✈️ Flight Details</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                <tr>
                  <td style="width:50%;padding-bottom:14px;vertical-align:top;">
                    <p style="margin:0;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">From</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#111827;">${from || "—"}</p>
                  </td>
                  <td style="text-align:center;padding-bottom:14px;vertical-align:middle;"><span style="font-size:22px;">→</span></td>
                  <td style="width:50%;padding-bottom:14px;vertical-align:top;text-align:right;">
                    <p style="margin:0;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">To</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#111827;">${to || "—"}</p>
                  </td>
                </tr>
                <tr><td colspan="3"><hr style="border:none;border-top:1px solid #bae6fd;margin:4px 0 14px;"/></td></tr>
                <tr>
                  <td style="padding-bottom:10px;vertical-align:top;">
                    <p style="margin:0;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">Flight No.</p>
                    <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#2563eb;">${flightNumber || "—"}</p>
                  </td>
                  <td></td>
                  <td style="padding-bottom:10px;vertical-align:top;text-align:right;">
                    <p style="margin:0;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">Date</p>
                    <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#111827;">${date || "—"}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:4px;vertical-align:top;">
                    <p style="margin:0;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">Seat(s)</p>
                    <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#111827;">${seatsDisplay}</p>
                  </td>
                  <td></td>
                  <td style="padding-bottom:4px;vertical-align:top;text-align:right;">
                    <p style="margin:0;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">Payment Method</p>
                    <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#111827;">${paymentMethod || "—"}</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1px solid #e0f2fe;border-radius:12px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;color:#0369a1;letter-spacing:0.5px;">💳 Payment Summary</p>
              <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;">
                <tr><td style="color:#374151;">Base Fare</td><td style="text-align:right;">${fmt(baseAmount)}</td></tr>
                <tr><td style="color:#374151;">CGST (9%)</td><td style="text-align:right;">${fmt(cgst)}</td></tr>
                <tr><td style="color:#374151;">SGST (9%)</td><td style="text-align:right;">${fmt(sgst)}</td></tr>
                <tr><td colspan="2"><hr style="border:none;border-top:2px solid #bae6fd;margin:6px 0;"/></td></tr>
                <tr>
                  <td style="font-weight:700;color:#111827;font-size:15px;">Total Paid (incl. GST)</td>
                  <td style="text-align:right;font-weight:700;color:#2563eb;font-size:18px;">${fmt(totalAmount)}</td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:24px 40px;text-align:center;">
          <p style="margin:0;font-size:13px;font-weight:600;color:#374151;">Thank you for choosing us! ✈️</p>
          <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} SkyJet Airlines. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`,
    });
    console.log(`✅ Payment email sent → ${toEmail}`);
  } catch (err) {
    console.error("❌ Payment email failed:", err.message);
  }
};

// ══════════════════════════════════════════════════════════
// ✅ 2. Flight Day / Tomorrow Reminder Email
//    Dark theme — today or tomorrow reminder
// ══════════════════════════════════════════════════════════
const sendFlightDayEmail = async (
  toEmail,
  name,
  booking,
  isTomorrow = false,
) => {
  const subject = isTomorrow
    ? `⏰ Your Flight is Tomorrow! — ${booking.from} → ${booking.to}`
    : `🛫 Today is Your Flight Day! — ${booking.from} → ${booking.to}`;

  const badgeText = isTomorrow ? "TOMORROW" : "FLIGHT DAY";
  const badgeColor = isTomorrow ? "#f59e0b" : "rgba(255,255,255,0.2)";
  const dayMsg = isTomorrow
    ? `Your flight is <strong style="color:#10b981;">TOMORROW</strong>! Please prepare and complete web check-in today.`
    : `Your flight is <strong style="color:#f59e0b;">TODAY</strong>! Please check in early and keep your booking details handy.`;

  try {
    await transporter.sendMail({
      from: `"SkyJet Airlines ✈️" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      html: `<!DOCTYPE html><html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:32px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#1e2235;border-radius:18px;overflow:hidden;border:1px solid rgba(108,99,255,0.2);">
        <tr>
          <td style="background:linear-gradient(135deg,#6c63ff,#a78bfa);padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td><span style="font-size:28px;">✈️</span><span style="color:#fff;font-size:20px;font-weight:700;margin-left:10px;vertical-align:middle;">SkyJet Airlines</span></td>
              <td align="right"><span style="background:${badgeColor};color:#fff;font-size:11px;font-weight:700;padding:5px 14px;border-radius:20px;letter-spacing:1px;">${badgeText}</span></td>
            </tr></table>
          </td>
        </tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,#f59e0b,#6c63ff,#10b981);"></td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="color:#e8eaf6;font-size:16px;margin:0 0 6px;">Dear <strong>${name}</strong>,</p>
          <p style="color:#7c82a3;font-size:13px;margin:0 0 24px;line-height:1.6;">${dayMsg}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#252a3d;border-radius:14px;border:1px solid rgba(108,99,255,0.2);margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td>
                  <span style="color:#e8eaf6;font-size:22px;font-weight:700;letter-spacing:2px;">${booking.from}</span>
                  <span style="color:#6c63ff;font-size:16px;margin:0 12px;">→</span>
                  <span style="color:#e8eaf6;font-size:22px;font-weight:700;letter-spacing:2px;">${booking.to}</span>
                  <p style="color:#7c82a3;font-size:12px;margin:6px 0 0;">Flight · ${new Date(booking.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                </td>
                <td align="right"><span style="background:rgba(108,99,255,0.15);border:1px solid rgba(108,99,255,0.3);color:#a78bfa;font-size:13px;font-weight:600;padding:6px 14px;border-radius:8px;">${booking.flightNumber}</span></td>
              </tr></table>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="color:#7c82a3;font-size:13px;padding:6px 0;">🕐 &nbsp;Arrive at the airport at least <strong style="color:#e8eaf6;">2 hours</strong> before departure</td></tr>
            <tr><td style="color:#7c82a3;font-size:13px;padding:6px 0;">🪪 &nbsp;Carry a valid <strong style="color:#e8eaf6;">government-issued photo ID</strong></td></tr>
            <tr><td style="color:#7c82a3;font-size:13px;padding:6px 0;">🧳 &nbsp;Baggage: <strong style="color:#e8eaf6;">15 kg</strong> check-in + <strong style="color:#e8eaf6;">7 kg</strong> cabin</td></tr>
            <tr><td style="color:#7c82a3;font-size:13px;padding:6px 0;">📲 &nbsp;Web check-in is open — <strong style="color:#e8eaf6;">save time at the airport</strong></td></tr>
          </table>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:8px;"><tr>
            <td style="padding-right:10px;"><a href="#" style="background:#6c63ff;color:#fff;text-decoration:none;font-size:13px;font-weight:600;padding:11px 22px;border-radius:10px;display:inline-block;">Web Check-In</a></td>
            <td><a href="#" style="background:transparent;color:#7c82a3;text-decoration:none;font-size:13px;font-weight:600;padding:10px 22px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);display:inline-block;">View Booking</a></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;color:#3d4466;font-size:11px;">
          &copy; ${new Date().getFullYear()} SkyJet Airlines &nbsp;·&nbsp; This is an automated reminder &nbsp;·&nbsp; Please do not reply
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
    });
    console.log(
      `✅ Flight ${isTomorrow ? "tomorrow" : "today"} email sent → ${toEmail}`,
    );
  } catch (err) {
    console.error("❌ Flight reminder email failed:", err.message);
  }
};

// ══════════════════════════════════════════════════════════
// ✅ 3. Refund Approved Email
// ══════════════════════════════════════════════════════════
const sendRefundApprovedEmail = async (toEmail, data) => {
  const {
    passengerName,
    transactionId,
    amount,
    flightNumber,
    from,
    to,
    netRefundAmount,
    gstDeducted,
  } = data;

  const base = amount / (1 + GST_RATE);
  const gst = amount - base;
  const displayNet = netRefundAmount || Math.round(base);
  const displayGst = gstDeducted || Math.round(gst);

  try {
    await transporter.sendMail({
      from: `"SkyJet Payments" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `💰 Refund Approved – ${fmt(displayNet)} | Txn: ${transactionId}`,
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:30px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:560px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#10b981,#059669);padding:32px 36px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">💰</div>
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">Refund Approved!</h1>
          <p style="color:#d1fae5;margin:8px 0 0;font-size:14px;">Your refund request has been approved by our team.</p>
        </td></tr>
        <tr><td style="padding:28px 36px;">
          <p style="font-size:15px;color:#374151;">Dear <strong>${passengerName || "Passenger"}</strong>,</p>
          <p style="font-size:14px;color:#6b7280;line-height:1.6;">
            Your refund for booking <strong>${flightNumber || ""}</strong> (${from || "—"} → ${to || "—"}) has been <strong style="color:#10b981;">approved</strong>.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;margin:16px 0;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;color:#6b7280;">Refund Breakdown</p>
              <table width="100%" cellpadding="5" cellspacing="0" style="font-size:13px;">
                <tr><td style="color:#374151;">Total Paid (GST incl.)</td><td style="text-align:right;color:#374151;">${fmt(amount)}</td></tr>
                <tr><td style="color:#ef4444;">GST Deducted (18%)</td><td style="text-align:right;color:#ef4444;">− ${fmt(displayGst)}</td></tr>
                <tr><td colspan="2"><hr style="border:none;border-top:1.5px solid #d1fae5;margin:6px 0;"/></td></tr>
                <tr>
                  <td style="font-weight:700;color:#065f46;font-size:14px;">Net Refund to You</td>
                  <td style="text-align:right;font-weight:800;color:#10b981;font-size:18px;">${fmt(displayNet)}</td>
                </tr>
              </table>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;margin-bottom:12px;">
            <tr><td style="padding:12px 16px;font-size:12px;color:#92400e;">
              ℹ️ GST (18%) is a government tax and is non-refundable as per policy.
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;">
            <tr><td style="padding:14px 18px;font-size:13px;color:#92400e;">
              ⏱️ <strong>${fmt(displayNet)}</strong> will be credited to your original payment method within <strong>5–7 business days</strong>.
              <br/><small style="color:#a78636;">Transaction ID: ${transactionId}</small>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:20px 36px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} SkyJet Airlines. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
    });
    console.log(`✅ Refund approved email sent → ${toEmail}`);
  } catch (err) {
    console.error("❌ Refund approved email failed:", err.message);
  }
};

// ══════════════════════════════════════════════════════════
// ✅ 4. Refund Rejected Email
// ══════════════════════════════════════════════════════════
const sendRefundRejectedEmail = async (toEmail, data) => {
  const {
    passengerName,
    transactionId,
    amount,
    flightNumber,
    from,
    to,
    rejectReason,
  } = data;

  try {
    await transporter.sendMail({
      from: `"SkyJet Payments" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `❌ Refund Request Rejected | Txn: ${transactionId}`,
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:30px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:560px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:32px 36px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">❌</div>
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">Refund Request Rejected</h1>
          <p style="color:#fecaca;margin:8px 0 0;font-size:14px;">Unfortunately, your refund request could not be approved.</p>
        </td></tr>
        <tr><td style="background:#fff5f5;padding:14px 36px;border-bottom:1px solid #fecaca;">
          <p style="margin:0;font-size:12px;color:#b91c1c;font-weight:700;text-transform:uppercase;">Transaction ID</p>
          <p style="margin:4px 0 0;font-family:monospace;font-size:14px;color:#ef4444;font-weight:700;">${transactionId || "—"}</p>
        </td></tr>
        <tr><td style="padding:28px 36px;">
          <p style="font-size:15px;color:#374151;">Dear <strong>${passengerName || "Passenger"}</strong>,</p>
          <p style="font-size:14px;color:#6b7280;line-height:1.6;">
            Your refund request for <strong>${flightNumber || ""}</strong> (${from || "—"} → ${to || "—"}) worth <strong>${fmt(amount)}</strong> has been <strong style="color:#ef4444;">rejected</strong>.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1.5px solid #fca5a5;border-radius:12px;margin:20px 0;">
            <tr><td style="padding:18px 22px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;color:#b91c1c;">Rejection Reason</p>
              <p style="margin:0;font-size:14px;color:#374151;font-style:italic;">"${rejectReason || "Does not meet refund policy criteria."}"</p>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #dbeafe;border-radius:10px;">
            <tr><td style="padding:14px 18px;font-size:13px;color:#1e40af;">
              📩 If you believe this is an error, please contact our support team and we will be happy to help you.
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:20px 36px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} SkyJet Airlines. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
    });
    console.log(`✅ Refund rejected email sent → ${toEmail}`);
  } catch (err) {
    console.error("❌ Refund rejected email failed:", err.message);
  }
};

module.exports = {
  sendFlightPaymentEmail,
  sendFlightDayEmail,
  sendRefundApprovedEmail,
  sendRefundRejectedEmail,
};
