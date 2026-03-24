const pool = require("../config/database");

const RondaModel = {
  buscarPontos: async () => {
    const result = await pool.query(`
      SELECT *
      FROM ronda.rota_ponto
      ORDER BY ordem
    `);
    return result.rows;
  },

  criarJornada: async ({ data_operacao, func_id, id_status }) => {
    const result = await pool.query(
      `
      INSERT INTO ronda.jornada (
        data_operacao,
        func_id,
        id_status,
        sincronizado_at
      )
      VALUES ($1, $2, $3, now())
      RETURNING id, data_operacao, func_id, id_status
      `,
      [data_operacao, func_id, id_status]
    );

    return result.rows[0];
  },

  salvarJornadaSlot: async ({
    jornada_id,
    ronda_numero,
    id_status,
    pontos_json,
    horario_inicio,
    horario_fim,
    observacao,
  }) => {
    const result = await pool.query(
      `
      INSERT INTO ronda.jornada_slot (
        jornada_id,
        ronda_numero,
        id_status,
        pontos_json,
        horario_inicio,
        horario_fim,
        observacao,
        sincronizado_at
      )
      VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, now())
      ON CONFLICT (jornada_id, ronda_numero)
      DO UPDATE SET
        id_status = EXCLUDED.id_status,
        pontos_json = EXCLUDED.pontos_json,
        horario_inicio = EXCLUDED.horario_inicio,
        horario_fim = EXCLUDED.horario_fim,
        observacao = EXCLUDED.observacao,
        sincronizado_at = now()
      RETURNING id, jornada_id, ronda_numero, id_status
      `,
      [
        jornada_id,
        ronda_numero,
        id_status,
        JSON.stringify(pontos_json ?? []),
        horario_inicio,
        horario_fim,
        observacao ?? null,
      ]
    );

    return result.rows[0];
  },

  atualizarStatusJornada: async ({ id, id_status }) => {
    const result = await pool.query(
      `
      UPDATE ronda.jornada
      SET
        id_status = $2,
        sincronizado_at = now()
      WHERE id = $1
      RETURNING id, data_operacao, func_id, id_status
      `,
      [id, id_status]
    );

    return result.rows[0];
  },
};

module.exports = RondaModel;