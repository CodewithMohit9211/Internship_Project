
const jwt = require("jsonwebtoken");
const { readUsers } = require("../dataStore");

module.exports = function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Please log in first."
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = readUsers().find(item => item.id === payload.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists."
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    next();
  } catch (error) {
    if (error.message === "JWT_SECRET is not configured") {
      return next(error);
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};