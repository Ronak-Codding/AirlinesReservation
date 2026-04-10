import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Plane,
  Calendar,
  Users,
  Download,
  Home,
  MapPin,
  Ticket,
} from "lucide-react";

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const bookingId = searchParams.get("bookingId");
  const price = parseFloat(searchParams.get("price") || "0");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const flight = searchParams.get("flight");
  const date = searchParams.get("date");
  const seatsParam = searchParams.get("seats") || "";

  const [booking, setBooking] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchAndConfirm() {
      try {
        if (!bookingId) return;

        // Step 1: Booking fetch karo
        const res = await fetch(
          `http://localhost:5000/api/booking/${bookingId}`,
        );
        const data = await res.json();
        if (res.ok) setBooking(data);

        // Step 2: Agar booking pending hai toh confirm karo
        if (data.status === "pending") {
          await fetch(
            `http://localhost:5000/api/booking/confirm-payment/${bookingId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                transactionId: data.transactionId || "",
                paymentMethod: data.paymentMethod || "card",
              }),
            },
          );

          // Step 3: Updated booking fetch
          const updated = await fetch(
            `http://localhost:5000/api/booking/${bookingId}`,
          );
          const updatedData = await updated.json();
          if (updated.ok) setBooking(updatedData);
        }
      } catch (err) {
        console.error("Booking fetch/confirm error:", err);
      }
    }
    fetchAndConfirm();
  }, [bookingId]);

  // ── Download Boarding Pass PDF ──
  const downloadBoardingPass = async () => {
    if (!bookingId) return;

    // Booking data load
    if (!booking?.passengers?.length) {
      alert("Booking data load.");
      return;
    }

    setDownloading(true);
    try {
      for (const passenger of booking.passengers) {
        const res = await fetch(
          `http://localhost:5000/api/booking/${bookingId}/boarding-pass/${passenger._id}`,
        );
        if (!res.ok) throw new Error("PDF generation failed");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `boarding-pass-${flight}-${passenger.fullName || "passenger"}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Download error:", err);
      alert("Boarding pass download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const displaySeats =
    booking?.seats?.filter(Boolean).length > 0
      ? booking.seats.filter(Boolean).join(", ")
      : seatsParam || "—";

  const passengersCount = booking?.passengers?.length || 1;
  const firstPassenger = booking?.passengers?.[0] || null;

  const shortId = bookingId
    ? "BK" + bookingId.slice(-6).toUpperCase()
    : "BK" + Math.random().toString(36).slice(2, 8).toUpperCase();

  return (
    <>
      {/* ── Print Styles ── */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-ticket, #printable-ticket * { visibility: visible; }
          #printable-ticket {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            padding: 24px !important;
            margin: 0 !important;
            background: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-ticket .ticket-card {
            background: #1e293b !important;
            border: 1px solid rgba(255,255,255,0.08) !important;
            box-shadow: none !important;
            border-radius: 16px !important;
            overflow: hidden !important;
          }
          #printable-ticket .ticket-topbar {
            background: #f59e0b !important;
            height: 8px !important;
          }
          #printable-ticket .text-primary { color: #f59e0b !important; }
          #printable-ticket .text-foreground { color: #f1f5f9 !important; }
          #printable-ticket .text-muted-foreground { color: #94a3b8 !important; }
          #printable-ticket .text-emerald-500 { color: #10b981 !important; }
          #printable-ticket .bg-emerald-500\\/10 { background: rgba(16,185,129,0.15) !important; }
          #printable-ticket .border-emerald-500\\/30 { border-color: rgba(16,185,129,0.3) !important; }
          #printable-ticket .bg-primary\\/10 { background: rgba(245,158,11,0.15) !important; }
          #printable-ticket .border-border\\/30,
          #printable-ticket .border-border\\/50,
          #printable-ticket .border-border { border-color: rgba(255,255,255,0.1) !important; }
          #printable-ticket .notch { background: #0f172a !important; }
          #printable-ticket .text-primary svg { color: #f59e0b !important; }
          #print-actions { display: none !important; }
          #success-banner { display: none !important; }
          #printable-ticket .grid { display: grid !important; }
          #printable-ticket .passenger-section { display: block !important; }
          #printable-ticket { page-break-inside: avoid; }
        }
      `}</style>

      <div className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-2xl">
          {/* ── Success Banner ── */}
          <div
            id="success-banner"
            className="mb-8 flex flex-col items-center text-center"
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Booking Confirmed!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Your ticket has been booked successfully. Have a great flight!
            </p>
          </div>

          {/* ── Ticket Card ── */}
          <div
            id="printable-ticket"
            className="relative mb-6 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-2xl backdrop-blur-xl ticket-card"
          >
            {/* Top colored bar */}
            <div className="h-2 w-full bg-primary ticket-topbar" />

            {/* Ticket Header */}
            <div className="flex items-center justify-between border-b border-border/30 p-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Booking ID
                </p>
                <p className="font-mono text-xl font-bold text-primary">
                  {shortId}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-emerald-500">
                  Confirmed
                </span>
              </div>
            </div>

            {/* Flight Info */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-4xl font-bold text-foreground">{from}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Origin</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-px w-16 bg-border" />
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Plane className="h-5 w-5 text-primary" />
                    </div>
                    <div className="h-px w-16 bg-border" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {flight}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-foreground">{to}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Destination
                  </p>
                </div>
              </div>
            </div>

            {/* Dashed Divider */}
            <div className="relative flex items-center px-6">
              <div className="notch absolute -left-4 h-8 w-8 rounded-full bg-background" />
              <div className="w-full border-t-2 border-dashed border-border/50" />
              <div className="notch absolute -right-4 h-8 w-8 rounded-full bg-background" />
            </div>

            {/* Ticket Details */}
            <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
              <div>
                <p className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Calendar className="h-3 w-3" /> Date
                </p>
                <p className="font-semibold text-foreground">
                  {booking?.date || date || "—"}
                </p>
              </div>
              <div>
                <p className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Users className="h-3 w-3" /> Passengers
                </p>
                <p className="font-semibold text-foreground">
                  {passengersCount} Adult(s)
                </p>
              </div>
              <div>
                <p className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Ticket className="h-3 w-3" /> Seat(s)
                </p>
                <p className="font-semibold text-foreground">{displaySeats}</p>
              </div>
              <div>
                <p className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <MapPin className="h-3 w-3" /> Class
                </p>
                <p className="font-semibold text-foreground">Economy</p>
              </div>
            </div>

            {/* Dashed Divider */}
            <div className="relative flex items-center px-6">
              <div className="notch absolute -left-4 h-8 w-8 rounded-full bg-background" />
              <div className="w-full border-t-2 border-dashed border-border/50" />
              <div className="notch absolute -right-4 h-8 w-8 rounded-full bg-background" />
            </div>

            {/* Passenger Info */}
            {firstPassenger && (
              <div className="passenger-section p-6 border-b border-border/30">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Passenger Info
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name: </span>
                    <span className="font-medium text-foreground">
                      {firstPassenger.fullName || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Passport: </span>
                    <span className="font-medium text-foreground">
                      {firstPassenger.passportNumber || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    <span className="font-medium text-foreground">
                      {firstPassenger.email || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone: </span>
                    <span className="font-medium text-foreground">
                      {firstPassenger.phone || "—"}
                    </span>
                  </div>
                  {firstPassenger.seat && (
                    <div>
                      <span className="text-muted-foreground">Seat: </span>
                      <span className="font-medium text-foreground">
                        {firstPassenger.seat}
                      </span>
                    </div>
                  )}
                  {booking?.passengers?.length > 1 && (
                    <div>
                      <span className="text-muted-foreground">
                        Total Passengers:{" "}
                      </span>
                      <span className="font-medium text-foreground">
                        {booking.passengers.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between p-6">
              <p className="text-muted-foreground">Total Amount Paid</p>
              <p className="text-2xl font-bold text-primary">
                ₹{price.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div id="print-actions" className="flex gap-4">
            <button
              onClick={downloadBoardingPass}
              disabled={downloading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid currentColor",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Boarding Pass
                </>
              )}
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </button>
          </div>

          {/* Spin animation */}
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      </div>
    </>
  );
}
