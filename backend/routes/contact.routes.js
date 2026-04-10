const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

//  CREATE CONTACT MESSAGE
router.post("/", async (req, res) => {
  try {
    const { fullName, email, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL CONTACTS
router.get("/allContact", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/oneContact/:id", async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE CONTACT
router.delete("/deleteContact/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Contact deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// TOGGLE STATUS (New ↔ Read)
router.put("/:id/status", async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    contact.status = contact.status === "new" ? "read" : "new";
    await contact.save();
    res.json(contact);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
