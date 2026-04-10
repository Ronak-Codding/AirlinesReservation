import { useState } from "react";
import { Plane, Users, ArrowRightLeft, Search } from "lucide-react";
import AirportAutocomplete from "../components/AirportAutocomplete";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function BookingForm() {
  const [searchParams] = useSearchParams();
  const [tripType, setTripType] = useState("roundtrip");
  const fromCode = searchParams.get("from");
  const toCode = searchParams.get("to");

  const [departureDate, setDepartureDate] = useState(
    searchParams.get("date") || "",
  );
  const [passengers, setPassengers] = useState(
    searchParams.get("passengers") || "1",
  );
  const [fromAirport, setFromAirport] = useState(
    fromCode ? { airport_code: fromCode, city: fromCode } : null,
  );
  const [toAirport, setToAirport] = useState(
    toCode ? { airport_code: toCode, city: toCode } : null,
  );

  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    const token = localStorage.getItem("usertoken");
    if (!token || token === "undefined" || token === "null") {
      setShowLoginAlert(true);
      return;
    }
    if (!departureDate) {
      alert("Please select departure date");
      return;
    }
    if (fromAirport.airport_code === toAirport.airport_code) {
      alert("From and To airports cannot be same");
      return;
    }
    navigate(
      `/results?from=${fromAirport.airport_code}&to=${toAirport.airport_code}&date=${departureDate}&passengers=${passengers}`,
    );
  };

  return (
    <section id="flight-search" className="relative -mt-32 z-20 px-4 pb-20">
      <div className="mx-auto max-w-6xl">
        {/* FIXED: pure white card with strong border — no more grey wash */}
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{
            background: "rgba(255,255,255,0.97)",
            border: "1px solid #e2e6f0",
            boxShadow:
              "0 20px 60px rgba(13,21,38,0.18), 0 4px 16px rgba(51,102,255,0.08)",
          }}
        >
          {/* Login Alert Modal */}
          {showLoginAlert && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
              style={{ background: "rgba(13,21,38,0.65)" }}
              onClick={() => setShowLoginAlert(false)}
            >
              <div
                className="mx-4 w-full max-w-sm rounded-2xl p-6"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e6f0",
                  boxShadow: "0 24px 60px rgba(13,21,38,0.22)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Icon */}
                <div className="mb-4 flex justify-center">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ background: "#eff4ff" }}
                  >
                    <Plane className="h-7 w-7" style={{ color: "#3366ff" }} />
                  </div>
                </div>

                <h3
                  className="mb-2 text-center text-lg font-bold"
                  style={{ color: "#0d1526" }}
                >
                  Login Required
                </h3>
                <p
                  className="mb-6 text-center text-sm"
                  style={{ color: "#64748b" }}
                >
                  Please login to search and book flights.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLoginAlert(false)}
                    className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all"
                    style={{
                      border: "1px solid #e2e6f0",
                      background: "#f6f8ff",
                      color: "#0d1526",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowLoginAlert(false);
                      navigate("/login");
                    }}
                    className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all"
                    style={{ background: "#3366ff" }}
                  >
                    Login
                  </button>
                </div>

                <p
                  className="mt-3 text-center text-xs"
                  style={{ color: "#64748b" }}
                >
                  New user?{" "}
                  <button
                    onClick={() => {
                      setShowLoginAlert(false);
                      navigate("/register");
                    }}
                    className="underline-offset-2 hover:underline"
                    style={{ color: "#3366ff" }}
                  >
                    Register here
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Trip Type Toggle */}
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setTripType("roundtrip")}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all"
              style={
                tripType === "roundtrip"
                  ? { background: "#3366ff", color: "#ffffff" }
                  : {
                      background: "#f0f4ff",
                      color: "#3366ff",
                      border: "1.5px solid #dde5ff",
                    }
              }
            >
              <ArrowRightLeft className="h-4 w-4" />
              Round Trip
            </button>
            <button
              onClick={() => setTripType("oneway")}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all"
              style={
                tripType === "oneway"
                  ? { background: "#3366ff", color: "#ffffff" }
                  : {
                      background: "#f0f4ff",
                      color: "#3366ff",
                      border: "1.5px solid #dde5ff",
                    }
              }
            >
              <Plane className="h-4 w-4" />
              One Way
            </button>
          </div>

          {/* Search Form */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* From */}
            <div className="group relative">
              <AirportAutocomplete
                label="From"
                icon="fa-plane-departure"
                value={fromAirport}
                onSelect={(airport) => setFromAirport(airport)}
              />
            </div>

            {/* To */}
            <div className="group relative">
              <AirportAutocomplete
                label="To"
                icon="fa-plane-arrival"
                value={toAirport}
                onSelect={(airport) => setToAirport(airport)}
              />
            </div>

            {/* Departure */}
            <div className="group relative">
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#64748b" }}
              >
                Departure
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full rounded-xl px-4 py-4 text-sm outline-none transition-all"
                style={{
                  border: "1.5px solid #e2e6f0",
                  background: "#f8faff",
                  color: "#0d1526",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3366ff";
                  e.target.style.background = "#ffffff";
                  e.target.style.boxShadow = "0 0 0 3px rgba(51,102,255,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e6f0";
                  e.target.style.background = "#f8faff";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Return */}
            <div
              className="group relative"
              style={{ opacity: tripType === "oneway" ? 0.45 : 1 }}
            >
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#64748b" }}
              >
                Return
              </label>
              <input
                type="date"
                disabled={tripType === "oneway"}
                className="w-full rounded-xl px-4 py-4 text-sm outline-none transition-all"
                style={{
                  border: "1.5px solid #e2e6f0",
                  background: "#f8faff",
                  color: "#0d1526",
                  cursor: tripType === "oneway" ? "not-allowed" : "auto",
                }}
                onFocus={(e) => {
                  if (tripType !== "oneway") {
                    e.target.style.borderColor = "#3366ff";
                    e.target.style.background = "#ffffff";
                    e.target.style.boxShadow = "0 0 0 3px rgba(51,102,255,0.1)";
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e6f0";
                  e.target.style.background = "#f8faff";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Passengers */}
            <div className="group relative">
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#64748b" }}
              >
                Passengers
              </label>
              <div className="relative">
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="w-full appearance-none rounded-xl px-4 py-4 pr-10 text-sm outline-none transition-all"
                  style={{
                    border: "1.5px solid #e2e6f0",
                    background: "#f8faff",
                    color: "#0d1526",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3366ff";
                    e.target.style.background = "#ffffff";
                    e.target.style.boxShadow = "0 0 0 3px rgba(51,102,255,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e6f0";
                    e.target.style.background = "#f8faff";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="1">1 Adult</option>
                  <option value="2">2 Adults</option>
                  <option value="3">3 Adults</option>
                  <option value="4">4 Adults</option>
                  <option value="5">5 Adults</option>
                  <option value="6">6 Adults</option>
                </select>
                <Users
                  className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#64748b" }}
                />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="mt-6 flex justify-center md:justify-end">
            <button
              onClick={handleSearch}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all md:w-auto"
              style={{ background: "#3366ff" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1a44cc";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(51,102,255,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#3366ff";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Search className="h-5 w-5" />
              <span>Search Flights</span>
              <div className="absolute inset-0 -translate-x-full bg-white/15 transition-transform group-hover:translate-x-full" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
