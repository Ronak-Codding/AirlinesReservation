import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const AirportAutocomplete = ({
  label,
  icon,
  onSelect,
  required = false,
  value,
}) => {
  const [search, setSearch] = useState("");
  const [airports, setAirports] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  //  Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.trim().length >= 2) {
        fetchAirports(search);
      } else {
        setAirports([]);
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  const fetchAirports = async (query) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/airports/search?query=${query}`,
      );

      if (res.data.length > 0) {
        setAirports(res.data);
        setShowDropdown(true);
      } else {
        setAirports([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error("Airport search error:", error);
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    if (value) {
      setSearch(`${value.city} (${value.airport_code})`);
    } else {
      setSearch("");
    }
  }, [value]);

  const handleSelect = (airport) => {
    setSearch(`${airport.city} (${airport.airport_code})`);
    setShowDropdown(false);
    onSelect(airport);
  };

  return (
    <div className="mb-3 position-relative" ref={wrapperRef}>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <i className={`fas ${icon} me-2 text-info`}></i>
        {label}
      </label>

      <input
        type="text"
        className="w-full rounded-xl border border-border bg-secondary/100 px-4 py-4 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        placeholder="Search airport"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => airports.length > 0 && setShowDropdown(true)}
        required={required}
      />

      {showDropdown && (
        <div
          className="position-absolute w-100 bg-white shadow rounded mt-1"
          style={{
            zIndex: 1050,
            maxHeight: "250px",
            overflowY: "auto",
          }}
        >
          {airports.length > 0 ? (
            airports.map((airport) => (
              <div
                key={airport._id}
                className="p-2 border-bottom airport-item"
                style={{ cursor: "pointer" }}
                onClick={() => handleSelect(airport)}
              >
                <div className="fw-bold">
                  {airport.city} ({airport.airport_code})
                </div>
                <div className="text-muted small">
                  {airport.airport_name}, {airport.country}
                </div>
              </div>
            ))
          ) : (
            <div className="p-2 text-muted">No airports found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AirportAutocomplete;
