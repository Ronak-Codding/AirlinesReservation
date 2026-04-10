import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ticket,
  Search,
  Eye,
  XCircle,
  Plane,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
} from "lucide-react";
import "./UserLayout.css";
import "./UserPages.css";

const UserBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewBooking, setViewBooking] = useState(null);

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const perPage = 8;
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000,
    );
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/booking/my-bookings/${user.email}`,
      );
      if (res.ok) setBookings(await res.json());
    } catch {
      showNotification("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.email) fetchBookings();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // ── Download Boarding Pass ──
  const downloadBoardingPass = async (booking) => {
    try {
      const pasRes = await fetch(
        `http://localhost:5000/api/passenger/onepassenger/${booking._id}`,
      );
      if (!pasRes.ok) throw new Error("Passengers not found");
      const passengers = await pasRes.json();

      if (!passengers?.length) {
        showNotification("No passenger found for this booking", "error");
        return;
      }

      for (const passenger of passengers) {
        const res = await fetch(
          `http://localhost:5000/api/booking/${booking._id}/boarding-pass/${passenger._id}`,
        );
        if (!res.ok) throw new Error("PDF generation failed");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `boarding-pass-${booking.flightNumber}-${passenger.fullName || "passenger"}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }

      showNotification("✅ Boarding pass downloaded!");
    } catch {
      showNotification("Failed to download boarding pass", "error");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchSearch =
      !search ||
      (b.bookingId || b._id)?.toLowerCase().includes(search.toLowerCase()) ||
      b.flightNumber?.toLowerCase().includes(search.toLowerCase()) ||
      b.from?.toLowerCase().includes(search.toLowerCase()) ||
      b.to?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All" ||
      b.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredBookings.length / perPage);
  const current = filteredBookings.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  // ── Cancel Booking ──
  // const handleCancel = async (bookingId) => {
  //   if (!window.confirm("Cancel this booking?")) return;
  //   try {
  //     const res = await fetch(
  //       `http://localhost:5000/api/booking/cancel/${bookingId}`,
  //       { method: "PUT" },
  //     );
  //     if (res.ok) {
  //       showNotification("Booking cancelled successfully");
  //       fetchBookings();
  //     } else showNotification("Failed to cancel", "error");
  //   } catch {
  //     showNotification("Failed to cancel", "error");
  //   }
  // };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  const STATUS_CLASS = {
    confirmed: "up-badge-confirmed",
    Confirmed: "up-badge-confirmed",
    cancelled: "up-badge-cancelled",
    Cancelled: "up-badge-cancelled",
    pending: "up-badge-pending",
    Pending: "up-badge-pending",
  };

  return (
    <div>
      {/* Notification */}
      {notification.show && (
        <div
          className={`up-notification ${
            notification.type === "error"
              ? "up-notification-error"
              : "up-notification-success"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* ── View Booking Modal ── */}
      {viewBooking && (
        <div className="pax-modal-overlay" onClick={() => setViewBooking(null)}>
          <div
            className="pax-modal pax-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pax-modal-header">
              <div>
                <h2 className="pax-modal-title">Booking Details</h2>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    margin: 0,
                  }}
                >
                  {viewBooking.bookingId ||
                    viewBooking._id?.slice(-8).toUpperCase()}
                </p>
              </div>
              <button
                className="pax-modal-close"
                onClick={() => setViewBooking(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="pax-modal-body">
              <div className="ub-detail-grid">
                {[
                  [
                    "Booking ID",
                    viewBooking.bookingId ||
                      viewBooking._id?.slice(-8).toUpperCase(),
                  ],
                  ["Status", viewBooking.status],
                  ["Flight Number", viewBooking.flightNumber],
                  ["From", viewBooking.from],
                  ["To", viewBooking.to],
                  ["Passengers", viewBooking.passengers?.length || 1],
                  [
                    "Total Price",
                    `₹${viewBooking.totalPrice?.toLocaleString("en-IN") || "—"}`,
                  ],
                  ["Booked On", formatDate(viewBooking.createdAt)],
                ].map(([label, value]) => (
                  <div key={label} className="ub-detail-row">
                    <span className="ub-detail-label">{label}</span>
                    <span className="ub-detail-value">{value || "—"}</span>
                  </div>
                ))}
              </div>

              {viewBooking.passengers?.length > 0 && (
                <div style={{ marginTop: "1.25rem" }}>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Passengers
                  </p>
                  <div className="ub-pax-list">
                    {viewBooking.passengers.map((p, i) => (
                      <div key={i} className="ub-pax-item">
                        <div className="ub-pax-avatar">
                          {p.fullName?.charAt(0) || i + 1}
                        </div>
                        <div>
                          <p className="ub-pax-name">{p.fullName}</p>
                          <p className="ub-pax-meta">
                            {p.gender} · {p.nationality}
                          </p>
                        </div>
                        <span className="ub-pax-seat">{p.seat || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pax-modal-footer">
              {/* Download Boarding Pass */}
              {(viewBooking.status === "confirmed" ||
                viewBooking.status === "Confirmed") && (
                <button
                  onClick={() => {
                    downloadBoardingPass(viewBooking);
                    setViewBooking(null);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    background: "rgba(108,99,255,0.15)",
                    color: "#6c63ff",
                    border: "1px solid rgba(108,99,255,0.4)",
                    borderRadius: "0.6rem",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  <Download size={15} /> Download Boarding Pass
                </button>
              )}

              {/* Cancel button */}
              {/* {(viewBooking.status === "confirmed" ||
                viewBooking.status === "Confirmed") && (
                <button
                  className="up-btn-danger"
                  onClick={() => {
                    handleCancel(viewBooking._id);
                    setViewBooking(null);
                  }}
                >
                  <XCircle size={15} /> Cancel Booking
                </button>
              )} */}

              <button
                className="up-btn-secondary"
                onClick={() => setViewBooking(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="up-header">
        <h1 className="up-title">My Bookings</h1>
        <p className="up-subtitle">Total: {bookings.length} bookings</p>
      </div>

      {/* Filters */}
      <div className="up-card" style={{ marginBottom: "1.25rem" }}>
        <div className="up-card-body" style={{ padding: "1rem 1.25rem" }}>
          <div className="ub-filter-row">
            <div className="ub-search-wrapper">
              <Search size={15} className="ub-search-icon" />
              <input
                type="text"
                placeholder="Search by booking ID, flight, route..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ub-search-input"
              />
            </div>
            <select
              className="ub-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="up-card">
          <div className="up-empty">
            <div className="up-spinner" style={{ margin: "0 auto" }} />
            <p style={{ marginTop: "0.75rem" }}>Loading bookings...</p>
          </div>
        </div>
      ) : current.length === 0 ? (
        <div className="up-card">
          <div className="up-empty">
            <Ticket size={48} className="up-empty-icon" />
            <p>No bookings found</p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {current.map((b, i) => (
            <div
              key={b._id || i}
              style={{
                background: "var(--card-bg, #fff)",
                borderRadius: "1rem",
                boxShadow:
                  "0 4px 24px rgba(99,102,241,0.10), 0 1.5px 6px rgba(0,0,0,0.06)",
                border: "1px solid var(--border-color, #e5e7eb)",
                overflow: "hidden",
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              {/* Top stripe by status */}
              <div
                style={{
                  height: 4,
                  background:
                    b.status === "confirmed" || b.status === "Confirmed"
                      ? "linear-gradient(90deg, #10b981, #34d399)"
                      : b.status === "cancelled" || b.status === "Cancelled"
                        ? "linear-gradient(90deg, #ef4444, #f87171)"
                        : "linear-gradient(90deg, #f59e0b, #fbbf24)",
                }}
              />

              <div style={{ padding: "1.25rem 1.5rem" }}>
                {/* Row 1: Route + Status + Price */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  {/* Route */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "0.75rem",
                        background: "rgba(99,102,241,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Plane size={20} color="#6366f1" />
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "1.2rem",
                            fontWeight: 700,
                            color: "var(--text-primary, #0f172a)",
                          }}
                        >
                          {b.from || "—"}
                        </span>
                        <span
                          style={{
                            color: "#6366f1",
                            fontWeight: 700,
                            fontSize: "1.1rem",
                          }}
                        >
                          →
                        </span>
                        <span
                          style={{
                            fontSize: "1.2rem",
                            fontWeight: 700,
                            color: "var(--text-primary, #0f172a)",
                          }}
                        >
                          {b.to || "—"}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.78rem",
                          color: "var(--text-secondary, #64748b)",
                          marginTop: 2,
                        }}
                      >
                        {b.flightNumber || "—"} &nbsp;·&nbsp;{" "}
                        {b.bookingId || b._id?.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Status + Price */}
                  <div style={{ textAlign: "right" }}>
                    <span
                      className={`up-badge ${STATUS_CLASS[b.status] || "up-badge-pending"}`}
                      style={{ marginBottom: 4, display: "inline-block" }}
                    >
                      {b.status}
                    </span>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: "#6366f1",
                      }}
                    >
                      ₹{b.totalPrice?.toLocaleString("en-IN") || "—"}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div
                  style={{
                    borderTop: "1px dashed var(--border-color, #e5e7eb)",
                    margin: "0 0 1rem",
                  }}
                />

                {/* Row 2: Detail chips */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.6rem",
                    marginBottom: "1rem",
                  }}
                >
                  {[
                    {
                      label: "Booking ID",
                      value: b.bookingId || b._id?.slice(-8).toUpperCase(),
                    },
                    {
                      label: "Passengers",
                      value: `${b.passengers?.length || 1} passenger${(b.passengers?.length || 1) > 1 ? "s" : ""}`,
                    },
                    { label: "Booked On", value: formatDate(b.createdAt) },
                    {
                      label: "Class",
                      value: b.seatClass || b.class || "Economy",
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        background: "var(--bg-secondary, #f8fafc)",
                        border: "1px solid var(--border-color, #e5e7eb)",
                        borderRadius: "0.5rem",
                        padding: "0.35rem 0.75rem",
                        fontSize: "0.78rem",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--text-secondary, #64748b)",
                          marginRight: 4,
                        }}
                      >
                        {label}:
                      </span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: "var(--text-primary, #0f172a)",
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Row 3: Actions */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  {/* View */}
                  <button
                    onClick={() => setViewBooking(b)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.45rem 0.9rem",
                      borderRadius: "0.6rem",
                      border: "1px solid var(--border-color, #e5e7eb)",
                      background: "var(--bg-secondary, #f8fafc)",
                      color: "var(--text-primary, #0f172a)",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                    }}
                  >
                    <Eye size={14} /> View Details
                  </button>

                  {/* ── Complete Payment — pending booking ke liye ── */}
                  {(b.status === "pending" || b.status === "Pending") && (
                    <button
                      onClick={() =>
                        navigate(
                          `/passengers?flight=${b.flightNumber}&from=${b.from}&to=${b.to}&price=${b.totalPrice}&passengers=${b.passengers?.length || 1}&bookingId=${b._id}`,
                        )
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.45rem 0.9rem",
                        borderRadius: "0.6rem",
                        border: "1px solid rgba(245,158,11,0.4)",
                        background: "rgba(245,158,11,0.1)",
                        color: "#d97706",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      💳 Complete Payment
                    </button>
                  )}

                  {/* Download Boarding Pass */}
                  {(b.status === "confirmed" || b.status === "Confirmed") && (
                    <button
                      onClick={() => downloadBoardingPass(b)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.45rem 0.9rem",
                        borderRadius: "0.6rem",
                        border: "1px solid rgba(99,102,241,0.35)",
                        background: "rgba(99,102,241,0.08)",
                        color: "#6366f1",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      <Download size={14} /> Boarding Pass
                    </button>
                  )}

                  {/* Cancel */}
                  {/* {(b.status === "confirmed" || b.status === "Confirmed") && (
                    <button
                      onClick={() => handleCancel(b._id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.45rem 0.9rem",
                        borderRadius: "0.6rem",
                        border: "1px solid rgba(239,68,68,0.3)",
                        background: "rgba(239,68,68,0.08)",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                  )} */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="ub-pagination">
          <p className="ub-page-info">
            Showing {(currentPage - 1) * perPage + 1}–
            {Math.min(currentPage * perPage, filteredBookings.length)} of{" "}
            {filteredBookings.length}
          </p>
          <div className="ub-page-btns">
            <button
              className="ub-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`ub-page-btn ${
                  currentPage === i + 1 ? "ub-page-btn-active" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="ub-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBookings;
