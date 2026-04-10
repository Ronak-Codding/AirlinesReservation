import React, { useState } from "react";
import { X, Save, Plus, Trash2, Search } from "lucide-react";
import "./AdminTables.css";
import "./AdminUsers.css";
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

const emptyPassenger = {
  fullName: "",
  gender: "",
  dob: "",
  nationality: "",
  passportNumber: "",
  passportExpiry: "",
  email: "",
  phone: "",
  seat: "", // ✅ New field — individual seat per passenger
};

const AddBookingModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Amadeus Search State ──
  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    date: "",
    passengers: 1,
  });
  const [flightResults, setFlightResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  // ── Passengers ──
  const [passengers, setPassengers] = useState([{ ...emptyPassenger }]);

  // ── Amadeus Flight Search ──
  const handleFlightSearch = async () => {
    if (!searchParams.from || !searchParams.to || !searchParams.date) {
      setError("From, To aur Date required hai");
      return;
    }
    setSearching(true);
    setError("");
    setFlightResults([]);
    setSelectedFlight(null);

    try {
      const res = await fetch(
        `http://localhost:5000/api/flights/search?from=${searchParams.from}&to=${searchParams.to}&date=${searchParams.date}&passengers=${searchParams.passengers}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      const flights = data.data || [];
      if (flights.length === 0)
        setError("Koi flight nahi mili. Alag date ya route try karo.");
      setFlightResults(flights);
    } catch (err) {
      setError(err.message || "Flight search failed");
    } finally {
      setSearching(false);
    }
  };

  // ── Flight Select ──
  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
    const count = parseInt(searchParams.passengers) || 1;
    setPassengers(Array.from({ length: count }, () => ({ ...emptyPassenger })));
  };

  // ── Passenger field change ──
  const handlePassengerChange = (index, field, value) => {
    setPassengers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const addPassenger = () =>
    setPassengers((prev) => [...prev, { ...emptyPassenger }]);

  const removePassenger = (index) => {
    if (passengers.length === 1) return;
    setPassengers((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Get flight info from Amadeus response ──
  const getFlightInfo = (flight) => {
    const seg = flight.itineraries?.[0]?.segments?.[0];
    return {
      flightNumber: seg ? `${seg.carrierCode}${seg.number}` : "—",
      from: seg?.departure?.iataCode || searchParams.from,
      to: seg?.arrival?.iataCode || searchParams.to,
      date: searchParams.date,
      departure: seg?.departure?.at
        ? new Date(seg.departure.at).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
      arrival: seg?.arrival?.at
        ? new Date(seg.arrival.at).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
      price: flight.price?.grandTotal || "—",
      currency: flight.price?.currency || "INR",
      duration:
        flight.itineraries?.[0]?.duration
          ?.replace("PT", "")
          .replace("H", "h ")
          .replace("M", "m") || "—",
    };
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFlight) {
      setError("Pehle flight select karo");
      return;
    }
    if (!passengers[0].email || !passengers[0].phone) {
      setError("First passenger ka email aur phone required hai");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const info = getFlightInfo(selectedFlight);

      // ✅ Seats array — har passenger ka individual seat
      const seats = passengers.map((p) => p.seat || "");

      const body = {
        flightNumber: info.flightNumber,
        from: info.from,
        to: info.to,
        date: info.date, // ✅ date save hogi
        seats, // ✅ seats array ["12A","13B"]
        totalPrice: parseFloat(info.price) || 0,
        passengers, // ✅ full passenger objects
      };

      const res = await fetch("http://localhost:5000/api/booking/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.error || "Booking failed");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pax-modal-overlay" onClick={onClose}>
      <div
        className="pax-modal pax-modal-lg"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pax-modal-header">
          <h2 className="pax-modal-title">Add New Booking</h2>
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
            <div className="pax-form-stack">
              {/* ── Step 1: Flight Search ── */}
              <h3
                style={{
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  margin: "0 0 0.75rem",
                }}
              >
                Step 1 — Flight Search
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 80px",
                  gap: "0.75rem",
                  alignItems: "end",
                }}
              >
                <div className="pax-form-group" style={{ margin: 0 }}>
                  <label className="pax-form-label">From *</label>
                  <input
                    type="text"
                    value={searchParams.from}
                    onChange={(e) =>
                      setSearchParams({
                        ...searchParams,
                        from: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="BOM"
                    maxLength={3}
                    className="pax-form-input"
                  />
                </div>
                <div className="pax-form-group" style={{ margin: 0 }}>
                  <label className="pax-form-label">To *</label>
                  <input
                    type="text"
                    value={searchParams.to}
                    onChange={(e) =>
                      setSearchParams({
                        ...searchParams,
                        to: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="DEL"
                    maxLength={3}
                    className="pax-form-input"
                  />
                </div>
                <div className="pax-form-group" style={{ margin: 0 }}>
                  <label className="pax-form-label">Date *</label>
                  <input
                    type="date"
                    value={searchParams.date}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, date: e.target.value })
                    }
                    className="pax-form-input"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="pax-form-group" style={{ margin: 0 }}>
                  <label className="pax-form-label">Pax</label>
                  <input
                    type="number"
                    min={1}
                    max={9}
                    value={searchParams.passengers}
                    onChange={(e) =>
                      setSearchParams({
                        ...searchParams,
                        passengers: e.target.value,
                      })
                    }
                    className="pax-form-input"
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn-primary"
                style={{ marginTop: "0.5rem", width: "100%" }}
                onClick={handleFlightSearch}
                disabled={searching}
              >
                {searching ? (
                  <>
                    <div
                      className="users-spinner"
                      style={{ width: 16, height: 16, borderWidth: 2 }}
                    />{" "}
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={16} /> Search Flights
                  </>
                )}
              </button>

              {/* ── Step 2: Flight Results ── */}
              {flightResults.length > 0 && (
                <>
                  <h3
                    style={{
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      margin: "1rem 0 0.5rem",
                    }}
                  >
                    Step 2 — Select Flight ({flightResults.length} found)
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      maxHeight: "250px",
                      overflowY: "auto",
                    }}
                  >
                    {flightResults.map((flight, i) => {
                      const info = getFlightInfo(flight);
                      const isSelected = selectedFlight === flight;
                      return (
                        <div
                          key={i}
                          onClick={() => handleSelectFlight(flight)}
                          style={{
                            border: `2px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                            borderRadius: "0.75rem",
                            padding: "0.75rem 1rem",
                            cursor: "pointer",
                            background: isSelected
                              ? "rgba(var(--primary-rgb, 234,179,8), 0.1)"
                              : "transparent",
                            transition: "all 0.2s",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "1.5rem",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                color: "var(--text-primary)",
                              }}
                            >
                              {info.flightNumber}
                            </span>
                            <span
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.85rem",
                              }}
                            >
                              {info.from} → {info.to}
                            </span>
                            <span
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.8rem",
                              }}
                            >
                              {info.departure} – {info.arrival}
                            </span>
                            <span
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.8rem",
                              }}
                            >
                              ⏱ {info.duration}
                            </span>
                          </div>
                          <span
                            style={{
                              fontWeight: 700,
                              color: "var(--primary, #eab308)",
                              fontSize: "1rem",
                            }}
                          >
                            ₹{parseFloat(info.price).toLocaleString("en-IN")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ── Step 3: Passenger Details ── */}
              {selectedFlight && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "1rem",
                    }}
                  >
                    <h3
                      style={{
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      Step 3 — Passenger Details ({passengers.length})
                    </h3>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}
                      onClick={addPassenger}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>

                  {passengers.map((p, index) => (
                    <div
                      key={index}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: "0.75rem",
                        padding: "1rem",
                        marginTop: "0.75rem",
                        background: "var(--card-bg, rgba(255,255,255,0.03))",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            color: "var(--text-primary)",
                          }}
                        >
                          Passenger {index + 1}
                        </span>
                        {passengers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePassenger(index)}
                            style={{
                              background: "rgba(239,68,68,0.1)",
                              color: "#ef4444",
                              border: "none",
                              borderRadius: "0.4rem",
                              padding: "0.25rem 0.5rem",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0.75rem",
                        }}
                      >
                        <div className="pax-form-group">
                          <label className="pax-form-label">Full Name *</label>
                          <input
                            type="text"
                            value={p.fullName}
                            onChange={(e) =>
                              handlePassengerChange(
                                index,
                                "fullName",
                                e.target.value,
                              )
                            }
                            placeholder="As on passport"
                            required
                            className="pax-form-input"
                          />
                        </div>
                        <div className="pax-form-group">
                          <label className="pax-form-label">Gender *</label>
                          <select
                            value={p.gender}
                            onChange={(e) =>
                              handlePassengerChange(
                                index,
                                "gender",
                                e.target.value,
                              )
                            }
                            required
                            className="pax-form-select"
                          >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="pax-form-group">
                          <label className="pax-form-label">
                            Date of Birth *
                          </label>
                          <input
                            type="date"
                            value={p.dob}
                            onChange={(e) =>
                              handlePassengerChange(
                                index,
                                "dob",
                                e.target.value,
                              )
                            }
                            required
                            className="pax-form-input"
                          />
                        </div>
                        <div className="pax-form-group">
                          <label className="pax-form-label">
                            Nationality *
                          </label>
                          <select
                            value={p.nationality}
                            onChange={(e) =>
                              handlePassengerChange(
                                index,
                                "nationality",
                                e.target.value,
                              )
                            }
                            required
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
                        <div className="pax-form-group">
                          <label className="pax-form-label">
                            Passport Number *
                          </label>
                          <input
                            type="text"
                            value={p.passportNumber}
                            onChange={(e) =>
                              handlePassengerChange(
                                index,
                                "passportNumber",
                                e.target.value.toUpperCase(),
                              )
                            }
                            placeholder="A1234567"
                            required
                            className="pax-form-input"
                          />
                        </div>
                        <div className="pax-form-group">
                          <label className="pax-form-label">
                            Passport Expiry *
                          </label>
                          <input
                            type="date"
                            value={p.passportExpiry}
                            onChange={(e) =>
                              handlePassengerChange(
                                index,
                                "passportExpiry",
                                e.target.value,
                              )
                            }
                            required
                            className="pax-form-input"
                          />
                        </div>

                        {/* ✅ Seat field — har passenger ke liye */}
                        <div className="pax-form-group">
                          <label className="pax-form-label">Seat Number</label>
                          <input
                            type="text"
                            value={p.seat}
                            onChange={(e) =>
                              handlePassengerChange(
                                index,
                                "seat",
                                e.target.value.toUpperCase(),
                              )
                            }
                            placeholder="e.g. 12A"
                            className="pax-form-input"
                          />
                        </div>

                        {index === 0 && (
                          <>
                            <div className="pax-form-group">
                              <label className="pax-form-label">Email *</label>
                              <input
                                type="email"
                                value={p.email}
                                onChange={(e) =>
                                  handlePassengerChange(
                                    index,
                                    "email",
                                    e.target.value,
                                  )
                                }
                                placeholder="ticket@email.com"
                                required
                                className="pax-form-input"
                              />
                            </div>
                            <div className="pax-form-group">
                              <label className="pax-form-label">Phone *</label>
                              <input
                                type="tel"
                                value={p.phone}
                                onChange={(e) =>
                                  handlePassengerChange(
                                    index,
                                    "phone",
                                    e.target.value,
                                  )
                                }
                                placeholder="+91 98765 43210"
                                required
                                className="pax-form-input"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pax-modal-footer">
            <button type="button" className="btn-export" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-add-user"
              disabled={loading || !selectedFlight}
            >
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
                  <Save size={16} /> Add Booking
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookingModal;
