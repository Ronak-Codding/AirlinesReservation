const express = require("express");
const router = express.Router();
const Flight = require("../models/flights.model");
const Airport = require("../models/airports.model");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ── GET All Flights (Admin - paginated) ──
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      admin_status = "all",
    } = req.query;

    const query = {};
    if (status !== "all") query.status = status;
    if (admin_status !== "all") query.admin_status = admin_status;
    if (search) {
      query.$or = [
        { flight_number: { $regex: escapeRegex(search), $options: "i" } },
        { aircraft_type: { $regex: escapeRegex(search), $options: "i" } },
      ];
    }

    const total = await Flight.countDocuments(query);
    const flights = await Flight.find(query)
      .populate("airline", "airline_name airline_code logo")
      .populate("from_airport", "airport_code airport_name city country")
      .populate("to_airport", "airport_code airport_name city country")
      .sort({ departure_time: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      flights,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Flights fetch error:", error);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// ── GET All Flights (no pagination - for frontend cards) ──
router.get("/all", async (req, res) => {
  try {
    const { from, to, date } = req.query;
    const query = { admin_status: "Publish" };

    if (from) {
      const fromAirport = await Airport.findOne({
        airport_code: { $regex: escapeRegex(from), $options: "i" },
      });
      if (fromAirport) query.from_airport = fromAirport._id;
    }

    if (to) {
      const toAirport = await Airport.findOne({
        airport_code: { $regex: escapeRegex(to), $options: "i" },
      });
      if (toAirport) query.to_airport = toAirport._id;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.departure_time = { $gte: startDate, $lte: endDate };
    }

    const flights = await Flight.find(query)
      .populate("airline", "airline_name airline_code logo")
      .populate("from_airport", "airport_code airport_name city country")
      .populate("to_airport", "airport_code airport_name city country")
      .sort({ departure_time: 1 });

    res.json(flights);
  } catch (error) {
    console.error("All flights error:", error);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// ── GET Search Flights (Frontend - DB se) ──
router.get("/search", async (req, res) => {
  try {
    let { from, to, date, passengers } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: "From aur To required hain" });
    }

    // Date format fix: DD-MM-YYYY → YYYY-MM-DD
    if (date && date.includes("-")) {
      const parts = date.split("-");
      if (parts[0].length === 2) {
        date = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    console.log("DB Flight Search:", { from, to, date, passengers });

    const fromAirport = await Airport.findOne({
      airport_code: { $regex: `^${escapeRegex(from)}$`, $options: "i" },
    });

    const toAirport = await Airport.findOne({
      airport_code: { $regex: `^${escapeRegex(to)}$`, $options: "i" },
    });

    if (!fromAirport || !toAirport) {
      console.log("⚠️ Airport not found - using mock data");
      return res.json(
        generateMockFlights(
          from,
          to,
          date || new Date().toISOString().split("T")[0],
          passengers,
        ),
      );
    }

    const query = {
      from_airport: fromAirport._id,
      to_airport: toAirport._id,
      admin_status: "Publish",
      seats_available: { $gte: parseInt(passengers || 1) },
    };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.departure_time = { $gte: startDate, $lte: endDate };
    }

    const dbFlights = await Flight.find(query)
      .populate("airline", "airline_name airline_code logo")
      .populate("from_airport", "airport_code airport_name city country")
      .populate("to_airport", "airport_code airport_name city country")
      .sort({ price: 1 });

    console.log(`Found ${dbFlights.length} flights in DB`);

    const formatted = dbFlights.map((f) => {
      const airlineCode = f.airline?.airline_code || "XX";
      const flightNum = f.flight_number || "";

      // ✅ Fix: number already carrierCode include kare chhe to duplicate avoid karo
      // e.g. airline_code="AI", flight_number="AI360" → carrierCode="AI", number="AI360"
      // FlightCard ma: number.startsWith(carrierCode) → sirf "AI360" show thase
      return {
        id: f._id.toString(),
        flight_number: flightNum,
        airline: f.airline,
        itineraries: [
          {
            duration: `PT${Math.floor(f.duration / 60)}H${f.duration % 60}M`,
            segments: [
              {
                departure: {
                  iataCode: f.from_airport?.airport_code,
                  at: f.departure_time,
                },
                arrival: {
                  iataCode: f.to_airport?.airport_code,
                  at: f.arrival_time,
                },
                carrierCode: airlineCode,
                number: flightNum, // "AI360" — already has carrier prefix
                aircraft: { code: f.aircraft_type },
                numberOfStops: 0,
              },
            ],
          },
        ],
        price: {
          currency: "INR",
          total: `${f.price * parseInt(passengers || 1)}.00`,
          grandTotal: `${f.price * parseInt(passengers || 1)}.00`,
          base: `${Math.round(f.price * 0.85 * parseInt(passengers || 1))}.00`,
        },
        numberOfBookableSeats: f.seats_available,
        validatingAirlineCodes: [airlineCode],
        status: f.status,
        from_airport: f.from_airport,
        to_airport: f.to_airport,
      };
    });

    if (formatted.length === 0) {
      console.log("⚠️ No DB flights - using mock data");
      return res.json(
        generateMockFlights(
          from,
          to,
          date || new Date().toISOString().split("T")[0],
          passengers,
        ),
      );
    }

    res.json({ data: formatted, meta: { count: formatted.length } });
  } catch (error) {
    console.error("Flight search error:", error);
    res.status(500).json({ error: "Flight search failed" });
  }
});

// ── GET Single Flight ──
router.get("/:id", async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate("airline", "airline_name airline_code logo")
      .populate("from_airport", "airport_code airport_name city country")
      .populate("to_airport", "airport_code airport_name city country");
    if (!flight) return res.status(404).json({ error: "Flight not found" });
    res.json(flight);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// ── POST Create Flight ──
router.post("/", async (req, res) => {
  try {
    const flight = new Flight(req.body);
    await flight.save();
    const populated = await Flight.findById(flight._id)
      .populate("airline", "airline_name airline_code")
      .populate("from_airport", "airport_code city")
      .populate("to_airport", "airport_code city");
    res.status(201).json({ success: true, flight: populated });
  } catch (error) {
    console.error("Flight create error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Flight number already exists" });
    }
    res.status(500).json({ error: "Create failed" });
  }
});

// ── PUT Update Flight ──
router.put("/:id", async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("airline", "airline_name airline_code")
      .populate("from_airport", "airport_code city")
      .populate("to_airport", "airport_code city");
    if (!flight) return res.status(404).json({ error: "Flight not found" });
    res.json({ success: true, flight });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// ── DELETE Flight ──
router.delete("/:id", async (req, res) => {
  try {
    await Flight.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ── PATCH Toggle Admin Status ──
router.patch("/:id/toggle-status", async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ error: "Not found" });
    flight.admin_status =
      flight.admin_status === "Publish" ? "Draft" : "Publish";
    await flight.save();
    res.json({ success: true, admin_status: flight.admin_status });
  } catch (error) {
    res.status(500).json({ error: "Toggle failed" });
  }
});

// ── GET Export CSV ──
router.get("/export/csv", async (req, res) => {
  try {
    const flights = await Flight.find()
      .populate("airline", "airline_name")
      .populate("from_airport", "airport_code city")
      .populate("to_airport", "airport_code city");

    const rows = flights.map((f) => ({
      FlightNumber: f.flight_number,
      Airline: f.airline?.airline_name || "",
      From: `${f.from_airport?.airport_code} - ${f.from_airport?.city}`,
      To: `${f.to_airport?.airport_code} - ${f.to_airport?.city}`,
      Departure: new Date(f.departure_time).toLocaleString("en-IN"),
      Arrival: new Date(f.arrival_time).toLocaleString("en-IN"),
      Duration: `${f.duration} mins`,
      Price: f.price,
      SeatsAvailable: f.seats_available,
      TotalSeats: f.total_seats,
      Aircraft: f.aircraft_type,
      Status: f.status,
      AdminStatus: f.admin_status,
    }));

    if (rows.length === 0)
      return res.status(404).json({ error: "No data to export" });

    const headers = Object.keys(rows[0]).join(",");
    const csv = [
      headers,
      ...rows.map((r) =>
        Object.values(r)
          .map((v) => `"${v}"`)
          .join(","),
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=flights.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: "Export failed" });
  }
});

// ── Mock Flights Fallback ──
function generateMockFlights(from, to, date, passengers) {
  const airlines = [
    { code: "AI", name: "Air India" },
    { code: "6E", name: "IndiGo" },
    { code: "SG", name: "SpiceJet" },
    { code: "UK", name: "Vistara" },
    { code: "G8", name: "Go First" },
  ];
  const pax = parseInt(passengers || 1);

  const data = airlines.map((airline, i) => {
    const depHour = (6 + i * 2) % 24;
    const arrHour = (depHour + 1 + i) % 24;
    const depMin = (i * 15) % 60;
    const basePrice = (3500 + i * 1200) * pax;
    const flightNum = `${airline.code}${101 + i * 111}`; // ✅ "AI101", "6E212" — carrier code included

    return {
      id: `MOCK-${airline.code}-${i}`,
      itineraries: [
        {
          duration: `PT${1 + i}H${depMin === 0 ? "00" : depMin}M`,
          segments: [
            {
              departure: {
                iataCode: from,
                at: `${date}T${depHour.toString().padStart(2, "0")}:${depMin.toString().padStart(2, "0")}:00`,
              },
              arrival: {
                iataCode: to,
                at: `${date}T${arrHour.toString().padStart(2, "0")}:00:00`,
              },
              carrierCode: airline.code, // "AI"
              number: flightNum, // ✅ "AI101" — duplicate nahi thase
              aircraft: { code: "320" },
              numberOfStops: 0,
            },
          ],
        },
      ],
      price: {
        currency: "INR",
        total: `${basePrice}.00`,
        grandTotal: `${basePrice}.00`,
      },
      numberOfBookableSeats: 9 - i,
      validatingAirlineCodes: [airline.code],
    };
  });

  return { data, meta: { count: data.length }, isMock: true };
}

module.exports = router;
