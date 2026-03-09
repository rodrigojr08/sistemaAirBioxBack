const crypto = require("crypto");

const token = crypto.randomBytes(32).toString("hex"); // 64 chars
const hash = crypto.createHash("sha256").update(token, "utf8").digest("hex");

console.log("TOKEN (colar no dispositivo):", token);
console.log("TOKEN_HASH (salvar no banco):", hash);