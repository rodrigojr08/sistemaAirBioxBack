require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "fallback-secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret"
};