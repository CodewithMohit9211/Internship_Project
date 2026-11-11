
require("dotenv").config();

const jwt = require("jsonwebtoken");
const { findUserById } = require("../dataStore");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    `JWT_SECRET is not configured in .env. Add a long random secret; do not reuse SUPABASE_SECRET_KEY.`
  );
}

module.exports = async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Please log in first."
      });
    }

    const payload = jwt.verify(token, JWT_SECRET);

    const user = await findUserById(payload.userId);

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
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};
