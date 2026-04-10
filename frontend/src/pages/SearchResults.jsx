import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FlightCard from "../components/FlightCard";
import { Plane, Loader2 } from "lucide-react";
import BookingForm from "../components/BookingForm";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");
  const passengers = searchParams.get("passengers") || 1;

  useEffect(() => {
    async function fetchFlights() {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/flights/search?from=${from}&to=${to}&date=${date}&passengers=${passengers}`,
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Something went wrong");
        setFlights(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (from && to && date) fetchFlights();
  }, [from, to, date, passengers]);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="pt-24 bg-card/50 border-b border-border/50 shadow-md">
        <BookingForm />
      </div>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Plane className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            {from} → {to}
          </h1>
          <span className="text-muted-foreground text-sm">
            {date} · {passengers} Passenger(s)
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Flights Searching...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400">
            {error}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && flights.length === 0 && (
          <div className="rounded-xl border border-border p-10 text-center text-muted-foreground">
            Flight not Found...
          </div>
        )}

        {/* Flight Cards */}
        <div className="flex flex-col gap-4">
          {flights.map((flight, index) => (
            <FlightCard
              key={index}
              flight={flight}
              date={date}
              passengers={passengers}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
