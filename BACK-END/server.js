const path = require("path");
const crypto = require("crypto");

// Load .env before importing routes or Supabase
require("dotenv").config({
  path: path.join(__dirname, ".env")
});

const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/authRoutes");
const blogRoutes = require("./src/routes/blogRoutes");

const app = express();

const configuredPort = Number(process.env.PORT);
const PORT = Number.isInteger(configuredPort) &&
  configuredPort >= 1024 && configuredPort <= 65535
  ? configuredPort
  : 5051;
const FRONTEND_DIR = path.join(__dirname, "..", "FRONT-END");

// Request ID middleware
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
});

// Security headers middleware
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || true
}));

app.options("*", cors());

app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "InkSpace API is running",
    storage: "Supabase"
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

// API 404 handler
app.use("/api", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found."
  });
});

// Frontend static files
app.use(express.static(FRONTEND_DIR));

// Frontend fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

// Error handler
app.use((err, req, res, _next) => {
  console.error(err);

  const message = err.code === "PGRST205"
    ? "Supabase tables are missing. Run BACK-END/supabase-schema.sql in Supabase SQL Editor."
    : err.message || "Internal server error";

  const response = {
    success: false,
    message,
    requestId: req.id || res.getHeader("X-Request-Id")
  };

  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  res.status(err.status || 500).json(response);
});

const server = app.listen(PORT, () => {
  console.log(`InkSpace API listening on http://localhost:${PORT}`);
  console.log(`Frontend served from http://localhost:${PORT}`);
});

server.on("error", error => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  }

  console.error("Could not start InkSpace:", error);
  process.exit(1);
});
