
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const { readUsers, writeUsers } = require("../dataStore");

const router = express.Router();

function makeToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

router.post("/register", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must contain at least 2 characters."
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters."
      });
    }

    const users = readUsers();

    if (users.some(user => user.email === email)) {
      return res.status(409).json({
        success: false,
        message: "This email already has an account. Try logging in."
      });
    }

    const user = {
      id: randomUUID(),
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12)
    };

    users.push(user);
    writeUsers(users);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token: makeToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const users = readUsers();
    const user = users.find(item => item.email === email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({
        success: false,
        message: "Email or password isn't correct. Please try again."
      });
    }

    return res.json({
      success: true,
      message: "Login successful.",
      token: makeToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : "";

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = readUsers().find(item => item.id === payload.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found."
      });
    }

    return res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    if (error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token."
      });
    }
    next(error);
  }
});

module.exports = router;