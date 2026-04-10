
const Airline = require("../models/airlines.model");

// CREATE
exports.createAirline = async (req, res) => {
  try {
    const airline = await Airline.create(req.body);
    res.status(201).json(airline);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ
exports.getAirlines = async (req, res) => {
  const airlines = await Airline.find().sort({ createdAt: -1 });
  res.json(airlines);
};

exports.getAirlineById = async (req, res) => {
  const airlines = await Airline.findById(req.params.id);
  if (!airlines) {
    return res.status(404).json({ message: "Airline not found" });
  }
  res.json(airlines);
};

// UPDATE
exports.updateAirline = async (req, res) => {
  try {
    const airline = await Airline.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(airline);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
exports.deleteAirline = async (req, res) => {
  await Airline.findByIdAndDelete(req.params.id);
  res.json({ message: "Airline deleted" });
};


// GET /api/airlines?search=xxx&page=1&limit=10
exports.getAirlines = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const query = {
      $or: [
        { airline_name: { $regex: search, $options: "i" } },
        { airline_code: { $regex: search, $options: "i" } },
      ],
    };

    const total = await Airline.countDocuments(query);

    const airlines = await Airline.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      airlines,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
