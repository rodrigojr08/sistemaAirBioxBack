const pool = require("../config/database");

const MIN_ALMOCO_MINUTES = 72;

const PontoModel = {
  stateToday: async (idfunc) => {
    // data "hoje" do servidor
    const sqlLast = `
      SELECT
        tipo_ponto,
        (data::timestamp + hora) AS ts
      FROM registro_pontos
      WHERE idfunc = $1 AND data = CURRENT_DATE
      ORDER BY hora DESC, id DESC
      LIMIT 1;
    `;
    const r = await pool.query(sqlLast, [idfunc]);
    const last = r.rows[0] || null;

    let next_expected = null;
    let min_next_timestamp = null;

    if (!last) {
      next_expected = null;
      min_next_timestamp = null;
    } else if (last.tipo_ponto === "ENTRADA") {
      next_expected = "SAIDA_ALMOCO";
    } else if (last.tipo_ponto === "SAIDA_ALMOCO") {
      next_expected = "VOLTA_ALMOCO";
      const min = new Date(new Date(last.ts).getTime() + MIN_ALMOCO_MINUTES * 60 * 1000);
      min_next_timestamp = min.toISOString();
    } else if (last.tipo_ponto === "VOLTA_ALMOCO") {
      next_expected = "SAIDA_FINAL";
    } else if (last.tipo_ponto === "SAIDA_FINAL") {
      next_expected = null;
    }

    return {
      date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      last_tipo: last?.tipo_ponto ?? null,
      last_timestamp: last?.ts ? new Date(last.ts).toISOString() : null,
      next_expected,
      min_next_timestamp,
      updated_at_server: new Date().toISOString(),
    };
  },
};

module.exports = PontoModel;