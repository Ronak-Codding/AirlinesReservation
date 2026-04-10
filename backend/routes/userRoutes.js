const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const router = express.Router();

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ================= FORGOT PASSWORD (OTP) ================= */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "This account is blocked. Please contact admin.",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Show OTP in terminal (for testing)
    console.log("🔐 OTP for", email, "is:", otp);

    // Save OTP to user
    user.resetPasswordToken = otp;
    user.resetPasswordExpiry = otpExpiry;
    await user.save();

    const mailOptions = {
      from: `"SkyJet Airlines" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "SkyJet – Your Password Reset OTP",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SkyJet OTP</title>
</head>
<body style="margin:0;padding:0;background:#060d1a;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#060d1a;padding:40px 16px;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;background:#0c1526;border-radius:20px;
                 border:1px solid rgba(212,175,55,0.18);
                 box-shadow:0 32px 80px rgba(0,0,0,0.6);">

          <!-- Gold top line -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,transparent,#d4af37,transparent);border-radius:20px 20px 0 0;"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 48px;">

              <h2 style="color:#f0e8d0;font-size:22px;font-weight:700;margin:0 0 10px;">
                Reset Your Password
              </h2>
              <p style="color:#4a6080;font-size:14px;line-height:1.7;margin:0 0 24px;">
                Hello <strong style="color:#c9b97a;">${user.firstName || "Valued Passenger"}</strong>,<br/>
                We received a request to reset your SkyJet account password.
                Use the one-time passcode below to proceed. Do not share this code with anyone.
              </p>

              <!-- OTP Box — blue dashed border (same as image) -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 28px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;
                                border:2px dashed #3b82f6;
                                border-radius:14px;
                                padding:22px 48px;
                                background:#0a1020;
                                text-align:center;">

                      <p style="margin:0 0 10px;font-size:11px;
                                color:rgba(99,155,255,0.7);
                                letter-spacing:2px;text-transform:uppercase;">
                        Your OTP Code
                      </p>

                      <span style="font-size:46px;font-weight:900;letter-spacing:12px;
                                   color:#818cf8;font-family:'Courier New',monospace;
                                   text-shadow:0 0 20px rgba(99,102,241,0.45);">
                        ${otp}
                      </span>

                      <p style="margin:14px 0 0;font-size:12px;
                                color:#ef4444;letter-spacing:0.3px;">
                        ⏱&nbsp; Expires in <strong>10 minutes</strong>
                      </p>

                    </div>
                  </td>
                </tr>
              </table>

              <p style="color:#4a6080;font-size:13px;margin:0;">
                If you didn't request this, please ignore this email. Your account remains secure.
              </p>

            </td>
          </tr>

          <!-- Gold bottom line -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent);border-radius:0 0 20px 20px;"></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email address",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

/* ================= VERIFY OTP ================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      email: user.email,
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= RESET PASSWORD (OTP-based) ================= */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Find user with valid OTP
    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "This account is blocked. Please contact admin.",
      });
    }

    // Hash new password and clear OTP
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

/* ================= GET ALL USERS ================= */
router.get("/allUsers", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET SINGLE USER ================= */
router.get("/oneUser/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= UPDATE USER ================= */
router.put("/updateUser/:id", async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      username,
      phone,
      role,
      status,
      password,
    } = req.body;

    if (
      !firstName &&
      !middleName &&
      !lastName &&
      !username &&
      !phone &&
      !role &&
      !status &&
      !password
    ) {
      return res
        .status(400)
        .json({ success: false, message: "No fields provided for update" });
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (middleName) updateData.middleName = middleName;
    if (lastName) updateData.lastName = lastName;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (phone) updateData.phone = phone;

    if (username) {
      const existing = await User.findOne({
        username,
        _id: { $ne: req.params.id },
      });
      if (existing)
        return res
          .status(400)
          .json({ success: false, message: "Username already taken" });
      updateData.username = username;
    }

    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res
      .status(200)
      .json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= DELETE USER ================= */
router.delete("/deleteUser/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= REGISTER USER ================= */
router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      username,
      email,
      phone,
      password,
    } = req.body;

    if (!firstName || !lastName || !username || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    if (await User.findOne({ email })) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    if (await User.findOne({ username })) {
      return res
        .status(400)
        .json({ success: false, message: "Username already taken" });
    }

    const newUser = new User({
      firstName,
      middleName,
      lastName,
      username,
      email,
      phone,
      password: await bcrypt.hash(password, 10),
      role: "user",
      status: "active",
    });

    await newUser.save();
    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= LOGIN USER ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    if (user.role !== "user")
      return res.status(403).json({ success: false, message: "Access denied" });
    if (user.status === "blocked")
      return res
        .status(403)
        .json({ success: false, message: "User is blocked by admin" });

    if (!(await bcrypt.compare(password, user.password))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ success: false, message: "Server configuration error" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullname: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= ADD USER (ADMIN) ================= */
router.post("/", async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      username,
      email,
      phone,
      password,
      role,
      status,
    } = req.body;

    if (!firstName || !lastName || !username || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already exists" });
    if (await User.findOne({ username }))
      return res.status(400).json({ message: "Username already exists" });

    const user = new User({
      firstName,
      middleName,
      lastName,
      username,
      email,
      phone,
      password: await bcrypt.hash(password, 10),
      role: role || "user",
      status: status || "active",
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error("ADD USER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ================= CHANGE PASSWORD ================= */
router.put("/changePassword/:id", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both old and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
