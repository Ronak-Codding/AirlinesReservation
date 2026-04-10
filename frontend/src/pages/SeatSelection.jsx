import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plane, ChevronRight } from "lucide-react";

// Seat config per class
const CLASSES = {
  first: {
    label: "First Class",
    rows: [1, 2, 3],
    cols: ["A", "gap", "D"],
    price: 15000,
    color: "bg-amber-500",
    selectedColor: "bg-amber-600",
  },
  business: {
    label: "Business",
    rows: [4, 5, 6, 7, 8, 9],
    cols: ["A", "C", "gap", "D", "F"],
    price: 8000,
    color: "bg-blue-500",
    selectedColor: "bg-blue-600",
  },
  economy: {
    label: "Economy",
    rows: Array.from({ length: 30 }, (_, i) => i + 10),
    cols: ["A", "B", "C", "gap", "D", "E", "F"],
    price: 0,
    color: "bg-emerald-500",
    selectedColor: "bg-emerald-600",
  },
};

// Randomly mark some seats as occupied
function generateOccupied() {
  const occupied = new Set();
  const allRows = [
    ...CLASSES.first.rows,
    ...CLASSES.business.rows,
    ...CLASSES.economy.rows,
  ];
  allRows.forEach((row) => {
    ["A", "B", "C", "D", "E", "F"].forEach((col) => {
      if (Math.random() < 0.3) occupied.add(`${row}${col}`);
    });
  });
  return occupied;
}

const OCCUPIED = generateOccupied();

export default function SeatSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const flight = searchParams.get("flight");
  const price = searchParams.get("price");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const passengers = parseInt(searchParams.get("passengers") || "1");

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [activeClass, setActiveClass] = useState("economy");

  const toggleSeat = (seatId) => {
    if (OCCUPIED.has(seatId)) return;
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) return prev.filter((s) => s !== seatId);
      if (prev.length >= passengers) return [...prev.slice(1), seatId];
      return [...prev, seatId];
    });
  };

  const getSeatClass = (seatId) => {
    if (OCCUPIED.has(seatId)) return "occupied";
    if (selectedSeats.includes(seatId)) return "selected";
    return "available";
  };

  const extraCost = selectedSeats.reduce((acc, seatId) => {
    const row = parseInt(seatId);
    if (CLASSES.first.rows.includes(row)) return acc + CLASSES.first.price;
    if (CLASSES.business.rows.includes(row))
      return acc + CLASSES.business.price;
    return acc;
  }, 0);

  const totalPrice = (parseFloat(price) || 0) + extraCost;

  const handleContinue = () => {
    // /checkout ki jagah /passengers
    navigate(
      `/passengers?flight=${flight}&seats=${selectedSeats.join(",")}&price=${totalPrice}&from=${from}&to=${to}&passengers=${passengers}&date=${searchParams.get("date") || ""}`,
    );
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Plane className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Select Your Seat
          </h1>
          <span className="text-sm text-muted-foreground">
            {from} → {to} · {flight}
          </span>
        </div>

        {/* Class Tabs */}
        <div className="mb-6 flex gap-3">
          {Object.entries(CLASSES).map(([key, cls]) => (
            <button
              key={key}
              onClick={() => setActiveClass(key)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                activeClass === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cls.label}
              {cls.price > 0 && (
                <span className="ml-2 text-xs opacity-70">
                  +₹{cls.price.toLocaleString("en-IN")}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Airplane Layout */}
        <div className="rounded-2xl border border-border/50 bg-card/80 p-6 shadow-xl backdrop-blur-xl">
          {/* Nose */}
          <div className="mb-6 flex justify-center">
            <div className="flex flex-col items-center gap-1">
              <div className="h-16 w-24 rounded-t-full border-2 border-border/50 bg-secondary/30 flex items-end justify-center pb-2">
                <Plane className="h-6 w-6 text-primary rotate-[-90deg]" />
              </div>
              <span className="text-xs text-muted-foreground">Front</span>
            </div>
          </div>

          {/* Column Labels */}
          <div className="mb-2 flex justify-center">
            <div className="flex items-center gap-2">
              {CLASSES[activeClass].cols.map((col, i) =>
                col === "gap" ? (
                  <div key={i} className="w-6" />
                ) : (
                  <div
                    key={i}
                    className="w-9 text-center text-xs font-bold text-muted-foreground"
                  >
                    {col}
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Seats */}
          <div className="flex flex-col items-center gap-1 overflow-y-auto max-h-[50vh] pr-1">
            {CLASSES[activeClass].rows.map((row) => (
              <div key={row} className="flex items-center gap-2">
                {/* Row Number */}
                <span className="w-6 text-right text-xs text-muted-foreground">
                  {row}
                </span>

                {CLASSES[activeClass].cols.map((col, i) =>
                  col === "gap" ? (
                    <div key={i} className="w-6" />
                  ) : (
                    <button
                      key={`${row}${col}`}
                      onClick={() => toggleSeat(`${row}${col}`)}
                      title={`Seat ${row}${col}`}
                      className={`h-9 w-9 rounded-t-lg border text-xs font-semibold transition-all ${
                        getSeatClass(`${row}${col}`) === "occupied"
                          ? "border-border/30 bg-secondary/30 text-muted-foreground/30 cursor-not-allowed"
                          : getSeatClass(`${row}${col}`) === "selected"
                            ? `${CLASSES[activeClass].selectedColor} border-transparent text-white shadow-lg scale-105`
                            : `${CLASSES[activeClass].color}/20 border-border/50 text-foreground hover:${CLASSES[activeClass].color}/50 cursor-pointer`
                      }`}
                    >
                      {getSeatClass(`${row}${col}`) === "occupied"
                        ? "✕"
                        : `${row}${col}`}
                    </button>
                  ),
                )}
              </div>
            ))}
          </div>

          {/* Tail */}
          <div className="mt-6 flex justify-center">
            <div className="h-8 w-32 rounded-b-full border-2 border-border/50 bg-secondary/30" />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex gap-6 justify-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-emerald-500/20 border border-border/50" />
            Available
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-primary" />
            Selected
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-secondary/30 border border-border/30" />
            Occupied
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-border/50 bg-card/80 p-4 backdrop-blur-xl">
          <div>
            <p className="text-sm text-muted-foreground">
              Selected:{" "}
              {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
            </p>
            <p className="text-xl font-bold text-primary">
              ₹{totalPrice.toLocaleString("en-IN")}
            </p>
          </div>
          <button
            onClick={handleContinue}
            disabled={selectedSeats.length === 0}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
          >
            Continue <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
