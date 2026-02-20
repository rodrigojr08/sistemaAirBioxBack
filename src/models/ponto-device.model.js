const pool = require("../config/database"); // use o pool que você usa pro schema principal

const PontoDeviceModel = {
  upsertDeviceToken: async (device_id, descricao, token_hash) => {
    const sql = `
      INSERT INTO ponto_dispositivo (device_id, descricao, token_hash, is_active)
      VALUES ($1, $2, $3, true)
      ON CONFLICT (device_id)
      DO UPDATE SET
        descricao = EXCLUDED.descricao,
        token_hash = EXCLUDED.token_hash,
        is_active = true
      RETURNING id, device_id, descricao, is_active, created_at, last_seen_at
    `;
    const result = await pool.query(sql, [device_id, descricao ?? null, token_hash]);
    return result.rows[0];
  },

  findByTokenHash: async (token_hash) => {
    const sql = `
      SELECT id, device_id, is_active
      FROM ponto_dispositivo
      WHERE token_hash = $1
      LIMIT 1
    `;
    const result = await pool.query(sql, [token_hash]);
    return result.rows[0] ?? null;
  },

  touchLastSeen: async (id) => {
    await pool.query(`UPDATE ponto_dispositivo SET last_seen_at = now() WHERE id = $1`, [id]);
  },
};

module.exports = PontoDeviceModel;