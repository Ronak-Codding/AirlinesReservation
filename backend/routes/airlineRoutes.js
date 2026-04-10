
const express = require("express");
const router = express.Router();
const {
  createAirline,
  getAirlines,
  updateAirline,
  deleteAirline,
  getAirlineById,
} = require("../controllers/airlineController");

router.post("/", createAirline);
router.get("/allAirlines", getAirlines);
router.get("/oneairline/:id", getAirlineById);
router.put("/updateAirline/:id", updateAirline);
router.delete("/deleteAirline/:id", deleteAirline);

module.exports = router;
