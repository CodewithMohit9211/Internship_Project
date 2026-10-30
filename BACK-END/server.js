const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/authRoutes");
const blogRoutes = require("./src/routes/blogRoutes");

const app = express();
const PORT = process.env.PORT || 5050;
const FRONTEND_DIR = path.join(__dirname, "..", "FRONT-END");

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "InkSpace API is running",
    storage: "JSON file"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found."
  });
});

app.use(express.static(FRONTEND_DIR));

app.get("*", (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.status ? err.message : "Internal server error"
  });
});

const server = app.listen(PORT, () => {
  console.log(`InkSpace API listening on http://localhost:${PORT}`);
  console.log(`Frontend served from http://localhost:${PORT}`);
});

server.on("error", error => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. InkSpace may already be running at ` +
      `http://localhost:${PORT}.`
    );
    process.exit(0);
  }

  console.error("Could not start InkSpace:", error);
  process.exit(1);
});
