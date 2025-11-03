const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//
// ✅ REGISTER USER
//
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // ✅ Do NOT hash password here — model hook will handle it
    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: "✅ User registered successfully!" });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

//
// ✅ LOGIN USER
//
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // ✅ Compare plain password with hashed one
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "✅ Login successful!",
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error("❌ Error during login:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Profile route
router.get("/profile", async (req, res) => {
  try {
    const { email, id } = req.query;
    let user;

    if (id) {
      user = await User.findById(id).select("-password");
    } else if (email) {
      user = await User.findOne({ email }).select("-password");
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});





module.exports = router;
