
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const {
  findUserByEmail,
  findUserById,
  createUser
} = require("../dataStore");

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
    const body = req.body && typeof req.body === "object" && !Array.isArray(req.body)
      ? req.body
      : {};
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Name must contain between 2 and 80 characters."
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

    if (await findUserByEmail(email)) {
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

    await createUser(user);

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
    const body = req.body && typeof req.body === "object" && !Array.isArray(req.body)
      ? req.body
      : {};
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const user = await findUserByEmail(email);

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

router.get("/me", async (req, res, next) => {
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
    const user = await findUserById(payload.userId);

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