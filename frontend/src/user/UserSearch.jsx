import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plane,
  ArrowLeftRight,
  Users,
  Calendar,
  Clock,
  Star,
} from "lucide-react";
import AirportAutocomplete from "../components/AirportAutocomplete";
import "./UserLayout.css";
import "./UserPages.css";
import "./UserSearch.css";

const UserSearch = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState("oneway");
  const [fromAirport, setFromAirport] = useState(null);
  const [toAirport, setToAirport] = useState(null); 
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [travelClass, setTravelClass] = useState("Economy");
  const [error, setError] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    setError("");
    if (!fromAirport?.airport_code) {
      setError("Please select departure airport");
      return;
    }
    if (!toAirport?.airport_code) {
      setError("Please select destination airport");
      return;
    }
    if (!date) {
      setError("Please select departure date");
      return;
    }
    if (fromAirport.airport_code === toAirport.airport_code) {
      setError("From and To airports cannot be same");
      return;
    }
    navigate(
      `/results?from=${fromAirport.airport_code}&to=${toAirport.airport_code}&date=${date}&passengers=${passengers}`,
    );
  };

  const swap = () => {
    const temp = fromAirport;
    setFromAirport(toAirport);
    setToAirport(temp);
  };

  const POPULAR = [
    {
      from: "Mumbai",
      to: "Delhi",
      fromCode: "BOM",
      toCode: "DEL",
      price: "₹3,499",
      time: "2h 10m",
    },
    {
      from: "Delhi",
      to: "Bangalore",
      fromCode: "DEL",
      toCode: "BLR",
      price: "₹4,199",
      time: "2h 45m",
    },
    {
      from: "Mumbai",
      to: "Goa",
      fromCode: "BOM",
      toCode: "GOI",
      price: "₹2,899",
      time: "1h 20m",
    },
    {
      from: "Hyderabad",
      to: "Chennai",
      fromCode: "HYD",
      toCode: "MAA",
      price: "₹2,199",
      time: "1h 10m",
    },
    {
      from: "Kolkata",
      to: "Mumbai",
      fromCode: "CCU",
      toCode: "BOM",
      price: "₹5,299",
      time: "2h 50m",
    },
    {
      from: "Delhi",
      to: "Goa",
      fromCode: "DEL",
      toCode: "GOI",
      price: "₹4,799",
      time: "2h 30m",
    },
  ];

  return (
    <div>
      <div className="up-header">
        <h1 className="up-title">Search Flights </h1>
        <p className="up-subtitle">Find the best flights for your journey</p>
      </div>

      {/* ── Search Card ── */}
      <div className="up-card usearch-card">
        <div className="usearch-body">
          {/* Trip Type */}
          <div className="usearch-trip-tabs">
            {["oneway", "roundtrip"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTripType(t)}
                className={`usearch-trip-tab ${tripType === t ? "usearch-trip-tab-active" : ""}`}
              >
                {t === "oneway" ? "One Way" : "Round Trip"}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && <div className="usearch-error">{error}</div>}

          {/* Form */}
          <form onSubmit={handleSearch}>
            <div className="usearch-form-grid">
              {/* FROM */}
              <div className="usearch-ac-wrap">
                <div className="usearch-ac-inner">
                  <AirportAutocomplete
                    label="From"
                    icon="fa-plane-departure"
                    value={fromAirport}
                    onSelect={(a) => {
                      setFromAirport(a);
                      setError("");
                    }}
                  />
                </div>
              </div>

              {/* SWAP */}
              <div className="usearch-swap-wrap">
                <button
                  type="button"
                  className="usearch-swap"
                  onClick={swap}
                  title="Swap"
                >
                  <ArrowLeftRight size={16} />
                </button>
              </div>

              {/* TO */}
              <div className="usearch-ac-wrap">
                <div className="usearch-ac-inner">
                  <AirportAutocomplete
                    label="To"
                    icon="fa-plane-arrival"
                    value={toAirport}
                    onSelect={(a) => {
                      setToAirport(a);
                      setError("");
                    }}
                  />
                </div>
              </div>

              {/* DEPARTURE */}
              <div className="usearch-field">
                <label className="usearch-label">
                  <Calendar size={12} /> Departure
                </label>
                <input
                  type="date"
                  className="usearch-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* RETURN */}
              {tripType === "roundtrip" && (
                <div className="usearch-field">
                  <label className="usearch-label">
                    <Calendar size={12} /> Return
                  </label>
                  <input
                    type="date"
                    className="usearch-input"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={date || new Date().toISOString().split("T")[0]}
                  />
                </div>
              )}

              {/* PASSENGERS */}
              <div className="usearch-field usearch-field-sm">
                <label className="usearch-label">
                  <Users size={12} /> Passengers
                </label>
                <select
                  className="usearch-input"
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Adult" : "Adults"}
                    </option>
                  ))}
                </select>
              </div>

              {/* CLASS */}
              <div className="usearch-field usearch-field-sm">
                <label className="usearch-label">
                  <Star size={12} /> Class
                </label>
                <select
                  className="usearch-input"
                  value={travelClass}
                  onChange={(e) => setTravelClass(e.target.value)}
                >
                  <option>Economy</option>
                  <option>Business</option>
                  <option>First</option>
                </select>
              </div>

              {/* SEARCH BTN */}
              <div className="usearch-btn-wrap">
                <button type="submit" className="usearch-btn">
                  <Search size={17} /> Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ── Popular Routes ── */}
      <div style={{ marginTop: "1.5rem" }}>
        <h3 className="usearch-pop-title">Popular Routes</h3>
        <div className="usearch-pop-grid">
          {POPULAR.map((r, i) => (
            <div
              key={i}
              className="usearch-pop-card"
              onClick={() => {
                setFromAirport({ airport_code: r.fromCode, city: r.from });
                setToAirport({ airport_code: r.toCode, city: r.to });
              }}
            >
              <div className="usearch-pop-route">
                <div className="usearch-pop-airport">
                  <span className="usearch-pop-code">{r.fromCode}</span>
                  <span className="usearch-pop-city">{r.from}</span>
                </div>
                <Plane
                  size={13}
                  style={{ color: "var(--accent)", flexShrink: 0 }}
                />
                <div
                  className="usearch-pop-airport"
                  style={{ textAlign: "right" }}
                >
                  <span className="usearch-pop-code">{r.toCode}</span>
                  <span className="usearch-pop-city">{r.to}</span>
                </div>
              </div>
              <div className="usearch-pop-meta">
                <span className="usearch-pop-time">
                  <Clock size={11} /> {r.time}
                </span>
                <span className="usearch-pop-price">{r.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
