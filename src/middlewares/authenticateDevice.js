const crypto = require("crypto");
const pool = require("../config/database"); // ajuste

function sha256Hex(str) {
  return crypto.createHash("sha256").update(str, "utf8").digest("hex");
}

async function authenticateDevice(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) return res.sendStatus(401);

    const tokenHash = sha256Hex(token);

    const { rows } = await pool.query(
      `
      SELECT id, device_id, is_active
      FROM ponto_dispositivo
      WHERE token_hash = $1
      LIMIT 1
      `,
      [tokenHash]
    );

    if (!rows.length) return res.sendStatus(403);
    if (!rows[0].is_active) return res.sendStatus(403);

    // Identidade do "cliente"
    req.deviceId = rows[0].device_id;

    // atualiza last_seen (opcional)
    pool.query(
      `UPDATE ponto_dispositivo SET last_seen_at = NOW() WHERE id = $1`,
      [rows[0].id]
    ).catch(() => {});

    next();
  } catch (e) {
    console.error("authenticateDevice:", e);
    return res.sendStatus(500);
  }
}

module.exports = authenticateDevice;