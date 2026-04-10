import React, { useEffect, useState } from "react";
import {
  Eye,
  Trash2,
  Download,
  Search,
  Plus,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import AddBookingModal from "./AddBookingModal";
import "./AdminTables.css";
import "./AdminUsers.css";
import "./AdminContacts.css";
import "./Bookings.css";

const BOOKING_STATUS_CLASS = {
  confirmed: "badge-confirmed",
  Confirmed: "badge-confirmed",
  cancelled: "badge-cancelled",
  Cancelled: "badge-cancelled",
  pending: "badge-pending",
  Pending: "badge-pending",
};

// ── Stats Card Config ──
const STAT_CARDS = [
  { key: "all", label: "Total Bookings", color: "#7F77DD" },
  { key: "confirmed", label: "Confirmed", color: "#1D9E75" },
  { key: "pending", label: "Pending", color: "#EF9F27" },
  { key: "cancelled", label: "Cancelled", color: "#E24B4A" },
];

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewBooking, setViewBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");

  // ── Stats State ──
  const [stats, setStats] = useState({
    all: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000,
    );
  };

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: bookingsPerPage,
        search: query,
        status: statusFilter,
        startDate: dateRange.start,
        endDate: dateRange.end,
      });
      const res = await fetch(
        `http://localhost:5000/api/booking?${params.toString()}`,
      );
      const data = await res.json();
      setBookings(data.bookings || []);
      setTotalCount(data.total || 0);
      setTotalPages(data.pages || 1);
      setSelectedBookings([]);
      setSelectAll(false);
    } catch {
      showNotification("Failed to fetch bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch counts for all statuses ──
  const fetchStats = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/booking?limit=10000`);
      const data = await res.json();
      const all = data.bookings || [];
      setStats({
        all: data.total || 0,
        confirmed: all.filter((b) => b.status?.toLowerCase() === "confirmed")
          .length,
        pending: all.filter((b) => b.status?.toLowerCase() === "pending")
          .length,
        cancelled: all.filter((b) => b.status?.toLowerCase() === "cancelled")
          .length,
      });
    } catch {
      console.error("Stats fetch failed");
    }
  };

  useEffect(() => {
    fetchBookings(currentPage);
    fetchStats();
  }, [currentPage, query, statusFilter, dateRange]);

  const deleteBooking = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    setLoading(true);
    try {
      await fetch(`http://localhost:5000/api/booking/${id}`, {
        method: "DELETE",
      });
      showNotification("Booking deleted");
      fetchBookings(currentPage);
      fetchStats();
    } catch {
      showNotification("Failed to delete", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBookings([]);
      setSelectAll(false);
    } else {
      setSelectedBookings(bookings.map((b) => b._id));
      setSelectAll(true);
    }
  };

  const toggleBookingSelection = (id) => {
    setSelectedBookings((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`${selectedBookings.length} bookings delete karo?`))
      return;
    setLoading(true);
    try {
      await Promise.all(
        selectedBookings.map((id) =>
          fetch(`http://localhost:5000/api/booking/${id}`, {
            method: "DELETE",
          }),
        ),
      );
      setSelectedBookings([]);
      setSelectAll(false);
      showNotification(`${selectedBookings.length} bookings deleted`);
      fetchBookings(currentPage);
      fetchStats();
    } catch {
      showNotification("Bulk delete failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatus = async (status) => {
    setLoading(true);
    try {
      await Promise.all(
        selectedBookings.map((id) =>
          fetch(`http://localhost:5000/api/booking/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }),
        ),
      );
      setSelectedBookings([]);
      setSelectAll(false);
      showNotification(
        `${selectedBookings.length} bookings updated to ${status}`,
      );
      fetchBookings(currentPage);
      fetchStats();
    } catch {
      showNotification("Bulk update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const exportBookings = async () => {
    if (exportFormat === "csv") {
      try {
        const res = await fetch("http://localhost:5000/api/booking/export/csv");
        if (!res.ok) throw new Error("Export failed");
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `bookings_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        showNotification("CSV exported successfully");
      } catch {
        showNotification("Export failed", "error");
      }
    } else {
      const blob = new Blob([JSON.stringify(bookings, null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `bookings_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      showNotification(`${bookings.length} bookings exported as JSON`);
    }
  };

  const indexOfFirst = (currentPage - 1) * bookingsPerPage + 1;
  const indexOfLast = Math.min(currentPage * bookingsPerPage, totalCount);

  return (
    <div>
      {loading && (
        <div className="users-loading-overlay">
          <div className="users-loading-box">
            <div className="users-spinner" />
            <p>Loading...</p>
          </div>
        </div>
      )}

      {notification.show && (
        <div
          className={`users-notification ${notification.type === "error" ? "users-notification-error" : "users-notification-success"}`}
        >
          {notification.message}
        </div>
      )}

      {/* ── View Modal ── */}
      {showViewModal && viewBooking && (
        <div
          className="pax-modal-overlay"
          onClick={() => setShowViewModal(false)}
        >
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
                  {viewBooking.bookingRef}
                </p>
              </div>
              <button
                className="pax-modal-close"
                onClick={() => setShowViewModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="pax-modal-body">
              <div className="pax-detail-grid">
                {[
                  ["Booking Ref", viewBooking.bookingRef],
                  ["Passenger Name", viewBooking.userName],
                  ["Email", viewBooking.email],
                  ["Phone", viewBooking.phone],
                  ["Flight", viewBooking.flightNumber],
                  ["Route", `${viewBooking.from} → ${viewBooking.to}`],
                  ["Date", viewBooking.date || "—"],
                  ["Seats", viewBooking.seats?.join(", ") || "—"],
                  ["Total Passengers", viewBooking.passengersCount],
                  [
                    "Amount",
                    `₹${viewBooking.totalPrice?.toLocaleString("en-IN")}`,
                  ],
                  ["Payment Method", viewBooking.paymentMethod || "—"],
                  ["Transaction ID", viewBooking.transactionId || "—"],
                  ["Status", viewBooking.status],
                  [
                    "Booked On",
                    new Date(viewBooking.createdAt).toLocaleString("en-IN"),
                  ],
                ].map(([label, value]) => (
                  <div className="pax-detail-row" key={label}>
                    <span className="pax-detail-label">{label}</span>
                    <span className="pax-detail-value">{value || "—"}</span>
                  </div>
                ))}
              </div>

              {/* ── Passengers List ── */}
              {viewBooking.passengers?.length > 0 && (
                <div style={{ marginTop: "1.5rem" }}>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "var(--text-secondary)",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Passenger Details
                  </p>
                  {viewBooking.passengers.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: "0.75rem",
                        padding: "0.75rem 1rem",
                        marginBottom: "0.5rem",
                        background: "var(--card-bg, rgba(255,255,255,0.03))",
                      }}
                    >
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          marginBottom: "0.4rem",
                          color: "var(--text-primary)",
                        }}
                      >
                        Passenger {i + 1} — {p.fullName || "—"}
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0.25rem 1rem",
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <span>
                          Seat: <strong>{p.seat || "—"}</strong>
                        </span>
                        <span>
                          Gender: <strong>{p.gender || "—"}</strong>
                        </span>
                        <span>
                          Passport: <strong>{p.passportNumber || "—"}</strong>
                        </span>
                        <span>
                          Nationality: <strong>{p.nationality || "—"}</strong>
                        </span>
                        {p.email && (
                          <span>
                            Email: <strong>{p.email}</strong>
                          </span>
                        )}
                        {p.phone && (
                          <span>
                            Phone: <strong>{p.phone}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="pax-modal-footer">
              <button
                className="btn-export"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Bookings Management</h1>
          <p className="admin-page-subtitle">
            Total: <strong>{totalCount}</strong>
          </p>
        </div>
        <div className="admin-header-actions">
          <select
            className="btn-export-select"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
          <button className="btn-export" onClick={exportBookings}>
            <Download size={16} /> Export
          </button>
          {/* <button className="btn-add-user" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add Booking
          </button> */}
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "1.5rem",
        }}
      >
        {STAT_CARDS.map(({ key, label, color }) => (
          <div
            key={key}
            onClick={() => {
              setStatusFilter(key);
              setCurrentPage(1);
            }}
            style={{
              background: "var(--secondary, rgba(255,255,255,0.05))",
              borderRadius: "0.75rem",
              padding: "1rem 1.25rem",
              borderLeft: `3px solid ${color}`,
              cursor: "pointer",
              transition: "opacity 0.2s",
              outline:
                statusFilter === key
                  ? `2px solid ${color}`
                  : "2px solid transparent",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                margin: "0 0 6px",
                fontWeight: 400,
              }}
            >
              {label}
            </p>
            <p
              style={{
                fontSize: "26px",
                fontWeight: 500,
                color,
                margin: "0 0 4px",
                lineHeight: 1,
              }}
            >
              {stats[key]}
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-secondary)",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: color,
                  display: "inline-block",
                }}
              />
              {statusFilter === key ? "Active filter" : "Click to filter"}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="users-filter-card">
        <div className="contacts-filter-grid">
          <div
            className="admin-search-wrapper"
            style={{ gridColumn: "span 2" }}
          >
            <Search size={16} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search by Reference / Name / Email / Flight..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="admin-input admin-input-search"
            />
          </div>
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>
          <div className="contacts-date-range">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="admin-input"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="admin-input"
            />
          </div>
        </div>
      </div>

      {/* ── Bulk Actions ── */}
      {selectedBookings.length > 0 && (
        <div className="users-bulk-bar">
          <span className="users-bulk-count">
            {selectedBookings.length} booking(s) selected
          </span>
          <div className="users-bulk-actions">
            <select
              onChange={(e) => handleBulkStatus(e.target.value)}
              className="users-bulk-select"
              defaultValue=""
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border)",
                background: "var(--card-bg, #1e2535)",
                color: "var(--text-primary, #e2e8f0)",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              <option value="" disabled>
                Change Status
              </option>
              <option value="confirmed">Set Confirmed</option>
              <option value="cancelled">Set Cancelled</option>
              <option value="pending">Set Pending</option>
            </select>
            <button
              className="users-bulk-btn users-bulk-blocked"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </button>
            <button
              className="users-bulk-btn users-bulk-clear"
              onClick={() => {
                setSelectedBookings([]);
                setSelectAll(false);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="admin-table-container">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <button
                    onClick={handleSelectAll}
                    className="passengers-check-btn"
                  >
                    {selectAll ? (
                      <CheckSquare size={16} style={{ color: "#667eea" }} />
                    ) : (
                      <Square
                        size={16}
                        style={{ color: "var(--text-secondary)" }}
                      />
                    )}
                  </button>
                </th>
                <th>Booking Ref</th>
                <th>Passenger</th>
                <th>Email</th>
                <th>Flight</th>
                <th>Route</th>
                <th>Date</th>
                <th>Seats</th>
                <th>Pax</th>
                <th>Amount</th>
                <th>Status</th>
                {/* <th>Booked On</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={13} className="admin-table-empty">
                    <BookOpen size={48} className="admin-table-empty-icon" />
                    <p>No bookings found</p>
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const isSelected = selectedBookings.includes(b._id);
                  return (
                    <tr
                      key={b._id}
                      style={
                        isSelected
                          ? { background: "rgba(102,126,234,0.08)" }
                          : {}
                      }
                    >
                      <td>
                        <button
                          onClick={() => toggleBookingSelection(b._id)}
                          className="passengers-check-btn"
                        >
                          {isSelected ? (
                            <CheckSquare
                              size={16}
                              style={{ color: "#667eea" }}
                            />
                          ) : (
                            <Square
                              size={16}
                              style={{ color: "var(--text-secondary)" }}
                            />
                          )}
                        </button>
                      </td>
                      <td className="cell-accent">{b.bookingRef}</td>
                      <td>
                        <p className="admin-avatar-name">{b.userName}</p>
                      </td>
                      <td
                        className="cell-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {b.email}
                      </td>
                      <td>
                        <span className="airline-code-tag">
                          {b.flightNumber || "—"}
                        </span>
                      </td>
                      <td className="cell-muted">
                        {b.from} → {b.to}
                      </td>
                      <td
                        className="cell-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {b.date || "—"}
                      </td>
                      <td
                        className="cell-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {b.seats?.join(", ") || "—"}
                      </td>
                      <td>
                        <span className="booking-passengers-badge">
                          {b.passengersCount}
                        </span>
                      </td>
                      <td className="cell-success">
                        ₹{b.totalPrice?.toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span
                          className={
                            BOOKING_STATUS_CLASS[b.status] || "badge-pending"
                          }
                        >
                          {b.status || "confirmed"}
                        </span>
                      </td>
                      {/* <td
                        className="cell-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {new Date(b.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td> */}
                      <td>
                        <div className="cell-actions">
                          <button
                            className="users-action-btn users-action-view"
                            title="View"
                            onClick={() => {
                              setViewBooking(b);
                              setShowViewModal(true);
                            }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="users-action-btn users-action-delete"
                            title="Delete"
                            onClick={() => deleteBooking(b._id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <p className="admin-pagination-info">
            Showing {indexOfFirst}–{indexOfLast} of {totalCount}
          </p>
          <div className="admin-pagination-buttons">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`pagination-btn ${currentPage === i + 1 ? "pagination-btn-active" : ""}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Add Booking Modal ── */}
      {showAdd && (
        <AddBookingModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            fetchBookings(1);
            fetchStats();
            showNotification("Booking added successfully");
          }}
        />
      )}
    </div>
  );
};

export default AdminBookings;
