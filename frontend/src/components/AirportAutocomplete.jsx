import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const css = `
  .ac-wrap { position: relative; }

  .ac-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 10px; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: #64748b;
    margin-bottom: 8px;
    font-family: 'Outfit', sans-serif;
  }
  .ac-label i { color: #3366ff; font-size: 11px; }

  .ac-input-wrap { position: relative; }

  .ac-input {
    width: 100%;
    background: #f8faff;
    border: 1.5px solid #e2e6f0;
    border-radius: 12px;
    padding: 14px 42px 14px 16px;
    color: #0d1526;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    font-weight: 400;
    outline: none;
    transition: border-color .18s, box-shadow .18s, background .18s;
    height: 54px;
  }
  .ac-input::placeholder { color: #94a3b8; }
  .ac-input:focus {
    border-color: #3366ff;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(51,102,255,.1);
  }

  .ac-search-icon {
    position: absolute;
    right: 13px; top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    pointer-events: none;
    display: flex; align-items: center;
  }

  .ac-dropdown {
    position: absolute;
    left: 0; right: 0;
    top: calc(100% + 6px);
    background: #ffffff;
    border: 1px solid #e2e6f0;
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(13,21,38,.13), 0 2px 8px rgba(51,102,255,.07);
    z-index: 1050;
    max-height: 240px;
    overflow-y: auto;
    animation: acDrop .17s cubic-bezier(.16,1,.3,1) both;
  }
  @keyframes acDrop {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ac-dropdown::-webkit-scrollbar { width: 4px; }
  .ac-dropdown::-webkit-scrollbar-track { background: transparent; }
  .ac-dropdown::-webkit-scrollbar-thumb { background: #dde5ff; border-radius: 4px; }

  .ac-item {
    padding: 11px 16px;
    cursor: pointer;
    border-bottom: 1px solid #f1f5f9;
    transition: background .12s;
  }
  .ac-item:last-child { border-bottom: none; border-radius: 0 0 14px 14px; }
  .ac-item:first-child { border-radius: 14px 14px 0 0; }
  .ac-item:only-child  { border-radius: 14px; }
  .ac-item:hover { background: #eff4ff; }

  .ac-item-main {
    font-size: 14px; font-weight: 600;
    color: #0d1526;
    font-family: 'Outfit', sans-serif;
    display: flex; align-items: center; gap: 7px;
  }
  .ac-item-code {
    background: #eff4ff;
    color: #3366ff;
    font-size: 11px; font-weight: 700;
    padding: 1px 7px; border-radius: 6px;
    letter-spacing: 0.05em;
  }
  .ac-item-sub {
    font-size: 12px; color: #64748b;
    font-family: 'Outfit', sans-serif;
    margin-top: 2px;
  }

  .ac-empty {
    padding: 16px; text-align: center;
    font-size: 13px; color: #94a3b8;
    font-family: 'Outfit', sans-serif;
  }
`;

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.trim().length >= 2) fetchAirports(search);
      else {
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
    } catch {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    if (value) setSearch(`${value.city} (${value.airport_code})`);
    else setSearch("");
  }, [value]);

  const handleSelect = (airport) => {
    setSearch(`${airport.city} (${airport.airport_code})`);
    setShowDropdown(false);
    onSelect(airport);
  };

  return (
    <>
      <style>{css}</style>
      <div className="ac-wrap" ref={wrapperRef}>
        <label className="ac-label">
          {icon && <i className={`fas ${icon}`} />}
          {label}
        </label>

        <div className="ac-input-wrap">
          <input
            type="text"
            className="ac-input"
            placeholder="Search airport"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => airports.length > 0 && setShowDropdown(true)}
            required={required}
          />
          <span className="ac-search-icon">
            <SearchIcon />
          </span>
        </div>

        {showDropdown && (
          <div className="ac-dropdown">
            {airports.length > 0 ? (
              airports.map((airport) => (
                <div
                  key={airport._id}
                  className="ac-item"
                  onClick={() => handleSelect(airport)}
                >
                  <div className="ac-item-main">
                    {airport.city}
                    <span className="ac-item-code">{airport.airport_code}</span>
                  </div>
                  <div className="ac-item-sub">
                    {airport.airport_name}, {airport.country}
                  </div>
                </div>
              ))
            ) : (
              <div className="ac-empty">No airports found</div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AirportAutocomplete;
