import React, { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import "./AdminTables.css";
import "./AdminPassengers.css";

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "UAE",
  "Canada",
  "Australia",
  "Singapore",
  "Germany",
  "France",
  "Japan",
];

const PassengerModal = ({ passenger, onClose, refresh }) => {
  const isEdit = Boolean(passenger);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    bookingId: "",
    fullName: "",
    gender: "Male",
    dob: "",
    nationality: "",
    passportNumber: "",
    passportExpiry: "",
    email: "",
    phone: "",
    seat: "",
  });

  // ── Fetch bookings for dropdown (Add mode only) ──
  useEffect(() => {
    if (!isEdit) {
      const fetchBookings = async () => {
        try {
          const res = await fetch(
            "http://localhost:5000/api/booking?limit=100",
          );
          const data = await res.json();
          setBookings(data.bookings || []);
        } catch {
          console.error("Failed to load bookings");
        }
      };
      fetchBookings();
    }
  }, [isEdit]);

  // ── Pre-fill form in edit mode ──
  useEffect(() => {
    if (passenger) {
      setFormData({
        bookingId: passenger.bookingId || "",
        fullName: passenger.fullName || "",
        gender: passenger.gender || "Male",
        dob: passenger.dob || "",
        nationality: passenger.nationality || "",
        passportNumber: passenger.passportNumber || "",
        passportExpiry: passenger.passportExpiry || "",
        email: passenger.email || "",
        phone: passenger.phone || "",
        seat: passenger.seat || "",
      });
    }
  }, [passenger]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ══════════════════════════════════════════════════════════
  // ✅ Submit — Add: POST /api/passenger/passengers
  //            Edit: PUT /api/passenger/passengers/:id
  // ══════════════════════════════════════════════════════════
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && !formData.bookingId) {
      setError("Booking select karo");
      return;
    }
    if (!formData.fullName) {
      setError("Full name required hai");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const url = isEdit
        ? `http://localhost:5000/api/passenger/passengers/${passenger._id}`
        : `http://localhost:5000/api/passenger/passengers`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.error || "Operation failed");
      }

      refresh();
      onClose();
    } catch (err) {
      setError(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pax-modal-overlay" onClick={onClose}>
      <div
        className="pax-modal pax-modal-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pax-modal-header">
          <h2 className="pax-modal-title">
            {isEdit ? "Edit Passenger" : "Add New Passenger"}
          </h2>
          <button className="pax-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            className="booking-error-msg"
            style={{ margin: "0 1.5rem 1rem" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="pax-modal-body">
            <div className="pax-form-grid">
              {/* ── Booking dropdown — Add mode only ── */}
              {!isEdit && (
                <div
                  className="pax-form-group"
                  style={{ gridColumn: "span 2" }}
                >
                  <label className="pax-form-label">
                    Booking <span className="pax-required">*</span>
                  </label>
                  <select
                    name="bookingId"
                    value={formData.bookingId}
                    onChange={handleChange}
                    required
                    className="pax-form-select"
                  >
                    <option value="">Select Booking</option>
                    {bookings.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.bookingRef} — {b.flightNumber} | {b.from} → {b.to} |{" "}
                        {b.userName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* ── Full Name ── */}
              <div className="pax-form-group">
                <label className="pax-form-label">
                  Full Name <span className="pax-required">*</span>
                </label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="As on passport"
                  className="pax-form-input"
                />
              </div>

              {/* ── Gender ── */}
              <div className="pax-form-group">
                <label className="pax-form-label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="pax-form-select"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* ── DOB ── */}
              <div className="pax-form-group">
                <label className="pax-form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="pax-form-input"
                />
              </div>

              {/* ── Nationality ── */}
              <div className="pax-form-group">
                <label className="pax-form-label">Nationality</label>
                <select
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="pax-form-select"
                >
                  <option value="">Select Country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* ── Passport Number ── */}
              <div className="pax-form-group">
                <label className="pax-form-label">Passport Number</label>
                <input
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  placeholder="A1234567"
                  className="pax-form-input"
                />
              </div>

              {/* ── Passport Expiry ── */}
              <div className="pax-form-group">
                <label className="pax-form-label">Passport Expiry</label>
                <input
                  type="date"
                  name="passportExpiry"
                  value={formData.passportExpiry}
                  onChange={handleChange}
                  className="pax-form-input"
                />
              </div>

              {/* ── Email ── */}
              <div className="pax-form-group">
                <label className="pax-form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="pax-form-input"
                />
              </div>

              {/* ── Phone ── */}
              <div className="pax-form-group">
                <label className="pax-form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="pax-form-input"
                />
              </div>

              {/* ── Seat ── */}
              <div className="pax-form-group">
                <label className="pax-form-label">
                  Seat Number <span className="pax-optional">(optional)</span>
                </label>
                <input
                  name="seat"
                  value={formData.seat}
                  onChange={handleChange}
                  placeholder="e.g. 12A"
                  className="pax-form-input"
                />
              </div>
            </div>
          </div>

          <div className="pax-modal-footer">
            <button type="button" className="btn-export" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-add-user" disabled={loading}>
              {loading ? (
                <>
                  <div
                    className="users-spinner"
                    style={{ width: 16, height: 16, borderWidth: 2 }}
                  />{" "}
                  Processing...
                </>
              ) : (
                <>
                  <Save size={16} />{" "}
                  {isEdit ? "Update Passenger" : "Add Passenger"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PassengerModal;
