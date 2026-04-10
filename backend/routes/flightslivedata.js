const express = require("express");
const axios = require("axios");
const router = express.Router();

// ── Amadeus Token ──
async function getAmadeusToken() {
  const response = await axios.post(
    "https://test.api.amadeus.com/v1/security/oauth2/token",
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_CLIENT_ID,
      client_secret: process.env.AMADEUS_CLIENT_SECRET,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 8000,
    },
  );
  return response.data.access_token;
}

// ── Mock Flights Generator ──
function generateMockFlights(from, to, date, passengers) {
  const airlines = [
    { code: "AI", name: "Air India" },
    { code: "6E", name: "IndiGo" },
    { code: "SG", name: "SpiceJet" },
    { code: "UK", name: "Vistara" },
    { code: "G8", name: "Go First" },
    { code: "IX", name: "Air Asia India" },
  ];

  const pax = parseInt(passengers || 1);

  const data = airlines.map((airline, i) => {
    const depHour = (6 + i * 2) % 24;
    const arrHour = (depHour + 1 + i) % 24;
    const depMin = (i * 15) % 60;
    const arrMin = (i * 20) % 60;
    const basePrice = (3500 + i * 1200) * pax;

    return {
      id: `MOCK-${airline.code}-${i}`,
      itineraries: [
        {
          duration: `PT${1 + i}H${depMin === 0 ? "00" : depMin}M`,
          segments: [
            {
              departure: {
                iataCode: from,
                terminal: `${(i % 3) + 1}`,
                at: `${date}T${depHour.toString().padStart(2, "0")}:${depMin.toString().padStart(2, "0")}:00`,
              },
              arrival: {
                iataCode: to,
                terminal: `${((i + 1) % 3) + 1}`,
                at: `${date}T${arrHour.toString().padStart(2, "0")}:${arrMin.toString().padStart(2, "0")}:00`,
              },
              carrierCode: airline.code,
              number: `${101 + i * 111}`,
              aircraft: { code: i % 2 === 0 ? "320" : "737" },
              numberOfStops: 0,
            },
          ],
        },
      ],
      price: {
        currency: "INR",
        base: `${Math.round(basePrice * 0.85)}.00`,
        total: `${basePrice}.00`,
        grandTotal: `${basePrice}.00`,
      },
      pricingOptions: { fareType: ["PUBLISHED"] },
      numberOfBookableSeats: 9 - i,
      validatingAirlineCodes: [airline.code],
      travelerPricings: [
        {
          travelerId: "1",
          fareOption: "STANDARD",
          travelerType: "ADULT",
          price: {
            currency: "INR",
            total: `${Math.round(basePrice / pax)}.00`,
          },
        },
      ],
    };
  });

  return { data, meta: { count: data.length }, isMock: true };
}

// ── Flight Search Route ──
router.get("/search", async (req, res) => {
  let { from, to, date, passengers } = req.query;

  if (!from || !to || !date || !passengers) {
    return res.status(400).json({ error: "Sabhi fields required hain" });
  }

  //  Date format fix: DD-MM-YYYY → YYYY-MM-DD
  if (date && date.includes("-")) {
    const parts = date.split("-");
    if (parts[0].length === 2) {
      date = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  console.log("✈️ Flight Search:", { from, to, date, passengers });

  try {
    const token = await getAmadeusToken();

    const response = await axios.get(
      "https://test.api.amadeus.com/v2/shopping/flight-offers",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          originLocationCode: from,
          destinationLocationCode: to,
          departureDate: date,
          adults: passengers,
          max: 10,
          currencyCode: "INR",
        },
        timeout: 10000, // 10 second timeout
      },
    );

    console.log("Amadeus response received");
    res.json(response.data);
  } catch (error) {
    const errMsg = error.response?.data || error.message || error.code;
    console.error("❌ Amadeus Error:", errMsg);

    //  Timeout ya network error pe mock data bhejo
    if (
      error.code === "ETIMEDOUT" ||
      error.code === "ECONNABORTED" ||
      error.code === "ECONNRESET" ||
      error.message?.includes("timeout") ||
      error.message?.includes("ETIMEDOUT")
    ) {
      console.log("Amadeus timeout - Mock data se response de raha hoon");
      return res.json(generateMockFlights(from, to, date, passengers));
    }

    // Amadeus API error (wrong credentials, etc.)
    if (error.response?.status === 401) {
      console.log("Amadeus auth failed - Mock data use kar raha hoon");
      return res.json(generateMockFlights(from, to, date, passengers));
    }

    // Koi bhi doosra error pe bhi mock data bhejo
    console.log(" Amadeus failed - Fallback mock data");
    return res.json(generateMockFlights(from, to, date, passengers));
  }
});

module.exports = router;
