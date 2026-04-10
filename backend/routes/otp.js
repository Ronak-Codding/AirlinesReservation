const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

// OTP store (production mein Redis use karo)
const otpStore = {};

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// Send OTP
router.post("/send", async (req, res) => {
  const { email } = req.body;

  console.log("OTP request email:", email); //  add this

  if (!email) return res.status(400).json({ error: "Email required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 min expiry

  console.log("Generated OTP:", otp);

  try {
    await transporter.sendMail({
      from: `"Flight Booking" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Registration",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #d4a853;">Flight Booking</h2>
          <p>Your OTP for registration is:</p>
          <h1 style="letter-spacing: 8px; color: #333;">${otp}</h1>
          <p style="color: #888;">This OTP is valid for <strong>2 minutes</strong>.</p>
          <p style="color: #888; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Verify OTP
router.post("/verify", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ error: "Email and OTP required" });

  const record = otpStore[email];

  if (!record)
    return res.status(400).json({ error: "OTP not found. Please resend." });
  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ error: "OTP expired. Please resend." });
  }
  if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

  delete otpStore[email]; // OTP use ho gaya, delete karo
  res.json({ success: true, message: "OTP verified" });
});

// ==============================
// SEND LOGIN DETAILS EMAIL
// ==============================
router.post("/send-login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    await transporter.sendMail({
      from: `"Flight Booking" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Flight Booking - Login Details",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 420px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          
          <h2 style="color: #d4a853;">Flight Booking</h2>
          <p>Welcome! Your account has been created successfully.</p>

          <div style="background:#f9fafb;padding:15px;border-radius:8px;margin-top:10px;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>

          <p style="margin-top:15px;">You can now login to your account.</p>

          <a href="http://localhost:3000/login"
            style="display:inline-block;margin-top:10px;padding:10px 20px;background:#d4a853;color:white;text-decoration:none;border-radius:6px;">
            Login Now
          </a>

          <p style="color:#888;font-size:12px;margin-top:20px;">
            If you did not create this account, please ignore this email.
          </p>
        </div>
      `,
    });

    res.json({ success: true, message: "Login details email sent" });
  } catch (error) {
    console.error("Login Email error:", error);
    res.status(500).json({ error: "Failed to send login email" });
  }
});

module.exports = router;
