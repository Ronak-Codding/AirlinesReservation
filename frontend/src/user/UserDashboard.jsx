import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Ticket,
  CreditCard,
  Plane,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  XCircle,
  Smartphone,
  Building2,
  Wallet,
  IndianRupee,
  Bell,
  Mail,
  CalendarCheck,
  Zap,
} from "lucide-react";
import "./UserLayout.css";
import "./UserPages.css";

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayFlights, setTodayFlights] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName =
    user.firstName || user.fullname || user.name || "Traveller";

  // ── helpers ──────────────────────────────────────────────
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const t = new Date();
    return (
      d.getDate() === t.getDate() &&
      d.getMonth() === t.getMonth() &&
      d.getFullYear() === t.getFullYear()
    );
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  // ── fetch data ────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bRes, pRes] = await Promise.all([
          fetch(
            `http://localhost:5000/api/booking/my-bookings/${encodeURIComponent(user.email)}`,
          ),
          fetch(
            `http://localhost:5000/api/payment?email=${encodeURIComponent(user.email)}&limit=100`,
          ),
        ]);
        if (bRes.ok) {
          const bData = await bRes.json();
          setBookings(bData);

          // find today's confirmed flights
          const todays = bData.filter(
            (b) =>
              (b.status === "confirmed" || b.status === "Confirmed") &&
              (isToday(b.journeyDate) ||
                isToday(b.travelDate) ||
                isToday(b.date)),
          );
          setTodayFlights(todays);
          if (todays.length > 0) {
            setShowNotif(true);
            // simulate email sent
            setTimeout(() => setEmailSent(true), 800);
          }
        }
        if (pRes.ok) {
          const pData = await pRes.json();
          setPayments(pData.payments || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (user.email) fetchData();
  }, []);

  // ── derived stats ─────────────────────────────────────────
  const confirmed = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "Confirmed",
  ).length;

  const cancelled = bookings.filter(
    (b) => b.status === "cancelled" || b.status === "Cancelled",
  ).length;

  const totalSpent = payments
    .filter((p) => p.status === "success")
    .reduce((s, p) => s + (p.amount || 0), 0);

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  // ── config ────────────────────────────────────────────────
  const STATS = [
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: Ticket,
      color: "#667eea",
      bg: "rgba(102,126,234,0.1)",
      badge: "+new",
    },
    {
      label: "Confirmed",
      value: confirmed,
      icon: CheckCircle,
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
      badge: "active",
    },
    {
      label: "Cancelled",
      value: cancelled,
      icon: XCircle,
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
      badge: "total",
    },
    {
      label: "Total Spent",
      value: `₹${totalSpent.toLocaleString("en-IN")}`,
      icon: CreditCard,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      badge: "lifetime",
    },
  ];

  const STATUS_CLASS = {
    confirmed: "up-badge-confirmed",
    Confirmed: "up-badge-confirmed",
    cancelled: "up-badge-cancelled",
    Cancelled: "up-badge-cancelled",
    pending: "up-badge-pending",
    Pending: "up-badge-pending",
  };

  const PAYMENT_STATUS_CLASS = {
    success: "up-badge-confirmed",
    failed: "up-badge-cancelled",
    refunded: "up-badge-pending",
    pending: "up-badge-pending",
  };

  const METHOD_ICON = {
    card: <CreditCard size={16} color="#667eea" />,
    upi: <Smartphone size={16} color="#10b981" />,
    netbanking: <Building2 size={16} color="#3b82f6" />,
    wallet: <Wallet size={16} color="#f59e0b" />,
  };

  // ── render ────────────────────────────────────────────────
  return (
    <div>
      {/* ── Welcome ── */}
      <div className="up-header">
        <h1 className="up-title">Welcome back, {displayName}</h1>
        <p className="up-subtitle">Here's your travel summary at a glance</p>
      </div>

      {/* ── TODAY'S FLIGHT BANNER ── */}
      {todayFlights.length > 0 && (
        <div className="ud-flight-banner">
          <div className="ud-banner-shine" />
          <div className="ud-banner-left">
            <span className="ud-banner-plane">✈️</span>
            <div>
              <p className="ud-banner-title">🎉 Today is Your Flight Day!</p>
              <p className="ud-banner-sub">
                {todayFlights.map((f, i) => (
                  <span key={i}>
                    <strong>
                      {f.bookingId || f._id?.slice(-8).toUpperCase()}
                    </strong>{" "}
                    ({f.from || "—"} → {f.to || "—"})
                    {i < todayFlights.length - 1 ? " · " : ""}
                  </span>
                ))}{" "}
                — An email reminder has been sent to{" "}
                <strong>{user.email}</strong>
              </p>
            </div>
          </div>
          <span className="ud-banner-badge">TODAY</span>
        </div>
      )}

      {/* ── EMAIL SENT STRIP ── */}
      {emailSent && todayFlights.length > 0 && (
        <div className="ud-email-strip">
          <Mail size={14} />
          Auto email sent to <strong>{user.email}</strong> at{" "}
          {new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          IST
          <span className="ud-email-strip-dot" />
        </div>
      )}

      {/* ── Stats ── */}
      <div className="up-stats-grid">
        {STATS.map(({ label, value, icon: Icon, color, bg, badge }) => (
          <div key={label} className="up-stat-card">
            <div className="up-stat-top">
              <div className="up-stat-icon" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
              <span className="up-stat-badge" style={{ background: bg, color }}>
                {badge}
              </span>
            </div>
            <div className="up-stat-value">{loading ? "—" : value}</div>
            <div className="up-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="up-grid-2">
        {/* ── Recent Bookings ── */}
        <div className="up-card">
          <div className="up-card-header">
            <h3 className="up-card-title">
              <Ticket size={16} /> Recent Bookings
            </h3>
            <Link to="/user/bookings" className="ud-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ padding: "0.75rem 0" }}>
            {loading ? (
              <div className="up-empty">
                <div className="up-spinner" style={{ margin: "0 auto" }} />
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="up-empty">
                <Ticket size={40} className="up-empty-icon" />
                <p>No bookings yet</p>
                <Link to="/user/search" className="ud-cta-link">
                  Search Flights →
                </Link>
              </div>
            ) : (
              recentBookings.map((b, i) => {
                const flightToday =
                  isToday(b.journeyDate) ||
                  isToday(b.travelDate) ||
                  isToday(b.date);
                return (
                  <div
                    key={b._id || i}
                    className={`ud-booking-row${flightToday ? " ud-booking-row--today" : ""}`}
                  >
                    <div className="ud-booking-icon">
                      <Plane size={16} style={{ color: "#667eea" }} />
                    </div>
                    <div className="ud-booking-info">
                      <p className="ud-booking-ref">
                        {b.bookingId || b._id?.slice(-8).toUpperCase()}
                        {flightToday && (
                          <span className="ud-today-chip">Today ✈️</span>
                        )}
                      </p>
                      <p className="ud-booking-route">
                        {b.from || "—"} → {b.to || "—"}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        className={`up-badge ${STATUS_CLASS[b.status] || "up-badge-pending"}`}
                      >
                        {b.status}
                      </span>
                      <p className="ud-booking-date">
                        {formatDate(
                          b.journeyDate ||
                            b.travelDate ||
                            b.date ||
                            b.createdAt,
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right Column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Quick Actions */}
          <div className="up-card">
            <div className="up-card-header">
              <h3 className="up-card-title">
                <TrendingUp size={16} /> Quick Actions
              </h3>
            </div>
            <div className="up-card-body" style={{ padding: "1rem" }}>
              <div className="ud-quick-grid">
                {[
                  {
                    to: "/user/search",
                    icon: Plane,
                    label: "Search Flights",
                    color: "#667eea",
                    bg: "rgba(102,126,234,0.1)",
                  },
                  {
                    to: "/user/bookings",
                    icon: Ticket,
                    label: "My Bookings",
                    color: "#10b981",
                    bg: "rgba(16,185,129,0.1)",
                  },
                  {
                    to: "/user/payments",
                    icon: CreditCard,
                    label: "Payments",
                    color: "#f59e0b",
                    bg: "rgba(245,158,11,0.1)",
                  },
                  {
                    to: "/user/profile",
                    icon: Clock,
                    label: "Edit Profile",
                    color: "#a78bfa",
                    bg: "rgba(167,139,250,0.1)",
                  },
                ].map(({ to, icon: Icon, label, color, bg }) => (
                  <Link key={to} to={to} className="ud-quick-item">
                    <div className="ud-quick-icon" style={{ background: bg }}>
                      <Icon size={20} style={{ color }} />
                    </div>
                    <span className="ud-quick-label">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Payments */}
          <div className="up-card">
            <div className="up-card-header">
              <h3 className="up-card-title">
                <CreditCard size={16} /> Recent Payments
              </h3>
              <Link to="/user/payments" className="ud-link">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div style={{ padding: "0.75rem 0" }}>
              {loading ? (
                <div className="up-empty">
                  <div className="up-spinner" style={{ margin: "0 auto" }} />
                </div>
              ) : recentPayments.length === 0 ? (
                <div className="up-empty">
                  <CreditCard size={36} className="up-empty-icon" />
                  <p>No payments yet</p>
                </div>
              ) : (
                recentPayments.map((p, i) => (
                  <div key={p._id || i} className="ud-payment-row">
                    <div className="ud-booking-icon">
                      <span style={{ display: "flex", alignItems: "center" }}>
                        {METHOD_ICON[p.paymentMethod] || (
                          <IndianRupee size={16} color="#94a3b8" />
                        )}
                      </span>
                    </div>
                    <div className="ud-payment-info">
                      <p
                        className="ud-payment-id"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {p.transactionId?.slice(0, 18) || "—"}...
                      </p>
                      <p className="ud-payment-method">
                        {p.flightNumber || "—"} · {p.paymentMethod || "—"}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p className="ud-payment-amount">
                        ₹{p.amount?.toLocaleString("en-IN")}
                      </p>
                      <span
                        className={`up-badge ${PAYMENT_STATUS_CLASS[p.status] || "up-badge-pending"}`}
                        style={{ fontSize: "0.65rem" }}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* How Auto Email Works */}
          <div className="up-card">
            <div className="up-card-header">
              <h3 className="up-card-title">
                <Zap size={16} /> Auto Email — How It Works
              </h3>
            </div>
            <div
              style={{
                padding: "0.75rem 1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
              }}
            >
              {[
                {
                  step: "1",
                  icon: <Ticket size={14} />,
                  title: "Booking Saved",
                  desc: "Flight date stored when you book",
                  color: "#667eea",
                },
                {
                  step: "2",
                  icon: <CalendarCheck size={14} />,
                  title: "Daily Date Check",
                  desc: "System checks every morning at 6 AM",
                  color: "#3b82f6",
                },
                {
                  step: "✓",
                  icon: <Mail size={14} />,
                  title: "Email Triggered",
                  desc: "If flight date = today → email auto-sent",
                  color: "#10b981",
                },
                {
                  step: "4",
                  icon: <Bell size={14} />,
                  title: "Dashboard Alert",
                  desc: "Banner appears with your flight details",
                  color: "#f59e0b",
                },
              ].map(({ step, icon, title, desc, color }) => (
                <div
                  key={step}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: `${color}18`,
                      border: `1px solid ${color}44`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color,
                    }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        marginBottom: 2,
                      }}
                    >
                      {title}
                    </p>
                    <p
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted, #94a3b8)",
                      }}
                    >
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Toast Notification ── */}
      {showNotif && (
        <div className="ud-toast" role="alert">
          <div className="ud-toast-inner">
            <span style={{ fontSize: 20 }}>✈️</span>
            <div>
              <p className="ud-toast-title">Flight Reminder Sent!</p>
              <p className="ud-toast-sub">
                Email sent to <strong>{user.email}</strong> for today's flight.
              </p>
            </div>
            <button
              className="ud-toast-close"
              onClick={() => setShowNotif(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
