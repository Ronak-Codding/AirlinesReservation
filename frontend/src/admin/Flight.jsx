import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Plane,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  CheckSquare,
  Square,
} from "lucide-react";
import "./AdminTables.css";
import "./AdminUsers.css";

const API = "http://localhost:5000/api";

const EMPTY_FORM = {
  flight_number: "",
  airline: "",
  from_airport: "",
  to_airport: "",
  departure_time: "",
  arrival_time: "",
  duration: "",
  price: "",
  seats_available: "",
  total_seats: "",
  aircraft_type: "Boeing 737",
  status: "Scheduled",
  admin_status: "Publish",
};

const generateFlightNumber = (airlineCode) => {
  const num = Math.floor(100 + Math.random() * 900);
  return `${airlineCode}${num}`;
};

// ── FlightForm - Component ke BAHAR ──
const FlightForm = ({
  title,
  onSubmit,
  onClose,
  formData,
  handleFormChange,
  handleRegenerate,
  airlines,
  airports,
  formLoading,
}) => (
  <div className="pax-modal-overlay" onClick={onClose}>
    <div
      className="pax-modal pax-modal-lg"
      style={{ maxHeight: "90vh", overflowY: "auto" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="pax-modal-header">
        <h2 className="pax-modal-title">{title}</h2>
        <button className="pax-modal-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="pax-modal-body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            {/* Flight Number */}
            <div className="pax-form-group">
              <label className="pax-form-label">Flight Number *</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  name="flight_number"
                  value={formData.flight_number}
                  onChange={handleFormChange}
                  placeholder="Select airline to auto-generate"
                  required
                  className="pax-form-input"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleRegenerate}
                  title="Regenerate"
                  style={{
                    padding: "0 0.75rem",
                    borderRadius: "0.6rem",
                    border: "1px solid var(--border)",
                    background: "var(--secondary, rgba(255,255,255,0.05))",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontSize: "0.75rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  <RefreshCw size={13} /> Generate
                </button>
              </div>
              {formData.flight_number && (
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-secondary)",
                    marginTop: "0.3rem",
                  }}
                >
                  Flight: <strong>{formData.flight_number}</strong>
                </p>
              )}
            </div>

            {/* Aircraft Type */}
            <div className="pax-form-group">
              <label className="pax-form-label">Aircraft Type</label>
              <input
                type="text"
                name="aircraft_type"
                value={formData.aircraft_type}
                onChange={handleFormChange}
                placeholder="Boeing 737"
                className="pax-form-input"
              />
            </div>

            {/* Airline */}
            <div className="pax-form-group">
              <label className="pax-form-label">Airline *</label>
              <select
                name="airline"
                value={formData.airline}
                onChange={handleFormChange}
                required
                className="pax-form-select"
              >
                <option value="">Select Airline</option>
                {airlines.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.airline_name} ({a.airline_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="pax-form-group">
              <label className="pax-form-label">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleFormChange}
                placeholder="5000"
                required
                className="pax-form-input"
              />
            </div>

            {/* From Airport */}
            <div className="pax-form-group">
              <label className="pax-form-label">From Airport *</label>
              <select
                name="from_airport"
                value={formData.from_airport}
                onChange={handleFormChange}
                required
                className="pax-form-select"
              >
                <option value="">Select Airport</option>
                {airports.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.airport_code} - {a.city}
                  </option>
                ))}
              </select>
            </div>

            {/* To Airport */}
            <div className="pax-form-group">
              <label className="pax-form-label">To Airport *</label>
              <select
                name="to_airport"
                value={formData.to_airport}
                onChange={handleFormChange}
                required
                className="pax-form-select"
              >
                <option value="">Select Airport</option>
                {airports.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.airport_code} - {a.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Departure */}
            <div className="pax-form-group">
              <label className="pax-form-label">Departure Time *</label>
              <input
                type="datetime-local"
                name="departure_time"
                value={formData.departure_time}
                onChange={handleFormChange}
                required
                className="pax-form-input"
              />
            </div>

            {/* Arrival */}
            <div className="pax-form-group">
              <label className="pax-form-label">Arrival Time *</label>
              <input
                type="datetime-local"
                name="arrival_time"
                value={formData.arrival_time}
                onChange={handleFormChange}
                required
                className="pax-form-input"
              />
            </div>

            {/* Duration */}
            <div className="pax-form-group">
              <label className="pax-form-label">
                Duration (minutes) - Auto
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleFormChange}
                placeholder="Auto calculated"
                className="pax-form-input"
              />
            </div>

            {/* Total Seats */}
            <div className="pax-form-group">
              <label className="pax-form-label">Total Seats *</label>
              <input
                type="number"
                name="total_seats"
                value={formData.total_seats}
                onChange={handleFormChange}
                placeholder="180"
                required
                className="pax-form-input"
              />
            </div>

            {/* Available Seats */}
            <div className="pax-form-group">
              <label className="pax-form-label">Seats Available *</label>
              <input
                type="number"
                name="seats_available"
                value={formData.seats_available}
                onChange={handleFormChange}
                placeholder="150"
                required
                className="pax-form-input"
              />
            </div>

            {/* Status */}
            <div className="pax-form-group">
              <label className="pax-form-label">Flight Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="pax-form-select"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Delayed">Delayed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Admin Status */}
            <div className="pax-form-group">
              <label className="pax-form-label">Publish Status</label>
              <select
                name="admin_status"
                value={formData.admin_status}
                onChange={handleFormChange}
                className="pax-form-select"
              >
                <option value="Publish">Publish</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
        <div className="pax-modal-footer">
          <button type="button" className="btn-export" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-add-user" disabled={formLoading}>
            {formLoading ? (
              <>
                <div
                  className="users-spinner"
                  style={{ width: 16, height: 16, borderWidth: 2 }}
                />{" "}
                Saving...
              </>
            ) : (
              <>
                <Save size={16} /> Save Flight
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
);

// ── Stats Card Config ──
const STAT_CARDS = [
  { key: "all", label: "Total Flights", color: "#7F77DD" },
  { key: "Scheduled", label: "Scheduled", color: "#378ADD" },
  { key: "Delayed", label: "Delayed", color: "#EF9F27" },
  { key: "Cancelled", label: "Cancelled", color: "#E24B4A" },
  { key: "Completed", label: "Completed", color: "#1D9E75" },
];

// ── Main Component ──
const AdminFlights = () => {
  const [flights, setFlights] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);

  const [selectedFlights, setSelectedFlights] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // ── Stats State ──
  const [stats, setStats] = useState({
    all: 0,
    Scheduled: 0,
    Delayed: 0,
    Cancelled: 0,
    Completed: 0,
  });

  // ── Export format state ──
  const [exportFormat, setExportFormat] = useState("csv");

  const perPage = 10;

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000,
    );
  };

  const fetchFlights = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: perPage,
        search: query,
        status: statusFilter,
      });
      const res = await fetch(`${API}/flights?${params}`);
      const data = await res.json();
      setFlights(data.flights || []);
      setTotalCount(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch {
      showNotification("Failed to fetch flights", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch counts for all statuses ──
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/flights?limit=1000`);
      const data = await res.json();
      const all = data.flights || [];
      setStats({
        all: data.total || 0,
        Scheduled: all.filter((f) => f.status === "Scheduled").length,
        Delayed: all.filter((f) => f.status === "Delayed").length,
        Cancelled: all.filter((f) => f.status === "Cancelled").length,
        Completed: all.filter((f) => f.status === "Completed").length,
      });
    } catch {
      console.error("Stats fetch failed");
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [aRes, apRes] = await Promise.all([
        fetch(`${API}/airlines/allAirlines`),
        fetch(`${API}/airports/allAirports`),
      ]);
      const aData = await aRes.json();
      const apData = await apRes.json();
      setAirlines(aData.airlines || []);
      setAirports(Array.isArray(apData) ? apData : apData.airports || []);
    } catch {
      console.error("Dropdown fetch failed");
    }
  };

  useEffect(() => {
    fetchFlights(currentPage);
    fetchStats();
  }, [currentPage, query, statusFilter]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  // Reset selection on flights change
  useEffect(() => {
    setSelectedFlights([]);
    setSelectAll(false);
  }, [flights]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "airline" && value) {
        const sel = airlines.find((a) => a._id === value);
        if (sel) updated.flight_number = generateFlightNumber(sel.airline_code);
      }
      if (name === "departure_time" || name === "arrival_time") {
        const dep = new Date(updated.departure_time);
        const arr = new Date(updated.arrival_time);
        if (dep && arr && arr > dep)
          updated.duration = Math.round((arr - dep) / 60000);
      }
      return updated;
    });
  };

  const handleRegenerate = () => {
    const sel = airlines.find((a) => a._id === formData.airline);
    if (sel) {
      setFormData((prev) => ({
        ...prev,
        flight_number: generateFlightNumber(sel.airline_code),
      }));
    } else {
      showNotification("Pehle airline select karo", "error");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch(`${API}/flights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      showNotification("Flight added successfully!");
      setShowAdd(false);
      setFormData(EMPTY_FORM);
      fetchFlights(1);
      fetchStats();
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch(`${API}/flights/${selectedFlight._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      showNotification("Flight updated successfully!");
      setShowEdit(false);
      fetchFlights(currentPage);
      fetchStats();
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this flight?")) return;
    try {
      await fetch(`${API}/flights/${id}`, { method: "DELETE" });
      showNotification("Flight deleted");
      fetchFlights(currentPage);
      fetchStats();
    } catch {
      showNotification("Delete failed", "error");
    }
  };

  const handleToggle = async (id) => {
    try {
      await fetch(`${API}/flights/${id}/toggle-status`, { method: "PATCH" });
      fetchFlights(currentPage);
    } catch {
      showNotification("Toggle failed", "error");
    }
  };

  // ── Checkbox handlers ──
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFlights([]);
      setSelectAll(false);
    } else {
      setSelectedFlights(flights.map((f) => f._id));
      setSelectAll(true);
    }
  };

  const toggleFlightSelection = (id) => {
    setSelectedFlights((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // ── Bulk Delete ──
  const handleBulkDelete = async () => {
    if (!window.confirm(`${selectedFlights.length} flights delete karo?`))
      return;
    setLoading(true);
    try {
      await Promise.all(
        selectedFlights.map((id) =>
          fetch(`${API}/flights/${id}`, { method: "DELETE" }),
        ),
      );
      setSelectedFlights([]);
      setSelectAll(false);
      showNotification(`${selectedFlights.length} flights deleted`);
      fetchFlights(currentPage);
      fetchStats();
    } catch {
      showNotification("Bulk delete failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Bulk Status Update ──
  const handleBulkStatus = async (admin_status) => {
    setLoading(true);
    try {
      await Promise.all(
        selectedFlights.map((id) =>
          fetch(`${API}/flights/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ admin_status }),
          }),
        ),
      );
      setSelectedFlights([]);
      setSelectAll(false);
      showNotification(
        `${selectedFlights.length} flights updated to ${admin_status}`,
      );
      fetchFlights(currentPage);
      fetchStats();
    } catch {
      showNotification("Bulk update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (flight) => {
    setSelectedFlight(flight);
    setFormData({
      flight_number: flight.flight_number || "",
      airline: flight.airline?._id || "",
      from_airport: flight.from_airport?._id || "",
      to_airport: flight.to_airport?._id || "",
      departure_time: flight.departure_time
        ? new Date(flight.departure_time).toISOString().slice(0, 16)
        : "",
      arrival_time: flight.arrival_time
        ? new Date(flight.arrival_time).toISOString().slice(0, 16)
        : "",
      duration: flight.duration || "",
      price: flight.price || "",
      seats_available: flight.seats_available || "",
      total_seats: flight.total_seats || "",
      aircraft_type: flight.aircraft_type || "Boeing 737",
      status: flight.status || "Scheduled",
      admin_status: flight.admin_status || "Publish",
    });
    setShowEdit(true);
  };

  // ── Export (CSV + JSON) ──
  const exportFlights = async () => {
    if (exportFormat === "csv") {
      try {
        const res = await fetch(`${API}/flights/export/csv`);
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `flights_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        showNotification("CSV exported successfully");
      } catch {
        showNotification("Export failed", "error");
      }
    } else {
      const blob = new Blob([JSON.stringify(flights, null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `flights_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      showNotification(`${flights.length} flights exported as JSON`);
    }
  };

  const formatTime = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";
  const formatDuration = (mins) =>
    mins ? `${Math.floor(mins / 60)}h ${mins % 60}m` : "—";
  const STATUS_CLASS = {
    Scheduled: "badge-scheduled",
    Delayed: "badge-delayed",
    Cancelled: "badge-cancelled",
    Completed: "badge-completed",
  };
  const closeForm = () => {
    setShowAdd(false);
    setShowEdit(false);
  };

  const commonFormProps = {
    formData,
    handleFormChange,
    handleRegenerate,
    airlines,
    airports,
    formLoading,
    onClose: closeForm,
  };

  return (
    <div style={{ position: "relative", minHeight: "200px" }}>
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

      {showAdd && (
        <FlightForm
          title="Add New Flight"
          onSubmit={handleCreate}
          {...commonFormProps}
        />
      )}
      {showEdit && (
        <FlightForm
          title="Edit Flight"
          onSubmit={handleUpdate}
          {...commonFormProps}
        />
      )}

      {/* View Modal */}
      {showView && selectedFlight && (
        <div className="pax-modal-overlay" onClick={() => setShowView(false)}>
          <div
            className="pax-modal pax-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pax-modal-header">
              <h2 className="pax-modal-title">Flight Details</h2>
              <button
                className="pax-modal-close"
                onClick={() => setShowView(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="pax-modal-body">
              <div className="pax-detail-grid">
                {[
                  ["Flight Number", selectedFlight.flight_number],
                  ["Airline", selectedFlight.airline?.airline_name],
                  ["Aircraft", selectedFlight.aircraft_type],
                  [
                    "From",
                    `${selectedFlight.from_airport?.airport_code} - ${selectedFlight.from_airport?.city}`,
                  ],
                  [
                    "To",
                    `${selectedFlight.to_airport?.airport_code} - ${selectedFlight.to_airport?.city}`,
                  ],
                  ["Departure", formatTime(selectedFlight.departure_time)],
                  ["Arrival", formatTime(selectedFlight.arrival_time)],
                  ["Duration", formatDuration(selectedFlight.duration)],
                  [
                    "Price",
                    `₹${selectedFlight.price?.toLocaleString("en-IN")}`,
                  ],
                  ["Seats Available", selectedFlight.seats_available],
                  ["Total Seats", selectedFlight.total_seats],
                  ["Status", selectedFlight.status],
                  ["Publish Status", selectedFlight.admin_status],
                ].map(([label, value]) => (
                  <div className="pax-detail-row" key={label}>
                    <span className="pax-detail-label">{label}</span>
                    <span className="pax-detail-value">{value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pax-modal-footer">
              <button className="btn-export" onClick={() => setShowView(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Flight Management</h1>
          <p className="admin-page-subtitle">
            Total: <strong>{totalCount}</strong> flights
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
          <button className="btn-export" onClick={exportFlights}>
            <Download size={16} /> Export
          </button>
          <button
            className="btn-add-user"
            onClick={() => {
              setFormData(EMPTY_FORM);
              setShowAdd(true);
            }}
          >
            <Plus size={16} /> Add Flight
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
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

      {/* Filters */}
      <div className="users-filter-card">
        <div className="contacts-filter-grid">
          <div
            className="admin-search-wrapper"
            style={{ gridColumn: "span 2" }}
          >
            <Search size={16} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search by flight number..."
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
            <option value="Scheduled">Scheduled</option>
            <option value="Delayed">Delayed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedFlights.length > 0 && (
        <div className="users-bulk-bar">
          <span className="users-bulk-count">
            {selectedFlights.length} flight(s) selected
          </span>
          <div className="users-bulk-actions">
            <button
              className="users-bulk-btn users-bulk-active"
              onClick={() => handleBulkStatus("Publish")}
            >
              Set Publish
            </button>
            <button
              className="users-bulk-btn users-bulk-clear"
              onClick={() => handleBulkStatus("Draft")}
            >
              Set Draft
            </button>
            <button
              className="users-bulk-btn users-bulk-blocked"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </button>
            <button
              className="users-bulk-btn users-bulk-clear"
              onClick={() => {
                setSelectedFlights([]);
                setSelectAll(false);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
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
                <th>Flight</th>
                <th>Airline</th>
                <th>Route</th>
                <th>Departure</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Seats</th>
                <th>Status</th>
                <th>Publish</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flights.length === 0 ? (
                <tr>
                  <td colSpan={11} className="admin-table-empty">
                    <Plane size={48} className="admin-table-empty-icon" />
                    <p>No flights found</p>
                  </td>
                </tr>
              ) : (
                flights.map((f) => {
                  const isSelected = selectedFlights.includes(f._id);
                  return (
                    <tr
                      key={f._id}
                      style={
                        isSelected
                          ? { background: "rgba(102,126,234,0.08)" }
                          : {}
                      }
                    >
                      <td>
                        <button
                          onClick={() => toggleFlightSelection(f._id)}
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
                      <td className="cell-accent">{f.flight_number}</td>
                      <td>{f.airline?.airline_name || "—"}</td>
                      <td className="cell-muted">
                        {f.from_airport?.airport_code} →{" "}
                        {f.to_airport?.airport_code}
                      </td>
                      <td
                        className="cell-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {formatTime(f.departure_time)}
                      </td>
                      <td>{formatDuration(f.duration)}</td>
                      <td className="cell-success">
                        ₹{f.price?.toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span style={{ fontSize: "0.8rem" }}>
                          {f.seats_available}/{f.total_seats}
                        </span>
                      </td>
                      <td>
                        <span
                          className={STATUS_CLASS[f.status] || "badge-pending"}
                        >
                          {f.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggle(f._id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {f.admin_status === "Publish" ? (
                            <ToggleRight size={22} color="#22c55e" />
                          ) : (
                            <ToggleLeft size={22} color="#94a3b8" />
                          )}
                        </button>
                      </td>
                      <td>
                        <div className="cell-actions">
                          <button
                            className="users-action-btn users-action-view"
                            title="View"
                            onClick={() => {
                              setSelectedFlight(f);
                              setShowView(true);
                            }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="users-action-btn users-action-edit"
                            title="Edit"
                            onClick={() => openEdit(f)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="users-action-btn users-action-delete"
                            title="Delete"
                            onClick={() => handleDelete(f._id)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <p className="admin-pagination-info">
            Showing {(currentPage - 1) * perPage + 1}–
            {Math.min(currentPage * perPage, totalCount)} of {totalCount}
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
    </div>
  );
};

export default AdminFlights;
