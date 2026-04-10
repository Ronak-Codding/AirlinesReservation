import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Ban,
  RefreshCw,
  ReceiptText,
  Armchair,
  BadgeCheck,
  CheckCircle,
  ArrowLeft,
  Plane,
  Clock,
} from "lucide-react";
import "./UserPages.css";

const CANCEL_REASONS = [
  "— Select a reason —",
  "Change of plans",
  "Medical emergency",
  "Flight time inconvenient",
  "Found a better fare",
  "Personal reasons",
  "Airline/Weather Cancellation",
];

// ── Time-based cancellation fee slabs ──
// hoursLeft = hours remaining until departure
function getCancelSlab(hoursLeft, reason) {
  // Special case: full refund
  if (
    reason === "Airline/Weather Cancellation" ||
    reason === "Medical emergency"
  ) {
    return { feeRate: 0, label: "Full Refund", tag: "special" };
  }
  if (hoursLeft === null) {
    // fallback if date not available
    return { feeRate: 0.21, label: "21% Fee", tag: "normal" };
  }
  if (hoursLeft < 0) {
    return { feeRate: 1.0, label: "No Refund (Departed)", tag: "no-refund" };
  }
  if (hoursLeft < 2) {
    return { feeRate: 1.0, label: "No Refund (< 2 hrs)", tag: "no-refund" };
  }
  if (hoursLeft < 24) {
    return { feeRate: 0.5, label: "50% Fee (2–24 hrs)", tag: "high" };
  }
  if (hoursLeft < 48) {
    return { feeRate: 0.21, label: "21% Fee (24–48 hrs)", tag: "normal" };
  }
  // 48hr+
  return { feeRate: 0.1, label: "10% Fee (48 hrs+)", tag: "low" };
}

function getHoursLeft(booking) {
  const raw =
    booking?.journeyDate || booking?.travelDate || booking?.date || null;
  if (!raw) return null;
  const departure = new Date(raw);
  if (isNaN(departure)) return null;
  const diff = (departure - Date.now()) / (1000 * 60 * 60);
  return diff;
}

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
const fmtCur = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// ── Slab badge colors ──
const slabTagColors = {
  low: { bg: "#d1fae5", color: "#065f46" },
  normal: { bg: "#fef3c7", color: "#92400e" },
  high: { bg: "#fee2e2", color: "#991b1b" },
  "no-refund": { bg: "#f3f4f6", color: "#6b7280" },
  special: { bg: "#ede9fe", color: "#5b21b6" },
};

const CancellationRefund = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cancelledBooking, setCancelledBooking] = useState(null);
  const [refundAmt, setRefundAmt] = useState(0);
  const [cancelFee, setCancelFee] = useState(0);
  const [currentSlab, setCurrentSlab] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!user.email) return;
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/booking/my-bookings/${encodeURIComponent(user.email)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setBookings(
            data.filter(
              (b) => b.status === "confirmed" || b.status === "Confirmed",
            ),
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const calcRefund = useCallback(
    (booking, overrideReason) => {
      const total =
        booking?.amount || booking?.totalAmount || booking?.price || 5546;
      const hoursLeft = getHoursLeft(booking);
      const usedReason = overrideReason !== undefined ? overrideReason : reason;
      const slab = getCancelSlab(hoursLeft, usedReason);
      const fee = Math.round(total * slab.feeRate);
      const refund = total - fee;
      return { refund: Math.max(0, refund), fee, total, slab, hoursLeft };
    },
    [reason],
  );

  const handleSelect = (b) => {
    setSelected(b);
    const { refund, fee, slab } = calcRefund(b, reason);
    setRefundAmt(refund);
    setCancelFee(fee);
    setCurrentSlab(slab);
  };

  // Recalc when reason changes
  useEffect(() => {
    if (!selected) return;
    const { refund, fee, slab } = calcRefund(selected, reason);
    setRefundAmt(refund);
    setCancelFee(fee);
    setCurrentSlab(slab);
  }, [reason, selected, calcRefund]);

  const handleConfirmCancel = async () => {
    setProcessing(true);
    try {
      const cancelRes = await fetch(
        `http://localhost:5000/api/booking/cancel/${selected._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        },
      );

      if (!cancelRes.ok) throw new Error("Booking cancel failed");

      try {
        const payRes = await fetch(
          `http://localhost:5000/api/payment?email=${encodeURIComponent(user.email)}&limit=50`,
          { headers: { "Content-Type": "application/json" } },
        );

        if (payRes.ok) {
          const payData = await payRes.json();
          const payment = payData.payments?.find(
            (p) =>
              p.bookingId?.toString() === selected._id?.toString() &&
              p.status === "success",
          );

          if (payment?._id) {
            const refundRes = await fetch(
              `http://localhost:5000/api/payment/refund-request/${payment._id}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  reason,
                  requestedBy: user.email,
                }),
              },
            );
            if (refundRes.ok) {
              console.log("✅ Refund request submitted:", payment.transactionId);
            }
          }
        }
      } catch (payErr) {
        console.warn("⚠️ Refund request failed (non-critical):", payErr.message);
      }

      setCancelledBooking(selected);
      setBookings((prev) => prev.filter((b) => b._id !== selected._id));
      setStep(3);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
      setShowModal(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelected(null);
    setReason("");
    setCancelledBooking(null);
    setCurrentSlab(null);
  };

  const progressPct = step === 1 ? 33 : step === 2 ? 67 : 100;
  const canProceed = selected && reason && reason !== CANCEL_REASONS[0];

  // ── Hours left label for selected booking ──
  const hoursLeftDisplay = selected ? (() => {
    const h = getHoursLeft(selected);
    if (h === null) return null;
    if (h < 0) return "Flight departed";
    if (h < 2) return `${Math.round(h * 60)} mins to departure`;
    if (h < 48) return `${Math.round(h)} hrs to departure`;
    const days = Math.floor(h / 24);
    const hrs = Math.round(h % 24);
    return `${days}d ${hrs}h to departure`;
  })() : null;

  return (
    <div className="crp-page">
      <div className="up-header">
        <div className="crp-page-title-row">
          <button className="crp-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="up-title">Cancellation &amp; Refund</h1>
            <p className="up-subtitle">
              Cancel confirmed bookings and track refund status
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="cr-overlay" onClick={() => setShowModal(false)}>
          <div className="cr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cr-modal-icon">⚠️</div>
            <h3 className="cr-modal-title">Confirm Cancellation</h3>
            <p className="cr-modal-desc">
              You are about to cancel{" "}
              <strong>
                {selected?.bookingId || selected?._id?.slice(-8).toUpperCase()}
              </strong>{" "}
              ({selected?.from || "—"} → {selected?.to || "—"}). This is{" "}
              <strong>irreversible</strong>.
            </p>
            {currentSlab && (
              <div
                style={{
                  margin: "0.75rem 0",
                  padding: "0.5rem 0.75rem",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  ...slabTagColors[currentSlab.tag],
                }}
              >
                Applied Rule: {currentSlab.label}
              </div>
            )}
            <div className="cr-refund-highlight">
              <p className="cr-rh-label">Estimated Refund</p>
              <p className="cr-rh-amt">{fmtCur(refundAmt)}</p>
              <p className="cr-rh-eta">
                Credited to original payment within 5–7 business days
              </p>
            </div>
            <div className="cr-modal-actions">
              <button
                className="cr-btn cr-btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Keep Booking
              </button>
              <button
                className="cr-btn cr-btn-danger"
                onClick={handleConfirmCancel}
                disabled={processing}
              >
                {processing ? (
                  <RefreshCw size={14} className="cr-spin" />
                ) : (
                  "Yes, Cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="crp-main-card">
        {/* Progress Bar */}
        <div className="crp-progress-wrap">
          <div className="crp-progress-labels">
            {["Select Booking", "Review Refund", "Cancellation Status"].map(
              (label, i) => (
                <span
                  key={i}
                  className={`crp-progress-label${step === i + 1 ? " crp-progress-label--active" : ""}${step > i + 1 ? " crp-progress-label--done" : ""}`}
                >
                  <span className="crp-progress-num">{i + 1}</span>
                  {label}
                </span>
              ),
            )}
          </div>
          <div className="crp-progress-track">
            <div
              className="crp-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="crp-step-body">
            <div className="crp-two-col">
              <div className="crp-col">
                <p className="cr-section-label">Select Booking to Cancel</p>
                {loading ? (
                  <div className="up-empty">
                    <div className="up-spinner" style={{ margin: "0 auto" }} />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="cr-empty">
                    <CheckCircle size={40} color="#10b981" />
                    <p>No confirmed bookings available to cancel.</p>
                    <Link to="/user/bookings" className="ud-cta-link">
                      View All Bookings →
                    </Link>
                  </div>
                ) : (
                  bookings.map((b) => {
                    const ref = b.bookingId || b._id?.slice(-8).toUpperCase();
                    const isSelected = selected?._id === b._id;
                    const total = b.amount || b.totalAmount || b.price || 5546;
                    const h = getHoursLeft(b);
                    const previewSlab = getCancelSlab(h, reason);
                    const previewFee = Math.round(total * previewSlab.feeRate);
                    const previewRefund = Math.max(0, total - previewFee);

                    return (
                      <div
                        key={b._id}
                        className={`cr-booking-card crp-booking-card${isSelected ? " cr-booking-card--selected" : ""}`}
                        onClick={() => handleSelect(b)}
                      >
                        <div className="cr-booking-card-left">
                          <p className="cr-booking-ref">
                            {ref}
                            <span className="cr-confirmed-chip">confirmed</span>
                          </p>
                          <p className="cr-booking-route">
                            <Plane size={11} style={{ display: "inline" }} />{" "}
                            {b.from || "—"} → {b.to || "—"} ·{" "}
                            {fmtDate(b.journeyDate || b.travelDate || b.date)}
                          </p>
                          {/* Hours left + slab preview */}
                          {h !== null && (
                            <p
                              style={{
                                fontSize: 11,
                                marginTop: 4,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                color: h < 2 ? "#ef4444" : h < 24 ? "#f59e0b" : "#6b7280",
                              }}
                            >
                              <Clock size={10} />
                              {h < 0
                                ? "Departed"
                                : h < 2
                                ? `${Math.round(h * 60)}m left`
                                : h < 48
                                ? `${Math.round(h)}h left`
                                : `${Math.floor(h / 24)}d ${Math.round(h % 24)}h left`}
                              <span
                                style={{
                                  padding: "1px 6px",
                                  borderRadius: 10,
                                  fontWeight: 700,
                                  fontSize: 10,
                                  ...slabTagColors[previewSlab.tag],
                                }}
                              >
                                {previewSlab.label}
                              </span>
                            </p>
                          )}
                        </div>
                        <div className="cr-booking-card-right">
                          <p className="cr-booking-price">{fmtCur(total)}</p>
                          {isSelected && (
                            <p style={{ fontSize: 10, color: "#10b981", fontWeight: 600 }}>
                              Refund: {fmtCur(previewRefund)}
                            </p>
                          )}
                          <div
                            className={`cr-radio${isSelected ? " cr-radio--checked" : ""}`}
                          >
                            {isSelected && "✓"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                <p className="cr-section-label" style={{ marginTop: "1.2rem" }}>
                  Cancellation Reason
                </p>
                <select
                  className="cr-select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={!selected}
                >
                  {CANCEL_REASONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>

                {reason === "Medical emergency" && (
                  <div className="cr-note">
                    ℹ️ Medical emergency — full refund may apply with valid documentation.
                  </div>
                )}
                {reason === "Airline/Weather Cancellation" && (
                  <div
                    className="cr-note"
                    style={{ background: "#ede9fe", borderColor: "#c4b5fd", color: "#5b21b6" }}
                  >
                    ✅ Airline/Weather cancellation qualifies for <strong>full refund</strong>.
                  </div>
                )}

                {/* Live refund preview after reason select */}
                {selected && reason && reason !== CANCEL_REASONS[0] && currentSlab && (
                  <div
                    style={{
                      marginTop: "0.75rem",
                      padding: "0.6rem 0.9rem",
                      borderRadius: 10,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      fontSize: 13,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#64748b" }}>
                      Applied:{" "}
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: 11,
                          ...slabTagColors[currentSlab.tag],
                        }}
                      >
                        {currentSlab.label}
                      </span>
                    </span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>
                      Refund: {fmtCur(refundAmt)}
                    </span>
                  </div>
                )}

                {hoursLeftDisplay && selected && (
                  <p
                    style={{
                      fontSize: 11,
                      marginTop: 6,
                      color: "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Clock size={10} /> {hoursLeftDisplay}
                  </p>
                )}

                <button
                  className="cr-action-btn"
                  disabled={!canProceed}
                  onClick={() => setStep(2)}
                >
                  <Ban size={15} /> Proceed to Cancel
                </button>
              </div>

              {/* ── RIGHT COLUMN: Before You Cancel + Rules Table ── */}
              <div className="crp-col crp-info-col">
                <div className="crp-info-card">
                  <p className="crp-info-title">💡 Before You Cancel</p>
                  <ul className="crp-info-list">
                    <li>Fee depends on <strong>time before departure</strong></li>
                    <li>
                      Refund within <strong>5–7 business days</strong>
                    </li>
                    <li>Your seat will be released to other passengers</li>
                    <li>
                      Cancellation confirmation sent to{" "}
                      <strong>{user.email}</strong>
                    </li>
                    <li>Medical / airline cancellations qualify for full refund</li>
                  </ul>

                  {/* ── Cancellation Fee Slab Table ── */}
                  <div
                    style={{
                      marginTop: "1rem",
                      borderTop: "1px solid #e2e8f0",
                      paddingTop: "0.85rem",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "#64748b",
                        marginBottom: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Clock size={11} /> Cancellation Fee Rules
                    </p>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: "#f1f5f9" }}>
                          <th style={{ padding: "5px 8px", textAlign: "left", borderRadius: "6px 0 0 6px", color: "#475569", fontWeight: 600 }}>
                            Time Before Departure
                          </th>
                          <th style={{ padding: "5px 8px", textAlign: "right", color: "#475569", fontWeight: 600 }}>
                            Fee
                          </th>
                          <th style={{ padding: "5px 8px", textAlign: "right", borderRadius: "0 6px 6px 0", color: "#475569", fontWeight: 600 }}>
                            Refund
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { range: "48 hrs or more", fee: "10%", refund: "90%", tag: "low" },
                          { range: "24 – 48 hrs", fee: "21%", refund: "79%", tag: "normal" },
                          { range: "2 – 24 hrs", fee: "50%", refund: "50%", tag: "high" },
                          { range: "Less than 2 hrs", fee: "100%", refund: "0%", tag: "no-refund" },
                          { range: "Medical / Airline / Weather", fee: "0%", refund: "100%", tag: "special" },
                        ].map((row, i) => (
                          <tr
                            key={i}
                            style={{
                              borderBottom: "1px solid #f1f5f9",
                              background:
                                currentSlab &&
                                slabTagColors[row.tag] === slabTagColors[currentSlab.tag]
                                  ? "#f0fdf4"
                                  : "transparent",
                            }}
                          >
                            <td style={{ padding: "5px 8px", color: "#334155" }}>
                              {row.range}
                            </td>
                            <td style={{ padding: "5px 8px", textAlign: "right" }}>
                              <span
                                style={{
                                  padding: "1px 7px",
                                  borderRadius: 8,
                                  fontWeight: 700,
                                  fontSize: 11,
                                  ...slabTagColors[row.tag],
                                }}
                              >
                                {row.fee}
                              </span>
                            </td>
                            <td style={{ padding: "5px 8px", textAlign: "right", color: "#10b981", fontWeight: 600 }}>
                              {row.refund}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="crp-policy-card">
                  <p className="crp-info-title">📋 Refund Policy</p>
                  <div className="crp-policy-row">
                    <span>Base Fare</span>
                    <span>Refundable</span>
                  </div>
                  <div className="crp-policy-row">
                    <span>Taxes &amp; Fees</span>
                    <span>Refundable</span>
                  </div>
                  <div className="crp-policy-row crp-policy-row--red">
                    <span>Cancellation Fee</span>
                    <span>
                      {currentSlab
                        ? currentSlab.feeRate === 0
                          ? "None (Special)"
                          : currentSlab.feeRate === 1
                          ? "100% — No Refund"
                          : `${Math.round(currentSlab.feeRate * 100)}% deducted`
                        : "Time-based (see table)"}
                    </span>
                  </div>
                  <div className="crp-policy-row crp-policy-row--green">
                    <span>Estimated Refund</span>
                    <span>
                      {selected ? fmtCur(refundAmt) : "Select booking"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && selected && (
          <div className="crp-step-body">
            <div className="crp-two-col">
              <div className="crp-col">
                <p className="cr-section-label">
                  <ReceiptText size={13} /> Refund Calculation
                </p>

                {/* Applied slab banner */}
                {currentSlab && (
                  <div
                    style={{
                      marginBottom: "0.75rem",
                      padding: "0.5rem 0.85rem",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      ...slabTagColors[currentSlab.tag],
                    }}
                  >
                    <Clock size={12} />
                    Rule Applied: {currentSlab.label}
                    {hoursLeftDisplay && (
                      <span style={{ marginLeft: "auto", fontWeight: 400, opacity: 0.8 }}>
                        {hoursLeftDisplay}
                      </span>
                    )}
                  </div>
                )}

                <div className="cr-refund-table">
                  {(() => {
                    const total =
                      selected.amount ||
                      selected.totalAmount ||
                      selected.price ||
                      5546;
                    const baseFare = Math.round(total * 0.87);
                    const taxes = total - baseFare;
                    return (
                      <>
                        <div className="cr-refund-row">
                          <span className="cr-rl">🎫 Base Fare</span>
                          <span className="cr-rv">{fmtCur(baseFare)}</span>
                        </div>
                        <div className="cr-refund-row">
                          <span className="cr-rl">🧾 Taxes &amp; Fees</span>
                          <span className="cr-rv">{fmtCur(taxes)}</span>
                        </div>
                        <div className="cr-refund-row">
                          <span className="cr-rl">
                            ✂ Cancellation Fee ({currentSlab ? `${Math.round(currentSlab.feeRate * 100)}%` : "21%"})
                          </span>
                          <span className="cr-rv cr-rv--red">
                            − {fmtCur(cancelFee)}
                          </span>
                        </div>
                        <div className="cr-refund-divider" />
                        <div className="cr-refund-total">
                          <span className="cr-rt-label">Total Refund</span>
                          <span className="cr-rt-value">
                            {fmtCur(refundAmt)}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <p className="cr-section-label">
                  <Armchair size={13} /> Seat Availability Update
                </p>
                <div className="cr-seat-card" style={{ marginBottom: "1rem" }}>
                  <span style={{ fontSize: 24 }}>💺</span>
                  <div>
                    <p className="cr-seat-title">Seat will be released</p>
                    <p className="cr-seat-sub">
                      Made available to waitlisted passengers immediately
                    </p>
                  </div>
                  <span className="cr-seat-badge">+1 Open</span>
                </div>

                <div className="cr-btn-row">
                  <button
                    className="cr-btn cr-btn-ghost"
                    onClick={() => setStep(1)}
                  >
                    ← Back
                  </button>
                  <button
                    className="cr-action-btn cr-action-btn--flex"
                    onClick={() => setShowModal(true)}
                    disabled={currentSlab?.tag === "no-refund" && refundAmt === 0 ? false : false}
                  >
                    <Ban size={14} /> Confirm Cancellation
                  </button>
                </div>
              </div>

              <div className="crp-col">
                <p className="cr-section-label">Refund Timeline</p>
                <div className="crp-timeline-card">
                  {[
                    {
                      dot: "done",
                      title: "Cancellation Initiated",
                      desc: "Request submitted successfully",
                      time: "Now",
                    },
                    {
                      dot: "pending",
                      title: "Airline Processing",
                      desc: "Airline reviews and approves",
                      time: "1–2 days",
                    },
                    {
                      dot: "future",
                      title: "Refund Initiated",
                      desc: "Amount sent to payment gateway",
                      time: "3–4 days",
                    },
                    {
                      dot: "future",
                      title: "Amount Credited",
                      desc: "Appears in your bank / wallet",
                      time: "5–7 days",
                    },
                  ].map(({ dot, title, desc, time }, i) => (
                    <div key={i} className="crp-tl-row">
                      <div className="crp-tl-left">
                        <div className={`cr-tl-dot cr-tl-dot--${dot}`}>
                          {dot === "done" ? "✓" : dot === "pending" ? "⟳" : "○"}
                        </div>
                        {i < 3 && <div className="crp-tl-line" />}
                      </div>
                      <div className="crp-tl-content">
                        <div className="crp-tl-header">
                          <p className="cr-tl-title">{title}</p>
                          <span className="crp-tl-time">{time}</span>
                        </div>
                        <p className="cr-tl-desc">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="crp-refund-summary">
                  <p className="crp-rs-label">You will receive</p>
                  <p className="crp-rs-amt">{fmtCur(refundAmt)}</p>
                  <p className="crp-rs-sub">
                    Est. by{" "}
                    {new Date(Date.now() + 7 * 86400000).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="crp-step-body crp-success-body">
            <div className="crp-success-card">
              <div className="crp-success-icon-wrap">
                <span className="crp-success-icon">✅</span>
              </div>
              <h2 className="crp-success-title">Booking Cancelled</h2>
              <p className="crp-success-desc">
                Your booking{" "}
                <strong>
                  {cancelledBooking?.bookingId ||
                    cancelledBooking?._id?.slice(-8).toUpperCase()}
                </strong>{" "}
                ({cancelledBooking?.from} → {cancelledBooking?.to}) has been
                successfully cancelled.
              </p>
              <div className="crp-refund-big">
                <p className="crp-rb-label">Refund Initiated</p>
                <p className="crp-rb-amt">{fmtCur(refundAmt)}</p>
                <p className="crp-rb-eta">
                  Expected by{" "}
                  {new Date(Date.now() + 7 * 86400000).toLocaleDateString(
                    "en-IN",
                    { day: "numeric", month: "short", year: "numeric" },
                  )}
                </p>
              </div>

              <p className="cr-section-label" style={{ marginTop: "1.5rem" }}>
                <BadgeCheck size={13} /> Live Status
              </p>
              <div
                className="crp-timeline-card"
                style={{ marginBottom: "1.5rem" }}
              >
                {[
                  {
                    dot: "done",
                    title: "Cancelled Successfully",
                    desc: `${new Date().toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })} · ${new Date().toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} IST`,
                  },
                  {
                    dot: "pending",
                    title: "Refund Processing",
                    desc: "Admin reviewing refund request",
                  },
                  {
                    dot: "future",
                    title: "Amount Credited",
                    desc: `Estimated: ${new Date(
                      Date.now() + 7 * 86400000,
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}`,
                  },
                ].map(({ dot, title, desc }, i) => (
                  <div key={i} className="crp-tl-row">
                    <div className="crp-tl-left">
                      <div className={`cr-tl-dot cr-tl-dot--${dot}`}>
                        {dot === "done" ? "✓" : dot === "pending" ? "⟳" : "○"}
                      </div>
                      {i < 2 && <div className="crp-tl-line" />}
                    </div>
                    <div className="crp-tl-content">
                      <p className="cr-tl-title">{title}</p>
                      <p className="cr-tl-desc">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="crp-success-actions">
                <button className="cr-btn cr-btn-ghost" onClick={reset}>
                  Cancel Another Booking
                </button>
                <Link
                  to="/user/search"
                  className="cr-btn cr-btn-primary crp-search-btn"
                >
                  ✈ Search New Flights
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CancellationRefund;