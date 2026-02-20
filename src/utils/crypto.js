const crypto = require("crypto");

function sha256(x) {
  return crypto.createHash("sha256").update(String(x)).digest("hex");
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

module.exports = { sha256, randomToken };