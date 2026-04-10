import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Globe,
  ChevronRight,
  Plane,
  Receipt,
} from "lucide-react";

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

// ── GST Helper ──
const GST_RATE = 0.18;
function calcGST(baseAmount) {
  const base = parseFloat(baseAmount) || 0;
  const gst = base * GST_RATE;
  const cgst = gst / 2;
  const sgst = gst / 2;
  const total = base + gst;
  return { base, gst, cgst, sgst, total };
}
function fmt(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

// ══════════════════════════════════════════════════════════
// PassengerForm
// ══════════════════════════════════════════════════════════
function PassengerForm({ index, data, onChange, seat }) {
  const handleChange = (field, value) => {
    onChange(index, { ...data, [field]: value });
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card/80 p-6 backdrop-blur-xl shadow-md">
      <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-foreground">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {index + 1}
        </div>
        Passenger {index + 1}
        {seat && (
          <span className="ml-auto text-xs font-medium text-muted-foreground bg-secondary/60 px-2 py-1 rounded-lg">
            Seat: {seat}
          </span>
        )}
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Full Name */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="As on passport"
              value={data.fullName || ""}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary/50 py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Gender
          </label>
          <select
            value={data.gender || ""}
            onChange={(e) => handleChange("gender", e.target.value)}
            className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Date of Birth
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="date"
              value={data.dob ? data.dob.split("T")[0] : ""}
              onChange={(e) => handleChange("dob", e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary/50 py-3 pl-10 pr-4 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Nationality */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Nationality
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={data.nationality || ""}
              onChange={(e) => handleChange("nationality", e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary/50 py-3 pl-10 pr-4 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select Country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Passport Number */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Passport Number
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="e.g. A1234567"
              value={data.passportNumber || ""}
              onChange={(e) =>
                handleChange("passportNumber", e.target.value.toUpperCase())
              }
              className="w-full rounded-xl border border-border bg-secondary/50 py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Passport Expiry */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Passport Expiry
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="date"
              value={
                data.passportExpiry ? data.passportExpiry.split("T")[0] : ""
              }
              onChange={(e) => handleChange("passportExpiry", e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary/50 py-3 pl-10 pr-4 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Email — only first passenger */}
        {index === 0 && (
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="ticket@email.com"
                value={data.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/50 py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        {/* Phone — only first passenger */}
        {index === 0 && (
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={data.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/50 py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// GST Breakdown Card
// ══════════════════════════════════════════════════════════
function GSTBreakdownCard({ basePrice }) {
  const { base, cgst, sgst, gst, total } = calcGST(basePrice);

  return (
    <div className="rounded-2xl border border-border/50 bg-card/80 p-5 backdrop-blur-xl shadow-md">
      <div className="mb-4 flex items-center gap-2">
        <Receipt className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Price Breakdown
        </h3>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Base Fare</span>
          <span className="font-medium text-foreground">{fmt(base)}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>CGST (9%)</span>
          <span className="font-medium text-foreground">{fmt(cgst)}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>SGST (9%)</span>
          <span className="font-medium text-foreground">{fmt(sgst)}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground/70 pb-1">
          <span>Total GST (18%)</span>
          <span>{fmt(gst)}</span>
        </div>
        <div className="border-t border-border/60 my-1" />
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">
            Total Payable{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (incl. GST)
            </span>
          </span>
          <span className="text-lg font-bold text-primary">{fmt(total)}</span>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 text-xs text-yellow-600 dark:text-yellow-400">
        🧾 GST of 18% (CGST 9% + SGST 9%) is applicable on base fare as per
        Govt. regulations.
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════════
export default function PassengerDetails() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const flight = searchParams.get("flight");
  const seats = searchParams.get("seats")?.split(",").filter(Boolean) || [];
  const price = searchParams.get("price");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const passengers = parseInt(searchParams.get("passengers") || "1");
  const date = searchParams.get("date") || "";

  // ── Pending booking ke liye existing bookingId ──
  const existingBookingId = searchParams.get("bookingId") || null;

  const { base, gst, total } = calcGST(price);

  const [forms, setForms] = useState(
    Array.from({ length: passengers }, (_, i) => ({
      seat: seats[i] || "",
    })),
  );
  const [loading, setLoading] = useState(false);
  const [prefilling, setPrefilling] = useState(false);
  const [error, setError] = useState(null);

  // ── Agar existingBookingId hai → existing passengers fetch karo ──
  useEffect(() => {
    if (!existingBookingId) return;

    const fetchExistingPassengers = async () => {
      setPrefilling(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/passenger/onepassenger/${existingBookingId}`,
        );
        if (!res.ok) throw new Error("Passengers fetch failed");
        const data = await res.json();

        if (data?.length) {
          setForms(
            data.map((p, i) => ({
              fullName: p.fullName || "",
              gender: p.gender || "",
              dob: p.dob || "",
              nationality: p.nationality || "",
              passportNumber: p.passportNumber || "",
              passportExpiry: p.passportExpiry || "",
              email: i === 0 ? p.email || "" : "",
              phone: i === 0 ? p.phone || "" : "",
              seat: p.seat || seats[i] || "",
            })),
          );
        }
      } catch (err) {
        console.error("Existing passenger fetch failed:", err);
        // Silent fail — user manually fill karega
      } finally {
        setPrefilling(false);
      }
    };

    fetchExistingPassengers();
  }, [existingBookingId]);

  const handleChange = (index, data) => {
    setForms((prev) => prev.map((f, i) => (i === index ? data : f)));
  };

  const validate = () => {
    for (let i = 0; i < forms.length; i++) {
      const f = forms[i];
      if (
        !f.fullName ||
        !f.gender ||
        !f.dob ||
        !f.nationality ||
        !f.passportNumber ||
        !f.passportExpiry
      ) {
        return `Passenger ${i + 1} Details incomplete`;
      }
      if (i === 0 && (!f.email || !f.phone)) {
        return "Contact details (email & phone) required for first passenger";
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    setError(null);

    try {
      let finalBookingId = existingBookingId;

      if (!existingBookingId) {
        // ── Naya booking: pehle booking save karo ──
        const bookingRes = await fetch("http://localhost:5000/api/booking/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            flightNumber: flight,
            from,
            to,
            date,
            seats: forms.map((f) => f.seat || ""),
            totalPrice: total,
            passengers: forms,
          }),
        });

        const bookingData = await bookingRes.json();
        if (!bookingRes.ok)
          throw new Error(bookingData.error || "Booking save failed");

        finalBookingId = bookingData.bookingId;
      }

      // ── PayU initiate (existing ya naya dono ke liye) ──
      const payuRes = await fetch(
        "http://localhost:5000/api/payment/payu-initiate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: price,
            name: forms[0].fullName,
            email: forms[0].email,
            phone: forms[0].phone,
            bookingId: finalBookingId,
            from,
            to,
            flight,
            date,
            seats: forms
              .map((f) => f.seat)
              .filter(Boolean)
              .join(","),
          }),
        },
      );

      const payuData = await payuRes.json();
      if (!payuData.success) throw new Error("PayU initiate failed");

      // ── Hidden form → PayU submit ──
      const form = document.createElement("form");
      form.method = "POST";
      form.action = payuData.payuUrl;
      form.style.display = "none";

      Object.entries(payuData.payuData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value ?? "";
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* ── Header ── */}
        <div className="mb-8 flex items-center gap-3 flex-wrap">
          <Plane className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Passenger Details
          </h1>
          <span className="text-sm text-muted-foreground">
            {from} → {to}
            {seats.length > 0 && ` · Seats: ${seats.join(", ")}`}
            {date && ` · ${date}`}
          </span>
          {/* Pending booking badge */}
          {existingBookingId && (
            <span className="ml-auto text-xs font-semibold bg-yellow-500/15 text-yellow-600 border border-yellow-500/30 px-3 py-1 rounded-full">
              ⏳ Completing Pending Payment
            </span>
          )}
        </div>

        {/* ── Prefilling loader ── */}
        {prefilling ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            Loading your passenger details...
          </div>
        ) : (
          <>
            {/* ── Passenger Forms ── */}
            <div className="flex flex-col gap-6">
              {forms.map((data, index) => (
                <PassengerForm
                  key={index}
                  index={index}
                  data={data}
                  onChange={handleChange}
                  seat={seats[index] || data.seat || ""}
                />
              ))}
            </div>

            {/* ── GST Breakdown Card ── */}
            <div className="mt-6">
              <GSTBreakdownCard basePrice={price} />
            </div>

            {/* ── Error ── */}
            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* ── Bottom Bar ── */}
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-border/50 bg-card/80 p-4 backdrop-blur-xl">
              <div>
                <p className="text-xs text-muted-foreground">
                  Base {fmt(base)} + GST {fmt(gst)}
                </p>
                <p className="text-xl font-bold text-primary">
                  {fmt(total)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    incl. GST
                  </span>
                </p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-all"
              >
                {loading
                  ? "Processing..."
                  : existingBookingId
                    ? "💳 Pay Now"
                    : "Proceed to Payment"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
