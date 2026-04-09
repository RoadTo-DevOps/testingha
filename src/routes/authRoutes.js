const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { get, run } = require("../db");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "fullName, email, password are required" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await get("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await run(
      "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'user')",
      [fullName.trim(), normalizedEmail, passwordHash]
    );

    return res.status(201).json({
      id: result.lastID,
      fullName: fullName.trim(),
      email: normalizedEmail,
      role: "user"
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await get(
      "SELECT id, full_name, email, password_hash, role FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
