const express = require("express");
const router = express.Router();
const Airport = require("../models/airports.model");

// Get all airports
router.get("/allAirports", async (req, res) => {
  try {
    const airports = await Airport.find().sort({ createdAt: -1 });
    res.json(airports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get signle airports
router.get("/oneAirport/:id", async (req, res) => {
  try {
    const airport = await Airport.findById(req.params.id);
    if (!airport) {
      return res.status(404).json({ message: "Airport not found" });
    }
    res.json(airport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Update airport
router.put("/updateAirport/:id", async (req, res) => {
  try {
    const airport = await Airport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(airport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete airport
router.delete("/deleteAirport/:id", async (req, res) => {
  try {
    await Airport.findByIdAndDelete(req.params.id);
    res.json({ message: "Airport deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create airport
router.post("/", async (req, res) => {
  try {
    const airport = new Airport(req.body);
    await airport.save();
    res.status(201).json(airport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update status
router.patch("/:id/status", async (req, res) => {
  try {
    const airport = await Airport.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    res.json(airport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all airports with pagination + search
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const query = {
      $or: [
        { airport_name: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
        { airport_code: { $regex: search, $options: "i" } },
      ],
    };

    const total = await Airport.countDocuments(query);

    const airports = await Airport.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: airports,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  Public Airport Search (For From/To field)
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.json([]);
    }

    const airports = await Airport.find({
      status: "Publish", // only published airports
      $or: [
        { airport_name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
        { country: { $regex: query, $options: "i" } },
        { airport_code: { $regex: query.toUpperCase(), $options: "i" } },
      ],
    })
      .select("airport_name city country airport_code")
      .limit(10);

    res.json(airports);
  } catch (error) {
    console.error("Airport search error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
