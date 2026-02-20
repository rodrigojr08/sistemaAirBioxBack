const pool = require("../config/database");
const TABLE = "registro_pontos";

const PontoRegistroModel = {
  buscarPontosDoDia: async (client, idfunc, data) => {
    const sql = `
      SELECT id, tipo_ponto, (data::timestamp + hora) AS ts_ponto
      FROM ${TABLE}
      WHERE idfunc = $1 AND data = $2::date
      ORDER BY (data::timestamp + hora) ASC
      FOR UPDATE
    `;
    const r = await client.query(sql, [idfunc, data]);
    return r.rows;
  },

  buscarPorEventId: async (client, event_id) => {
  const sql = `
    SELECT id, idfunc, nome, data, hora, tipo_ponto, created_at, event_id
    FROM ${TABLE}
    WHERE event_id = $1
    LIMIT 1
  `;
  const r = await client.query(sql, [event_id]);
  return r.rows[0] ?? null;
},

  inserirPonto: async (client, payload) => {
  const {
    idfunc, nome, data, hora, tipo_ponto,
    latitude, longitude, localizacao_nome,
    created_by, device_id, event_id
  } = payload;

  const sql = `
    INSERT INTO ${TABLE}
      (idfunc, nome, data, hora, tipo_ponto,
       latitude, longitude, localizacao_nome,
       created_by, created_at,
       device_id, event_id)
    VALUES
      ($1, $2, $3::date, $4::time, $5,
       $6, $7, $8,
       $9, now(),
       $10, $11)
    RETURNING id, idfunc, nome, data, hora, tipo_ponto, created_at, event_id
  `;

  const r = await client.query(sql, [
    idfunc, nome, data, hora, tipo_ponto,
    latitude ?? null, longitude ?? null, localizacao_nome ?? null,
    String(created_by ?? ""),
    device_id ?? null,
    event_id ?? null
  ]);

  return r.rows[0];
}
};

module.exports = PontoRegistroModel;