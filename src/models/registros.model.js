const pool = require("../config/database");

const Registros = {
  async inserir(registros, userId) {
    let inseridos = 0;

    for (const r of registros) {
      const result = await pool.query(
        `INSERT INTO registro_pontos 
    (idfunc, nome, data, hora, tipo_ponto, latitude, longitude, localizacao_nome, created_by)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
   ON CONFLICT (idfunc, data, hora) DO NOTHING`,
        [
          r.id,
          r.nome,
          r.data,
          r.hora,
          r.tipo_ponto,
          r.latitude || null,
          r.longitude || null,
          r.localizacao_nome || 'Airbiox',
          userId
        ]
      );

      if (result.rowCount > 0) inseridos++;
    }

    return { sucesso: true, inseridos };
  },

  async atualizar(idRegistro, novoTipo, novaHora, userId) {
    const result = await pool.query(
      `UPDATE registro_pontos
       SET tipo_ponto = $1,
           hora = $2,
           modified_by = $3,
           modified_at = now()
       WHERE id = $4`,
      [novoTipo, novaHora, userId, idRegistro]
    );
    return { sucesso: result.rowCount > 0 };
  }
};

module.exports = Registros;